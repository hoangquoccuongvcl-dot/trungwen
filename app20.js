'use strict';
/* app20.js v3.0 — Video Transcript: Video TRÊN, transcript DƯỚI, chữ nhảy khi đọc */
(function(){
if (!window.DD) { console.error('[app20] Cần app4.js!'); return; }
const $ = id => document.getElementById(id);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s||'').replace(/[^\u4e00-\u9fa5]/g, '');
const fmt = s => { if(!isFinite(s)||s<0) return '0:00'; const m=Math.floor(s/60), x=Math.floor(s%60); return m+':'+String(x).padStart(2,'0'); };
const fmtLong = s => { const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), x=Math.floor(s%60); return (h?h+':':'')+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0'); };
const LOG = (...a) => console.log('[video]', ...a);

const CSS = ""
+ ".vp-page{position:fixed;inset:0;background:var(--bg);z-index:98;display:none;flex-direction:column}"
+ ".vp-page.show{display:flex}"
+ ".vp-top{height:56px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 14px;gap:8px;flex-shrink:0;z-index:10}"
+ ".vp-icobtn{width:36px;height:36px;border-radius:10px;background:var(--card);border:1px solid var(--border);color:var(--text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}"
+ ".vp-icobtn:hover{background:var(--card2)}"
+ ".vp-icobtn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round}"
+ ".vp-title{flex:1;font-size:14px;font-weight:800;display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden}"
+ ".vp-title>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
+ ".vp-tag{font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;background:rgba(16,185,129,.15);color:#10b981;text-transform:uppercase;flex-shrink:0}"
+ ".vp-tag.processing{background:rgba(139,92,246,.15);color:#a78bfa}"
+ ".vp-tag.err{background:rgba(225,29,72,.15);color:#e11d48}"
+ ".vp-btn{padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}"
+ ".vp-btn.pri{background:linear-gradient(135deg,#8b5cf6,#6366f1);border:none;color:#fff}"
+ ".vp-btn:hover{opacity:.9}"
+ ".vp-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}"
+ ".vp-body{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0}"
+ ".vp-video-area{background:#000;flex-shrink:0;display:flex;justify-content:center;align-items:center;position:relative;max-height:55vh;overflow:hidden}"
+ ".vp-video{max-width:100%;max-height:55vh;background:#000;display:none}"
+ ".vp-video.show{display:block}"
+ ".vp-video-ph{min-height:280px;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#64748b;gap:10px;text-align:center;padding:30px 20px;cursor:pointer;transition:.2s;background:#0a0e1a}"
+ ".vp-video-ph.drop{border:3px dashed #8b5cf6;background:rgba(139,92,246,.08)}"
+ ".vp-video-ph .em{font-size:56px;opacity:.4}"
+ ".vp-video-ph h3{font-size:16px;color:#e2e8f0;font-weight:700;margin-bottom:4px}"
+ ".vp-video-ph p{font-size:12.5px;color:#94a3b8;line-height:1.7;max-width:460px}"
+ ".vp-video-ph label{margin-top:12px;padding:13px 24px;background:linear-gradient(135deg,#8b5cf6,#6366f1);border-radius:10px;color:#fff;font-weight:800;font-size:13.5px;cursor:pointer;display:inline-flex;align-items:center;gap:8px}"
+ ".vp-video-ph label:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(139,92,246,.4)}"
+ ".vp-video-ph label input{display:none}"
+ ".vp-lib-btn{margin-top:12px;padding:8px 16px;background:transparent;border:1.5px solid #8b5cf6;color:#c4b5fd;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}"
+ ".vp-lib-btn:hover{background:rgba(139,92,246,.15)}"
+ ".vp-player-bar{padding:8px 14px;background:#000;border-top:1px solid #1e293b;display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex-shrink:0}"
+ ".vp-player-bar.hidden{display:none}"
+ ".vp-pbtn{background:transparent;border:none;color:#e2e8f0;cursor:pointer;padding:6px;border-radius:6px;display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700}"
+ ".vp-pbtn:hover{background:rgba(255,255,255,.1)}"
+ ".vp-pbtn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}"
+ ".vp-pbtn.on{background:rgba(139,92,246,.3);color:#c4b5fd}"
+ ".vp-ptime{font-size:11px;color:#cbd5e1;font-family:ui-monospace,monospace;padding:0 6px}"
+ ".vp-progress-video{flex:1;height:6px;background:rgba(255,255,255,.15);border-radius:3px;position:relative;cursor:pointer;min-width:100px;align-self:center}"
+ ".vp-progress-video:hover{height:8px}"
+ ".vp-pfill{height:100%;background:linear-gradient(90deg,#8b5cf6,#6366f1);width:0;border-radius:3px}"
+ ".vp-select{padding:5px 10px;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit}"
+ ".vp-transcript-area{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg);min-height:0}"
+ ".vp-transcript-head{padding:8px 14px;border-bottom:1px solid var(--border);display:flex;gap:6px;align-items:center;background:var(--bg2);flex-wrap:wrap;flex-shrink:0}"
+ ".vp-search{flex:1;min-width:150px;padding:7px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px;outline:none;font-family:inherit}"
+ ".vp-search:focus{border-color:#8b5cf6}"
+ ".vp-mini-btn{padding:5px 9px;background:var(--card);border:1px solid var(--border);color:var(--text2);border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}"
+ ".vp-mini-btn:hover{background:var(--card2);color:var(--text)}"
+ ".vp-mini-btn.on{background:#8b5cf6;color:#fff;border-color:#8b5cf6}"
+ ".vp-transcript{flex:1;overflow-y:auto;padding:14px 16px 80px;scroll-behavior:smooth}"
+ ".vp-transcript-inner{max-width:900px;margin:0 auto}"
+ ".vp-transcript::-webkit-scrollbar{width:7px}"
+ ".vp-transcript::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}"
+ ".vp-loading{padding:40px 20px;text-align:center;display:none}"
+ ".vp-loading.show{display:block}"
+ ".vp-spin{width:44px;height:44px;border:3px solid rgba(139,92,246,.3);border-top-color:#8b5cf6;border-radius:50%;animation:vpSpin 1s linear infinite;margin:0 auto 16px}"
+ "@keyframes vpSpin{to{transform:rotate(360deg)}}"
+ ".vp-ltext{font-size:13px;color:var(--text2);font-weight:600}"
+ ".vp-ltime{font-size:11px;color:var(--text3);margin-top:6px;font-family:ui-monospace,monospace}"
+ ".vp-progress{height:6px;background:var(--card);border-radius:3px;overflow:hidden;margin:14px auto 0;max-width:280px}"
+ ".vp-progress-fill{height:100%;background:linear-gradient(90deg,#8b5cf6,#6366f1);width:0;transition:width .3s}"

/* ===== CARD + ACTIVE JUMP ANIMATION ===== */
+ ".vp-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px 18px;margin-bottom:10px;cursor:pointer;transition:transform .35s cubic-bezier(.34,1.56,.64,1),background .25s,border-color .25s,box-shadow .35s;animation:vpSlide .25s;position:relative;overflow:hidden}"
+ "@keyframes vpSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}"
+ ".vp-card:hover{border-color:#8b5cf6}"
+ ".vp-card.active{"
+  + "transform:translateY(-8px) scale(1.025);"
+  + "background:linear-gradient(135deg,rgba(139,92,246,.2),rgba(236,72,153,.08));"
+  + "border-color:#8b5cf6;"
+  + "border-left:5px solid #8b5cf6;"
+  + "box-shadow:0 12px 32px rgba(139,92,246,.35),0 0 0 1px rgba(139,92,246,.5) inset;"
+  + "animation:vpPulse 1.8s ease-in-out infinite;"
+ "}"
+ "@keyframes vpPulse{"
+  + "0%,100%{box-shadow:0 12px 32px rgba(139,92,246,.35),0 0 0 1px rgba(139,92,246,.5) inset}"
+  + "50%{box-shadow:0 16px 40px rgba(139,92,246,.55),0 0 0 2px rgba(139,92,246,.7) inset}"
+ "}"
+ ".vp-card.active::before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(180deg,#8b5cf6,#ec4899);animation:vpGlow 1.5s ease-in-out infinite}"
+ "@keyframes vpGlow{0%,100%{opacity:1}50%{opacity:.6}}"
+ ".vp-card.active .vp-zh{color:#fff;font-weight:700;font-size:21px;text-shadow:0 2px 12px rgba(139,92,246,.5)}"
+ ".vp-card.active .vp-py{color:var(--color-zh,#fff);font-weight:700;font-size:13px}"
+ ".vp-card.active .vp-vi{color:#e2e8f0;font-weight:600;font-size:13.5px}"
+ ".vp-card.hidden{display:none}"

+ ".vp-head{display:flex;align-items:center;gap:6px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px dashed var(--border);flex-wrap:wrap}"
+ ".vp-card.active .vp-head{border-bottom-color:rgba(139,92,246,.5)}"
+ ".vp-num{font-size:10px;font-weight:800;color:var(--text3);background:var(--bg);padding:2px 7px;border-radius:5px;border:1px solid var(--border);font-family:ui-monospace,monospace}"
+ ".vp-card.active .vp-num{background:rgba(255,255,255,.2);color:#fff;border-color:rgba(255,255,255,.4)}"
+ ".vp-time{font-size:10px;color:#8b5cf6;background:rgba(139,92,246,.12);padding:2px 7px;border-radius:5px;font-family:ui-monospace,monospace;font-weight:700;cursor:pointer}"
+ ".vp-card.active .vp-time{background:rgba(255,255,255,.25);color:#fff}"
+ ".vp-acts{margin-left:auto;display:flex;gap:3px}"
+ ".vp-act{width:26px;height:26px;border-radius:6px;background:var(--bg);border:1px solid var(--border);color:var(--text3);cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative}"
+ ".vp-act:hover{background:var(--card2);color:var(--text);transform:scale(1.08)}"
+ ".vp-act svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2}"
+ ".vp-act.saved{color:var(--green);background:rgba(16,185,129,.15)}"
+ ".vp-zh{font-size:19px;font-weight:500;line-height:1.7;color:var(--text);font-family:'PingFang TC',sans-serif;word-break:break-word;transition:all .35s cubic-bezier(.34,1.56,.64,1)}"
+ ".vp-py{font-size:12px;color:var(--accent2);margin-top:5px;font-family:ui-monospace,monospace;letter-spacing:.3px;line-height:1.5;word-break:break-word;transition:all .35s}"
+ ".vp-vi{font-size:12.5px;color:var(--text2);margin-top:7px;padding-top:7px;border-top:1px dashed var(--border);font-style:italic;line-height:1.55;min-height:16px;transition:all .35s}"
+ ".vp-vi.loading{color:var(--text3);opacity:.6;font-style:normal}"
+ ".vp-card.active .vp-vi{border-top-color:rgba(139,92,246,.5);color:#e2e8f0}.vp-card{display:flex;flex-direction:column}.vp-head{order:0}.vp-py{order:1}.vp-zh{order:2}.vp-vi{order:3}.vp-word-DEAD{display:inline-block;padding:0 1px;transition:transform .18s ease-out,font-weight .18s}.vp-word.NEVER_MATCH{transform:translateY(-4px);font-weight:800}"
+ ".vp-zh.hide,.vp-py.hide,.vp-vi.hide{display:none}"
+ ".vp-empty{text-align:center;padding:40px 16px;color:var(--text3);font-size:12.5px;line-height:1.7}"
+ ".vp-empty .em{font-size:48px;opacity:.3;display:block;margin-bottom:12px}"
+ ".vp-status{position:fixed;top:70px;left:50%;transform:translateX(-50%);background:var(--card);border:1px solid var(--border);color:var(--text);padding:9px 16px;border-radius:10px;font-size:12px;font-weight:600;z-index:200;opacity:0;transition:.25s;pointer-events:none;max-width:90vw;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.4)}"
+ ".vp-status.show{opacity:1}"
+ ".vp-status.ok{border-color:var(--green);color:var(--green)}"
+ ".vp-status.err{border-color:var(--rose);color:var(--rose)}"
+ ".vp-modal{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:none;align-items:center;justify-content:center;padding:16px}"
+ ".vp-modal.show{display:flex}"
+ ".vp-modal-box{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:20px;width:100%;max-width:520px;max-height:85vh;overflow-y:auto}"
+ ".vp-modal-box h3{font-size:15px;font-weight:800;margin-bottom:14px}"
+ ".vp-modal-btns{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}"
+ ".vp-modal-btns button{padding:9px 18px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit}"
+ ".vp-modal-btns button.pri{background:linear-gradient(135deg,#8b5cf6,#6366f1);border:none;color:#fff}"
+ ".vp-lib-item{display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer}"
+ ".vp-lib-item:hover{border-color:#8b5cf6;background:var(--bg2)}"
+ ".vp-lib-info{flex:1;min-width:0}"
+ ".vp-lib-name{font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
+ ".vp-lib-meta{font-size:10.5px;color:var(--text3);margin-top:2px}"
+ ".vp-lib-del{padding:6px 10px;background:rgba(225,29,72,.15);color:#e11d48;border:1px solid rgba(225,29,72,.3);border-radius:6px;font-size:11px;font-weight:700;cursor:pointer}"

+ "@media(max-width:700px){"
+ ".vp-top{padding:6px 10px;gap:6px;height:auto;min-height:56px;flex-wrap:wrap}"
+ ".vp-title{font-size:13px}"
+ ".vp-btn{padding:6px 10px;font-size:11px}"
+ ".vp-video-area{max-height:35vh}"
+ ".vp-video{max-height:35vh}"
+ ".vp-video-ph{min-height:200px}"
+ ".vp-transcript{padding:12px 12px 100px}"
+ ".vp-card{padding:12px 14px}"
+ ".vp-card.active{transform:translateY(-5px) scale(1.015)}"
+ ".vp-card.active .vp-zh{font-size:18px}"
+ ".vp-zh{font-size:16px}"
+ ".vp-py{font-size:11px}"
+ ".vp-vi{font-size:12px}"
+ "}";
const st = document.createElement('style'); st.id = 'app20-styles'; st.textContent = CSS;
if (!document.getElementById('app20-styles')) document.head.appendChild(st);

const ST = {
  open:false, video:null, sentences:[], currentIdx:-1,
  translating:false, processing:false,
  videoUrl:null, currentFileName:'', duration:0, currentVideoId:null,
  abLoopA:null, abLoopB:null,
  searchQuery:'', filterSaved:false,
  showHan:true, showPy:true, showVi:true, autoScroll:true,
  transcribeController:null
};

let toastT;
function vtoast(msg,type){
  let el=$('vpStatus');
  if(!el){ el=document.createElement('div'); el.id='vpStatus'; el.className='vp-status'; document.body.appendChild(el); }
  el.textContent=msg; el.className='vp-status '+(type||'');
  requestAnimationFrame(()=>el.classList.add('show'));
  clearTimeout(toastT);
  toastT=setTimeout(()=>el.classList.remove('show'),2600);
}
function setTag(t,c){ const el=$('vpTag'); if(el){ el.textContent=t; el.className='vp-tag'+(c?' '+c:''); } }
function localPinyin(t){ const c=norm(t); if(!c||!window.pinyinPro) return ''; try{ return window.pinyinPro.pinyin(c,{toneType:'symbol',type:'string',nonZh:'removed'}); }catch(e){ return ''; } }

/* Chunking */
function splitTextIntoChunks(text, maxLen){
  text=String(text||'').trim(); if(!text) return [];
  if(text.length<=maxLen) return [text];
  const parts=text.split(/([，。！？、；：,.!?;:])/).filter(x=>x);
  const chunks=[]; let cur='';
  for(const p of parts){
    if(!p) continue;
    if(cur.length+p.length<=maxLen) cur+=p;
    else {
      if(cur.trim()) chunks.push(cur.trim());
      if(/^[，。！？、；：,.!?;:]$/.test(p)){ if(chunks.length) chunks[chunks.length-1]+=p; cur=''; }
      else cur=p;
    }
  }
  if(cur.trim()) chunks.push(cur.trim());
  const final=[];
  for(const ch of chunks){
    if(ch.length<=maxLen*1.6) final.push(ch);
    else for(let i=0;i<ch.length;i+=maxLen) final.push(ch.slice(i,i+maxLen));
  }
  return final.filter(x=>x.length>=1);
}
async function translateChunk(ch){
  ch=ch.trim(); if(!ch) return '';
  const ck='dd_c_'+ch;
  const cached=localStorage.getItem(ck);
  if(cached) return cached;
  try{
    const r=await fetch('/api/translate?q='+encodeURIComponent(ch));
    if(!r.ok) return '';
    const d=await r.json();
    const t=(d.text||'').trim();
    if(t) try{ localStorage.setItem(ck,t); }catch(e){}
    return t;
  }catch(e){ return ''; }
}
async function translateFull(zh){
  const clean=norm(zh); if(!clean) return '';
  const chunks=splitTextIntoChunks(clean,11);
  const results=await Promise.all(chunks.map(translateChunk));
  return results.filter(x=>x).join(' ').trim();
}

/* DB Video */
function openDB(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open('vp_videos_v2',1);
    r.onupgradeneeded=e=>{ e.target.result.createObjectStore('videos',{keyPath:'id'}); };
    r.onsuccess=()=>res(r.result);
    r.onerror=()=>rej(r.error);
  });
}
async function dbPut(item){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction('videos','readwrite'); tx.objectStore('videos').put(item); tx.oncomplete=res; tx.onerror=rej; }); }
async function dbGetAll(){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction('videos','readonly'); const r=tx.objectStore('videos').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=rej; }); }
async function dbDel(id){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction('videos','readwrite'); tx.objectStore('videos').delete(id); tx.oncomplete=res; tx.onerror=rej; }); }

