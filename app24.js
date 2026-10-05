<!---APP24--->
'use strict';
(function(){
if (!window.DD) return;
const KEY = 'dd_color_v1';
let colorState = { py:'white', zh:'white', vi:'white' };
try { Object.assign(colorState, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch(e){}

const CSS = ""
+ ".cs-modal{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;display:none;align-items:center;justify-content:center;padding:16px}"
+ ".cs-modal.show{display:flex}"
+ ".cs-box{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:20px;width:100%;max-width:420px}"
+ ".cs-box h3{font-size:15px;font-weight:800;margin-bottom:16px}"
+ ".cs-row{margin-bottom:18px}"
+ ".cs-row label{display:block;font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px}"
+ ".cs-colors{display:flex;gap:8px;flex-wrap:wrap}"
+ ".cs-color{width:36px;height:36px;border-radius:10px;border:2px solid var(--border);cursor:pointer;position:relative}"
+ ".cs-color.on{border-color:#8b5cf6;box-shadow:0 0 0 2px rgba(139,92,246,.4)}"
+ ".cs-color.on::after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px;text-shadow:0 1px 3px rgba(0,0,0,.8)}"
+ ".cs-color[data-c='white']{background:#fff}.cs-color[data-c='yellow']{background:var(--color-py,#fff)}.cs-color[data-c='blue']{background:#60a5fa}.cs-color[data-c='green']{background:#10b981}.cs-color[data-c='gray']{background:#94a3b8}"
+ ".cs-acts{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}"
+ ".cs-acts button{padding:9px 18px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit}";

const st = document.createElement('style'); st.id='app24-styles';
if (!document.getElementById('app24-styles')){ st.textContent=CSS; document.head.appendChild(st); }

function applyColors(){
  const b = document.body;
  [...b.classList].filter(c => c.startsWith('fc-')).forEach(c => b.classList.remove(c));
  b.classList.add('fc-py-' + colorState.py);
  b.classList.add('fc-zh-' + colorState.zh);
  b.classList.add('fc-vi-' + colorState.vi);
  localStorage.setItem(KEY, JSON.stringify(colorState));
}

function buildModal(){
  if (document.getElementById('csModal')) return;
  document.body.insertAdjacentHTML('beforeend',
    '<div class="cs-modal" id="csModal"><div class="cs-box">'
    +'<h3>MAU CHU</h3>'
    +'<div class="cs-row"><label>Pinyin</label><div class="cs-colors" data-key="py"><div class="cs-color" data-c="white"></div><div class="cs-color" data-c="yellow"></div><div class="cs-color" data-c="blue"></div><div class="cs-color" data-c="green"></div></div></div>'
    +'<div class="cs-row"><label>Han tu</label><div class="cs-colors" data-key="zh"><div class="cs-color" data-c="white"></div><div class="cs-color" data-c="yellow"></div><div class="cs-color" data-c="blue"></div></div></div>'
    +'<div class="cs-row"><label>Dich</label><div class="cs-colors" data-key="vi"><div class="cs-color" data-c="white"></div><div class="cs-color" data-c="gray"></div><div class="cs-color" data-c="green"></div><div class="cs-color" data-c="yellow"></div></div></div>'
    +'<div class="cs-acts"><button id="csClose">Dong</button></div>'
    +'</div></div>');
  const m = document.getElementById('csModal');
  m.addEventListener('click', e=>{
    if (e.target === m) m.classList.remove('show');
    const c = e.target.closest('.cs-color');
    if (c){ colorState[c.parentElement.dataset.key] = c.dataset.c; applyColors(); refreshUI(); }
  });
  document.getElementById('csClose').onclick = ()=>m.classList.remove('show');
}

function refreshUI(){
  document.querySelectorAll('.cs-colors').forEach(g=>{
    const k = g.dataset.key;
    g.querySelectorAll('.cs-color').forEach(c=>c.classList.toggle('on', c.dataset.c===colorState[k]));
  });
}

function addBtn(){
  if (document.getElementById('colorBtn')) return;
  const hb = document.querySelector('.hbtns');
  if (!hb) return;
  const btn = document.createElement('button');
  btn.className = 'hbtn icon-only';
  btn.id = 'colorBtn';
  btn.title = 'Mau chu';
  btn.innerHTML = '<svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg>';
  btn.onclick = e => { e.stopPropagation(); buildModal(); refreshUI(); document.getElementById('csModal').classList.add('show'); };
  const ref = document.getElementById('savedBtn') || document.getElementById('settingsBtn');
  if (ref && ref.parentElement === hb) hb.insertBefore(btn, ref);
  else hb.appendChild(btn);
}

function init(){
  applyColors();
  buildModal();
  setTimeout(addBtn, 2000);
  setInterval(addBtn, 3000);
  console.log('[app24 v1.0] Color picker loaded');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(init, 2000));
else setTimeout(init, 2000);
})();
