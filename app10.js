'use strict';
/* app10.js v3.1 — Nhập văn bản Premium + Pitch Control */
(function(){

if (!window.DD) window.DD = {};

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
const norm = s => String(s || '').replace(/[^\u4e00-\u9fa5]/g, '').trim();
const hasHan = s => /[\u4e00-\u9fa5]/.test(s);
const fmt = s => { if (!isFinite(s) || s < 0) return '0:00'; const m = Math.floor(s/60), x = Math.floor(s%60); return m + ':' + String(x).padStart(2,'0'); };
const vib = n => { try { navigator.vibrate && navigator.vibrate(n || 10); } catch(e){} };

const KEY = 'dd_impv_v31';
const DEFAULT_VOICE = 'zh-TW-HsiaoChenNeural';

const CSS = `
.impv{position:fixed;inset:0;background:var(--bg);z-index:95;display:none;flex-direction:column;overflow:hidden}
.impv.show{display:flex}
.impv-topbar{height:60px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 16px;gap:12px;flex-shrink:0}
.impv-back{width:38px;height:38px;border-radius:10px;background:var(--card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text);cursor:pointer;transition:.15s;flex-shrink:0}
.impv-back:hover{background:var(--card2);transform:translateX(-2px)}
.impv-back svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;transform:rotate(180deg)}
.impv-brand{display:flex;align-items:center;gap:12px;flex:1;min-width:0}
.impv-brand-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#8b5cf6,#6366f1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:19px;font-weight:800;box-shadow:0 4px 14px rgba(139,92,246,.35);flex-shrink:0}
.impv-brand-title{font-size:15px;font-weight:800;color:var(--text);line-height:1.2}
.impv-brand-sub{font-size:11.5px;color:var(--text3);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.impv-topbar-acts{display:flex;gap:6px;flex-shrink:0}
.impv-iconbtn{width:38px;height:38px;border-radius:10px;background:var(--card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text2);cursor:pointer;transition:.15s}
.impv-iconbtn:hover{background:var(--card2);color:var(--text)}
.impv-iconbtn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}
.impv-main{flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative}
.impv-sec{position:absolute;inset:0;display:none;flex-direction:column;animation:fadeIn .2s ease-out}
.impv-sec.show{display:flex}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.impv-input-wrap{flex:1;padding:24px 28px 0;display:flex;flex-direction:column;overflow:hidden;max-width:920px;margin:0 auto;width:100%}
.impv-lbl{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.impv-lbl-stats{font-size:11px;color:var(--text3);font-weight:500;text-transform:none;letter-spacing:0}
.impv-lbl-stats b{color:#a78bfa;font-weight:800}
.impv-ta{flex:1;width:100%;background:var(--bg2);border:1.5px solid var(--border);border-radius:14px;padding:18px 20px;color:var(--text);font-size:16px;font-family:"PingFang TC","Microsoft JhengHei",sans-serif;line-height:1.85;outline:none;resize:none;transition:.15s;min-height:120px}
.impv-ta:focus{border-color:#8b5cf6;box-shadow:0 0 0 4px rgba(139,92,246,.1)}
.impv-ta::placeholder{color:var(--text3);font-size:13.5px;font-family:inherit}
.impv-opt-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;align-items:center;padding-bottom:16px}
.impv-opt{display:flex;align-items:center;gap:3px;padding:4px;background:var(--bg2);border:1px solid var(--border);border-radius:11px}
.impv-opt button{background:transparent;border:none;color:var(--text2);padding:7px 13px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:.15s;white-space:nowrap;display:flex;align-items:center;gap:6px}
.impv-opt button:hover{background:var(--card);color:var(--text)}
.impv-opt button.on{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;box-shadow:0 2px 8px rgba(139,92,246,.3)}
.impv-opt button svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.impv-cta-row{padding:16px 28px 24px;max-width:920px;margin:0 auto;width:100%;display:flex;gap:10px}
.impv-cta{flex:1;padding:15px 20px;border-radius:12px;border:none;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:.15s;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;box-shadow:0 6px 20px rgba(139,92,246,.4)}
.impv-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(139,92,246,.5)}
.impv-cta:active{transform:translateY(0) scale(.99)}
.impv-cta:disabled{opacity:.5;cursor:not-allowed;transform:none}
.impv-cta svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.impv-cta.secondary{background:var(--card);color:var(--text);box-shadow:none;flex:0 0 auto;padding:15px 18px;border:1px solid var(--border)}
.impv-cta.secondary:hover{background:var(--card2);box-shadow:none}
.impv-loading{flex:1;display:flex;align-items:center;justify-content:center;padding:24px}
.impv-loading-card{width:min(480px,100%);background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:36px 32px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.impv-loading-icon{width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#6366f1);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 8px 24px rgba(139,92,246,.4);animation:pulse-gentle 2s ease-in-out infinite}
@keyframes pulse-gentle{0%,100%{transform:scale(1);box-shadow:0 8px 24px rgba(139,92,246,.4)}50%{transform:scale(1.06);box-shadow:0 12px 32px rgba(139,92,246,.55)}}
.impv-loading-icon svg{width:30px;height:30px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.impv-loading-title{font-size:17px;font-weight:800;color:var(--text);margin-bottom:6px}
.impv-loading-sub{font-size:12.5px;color:var(--text2);margin-bottom:22px;min-height:18px}
.impv-loading-pct{font-size:28px;font-weight:900;background:linear-gradient(135deg,#a78bfa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:6px;line-height:1}
.impv-loading-bar{height:8px;background:var(--card);border-radius:4px;overflow:hidden;margin-bottom:10px}
.impv-loading-fill{height:100%;background:linear-gradient(90deg,#8b5cf6,#6366f1);width:0;border-radius:4px;transition:width .3s ease-out;position:relative}
.impv-loading-fill::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);animation:shine 1.6s infinite}
@keyframes shine{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.impv-loading-eta{font-size:11.5px;color:var(--text3);margin-bottom:20px}
.impv-loading-cancel{padding:9px 22px;border-radius:10px;background:transparent;border:1px solid var(--border);color:var(--text2);font-size:12.5px;font-weight:600;cursor:pointer;transition:.15s}
.impv-loading-cancel:hover{background:var(--card);color:var(--text);border-color:var(--text3)}
.impv-toolbar{height:54px;background:var(--bg2);border-bottom:1px solid var(--border);padding:0 16px;display:flex;align-items:center;gap:8px;flex-shrink:0;overflow-x:auto;scrollbar-width:none}
.impv-toolbar::-webkit-scrollbar{display:none}
.impv-tgroup{display:flex;align-items:center;gap:3px;padding:3px;background:var(--bg);border:1px solid var(--border);border-radius:11px;flex-shrink:0}
.impv-tbtn{background:transparent;border:none;width:36px;height:36px;border-radius:8px;color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;transition:.15s;flex-shrink:0}
.impv-tbtn:hover{background:var(--card);color:var(--text)}
.impv-tbtn.on{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;box-shadow:0 2px 8px rgba(139,92,246,.3)}
.impv-tbtn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.impv-tbtn small{font-size:10.5px;font-weight:800;letter-spacing:.4px}
.impv-list{flex:1;overflow-y:auto;padding:20px 24px 160px;scroll-behavior:smooth;position:relative}
.impv-list::-webkit-scrollbar{width:8px}
.impv-list::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
.impv-list-inner{max-width:860px;margin:0 auto}
.impv-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px 18px 14px;margin-bottom:12px;transition:border-color .18s,background .18s,transform .15s,box-shadow .18s;position:relative;overflow:hidden}
.impv-card:hover{border-color:var(--text3);transform:translateY(-1px)}
.impv-card.active{background:linear-gradient(90deg,rgba(139,92,246,.14),rgba(139,92,246,.02));border-color:rgba(139,92,246,.45);box-shadow:0 4px 20px rgba(139,92,246,.15)}
.impv-card.active::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#8b5cf6,#6366f1);border-radius:0 4px 4px 0}
.impv-card-head{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px dashed var(--border)}
.impv-card-num{font-size:11px;font-weight:800;color:var(--text3);background:var(--bg);padding:3px 9px;border-radius:6px;border:1px solid var(--border);letter-spacing:.5px;font-family:ui-monospace,monospace}
.impv-card.active .impv-card-num{background:rgba(139,92,246,.15);color:#a78bfa;border-color:rgba(139,92,246,.35)}
.impv-card-acts{display:flex;gap:4px;margin-left:auto}
.impv-cact{width:30px;height:30px;border-radius:8px;background:var(--bg);border:1px solid var(--border);color:var(--text3);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}
.impv-cact:hover{background:var(--card);color:var(--text);transform:scale(1.08)}
.impv-cact:active{transform:scale(.95)}
.impv-cact svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.impv-cact.playing{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(139,92,246,.45);animation:pulse-gentle 1.4s ease-in-out infinite}
.impv-cact.pron{color:#06b6d4}
.impv-cact.pron:hover{background:rgba(6,182,212,.15);border-color:rgba(6,182,212,.35)}
.impv-cact.bm.on{color:var(--yellow);background:rgba(245,158,11,.15);border-color:rgba(245,158,11,.35)}
.impv-card-zh{font-size:21px;font-weight:500;line-height:1.75;color:var(--text);letter-spacing:.4px;font-family:"PingFang TC","Microsoft JhengHei",sans-serif;transition:filter .28s;word-break:break-word}
.impv-card-zh.hide{filter:blur(7px);user-select:none;pointer-events:none}
.impv-card-py{font-size:12.5px;color:var(--accent2);margin-top:8px;letter-spacing:.4px;font-family:ui-monospace,monospace;transition:filter .28s;line-height:1.55;word-break:break-word}
.impv-card-py.hide{filter:blur(5px);user-select:none}
.impv-card-vi{font-size:13px;color:var(--text2);margin-top:10px;padding-top:10px;border-top:1px dashed var(--border);font-style:italic;line-height:1.6;transition:filter .28s;min-height:20px}
.impv-card-vi.hide{filter:blur(5px);user-select:none}
.impv-card-vi.loading{color:var(--text3);font-style:normal;opacity:.7}
.impv-card-bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:transparent;overflow:hidden}
.impv-card.active .impv-card-bar{background:rgba(139,92,246,.15)}
.impv-card-bar-fill{height:100%;background:linear-gradient(90deg,#8b5cf6,#6366f1);width:0;transition:width .1s linear;border-radius:2px}
.impv-card-zh .word{cursor:pointer;padding:0 2px;border-radius:4px;transition:.12s;display:inline-block}
.impv-card-zh .word:hover{background:rgba(139,92,246,.25);color:#c4b5fd}
.impv-card-zh .word.saved{background:rgba(16,185,129,.15);color:var(--green)}
.impv-card-zh .word.tone-1{color:#ef4444}
.impv-card-zh .word.tone-2{color:#f59e0b}
.impv-card-zh .word.tone-3{color:#10b981}
.impv-card-zh .word.tone-4{color:#3b82f6}
.impv-card-zh .word.tone-5{color:#94a3b8}
.impv-empty{text-align:center;padding:80px 24px;color:var(--text3)}
.impv-empty-icon{font-size:56px;opacity:.35;margin-bottom:16px;display:block}
.impv-empty h3{font-size:15px;color:var(--text2);margin-bottom:8px;font-weight:600}
.impv-empty p{font-size:12.5px;line-height:1.7}
.impv-player{background:var(--bg2);border-top:1px solid var(--border);padding:12px 18px 16px;flex-shrink:0;display:none;flex-direction:column;gap:10px}
.impv-player.show{display:flex}
.impv-player-info{display:flex;align-items:center;gap:10px;font-size:11px;color:var(--text3);font-weight:600;justify-content:space-between}
.impv-player-info b{color:#a78bfa;font-weight:800}
.impv-player-prog{height:6px;background:var(--card);border-radius:3px;overflow:hidden;cursor:pointer;position:relative;transition:height .15s}
.impv-player-prog:hover{height:8px}
.impv-player-fill{height:100%;background:linear-gradient(90deg,#8b5cf6,#6366f1);width:0;transition:width .1s linear;border-radius:3px}
.impv-pctrl{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.impv-pgroup{display:flex;align-items:center;gap:6px}
.impv-pgroup.center{flex:1;justify-content:center;min-width:0}
.impv-pgroup.right{justify-content:flex-end}
.impv-btn{background:var(--card);border:1px solid var(--border);width:38px;height:38px;border-radius:10px;color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;font-size:13px;font-weight:800;flex-shrink:0}
.impv-btn:hover{background:var(--card2);color:var(--text);transform:translateY(-1px)}
.impv-btn:active{transform:translateY(0) scale(.96)}
.impv-btn.on{background:rgba(139,92,246,.2);color:#a78bfa;border-color:rgba(139,92,246,.4)}
.impv-btn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.impv-btn.main{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;box-shadow:0 6px 20px rgba(139,92,246,.45)}
.impv-btn.main:hover{transform:scale(1.06);background:linear-gradient(135deg,#7c3aed,#4f46e5)}
.impv-btn.main svg{width:20px;height:20px;stroke-width:2.5}
.impv-btn.main .ic-play{fill:currentColor;stroke:none;margin-left:2px}
.impv-speed{padding:7px 11px;border-radius:9px;background:var(--card);border:1px solid var(--border);color:var(--text);font-size:11.5px;font-weight:700;cursor:pointer;outline:none;font-family:inherit}
.impv-speed:hover{background:var(--card2)}
.impv-pop{position:fixed;top:70px;right:16px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;min-width:320px;max-width:calc(100vw - 32px);max-height:calc(100vh - 90px);overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.6);z-index:150;display:none;animation:popIn .18s ease-out}
.impv-pop.show{display:block}
@keyframes popIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.impv-pop-title{font-size:12.5px;font-weight:800;color:var(--text);margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px}
.impv-pop-title svg{width:15px;height:15px;stroke:#a78bfa;fill:none;stroke-width:2;stroke-linecap:round}
.impv-pop-label{font-size:10.5px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;display:block}
.impv-pop-select{width:100%;padding:9px 12px;border-radius:9px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-size:12.5px;font-weight:600;outline:none;cursor:pointer;margin-bottom:14px;font-family:inherit;transition:.15s}
.impv-pop-select:hover{background:var(--bg2)}
.impv-pop-select:focus{border-color:#8b5cf6}
.impv-pop-row{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
.impv-pop-row button{flex:1;min-width:44px;padding:8px 4px;border-radius:8px;background:var(--bg);border:1px solid var(--border);color:var(--text2);font-size:11.5px;font-weight:700;cursor:pointer;transition:.15s}
.impv-pop-row button:hover{background:var(--card2);color:var(--text)}
.impv-pop-row button.on{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border-color:transparent}
.impv-toast{position:fixed;top:80px;left:50%;transform:translateX(-50%) translateY(-20px);background:var(--card);border:1px solid var(--border);color:var(--text);padding:11px 20px;border-radius:11px;font-size:12.5px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.4);z-index:200;opacity:0;transition:.25s;pointer-events:none;max-width:90vw;text-align:center}
.impv-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.impv-toast.ok{border-color:var(--green);color:var(--green)}
.impv-toast.err{border-color:var(--rose);color:var(--rose)}
@media(max-width:780px){
  .impv-topbar{height:56px;padding:0 12px;gap:8px}
  .impv-brand-icon{width:36px;height:36px;font-size:17px;border-radius:10px}
  .impv-brand-title{font-size:14px}
  .impv-brand-sub{font-size:10.5px}
  .impv-iconbtn{width:34px;height:34px}
  .impv-input-wrap{padding:16px 14px 0}
  .impv-ta{font-size:15px;padding:14px 16px;border-radius:12px}
  .impv-opt{padding:3px}
  .impv-opt button{padding:6px 10px;font-size:11.5px}
  .impv-cta-row{padding:12px 14px 16px}
  .impv-cta{padding:13px 16px;font-size:13px}
  .impv-cta.secondary{padding:13px 14px}
  .impv-list{padding:14px 12px 200px}
  .impv-card{padding:14px 14px 12px;border-radius:12px}
  .impv-card-zh{font-size:18px}
  .impv-card-py{font-size:11.5px}
  .impv-card-vi{font-size:12px}
  .impv-card-acts{gap:3px}
  .impv-cact{width:28px;height:28px}
  .impv-toolbar{padding:0 12px;height:50px}
  .impv-tbtn{width:34px;height:34px}
  .impv-tbtn small{font-size:10px}
  .impv-player{padding:10px 12px 14px;gap:8px}
  .impv-btn{width:36px;height:36px}
  .impv-btn.main{width:46px;height:46px}
  .impv-pop{right:8px;left:8px;top:62px;min-width:auto;max-height:75vh}
  .impv-loading-card{padding:28px 24px}
  .impv-loading-icon{width:60px;height:60px}
  .impv-loading-pct{font-size:24px}
}
`;

const st = document.createElement('style');
st.id = 'impv-styles';
st.textContent = CSS;
if (!document.getElementById('impv-styles')) document.head.appendChild(st);

const ST = {
  sentences: [],
  currentIdx: -1,
  mode: 'auto',
  playing: false,
  currentAudio: null,
  playingBtnEl: null,
  autoPause: false,
  autoPausedFor: -1,
  repeat: false,
  repeatCount: 3,
  repeatCurrent: 0,
  loopA: null,
  loopB: null,
  playlist: false,
  hideHan: false,
  hidePy: false,
  hideVi: false,
  dictation: false,
  toneColor: false,
  voice: localStorage.getItem('dd_tts_voice') || DEFAULT_VOICE,
  rate: parseFloat(localStorage.getItem('dd_tts_rate') || '1.0'),
  pitch: parseFloat(localStorage.getItem('dd_tts_pitch') || '0'),
  processing: false,
  procAbort: null,
  audioCache: {},
  shadowRec: null,
  shadowChunks: [],
  shadowUrl: null,
  savedSet: new Set()
};

let toastT;
function itoast(msg, type) {
  const el = $('impvToast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'impv-toast ' + (type || '');
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2400);
}

function buildHTML() {
  if ($('impv')) return;

  const html = `
  <div class="impv" id="impv">
    <header class="impv-topbar">
      <button class="impv-back" id="impvBack" title="Quay lại (Esc)"><svg><use href="#i-chev"/></svg></button>
      <div class="impv-brand">
        <div class="impv-brand-icon">文</div>
        <div style="min-width:0">
          <div class="impv-brand-title">Nhập văn bản</div>
          <div class="impv-brand-sub" id="impvBrandSub">Chưa có nội dung</div>
        </div>
      </div>
      <div class="impv-topbar-acts">
        <button class="impv-iconbtn" id="impvPopBtn" title="Cài đặt (S)"><svg><use href="#i-cog"/></svg></button>
        <button class="impv-iconbtn" id="impvClearBtn" title="Xóa hết"><svg><use href="#i-trash"/></svg></button>
      </div>
    </header>
    <main class="impv-main">
      <section class="impv-sec" id="impvSecInput">
        <div class="impv-input-wrap">
          <div class="impv-lbl">
            <span>Văn bản tiếng Trung</span>
            <span class="impv-lbl-stats" id="impvStats">0 ký tự · <b>0</b> câu</span>
          </div>
          <textarea class="impv-ta" id="impvTa" placeholder="Dán đoạn văn, hội thoại, bài đọc vào đây...&#10;&#10;💡 Ctrl+Enter để tách nhanh"></textarea>
          <div class="impv-opt-row">
            <div class="impv-opt" id="impvModeGroup">
              <button data-mode="auto" class="on">🤖 Tự động</button>
              <button data-mode="line">📄 Mỗi dòng</button>
              <button data-mode="paragraph">📖 Theo đoạn</button>
            </div>
          </div>
        </div>
        <div class="impv-cta-row">
          <button class="impv-cta secondary" id="impvSampleBtn" title="Chèn mẫu"><svg><use href="#i-file"/></svg></button>
          <button class="impv-cta" id="impvProcessBtn"><svg><use href="#i-lightning"/></svg> Tách câu + Pinyin + Dịch</button>
        </div>
      </section>
      <section class="impv-sec" id="impvSecLoading">
        <div class="impv-loading">
          <div class="impv-loading-card">
            <div class="impv-loading-icon"><svg><use href="#i-lightning"/></svg></div>
            <div class="impv-loading-title">Đang xử lý...</div>
            <div class="impv-loading-sub" id="impvLoadSub">Chuẩn bị...</div>
            <div class="impv-loading-pct" id="impvLoadPct">0%</div>
            <div class="impv-loading-bar"><div class="impv-loading-fill" id="impvLoadFill"></div></div>
            <div class="impv-loading-eta" id="impvLoadEta">Vui lòng đợi...</div>
            <button class="impv-loading-cancel" id="impvCancelBtn">Hủy</button>
          </div>
        </div>
      </section>
      <section class="impv-sec" id="impvSecStudy">
        <div class="impv-toolbar">
          <div class="impv-tgroup">
            <button class="impv-tbtn" id="impvTHan" title="Ẩn/Hiện chữ Hán"><svg><use href="#i-eye"/></svg></button>
            <button class="impv-tbtn" id="impvTPy" title="Ẩn/Hiện Pinyin"><small>PY</small></button>
            <button class="impv-tbtn" id="impvTVi" title="Ẩn/Hiện tiếng Việt"><small>VI</small></button>
            <button class="impv-tbtn" id="impvTTone" title="Tô màu thanh điệu (T)"><svg><use href="#i-sun"/></svg></button>
          </div>
          <div class="impv-tgroup">
            <button class="impv-tbtn" id="impvTRepeat" title="Lặp câu (R)"><svg><use href="#i-repeat"/></svg></button>
            <button class="impv-tbtn" id="impvTAuto" title="Tự dừng sau mỗi câu"><svg><use href="#i-pause"/></svg></button>
            <button class="impv-tbtn" id="impvTPlaylist" title="Phát liên tục cả bài"><svg><use href="#i-list"/></svg></button>
            <button class="impv-tbtn" id="impvTDict" title="Chép chính tả (D)"><svg><use href="#i-keyboard"/></svg></button>
          </div>
          <div class="impv-tgroup">
            <button class="impv-tbtn" id="impvTSearch" title="Tìm trong bài"><svg><use href="#i-search"/></svg></button>
            <button class="impv-tbtn" id="impvTExport" title="Xuất file"><svg><use href="#i-dl"/></svg></button>
            <button class="impv-tbtn" id="impvTBack" title="Nhập lại"><svg><use href="#i-pencil"/></svg></button>
          </div>
        </div>
        <div class="impv-list" id="impvList"><div class="impv-list-inner" id="impvListInner"></div></div>
        <div class="impv-player" id="impvPlayer">
          <div class="impv-player-info">
            <span id="impvPlayerCur">0:00</span>
            <span>Đang phát <b id="impvPlayerNum">1</b> / <span id="impvPlayerTotal">0</span></span>
            <span id="impvPlayerDur">0:00</span>
          </div>
          <div class="impv-player-prog" id="impvPlayerProg"><div class="impv-player-fill" id="impvPlayerFill"></div></div>
          <div class="impv-pctrl">
            <div class="impv-pgroup">
              <button class="impv-btn" id="impvBtnA" title="Đặt A">A</button>
              <button class="impv-btn" id="impvBtnB" title="Đặt B">B</button>
              <button class="impv-btn" id="impvBtnClearAB" title="Xóa A-B" style="display:none"><svg><use href="#i-close"/></svg></button>
              <button class="impv-btn" id="impvBtnShadow" title="Ghi âm shadowing"><svg><use href="#i-mic"/></svg></button>
            </div>
            <div class="impv-pgroup center">
              <button class="impv-btn" id="impvBtnPrev" title="Câu trước (←)"><svg><use href="#i-prev"/></svg></button>
              <button class="impv-btn main" id="impvBtnPlay" title="Phát / Tạm dừng (Space)"><svg id="impvPlayIcon" class="ic-play"><use href="#i-play"/></svg></button>
              <button class="impv-btn" id="impvBtnNext" title="Câu kế (→)"><svg><use href="#i-next"/></svg></button>
            </div>
            <div class="impv-pgroup right">
              <select class="impv-speed" id="impvSpeedSelect">
                <option value="0.7">0.7×</option>
                <option value="0.85">0.85×</option>
                <option value="1" selected>1.0×</option>
                <option value="1.15">1.15×</option>
                <option value="1.3">1.3×</option>
              </select>
            </div>
          </div>
        </div>
      </section>
    </main>
    <div class="impv-pop" id="impvPop">
      <div class="impv-pop-title"><svg><use href="#i-cog"/></svg> Cài đặt giọng đọc</div>
      <label class="impv-pop-label">Giọng (Edge TTS)</label>
      <select class="impv-pop-select" id="impvVoiceSel"><option>Đang tải...</option></select>
      <label class="impv-pop-label">Tốc độ đọc</label>
      <div class="impv-pop-row" id="impvRateGroup">
        <button data-rate="0.85">0.85×</button>
        <button data-rate="0.9">0.9×</button>
        <button data-rate="0.95">0.95×</button>
        <button data-rate="1" class="on">1.0×</button>
        <button data-rate="1.1">1.1×</button>
      </div>
      <label class="impv-pop-label">Cao độ giọng</label>
      <div class="impv-pop-row" id="impvPitchGroup">
        <button data-pitch="-4">-4Hz</button>
        <button data-pitch="-2">-2Hz</button>
        <button data-pitch="0" class="on">0Hz</button>
        <button data-pitch="2">+2Hz</button>
        <button data-pitch="4">+4Hz</button>
      </div>
      <label class="impv-pop-label">Số lần lặp câu</label>
      <div class="impv-pop-row" id="impvRepeatGroup">
        <button data-rep="2">2</button>
        <button data-rep="3" class="on">3</button>
        <button data-rep="5">5</button>
        <button data-rep="10">10</button>
      </div>
    </div>
    <div class="impv-toast" id="impvToast"></div>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function splitText(text, mode) {
  text = String(text || '').trim();
  if (!text) return [];
  if (mode === 'line') return text.split(/\n/).map(l => l.trim()).filter(l => l && hasHan(l));
  if (mode === 'paragraph') return text.split(/\n\s*\n/).map(p => p.replace(/\n/g, ' ').trim()).filter(p => p && hasHan(p));
  const nrm = text.replace(/\r\n/g, '\n').replace(/([。！？!?])/g, '$1||S||').replace(/\n+/g, '||S||');
  const parts = nrm.split('||S||').map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    const n = (p.match(/[\u4e00-\u9fa5]/g) || []).length;
    if (n === 0) continue;
    if (n < 3 && out.length) out[out.length - 1] += p;
    else out.push(p);
  }
  return out.filter(hasHan);
}

function getPy(text) {
  if (typeof window.py === 'function') { try { return window.py(text) || ''; } catch(e){} }
  if (window.pinyinPro) { try { return window.pinyinPro.pinyin(norm(text), { toneType:'symbol', type:'string', nonZh:'removed' }) || ''; } catch(e){} }
  return '';
}

async function translateOne(text, signal) {
  const clean = norm(text);
  if (!clean) return '';
  const key = 'dd_tc_impv_' + clean.slice(0, 30);
  const cached = localStorage.getItem(key);
  if (cached) return cached;
  try {
    const r = await fetch('/api/translate?q=' + encodeURIComponent(clean), { signal });
    if (!r.ok) return '';
    const d = await r.json();
    if (d.text) {
      try { localStorage.setItem(key, d.text); } catch(e){}
      return d.text;
    }
  } catch(e){}
  return '';
}

async function translateAll(sentences, onProgress, signal) {
  const CONCURRENT = 4;
  const total = sentences.length;
  let done = 0;
  const queue = sentences.map((s, i) => ({ s, i }));
  async function worker() {
    while (queue.length) {
      if (signal && signal.aborted) break;
      const job = queue.shift();
      if (!job) break;
      try {
        const vi = await translateOne(job.s.zh, signal);
        job.s.vi = vi || '';
      } catch(e) { job.s.vi = ''; }
      done++;
      onProgress(done, total);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENT }, worker));
}

async function fetchTTS(text) {
  const clean = String(text || '').trim();
  if (!clean) return null;
  const key = ST.voice + '|' + ST.rate + '|' + ST.pitch + '|' + clean;
  if (ST.audioCache[key]) return ST.audioCache[key];
  try {
    const url = '/api/tts?text=' + encodeURIComponent(clean) +
      '&voice=' + encodeURIComponent(ST.voice) +
      '&rate=' + ST.rate +
      '&pitch=' + ST.pitch;
    const r = await fetch(url);
    if (!r.ok) throw new Error('TTS ' + r.status);
    const blob = await r.blob();
    if (blob.size < 100) throw new Error('Empty');
    const u = URL.createObjectURL(blob);
    ST.audioCache[key] = u;
    const keys = Object.keys(ST.audioCache);
    if (keys.length > 80) {
      for (let i = 0; i < 20; i++) {
        try { URL.revokeObjectURL(ST.audioCache[keys[i]]); } catch(e){}
        delete ST.audioCache[keys[i]];
      }
    }
    return u;
  } catch(e) {
    console.warn('[app10] TTS error:', e);
    return null;
  }
}

function stopAudio() {
  if (ST.currentAudio) {
    try { ST.currentAudio.pause(); ST.currentAudio.currentTime = 0; } catch(e){}
    ST.currentAudio = null;
  }
  if (ST.playingBtnEl) {
    try { ST.playingBtnEl.classList.remove('playing'); } catch(e){}
    ST.playingBtnEl = null;
  }
  ST.playing = false;
  updatePlayIcon();
}

function updatePlayIcon() {
  const ic = $('impvPlayIcon');
  if (!ic) return;
  ic.innerHTML = ST.playing ? '<use href="#i-pause"/>' : '<use href="#i-play"/>';
  if (!ST.playing) ic.setAttribute('class', 'ic-play');
  else ic.removeAttribute('class');
}

async function playSentence(idx, opts) {
  if (idx < 0 || idx >= ST.sentences.length) return;
  const s = ST.sentences[idx];
  stopAudio();
  ST.currentIdx = idx;
  ST.playing = true;
  ST.repeatCurrent = 0;
  ST.autoPausedFor = -1;
  const btn = opts && opts.btn ? opts.btn : null;
  if (btn) { btn.classList.add('playing'); ST.playingBtnEl = btn; }
  setActiveCard(idx);
  const url = await fetchTTS(s.zh);
  if (!url) {
    if (btn) btn.classList.remove('playing');
    ST.playingBtnEl = null;
    ST.playing = false;
    updatePlayIcon();
    itoast('❌ Không tạo được audio', 'err');
    return;
  }
  const a = new Audio(url);
  a.playbackRate = 1;
  ST.currentAudio = a;
  updatePlayIcon();
  a.onloadedmetadata = () => { const d = $('impvPlayerDur'); if (d) d.textContent = fmt(a.duration); };
  a.ontimeupdate = () => {
    const cur = a.currentTime;
    const dur = a.duration || 0;
    const fill = $('impvPlayerFill');
    const curEl = $('impvPlayerCur');
    const cardBar = document.querySelector('#impv-card-' + idx + ' .impv-card-bar-fill');
    if (curEl) curEl.textContent = fmt(cur);
    if (fill && dur > 0) fill.style.width = ((cur / dur) * 100) + '%';
    if (cardBar && dur > 0) cardBar.style.width = ((cur / dur) * 100) + '%';
    if (ST.loopA !== null && ST.loopB !== null && cur >= ST.loopB) { a.currentTime = ST.loopA; return; }
    if (ST.repeat && ST.repeatCount > 1 && dur > 0) {
      if (cur >= dur - 0.1) {
        ST.repeatCurrent++;
        if (ST.repeatCurrent < ST.repeatCount) { a.currentTime = 0; a.play(); }
        else { ST.repeatCurrent = 0; ST.repeat = false; updateToolbarStates(); handleEnded(); }
      }
      return;
    }
    if (ST.autoPause && ST.autoPausedFor !== idx && dur > 0 && cur >= dur - 0.15) {
      a.pause(); ST.autoPausedFor = idx; ST.playing = false; updatePlayIcon();
    }
  };
  a.onended = () => {
    if (btn) btn.classList.remove('playing');
    if (ST.playingBtnEl === btn) ST.playingBtnEl = null;
    handleEnded();
  };
  a.onerror = () => {
    if (btn) btn.classList.remove('playing');
    ST.playingBtnEl = null;
    ST.playing = false;
    updatePlayIcon();
  };
  try { await a.play(); }
  catch(e) {
    if (btn) btn.classList.remove('playing');
    ST.playingBtnEl = null;
    ST.playing = false;
    updatePlayIcon();
    if (e.name === 'NotAllowedError') itoast('⚠️ Bấm vào trang trước rồi thử lại', 'err');
  }
}

function handleEnded() {
  ST.playing = false;
  updatePlayIcon();
  const cur = ST.currentIdx;
  ST.currentAudio = null;
  if (ST.playlist && cur >= 0 && cur < ST.sentences.length - 1) {
    setTimeout(() => playSentence(cur + 1), 80);
    return;
  }
}

function setActiveCard(idx) {
  document.querySelectorAll('.impv-card').forEach(el => {
    const i = parseInt(el.dataset.idx);
    el.classList.toggle('active', i === idx);
    if (i !== idx) { const bar = el.querySelector('.impv-card-bar-fill'); if (bar) bar.style.width = '0'; }
  });
  const numEl = $('impvPlayerNum');
  if (numEl && idx >= 0) numEl.textContent = idx + 1;
  if (idx >= 0) { const el = $('impv-card-' + idx); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}

function getTone(ch) {
  if (!window.pinyinPro) return 5;
  try {
    const py = window.pinyinPro.pinyin(ch, { toneType: 'num', type: 'string', nonZh: 'removed' });
    const m = py.match(/[1-5]/);
    return m ? parseInt(m[0]) : 5;
  } catch(e) { return 5; }
}

function renderZh(zh) {
  let segs;
  try {
    if (window.Intl && Intl.Segmenter) {
      const seg = new Intl.Segmenter('zh-Hans', { granularity: 'word' });
      segs = [...seg.segment(zh)].map(x => x.segment);
    } else { segs = [...zh]; }
  } catch(e) { segs = [...zh]; }
  return segs.map(s => {
    if (/[\u4e00-\u9fa5]/.test(s)) {
      const saved = ST.savedSet.has(s) ? 'saved' : '';
      const tone = ST.toneColor ? ' tone-' + getTone(s) : '';
      return '<span class="word ' + saved + tone + '" data-word="' + esc(s) + '">' + esc(s) + '</span>';
    }
    return esc(s);
  }).join('');
}

function renderList() {
  const list = $('impvListInner');
  if (!list) return;
  if (!ST.sentences.length) {
    list.innerHTML = `<div class="impv-empty"><span class="impv-empty-icon">📝</span><h3>Chưa có câu nào</h3><p>Quay lại nhập văn bản để bắt đầu</p></div>`;
    return;
  }
  ST.savedSet = new Set((window.DD.saved || []).map(v => norm(v.zh)));
  list.innerHTML = ST.sentences.map((s, i) => {
    const isActive = i === ST.currentIdx;
    const zhHtml = renderZh(s.zh);
    return `
    <div class="impv-card ${isActive ? 'active' : ''}" id="impv-card-${i}" data-idx="${i}">
      <div class="impv-card-head">
        <span class="impv-card-num">${String(i + 1).padStart(2, '0')} / ${String(ST.sentences.length).padStart(2, '0')}</span>
        <div class="impv-card-acts">
          <button class="impv-cact" data-act="tts" data-idx="${i}" title="Nghe"><svg><use href="#i-vol"/></svg></button>
          <button class="impv-cact pron" data-act="pron" data-idx="${i}" title="Check phát âm (P)"><svg><use href="#i-target"/></svg></button>
          <button class="impv-cact bm" data-act="bm" data-idx="${i}" title="Lưu vào kho câu"><svg><use href="#i-bookmark"/></svg></button>
        </div>
      </div>
      <div class="impv-card-zh ${ST.hideHan || ST.dictation ? 'hide' : ''}">${zhHtml}</div>
      ${s.pinyin ? `<div class="impv-card-py ${ST.hidePy ? 'hide' : ''}">${esc(s.pinyin)}</div>` : ''}
      <div class="impv-card-vi ${ST.hideVi ? 'hide' : ''} ${s.vi ? '' : 'loading'}">${esc(s.vi || '(chưa dịch)')}</div>
      <div class="impv-card-bar"><div class="impv-card-bar-fill"></div></div>
    </div>`;
  }).join('');
  const total = $('impvPlayerTotal');
  if (total) total.textContent = ST.sentences.length;
  updateToolbarStates();
  const sub = $('impvBrandSub');
  if (sub) sub.textContent = ST.sentences.length + ' câu đã sẵn sàng';
}

function updateToolbarStates() {
  const setOn = (id, val) => { const e = $(id); if (e) e.classList.toggle('on', val); };
  setOn('impvTHan', ST.hideHan);
  setOn('impvTPy', ST.hidePy);
  setOn('impvTVi', ST.hideVi);
  setOn('impvTTone', ST.toneColor);
  setOn('impvTRepeat', ST.repeat);
  setOn('impvTAuto', ST.autoPause);
  setOn('impvTPlaylist', ST.playlist);
  setOn('impvTDict', ST.dictation);
  const ab = $('impvBtnClearAB');
  if (ab) ab.style.display = (ST.loopA !== null || ST.loopB !== null) ? 'flex' : 'none';
  const btnA = $('impvBtnA'); if (btnA) btnA.classList.toggle('on', ST.loopA !== null);
  const btnB = $('impvBtnB'); if (btnB) btnB.classList.toggle('on', ST.loopB !== null);
}

function updateStats() {
  const ta = $('impvTa');
  const st = $('impvStats');
  if (!ta || !st) return;
  const txt = ta.value;
  const chars = txt.length;
  const sentences = splitText(txt, ST.mode).length;
  st.innerHTML = `${chars} ký tự · <b>${sentences}</b> câu`;
}

function switchSection(name) {
  ['input', 'loading', 'study'].forEach(n => {
    const el = $('impvSec' + n.charAt(0).toUpperCase() + n.slice(1));
    if (el) el.classList.toggle('show', n === name);
  });
  if (name === 'study') { const p = $('impvPlayer'); if (p) p.classList.add('show'); }
}

function saveState() {
  try {
    const data = {
      sentences: ST.sentences,
      currentIdx: ST.currentIdx,
      voice: ST.voice, rate: ST.rate, pitch: ST.pitch,
      hideHan: ST.hideHan, hidePy: ST.hidePy, hideVi: ST.hideVi,
      toneColor: ST.toneColor,
      draft: ($('impvTa') || {}).value || ''
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch(e){}
}

function loadSavedState() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
  catch(e) { return null; }
}

async function process() {
  if (ST.processing) return;
  const ta = $('impvTa');
  const text = (ta && ta.value || '').trim();
  if (!text) { itoast('Chưa có văn bản', 'err'); return; }
  const lines = splitText(text, ST.mode);
  if (!lines.length) { itoast('Không tách được câu nào có chữ Hán', 'err'); return; }
  ST.processing = true;
  ST.procAbort = new AbortController();
  ST.sentences = lines.map(zh => ({ zh, pinyin: getPy(zh), vi: '' }));
  ST.currentIdx = -1;
  saveState();
  switchSection('loading');
  updateLoadUI(10, 'Đang sinh Pinyin...', 'Chuẩn bị dịch ' + lines.length + ' câu');
  await new Promise(r => setTimeout(r, 200));
  updateLoadUI(15, 'Đang dịch sang tiếng Việt...', '0 / ' + lines.length);
  const t0 = Date.now();
  const total = ST.sentences.length;
  let cancelled = false;
  try {
    await translateAll(
      ST.sentences,
      (done, tot) => {
        const pct = 15 + Math.round((done / tot) * 85);
        const elapsed = (Date.now() - t0) / 1000;
        const rate = done / Math.max(elapsed, 0.1);
        const eta = rate > 0 ? Math.ceil((tot - done) / rate) : 0;
        const etaText = done >= tot ? 'Sắp xong...' : (eta > 0 ? `Còn ~${eta}s` : 'Đang xử lý...');
        updateLoadUI(pct, 'Đang dịch ' + done + ' / ' + tot + ' câu', etaText);
      },
      ST.procAbort.signal
    );
  } catch(e) { if (e.name === 'AbortError') cancelled = true; }
  if (cancelled) {
    ST.processing = false;
    ST.procAbort = null;
    itoast('Đã hủy');
    switchSection('input');
    return;
  }
  updateLoadUI(100, '✅ Hoàn tất!', 'Đang chuẩn bị...');
  await new Promise(r => setTimeout(r, 500));
  ST.processing = false;
  ST.procAbort = null;
  saveState();
  renderList();
  switchSection('study');
  itoast('✅ Đã tách ' + total + ' câu', 'ok');
  vib(20);
}

function updateLoadUI(pct, sub, eta) {
  const fill = $('impvLoadFill');
  const pctEl = $('impvLoadPct');
  const subEl = $('impvLoadSub');
  const etaEl = $('impvLoadEta');
  if (fill) fill.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (subEl) subEl.textContent = sub;
  if (etaEl) etaEl.textContent = eta;
}

function openPage() {
  buildHTML();
  const impv = $('impv');
  if (!impv) return;
  impv.classList.add('show');
  const saved = loadSavedState();
  if (saved) {
    ST.voice = saved.voice || ST.voice;
    ST.rate = saved.rate || ST.rate;
    ST.pitch = saved.pitch !== undefined ? saved.pitch : ST.pitch;
    ST.hideHan = !!saved.hideHan;
    ST.hidePy = !!saved.hidePy;
    ST.hideVi = !!saved.hideVi;
    ST.toneColor = !!saved.toneColor;
    ST.sentences = saved.sentences || [];
    ST.currentIdx = saved.currentIdx ?? -1;
    if (saved.draft && $('impvTa')) $('impvTa').value = saved.draft;
  }
  if (ST.sentences.length) {
    renderList();
    switchSection('study');
    setActiveCard(ST.currentIdx);
  } else {
    switchSection('input');
    updateStats();
  }
  refreshVoiceDropdown();
  updateRateButtons();
  updatePitchButtons();
  updateRepeatButtons();
  saveState();
  vib(10);
}

function closePage() {
  stopAudio();
  saveState();
  const impv = $('impv');
  if (impv) impv.classList.remove('show');
  const pop = $('impvPop');
  if (pop) pop.classList.remove('show');
}

async function refreshVoiceDropdown() {
  const sel = $('impvVoiceSel');
  if (!sel) return;
  try {
    const r = await fetch('/api/tts/voices');
    if (!r.ok) throw new Error();
    const d = await r.json();
    const vs = d.voices || [];
    if (!vs.length) throw new Error();
    sel.innerHTML = vs.map(v => {
      const p = v.quality === 'best' ? '⭐ ' : v.quality === 'good' ? '✅ ' : '▪ ';
      return `<option value="${esc(v.id)}">${p}${esc(v.name)}</option>`;
    }).join('');
    if (vs.find(v => v.id === ST.voice)) sel.value = ST.voice;
    else { ST.voice = vs[0].id; sel.value = ST.voice; }
    sel.onchange = () => {
      ST.voice = sel.value;
      localStorage.setItem('dd_tts_voice', ST.voice);
      itoast('🎙️ Đổi giọng', 'ok');
      saveState();
    };
  } catch(e) {
    sel.innerHTML = '<option>❌ Server TTS chưa chạy</option>';
  }
}

function updateRateButtons() {
  document.querySelectorAll('#impvRateGroup button').forEach(b => {
    b.classList.toggle('on', parseFloat(b.dataset.rate) === ST.rate);
  });
}

function updatePitchButtons() {
  document.querySelectorAll('#impvPitchGroup button').forEach(b => {
    b.classList.toggle('on', parseFloat(b.dataset.pitch) === ST.pitch);
  });
}

function updateRepeatButtons() {
  document.querySelectorAll('#impvRepeatGroup button').forEach(b => {
    b.classList.toggle('on', parseInt(b.dataset.rep) === ST.repeatCount);
  });
}

function searchInList() {
  const q = prompt('Tìm trong bài (chữ Hán / Pinyin / tiếng Việt):');
  if (q === null) return;
  const ql = q.trim().toLowerCase();
  let n = 0;
  document.querySelectorAll('.impv-card').forEach(el => {
    const i = parseInt(el.dataset.idx);
    const s = ST.sentences[i];
    if (!s) return;
    if (!ql) { el.style.opacity = '1'; return; }
    const hay = (s.zh + ' ' + (s.pinyin || '') + ' ' + (s.vi || '')).toLowerCase();
    const ok = hay.includes(ql);
    el.style.opacity = ok ? '1' : '0.2';
    if (ok && !n) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (ok) n++;
  });
  itoast(ql ? `Tìm thấy ${n} câu` : 'Đã reset', n ? 'ok' : '');
}

function exportFile() {
  if (!ST.sentences.length) { itoast('Chưa có dữ liệu', 'err'); return; }
  const choice = prompt('Chọn định dạng:\n1. SRT\n2. LRC\n3. TXT\n4. CSV\n\nNhập 1-4:');
  if (!choice) return;
  const n = parseInt(choice);
  if (n < 1 || n > 4) { itoast('Chọn 1-4', 'err'); return; }
  let content = '', name = 'import-' + Date.now(), mime = 'text/plain;charset=utf-8';
  const q = v => '"' + String(v || '').replace(/"/g, '""') + '"';
  if (n === 1) {
    let t = 0;
    content = ST.sentences.map((s, i) => {
      const st2 = t, en = t + 3.5; t = en + 0.3;
      const pad = x => String(x).padStart(2, '0');
      const ms = x => String(Math.floor((x % 1) * 1000)).padStart(3, '0');
      return (i + 1) + '\n' +
        pad(Math.floor(st2/3600)) + ':' + pad(Math.floor((st2%3600)/60)) + ':' + pad(Math.floor(st2%60)) + ',' + ms(st2) +
        ' --> ' +
        pad(Math.floor(en/3600)) + ':' + pad(Math.floor((en%3600)/60)) + ':' + pad(Math.floor(en%60)) + ',' + ms(en) +
        '\n' + s.zh + '\n';
    }).join('\n');
    name += '.srt';
  } else if (n === 2) {
    let t = 0;
    content = ST.sentences.map(s => {
      const m = Math.floor(t/60), sec = (t%60).toFixed(2).padStart(5, '0');
      const line = `[${String(m).padStart(2,'0')}:${sec}]${s.zh}`;
      t += 3.5;
      return line;
    }).join('\n');
    name += '.lrc';
  } else if (n === 3) {
    content = ST.sentences.map(s => s.zh).join('\n');
    name += '.txt';
  } else {
    content = '\ufeffChinese,Pinyin,Vietnamese\n' + ST.sentences.map(s => [q(s.zh), q(s.pinyin), q(s.vi)].join(',')).join('\n');
    name += '.csv';
    mime = 'text/csv;charset=utf-8';
  }
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  itoast('✅ Đã xuất ' + name, 'ok');
}

async function toggleShadow() {
  if (ST.shadowRec && ST.shadowRec.state === 'recording') { ST.shadowRec.stop(); return; }
  if (ST.shadowUrl && (!ST.shadowRec || ST.shadowRec.state !== 'recording')) {
    new Audio(ST.shadowUrl).play();
    itoast('▶ Nghe lại bản ghi');
    return;
  }
  if (ST.currentIdx < 0) { itoast('Chưa chọn câu', 'err'); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    ST.shadowChunks = [];
    ST.shadowRec = new MediaRecorder(stream);
    ST.shadowRec.ondataavailable = e => { if (e.data.size > 0) ST.shadowChunks.push(e.data); };
    ST.shadowRec.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(ST.shadowChunks, { type: 'audio/webm' });
      if (ST.shadowUrl) try { URL.revokeObjectURL(ST.shadowUrl); } catch(e){}
      ST.shadowUrl = URL.createObjectURL(blob);
      const btn = $('impvBtnShadow');
      if (btn) btn.classList.remove('on');
      itoast('✅ Đã ghi — bấm lần nữa để nghe lại', 'ok');
      ST.shadowRec = null;
    };
    ST.shadowRec.start();
    const btn = $('impvBtnShadow');
    if (btn) btn.classList.add('on');
    itoast('🔴 Đang ghi...', 'ok');
  } catch(e) { itoast('❌ Không mở được mic', 'err'); }
}

function bindEvents() {
  const back = $('impvBack');
  if (back) back.onclick = closePage;
  const clr = $('impvClearBtn');
  if (clr) clr.onclick = () => {
    if (!ST.sentences.length && !($('impvTa')||{}).value) return;
    if (!confirm('Xóa toàn bộ nội dung?')) return;
    stopAudio();
    ST.sentences = [];
    ST.currentIdx = -1;
    if ($('impvTa')) $('impvTa').value = '';
    saveState();
    updateStats();
    switchSection('input');
    itoast('Đã xóa');
  };
  const popBtn = $('impvPopBtn');
  const pop = $('impvPop');
  if (popBtn && pop) {
    popBtn.onclick = (e) => { e.stopPropagation(); pop.classList.toggle('show'); };
    document.addEventListener('click', e => {
      if (!pop.contains(e.target) && e.target !== popBtn && !popBtn.contains(e.target)) {
        pop.classList.remove('show');
      }
    });
  }
  const modeGroup = $('impvModeGroup');
  if (modeGroup) {
    modeGroup.onclick = e => {
      const b = e.target.closest('button[data-mode]');
      if (!b) return;
      modeGroup.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      ST.mode = b.dataset.mode;
      updateStats();
    };
  }
  const ta = $('impvTa');
  if (ta) {
    ta.addEventListener('input', updateStats);
    ta.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); process(); }
    });
  }
  const sample = $('impvSampleBtn');
  if (sample) sample.onclick = () => {
    if (!ta) return;
    ta.value = '你好！我叫李明。我是越南人。你是哪國人？\n我是台灣人。很高興認識你。\n請問你叫什麼名字？\n我叫白如玉。你呢？';
    updateStats();
    itoast('📋 Đã chèn mẫu');
  };
  const proc = $('impvProcessBtn');
  if (proc) proc.onclick = process;
  const cancel = $('impvCancelBtn');
  if (cancel) cancel.onclick = () => { if (ST.procAbort) ST.procAbort.abort(); itoast('Đã hủy'); };
  const setToggle = (id, key, sel) => {
    const el = $(id);
    if (!el) return;
    el.onclick = () => {
      ST[key] = !ST[key];
      el.classList.toggle('on', ST[key]);
      if (sel) document.querySelectorAll(sel).forEach(x => x.classList.toggle('hide', ST[key]));
      saveState();
      vib(8);
    };
  };
  setToggle('impvTHan', 'hideHan', '.impv-card-zh');
  setToggle('impvTPy', 'hidePy', '.impv-card-py');
  setToggle('impvTVi', 'hideVi', '.impv-card-vi');
  const toneBtn = $('impvTTone');
  if (toneBtn) toneBtn.onclick = () => {
    ST.toneColor = !ST.toneColor;
    toneBtn.classList.toggle('on', ST.toneColor);
    renderList();
    saveState();
    itoast(ST.toneColor ? '🎨 Tô màu thanh điệu BẬT' : 'Đã tắt');
  };
  const dictBtn = $('impvTDict');
  if (dictBtn) dictBtn.onclick = () => {
    ST.dictation = !ST.dictation;
    dictBtn.classList.toggle('on', ST.dictation);
    document.querySelectorAll('.impv-card-zh').forEach(el => el.classList.toggle('hide', ST.dictation));
    itoast(ST.dictation ? '⌨️ Chép chính tả BẬT' : 'Đã tắt');
  };
  const repBtn = $('impvTRepeat');
  if (repBtn) repBtn.onclick = () => {
    ST.repeat = !ST.repeat;
    ST.repeatCurrent = 0;
    repBtn.classList.toggle('on', ST.repeat);
    itoast(ST.repeat ? `🔁 Lặp ${ST.repeatCount} lần` : 'Tắt lặp');
  };
  const autoBtn = $('impvTAuto');
  if (autoBtn) autoBtn.onclick = () => {
    ST.autoPause = !ST.autoPause;
    autoBtn.classList.toggle('on', ST.autoPause);
    itoast(ST.autoPause ? '⏸ Tự dừng sau mỗi câu' : 'Tắt tự dừng');
  };
  const playlistBtn = $('impvTPlaylist');
  if (playlistBtn) playlistBtn.onclick = () => {
    ST.playlist = !ST.playlist;
    playlistBtn.classList.toggle('on', ST.playlist);
    itoast(ST.playlist ? '▶ Phát liên tục' : 'Tắt playlist');
  };
  const searchBtn = $('impvTSearch');
  if (searchBtn) searchBtn.onclick = searchInList;
  const exportBtn = $('impvTExport');
  if (exportBtn) exportBtn.onclick = exportFile;
  const backToInputBtn = $('impvTBack');
  if (backToInputBtn) backToInputBtn.onclick = () => { switchSection('input'); };
  const playBtn = $('impvBtnPlay');
  if (playBtn) playBtn.onclick = () => {
    if (ST.currentIdx < 0) { if (ST.sentences.length) playSentence(0); return; }
    if (ST.currentAudio && !ST.currentAudio.paused) {
      ST.currentAudio.pause(); ST.playing = false; updatePlayIcon();
    } else if (ST.currentAudio) {
      ST.currentAudio.play(); ST.playing = true; updatePlayIcon();
    } else { playSentence(ST.currentIdx); }
  };
  const prevBtn = $('impvBtnPrev');
  if (prevBtn) prevBtn.onclick = () => {
    const i = Math.max(0, (ST.currentIdx < 0 ? 0 : ST.currentIdx) - 1);
    playSentence(i);
  };
  const nextBtn = $('impvBtnNext');
  if (nextBtn) nextBtn.onclick = () => {
    const i = Math.min(ST.sentences.length - 1, (ST.currentIdx < 0 ? -1 : ST.currentIdx) + 1);
    playSentence(i);
  };
  const spd = $('impvSpeedSelect');
  if (spd) {
    spd.onchange = () => { if (ST.currentAudio) ST.currentAudio.playbackRate = parseFloat(spd.value); };
  }
  const progBar = $('impvPlayerProg');
  if (progBar) progBar.onclick = e => {
    if (!ST.currentAudio || !ST.currentAudio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - r.left) / r.width;
    ST.currentAudio.currentTime = pct * ST.currentAudio.duration;
  };
  const btnA = $('impvBtnA');
  if (btnA) btnA.onclick = () => {
    if (!ST.currentAudio) { itoast('Đang phát mới đặt A được', 'err'); return; }
    ST.loopA = ST.currentAudio.currentTime;
    updateToolbarStates();
    itoast('A = ' + fmt(ST.loopA), 'ok');
  };
  const btnB = $('impvBtnB');
  if (btnB) btnB.onclick = () => {
    if (!ST.currentAudio) return;
    if (ST.loopA === null) { itoast('Đặt A trước', 'err'); return; }
    const t = ST.currentAudio.currentTime;
    if (t <= ST.loopA) { itoast('B phải sau A', 'err'); return; }
    ST.loopB = t;
    updateToolbarStates();
    itoast('🔂 Lặp ' + fmt(ST.loopA) + ' → ' + fmt(ST.loopB), 'ok');
  };
  const btnClearAB = $('impvBtnClearAB');
  if (btnClearAB) btnClearAB.onclick = () => {
    ST.loopA = ST.loopB = null;
    updateToolbarStates();
    itoast('Đã xóa A-B');
  };
  const btnShadow = $('impvBtnShadow');
  if (btnShadow) btnShadow.onclick = toggleShadow;
  const list = $('impvList');
  if (list) {
    list.addEventListener('click', e => {
      const w = e.target.closest('.impv-card-zh .word');
      if (w && w.dataset.word) {
        e.stopPropagation();
        if (typeof window.lookup === 'function') window.lookup(w.dataset.word, e);
        return;
      }
      const act = e.target.closest('[data-act]');
      if (act) {
        e.stopPropagation();
        const i = parseInt(act.dataset.idx);
        const action = act.dataset.act;
        if (action === 'tts') {
          if (ST.currentIdx === i && ST.playing) stopAudio();
          else playSentence(i, { btn: act });
        } else if (action === 'pron') {
          const s = ST.sentences[i];
          if (s && window.DD && typeof window.DD.startCheck === 'function') window.DD.startCheck(s.zh);
          else itoast('Cần app4.js', 'err');
        } else if (action === 'bm') {
          const s = ST.sentences[i];
          if (s && window.DD && typeof window.DD.addSentence === 'function') {
            const ok = window.DD.addSentence(s.zh, { source: 'Nhập văn bản' });
            if (ok) { act.classList.add('on'); ST.savedSet.add(norm(s.zh)); }
          } else itoast('Cần app4.js', 'err');
        }
        return;
      }
      const card = e.target.closest('.impv-card');
      if (card) {
        const i = parseInt(card.dataset.idx);
        if (ST.currentIdx === i && ST.playing) stopAudio();
        else playSentence(i);
      }
    });
  }
  const rateGroup = $('impvRateGroup');
  if (rateGroup) rateGroup.onclick = e => {
    const b = e.target.closest('button[data-rate]');
    if (!b) return;
    ST.rate = parseFloat(b.dataset.rate);
    localStorage.setItem('dd_tts_rate', String(ST.rate));
    updateRateButtons();
    itoast('⚡ Tốc độ: ' + ST.rate + '×', 'ok');
    saveState();
  };
  const pitchGroup = $('impvPitchGroup');
  if (pitchGroup) pitchGroup.onclick = e => {
    const b = e.target.closest('button[data-pitch]');
    if (!b) return;
    ST.pitch = parseFloat(b.dataset.pitch);
    localStorage.setItem('dd_tts_pitch', String(ST.pitch));
    updatePitchButtons();
    itoast('🎚️ Cao độ: ' + (ST.pitch >= 0 ? '+' : '') + ST.pitch + 'Hz', 'ok');
    saveState();
  };
  const repGroup = $('impvRepeatGroup');
  if (repGroup) repGroup.onclick = e => {
    const b = e.target.closest('button[data-rep]');
    if (!b) return;
    ST.repeatCount = parseInt(b.dataset.rep);
    updateRepeatButtons();
    itoast('🔁 Lặp ' + ST.repeatCount + ' lần', 'ok');
    saveState();
  };
  document.addEventListener('keydown', e => {
    const impv = $('impv');
    if (!impv || !impv.classList.contains('show')) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      if (e.key === 'Escape' && tag === 'TEXTAREA') e.target.blur();
      return;
    }
    if (e.key === 'Escape') { closePage(); return; }
    if (e.code === 'Space') { e.preventDefault(); $('impvBtnPlay')?.click(); }
    else if (e.code === 'ArrowLeft') {
      if (ST.currentAudio) ST.currentAudio.currentTime = Math.max(0, ST.currentAudio.currentTime - 5);
    } else if (e.code === 'ArrowRight') {
      if (ST.currentAudio && ST.currentAudio.duration) {
        ST.currentAudio.currentTime = Math.min(ST.currentAudio.duration, ST.currentAudio.currentTime + 5);
      }
    } else if (e.key === 'r' || e.key === 'R') $('impvTRepeat')?.click();
    else if (e.key === 'a' || e.key === 'A') $('impvBtnA')?.click();
    else if (e.key === 'b' || e.key === 'B') $('impvBtnB')?.click();
    else if (e.key === 'd' || e.key === 'D') $('impvTDict')?.click();
    else if (e.key === 't' || e.key === 'T') $('impvTTone')?.click();
    else if (e.key === 's' || e.key === 'S') $('impvPopBtn')?.click();
    else if (e.key === 'p' || e.key === 'P') {
      const s = ST.sentences[ST.currentIdx];
      if (s && window.DD && typeof window.DD.startCheck === 'function') window.DD.startCheck(s.zh);
    }
  });
}

function addHeaderButton() {
  const hb = document.querySelector('.hbtns');
  if (!hb || $('impvHeaderBtn')) return;
  const btn = document.createElement('button');
  btn.className = 'hbtn';
  btn.id = 'impvHeaderBtn';
  btn.title = 'Nhập văn bản (I)';
  btn.style.background = 'linear-gradient(135deg,#8b5cf6,#6366f1)';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.fontWeight = '700';
  btn.style.boxShadow = '0 4px 14px rgba(139,92,246,.35)';
  btn.innerHTML = '<svg style="width:15px;height:15px"><use href="#i-file"/></svg><span>Nhập văn</span>';
  btn.onclick = openPage;
  const ref = $('settingsBtn');
  if (ref && ref.parentElement === hb) hb.insertBefore(btn, ref);
  else hb.appendChild(btn);
}

document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const impv = $('impv');
  if (impv && impv.classList.contains('show')) return;
  if (e.key === 'i' || e.key === 'I') {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    openPage();
  }
});

function init() {
  buildHTML();
  bindEvents();
  addHeaderButton();
  setInterval(() => {
    if (document.querySelector('.hbtns') && !$('impvHeaderBtn')) addHeaderButton();
  }, 3000);
  console.log('[app10 v3.1] Premium Import + Pitch loaded');
}

window.impOpenPage = openPage;
window.impClosePage = closePage;
window.impState = ST;
window.impRenderSentences = renderList;       // ⬅️ THÊM
window.impSwitchSection = switchSection;      // ⬅️ THÊM
window.impSaveState = saveState; 

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 800));
} else {
  setTimeout(init, 800);
}

})();