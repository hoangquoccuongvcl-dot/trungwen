'use strict';
/* app5.js v2.0 — Đoạn văn → Tách câu + Pinyin + Dịch */

(function(){

/* ========== CHECK SHARED STATE ========== */
if (!window.DD) {
  console.error('[app5] window.DD chưa có. Cần app4.js nạp trước!');
  return;
}

const DD = window.DD;

/* ========== CSS ========== */
const style = document.createElement('style');
style.textContent = [
'.im-modal{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:800;display:none;align-items:center;justify-content:center;padding:16px}',
'.im-modal.show{display:flex}',
'.im-mc{background:var(--bg2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:780px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.7)}',
'.im-hd{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:var(--bg)}',
'.im-hd h3{font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px}',
'.im-hd h3 svg{width:18px;height:18px;stroke:var(--accent);fill:none;stroke-width:2;stroke-linecap:round}',
'.im-body{flex:1;overflow-y:auto;padding:18px 20px}',
'.im-body::-webkit-scrollbar{width:8px}',
'.im-body::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}',
'.im-label{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;display:block}',
'.im-ta{width:100%;min-height:180px;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;color:var(--text);font-size:15px;font-family:"PingFang TC","Microsoft JhengHei",sans-serif;line-height:1.7;outline:none;resize:vertical;transition:border-color .15s}',
'.im-ta:focus{border-color:var(--accent)}',
'.im-ta::placeholder{color:var(--text3);font-size:13px}',
'.im-tools{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;align-items:center}',
'.im-tools button{background:var(--card);border:1px solid var(--border);color:var(--text2);padding:7px 12px;border-radius:8px;font-size:11.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.15s}',
'.im-tools button:hover{background:var(--card2);color:var(--text)}',
'.im-tools button.pri{background:var(--accent);border-color:var(--accent);color:#fff}',
'.im-tools button.pri:hover{background:var(--accent2)}',
'.im-tools button.pri:disabled{opacity:.6;cursor:not-allowed}',
'.im-tools button svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
'.im-count{font-size:11px;color:var(--text3);margin-left:auto;font-weight:600}',
'.im-mode{display:flex;gap:6px;margin-top:12px;margin-bottom:4px}',
'.im-mode button{flex:1;background:var(--card);border:1px solid var(--border);color:var(--text2);padding:8px 12px;border-radius:8px;font-size:11.5px;font-weight:600;cursor:pointer;transition:.15s}',
'.im-mode button.active{background:var(--accent);border-color:var(--accent);color:#fff}',
'.im-mode button:hover:not(.active){background:var(--card2)}',
'.im-sent-list{margin-top:18px;display:flex;flex-direction:column;gap:10px}',
'.im-sent{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;transition:.15s}',
'.im-sent:hover{border-color:var(--accent)}',
'.im-sent.picked{background:rgba(16,185,129,.08);border-color:var(--green)}',
'.im-sent-cb{width:20px;height:20px;border-radius:5px;background:var(--card);border:1px solid var(--border);flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;margin-top:2px;user-select:none}',
'.im-sent-cb.on{background:var(--green);border-color:var(--green)}',
'.im-sent-cb.on::after{content:"✓";color:#fff;font-size:13px;font-weight:800}',
'.im-sent-body{flex:1;min-width:0}',
'.im-sent-zh{font-size:16px;font-weight:500;color:var(--text);line-height:1.5;font-family:"PingFang TC",sans-serif;word-break:break-word}',
'.im-sent-py{font-size:11.5px;color:var(--accent2);margin-top:4px;font-family:ui-monospace,monospace;letter-spacing:.2px}',
'.im-sent-vi{font-size:12.5px;color:var(--text2);margin-top:4px;font-style:italic;line-height:1.5;min-height:18px}',
'.im-sent-vi.loading{opacity:.5}',
'.im-sent-edit{display:flex;gap:4px;flex-shrink:0}',
'.im-sent-edit button{width:26px;height:26px;border-radius:6px;background:transparent;color:var(--text3);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}',
'.im-sent-edit button:hover{background:var(--card);color:var(--text)}',
'.im-sent-edit button svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
'.im-sent-edit button.edit:hover{color:var(--yellow)}',
'.im-sent-edit button.del:hover{color:var(--rose)}',
'.im-sent-edit button.tts:hover{color:var(--accent2)}',
'.im-editing{display:flex;flex-direction:column;gap:6px;width:100%}',
'.im-editing input{background:var(--bg2);border:1px solid var(--accent);border-radius:7px;padding:7px 10px;color:var(--text);font-size:14px;font-family:"PingFang TC",sans-serif;outline:none;width:100%}',
'.im-editing input[type=text]:not(#im-edit-zh-0){}',
'.im-ft{padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:10px;background:var(--bg);flex-wrap:wrap}',
'.im-ft-info{font-size:12px;color:var(--text3)}',
'.im-ft-info b{color:var(--accent)}',
'.im-ft-acts{display:flex;gap:8px}',
'.im-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite;display:inline-block}',
'@keyframes spin{to{transform:rotate(360deg)}}',
'.im-bulk{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}',
'.im-bulk button{background:var(--card);border:1px solid var(--border);color:var(--text2);padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;transition:.15s}',
'.im-bulk button:hover{background:var(--card2);color:var(--text)}'
].join('\n');
document.head.appendChild(style);

/* ========== STATE ========== */
let previewSents = [];
let isProcessing = false;
let cancelFlag = false;
let currentMode = 'auto';

/* ========== SPLIT SENTENCES ========== */
function splitIntoSentences(text, mode) {
  text = String(text || '').trim();
  if (!text) return [];

  if (mode === 'line') {
    return text.split('\n').map(l => l.trim()).filter(l => l && /[\u4e00-\u9fa5]/.test(l));
  }

  if (mode === 'paragraph') {
    return text.split(/\n\n+/).map(p => p.replace(/\n/g, ' ').trim()).filter(p => p && /[\u4e00-\u9fa5]/.test(p));
  }

  // Auto mode: tách theo dấu kết câu 。！？!?
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/([。！？!?])/g, '$1||SPLIT||')
    .replace(/\n+/g, '||SPLIT||');

  const parts = normalized.split('||SPLIT||').map(s => s.trim()).filter(Boolean);

  // Merge mảnh < 3 chữ vào câu trước
  const result = [];
  for (const p of parts) {
    const chars = p.replace(/[^\u4e00-\u9fa5]/g, '').length;
    if (chars === 0) continue;
    if (chars < 3 && result.length) {
      result[result.length - 1] += p;
    } else {
      result.push(p);
    }
  }
  return result.filter(s => /[\u4e00-\u9fa5]/.test(s));
}

/* ========== BATCH TRANSLATE ========== */
async function batchTranslate(sentences, onProgress) {
  // Chia thành batch 5 câu
  const BATCH = 5;
  const DELAY_BETWEEN = 250;
  const results = new Array(sentences.length).fill('');

  for (let i = 0; i < sentences.length; i += BATCH) {
    if (cancelFlag) break;
    const chunk = sentences.slice(i, i + BATCH);
    const promises = chunk.map(async (zh, idx) => {
      const globalIdx = i + idx;
      if (cancelFlag) return;
      try {
        const vi = await translateOne(zh);
        results[globalIdx] = vi;
        if (onProgress) onProgress(globalIdx, vi);
      } catch(e) {}
    });
    await Promise.all(promises);
    if (i + BATCH < sentences.length) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN));
    }
  }
  return results;
}

