'use strict';
/* ============================================================
   app11.js v1.0 — Passage Library + Auto-save + Import Subtitle
                   + Study Streak + Waveform Preview
   Cần app10.js nạp trước.
   ============================================================ */
(function(){

if (!window.impState) {
  console.error('[app11] Cần app10.js nạp trước!');
  return;
}

const $ = id => document.getElementById(id);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
const ST = window.impState;
const vib = n => { try { navigator.vibrate && navigator.vibrate(n || 10); } catch(e){} };
const fmtDate = ts => {
  const d = new Date(ts);
  const diff = Date.now() - ts;
  if (diff < 60000) return 'vừa xong';
  if (diff < 3600000) return Math.floor(diff/60000) + ' phút trước';
  if (diff < 86400000) return Math.floor(diff/3600000) + ' giờ trước';
  if (diff < 604800000) return Math.floor(diff/86400000) + ' ngày trước';
  return d.toLocaleDateString('vi-VN');
};

/* ============================================================
   1. INDEXEDDB — Thư viện đoạn văn
   ============================================================ */
const DB = {
  db: null,
  init() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('dd_passages_v1', 1);
      r.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('passages')) {
          const os = db.createObjectStore('passages', { keyPath: 'id' });
          os.createIndex('created', 'created');
          os.createIndex('lastStudied', 'lastStudied');
        }
      };
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  put(item) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('passages', 'readwrite');
      tx.objectStore('passages').put(item);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  },
  get(id) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('passages', 'readonly');
      const r = tx.objectStore('passages').get(id);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  },
  all() {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('passages', 'readonly');
      const r = tx.objectStore('passages').getAll();
      r.onsuccess = () => res(r.result || []);
      r.onerror = () => rej(r.error);
    });
  },
  del(id) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('passages', 'readwrite');
      tx.objectStore('passages').delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }
};

/* ============================================================
   2. CSS
   ============================================================ */
