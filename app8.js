'use strict';
/* app8.js v2.0 — TTS voice xịn nhất cho tiếng Trung Đài Loan */

(function(){

if (!window.DD) window.DD = {};

/* ========== CSS ========== */
const style = document.createElement('style');
style.textContent = [
'.voice-badge{display:inline-block;font-size:9px;padding:1px 6px;border-radius:4px;font-weight:700;margin-left:4px}',
'.voice-badge.best{background:rgba(16,185,129,.2);color:#10b981}',
'.voice-badge.good{background:rgba(59,130,246,.2);color:#3b82f6}',
'.voice-badge.ok{background:rgba(245,158,11,.2);color:#f59e0b}',
'.voice-badge.low{background:rgba(148,163,184,.2);color:#94a3b8}',
'.voice-warning{background:rgba(245,158,11,.1);border-left:3px solid #f59e0b;padding:10px 12px;border-radius:8px;margin:8px 0;font-size:11.5px;line-height:1.6;color:var(--text2)}',
'.voice-warning b{color:#f59e0b}',
'.voice-warning ol{margin:6px 0 0 18px;padding:0}',
'.voice-warning li{margin-bottom:3px}'
].join('\n');
document.head.appendChild(style);

/* ========== VOICE QUALITY DATABASE ========== */
// Các giọng chất lượng cao, xếp theo độ tự nhiên
const VOICE_QUALITY = {
  // === APPLE ENHANCED/PREMIUM (tự nhiên 95%) ===
  'Meijia': { tier: 'best', desc: 'Apple Meijia (Nâng cao) — Nữ, tự nhiên nhất' },
  'Mei-Jia': { tier: 'best', desc: 'Apple Mei-Jia — Nữ Đài Loan' },
  'Tingting': { tier: 'good', desc: 'Apple Ting-Ting' },
  'Ting-Ting': { tier: 'good', desc: 'Apple Ting-Ting — Nữ Đài Loan' },
  
  // === WINDOWS NEURAL (tự nhiên 90%) ===
  'Microsoft Hanhan': { tier: 'good', desc: 'Microsoft Hanhan — Nữ Đài Loan' },
  'Microsoft Yating': { tier: 'good', desc: 'Microsoft Yating — Nữ' },
  'Microsoft Zhiwei': { tier: 'good', desc: 'Microsoft Zhiwei — Nam' },
  
  // === GOOGLE CLOUD (tự nhiên 85%) ===
  'Google 國語（臺灣）': { tier: 'good', desc: 'Google 國語 Đài Loan — Nữ' },
  'Google 台灣國語': { tier: 'good', desc: 'Google Đài Loan' },
  
  // === GIỌNG TRUNG BÌNH ===
  'Sin-ji': { tier: 'ok', desc: 'Apple Sin-ji — Nữ Hồng Kông' },
  'Li-mu': { tier: 'ok', desc: 'Apple Li-mu — Nam Bắc Kinh' },
  'Yu-shu': { tier: 'ok', desc: 'Apple Yu-shu — Nữ Bắc Kinh' },
  'Panpan': { tier: 'ok', desc: 'Apple Panpan' }
};

/* ========== VOICE STATE ========== */
let cachedVoices = [];
let bestVoice = null;
let currentVoiceName = localStorage.getItem('dd_voice_name') || '';

/* ========== LOAD VOICES ========== */
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  cachedVoices = window.speechSynthesis.getVoices() || [];
  if (!cachedVoices.length) return;
  
  // Nếu user đã chọn voice cụ thể
  if (currentVoiceName) {
    const found = cachedVoices.find(v => v.name === currentVoiceName);
    if (found) {
      bestVoice = found;
      console.log('[app8] Using saved voice:', bestVoice.name, '/', bestVoice.lang);
      return;
    }
  }
  
  // Auto-pick
  bestVoice = pickBestVoice();
  console.log('[app8] Voices loaded:', cachedVoices.length, '| Best:', bestVoice ? bestVoice.name + ' (' + bestVoice.lang + ')' : 'none');
}

function pickBestVoice() {
  if (!cachedVoices.length) return null;
  
  // Chỉ xét voices tiếng Trung
  const zhVoices = cachedVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith('zh'));
  if (!zhVoices.length) return null;
  
  // Ưu tiên Đài Loan (zh-TW) trước
  const zhTW = zhVoices.filter(v => v.lang.toLowerCase().includes('tw'));
  const pool = zhTW.length ? zhTW : zhVoices;
  
  // Chấm điểm từng voice
  const scored = pool.map(v => ({
    voice: v,
    score: scoreVoice(v)
  }));
  scored.sort((a, b) => b.score - a.score);
  
  return scored[0].voice;
}

