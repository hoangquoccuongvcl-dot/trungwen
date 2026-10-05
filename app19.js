'use strict';
/* app19.js v13.0 — Client-side chunking + Argos translate realtime */
(function(){
if (!window.DD) { console.error('[app19] Cần app4.js!'); return; }
const $ = id => document.getElementById(id);
const esc = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s||'').replace(/[^\u4e00-\u9fa5]/g, '');
const LOG = (...a) => console.log('[rec]', ...a);

const CSS = ".rtr-page{position:fixed;inset:0;background:var(--bg);z-index:98;display:none;flex-direction:column}.rtr-page.show{display:flex}"
+ ".rtr-top{height:60px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 16px;gap:10px}"
+ ".rtr-back{width:38px;height:38px;border-radius:10px;background:var(--card);border:1px solid var(--border);color:var(--text);display:flex;align-items:center;justify-content:center;cursor:pointer}.rtr-back svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;transform:rotate(180deg)}"
+ ".rtr-title{flex:1;font-size:15px;font-weight:800;display:flex;align-items:center;gap:8px}"
+ ".rtr-dot{width:10px;height:10px;border-radius:50%;background:#64748b}.rtr-page.recording .rtr-dot{background:#e11d48;box-shadow:0 0 12px #e11d48;animation:rtrPulse 1s infinite}@keyframes rtrPulse{0%,100%{opacity:1}50%{opacity:.3}}"
+ ".rtr-tag{font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;background:rgba(16,185,129,.15);color:#10b981;text-transform:uppercase}"
+ ".rtr-meter{width:60px;height:6px;background:var(--card);border-radius:3px;overflow:hidden;flex-shrink:0}.rtr-meter-fill{height:100%;background:#10b981;width:0;transition:width .05s}"
+ ".rtr-timer{font-family:ui-monospace,monospace;font-size:13px;font-weight:700;color:var(--text2);padding:5px 10px;background:var(--bg);border-radius:8px;border:1px solid var(--border)}"
+ ".rtr-body{flex:1;overflow-y:auto;padding:20px 24px 200px}.rtr-inner{max-width:820px;margin:0 auto}"
+ ".rtr-hint{text-align:center;padding:60px 20px;color:var(--text3)}.rtr-hint .em{font-size:56px;opacity:.3;display:block;margin-bottom:16px}.rtr-hint h3{font-size:15px;color:var(--text2);margin-bottom:10px}"
+ ".rtr-live{background:linear-gradient(90deg,rgba(139,92,246,.15),transparent);border:1.5px solid rgba(139,92,246,.5);border-radius:14px;padding:16px 18px;margin-bottom:14px;display:none}.rtr-live.show{display:block}"
+ ".rtr-live-label{font-size:10px;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:6px}.rtr-live-label::before{content:'●';color:#e11d48;animation:rtrPulse .8s infinite}"
+ ".rtr-live-zh{font-size:22px;font-weight:600;line-height:1.6;color:var(--text);font-family:'PingFang TC',sans-serif;word-break:break-word}"
+ ".rtr-live-py{font-size:13px;color:var(--accent2);margin-top:8px;font-family:ui-monospace,monospace;min-height:14px}"
+ ".rtr-live-vi{font-size:13px;color:#10b981;margin-top:8px;font-style:italic;line-height:1.5;min-height:0;display:none}.rtr-live-vi.show{display:block}"
+ ".rtr-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px 18px;margin-bottom:12px;animation:rtrSlide .22s}.rtr-card.new{background:linear-gradient(90deg,rgba(16,185,129,.12),transparent);border-color:rgba(16,185,129,.4)}@keyframes rtrSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}"
+ ".rtr-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px dashed var(--border)}"
+ ".rtr-num{font-size:10.5px;font-weight:800;color:var(--text3);background:var(--bg);padding:3px 9px;border-radius:6px;border:1px solid var(--border);font-family:ui-monospace,monospace}"
+ ".rtr-time{font-size:10.5px;color:var(--text3);font-family:ui-monospace,monospace}"
+ ".rtr-acts{margin-left:auto;display:flex;gap:4px}"
+ ".rtr-act{width:30px;height:30px;border-radius:8px;background:var(--bg);border:1px solid var(--border);color:var(--text3);cursor:pointer;display:flex;align-items:center;justify-content:center}.rtr-act svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2}.rtr-act.saved{color:var(--green);background:rgba(16,185,129,.12)}"
+ ".rtr-zh{font-size:20px;font-weight:500;line-height:1.7;color:var(--text);font-family:'PingFang TC',sans-serif;word-break:break-word}"
+ ".rtr-py{font-size:12.5px;color:var(--accent2);margin-top:6px;font-family:ui-monospace,monospace}"
+ ".rtr-vi{font-size:13px;color:var(--text2);margin-top:10px;padding-top:10px;border-top:1px dashed var(--border);font-style:italic;line-height:1.55;min-height:18px}"
+ ".rtr-vi.loading{color:var(--text3);font-style:normal;opacity:.6}"
+ ".rtr-bar{position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);padding:14px 20px calc(18px + env(safe-area-inset-bottom));display:flex;gap:12px;align-items:center;justify-content:center;z-index:99}"
+ ".rtr-btn{padding:14px 28px;border-radius:12px;border:none;font-size:14px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-family:inherit;min-height:52px}"
+ ".rtr-btn svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round}"
+ ".rtr-btn.main{background:linear-gradient(135deg,#e11d48,#be123c);color:#fff;box-shadow:0 6px 20px rgba(225,29,72,.45);min-width:200px;justify-content:center}.rtr-btn.main.stop{background:linear-gradient(135deg,#64748b,#475569);box-shadow:none}"
+ ".rtr-btn.sub{background:var(--card);color:var(--text2);border:1px solid var(--border);padding:14px 16px}.rtr-btn:disabled{opacity:.5}"
+ ".rtr-btn .pulse{display:inline-block;width:12px;height:12px;border-radius:50%;background:#fff;animation:rtrPulse 1s infinite}"
+ ".rtr-status{position:fixed;top:74px;left:50%;transform:translateX(-50%);background:var(--card);border:1px solid var(--border);color:var(--text);padding:9px 16px;border-radius:10px;font-size:12px;font-weight:600;z-index:100;opacity:0;transition:.25s;pointer-events:none}.rtr-status.show{opacity:1}.rtr-status.err{border-color:var(--rose);color:var(--rose)}.rtr-status.ok{border-color:var(--green);color:var(--green)}"
+ "@media(max-width:700px){.rtr-body{padding:12px 10px 200px}.rtr-zh{font-size:17px}.rtr-live-zh{font-size:17px}.rtr-btn{padding:12px 16px;font-size:13px;min-height:48px}.rtr-top{padding:6px 10px;gap:6px;flex-wrap:wrap;height:auto;min-height:56px}.rtr-timer{font-size:11.5px;padding:4px 7px}.rtr-meter{width:40px}}";

const st = document.createElement('style'); st.id = 'app19-styles'; st.textContent = CSS;
if (!document.getElementById('app19-styles')) document.head.appendChild(st);

const ST = {
  open:false, recording:false, sentences:[],
  startedAt:0, timerInterval:null,
  recognition:null, restartTimer:null, restartCount:0,
  vadStream:null, audioCtx:null, analyser:null, vadBuffer:null, vadRAF:null,
  vadSilenceStart:0, VAD_RMS:0.006, VAD_SILENCE_MS:700,
  finalized:'', interim:'',
  lastSentences:[], autoTranslate:true,
  interimTransTimer:null, interimTransCache:{}, pendingInterimClean:null, interimFetching:false
};

let toastT;
function rtoast(msg,type){ const el=$('rtrStatus'); if(!el)return; el.textContent=msg; el.className='rtr-status '+(type||''); requestAnimationFrame(()=>el.classList.add('show')); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('show'),2600); }
function setTag(t,c){ const el=$('rtrTag'); if(el){ el.textContent=t; el.className='rtr-tag'+(c?' '+c:''); } }
function setLive(on){ const el=$('rtrLive'); if(el) el.classList.toggle('show',on); }
function setMeter(rms){ const f=$('rtrMeterFill'); if(!f)return; const pct=Math.min(100,rms*400); f.style.width=pct+'%'; f.style.background=rms>ST.VAD_RMS?'#10b981':'#64748b'; }
function localPinyin(t){ const c=norm(t); if(!c)return ''; if(window.pinyinPro){ try{ return window.pinyinPro.pinyin(c,{toneType:'symbol',type:'string',nonZh:'removed'}); }catch(e){} } return ''; }

