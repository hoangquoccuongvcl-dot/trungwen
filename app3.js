'use strict';
/* app3.js v3.0 — Pitch Detection Pron Check */

(function(){

/* ========== CSS ========== */
const style = document.createElement('style');
style.textContent = [
'.pron-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--card);border:2px solid var(--accent);border-radius:16px;padding:20px;z-index:600;width:min(540px,94vw);max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.85);display:none}',
'.pron-popup.show{display:block}',
'.pron-popup h4{font-size:15px;margin-bottom:12px;text-align:center;color:var(--accent)}',
'.pron-row{margin-bottom:12px}',
'.pron-label{font-size:10.5px;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px}',
'.pron-text{font-size:20px;padding:11px 15px;background:var(--bg);border-radius:10px;border:1px solid var(--border);font-family:"PingFang TC",sans-serif;line-height:1.6;word-break:break-all}',
'.pron-py{font-size:12px;color:var(--accent2);margin-top:5px;font-family:ui-monospace,monospace;letter-spacing:.3px}',
'.pron-actions{display:flex;gap:8px;margin:14px 0}',
'.pron-actions .btn{flex:1;justify-content:center}',
'.pron-canvas-wrap{background:var(--bg);border-radius:10px;border:1px solid var(--border);padding:12px;margin-top:12px;display:none}',
'.pron-canvas-wrap.show{display:block}',
'.pron-canvas{width:100%;height:170px;display:block}',
'.pron-legend{display:flex;justify-content:center;gap:18px;margin-top:10px;font-size:11px;color:var(--text2)}',
'.pron-legend span{display:flex;align-items:center;gap:6px}',
'.pron-legend .dot{width:10px;height:10px;border-radius:50%}',
'.pron-legend .dot.b{background:#06b6d4}',
'.pron-legend .dot.r{background:#e11d48}',
'.pron-score{text-align:center;margin:16px 0}',
'.pron-score .num{font-size:50px;font-weight:800;line-height:1}',
'.pron-score .num.good{color:#10b981}',
'.pron-score .num.mid{color:#f59e0b}',
'.pron-score .num.bad{color:#e11d48}',
'.pron-score .lbl{font-size:11px;color:var(--text3);margin-top:5px;text-transform:uppercase;letter-spacing:1px}',
'.pron-sylls{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:12px 0}',
'.pron-syl{padding:5px 9px;border-radius:8px;font-size:12.5px;font-weight:600;font-family:"PingFang TC",sans-serif;background:var(--bg);border:1px solid var(--border);display:inline-flex;align-items:baseline;gap:2px}',
'.pron-syl.ok{background:rgba(16,185,129,.15);border-color:#10b981;color:#10b981}',
'.pron-syl.bad{background:rgba(225,29,72,.15);border-color:#e11d48;color:#e11d48}',
'.pron-syl .t{font-size:9px;opacity:.75}',
'.pron-status{text-align:center;font-size:12px;color:var(--text3);padding:6px 0}',
'.pron-rec.recording{background:#e11d48!important;animation:pulse-rec 1s infinite}',
'@keyframes pulse-rec{0%,100%{opacity:1}50%{opacity:.55}}',
'.sact button[data-pron]{color:#06b6d4}',
'.sact button[data-pron]:hover{background:rgba(6,182,212,.2)}',
'.hbtn.tone-active{background:linear-gradient(135deg,#ef4444,#3b82f6);border:none;color:#fff}',
'.szh .word.tone-1{color:#ef4444}',
'.szh .word.tone-2{color:#f59e0b}',
'.szh .word.tone-3{color:#10b981}',
'.szh .word.tone-4{color:#3b82f6}',
'.szh .word.tone-5{color:#94a3b8}'
].join('\n');
document.head.appendChild(style);

/* ========== CONFIG ========== */
const CFG = {
  SR: 16000,
  FRAME: 512,
  HOP: 256,
  MIN_F: 80,
  MAX_F: 400,
  THRESH: 0.15,
  RMS_MIN: 0.008,
  N_POINTS: 120
};

/* ========== STATE ========== */
let toneOn = localStorage.getItem('dd_tone_colors') === 'on';
let curIdx = -1;
let targetCurveCache = {};
let audioCtx = null;
let recStream = null, recMR = null, recChunks = [];
let userCurve = null, targetCurve = null;
let isRecording = false;

function ctx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: CFG.SR }); }
    catch (e) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
  }
  return audioCtx;
}