const CSS = `
/* Nút "Thư viện" trong topbar */
.impv-lib-btn{background:linear-gradient(135deg,#8b5cf6,#6366f1)!important;color:#fff!important;border:none!important;font-weight:700}
.impv-lib-badge{position:absolute;top:-4px;right:-4px;background:#10b981;color:#fff;font-size:9px;font-weight:800;border-radius:8px;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-shadow:0 2px 6px rgba(16,185,129,.5)}

/* Modal thư viện */
.lib-modal{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:none;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(6px)}
.lib-modal.show{display:flex;animation:libFade .2s}
@keyframes libFade{from{opacity:0}to{opacity:1}}
.lib-box{background:var(--bg2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:720px;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,.7);animation:libSlide .25s}
@keyframes libSlide{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.lib-hd{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:10px}
.lib-hd h3{font-size:15px;font-weight:800;display:flex;align-items:center;gap:8px}
.lib-hd h3 .cnt{background:var(--card);padding:2px 8px;border-radius:8px;font-size:11px;color:#a78bfa;font-weight:800}
.lib-hd-acts{display:flex;gap:6px;align-items:center}
.lib-hd-btn{background:var(--card);border:1px solid var(--border);color:var(--text2);padding:6px 12px;border-radius:8px;font-size:11.5px;font-weight:700;cursor:pointer;transition:.15s}
.lib-hd-btn:hover{background:var(--card2);color:var(--text)}
.lib-hd-btn.pri{background:linear-gradient(135deg,#8b5cf6,#6366f1);border:none;color:#fff}
.lib-search{padding:12px 20px 8px}
.lib-search input{width:100%;padding:9px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:12.5px;outline:none;font-family:inherit}
.lib-search input:focus{border-color:#8b5cf6}
.lib-tags{display:flex;gap:6px;padding:0 20px 12px;flex-wrap:wrap;overflow-x:auto;scrollbar-width:none}
.lib-tags::-webkit-scrollbar{display:none}
.lib-tag{padding:4px 10px;border-radius:8px;background:var(--bg);border:1px solid var(--border);color:var(--text2);font-size:11px;font-weight:700;cursor:pointer;transition:.15s;white-space:nowrap}
.lib-tag:hover{background:var(--card);color:var(--text)}
.lib-tag.on{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border-color:transparent}
.lib-list{flex:1;overflow-y:auto;padding:4px 20px 20px;display:flex;flex-direction:column;gap:10px}
.lib-list::-webkit-scrollbar{width:6px}
.lib-list::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
.lib-item{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:14px 16px;cursor:pointer;transition:.18s;position:relative;overflow:hidden}
.lib-item:hover{border-color:#8b5cf6;transform:translateX(3px);background:var(--bg2)}
.lib-item.active{border-color:#8b5cf6;background:linear-gradient(90deg,rgba(139,92,246,.12),transparent)}
.lib-item.active::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#8b5cf6,#6366f1)}
.lib-title{font-size:14.5px;font-weight:800;color:var(--text);margin-bottom:5px;display:flex;align-items:center;gap:8px;padding-right:80px}
.lib-title .ch{font-size:12px;color:#a78bfa;font-weight:600;font-family:"PingFang TC",sans-serif}
.lib-preview{font-size:12px;color:var(--text3);line-height:1.5;margin-bottom:8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-family:"PingFang TC",sans-serif}
.lib-meta{display:flex;gap:10px;align-items:center;font-size:10.5px;color:var(--text3);flex-wrap:wrap}
.lib-meta .m-item{display:flex;align-items:center;gap:4px}
.lib-item-acts{position:absolute;top:12px;right:12px;display:flex;gap:4px;opacity:0;transition:.15s}
.lib-item:hover .lib-item-acts{opacity:1}
.lib-item-acts button{width:26px;height:26px;border-radius:7px;background:var(--card);border:1px solid var(--border);color:var(--text3);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}
.lib-item-acts button:hover{background:var(--card2);color:var(--text);transform:scale(1.1)}
.lib-item-acts button.del:hover{background:rgba(225,29,72,.15);color:#e11d48;border-color:rgba(225,29,72,.4)}
.lib-item-acts button svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2}
.lib-item-tag{font-size:10px;padding:2px 7px;border-radius:6px;background:rgba(139,92,246,.15);color:#a78bfa;font-weight:700}
.lib-empty{text-align:center;padding:60px 20px;color:var(--text3)}
.lib-empty .em{font-size:52px;opacity:.3;display:block;margin-bottom:16px}
.lib-empty h4{font-size:14px;color:var(--text2);margin-bottom:8px}
.lib-empty p{font-size:12px;line-height:1.7}
.lib-new-btn{width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;transition:.15s}
.lib-new-btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(139,92,246,.4)}
.lib-new-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.5}

/* Save dialog */
.save-dlg{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:210;display:none;align-items:center;justify-content:center;padding:16px}
.save-dlg.show{display:flex;animation:libFade .2s}
.save-dlg-box{background:var(--bg2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:480px;padding:22px;box-shadow:0 30px 80px rgba(0,0,0,.7)}
.save-dlg-box h3{font-size:16px;font-weight:800;margin-bottom:6px;color:var(--text);display:flex;align-items:center;gap:8px}
.save-dlg-box .sub{font-size:12px;color:var(--text3);margin-bottom:18px}
.save-lbl{font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;display:block}
.save-input{width:100%;padding:11px 14px;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;color:var(--text);font-size:13.5px;outline:none;margin-bottom:14px;font-family:inherit;transition:.15s}
.save-input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.15)}
.save-tags-wrap{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.save-tag-chip{padding:5px 11px;border-radius:8px;background:var(--bg);border:1px solid var(--border);color:var(--text2);font-size:11.5px;font-weight:700;cursor:pointer;transition:.15s;user-select:none}
.save-tag-chip:hover{background:var(--card)}
.save-tag-chip.on{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border-color:transparent}
.save-acts{display:flex;gap:8px;justify-content:flex-end}
.save-btn{padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:.15s;font-family:inherit}
.save-btn.cancel{background:var(--card);color:var(--text2);border:1px solid var(--border)}
.save-btn.cancel:hover{background:var(--card2);color:var(--text)}
.save-btn.ok{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;box-shadow:0 4px 14px rgba(139,92,246,.4)}
.save-btn.ok:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(139,92,246,.5)}
.save-btn.danger{background:rgba(225,29,72,.15);color:#e11d48;border:1px solid rgba(225,29,72,.3)}

/* Streak badge */
.streak-badge{display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:800;box-shadow:0 3px 10px rgba(245,158,11,.35);cursor:pointer;transition:.15s;margin-left:8px}
.streak-badge:hover{transform:scale(1.05)}
.streak-badge .fire{font-size:13px;filter:drop-shadow(0 0 3px rgba(255,255,255,.5))}
.streak-badge.faded{background:var(--card);color:var(--text3);box-shadow:none}

/* Import subtitle button */
.impv-import-sub{margin-left:8px}

/* Waveform mini */
.waveform-mini{height:24px;margin-top:8px;background:var(--bg);border-radius:6px;overflow:hidden;position:relative;display:none;border:1px solid var(--border)}
.waveform-mini.show{display:block}
.waveform-mini canvas{width:100%;height:100%;display:block}
.waveform-mini .wf-playhead{position:absolute;top:0;bottom:0;width:2px;background:#a78bfa;box-shadow:0 0 4px #a78bfa;transition:left .1s linear;left:0;pointer-events:none}

/* Toast trong lib */
.lib-toast{position:fixed;top:80px;left:50%;transform:translateX(-50%) translateY(-20px);background:var(--card);border:1px solid var(--border);color:var(--text);padding:11px 20px;border-radius:11px;font-size:12.5px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.4);z-index:300;opacity:0;transition:.25s;pointer-events:none}
.lib-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.lib-toast.ok{border-color:var(--green);color:var(--green)}
.lib-toast.err{border-color:var(--rose);color:var(--rose)}

/* Auto-save indicator */
.autosave-ind{position:fixed;bottom:20px;right:20px;background:var(--card);border:1px solid var(--border);color:var(--text2);padding:7px 14px;border-radius:10px;font-size:11px;font-weight:700;z-index:100;opacity:0;transition:.3s;pointer-events:none;display:flex;align-items:center;gap:6px}
.autosave-ind.show{opacity:1}
.autosave-ind .dot{width:6px;height:6px;border-radius:50%;background:#10b981;animation:autosave-pulse 1.5s infinite}
@keyframes autosave-pulse{0%,100%{opacity:1}50%{opacity:.3}}

@media(max-width:640px){
  .lib-box{max-height:92vh;border-radius:14px}
  .lib-hd{padding:14px 16px}
  .lib-list{padding:4px 14px 16px}
  .lib-item{padding:12px 14px}
  .lib-title{font-size:13.5px;padding-right:70px}
  .save-dlg-box{padding:18px}
  .autosave-ind{bottom:12px;right:12px;font-size:10px}
}
`;

