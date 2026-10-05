'use strict';
/* app9.js v2.0 — Edge TTS với pitch control */

(function(){

if (!window.DD) window.DD = {};

/* ========== CSS ========== */
const style = document.createElement('style');
style.textContent = [
'.tts-speaking{color:var(--accent)!important;animation:ttsPulse 1.2s ease-in-out infinite}',
'@keyframes ttsPulse{0%,100%{opacity:1}50%{opacity:.5}}',
'.tts-settings-box{grid-column:1/-1;padding:12px;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.22);border-radius:12px;margin-bottom:12px}',
'.tts-settings-box > label{display:block;font-size:11.5px;color:var(--text2);margin-bottom:6px;font-weight:600}',
'.tts-status{font-size:10.5px;color:var(--text3);margin-top:8px;line-height:1.6;padding:8px;background:var(--bg);border-radius:6px}',
'.tts-status .ok{color:var(--green);font-weight:600}',
'.tts-status .err{color:var(--rose);font-weight:600}',
'.tts-2col{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
'@media(max-width:600px){.tts-2col{grid-template-columns:1fr}}'
].join('\n');
document.head.appendChild(style);

let currentAudio = null;
let currentBtn = null;
let ttsVoices = [];
let currentVoice = localStorage.getItem('dd_tts_voice') || 'zh-TW-HsiaoChenNeural';
let currentRate = parseFloat(localStorage.getItem('dd_tts_rate') || '1.0');
let currentPitch = parseFloat(localStorage.getItem('dd_tts_pitch') || '0');
let ttsAvailable = false;
let audioCache = new Map();
let lastErrorToast = 0;

function safeToast(msg, type) {
  if (typeof window.toast === 'function') window.toast(msg, type);
}

async function checkTTS() {
  try {
    const r = await fetch('/api/health', { cache: 'no-store' });
    if (!r.ok) return false;
    const d = await r.json();
    return d.tts === true;
  } catch(e) { return false; }
}

async function loadVoices() {
  try {
    const r = await fetch('/api/tts/voices', { cache: 'no-store' });
    if (!r.ok) return [];
    const d = await r.json();
    ttsVoices = d.voices || [];
    const order = { best: 0, good: 1, ok: 2 };
    ttsVoices.sort((a, b) => (order[a.quality] || 3) - (order[b.quality] || 3));
    return ttsVoices;
  } catch(e) { return []; }
}

function stopAudio() {
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch(e) {}
    currentAudio = null;
  }
  if (currentBtn) {
    try { currentBtn.classList.remove('tts-speaking'); } catch(e) {}
    currentBtn = null;
  }
}

async function speakEdge(text, opts) {
  if (!ttsAvailable) {
    ttsAvailable = await checkTTS();
    if (!ttsAvailable) {
      const now = Date.now();
      if (now - lastErrorToast > 5000) {
        lastErrorToast = now;
        safeToast('❌ Server TTS chưa chạy. Chạy: python3 server.py', 'err');
      }
      return false;
    }
  }

  const clean = String(text || '').trim();
  if (!clean) return false;

  stopAudio();

  const btn = (opts && opts.btn) || null;
  if (btn) {
    btn.classList.add('tts-speaking');
    currentBtn = btn;
  }

  try {
    const cacheKey = currentVoice + '__' + currentRate + '__' + currentPitch + '__' + clean;

    let url;
    if (audioCache.has(cacheKey)) {
      url = audioCache.get(cacheKey);
    } else {
      const apiUrl = '/api/tts'
        + '?text=' + encodeURIComponent(clean)
        + '&voice=' + encodeURIComponent(currentVoice)
        + '&rate=' + currentRate
        + '&pitch=' + currentPitch;

      const r = await fetch(apiUrl);
      if (!r.ok) {
        if (btn) btn.classList.remove('tts-speaking');
        currentBtn = null;
        const now = Date.now();
        if (now - lastErrorToast > 5000) {
          lastErrorToast = now;
          safeToast('❌ Không tạo được audio. Kiểm tra server.', 'err');
        }
        return false;
      }

      const blob = await r.blob();
      if (blob.size < 100) {
        if (btn) btn.classList.remove('tts-speaking');
        currentBtn = null;
        return false;
      }

      url = URL.createObjectURL(blob);
      audioCache.set(cacheKey, url);

      if (audioCache.size > 100) {
        const iter = audioCache.keys();
        for (const key of iter) {
          const oldUrl = audioCache.get(key);
          if (oldUrl !== url && (!currentAudio || currentAudio.src !== oldUrl)) {
            try { URL.revokeObjectURL(oldUrl); } catch(e) {}
            audioCache.delete(key);
            break;
          }
        }
      }
    }

    const audio = new Audio(url);
    audio.playbackRate = 1.0;
    audio.volume = 1.0;
    currentAudio = audio;

    const cleanup = () => {
      if (btn) try { btn.classList.remove('tts-speaking'); } catch(e) {}
      if (currentBtn === btn) currentBtn = null;
      if (currentAudio === audio) currentAudio = null;
    };

    audio.onended = cleanup;
    audio.onerror = () => cleanup();

    try {
      await audio.play();
      return true;
    } catch(playErr) {
      cleanup();
      if (playErr.name === 'NotAllowedError') {
        const now = Date.now();
        if (now - lastErrorToast > 5000) {
          lastErrorToast = now;
          safeToast('⚠️ Bấm vào trang trước rồi thử lại', 'err');
        }
      }
      return false;
    }
  } catch(e) {
    console.error('[app9] speakEdge:', e);
    if (btn) try { btn.classList.remove('tts-speaking'); } catch(err) {}
    currentBtn = null;
    return false;
  }
}

window.DD.speak = function(zh, opts) { return speakEdge(zh, opts); };

window.speakV = function(i) {
  const S = window.S;
  if (!S || !S.vocab || !S.vocab[i]) return;
  const btn = (this && this.tagName === 'BUTTON') ? this : null;
  speakEdge(S.vocab[i].zh, { btn });
};

window.speakQ = function() {
  if (!window.qzCur || !window.qzCur.zh) return;
  const btn = (this && this.tagName === 'BUTTON') ? this : null;
  speakEdge(window.qzCur.zh, { btn });
};

window.speak = function(zh) { return speakEdge(zh); };

window.speakQSRS = function() {
  if (!window.srsCur || !window.srsCur.zh) return;
  const btn = (this && this.tagName === 'BUTTON') ? this : null;
  speakEdge(window.srsCur.zh, { btn });
};

window.speakSRS = function() {
  if (!window.srsCur || !window.srsCur.zh) return;
  const btn = (this && this.tagName === 'BUTTON') ? this : null;
  speakEdge(window.srsCur.zh, { btn });
};

document.addEventListener('click', (e) => {
  if (!currentBtn) return;
  if (currentBtn.contains(e.target)) return;
  const isAudioBtn = e.target.closest(
    'button[onclick*="speak"], .sact button, .via button, ' +
    '.sv-actions button[data-act="tts"], .wpbtns button, ' +
    '.cb[onclick*="speak"], .cb[onclick*="speakQ"], ' +
    '.cb[onclick*="speakSRS"], .cb[onclick*="speakQSRS"], ' +
    '.btn[onclick*="speak"]'
  );
  if (!isAudioBtn) stopAudio();
}, true);

function hookTrackChange() {
  const orig = window.selectTrack;
  if (typeof orig !== 'function') {
    setTimeout(hookTrackChange, 500);
    return;
  }
  window.selectTrack = async function(idx) {
    stopAudio();
    return orig.apply(this, arguments);
  };
}

function addTTSSettings() {
  const grid = document.querySelector('#settingsModal .mcb .grid');
  if (!grid || document.getElementById('ttsSettingsBox')) return;

  const box = document.createElement('div');
  box.id = 'ttsSettingsBox';
  box.className = 'tts-settings-box';
  box.innerHTML = [
    '<label style="font-size:13px;color:var(--text);font-weight:800;margin-bottom:10px;display:flex;align-items:center;gap:6px">',
    '  🎙️ Giọng đọc (Edge TTS)',
    '</label>',

    '<label>Chọn giọng</label>',
    '<select class="sel full" id="ttsVoiceSelect"><option value="">Đang tải...</option></select>',

    '<div class="tts-2col" style="margin-top:12px">',
    '  <div>',
    '    <label>Tốc độ đọc</label>',
    '    <select class="sel full" id="ttsRateSelect">',
    '      <option value="0.85">0.85× — Chậm</option>',
    '      <option value="0.9">0.9× — Chậm vừa</option>',
    '      <option value="0.95">0.95× — Hơi chậm</option>',
    '      <option value="1.0" selected>1.0× — Tự nhiên ⭐</option>',
    '      <option value="1.1">1.1× — Hơi nhanh</option>',
    '      <option value="1.25">1.25× — Nhanh</option>',
    '    </select>',
    '  </div>',
    '  <div>',
    '    <label>Cao độ giọng</label>',
    '    <select class="sel full" id="ttsPitchSelect">',
    '      <option value="-4">-4Hz — Trầm</option>',
    '      <option value="-2">-2Hz — Hơi trầm</option>',
    '      <option value="0" selected>0Hz — Bình thường ⭐</option>',
    '      <option value="2">+2Hz — Hơi cao</option>',
    '      <option value="4">+4Hz — Cao</option>',
    '    </select>',
    '  </div>',
    '</div>',

    '<div class="tts-status" id="ttsStatus">Đang kiểm tra server...</div>',

    '<button class="btn pri" id="ttsTestBtn" style="margin-top:10px;width:100%;justify-content:center">',
    '  🔊 Test giọng đọc',
    '</button>'
  ].join('');
  grid.appendChild(box);

  setTimeout(refreshTTSUI, 300);
}

async function refreshTTSUI() {
  const sel = document.getElementById('ttsVoiceSelect');
  const status = document.getElementById('ttsStatus');
  const testBtn = document.getElementById('ttsTestBtn');
  const rateSel = document.getElementById('ttsRateSelect');
  const pitchSel = document.getElementById('ttsPitchSelect');
  if (!sel || !status) return;

  ttsAvailable = await checkTTS();

  if (!ttsAvailable) {
    sel.innerHTML = '<option value="">❌ Server TTS chưa chạy</option>';
    sel.disabled = true;
    if (rateSel) rateSel.disabled = true;
    if (pitchSel) pitchSel.disabled = true;
    status.innerHTML = '<span class="err">❌ Server chưa có Edge TTS</span><br>Mở Terminal chạy: <b>python3 server.py</b>';
    if (testBtn) testBtn.disabled = true;
    return;
  }

  await loadVoices();

  if (!ttsVoices.length) {
    sel.innerHTML = '<option value="">Không có giọng</option>';
    sel.disabled = true;
    if (rateSel) rateSel.disabled = true;
    if (pitchSel) pitchSel.disabled = true;
    status.innerHTML = '<span class="err">❌ Không tải được danh sách giọng</span>';
    if (testBtn) testBtn.disabled = true;
    return;
  }

  sel.disabled = false;
  if (rateSel) rateSel.disabled = false;
  if (pitchSel) pitchSel.disabled = false;
  if (testBtn) testBtn.disabled = false;

  sel.innerHTML = ttsVoices.map(v => {
    const p = v.quality === 'best' ? '⭐ ' : v.quality === 'good' ? '✅ ' : '▪ ';
    return '<option value="' + v.id + '">' + p + v.name + '</option>';
  }).join('');

  if (ttsVoices.find(v => v.id === currentVoice)) sel.value = currentVoice;
  else {
    currentVoice = ttsVoices[0].id;
    sel.value = currentVoice;
    localStorage.setItem('dd_tts_voice', currentVoice);
  }

  if (rateSel) rateSel.value = String(currentRate);
  if (pitchSel) pitchSel.value = String(currentPitch);

  const bestCount = ttsVoices.filter(v => v.quality === 'best').length;
  status.innerHTML = [
    '<span class="ok">✅ Edge TTS sẵn sàng</span><br>',
    '📊 ' + ttsVoices.length + ' giọng (' + bestCount + ' chuẩn Đài Loan)<br>',
    '🎙️ ' + currentVoice.split('-').pop() + '<br>',
    '⚡ ' + currentRate + '× · 🎚️ ' + (currentPitch >= 0 ? '+' : '') + currentPitch + 'Hz'
  ].join('');

  sel.onchange = () => {
    currentVoice = sel.value;
    localStorage.setItem('dd_tts_voice', currentVoice);
    safeToast('🎙️ Đổi giọng', 'ok');
    speakEdge('你好，歡迎使用當代中文課程');
    refreshTTSUI();
  };

  if (rateSel) rateSel.onchange = () => {
    currentRate = parseFloat(rateSel.value);
    localStorage.setItem('dd_tts_rate', String(currentRate));
    safeToast('⚡ Tốc độ: ' + currentRate + '×', 'ok');
    speakEdge('這是測試速度');
    refreshTTSUI();
  };

  if (pitchSel) pitchSel.onchange = () => {
    currentPitch = parseFloat(pitchSel.value);
    localStorage.setItem('dd_tts_pitch', String(currentPitch));
    safeToast('🎚️ Cao độ: ' + (currentPitch >= 0 ? '+' : '') + currentPitch + 'Hz', 'ok');
    speakEdge('這是測試音調');
    refreshTTSUI();
  };

  if (testBtn) testBtn.onclick = function() {
    speakEdge('你好，歡迎使用當代中文課程。我是你的中文老師。', { btn: testBtn });
  };
}

function addQuickSpeakBtn() {
  const hb = document.querySelector('.hbtns');
  if (!hb || document.getElementById('quickSpeakBtn')) return;
  const btn = document.createElement('button');
  btn.className = 'hbtn icon-only';
  btn.id = 'quickSpeakBtn';
  btn.title = 'Test giọng đọc';
  btn.innerHTML = '<svg style="width:16px;height:16px"><use href="#i-vol"/></svg>';
  btn.onclick = function() { speakEdge('你好，歡迎使用當代中文課程。', { btn }); };
  const ref = document.getElementById('themeBtn');
  if (ref) hb.insertBefore(btn, ref); else hb.appendChild(btn);
}

async function init() {
  ttsAvailable = await checkTTS();
  if (ttsAvailable) {
    await loadVoices();
    console.log('[app9 v2.0] ✅ Edge TTS ready —', ttsVoices.length, 'voices');
  } else {
    console.warn('[app9 v2.0] ⚠️ Edge TTS not available');
  }

  setTimeout(addTTSSettings, 500);
  setTimeout(addQuickSpeakBtn, 800);
  hookTrackChange();

  const modal = document.getElementById('settingsModal');
  if (modal) {
    new MutationObserver(() => {
      if (modal.classList.contains('show')) setTimeout(refreshTTSUI, 50);
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  const hb = document.querySelector('.hbtns');
  if (hb) {
    new MutationObserver(() => setTimeout(addQuickSpeakBtn, 100))
      .observe(hb, { childList: true });
  }

  console.log('[app9 v2.0] Integration loaded');
}

window.ddSpeakEdge = speakEdge;
window.ddStopTTS = stopAudio;
window.ddReloadTTS = refreshTTSUI;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 700));
} else {
  setTimeout(init, 700);
}

})();