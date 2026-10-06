'use strict';
/* app28.js v1.0 — Word-level ruby + tone coloring */
(function(){
if (!window.DD) return;
if (window.__app28_loaded) return;
window.__app28_loaded = true;

const CSS = `
.ruby-line:not(.w28-ruby){display:none!important}
.w28-ruby{display:flex!important;flex-wrap:wrap!important;gap:12px 8px!important;align-items:flex-end!important;line-height:1!important;padding:4px 0!important}
.w28-token{display:inline-flex!important;flex-direction:column!important;align-items:center!important;padding:2px 4px!important;border-radius:8px!important;border:2px solid transparent!important;box-sizing:border-box!important;cursor:pointer!important;transition:border-color .15s,background .15s!important;user-select:none!important;-webkit-tap-highlight-color:transparent}
.w28-token:hover{background:rgba(139,92,246,.1)!important}
.w28-token.w28-active{border-color:#10b981!important;background:rgba(16,185,129,.08)!important}
.w28-py{font-size:calc(var(--ruby-zh-size,20px)*0.55)!important;font-family:ui-monospace,'SF Mono',monospace!important;letter-spacing:.2px!important;line-height:1!important;margin-bottom:4px!important;white-space:nowrap!important;font-weight:600!important}
.w28-zh{font-size:var(--ruby-zh-size,20px)!important;font-family:'PingFang TC','Microsoft JhengHei',sans-serif!important;line-height:1.1!important;color:#fff!important;font-weight:500!important;display:block!important}
.w28-t1{color:#ef4444!important}
.w28-t2{color:#f59e0b!important}
.w28-t3{color:#10b981!important}
.w28-t4{color:#3b82f6!important}
.w28-t5{color:#94a3b8!important}
.vp-card.size-S{--ruby-zh-size:15px!important}
.vp-card.size-M{--ruby-zh-size:20px!important}
.vp-card.size-L{--ruby-zh-size:23px!important}
.vp-card.size-XL{--ruby-zh-size:27px!important}
body[data-fs='S']{--ruby-zh-size:16px!important}
body[data-fs='M']{--ruby-zh-size:19px!important}
body[data-fs='L']{--ruby-zh-size:22px!important}
body[data-fs='XL']{--ruby-zh-size:26px!important}
body.w28-hide-py .w28-py{display:none!important}
body.w28-hide-py .w28-token{padding:0!important}
body.w28-hide-vi .svi,body.w28-hide-vi .vp-vi,body.w28-hide-vi .impv-card-vi{display:none!important}
body.w28-notones .w28-py{color:#fff!important}
`;
const style = document.createElement('style');
style.id = 'w28-styles';
const old = document.getElementById('w28-styles');
if (old) old.remove();
style.textContent = CSS;
document.head.appendChild(style);

const hasHan = c => /[\u4e00-\u9fa5]/.test(c);
const segCache = {};

async function fetchSegments(text){
  if (segCache[text]) return segCache[text];
  try {
    const r = await fetch('/api/segment?q=' + encodeURIComponent(text));
    if (!r.ok) return null;
    const d = await r.json();
    if (d.ok && d.segments && d.segments.length){
      segCache[text] = d.segments;
      return d.segments;
    }
  } catch(e){}
  return null;
}

function buildWordRuby(text, segments){
  if (!segments || !segments.length) return null;
  let html = '';
  for (const seg of segments){
    if (seg.han){
      const tone = (seg.t && seg.t.length) ? seg.t[0] : 5;
      const tc = 'w28-t' + (tone >= 1 && tone <= 5 ? tone : 5);
      html += '<span class="w28-token" data-word="' + seg.w + '" data-pinyin="' + (seg.p||'') + '"><span class="w28-py ' + tc + '">' + (seg.p||'') + '</span><span class="w28-zh">' + seg.w + '</span></span>';
    } else {
      const disp = seg.w === ' ' ? '&nbsp;' : seg.w;
      html += '<span class="w28-token w28-punct" style="cursor:default"><span class="w28-py">&nbsp;</span><span class="w28-zh">' + disp + '</span></span>';
    }
  }
  return html;
}

async function transformCard(card){
  if (!card || card.dataset.w28done === '1') return;
  const zhEl = card.querySelector('.szh, .vp-zh, .impv-card-zh');
  if (!zhEl) return;
  if (zhEl.querySelector('.w28-token')) return;
  let zh;
  if (zhEl.classList.contains('ruby-line') && zhEl.querySelector('.ruby-zh')){
    zh = [...zhEl.querySelectorAll('.ruby-zh')].map(x=>x.textContent).join('');
  } else {
    zh = zhEl.textContent.trim();
  }
  if (!zh || !hasHan(zh)) return;
  card.dataset.w28done = '1';
  const segs = await fetchSegments(zh);
  if (!segs){ card.dataset.w28done = ''; return; }
  const html = buildWordRuby(zh, segs);
  if (!html) return;
  const pyEl = card.querySelector('.spy, .vp-py, .impv-card-py');
  if (pyEl) pyEl.style.display = 'none';
  zhEl.classList.remove('ruby-line');
  zhEl.classList.add('w28-ruby');
  zhEl.innerHTML = html;
}

function scanAll(){
  document.querySelectorAll('.sent, .vp-card, .impv-card').forEach(c => {
    if (c.dataset.w28done !== '1') transformCard(c);
  });
}

function observe(){
  ['transcriptArea','vpList','impvListInner'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    new MutationObserver(() => setTimeout(scanAll, 200)).observe(el, { childList:true, subtree:true });
  });
}

function showWordPopup(word, pinyin, el){
  document.querySelectorAll('.w28-popup').forEach(p => p.remove());
  const popup = document.createElement('div');
  popup.className = 'w28-popup';
  popup.style.cssText = 'position:fixed;z-index:99999;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:14px 16px;min-width:220px;max-width:280px;box-shadow:0 20px 60px rgba(0,0,0,.7);color:#e2e8f0;font-family:-apple-system,sans-serif';
  popup.innerHTML = '<div style="font-size:20px;font-weight:800;margin-bottom:4px">' + word + '</div><div style="font-size:12.5px;color:#f59e0b;font-family:ui-monospace,monospace;margin-bottom:10px">' + (pinyin||'') + '</div><div style="font-size:12.5px;color:#94a3b8;margin-bottom:12px" id="w28Mean">Đang dịch...</div><div style="display:flex;gap:6px"><button id="w28Speak" style="flex:1;padding:8px;border-radius:8px;background:#334155;color:#e2e8f0;border:none;font-size:12px;font-weight:700;cursor:pointer">🔊 Nghe</button><button id="w28Save" style="flex:1;padding:8px;border-radius:8px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer">💾 Lưu</button></div>';
  document.body.appendChild(popup);
  const rect = el.getBoundingClientRect();
  const pw = 280;
  let x = rect.left + rect.width/2 - pw/2;
  let y = rect.bottom + 8;
  if (x < 8) x = 8;
  if (x + pw > innerWidth - 8) x = innerWidth - pw - 8;
  if (y + 160 > innerHeight - 8) y = rect.top - 160 - 8;
  popup.style.left = x + 'px';
  popup.style.top = y + 'px';
  (async () => {
    try {
      const r = await fetch('/api/translate?q=' + encodeURIComponent(word));
      if (r.ok){
        const d = await r.json();
        const m = document.getElementById('w28Mean');
        if (m) m.textContent = d.text || '(không dịch được)';
      }
    } catch(e){}
  })();
  document.getElementById('w28Speak').onclick = () => {
    if (window.DD && window.DD.speak) window.DD.speak(word);
    else { const u = new SpeechSynthesisUtterance(word); u.lang='zh-TW'; u.rate=0.85; speechSynthesis.speak(u); }
  };
  document.getElementById('w28Save').onclick = () => {
    if (window.DD && window.DD.addSentence) window.DD.addSentence(word, { source: 'Word-inspect' });
    popup.remove();
  };
  setTimeout(() => {
    document.addEventListener('click', function close(e){
      if (!popup.contains(e.target)){ popup.remove(); document.removeEventListener('click', close); }
    });
  }, 100);
}

document.addEventListener('click', e => {
  const tok = e.target.closest('.w28-token');
  if (!tok || tok.classList.contains('w28-punct')) return;
  e.stopPropagation();
  document.querySelectorAll('.w28-token.w28-active').forEach(t => t.classList.remove('w28-active'));
  tok.classList.add('w28-active');
  showWordPopup(tok.dataset.word, tok.dataset.pinyin, tok);
});

function addToolbarButtons(){
  if (document.getElementById('w28-toolbar')) return;
  const tb = document.querySelector('.vp-toolbar') || document.querySelector('.mh');
  if (!tb) return;
  const grp = document.createElement('div');
  grp.id = 'w28-toolbar';
  grp.style.cssText = 'display:inline-flex;gap:3px;padding:3px;background:var(--bg);border:1px solid var(--border);border-radius:11px';
  grp.innerHTML = '<button id="w28ToneToggle" style="width:auto;padding:6px 10px;font-size:11px;font-weight:700;border:none;background:transparent;color:inherit;cursor:pointer;border-radius:8px">🎨 Tone</button><button id="w28PyToggle" style="width:auto;padding:6px 10px;font-size:11px;font-weight:700;border:none;background:transparent;color:inherit;cursor:pointer;border-radius:8px">PY</button><button id="w28ViToggle" style="width:auto;padding:6px 10px;font-size:11px;font-weight:700;border:none;background:transparent;color:inherit;cursor:pointer;border-radius:8px">VI</button>';
  tb.appendChild(grp);
  const toneOn = localStorage.getItem('w28_tone') !== 'off';
  if (!toneOn) document.body.classList.add('w28-notones');
  const b1 = document.getElementById('w28ToneToggle');
  if (toneOn) b1.style.background = '#8b5cf6', b1.style.color = '#fff';
  b1.onclick = function(){ const on = this.style.background !== 'rgb(139, 92, 246)'; this.style.background = on ? '#8b5cf6' : 'transparent'; this.style.color = on ? '#fff' : 'inherit'; localStorage.setItem('w28_tone', on ? 'on':'off'); document.body.classList.toggle('w28-notones', !on); };
  const pyOn = localStorage.getItem('w28_py') !== 'off';
  if (!pyOn) document.body.classList.add('w28-hide-py');
  const b2 = document.getElementById('w28PyToggle');
  if (pyOn) b2.style.background = '#8b5cf6', b2.style.color = '#fff';
  b2.onclick = function(){ const on = this.style.background !== 'rgb(139, 92, 246)'; this.style.background = on ? '#8b5cf6' : 'transparent'; this.style.color = on ? '#fff' : 'inherit'; localStorage.setItem('w28_py', on ? 'on':'off'); document.body.classList.toggle('w28-hide-py', !on); };
  const viOn = localStorage.getItem('w28_vi') !== 'off';
  if (!viOn) document.body.classList.add('w28-hide-vi');
  const b3 = document.getElementById('w28ViToggle');
  if (viOn) b3.style.background = '#8b5cf6', b3.style.color = '#fff';
  b3.onclick = function(){ const on = this.style.background !== 'rgb(139, 92, 246)'; this.style.background = on ? '#8b5cf6' : 'transparent'; this.style.color = on ? '#fff' : 'inherit'; localStorage.setItem('w28_vi', on ? 'on':'off'); document.body.classList.toggle('w28-hide-vi', !on); };
}

function init(){
  scanAll();
  observe();
  setInterval(scanAll, 800);
  setTimeout(addToolbarButtons, 2000);
  setInterval(addToolbarButtons, 3000);
  console.log('[app28 v1.0] ✅ Word-level ruby + tone colors');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
else setTimeout(init, 1000);
})();
