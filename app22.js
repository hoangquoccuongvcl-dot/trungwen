'use strict';
/* app22.js v1.0 — Force override CSS: word nhẹ + size + order */
(function(){

const FORCE_CSS = ""
/* ===== VIDEO: word highlight nhẹ ===== */
+ ".vp-word{display:inline-block!important;padding:0 1px!important;transition:transform .18s cubic-bezier(.34,1.56,.64,1),color .15s!important;background:transparent!important;box-shadow:none!important}"
+ ""

/* ===== VIDEO: order Pinyin → Hán → Việt ===== */
+ ".vp-card{display:flex!important;flex-direction:column!important}"
+ ".vp-card .vp-head{order:0!important}"
+ ".vp-card .vp-py{order:1!important}"
+ ".vp-card .vp-zh{order:2!important}"
+ ".vp-card .vp-vi{order:3!important}"

/* ===== VIDEO: font size ===== */
+ ".vp-card{--vp-py:12px;--vp-zh:19px;--vp-vi:12.5px}"
+ ".vp-card .vp-py{font-size:var(--vp-py)!important}"
+ ".vp-card .vp-zh{font-size:var(--vp-zh)!important}"
+ ".vp-card .vp-vi{font-size:var(--vp-vi)!important}"
+ ".vp-card.size-S{--vp-py:10px!important;--vp-zh:16px!important;--vp-vi:11px!important}"
+ ".vp-card.size-M{--vp-py:12px!important;--vp-zh:19px!important;--vp-vi:12.5px!important}"
+ ".vp-card.size-L{--vp-py:14px!important;--vp-zh:22px!important;--vp-vi:14px!important}"
+ ".vp-card.size-XL{--vp-py:16px!important;--vp-zh:26px!important;--vp-vi:16px!important}"

/* ===== MAIN APP: order Pinyin → Hán → Việt ===== */
+ ".sent{display:flex!important;flex-direction:column!important}"
+ ".sent .smeta{order:0!important}"
+ ".sent .spy{order:1!important}"
+ ".sent .szh{order:2!important}"
+ ".sent .svi{order:3!important}"

/* ===== IMPV (nhập văn): order Pinyin → Hán → Việt ===== */
+ ".impv-card{display:flex!important;flex-direction:column!important}"
+ ".impv-card .impv-card-head{order:0!important}"
+ ".impv-card .impv-card-py{order:1!important}"
+ ".impv-card .impv-card-zh{order:2!important}"
+ ".impv-card .impv-card-vi{order:3!important}"

/* ===== MAIN APP font size ===== */
+ ":root{--main-py:12px;--main-zh:19px;--main-vi:13px}"
+ "body[data-fs='S']{--main-py:10px!important;--main-zh:16px!important;--main-vi:11px!important}"
+ "body[data-fs='M']{--main-py:12px!important;--main-zh:19px!important;--main-vi:13px!important}"
+ "body[data-fs='L']{--main-py:14px!important;--main-zh:22px!important;--main-vi:15px!important}"
+ "body[data-fs='XL']{--main-py:16px!important;--main-zh:26px!important;--main-vi:17px!important}"
+ ".spy{font-size:var(--main-py)!important}"
+ ".szh{font-size:var(--main-zh)!important}"
+ ".svi{font-size:var(--main-vi)!important}"
+ ".impv-card-py{font-size:var(--main-py)!important}"
+ ".impv-card-zh{font-size:var(--main-zh)!important}"
+ ".impv-card-vi{font-size:var(--main-vi)!important}"

/* ===== Header order ===== */
+ "#rtrHeaderBtn{order:10!important}"
+ "#vpHeaderBtn{order:11!important}"
+ "#impvHeaderBtn{order:12!important}"
+ "#importBtn{order:12!important}"
+ "#openImportPageBtn{order:12!important}"
+ "#savedBtn{order:20!important}"
+ "#toneBtn{order:21!important}"
+ "#fsToggleBtn{order:25!important}"
+ "#themeBtn{order:30!important}"
+ "#settingsBtn{order:31!important}"

/* ===== FS Popup ===== */
+ ".fs-popup{position:fixed;top:70px;right:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;width:280px;box-shadow:0 20px 60px rgba(0,0,0,.6);z-index:400;display:none}"
+ ".fs-popup.show{display:block}"
+ ".fs-popup h4{font-size:12px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px}"
+ ".fs-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px}"
+ ".fs-btn{padding:10px 6px;border-radius:9px;background:var(--bg);border:1.5px solid var(--border);color:var(--text2);font-size:12px;font-weight:800;cursor:pointer;text-align:center}"
+ ".fs-btn:hover{background:var(--card2);color:var(--text)}"
+ ".fs-btn.on{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border-color:transparent}"
+ ".fs-btn .sz{display:block;font-weight:900;line-height:1;margin-bottom:3px}"
+ ".fs-btn .lb{display:block;font-size:9.5px;opacity:.85}";

const style = document.createElement('style');
style.id = 'app22-force-css';
style.textContent = FORCE_CSS;
document.head.appendChild(style);

const KEY = 'dd_fontsize_v1';
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
    '<div class="fs-popup" id="fsPopup"><h4>🔤 Cỡ chữ</h4><div class="fs-grid">'
    +'<button class="fs-btn" data-size="S"><span class="sz" style="font-size:10px">A</span><span class="lb">Nhỏ</span></button>'
    +'<button class="fs-btn" data-size="M"><span class="sz" style="font-size:14px">A</span><span class="lb">Vừa</span></button>'
    +'<button class="fs-btn" data-size="L"><span class="sz" style="font-size:18px">A</span><span class="lb">Lớn</span></button>'
    +'<button class="fs-btn" data-size="XL"><span class="sz" style="font-size:22px">A</span><span class="lb">Rất lớn</span></button>'
    +'</div></div>');
  const pop = document.getElementById('fsPopup');
  pop.addEventListener('click', e=>{
    const b = e.target.closest('.fs-btn'); if (!b) return;
    applyFontSize(b.dataset.size);
    if (window.toast) window.toast('Cỡ chữ: '+b.querySelector('.lb').textContent,'ok');
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
  btn.title = 'Cỡ chữ';
  btn.innerHTML = '<svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M3 18l4-12 4 12M4.5 14h5M14 18l3.5-10 3.5 10M15 15h5"/></svg>';
  btn.onclick = e=>{ e.stopPropagation(); const p=document.getElementById('fsPopup'); if(p) p.classList.toggle('show'); };
  const ref = document.getElementById('savedBtn') || document.getElementById('settingsBtn');
  if (ref && ref.parentElement === hb) hb.insertBefore(btn, ref);
  else hb.appendChild(btn);
}

/* Auto-gán size class cho card mới */
function observeCards(){
  ['transcriptArea','impvListInner','vpList'].forEach(tid=>{
    const el = document.getElementById(tid);
    if (!el) return;
    new MutationObserver(()=>{
      if (tid === 'vpList'){
        document.querySelectorAll('.vp-card').forEach(c=>{
          if (!c.classList.contains('size-'+fontSize)){
            c.classList.remove('size-S','size-M','size-L','size-XL');
            c.classList.add('size-'+fontSize);
          }
        });
      }
    }).observe(el, { childList:true, subtree:true });
  });
}

function init(){
  buildPopup();
  setTimeout(()=>{
    addFontBtn();
    applyFontSize(fontSize);
    observeCards();
  }, 1500);
  setInterval(()=>{
    addFontBtn();
    if (document.body.getAttribute('data-fs') !== fontSize) applyFontSize(fontSize);
  }, 2500);
  console.log('[app22 v1.0] ✅ Force CSS override loaded');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(init, 1400));
else setTimeout(init, 1400);
})();
