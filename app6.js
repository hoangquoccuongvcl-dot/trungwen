'use strict';
/* app6.js v1.0 — UI Redesign: Cleaner header + Better layout */

(function(){

/* ========== CSS OVERRIDE ========== */
const style = document.createElement('style');
style.textContent = [

/* === HEADER: chia nhóm rõ ràng === */
'.hdr{height:56px !important;padding:0 16px !important;gap:14px !important;background:var(--bg2) !important;border-bottom:1px solid var(--border) !important;box-shadow:0 1px 3px rgba(0,0,0,.15) !important}',
'.logo{font-size:16px !important;gap:12px !important}',
'.logo .mark{width:34px !important;height:34px !important;font-size:17px !important}',

/* Nhóm nút header */
'.hbtns{display:flex !important;gap:10px !important;align-items:center !important}',
'.hbtn-group{display:flex;align-items:center;gap:4px;padding:4px;background:var(--bg);border:1px solid var(--border);border-radius:11px}',
'.hbtn-group .hbtn{background:transparent !important;border:none !important;height:32px !important;padding:0 11px !important;border-radius:8px !important;font-size:12px !important;font-weight:600 !important;gap:7px !important}',
'.hbtn-group .hbtn:hover{background:var(--card) !important}',
'.hbtn-group .hbtn.icon-only{width:32px !important;padding:0 !important}',

/* Nút chính nổi bật */
'.hbtn.pri-action{height:38px !important;padding:0 16px !important;border-radius:10px !important;font-size:12.5px !important;font-weight:700 !important;box-shadow:0 4px 14px rgba(234,88,12,.35) !important}',
'.hbtn.pri-action:hover{transform:translateY(-1px)}',
'.hbtn.save-action{height:38px !important;padding:0 14px !important;border-radius:10px !important;background:linear-gradient(135deg,#8b5cf6,#6366f1) !important;color:#fff !important;border:none !important;font-weight:700 !important;font-size:12.5px !important;box-shadow:0 4px 14px rgba(139,92,246,.35) !important;display:flex;align-items:center;gap:7px}',
'.hbtn.save-action:hover{transform:translateY(-1px)}',
'.hbtn.save-action .cnt-badge{background:rgba(255,255,255,.25);padding:1px 7px;border-radius:10px;font-size:10px;font-weight:800}',

/* Menu overflow (⋮) */
'.hbtn.more-btn{width:38px !important;height:38px !important;background:var(--card) !important;border:1px solid var(--border) !important}',
'.hbtn.more-btn:hover{background:var(--card2) !important}',

/* Dropdown menu */
'.more-menu{position:fixed;top:60px;right:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:8px;min-width:220px;box-shadow:0 20px 60px rgba(0,0,0,.7);z-index:400;display:none;animation:popIn .15s}',
'.more-menu.show{display:block}',
'.more-menu-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;font-size:12.5px;color:var(--text);cursor:pointer;transition:.15s;user-select:none}',
'.more-menu-item:hover{background:var(--card2);color:var(--accent2)}',
'.more-menu-item svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}',
'.more-menu-item .shortcut{margin-left:auto;font-size:10.5px;color:var(--text3);font-family:ui-monospace,monospace;background:var(--bg);padding:2px 6px;border-radius:4px;border:1px solid var(--border)}',
'.more-menu-sep{height:1px;background:var(--border);margin:6px 4px}',
'.more-menu-label{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;padding:6px 12px 4px}',

/* === MAIN HEADER: nhóm công cụ transcript === */
'.mh{height:52px !important;padding:0 16px !important;gap:10px !important}',
'.pill{font-size:10px !important;padding:4px 10px !important;font-weight:700 !important;border-radius:7px !important}',
'.title{font-size:13px !important;font-weight:600 !important}',

/* Nhóm nút transcript */
'.mbtns-group{display:flex !important;align-items:center !important;gap:4px !important;padding:4px !important;background:var(--bg) !important;border:1px solid var(--border) !important;border-radius:10px !important}',
'.mbtns-group .mbtn{background:transparent !important;border:none !important;width:34px !important;height:34px !important;border-radius:8px !important;font-size:14px !important}',
'.mbtns-group .mbtn:hover{background:var(--card) !important}',
'.mbtns-group .mbtn.on{background:var(--accent) !important;color:#fff !important}',
'.mbtns-group .mbtn small{font-size:10.5px !important;font-weight:700 !important}',

/* === SIDEBAR: header + actions gọn hơn === */
'.sidebar{width:300px !important}',
'.sh{padding:12px 14px !important;background:var(--bg) !important}',
'.sh .lbl{font-size:10.5px !important;letter-spacing:.9px !important}',
'.sh .mini{width:28px !important;height:28px !important}',

/* Folder header */
'.fh{padding:9px 11px !important;font-size:12px !important;border-radius:9px !important}',
'.ti{padding:8px 10px !important;font-size:12px !important;border-radius:7px !important}',

/* === TRANSCRIPT: câu rõ ràng hơn === */
'.ts{padding:20px 24px !important}',
'.sent{padding:16px 18px !important;border-radius:12px !important;margin-bottom:12px !important;background:var(--bg2) !important;border:1px solid var(--border) !important}',
'.sent:hover{border-color:var(--text3) !important;transform:translateX(2px)}',
'.sent.active{background:linear-gradient(90deg,rgba(234,88,12,.18),rgba(234,88,12,.04)) !important;border-color:rgba(234,88,12,.4) !important;border-left:4px solid var(--accent) !important;box-shadow:0 4px 16px rgba(234,88,12,.1)}',
'.smeta{margin-bottom:9px !important;padding-bottom:8px !important;border-bottom:1px dashed var(--border)}',
'.ttag{font-size:10.5px !important;padding:3px 9px !important;font-weight:700 !important}',

/* Nút action trong câu */
'.sact{gap:5px !important}',
'.sact button{width:28px !important;height:28px !important;border-radius:7px !important;background:var(--bg) !important;border:1px solid var(--border) !important}',
'.sact button:hover{background:var(--card) !important}',
'.sact button[data-pron]{color:#06b6d4 !important}',
'.sact button[data-pron]:hover{background:rgba(6,182,212,.15) !important;border-color:rgba(6,182,212,.4) !important}',

/* Chữ Hán to rõ hơn */
'.szh{font-size:20px !important;font-weight:500 !important;line-height:1.85 !important;letter-spacing:.5px !important}',
'.spy{font-size:13px !important;margin-top:8px !important;letter-spacing:.5px !important}',
'.svi{font-size:13px !important;margin-top:9px !important;padding-top:9px !important;line-height:1.65 !important}',

/* === PLAYER: gọn và rõ === */
'.player{padding:10px 16px 14px !important;box-shadow:0 -4px 20px rgba(0,0,0,.2) !important}',
'.crow{gap:10px !important}',
'.cb{width:38px !important;height:38px !important;border-radius:10px !important;font-size:15px !important}',
'.cb.main{width:50px !important;height:50px !important;font-size:19px !important}',
'.cb svg{width:18px !important;height:18px !important}',
'.cb.main svg{width:22px !important;height:22px !important}',

/* Player group rõ ràng hơn */
'.cgroup{gap:6px !important}',
'.cb.sub{height:32px !important;padding:0 10px !important;font-size:11.5px !important;font-weight:700 !important;border-radius:8px !important;background:var(--card) !important;border:1px solid var(--border) !important}',
'.cb.sub:hover{background:var(--card2) !important}',
'.cb.sub.on{background:var(--accent) !important;border-color:var(--accent) !important;color:#fff !important}',

/* Speed select + volume */
'.sel{padding:7px 11px !important;font-size:11.5px !important;font-weight:700 !important}',
'.volwrap input{width:70px !important}',

/* === MODAL: rộng rãi hơn === */
'.mc{padding:22px !important;border-radius:16px !important}',
'.mc.lg{max-width:820px !important}',
'.mch{margin-bottom:16px !important;padding-bottom:14px !important}',
'.mch h3{font-size:16px !important;font-weight:700 !important}',

/* Import modal rộng hơn */
'.im-mc{max-width:860px !important}',
'.im-body{padding:22px 26px !important}',

/* Saved modal rộng hơn */
'.saved-mc{max-width:760px !important}',

/* === VERSION BADGE === */
'.ver-badge{font-size:9.5px;background:rgba(234,88,12,.15);color:var(--accent2);padding:2px 7px;border-radius:5px;font-weight:700;letter-spacing:.4px;margin-left:6px}',

/* === MOBILE === */
'@media(max-width:900px){',
'  .hdr{padding:0 10px !important;height:52px !important}',
'  .logo{font-size:14px !important}',
'  .logo .mark{width:30px !important;height:30px !important;font-size:15px !important}',
'  .hbtn.pri-action,.hbtn.save-action{padding:0 12px !important;font-size:11.5px !important;height:36px !important}',
'  .hbtn-group{padding:3px;gap:2px}',
'  .hbtn-group .hbtn{padding:0 8px !important;height:30px !important;font-size:11px !important}',
'  .hbtn.pri-action span,.hbtn.save-action span:not(.cnt-badge){display:none !important}',
'  .mbtns-group{padding:3px;gap:2px}',
'  .mbtns-group .mbtn{width:30px !important;height:30px !important}',
'  .ts{padding:14px 12px !important}',
'  .sent{padding:12px 14px !important;margin-bottom:10px !important}',
'  .szh{font-size:17px !important}',
'  .cb{width:34px !important;height:34px !important}',
'  .cb.main{width:46px !important;height:46px !important}',
'  .volwrap{display:none !important}',
'  .crow{gap:5px !important}',
'  .cgroup{gap:4px !important}',
'}',
'@media(max-width:600px){',
'  .hbtn-group:not(.essential){display:none !important}',
'  .hdr{padding:0 8px !important}',
'  .logo em,.logo .ver-badge{display:none !important}',
'}',

/* === TOOLTIP cho nút nhỏ === */
'.hbtn[title]:hover::after,.mbtn[title]:hover::after,.cb[title]:hover::after{content:attr(title);position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);background:var(--card);color:var(--text);padding:5px 10px;border-radius:6px;font-size:10.5px;font-weight:600;white-space:nowrap;border:1px solid var(--border);box-shadow:0 4px 12px rgba(0,0,0,.4);z-index:999;pointer-events:none}'

].join('\n');
document.head.appendChild(style);

/* ========== REORGANIZE HEADER ========== */
function reorganizeHeader() {
  const hdr = document.querySelector('.hdr');
  if (!hdr || hdr.dataset.reorganized) return;

  const hbtns = hdr.querySelector('.hbtns');
  if (!hbtns) return;

  // Lưu references
  const batchBtn = document.getElementById('batchBtn');
  const fileLabel = hbtns.querySelector('label[title*="Nạp cả thư mục"]') || hbtns.querySelector('label[title*="thư mục"]');
  const fileSingleLabel = hbtns.querySelector('label[title*="file lẻ"], label[title*="Chọn file"]');
  const smartGroupBtn = document.getElementById('smartGroupBtn');
  const focusBtn = document.getElementById('focusBtn');
  const cmdBtn = document.getElementById('cmdBtn');
  const statsBtn = document.getElementById('statsBtn');
  const helpBtn = document.getElementById('helpBtn');
  const themeBtn = document.getElementById('themeBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const importBtn = document.getElementById('importBtn');
  const savedBtn = document.getElementById('savedBtn');
  const toneBtn = document.getElementById('toneBtn');

  // Xóa hết hbtns
  hbtns.innerHTML = '';

  // Nhóm 1: File (essential)
  const fileGroup = document.createElement('div');
  fileGroup.className = 'hbtn-group essential';
  if (fileLabel) fileGroup.appendChild(fileLabel);
  if (fileSingleLabel) fileSingleLabel.classList.add('icon-only');
  if (fileSingleLabel) fileGroup.appendChild(fileSingleLabel);
  hbtns.appendChild(fileGroup);

  // Nhóm 2: Học tập (essential)
  const learnGroup = document.createElement('div');
  learnGroup.className = 'hbtn-group essential';
  if (smartGroupBtn) learnGroup.appendChild(smartGroupBtn);
  hbtns.appendChild(learnGroup);

  // Nút Import văn - nổi bật
  if (importBtn) {
    importBtn.className = 'hbtn';
    importBtn.style.background = 'linear-gradient(135deg,#8b5cf6,#6366f1)';
    importBtn.style.color = '#fff';
    importBtn.style.border = 'none';
    importBtn.innerHTML = '<svg style="width:15px;height:15px"><use href="#i-file"/></svg><span>Nhập văn</span>';
    hbtns.appendChild(importBtn);
  }

  // Nút Kho câu - nổi bật với badge
  if (savedBtn) {
    savedBtn.className = 'hbtn save-action';
    savedBtn.innerHTML = '<svg style="width:15px;height:15px"><use href="#i-bookmark"/></svg><span>Kho câu</span><span class="cnt-badge" id="savedBadge">' + (window.DD ? window.DD.saved.length : 0) + '</span>';
    hbtns.appendChild(savedBtn);
  }

  // Nút Tự chép - nổi bật
  if (batchBtn) {
    batchBtn.className = 'hbtn pri-action';
    batchBtn.innerHTML = '<svg style="width:15px;height:15px"><use href="#i-lightning"/></svg><span>Tự Chép</span>';
    hbtns.appendChild(batchBtn);
  }

  // Nút overflow (⋮)
  const moreBtn = document.createElement('button');
  moreBtn.className = 'hbtn more-btn';
  moreBtn.title = 'Thêm (menu)';
  moreBtn.innerHTML = '<svg style="width:16px;height:16px"><use href="#i-menu"/></svg>';
  hbtns.appendChild(moreBtn);

  // Menu ẩn
  const menu = document.createElement('div');
  menu.className = 'more-menu';
  menu.id = 'moreMenu';
  menu.innerHTML = [
    '<div class="more-menu-label">Học tập</div>',
    '<div class="more-menu-item" data-act="focus">',
    '  <svg><use href="#i-target"/></svg>',
    '  <span>Focus Mode</span>',
    '  <span class="shortcut">F</span>',
    '</div>',
    '<div class="more-menu-item" data-act="cmd">',
    '  <svg><use href="#i-search"/></svg>',
    '  <span>Tra từ nhanh</span>',
    '  <span class="shortcut">⌘K</span>',
    '</div>',
    '<div class="more-menu-item" data-act="stats">',
    '  <svg><use href="#i-chart"/></svg>',
    '  <span>Thống kê</span>',
    '</div>',
    '<div class="more-menu-item" data-act="tone">',
    '  <svg><use href="#i-sun"/></svg>',
    '  <span>Tô màu thanh điệu</span>',
    '  <span class="shortcut">T</span>',
    '</div>',
    '<div class="more-menu-sep"></div>',
    '<div class="more-menu-label">Giao diện</div>',
    '<div class="more-menu-item" data-act="theme">',
    '  <svg><use href="#i-moon"/></svg>',
    '  <span>Đổi giao diện</span>',
    '</div>',
    '<div class="more-menu-item" data-act="settings">',
    '  <svg><use href="#i-cog"/></svg>',
    '  <span>Cài đặt</span>',
    '</div>',
    '<div class="more-menu-sep"></div>',
    '<div class="more-menu-item" data-act="help">',
    '  <svg><use href="#i-cap"/></svg>',
    '  <span>Trợ giúp</span>',
    '  <span class="shortcut">?</span>',
    '</div>'
  ].join('\n');
  document.body.appendChild(menu);

  // Event cho menu
  moreBtn.onclick = (e) => {
    e.stopPropagation();
    menu.classList.toggle('show');
  };
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== moreBtn && !moreBtn.contains(e.target)) {
      menu.classList.remove('show');
    }
  });

  menu.addEventListener('click', (e) => {
    const item = e.target.closest('.more-menu-item');
    if (!item) return;
    const act = item.dataset.act;
    menu.classList.remove('show');
    if (act === 'focus' && focusBtn) focusBtn.click();
    else if (act === 'cmd' && cmdBtn) cmdBtn.click();
    else if (act === 'stats' && statsBtn) statsBtn.click();
    else if (act === 'tone' && toneBtn) toneBtn.click();
    else if (act === 'theme' && themeBtn) themeBtn.click();
    else if (act === 'settings' && settingsBtn) settingsBtn.click();
    else if (act === 'help' && helpBtn) helpBtn.click();
  });

  // Ẩn nút gốc (đã đưa vào menu)
  [focusBtn, cmdBtn, statsBtn, helpBtn, themeBtn, settingsBtn, toneBtn].forEach(btn => {
    if (btn) {
      btn.style.display = 'none';
      btn.setAttribute('data-in-menu', '1');
    }
  });

  hdr.dataset.reorganized = '1';
}

