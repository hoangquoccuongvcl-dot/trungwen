'use strict';
/* app4.js v3.0 — Kho câu + Pron Check 2 tầng + Shared State */

(function(){

/* ========== SHARED STATE ========== */
if (!window.DD) window.DD = {};

window.DD.saved = JSON.parse(localStorage.getItem('dd_saved') || '[]');

window.DD.saveList = function() {
  try { localStorage.setItem('dd_saved', JSON.stringify(window.DD.saved)); } catch(e) {}
};

window.DD.esc = function(s) {
  return String(s == null ? '' : s).replace(/[&<>"'`]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;'
  }[c]));
};

window.DD.toast = function(msg, type) {
  if (typeof window.toast === 'function') window.toast(msg, type);
};

window.DD.py = function(text) {
  if (typeof window.py === 'function') return window.py(text);
  if (!window.pinyinPro) return '';
  try {
    const clean = String(text || '').replace(/[^\u4e00-\u9fa5]/g, '');
    return window.pinyinPro.pinyin(clean, { toneType: 'symbol', type: 'string', nonZh: 'removed' });
  } catch(e) { return ''; }
};

window.DD.speak = function(zh) {
  try {
    const u = new SpeechSynthesisUtterance(zh);
    u.lang = 'zh-TW';
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch(e) {}
};

window.DD.normalize = function(zh) {
  return String(zh || '').replace(/[^\u4e00-\u9fa5]/g, '').trim();
};

window.DD.addSentence = function(zh, opts) {
  const clean = window.DD.normalize(zh);
  if (!clean || clean.length < 1) {
    window.DD.toast('Câu quá ngắn', 'err');
    return false;
  }
  if (window.DD.saved.some(s => window.DD.normalize(s.zh) === clean)) {
    window.DD.toast('Câu đã có trong kho', 'err');
    return false;
  }
  const py = window.DD.py(clean);
  const item = {
    id: 'sv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    zh: clean,
    pinyin: py,
    vi: '',
    source: (opts && opts.source) || '',
    trackId: (opts && opts.trackId) || '',
    start: (opts && opts.start) || null,
    end: (opts && opts.end) || null,
    created: Date.now()
  };
  window.DD.saved.unshift(item);
  window.DD.saveList();
  window.DD.toast('💾 Đã lưu: ' + clean.slice(0, 20) + (clean.length > 20 ? '...' : ''), 'ok');
  if (typeof window.DD.translateVi === 'function') window.DD.translateVi(item);
  return true;
};

window.DD.removeSentence = function(id) {
  window.DD.saved = window.DD.saved.filter(s => s.id !== id);
  window.DD.saveList();
  if (typeof window.DD.renderSaved === 'function') window.DD.renderSaved();
  if (typeof window.DD.updateBadge === 'function') window.DD.updateBadge();
  window.DD.toast('Đã xóa');
};

window.DD.translateVi = async function(item) {
  if (!item || item.vi) return;
  const cacheKey = 'dd_tc_' + item.zh.slice(0, 25);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    item.vi = cached;
    window.DD.saveList();
    if (typeof window.DD.renderSaved === 'function') window.DD.renderSaved();
    return;
  }
  try {
    const r = await fetch('/api/translate?q=' + encodeURIComponent(item.zh));
    if (!r.ok) return;
    const d = await r.json();
    if (d.text) {
      item.vi = d.text;
      try { localStorage.setItem(cacheKey, d.text); } catch(e) {}
      window.DD.saveList();
      if (typeof window.DD.renderSaved === 'function') window.DD.renderSaved();
    }
  } catch(e) {}
};

/* ========== CSS ========== */
const style = document.createElement('style');
style.textContent = [
'.sel-save-btn{position:fixed;z-index:700;background:linear-gradient(135deg,var(--accent),var(--rose));color:#fff;border:none;padding:8px 14px;border-radius:20px;font-size:12px;font-weight:700;box-shadow:0 6px 20px rgba(234,88,12,.5);cursor:pointer;display:none;animation:popIn .15s;align-items:center;gap:6px}',
'.sel-save-btn.show{display:inline-flex}',
'.sel-save-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
'.saved-modal{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:650;display:none;align-items:center;justify-content:center;padding:16px}',
'.saved-modal.show{display:flex}',
'.saved-mc{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:18px;width:100%;max-width:680px;max-height:88vh;display:flex;flex-direction:column}',
'.saved-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border);gap:8px;flex-wrap:wrap}',
'.saved-hd h3{font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px}',
'.saved-hd h3 .cnt{font-size:11px;background:var(--card);padding:2px 8px;border-radius:10px;color:var(--accent)}',
'.saved-hd-right{display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
'.import-btn{padding:6px 12px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;border-radius:8px;font-size:11.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.15s}',
'.import-btn:hover{transform:scale(1.03)}',
'.import-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
'.saved-filters{padding:10px 0;display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--border);margin-bottom:12px}',
'.saved-filters input{flex:1;min-width:140px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px 11px;color:var(--text);font-size:12px;outline:none}',
'.saved-filters input:focus{border-color:var(--accent)}',
'.saved-filters select{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px 11px;color:var(--text);font-size:12px;outline:none;cursor:pointer}',
'.saved-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding-right:4px}',
'.saved-list::-webkit-scrollbar{width:6px}',
'.saved-list::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}',
'.sv-card{background:var(--bg);border:1px solid var(--border);border-radius:11px;padding:14px 16px;transition:border-color .15s}',
'.sv-card:hover{border-color:var(--accent)}',
'.sv-zh{font-size:19px;font-weight:600;line-height:1.5;font-family:"PingFang TC","Microsoft JhengHei",sans-serif;color:var(--text);word-break:break-word}',
'.sv-py{font-size:12px;color:var(--accent2);margin-top:5px;font-family:ui-monospace,monospace;letter-spacing:.3px}',
'.sv-vi{font-size:12.5px;color:var(--text2);margin-top:5px;font-style:italic;line-height:1.5}',
'.sv-meta{font-size:10px;color:var(--text3);margin-top:6px}',
'.sv-actions{display:flex;gap:5px;margin-top:10px;flex-wrap:wrap}',
'.sv-actions button{background:var(--card);border:1px solid var(--border);color:var(--text2);padding:5px 11px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;transition:.15s}',
'.sv-actions button:hover{background:var(--card2);color:var(--text)}',
'.sv-actions button svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
'.sv-actions button.pron{color:#06b6d4}',
'.sv-actions button.pron:hover{background:rgba(6,182,212,.2)}',
'.sv-actions button.del{color:#e11d48}',
'.sv-actions button.del:hover{background:rgba(225,29,72,.2)}',
'.sv-empty{text-align:center;padding:50px 20px;color:var(--text3)}',
'.sv-empty .em{font-size:44px;opacity:.35;display:block;margin-bottom:14px}',
'.sv-empty p{font-size:12.5px;line-height:1.7}',
'.via .vocab-pron{color:#06b6d4}',
'.via .vocab-pron:hover{background:rgba(6,182,212,.2);color:#06b6d4}',
'.pron2-pop{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--card);border:2px solid var(--accent);border-radius:16px;padding:20px;z-index:700;width:min(500px,94vw);max-height:94vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.9);display:none;animation:popIn .2s}',
'.pron2-pop.show{display:block}',
'.pron2-pop h4{font-size:15px;margin-bottom:12px;text-align:center;color:var(--accent);font-weight:700}',
'.pp2-target{text-align:center;font-size:32px;font-weight:700;font-family:"PingFang TC",sans-serif;padding:12px 0;color:var(--text);line-height:1.3;word-break:break-all}',
'.pp2-py{text-align:center;font-size:13.5px;color:var(--accent2);font-family:ui-monospace,monospace;margin-bottom:14px;letter-spacing:.3px}',
'.pp2-acts{display:flex;gap:8px;margin:14px 0}',
'.pp2-acts .btn{flex:1;justify-content:center;font-size:12px}',
'.pp2-status{text-align:center;font-size:12px;color:var(--text3);padding:6px 0;min-height:20px}',
'.pp2-rec.recording{background:#e11d48!important;animation:pulse-rec 1s infinite}',
'@keyframes pulse-rec{0%,100%{opacity:1}50%{opacity:.55}}',
'.pp2-canvas-wrap{background:var(--bg);border-radius:10px;border:1px solid var(--border);padding:12px;margin:12px 0}',
'.pp2-canvas{width:100%;height:130px;display:block}',
'.pp2-legend{display:flex;justify-content:center;gap:16px;margin-top:8px;font-size:10.5px;color:var(--text2)}',
'.pp2-legend span{display:flex;align-items:center;gap:5px}',
'.pp2-legend .dt{width:10px;height:10px;border-radius:50%}',
'.pp2-legend .dt.b{background:#06b6d4}',
'.pp2-legend .dt.r{background:#e11d48}',
'.pp2-scores{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:14px 0}',
'.pp2-sc{text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 6px}',
'.pp2-sc .num{font-size:24px;font-weight:800;line-height:1}',
'.pp2-sc .num.good{color:#10b981}',
'.pp2-sc .num.mid{color:#f59e0b}',
'.pp2-sc .num.bad{color:#e11d48}',
'.pp2-sc .lbl{font-size:9.5px;color:var(--text3);margin-top:5px;text-transform:uppercase;letter-spacing:.6px}',
'.pp2-sc.total{background:rgba(234,88,12,.08);border-color:rgba(234,88,12,.3)}',
'.pp2-sc.total .num{color:var(--accent)}',
'.pp2-chars{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:12px 0}',
'.pp2-ch{padding:5px 9px;border-radius:7px;font-size:14px;font-weight:700;font-family:"PingFang TC",sans-serif;background:var(--bg);border:1px solid var(--border)}',
'.pp2-ch.ok{background:rgba(16,185,129,.15);border-color:#10b981;color:#10b981}',
'.pp2-ch.bad{background:rgba(225,29,72,.15);border-color:#e11d48;color:#e11d48}',
'.pp2-note{text-align:center;font-size:10.5px;color:var(--text3);margin-top:8px;line-height:1.5}'
].join('\n');
document.head.appendChild(style);

/* ========== DOM HELPERS ========== */
const $ = id => document.getElementById(id);

/* ========== AUDIO CONTEXT ========== */
let audioCtx2 = null;
function getCtx2() {
  if (!audioCtx2) {
    try { audioCtx2 = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 }); }
    catch(e) { audioCtx2 = new (window.AudioContext || window.webkitAudioContext)(); }
  }
  return audioCtx2;
}

