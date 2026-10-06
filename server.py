#!/usr/bin/env python3
"""server_min.py v6.0 — Whisper SMALL + Pinyin + Translate + TTS"""
import json, re, time, os, tempfile, urllib.request, urllib.parse
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import jieba
jieba.setLogLevel(20)

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

print("⏳ Loading Whisper Small...")
t0 = time.time()
try:
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    WHISPER_OK = True
    print(f"✅ Whisper Small loaded ({time.time()-t0:.1f}s)")
except Exception as e:
    print(f"❌ Whisper: {e}")
    WHISPER_OK = False

try:
    from pypinyin import pinyin, lazy_pinyin, Style
    PY_OK = True
    print("✅ Pinyin OK")
except:
    PY_OK = False
    print("⚠️ pypinyin missing")

try:
    from server_tts import generate_mp3, list_voices, DEFAULT_VOICE
    TTS_OK = True
    print("✅ TTS OK")
except:
    TTS_OK = False
    print("⚠️ TTS OFF")

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# OpenCC Phồn thể (Taiwan)
try:
    from opencc import OpenCC
    cc_t = OpenCC('s2twp')
    print("✅ OpenCC loaded (s2twp)", flush=True)
except Exception as e:
    cc_t = None
    print(f"⚠️ OpenCC: {e}", flush=True)

def to_trad(text):
    if cc_t and text:
        try: return cc_t.convert(text)
        except: return text
    return text

def segment_text(text):
    if not text: return []
    result = []
    try:
        for w in jieba.cut(text):
            if re.search(r'[\u4e00-\u9fa5]', w):
                py_tone = lazy_pinyin(w, style=Style.TONE)
                py_num = lazy_pinyin(w, style=Style.TONE3)
                tones = []
                for pp in py_num:
                    m = re.search(r'[1-5]$', pp)
                    tones.append(int(m.group(0)) if m else 5)
                result.append({'w': w, 'p': ' '.join(py_tone), 't': tones, 'han': True})
            else:
                result.append({'w': w, 'p': '', 't': [], 'han': False})
    except Exception as e:
        print('segment ERR:', e, flush=True)
    return result

def to_pinyin(text):
    if not PY_OK or not text: return ""
    try:
        r = pinyin(text, style=Style.TONE, heteronym=False)
        return " ".join([x[0] for x in r])
    except: return ""

# Argos offline
try:
    import argostranslate.translate as _argos_tr
    ARGOS_OK = True
    print("✅ Argos offline ready")
except Exception as e:
    ARGOS_OK = False
    print(f"⚠️ Argos: {e}")

def translate_argos(text):
    if not ARGOS_OK or not text: return ""
    try:
        en = _argos_tr.translate(text, "zh", "en")
        vi = _argos_tr.translate(en, "en", "vi")
        return vi.strip()
    except Exception as e:
        print(f"[argos] FAIL: {e}", flush=True)
        return ""

def translate_gtx(text, timeout=12):
    if not text: return ""
    try:
        url = ("https://translate.googleapis.com/translate_a/single"
               "?client=gtx&sl=zh-TW&tl=vi&dt=t&q=" + urllib.parse.quote(text))
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = json.loads(r.read().decode("utf-8"))
            out = "".join([p[0] for p in data[0] if p and p[0]]).strip()
            print(f"[gtx] '{text[:20]}' -> '{out[:40]}'", flush=True)
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
                    print(f"[my] '{text[:20]}' -> '{t[:40]}'", flush=True)
                    return t.strip()
    except: pass
    return ""

def split_sentences(text):
    if not text: return []
    parts = re.split(r'(?<=[。！？!?])', text.strip())
    return [p.strip() for p in parts if p.strip()]

@app.route("/")
def home(): return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def serve_static(path): return send_from_directory(".", path)

@app.route("/api/health")
def health():
    return jsonify({"status":"ok","whisper":WHISPER_OK,"pinyin":PY_OK,"tts":TTS_OK})

@app.route("/api/pinyin")
def api_pinyin():
    q = request.args.get("q", "").strip()
    return jsonify({"pinyin": to_pinyin(q) if q else ""})

@app.route("/api/segment")
def api_segment():
    q = request.args.get("q", "").strip()
    if not q: return jsonify({"segments": [], "ok": False})
    segs = segment_text(q)
    return jsonify({"segments": segs, "ok": True})