/* ========== YIN ========== */
function yin(buf, sr) {
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
  const tMin = Math.max(2, Math.floor(sr / CFG.MAX_F));
  const tMax = Math.min(half - 2, Math.floor(sr / CFG.MIN_F));
  let t = tMin;
  while (t < tMax) {
    if (d[t] < CFG.THRESH) {
      while (t + 1 < tMax && d[t + 1] < d[t]) t++;
      const f = sr / t;
      if (f >= CFG.MIN_F && f <= CFG.MAX_F) return f;
      return -1;
    }
    t++;
  }
  return -1;
}

/* ========== EXTRACT CURVE ========== */
function extractCurve(data, sr) {
  const out = [];
  const frame = CFG.FRAME, hop = CFG.HOP;
  for (let i = 0; i + frame < data.length; i += hop) {
    let rms = 0;
    for (let k = 0; k < frame; k++) rms += data[i + k] * data[i + k];
    rms = Math.sqrt(rms / frame);
    if (rms < CFG.RMS_MIN) { out.push({ t: i / sr, f: 0 }); continue; }
    const win = data.slice(i, i + frame);
    const f = yin(win, sr);
    out.push({ t: i / sr, f: f });
  }
  return out;
}

/* ========== NORMALIZE (SHARED RANGE) ========== */
function normalizeToRange(curve, loHz, hiHz) {
  const loL = Math.log(loHz);
  const hiL = Math.log(hiHz);
  const range = hiL - loL || 1;
  if (!curve.length) return [];
  const t0 = curve[0].t, t1 = curve[curve.length - 1].t;
  const tr = t1 - t0 || 1;
  return curve.map(p => ({
    x: (p.t - t0) / tr,
    y: p.f > 0 ? Math.max(0, Math.min(1, (Math.log(p.f) - loL) / range)) : null
  }));
}

function getHzRange(curve) {
  const f = curve.filter(p => p.f > 0).map(p => p.f);
  if (f.length < 2) return [100, 300];
  f.sort((a, b) => a - b);
  const lo = f[Math.floor(f.length * 0.05)];
  const hi = f[Math.floor(f.length * 0.95)];
  const pad = (hi - lo) * 0.2 || 20;
  return [Math.max(CFG.MIN_F, lo - pad), Math.min(CFG.MAX_F, hi + pad)];
}

/* ========== RESAMPLE ========== */
function resample(points, n) {
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
    const frac = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
    out[i] = valid[lo].y + frac * (valid[hi].y - valid[lo].y);
  }
  return out;
}

/* ========== DIRECTION ========== */
function directionOf(arr) {
  const v = arr.filter(x => x !== null);
  if (v.length < 5) return 'unknown';
  const n = v.length;
  const q1 = v.slice(0, Math.floor(n * 0.25));
  const qm = v.slice(Math.floor(n * 0.35), Math.floor(n * 0.65));
  const q4 = v.slice(Math.floor(n * 0.75));
  const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const f0 = avg(q1), fm = avg(qm), f1 = avg(q4);
  const range = Math.max(...v) - Math.min(...v) || 1;
  const diff = (f1 - f0) / range;
  const dip = (Math.min(f0, f1) - fm) / range;
  if (dip > 0.15) return 'down-up';
  if (diff > 0.18) return 'up';
  if (diff < -0.18) return 'down';
  return 'flat';
}

function expectedDir(tone) {
  return tone === 1 ? 'flat' : tone === 2 ? 'up' : tone === 3 ? 'down-up' : tone === 4 ? 'down' : 'flat';
}