/* ========== YIN PITCH ========== */
function yin2(buf, sr) {
  const N = buf.length, half = N >> 1;
  if (half < 4) return -1;
  const d = new Float32Array(half);
  for (let tau = 0; tau < half; tau++) {
    let s = 0;
    for (let i = 0; i < half; i++) { const x = buf[i] - buf[i + tau]; s += x * x; }
    d[tau] = s;
  }
  d[0] = 1;
  let run = 0;
  for (let tau = 1; tau < half; tau++) {
    run += d[tau];
    d[tau] = run > 0 ? d[tau] * tau / run : 1;
  }
  const tMin = Math.max(2, Math.floor(sr / 400));
  const tMax = Math.min(half - 2, Math.floor(sr / 80));
  let t = tMin;
  while (t < tMax) {
    if (d[t] < 0.15) {
      while (t + 1 < tMax && d[t + 1] < d[t]) t++;
      const f = sr / t;
      if (f >= 80 && f <= 400) return f;
      return -1;
    }
    t++;
  }
  return -1;
}

function extractCurve2(data, sr) {
  const frame = 512, hop = 256;
  const out = [];
  for (let i = 0; i + frame < data.length; i += hop) {
    let rms = 0;
    for (let k = 0; k < frame; k++) rms += data[i + k] * data[i + k];
    rms = Math.sqrt(rms / frame);
    if (rms < 0.008) { out.push({ t: i / sr, f: 0 }); continue; }
    const win = data.slice(i, i + frame);
    const f = yin2(win, sr);
    out.push({ t: i / sr, f: f });
  }
  return out;
}