/* ============ CLIENT-SIDE CHUNKING ============ */
function splitTextIntoChunks(text, maxLen){
  text = String(text||'').trim();
  if(!text) return [];
  if(text.length <= maxLen) return [text];
  // Ưu tiên cắt ở dấu câu
  const parts = text.split(/([，。！？、；：,.!?;:])/).filter(x=>x);
  const chunks = [];
  let cur = '';
  for(const p of parts){
    if(!p) continue;
    if(cur.length + p.length <= maxLen){
      cur += p;
    } else {
      if(cur.trim()) chunks.push(cur.trim());
      if(/^[，。！？、；：,.!?;:]$/.test(p)){
        if(chunks.length) chunks[chunks.length-1] += p;
        cur = '';
      } else {
        cur = p;
      }
    }
  }
  if(cur.trim()) chunks.push(cur.trim());
  // Cắt cứng chunk quá dài
  const final = [];
  for(const ch of chunks){
    if(ch.length <= maxLen*1.6) final.push(ch);
    else {
      for(let i=0;i<ch.length;i+=maxLen) final.push(ch.slice(i,i+maxLen));
    }
  }
  return final.filter(x=>x.length>=1);
}

/* ============ TRANSLATE 1 CHUNK (cached) ============ */
async function translateChunk(ch){
  ch = ch.trim(); if(!ch) return '';
  const ck = 'dd_c_' + ch;
  const cached = localStorage.getItem(ck);
  if(cached) return cached;
  try{
    const r = await fetch('/api/translate?q=' + encodeURIComponent(ch));
    if(!r.ok) return '';
    const d = await r.json();
    const t = (d.text||'').trim();
    if(t){ try{ localStorage.setItem(ck,t); }catch(e){} }
    return t;
  }catch(e){ return ''; }
}

