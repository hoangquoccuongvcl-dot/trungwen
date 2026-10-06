'use strict';
/* app31.js v1.0 — Chuyển Màu chữ + Cỡ chữ vào menu 3 gạch */
(function(){
if (window.__app31_loaded) return;
window.__app31_loaded = true;

// 1. CSS ẩn 2 nút khỏi header
const s = document.createElement('style');
s.id = 'app31-styles';
s.textContent = `
  #colorBtn, #fsToggleBtn { display: none !important; }
`;
document.head.appendChild(s);

// 2. Hàm mở modal Màu chữ (dự phòng nếu app24 có API khác)
function openColorModal(){
  var m = document.getElementById('csModal');
  if (m){ m.classList.add('show'); 
    var btns = m.querySelectorAll('.cs-color');
    btns.forEach(function(b){
      var key = b.parentElement.dataset.key;
      var st = JSON.parse(localStorage.getItem('dd_color_v1') || '{}');
      if (st[key] === b.dataset.c) b.classList.add('on'); else b.classList.remove('on');
    });
    return;
  }
  // Nếu chưa có modal → gọi app24
  var btn = document.getElementById('colorBtn');
  if (btn) btn.click();
}

// 3. Hàm mở popup Cỡ chữ
function openFontPopup(){
  var p = document.getElementById('fsPopup');
  if (p){ p.classList.toggle('show'); return; }
  var btn = document.getElementById('fsToggleBtn');
  if (btn) btn.click();
}

// 4. Chèn 2 mục vào các loại drawer khác nhau
function injectToDrawers(){
  // --- Drawer app27 (Mobile native) ---
  var drawers = document.querySelectorAll('.m27-drawer-box, .mobile-drawer-box, .mobile-menu');
  
  drawers.forEach(function(drawer){
    if (drawer.dataset.app31done === '1') return;
    
    // Tìm section "Công cụ" hoặc "Cài đặt" để chèn sau
    var sections = drawer.querySelectorAll('.m27-sec, .mobile-drawer-sec, h4');
    var targetSection = null;
    sections.forEach(function(sec){
      var txt = (sec.textContent || '').toLowerCase();
      if (txt.includes('công cụ') || txt.includes('cong cu') || txt.includes('cài đặt') || txt.includes('cai dat')){
        if (!targetSection) targetSection = sec;
      }
    });
    
    // Chèn sau section "Công cụ"
    if (targetSection){
      var nextSib = targetSection.nextElementSibling;
      while (nextSib && (nextSib.classList.contains('m27-item') || nextSib.classList.contains('mobile-drawer-item') || nextSib.classList.contains('mobile-menu-item'))){
        nextSib = nextSib.nextElementSibling;
      }
      
      var item1 = document.createElement('div');
      item1.className = targetSection.className.replace('-sec','-item').replace('mobile-drawer-sec','mobile-drawer-item').replace('mobile-menu','mobile-menu-item') || 'm27-item';
      item1.dataset.act = 'app31-color';
      item1.innerHTML = '<span class="m27-item-ico" style="font-size:18px;width:22px;text-align:center">🎨</span>Màu chữ';
      item1.onclick = function(){ 
        var d = this.closest('.m27-drawer, .mobile-drawer, .mobile-menu-overlay');
        if (d) d.classList.remove('show');
        setTimeout(openColorModal, 200);
      };
      
      var item2 = document.createElement('div');
      item2.className = item1.className;
      item2.dataset.act = 'app31-font';
      item2.innerHTML = '<span class="m27-item-ico" style="font-size:18px;width:22px;text-align:center">🔤</span>Cỡ chữ';
      item2.onclick = function(){ 
        var d = this.closest('.m27-drawer, .mobile-drawer, .mobile-menu-overlay');
        if (d) d.classList.remove('show');
        setTimeout(openFontPopup, 200);
      };
      
      // Chèn trước section tiếp theo
      if (nextSib){
        drawer.insertBefore(item1, nextSib);
        drawer.insertBefore(item2, nextSib);
      } else {
        drawer.appendChild(item1);
        drawer.appendChild(item2);
      }
    } else {
      // Không có section → chèn cuối drawer
      var item1 = document.createElement('div');
      item1.className = 'm27-item';
      item1.innerHTML = '<span class="m27-item-ico" style="font-size:18px;width:22px;text-align:center">🎨</span>Màu chữ';
      item1.onclick = function(){ 
        var d = this.closest('.m27-drawer, .mobile-drawer');
        if (d) d.classList.remove('show');
        setTimeout(openColorModal, 200);
      };
      var item2 = document.createElement('div');
      item2.className = 'm27-item';
      item2.innerHTML = '<span class="m27-item-ico" style="font-size:18px;width:22px;text-align:center">🔤</span>Cỡ chữ';
      item2.onclick = function(){ 
        var d = this.closest('.m27-drawer, .mobile-drawer');
        if (d) d.classList.remove('show');
        setTimeout(openFontPopup, 200);
      };
      drawer.appendChild(item1);
      drawer.appendChild(item2);
    }
    
    drawer.dataset.app31done = '1';
  });
}

// 5. Chạy liên tục vì drawer được tạo động
setTimeout(injectToDrawers, 1000);
setTimeout(injectToDrawers, 2500);
setInterval(injectToDrawers, 2000);

console.log('[app31 v1.0] ✅ Đã chuyển Màu chữ + Cỡ chữ vào menu ☰');
})();