function resampleLin2(data, from, to) {
  if (from === to) return data;
  const ratio = from / to;
  const len = Math.floor(data.length / ratio);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const src = i * ratio;
    const i0 = Math.floor(src);
    const i1 = Math.min(i0 + 1, data.length - 1);
    const fr = src - i0;
    out[i] = data[i0] * (1 - fr) + data[i1] * fr;
  }
  return out;
}

function normalizeCurve2(curve) {
  const valid = curve.filter(p => p.f > 0);
  if (valid.length < 3) return [];
  const logs = valid.map(p => Math.log(p.f));
  const lo = Math.min(...logs), hi = Math.max(...logs);
  const range = hi - lo || 1;
  const t0 = curve[0].t, t1 = curve[curve.length - 1].t;
  const tr = t1 - t0 || 1;
  return curve.map(p => ({
    x: (p.t - t0) / tr,
    y: p.f > 0 ? Math.max(0, Math.min(1, (Math.log(p.f) - lo) / range)) : null
  }));
}

function resample2(points, n) {
  const out = new Array(n).fill(null);
  const valid = points.filter(p => p.y !== null);
  if (valid.length < 2) return out;
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    if (x <= valid[0].x) { out[i] = valid[0].y; continue; }
    if (x >= valid[valid.length - 1].x) { out[i] = valid[valid.length - 1].y; continue; }
    let lo = 0, hi = valid.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (valid[m].x < x) lo = m; else hi = m; }
    const x0 = valid[lo].x, x1 = valid[hi].x;
    const fr = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
    out[i] = valid[lo].y + fr * (valid[hi].y - valid[lo].y);
  }
  return out;
}

/* ========== THEORY PITCH ========== */
function getToneNum2(ch) {
  if (!window.pinyinPro) return 5;
  try {
    const py = window.pinyinPro.pinyin(ch, { toneType: 'num', type: 'string', nonZh: 'removed' });
    const m = py.match(/[1-5]/);
    return m ? parseInt(m[0]) : 5;
  } catch(e) { return 5; }
}