/* ============ TRANSLATE FULL (chunk song song) ============ */
async function translateFull(zh){
  const clean = norm(zh); if(!clean) return '';
  const chunks = splitTextIntoChunks(clean, 11);
  LOG('📦 ' + chunks.length + ' chunks: ' + JSON.stringify(chunks));
  const results = await Promise.all(chunks.map(translateChunk));
  const fullVi = results.filter(x=>x).join(' ').trim();
  LOG('✅ translated: ' + fullVi.slice(0, 100));
  return fullVi;
}

/* ============ UPDATE LIVE ============ */
function updateLive(zh){
  const lz=$('rtrLiveZh'), lp=$('rtrLivePy'), lv=$('rtrLiveVi');
  if(lz) lz.textContent=zh;
  if(lp) lp.textContent=zh?localPinyin(zh):'';
  setLive(!!zh);
  if(!zh){ if(lv){ lv.textContent=''; lv.classList.remove('show'); } return; }
  const clean=norm(zh);
  if(clean.length<2){ return; }
  clearTimeout(ST.interimTransTimer);
  ST.interimTransTimer=setTimeout(()=>translateInterim(clean),150);
}

async function translateInterim(clean){
  const lv=$('rtrLiveVi'); if(!lv) return;
  // Nếu đã có cache cho text này → show luôn
  const ck = 'dd_f_' + clean;
  const cachedFull = localStorage.getItem(ck);
  if(cachedFull){ lv.textContent=cachedFull; lv.classList.add('show'); return; }
  // Coalescing
  ST.pendingInterimClean=clean;
  if(ST.interimFetching) return;
  ST.interimFetching=true;
  while(ST.pendingInterimClean){
    const c=ST.pendingInterimClean; ST.pendingInterimClean=null;
    const vi = await translateFull(c);
    if(vi){
      try{ localStorage.setItem('dd_f_'+c, vi); }catch(e){}
      // Chỉ update UI nếu không có request mới hơn
      if(!ST.pendingInterimClean){
        lv.textContent=vi;
        lv.classList.add('show');
      }
    }
  }
  ST.interimFetching=false;
}

