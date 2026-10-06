'use strict';
/* app30.js v1.0 — Ẩn hoàn toàn Kho câu */
(function(){
if (window.__app30_loaded) return;
window.__app30_loaded = true;

// 1. CSS ẩn
const s = document.createElement('style');
s.id = 'app30-styles';
s.textContent = `
  #savedBtn{display:none!important}
  #savedModal{display:none!important}
  .mobile-drawer-item[data-act="saved"],
  .mobile-menu-item[data-act="saved"],
  .m27-item[data-act="saved"],
  [data-act="saved"]{display:none!important}
`;
document.head.appendChild(s);

// 2. Diệt nút + modal bằng JS
function kill(){
  // Nút header
  var b = document.getElementById('savedBtn');
  if (b) b.remove();
  
  // Nút trong các menu mobile
  document.querySelectorAll('[data-act="saved"]').forEach(function(el){ el.remove(); });
  
  // Modal
  var m = document.getElementById('savedModal');
  if (m) m.remove();
  
  // Hook: vô hiệu hóa hotkey S
  document.addEventListener('keydown', function(e){
    if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey){
      var tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.stopImmediatePropagation();
    }
  }, true);
}

setTimeout(kill, 500);
setTimeout(kill, 1500);
setTimeout(kill, 3000);
setInterval(kill, 2000);

console.log('[app30 v1.0] ✅ Đã ẩn Kho câu');
})();
