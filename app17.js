'use strict';
/* app17.js — Force inject nút Thư viện + Nút lưu vào topbar */
(function(){
  if (!window.impState) return;
  var $ = function(id){ return document.getElementById(id); };
  var ST = window.impState;

  function inject(){
    var acts = document.querySelector('.impv-topbar-acts');
    if (!acts) return;

    // Nút 📚 Thư viện
    if (!$('libOpenBtn')) {
      var b1 = document.createElement('button');
      b1.className = 'impv-iconbtn';
      b1.id = 'libOpenBtn';
      b1.title = 'Thư viện đoạn văn (L)';
      b1.style.cssText = 'background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;font-weight:700;position:relative';
      b1.innerHTML = '<svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><use href="#i-book"/></svg><span id="libCountBadge" style="position:absolute;top:-4px;right:-4px;background:#10b981;color:#fff;font-size:9px;font-weight:800;border-radius:8px;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-shadow:0 2px 6px rgba(16,185,129,.5);display:none"></span>';
      b1.onclick = function(e){
        e.stopPropagation();
        if (window.app11OpenLibrary) window.app11OpenLibrary();
      };
      acts.insertBefore(b1, acts.firstChild);
      updateBadge();
    }

    // Nút 🔖 Lưu
    if (!$('libSaveBtn')) {
      var b2 = document.createElement('button');
      b2.className = 'impv-iconbtn';
      b2.id = 'libSaveBtn';
      b2.title = 'Lưu đoạn (Cmd+S)';
      b2.innerHTML = '<svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><use href="#i-bookmark"/></svg>';
      b2.onclick = function(e){
        e.stopPropagation();
        if (window.app11SavePassage) window.app11SavePassage();
      };
      var ref = $('libOpenBtn');
      if (ref) acts.insertBefore(b2, ref.nextSibling);
      else acts.insertBefore(b2, acts.firstChild);
    }
  }

  function updateBadge(){
    try {
      var req = indexedDB.open('dd_passages_v1');
      req.onsuccess = function(e){
        try {
          var db = e.target.result;
          var tx = db.transaction('passages', 'readonly');
          tx.objectStore('passages').count().onsuccess = function(ev){
            var n = ev.target.result;
            var b = $('libCountBadge');
            if (b) {
              if (n > 0) { b.textContent = n; b.style.display = 'flex'; }
              else b.style.display = 'none';
            }
          };
        } catch(x){}
      };
    } catch(x){}
  }

  setInterval(inject, 800);
  setInterval(updateBadge, 3000);
  setTimeout(inject, 500);
  setTimeout(inject, 1500);

  console.log('[app17] ✅ Library button force-injected');
})();