/* ============ BUILD PAGE ============ */
function buildPage(){
  if($('rtrPage'))return;
  document.body.insertAdjacentHTML('beforeend',
    '<div class="rtr-page" id="rtrPage">'
    +'<div class="rtr-top">'
    +'<button class="rtr-back" id="rtrBack"><svg><use href="#i-chev"/></svg></button>'
    +'<div class="rtr-title"><span class="rtr-dot"></span><span>Ghi âm Real-time</span><span class="rtr-tag" id="rtrTag">Sẵn sàng</span></div>'
    +'<div class="rtr-meter"><div class="rtr-meter-fill" id="rtrMeterFill"></div></div>'
    +'<span class="rtr-timer" id="rtrTimer">00:00</span>'
    +'</div>'
    +'<div class="rtr-body" id="rtrBody"><div class="rtr-inner" id="rtrInner">'
    +'<div class="rtr-hint" id="rtrHint"><span class="em">🎙️</span><h3>Bấm "Bắt đầu" để ghi âm</h3><p>Nói tiếng Trung. Pinyin + dịch hiện realtime.</p></div>'
    +'<div class="rtr-live" id="rtrLive"><div class="rtr-live-label">Đang nói</div><div class="rtr-live-zh" id="rtrLiveZh"></div><div class="rtr-live-py" id="rtrLivePy"></div><div class="rtr-live-vi" id="rtrLiveVi"></div></div>'
    +'</div></div>'
    +'<div class="rtr-bar"><button class="rtr-btn sub" id="rtrClear"><svg><use href="#i-trash"/></svg></button><button class="rtr-btn main" id="rtrRec"><svg><use href="#i-mic"/></svg><span>Bắt đầu ghi âm</span></button><button class="rtr-btn sub" id="rtrSaveAll" disabled><svg><use href="#i-bookmark"/></svg></button></div>'
    +'</div>');
}
function openPage(){ buildPage(); $('rtrPage').classList.add('show'); ST.open=true; bindEvents(); }
function closePage(){ stopRecording(); const p=$('rtrPage'); if(p) p.classList.remove('show'); ST.open=false; }
function startTimer(){ const el=$('rtrTimer'); if(!el)return; stopTimer(); ST.timerInterval=setInterval(()=>{ const s=Math.floor((Date.now()-ST.startedAt)/1000); el.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); },500); }
function stopTimer(){ if(ST.timerInterval){ clearInterval(ST.timerInterval); ST.timerInterval=null; } }
function updateRecBtn(r){ const b=$('rtrRec'); if(!b)return; if(r){ b.classList.add('stop'); b.innerHTML='<span class="pulse"></span><span>Dừng ghi âm</span>'; } else { b.classList.remove('stop'); b.innerHTML='<svg><use href="#i-mic"/></svg><span>Bắt đầu ghi âm</span>'; } }

/* ============ VAD ============ */
async function startVAD(){
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    ST.vadStream=stream;
    const AC=window.AudioContext||window.webkitAudioContext;
    ST.audioCtx=new AC();
    const src=ST.audioCtx.createMediaStreamSource(stream);
    ST.analyser=ST.audioCtx.createAnalyser(); ST.analyser.fftSize=512;
    src.connect(ST.analyser);
    ST.vadBuffer=new Float32Array(ST.analyser.fftSize);
    ST.vadSilenceStart=0;
    tickVAD();
    LOG('VAD started sr='+ST.audioCtx.sampleRate);
    return true;
  }catch(e){ LOG('VAD fail:',e.message); rtoast('❌ Không mở được micro!','err'); return false; }
}
function tickVAD(){
  if(!ST.recording) return;
  ST.analyser.getFloatTimeDomainData(ST.vadBuffer);
  let sum=0; for(let i=0;i<ST.vadBuffer.length;i++) sum+=ST.vadBuffer[i]*ST.vadBuffer[i];
  const rms=Math.sqrt(sum/ST.vadBuffer.length);
  setMeter(rms);
  if(rms>ST.VAD_RMS){ ST.vadSilenceStart=0; }
  else {
    if(ST.vadSilenceStart===0) ST.vadSilenceStart=Date.now();
    else if(Date.now()-ST.vadSilenceStart>ST.VAD_SILENCE_MS){
      const live=(ST.finalized+ST.interim).trim();
      if(norm(live).length>=1){ LOG('VAD flush:',live); createSentence(live); ST.finalized=''; ST.interim=''; updateLive(''); }
      ST.vadSilenceStart=Date.now();
    }
  }
  ST.vadRAF=requestAnimationFrame(tickVAD);
}
function stopVAD(){
  if(ST.vadRAF) cancelAnimationFrame(ST.vadRAF); ST.vadRAF=null;
  if(ST.vadStream){ ST.vadStream.getTracks().forEach(t=>t.stop()); ST.vadStream=null; }
  if(ST.audioCtx){ try{ ST.audioCtx.close(); }catch(e){} ST.audioCtx=null; }
  ST.analyser=null;
}