const st = document.createElement('style');
st.id = 'app11-styles';
st.textContent = CSS;
if (!document.getElementById('app11-styles')) document.head.appendChild(st);

/* ============================================================
   3. TOAST RIÊNG
   ============================================================ */
let libToastT;
function libToast(msg, type) {
  let el = $('libToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'libToast';
    el.className = 'lib-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'lib-toast ' + (type || '');
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(libToastT);
  libToastT = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ============================================================
   4. SRT / LRC / VTT PARSER
   ============================================================ */
function parseSubtitle(text, type) {
  text = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!text) return [];

  const out = [];

  // SRT / VTT
  if (type === 'srt' || type === 'vtt' || /^\d+\s*\n\d{2}:\d{2}:\d{2}/m.test(text)) {
    const blocks = text.split(/\n\s*\n/);
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines[0] === 'WEBVTT') continue;
      const timeIdx = lines.findIndex(l => /\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->/.test(l));
      if (timeIdx < 0) continue;
      // Lấy timestamp
      const tm = lines[timeIdx].match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
      let start = null, end = null;
      if (tm) {
        start = +tm[1]*3600 + +tm[2]*60 + +tm[3] + +tm[4]/1000;
        end = +tm[5]*3600 + +tm[6]*60 + +tm[7] + +tm[8]/1000;
      }
      // Nội dung chữ Hán
      const contentLines = lines.slice(timeIdx + 1);
      const hanText = contentLines
        .map(l => l.replace(/<[^>]+>/g, '').trim())
        .filter(l => /[\u4e00-\u9fa5]/.test(l))
        .join(' ')
        .trim();
      if (hanText) out.push({ start, end, zh: hanText });
    }
    return out;
  }

  // LRC
  if (type === 'lrc' || /^\[\d{2}:\d{2}[.:]\d{2,3}\]/m.test(text)) {
    const lines = text.split('\n');
    for (const line of lines) {
      const m = line.match(/^\[(\d{1,2}):(\d{2})(?:[.:](\d{2,3}))?\]\s*(.+)/);
      if (!m) continue;
      const start = +m[1]*60 + +m[2] + (m[3] ? +m[3].padEnd(3, '0')/1000 : 0);
      const zh = m[4].trim();
      if (zh && /[\u4e00-\u9fa5]/.test(zh)) out.push({ start, end: null, zh });
    }
    return out;
  }

  // Plain text
  const lines = text.split('\n').map(l => l.trim()).filter(l => /[\u4e00-\u9fa5]/.test(l));
  return lines.map(zh => ({ start: null, end: null, zh }));
}

/* ============================================================
   5. AUTO-SAVE DRAFT (mỗi 5 giây)
   ============================================================ */
const DRAFT_KEY = 'dd_impv_draft_v2';
let autoSaveTimer = null;
let autoSaveLast = '';

function startAutoSave() {
  if (autoSaveTimer) clearInterval(autoSaveTimer);
  autoSaveTimer = setInterval(() => {
    const ta = $('impvTa');
    if (!ta) return;
    const val = ta.value;
    if (val === autoSaveLast) return;
    autoSaveLast = val;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        text: val,
        mode: ST.mode,
        ts: Date.now()
      }));
      showAutoSaveIndicator();
    } catch(e) {}
  }, 5000);
}

function showAutoSaveIndicator() {
  let el = $('autosaveInd');
  if (!el) {
    el = document.createElement('div');
    el.id = 'autosaveInd';
    el.className = 'autosave-ind';
    el.innerHTML = '<span class="dot"></span> Đã tự lưu';
    document.body.appendChild(el);
  }
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 1800);
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (!d.text || d.text.length < 3) return;
    const ta = $('impvTa');
    if (!ta) return;
    // Chỉ restore nếu textarea đang rỗng
    if (ta.value && ta.value.trim().length > 0) return;
    ta.value = d.text;
    autoSaveLast = d.text;
    if (d.mode) {
      ST.mode = d.mode;
      document.querySelectorAll('#impvModeGroup button').forEach(b => {
        b.classList.toggle('on', b.dataset.mode === d.mode);
      });
    }
    // Trigger stats update
    const evt = new Event('input');
    ta.dispatchEvent(evt);
    console.log('[app11] Restored draft from', new Date(d.ts).toLocaleString('vi-VN'));
  } catch(e) {}
}

