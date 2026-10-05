<!---APP21--->
'use strict';
(function(){
if (!window.DD) return;
const KEY = 'dd_fontsize_v1';
const CSS = ""
+ ":root{--main-py:12px;--main-zh:19px;--main-vi:13px}"
+ "body[data-fs='S']{--main-py:10px!important;--main-zh:16px!important;--main-vi:11px!important}"
+ "body[data-fs='M']{--main-py:12px!important;--main-zh:19px!important;--main-vi:13px!important}"
+ "body[data-fs='L']{--main-py:14px!important;--main-zh:22px!important;--main-vi:15px!important}"
+ "body[data-fs='XL']{--main-py:16px!important;--main-zh:26px!important;--main-vi:17px!important}"
+ ".spy{font-size:var(--main-py)!important}.szh{font-size:var(--main-zh)!important}.svi{font-size:var(--main-vi)!important}"
+ ".impv-card-py{font-size:var(--main-py)!important}.impv-card-zh{font-size:var(--main-zh)!important}.impv-card-vi{font-size:var(--main-vi)!important}"
+ ".fs-popup{position:fixed;top:70px;right:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;width:280px;box-shadow:0 20px 60px rgba(0,0,0,.6);z-index:400;display:none}"
+ ".fs-popup.show{display:block}"
+ ".fs-popup h4{font-size:12px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px}"
+ ".fs-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px}"
+ ".fs-btn{padding:10px 6px;border-radius:9px;background:var(--bg);border:1.5px solid var(--border);color:var(--text2);font-size:12px;font-weight:800;cursor:pointer;text-align:center;font-family:inherit}"
+ ".fs-btn.on{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border-color:transparent}"
+ ".fs-btn .sz{display:block;font-weight:900;line-height:1;margin-bottom:3px}"
+ ".fs-btn .lb{display:block;font-size:9.5px;opacity:.85}";
const st = document.createElement('style'); st.id='app21-styles'; st.textContent=CSS;
if (!document.getElementById('app21-styles')) document.head.appendChild(st);
let fontSize = localStorage.getItem(KEY) || 'M';
function applyFontSize(size){
  fontSize = size;
  localStorage.setItem(KEY, size);
  document.body.setAttribute('data-fs', size);
  document.querySelectorAll('.vp-card').forEach(el=>{
    el.classList.remove('size-S','size-M','size-L','size-XL');
    el.classList.add('size-'+size);
  });
  document.querySelectorAll('.fs-btn').forEach(b=>b.classList.toggle('on', b.dataset.size===size));
}
function buildPopup(){
  if (document.getElementById('fsPopup')) return;
  document.body.insertAdjacentHTML('beforeend',
    '<div class="fs-popup" id="fsPopup"><h4>CO CHU</h4><div class="fs-grid">'
    +'<button class="fs-btn" data-size="S"><span class="sz" style="font-size:10px">A</span><span class="lb">Nho</span></button>'
    +'<button class="fs-btn" data-size="M"><span class="sz" style="font-size:14px">A</span><span class="lb">Vua</span></button>'
    +'<button class="fs-btn" data-size="L"><span class="sz" style="font-size:18px">A</span><span class="lb">Lon</span></button>'
    +'<button class="fs-btn" data-size="XL"><span class="sz" style="font-size:22px">A</span><span class="lb">Rat lon</span></button>'
    +'</div></div>');
  const pop = document.getElementById('fsPopup');
  pop.addEventListener('click', e=>{
    const b = e.target.closest('.fs-btn'); if (!b) return;
    applyFontSize(b.dataset.size);
    if (window.toast) window.toast('Co chu: '+b.querySelector('.lb').textContent,'ok');
  });
  document.addEventListener('click', e=>{
    if (e.target.closest('#fsPopup')) return;
    if (e.target.closest('#fsToggleBtn')) return;
    pop.classList.remove('show');
  });
}
function addFontBtn(){
  if (document.getElementById('fsToggleBtn')) return;
  const hb = document.querySelector('.hbtns');
  if (!hb) return;
  const btn = document.createElement('button');
  btn.className = 'hbtn icon-only';
  btn.id = 'fsToggleBtn';
  btn.title = 'Co chu';
  btn.innerHTML = '<svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M3 18l4-12 4 12M4.5 14h5M14 18l3.5-10 3.5 10M15 15h5"/></svg>';
  btn.onclick = e=>{ e.stopPropagation(); const p=document.getElementById('fsPopup'); if(p) p.classList.toggle('show'); };
  const ref = document.getElementById('savedBtn') || document.getElementById('settingsBtn');
  if (ref && ref.parentElement === hb) hb.insertBefore(btn, ref);
  else hb.appendChild(btn);
}
function init(){
  buildPopup();
  setTimeout(()=>{ addFontBtn(); applyFontSize(fontSize); }, 1500);
  setInterval(()=>{
    addFontBtn();
    if (document.body.getAttribute('data-fs') !== fontSize) applyFontSize(fontSize);
  }, 2500);
  console.log('[app21 v1.0] Font size loaded');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(init, 1200));
else setTimeout(init, 1200);
})();