/* ============ WEB SPEECH ============ */
function createRecognizer(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const rec=new SR();
  rec.lang='zh-TW'; rec.continuous=true; rec.interimResults=true; rec.maxAlternatives=1;
  rec.onstart=()=>{ LOG('onstart #'+ST.restartCount); setTag('Đang nghe...',''); };
  rec.onresult=(e)=>{
    let newFinal='', newInterim='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      const r=e.results[i];
      if(r.isFinal) newFinal+=r[0].transcript;
      else newInterim+=r[0].transcript;
    }
    if(newFinal){
      LOG('final:',newFinal);
      if(norm(newFinal).length>=1) createSentence(newFinal);
      ST.finalized=''; ST.interim=''; updateLive('');
    } else if(newInterim){
      ST.interim=newInterim;
      const live=(ST.finalized+newInterim).trim();
      if(live) updateLive(live);
      if(/[。！？.!?]/.test(newInterim) && norm(live).length>=2){
        LOG('instant split:',newInterim);
        createSentence(live);
        ST.finalized=''; ST.interim=''; updateLive('');
      }
    }
    ST.vadSilenceStart=0;
  };
  rec.onerror=(e)=>{
    const err=e.error||''; LOG('error:',err);
    if(err==='no-speech'||err==='aborted')return;
    if(err==='not-allowed'){ rtoast('❌ Chưa cấp quyền micro!','err'); stopRecording(); }
    if(err==='network') rtoast('⚠️ Cần Internet','err');
  };
  rec.onend=()=>{
    if(!ST.recording)return;
    ST.restartCount++;
    clearTimeout(ST.restartTimer);
    ST.restartTimer=setTimeout(()=>{
      if(!ST.recording)return;
      try{ rec.start(); }catch(e){ try{ createRecognizer(); }catch(e2){} }
    },50);
  };
  ST.recognition=rec;
  try{ rec.start(); }catch(e){ setTimeout(()=>{ if(ST.recording) createRecognizer(); },200); }
}

async function startRecording(){
  if(ST.recording)return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ rtoast('❌ Cần Chrome hoặc Safari!','err'); return; }
  ST.recording=true; ST.startedAt=Date.now(); ST.restartCount=0;
  ST.finalized=''; ST.interim=''; ST.lastSentences=[];
  ST.interimTransCache={}; ST.pendingInterimClean=null; ST.interimFetching=false;
  const h=$('rtrHint'); if(h) h.remove();
  updateRecBtn(true);
  $('rtrPage').classList.add('recording');
  setTag('Đang nghe...','');
  startTimer();
  const ok=await startVAD();
  if(!ok){ ST.recording=false; updateRecBtn(false); return; }
  createRecognizer();
  rtoast('🔴 Đang ghi âm...','ok');
}

function stopRecording(){
  if(!ST.recording)return;
  ST.recording=false;
  const live=(ST.finalized+ST.interim).trim();
  if(norm(live).length>=1){ createSentence(live); }
  ST.finalized=''; ST.interim='';
  updateLive('');
  clearTimeout(ST.restartTimer);
  clearTimeout(ST.interimTransTimer);
  if(ST.recognition){ try{ ST.recognition.onend=null; ST.recognition.abort(); }catch(e){} ST.recognition=null; }
  stopVAD(); stopTimer(); updateRecBtn(false);
  const p=$('rtrPage'); if(p) p.classList.remove('recording');
  setTag('Đã dừng','');
  rtoast('Đã dừng','ok');
}

