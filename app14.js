'use strict';
/* app14.js v2.0 — Waveform đẹp + Nút Toggle trên Toolbar */
(function(){

if (!window.impState) {
  console.error('[app14] Cần app10.js nạp trước!');
  return;
}

const $ = id => document.getElementById(id);
const ST = window.impState;

const KEY = 'dd_waveform_enabled';
let enabled = localStorage.getItem(KEY) !== 'off';

/* ============================================================
   CSS
   ============================================================ */
const CSS = `
.wf14{height:34px;margin-top:10px;background:linear-gradient(180deg,rgba(139,92,246,.08),rgba(236,72,153,.03));border-radius:9px;overflow:hidden;position:relative;cursor:pointer;border:1px solid rgba(139,92,246,.18);transition:.2s;display:none}
.wf14.show{display:block}
.wf14:hover{border-color:rgba(139,92,246,.5);background:linear-gradient(180deg,rgba(139,92,246,.13),rgba(236,72,153,.05));box-shadow:0 2px 12px rgba(139,92,246,.15)}
.wf14 canvas{width:100%;height:100%;display:block;pointer-events:none}
.wf14 .wf14-head{position:absolute;top:0;bottom:0;width:2px;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.95),0 0 14px #a78bfa;transition:left .05s linear;left:0;pointer-events:none;z-index:2;border-radius:1px}
.wf14 .wf14-head::before{content:'';position:absolute;top:-2px;bottom:-2px;left:-2px;width:6px;background:linear-gradient(180deg,#a78bfa,#ec4899);border-radius:3px;opacity:.5;filter:blur(5px)}
.wf14 .wf14-time{position:absolute;top:50%;font-size:9.5px;font-weight:800;color:#fff;background:rgba(0,0,0,.75);padding:2px 7px;border-radius:5px;pointer-events:none;z-index:3;left:0;opacity:0;transition:opacity .15s;white-space:nowrap;backdrop-filter:blur(4px);transform:translateY(-50%)}
.wf14:hover .wf14-time{opacity:1}
@media(max-width:640px){.wf14{height:28px}}
`;

const style = document.createElement('style');
style.id = 'app14-styles';
style.textContent = CSS;
if (!document.getElementById('app14-styles')) document.head.appendChild(style);

/* ============================================================
   DECODE + DRAW
   ============================================================ */
function decodeAudio(blob) {
  return new Promise((res, rej) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const fr = new FileReader();
    fr.onload = async () => {
      try {
        const buf = await ctx.decodeAudioData(fr.result);
        ctx.close();
        res(buf);
      } catch(e) { ctx.close(); rej(e); }
    };
    fr.onerror = rej;
    fr.readAsArrayBuffer(blob);
  });
}

function drawBars(canvas, audioBuffer) {
  if (!canvas || !audioBuffer) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 10) return;
  const W = rect.width, H = rect.height;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const c = canvas.getContext('2d');
  c.scale(dpr, dpr);
  c.clearRect(0, 0, W, H);

  const data = audioBuffer.getChannelData(0);
  const bars = Math.max(60, Math.floor(W / 2.5));
  const barSlot = W / bars;
  const barWidth = Math.max(1.5, barSlot * 0.68);
  const step = Math.floor(data.length / bars);
  const mid = H / 2;
  const maxBarH = H * 0.78;

  const grad = c.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#c4b5fd');
  grad.addColorStop(0.5, '#a78bfa');
  grad.addColorStop(1, '#ec4899');

  c.fillStyle = grad;
  c.shadowColor = 'rgba(167,139,250,.4)';
  c.shadowBlur = 4;

  for (let i = 0; i < bars; i++) {
    let peak = 0;
    const s0 = i * step;
    const s1 = Math.min(data.length, s0 + step);
    for (let j = s0; j < s1; j++) {
      const v = Math.abs(data[j]);
      if (v > peak) peak = v;
    }
    const norm = Math.min(1, peak * 1.4);
    const barH = Math.max(2, norm * maxBarH);
    const x = i * barSlot + (barSlot - barWidth) / 2;
    const y = mid - barH / 2;
    const r = Math.min(barWidth / 2, 1.5);

    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + barWidth - r, y);
    c.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
    c.lineTo(x + barWidth, y + barH - r);
    c.quadraticCurveTo(x + barWidth, y + barH, x + barWidth - r, y + barH);
    c.lineTo(x + r, y + barH);
    c.quadraticCurveTo(x, y + barH, x, y + barH - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
    c.fill();
  }
}

