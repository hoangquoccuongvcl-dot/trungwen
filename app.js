'use strict';
/* 當代中文 PRO v8.0 — Fixed all + Simple sentences */

const $ = id => document.getElementById(id);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = s => { if(!isFinite(s) || s < 0) return '00:00'; const m = Math.floor(s / 60), x = Math.floor(s % 60); return String(m).padStart(2,'0') + ':' + String(x).padStart(2,'0'); };
const fmtLRC = s => { const m = Math.floor(s / 60), x = (s % 60).toFixed(2).padStart(5,'0'); return String(m).padStart(2,'0') + ':' + x; };

const DB = {
  db: null,
  init() { return new Promise((res, rej) => { const r = indexedDB.open('dd_db_v8', 1); r.onupgradeneeded = e => e.target.result.createObjectStore('files'); r.onsuccess = () => { this.db = r.result; res(); }; r.onerror = () => rej(r.error); }); },
  put(k, b) { return new Promise((res, rej) => { try { const tx = this.db.transaction('files','readwrite'); tx.objectStore('files').put(b, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); } catch(e) { rej(e); } }); },
  get(k) { return new Promise((res, rej) => { try { const tx = this.db.transaction('files','readonly'); const r = tx.objectStore('files').get(k); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch(e) { rej(e); } }); },
  clear() { return new Promise((res, rej) => { try { const tx = this.db.transaction('files','readwrite'); tx.objectStore('files').clear(); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); } catch(e) { rej(e); } }); }
};

const S = {
  tracks: [], folders: [], cur: -1, recent: [],
  loopA: null, loopB: null, repeatOn: false, repeatCount: 3,
  autoPause: false, curRepeat: 0, autoPausedFor: -1,
  vocab: [], bookmarks: {}, progress: {},
  settings: { translate:'on', autoplay:'on', theme:'auto', fontSize:'medium', format:'traditional', repeat:3, speed:'1', volume:'1', hidden:{han:false,pinyin:false,vi:false} },
  curWord: null, shadowRec: null, shadowChunks: [], shadowUrl: null,
  listeningSec: 0, activeSent: -1, translating: false,
  dictIdx: 0, dictScore: 0, dictTotal: 0, dictLocked: false, dictTrackId: null,
  selToken: null, dbReady: false,
  tpAbort: null, trAbort: null, playlistMode: false, focusMode: false,
  batchProcessing: false,
  dict: {}
};

S.dict = {
  '我':'tôi','你':'bạn','您':'ngài','他':'anh ấy','她':'cô ấy','我們':'chúng tôi','你們':'các bạn','他們':'họ','大家':'mọi người','誰':'ai','什麼':'cái gì','哪':'nào','哪裡':'ở đâu','這':'này','那':'kia',
  '是':'là','有':'có','在':'ở','去':'đi','來':'đến','回':'về','到':'đến','吃':'ăn','喝':'uống','看':'xem','聽':'nghe','說':'nói','讀':'đọc','寫':'viết','學':'học','教':'dạy','問':'hỏi','知道':'biết','認識':'quen biết',
  '對不起':'xin lỗi','謝謝':'cảm ơn','不客氣':'không có chi','請問':'xin hỏi','歡迎':'hoan nghênh','再見':'tạm biệt','早安':'chào buổi sáng','你好':'xin chào',
  '台灣':'Đài Loan','臺灣':'Đài Loan','越南':'Việt Nam','美國':'Mỹ','老師':'thầy/cô giáo','學生':'học sinh','中文':'tiếng Trung','名字':'tên','高興':'vui mừng',
  '茶':'trà','烏龍茶':'trà Ô Long','水果茶':'trà hoa quả','咖啡':'cà phê','牛肉麵':'mì bò','小籠包':'tiểu long bao','錢':'tiền','多少錢':'bao nhiêu tiền','塊':'đồng','捷運':'tàu điện MRT','宿舍':'ký túc xá'
};

const PY = {'你':'nǐ','好':'hǎo','我':'wǒ','是':'shì','的':'de','了':'le','不':'bù','在':'zài','有':'yǒu','人':'rén','這':'zhè','那':'nà','中':'zhōng','國':'guó','台':'tái','灣':'wān','美':'měi','越':'yuè','南':'nán','老':'lǎo','師':'shī','學':'xué','生':'shēng','說':'shuō','聽':'tīng','讀':'dú','寫':'xiě','吃':'chī','喝':'hē','看':'kàn','來':'lái','去':'qù','回':'huí','家':'jiā','朋':'péng','友':'yǒu','爸':'bà','媽':'mā','哥':'gē','弟':'dì','姐':'jiě','妹':'mèi','喜':'xǐ','歡':'huān','愛':'ài','謝':'xiè','對':'duì','起':'qǐ','請':'qǐng','問':'wèn','名':'míng','字':'zì','叫':'jiào','很':'hěn','高':'gāo','興':'xìng','認':'rèn','識':'shí','也':'yě','呢':'ne','嗎':'ma','時':'shí','候':'hòu','錢':'qián','話':'huà','語':'yǔ','文':'wén','書':'shū','什':'shén','麼':'me'};

const save = () => {
  try {
    localStorage.setItem('dd_f', JSON.stringify(S.folders));
    localStorage.setItem('dd_v', JSON.stringify(S.vocab));
    localStorage.setItem('dd_b', JSON.stringify(S.bookmarks));
    localStorage.setItem('dd_p', JSON.stringify(S.progress));
    localStorage.setItem('dd_s', JSON.stringify(S.settings));
    localStorage.setItem('dd_ls', S.listeningSec);
    localStorage.setItem('dd_recent', JSON.stringify(S.recent));
    localStorage.setItem('dd_tracks_meta', JSON.stringify(S.tracks.map(t => ({id: t.id, name: t.name, folder: t.folder, sk: t.sk, size: t.size, type: t.type, book: t.book, lesson: t.lesson}))));
  } catch(e) {}
};

const load = () => {
  try {
    S.folders = JSON.parse(localStorage.getItem('dd_f') || '[]');
    S.vocab = JSON.parse(localStorage.getItem('dd_v') || '[]');
    S.bookmarks = JSON.parse(localStorage.getItem('dd_b') || '{}');
    S.progress = JSON.parse(localStorage.getItem('dd_p') || '{}');
    S.recent = JSON.parse(localStorage.getItem('dd_recent') || '[]');
    Object.assign(S.settings, JSON.parse(localStorage.getItem('dd_s') || '{}'));
    S.listeningSec = parseInt(localStorage.getItem('dd_ls') || '0');
  } catch(e) {}
};

const getTr = n => { try { return JSON.parse(localStorage.getItem('dd_tr_' + encodeURIComponent(n)) || 'null'); } catch(e) { return null; } };
const setTr = (n, d) => { try { localStorage.setItem('dd_tr_' + encodeURIComponent(n), JSON.stringify(d)); } catch(e) {} };

let toastT;
function toast(msg, type){
  const el = $('toast'); if(!el) return;
  el.textContent = msg;
  el.className = 'toast ' + (type || '');
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2400);
}

function py(text){
  const c = text.replace(/[^\u4e00-\u9fa5]/g,'');
  if(!c) return '';
  if(window.pinyinPro){ try { return window.pinyinPro.pinyin(c, { toneType:'symbol', type:'string', nonZh:'removed' }); } catch(e) {} }
  return [...c].map(x => PY[x] || x).join(' ');
}

const trCache = {};
async function translate(text, signal){
  const c = text.replace(/[^\u4e00-\u9fa5，。！？、；：""''《》（）]/g,'').trim();
  if(!c) return '';
  if(trCache[c]) return trCache[c];
  const k = 'dd_tc_' + c.slice(0, 25);
  const cached = localStorage.getItem(k);
  if(cached){ trCache[c] = cached; return cached; }
  try {
    const r = await fetch('/api/translate?q=' + encodeURIComponent(c), { signal });
    if(!r.ok) throw 0;
    const d = await r.json();
    const out = d.text || '';
    if(out){ trCache[c] = out; try { localStorage.setItem(k, out); } catch(e) {} }
    return out;
  } catch(e) { return ''; }
}