function createSentence(text){
  const clean=norm(text);
  if(clean.length<1)return;
  if(ST.lastSentences.slice(-3).some(s=>s===clean))return;
  ST.lastSentences.push(clean);
  let parts=text.split(/[。！？.!?]+/).map(s=>s.trim()).filter(s=>norm(s).length>=1);
  if(parts.length===0) parts=[clean];
  if(parts.length===1 && norm(parts[0]).length>15){
    const cn=norm(parts[0]); parts=[];
    for(let i=0;i<cn.length;i+=12) parts.push(cn.slice(i,i+12));
  }
  parts.forEach(part=>{
    const pc=norm(part);
    if(pc.length<1) return;
    const withP=/[。！？.!?]$/.test(part.trim())?part.trim():pc+'。';
    const item={ zh:withP, pinyin:localPinyin(pc), vi:'', startTime:Date.now()-ST.startedAt, saved:false };
    ST.sentences.push(item);
    const idx=ST.sentences.length-1;
    appendCard(item,idx);
    if(ST.autoTranslate) translateItem(item,idx);
    LOG('#'+(idx+1)+': '+withP);
  });
  updateSaveAllBtn();
  const body=$('rtrBody'); if(body) body.scrollTop=body.scrollHeight;
}

function appendCard(item,idx){
  const inner=$('rtrInner'); if(!inner)return;
  const t=Math.floor(item.startTime/1000);
  const mm=String(Math.floor(t/60)).padStart(2,'0'), ss=String(t%60).padStart(2,'0');
  const live=$('rtrLive');
  const html='<div class="rtr-card new" id="rtr-card-'+idx+'">'
    +'<div class="rtr-head"><span class="rtr-num">#'+String(idx+1).padStart(2,'0')+'</span><span class="rtr-time">'+mm+':'+ss+'</span>'
    +'<div class="rtr-acts">'
    +'<button class="rtr-act" data-act="tts" data-idx="'+idx+'"><svg><use href="#i-vol"/></svg></button>'
    +'<button class="rtr-act" data-act="copy" data-idx="'+idx+'"><svg><use href="#i-copy"/></svg></button>'
    +'<button class="rtr-act" data-act="save" data-idx="'+idx+'"><svg><use href="#i-bookmark"/></svg></button>'
    +'<button class="rtr-act" data-act="del" data-idx="'+idx+'"><svg><use href="#i-trash"/></svg></button>'
    +'</div></div>'
    +'<div class="rtr-zh">'+esc(item.zh)+'</div>'
    +'<div class="rtr-py">'+esc(item.pinyin||'')+'</div>'
    +'<div class="rtr-vi loading" id="rtr-vi-'+idx+'">Đang dịch...</div>'
    +'</div>';
  if(live) live.insertAdjacentHTML('beforebegin',html);
  else inner.insertAdjacentHTML('beforeend',html);
  setTimeout(()=>{ const el=$('rtr-card-'+idx); if(el) el.classList.remove('new'); },1500);
}

async function translateItem(item,idx){
  const el=$('rtr-vi-'+idx); if(!el) return;
  const vi = await translateFull(item.zh);
  item.vi = vi||'';
  el.classList.remove('loading');
  el.textContent = vi || '(không dịch được)';
  el.style.color = vi ? '' : 'var(--text3)';
}