/* Build */
function loadOpenCC(){
  if(window.OpenCC) return;
  if($('opencc-script')) return;
  const s=document.createElement('script');
  s.id='opencc-script';
  s.src='https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js';
  s.onload=()=>{ LOG('OpenCC loaded'); };
  s.onerror=()=>{ console.warn('[video] OpenCC CDN fail'); };
  document.head.appendChild(s);
}

function toTraditional(zh){
  if(!zh) return zh;
  if(!window.OpenCC) return zh;
  try{
    if(!ST._s2t) ST._s2t = window.OpenCC.Converter({ from:'cn', to:'twp' });
    return ST._s2t(zh);
  }catch(e){ return zh; }
}

function renderZhWithWords(zh, cardIdx){
  // Tách TỪNG CHỮ Hán (không gộp từ) để mỗi chữ nhảy riêng
  const chars = [...String(zh)];
  let html = '';
  let wi = 0;
  for(const ch of chars){
    if(/[\u4e00-\u9fa5]/.test(ch)){
      html += '<span class="vp-word" data-card="'+cardIdx+'" data-wi="'+wi+'">'+esc(ch)+'</span>';
      wi++;
    } else {
      html += esc(ch);
    }
  }
  return html;
}

function NOOP_RETIRED(t){
  if(ST.currentIdx<0) return;
  const s = ST.sentences[ST.currentIdx];
  if(!s) return;
  const dur = (s.end||s.start+3) - s.start;
  if(dur<=0) return;
  const elapsed = t - s.start;
  if(elapsed<0) return;
  const zhEl = $('vp-zh-'+ST.currentIdx);
  if(!zhEl) return;
  const words = zhEl.querySelectorAll('.vp-word');
  if(!words.length) return;
  const n = words.length;
  const per = dur/n;
  let curIdx = Math.floor(elapsed/per);
  if(curIdx<0) curIdx=0;
  if(curIdx>=n) curIdx=n-1;
  // Chỉ 1 chữ active, các chữ khác tắt
  for(let i=0;i<n;i++){
    const w=words[i];
    if(i===curIdx){
      if(!w.classList.contains('word-active')) w.classList.add('word-active');
    } else {
      if(w.classList.contains('word-active')) w.classList.remove('word-active');
    }
  }
}