function getTone(ch) {
  if (!window.pinyinPro) return 5;
  try {
    const py = window.pinyinPro.pinyin(ch, { toneType: 'num', type: 'string', nonZh: 'removed' });
    const m = py.match(/[1-5]/);
    return m ? parseInt(m[0]) : 5;
  } catch (e) { return 5; }
}
/* ========== AUDIO DECODE ========== */
function resampleLin(data, from, to) {
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

async function decodeSlice(blob, t0, t1) {
  const arr = await blob.arrayBuffer();
  const c = ctx();
  const buf = await c.decodeAudioData(arr.slice(0));
  const sr = buf.sampleRate;
  const ch = buf.getChannelData(0);
  const s0 = Math.max(0, Math.floor(t0 * sr));
  const s1 = Math.min(ch.length, Math.ceil(t1 * sr));
  let mono = ch.slice(s0, s1);
  if (sr !== CFG.SR) mono = resampleLin(mono, sr, CFG.SR);
  return mono;
}

/* ========== SCORE ========== */
function scoreCurves(t, u) {
  const N = CFG.N_POINTS;
  const ts = resample(t, N);
  const us = resample(u, N);
  let sum = 0, cnt = 0;
  for (let i = 0; i < N; i++) {
    if (ts[i] === null || us[i] === null) continue;
    const d = ts[i] - us[i];
    sum += d * d;
    cnt++;
  }
  if (cnt < 15) return { score: 0, rmse: 1 };
  const rmse = Math.sqrt(sum / cnt);
  const score = Math.max(0, Math.round(100 * Math.max(0, 1 - rmse * 1.8)));
  return { score, rmse };
}

function perSyl(chars, tArr, uArr) {
  const N = chars.length;
  if (!N) return [];
  const step = CFG.N_POINTS / N;
  const out = [];
  for (let i = 0; i < N; i++) {
    const s0 = Math.floor(i * step), s1 = Math.floor((i + 1) * step);
    const tSeg = tArr.slice(s0, s1);
    const uSeg = uArr.slice(s0, s1);
    const tone = getTone(chars[i]);
    const eDir = expectedDir(tone);
    const uDir = directionOf(uSeg);
    let ok = false;
    if (eDir === 'flat' && (uDir === 'flat' || uDir === 'up' || uDir === 'down')) ok = true;
    else ok = eDir === uDir;
    out.push({ ch: chars[i], tone, eDir, uDir, ok });
  }
  return out;
}

/* ========== DRAW ========== */
function draw(canvas, t, u) {
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
  const drawOne = (arr, color, w) => {
    const ys = resample(arr, CFG.N_POINTS);
    const v = ys.filter(y => y !== null);
    if (v.length < 2) return;
    c.strokeStyle = color;
    c.lineWidth = w;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.beginPath();
    let started = false;
    for (let i = 0; i < CFG.N_POINTS; i++) {
      if (ys[i] === null) { started = false; continue; }
      const x = (i / (CFG.N_POINTS - 1)) * (W - 20) + 10;
      const y = H - 15 - ys[i] * (H - 30);
      if (!started) { c.moveTo(x, y); started = true; } else c.lineTo(x, y);
    }
    c.stroke();
  };
  if (t && t.length) drawOne(t, '#06b6d4', 3);
  if (u && u.length) drawOne(u, '#e11d48', 2.5);
}

/* ========== POPUP ========== */
function getPopup() {
  let p = document.getElementById('pronPopup');
  if (!p) {
    p = document.createElement('div');
    p.id = 'pronPopup';
    p.className = 'pron-popup';
    p.addEventListener('click', e => { if (e.target === p) closePopup(); });
    document.body.appendChild(p);
  }
  return p;
}

function closePopup() {
  const p = document.getElementById('pronPopup');
  if (p) p.classList.remove('show');
  stopRec();
  curIdx = -1;
}

function setStatus(txt) {
  const el = document.getElementById('pronStatus');
  if (el) el.textContent = txt;
}

async function openPopup(idx) {
  const S = window.S;
  if (!S || !S.tracks || S.cur < 0) return;
  const tr = S.tracks[S.cur].transcript;
  if (!tr || !tr[idx]) { if (typeof toast === 'function') toast('Chưa có lời', 'err'); return; }

  curIdx = idx;
  userCurve = null;
  targetCurve = null;

  const item = tr[idx];
  const pyText = item.pinyin || (typeof window.py === 'function' ? window.py(item.zh) : '');

  const popup = getPopup();
  popup.innerHTML = [
    '<h4>🎯 Kiểm tra phát âm</h4>',
    '<div class="pron-row">',
    '  <div class="pron-label">Câu cần đọc</div>',
    '  <div class="pron-text zh">' + item.zh + '</div>',
    pyText ? '  <div class="pron-py">' + pyText + '</div>' : '',
    '</div>',
    '<div class="pron-actions">',
    '  <button class="btn" id="pListen">🔊 Nghe gốc</button>',
    '  <button class="btn pri pron-rec" id="pRec">🎤 Bắt đầu đọc</button>',
    '</div>',
    '<div class="pron-status" id="pronStatus">Bấm "Bắt đầu đọc" rồi đọc to câu trên</div>',
    '<div class="pron-canvas-wrap" id="pCanvasWrap">',
    '  <canvas class="pron-canvas" id="pCanvas"></canvas>',
    '  <div class="pron-legend">',
    '    <span><span class="dot b"></span>Giọng gốc</span>',
    '    <span><span class="dot r"></span>Giọng bạn</span>',
    '  </div>',
    '</div>',
    '<div id="pResult"></div>',
    '<div class="mcf">',
    '  <button class="btn" onclick="closePronPopup()">Đóng</button>',
    '  <button class="btn pri" id="pRetry" style="display:none">Đọc lại</button>',
    '</div>'
  ].join('\n');
  popup.classList.add('show');

  document.getElementById('pListen').onclick = () => playTarget(idx);
  document.getElementById('pRec').onclick = handleRecBtn;
  document.getElementById('pRetry').onclick = () => {
    userCurve = null;
    document.getElementById('pCanvasWrap').classList.remove('show');
    document.getElementById('pResult').innerHTML = '';
    document.getElementById('pRetry').style.display = 'none';
    handleRecBtn();
  };

  const key = S.tracks[S.cur].id + '_' + idx;
  if (targetCurveCache[key]) {
    targetCurve = targetCurveCache[key];
    setStatus('Sẵn sàng. Bấm "Bắt đầu đọc"!');
  } else if (S.tracks[S.cur].blob) {
    try {
      setStatus('Đang phân tích audio gốc...');
      const t0 = item.start || 0;
      const t1 = item.end || (t0 + 3.5);
      const data = await decodeSlice(S.tracks[S.cur].blob, t0, t1);
      const raw = extractCurve(data, CFG.SR);
      const [lo, hi] = getHzRange(raw);
      targetCurve = normalizeToRange(raw, lo, hi);
      targetCurveCache[key] = { curve: targetCurve, lo, hi };
      setStatus('Sẵn sàng. Bấm "Bắt đầu đọc"!');
    } catch (e) {
      console.error('target extract:', e);
      setStatus('Không phân tích được audio gốc');
    }
  }
}

async function playTarget(idx) {
  const S = window.S;
  if (!S || !S.tracks || S.cur < 0) return;
  const tr = S.tracks[S.cur].transcript;
  if (!tr || !tr[idx]) return;
  const a = document.getElementById('audio');
  a.currentTime = tr[idx].start || 0;
  try { await a.play(); } catch (e) {}
  const dur = ((tr[idx].end || tr[idx].start + 3) - (tr[idx].start || 0) + 0.3) * 1000;
  setTimeout(() => { if (!a.paused) a.pause(); }, dur);
}

/* ========== RECORD ========== */
async function startRec() {
  try {
    recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recChunks = [];
    recMR = new MediaRecorder(recStream);
    recMR.ondataavailable = e => { if (e.data.size > 0) recChunks.push(e.data); };
    recMR.onstop = onRecStop;
    recMR.start();
    isRecording = true;
    return true;
  } catch (e) {
    alert('Không mở được mic. Kiểm tra quyền truy cập!');
    return false;
  }
}

function stopRec() {
  if (recMR && recMR.state === 'recording') recMR.stop();
  if (recStream) { recStream.getTracks().forEach(t => t.stop()); recStream = null; }
  isRecording = false;
}

async function onRecStop() {
  setStatus('Đang phân tích...');
  try {
    const blob = new Blob(recChunks, { type: 'audio/webm' });
    const arr = await blob.arrayBuffer();
    const c = ctx();
    const buf = await c.decodeAudioData(arr.slice(0));
    const sr = buf.sampleRate;
    const ch = buf.getChannelData(0);
    let mono = ch;
    if (sr !== CFG.SR) mono = resampleLin(ch, sr, CFG.SR);
    const raw = extractCurve(mono, CFG.SR);
    const key = window.S.tracks[window.S.cur].id + '_' + curIdx;
    const cached = targetCurveCache[key];
    const lo = cached ? cached.lo : 100;
    const hi = cached ? cached.hi : 300;
    userCurve = normalizeToRange(raw, lo, hi);
  } catch (e) {
    console.error('user decode:', e);
    userCurve = [];
  }
  renderResult();
}

async function handleRecBtn() {
  const btn = document.getElementById('pRec');
  if (!btn) return;
  if (isRecording) {
    btn.classList.remove('recording');
    btn.textContent = '🎤 Bắt đầu đọc';
    setStatus('Đang xử lý...');
    stopRec();
    return;
  }
  const ok = await startRec();
  if (!ok) return;
  btn.classList.add('recording');
  btn.textContent = '⏹ Dừng ghi';
  setStatus('🔴 Đang ghi âm... Đọc to câu trên!');
  const S = window.S;
  const item = S.tracks[S.cur].transcript[curIdx];
  const dur = ((item.end || item.start + 3) - (item.start || 0)) * 1000 + 3000;
  setTimeout(() => {
    if (isRecording) {
      const b = document.getElementById('pRec');
      if (b) { b.classList.remove('recording'); b.textContent = '🎤 Bắt đầu đọc'; }
      setStatus('Đang xử lý...');
      stopRec();
    }
  }, Math.max(5000, dur));
}

/* ========== RESULT ========== */
function renderResult() {
  const wrap = document.getElementById('pCanvasWrap');
  const canvas = document.getElementById('pCanvas');
  const box = document.getElementById('pResult');
  const retry = document.getElementById('pRetry');
  if (!wrap || !canvas || !box) return;

  wrap.classList.add('show');
  const tCurve = targetCurveCache[window.S.tracks[window.S.cur].id + '_' + curIdx]?.curve || targetCurve;
  draw(canvas, tCurve, userCurve);

  if (!userCurve || userCurve.length < 3) {
    box.innerHTML = '<div class="pron-score"><div class="num bad">?</div><div class="lbl">Không nhận diện được</div></div><p style="text-align:center;color:var(--text3);font-size:12px;margin-top:8px">Đọc to hơn, gần mic hơn.</p>';
    if (retry) retry.style.display = 'inline-flex';
    return;
  }

  const { score } = scoreCurves(tCurve, userCurve);
  const cls = score >= 80 ? 'good' : score >= 55 ? 'mid' : 'bad';
  const emoji = score >= 80 ? '🎉' : score >= 55 ? '👍' : '💪';
  const msg = score >= 80 ? 'Phát âm chuẩn!' : score >= 55 ? 'Khá tốt!' : 'Cần luyện thêm';

  const item = window.S.tracks[window.S.cur].transcript[curIdx];
  const chars = [...item.zh.replace(/[^\u4e00-\u9fa5]/g, '')];
  const tsArr = resample(tCurve, CFG.N_POINTS);
  const usArr = resample(userCurve, CFG.N_POINTS);
  const sy = perSyl(chars, tsArr, usArr);

  let sylHtml = '';
  sy.forEach(s => {
    sylHtml += '<span class="pron-syl ' + (s.ok ? 'ok' : 'bad') + '" title="Bạn: ' + s.uDir + ' | Đúng: ' + s.eDir + '">' + s.ch + '<span class="t">T' + s.tone + '</span></span>';
  });

  box.innerHTML = [
    '<div class="pron-score">',
    '  <div class="num ' + cls + '">' + score + '%</div>',
    '  <div class="lbl">' + emoji + ' ' + msg + '</div>',
    '</div>',
    '<div class="pron-sylls">' + sylHtml + '</div>',
    '<p style="text-align:center;font-size:10.5px;color:var(--text3);margin-top:8px">Di chuột lên chữ để xem chi tiết</p>'
  ].join('');
  if (retry) retry.style.display = 'inline-flex';
  setStatus('');
}

/* ========== INJECT BUTTONS ========== */
function injectButtons() {
  document.querySelectorAll('.sent').forEach(sent => {
    if (sent.querySelector('[data-pron]')) return;
    const idx = sent.dataset.idx;
    if (idx === undefined) return;
    const sact = sent.querySelector('.sact');
    if (!sact) return;
    const btn = document.createElement('button');
    btn.setAttribute('data-pron', idx);
    btn.title = 'Kiểm tra phát âm';
    btn.innerHTML = '<svg style="width:14px;height:14px"><use href="#i-target"/></svg>';
    sact.insertBefore(btn, sact.firstChild);
  });
}

/* ========== TONE COLORS ========== */
function applyToneColors() {
  document.querySelectorAll('.szh').forEach(szh => {
    if (toneOn) {
      szh.querySelectorAll('.word').forEach(w => {
        const c = w.dataset.word;
        if (!c) return;
        const t = getTone(c);
        w.classList.remove('tone-1','tone-2','tone-3','tone-4','tone-5');
        w.classList.add('tone-' + t);
      });
    } else {
      szh.querySelectorAll('.word').forEach(w => w.classList.remove('tone-1','tone-2','tone-3','tone-4','tone-5'));
    }
  });
}

function toggleTone() {
  toneOn = !toneOn;
  localStorage.setItem('dd_tone_colors', toneOn ? 'on' : 'off');
  const btn = document.getElementById('toneBtn');
  if (btn) btn.classList.toggle('tone-active', toneOn);
  applyToneColors();
  if (typeof toast === 'function') toast(toneOn ? '🎨 Bật tô màu thanh điệu' : 'Tắt tô màu thanh điệu');
}

/* ========== OBSERVER ========== */
function observe() {
  const area = document.getElementById('transcriptArea');
  if (!area) { setTimeout(observe, 500); return; }
  setTimeout(() => { injectButtons(); applyToneColors(); }, 400);
  new MutationObserver(() => {
    setTimeout(() => { injectButtons(); applyToneColors(); }, 100);
  }).observe(area, { childList: true, subtree: true });
}

/* ========== TONE BUTTON ========== */
function addToneBtn() {
  const hb = document.querySelector('.hbtns');
  if (!hb || document.getElementById('toneBtn')) return;
  const btn = document.createElement('button');
  btn.className = 'hbtn icon-only';
  btn.id = 'toneBtn';
  btn.title = 'Tô màu thanh điệu (T)';
  btn.innerHTML = '<svg style="width:16px;height:16px"><use href="#i-sun"/></svg>';
  if (toneOn) btn.classList.add('tone-active');
  btn.onclick = toggleTone;
  const ref = document.getElementById('themeBtn');
  if (ref) hb.insertBefore(btn, ref); else hb.appendChild(btn);
}

/* ========== EVENTS ========== */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pron]');
  if (b) {
    e.stopPropagation();
    openPopup(parseInt(b.dataset.pron));
  }
});

document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.key === 't' || e.key === 'T') { e.preventDefault(); toggleTone(); }
  if (e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    const S = window.S;
    if (S && S.activeSent >= 0) openPopup(S.activeSent);
    else if (typeof toast === 'function') toast('Chưa chọn câu nào');
  }
  if (e.key === 'Escape') closePopup();
});

/* ========== INIT ========== */
function init() {
  addToneBtn();
  observe();
  console.log('[app3 v3.0] Pitch Detection loaded');
  setTimeout(() => {
    if (typeof toast === 'function') toast('🎯 Bấm T để tô màu thanh · P để kiểm tra phát âm');
  }, 2000);
}

window.openPronPopup = openPopup;
window.closePronPopup = closePopup;
window.toggleToneColors = toggleTone;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();