function parseName(fn){
  fn = fn.replace(/\.[^.]+$/,'');
  let book = null, lesson = null, type = null;
  const bm = fn.match(/(?:當代中文|当代中文|book|vol|冊|册)\s*[-_]?\s*(\d+)/i);
  if(bm) book = 'Book ' + bm[1];
  const lm = fn.match(/(?:lesson|L|le|bai)\s*[-_]?\s*0*(\d{1,2})/i) || fn.match(/第\s*0*(\d{1,2})\s*[課课]/) || fn.match(/^0*(\d{1,2})[-_.\s]/) || fn.match(/[-_]0*(\d{1,2})[-_.\s]/);
  if(lm) lesson = parseInt(lm[1]);
  const tm = [
    [/dialog|對話|会话|hội thoại|[-_]d\d+/i, '對話'],
    [/text|課文|reading/i, '課文'],
    [/vocab|生詞|生词|單字|詞彙|[-_]v\b/i, '生詞'],
    [/exercise|練習|drill|practice/i, '練習'],
    [/listening|聽力|nghe/i, '聽力'],
    [/grammar|語法|ngữ pháp/i, '語法']
  ];
  for(const [r, l] of tm){ if(r.test(fn)){ type = l; break; } }
  const p = [];
  if(book) p.push(book);
  if(lesson !== null) p.push('Lesson ' + String(lesson).padStart(2,'0'));
  if(type) p.push(type);
  return { book, lesson, type, folder: p.length ? p.join(' / ') : null };
}

function segZh(t){
  if(typeof Intl !== 'undefined' && Intl.Segmenter){
    try { const s = new Intl.Segmenter('zh-Hans', { granularity:'word' }); return [...s.segment(t)].map(x => x.segment); } catch(e) {}
  }
  return [...t];
}

async function handleFiles(fl){
  const files = Array.from(fl); if(!files.length) return;
  for(const f of files){
    if(f.name.endsWith('.json')){ try { applyImport(JSON.parse(await f.text())); } catch(e) { toast('File JSON lỗi','err'); } }
  }
  const af = files.filter(f => /\.(mp3|m4a|wav|aac|ogg|flac|opus)$/i.test(f.name));
  if(!af.length){ if(!files.some(f => f.name.endsWith('.json'))) toast('Không tìm thấy file audio','err'); return; }
  let n = 0;
  for(const f of af){
    const sk = f.size + '_' + f.name;
    if(S.tracks.some(t => t.sk === sk)) continue;
    let bf = 'Khác';
    if(f.webkitRelativePath){ const p = f.webkitRelativePath.split('/'); if(p.length > 1) bf = p[p.length - 2]; }
    const sm = parseName(f.name);
    const folder = sm.folder || bf;
    if(!S.folders.includes(folder)) S.folders.push(folder);
    const name = f.name.replace(/\.[^/.]+$/,'');
    const id = 't_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    const track = { id, name, folder, sk, size: f.size, type: f.type, book: sm.book, lesson: sm.lesson, transcript: getTr(name), blob: f, fromDB: false };
    S.tracks.push(track);
    if(S.dbReady){ try { await DB.put(id, f); track.fromDB = true; } catch(e) { console.warn('DB error:', e); } }
    n++;
  }
  if(n){ save(); renderPlaylist(); updateStats(); toast('Đã nạp ' + n + ' bài', 'ok'); }
}

async function loadFromDB(){
  if(!S.dbReady) return;
  try {
    const meta = JSON.parse(localStorage.getItem('dd_tracks_meta') || '[]');
    if(!meta.length) return;
    let restored = 0;
    for(const m of meta){
      const data = await DB.get(m.id);
      if(!data) continue;
      const blob = (data instanceof Blob) ? data : new Blob([data], { type: m.type || 'audio/mpeg' });
      const track = { ...m, blob: blob, transcript: getTr(m.name), fromDB: true };
      S.tracks.push(track);
      if(!S.folders.includes(m.folder)) S.folders.push(m.folder);
      restored++;
    }
    if(restored){ renderPlaylist(); updateStats(); toast('Đã phục hồi ' + restored + ' bài', 'ok'); }
  } catch(e) { console.warn('loadFromDB:', e); }
}

function renderPlaylist(){
  const c = $('playlist'); if(!c) return;
  const q = ($('searchInput').value || '').toLowerCase();
  $('trackCount').textContent = S.tracks.length;
  if(!S.tracks.length){
    c.innerHTML = '<div class="empty"><span class="em">📁</span><p style="font-weight:600;color:var(--text2);margin-bottom:6px">Chưa có bài nào</p><p>Bấm 📁 để nạp thư mục</p></div>';
    return;
  }
  const g = {};
  S.tracks.forEach((t, i) => { if(q && !t.name.toLowerCase().includes(q)) return; if(!g[t.folder]) g[t.folder] = []; g[t.folder].push({ ...t, idx: i }); });
  const sorted = Object.keys(g).sort((a,b) => {
    const an = (a.match(/\d+/) || [])[0], bn = (b.match(/\d+/) || [])[0];
    if(an && bn) return parseInt(an) - parseInt(bn);
    return a.localeCompare(b);
  });
  if(!sorted.length){ c.innerHTML = '<div class="empty"><p>Không tìm thấy bài</p></div>'; return; }
  c.innerHTML = sorted.map(f => {
    const items = g[f];
    const hc = items.some(t => t.idx === S.cur);
    const op = (hc || q) ? 'open' : '';
    return '<div class="fg ' + op + '"><div class="fh" onclick="toggleF(this)"><div class="fn"><span class="chev"><svg><use href="#i-chev"/></svg></span><span style="color:var(--yellow)">📁</span><span>' + esc(f) + '</span></div><span class="cnt">' + items.length + '</span></div><div class="fb">' + items.map(t => '<div class="ti ' + (t.idx === S.cur ? 'active' : '') + '" onclick="selectTrack(' + t.idx + ')"><span class="ticon"><svg><use href="' + (t.idx === S.cur ? '#i-pause' : '#i-play') + '"/></svg></span><span class="tname">' + esc(t.name) + '</span>' + (t.transcript && t.transcript.length ? '<span class="tcc">CC</span>' : '') + '</div>').join('') + '</div></div>';
  }).join('');
}
function toggleF(h){ h.parentElement.classList.toggle('open'); }

function addRecent(trackId){
  const t = S.tracks.find(x => x.id === trackId);
  if(!t) return;
  S.recent = [trackId, ...S.recent.filter(x => x !== trackId)].slice(0, 10);
  save(); renderRecent();
}

function renderRecent(){
  const w = $('recentWrap'); if(!w) return;
  const el = $('recentList'); if(!el) return;
  const items = S.recent.map(id => S.tracks.find(t => t.id === id)).filter(Boolean);
  if(!items.length){ w.classList.remove('show'); return; }
  w.classList.add('show');
  el.innerHTML = items.map(t => {
    const idx = S.tracks.findIndex(x => x.id === t.id);
    const act = idx === S.cur;
    const prog = S.progress[t.id] || 0;
    return '<div class="recent-item ' + (act ? 'active' : '') + '" onclick="selectTrack(' + idx + ')"><span class="rn">' + esc(t.name) + '</span><span class="rt">' + (prog > 5 ? fmt(prog) : '') + '</span></div>';
  }).join('');
}

const audio = $('audio');
let lastTick = 0;

async function selectTrack(idx){
  if(idx < 0 || idx >= S.tracks.length) return;
  const myToken = Symbol('sel');
  S.selToken = myToken;
  if(S.trAbort){ try{ S.trAbort.abort(); } catch(e){} S.trAbort = null; }
  if(S.tpAbort){ try{ S.tpAbort.abort(); } catch(e){} S.tpAbort = null; const m = $('tpModal'); if(m) m.classList.remove('show'); }

  const t = S.tracks[idx];
  S.cur = idx;
  $('currentFolder').textContent = t.folder;
  $('currentTitle').textContent = t.name;

  if(audio._url) URL.revokeObjectURL(audio._url);
  audio._url = URL.createObjectURL(t.blob);
  audio.src = audio._url;
  audio.playbackRate = parseFloat($('speedSelect').value);
  audio.volume = parseFloat($('volumeSlider').value);

  const sp = S.progress[t.id] || 0;
  audio.onloadedmetadata = () => { if(sp > 1 && sp < audio.duration - 3) audio.currentTime = sp; $('durTime').textContent = fmt(audio.duration); };

  try { await audio.play(); } catch(e) {}
  if(S.selToken !== myToken) return;

  clearLoop();
  S.curRepeat = 0;
  S.autoPausedFor = -1;
  S.dictIdx = 0; S.dictScore = 0; S.dictTotal = 0; S.dictTrackId = t.id;

  renderTranscript(t.transcript);
  renderPlaylist();
  renderRecent();
  updateStats();
  addRecent(t.id);
  setupMediaSession(t);

  if(window.innerWidth <= 780){ $('sidebar').classList.remove('open'); $('backdrop').classList.remove('show'); }
}