function clearWordHighlights(){
  document.querySelectorAll('.vp-word.NEVER_MATCH').forEach(w=>w.classList.remove('word-active'));
}

function buildPage(){
  if($('vpPage')) return;
  document.body.insertAdjacentHTML('beforeend',
    '<div class="vp-page" id="vpPage">'
    +'<div class="vp-top">'
    +'<button class="vp-icobtn" id="vpBack"><svg><use href="#i-chev"/></svg></button>'
    +'<div class="vp-title"><span>📹</span><span id="vpTitle">Video Transcript</span><span class="vp-tag" id="vpTag">Sẵn sàng</span></div>'
    +'<button class="vp-btn" id="vpLibBtn" title="Thư viện video"><svg><use href="#i-book"/></svg>Thư viện</button>'
    +'<button class="vp-btn" id="vpExportBtn" style="display:none"><svg><use href="#i-dl"/></svg>Xuất</button>'
    +'<button class="vp-btn pri" id="vpReloadBtn" style="display:none"><svg><use href="#i-file"/></svg>Video mới</button>'
    +'</div>'
    +'<div class="vp-body">'
    +'<div class="vp-video-area" id="vpVideoArea">'
    +'<div class="vp-video-ph" id="vpVideoPH">'
    +'<span class="em">🎬</span>'
    +'<h3>Video Transcript</h3>'
    +'<p>Kéo thả video vào đây hoặc bấm nút bên dưới<br>Hỗ trợ mp4, mov, webm, mkv, avi</p>'
    +'<label>📁 Chọn video<input type="file" id="vpFile" accept="video/*"></label>'
    +'<button class="vp-lib-btn" id="vpLibBtn2"><svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2"><use href="#i-book"/></svg>Thư viện video đã lưu</button>'
    +'</div>'
    +'<video class="vp-video" id="vpVideo" preload="metadata" playsinline></video>'
    +'</div>'
    +'<div class="vp-player-bar hidden" id="vpPlayerBar">'
    +'<button class="vp-pbtn" id="vpPlayBtn"><svg><use href="#i-play"/></svg></button>'
    +'<button class="vp-pbtn" id="vpBack5"><svg><use href="#i-back"/></svg></button>'
    +'<button class="vp-pbtn" id="vpFwd5"><svg><use href="#i-fwd"/></svg></button>'
    +'<span class="vp-ptime" id="vpTimeCur">0:00</span>'
    +'<div class="vp-progress-video" id="vpProgressVideo"><div class="vp-pfill" id="vpPFill"></div></div>'
    +'<span class="vp-ptime" id="vpTimeDur">0:00</span>'
    +'<button class="vp-pbtn" id="vpABBtn">A-B</button>'
    +'<button class="vp-pbtn" id="vpMuteBtn"><svg><use href="#i-vol"/></svg></button>'
    +'<select class="vp-select" id="vpSpeedSel">'
    +'<option value="0.5">0.5×</option><option value="0.75">0.75×</option>'
    +'<option value="1" selected>1.0×</option><option value="1.25">1.25×</option>'
    +'<option value="1.5">1.5×</option><option value="2">2.0×</option>'
    +'</select>'
    +'<button class="vp-pbtn" id="vpFullBtn">⛶</button>'
    +'</div>'
    +'<div class="vp-transcript-area">'
    +'<div class="vp-transcript-head">'
    +'<input class="vp-search" id="vpSearch" placeholder="🔍 Tìm câu...">'
    +'<button class="vp-mini-btn on" id="vpTHan">汉</button>'
    +'<button class="vp-mini-btn on" id="vpTPy">PY</button>'
    +'<button class="vp-mini-btn on" id="vpTVi">VI</button>'
    +'<button class="vp-mini-btn on" id="vpTAuto">Auto</button>'
    +'<button class="vp-mini-btn" id="vpTSaved">💾</button>'
    +'</div>'
    +'<div class="vp-transcript" id="vpTranscript"><div class="vp-transcript-inner" id="vpInner">'
    +'<div class="vp-loading" id="vpLoading"><div class="vp-spin"></div>'
    +'<div class="vp-ltext" id="vpLoadText">Đang tải...</div>'
    +'<div class="vp-ltime" id="vpLoadTime">0:00</div>'
    +'<div class="vp-progress"><div class="vp-progress-fill" id="vpProgressFill"></div></div>'
    +'</div>'
    +'<div id="vpList"></div>'
    +'</div></div>'
    +'</div>'
    +'</div>'
    +'</div>'
    +'<div class="vp-modal" id="vpLibModal"><div class="vp-modal-box">'
    +'<h3>📚 Thư viện video</h3>'
    +'<div id="vpLibList"></div>'
    +'<div class="vp-modal-btns"><button id="vpLibClose">Đóng</button></div>'
    +'</div></div>'
    +'</div>');
}