/* ========== REORGANIZE MAIN HEADER ========== */
function reorganizeMainHeader() {
  const mh = document.querySelector('.mh');
  if (!mh || mh.dataset.reorganized) return;

  const toggleHan = document.getElementById('toggleHanBtn');
  const togglePy = document.getElementById('togglePinyinBtn');
  const toggleVi = document.getElementById('toggleViBtn');
  const transcribeBtn = document.getElementById('transcribeBtn');
  const editBtn = document.getElementById('editTranscriptBtn');
  const lrcLabel = mh.querySelector('label[title*="LRC"]') || mh.querySelector('label[title*="file"]');

  // Xóa hết sau title
  const title = mh.querySelector('.title');
  const pill = mh.querySelector('.pill');

  // Xóa các nút cũ
  [toggleHan, togglePy, toggleVi, transcribeBtn, editBtn, lrcLabel].forEach(el => {
    if (el) el.remove();
  });

  // Nhóm 1: Chế độ hiển thị (Han / Py / Vi)
  const viewGroup = document.createElement('div');
  viewGroup.className = 'mbtns-group';
  if (toggleHan) viewGroup.appendChild(toggleHan);
  if (togglePy) viewGroup.appendChild(togglePy);
  if (toggleVi) viewGroup.appendChild(toggleVi);
  mh.appendChild(viewGroup);

  // Nhóm 2: Nhập liệu (LRC + Edit)
  const inputGroup = document.createElement('div');
  inputGroup.className = 'mbtns-group';
  if (lrcLabel) inputGroup.appendChild(lrcLabel);
  if (editBtn) inputGroup.appendChild(editBtn);
  mh.appendChild(inputGroup);

  // Nút AI nổi bật
  if (transcribeBtn) {
    transcribeBtn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
    transcribeBtn.style.border = 'none';
    transcribeBtn.style.color = '#fff';
    transcribeBtn.style.width = '38px';
    transcribeBtn.style.height = '38px';
    transcribeBtn.style.borderRadius = '10px';
    transcribeBtn.style.boxShadow = '0 4px 12px rgba(16,185,129,.35)';
    transcribeBtn.title = 'AI chép lời bài này';
    mh.appendChild(transcribeBtn);
  }

  mh.dataset.reorganized = '1';
}