function setupMediaSession(t){
  if(!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.name, artist: t.folder, album: '當代中文' });
    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => { if(S.activeSent > 0) seekSent(S.activeSent - 1); else audio.currentTime = Math.max(0, audio.currentTime - 5); });
    navigator.mediaSession.setActionHandler('nexttrack', () => { const tr = S.tracks[S.cur]?.transcript; if(tr && S.activeSent < tr.length - 1) seekSent(S.activeSent + 1); else audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); });
    navigator.mediaSession.setActionHandler('seekbackward', () => { audio.currentTime = Math.max(0, audio.currentTime - 5); });
    navigator.mediaSession.setActionHandler('seekforward', () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); });
  } catch(e) { console.warn('MediaSession:', e); }
}

audio.onplay = () => { const i = $('playIcon'); if(i){ i.innerHTML = '<use href="#i-pause"/>'; i.setAttribute('class',''); } };
audio.onpause = () => { const i = $('playIcon'); if(i){ i.innerHTML = '<use href="#i-play"/>'; i.setAttribute('class','ic-play'); } };

audio.ontimeupdate = () => {
  const c = audio.currentTime, d = audio.duration || 0;
  $('curTime').textContent = fmt(c);
  if(d){ const p = (c / d) * 100; $('progressFill').style.width = p + '%'; $('progressThumb').style.left = p + '%'; $('durTime').textContent = fmt(d); }

  if(S.loopA !== null && S.loopB !== null && c >= S.loopB){ audio.currentTime = S.loopA; return; }

  if(S.repeatOn && S.activeSent >= 0){
    const tr = S.tracks[S.cur]?.transcript;
    if(tr){
      const cur = tr[S.activeSent];
      const end = (cur && cur.end) ? cur.end : (tr[S.activeSent + 1]?.start || (d - 0.15));
      if(c >= end - 0.1){
        S.curRepeat++;
        if(S.curRepeat < S.repeatCount){ audio.currentTime = cur.start || 0; }
        else { S.curRepeat = 0; S.repeatOn = false; $('btnRepeat').classList.remove('on'); toast('Xong ' + S.repeatCount + ' lần', 'ok'); }
        return;
      }
    }
  }

  if(S.autoPause && S.activeSent >= 0 && !audio.paused && S.autoPausedFor !== S.activeSent){
    const tr = S.tracks[S.cur]?.transcript;
    if(tr){
      const cur = tr[S.activeSent];
      const end = (cur && cur.end) ? cur.end : (tr[S.activeSent + 1]?.start || (d - 0.15));
      if(c >= end - 0.15){ audio.pause(); S.autoPausedFor = S.activeSent; }
    }
  }

  syncActive(c);

  const now = Date.now();
  if(!audio.paused && now - lastTick > 5000){ S.listeningSec += 5; lastTick = now; try { localStorage.setItem('dd_ls', S.listeningSec); } catch(e){} updateStats(); }
};

audio.onended = () => {
  if(S.settings.autoplay !== 'on') return;
  if(S.playlistMode){
    const cur = S.tracks[S.cur];
    if(!cur) return;
    const sameFolder = S.tracks.map((t, i) => ({ t, i })).filter(x => x.t.folder === cur.folder);
    const pos = sameFolder.findIndex(x => x.i === S.cur);
    if(pos >= 0 && pos < sameFolder.length - 1){ setTimeout(() => selectTrack(sameFolder[pos + 1].i), 400); return; }
  }
  if(S.cur < S.tracks.length - 1){ setTimeout(() => selectTrack(S.cur + 1), 400); }
};
audio.onerror = () => { if(audio.src) toast('Lỗi tải file audio', 'err'); };

setInterval(() => {
  if(S.cur >= 0 && !audio.paused){
    S.progress[S.tracks[S.cur].id] = audio.currentTime;
    try { localStorage.setItem('dd_p', JSON.stringify(S.progress)); } catch(e) {}
  }
}, 3000);

function renderTranscript(list){
  const a = $('transcriptArea');
  S.activeSent = -1;
  if(!list || !list.length){
    a.innerHTML = '<div class="ph"><div class="phi"><svg><use href="#i-cap"/></svg></div><h3>Bài này chưa có lời</h3><p>Bấm nút <b>AI (Bộ não)</b> để chép lời bài này,<br>hoặc bấm nút <b>⚡ Tự Chép Tất Cả</b> ở góc trên.</p></div>';
    return;
  }
  const saved = new Set(S.vocab.map(v => v.zh));
  const tid = S.tracks[S.cur]?.id || '';
  a.innerHTML = list.map((item, i) => {
    const segs = segZh(item.zh);
    const html = segs.map(s => {
      if(/[\u4e00-\u9fa5]/.test(s)) return '<span class="word ' + (saved.has(s) ? 'saved' : '') + '" data-word="' + esc(s) + '">' + esc(s) + '</span>';
      return esc(s);
    }).join('');
    const bm = S.bookmarks[tid + '_' + i];
    return '<div class="sent" id="sent_' + i + '" data-idx="' + i + '"><div class="smeta"><span class="ttag">' + fmt(item.start || 0) + '</span><div class="sact"><button class="' + (bm ? 'on' : '') + '" data-bm="' + i + '" title="Đánh dấu"><svg><use href="#i-bookmark"/></svg></button><button data-rep="' + i + '" title="Lặp câu"><svg><use href="#i-repeat"/></svg></button></div></div><div class="szh ' + (S.settings.hidden.han ? 'hide' : '') + '">' + html + '</div>' + (item.pinyin ? '<div class="spy ' + (S.settings.hidden.pinyin ? 'hide' : '') + '">' + esc(item.pinyin) + '</div>' : '') + '<div class="svi ' + (S.settings.hidden.vi ? 'hide' : '') + '" id="vi_' + i + '" style="' + (item.vi ? '' : 'display:none') + '">' + esc(item.vi || '') + '</div></div>';
  }).join('');
  applyFontSize();
  if(S.settings.translate === 'on') autoTranslateAll(list);
}

function seekSent(i){ const tr = S.tracks[S.cur]?.transcript; if(tr && tr[i] && tr[i].start !== undefined) audio.currentTime = tr[i].start; }

function replaySent(i){
  const tr = S.tracks[S.cur]?.transcript; if(!tr || !tr[i]) return;
  audio.currentTime = tr[i].start || 0;
  S.activeSent = i; S.curRepeat = 0; S.repeatOn = true;
  $('btnRepeat').classList.add('on');
  audio.play();
}

function toggleBM(i){
  const tid = S.tracks[S.cur].id; const k = tid + '_' + i;
  if(S.bookmarks[k]) delete S.bookmarks[k]; else S.bookmarks[k] = true;
  try { localStorage.setItem('dd_b', JSON.stringify(S.bookmarks)); } catch(e) {}
  const el = $('sent_' + i)?.querySelector('[data-bm]');
  if(el) el.classList.toggle('on');
}

function syncActive(t){
  const tr = S.tracks[S.cur]?.transcript; if(!tr || !tr.length) return;
  let c = -1;
  for(let i = 0; i < tr.length; i++){ if(t >= (tr[i].start || 0) && (i === tr.length - 1 || t < (tr[i + 1].start || 0))){ c = i; break; } }
  if(c === S.activeSent || c === -1) return;
  const o = $('sent_' + S.activeSent); if(o) o.classList.remove('active');
  S.activeSent = c;
  S.autoPausedFor = -1;
  const n = $('sent_' + c);
  if(n){ n.classList.add('active'); n.scrollIntoView({ behavior:'smooth', block:'center' }); }
}

async function autoTranslateAll(list){
  if(!list || !list.length) return;
  if(S.translating) return;
  S.translating = true;
  let changed = false;
  for(let i = 0; i < list.length; i++){
    if(list[i].vi && list[i].vi.length > 0) continue;
    try {
      const vi = await translate(list[i].zh);
      if(vi && vi.length > 0){
        list[i].vi = vi;
        const el = $('vi_' + i);
        if(el){ el.textContent = vi; el.style.display = 'block'; el.classList.remove('hide'); el.style.opacity = '1'; }
        changed = true;
      }
    } catch(e) { console.warn('Translate fail:', e); }
    await new Promise(r => setTimeout(r, 100));
  }
  if(changed){
    const orig = S.tracks.find(t => t.transcript === list);
    if(orig) setTr(orig.name, list);
  }
  S.translating = false;
}

