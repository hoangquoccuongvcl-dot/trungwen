window.__APP23_DISABLED__ = true;
'use strict';
/* app23.js v4.0 — Ruby layout + box highlight (no jump) + color vars */
(function(){
if (!window.DD) return;

/* ============ CSS ============ */
const CSS = ""
/* Ruby layout */
+ ".ruby-line{display:flex!important;flex-wrap:wrap!important;gap:10px 8px!important;align-items:flex-end!important;line-height:1!important}"
+ ".ruby-char{display:inline-flex!important;flex-direction:column!important;align-items:center!important;"
+   "padding:2px 3px!important;border-radius:6px!important;"
+   "border:2.5px solid transparent!important;"
+   "transition:border-color .15s,background .15s!important;"
+   "line-height:1!important;vertical-align:top!important;"
+   "background:transparent!important;box-sizing:border-box!important}"

/* Pinyin */
+ ".ruby-py{font-size:calc(var(--ruby-zh-size,20px)*0.55)!important;"
+   "color:var(--color-py,#fff)!important;"
+   "font-family:ui-monospace,'SF Mono',monospace!important;"
+   "letter-spacing:.2px!important;line-height:1!important;"
+   "margin-bottom:4px!important;white-space:nowrap!important;font-weight:600!important;"
+   "transition:color .15s!important}"

/* Hán tự */
+ ".ruby-zh{font-size:var(--ruby-zh-size,20px)!important;font-family:\"PingFang TC\",\"Microsoft JhengHei\",sans-serif!important;line-height:1.1!important;color:var(--color-zh,#fff)!important;font-weight:500!important;display:inline-block!important;text-align:center!important;padding:1px 4px!important;box-sizing:border-box!important;border:2px solid transparent!important;border-radius:6px!important;min-width:calc(var(--ruby-zh-size,20px)*1.2)!important;transition:border-color .12s!important}"

/* Dịch */
+ ".vp-vi,.svi,.impv-card-vi{color:var(--color-vi,#fff)!important;font-style:normal!important}"

/* === ACTIVE: ô vuông xanh, KHÔNG nhảy, KHÔNG scale === */
+ ".ruby-char.NEVER{border-color:#10b981!important;background:rgba(16,185,129,.08)!important;box-shadow:0 0 14px rgba(16,185,129,.6),inset 0 0 8px rgba(16,185,129,.2)!important;transform:none!important;border-width:2.5px!important;border-style:solid!important}"
+ ".ruby-char.NEVER .ruby-zh{color:var(--color-zh,#fff)!important;font-weight:500!important;text-shadow:none!important}"
+ ".ruby-char.NEVER .ruby-py{color:var(--color-py,#fff)!important;font-weight:600!important}"

/* Size presets */
+ ".vp-card.size-S{--ruby-zh-size:15px!important}"
+ ".vp-card.size-M{--ruby-zh-size:20px!important}"
+ ".vp-card.size-L{--ruby-zh-size:23px!important}"
+ ".vp-card.size-XL{--ruby-zh-size:27px!important}"
+ "body[data-fs='S']{--ruby-zh-size:16px!important}"
+ "body[data-fs='M']{--ruby-zh-size:19px!important}"
+ "body[data-fs='L']{--ruby-zh-size:22px!important}"
+ "body[data-fs='XL']{--ruby-zh-size:26px!important}"

/* Ẩn pinyin gốc */
+ ".spy.ruby-hidden,.vp-py.ruby-hidden,.impv-card-py.ruby-hidden{display:none!important}"

/* ===== Màu tùy chỉnh từ settings ===== */
+ "body.fc-py-white{--color-py:#fff!important}"
+ "body.fc-py-yellow{--color-py:var(--color-py,#fff)!important}"
+ "body.fc-py-blue{--color-py:#60a5fa!important}"
+ "body.fc-py-green{--color-py:#10b981!important}"
+ "body.fc-zh-white{--color-zh:#fff!important}"
+ "body.fc-zh-yellow{--color-zh:var(--color-zh,#fff)!important}"
+ "body.fc-zh-blue{--color-zh:#60a5fa!important}"
+ "body.fc-vi-white{--color-vi:#fff!important}"
+ "body.fc-vi-gray{--color-vi:#94a3b8!important}"
+ "body.fc-vi-green{--color-vi:#10b981!important}"
+ "body.fc-vi-yellow{--color-vi:var(--color-py,#fff)!important}";

const style = document.createElement('style');
style.id = 'app23-ruby-css';
const old = document.getElementById('app23-ruby-css');
if (old) old.remove();
style.textContent = CSS;
document.head.appendChild(style);

/* ============ BUILD RUBY ============ */
const hasHan = s => /[\u4e00-\u9fa5]/.test(s);

function buildRuby(zh, py){
  const chars = [...zh];
  let html = '';
  for (const ch of chars){
    if (/[\u4e00-\u9fa5]/.test(ch)){
      // Gọi pinyin-pro cho TỪNG CHỮ để đảm bảo 1:1
      let p = '';
      if (window.pinyinPro){
        try {
          p = window.pinyinPro.pinyin(ch, { toneType:'symbol', type:'string', nonZh:'removed' });
        } catch(e){ p = ''; }
      }
      html += '<span class="ruby-char">'
            +   '<span class="ruby-py">' + p + '</span>'
            +   '<span class="ruby-zh">' + ch + '</span>'
            + '</span>';
    } else {
      const disp = ch === ' ' ? '&nbsp;' : ch;
      html += '<span class="ruby-char ruby-punct">'
            +   '<span class="ruby-py">&nbsp;</span>'
            +   '<span class="ruby-zh">' + disp + '</span>'
            + '</span>';
    }
  }
  return html;
}

function transformCard(card){
  if (!card) return false;
  const zhEl = card.querySelector('.szh, .vp-zh, .impv-card-zh');
  const pyEl = card.querySelector('.spy, .vp-py, .impv-card-py');
  if (!zhEl) return false;
  if (zhEl.classList.contains('ruby-line') && card.dataset.rubyZh === zhEl.textContent.replace(/\s+/g,'').trim()) return true;
  if (!pyEl) return false;
  const py = pyEl.textContent.trim();
  if (!py) return false;

  let zh;
  if (zhEl.classList.contains('ruby-line')){
    zh = [...zhEl.querySelectorAll('.ruby-zh')].map(x=>x.textContent).join('');
    zhEl.classList.remove('ruby-line');
    pyEl.classList.remove('ruby-hidden');
    zhEl.textContent = zh;
  } else {
    zh = zhEl.textContent.trim();
  }
  if (!zh || !hasHan(zh)) return false;

  pyEl.classList.add('ruby-hidden');
  zhEl.classList.add('ruby-line');
  zhEl.innerHTML = buildRuby(zh, py);
  card.dataset.rubyDone = '1';
  card.dataset.rubyZh = zh.replace(/\s+/g,'');
  return true;
}

function scanAll(){
  document.querySelectorAll('.sent, .vp-card, .impv-card').forEach(transformCard);
}

const retryQueue = new Set();
function scanWithRetry(){
  document.querySelectorAll('.sent, .vp-card, .impv-card').forEach(card=>{
    const ok = transformCard(card);
    if (!ok){
      const zhEl = card.querySelector('.szh, .vp-zh, .impv-card-zh');
      if (zhEl && hasHan(zhEl.textContent)) retryQueue.add(card);
    }
  });
  if (retryQueue.size > 0){
    const toRetry = [...retryQueue];
    retryQueue.clear();
    setTimeout(()=>{
      toRetry.forEach(c=>{
        if (document.body.contains(c)){
          const ok = transformCard(c);
          if (!ok) retryQueue.add(c);
        }
      });
    }, 300);
  }
}

function observe(){
  ['transcriptArea','vpList','impvListInner'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    new MutationObserver(()=>requestAnimationFrame(scanWithRetry)).observe(el, { childList:true, subtree:true });
  });
}

/* ============ VIDEO HIGHLIGHT (BOX, no jump) ============ */

/* ============ EXPOSE ============ */
let lastSentenceIdx = -1;
let lastCharIdx = -1;
let rafStarted = false;

function resetSeq(idx){
  lastSentenceIdx = idx;
  lastCharIdx = -1;
  document.querySelectorAll('.ruby-char.NEVER').forEach(el => el.classList.remove('word-DEAD'));
}

function tickHighlight(){
  requestAnimationFrame(tickHighlight);
  const ST = window.vpState;
  if (!ST || !ST.video || ST.currentIdx < 0) return;
  if (ST.video.paused || ST.video.ended) return;
  const s = ST.sentences[ST.currentIdx];
  if (!s) return;

  // Sentence đổi → reset
  if (lastSentenceIdx !== ST.currentIdx){
    resetSeq(ST.currentIdx);
    return;
  }

  const card = document.getElementById('vp-card-' + ST.currentIdx);
  if (!card) return;
  const chars = [...card.querySelectorAll('.ruby-char')].filter(c => {
    const z = c.querySelector('.ruby-zh');
    return z && hasHan(z.textContent);
  });
  if (!chars.length) return;

  const dur = (s.end || s.start + 3) - s.start;
  if (dur <= 0) return;
  const elapsed = ST.video.currentTime - s.start;
  if (elapsed < 0) return;

  const per = dur / chars.length;
  let targetIdx = Math.floor(elapsed / per);
  if (targetIdx < 0) targetIdx = 0;
  if (targetIdx >= chars.length) targetIdx = chars.length - 1;

  // Seek về trước → nhảy thẳng
  if (targetIdx < lastCharIdx){
    lastCharIdx = targetIdx;
    applyActive(chars, lastCharIdx);
    return;
  }

  // Tiến từng chữ một — không nhảy cóc
  if (lastCharIdx < 0){
    lastCharIdx = targetIdx;  // lần đầu set đúng vị trí
    applyActive(chars, lastCharIdx);
  } else if (targetIdx > lastCharIdx){
    lastCharIdx = lastCharIdx + 1;  // chỉ tiến 1 bước
    applyActive(chars, lastCharIdx);
  }
}

function applyActive(chars, idx){
  for (let i = 0; i < chars.length; i++){
    if (i === idx){
      if (!chars[i].classList.contains('word-DEAD')) chars[i].classList.add('word-DEAD');
    } else if (chars[i].classList.contains('word-DEAD')){
      chars[i].classList.remove('word-DEAD');
    }
  }
}

function startRaf(){
  if (rafStarted) return;
  rafStarted = true;
  requestAnimationFrame(tickHighlight);
}

/* Reset khi video seek/pause */
document.addEventListener('seeked', ()=>{ lastCharIdx = -1; }, true);
document.addEventListener('play', ()=>{ /* keep */ }, true);

window.RubyLayout = {
  refresh: scanWithRetry,
  clear: ()=>document.querySelectorAll('.ruby-char.NEVER').forEach(el=>el.classList.remove('word-DEAD'))
};

function init(){
  scanWithRetry();
  observe();
  setInterval(scanWithRetry, 400);
  startRaf();
  console.log('[app23 v4.0] ✅ Ruby + box highlight (no jump) + color vars');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1800));
else setTimeout(init, 1800);
})();
