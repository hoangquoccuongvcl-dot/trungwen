'use strict';
/* app25.js v1.0 — SINGLE SOURCE highlight, class r25-hl */
(function(){
if (!window.DD) return;

/* ============ CSS: class r25-hl duy nhất ============ */
const CSS = ""
+ ".ruby-char.r25-hl .ruby-zh{border-color:#10b981!important;border-width:2px!important;border-style:solid!important;background:transparent!important;box-shadow:none!important;}"
/* Ẩn mọi class cũ nếu app20/23 vẫn set */
+ ".ruby-char.word-active .ruby-zh,"
+ ".ruby-char.word-DEAD .ruby-zh,"
+ ".ruby-char.NEVER .ruby-zh{"
+   "border-color:transparent!important;"
+   "background:transparent!important;"
+   "box-shadow:none!important;"
+ "}";

const s = document.createElement('style');
s.id = 'app25-styles';
const old = document.getElementById('app25-styles');
if (old) old.remove();
s.textContent = CSS;
document.head.appendChild(s);

/* ============ STATE ============ */
const S = {
  curSentence: -1,
  curChar: -1,
  lastStepMs: 0,
  rafId: null,
  perMs: 0
};

const hasHan = c => /[\u4e00-\u9fa5]/.test(c);

function clearHL(){
  document.querySelectorAll('.ruby-char.r25-hl').forEach(el => el.classList.remove('r25-hl'));
}

function applyHL(chars, idx){
  // Xóa hết
  document.querySelectorAll('.ruby-char.r25-hl').forEach(el => {
    if (!chars[idx] || el !== chars[idx]) el.classList.remove('r25-hl');
  });
  // Chỉ set cho chữ mục tiêu
  if (chars[idx] && !chars[idx].classList.contains('r25-hl')){
    chars[idx].classList.add('r25-hl');
  }
}

function reset(){
  S.curSentence = -1;
  S.curChar = -1;
  S.lastStepMs = 0;
  clearHL();
}

/* ============ RAF LOOP ============ */
function tick(){
  S.rafId = requestAnimationFrame(tick);
  const ST = window.vpState;
  if (!ST || !ST.video || ST.currentIdx < 0){ reset(); return; }
  if (ST.video.paused || ST.video.ended){ return; }

  const s = ST.sentences[ST.currentIdx];
  if (!s) return;

  // Sentence đổi → reset
  if (S.curSentence !== ST.currentIdx){
    S.curSentence = ST.currentIdx;
    S.curChar = -1;
    S.lastStepMs = 0;
    clearHL();
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

  // Tính perMs 1 lần cho câu này
  if (S.perMs === 0 || S.curChar === -1){
    S.perMs = (dur * 1000) / chars.length;
  }
  const perMs = S.perMs;

  // Target index
  let targetIdx = Math.floor(elapsed * 1000 / perMs);
  if (targetIdx < 0) targetIdx = 0;
  if (targetIdx >= chars.length) targetIdx = chars.length - 1;

  // === Lần đầu tiên của câu ===
  if (S.curChar === -1){
    S.curChar = targetIdx;
    S.lastStepMs = performance.now();
    applyHL(chars, S.curChar);
    return;
  }

  // === Seek lùi: nhảy thẳng ===
  if (targetIdx < S.curChar){
    S.curChar = targetIdx;
    S.lastStepMs = performance.now();
    applyHL(chars, S.curChar);
    return;
  }

  // === Tiến: chỉ tiến 1 bước, mỗi perMs ===
  if (targetIdx > S.curChar){
    const now = performance.now();
    if (now - S.lastStepMs >= perMs){
      S.curChar += 1;
      S.lastStepMs = now;
      applyHL(chars, S.curChar);
    }
    // Nếu vẫn còn cách xa → step tiếp ở frame sau, KHÔNG nhảy cóc
  }
}

function start(){
  if (S.rafId) return;
  S.rafId = requestAnimationFrame(tick);
}

/* ============ EVENT HOOKS ============ */
document.addEventListener('pause', () => { clearHL(); S.curChar = -1; S.lastStepMs = 0; }, true);
document.addEventListener('seeking', () => { clearHL(); S.curChar = -1; S.lastStepMs = 0; }, true);

/* ============ CLEANUP: xóa class cũ mỗi 300ms ============ */
setInterval(() => {
  document.querySelectorAll('.ruby-char.word-active, .ruby-char.word-DEAD, .ruby-char.NEVER').forEach(el => {
    el.classList.remove('word-active');
    el.classList.remove('word-DEAD');
    el.classList.remove('NEVER');
  });
}, 300);

/* ============ INIT ============ */
function init(){
  start();
  setInterval(() => {
    // Đảm bảo video vẫn được track
    if (!S.rafId) start();
  }, 2000);
  console.log('[app25 v1.0] ✅ Single-source highlight (class r25-hl)');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 2000));
else setTimeout(init, 2000);
})();