function setA(){ if(!audio.src) return; S.loopA = audio.currentTime; $('markA').style.display = 'block'; $('markA').style.left = ((S.loopA / audio.duration) * 100) + '%'; $('btnA').classList.add('on'); toast('Điểm A = ' + fmt(S.loopA)); }
function setB(){ if(S.loopA === null){ toast('Đặt A trước','err'); return; } if(audio.currentTime <= S.loopA){ toast('B phải sau A','err'); return; } S.loopB = audio.currentTime; $('markB').style.display = 'block'; $('markB').style.left = ((S.loopB / audio.duration) * 100) + '%'; $('btnB').classList.add('on'); $('btnClearAB').classList.remove('hidden'); toast('Lặp A-B'); }
function clearLoop(){ S.loopA = S.loopB = null; $('markA').style.display = 'none'; $('markB').style.display = 'none'; $('btnA').classList.remove('on'); $('btnB').classList.remove('on'); $('btnClearAB').classList.add('hidden'); }

function toggleDict(){
  const p = $('dictPanel'); const on = !p.classList.contains('show');
  p.classList.toggle('show', on);
  $('btnDictation').classList.toggle('on', on);
  if(on) startDict(); else audio.pause();
}

function startDict(){
  const tr = S.tracks[S.cur]?.transcript;
  if(!tr || !tr.length){ toast('Bài chưa có lời','err'); $('dictPanel').classList.remove('show'); $('btnDictation').classList.remove('on'); return; }
  S.dictIdx = 0; S.dictScore = 0; S.dictTotal = tr.length; S.dictTrackId = S.tracks[S.cur].id;
  loadDictSentence();
}

function loadDictSentence(){
  const tr = S.tracks[S.cur]?.transcript;
  if(!tr || !tr.length) return;
  if(S.dictIdx >= tr.length){
    $('dictSentence').innerHTML = '🎉 <span style="color:var(--green)">Hoàn thành!</span>';
    $('dictInput').value = ''; $('dictInput').disabled = true;
    $('dictHint').textContent = 'Đã xong!';
    return;
  }
  const s = tr[S.dictIdx];
  $('dictSentence').innerHTML = '<span class="dhide">' + esc(s.zh) + '</span>';
  $('dictInput').value = ''; $('dictInput').disabled = false; $('dictInput').className = 'dict-input';
  $('dictHint').textContent = 'Câu ' + (S.dictIdx + 1) + '/' + tr.length + ' — Enter để kiểm tra';
  $('dictScore').textContent = S.dictScore + ' / ' + S.dictTotal;
  S.dictLocked = false;
  if(s.start !== undefined){ audio.currentTime = s.start; audio.play(); }
  setTimeout(() => { const i = $('dictInput'); if(i && !i.disabled) i.focus(); }, 100);
}

function checkDict(){
  if(S.dictLocked) return;
  const tr = S.tracks[S.cur]?.transcript; if(!tr || !tr.length) return;
  const s = tr[S.dictIdx]; if(!s) return;
  const inp = $('dictInput').value.replace(/[，。！？,.\s]/g,'');
  const ans = s.zh.replace(/[，。！？,.\s]/g,'');
  if(!inp) return;
  if(inp === ans){
    S.dictLocked = true;
    $('dictInput').classList.add('ok');
    S.dictScore++;
    $('dictSentence').innerHTML = '<span class="dreveal">' + esc(s.zh) + '</span>';
    $('dictScore').textContent = S.dictScore + ' / ' + S.dictTotal;
    toast('✅ Đúng!', 'ok');
    setTimeout(() => { S.dictIdx++; S.dictLocked = false; loadDictSentence(); }, 900);
  } else {
    $('dictInput').classList.add('err');
    toast('❌ Sai!', 'err');
  }
}
function toggleShadow(){ const p = $('shadowPanel'); p.classList.toggle('show'); $('btnShadow').classList.toggle('on', p.classList.contains('show')); }

async function startRec(){
  const btn = $('shadowRecBtn');
  if(S.shadowRec && S.shadowRec.state === 'recording'){ S.shadowRec.stop(); btn.classList.remove('rec'); $('shadowStatus').textContent = 'Đã ghi xong'; return; }
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true });
    S.shadowChunks = [];
    S.shadowRec = new MediaRecorder(st);
    S.shadowRec.ondataavailable = e => S.shadowChunks.push(e.data);
    S.shadowRec.onstop = () => { const b = new Blob(S.shadowChunks, { type: 'audio/webm' }); if(S.shadowUrl) URL.revokeObjectURL(S.shadowUrl); S.shadowUrl = URL.createObjectURL(b); $('shadowPlayBtn').classList.remove('hidden'); st.getTracks().forEach(t => t.stop()); };
    S.shadowRec.start(); btn.classList.add('rec'); $('shadowStatus').textContent = '🔴 Đang ghi...';
  } catch(e){ toast('Không mở mic','err'); }
}
function playShadow(){ if(S.shadowUrl) new Audio(S.shadowUrl).play(); }

async function aiTranscribe(){
  if(S.cur < 0){ toast('Chọn bài trước','err'); return; }
  const t = S.tracks[S.cur];
  if(!t.blob){ toast('File chưa sẵn sàng','err'); return; }
  if(S.tpAbort){ toast('Đang chép bài khác','err'); return; }

  const ctrl = new AbortController();
  S.tpAbort = ctrl;
  const myToken = S.selToken;
  const trackId = t.id;
  const startTime = Date.now();

  $('tpName').textContent = t.name;
  $('tpFill').style.width = '0%';
  $('tpInfo').textContent = 'Đang kết nối...';
  $('tpTime').textContent = '00:00';
  $('tpModal').classList.add('show');

  const timerInterval = setInterval(() => { $('tpTime').textContent = fmt((Date.now() - startTime) / 1000); }, 500);
  const setProgress = (pct, msg) => { if(S.tpAbort !== ctrl) return; $('tpFill').style.width = pct + '%'; if(msg) $('tpInfo').textContent = msg; };

  try {
    setProgress(15, 'Đang gửi file...');
    const fd = new FormData();
    fd.append('audio', t.blob, t.name + '.mp3');
    setProgress(40, 'AI đang phân tích...');
    const r = await fetch('/api/transcribe', { method: 'POST', body: fd, signal: ctrl.signal });
    if(!r.ok){ const err = await r.json().catch(() => ({})); throw new Error(err.error || 'Server lỗi'); }
    setProgress(85, 'Đang chuẩn hóa...');
    const data = await r.json();
    const list = data.segments.map(s => ({ start: s.start, end: s.end, zh: s.text, pinyin: py(s.text), vi: '' }));

    if(S.tpAbort !== ctrl) return;
    const track = S.tracks.find(x => x.id === trackId);
    if(!track){ toast('Bài đã hủy','err'); return; }
    track.transcript = list;
    setTr(track.name, list);
    if(S.cur === S.tracks.indexOf(track) && S.selToken === myToken) renderTranscript(list);
    renderPlaylist();
    setProgress(100, '✅ ' + list.length + ' câu');
    setTimeout(() => { if(S.tpAbort === ctrl) $('tpModal').classList.remove('show'); }, 1000);
  } catch(e) {
    if(e.name === 'AbortError') console.log('aborted');
    else { toast('❌ ' + e.message, 'err'); console.error(e); }
  } finally {
    clearInterval(timerInterval);
    if(S.tpAbort === ctrl) S.tpAbort = null;
  }
}

async function startBatchTranscribe(){
  if(!S.tracks.length){ toast('Chưa có bài','err'); return; }
  const queue = S.tracks.filter(t => !t.transcript || !t.transcript.length);
  if(!queue.length){ toast('Tất cả đã có lời','ok'); return; }
  if(!confirm('AI sẽ chép lần lượt ' + queue.length + ' bài. Bắt đầu?')) return;

  S.batchProcessing = true;
  $('batchBtn').classList.add('on');
  toast('Bắt đầu chép ' + queue.length + ' bài...', 'ok');

  for(let i = 0; i < queue.length; i++){
    if(!S.batchProcessing) break;
    const track = queue[i];
    toast('[' + (i + 1) + '/' + queue.length + '] ' + track.name);
    try {
      const fd = new FormData();
      fd.append('audio', track.blob, track.name + '.mp3');
      const r = await fetch('/api/transcribe', { method: 'POST', body: fd });
      if(r.ok){
        const data = await r.json();
        const list = data.segments.map(s => ({ start: s.start, end: s.end, zh: s.text, pinyin: py(s.text), vi: '' }));
        track.transcript = list;
        setTr(track.name, list);
        if(S.cur >= 0 && S.tracks[S.cur].id === track.id) renderTranscript(list);
        renderPlaylist();
      }
    } catch(err) { console.warn('Lỗi:', track.name, err); }
    await new Promise(r => setTimeout(r, 500));
  }

  S.batchProcessing = false;
  $('batchBtn').classList.remove('on');
  toast('🎉 Xong tất cả!', 'ok');
}