const trCache3 = {};
async function translateOne(text) {
  const clean = DD.normalize(text);
  if (!clean) return '';
  if (trCache3[clean]) return trCache3[clean];
  const key = 'dd_tc_' + clean.slice(0, 25);
  const cached = localStorage.getItem(key);
  if (cached) { trCache3[clean] = cached; return cached; }
  try {
    const r = await fetch('/api/translate?q=' + encodeURIComponent(clean));
    if (!r.ok) return '';
    const d = await r.json();
    if (d.text) {
      trCache3[clean] = d.text;
      try { localStorage.setItem(key, d.text); } catch(e) {}
      return d.text;
    }
    return '';
  } catch(e) { return ''; }
}
/* ========== MODAL ========== */
function getImportModal() {
  let m = document.getElementById('importModal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'importModal';
    m.className = 'im-modal';
    m.addEventListener('click', e => { if (e.target === m) closeImport(); });
    document.body.appendChild(m);
  }
  return m;
}

const $ = id => document.getElementById(id);

function openImport() {
  const m = getImportModal();
  m.innerHTML = [
    '<div class="im-mc">',
    '  <div class="im-hd">',
    '    <h3><svg><use href="#i-file"/></svg> Nhập đoạn văn</h3>',
    '    <button class="im-close" id="imCloseBtn" style="width:30px;height:30px;border-radius:8px;background:transparent;color:var(--text2);cursor:pointer;border:none;font-size:16px">✕</button>',
    '  </div>',
    '  <div class="im-body">',
    '    <label class="im-label">Dán văn bản tiếng Trung</label>',
    '    <textarea class="im-ta" id="imTa" placeholder="Dán đoạn văn, bài đọc, hội thoại...&#10;&#10;Ví dụ:&#10;你好！我叫李明。我是越南人。你是哪國人？&#10;我是台灣人。很高興認識你。"></textarea>',
    '    <div class="im-mode" id="imMode">',
    '      <button data-mode="auto" class="active">🤖 Tự động tách</button>',
    '      <button data-mode="line">📄 Mỗi dòng 1 câu</button>',
    '      <button data-mode="paragraph">📖 Tách theo đoạn</button>',
    '    </div>',
    '    <div class="im-tools">',
    '      <button class="pri" id="imProcessBtn">',
    '        <svg><use href="#i-lightning"/></svg> Tách câu + Pinyin + Dịch',
    '      </button>',
    '      <button id="imSampleBtn">📋 Mẫu</button>',
    '      <button id="imClearBtn">🗑 Xóa hết</button>',
    '      <span class="im-count" id="imCount">0 ký tự</span>',
    '    </div>',
    '    <div class="im-sent-list" id="imSentList"></div>',
    '  </div>',
    '  <div class="im-ft">',
    '    <div class="im-ft-info" id="imFtInfo">Dán văn bản rồi bấm "Tách câu"</div>',
    '    <div class="im-ft-acts">',
    '      <button class="btn" id="imCancelBtn">Hủy</button>',
    '      <button class="btn pri" id="imSaveBtn" disabled>💾 Lưu vào kho</button>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');
  m.classList.add('show');

  const ta = $('imTa');
  ta.addEventListener('input', () => {
    $('imCount').textContent = ta.value.length + ' ký tự';
  });

  $('imMode').addEventListener('click', e => {
    const b = e.target.closest('button[data-mode]');
    if (!b) return;
    $('imMode').querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    currentMode = b.dataset.mode;
  });

  $('imCloseBtn').onclick = closeImport;
  $('imCancelBtn').onclick = closeImport;
  $('imClearBtn').onclick = () => {
    ta.value = '';
    $('imCount').textContent = '0 ký tự';
    previewSents = [];
    renderPreview();
    updateFooter('Dán văn bản rồi bấm "Tách câu"');
  };
  $('imSampleBtn').onclick = () => {
    ta.value = '你好！我叫李明。我是越南人。你是哪國人？\n我是台灣人。很高興認識你。\n請問你叫什麼名字？\n我叫白如玉。你呢？';
    $('imCount').textContent = ta.value.length + ' ký tự';
  };

  $('imProcessBtn').onclick = () => processText(currentMode);
  $('imSaveBtn').onclick = saveAllPicked;

  ta.focus();
}

