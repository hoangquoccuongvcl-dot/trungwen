#!/usr/bin/env python3
"""
server_tts.py v3.0 — Edge TTS cho 當代中文 PRO
Pitch control + auto punctuation + natural chunking
"""
import os
import re
import hashlib
import asyncio
import time
import threading

try:
    import edge_tts
    EDGE_TTS_AVAILABLE = True
except ImportError:
    EDGE_TTS_AVAILABLE = False
    print("⚠️ Chưa cài edge-tts. Chạy: pip3 install edge-tts")

# ============ CACHE ============
CACHE_DIR = os.path.expanduser('~/.cache/dd_tts')
os.makedirs(CACHE_DIR, exist_ok=True)

# ============ VOICES ============
VOICES = {
    'zh-TW-HsiaoChenNeural': {
        'name': '曉臻 — Nữ trẻ, tự nhiên (Đài Loan)',
        'gender': 'Nữ', 'style': 'Trẻ trung, biểu cảm', 'quality': 'best',
    },
    'zh-TW-HsiaoYuNeural': {
        'name': '曉雨 — Nữ dịu dàng (Đài Loan)',
        'gender': 'Nữ', 'style': 'Dịu dàng, ấm áp', 'quality': 'best',
    },
    'zh-TW-YunJheNeural': {
        'name': '雲哲 — Nam trầm ấm (Đài Loan)',
        'gender': 'Nam', 'style': 'Trầm ấm, tự nhiên', 'quality': 'best',
    },
    'zh-CN-XiaoxiaoNeural': {
        'name': '曉曉 — Nữ Bắc Kinh',
        'gender': 'Nữ', 'style': 'Chuẩn Bắc Kinh', 'quality': 'good',
    },
    'zh-CN-YunxiNeural': {
        'name': '雲希 — Nam Bắc Kinh',
        'gender': 'Nam', 'style': 'Chuẩn Bắc Kinh', 'quality': 'good',
    },
    'zh-CN-YunyangNeural': {
        'name': '雲揚 — Nam tin tức',
        'gender': 'Nam', 'style': 'Trang trọng', 'quality': 'good',
    },
    'zh-HK-HiuMaanNeural': {
        'name': '曉曼 — Nữ Hồng Kông',
        'gender': 'Nữ', 'style': 'Quảng Đông', 'quality': 'ok',
    },
    'zh-HK-WanLungNeural': {
        'name': '雲龍 — Nam Hồng Kông',
        'gender': 'Nam', 'style': 'Quảng Đông', 'quality': 'ok',
    }
}

DEFAULT_VOICE = 'zh-TW-HsiaoChenNeural'


# ============ TIỀN XỬ LÝ ============
def normalize_text(text):
    if not text:
        return ''
    s = re.sub(r'\s+', ' ', text.strip())
    han = len(re.findall(r'[\u4e00-\u9fa5]', s))
    if han <= 2:
        return s
    if han >= 25 and not re.search(r'[，。！？；：、,.!?;:]', s):
        result, cnt = '', 0
        for ch in s:
            result += ch
            if re.match(r'[\u4e00-\u9fa5]', ch):
                cnt += 1
                if cnt >= 12:
                    result += '，'
                    cnt = 0
        s = result
    if not re.search(r'[。！？.!?]$', s):
        if re.search(r'[，,]$', s):
            s = s[:-1] + '。'
        else:
            s += '。'
    return s


# ============ HELPERS ============
def cache_key(text, voice, rate, pitch):
    raw = f"{voice}__{rate}__{pitch}__{text}".encode('utf-8')
    return hashlib.md5(raw).hexdigest()


def get_cached_path(text, voice, rate, pitch):
    return os.path.join(CACHE_DIR, cache_key(text, voice, rate, pitch) + '.mp3')


def _fmt_rate(rate):
    if abs(rate - 1.0) < 0.001:
        return '+0%'
    return f"{int(round((rate - 1.0) * 100)):+d}%"