function openPage(){ buildPage(); $('vpPage').classList.add('show'); ST.open=true; bindEvents(); }
function closePage(){
  if(ST.video) ST.video.pause();
  if(ST.transcribeController) ST.transcribeController.abort();
  const p=$('vpPage'); if(p) p.classList.remove('show'); ST.open=false;
}

function bindEvents(){
  if(ST._bound) return; ST._bound=true;
  document.addEventListener('click', e=>{
    if(e.target.closest('#vpBack')) return closePage();
    if(e.target.closest('#vpReloadBtn')){ $('vpFile').click(); return; }
    if(e.target.closest('#vpLibBtn')||e.target.closest('#vpLibBtn2')){ openLibrary(); return; }
    if(e.target.closest('#vpLibClose')){ $('vpLibModal').classList.remove('show'); return; }
    if(e.target.closest('#vpExportBtn')){ openExportMenu(); return; }

    const act=e.target.closest('.vp-act');
    if(act){
      e.stopPropagation();
      const idx=+act.dataset.idx, a=act.dataset.act;
      const it=ST.sentences[idx]; if(!it) return;
      if(a==='tts'){ if(window.DD.speak) window.DD.speak(it.zh); }
      else if(a==='copy'){ navigator.clipboard.writeText(it.zh).then(()=>vtoast('📋 Đã copy','ok')); }
      else if(a==='save'){
        if(window.DD.addSentence(it.zh,{source:'Video'})){
          it.saved=true;
          act.classList.add('saved');
          vtoast('💾 Đã lưu','ok');
          // KHÔNG re-render, không filter, chỉ update nút
        }
      }
      return;
    }
    const card=e.target.closest('.vp-card');
    if(card){
      const idx=+card.dataset.idx;
      const it=ST.sentences[idx]; if(!it||!ST.video) return;
      ST.video.currentTime=it.start;
      ST.video.play();
      setActive(idx);
    }
  });

  setTimeout(()=>{
    const fi=$('vpFile');
    if(fi) fi.addEventListener('change',e=>{ const f=e.target.files[0]; if(f) handleVideoFile(f); });
    const ph=$('vpVideoPH');
    if(ph){
      ['dragover','dragenter'].forEach(ev=>ph.addEventListener(ev,e=>{ e.preventDefault(); ph.classList.add('drop'); }));
      ['dragleave','dragend'].forEach(ev=>ph.addEventListener(ev,e=>{ ph.classList.remove('drop'); }));
      ph.addEventListener('drop',e=>{
        e.preventDefault(); ph.classList.remove('drop');
        const f=e.dataTransfer.files[0];
        if(f && f.type.startsWith('video')) handleVideoFile(f);
      });
    }
    const sr=$('vpSearch');
    if(sr) sr.addEventListener('input',()=>{ ST.searchQuery=sr.value.toLowerCase().trim(); applyFilter(); });
    const ss=$('vpSpeedSel');
    if(ss) ss.addEventListener('change',()=>{ if(ST.video){ ST.video.playbackRate=parseFloat(ss.value); vtoast('Tốc độ '+ss.value+'×','ok'); } });
  },150);
}

