/* DISABLED - app27 handles mobile */
//'use strict';
///* app26.js v1.0 — Mobile header optimization */
//(function(){
//if (!window.DD) return;
//
//const CSS = ""
///* ============ MOBILE HEADER ============ */
//+ "@media(max-width:900px){"
//  /* Header tổng */
//  + ".hdr{height:auto!important;min-height:56px!important;padding:6px 8px!important;flex-wrap:wrap!important;gap:6px!important}"
//  + ".logo{font-size:13px!important;gap:6px!important}"
//  + ".logo .mark{width:30px!important;height:30px!important;font-size:15px!important}"
//  + ".logo em{display:none!important}"
//  /* hbtns chia 2 hàng */
//  + ".hbtns{flex:1!important;display:flex!important;flex-wrap:wrap!important;gap:4px!important;justify-content:flex-end!important}"
//  /* Nút hành động chính — màu nổi bật, có chữ */
//  + ".hbtn.mobile-pri{"
//    + "height:38px!important;min-width:auto!important;padding:0 12px!important;"
//    + "font-size:12px!important;font-weight:800!important;border-radius:10px!important;"
//    + "display:inline-flex!important;align-items:center!important;gap:6px!important"
//  + "}"
//  + ".hbtn.mobile-pri svg{width:16px!important;height:16px!important}"
//  + ".hbtn.mobile-pri span{display:inline!important}"
//  /* Nút ẩn vào menu ⋮ */
//  + ".hbtn.mobile-hidden{display:none!important}"
//  /* Nút menu ⋮ */
//  + ".hbtn.mobile-menu-btn{"
//    + "width:38px!important;height:38px!important;"
//    + "background:var(--card2)!important;border-color:var(--text3)!important"
//  + "}"
//  /* Nút icon-only nhỏ */
//  + ".hbtn.icon-only.mobile-keep{width:38px!important;height:38px!important}"
//"}"
//
///* ============ MOBILE FILES BAR ============ */
//+ "@media(max-width:900px){"
//  + ".mobile-files-bar{display:flex!important;gap:6px;padding:8px 10px;background:var(--bg2);border-bottom:1px solid var(--border);overflow-x:auto;flex-shrink:0}"
//  + ".mobile-files-bar::-webkit-scrollbar{display:none}"
//  + ".mobile-files-bar button{"
//    + "flex-shrink:0;padding:9px 14px;background:var(--card);border:1px solid var(--border);"
//    + "border-radius:9px;color:var(--text);font-size:12px;font-weight:700;cursor:pointer;"
//    + "display:inline-flex;align-items:center;gap:6px;font-family:inherit"
//  + "}"
//  + ".mobile-files-bar button:active{background:var(--card2)}"
//  + ".mobile-files-bar button.pri{background:linear-gradient(135deg,#8b5cf6,#6366f1);border:none;color:#fff}"
//  + ".mobile-files-bar button.rec{background:linear-gradient(135deg,#e11d48,#be123c);border:none;color:#fff}"
//  + ".mobile-files-bar button svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}"
//"}"
//
///* ============ MOBILE MENU DROPDOWN ============ */
//+ ".mobile-menu-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:500;display:none;justify-content:flex-end}"
//+ ".mobile-menu-overlay.show{display:flex}"
//+ ".mobile-menu{"
//  + "width:280px;max-width:85vw;height:100%;background:var(--bg2);"
//  + "border-left:1px solid var(--border);padding:14px;overflow-y:auto;"
//  + "animation:mm-slide .22s ease-out"
//+ "}"
//+ "@keyframes mm-slide{from{transform:translateX(100%)}to{transform:translateX(0)}}"
//+ ".mobile-menu h4{font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:12px 0 8px;padding:0 6px}"
//+ ".mobile-menu h4:first-child{margin-top:0}"
//+ ".mobile-menu-item{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:10px;color:var(--text);font-size:14px;font-weight:600;cursor:pointer;transition:.15s;margin-bottom:2px}"
//+ ".mobile-menu-item:hover{background:var(--card)}"
//+ ".mobile-menu-item svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}"
//+ ".mobile-menu-item .badge{margin-left:auto;background:var(--accent);color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:8px}"
//+ ".mobile-menu-close{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:9px;background:var(--card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10}"
//+ ".mobile-menu-close svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.5}"
//+ ".mobile-menu-sep{height:1px;background:var(--border);margin:10px 0}";
//
//const style = document.createElement('style');
//style.id = 'app26-styles';
//const old = document.getElementById('app26-styles');
//if (old) old.remove();
//style.textContent = CSS;
//document.head.appendChild(style);
//
//const isMobile = () => window.innerWidth <= 900;
//
///* ============ TẠO MENU OVERLAY ============ */
//function buildMenu(){
//  if (document.getElementById('mobileMenuOverlay')) return;
//  const menu = document.createElement('div');
//  menu.className = 'mobile-menu-overlay';
//  menu.id = 'mobileMenuOverlay';
//  menu.innerHTML = ''
//    + '<div class="mobile-menu">'
//    + '<button class="mobile-menu-close" id="mmClose"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>'
//    + '<h4>Học tập</h4>'
//    + '<div class="mobile-menu-item" data-act="folder"><svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Nạp thư mục</div>'
//    + '<div class="mobile-menu-item" data-act="file"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>Chọn file lẻ</div>'
//    + '<div class="mobile-menu-item" data-act="batch"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Tự chép tất cả</div>'
//    + '<div class="mobile-menu-item" data-act="smart"><svg viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v.5a2.5 2.5 0 0 0-2 2.45V10a2 2 0 0 0-1 1.73V14a2 2 0 0 0 1 1.73V17.5a2.5 2.5 0 0 0 2 2.45V20a2.5 2.5 0 0 0 5 0v-.05a2.5 2.5 0 0 0 2-2.45V16a2 2 0 0 0 1-1.73V12a2 2 0 0 0-1-1.73V7.45A2.5 2.5 0 0 0 12 5v-.5A2.5 2.5 0 0 0 9.5 2z"/></svg>Gom nhóm thông minh</div>'
//    + '<div class="mobile-menu-sep"></div>'
//    + '<h4>Công cụ</h4>'
//    + '<div class="mobile-menu-item" data-act="cmd"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>Tra từ nhanh</div>'
//    + '<div class="mobile-menu-item" data-act="stats"><svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>Thống kê</div>'
//    + '<div class="mobile-menu-item" data-act="focus"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Focus Mode</div>'
//    + '<div class="mobile-menu-item" data-act="tone"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>Tô màu thanh điệu</div>'
//    + '<div class="mobile-menu-sep"></div>'
//    + '<h4>Cài đặt</h4>'
//    + '<div class="mobile-menu-item" data-act="theme"><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>Đổi giao diện</div>'
//    + '<div class="mobile-menu-item" data-act="settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Cài đặt</div>'
//    + '<div class="mobile-menu-item" data-act="help"><svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M7 14h3M14 14h3M7 11h10"/></svg>Trợ giúp</div>'
//    + '</div>';
//
//  document.body.appendChild(menu);
//
//  menu.addEventListener('click', e => {
//    if (e.target === menu) menu.classList.remove('show');
//    const close = e.target.closest('#mmClose');
//    if (close) { menu.classList.remove('show'); return; }
//    const item = e.target.closest('.mobile-menu-item');
//    if (!item) return;
//    menu.classList.remove('show');
//    const act = item.dataset.act;
//    const trigger = {
//      folder: () => document.querySelector('label[title*="thư mục"], label[title*="Nạp"]')?.click(),
//      file: () => document.getElementById('fileSingleInput')?.click(),
//      batch: () => document.getElementById('batchBtn')?.click(),
//      smart: () => document.getElementById('smartGroupBtn')?.click(),
//      cmd: () => document.getElementById('cmdBtn')?.click(),
//      stats: () => document.getElementById('statsBtn')?.click(),
//      focus: () => document.getElementById('focusBtn')?.click(),
//      tone: () => document.getElementById('toneBtn')?.click(),
//      theme: () => document.getElementById('themeBtn')?.click(),
//      settings: () => document.getElementById('settingsBtn')?.click(),
//      help: () => document.getElementById('helpBtn')?.click()
//    }[act];
//    if (trigger) setTimeout(trigger, 150);
//  });
//}
//
///* ============ CHUẨN HÓA HEADER MOBILE ============ */
//function optimizeHeader(){
//  if (!isMobile()) return;
//  const hb = document.querySelector('.hbtns');
//  if (!hb) return;
//
//  // Nút cần HIỆN trên mobile: Ghi âm, Video, Nhập văn, Aa, Màu, Menu ⋮
//  const showIds = ['rtrHeaderBtn','vpHeaderBtn','impvHeaderBtn','importBtn','openImportPageBtn','fsToggleBtn','colorBtn'];
//  // Nút ẨN vào menu: các nút phụ
//  const hideIds = ['savedBtn','toneBtn','themeBtn','settingsBtn','batchBtn','smartGroupBtn','focusBtn','cmdBtn','statsBtn','helpBtn'];
//
//  // Xử lý nhóm file (Thư mục + Chọn file)
//  const labels = hb.querySelectorAll('label.hbtn');
//  labels.forEach(el => {
//    el.classList.add('mobile-hidden');
//  });
//
//  // Nút phụ → ẩn
//  hideIds.forEach(id => {
//    const el = document.getElementById(id);
//    if (el) el.classList.add('mobile-hidden');
//  });
//
//  // Nút chính → hiện
//  showIds.forEach(id => {
//    const el = document.getElementById(id);
//    if (el) {
//      el.classList.remove('mobile-hidden');
//      el.classList.add('mobile-pri');
//    }
//  });
//
//  // Chèn nút menu ⋮ (nếu chưa có)
//  if (!document.getElementById('mobileMenuBtn')) {
//    const btn = document.createElement('button');
//    btn.className = 'hbtn mobile-menu-btn';
//    btn.id = 'mobileMenuBtn';
//    btn.title = 'Menu';
//    btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
//    btn.onclick = e => {
//      e.stopPropagation();
//      buildMenu();
//      document.getElementById('mobileMenuOverlay').classList.add('show');
//    };
//    hb.appendChild(btn);
//  }
//}
//
///* ============ FILES BAR (mobile) — nút to, dễ bấm ============ */
//function buildFilesBar(){
//  if (!isMobile()) return;
//  if (document.getElementById('mobileFilesBar')) return;
//  const mh = document.querySelector('.mh');
//  if (!mh) return;
//
//  const bar = document.createElement('div');
//  bar.className = 'mobile-files-bar';
//  bar.id = 'mobileFilesBar';
//  bar.innerHTML = ''
//    + '<button class="rec" id="mfbRec"><svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zM19 11a7 7 0 1 1-14 0M12 18v4M8 22h8"/></svg>Ghi âm</button>'
//    + '<button class="pri" id="mfbVideo"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>Video</button>'
//    + '<button id="mfbImport"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>Nhập văn</button>'
//    + '<button id="mfbColor"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg>Màu</button>';
//
//  mh.parentNode.insertBefore(bar, mh.nextSibling);
//
//  // Gắn sự kiện
//  setTimeout(() => {
//    document.getElementById('mfbRec')?.addEventListener('click', () => {
//      if (window.rtrOpen) window.rtrOpen();
//    });
//    document.getElementById('mfbVideo')?.addEventListener('click', () => {
//      if (window.vpOpen) window.vpOpen();
//    });
//    document.getElementById('mfbImport')?.addEventListener('click', () => {
//      const btn = document.getElementById('impvHeaderBtn') || document.getElementById('openImportPageBtn') || document.getElementById('importBtn');
//      if (btn) btn.click();
//    });
//    document.getElementById('mfbColor')?.addEventListener('click', () => {
//      document.getElementById('colorBtn')?.click();
//    });
//  }, 100);
//}
//
///* ============ INIT + RESIZE ============ */
//let lastWidth = window.innerWidth;
//function tick(){
//  if (!isMobile()) return;
//  optimizeHeader();
//  buildFilesBar();
//}
//
//function init(){
//  setTimeout(tick, 1500);
//  setTimeout(tick, 3000);
//  setInterval(tick, 2500);
//
//  window.addEventListener('resize', () => {
//    if (window.innerWidth !== lastWidth) {
//      lastWidth = window.innerWidth;
//      setTimeout(tick, 300);
//    }
//  });
//
//  console.log('[app26 v1.0] 📱 Mobile header optimized');
//}
//
//if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1600));
//else setTimeout(init, 1600);
//})();
//