function closeImport() {
  const m = $('importModal');
  if (m) m.classList.remove('show');
  cancelFlag = true;
  setTimeout(() => {
    previewSents = [];
    isProcessing = false;
    cancelFlag = false;
  }, 100);
}

function updateFooter(html) {
  const el = $('imFtInfo');
  if (el) el.innerHTML = html;
}

/* ========== PROCESS ========== */
async function processText(mode) {
  if (isProcessing) return;
  const ta = $('imTa');
  const text = ta.value.trim();
  if (!text) { DD.toast('Chưa có văn bản', 'err'); return; }

  const lines = splitIntoSentences(text, mode);
  if (!lines.length) { DD.toast('Không tách được câu nào có chữ Hán', 'err'); return; }

  isProcessing = true;
  cancelFlag = false;

  $('imProcessBtn').innerHTML = '<span class="im-spin"></span> Đang tách...';
  $('imProcessBtn').disabled = true;
  $('imSaveBtn').disabled = true;

  previewSents = [];
  lines.forEach(line => {
    previewSents.push({
      zh: line,
      pinyin: DD.py(line),
      vi: '',
      picked: true,
      editing: false,
      loading: true
    });
  });
  renderPreview();
  updateFooter('Đã tách <b>' + previewSents.length + '</b> câu. Đang dịch...');

  $('imProcessBtn').innerHTML = '<span class="im-spin"></span> Đang dịch...';

  // Batch translate
  const total = previewSents.length;
  let done = 0;
  await batchTranslate(
    previewSents.map(s => s.zh),
    (idx, vi) => {
      previewSents[idx].vi = vi;
      previewSents[idx].loading = false;
      done++;
      const el = $('im-sv-vi-' + idx);
      if (el) {
        el.textContent = vi || '(không dịch được)';
        el.classList.remove('loading');
      }
      updateFooter('Đã dịch <b>' + done + '</b> / ' + total + ' câu');
    }
  );

  // Đánh dấu các câu còn loading
  previewSents.forEach(s => { if (s.loading) s.loading = false; });

  $('imProcessBtn').innerHTML = '<svg><use href="#i-lightning"/></svg> Tách lại';
  $('imProcessBtn').disabled = false;
  $('imSaveBtn').disabled = false;
  updateFooter('Xong! <b>' + total + '</b> câu đã sẵn sàng. Bấm "Lưu vào kho".');
  isProcessing = false;
  updateCount();
}