/* File */
async function handleVideoFile(file){
  LOG('File:',file.name,file.size);
  vtoast('📹 Đang tải video...','ok');
  setTag('Đang xử lý...','processing');
  ST.currentFileName=file.name;
  $('vpVideoPH').style.display='none';
  $('vpVideo').classList.add('show');
  $('vpPlayerBar').classList.remove('hidden');
  $('vpReloadBtn').style.display='inline-flex';
  $('vpExportBtn').style.display='inline-flex';
  $('vpTitle').textContent=file.name;

  if(ST.videoUrl) URL.revokeObjectURL(ST.videoUrl);
  ST.videoUrl=URL.createObjectURL(file);
  const v=$('vpVideo');
  v.src=ST.videoUrl;
  ST.video=v;
  ST.sentences=[]; ST.currentIdx=-1; ST.abLoopA=null; ST.abLoopB=null;

  v.onloadedmetadata=()=>{ ST.duration=v.duration; $('vpTimeDur').textContent=fmtLong(v.duration); };
  v.ontimeupdate=onVideoTime;
  v.onplay=()=>{ const b=$('vpPlayBtn'); if(b) b.innerHTML='<svg><use href="#i-pause"/></svg>'; };
  v.onpause=()=>{ const b=$('vpPlayBtn'); if(b) b.innerHTML='<svg><use href="#i-play"/></svg>'; };

  $('vpList').innerHTML='';
  $('vpProgressFill').style.width='0%';
  $('vpLoading').classList.add('show');
  $('vpLoadText').textContent='Đang xử lý video...';
  const startT=Date.now();
  const tInt=setInterval(()=>{ const el=$('vpLoadTime'); if(el) el.textContent=fmtLong((Date.now()-startT)/1000); },500);
  let pct=3;
  const pInt=setInterval(()=>{ pct=Math.min(90,pct+1.5); const f=$('vpProgressFill'); if(f) f.style.width=pct+'%'; },800);

  if(ST.transcribeController) ST.transcribeController.abort();
  ST.transcribeController=new AbortController();

  try{
    const fd=new FormData();
    fd.append('video',file,file.name);
    const r=await fetch('/api/transcribe-video',{method:'POST',body:fd,signal:ST.transcribeController.signal});
    clearInterval(tInt); clearInterval(pInt);
    $('vpProgressFill').style.width='100%';
    if(!r.ok){ const err=await r.json().catch(()=>({})); throw new Error(err.error||'Server lỗi'); }
    const data=await r.json();
    const segs=data.segments||[];
    LOG('Got',segs.length,'segments');
    if(!segs.length){ vtoast('⚠️ Không có text','err'); setTag('Trống','err'); $('vpLoading').classList.remove('show'); return; }
    // Load OpenCC + convert sang phồn thể
    loadOpenCC();
    await new Promise(r=>setTimeout(r, 400));
    ST.sentences=segs.map((s,i)=>{
      const zhTrad = toTraditional(s.text);
      return {
        idx:i, zh:zhTrad, start:s.start, end:s.end,
        pinyin:localPinyin(zhTrad), vi:'', saved:false
      };
    });
    renderTranscript();
    vtoast('✅ Đã chép '+segs.length+' câu','ok');
    setTag(segs.length+' câu');
    $('vpLoading').classList.remove('show');
    translateAll();
    // Save to DB
    const vid='v_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
    ST.currentVideoId=vid;
    try{
      const snap = ST.sentences.map(s=>({zh:s.zh,start:s.start,end:s.end,pinyin:s.pinyin||'',vi:s.vi||'',saved:!!s.saved}));
      await dbPut({ id:vid, name:file.name, size:file.size, type:file.type, blob:file, sentences:snap, created:Date.now() });
      LOG('✅ Saved to DB:',vid, 'câu:', snap.length);
    }catch(e){ LOG('DB error:', e); vtoast('⚠️ Không lưu được video (file lớn?)','err'); }
  }catch(e){
    clearInterval(tInt); clearInterval(pInt);
    if(e.name==='AbortError') return;
    LOG('ERR:',e.message);
    vtoast('❌ '+e.message,'err');
    setTag('Lỗi','err');
    $('vpLoading').classList.remove('show');
  }
}

