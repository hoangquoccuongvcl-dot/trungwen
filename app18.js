/* DISABLED - app27 handles mobile */
//'use strict';
///* app18.js v2.0 — Mobile Optimization (fixed CSS) */
//(function(){
//  var isMobile = window.innerWidth <= 900;
//  if (!isMobile) { console.log('[app18] Desktop — skip'); return; }
//
//  console.log('[app18] 📱 Mobile detected');
//
//  var css = [
//    'body{padding-top:env(safe-area-inset-top)!important;padding-bottom:env(safe-area-inset-bottom)!important}',
//    'input,select,textarea{font-size:16px!important}',
//    '.hdr{height:50px!important;padding:0 10px!important;gap:6px!important}',
//    '.logo{font-size:13px!important;gap:6px!important}',
//    '.logo .mark{width:28px!important;height:28px!important;font-size:14px!important}',
//    '.hbtns{gap:4px!important}',
//    '#batchBtn span,#fileInput+span{display:none!important}',
//    '#batchBtn{width:36px!important;padding:0!important;justify-content:center!important;height:36px!important}',
//    '#focusBtn,#cmdBtn,#helpBtn{display:none!important}',
//    '.hbtn{height:36px!important;min-width:36px!important;border-radius:10px!important}',
//    '.hbtn.icon-only{width:36px!important}',
//    '.sidebar{width:88%!important;max-width:340px!important;top:0!important;box-shadow:8px 0 30px rgba(0,0,0,.5)!important}',
//    '.sh{padding:16px 18px!important}',
//    '.sbox{padding:12px 14px!important}',
//    '.sbox input{padding:12px 14px!important;font-size:15px!important;border-radius:12px!important}',
//    '.plist{padding:8px!important}',
//    '.fh{padding:14px!important;font-size:14px!important;border-radius:12px!important;min-height:48px}',
//    '.ti{padding:14px 12px!important;font-size:14px!important;border-radius:10px!important;min-height:48px}',
//    '.mh{height:54px!important;padding:0 10px!important;gap:6px!important;overflow-x:auto!important}',
//    '.mh::-webkit-scrollbar{display:none!important}',
//    '.mbtn{width:36px!important;height:36px!important;border-radius:10px!important;flex-shrink:0}',
//    '.ts{padding:14px 12px!important}',
//    '.sent{padding:14px!important;border-radius:12px!important;margin-bottom:10px!important}',
//    '.szh{font-size:20px!important;line-height:1.9!important}',
//    '.spy{font-size:13px!important;margin-top:8px!important}',
//    '.svi{font-size:13px!important;margin-top:10px!important}',
//    '.sact button{width:32px!important;height:32px!important}',
//    '.player{padding:10px 12px calc(12px + env(safe-area-inset-bottom))!important}',
//    '.crow{flex-wrap:wrap!important;gap:6px!important}',
//    '.cgroup:first-child{order:2!important;width:100%!important;justify-content:center!important;margin-top:8px!important;padding-top:8px!important;border-top:1px solid var(--border)!important}',
//    '.cgroup.center{order:1!important;flex:1!important}',
//    '.cb{width:42px!important;height:42px!important;border-radius:11px!important}',
//    '.cb.main{width:60px!important;height:60px!important;border-radius:50%!important}',
//    '.cb.main svg{width:26px!important;height:26px!important}',
//    '.cgroup:first-child .cb{width:44px!important;height:44px!important}',
//    '.cgroup.right{order:3!important;width:100%!important;justify-content:center!important;margin-top:6px!important}',
//    '.volwrap{display:none!important}',
//    '.modal{padding:0!important;align-items:stretch!important}',
//    '.mc{max-width:100%!important;max-height:100%!important;height:100%!important;border-radius:0!important;padding:16px!important}',
//    '.mcb .grid{grid-template-columns:1fr!important;gap:14px!important}',
//    '.mcb label{font-size:13px!important;margin-bottom:8px!important}',
//    '.sel.full{padding:13px 14px!important;font-size:15px!important;border-radius:12px!important;min-height:48px}',
//    '.btn{padding:12px 16px!important;font-size:13px!important;min-height:44px;border-radius:10px!important}',
//    '.btn.sm{padding:10px 14px!important;font-size:12.5px!important;min-height:40px}',
//    '.impv-topbar{height:56px!important;padding:0 10px!important;gap:8px!important}',
//    '.impv-back{width:40px!important;height:40px!important;border-radius:11px!important}',
//    '.impv-brand-icon{width:38px!important;height:38px!important;font-size:18px!important}',
//    '.impv-iconbtn{width:40px!important;height:40px!important;border-radius:11px!important}',
//    '.impv-input-wrap{padding:16px 14px 0!important}',
//    '.impv-ta{padding:14px 16px!important;font-size:16px!important;border-radius:14px!important;min-height:200px!important}',
//    '.impv-opt{flex-wrap:wrap!important;width:100%!important;justify-content:center!important}',
//    '.impv-opt button{padding:9px 12px!important;font-size:12px!important;min-height:40px!important}',
//    '.impv-cta-row{padding:12px 14px 16px!important;flex-direction:column!important;gap:8px!important}',
//    '.impv-cta{padding:14px 18px!important;font-size:14px!important;min-height:52px!important;border-radius:12px!important}',
//    '.impv-toolbar{height:60px!important;padding:0 10px!important;gap:8px!important;overflow-x:auto!important}',
//    '.impv-tbtn{width:40px!important;height:40px!important;border-radius:10px!important}',
//    '.impv-list{padding:14px 12px 240px!important}',
//    '.impv-card{padding:14px!important;border-radius:14px!important}',
//    '.impv-cact{width:36px!important;height:36px!important;border-radius:9px!important}',
//    '.impv-card-zh{font-size:20px!important;line-height:1.85!important}',
//    '.impv-card-py{font-size:13px!important;margin-top:10px!important}',
//    '.impv-card-vi{font-size:13.5px!important;margin-top:12px!important;padding-top:12px!important}',
//    '.impv-player{padding:12px 14px calc(16px + env(safe-area-inset-bottom))!important;gap:12px!important}',
//    '.impv-pctrl{gap:8px!important;flex-wrap:wrap!important}',
//    '.impv-pgroup.center{flex:1 1 100%!important;order:1!important;gap:10px!important;margin-bottom:8px!important}',
//    '.impv-pgroup:first-child{order:2!important;flex:1!important;justify-content:center!important}',
//    '.impv-pgroup.right{order:3!important;flex:0 0 auto!important}',
//    '.impv-btn{width:44px!important;height:44px!important;border-radius:11px!important}',
//    '.impv-btn.main{width:62px!important;height:62px!important}',
//    '.impv-btn.main svg{width:26px!important;height:26px!important}',
//    '.impv-pop{left:8px!important;right:8px!important;top:60px!important;min-width:auto!important;max-height:calc(100vh - 80px)!important;padding:18px!important;border-radius:16px!important}',
//    '.impv-pop-row button{padding:12px 4px!important;font-size:13px!important;min-height:44px!important}',
//    '.streak-badge{display:none!important}',
//    '.wf14{height:36px!important;margin-top:12px!important}',
//    '.wp{width:calc(100vw - 24px)!important;max-width:340px!important;padding:16px!important}',
//    '.ctx-menu{min-width:220px!important;padding:8px!important}',
//    '.ctx-item{padding:13px 14px!important;font-size:14px!important;min-height:48px}',
//    '.toast{top:auto!important;bottom:80px!important;transform:translateX(-50%) translateY(20px)!important;font-size:13px!important;max-width:92vw!important}',
//    '.toast.show{transform:translateX(-50%) translateY(0)!important}',
//    '.shadow{bottom:130px!important;padding:14px 18px!important;width:calc(100vw - 24px)!important}',
//    '.dict-panel{bottom:130px!important;padding:16px!important;width:calc(100vw - 24px)!important}',
//    '.srs-btns{grid-template-columns:1fr 1fr!important;gap:10px!important}',
//    '.srs-btn{padding:18px 10px!important;font-size:13.5px!important}'
//  ].join('\n');
//
//  // Media queries RIÊNG (đảm bảo đóng đủ)
//  css += '\n@media(hover:none){';
//  css += '.cb:hover,.hbtn:hover,.mbtn:hover,.impv-btn:hover,.impv-tbtn:hover,.impv-cact:hover,.ti:hover,.fh:hover{background:inherit!important;color:inherit!important;transform:none!important}';
//  css += '}';
//
//  css += '\n@media(max-width:400px){';
//  css += '.szh{font-size:18px!important}';
//  css += '.impv-card-zh{font-size:18px!important}';
//  css += '.cb{width:38px!important;height:38px!important}';
//  css += '.cb.main{width:54px!important;height:54px!important}';
//  css += '.impv-btn{width:40px!important;height:40px!important}';
//  css += '.impv-btn.main{width:56px!important;height:56px!important}';
//  css += '}';
//
//  css += '\n@media(max-height:500px) and (orientation:landscape){';
//  css += '.hdr{height:44px!important}';
//  css += '.mh{height:44px!important}';
//  css += '.player{padding:6px 12px 8px!important}';
//  css += '.cb{width:34px!important;height:34px!important}';
//  css += '.cb.main{width:44px!important;height:44px!important}';
//  css += '}';
//
//  var style = document.createElement('style');
//  style.id = 'app18-mobile';
//  style.textContent = css;
//  document.head.appendChild(style);
//
//  console.log('[app18 v2.0] ✅ Mobile CSS applied');
//})();
//