function cancelTranscribe(){
  if(S.tpAbort){ S.tpAbort.abort(); S.tpAbort = null; }
  S.batchProcessing = false;
  $('batchBtn').classList.remove('on');
  $('tpModal').classList.remove('show');
  toast('Đã dừng');
}

let ctxIdx = -1;
function openCtx(e, i){
  ctxIdx = i;
  const m = $('ctxMenu');
  m.style.left = Math.min(e.clientX, innerWidth - 200) + 'px';
  m.style.top = Math.min(e.clientY, innerHeight - 180) + 'px';
  m.classList.add('show');
}
function closeCtx(){ $('ctxMenu').classList.remove('show'); }
async function ctxCopy(){ const tr = S.tracks[S.cur]?.transcript; if(tr && tr[ctxIdx]){ try { await navigator.clipboard.writeText(tr[ctxIdx].zh); toast('Đã copy','ok'); } catch(e){ toast('Không copy','err'); } } closeCtx(); }
async function ctxTranslate(){
  const tr = S.tracks[S.cur]?.transcript;
  if(tr && tr[ctxIdx]){ toast('Đang dịch...'); const vi = await translate(tr[ctxIdx].zh); if(vi){ tr[ctxIdx].vi = vi; const el = $('vi_' + ctxIdx); if(el){ el.textContent = vi; el.style.display = 'block'; } setTr(S.tracks[S.cur].name, tr); toast('Xong','ok'); } else toast('Không dịch được','err'); }
  closeCtx();
}
function ctxLoop(){ replaySent(ctxIdx); closeCtx(); }
function ctxAddVocab(){
  const tr = S.tracks[S.cur]?.transcript;
  if(tr && tr[ctxIdx]){
    const words = segZh(tr[ctxIdx].zh).filter(s => /[\u4e00-\u9fa5]/.test(s));
    let added = 0;
    words.forEach(w => { if(!S.vocab.some(v => v.zh === w)){ S.vocab.push({ zh: w, pinyin: py(w), mean: S.dict[w] || '', srs: { level: 0, next: Date.now(), wrong: 0 } }); added++; } });
    try { localStorage.setItem('dd_v', JSON.stringify(S.vocab)); } catch(e) {}
    renderVocab(); updateStats();
    if(S.cur >= 0) renderTranscript(S.tracks[S.cur].transcript);
    toast('Đã thêm ' + added + ' từ', 'ok');
  }
  closeCtx();
}

async function lookup(w, ev){
  const c = w.replace(/[^\u4e00-\u9fa5]/g,''); if(!c) return;
  S.curWord = c;
  const p = $('wordPopup');
  $('wpZh').textContent = c;
  $('wpPinyin').textContent = py(c) || '...';
  $('wpMean').textContent = S.dict[c] || 'Đang tra...';
  $('wpSource').textContent = S.dict[c] ? 'Từ điển offline' : '';
  const saved = S.vocab.some(v => v.zh === c);
  $('wpSave').classList.toggle('on', saved);
  p.classList.add('show');
  const r = ev.target.getBoundingClientRect();
  const pw = 290, ph = 160;
  let x = r.left, y = r.bottom + 8;
  if(x + pw > innerWidth - 10) x = innerWidth - pw - 10;
  if(y + ph > innerHeight - 10) y = r.top - ph - 8;
  p.style.left = Math.max(10, x) + 'px';
  p.style.top = Math.max(10, y) + 'px';
  if(!S.dict[c]){ const mean = await translate(c); if(mean){ $('wpMean').textContent = mean; $('wpSource').textContent = 'Google Translate'; } else $('wpMean').textContent = 'Chưa có bản dịch'; }
}

function renderVocab(){
  const el = $('vocabList'); if(!el) return;
  $('vocabCount').textContent = S.vocab.length;
  $('vocabBadge').textContent = S.vocab.length;
  if(!S.vocab.length){ el.innerHTML = '<p style="text-align:center;color:var(--text3);padding:30px;font-size:12px">Chưa có từ nào</p>'; return; }
  el.innerHTML = S.vocab.map((v, i) => '<div class="vi"><div class="vim"><div style="display:flex;align-items:baseline;gap:8px"><span class="viz zh">' + esc(v.zh) + '</span><span class="vip">' + esc(v.pinyin || '') + '</span></div><div class="vime">' + esc(v.mean || '') + '</div></div><div class="via"><button onclick="speakV(' + i + ')"><svg><use href="#i-vol"/></svg></button><button onclick="delV(' + i + ')"><svg><use href="#i-trash"/></svg></button></div></div>').join('');
}
function speakV(i){ const u = new SpeechSynthesisUtterance(S.vocab[i].zh); u.lang = 'zh-TW'; u.rate = 0.85; speechSynthesis.speak(u); }
function delV(i){ S.vocab.splice(i, 1); try { localStorage.setItem('dd_v', JSON.stringify(S.vocab)); } catch(e) {} renderVocab(); updateStats(); }

function toggleFocus(){
  S.focusMode = !S.focusMode;
  document.body.classList.toggle('focus', S.focusMode);
  $('focusBtn').classList.toggle('on', S.focusMode);
  toast(S.focusMode ? 'Focus BẬT' : 'Focus TẮT');
}

function renderStats(){
  const body = $('statsBody'); if(!body) return;
  const days = 7;
  const now = new Date();
  const data = [];
  for(let i = days - 1; i >= 0; i--){ const d = new Date(now); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10); const val = parseInt(localStorage.getItem('dd_day_' + key) || '0'); data.push({ date: d, key, val }); }
  const max = Math.max(...data.map(x => x.val), 1);
  const total = data.reduce((s, x) => s + x.val, 0);
  body.innerHTML = '<div class="stat-grid"><div class="stat-box"><div class="sv">' + Math.round(total / 60) + '</div><div class="sl">Phút / 7 ngày</div></div><div class="stat-box"><div class="sv">' + S.vocab.length + '</div><div class="sl">Từ vựng</div></div><div class="stat-box"><div class="sv">' + S.tracks.length + '</div><div class="sl">Bài học</div></div><div class="stat-box"><div class="sv">' + Object.keys(S.progress).length + '</div><div class="sl">Đã nghe</div></div></div><div class="chart">' + data.map(x => '<div class="chart-bar" style="height:' + Math.max(4, (x.val / max) * 100) + '%"></div>').join('') + '</div><div class="chart-labels">' + data.map(x => '<div>' + ['CN','T2','T3','T4','T5','T6','T7'][x.date.getDay()] + '</div>').join('') + '</div>';
}

let lastDayTick = 0;
setInterval(() => {
  if(!audio.paused){
    const now = Date.now();
    if(now - lastDayTick < 5000) return;
    lastDayTick = now;
    const key = new Date().toISOString().slice(0, 10);
    const cur = parseInt(localStorage.getItem('dd_day_' + key) || '0');
    localStorage.setItem('dd_day_' + key, String(cur + 5));
  }
}, 5000);