function onVideoTime(){
  const v=ST.video; if(!v) return;
  const t=v.currentTime;
  $('vpTimeCur').textContent=fmtLong(t);
  const pct=ST.duration>0?(t/ST.duration)*100:0;
  $('vpPFill').style.width=pct+'%';
  if(ST.abLoopA!==null && ST.abLoopB!==null && t>=ST.abLoopB){ v.currentTime=ST.abLoopA; return; }
  let idx=-1;
  for(let i=0;i<ST.sentences.length;i++){
    const s=ST.sentences[i];
    if(t>=s.start && t<(s.end||s.start+3)){ idx=i; break; }
  }
  if(idx!==ST.currentIdx && idx>=0) setActive(idx);
  NOOP_RETIRED(t);
}

function setActive(idx){
  if(ST.currentIdx===idx) return;
  clearWordHighlights();
  const old=$('vp-card-'+ST.currentIdx);
  if(old) old.classList.remove('active');
  ST.currentIdx=idx;
  if(idx<0) return;
  const el=$('vp-card-'+idx);
  if(el){
    el.classList.add('active');
    if(ST.autoScroll) el.scrollIntoView({behavior:'smooth',block:'center'});
  }
}

function renderTranscript(){
  const list=$('vpList'); if(!list) return;
  if(!ST.sentences.length){ list.innerHTML='<div class="vp-empty"><span class="em">📝</span>Chưa có transcript</div>'; return; }
  list.innerHTML=ST.sentences.map((s,i)=>{
    const mm=fmt(s.start), mm2=fmt(s.end||s.start+3);
    return '<div class="vp-card" id="vp-card-'+i+'" data-idx="'+i+'">'
      +'<div class="vp-head">'
      +'<span class="vp-num">#'+String(i+1).padStart(3,'0')+'</span>'
      +'<span class="vp-time">'+mm+' → '+mm2+'</span>'
      +'<div class="vp-acts">'
      +'<button class="vp-act" data-act="tts" data-idx="'+i+'" title="Nghe"><svg><use href="#i-vol"/></svg></button>'
      +'<button class="vp-act" data-act="copy" data-idx="'+i+'" title="Copy"><svg><use href="#i-copy"/></svg></button>'
      +'<button class="vp-act" data-idx="'+i+'" data-act="save" title="Lưu vào Kho câu"><svg><use href="#i-bookmark"/></svg></button>'
      +'</div></div>'
      +'<div class="vp-zh" id="vp-zh-'+i+'">'+renderZhWithWords(s.zh, i)+'</div>'
      +'<div class="vp-py" id="vp-py-'+i+'">'+esc(s.pinyin||'')+'</div>'
      +'<div class="vp-vi loading" id="vp-vi-'+i+'">Đang dịch...</div>'
      +'</div>';
  }).join('');
  applyVisibility();
  applyFilter();
}
function applyVisibility(){
  $$('.vp-zh').forEach(el=>el.classList.toggle('hide',!ST.showHan));
  $$('.vp-py').forEach(el=>el.classList.toggle('hide',!ST.showPy));
  $$('.vp-vi').forEach(el=>el.classList.toggle('hide',!ST.showVi));
  const b1=$('vpTHan'), b2=$('vpTPy'), b3=$('vpTVi');
  if(b1) b1.classList.toggle('on',ST.showHan);
  if(b2) b2.classList.toggle('on',ST.showPy);
  if(b3) b3.classList.toggle('on',ST.showVi);
}
function applyFilter(){
  const q=ST.searchQuery;
  ST.sentences.forEach((s,i)=>{
    const el=$('vp-card-'+i); if(!el) return;
    let show=true;
    if(q){ const hay=(s.zh+' '+(s.pinyin||'')+' '+(s.vi||'')).toLowerCase(); show=hay.includes(q); }
    if(show && ST.filterSaved) show=s.saved;
    el.classList.toggle('hidden',!show);
  });
}

async function translateAll(){
  if(ST.translating) return; ST.translating=true;
  for(let i=0;i<ST.sentences.length;i++){
    const s=ST.sentences[i];
    if(s.vi) continue;
    const vi=await translateFull(s.zh);
    s.vi=vi||'';
    const el=$('vp-vi-'+i);
    if(el){ el.classList.remove('loading'); el.textContent=vi||'(không dịch được)'; }
  }
  ST.translating=false;
}