function saveItem(idx){ const it=ST.sentences[idx]; if(!it||it.saved)return; if(window.DD.addSentence(it.zh,{source:'Ghi âm'})){ it.saved=true; const b=document.querySelector('#rtr-card-'+idx+' [data-act="save"]'); if(b) b.classList.add('saved'); rtoast('💾 Đã lưu','ok'); } }
function deleteItem(idx){ const c=$('rtr-card-'+idx); if(c) c.remove(); ST.sentences[idx]=null; updateSaveAllBtn(); }
function speakItem(idx){ const it=ST.sentences[idx]; if(it&&window.DD.speak) window.DD.speak(it.zh); }
function copyItem(idx){ const it=ST.sentences[idx]; if(it) navigator.clipboard.writeText(it.zh).then(()=>rtoast('📋 Đã copy','ok')); }
function saveAll(){ let n=0; ST.sentences.forEach((it,i)=>{ if(!it||it.saved)return; if(window.DD.addSentence(it.zh,{source:'Ghi âm'})){ it.saved=true; const b=document.querySelector('#rtr-card-'+i+' [data-act="save"]'); if(b) b.classList.add('saved'); n++; } }); rtoast('💾 Đã lưu '+n,n>0?'ok':'err'); updateSaveAllBtn(); }
function updateSaveAllBtn(){ const b=$('rtrSaveAll'); if(b) b.disabled=ST.sentences.filter(x=>x&&!x.saved).length===0; }
function clearAll(){ if(!ST.sentences.length||!confirm('Xóa toàn bộ?'))return; ST.sentences=[]; ST.lastSentences=[]; ST.finalized=''; ST.interim=''; ST.interimTransCache={}; ST.pendingInterimClean=null; updateLive(''); $('rtrInner').innerHTML='<div class="rtr-hint" id="rtrHint"><span class="em">🎙️</span><h3>Bấm "Bắt đầu" để ghi âm</h3><p>Pinyin + dịch hiện realtime.</p></div><div class="rtr-live" id="rtrLive"><div class="rtr-live-label">Đang nói</div><div class="rtr-live-zh" id="rtrLiveZh"></div><div class="rtr-live-py" id="rtrLivePy"></div><div class="rtr-live-vi" id="rtrLiveVi"></div></div>'; updateSaveAllBtn(); }

let bound=false;
function bindEvents(){
  if(bound)return; bound=true;
  document.addEventListener('click',e=>{
    if(e.target.closest('#rtrBack'))return closePage();
    if(e.target.closest('#rtrRec')){ if(ST.recording) stopRecording(); else startRecording(); return; }
    if(e.target.closest('#rtrClear'))return clearAll();
    const sa=e.target.closest('#rtrSaveAll'); if(sa&&!sa.disabled)return saveAll();
    const act=e.target.closest('.rtr-act');
    if(act){ e.stopPropagation(); const idx=+act.dataset.idx,a=act.dataset.act; if(a==='tts')speakItem(idx); else if(a==='copy')copyItem(idx); else if(a==='save')saveItem(idx); else if(a==='del')deleteItem(idx); }
  });
}

function addHeaderBtn(){
  const hb=document.querySelector('.hbtns'); if(!hb||$('rtrHeaderBtn'))return;
  const btn=document.createElement('button'); btn.className='hbtn'; btn.id='rtrHeaderBtn'; btn.title='Ghi âm (R)';
  btn.style.cssText='background:linear-gradient(135deg,#e11d48,#be123c)!important;color:#fff!important;border:none!important;font-weight:700!important;display:inline-flex!important;align-items:center!important;gap:6px!important;padding:0 12px!important;height:34px!important;border-radius:8px!important;cursor:pointer';
  btn.innerHTML='<svg style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><use href="#i-mic"/></svg><span>Ghi âm</span>';
  btn.onclick=e=>{ e.stopPropagation(); openPage(); };
  const ref=document.getElementById('settingsBtn'); if(ref&&ref.parentElement===hb) hb.insertBefore(btn,ref); else hb.appendChild(btn);
}

document.addEventListener('keydown',e=>{ const tag=e.target.tagName; if(tag==='INPUT'||tag==='TEXTAREA')return; if(ST.open)return; if((e.key==='r'||e.key==='R')&&!e.metaKey&&!e.ctrlKey){ e.preventDefault(); openPage(); } });

function init(){ addHeaderBtn(); setInterval(()=>{ if(document.querySelector('.hbtns')&&!$('rtrHeaderBtn')) addHeaderBtn(); },2500); console.log('[app19 v13.0] ✅ Client chunking + Argos realtime'); }

window.rtrOpen=openPage; window.rtrClose=closePage; window.rtrState=ST;
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,900));
else setTimeout(init,900);
})();
