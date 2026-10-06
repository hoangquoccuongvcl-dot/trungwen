'use strict';
/* app29.js v1.0 — Cleanup toolbar: chỉ giữ nút cần thiết */
(function(){
if (!window.DD) return;

// ===== CSS FORCE HIDE =====
(function(){
  var s = document.createElement('style');
  s.id = 'app29-force-css';
  s.textContent = 
    /* Ẩn TẤT CẢ nhóm impv-tgroup trong .vp-toolbar */
    '.vp-toolbar .impv-tgroup{display:none!important}' +
    /* Trừ w28-toolbar */
    '.vp-toolbar #w28-toolbar{display:inline-flex!important}' +
    '.vp-toolbar #w28-toolbar button{display:inline-block!important;visibility:visible!important}' +
    /* Ẩn nhóm toggle py/vi cũ trong .mh */
    '.mh .mbtns-group:not(:has(#w28-toolbar)){display:none!important}' +
    /* Nhưng giữ nhóm có nút AI, edit */
    '.mh .mbtns-group:has([id*="transcribe"]),.mh .mbtns-group:has([id*="edit"]),.mh .mbtns-group:has([id*="lrc"]){display:inline-flex!important}';
  if (!document.getElementById('app29-force-css')) document.head.appendChild(s);
})();

if (window.__app29_loaded) return;
window.__app29_loaded = true;

function cleanupToolbar(){
  // Nhóm Tone/PY/VI của app28 (giữ)
  const w28 = document.getElementById('w28-toolbar');
  
  // Nhóm toggle buttons của app20 (ẩn)
  const vpToolbar = document.querySelector('.vp-toolbar');
  if (vpToolbar){
    const groups = vpToolbar.querySelectorAll('.impv-tgroup');
    groups.forEach(g => {
      // Nhóm chứa nút "汉", "PY", "VI", "eye", "sun", v.v.
      const txt = g.textContent || '';
      const hasEye = g.querySelector('use[href*="i-eye"]');
      const hasPY = g.querySelector('small') && txt.includes('PY');
      const hasVI = g.querySelector('small') && txt.includes('VI');
      const hasSun = g.querySelector('use[href*="i-sun"]');
      
      // Nếu là nhóm ẩn/hiện gốc (có PY, VI, eye, sun) và KHÔNG phải w28 → ẩn
      if (g.id !== 'w28-toolbar'){
        if (hasEye || (hasPY && hasVI) || (hasSun && g.textContent.length < 15)){
          g.style.display = 'none';
        }
      }
    });
  }

  // Nếu w28-toolbar chưa hiện → chèn vào vị trí cũ
  if (w28 && vpToolbar && w28.parentElement !== vpToolbar){
    vpToolbar.appendChild(w28);
  }

  // Style lại cho gọn
  if (w28){
    w28.style.cssText = 'display:inline-flex!important;gap:4px!important;padding:4px!important;background:var(--bg)!important;border:1px solid var(--border)!important;border-radius:11px!important;align-items:center!important';
    
    // Nút Tone
    const toneBtn = document.getElementById('w28ToneToggle');
    if (toneBtn){
      const toneOn = localStorage.getItem('w28_tone') !== 'off';
      toneBtn.style.cssText = 'width:auto!important;padding:7px 12px!important;font-size:11.5px!important;font-weight:800!important;border:none!important;border-radius:8px!important;cursor:pointer!important;font-family:inherit!important;' +
        (toneOn ? 'background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;' : 'background:var(--card);color:var(--text2);');
      toneBtn.textContent = '🎨 Tone';
    }
    
    // Nút PY
    const pyBtn = document.getElementById('w28PyToggle');
    if (pyBtn){
      const pyOn = localStorage.getItem('w28_py') !== 'off';
      pyBtn.style.cssText = 'width:auto!important;padding:7px 12px!important;font-size:11.5px!important;font-weight:800!important;border:none!important;border-radius:8px!important;cursor:pointer!important;font-family:inherit!important;' +
        (pyOn ? 'background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;' : 'background:var(--card);color:var(--text2);');
      pyBtn.textContent = 'PY';
    }
    
    // Nút VI
    const viBtn = document.getElementById('w28ViToggle');
    if (viBtn){
      const viOn = localStorage.getItem('w28_vi') !== 'off';
      viBtn.style.cssText = 'width:auto!important;padding:7px 12px!important;font-size:11.5px!important;font-weight:800!important;border:none!important;border-radius:8px!important;cursor:pointer!important;font-family:inherit!important;' +
        (viOn ? 'background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;' : 'background:var(--card);color:var(--text2);');
      viBtn.textContent = 'VI';
    }
  }

  // === Ẩn nút phụ trên header (Ghi âm, Video, Nhập văn → đã có trong bottom nav mobile) ===
  if (window.innerWidth <= 900){
    ['rtrHeaderBtn','vpHeaderBtn','impvHeaderBtn','importBtn','openImportPageBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.parentElement && el.parentElement.classList.contains('hbtns')){
        el.style.display = 'none';
      }
    });
  }
}

function init(){
  setTimeout(cleanupToolbar, 100);
  setTimeout(cleanupToolbar, 500);
  setTimeout(cleanupToolbar, 1500);
  setTimeout(cleanupToolbar, 3000);
  setInterval(cleanupToolbar, 2000);
  
  // Observe DOM changes
  const observer = new MutationObserver(() => {
    clearTimeout(window.__app29_t);
    window.__app29_t = setTimeout(cleanupToolbar, 200);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log('[app29 v1.0] ✅ Toolbar cleaned');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1500));
else setTimeout(init, 1500);
})();