function fmt(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const x = Math.floor(s % 60);
  return m + ':' + String(x).padStart(2, '0');
}

/* ============================================================
   CACHE + ADD WAVEFORM
   ============================================================ */
const audioBufCache = new Map();

async function addWaveform(cardEl, sentence, idx) {
  if (!enabled) return;
  if (!cardEl || cardEl.querySelector('.wf14')) return;

  const wf = document.createElement('div');
  wf.className = 'wf14';
  wf.innerHTML = '<canvas></canvas><div class="wf14-head"></div><div class="wf14-time">0:00</div>';
  const head = cardEl.querySelector('.impv-card-head');
  if (head) head.after(wf);

  try {
    const clean = String(sentence.zh || '').trim();
    if (!clean) { wf.remove(); return; }
    const key = ST.voice + '|' + ST.rate + '|' + ST.pitch + '|' + clean;

    let buf = audioBufCache.get(key);
    if (!buf) {
      const url = '/api/tts?text=' + encodeURIComponent(clean) +
        '&voice=' + encodeURIComponent(ST.voice) +
        '&rate=' + ST.rate +
        '&pitch=' + ST.pitch;
      const r = await fetch(url);
      if (!r.ok) { wf.remove(); return; }
      const blob = await r.blob();
      if (blob.size < 100) { wf.remove(); return; }
      buf = await decodeAudio(blob);
      audioBufCache.set(key, buf);
      if (audioBufCache.size > 30) {
        const firstKey = audioBufCache.keys().next().value;
        audioBufCache.delete(firstKey);
      }
    }

    wf.classList.add('show');
    const canvas = wf.querySelector('canvas');
    requestAnimationFrame(() => drawBars(canvas, buf));

    wf.onclick = e => {
      if (!ST.currentAudio || !ST.currentAudio.duration) return;
      const rect = wf.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      ST.currentAudio.currentTime = pct * ST.currentAudio.duration;
    };

    wf.onmousemove = e => {
      const rect = wf.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const timeEl = wf.querySelector('.wf14-time');
      timeEl.textContent = ST.currentAudio && ST.currentAudio.duration
        ? fmt(pct * ST.currentAudio.duration)
        : Math.round(pct * 100) + '%';
      timeEl.style.left = (pct * 100) + '%';
      timeEl.style.transform = pct > 0.9 ? 'translate(-100%, -50%)' : pct < 0.1 ? 'translate(0, -50%)' : 'translate(-50%, -50%)';
    };

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => drawBars(canvas, buf));
      ro.observe(canvas);
    }
  } catch(e) {
    console.error('[app14] addWaveform error:', e);
    wf.remove();
  }
}

/* ============================================================
   UPDATE PLAYHEAD
   ============================================================ */
setInterval(() => {
  if (!enabled) return;
  if (!ST.currentAudio) return;
  const card = $('impv-card-' + ST.currentIdx);
  if (!card) return;
  const wf = card.querySelector('.wf14');
  if (!wf || !wf.classList.contains('show')) return;
  const headEl = wf.querySelector('.wf14-head');
  const a = ST.currentAudio;
  if (!headEl || !a.duration) return;
  headEl.style.left = ((a.currentTime / a.duration) * 100) + '%';
}, 60);

/* ============================================================
   AUTO ADD WHEN CARD ACTIVE
   ============================================================ */
let lastActive = -2;
setInterval(() => {
  if (!enabled) return;
  if (!ST.sentences || !ST.sentences.length) return;
  const idx = ST.currentIdx;
  if (idx === lastActive) return;
  lastActive = idx;
  if (idx < 0) return;
  const card = $('impv-card-' + idx);
  const s = ST.sentences[idx];
  if (card && s) addWaveform(card, s, idx);
}, 500);

/* ============================================================
   HOOK RENDER
   ============================================================ */
const origRender = window.impRenderSentences;
if (typeof origRender === 'function') {
  window.impRenderSentences = function() {
    origRender.apply(this, arguments);
    lastActive = -2;
    if (enabled && ST.sentences.length) {
      setTimeout(() => {
        const card = $('impv-card-0');
        if (card && ST.sentences[0]) addWaveform(card, ST.sentences[0], 0);
      }, 600);
    }
  };
}