function scoreVoice(v) {
  let score = 0;
  
  // Lang zh-TW > zh-HK > zh-CN
  if (v.lang.toLowerCase().includes('tw')) score += 100;
  else if (v.lang.toLowerCase().includes('hk')) score += 30;
  else if (v.lang.toLowerCase().includes('cn')) score += 10;
  
  // Tên giọng có trong bảng chất lượng
  const q = VOICE_QUALITY[v.name];
  if (q) {
    if (q.tier === 'best') score += 1000;
    else if (q.tier === 'good') score += 500;
    else if (q.tier === 'ok') score += 100;
  }
  
  // Local voice > network voice (nhanh hơn)
  if (v.localService) score += 50;
  
  // Có chữ "enhanced" hoặc "premium" trong tên
  if (/enhanced|premium|neural/i.test(v.name)) score += 300;
  
  // Tên chứa Meijia mạnh
  if (/meijia|mei-jia|mei_jia/i.test(v.name)) score += 400;
  
  return score;
}

/* ========== SPEAK FUNCTION (chính) ========== */
function speakX(zh, opts) {
  if (!('speechSynthesis' in window)) return null;
  if (!zh) return null;
  
  // Đảm bảo voices đã load
  if (!cachedVoices.length) loadVoices();
  if (!bestVoice) bestVoice = pickBestVoice();
  
  // Hủy giọng đang đọc
  try { speechSynthesis.cancel(); } catch(e) {}
  
  const u = new SpeechSynthesisUtterance(String(zh));
  u.lang = 'zh-TW';
  
  // Rate: 0.85-0.95 cho tự nhiên (không quá nhanh)
  u.rate = (opts && opts.rate !== undefined) ? opts.rate : 0.9;
  
  // Pitch: 1.0 mặc định, 0.95 cho nữ tự nhiên hơn
  u.pitch = (opts && opts.pitch !== undefined) ? opts.pitch : 1.0;
  
  u.volume = (opts && opts.volume !== undefined) ? opts.volume : 1.0;
  
  if (bestVoice) u.voice = bestVoice;
  
  // Log để debug
  if (opts && opts.debug) {
    console.log('[app8] Speaking with:', bestVoice ? bestVoice.name : 'default', '| rate:', u.rate);
  }
  
  // Bug Safari: cần delay nhỏ sau cancel
  setTimeout(() => {
    try { speechSynthesis.speak(u); } catch(e) { console.error('[app8] Speak error:', e); }
  }, 30);
  
  return u;
}

window.DD.speak = speakX;
window.DD.speakX = speakX;

/* ========== OVERRIDE CÁC HÀM SPEAK CŨ ========== */
// app.js dùng speakV, speakQ
window.speakV = function(i) {
  const S = window.S;
  if (!S || !S.vocab || !S.vocab[i]) return;
  speakX(S.vocab[i].zh, { rate: 0.85 });
};

window.speakQ = function() {
  if (!window.qzCur || !window.qzCur.zh) return;
  speakX(window.qzCur.zh, { rate: 0.85 });
};

// app3 dùng speak (function riêng)
window.speak = function(zh) {
  return speakX(zh, { rate: 0.85 });
};

// app4 dùng DD.speak — đã override
// app5 dùng DD.speak — đã override

/* ========== THÊM SETTINGS UI ========== */
function addVoiceSettings() {
  const grid = document.querySelector('#settingsModal .mcb .grid');
  if (!grid || document.getElementById('voiceSettingsBox')) return;
  
  const box = document.createElement('div');
  box.id = 'voiceSettingsBox';
  box.style.gridColumn = '1 / -1';
  box.innerHTML = [
    '<label style="display:block;font-size:11.5px;color:var(--text2);margin-bottom:6px;font-weight:600">Giọng đọc tiếng Trung (TTS)</label>',
    '<select class="sel full" id="voiceSelect"><option value="">🔄 Tự động chọn giọng tốt nhất</option></select>',
    '<p style="font-size:10.5px;color:var(--text3);margin-top:6px" id="voiceInfo">Đang tải...</p>',
    '<div id="voiceWarning"></div>'
  ].join('');
  grid.appendChild(box);
  
  setTimeout(() => refreshVoiceList(), 300);
}