/* ========== RENDER PREVIEW ========== */
function renderPreview() {
  const list = $('imSentList');
  if (!list) return;
  if (!previewSents.length) {
    list.innerHTML = '';
    return;
  }
  list.innerHTML = previewSents.map((s, i) => {
    if (s.editing) {
      return [
        '<div class="im-sent picked">',
        '  <div class="im-sent-cb on"></div>',
        '  <div class="im-sent-body im-editing">',
        '    <input type="text" id="im-edit-zh-' + i + '" value="' + DD.esc(s.zh) + '" placeholder="Chữ Hán">',
        '    <input type="text" id="im-edit-py-' + i + '" value="' + DD.esc(s.pinyin) + '" placeholder="Pinyin (tự sinh nếu trống)">',
        '    <input type="text" id="im-edit-vi-' + i + '" value="' + DD.esc(s.vi) + '" placeholder="Tiếng Việt (tự dịch nếu trống)">',
        '    <div style="display:flex;gap:6px;margin-top:4px">',
        '      <button class="btn pri sm" onclick="imSaveEdit(' + i + ')">Lưu</button>',
        '      <button class="btn sm" onclick="imCancelEdit(' + i + ')">Hủy</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    }
    return [
      '<div class="im-sent ' + (s.picked ? 'picked' : '') + '" data-idx="' + i + '">',
      '  <div class="im-sent-cb ' + (s.picked ? 'on' : '') + '" onclick="imTogglePick(' + i + ')"></div>',
      '  <div class="im-sent-body">',
      '    <div class="im-sent-zh">' + DD.esc(s.zh) + '</div>',
      s.pinyin ? '    <div class="im-sent-py">' + DD.esc(s.pinyin) + '</div>' : '',
      '    <div class="im-sent-vi ' + (s.loading ? 'loading' : '') + '" id="im-sv-vi-' + i + '">' + DD.esc(s.vi || (s.loading ? 'Đang dịch...' : '')) + '</div>',
      '  </div>',
      '  <div class="im-sent-edit">',
      '    <button class="tts" onclick="imSpeak(' + i + ')" title="Nghe"><svg><use href="#i-vol"/></svg></button>',
      '    <button class="edit" onclick="imEdit(' + i + ')" title="Sửa"><svg><use href="#i-pencil"/></svg></button>',
      '    <button class="del" onclick="imDel(' + i + ')" title="Xóa"><svg><use href="#i-trash"/></svg></button>',
      '  </div>',
      '</div>'
    ].join('\n');
  }).join('');
  updateCount();
}

function updateCount() {
  const picked = previewSents.filter(s => s.picked).length;
  const el = $('imSaveBtn');
  if (el) {
    el.disabled = picked === 0;
    el.innerHTML = '💾 Lưu ' + (picked ? picked + ' câu' : 'vào kho');
  }
}

/* ========== PREVIEW ACTIONS ========== */
window.imTogglePick = function(i) {
  if (previewSents[i]) {
    previewSents[i].picked = !previewSents[i].picked;
    renderPreview();
  }
};

window.imSpeak = function(i) {
  if (previewSents[i]) DD.speak(previewSents[i].zh);
};

window.imEdit = function(i) {
  if (previewSents[i]) {
    previewSents[i].editing = true;
    renderPreview();
    setTimeout(() => {
      const el = $('im-edit-zh-' + i);
      if (el) el.focus();
    }, 50);
  }
};

window.imCancelEdit = function(i) {
  if (previewSents[i]) {
    previewSents[i].editing = false;
    renderPreview();
  }
};

window.imSaveEdit = function(i) {
  const s = previewSents[i];
  if (!s) return;
  const zh = $('im-edit-zh-' + i).value.trim();
  const py = $('im-edit-py-' + i).value.trim();
  const vi = $('im-edit-vi-' + i).value.trim();
  if (!zh) { DD.toast('Chữ Hán trống', 'err'); return; }
  s.zh = zh;
  s.pinyin = py || DD.py(zh);
  s.vi = vi || s.vi;
  s.editing = false;
  if (!vi && !s.vi) {
    translateOne(zh).then(v => { s.vi = v; renderPreview(); });
  } else {
    renderPreview();
  }
  DD.toast('Đã cập nhật', 'ok');
};

window.imDel = function(i) {
  previewSents.splice(i, 1);
  renderPreview();
};

/* ========== BULK ========== */
function injectBulk() {
  const list = $('imSentList');
  if (!list || !previewSents.length) return;
  let bulk = $('imBulkBar');
  if (!bulk) {
    bulk = document.createElement('div');
    bulk.className = 'im-bulk';
    bulk.id = 'imBulkBar';
    list.parentNode.insertBefore(bulk, list);
  }
  bulk.innerHTML = [
    '<button onclick="imBulkPick(1)">✓ Chọn tất cả</button>',
    '<button onclick="imBulkPick(0)">☐ Bỏ chọn tất cả</button>',
    '<button onclick="imBulkDelete()">🗑 Xóa đã chọn</button>'
  ].join('');
}

window.imBulkPick = function(v) {
  previewSents.forEach(s => s.picked = !!v);
  renderPreview();
};

window.imBulkDelete = function() {
  previewSents = previewSents.filter(s => !s.picked);
  renderPreview();
};

/* ========== SAVE ========== */
function saveAllPicked() {
  const picked = previewSents.filter(s => s.picked);
  if (!picked.length) { DD.toast('Chưa chọn câu nào', 'err'); return; }

  let n = 0;
  let dup = 0;
  for (const s of picked) {
    const clean = DD.normalize(s.zh);
    if (!clean) continue;
    // Check duplicate in current saved
    if (DD.saved.some(x => DD.normalize(x.zh) === clean)) {
      dup++;
      continue;
    }
    const item = {
      id: 'sv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      zh: clean,
      pinyin: s.pinyin || DD.py(clean),
      vi: s.vi || '',
      source: 'Nhập đoạn văn',
      trackId: '',
      start: null,
      end: null,
      created: Date.now()
    };
    DD.saved.unshift(item);
    n++;
  }
  DD.saveList();
  if (typeof DD.renderSaved === 'function') DD.renderSaved();
  if (typeof DD.updateBadge === 'function') DD.updateBadge();

  let msg = '💾 Đã lưu ' + n + ' câu';
  if (dup) msg += ' (' + dup + ' câu trùng bị bỏ qua)';
  DD.toast(msg, 'ok');
  if (n > 0) closeImport();
}

/* ========== HEADER BUTTON ========== */
function addImportBtn() {
  const hb = document.querySelector('.hbtns');
  if (!hb || $('importBtn')) return;
  const btn = document.createElement('button');
  btn.className = 'hbtn';
  btn.id = 'importBtn';
  btn.title = 'Nhập đoạn văn (I)';
  btn.innerHTML = '<svg><use href="#i-file"/></svg><span>Nhập văn</span>';
  btn.onclick = openImport;
  const ref = $('themeBtn');
  if (ref) hb.insertBefore(btn, ref); else hb.appendChild(btn);
}

/* ========== KEYBOARD ========== */
document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'imTa') {
      e.preventDefault();
      processText(currentMode);
    }
    return;
  }
  if (e.key === 'i' || e.key === 'I') {
    e.preventDefault();
    openImport();
  }
  if (e.key === 'Escape') closeImport();
});

/* ========== OBSERVER cho bulk bar ========== */
function observePreview() {
  const list = $('imSentList');
  if (!list) { setTimeout(observePreview, 500); return; }
  new MutationObserver(() => {
    if (previewSents.length) injectBulk();
  }).observe(list, { childList: true, subtree: true });
}

/* ========== EXPOSE ========== */
window.openImportModal = openImport;
window.closeImportModal = closeImport;

/* ========== INIT ========== */
function init() {
  addImportBtn();
  observePreview();
  console.log('[app5 v2.0] Import text → split → pinyin → translate loaded');
  setTimeout(() => {
    if (typeof window.toast === 'function') {
      window.toast('📝 Bấm I hoặc nút "Nhập văn" để nhập đoạn văn');
    }
  }, 5000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();