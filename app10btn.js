'use strict';
/* app10btn.js — Thêm nút "Nhập văn" vào header */

(function(){

function addImportButton() {
  const hb = document.querySelector('.hbtns');
  if (!hb) {
    setTimeout(addImportButton, 500);
    return;
  }
  
  // Nếu đã có → không thêm nữa
  if (document.getElementById('openImportPageBtn')) return;
  
  const btn = document.createElement('button');
  btn.className = 'hbtn';
  btn.id = 'openImportPageBtn';
  btn.title = 'Nhập văn bản (I)';
  btn.style.background = 'linear-gradient(135deg, #8b5cf6, #6366f1)';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.fontWeight = '700';
  btn.style.boxShadow = '0 4px 14px rgba(139,92,246,.35)';
  btn.innerHTML = '<svg style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><use href="#i-file"/></svg><span>Nhập văn</span>';
  
  btn.onclick = () => {
    if (typeof window.impOpenPage === 'function') {
      window.impOpenPage();
    } else {
      if (typeof window.toast === 'function') {
        window.toast('❌ app10.js chưa nạp', 'err');
      }
    }
  };
  
  // Chèn trước nút settings
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn && settingsBtn.parentElement === hb) {
    hb.insertBefore(btn, settingsBtn);
  } else {
    hb.appendChild(btn);
  }
  
  console.log('[app10btn] Đã thêm nút "Nhập văn" vào header');
}

// Hotkey I
document.addEventListener('keydown', (e) => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (document.body.classList.contains('import-mode')) return;
  
  if (e.key === 'i' || e.key === 'I') {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (typeof window.impOpenPage === 'function') {
      window.impOpenPage();
    }
  }
});

// Chờ DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(addImportButton, 1500));
} else {
  setTimeout(addImportButton, 1500);
}

// Đảm bảo luôn có (nếu app6 chạy lại)
setInterval(() => {
  if (document.querySelector('.hbtns') && !document.getElementById('openImportPageBtn')) {
    addImportButton();
  }
}, 2000);

})();