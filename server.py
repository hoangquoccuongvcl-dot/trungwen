#!/usr/bin/env python3
"""server.py — Render deploy: Groq Whisper + Google Translate + Edge TTS"""
import os, json, re, time, tempfile, urllib.request, urllib.parse
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

# ============ ENV ============
GROQ_KEY = os.environ.get("GROQ_API_KEY", "").strip()
if not GROQ_KEY:
    print("⚠️ GROQ_API_KEY chưa set!")
else:
    print(f"✅ Groq key: {GROQ_KEY[:10]}...", flush=True)

try:
    from groq import Groq
    groq_client = Groq(api_key=GROQ_KEY) if GROQ_KEY else None
    GROQ_OK = bool(groq_client)
    print("✅ Groq client ready" if GROQ_OK else "⚠️ Groq no key")
except Exception as e:
    groq_client = None
    GROQ_OK = False
    print(f"⚠️ Groq: {e}")

try:
    from pypinyin import pinyin, Style
    PY_OK = True
    print("✅ Pinyin OK")
except Exception as e:
    PY_OK = False
    print(f"⚠️ Pinyin: {e}")

try:
    import opencc
    try: cc = opencc.OpenCC('s2twp')
    except: cc = opencc.OpenCC('s2twp.json')
    print("✅ OpenCC OK")
except Exception as e:
    cc = None
    print(f"⚠️ OpenCC: {e}")

try:
    from server_tts import generate_mp3, list_voices, DEFAULT_VOICE
    TTS_OK = True
    print("✅ Edge TTS OK")
except Exception as e:
    TTS_OK = False
    print(f"⚠️ TTS: {e}")

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

def to_trad(text):
    if cc and text:
        try: return cc.convert(text)
        except: return text
    return text

def to_pinyin(text):
    if not PY_OK or not text: return ""
    try:
        r = pinyin(text, style=Style.TONE, heteronym=False)
        return " ".join([x[0] for x in r])
    except: return ""

def translate_gtx(text, timeout=12):
    if not text: return ""
    try:
        url = ("https://translate.googleapis.com/translate_a/single"
               "?client=gtx&sl=zh-TW&tl=vi&dt=t&q=" + urllib.parse.quote(text))
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = json.loads(r.read().decode("utf-8"))
            out = "".join([p[0] for p in data[0] if p and p[0]]).strip()
            return out
    except Exception as e:
        print(f"[gtx] FAIL: {e}", flush=True)
        return ""

def translate_my(text, timeout=10):
    if not text: return ""
    try:
        url = ("https://api.mymemory.translated.net/get?q="
               + urllib.parse.quote(text[:400]) + "&langpair=zh-TW|vi")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            d = json.loads(r.read().decode("utf-8"))
            if d.get("responseStatus") == 200:
                t = d.get("responseData", {}).get("translatedText", "")
                if t and "MYMEMORY" not in t.upper():
                    return t.strip()
    except: pass
    return ""

def translate_full(text):
    if not text: return ""
    r = translate_gtx(text)
    if r: return r
    return translate_my(text)

def split_sentences(text):
    if not text: return []
    parts = re.split(r'(?<=[。！？!?])', text.strip())
    return [p.strip() for p in parts if p.strip()]

# ============ ROUTES ============
@app.route("/")
def home(): return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_file(path): return send_from_directory(".", path)

@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "whisper": GROQ_OK,
        "pinyin": PY_OK,
        "tts": TTS_OK,
        "translate": True,
        "opencc": bool(cc)
    })

@app.route("/api/pinyin")
def api_pinyin():
    q = request.args.get("q", "").strip()
    return jsonify({"pinyin": to_pinyin(q) if q else "", "ok": PY_OK})

@app.route("/api/translate")
def api_tr():
    q = request.args.get("q", "").strip()
    if not q: return jsonify({"text":"","ok":False})
    t0 = time.time()
    r = translate_full(q)
    return jsonify({"text": r, "ok": bool(r), "src": "gtx", "elapsed": round(time.time()-t0, 2)})

def _transcribe_groq(file_path, filename):
    """Gửi file lên Groq Whisper"""
    if not GROQ_OK:
        return None
    try:
        with open(file_path, "rb") as f:
            transcription = groq_client.audio.transcriptions.create(
                file=(filename, f.read()),
                model="whisper-large-v3",
                language="zh",
                response_format="verbose_json",
                timestamp_granularities=["segment"]
            )
        segments = []
        HALLU = ['當代中文課程', '臺灣當代中文', '以下是臺灣', '課程對話', '中文課程']
        raw_segments = getattr(transcription, "segments", []) or []
        for seg in raw_segments:
            txt = seg.text.strip() if hasattr(seg, "text") else str(seg.get("text","")).strip()
            if not txt: continue
            if any(kw in txt for kw in HALLU) and len(txt) < 30: continue
            for sent in split_sentences(txt):
                if len(re.findall(r'[\u4e00-\u9fa5]', sent)) >= 2:
                    segments.append({
                        "text": to_trad(sent),
                        "start": round(float(seg.start), 2),
                        "end": round(float(seg.end), 2)
                    })
        return segments
    except Exception as e:
        print(f"[groq] ERR: {e}", flush=True)
        return None

@app.route("/api/transcribe", methods=["POST"])
@app.route("/api/transcribe-video", methods=["POST"])
def transcribe():
    if not GROQ_OK:
        return jsonify({"error": "Groq chưa cấu hình"}), 503
    file_key = None
    if "audio" in request.files: file_key = "audio"
    elif "video" in request.files: file_key = "video"
    if not file_key:
        return jsonify({"error": "No file"}), 400
    f = request.files[file_key]
    ext = os.path.splitext(f.filename)[1] or ".mp3"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    f.save(tmp.name)
    tmp.close()
    t0 = time.time()
    try:
        segs = _transcribe_groq(tmp.name, f.filename)
        if segs is None:
            return jsonify({"error": "Groq transcription failed"}), 500
        elapsed = time.time() - t0
        print(f"[Groq] {len(segs)} câu | {elapsed:.2f}s", flush=True)
        return jsonify({"segments": segs, "elapsed": elapsed, "ok": True})
    finally:
        try: os.unlink(tmp.name)
        except: pass

@app.route("/api/tts")
def api_tts():
    if not TTS_OK: return jsonify({"error": "TTS off"}), 503
    text = request.args.get("text", "").strip()
    if not text: return jsonify({"error": "Empty"}), 400
    voice = request.args.get("voice", DEFAULT_VOICE)
    try: rate = float(request.args.get("rate", "1.0"))
    except: rate = 1.0
    try: pitch = float(request.args.get("pitch", "0.0"))
    except: pitch = 0.0
    path, cached = generate_mp3(text, voice, rate, pitch)
    if not path: return jsonify({"error": "TTS fail"}), 500
    resp = send_file(path, mimetype="audio/mpeg")
    resp.headers["Cache-Control"] = "public, max-age=2592000"
    return resp

@app.route("/api/tts/voices")
def api_voices():
    if not TTS_OK: return jsonify({"voices": [], "default": None})
    return jsonify({"voices": list_voices(), "default": DEFAULT_VOICE})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    print("=" * 60)
    print(f"Server Render | Groq: {'OK' if GROQ_OK else 'OFF'} | Pinyin: {'OK' if PY_OK else 'OFF'} | TTS: {'OK' if TTS_OK else 'OFF'}")
    print(f"🚀 http://0.0.0.0:{port}")
    print("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