/* ============================================================
   6. STREAK
   ============================================================ */
const STREAK_KEY = 'dd_streak_v1';

function getStreak() {
  try {
    const d = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    return d;
  } catch(e) { return {}; }
}

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const s = getStreak();
  if (s.last === today) return s;
  const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (s.last === yest) s.current = (s.current || 0) + 1;
  else s.current = 1;
  s.last = today;
  s.best = Math.max(s.best || 0, s.current);
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)); } catch(e) {}
  return s;
}

function renderStreak() {
  const s = getStreak();
  const today = new Date().toISOString().slice(0, 10);
  const el = $('streakBadge');
  if (!el) return;
  if (!s.last || s.last !== today) {
    el.className = 'streak-badge faded';
    el.innerHTML = '<span class="fire">🔥</span> Bắt đầu';
  } else {
    el.className = 'streak-badge';
    el.innerHTML = '<span class="fire">🔥</span> ' + (s.current || 1) + ' ngày';
  }
  el.title = 'Chuỗi tốt nhất: ' + (s.best || 0) + ' ngày';
}

/* ============================================================
   7. WAVEFORM PREVIEW
   ============================================================ */
function decodeAudioBlob(blob) {
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

function drawWaveform(canvas, audioBuffer) {
  if (!canvas || !audioBuffer) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 10) return;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const c = canvas.getContext('2d');
  c.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  c.clearRect(0, 0, W, H);
  const data = audioBuffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / W));
  const mid = H / 2;
  c.strokeStyle = '#a78bfa';
  c.lineWidth = 1;
  c.beginPath();
  for (let x = 0; x < W; x++) {
    let min = 1, max = -1;
    const s0 = x * step;
    const s1 = Math.min(data.length, s0 + step);
    for (let i = s0; i < s1; i++) {
      const v = data[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === 1 && max === -1) { min = 0; max = 0; }
    c.moveTo(x, mid - max * mid * 0.9);
    c.lineTo(x, mid - min * mid * 0.9);
  }
  c.stroke();
}

/* ============================================================
   8. SAVE / LOAD PASSAGE
   ============================================================ */
let curPassageId = null;

function openSaveDialog() {
  if (!ST.sentences.length) {
    libToast('Chưa có câu nào để lưu', 'err');
    return;
  }
  const dlg = getSaveDialog();
  const firstZh = ST.sentences[0].zh.slice(0, 20);
  $('saveTitle').value = 'Đoạn ' + new Date().toLocaleDateString('vi-VN') + ' — ' + firstZh;
  // Auto-suggest tags
  const allZh = ST.sentences.map(s => s.zh).join('');
  const suggestions = [];
  const keywordMap = {
    '當代中文':'當代中文', 'Book':'Book', 'Lesson':'Lesson',
    '買':'shopping', '賣':'shopping', '錢':'shopping', '商店':'shopping',
    '餐廳':'food', '吃':'food', '喝':'food', '菜':'food', '飯':'food',
    '學校':'school', '老師':'school', '學生':'school', '考試':'school',
    '醫院':'health', '病':'health', '藥':'health', '醫生':'health',
    '捷運':'travel', '飛機':'travel', '火車':'travel', '旅館':'travel',
    '工作':'work', '公司':'work', '老闆':'work', '同事':'work'
  };
  for (const [kw, tag] of Object.entries(keywordMap)) {
    if (allZh.includes(kw) && !suggestions.includes(tag)) suggestions.push(tag);
  }
  const common = ['daily', 'hsk1', 'hsk2', 'hsk3', 'hội thoại', 'đọc hiểu'];
  const all = [...new Set([...suggestions, ...common])];
  $('saveTagsWrap').innerHTML = all.map(t =>
    `<div class="save-tag-chip" data-tag="${esc(t)}">#${esc(t)}</div>`
  ).join('');
  $('saveTagsWrap').onclick = e => {
    const chip = e.target.closest('.save-tag-chip');
    if (chip) chip.classList.toggle('on');
  };
  dlg.classList.add('show');
  setTimeout(() => $('saveTitle').focus(), 100);
}