function theoryCurveFromTone(tone, N) {
  const curve = [];
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);
    let y;
    if (tone === 1) y = 0.85;
    else if (tone === 2) y = 0.25 + 0.65 * x;
    else if (tone === 3) y = 0.5 - 0.35 * Math.sin(Math.PI * x) + 0.15 * x;
    else if (tone === 4) y = 0.9 - 0.75 * x;
    else y = 0.5;
    curve.push(Math.max(0.05, Math.min(0.95, y)));
  }
  return curve;
}

function buildTheoryCurve(zh) {
  const chars = [...window.DD.normalize(zh)];
  if (!chars.length) return [];
  const N = 120;
  const perChar = Math.floor(N / chars.length);
  const curve = [];
  chars.forEach(ch => {
    const tone = getToneNum2(ch);
    const toneCurve = theoryCurveFromTone(tone, perChar);
    curve.push(...toneCurve);
  });
  while (curve.length < N) curve.push(curve[curve.length - 1] || 0.5);
  return curve.slice(0, N);
}

function scorePitch(theory, user) {
  if (!theory.length || !user.length) return 0;
  const us = resample2(user.map((y, i) => ({ x: i / (user.length - 1), y: y })), theory.length);
  let sum = 0, cnt = 0;
  for (let i = 0; i < theory.length; i++) {
    if (us[i] === null) continue;
    const d = theory[i] - us[i];
    sum += d * d;
    cnt++;
  }
  if (cnt < 10) return 0;
  const rmse = Math.sqrt(sum / cnt);
  return Math.max(0, Math.round(100 * Math.max(0, 1 - rmse * 1.6)));
}
/* ========== PRON CHECK POPUP ========== */
let recMR = null, recStream = null, recChunks = [];
let speechRec = null;
let isChecking = false;

function getPop2() {
  let p = $('pron2Pop');
  if (!p) {
    p = document.createElement('div');
    p.id = 'pron2Pop';
    p.className = 'pron2-pop';
    p.addEventListener('click', e => { if (e.target === p) closePop2(); });
    document.body.appendChild(p);
  }
  return p;
}

function closePop2() {
  const p = $('pron2Pop');
  if (p) p.classList.remove('show');
  if (recMR && recMR.state === 'recording') { try { recMR.stop(); } catch(e) {} }
  if (recStream) { recStream.getTracks().forEach(t => t.stop()); recStream = null; }
  if (speechRec) { try { speechRec.stop(); } catch(e) {} speechRec = null; }
  isChecking = false;
}

function setStat2(txt) {
  const el = $('pp2Status');
  if (el) el.textContent = txt;
}

window.DD.startCheck = function(target) {
  target = window.DD.normalize(target);
  if (!target) { window.DD.toast('Không có chữ Hán', 'err'); return; }

  const p = getPop2();
  const pyText = window.DD.py(target);
  p.innerHTML = [
    '<h4>🎯 Kiểm tra phát âm (2 tầng)</h4>',
    '<div class="pp2-target">' + window.DD.esc(target) + '</div>',
    pyText ? '<div class="pp2-py">' + window.DD.esc(pyText) + '</div>' : '',
    '<div class="pp2-acts">',
    '  <button class="btn" id="pp2TTS">🔊 Nghe mẫu</button>',
    '  <button class="btn pri pp2-rec" id="pp2Rec">🎤 Bắt đầu đọc</button>',
    '</div>',
    '<div class="pp2-status" id="pp2Status">Bấm "Bắt đầu đọc" rồi đọc to</div>',
    '<div id="pp2Result"></div>',
    '<div class="mcf" style="margin-top:14px">',
    '  <button class="btn" onclick="window.DD.closePron()">Đóng</button>',
    '</div>'
  ].join('\n');
  p.classList.add('show');

  $('pp2TTS').onclick = () => window.DD.speak(target);
  $('pp2Rec').onclick = () => runCheck2(target);
};

window.DD.closePron = closePop2;

