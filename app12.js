'use strict';
/* ============================================================
   app12.js v1.0 — Nút "Đoạn mới" + "Lưu" rõ ràng
   Cần app10.js + app11.js nạp trước.
   ============================================================ */
(function(){

if (!window.impState) {
  console.error('[app12] Cần app10.js nạp trước!');
  return;
}
if (!window.DD) window.DD = {};

const $ = id => document.getElementById(id);
const ST = window.impState;

/* ============================================================
   1. TOAST RIÊNG
   ============================================================ */
function pToast(msg, type) {
  let el = $('pToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'pToast';
    el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%) translateY(-20px);background:var(--card);border:1px solid var(--border);color:var(--text);padding:11px 20px;border-radius:11px;font-size:12.5px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.4);z-index:400;opacity:0;transition:.25s;pointer-events:none;max-width:90vw;text-align:center';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.borderColor = type === 'ok' ? 'var(--green)' : type === 'err' ? 'var(--rose)' : 'var(--border)';
  el.style.color = type === 'ok' ? 'var(--green)' : type === 'err' ? 'var(--rose)' : 'var(--text)';
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(-20px)';
  }, 2400);
}

/* ============================================================
   2. TẠO ĐOẠN MỚI
   ============================================================ */
function goToNewPassage() {
  if (ST.sentences.length > 0) {
    // Đoạn hiện tại đã lưu hay chưa?
    const isSaved = !!window._isPassageSaved;
    const msg = isSaved
      ? '📝 Tạo đoạn mới?\n\nĐoạn hiện tại đã lưu trong thư viện (📚). Bạn mở lại bất cứ lúc nào.\n\nTiếp tục?'
      : '⚠️ Đoạn hiện tại CHƯA lưu!\n\nNếu OK, nội dung sẽ bị mất.\n\n💡 Gợi ý: Bấm Cancel → Cmd+S để lưu trước.\n\nVẫn muốn tạo đoạn mới?';
    if (!confirm(msg)) return;
  }

  // Dừng audio
  try { if (window.impStopAudio) window.impStopAudio(); } catch(e){}

  // Reset state app10
  ST.sentences = [];
  ST.currentIdx = -1;
  ST.loopA = null;
  ST.loopB = null;
  ST.playing = false;

  // Reset curPassageId của app11
  try {
    if (typeof window._clearCurPassage === 'function') window._clearCurPassage();
    window._isPassageSaved = false;
  } catch(e){}

  // Xoá textarea
  const ta = $('impvTa');
  if (ta) ta.value = '';

  // Xoá draft
  try { localStorage.removeItem('dd_impv_draft_v2'); } catch(e){}

  // Reset localStorage state app10
  try {
    const raw = localStorage.getItem('dd_impv_v31');
    if (raw) {
      const d = JSON.parse(raw);
      d.sentences = [];
      d.currentIdx = -1;
      d.draft = '';
      localStorage.setItem('dd_impv_v31', JSON.stringify(d));
    }
  } catch(e){}

  // Chuyển về màn hình nhập
  if (window.impSwitchSection) {
    window.impSwitchSection('input');
  } else {
    ['input', 'loading', 'study'].forEach(n => {
      const el = $('impvSec' + n.charAt(0).toUpperCase() + n.slice(1));
      if (el) el.classList.toggle('show', n === 'input');
    });
  }

  // Update stats
  if (ta) ta.dispatchEvent(new Event('input'));

  // Focus
  setTimeout(() => { if (ta) ta.focus(); }, 200);

  pToast('📝 Sẵn sàng nhập đoạn mới', 'ok');
}

/* ============================================================
   3. INJECT NÚT "ĐOẠN MỚI" + "LƯU" VÀO TOOLBAR
   ============================================================ */