function getSaveDialog() {
  let d = $('saveDlg');
  if (!d) {
    d = document.createElement('div');
    d.id = 'saveDlg';
    d.className = 'save-dlg';
    d.innerHTML = `
      <div class="save-dlg-box">
        <h3><svg style="width:18px;height:18px;stroke:#a78bfa;fill:none;stroke-width:2"><use href="#i-bookmark"/></svg> Lưu vào thư viện</h3>
        <div class="sub">Đặt tên để tìm lại sau</div>
        <label class="save-lbl">Tiêu đề</label>
        <input type="text" class="save-input" id="saveTitle" placeholder="VD: Bài 1 — Chào hỏi">
        <label class="save-lbl">Tags (tùy chọn)</label>
        <div class="save-tags-wrap" id="saveTagsWrap"></div>
        <div class="save-acts">
          <button class="save-btn cancel" id="saveCancel">Hủy</button>
          <button class="save-btn ok" id="saveOk">💾 Lưu</button>
        </div>
      </div>
    `;
    d.addEventListener('click', e => { if (e.target === d) d.classList.remove('show'); });
    document.body.appendChild(d);
    $('saveCancel').onclick = () => d.classList.remove('show');
    $('saveOk').onclick = async () => {
      const title = $('saveTitle').value.trim();
      if (!title) { libToast('Chưa đặt tiêu đề', 'err'); return; }
      const tags = [...$$('#saveTagsWrap .save-tag-chip.on')].map(c => c.dataset.tag);
      await doSavePassage(title, tags);
      d.classList.remove('show');
    };
    $('saveTitle').addEventListener('keydown', e => {
      if (e.key === 'Enter') $('saveOk').click();
    });
  }
  return d;
}

