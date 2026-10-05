'use strict';
(function(){
  if (!window.S) return;
  var S = window.S;

  // ===== 1. CSS attribute selector cho font size =====
  var style = document.createElement('style');
  style.id = 'app16-fontstyle';
  style.textContent = [
    'body[data-fs="small"] .szh,body[data-fs="small"] .impv-card-zh{font-size:16px!important}',
    'body[data-fs="medium"] .szh,body[data-fs="medium"] .impv-card-zh{font-size:19px!important}',
    'body[data-fs="large"] .szh,body[data-fs="large"] .impv-card-zh{font-size:22px!important}',
    'body[data-fs="xl"] .szh,body[data-fs="xl"] .impv-card-zh{font-size:26px!important}'
  ].join('\n');
  document.head.appendChild(style);

  function applyFS() {
    document.body.setAttribute('data-fs', S.settings.fontSize || 'medium');
  }

  // ===== 2. Hook fontSizeSelect =====
  function bindFS() {
    var sel = document.getElementById('fontSizeSelect');
    if (!sel || sel.dataset.p16) return;
    sel.dataset.p16 = '1';
    var orig = sel.onchange;
    sel.onchange = function(e) {
      S.settings.fontSize = e.target.value;
      try { localStorage.setItem('dd_s', JSON.stringify(S.settings)); } catch(x){}
      applyFS();
      if (orig) try { orig.call(this, e); } catch(x){}
      if (window.toast) window.toast('Co chu: ' + e.target.value, 'ok');
    };
  }

  // ===== 3. Fix rate dropdown =====
  function fixRate() {
    var sel = document.getElementById('ttsRateSelect');
    if (!sel) return;
    var cur = parseFloat(localStorage.getItem('dd_tts_rate') || '1.0');
    for (var i = 0; i < sel.options.length; i++) {
      if (parseFloat(sel.options[i].value) === cur) {
        if (sel.selectedIndex !== i) sel.selectedIndex = i;
        break;
      }
    }
  }

  // ===== 4. OpenCC Phồn <-> Giản =====
  var t2s = null, s2t = null, ocReady = false;

  function initOC() {
    try {
      t2s = window.OpenCC.Converter({ from: 'twp', to: 'cn' });
      s2t = window.OpenCC.Converter({ from: 'cn', to: 'twp' });
      ocReady = true;
      console.log('[app16] OpenCC ready');
      applyFmt();
    } catch(e) { console.error('[app16] OpenCC err:', e); }
  }

  function loadOC() {
    if (window.OpenCC) { initOC(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js';
    s.onload = initOC;
    s.onerror = function(){ console.warn('[app16] OpenCC CDN fail'); };
    document.head.appendChild(s);
  }

  function conv(zh) {
    if (!ocReady || !zh) return zh;
    var fmt = S.settings.format || 'traditional';
    try {
      if (fmt === 'simplified' && t2s) return t2s(zh);
      if (fmt === 'traditional' && s2t) return s2t(zh);
    } catch(e){}
    return zh;
  }

  function applyFmt() {
    if (!ocReady) return;
    var els = document.querySelectorAll('.szh .word, .impv-card-zh .word');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var w = el.getAttribute('data-word');
      if (!w) continue;
      var n = conv(w);
      if (el.textContent !== n) el.textContent = n;
    }
  }

  function bindFmt() {
    var sel = document.getElementById('chineseFormatSelect');
    if (!sel || sel.dataset.p16) return;
    sel.dataset.p16 = '1';
    var orig = sel.onchange;
    sel.onchange = function(e) {
      S.settings.format = e.target.value;
      try { localStorage.setItem('dd_s', JSON.stringify(S.settings)); } catch(x){}
      applyFmt();
      if (orig) try { orig.call(this, e); } catch(x){}
      if (window.toast) window.toast(e.target.value === 'traditional' ? 'Phon the' : 'Gian the', 'ok');
    };
  }

  // ===== 5. Observer auto-convert khi có chữ mới =====
  function observe() {
    ['transcriptArea','impvListInner'].forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      new MutationObserver(function(){ setTimeout(applyFmt, 80); })
        .observe(el, { childList: true, subtree: true });
    });
  }

  // ===== 6. Interval ensure =====
  setInterval(function(){
    bindFS();
    bindFmt();
    fixRate();
  }, 800);

  // ===== 7. Init =====
  function init() {
    applyFS();
    loadOC();
    observe();
    bindFS();
    bindFmt();
    fixRate();
    setTimeout(applyFS, 500);
    setTimeout(applyFmt, 3000);
    console.log('[app16 v3.0] Loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 1500); });
  } else {
    setTimeout(init, 1500);
  }
})();