@app.route("/api/translate")
def api_tr():
    q = request.args.get("q", "").strip()
    if not q: return jsonify({"text":"","ok":False})
    t0 = time.time()
    r = translate_argos(q)
    src = "argos"
    if not r:
        r = translate_gtx(q)
        src = "gtx"
    if not r:
        r = translate_my(q)
        src = "my"
    dt = time.time() - t0
    print(f"[api_tr/{src}] {dt:.2f}s -> '{r[:50] if r else 'EMPTY'}'", flush=True)
    return jsonify({"text": r, "ok": bool(r), "src": src, "elapsed": round(dt, 2)})

@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    if not WHISPER_OK:
        return jsonify({"error": "Whisper off"}), 503
    if "audio" not in request.files:
        return jsonify({"error": "No audio"}), 400
    f = request.files["audio"]
    ext = os.path.splitext(f.filename)[1] or ".wav"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    f.save(tmp.name)
    tmp.close()
    t0 = time.time()
    try:
        segments, info = model.transcribe(
            tmp.name,
            language="zh",
            task="transcribe",
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
            condition_on_previous_text=False,
        )
        HALLU = ['當代中文課程', '臺灣當代中文', '以下是臺灣', '課程對話', '中文課程']
        results = []
        for s in segments:
            txt = s.text.strip()
            if not txt: continue
            if any(kw in txt for kw in HALLU) and len(txt) < 30:
                print(f"[filter] skip: {txt}", flush=True)
                continue
            for sent in split_sentences(txt):
                if len(re.findall(r'[\u4e00-\u9fa5]', sent)) >= 2:
                    results.append({"text": to_trad(sent), "start": round(s.start,2), "end": round(s.end,2)})
        elapsed = time.time() - t0
        print(f"[Whisper] {len(results)} câu | {elapsed:.2f}s", flush=True)
        for r in results:
            print(f"[Whisper]   -> {r['text']}", flush=True)
        return jsonify({"segments": results, "elapsed": elapsed, "ok": True})
    except Exception as e:
        print(f"[Whisper] ERR: {e}", flush=True)
        return jsonify({"error": str(e)}), 500
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
    return send_file(path, mimetype="audio/mpeg")

@app.route("/api/tts/voices")
def api_voices():
    if not TTS_OK: return jsonify({"voices": [], "default": None})
    return jsonify({"voices": list_voices(), "default": DEFAULT_VOICE})

@app.route("/api/transcribe-video", methods=["POST"])
def transcribe_video():
    if not WHISPER_OK:
        return jsonify({"error": "Whisper off"}), 503
    if "video" not in request.files:
        return jsonify({"error": "No video"}), 400
    f = request.files["video"]
    ext = os.path.splitext(f.filename)[1] or ".mp4"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    f.save(tmp.name)
    tmp.close()
    t0 = time.time()
    print(f"[Video] Đang xử lý {f.filename}...", flush=True)
    try:
        segments, info = model.transcribe(
            tmp.name,
            language="zh",
            task="transcribe",
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
            condition_on_previous_text=False,
        )
        HALLU = ['當代中文課程', '臺灣當代中文', '以下是臺灣', '課程對話', '中文課程']
        results = []
        for s in segments:
            txt = s.text.strip()
            if not txt: continue
            if any(kw in txt for kw in HALLU) and len(txt) < 30: continue
            for sent in split_sentences(txt):
                if len(re.findall(r'[\u4e00-\u9fa5]', sent)) >= 2:
                    results.append({"text": to_trad(sent), "start": round(s.start, 2), "end": round(s.end, 2)})
        elapsed = time.time() - t0
        print(f"[Video] {len(results)} câu | {elapsed:.2f}s", flush=True)
        return jsonify({"segments": results, "elapsed": elapsed, "duration": round(info.duration, 2), "ok": True})
    except Exception as e:
        print(f"[Video] ERR: {e}", flush=True)
        return jsonify({"error": str(e)}), 500
    finally:
        try: os.unlink(tmp.name)
        except: pass


if __name__ == "__main__":
    print("=" * 60)
    print(f"Server v6.0 | Whisper: {'OK' if WHISPER_OK else 'OFF'} | Pinyin: {'OK' if PY_OK else 'OFF'} | TTS: {'OK' if TTS_OK else 'OFF'}")
    print("🚀 http://localhost:8000")
    print("=" * 60)
    app.run(host="127.0.0.1", port=8000, debug=False, threaded=True)