async function runCheck2(target) {
  const btn = $('pp2Rec');
  if (!btn) return;

  if (isChecking) {
    if (recMR && recMR.state === 'recording') recMR.stop();
    if (speechRec) { try { speechRec.stop(); } catch(e) {} }
    btn.classList.remove('recording');
    btn.textContent = '🎤 Bắt đầu đọc';
    setStat2('Đang xử lý...');
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { window.DD.toast('Chrome/Edge mới hỗ trợ', 'err'); return; }

  try {
    recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch(e) {
    setStat2('❌ Không mở được mic. Kiểm tra quyền!');
    return;
  }

  isChecking = true;
  recChunks = [];
  recMR = new MediaRecorder(recStream);
  recMR.ondataavailable = e => { if (e.data.size > 0) recChunks.push(e.data); };
  recMR.start();

  speechRec = new SR();
  speechRec.lang = 'zh-TW';
  speechRec.interimResults = false;
  speechRec.maxAlternatives = 3;
  speechRec.continuous = false;

  let speechResult = null;
  let speechAlts = [];
  let done = false;

  const finalize = async () => {
    if (done) return;
    done = true;
    isChecking = false;

    if (recMR && recMR.state === 'recording') recMR.stop();
    if (recStream) { recStream.getTracks().forEach(t => t.stop()); recStream = null; }

    setTimeout(async () => {
      let userPitch = null;
      try {
        const blob = new Blob(recChunks, { type: 'audio/webm' });
        const arr = await blob.arrayBuffer();
        const c = getCtx2();
        const buf = await c.decodeAudioData(arr.slice(0));
        const sr = buf.sampleRate;
        const ch = buf.getChannelData(0);
        let mono = ch;
        if (sr !== 16000) mono = resampleLin2(ch, sr, 16000);
        const raw = extractCurve2(mono, 16000);
        const norm = normalizeCurve2(raw);
        userPitch = resample2(norm, 120);
      } catch(e) {
        console.warn('pitch decode error:', e);
      }
      renderResult2(target, speechResult, speechAlts, userPitch);
    }, 200);
  };

  btn.classList.add('recording');
  btn.textContent = '⏹ Đang nghe...';
  setStat2('🔴 Đọc to câu trên nào!');

  const timeout = setTimeout(() => {
    if (speechRec) { try { speechRec.stop(); } catch(e) {} }
    finalize();
  }, 8000);

  speechRec.onresult = (e) => {
    clearTimeout(timeout);
    const alts = [...e.results[0]].map(r => window.DD.normalize(r.transcript));
    speechResult = alts[0] || '';
    speechAlts = alts;
    finalize();
  };

  speechRec.onerror = (e) => {
    clearTimeout(timeout);
    if (e.error === 'no-speech') setStat2('Không nghe thấy giọng. Đọc to hơn!');
    else if (e.error === 'not-allowed') setStat2('❌ Chưa cấp quyền mic.');
    else if (e.error === 'audio-capture') setStat2('❌ Không truy cập được mic.');
    else setStat2('❌ Lỗi: ' + e.error);
    finalize();
  };

  speechRec.onend = () => {
    clearTimeout(timeout);
    finalize();
  };

  try {
    speechRec.start();
  } catch(e) {
    setStat2('❌ Lỗi: ' + e.message);
    finalize();
  }
}

function scoreSpeech(target, said) {
  const t = window.DD.normalize(target);
  if (!t.length) return { score: 0, detail: [] };
  const max = Math.max(t.length, said.length);
  let match = 0;
  const detail = [];
  for (let i = 0; i < max; i++) {
    const tc = t[i] || '', sc = said[i] || '';
    if (tc && tc === sc) { match++; detail.push({ ch: tc, ok: true }); }
    else detail.push({ ch: tc || '?', ok: false, said: sc });
  }
  return { score: Math.round(match / t.length * 100), detail };
}

function drawMiniCanvas(canvas, theory, user) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const c = canvas.getContext('2d');
  c.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  c.clearRect(0, 0, W, H);

  c.strokeStyle = 'rgba(148,163,184,.15)';
  c.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = (H / 4) * i;
    c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
  }

  const draw = (arr, color, w) => {
    if (!arr || !arr.length) return;
    c.strokeStyle = color;
    c.lineWidth = w;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.beginPath();
    let started = false;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === null) { started = false; continue; }
      const x = (i / (arr.length - 1)) * (W - 16) + 8;
      const y = H - 12 - arr[i] * (H - 24);
      if (!started) { c.moveTo(x, y); started = true; }
      else c.lineTo(x, y);
    }
    c.stroke();
  };

  draw(theory, '#06b6d4', 3);
  draw(user, '#e11d48', 2.5);
}

