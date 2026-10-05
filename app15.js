'use strict';
/* app15.js v2.0 — Settings đồng bộ giữa impv + app chính */
(function(){

if (!window.impState) return;
const $ = id => document.getElementById(id);
const ST = window.impState;

const KEY_WF = 'dd_waveform_enabled';
const KEY_PF = 'dd_prefetch_enabled';

const getWf = () => localStorage.getItem(KEY_WF) !== 'off';
const getPf = () => localStorage.getItem(KEY_PF) !== 'off';

/* ============ SETTERS ============ */
function setWf(val) {
  localStorage.setItem(KEY_WF, val ? 'on' : 'off');
  if (typeof window.app14SetWaveform === 'function') {
    window.app14SetWaveform(val);
  }
  syncAll();
}

function setPf(val) {
  localStorage.setItem(KEY_PF, val ? 'on' : 'off');
  if (typeof window.app13SetPrefetch === 'function') {
    window.app13SetPrefetch(val);
  }
  syncAll();
}

/* ============ SYNC UI ============ */
function syncAll() {
  const wf = getWf();
  const pf = getPf();
  document.querySelectorAll('[data-sync="wf"] button').forEach(b => {
    b.classList.toggle('on', (b.dataset.val === 'on') === wf);
  });
  document.querySelectorAll('[data-sync="pf"] button').forEach(b => {
    b.classList.toggle('on', (b.dataset.val === 'on') === pf);
  });
}

/* ============ INJECT VÀO IMPV POPOVER ============ */
function inject() {
  const pop = $('impvPop');
  if (!pop || $('app15Box')) return;

  const box = document.createElement('div');
  box.id = 'app15Box';
  box.style.cssText = 'margin-top:18px;padding-top:16px;border-top:1px solid var(--border)';
  box.innerHTML = [
    '<div style="font-size:10.5px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px">⚙️ Tuỳ chọn học tập</div>',

    '<label class="impv-pop-label">Thanh sóng âm</label>',
    '<div class="impv-pop-row" data-sync="wf">',
    '  <button data-val="on">Bật</button>',
    '  <button data-val="off">Tắt</button>',
    '</div>',
    '<p style="font-size:10px;color:var(--text3);margin-top:-8px;margin-bottom:14px;line-height:1.5">Xem dạng sóng để luyện phát âm</p>',

    '<label class="impv-pop-label">Tải trước giọng đọc</label>',
    '<div class="impv-pop-row" data-sync="pf">',
    '  <button data-val="on">Bật</button>',
    '  <button data-val="off">Tắt</button>',
    '</div>',
    '<p style="font-size:10px;color:var(--text3);margin-top:-8px;line-height:1.5">Chuyển câu tức thì (0.1s), tốn băng thông nhẹ</p>'
  ].join('');
  pop.appendChild(box);

  box.querySelector('[data-sync="wf"]').onclick = e => {
    const b = e.target.closest('button[data-val]');
    if (!b) return;
    const val = b.dataset.val === 'on';
    setWf(val);
    if (window.toast) window.toast(val ? '✓ Bật thanh sóng âm' : 'Đã tắt thanh sóng âm', 'ok');
  };

  box.querySelector('[data-sync="pf"]').onclick = e => {
    const b = e.target.closest('button[data-val]');
    if (!b) return;
    const val = b.dataset.val === 'on';
    setPf(val);
    if (window.toast) window.toast(val ? '✓ Bật tải trước' : 'Đã tắt tải trước', 'ok');
  };

  syncAll();
}

/* ============ EXPOSE ============ */
window.app15SetPrefetch = setPf;
window.app15SetWaveform = setWf;
window.app15GetState = () => ({ wf: getWf(), pf: getPf() });

/* ============ POLL SYNC ============ */
setInterval(syncAll, 500);

/* ============ HOOK openPage ============ */
const origOpen = window.impOpenPage;
if (typeof origOpen === 'function') {
  window.impOpenPage = function() {
    origOpen.apply(this, arguments);
    setTimeout(inject, 700);
    setTimeout(syncAll, 900);
  };
}

/* ============ OBSERVER ============ */
setInterval(() => {
  const impv = $('impv');
  if (!impv || !impv.classList.contains('show')) return;
  const pop = $('impvPop');
  if (pop && !$('app15Box')) inject();
}, 1500);

/* ============ INIT ============ */
function init() {
  console.log('[app15 v2.0] ✅ Settings sync loaded');
  setTimeout(() => {
    const impv = $('impv');
    if (impv && impv.classList.contains('show')) inject();
  }, 1500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1800));
} else {
  setTimeout(init, 1800);
}

})();