/* Library */
async function openLibrary(){
  const m=$('vpLibModal');
  const list=$('vpLibList');
  m.classList.add('show');
  list.innerHTML='<div style="padding:20px;text-align:center;color:var(--text3)">Đang tải...</div>';
  try{
    const all=await dbGetAll();
    all.sort((a,b)=>b.created-a.created);
    if(!all.length){ list.innerHTML='<div class="vp-empty"><span class="em">📚</span>Chưa có video nào được lưu</div>'; return; }
    list.innerHTML=all.map(v=>{
      const d=new Date(v.created);
      const size=(v.size/1024/1024).toFixed(1);
      return '<div class="vp-lib-item" data-id="'+esc(v.id)+'">'
        +'<span style="font-size:24px">🎬</span>'
        +'<div class="vp-lib-info"><div class="vp-lib-name">'+esc(v.name)+'</div>'
        +'<div class="vp-lib-meta">'+(v.sentences?.length||0)+' câu · '+size+'MB · '+d.toLocaleDateString('vi-VN')+'</div></div>'
        +'<button class="vp-lib-del" data-del="'+esc(v.id)+'">🗑</button>'
        +'</div>';
    }).join('');
    list.onclick=async e=>{
      const del=e.target.closest('[data-del]');
      if(del){
        e.stopPropagation();
        const id=del.dataset.del;
        if(!confirm('Xoá video này?')) return;
        await dbDel(id);
        openLibrary();
        vtoast('🗑 Đã xoá','ok');
        return;
      }
      const item=e.target.closest('.vp-lib-item');
      if(item){ loadFromLibrary(item.dataset.id); }
    };
  }catch(e){ list.innerHTML='<div class="vp-empty">Lỗi: '+e.message+'</div>'; }
}

async function loadFromLibrary(id){
  const all=await dbGetAll();
  const v=all.find(x=>x.id===id);
  if(!v){ vtoast('❌ Không tìm thấy','err'); return; }
  $('vpLibModal').classList.remove('show');
  vtoast('📂 Đang mở '+v.name,'ok');
  // Setup video
  $('vpVideoPH').style.display='none';
  $('vpVideo').classList.add('show');
  $('vpPlayerBar').classList.remove('hidden');
  $('vpReloadBtn').style.display='inline-flex';
  $('vpExportBtn').style.display='inline-flex';
  $('vpTitle').textContent=v.name;
  if(ST.videoUrl) URL.revokeObjectURL(ST.videoUrl);
  ST.videoUrl=URL.createObjectURL(v.blob);
  const vid=$('vpVideo');
  vid.src=ST.videoUrl;
  ST.video=vid;
  ST.duration=v.blob.size;  // will update on metadata
  vid.onloadedmetadata=()=>{ ST.duration=vid.duration; $('vpTimeDur').textContent=fmtLong(vid.duration); };
  vid.ontimeupdate=onVideoTime;
  vid.onplay=()=>{ const b=$('vpPlayBtn'); if(b) b.innerHTML='<svg><use href="#i-pause"/></svg>'; };
  vid.onpause=()=>{ const b=$('vpPlayBtn'); if(b) b.innerHTML='<svg><use href="#i-play"/></svg>'; };
  // Load sentences
  LOG('Loading library:', v.name, '| sentences:', (v.sentences||[]).length);
  if(!v.sentences || !v.sentences.length){ vtoast('⚠️ Video này chưa có transcript','err'); return; }
  loadOpenCC();
  await new Promise(r=>setTimeout(r, 400));
  ST.sentences = v.sentences.map((s,i)=>{
    const zhTrad = toTraditional(s.zh);
    return {
      idx:i, zh:zhTrad, start:s.start, end:s.end,
      pinyin: s.pinyin || localPinyin(zhTrad),
      vi:s.vi||'', saved:!!s.saved
    };
  });
  ST.currentIdx=-1; ST.currentVideoId=id;
  renderTranscript();
  setTag(ST.sentences.length+' câu');
  $('vpLoading').classList.remove('show');
  vtoast('📂 '+v.name+' ('+ST.sentences.length+' câu)','ok');
  // Dịch cái chưa có
  const needTrans = ST.sentences.filter(s=>!s.vi).length;
  if(needTrans > 0){
    LOG('Translating', needTrans, 'missing...');
    translateAll();
  } else {
    LOG('All sentences already translated');
  }
}

