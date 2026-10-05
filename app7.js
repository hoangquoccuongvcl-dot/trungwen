'use strict';
/* app7.js v1.0 — Góp ý / Feedback */

(function(){

const style = document.createElement('style');
style.textContent = [
'.fb-menu-item{position:relative}',
'.fb-hint{display:none;padding:10px 12px 12px 37px;font-size:11.5px;line-height:1.6;color:var(--text2);background:rgba(139,92,246,.08);border-radius:0 0 8px 8px;margin-top:-4px;border-left:2px solid #8b5cf6;animation:fadeInHint .2s ease}',
'.fb-hint.show{display:block}',
'@keyframes fadeInHint{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}',
'.fb-hint .fb-vi{display:block;margin-bottom:8px;color:var(--text)}',
'.fb-hint .fb-en{display:block;color:var(--text3);font-style:italic;margin-bottom:10px;font-size:10.5px}',
'.fb-hint .fb-line{display:inline-flex;align-items:center;gap:6px;background:#06c755;color:#fff;padding:6px 12px;border-radius:6px;font-weight:700;font-size:11.5px;text-decoration:none;transition:.15s}',
'.fb-hint .fb-line:hover{background:#05a647}',
'.fb-hint .fb-line svg{width:13px;height:13px;fill:currentColor}',
'.fb-hint .fb-line .lbl{font-weight:600;opacity:.9;margin-right:2px}'
].join('\n');
document.head.appendChild(style);

function addFeedbackItem() {
  const menu = document.getElementById('moreMenu');
  if (!menu || menu.querySelector('[data-act="feedback"]')) return;

  const sep = document.createElement('div');
  sep.className = 'more-menu-sep';

  const wrap = document.createElement('div');
  wrap.className = 'fb-menu-item';

  const item = document.createElement('div');
  item.className = 'more-menu-item';
  item.setAttribute('data-act', 'feedback');
  item.innerHTML = [
    '<svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">',
    '  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    '</svg>',
    '<span>Góp ý / Feedback</span>'
  ].join('');

  const hint = document.createElement('div');
  hint.className = 'fb-hint';
  hint.id = 'fbHint';
  hint.innerHTML = [
    '<span class="fb-vi">💡 Nếu bạn muốn <b>đề xuất, cải thiện, thêm tính năng</b> nào, hãy liên hệ:</span>',
    '<span class="fb-en">If you want to <b>suggest, improve, or request features</b>, please contact:</span>',
    '<a class="fb-line" href="https://line.me/ti/p/~056207009166" target="_blank" rel="noopener">',
    '  <svg viewBox="0 0 24 24"><path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>',
    '  <span class="lbl">LINE ID:</span>',
    '  <span>056207009166</span>',
    '</a>'
  ].join('');

  wrap.appendChild(item);
  wrap.appendChild(hint);
  menu.appendChild(sep);
  menu.appendChild(wrap);

  item.addEventListener('click', (e) => {
    e.stopPropagation();
    hint.classList.toggle('show');
  });
}

let attempts = 0;
const timer = setInterval(() => {
  attempts++;
  const menu = document.getElementById('moreMenu');
  if (menu) {
    addFeedbackItem();
    clearInterval(timer);
  }
  if (attempts > 30) clearInterval(timer);
}, 300);

setTimeout(() => {
  console.log('[app7 v1.0] Feedback menu item loaded');
}, 1500);

})();