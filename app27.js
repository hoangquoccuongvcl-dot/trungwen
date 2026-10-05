'use strict';
/* app27.js v2.0 — Mobile native layout DUY NHẤT */
(function(){
if (!window.DD) return;
if (window.__app27_loaded) return;
window.__app27_loaded = true;

const isMobile = () => window.innerWidth <= 900;
let navBuilt = false;

/* ============================================
   CSS — prefix m27- để tránh conflict
   ============================================ */
const CSS = `
@media(max-width:900px){
  /* HEADER — gọn 52px */
  .hdr{
    height:52px !important;
    min-height:52px !important;
    padding:0 12px !important;
    background:#0f172a !important;
    border-bottom:1px solid #334155 !important;
    position:sticky !important;
    top:0 !important;
    z-index:100 !important;
    display:flex !important;
    align-items:center !important;
    justify-content:space-between !important;
  }
  .hdr .hbtns{
    display:none !important;
  }
  .hdr .logo{
    font-size:15px !important;
    gap:8px !important;
  }
  .hdr .logo .mark{
    width:34px !important;
    height:34px !important;
    font-size:17px !important;
  }
  .hdr .logo em{
    display:none !important;
  }
  .hdr .logo .ver-badge{
    display:none !important;
  }

  /* Nút menu phải header */
  .m27-top-menu{
    display:flex !important;
    width:40px;
    height:40px;
    border-radius:11px;
    background:#1e293b;
    border:1px solid #334155;
    color:#e2e8f0;
    cursor:pointer;
    align-items:center;
    justify-content:center;
    font-size:22px;
    line-height:1;
    padding:0;
  }
  .m27-top-menu:active{
    background:#334155;
  }

  /* BOTTOM NAV — luôn dưới cùng */
  .m27-bottom-nav{
    position:fixed !important;
    left:0 !important;
    right:0 !important;
    bottom:0 !important;
    height:64px !important;
    background:#0f172a !important;
    border-top:1px solid #334155 !important;
    display:flex !important;
    align-items:stretch !important;
    justify-content:space-around !important;
    z-index:99999 !important;
    box-shadow:0 -4px 20px rgba(0,0,0,.4) !important;
    padding-bottom:env(safe-area-inset-bottom, 0) !important;
    transform:none !important;
    will-change:auto !important;
  }
  .m27-nav-btn{
    flex:1;
    display:flex !important;
    flex-direction:column !important;
    align-items:center !important;
    justify-content:center !important;
    gap:3px;
    background:transparent !important;
    border:none !important;
    color:#64748b !important;
    font-size:10px !important;
    font-weight:700 !important;
    font-family:inherit !important;
    padding:6px 2px !important;
    cursor:pointer !important;
    position:relative !important;
    -webkit-tap-highlight-color:transparent;
  }
  .m27-nav-btn .m27-ico{
    font-size:22px;
    line-height:1;
    display:block;
  }
  .m27-nav-btn .m27-lb{
    font-size:10px;
    line-height:1;
    display:block;
  }
  .m27-nav-btn.active{
    color:#8b5cf6 !important;
  }
  .m27-nav-btn.active::before{
    content:'';
    position:absolute;
    top:0;
    left:50%;
    transform:translateX(-50%);
    width:32px;
    height:3px;
    background:#8b5cf6;
    border-radius:0 0 3px 3px;
  }

  /* Nút Ghi âm nổi bật */
  .m27-nav-btn.m27-main .m27-ico{
    width:44px;
    height:44px;
    background:linear-gradient(135deg,#e11d48,#be123c);
    border-radius:50%;
    display:flex !important;
    align-items:center;
    justify-content:center;
    font-size:20px;
    margin-top:-14px;
    box-shadow:0 4px 14px rgba(225,29,72,.55);
    color:#fff;
  }
  .m27-nav-btn.m27-main .m27-lb{
    margin-top:0;
  }
  .m27-nav-btn.m27-main.active{
    color:#8b5cf6 !important;
  }

  /* Body padding tránh nav che */
  body{
    padding-bottom:68px !important;
  }

  /* Ẩn player nếu không có bài */
  body.m27-no-track .player{
    display:none !important;
  }

  /* Fix icon méo trong empty state */
  .empty .em{
    font-size:42px !important;
    line-height:1 !important;
    display:block !important;
    width:auto !important;
    height:auto !important;
  }
  .ph .phi{
    width:64px !important;
    height:64px !important;
  }
  .ph .phi svg{
    width:28px !important;
    height:28px !important;
  }

  /* Modal responsive */
  .mc{
    max-width:100% !important;
    max-height:92vh !important;
    border-radius:14px !important;
  }

  /* Sidebar full width mobile */
  .sidebar{
    width:88% !important;
    max-width:340px !important;
  }
}

/* DRAWER MENU */
.m27-drawer{
  position:fixed !important;
  inset:0 !important;
  background:rgba(0,0,0,.7) !important;
  z-index:100000 !important;
  display:none;
  justify-content:flex-end;
}
.m27-drawer.show{
  display:flex !important;
}
.m27-drawer-box{
  width:290px;
  max-width:88vw;
  height:100%;
  background:#0f172a;
  border-left:1px solid #334155;
  overflow-y:auto;
  padding:16px;
  animation:m27-slide .22s ease-out;
}
@keyframes m27-slide{
  from{transform:translateX(100%)}
  to{transform:translateX(0)}
}
.m27-drawer-hd{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:16px;
  padding-bottom:12px;
  border-bottom:1px solid #334155;
}
.m27-drawer-hd h3{
  font-size:16px;
  font-weight:800;
  color:#e2e8f0;
  margin:0;
}
.m27-drawer-close{
  width:34px;
  height:34px;
  border-radius:10px;
  background:#1e293b;
  border:1px solid #334155;
  color:#e2e8f0;
  font-size:18px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
}
.m27-sec{
  font-size:10.5px;
  font-weight:800;
  color:#64748b;
  text-transform:uppercase;
  letter-spacing:.7px;
  margin:16px 4px 8px;
}
.m27-sec:first-of-type{
  margin-top:0;
}
.m27-item{
  display:flex;
  align-items:center;
  gap:12px;
  padding:13px 14px;
  border-radius:11px;
  color:#e2e8f0;
  font-size:14px;
  font-weight:600;
  cursor:pointer;
  margin-bottom:3px;
  -webkit-tap-highlight-color:transparent;
}
.m27-item:active{
  background:#1e293b;
}
.m27-item .m27-item-ico{
  font-size:18px;
  width:22px;
  text-align:center;
}
`;

const style = document.createElement('style');
style.id = 'm27-styles';
const oldS = document.getElementById('m27-styles');
if (oldS) oldS.remove();
style.textContent = CSS;
document.head.appendChild(style);

/* ============================================
   BOTTOM NAV
   ============================================ */
function buildBottomNav(){
  if (!isMobile()) return;
  if (document.getElementById('m27BottomNav')) return;

  const nav = document.createElement('nav');
  nav.className = 'm27-bottom-nav';
  nav.id = 'm27BottomNav';
  nav.innerHTML = `
    <button class="m27-nav-btn" data-tab="home">
      <span class="m27-ico">🏠</span>
      <span class="m27-lb">Trang chủ</span>
    </button>
    <button class="m27-nav-btn" data-tab="video">
      <span class="m27-ico">📹</span>
      <span class="m27-lb">Video</span>
    </button>
    <button class="m27-nav-btn m27-main" data-tab="record">
      <span class="m27-ico">🎙️</span>
      <span class="m27-lb">Ghi âm</span>
    </button>
    <button class="m27-nav-btn" data-tab="import">
      <span class="m27-ico">📝</span>
      <span class="m27-lb">Nhập văn</span>
    </button>
    <button class="m27-nav-btn" data-tab="more">
      <span class="m27-ico">⋯</span>
      <span class="m27-lb">Thêm</span>
    </button>
  `;

  document.body.appendChild(nav);
  navBuilt = true;

  nav.addEventListener('click', e => {
    const btn = e.target.closest('.m27-nav-btn');
    if (!btn) return;
    const tab = btn.dataset.tab;

    nav.querySelectorAll('.m27-nav-btn').forEach(x => x.classList.remove('active'));
    if (tab !== 'more') btn.classList.add('active');

    if (tab === 'home'){
      document.querySelectorAll('.rtr-page.show,.vp-page.show,.impv.show').forEach(el => el.classList.remove('show'));
      document.querySelectorAll('.m27-drawer.show').forEach(el => el.classList.remove('show'));
    } else if (tab === 'record'){
      if (window.rtrOpen) window.rtrOpen();
    } else if (tab === 'video'){
      if (window.vpOpen) window.vpOpen();
    } else if (tab === 'import'){
      const b = document.getElementById('impvHeaderBtn')
              || document.getElementById('openImportPageBtn')
              || document.getElementById('importBtn');
      if (b) b.click();
      else if (window.impOpenPage) window.impOpenPage();
    } else if (tab === 'more'){
      openDrawer();
    }

    if (navigator.vibrate) navigator.vibrate(8);
  });
}

/* ============================================
   HEADER MENU BUTTON
   ============================================ */
function buildHeaderMenu(){
  if (!isMobile()) return;
  const hdr = document.querySelector('.hdr');
  if (!hdr) return;
  if (document.getElementById('m27TopMenu')) return;

  const btn = document.createElement('button');
  btn.className = 'm27-top-menu';
  btn.id = 'm27TopMenu';
  btn.innerHTML = '☰';
  btn.onclick = e => { e.stopPropagation(); openDrawer(); };
  hdr.appendChild(btn);
}

/* ============================================
   DRAWER
   ============================================ */
function openDrawer(){
  if (!document.getElementById('m27Drawer')) buildDrawer();
  document.getElementById('m27Drawer').classList.add('show');
}

function buildDrawer(){
  const d = document.createElement('div');
  d.className = 'm27-drawer';
  d.id = 'm27Drawer';
  d.innerHTML = `
    <div class="m27-drawer-box">
      <div class="m27-drawer-hd">
        <h3>Menu</h3>
        <button class="m27-drawer-close" id="m27DrawerClose">✕</button>
      </div>

      <div class="m27-sec">Thư viện</div>
      <div class="m27-item" data-act="folder"><span class="m27-item-ico">📁</span>Nạp thư mục</div>
      <div class="m27-item" data-act="file"><span class="m27-item-ico">📄</span>Chọn file lẻ</div>
      <div class="m27-item" data-act="saved"><span class="m27-item-ico">💾</span>Kho câu</div>

      <div class="m27-sec">Học tập</div>
      <div class="m27-item" data-act="batch"><span class="m27-item-ico">⚡</span>Tự chép tất cả</div>
      <div class="m27-item" data-act="tone"><span class="m27-item-ico">🎨</span>Tô màu thanh điệu</div>
      <div class="m27-item" data-act="focus"><span class="m27-item-ico">🎯</span>Focus Mode</div>

      <div class="m27-sec">Công cụ</div>
      <div class="m27-item" data-act="cmd"><span class="m27-item-ico">🔍</span>Tra từ nhanh</div>
      <div class="m27-item" data-act="stats"><span class="m27-item-ico">📊</span>Thống kê</div>
      <div class="m27-item" data-act="color"><span class="m27-item-ico">🎨</span>Màu chữ</div>
      <div class="m27-item" data-act="fontsize"><span class="m27-item-ico">🔤</span>Cỡ chữ</div>

      <div class="m27-sec">Cài đặt</div>
      <div class="m27-item" data-act="theme"><span class="m27-item-ico">🌓</span>Đổi giao diện</div>
      <div class="m27-item" data-act="settings"><span class="m27-item-ico">⚙️</span>Cài đặt</div>
      <div class="m27-item" data-act="help"><span class="m27-item-ico">❓</span>Trợ giúp</div>
    </div>
  `;

  document.body.appendChild(d);

  d.addEventListener('click', e => {
    if (e.target === d || e.target.closest('#m27DrawerClose')){
      d.classList.remove('show');
      return;
    }
    const item = e.target.closest('.m27-item');
    if (!item) return;
    d.classList.remove('show');
    const act = item.dataset.act;
    const actions = {
      folder: () => document.querySelector('label[title*="thư mục"], label[title*="Nạp"]')?.click(),
      file: () => document.getElementById('fileSingleInput')?.click(),
      saved: () => {
        if (window.DD && window.DD.openSaved) window.DD.openSaved();
        else document.getElementById('savedBtn')?.click();
      },
      batch: () => document.getElementById('batchBtn')?.click(),
      tone: () => document.getElementById('toneBtn')?.click(),
      focus: () => document.getElementById('focusBtn')?.click(),
      cmd: () => document.getElementById('cmdBtn')?.click(),
      stats: () => document.getElementById('statsBtn')?.click(),
      color: () => document.getElementById('colorBtn')?.click(),
      fontsize: () => document.getElementById('fsToggleBtn')?.click(),
      theme: () => document.getElementById('themeBtn')?.click(),
      settings: () => document.getElementById('settingsBtn')?.click(),
      help: () => document.getElementById('helpBtn')?.click()
    };
    if (actions[act]) setTimeout(actions[act], 180);
  });
}

/* ============================================
   HOOK PAGE OPEN → mark tab
   ============================================ */
function markTab(name){
  const nav = document.getElementById('m27BottomNav');
  if (!nav) return;
  nav.querySelectorAll('.m27-nav-btn').forEach(x => {
    x.classList.toggle('active', x.dataset.tab === name);
  });
}

function hookApis(){
  const wrap = (name, origKey) => {
    const orig = window[origKey];
    if (typeof orig === 'function' && !orig._m27wrapped){
      const wrapped = function(){
        markTab(name);
        return orig.apply(this, arguments);
      };
      wrapped._m27wrapped = true;
      window[origKey] = wrapped;
    }
  };
  wrap('record', 'rtrOpen');
  wrap('video', 'vpOpen');
  wrap('import', 'impOpenPage');
}

/* ============================================
   INIT
   ============================================ */
function tick(){
  if (!isMobile()) return;
  buildBottomNav();
  buildHeaderMenu();
  hookApis();
}

function init(){
  tick();
  setTimeout(tick, 500);
  setTimeout(tick, 1500);
  setTimeout(tick, 3000);
  setInterval(tick, 2000);

  window.addEventListener('resize', () => setTimeout(tick, 300));

  console.log('[app27 v2.0] 📱 Mobile native layout');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
else setTimeout(init, 1000);
})();