async function doSavePassage(title, tags) {
  const id = curPassageId || ('p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6));
  const item = {
    id,
    title,
    tags: tags || [],
    sentences: ST.sentences.map(s => ({ zh: s.zh, pinyin: s.pinyin, vi: s.vi || '' })),
    voice: ST.voice,
    rate: ST.rate,
    pitch: ST.pitch,
    created: curPassageId ? undefined : Date.now(),
    lastStudied: Date.now(),
    count: ST.sentences.length
  };
  if (curPassageId) {
    const old = await DB.get(curPassageId);
    if (old) item.created = old.created;
  }
  if (!item.created) item.created = Date.now();
    const isUpdate = !!curPassageId;   // ⬅️ Lưu trước khi gán
  try {
    await DB.put(item);
    curPassageId = id;
    libToast(isUpdate ? '💾 Đã cập nhật' : '💾 Đã lưu đoạn', 'ok');
    updateLibBadge();
  } catch(e) {
    console.error('[app11] Save error:', e);
    libToast('❌ Lỗi lưu', 'err');
  }
}

async function updateLibBadge() {
  try {
    const all = await DB.all();
    const b = $('libCountBadge');
    if (b) b.textContent = all.length || '';
    if (b) b.style.display = all.length > 0 ? 'flex' : 'none';
  } catch(e) {}
}

/* ============================================================
   9. OPEN LIBRARY
   ============================================================ */
let libFilterTag = null;
let libSearchQ = '';

function openLibrary() {
  const m = getLibraryModal();
  m.classList.add('show');
  renderLibrary();
}

function getLibraryModal() {
  let m = $('libModal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'libModal';
    m.className = 'lib-modal';
    m.innerHTML = `
      <div class="lib-box">
        <div class="lib-hd">
          <h3>
            <svg style="width:18px;height:18px;stroke:#a78bfa;fill:none;stroke-width:2"><use href="#i-book"/></svg>
            Thư viện đoạn văn
            <span class="cnt" id="libCount">0</span>
          </h3>
          <div class="lib-hd-acts">
            <button class="lib-hd-btn" id="libClose">✕</button>
          </div>
        </div>
        <div class="lib-search">
          <input type="text" id="libSearch" placeholder="🔍 Tìm theo tiêu đề, chữ Hán, tag...">
        </div>
        <div class="lib-tags" id="libTags"></div>
        <div class="lib-list" id="libList"></div>
      </div>
    `;
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
    document.body.appendChild(m);
    $('libClose').onclick = () => m.classList.remove('show');
    $('libSearch').addEventListener('input', e => {
      libSearchQ = e.target.value.toLowerCase().trim();
      renderLibrary();
    });
  }
  return m;
}

async function renderLibrary() {
  const list = $('libList');
  const cnt = $('libCount');
  if (!list) return;
  let items = [];
  try { items = await DB.all(); } catch(e) { console.error(e); }
  items.sort((a, b) => (b.lastStudied || b.created || 0) - (a.lastStudied || a.created || 0));

  // All tags
  const allTags = new Set();
  items.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));
  const tagsEl = $('libTags');
  if (tagsEl) {
    tagsEl.innerHTML = allTags.size
      ? '<div class="lib-tag ' + (libFilterTag === null ? 'on' : '') + '" data-tag="">Tất cả</div>' +
        [...allTags].map(t => `<div class="lib-tag ${libFilterTag === t ? 'on' : ''}" data-tag="${esc(t)}">#${esc(t)}</div>`).join('')
      : '';
    tagsEl.onclick = e => {
      const t = e.target.closest('.lib-tag');
      if (!t) return;
      libFilterTag = t.dataset.tag || null;
      renderLibrary();
    };
  }

  // Filter
  let filtered = items;
  if (libFilterTag) filtered = filtered.filter(p => (p.tags || []).includes(libFilterTag));
  if (libSearchQ) {
    filtered = filtered.filter(p => {
      const hay = (p.title + ' ' + (p.tags || []).join(' ') + ' ' + p.sentences.map(s => s.zh).join('')).toLowerCase();
      return hay.includes(libSearchQ);
    });
  }

  if (cnt) cnt.textContent = items.length;

  if (!filtered.length) {
    list.innerHTML = `
      <div class="lib-empty">
        <span class="em">📚</span>
        <h4>${items.length ? 'Không tìm thấy đoạn nào' : 'Thư viện đang trống'}</h4>
        <p>${items.length ? 'Thử bỏ filter hoặc đổi từ khóa' : 'Nhập văn bản → bấm "💾 Lưu" để lưu vào thư viện'}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(p => {
    const preview = p.sentences.slice(0, 2).map(s => s.zh).join(' ');
    const isCur = p.id === curPassageId;
    return `
      <div class="lib-item ${isCur ? 'active' : ''}" data-id="${esc(p.id)}">
        <div class="lib-title">
          ${esc(p.title)}
          ${isCur ? '<span class="ch">[đang mở]</span>' : ''}
        </div>
        <div class="lib-preview">${esc(preview)}${p.sentences.length > 2 ? '...' : ''}</div>
        <div class="lib-meta">
          <span class="m-item">📝 ${p.sentences.length} câu</span>
          <span class="m-item">🕐 ${fmtDate(p.lastStudied || p.created)}</span>
          ${(p.tags || []).slice(0, 3).map(t => `<span class="lib-item-tag">#${esc(t)}</span>`).join('')}
        </div>
        <div class="lib-item-acts">
          <button data-act="load" title="Mở"><svg><use href="#i-play"/></svg></button>
          <button data-act="export" title="Xuất"><svg><use href="#i-dl"/></svg></button>
          <button class="del" data-act="del" title="Xóa"><svg><use href="#i-trash"/></svg></button>
        </div>
      </div>
    `;
  }).join('');

  list.onclick = async e => {
    const item = e.target.closest('.lib-item');
    if (!item) return;
    const id = item.dataset.id;
    const actBtn = e.target.closest('[data-act]');
    if (actBtn) {
      e.stopPropagation();
      const act = actBtn.dataset.act;
      if (act === 'del') {
        if (!confirm('Xóa đoạn này?')) return;
        await DB.del(id);
        if (curPassageId === id) curPassageId = null;
        libToast('Đã xóa');
        renderLibrary();
        updateLibBadge();
      } else if (act === 'export') {
        await exportPassage(id);
      } else if (act === 'load') {
        await loadPassage(id);
      }
      return;
    }
    // Click nguyên item → load
    await loadPassage(id);
  };
}

async function loadPassage(id) {
  try {
    const p = await DB.get(id);
    if (!p) { libToast('Không tìm thấy', 'err'); return; }
    // Stop current audio
    if (window.impStopAudio) window.impStopAudio();
    // Update ST
    ST.sentences = p.sentences.map(s => ({ zh: s.zh, pinyin: s.pinyin || '', vi: s.vi || '' }));
    ST.currentIdx = -1;
    curPassageId = id;
    if (p.voice) ST.voice = p.voice;
    if (p.rate) ST.rate = p.rate;
    if (p.pitch !== undefined) ST.pitch = p.pitch;
    // Save to storage for resume
    try {
      localStorage.setItem('dd_impv_v31', JSON.stringify({
        sentences: ST.sentences,
        currentIdx: -1,
        voice: ST.voice, rate: ST.rate, pitch: ST.pitch,
        hideHan: ST.hideHan, hidePy: ST.hidePy, hideVi: ST.hideVi,
        toneColor: ST.toneColor,
        draft: ($('impvTa') || {}).value || ''
      }));
    } catch(e){}
    // Render
    if (window.impRenderSentences) window.impRenderSentences();
    // Switch to study view
    const impv = $('impv');
    if (impv) {
      ['input', 'loading', 'study'].forEach(n => {
        const el = $('impvSec' + n.charAt(0).toUpperCase() + n.slice(1));
        if (el) el.classList.toggle('show', n === 'study');
      });
      const player = $('impvPlayer');
      if (player) player.classList.add('show');
    }
    // Update lastStudied
    p.lastStudied = Date.now();
    await DB.put(p);
    // Close library
    const m = $('libModal');
    if (m) m.classList.remove('show');
    libToast('📂 Đã mở: ' + p.title, 'ok');
    updateStreak();
    renderStreak();
  } catch(e) {
    console.error('[app11] Load passage error:', e);
    libToast('❌ Lỗi mở đoạn', 'err');
  }
}

async function exportPassage(id) {
  try {
    const p = await DB.get(id);
    if (!p) return;
    const lines = p.sentences.map(s => {
      let line = s.zh;
      if (s.pinyin) line += ' | ' + s.pinyin;
      if (s.vi) line += '\n  → ' + s.vi;
      return line;
    }).join('\n\n');
    const content = `# ${p.title}\n\n${(p.tags||[]).map(t=>'#'+t).join(' ')}\n\n${lines}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = p.title.replace(/[^\w\u4e00-\u9fa5-]+/g, '_') + '.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    libToast('📤 Đã xuất', 'ok');
  } catch(e) {
    libToast('❌ Lỗi xuất', 'err');
  }
}