/* ========== VERSION BADGE ========== */
function addVersionBadge() {
  const logo = document.querySelector('.logo div');
  if (!logo || logo.querySelector('.ver-badge')) return;
  const badge = document.createElement('span');
  badge.className = 'ver-badge';
  badge.textContent = 'v3.0';
  logo.appendChild(badge);
}

/* ========== UPDATE BADGE COUNT ========== */
function updateBadgeCount() {
  const b = document.getElementById('savedBadge');
  if (b && window.DD) b.textContent = window.DD.saved.length;
}

/* ========== OBSERVE DYNAMIC INJECTION ========== */
function observeInjection() {
  // app4 và app5 inject nút, cần re-organize sau khi inject
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    const hasSaved = !!document.getElementById('savedBtn');
    const hasImport = !!document.getElementById('importBtn');
    const hasTone = !!document.getElementById('toneBtn');

    if ((hasSaved && hasImport) || attempts > 30) {
      clearInterval(timer);
      // Đợi thêm chút để mọi thứ render xong
      setTimeout(() => {
        reorganizeHeader();
        reorganizeMainHeader();
        addVersionBadge();
        setInterval(updateBadgeCount, 1000);
      }, 400);
    }
  }, 200);
}

/* ========== KEYBOARD ========== */
document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  // Escape đóng menu
  if (e.key === 'Escape') {
    const m = document.getElementById('moreMenu');
    if (m) m.classList.remove('show');
  }
});

/* ========== INIT ========== */
function init() {
  observeInjection();
  console.log('[app6 v1.0] UI Redesign loaded');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();