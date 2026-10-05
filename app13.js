'use strict';
/* app13.js v1.0 — Prefetch TTS: chuyển câu tức thì */
(function(){

if (!window.impState) {
  console.error('[app13] Cần app10.js nạp trước!');
  return;
}

const $ = id => document.getElementById(id);
const ST = window.impState;

/* Cấu hình */
const PREFETCH_COUNT = 3;      // Số câu tải trước
const MAX_CONCURRENT = 2;      // Tối đa 2 fetch cùng lúc
const KEY = 'dd_prefetch_enabled';

let prefetchEnabled = localStorage.getItem(KEY) !== 'off';
const fetchingKeys = new Set();
const prefetchQueue = [];
let activeCount = 0;

function ttsKey(text) {
  return ST.voice + '|' + ST.rate + '|' + ST.pitch + '|' + String(text || '').trim();
}

async function fetchOne(text) {
  const clean = String(text || '').trim();
  if (!clean) return;
  const key = ttsKey(clean);
  if (ST.audioCache[key]) return;
  if (fetchingKeys.has(key)) return;
  fetchingKeys.add(key);
  try {
    const url = '/api/tts?text=' + encodeURIComponent(clean) +
      '&voice=' + encodeURIComponent(ST.voice) +
      '&rate=' + ST.rate +
      '&pitch=' + ST.pitch;
    const r = await fetch(url);
    if (!r.ok) return;
    const blob = await r.blob();
    if (blob.size < 100) return;
    if (ST.audioCache[key]) return;
    ST.audioCache[key] = URL.createObjectURL(blob);
  } catch(e) {} finally { fetchingKeys.delete(key); }
}

async function processQueue() {
  while (prefetchQueue.length && activeCount < MAX_CONCURRENT) {
    const text = prefetchQueue.shift();
    const key = ttsKey(text);
    if (ST.audioCache[key] || fetchingKeys.has(key)) continue;
    activeCount++;
    try { await fetchOne(text); } finally { activeCount--; }
  }
}

function enqueue(text) {
  const clean = String(text || '').trim();
  if (!clean) return;
  const key = ttsKey(clean);
  if (ST.audioCache[key]) return;
  if (fetchingKeys.has(key)) return;
  if (prefetchQueue.some(x => ttsKey(x) === key)) return;
  prefetchQueue.push(clean);
  processQueue();
}

function prefetchAfter(idx, count) {
  if (!prefetchEnabled) return;
  if (!ST.sentences || !ST.sentences.length) return;
  const n = count || PREFETCH_COUNT;
  for (let i = 1; i <= n; i++) {
    const t = idx + i;
    if (t < ST.sentences.length) enqueue(ST.sentences[t].zh);
  }
}

function prefetchAll(max) {
  if (!prefetchEnabled) return;
  if (!ST.sentences || !ST.sentences.length) return;
  const n = Math.min(ST.sentences.length, max || 10);
  for (let i = 0; i < n; i++) enqueue(ST.sentences[i].zh);
}

/* Poll currentIdx mỗi 300ms */
let lastIdx = -2;
setInterval(() => {
  if (!prefetchEnabled) return;
  if (!ST.sentences || !ST.sentences.length) return;
  const idx = ST.currentIdx;
  if (idx === lastIdx) return;
  lastIdx = idx;
  if (idx < 0) return;
  prefetchAfter(idx, PREFETCH_COUNT);
}, 300);

/* Khi render câu mới → prefetch 10 câu đầu */
let renderDebounce = null;
function observeRender() {
  const list = $('impvListInner');
  if (!list) { setTimeout(observeRender, 500); return; }
  new MutationObserver(() => {
    clearTimeout(renderDebounce);
    renderDebounce = setTimeout(() => {
      if (ST.sentences && ST.sentences.length) prefetchAll(10);
    }, 400);
  }).observe(list, { childList: true });
}

/* Click card → prefetch ngay */
document.addEventListener('click', e => {
  if (!prefetchEnabled) return;
  const card = e.target.closest('.impv-card');
  if (!card) return;
  const idx = parseInt(card.dataset.idx);
  if (isNaN(idx)) return;
  prefetchAfter(idx, PREFETCH_COUNT);
}, true);

/* Settings toggle */
function injectSettingsToggle() {
  const grid = document.querySelector('#settingsModal .mcb .grid');
  if (!grid || $('prefetchToggleWrap')) return;
  const wrap = document.createElement('div');
  wrap.id = 'prefetchToggleWrap';
  wrap.innerHTML = `
    <label>Tải trước giọng đọc (Prefetch)</label>
    <select class="sel full" id="prefetchSelect">
      <option value="on" ${prefetchEnabled ? 'selected' : ''}>Bật — chuyển câu tức thì</option>
      <option value="off" ${!prefetchEnabled ? 'selected' : ''}>Tắt — tiết kiệm băng thông</option>
    </select>
    <p style="font-size:10.5px;color:var(--text3);margin-top:6px">Tự tải trước 3 câu tiếp theo để phát liền mạch</p>
  `;
  grid.appendChild(wrap);
  $('prefetchSelect').onchange = e => {
    prefetchEnabled = e.target.value === 'on';
    localStorage.setItem(KEY, prefetchEnabled ? 'on' : 'off');
    if (prefetchEnabled && ST.currentIdx >= 0) prefetchAfter(ST.currentIdx, 3);
    else if (!prefetchEnabled) prefetchQueue.length = 0;
    if (typeof window.toast === 'function') {
      window.toast(prefetchEnabled ? '✓ Prefetch BẬT' : 'Prefetch TẮT', 'ok');
    }
  };
}

/* Hook openPage */
const origOpenPage = window.impOpenPage;
if (typeof origOpenPage === 'function') {
  window.impOpenPage = function() {
    origOpenPage.apply(this, arguments);
    setTimeout(() => {
      injectSettingsToggle();
      observeRender();
      if (ST.sentences && ST.sentences.length) prefetchAll(10);
    }, 500);
  };
}

function init() {
  console.log('[app13 v1.0] ✅ Prefetch TTS loaded (enabled=' + prefetchEnabled + ')');
  observeRender();
  setTimeout(injectSettingsToggle, 2000);
  setTimeout(() => {
    const impv = $('impv');
    if (impv && impv.classList.contains('show') && ST.sentences.length) prefetchAll(10);
  }, 1500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1500));
} else {
  setTimeout(init, 1500);
}

})();
window.app13SetPrefetch = (val) => {
  prefetchEnabled = !!val;
  localStorage.setItem(KEY, prefetchEnabled ? 'on' : 'off');
  if (!prefetchEnabled) prefetchQueue.length = 0;
  else if (ST.currentIdx >= 0) prefetchAfter(ST.currentIdx, PREFETCH_COUNT);
};
window.addEventListener('storage', (e) => {
  if (e.key === 'dd_prefetch_enabled') {
    prefetchEnabled = e.newValue !== 'off';
    if (!prefetchEnabled) prefetchQueue.length = 0;
  }
});