/* ============================================================
   TOGGLE
   ============================================================ */
function removeAllWaveforms() {
  document.querySelectorAll('.wf14').forEach(el => el.remove());
}

function setEnabled(val) {
  enabled = !!val;
  localStorage.setItem(KEY, enabled ? 'on' : 'off');
  if (!enabled) {
    removeAllWaveforms();
  } else {
    lastActive = -2;
    const idx = ST.currentIdx;
    if (idx >= 0) {
      const card = $('impv-card-' + idx);
      const s = ST.sentences[idx];
      if (card && s) addWaveform(card, s, idx);
    } else if (ST.sentences.length) {
      const card = $('impv-card-0');
      if (card && ST.sentences[0]) addWaveform(card, ST.sentences[0], 0);
    }
  }
  updateToggleBtn();
}

/* ============================================================
   NÚT TOGGLE TRÊN TOOLBAR
   ============================================================ */
function updateToggleBtn() {
  const btn = $('wf14ToggleBtn');
  if (!btn) return;
  if (enabled) {
    btn.classList.add('on');
    btn.title = 'Thanh sóng âm: BẬT (bấm để tắt)';
    btn.style.background = 'linear-gradient(135deg,#8b5cf6,#6366f1)';
    btn.style.color = '#fff';
    btn.style.boxShadow = '0 2px 8px rgba(139,92,246,.3)';
  } else {
    btn.classList.remove('on');
    btn.title = 'Thanh sóng âm: TẮT (bấm để bật)';
    btn.style.background = '';
    btn.style.color = '';
    btn.style.boxShadow = '';
  }
}

function injectToolbarBtn() {
  // Nếu đã có → update và return
  if ($('wf14ToggleBtn')) { updateToggleBtn(); return; }

  // Tìm toolbar
  const toolbar = document.querySelector('.impv-toolbar');
  if (!toolbar) return;

  // Nhóm đầu tiên (ẩn/hiện Hán/Py/Vi)
  const firstGroup = toolbar.querySelector('.impv-tgroup');
  if (!firstGroup) return;

  const btn = document.createElement('button');
  btn.className = 'impv-tbtn';
  btn.id = 'wf14ToggleBtn';
  btn.type = 'button';
  btn.innerHTML = '<svg style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round" viewBox="0 0 24 24"><path d="M3 12h2M19 12h2M7 8v8M11 5v14M15 7v10M9 12h6" opacity="0.9"/></svg>';
  btn.onclick = (e) => {
    e.stopPropagation();
    setEnabled(!enabled);
    if (typeof window.toast === 'function') {
      window.toast(enabled ? '✓ Bật thanh sóng âm' : 'Đã tắt thanh sóng âm', 'ok');
    }
  };

  // Chèn cuối nhóm 1 (sau nút VI)
  firstGroup.appendChild(btn);
  updateToggleBtn();
}

/* ============================================================
   HOOK openPage
   ============================================================ */
const origOpenPage = window.impOpenPage;
if (typeof origOpenPage === 'function') {
  window.impOpenPage = function() {
    origOpenPage.apply(this, arguments);
    setTimeout(() => {
      injectToolbarBtn();
      if (enabled && ST.sentences.length) {
        setTimeout(() => {
          const idx = ST.currentIdx >= 0 ? ST.currentIdx : 0;
          const card = $('impv-card-' + idx);
          const s = ST.sentences[idx];
          if (card && s) addWaveform(card, s, idx);
        }, 800);
      }
    }, 500);
  };
}

/* ============================================================
   OBSERVER — đảm bảo nút luôn có (kể cả khi app10 render lại)
   ============================================================ */
setInterval(() => {
  const impv = $('impv');
  if (!impv || !impv.classList.contains('show')) return;
  if (!$('wf14ToggleBtn')) injectToolbarBtn();
}, 1500);

/* ============================================================
   INIT
   ============================================================ */
function init() {
  console.log('[app14 v2.0] ✅ Waveform + Toolbar Toggle loaded (enabled=' + enabled + ')');
  setTimeout(() => {
    const impv = $('impv');
    if (impv && impv.classList.contains('show')) {
      injectToolbarBtn();
    }
  }, 1500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1600));
} else {
  setTimeout(init, 1600);
}

window.app14SetWaveform = setEnabled;

})();