function download(text, name, type){
  const b = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function toSRT(list){
  return list.map((s, i) => {
    const st = (typeof s.start === 'number' && isFinite(s.start)) ? s.start : i * 3.5;
    const en = (typeof s.end === 'number' && isFinite(s.end)) ? s.end : st + 3.5;
    const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
    const ms = n => String(Math.floor((n % 1) * 1000)).padStart(3, '0');
    return (i + 1) + '\n' + pad(st / 3600) + ':' + pad((st % 3600) / 60) + ':' + pad(st % 60) + ',' + ms(st) + ' --> ' + pad(en / 3600) + ':' + pad((en % 3600) / 60) + ':' + pad(en % 60) + ',' + ms(en) + '\n' + s.zh + '\n';
  }).join('\n');
}
function toLRC(list){ return list.map(s => '[' + fmtLRC(s.start || 0) + ']' + s.zh).join('\n'); }
function toTXT(list){ return list.map(s => s.zh).join('\n'); }
function toCSV(list){ const q = v => '"' + String(v || '').replace(/"/g, '""') + '"'; return 'Chinese,Pinyin,Vietnamese\n' + list.map(s => [q(s.zh), q(s.pinyin || ''), q(s.vi || '')].join(',')).join('\n'); }

function parseTranscript(raw){
  const lines = raw.split('\n'); const out = [];
  const re = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)/;
  for(const line of lines){
    const t = line.trim(); if(!t) continue;
    if(t.startsWith('→') || t.startsWith('->')){ const vi = t.replace(/^[→\-]+\s*/, '').trim(); if(out.length && !out[out.length - 1].vi) out[out.length - 1].vi = vi; continue; }
    const m = t.match(re);
    if(m){
      const min = parseInt(m[1]), sec = parseInt(m[2]);
      const ms = m[3] ? parseInt(m[3].padEnd(3, '0')) : 0;
      const st = min * 60 + sec + ms / 1000;
      let ct = m[4].trim(), py_ = '';
      const p = ct.indexOf('|'); if(p > 0){ py_ = ct.slice(p + 1).trim(); ct = ct.slice(0, p).trim(); }
      if(!py_) py_ = py(ct);
      out.push({ start: st, end: st + 3.5, zh: ct, pinyin: py_ });
    } else {
      let ct = t, py_ = '';
      const p = ct.indexOf('|'); if(p > 0){ py_ = ct.slice(p + 1).trim(); ct = ct.slice(0, p).trim(); }
      if(!py_) py_ = py(ct);
      const st = out.length * 4;
      out.push({ start: st, end: st + 3.5, zh: ct, pinyin: py_ });
    }
  }
  return out;
}

function applyImport(d){
  if(!d) return;
  if(d.folders) d.folders.forEach(f => { if(!S.folders.includes(f)) S.folders.push(f); });
  if(d.vocab) d.vocab.forEach(v => { if(!S.vocab.some(x => x.zh === v.zh)) S.vocab.push(v); });
  if(d.bookmarks) Object.assign(S.bookmarks, d.bookmarks);
  if(d.progress) Object.assign(S.progress, d.progress);
  if(d.settings) Object.assign(S.settings, d.settings);
  if(d.listeningSec) S.listeningSec = d.listeningSec;
  if(d.transcripts){ Object.entries(d.transcripts).forEach(([n, tr]) => { setTr(n, tr); const t = S.tracks.find(x => x.name === n); if(t) t.transcript = tr; }); }
  save(); renderPlaylist(); renderVocab(); updateStats();
  if(S.cur >= 0) renderTranscript(S.tracks[S.cur].transcript);
  toast('Đã nhập dữ liệu', 'ok');
}

function openCmdPalette(){
  $('cmdModal').classList.add('show');
  $('cmdInput').value = '';
  $('cmdResults').classList.remove('show');
  setTimeout(() => $('cmdInput').focus(), 100);
}

function searchCmd(q){
  const el = $('cmdResults');
  if(!q.trim()){ el.classList.remove('show'); return; }
  const ql = q.toLowerCase();
  const results = [];
  Object.entries(S.dict).forEach(([zh, mean]) => { if(zh.includes(q) || mean.toLowerCase().includes(ql)) results.push({ zh, py: py(zh), mean, type: 'dict' }); });
  S.tracks.forEach((t, i) => { if(t.name.toLowerCase().includes(ql)) results.push({ zh: t.name, py: t.folder, mean: 'Mở bài', type: 'track', idx: i }); });
  if(!results.length){ el.innerHTML = '<div class="cmd-empty">Không tìm thấy</div>'; el.classList.add('show'); return; }
  el.innerHTML = results.slice(0, 20).map(r => '<div class="cmd-item" data-type="' + esc(r.type) + '" data-idx="' + (r.type === 'track' ? r.idx : -1) + '" data-zh="' + esc(r.zh) + '"><div><div class="cz">' + esc(r.zh) + '</div>' + (r.py ? '<div class="cp">' + esc(r.py) + '</div>' : '') + '</div><div class="cm">' + esc(r.mean) + '</div></div>').join('');
  el.classList.add('show');
}

function cmdPick(idx, type, zh){
  if(type === 'track'){ selectTrack(idx); $('cmdModal').classList.remove('show'); return; }
  const v = S.vocab.find(x => x.zh === zh);
  if(!v){ S.vocab.push({ zh, pinyin: py(zh), mean: S.dict[zh] || '', srs: { level: 0, next: Date.now(), wrong: 0 } }); try { localStorage.setItem('dd_v', JSON.stringify(S.vocab)); } catch(e) {} renderVocab(); updateStats(); toast('Đã lưu ' + zh, 'ok'); }
  else toast(zh + ' đã có trong sổ');
  $('cmdModal').classList.remove('show');
}

function applyTheme(){
  document.body.classList.remove('light','force-dark','force-light');
  if(S.settings.theme === 'light') document.body.classList.add('light','force-light');
  else if(S.settings.theme === 'dark') document.body.classList.add('force-dark');
  const btn = $('themeBtn');
  if(btn) btn.innerHTML = (S.settings.theme === 'light') ? '<svg><use href="#i-sun"/></svg>' : '<svg><use href="#i-moon"/></svg>';
}
function applyFontSize(){
  const m = { small:'16px', medium:'19px', large:'22px', xl:'26px' };
  document.querySelectorAll('.szh').forEach(e => e.style.fontSize = m[S.settings.fontSize] || m.medium);
}
function updateStats(){
  $('statTracks').textContent = Object.keys(S.progress).length;
  $('statVocab').textContent = S.vocab.length;
  $('statMins').textContent = Math.floor(S.listeningSec / 60);
  $('vocabBadge').textContent = S.vocab.length;
}

function bind(){
  $('fileInput').onchange = e => handleFiles(e.target.files);
  $('fileSingleInput').onchange = e => handleFiles(e.target.files);
  $('lrcInput').onchange = async e => {
    const f = e.target.files[0]; if(!f || S.cur < 0) return;
    const txt = await f.text();
    const p = parseTranscript(txt);
    S.tracks[S.cur].transcript = p;
    setTr(S.tracks[S.cur].name, p);
    renderTranscript(p); renderPlaylist();
    toast('Đã nạp ' + p.length + ' câu', 'ok');
  };

  $('smartGroupBtn').onclick = () => {
    if(!S.tracks.length){ toast('Chưa có bài','err'); return; }
    let n = 0;
    S.tracks.forEach(t => { const s = parseName(t.name); if(s.folder && s.folder !== t.folder){ t.folder = s.folder; if(!S.folders.includes(s.folder)) S.folders.push(s.folder); n++; } });
    save(); renderPlaylist();
    toast(n ? 'Đã gom ' + n + ' bài' : 'Không cần gom', n ? 'ok' : '');
  };

  $('batchBtn').onclick = startBatchTranscribe;

  $('themeBtn').onclick = () => {
    const o = { auto:'dark', dark:'light', light:'auto' };
    S.settings.theme = o[S.settings.theme] || 'auto';
    save(); applyTheme();
    toast('Giao diện: ' + S.settings.theme);
  };

  $('settingsBtn').onclick = () => $('settingsModal').classList.add('show');
  $('menuBtn').onclick = () => { $('sidebar').classList.toggle('open'); $('backdrop').classList.toggle('show'); };
  $('backdrop').onclick = () => { $('sidebar').classList.remove('open'); $('backdrop').classList.remove('show'); };
  $('focusBtn').onclick = toggleFocus;
  $('statsBtn').onclick = () => { renderStats(); $('statsModal').classList.add('show'); };
  $('statsBar').onclick = () => { renderStats(); $('statsModal').classList.add('show'); };
  $('helpBtn').onclick = () => $('helpModal').classList.add('show');
  $('cmdBtn').onclick = () => openCmdPalette();

  $('clearAllBtn').onclick = async () => {
    if(!S.tracks.length) return;
    if(confirm('Xóa ' + S.tracks.length + ' bài?')){
      S.tracks = []; S.folders = []; S.cur = -1; S.recent = [];
      save();
      try { await DB.clear(); } catch(e) {}
      renderPlaylist(); renderRecent();
      audio.pause(); audio.src = '';
      renderTranscript(null);
      toast('Đã xóa', 'ok');
    }
  };
  $('clearRecentBtn').onclick = () => { S.recent = []; save(); renderRecent(); toast('Đã xóa lịch sử'); };

  let st;
  $('searchInput').oninput = () => { clearTimeout(st); st = setTimeout(renderPlaylist, 200); };

  $('btnPlay').onclick = () => { if(!S.tracks.length){ toast('Chưa có bài','err'); return; } if(S.cur === -1) return selectTrack(0); if(audio.paused) audio.play(); else audio.pause(); };
  $('btnPrev').onclick = () => { if(S.cur > 0) selectTrack(S.cur - 1); };
  $('btnNext').onclick = () => { if(S.cur < S.tracks.length - 1) selectTrack(S.cur + 1); };
  $('btnBack10').onclick = () => { audio.currentTime = Math.max(0, audio.currentTime - 5); };
  $('btnFwd10').onclick = () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); };
  $('speedSelect').onchange = e => { audio.playbackRate = parseFloat(e.target.value); S.settings.speed = e.target.value; save(); };
  $('volumeSlider').oninput = e => { audio.volume = parseFloat(e.target.value); S.settings.volume = e.target.value; save(); };
  $('progressTrack').onclick = e => { if(!audio.duration) return; const r = e.currentTarget.getBoundingClientRect(); audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration; };

  $('btnA').onclick = setA;
  $('btnB').onclick = setB;
  $('btnClearAB').onclick = clearLoop;
  $('btnRepeat').onclick = () => { S.repeatOn = !S.repeatOn; S.curRepeat = 0; $('btnRepeat').classList.toggle('on', S.repeatOn); toast(S.repeatOn ? 'Lặp ' + S.repeatCount + ' lần' : 'Tắt lặp'); };
  $('btnAutoPause').onclick = () => { S.autoPause = !S.autoPause; S.autoPausedFor = -1; $('btnAutoPause').classList.toggle('on', S.autoPause); toast(S.autoPause ? 'Tự dừng mỗi câu' : 'Tắt tự dừng'); };
  $('btnPlaylist').onclick = () => { S.playlistMode = !S.playlistMode; $('btnPlaylist').classList.toggle('on', S.playlistMode); toast(S.playlistMode ? 'Phát cả folder' : 'Tắt playlist'); };

  $('btnShadow').onclick = toggleShadow;
  $('shadowClose').onclick = () => { $('shadowPanel').classList.remove('show'); $('btnShadow').classList.remove('on'); if(S.shadowRec && S.shadowRec.state === 'recording') S.shadowRec.stop(); };
  $('shadowRecBtn').onclick = startRec;
  $('shadowPlayBtn').onclick = playShadow;

  $('btnDictation').onclick = toggleDict;
  $('dictClose').onclick = () => toggleDict();
  $('dictInput').addEventListener('keydown', e => { if(e.key === 'Enter') checkDict(); });
  $('dictReplay').onclick = () => { const tr = S.tracks[S.cur]?.transcript; if(tr && tr[S.dictIdx]){ audio.currentTime = tr[S.dictIdx].start || 0; audio.play(); } };
  $('dictReveal').onclick = () => {
    if(S.dictLocked) return;
    const tr = S.tracks[S.cur]?.transcript;
    if(tr && tr[S.dictIdx]){
      $('dictSentence').innerHTML = '<span class="dwrong">' + esc(tr[S.dictIdx].zh) + '</span>';
      $('dictHint').textContent = 'Đáp án đã hiện — Enter để sang câu';
      S.dictLocked = true;
      setTimeout(() => { S.dictIdx++; S.dictLocked = false; loadDictSentence(); }, 1500);
    }
  };
  $('dictNext').onclick = () => { if(S.dictLocked) return; S.dictIdx++; loadDictSentence(); };

  $('toggleHanBtn').onclick = () => { S.settings.hidden.han = !S.settings.hidden.han; document.querySelectorAll('.szh').forEach(e => e.classList.toggle('hide', S.settings.hidden.han)); $('toggleHanBtn').classList.toggle('on', S.settings.hidden.han); save(); };
  $('togglePinyinBtn').onclick = () => { S.settings.hidden.pinyin = !S.settings.hidden.pinyin; document.querySelectorAll('.spy').forEach(e => e.classList.toggle('hide', S.settings.hidden.pinyin)); $('togglePinyinBtn').classList.toggle('on', S.settings.hidden.pinyin); save(); };
  $('toggleViBtn').onclick = () => { S.settings.hidden.vi = !S.settings.hidden.vi; document.querySelectorAll('.svi').forEach(e => e.classList.toggle('hide', S.settings.hidden.vi)); $('toggleViBtn').classList.toggle('on', S.settings.hidden.vi); save(); };

  $('transcribeBtn').onclick = aiTranscribe;
  $('tpCancelBtn').onclick = cancelTranscribe;

  $('editTranscriptBtn').onclick = () => {
    if(S.cur < 0){ toast('Chọn bài trước','err'); return; }
    const t = S.tracks[S.cur];
    if(t.transcript){ $('transcriptTextarea').value = t.transcript.map(s => s.start !== undefined ? '[' + fmtLRC(s.start) + '] ' + s.zh : s.zh).join('\n'); }
    else $('transcriptTextarea').value = '';
    $('editorModal').classList.add('show');
  };
  $('sampleBtn').onclick = () => { $('transcriptTextarea').value = '[00:01.00] 請問你叫什麼名字？\n[00:04.50] 我叫白如玉。你呢？\n[00:08.00] 我叫李明。很高興認識你。'; };
  $('autoPinyinBtn').onclick = () => { const t = $('transcriptTextarea').value; if(!t.trim()) return; const p = parseTranscript(t); $('transcriptTextarea').value = p.map(s => { const tm = s.start !== undefined ? '[' + fmtLRC(s.start) + '] ' : ''; return tm + s.zh + (s.pinyin ? ' | ' + s.pinyin : ''); }).join('\n'); toast('Đã thêm pinyin', 'ok'); };
  $('autoTranslateBtn').onclick = async () => {
    const t = $('transcriptTextarea').value; if(!t.trim()) return;
    toast('Đang dịch...');
    const p = parseTranscript(t);
    for(const s of p){ s.vi = await translate(s.zh); await new Promise(r => setTimeout(r, 100)); }
    $('transcriptTextarea').value = p.map(s => { const tm = s.start !== undefined ? '[' + fmtLRC(s.start) + '] ' : ''; return tm + s.zh + (s.vi ? '\n  → ' + s.vi : ''); }).join('\n');
    toast('Đã dịch', 'ok');
  };
  $('saveTranscriptBtn').onclick = () => {
    if(S.cur < 0) return;
    const t = $('transcriptTextarea').value; if(!t.trim()){ toast('Rỗng','err'); return; }
    const p = parseTranscript(t);
    S.tracks[S.cur].transcript = p;
    setTr(S.tracks[S.cur].name, p);
    renderTranscript(p); renderPlaylist();
    $('editorModal').classList.remove('show');
    toast('Đã lưu', 'ok');
  };

  $('wpClose').onclick = () => $('wordPopup').classList.remove('show');
  $('wpSpeak').onclick = () => { if(!S.curWord) return; const u = new SpeechSynthesisUtterance(S.curWord); u.lang = 'zh-TW'; u.rate = 0.85; speechSynthesis.speak(u); };
  $('wpSave').onclick = () => {
    const c = S.curWord; if(!c) return;
    const i = S.vocab.findIndex(v => v.zh === c);
    if(i >= 0){ S.vocab.splice(i, 1); toast('Đã xóa'); }
    else { S.vocab.push({ zh: c, pinyin: py(c), mean: S.dict[c] || $('wpMean').textContent, srs: { level: 0, next: Date.now(), wrong: 0 } }); toast('Đã lưu', 'ok'); }
    try { localStorage.setItem('dd_v', JSON.stringify(S.vocab)); } catch(e) {}
    renderVocab(); updateStats();
    if(S.cur >= 0) renderTranscript(S.tracks[S.cur].transcript);
    $('wordPopup').classList.remove('show');
  };

  document.addEventListener('click', e => {
    const p = $('wordPopup');
    if(!p.contains(e.target) && !e.target.closest('.word')) p.classList.remove('show');
    if(!e.target.closest('.ctx-menu')) closeCtx();
    const wEl = e.target.closest('.word');
    if(wEl && wEl.dataset.word){ e.stopPropagation(); lookup(wEl.dataset.word, e); return; }
    const bmBtn = e.target.closest('[data-bm]');
    if(bmBtn){ e.stopPropagation(); toggleBM(parseInt(bmBtn.dataset.bm)); return; }
    const repBtn = e.target.closest('[data-rep]');
    if(repBtn){ e.stopPropagation(); replaySent(parseInt(repBtn.dataset.rep)); return; }
    const cmdEl = e.target.closest('.cmd-item');
    if(cmdEl && cmdEl.dataset.zh){ e.stopPropagation(); cmdPick(parseInt(cmdEl.dataset.idx || -1), cmdEl.dataset.type, cmdEl.dataset.zh); return; }
    const sentEl = e.target.closest('.sent');
    if(sentEl && sentEl.dataset.idx !== undefined) seekSent(parseInt(sentEl.dataset.idx));
  });

  document.addEventListener('contextmenu', e => {
    const sentEl = e.target.closest('.sent');
    if(sentEl && sentEl.dataset.idx !== undefined){ e.preventDefault(); openCtx(e, parseInt(sentEl.dataset.idx)); }
  });

  $('ctxCopy').onclick = ctxCopy;
  $('ctxTranslate').onclick = ctxTranslate;
  $('ctxLoop').onclick = ctxLoop;
  $('ctxAddVocab').onclick = ctxAddVocab;

  $('btnVocab').onclick = () => { renderVocab(); $('vocabModal').classList.add('show'); };

  $('translateSelect').onchange = e => { S.settings.translate = e.target.value; save(); if(e.target.value === 'on' && S.cur >= 0) autoTranslateAll(S.tracks[S.cur].transcript || []); };
  $('autoplaySelect').onchange = e => { S.settings.autoplay = e.target.value; save(); };
  $('themeSelect').onchange = e => { S.settings.theme = e.target.value; save(); applyTheme(); };
  $('fontSizeSelect').onchange = e => { S.settings.fontSize = e.target.value; save(); applyFontSize(); };
  $('chineseFormatSelect').onchange = e => { S.settings.format = e.target.value; save(); };
  $('repeatCountSelect').onchange = e => { S.repeatCount = parseInt(e.target.value); S.settings.repeat = S.repeatCount; save(); };

  $('exportJsonBtn').onclick = () => {
    const d = { version: 8, folders: S.folders, vocab: S.vocab, bookmarks: S.bookmarks, progress: S.progress, settings: S.settings, listeningSec: S.listeningSec, recent: S.recent, transcripts: {} };
    S.tracks.forEach(t => { if(t.transcript) d.transcripts[t.name] = t.transcript; });
    download(JSON.stringify(d, null, 2), 'dd-backup-' + Date.now() + '.json', 'application/json');
    toast('Đã xuất JSON', 'ok');
  };
  $('exportSrtBtn').onclick = () => { if(S.cur < 0 || !S.tracks[S.cur].transcript){ toast('Chưa có lời','err'); return; } $('exportModal').classList.add('show'); };
  $('exportLrcBtn').onclick = () => { if(S.cur < 0 || !S.tracks[S.cur].transcript){ toast('Chưa có lời','err'); return; } $('exportModal').classList.add('show'); };
  $('importInput').onchange = async e => { const f = e.target.files[0]; if(!f) return; try { applyImport(JSON.parse(await f.text())); } catch(err){ toast('File lỗi','err'); } };
  $('expSrtBtn').onclick = () => { const t = S.tracks[S.cur]; download(toSRT(t.transcript), t.name + '.srt'); toast('Đã xuất SRT', 'ok'); $('exportModal').classList.remove('show'); };
  $('expLrcBtn').onclick = () => { const t = S.tracks[S.cur]; download(toLRC(t.transcript), t.name + '.lrc'); toast('Đã xuất LRC', 'ok'); $('exportModal').classList.remove('show'); };
  $('expTxtBtn').onclick = () => { const t = S.tracks[S.cur]; download(toTXT(t.transcript), t.name + '.txt'); toast('Đã xuất TXT', 'ok'); $('exportModal').classList.remove('show'); };
  $('expCsvBtn').onclick = () => { const t = S.tracks[S.cur]; download('\ufeff' + toCSV(t.transcript), t.name + '.csv', 'text/csv;charset=utf-8'); toast('Đã xuất CSV', 'ok'); $('exportModal').classList.remove('show'); };

  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if(e.target === m){ if(m.id === 'tpModal'){ cancelTranscribe(); return; } m.classList.remove('show'); } });
    m.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => m.classList.remove('show')));
  });

  $('transcriptArea').addEventListener('scroll', () => $('wordPopup').classList.remove('show'));
  window.addEventListener('resize', () => $('wordPopup').classList.remove('show'));

  const drop = $('dropOverlay');
  document.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('show'); });
  document.addEventListener('dragleave', e => { if(e.relatedTarget === null) drop.classList.remove('show'); });
  document.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('show'); if(e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); });

  document.addEventListener('keydown', e => {
    const tag = e.target.tagName;
    if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if(e.code === 'Space'){ e.preventDefault(); $('btnPlay').click(); }
    else if(e.code === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
    else if(e.code === 'ArrowRight') audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
    else if(e.key === 'a' || e.key === 'A') setA();
    else if(e.key === 'b' || e.key === 'B') setB();
    else if(e.key === 'c' || e.key === 'C') clearLoop();
    else if(e.key === 'r' || e.key === 'R') $('btnRepeat').click();
    else if(e.key === 'd' || e.key === 'D') $('btnDictation').click();
    else if(e.key === 'f' || e.key === 'F') toggleFocus();
    else if(e.key === '?' || (e.shiftKey && e.key === '/')) $('helpModal').classList.add('show');
    else if((e.metaKey || e.ctrlKey) && e.key === 'k'){ e.preventDefault(); openCmdPalette(); }
    else if(e.key === 'Escape'){ $$('.modal').forEach(m => m.classList.remove('show')); $('wordPopup').classList.remove('show'); closeCtx(); }
  });

  let cmdDebounce;
  $('cmdInput').addEventListener('input', e => { clearTimeout(cmdDebounce); cmdDebounce = setTimeout(() => searchCmd(e.target.value), 100); });
  $('cmdInput').addEventListener('keydown', e => {
    const items = $('cmdResults').querySelectorAll('.cmd-item');
    if(!items.length) return;
    if(e.key === 'Enter'){ e.preventDefault(); items[0].click(); }
    else if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      e.preventDefault();
      const active = $('cmdResults').querySelector('.cmd-item.active');
      let idx = active ? [...items].indexOf(active) : -1;
      idx = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle('active', i === idx));
      items[idx].scrollIntoView({ block: 'nearest' });
    }
  });
}