function injectToolbarButtons() {
  const backBtn = $('impvTBack');
  if (!backBtn) return;

  // Đổi nút "Nhập lại" cũ thành "Đoạn mới" xanh lá
  if (backBtn.dataset.rebranded !== '1') {
    backBtn.dataset.rebranded = '1';
    backBtn.title = 'Tạo đoạn mới (Cmd+N)';
    backBtn.style.cssText = 'background:linear-gradient(135deg,#10b981,#059669)!important;color:#fff!important;border:none!important;width:auto!important;padding:0 12px!important;height:34px!important;display:inline-flex!important;align-items:center!important;gap:6px!important;font-weight:700!important;font-size:11.5px!important;border-radius:8px!important;white-space:nowrap!important;flex-shrink:0!important';
    backBtn.innerHTML = '<svg style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round"><use href="#i-file"/></svg><span>Đoạn mới</span>';
    backBtn.onclick = e => {
      e.stopPropagation();
      goToNewPassage();
    };
  }

  // Thêm nút "Lưu" cùng nhóm
  const group = backBtn.parentElement;
  if (group && !group.querySelector('#impvTSaveQuick')) {
    const saveBtn = document.createElement('button');
    saveBtn.className = 'impv-tbtn';
    saveBtn.id = 'impvTSaveQuick';
    saveBtn.title = 'Lưu đoạn vào thư viện (Cmd+S)';
    saveBtn.style.cssText = 'background:linear-gradient(135deg,#8b5cf6,#6366f1)!important;color:#fff!important;border:none!important;width:auto!important;padding:0 12px!important;height:34px!important;display:inline-flex!important;align-items:center!important;gap:6px!important;font-weight:700!important;font-size:11.5px!important;border-radius:8px!important;white-space:nowrap!important;flex-shrink:0!important';
    saveBtn.innerHTML = '<svg style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round"><use href="#i-bookmark"/></svg><span>Lưu</span>';
    saveBtn.onclick = e => {
      e.stopPropagation();
      if (window.app11SavePassage) {
        window.app11SavePassage();
        window._isPassageSaved = true;
      } else {
        pToast('❌ Cần app11.js nạp trước', 'err');
      }
    };
    group.insertBefore(saveBtn, backBtn);
  }
}

/* ============================================================
   4. ĐỔI NHÃN NÚT "NHẬP LẠI" CŨ TRONG TOPBAR (nếu có)
   ============================================================ */
function fixTopbarLabels() {
  // Không có gì phải sửa — app10 đã ổn
}

/* ============================================================
   5. HOTKEY Cmd+N
   ============================================================ */
document.addEventListener('keydown', e => {
  const impv = $('impv');
  if (!impv || !impv.classList.contains('show')) return;
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if ((e.metaKey || e.ctrlKey) && (e.key === 'n' || e.key === 'N')) {
    e.preventDefault();
    goToNewPassage();
  }
});

/* ============================================================
   6. HOOK openPage ĐỂ INJECT NGAY KHI MỞ
   ============================================================ */
const origOpenPage = window.impOpenPage;
if (typeof origOpenPage === 'function') {
  window.impOpenPage = function() {
    origOpenPage.apply(this, arguments);
    setTimeout(() => {
      injectToolbarButtons();
      fixTopbarLabels();
    }, 500);
  };
}

/* ============================================================
   7. OBSERVER — Đảm bảo nút luôn tồn tại
   ============================================================ */
setInterval(() => {
  const impv = $('impv');
  if (!impv || !impv.classList.contains('show')) return;
  injectToolbarButtons();
}, 1500);

/* ============================================================
   8. EXPOSE
   ============================================================ */
window.impGoToNewPassage = goToNewPassage;

/* ============================================================
   9. INIT
   ============================================================ */
function init() {
  console.log('[app12 v1.0] ✅ New Passage button loaded');
  // Nếu impv đang mở sẵn
  setTimeout(() => {
    const impv = $('impv');
    if (impv && impv.classList.contains('show')) {
      injectToolbarButtons();
    }
  }, 1500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1400));
} else {
  setTimeout(init, 1400);
}

})();