function renderResult2(target, said, alts, userPitch) {
  const box = $('pp2Result');
  if (!box) return;

  const cleanTarget = window.DD.normalize(target);
  const speech = scoreSpeech(cleanTarget, said || '');
  const theory = buildTheoryCurve(cleanTarget);
  const pitchScore = userPitch ? scorePitch(theory, userPitch) : 0;

  const total = Math.round(speech.score * 0.4 + pitchScore * 0.6);

  const totalCls = total >= 80 ? 'good' : total >= 55 ? 'mid' : 'bad';
  const speechCls = speech.score >= 80 ? 'good' : speech.score >= 55 ? 'mid' : 'bad';
  const pitchCls = pitchScore >= 80 ? 'good' : pitchScore >= 55 ? 'mid' : 'bad';

  const emoji = total >= 80 ? '🎉' : total >= 55 ? '👍' : '💪';

  const charHtml = speech.detail.map(d => {
    const tip = d.ok ? '' : ' title="Bạn đọc: ' + window.DD.esc(d.said || '?') + '"';
    const tone = d.ch && /[\u4e00-\u9fa5]/.test(d.ch) ? getToneNum2(d.ch) : '';
    const tLabel = tone ? '<span style="font-size:9px;opacity:.7;margin-left:2px">T' + tone + '</span>' : '';
    return '<span class="pp2-ch ' + (d.ok ? 'ok' : 'bad') + '"' + tip + '>' + window.DD.esc(d.ch) + tLabel + '</span>';
  }).join('');

  const altsHtml = alts.length > 1
    ? '<div class="pp2-note">Cách khác: ' + alts.slice(1).map(a => '"' + window.DD.esc(a) + '"').join(', ') + '</div>'
    : '';

  box.innerHTML = [
    '<div class="pp2-scores">',
    '  <div class="pp2-sc"><div class="num ' + speechCls + '">' + speech.score + '%</div><div class="lbl">Phụ âm/Vần</div></div>',
    '  <div class="pp2-sc"><div class="num ' + pitchCls + '">' + pitchScore + '%</div><div class="lbl">Thanh điệu</div></div>',
    '  <div class="pp2-sc total"><div class="num">' + total + '%</div><div class="lbl">' + emoji + ' Tổng</div></div>',
    '</div>',
    '<div class="pp2-canvas-wrap">',
    '  <canvas class="pp2-canvas" id="pp2Canvas"></canvas>',
    '  <div class="pp2-legend">',
    '    <span><span class="dt b"></span>Đường chuẩn</span>',
    '    <span><span class="dt r"></span>Giọng bạn</span>',
    '  </div>',
    '</div>',
    '<div class="pp2-chars">' + charHtml + '</div>',
    said ? '<div class="pp2-note">Bạn đọc: <b>' + window.DD.esc(said) + '</b></div>' : '<div class="pp2-note">Không nhận diện được giọng</div>',
    altsHtml,
    '<div class="pp2-note">💡 Tổng = 40% phụ âm/vần + 60% thanh điệu</div>'
  ].join('\n');

  setTimeout(() => {
    const cv = $('pp2Canvas');
    if (cv) drawMiniCanvas(cv, theory, userPitch);
  }, 50);

  setStat2('');
}

/* ========== SAVED MODAL ========== */
function getSavedModal2() {
  let m = $('savedModal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'savedModal';
    m.className = 'saved-modal';
    m.addEventListener('click', e => { if (e.target === m) closeSaved2(); });
    document.body.appendChild(m);
  }
  return m;
}

window.DD.openSaved = function() {
  const m = getSavedModal2();
  m.innerHTML = [
    '<div class="saved-mc">',
    '  <div class="saved-hd">',
    '    <h3>💾 Kho câu <span class="cnt" id="savedCount">' + window.DD.saved.length + '</span></h3>',
    '    <div class="saved-hd-right">',
    '      <button class="import-btn" id="savedImportBtn">',
    '        <svg><use href="#i-file"/></svg> Nhập đoạn văn',
    '      </button>',
    '      <button class="btn sm" id="savedExportBtn">📤 Xuất</button>',
    '      <button class="btn sm" id="savedCloseBtn">✕</button>',
    '    </div>',
    '  </div>',
    '  <div class="saved-filters">',
    '    <input type="text" id="savedSearch" placeholder="🔍 Tìm theo chữ Hán, pinyin, tiếng Việt...">',
    '    <select id="savedSort">',
    '      <option value="new">Mới nhất</option>',
    '      <option value="old">Cũ nhất</option>',
    '      <option value="az">A → Z</option>',
    '    </select>',
    '  </div>',
    '  <div class="saved-list" id="savedList"></div>',
    '</div>'
  ].join('\n');
  m.classList.add('show');

  $('savedImportBtn').onclick = () => {
    if (typeof window.openImportModal === 'function') window.openImportModal();
    else window.DD.toast('Chưa nạp app5.js', 'err');
  };
  $('savedExportBtn').onclick = window.DD.exportSaved;
  $('savedCloseBtn').onclick = closeSaved2;
  $('savedSearch').oninput = () => window.DD.renderSaved();
  $('savedSort').onchange = () => window.DD.renderSaved();

  window.DD.renderSaved();
};

function closeSaved2() {
  const m = $('savedModal');
  if (m) m.classList.remove('show');
}