/* Export */
function openExportMenu(){
  const choice=prompt('Định dạng:\n1. SRT\n2. VTT\n3. LRC\n4. TXT\n5. CSV\n\nNhập 1-5:');
  if(!choice) return;
  const n=parseInt(choice);
  if(n<1||n>5){ vtoast('Chọn 1-5','err'); return; }
  let content='', ext='', mime='text/plain;charset=utf-8';
  const name=(ST.currentFileName||'transcript').replace(/\.[^.]+$/,'');
  if(n===1){ content=toSRT(); ext='.srt'; }
  else if(n===2){ content=toVTT(); ext='.vtt'; }
  else if(n===3){ content=toLRC(); ext='.lrc'; }
  else if(n===4){ content=toTXT(); ext='.txt'; }
  else { content='\ufeff'+toCSV(); ext='.csv'; mime='text/csv;charset=utf-8'; }
  download(content, name+ext, mime);
  vtoast('✅ Đã xuất '+name+ext,'ok');
}
function toSRT(){
  const pad=(n,w=2)=>String(Math.floor(n)).padStart(w,'0');
  const ms=n=>String(Math.floor((n%1)*1000)).padStart(3,'0');
  const t=s=>pad(s/3600)+':'+pad((s%3600)/60)+':'+pad(s%60)+','+ms(s);
  return ST.sentences.map((s,i)=>{ const st=s.start,en=s.end||s.start+3; return (i+1)+'\n'+t(st)+' --> '+t(en)+'\n'+s.zh+'\n'; }).join('\n');
}
function toVTT(){
  const pad=(n,w=2)=>String(Math.floor(n)).padStart(w,'0');
  const ms=n=>String(Math.floor((n%1)*1000)).padStart(3,'0');
  const t=s=>pad(s/3600)+':'+pad((s%3600)/60)+':'+pad(s%60)+'.'+ms(s);
  return 'WEBVTT\n\n'+ST.sentences.map((s,i)=>{ const st=s.start,en=s.end||s.start+3; return (i+1)+'\n'+t(st)+' --> '+t(en)+'\n'+s.zh+'\n'; }).join('\n');
}
function toLRC(){ return ST.sentences.map(s=>{ const m=Math.floor(s.start/60),sec=(s.start%60).toFixed(2).padStart(5,'0'); return '['+String(m).padStart(2,'0')+':'+sec+']'+s.zh; }).join('\n'); }
function toTXT(){ return ST.sentences.map(s=>s.zh).join('\n'); }
function toCSV(){ const q=v=>'"'+String(v||'').replace(/"/g,'""')+'"'; return 'Start,End,Chinese,Pinyin,Vietnamese\n'+ST.sentences.map(s=>[fmtLong(s.start),fmtLong(s.end||s.start+3),q(s.zh),q(s.pinyin),q(s.vi)].join(',')).join('\n'); }
function download(text,name,mime){ const b=new Blob([text],{type:mime||'text/plain;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }

/* Player buttons */
function bindPlayerButtons(){
  if(ST._player) return; ST._player=true;
  document.addEventListener('click', e=>{
    if(!ST.video) return;
    if(e.target.closest('#vpPlayBtn')){ ST.video.paused?ST.video.play():ST.video.pause(); return; }
    if(e.target.closest('#vpBack5')){ ST.video.currentTime=Math.max(0,ST.video.currentTime-5); return; }
    if(e.target.closest('#vpFwd5')){ ST.video.currentTime=Math.min(ST.duration,ST.video.currentTime+5); return; }
    if(e.target.closest('#vpMuteBtn')){ ST.video.muted=!ST.video.muted; e.target.closest('#vpMuteBtn').classList.toggle('on',ST.video.muted); return; }
    if(e.target.closest('#vpFullBtn')){ if(ST.video.requestFullscreen) ST.video.requestFullscreen(); return; }
    if(e.target.closest('#vpABBtn')){
      const b=e.target.closest('#vpABBtn');
      if(ST.abLoopA===null){ ST.abLoopA=ST.video.currentTime; b.textContent='A'; b.classList.add('on'); vtoast('A='+fmtLong(ST.abLoopA),'ok'); }
      else if(ST.abLoopB===null){ ST.abLoopB=ST.video.currentTime; b.textContent='A-B'; vtoast('B='+fmtLong(ST.abLoopB),'ok'); }
      else { ST.abLoopA=null; ST.abLoopB=null; b.textContent='A-B'; b.classList.remove('on'); vtoast('Xoá A-B','ok'); }
      return;
    }
    if(e.target.closest('#vpTHan')){ ST.showHan=!ST.showHan; applyVisibility(); return; }
    if(e.target.closest('#vpTPy')){ ST.showPy=!ST.showPy; applyVisibility(); return; }
    if(e.target.closest('#vpTVi')){ ST.showVi=!ST.showVi; applyVisibility(); return; }
    if(e.target.closest('#vpTAuto')){ ST.autoScroll=!ST.autoScroll; e.target.closest('#vpTAuto').classList.toggle('on',ST.autoScroll); vtoast(ST.autoScroll?'Auto BẬT':'Auto TẮT'); return; }
    if(e.target.closest('#vpTSaved')){ ST.filterSaved=!ST.filterSaved; e.target.closest('#vpTSaved').classList.toggle('on',ST.filterSaved); applyFilter(); return; }
  });
  document.addEventListener('click', e=>{
    const p=e.target.closest('#vpProgressVideo');
    if(!p||!ST.video||!ST.duration) return;
    const r=p.getBoundingClientRect();
    ST.video.currentTime=((e.clientX-r.left)/r.width)*ST.duration;
  });
}

document.addEventListener('keydown', e=>{
  const tag=e.target.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT') return;
  if(!ST.open){ if((e.key==='v'||e.key==='V')&&!e.metaKey&&!e.ctrlKey){ e.preventDefault(); openPage(); } return; }
  if(e.key==='Escape'){ if($('vpLibModal')?.classList.contains('show')){ $('vpLibModal').classList.remove('show'); return; } closePage(); return; }
  if(!ST.video) return;
  if(e.code==='Space'){ e.preventDefault(); ST.video.paused?ST.video.play():ST.video.pause(); }
  else if(e.key==='ArrowLeft'){ ST.video.currentTime=Math.max(0,ST.video.currentTime-5); }
  else if(e.key==='ArrowRight'){ ST.video.currentTime=Math.min(ST.duration,ST.video.currentTime+5); }
  else if(e.key==='m'||e.key==='M'){ ST.video.muted=!ST.video.muted; }
  else if(e.key==='f'||e.key==='F'){ if(ST.video.requestFullscreen) ST.video.requestFullscreen(); }
  else if(e.key==='n'||e.key==='N'){ if(ST.currentIdx<ST.sentences.length-1){ ST.video.currentTime=ST.sentences[ST.currentIdx+1].start; } }
  else if(e.key==='p'||e.key==='P'){ if(ST.currentIdx>0){ ST.video.currentTime=ST.sentences[ST.currentIdx-1].start; } }
});

function addHeaderBtn(){
  const hb=document.querySelector('.hbtns'); if(!hb||$('vpHeaderBtn')) return;
  const btn=document.createElement('button'); btn.className='hbtn'; btn.id='vpHeaderBtn'; btn.title='Video Transcript (V)';
  btn.style.cssText='background:linear-gradient(135deg,#8b5cf6,#6366f1)!important;color:#fff!important;border:none!important;font-weight:700!important;display:inline-flex!important;align-items:center!important;gap:6px!important;padding:0 12px!important;height:34px!important;border-radius:8px!important;cursor:pointer';
  btn.innerHTML='<svg style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><use href="#i-file"/></svg><span>Video</span>';
  btn.onclick=e=>{ e.stopPropagation(); openPage(); };
  const ref=document.getElementById('settingsBtn'); if(ref&&ref.parentElement===hb) hb.insertBefore(btn,ref); else hb.appendChild(btn);
}

function init(){
  loadOpenCC();
  addHeaderBtn();
  bindPlayerButtons();
  setInterval(()=>{ if(document.querySelector('.hbtns')&&!$('vpHeaderBtn')) addHeaderBtn(); },2500);
  console.log('[app20 v3.0] 📹 Video TRÊN + transcript DƯỚI + jump animation');
}
window.vpOpen=openPage; window.vpClose=closePage; window.vpState=ST;
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1100));
else setTimeout(init,1100);
})();