function refreshVoiceList() {
  const sel = document.getElementById('voiceSelect');
  const info = document.getElementById('voiceInfo');
  const warn = document.getElementById('voiceWarning');
  if (!sel || !info) return;
  
  if (!cachedVoices.length) loadVoices();
  
  // Clear options (giữ option đầu)
  while (sel.options.length > 1) sel.remove(1);
  
  // Chỉ lấy voices tiếng Trung
  const zhVoices = cachedVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith('zh'));
  
  if (!zhVoices.length) {
    info.textContent = '⚠️ Không tìm thấy giọng tiếng Trung';
    return;
  }
  
  // Sắp xếp theo điểm
  zhVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
  
  // Thêm options
  zhVoices.forEach(v => {
    const opt = document.createElement('option');
    const q = VOICE_QUALITY[v.name];
    const tier = q ? q.tier : 'ok';
    const badge = tier === 'best' ? '⭐ ' : tier === 'good' ? '✅ ' : tier === 'ok' ? '▪ ' : '';
    
    opt.value = v.name;
    opt.textContent = badge + v.name + ' (' + v.lang + ')';
    if (bestVoice && v.name === bestVoice.name && !currentVoiceName) {
      opt.textContent += ' [đang dùng]';
    }
    sel.appendChild(opt);
  });
  
  // Set selected
  if (currentVoiceName) {
    sel.value = currentVoiceName;
  } else {
    sel.value = '';
  }
  
  // Info
  const best = pickBestVoice();
  info.innerHTML = [
    'Đang dùng: <b style="color:var(--accent)">' + (best ? best.name : 'không có') + '</b><br>',
    'Có ' + zhVoices.length + ' giọng tiếng Trung khả dụng.'
  ].join('');
  
  // Warning nếu không có giọng "best"
  const hasBest = zhVoices.some(v => (VOICE_QUALITY[v.name] || {}).tier === 'best');
  if (!hasBest) {
    warn.innerHTML = [
      '<div class="voice-warning">',
      '<b>⚠️ Chưa có giọng chất lượng cao</b><br>',
      'Để có giọng tự nhiên như người thật, bạn cần cài thêm giọng Nâng cao:<br>',
      '<ol>',
      '<li>Mở <b>System Settings</b> (Cài đặt hệ thống)</li>',
      '<li>Chọn <b>Accessibility</b> → <b>Spoken Content</b></li>',
      '<li>Chọn <b>System Voice</b> → <b>Manage Voices...</b></li>',
      '<li>Tìm <b>Chinese (Taiwan)</b> → tải <b>Meijia (Enhanced)</b> hoặc <b>Premium</b></li>',
      '<li>Quay lại đây, reload app (Cmd+R)</li>',
      '</ol>',
      '</div>'
    ].join('');
  } else {
    warn.innerHTML = '';
  }
  
  // Event change
  sel.onchange = function() {
    const name = sel.value;
    if (!name) {
      currentVoiceName = '';
      localStorage.removeItem('dd_voice_name');
      bestVoice = pickBestVoice();
    } else {
      const found = cachedVoices.find(v => v.name === name);
      if (found) {
        bestVoice = found;
        currentVoiceName = name;
        localStorage.setItem('dd_voice_name', name);
      }
    }
    refreshVoiceList();
    
    // Test ngay
    speakX('你好，我是你的中文老師', { rate: 0.9 });
    
    if (typeof window.toast === 'function') {
      window.toast('✓ Đã đổi giọng đọc', 'ok');
    }
  };
}

/* ========== NÚT TEST NHANH ========== */
function addQuickTestBtn() {
  const hb = document.querySelector('.hbtns');
  if (!hb || document.getElementById('voiceTestBtn')) return;
  
  const btn = document.createElement('button');
  btn.className = 'hbtn icon-only';
  btn.id = 'voiceTestBtn';
  btn.title = 'Test giọng đọc';
  btn.innerHTML = '<svg style="width:16px;height:16px"><use href="#i-vol"/></svg>';
  btn.onclick = () => {
    speakX('你好，歡迎使用當代中文課程。我是你的中文老師。', { rate: 0.9 });
    if (typeof window.toast === 'function') {
      window.toast('🔊 Đang test giọng: ' + (bestVoice ? bestVoice.name : 'default'), 'ok');
    }
  };
  
  const ref = document.getElementById('themeBtn');
  if (ref) hb.insertBefore(btn, ref); else hb.appendChild(btn);
}

/* ========== INIT ========== */
function init() {
  // Load voices
  loadVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1500);
    setTimeout(loadVoices, 3000);
  }
  
  // Add UI
  setTimeout(addVoiceSettings, 1000);
  setTimeout(addQuickTestBtn, 1200);
  
  console.log('[app8 v2.0] TTS voice fix loaded');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
} else {
  setTimeout(init, 500);
}

/* ========== EXPOSE ========== */
window.ddSpeak = speakX;
window.ddRefreshVoices = refreshVoiceList;

})();