window.DD.closeSaved = closeSaved2;

window.DD.renderSaved = function() {
  const list = $('savedList');
  if (!list) return;

  const cnt = $('savedCount');
  if (cnt) cnt.textContent = window.DD.saved.length;

  const q = ($('savedSearch')?.value || '').toLowerCase().trim();
  const sort = $('savedSort')?.value || 'new';

  let items = window.DD.saved.slice();
  if (q) {
    items = items.filter(s =>
      s.zh.toLowerCase().includes(q) ||
      (s.vi || '').toLowerCase().includes(q) ||
      (s.pinyin || '').toLowerCase().includes(q)
    );
  }
  if (sort === 'old') items.reverse();
  else if (sort === 'az') items.sort((a, b) => a.zh.localeCompare(b.zh));

  if (!items.length) {
    list.innerHTML = [
      '<div class="sv-empty">',
      '  <span class="em">💾</span>',
      '  <p style="font-weight:600;color:var(--text2);margin-bottom:8px">' +
        (q ? 'Không tìm thấy câu nào' : 'Kho câu đang trống') +
      '</p>',
      q ? '' : '<p>Bôi đen chữ Hán trong bài học →<br>bấm nút 💾 Lưu xuất hiện bên cạnh.</p>',
      q ? '' : '<p style="margin-top:12px">Hoặc chuột phải câu → <b>Lưu vào kho</b></p>',
      q ? '' : '<p>Hoặc bấm <b>📄 Nhập đoạn văn</b> ở trên.</p>',
      '</div>'
    ].join('\n');
    return;
  }

  list.innerHTML = items.map(item => [
    '<div class="sv-card" data-id="' + item.id + '">',
    '  <div class="sv-zh">' + window.DD.esc(item.zh) + '</div>',
    item.pinyin ? '  <div class="sv-py">' + window.DD.esc(item.pinyin) + '</div>' : '',
    item.vi ? '  <div class="sv-vi">' + window.DD.esc(item.vi) + '</div>' : '',
    item.source ? '  <div class="sv-meta">📎 ' + window.DD.esc(item.source) + '</div>' : '',
    '  <div class="sv-actions">',
    '    <button data-act="tts"><svg><use href="#i-vol"/></svg> Nghe</button>',
    '    <button class="pron" data-act="pron"><svg><use href="#i-target"/></svg> Check 2 tầng</button>',
    '    <button data-act="edit"><svg><use href="#i-pencil"/></svg> Sửa</button>',
    '    <button data-act="copy"><svg><use href="#i-copy"/></svg> Copy</button>',
    '    <button class="del" data-act="del"><svg><use href="#i-trash"/></svg> Xóa</button>',
    '  </div>',
    '</div>'
  ].join('\n')).join('');
};

window.DD.exportSaved = function() {
  if (!window.DD.saved.length) { window.DD.toast('Kho trống', 'err'); return; }
  const data = { version: 3, exported: new Date().toISOString(), sentences: window.DD.saved };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kho-cau-' + Date.now() + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  window.DD.toast('Đã xuất kho câu', 'ok');
};

/* ========== SAVED LIST ACTIONS ========== */
document.addEventListener('click', e => {
  const btn = e.target.closest('.sv-actions button[data-act]');
  if (!btn) return;
  const card = btn.closest('.sv-card');
  if (!card) return;
  const item = window.DD.saved.find(s => s.id === card.dataset.id);
  if (!item) return;
  const act = btn.dataset.act;
  if (act === 'tts') window.DD.speak(item.zh);
  else if (act === 'pron') window.DD.startCheck(item.zh);
  else if (act === 'copy') {
    navigator.clipboard.writeText(item.zh).then(() => window.DD.toast('Đã copy', 'ok')).catch(() => window.DD.toast('Không copy được', 'err'));
  }
  else if (act === 'edit') {
    const newZh = prompt('Sửa chữ Hán:', item.zh);
    if (newZh && newZh.trim()) {
      item.zh = window.DD.normalize(newZh);
      item.pinyin = window.DD.py(item.zh);
      window.DD.saveList();
      window.DD.renderSaved();
      window.DD.toast('Đã cập nhật', 'ok');
    }
  }
  else if (act === 'del') window.DD.removeSentence(item.id);
});

/* ========== FLOATING SELECTION BUTTON ========== */
let selBtn2 = null;

function getSelBtn2() {
  if (!selBtn2) {
    selBtn2 = document.createElement('button');
    selBtn2.className = 'sel-save-btn';
    selBtn2.innerHTML = '<svg><use href="#i-bookmark"/></svg> Lưu câu';
    selBtn2.onclick = () => {
      const text = selBtn2._text || '';
      if (text) window.DD.addSentence(text, { source: 'Bôi đen' });
      selBtn2.classList.remove('show');
    };
    document.body.appendChild(selBtn2);
  }
  return selBtn2;
}