/* ============================================================
   10. IMPORT SUBTITLE FILE
   ============================================================ */
function openImportSubDialog() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.srt,.lrc,.vtt,.txt';
  input.onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const text = await f.text();
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    const type = ext === 'srt' ? 'srt' : ext === 'lrc' ? 'lrc' : ext === 'vtt' ? 'vtt' : 'txt';
    const items = parseSubtitle(text, type);
    if (!items.length) { libToast('Không đọc được câu nào', 'err'); return; }
    // Fill textarea
    const ta = $('impvTa');
    if (ta) ta.value = items.map(it => it.zh).join('\n');
    // Save draft
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        text: ta.value, mode: 'line', ts: Date.now()
      }));
      autoSaveLast = ta.value;
    } catch(e){}
    ta.dispatchEvent(new Event('input'));
    // Auto switch mode to line
    ST.mode = 'line';
    document.querySelectorAll('#impvModeGroup button').forEach(b => {
      b.classList.toggle('on', b.dataset.mode === 'line');
    });
    // Notify
    libToast('📥 Đã import ' + items.length + ' câu. Bấm "Tách câu"', 'ok');
  };
  input.click();
}

/* ============================================================
   11. INJECT UI VÀO app10
   ============================================================ */
function injectLibraryButton() {
  const acts = document.querySelector('.impv-topbar-acts');
  if (!acts || $('libOpenBtn')) return;
  const btn = document.createElement('button');
  btn.className = 'impv-iconbtn impv-lib-btn';
  btn.id = 'libOpenBtn';
  btn.title = 'Thư viện đoạn văn (L)';
  btn.style.position = 'relative';
  btn.innerHTML = '<svg style="width:16px;height:16px"><use href="#i-book"/></svg><span class="impv-lib-badge" id="libCountBadge" style="display:none"></span>';
  btn.onclick = openLibrary;
  acts.insertBefore(btn, acts.firstChild);
  updateLibBadge();
}

function injectSaveButton() {
  const acts = document.querySelector('.impv-topbar-acts');
  if (!acts || $('libSaveBtn')) return;
  const btn = document.createElement('button');
  btn.className = 'impv-iconbtn';
  btn.id = 'libSaveBtn';
  btn.title = 'Lưu đoạn vào thư viện (Cmd+S)';
  btn.innerHTML = '<svg style="width:16px;height:16px"><use href="#i-bookmark"/></svg>';
  btn.onclick = openSaveDialog;
  const libBtn = $('libOpenBtn');
  if (libBtn) acts.insertBefore(btn, libBtn.nextSibling);
  else acts.insertBefore(btn, acts.firstChild);
}