def _fmt_pitch(hz):
    if abs(hz) < 0.5:
        return '+0Hz'
    return f"{int(round(hz)):+d}Hz"


# ============ ASYNC GEN ============
async def _generate_async(text, voice, rate, pitch, output_path):
    rate_str = _fmt_rate(rate)
    pitch_str = _fmt_pitch(pitch)
    kwargs = {'text': text, 'voice': voice, 'rate': rate_str}
    try:
        communicate = edge_tts.Communicate(pitch=pitch_str, **kwargs)
    except TypeError:
        communicate = edge_tts.Communicate(**kwargs)
    with open(output_path, 'wb') as f:
        async for chunk in communicate.stream():
            if chunk.get('type') == 'audio':
                f.write(chunk['data'])


# ============ MAIN ============
def generate_mp3(text, voice=DEFAULT_VOICE, rate=1.0, pitch=0.0):
    if not EDGE_TTS_AVAILABLE:
        print("[TTS] ❌ edge-tts chưa cài")
        return None, False
    if not text or not text.strip():
        return None, False
    if voice not in VOICES:
        voice = DEFAULT_VOICE
    clean_text = normalize_text(text)
    if not clean_text:
        return None, False

    cached_path = get_cached_path(clean_text, voice, rate, pitch)

    if os.path.exists(cached_path) and os.path.getsize(cached_path) > 100:
        age = time.time() - os.path.getmtime(cached_path)
        if age < 30 * 86400:
            print(f"[TTS] ✅ Cache: '{clean_text[:30]}...'")
            return cached_path, True

    result = {'ok': False, 'error': None, 'elapsed': 0}

    def worker():
        start = time.time()
        try:
            asyncio.run(_generate_async(clean_text, voice, rate, pitch, cached_path))
            result['ok'] = True
        except Exception as e:
            result['error'] = f"{type(e).__name__}: {e}"
            import traceback
            print(f"[TTS] ❌ {result['error']}")
            traceback.print_exc()
        finally:
            result['elapsed'] = time.time() - start

    t = threading.Thread(target=worker, daemon=True)
    t.start()
    t.join(timeout=30)

    if t.is_alive():
        print(f"[TTS] ❌ Timeout")
        return None, False
    if result['error']:
        try:
            if os.path.exists(cached_path):
                os.unlink(cached_path)
        except:
            pass
        return None, False
    if not os.path.exists(cached_path):
        return None, False
    size = os.path.getsize(cached_path)
    if size < 100:
        try:
            os.unlink(cached_path)
        except:
            pass
        return None, False

    print(f"[TTS] ✅ '{clean_text[:30]}...' ({size}B, {result['elapsed']:.2f}s, r={rate}, p={pitch})")
    return cached_path, False


# ============ UTILITIES ============
def list_voices():
    return [
        {'id': vid, 'name': info['name'], 'gender': info['gender'],
         'style': info['style'], 'quality': info['quality']}
        for vid, info in VOICES.items()
    ]


def clear_cache():
    import shutil
    try:
        if os.path.exists(CACHE_DIR):
            shutil.rmtree(CACHE_DIR)
            os.makedirs(CACHE_DIR, exist_ok=True)
        return True
    except Exception as e:
        print(f"[TTS] Clear error: {e}")
        return False


def cache_size():
    total = 0
    if os.path.exists(CACHE_DIR):
        for f in os.listdir(CACHE_DIR):
            try:
                total += os.path.getsize(os.path.join(CACHE_DIR, f))
            except:
                pass
    return round(total / 1024 / 1024, 2)


if __name__ == '__main__':
    print("=" * 60)
    print("Test Edge TTS v3.0")
    print("=" * 60)
    p1, _ = generate_mp3("你好，歡迎使用當代中文課程。", DEFAULT_VOICE, 1.0, 0.0)
    print(f"✅ Test 1: {p1}")
    p2, _ = generate_mp3("我叫白如玉你呢", DEFAULT_VOICE, 1.0, 0.0)
    print(f"✅ Test 2: {p2}")
    print(f"Cache: {cache_size()} MB")