document.addEventListener('mouseup', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    const btn = getSelBtn2();
    if (!text || text.length < 2 || !/[\u4e00-\u9fa5]/.test(text)) {
      btn.classList.remove('show');
      return;
    }
    try {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || rect.width === 0) { btn.classList.remove('show'); return; }
      btn._text = text;
      btn.style.left = Math.min(window.innerWidth - 130, rect.right + 8) + 'px';
      btn.style.top = Math.max(10, rect.top - 42) + 'px';
      btn.classList.add('show');
    } catch(err) {
      btn.classList.remove('show');
    }
  }, 10);
});

document.addEventListener('mousedown', e => {
  const btn = getSelBtn2();
  if (btn && !btn.contains(e.target) && !e.target.closest('.sv-card')) {
    btn.classList.remove('show');
  }
});

/* ========== CONTEXT MENU PATCH ========== */
function patchCtx() {
  const menu = $('ctxMenu');
  if (!menu || menu.querySelector('[data-act="save2"]')) return;
  const sep = document.createElement('div');
  sep.className = 'ctx-sep';
  const item = document.createElement('div');
  item.className = 'ctx-item';
  item.setAttribute('data-act', 'save2');
  item.innerHTML = '<svg><use href="#i-bookmark"/></svg> Lưu câu vào kho';
  item.onclick = () => {
    const S = window.S;
    if (S && S.cur >= 0 && S.tracks[S.cur]?.transcript) {
      const idx = window.ctxIdx !== undefined ? window.ctxIdx : -1;
      if (idx >= 0) {
        const it = S.tracks[S.cur].transcript[idx];
        if (it) window.DD.addSentence(it.zh, {
          source: S.tracks[S.cur].name,
          trackId: S.tracks[S.cur].id,
          start: it.start,
          end: it.end
        });
      }
    }
    if (typeof window.closeCtx === 'function') window.closeCtx();
  };
  menu.appendChild(sep);
  menu.appendChild(item);
}

/* ========== VOCAB PRON INJECTION ========== */
function injectVocabPron2() {
  document.querySelectorAll('.vi').forEach(item => {
    if (item.querySelector('.vocab-pron')) return;
    const via = item.querySelector('.via');
    if (!via) return;
    const zh = item.querySelector('.viz')?.textContent?.trim();
    if (!zh) return;
    const btn = document.createElement('button');
    btn.className = 'vocab-pron';
    btn.title = 'Check phát âm 2 tầng';
    btn.innerHTML = '<svg style="width:14px;height:14px"><use href="#i-target"/></svg>';
    btn.onclick = (e) => {
      e.stopPropagation();
      const chars = window.DD.normalize(zh);
      if (chars) window.DD.startCheck(chars);
    };
    via.insertBefore(btn, via.firstChild);
  });
}

function observeVocab2() {
  const modal = $('vocabModal');
  if (!modal) { setTimeout(observeVocab2, 600); return; }
  new MutationObserver(() => setTimeout(injectVocabPron2, 100)).observe(modal, { childList: true, subtree: true });
}

/* ========== HEADER BUTTON ========== */
function addSavedBtn2() {
  const hb = document.querySelector('.hbtns');
  if (!hb || $('savedBtn')) return;
  const btn = document.createElement('button');
  btn.className = 'hbtn';
  btn.id = 'savedBtn';
  btn.title = 'Kho câu (S)';
  btn.innerHTML = '<svg><use href="#i-bookmark"/></svg><span id="savedBadge" style="margin-left:4px;font-size:11px;color:var(--accent)">' + window.DD.saved.length + '</span>';
  btn.onclick = () => window.DD.openSaved();
  const ref = $('themeBtn');
  if (ref) hb.insertBefore(btn, ref); else hb.appendChild(btn);
}

window.DD.updateBadge = function() {
  const b = $('savedBadge');
  if (b) b.textContent = window.DD.saved.length;
};

/* ========== KEYBOARD ========== */
document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.key === 's' || e.key === 'S') {
    if (!e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      window.DD.openSaved();
    }
  }
  if (e.key === 'Escape') closePop2();
});

/* ========== INIT ========== */
function init() {
  addSavedBtn2();
  patchCtx();
  observeVocab2();
  console.log('[app4 v3.0] Kho câu + Pron Check 2 tầng loaded');
  setTimeout(() => {
    if (typeof window.toast === 'function') {
      window.toast('💾 Kho câu sẵn sàng · Bấm S để mở');
    }
  }, 3000);
  setInterval(() => { patchCtx(); window.DD.updateBadge(); }, 3000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();