function injectImportButton() {
  const wrap = document.querySelector('.impv-input-wrap .impv-opt-row');
  if (!wrap || $('importSubBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'importSubBtn';
  btn.className = 'impv-import-sub';
  btn.style.cssText = 'background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:7px 13px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px';
  btn.innerHTML = '<svg style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5"><use href="#i-dl"/></svg> Import .srt/.lrc';
  btn.onclick = openImportSubDialog;
  wrap.appendChild(btn);
}

function injectStreakBadge() {
  const brand = document.querySelector('.impv-brand');
  if (!brand || $('streakBadge')) return;
  const el = document.createElement('div');
  el.id = 'streakBadge';
  el.className = 'streak-badge';
  brand.appendChild(el);
  renderStreak();
}

/* ============================================================
   12. WAVEFORM CHO MỖI CARD
   ============================================================ */
async function addWaveformToCard(cardEl, sentence) {
  return;  // 
  if (cardEl.querySelector('.waveform-mini')) return;
  const wf = document.createElement('div');
  wf.className = 'waveform-mini';
  wf.innerHTML = '<canvas></canvas><div class="wf-playhead"></div>';
  const head = cardEl.querySelector('.impv-card-head');
  if (head) head.after(wf);
  try {
    // Fetch TTS audio blob
    const clean = String(sentence.zh || '').trim();
    if (!clean) return;
    const url = '/api/tts?text=' + encodeURIComponent(clean) +
      '&voice=' + encodeURIComponent(ST.voice) +
      '&rate=' + ST.rate +
      '&pitch=' + ST.pitch;
    const r = await fetch(url);
    if (!r.ok) return;
    const blob = await r.blob();
    const buf = await decodeAudioBlob(blob);
    wf.classList.add('show');
    const canvas = wf.querySelector('canvas');
    setTimeout(() => drawWaveform(canvas, buf), 30);
  } catch(e) {
    wf.remove();
  }
}

// Gọi sau khi app10 render xong mỗi lần
let wfObserver = null;
function observeCards() {
  const list = $('impvListInner');
  if (!list || wfObserver) return;
  wfObserver = new MutationObserver(() => {
    setTimeout(() => {
      document.querySelectorAll('.impv-card').forEach((card, i) => {
        const s = ST.sentences[i];
        if (s && !card.querySelector('.waveform-mini')) {
          // Chỉ thêm cho card đang active để tiết kiệm
          if (card.classList.contains('active')) {
            addWaveformToCard(card, s);
          }
        }
      });
    }, 200);
  });
  wfObserver.observe(list, { childList: true, subtree: true });
}

// Thêm waveform khi card active
let lastActiveIdx = -1;
setInterval(() => {
  if (!ST || !ST.sentences || !ST.sentences.length) return;
  const idx = ST.currentIdx;
  if (idx === lastActiveIdx) return;
  lastActiveIdx = idx;
  if (idx < 0) return;
  const card = $('impv-card-' + idx);
  const s = ST.sentences[idx];
  if (card && s) addWaveformToCard(card, s);
}, 800);

/* ============================================================
   13. UPDATE ACTIVE PLAYHEAD
   ============================================================ */
setInterval(() => {
  if (!ST || !ST.currentAudio) return;
  const a = ST.currentAudio;
  const card = $('impv-card-' + ST.currentIdx);
  if (!card) return;
  const wf = card.querySelector('.waveform-mini');
  if (!wf || !wf.classList.contains('show')) return;
  const head = wf.querySelector('.wf-playhead');
  if (!head || !a.duration) return;
  const pct = (a.currentTime / a.duration) * 100;
  head.style.left = pct + '%';
}, 100);

/* ============================================================
   14. HOOKS — Ghi đè hành vi app10
   ============================================================ */
// Hook openPage để restore draft + streak + inject UI
const origOpenPage = window.impOpenPage;
if (typeof origOpenPage === 'function') {
  window.impOpenPage = function() {
    origOpenPage.apply(this, arguments);
    setTimeout(() => {
      injectLibraryButton();
      injectSaveButton();
      injectImportButton();
      injectStreakBadge();
      observeCards();
      restoreDraft();
      startAutoSave();
      updateStreak();
      renderStreak();
      // Nếu đang có passage đã load → không restore draft
      const saved = (() => {
        try {
          const raw = localStorage.getItem('impv_v31');
          return null;
        } catch(e) { return null; }
      })();
    }, 200);
  };
}

// Hook save draft khi user đóng
window.addEventListener('beforeunload', () => {
  const ta = $('impvTa');
  if (!ta) return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      text: ta.value, mode: ST.mode, ts: Date.now()
    }));
  } catch(e){}
});

// Hook updateStreak khi phát audio
setInterval(() => {
  if (ST && ST.currentAudio && !ST.currentAudio.paused) {
    const s = getStreak();
    const today = new Date().toISOString().slice(0, 10);
    if (s.last !== today) {
      updateStreak();
      renderStreak();
    }
  }
}, 30000);

/* ============================================================
   15. HOTKEYS
   ============================================================ */
document.addEventListener('keydown', e => {
  const impv = $('impv');
  if (!impv || !impv.classList.contains('show')) return;
  const tag = e.target.tagName;
  const inInput = tag === 'INPUT' || tag === 'TEXTAREA';

  // Cmd+S — Lưu đoạn
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    if (ST.sentences.length) openSaveDialog();
    return;
  }

  // L — Mở thư viện
  if (!inInput && (e.key === 'l' || e.key === 'L') && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    openLibrary();
    return;
  }

  // Esc — Đóng dialog
  if (e.key === 'Escape') {
    const d = $('saveDlg');
    const m = $('libModal');
    if (d && d.classList.contains('show')) { d.classList.remove('show'); e.stopPropagation(); }
    else if (m && m.classList.contains('show')) { m.classList.remove('show'); e.stopPropagation(); }
  }
}, true);

/* ============================================================
   16. INIT
   ============================================================ */
async function init() {
  try {
    await DB.init();
    console.log('[app11 v1.0] ✅ Passage library ready');
  } catch(e) {
    console.error('[app11] DB init error:', e);
  }
  // Nếu impv đã mở sẵn
  setTimeout(() => {
    if ($('impv') && $('impv').classList.contains('show')) {
      injectLibraryButton();
      injectSaveButton();
      injectImportButton();
      injectStreakBadge();
      observeCards();
    }
  }, 1000);
  console.log('[app11 v1.0] Loaded: Library + AutoSave + Import + Streak + Waveform');
}

window.app11OpenLibrary = openLibrary;
window.app11SavePassage = openSaveDialog;
window.app11ImportSubtitle = openImportSubDialog;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1200));
} else {
  setTimeout(init, 1200);
}

window._clearCurPassage = function() { curPassageId = null; };
})();