async function init(){
  load();
  applyTheme();
  S.repeatCount = S.settings.repeat || 3;
  $('speedSelect').value = S.settings.speed || '1';
  $('volumeSlider').value = S.settings.volume || '1';
  audio.playbackRate = parseFloat(S.settings.speed || '1');
  audio.volume = parseFloat(S.settings.volume || '1');
  $('translateSelect').value = S.settings.translate || 'on';
  $('autoplaySelect').value = S.settings.autoplay || 'on';
  $('themeSelect').value = S.settings.theme || 'auto';
  $('fontSizeSelect').value = S.settings.fontSize || 'medium';
  $('chineseFormatSelect').value = S.settings.format || 'traditional';
  $('repeatCountSelect').value = String(S.settings.repeat || 3);
  $('toggleHanBtn').classList.toggle('on', !!S.settings.hidden.han);
  $('togglePinyinBtn').classList.toggle('on', !!S.settings.hidden.pinyin);
  $('toggleViBtn').classList.toggle('on', !!S.settings.hidden.vi);
  bind();
  renderPlaylist();
  renderVocab();
  renderRecent();
  updateStats();
  try { await DB.init(); S.dbReady = true; await loadFromDB(); } catch(e) { console.warn('DB:', e); }
  setTimeout(() => toast('Sẵn sàng! 🎧'), 600);
}

window.toggleF = toggleF;
window.selectTrack = selectTrack;
window.lookup = lookup;
window.seekSent = seekSent;
window.replaySent = replaySent;
window.toggleBM = toggleBM;
window.speakV = speakV;
window.delV = delV;
window.openCtx = openCtx;
window.cmdPick = cmdPick;

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

(function(){
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/pinyin-pro@3.19.6/dist/index.js';
  s.onerror = () => console.warn('Pinyin CDN fallback');
  document.head.appendChild(s);
})();