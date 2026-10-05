'use strict';
/* app10p2.js v1.0 — Import Text Page P2 (Player + Full Features) */

(function(){

if (!window.impState) {
  console.error('[app10p2] Cần app10.js P1 nạp trước!');
  return;
}

const $ = id => document.getElementById(id);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const impState = window.impState;

/* ============================================================
   AUDIO STATE (bổ sung)
   ============================================================ */
impState.audioCache = {};          // cache blob URLs theo text+voice+rate
impState.currentBlobUrl = null;
impState.playingBtn = null;
impState.dictationOn = false;
impState.shadowRec = null;
impState.shadowChunks = [];
impState.shadowUrl = null;
impState.currentSentenceEl = null;

/* ============================================================
   TOAST
   ============================================================ */
function impToast(msg, type) {
  const el = $('impToast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'imp-toast ' + (type || '');
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ============================================================
   EDGE TTS — Tạo audio cho 1 câu
   ============================================================ */
async function fetchTTSAudio(text) {
  const clean = String(text || '').trim();
  if (!clean) return null;

  const cacheKey = impState.voice + '__' + impState.rate + '__' + clean;
  if (impState.audioCache[cacheKey]) {
    return impState.audioCache[cacheKey];
  }

  try {
    const url = '/api/tts'
      + '?text=' + encodeURIComponent(clean)
      + '&voice=' + encodeURIComponent(impState.voice)
      + '&rate=' + impState.rate;

    const r = await fetch(url);
    if (!r.ok) {
      impToast('❌ Không tạo được audio', 'err');
      return null;
    }

    const blob = await r.blob();
    if (blob.size < 100) {
      impToast('❌ File audio quá nhỏ', 'err');
      return null;
    }

    const blobUrl = URL.createObjectURL(blob);
    impState.audioCache[cacheKey] = blobUrl;
    return blobUrl;
  } catch (e) {
    console.error('[app10p2] TTS error:', e);
    impToast('❌ Lỗi kết nối server', 'err');
    return null;
  }
}

/* ============================================================
   PLAY SENTENCE — Phát 1 câu
   ============================================================ */
async function playSentence(idx, opts) {
  if (idx < 0 || idx >= impState.sentences.length) return;

  const btn = (opts && opts.btn) || null;
  const sentence = impState.sentences[idx];

  // Dừng audio cũ
  stopCurrentAudio();

  // Update currentIdx
  impState.currentIdx = idx;
  impState.isPlaying = true;
  window.impScrollToActive?.();
  renderActiveState();

  // Show loading state on button
  if (btn) {
    btn.classList.add('playing');
    impState.playingBtn = btn;
  }

  // Get audio
  const blobUrl = await fetchTTSAudio(sentence.zh);
  if (!blobUrl) {
    if (btn) btn.classList.remove('playing');
    impState.playingBtn = null;
    impState.isPlaying = false;
    updatePlayIcon();
    return;
  }

  // Create audio element
  const audio = new Audio(blobUrl);
  audio.playbackRate = 1.0; // rate đã xử lý ở server
  audio.volume = 1.0;
  impState.currentAudio = audio;
  impState.currentBlobUrl = blobUrl;
  impState.autoPausedFor = -1;

  // Duration update
  audio.onloadedmetadata = () => {
    const dur = audio.duration || 0;
    const durEl = $('impDurTime');
    if (durEl) durEl.textContent = fmtTime(dur);
  };

  // Time update
  audio.ontimeupdate = () => {
    const cur = audio.currentTime;
    const dur = audio.duration || 0;
    const curEl = $('impCurTime');
    if (curEl) curEl.textContent = fmtTime(cur);

    if (dur > 0) {
      const pct = (cur / dur) * 100;
      const fill = $('impProgressFill2');
      if (fill) fill.style.width = pct + '%';
    }

    // A-B loop
    if (impState.loopA !== null && impState.loopB !== null && cur >= impState.loopB) {
      audio.currentTime = impState.loopA;
      return;
    }

    // Repeat câu N lần
    if (impState.repeatOn && impState.repeatCount > 1) {
      const endThresh = dur - 0.08;
      if (cur >= endThresh) {
        impState.repeatCurrent++;
        if (impState.repeatCurrent < impState.repeatCount) {
          audio.currentTime = 0;
          audio.play();
        } else {
          impState.repeatCurrent = 0;
          impState.repeatOn = false;
          updateToolbarStates();
          impToast('✓ Xong ' + impState.repeatCount + ' lần');
          handleEnded();
        }
      }
      return;
    }

    // Auto pause — chỉ pause 1 lần
    if (impState.autoPause && impState.autoPausedFor !== idx) {
      const endThresh = dur - 0.15;
      if (cur >= endThresh) {
        audio.pause();
        impState.autoPausedFor = idx;
      }
    }
  };

  // Ended
  audio.onended = () => {
    if (btn) btn.classList.remove('playing');
    if (impState.playingBtn === btn) impState.playingBtn = null;
    handleEnded();
  };

  audio.onerror = (e) => {
    console.error('[app10p2] Audio error:', e);
    if (btn) btn.classList.remove('playing');
    impState.playingBtn = null;
    impState.isPlaying = false;
    updatePlayIcon();
    impToast('❌ Lỗi phát audio', 'err');
  };

  // Play
  try {
    await audio.play();
    updatePlayIcon();
  } catch (e) {
    console.warn('[app10p2] Play blocked:', e);
    if (btn) btn.classList.remove('playing');
    impState.playingBtn = null;
    impState.isPlaying = false;
    updatePlayIcon();
    if (e.name === 'NotAllowedError') {
      impToast('⚠️ Bấm vào trang trước rồi thử lại', 'err');
    }
  }
}

function handleEnded() {
  impState.isPlaying = false;
  updatePlayIcon();

  // Playlist mode: phát câu tiếp
  if (impState.playlistPlay && impState.currentIdx < impState.sentences.length - 1) {
    setTimeout(() => playSentence(impState.currentIdx + 1), 300);
    return;
  }

  impState.currentAudio = null;
}

function stopCurrentAudio() {
  if (impState.currentAudio) {
    try {
      impState.currentAudio.pause();
      impState.currentAudio.currentTime = 0;
    } catch (e) {}
    impState.currentAudio = null;
  }
  if (impState.playingBtn) {
    try { impState.playingBtn.classList.remove('playing'); } catch (e) {}
    impState.playingBtn = null;
  }
}

function updatePlayIcon() {
  const icon = $('impPlayIcon');
  if (!icon) return;
  if (impState.isPlaying) {
    icon.innerHTML = '<use href="#i-pause"/>';
  } else {
    icon.innerHTML = '<use href="#i-play"/>';
  }
}

function fmtTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const x = Math.floor(s % 60);
  return m + ':' + String(x).padStart(2, '0');
}

/* ============================================================
   RENDER ACTIVE STATE
   ============================================================ */
function renderActiveState() {
  $$('.imp-sent').forEach(el => {
    const idx = parseInt(el.dataset.idx);
    el.classList.toggle('active', idx === impState.currentIdx);
  });
}

/* ============================================================
   TOOLBAR STATES (bổ sung)
   ============================================================ */
function updateToolbarStates() {
  const l = $('impLoopBtn');
  const a = $('impAutoPauseBtn');
  const pl = $('impPlaylistBtn');
  if (l) l.classList.toggle('on', impState.repeatOn);
  if (a) a.classList.toggle('on', impState.autoPause);
  if (pl) pl.classList.toggle('on', impState.playlistPlay);
}

/* ============================================================
   PLAYER CONTROLS
   ============================================================ */
function bindPlayerControls() {
  // Play/Pause main
  const playBtn = $('impPlayBtn');
  if (playBtn) {
    playBtn.onclick = () => {
      if (impState.currentIdx < 0) {
        if (impState.sentences.length) playSentence(0);
        return;
      }
      if (impState.currentAudio && !impState.currentAudio.paused) {
        impState.currentAudio.pause();
        impState.isPlaying = false;
        updatePlayIcon();
      } else if (impState.currentAudio) {
        impState.currentAudio.play();
        impState.isPlaying = true;
        updatePlayIcon();
      } else {
        playSentence(impState.currentIdx);
      }
    };
  }

  // Prev
  const prevBtn = $('impPrevBtn');
  if (prevBtn) {
    prevBtn.onclick = () => {
      const idx = Math.max(0, impState.currentIdx - 1);
      playSentence(idx);
    };
  }

  // Next
  const nextBtn = $('impNextBtn');
  if (nextBtn) {
    nextBtn.onclick = () => {
      const idx = Math.min(impState.sentences.length - 1, impState.currentIdx + 1);
      playSentence(idx);
    };
  }

  // Speed
  const speedSel = $('impSpeedSelect');
  if (speedSel) {
    speedSel.onchange = () => {
      if (impState.currentAudio) {
        impState.currentAudio.playbackRate = parseFloat(speedSel.value);
      }
    };
  }

  // Progress bar click
  const progBar = $('impProgressBar');
  if (progBar) {
    progBar.onclick = (e) => {
      if (!impState.currentAudio || !impState.currentAudio.duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      impState.currentAudio.currentTime = pct * impState.currentAudio.duration;
    };
  }

  // A button
  const btnA = $('impBtnA');
  if (btnA) {
    btnA.onclick = () => {
      if (!impState.currentAudio) {
        impToast('Đang phát mới đặt A được', 'err');
        return;
      }
      impState.loopA = impState.currentAudio.currentTime;
      btnA.classList.add('on');
      impToast('A = ' + fmtTime(impState.loopA), 'ok');
    };
  }

  // B button
  const btnB = $('impBtnB');
  if (btnB) {
    btnB.onclick = () => {
      if (!impState.currentAudio) return;
      if (impState.loopA === null) {
        impToast('Đặt A trước', 'err');
        return;
      }
      const t = impState.currentAudio.currentTime;
      if (t <= impState.loopA) {
        impToast('B phải sau A', 'err');
        return;
      }
      impState.loopB = t;
      btnB.classList.add('on');
      impToast('🔂 Lặp A-B: ' + fmtTime(impState.loopA) + ' → ' + fmtTime(impState.loopB), 'ok');
    };
  }

  // Dictation button
  const btnDict = $('impBtnDict');
  if (btnDict) {
    btnDict.onclick = () => {
      impState.dictationOn = !impState.dictationOn;
      btnDict.classList.toggle('on', impState.dictationOn);
      toggleDictationMode();
    };
  }

  // Toolbar: Loop
  const loopBtn = $('impLoopBtn');
  if (loopBtn) {
    loopBtn.onclick = () => {
      impState.repeatOn = !impState.repeatOn;
      impState.repeatCurrent = 0;
      updateToolbarStates();
      impToast(impState.repeatOn ? '🔁 Lặp ' + impState.repeatCount + ' lần' : 'Tắt lặp');
      // Restart câu hiện tại nếu đang phát
      if (impState.repeatOn && impState.currentAudio) {
        impState.currentAudio.currentTime = 0;
        impState.currentAudio.play();
      }
    };
  }

  // Toolbar: Auto pause
  const autoPauseBtn = $('impAutoPauseBtn');
  if (autoPauseBtn) {
    autoPauseBtn.onclick = () => {
      impState.autoPause = !impState.autoPause;
      impState.autoPausedFor = -1;
      updateToolbarStates();
      impToast(impState.autoPause ? '⏸ Tự dừng sau mỗi câu' : 'Tắt tự dừng');
    };
  }

  // Toolbar: Playlist mode
  const playlistBtn = $('impPlaylistBtn');
  if (playlistBtn) {
    playlistBtn.onclick = () => {
      impState.playlistPlay = !impState.playlistPlay;
      updateToolbarStates();
      impToast(impState.playlistPlay ? '▶ Phát liên tục cả bài' : 'Tắt playlist');
      // Nếu bật và đang dừng → phát từ đầu
      if (impState.playlistPlay && !impState.isPlaying) {
        playSentence(Math.max(0, impState.currentIdx));
      }
    };
  }

  // Toolbar: Search
  const searchBtn = $('impSearchBtn');
  if (searchBtn) {
    searchBtn.onclick = openSearch;
  }

  // Toolbar: Export
  const exportBtn = $('impExportBtn');
  if (exportBtn) {
    exportBtn.onclick = openExport;
  }
}

/* ============================================================
   DICTATION MODE
   ============================================================ */
function toggleDictationMode() {
  if (impState.dictationOn) {
    // Blur tất cả chữ Hán
    document.querySelectorAll('.imp-sent-zh').forEach(el => {
      el.style.filter = 'blur(7px)';
      el.style.userSelect = 'none';
    });
    impToast('⌨️ Chế độ chép chính tả: chữ Hán đã bị che', 'ok');
  } else {
    document.querySelectorAll('.imp-sent-zh').forEach(el => {
      el.style.filter = '';
      el.style.userSelect = '';
    });
    impToast('Đã tắt chép chính tả');
  }
}

/* ============================================================
   SEARCH IN TEXT
   ============================================================ */
function openSearch() {
  const q = prompt('Tìm trong bài (chữ Hán / Pinyin / tiếng Việt):');
  if (!q || !q.trim()) return;

  const ql = q.toLowerCase().trim();
  let found = 0;

  document.querySelectorAll('.imp-sent').forEach(el => {
    const idx = parseInt(el.dataset.idx);
    const s = impState.sentences[idx];
    if (!s) return;

    const hay = (s.zh + ' ' + (s.pinyin || '') + ' ' + (s.vi || '')).toLowerCase();
    const match = hay.includes(ql);

    el.style.opacity = match ? '1' : '0.25';
    if (match) {
      found++;
      if (found === 1) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  impToast('Tìm thấy ' + found + ' câu. Gõ rỗng để reset.', 'ok');

  // Nếu user bấm OK lại với chuỗi rỗng → reset
  setTimeout(() => {
    const reset = prompt('Đã tìm ' + found + ' câu. Bấm Cancel để giữ nguyên, OK để reset.');
    if (reset !== null && reset === '') {
      document.querySelectorAll('.imp-sent').forEach(el => {
        el.style.opacity = '1';
      });
    }
  }, 100);
}

/* ============================================================
   EXPORT SRT/LRC/TXT/CSV
   ============================================================ */
function openExport() {
  if (!impState.sentences.length) {
    impToast('Chưa có câu nào để xuất', 'err');
    return;
  }
  const choice = prompt(
    'Chọn định dạng xuất:\n' +
    '1. SRT (phụ đề VLC, YouTube)\n' +
    '2. LRC (lyrics)\n' +
    '3. TXT (văn bản thuần)\n' +
    '4. CSV (Excel)\n\n' +
    'Nhập 1-4:'
  );
  if (!choice) return;
  const n = parseInt(choice);
  if (n < 1 || n > 4) { impToast('Chọn 1-4', 'err'); return; }

  let content = '';
  let filename = 'import-text-' + Date.now();
  let mime = 'text/plain;charset=utf-8';

  if (n === 1) {
    // SRT — mỗi câu 3.5s
    let t = 0;
    content = impState.sentences.map((s, i) => {
      const st = t;
      const en = t + 3.5;
      t = en + 0.3;
      return (i + 1) + '\n' + toSRTTime(st) + ' --> ' + toSRTTime(en) + '\n' + s.zh + '\n';
    }).join('\n');
    filename += '.srt';
  } else if (n === 2) {
    // LRC
    let t = 0;
    content = impState.sentences.map(s => {
      const line = '[' + toLRCTime(t) + ']' + s.zh;
      t += 3.5;
      return line;
    }).join('\n');
    filename += '.lrc';
  } else if (n === 3) {
    // TXT
    content = impState.sentences.map(s => s.zh).join('\n');
    filename += '.txt';
  } else {
    // CSV
    const q = v => '"' + String(v || '').replace(/"/g, '""') + '"';
    content = 'Chinese,Pinyin,Vietnamese\n' + impState.sentences.map(s =>
      [q(s.zh), q(s.pinyin || ''), q(s.vi || '')].join(',')
    ).join('\n');
    content = '\ufeff' + content; // BOM cho Excel
    filename += '.csv';
    mime = 'text/csv;charset=utf-8';
  }

  // Download
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  impToast('✅ Đã xuất ' + filename, 'ok');
}

function toSRTTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 1000);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0') + ',' + String(ms).padStart(3, '0');
}

function toLRCTime(s) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(2).padStart(5, '0');
  return String(m).padStart(2, '0') + ':' + sec;
}

/* ============================================================
   SENTENCE CLICK HANDLER
   ============================================================ */
function bindSentenceClicks() {
  const list = $('impSentList');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const sent = e.target.closest('.imp-sent');
    if (!sent) return;
    const idx = parseInt(sent.dataset.idx);
    if (isNaN(idx)) return;

    // Action button
    const actBtn = e.target.closest('[data-act]');
    if (actBtn) {
      e.stopPropagation();
      const act = actBtn.dataset.act;
      const actIdx = parseInt(actBtn.dataset.idx);

      if (act === 'tts') {
        // Nếu đang phát câu này → dừng
        if (impState.currentIdx === actIdx && impState.isPlaying) {
          stopCurrentAudio();
          impState.isPlaying = false;
          updatePlayIcon();
          return;
        }
        playSentence(actIdx, { btn: actBtn });
      } else if (act === 'pron') {
        const s = impState.sentences[actIdx];
        if (s && typeof window.DD.startCheck === 'function') {
          window.DD.startCheck(s.zh);
        } else {
          impToast('Check phát âm cần app4.js', 'err');
        }
      } else if (act === 'bm') {
        const s = impState.sentences[actIdx];
        if (s && typeof window.DD.addSentence === 'function') {
          const ok = window.DD.addSentence(s.zh, { source: 'Nhập văn bản' });
          if (ok) {
            actBtn.classList.add('on');
            impToast('🔖 Đã lưu vào kho', 'ok');
          }
        } else {
          impToast('Lưu câu cần app4.js', 'err');
        }
      }
      return;
    }

    // Click câu → phát
    if (impState.currentIdx === idx && impState.isPlaying) {
      stopCurrentAudio();
      impState.isPlaying = false;
      updatePlayIcon();
    } else {
      playSentence(idx);
    }
  });
}

/* ============================================================
   HOTKEYS
   ============================================================ */
function bindHotkeys() {
  document.addEventListener('keydown', (e) => {
    if (!document.body.classList.contains('import-mode')) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      $('impPlayBtn')?.click();
    } else if (e.code === 'ArrowLeft') {
      if (impState.currentAudio) {
        impState.currentAudio.currentTime = Math.max(0, impState.currentAudio.currentTime - 5);
      }
    } else if (e.code === 'ArrowRight') {
      if (impState.currentAudio && impState.currentAudio.duration) {
        impState.currentAudio.currentTime = Math.min(impState.currentAudio.duration, impState.currentAudio.currentTime + 5);
      }
    } else if (e.key === 'r' || e.key === 'R') {
      $('impLoopBtn')?.click();
    } else if (e.key === 'a' || e.key === 'A') {
      $('impBtnA')?.click();
    } else if (e.key === 'b' || e.key === 'B') {
      $('impBtnB')?.click();
    }
  });
}

/* ============================================================
   OVERRIDE impPlaySentence GLOBAL
   ============================================================ */
window.impPlaySentence = playSentence;

/* ============================================================
   RE-RENDER KHI STATE THAY ĐỔI
   ============================================================ */
// Override renderSentences để re-bind sau khi render
const origRender = window.impRenderSentences;
if (typeof origRender === 'function') {
  window.impRenderSentences = function() {
    origRender();
    renderActiveState();
    if (impState.dictationOn) {
      document.querySelectorAll('.imp-sent-zh').forEach(el => {
        el.style.filter = 'blur(7px)';
      });
    }
  };
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  // Chờ P1 render xong
  setTimeout(() => {
    bindPlayerControls();
    bindSentenceClicks();
    bindHotkeys();
    updateToolbarStates();
    updatePlayIcon();

    // Restore audio state if any
    if (impState.currentIdx >= 0 && impState.sentences.length) {
      renderActiveState();
    }

    console.log('[app10p2 v1.0] Player + Full Features loaded');
  }, 200);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
} else {
  setTimeout(init, 1000);
}

/* ============================================================
   EXPOSE
   ============================================================ */
window.impPlaySentence = playSentence;
window.impStopAudio = stopCurrentAudio;
window.impFetchTTS = fetchTTSAudio;

})();