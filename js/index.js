/* ══ CONFIG ══ */
const SUPA_URL='https://wejbubxrlqyazlodhbua.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlamJ1YnhybHF5YXpsb2RoYnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTU0NDUsImV4cCI6MjA5MTg5MTQ0NX0.fFBvRU7wlRvzigDLtN6ot_9D6GMxL9h4J_mwVaNoBsU';

function sb(p,o={}){return fetch(`${SUPA_URL}/rest/v1/${p}`,{headers:{'apikey':SUPA_KEY,'Authorization':`Bearer ${SUPA_KEY}`,'Content-Type':'application/json','Prefer':'return=representation',...(o.headers||{})},...o});}
async function dbGet(t,q=''){const r=await sb(`${t}?${q}`);if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbIns(t,d){const r=await sb(t,{method:'POST',body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbUpd(t,m,d){const r=await sb(`${t}?${m}`,{method:'PATCH',body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbDel(t,m){const r=await sb(`${t}?${m}`,{method:'DELETE'});if(!r.ok)throw new Error(await r.text());}

function driveToThumbnail(url){
  if(!url)return '';
  const m=url.match(/\/file\/d\/([^/?\s]+)/);
  if(m)return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
  return url;
}

/* poster via Google Drive — no upload needed */

const USER_NAMES=['Andre','Catherine','Daniel','David','Dea','Eliza','Frans','Grace','Gunawan','Lisken','Mutiara','Rut','Selfa','Tomy'];
const DEF_COLORS={koor:'#7c3aed',ibadah:'#c9a227',rapat:'#0891b2',latihan:'#16a34a',reversement:'#db2777',doa:'#4a90d9','event-gabungan':'#059669',bph:'#7c3aed','perayaan-ulang-tahun':'#f59e0b',olahraga:'#10b981',other:'#94a3b8'};
const DEF_LABELS={koor:'Koor',ibadah:'Ibadah / Pelayanan',rapat:'Rapat',latihan:'Latihan',reversement:'Reversement',doa:'Doa','event-gabungan':'Event Gabungan',bph:'BPH',olahraga:'Olahraga','perayaan-ulang-tahun':'Perayaan Ulang Tahun',other:'Lainnya'};
let CATS={...DEF_COLORS},CNAMES={...DEF_LABELS};
function catColor(c){return CATS[c]||'#94a3b8';}
function catLabel(c){return CNAMES[c]||c;}

/* ══ CATEGORY ICONS ══ */
const CAT_ICONS={
  koor:'🎵',ibadah:'🙏',rapat:'📋',latihan:'⚽',
  reversement:'✝️',doa:'🕊️','event-gabungan':'🎉',
  bph:'📌',olahraga:'🏃','perayaan-ulang-tahun':'🎂',other:'📅'
};
function catIcon(c){return CAT_ICONS[c]||'📅';}
const DEFAULT_POSTER='img/default-poster.jpg';


const MS_ID=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const MS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let darkMode=localStorage.getItem('naposo_dark')==='1';
let _lang=localStorage.getItem('naposo_lang')||'id';
let isAdmin=false,EVENTS=[],DOCS=[],ANNOUNCE={};

/* ══ I18N ══ */
const T={
  hdrSub:{id:'Beranda',en:'Home'},
  navKalender:{id:'Kalender',en:'Calendar'},
  navKalenderMob:{id:'Kalender',en:'Calendar'},
  loginBtnTxt:{id:'Login',en:'Login'},
  loginBtnMobileTxt:{id:'Login',en:'Login'},
  ddDocs:{id:'Kelola Dokumen',en:'Manage Documents'},
  ddAnnounce:{id:'Pengumuman',en:'Announcement'},
  ddLogout:{id:'Logout',en:'Logout'},
  darkModeLbl:{id:'Dark Mode',en:'Dark Mode'},
  langModeLbl:{id:'Bahasa',en:'Language'},
  mobDocs:{id:'Kelola Dokumen',en:'Manage Documents'},
  mobAnnounce:{id:'Pengumuman',en:'Announcement'},
  logoutBtnMobTxt:{id:'Logout',en:'Logout'},
  heroTitle:{id:'Naposo HKBP Ujung Menteng',en:'Naposo HKBP Ujung Menteng'},
  heroSub:{id:'Selamat datang Naps! Temukan jadwal kegiatan dan informasi terkini.',en:'Welcome! Find event schedules and the latest information here.'},
  tagIbadah:{id:'Ibadah',en:'Worship'},
  tagKoor:{id:'Koor',en:'Choir'},
  tagPelayanan:{id:'Pelayanan',en:'Ministry'},
  tagKesehatian:{id:'Kesehatian',en:'Fellowship'},
  tagDoa:{id:'Doa',en:'Prayer'},
  secEvents:{id:'Event Terdekat',en:'Upcoming Events'},
  secEventsLink:{id:'Lihat semua →',en:'View all →'},
  secRecap:{id:'Recap Kegiatan',en:'Activity Recap'},
  secDocs:{id:'Dokumen',en:'Documents'},
  secContact:{id:'Hubungi Kami',en:'Contact Us'},
  cpLabel:{id:'Hubungi Contact Person',en:'Contact Person'},
  footerVisitLbl:{id:'kunjungan',en:'visits'},
  loginTitle:{id:'Login Pengurus',en:'Admin Login'},
  lbName:{id:'Nama Pengurus',en:'Admin Name'},
  lbPw:{id:'Password',en:'Password'},
  loginCancelBtn:{id:'Batal',en:'Cancel'},
  loginSubmitBtn:{id:'Masuk',en:'Sign In'},
  editModalTitle:{id:'Ubah Kegiatan',en:'Edit Event'},
  lbEditDate:{id:'Tanggal',en:'Date'},
  lbEditTitle:{id:'Judul Event',en:'Event Title'},
  lbEditTimeStart:{id:'Waktu Mulai',en:'Start Time'},
  lbEditTimeEnd:{id:'Waktu Selesai',en:'End Time'},
  lbEditCat:{id:'Kategori',en:'Category'},
  lbEditExtra:{id:'Tema Acara',en:'Event Theme'},
  lbEditNote:{id:'Catatan (Opsional)',en:'Notes (Optional)'},
  lbEditFeatured:{id:'⭐ Tampilkan di Beranda',en:'⭐ Show on Homepage'},
  lbEditCaption:{id:'Caption (untuk modal poster)',en:'Caption (shown in poster modal)'},
  editCancelBtn:{id:'Batal',en:'Cancel'},
  editSubmitBtn:{id:'Simpan',en:'Save'},
  docsModalTitle:{id:'Kelola Dokumen',en:'Manage Documents'},
  lbDocTitle:{id:'Judul Dokumen',en:'Document Title'},
  lbDocLink:{id:'Link (Google Drive / URL)',en:'Link (Google Drive / URL)'},
  lbDocCat:{id:'Kategori',en:'Category'},
  addDocBtn:{id:'+ Tambah',en:'+ Add'},
  docCloseBtn:{id:'Tutup',en:'Close'},
  announceModalTitle:{id:'Kelola Pengumuman',en:'Manage Announcement'},
  lbAnnTitle:{id:'Judul Pengumuman',en:'Announcement Title'},
  lbAnnSub:{id:'Keterangan Singkat',en:'Short Description'},
  lbAnnLink:{id:'Link Formulir',en:'Form Link'},
  lbAnnCta:{id:'Teks Tombol',en:'Button Text'},
  lbAnnExp:{id:'Berlaku Sampai (opsional)',en:'Valid Until (optional)'},
  lbAnnActive:{id:'Aktifkan Banner',en:'Activate Banner'},
  annCancelBtn:{id:'Batal',en:'Cancel'},
  annSaveBtn:{id:'Simpan',en:'Save'},
  adminBarTxt:{id:'Mode Pengurus Aktif',en:'Admin Mode Active'},
};
function tx(id){return T[id]?T[id][_lang]||T[id].id:'';}
function applyLang(){
  document.documentElement.lang=_lang;
  Object.keys(T).forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=tx(id);});
  const ltm=document.getElementById('langTrackMobile');if(ltm)ltm.classList.toggle('on',_lang==='en');
  const ltb=document.getElementById('langToggleBtn');if(ltb)ltb.textContent=_lang==='id'?'EN':'ID';
  renderEvents();renderRecap();renderDocs();
}
function toggleLang(){_lang=_lang==='id'?'en':'id';localStorage.setItem('naposo_lang',_lang);applyLang();}
function toggleLangMobile(){toggleLang();}

/* ══ DARK MODE ══ */
function applyDark(){
  document.documentElement.setAttribute('data-theme',darkMode?'dark':'light');
  const dtm=document.getElementById('darkTrackMobile');if(dtm)dtm.classList.toggle('on',darkMode);
  const dbt=document.getElementById('darkToggleBtn');if(dbt)dbt.textContent=darkMode?'☀️':'🌙';
}
function toggleDark(){darkMode=!darkMode;localStorage.setItem('naposo_dark',darkMode?'1':'0');applyDark();}
function toggleDarkMobile(){darkMode=!darkMode;localStorage.setItem('naposo_dark',darkMode?'1':'0');applyDark();}

/* ══ HAMBURGER ══ */
function toggleHamburger(){document.getElementById('hdrMenuPanel').classList.toggle('open');}
function closeHamburger(){document.getElementById('hdrMenuPanel').classList.remove('open');}

/* ══ MODALS ══ */
function openModal(id){const el=document.getElementById(id);if(!el)return;el.classList.add('on');document.body.style.overflow='hidden';}
function closeModal(id){const el=document.getElementById(id);if(!el)return;el.classList.remove('on');if(!document.querySelector('.overlay.on'))document.body.style.overflow='';}

/* ══ LOGIN ══ */
function buildLoginDropdown(){
  const sel=document.getElementById('loginName');if(!sel)return;
  sel.innerHTML='<option value="">-- Pilih nama --</option>';
  [...USER_NAMES].sort().forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
}
function handleLoginBtn(){
  if(isAdmin){document.getElementById('adminDd').classList.toggle('open');return;}
  document.getElementById('loginErr').style.display='none';
  document.getElementById('loginPw').value='';
  openModal('loginModal');
}
function handleLoginBtnMobile(){
  closeHamburger();
  if(isAdmin){openDocsModal();return;}
  document.getElementById('loginErr').style.display='none';
  document.getElementById('loginPw').value='';
  openModal('loginModal');
}
async function doLogin(){
  const name=document.getElementById('loginName').value;
  const pw=document.getElementById('loginPw').value;
  const err=document.getElementById('loginErr');
  if(!name||!pw){err.style.display='block';return;}
  const btn=document.getElementById('loginSubmitBtn');
  btn.disabled=true;btn.textContent='...';
  try{
    const res=await fetch(`${SUPA_URL}/functions/v1/verify-login`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPA_KEY}`},
      body:JSON.stringify({username:name,password:pw})
    });
    const data=await res.json();
    if(!data.success){err.style.display='block';btn.disabled=false;btn.textContent=tx('loginSubmitBtn');return;}
    localStorage.setItem('naposo_token',data.token||'1');
    localStorage.setItem('naposo_admin_name',name);
    isAdmin=true;
    closeModal('loginModal');
    _applyAdminUI(name);
    renderEvents();renderDocs();renderDocAdmList();
    showToast('Selamat datang, '+name+'! 👋','ok');
  }catch(e){err.style.display='block';}
  btn.disabled=false;btn.textContent=tx('loginSubmitBtn');
}
function doLogout(){
  isAdmin=false;
  localStorage.removeItem('naposo_token');
  localStorage.removeItem('naposo_admin_name');
  document.getElementById('adminDd').classList.remove('open');
  _resetAuthUI();
  renderEvents();renderDocs();
  showToast('Logout berhasil.');
}
function togglePw(inputId){
  const inp=document.getElementById(inputId);if(!inp)return;
  inp.type=inp.type==='text'?'password':'text';
}

function _applyAdminUI(name){
  document.body.classList.add('is-admin');
  const loginBtn=document.getElementById('loginBtn');
  if(loginBtn){loginBtn.textContent=`✓ ${name}`;loginBtn.disabled=false;}
  const loginBtnMob=document.getElementById('loginBtnMobile');
  if(loginBtnMob)loginBtnMob.style.display='none';
  const amr=document.getElementById('adminMobileRow');if(amr)amr.style.display='flex';
  const ant=document.getElementById('adminMobileNameTxt');if(ant)ant.textContent=name;
  const bar=document.getElementById('adminBar');if(bar)bar.classList.add('on');
  const abt=document.getElementById('adminBarTxt');if(abt)abt.textContent=`Halo, ${name}`;
}
function _resetAuthUI(){
  document.body.classList.remove('is-admin');
  const loginBtn=document.getElementById('loginBtn');
  if(loginBtn){loginBtn.innerHTML=`🔐 <span id="loginBtnTxt">${tx('loginBtnTxt')}</span>`;loginBtn.disabled=false;}
  const loginBtnMob=document.getElementById('loginBtnMobile');if(loginBtnMob)loginBtnMob.style.display='';
  const amr=document.getElementById('adminMobileRow');if(amr)amr.style.display='none';
  const bar=document.getElementById('adminBar');if(bar)bar.classList.remove('on');
}

/* ══ ADMIN DROPDOWN — click outside ══ */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    const po=document.getElementById('posterOverlay');
    if(po&&po.classList.contains('on')){closePosterModalDirect();return;}
  }
});
document.addEventListener('click',e=>{
  const anchor=document.getElementById('adminDdAnchor');
  const dd=document.getElementById('adminDd');
  if(dd&&anchor&&!anchor.contains(e.target))dd.classList.remove('open');
  const panel=document.getElementById('hdrMenuPanel'),btn=document.getElementById('hamburgerBtn');
  if(panel&&btn&&!panel.contains(e.target)&&!btn.contains(e.target))panel.classList.remove('open');
  const waRow=document.querySelector('.contact-wa-row'),cpEx=document.getElementById('cpExpand');
  if(waRow&&cpEx&&!waRow.contains(e.target)&&!cpEx.contains(e.target)){
    cpEx.classList.remove('open');waRow.classList.remove('open');
    const arrow=document.getElementById('waArrow');if(arrow)arrow.textContent='↓';
  }
  const smRow=document.querySelector('.contact-sm-row'),smEx=document.getElementById('smExpand');
  if(smRow&&smEx&&!smRow.contains(e.target)&&!smEx.contains(e.target)){
    smEx.classList.remove('open');smRow.classList.remove('open');
    const smArr=document.getElementById('smArrow');if(smArr)smArr.textContent='↓';
  }
});

/* ══ ANNOUNCE BANNER ══ */
async function loadAnnounce(){
  try{
    const rows=await dbGet('home_announcement','select=*&id=eq.config');
    if(!rows||!rows.length)return;
    const a=rows[0];
    ANNOUNCE=a;
    if(!a.active)return;
    if(a.expiry&&new Date(a.expiry)<new Date())return;
    // Per-device dismiss: use updated_at as version key
    const dismissKey='banner_dismissed_'+( a.updated_at||'');
    if(localStorage.getItem(dismissKey))return;
    _showBanner(a);
  }catch(e){}
}
function _showBanner(a){
  const el=document.getElementById('announceBanner');if(!el)return;
  document.getElementById('announceTitleDisp').textContent=a.title||'';
  document.getElementById('announceSubDisp').textContent=a.sub||'';
  const cta=document.getElementById('announceCtaBtn');
  if(cta){cta.href=a.link||'#';cta.textContent=a.cta||'Daftar Sekarang →';}
  el.classList.add('on');
}
async function saveAnnounce(){
  const a={
    title:document.getElementById('annTitle').value.trim(),
    sub:document.getElementById('annSub').value.trim(),
    link:document.getElementById('annLink').value.trim(),
    cta:document.getElementById('annCta').value.trim()||'Daftar Sekarang →',
    expiry:document.getElementById('annExpiry').value||'',
    active:document.getElementById('annActive').checked,
    updated_at:new Date().toISOString(),
  };
  try{
    // upsert — row 'config' always exists after SQL setup
    await dbUpd('home_announcement','id=eq.config',a);
    ANNOUNCE=a;
    const el=document.getElementById('announceBanner');
    if(a.active){
      _showBanner(a);
      // clear all dismiss keys so banner shows again on all devices
    }else{
      el.classList.remove('on');
    }
    closeModal('announceModal');
    showToast('Pengumuman disimpan ✓','ok');
  }catch(e){showToast('Gagal simpan: '+e.message,'err');}
}
function closeBanner(){
  document.getElementById('announceBanner').classList.remove('on');
  // Dismiss keyed to this version — different version = banner shows again
  const key='banner_dismissed_'+(ANNOUNCE.updated_at||'');
  localStorage.setItem(key,'1');
}
function openAnnounceModal(){
  const a=ANNOUNCE||{};
  document.getElementById('annTitle').value=a.title||'';
  document.getElementById('annSub').value=a.sub||'';
  document.getElementById('annLink').value=a.link||'';
  document.getElementById('annCta').value=a.cta||'';
  document.getElementById('annExpiry').value=a.expiry||'';
  document.getElementById('annActive').checked=!!a.active;
  closeHamburger();
  document.getElementById('adminDd').classList.remove('open');
  openModal('announceModal');
}

/* ══ CONTACT ══ */

/* ══ SOCIAL MEDIA ══ */
function toggleSocialMedia(){
  const row=document.querySelector('.contact-sm-row');
  const expand=document.getElementById('smExpand');
  const isOpen=expand.classList.toggle('open');
  if(row)row.classList.toggle('open',isOpen);
  const arrow=document.getElementById('smArrow');if(arrow)arrow.textContent=isOpen?'↑':'↓';
}

function toggleWaPopup(){
  const row=document.querySelector('.contact-wa-row');
  const expand=document.getElementById('cpExpand');
  const isOpen=expand.classList.toggle('open');
  row.classList.toggle('open',isOpen);
  const arrow=document.getElementById('waArrow');if(arrow)arrow.textContent=isOpen?'↑':'↓';
}

/* ══ EVENTS ══ */
function getDisplayEvents(){
  const today=new Date();today.setHours(0,0,0,0);
  const todayStr=today.toISOString().slice(0,10);
  const featuredIds=new Set(EVENTS.filter(e=>e.featured).map(e=>e.id));
  const featured=EVENTS.filter(e=>e.featured).sort((a,b)=>a.date.localeCompare(b.date));
  const upcoming=EVENTS.filter(e=>e.date>=todayStr&&!featuredIds.has(e.id)).sort((a,b)=>a.date.localeCompare(b.date));
  return [...featured,...upcoming].slice(0,6);
}
function linkifyNote(text){
  if(!text)return '';
  return text.replace(/(https?:\/\/[^\s]+)/g,url=>`<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}
function renderEvents(){
  const grid=document.getElementById('eventsGrid');if(!grid)return;
  const evs=getDisplayEvents();
  const MS=_lang==='en'?MS_EN:MS_ID;
  if(!evs.length){grid.innerHTML=`<div class="ev-empty">${_lang==='en'?'No upcoming events.':'Belum ada kegiatan dalam waktu dekat.'}</div>`;return;}
  const todayStr=new Date().toISOString().slice(0,10);
  const nowHHMM=new Date().toTimeString().slice(0,5);
  grid.innerHTML=evs.map(ev=>{
    const d=new Date(ev.date+'T00:00:00');
    const col=catColor(ev.category);
    const isPast=ev.date<todayStr;
    const sameDay=ev.date===todayStr;
    const endTime=ev.time_end||(ev.time?ev.time.split(/[–\-]/).pop().trim():'');
    const isFinished=isPast||(sameDay&&!!endTime&&endTime<=nowHHMM);
    const note=ev.note||'';
    const noteHtml=linkifyNote(note);
    const hasPoster=!!(ev.poster_url);
    const posterSrc=hasPoster?driveToThumbnail(ev.poster_url):DEFAULT_POSTER;

    // build time string
    let timeStr='';
    if(ev.time_start&&ev.time_end)timeStr=`${ev.time_start}–${ev.time_end}`;
    else if(ev.time)timeStr=ev.time;

    // extra fields
    let extraParts=[];
    if(ev.extra){
      if(ev.extra.judul_lagu)extraParts.push('🎵 '+ev.extra.judul_lagu);
      if(ev.extra.tema_acara)extraParts.push('📖 '+ev.extra.tema_acara);
      if(ev.extra.jenis_olahraga)extraParts.push('⚽ '+ev.extra.jenis_olahraga);
    }

    // date compact
    const dayNum=d.getDate();
    const monStr=MS[d.getMonth()];
    const yrStr=d.getFullYear();

    // image area
    const imgWrap=`<div class="ev-card-img-wrap" onclick="openPosterModal('${ev.id}')"
      style="background-image:url('${posterSrc}');background-size:cover;background-position:center;background-color:${col}22;"
      onerror="">
      <div class="ev-card-poster-ph" style="display:none;background:linear-gradient(135deg,${col}22,${col}44)">
        <div class="ev-card-poster-ph-icon">${catIcon(ev.category)}</div>
        <div class="ev-card-poster-ph-label">${catLabel(ev.category)}</div>
      </div>
      <div class="ev-card-img-overlay">🔍 Lihat Poster</div>
    </div>`;

    return `<div class="ev-card${isFinished?' ev-card-past':''}">
      ${imgWrap}
      <div class="ev-card-accent" style="background:${col}"></div>
      <div class="ev-card-body">
        <div class="ev-card-top">
          <div class="ev-card-date">
            <span class="day">${dayNum}</span>
            <span class="sep">·</span>
            <span class="mon">${monStr}</span>
            <span class="sep">·</span>
            <span class="yr">${yrStr}</span>
          </div>
          <div class="ev-card-admin">
            <button class="ev-card-edit-btn" onclick="openEditEvent('${ev.id}');event.stopPropagation()">✎ Ubah</button>
            <button class="ev-card-unfeature-btn" onclick="toggleFeatured('${ev.id}',${!!ev.featured});event.stopPropagation()">${ev.featured?'★':'☆'}</button>
          </div>
        </div>
        <div class="ev-card-title">${ev.title}</div>
        <div class="ev-card-meta">
          <span class="ev-cat-badge" style="background:${col}">${catLabel(ev.category)}</span>
          ${timeStr?`<span class="ev-card-time">⏰ ${timeStr}</span>`:''}
          ${isFinished?`<span style="display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(220,38,38,.1);color:var(--red);border:1px solid rgba(220,38,38,.2)">${_lang==='en'?'✓ Finished':'✓ Sudah Selesai'}</span>`:''}
        </div>
        ${extraParts.length?`<div style="font-size:11px;color:var(--text3)">${extraParts.join(' · ')}</div>`:''}
        ${note?`<div class="ev-card-note">${note.replace(/<[^>]+>/g,'').slice(0,120)}${note.length>120?'…':''}</div>`:''}
      </div>
    </div>`;
  }).join('');
}


/* ══ POSTER MODAL ══ */
function openPosterModal(evId){
  const ev=EVENTS.find(e=>e.id===evId);if(!ev)return;
  const MS=_lang==='en'?MS_EN:MS_ID;
  const d=new Date(ev.date+'T00:00:00');
  const col=catColor(ev.category);
  const posterSrc=ev.poster_url?driveToThumbnail(ev.poster_url):DEFAULT_POSTER;
  const img=document.getElementById('pmImg');
  if(img){img.src=posterSrc;img.onerror=()=>{img.src=DEFAULT_POSTER;};}
  const title=document.getElementById('pmTitle');
  if(title)title.textContent=ev.title;
  const dateEl=document.getElementById('pmDate');
  if(dateEl){
    let timeStr='';
    if(ev.time_start&&ev.time_end)timeStr=` · ${ev.time_start}–${ev.time_end}`;
    else if(ev.time)timeStr=` · ${ev.time}`;
    dateEl.innerHTML=`📅 ${d.getDate()} ${MS[d.getMonth()]} ${d.getFullYear()}${timeStr}`;
  }
  const meta=document.getElementById('pmMeta');
  if(meta)meta.innerHTML=`<span class="ev-cat-badge" style="background:${col};font-size:11px;padding:3px 10px">${catLabel(ev.category)}</span>`;
  const capEl=document.getElementById('pmCaption');
  if(capEl){
    const cap=ev.caption||ev.note||'';
    if(cap){capEl.textContent=cap;capEl.style.display='block';}
    else capEl.style.display='none';
  }
  const actEl=document.getElementById('pmActions');
  if(actEl){
    let btns='';
    const urlMatch=(ev.note||'').match(/(https?:\/\/[^\s]+)/);
    if(urlMatch)btns+=`<a class="btn btn-primary btn-sm" href="${urlMatch[1]}" target="_blank" rel="noopener">🔗 Buka Link</a>`;
    if(isAdmin)btns+=`<button class="btn btn-ghost btn-sm" onclick="closePosterModalDirect();openEditEvent('${ev.id}')">✎ Ubah</button>`;
    actEl.innerHTML=btns;
  }
  document.getElementById('posterOverlay').classList.add('on');
  document.body.style.overflow='hidden';
}
function closePosterModal(e){
  if(e&&e.target!==document.getElementById('posterOverlay'))return;
  closePosterModalDirect();
}
function closePosterModalDirect(){
  document.getElementById('posterOverlay').classList.remove('on');
  document.body.style.overflow='';
}

async function toggleFeatured(id,currentlyFeatured){
  try{
    await dbUpd('events',`id=eq.${id}`,{featured:!currentlyFeatured});
    const ev=EVENTS.find(e=>e.id===id);if(ev)ev.featured=!currentlyFeatured;
    renderEvents();
    showToast(currentlyFeatured?'Dihapus dari beranda.':'Ditambahkan ke beranda. ⭐','ok');
  }catch(e){showToast('Gagal: '+e.message,'err');}
}

/* ══ UBAH KEGIATAN ══ */
function buildCatDropdown(){
  const sel=document.getElementById('editCat');if(!sel)return;
  sel.innerHTML='';
  Object.keys(CATS).forEach(k=>{
    const o=document.createElement('option');o.value=k;o.textContent=catLabel(k);sel.appendChild(o);
  });
}
function openEditEvent(id){
  const ev=EVENTS.find(e=>e.id===id);if(!ev)return;
  buildCatDropdown();
  document.getElementById('editEventId').value=id;
  document.getElementById('editTitle').value=ev.title||'';
  document.getElementById('editDate').value=ev.date||'';
  // time
  if(ev.time_start){document.getElementById('editTimeStart').value=ev.time_start;}
  else if(ev.time){const parts=ev.time.split(/[–\-]/);document.getElementById('editTimeStart').value=(parts[0]||'').trim();}
  else document.getElementById('editTimeStart').value='';
  if(ev.time_end){document.getElementById('editTimeEnd').value=ev.time_end;}
  else if(ev.time){const parts=ev.time.split(/[–\-]/);document.getElementById('editTimeEnd').value=(parts[1]||'').trim();}
  else document.getElementById('editTimeEnd').value='';
  document.getElementById('editCat').value=ev.category||'other';
  document.getElementById('editExtra').value=(ev.extra&&ev.extra.tema_acara)||'';
  document.getElementById('editNote').value=ev.note||'';
  document.getElementById('editFeatured').checked=!!ev.featured;
  const capFld=document.getElementById('editCaption');if(capFld)capFld.value=ev.caption||'';
  document.getElementById('adminDd').classList.remove('open');
  openModal('editEventModal');
}
async function saveEditEvent(){
  const id=document.getElementById('editEventId').value;
  const title=document.getElementById('editTitle').value.trim();
  const date=document.getElementById('editDate').value;
  const timeStart=document.getElementById('editTimeStart').value;
  const timeEnd=document.getElementById('editTimeEnd').value;
  const category=document.getElementById('editCat').value;
  const extraVal=document.getElementById('editExtra').value.trim();
  const note=document.getElementById('editNote').value.trim();
  const featured=document.getElementById('editFeatured').checked;
  if(!title||!date){showToast('Judul dan tanggal wajib diisi.','err');return;}
  const btn=document.getElementById('editSubmitBtn');
  btn.disabled=true;btn.textContent='...';
  let timeStr='';
  if(timeStart&&timeEnd)timeStr=`${timeStart}–${timeEnd}`;
  else if(timeStart)timeStr=timeStart;
  const extra=extraVal?{tema_acara:extraVal}:null;
  try{
    const caption=document.getElementById('editCaption')?.value.trim()||'';
    await dbUpd('events',`id=eq.${id}`,{title,date,time:timeStr,time_start:timeStart||null,time_end:timeEnd||null,category,extra,note,featured,caption});
    const ev=EVENTS.find(e=>e.id===id);
    if(ev){Object.assign(ev,{title,date,time:timeStr,time_start:timeStart,time_end:timeEnd,category,extra,note,featured,caption});}
    closeModal('editEventModal');
    renderEvents();
    showToast('Tersimpan ✓','ok');
  }catch(e){showToast('Gagal: '+e.message,'err');}
  btn.disabled=false;btn.textContent=tx('editSubmitBtn');
}

/* ══ RECAP CAROUSEL ══ */
const RECAP=[
  {category:'event-gabungan',title:'Bonataon RN',meta:'28 Feb 2026',bgColor:'#059669'},
  {category:'event-gabungan',title:'Paskah RN',meta:'4 Apr 2026',bgColor:'#c9a227'},
  {category:'ibadah',title:'Ibadah Naposo Pertama',meta:'28 Feb 2026',bgColor:'#2563be'},
];
function renderRecap(){
  const el=document.getElementById('recapCarousel');if(!el)return;
  el.innerHTML=RECAP.map(r=>`
    <div class="recap-card" onclick="window.location='kalender.html'">
      <div class="recap-overlay" style="background:${r.bgColor}"></div>
      <div class="recap-gradient"></div>
      <div class="recap-content">
        <span class="recap-tag">• ${catLabel(r.category).toUpperCase()}</span>
        <div class="recap-title">${r.title}</div>
        <div class="recap-meta">${r.meta}</div>
      </div>
    </div>`).join('');
}
function recapScroll(dir){
  const el=document.getElementById('recapCarousel');if(!el)return;
  const card=el.querySelector('.recap-card');
  if(!card)return;
  el.scrollBy({left:dir*(card.offsetWidth+14),behavior:'smooth'});
}

/* ══ DOCS ══ */
function toEmbedUrl(url){
  const m=url.match(/\/file\/d\/([^/?\s]+)/);
  if(m)return `https://drive.google.com/file/d/${m[1]}/preview`;
  return url;
}
function renderDocs(){
  const grid=document.getElementById('docGrid');if(!grid)return;grid.innerHTML='';
  const visible=DOCS.filter(d=>d.category==='publik'||(isAdmin&&d.category==='pengurus'));
  if(!visible.length){grid.innerHTML=`<p class="doc-empty">${_lang==='en'?'No documents yet.':'Belum ada dokumen.'}</p>`;return;}
  visible.forEach(doc=>{
    const card=document.createElement('div');card.className='doc-card';
    card.innerHTML=`
      <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
      <div class="doc-info">
        <div class="doc-title">${doc.title}</div>
        <div class="doc-meta">${doc.category==='pengurus'?'🔒 Pengurus':'📂 Publik'}</div>
      </div>
      <svg viewBox="0 0 16 16" fill="currentColor" width="10" style="color:var(--text3);flex-shrink:0"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>`;
    card.onclick=()=>openDocViewer(doc);
    grid.appendChild(card);
  });
}
function openDocViewer(doc){
  document.getElementById('docModalTitle').textContent=doc.title;
  document.getElementById('docFrame').src=toEmbedUrl(doc.link);
  openModal('docOverlay');
}
function closeDoc(){closeModal('docOverlay');document.getElementById('docFrame').src='';}
function renderDocAdmList(){
  const list=document.getElementById('docAdmList');if(!list)return;list.innerHTML='';
  if(!DOCS.length){list.innerHTML='<p class="doc-empty" style="margin-top:8px">Belum ada dokumen.</p>';return;}
  DOCS.forEach(doc=>{
    const item=document.createElement('div');item.className='doc-adm-item';
    item.innerHTML=`<div class="doc-adm-info"><div class="doc-adm-title">${doc.title}</div><div class="doc-adm-meta">${doc.category==='pengurus'?'🔒':'📂'} ${doc.category}</div></div><button class="doc-del" onclick="deleteDoc('${doc.id}')">×</button>`;
    list.appendChild(item);
  });
}
function openDocsModal(){
  document.getElementById('adminDd').classList.remove('open');
  renderDocAdmList();
  openModal('docsModal');
}
async function addDoc(){
  const title=document.getElementById('docTitle').value.trim();
  const link=document.getElementById('docLink').value.trim();
  const category=document.getElementById('docCat').value;
  if(!title||!link){showToast('Nama dan link harus diisi!','err');return;}
  try{
    const ins=await dbIns('home_docs',{id:'doc_'+Date.now(),title,link,category});
    DOCS.push(Array.isArray(ins)?ins[0]:ins);
    renderDocs();renderDocAdmList();
    document.getElementById('docTitle').value='';
    document.getElementById('docLink').value='';
    showToast('Dokumen ditambahkan ✓','ok');
  }catch(e){showToast('Gagal: '+e.message,'err');}
}
async function deleteDoc(id){
  if(!confirm('Hapus dokumen ini?'))return;
  try{
    await dbDel('home_docs',`id=eq.${id}`);
    DOCS=DOCS.filter(d=>d.id!==id);
    renderDocs();renderDocAdmList();
    showToast('Dokumen dihapus.');
  }catch(e){showToast('Gagal: '+e.message,'err');}
}

/* ══ VISIT COUNTER ══ */
async function trackVisit(){
  try{
    let sid=sessionStorage.getItem('naposo_sid');
    if(!sid){
      sid='s_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      sessionStorage.setItem('naposo_sid',sid);
      await dbIns('visits',{session_id:sid});
    }
    const rows=await dbGet('visits','select=id');
    const el=document.getElementById('footerVisits');if(el)el.textContent=rows.length;
  }catch(e){}
}

/* ══ TOAST ══ */
let _tt;
function showToast(msg,type=''){
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=msg;
  el.className=`toast on${type==='ok'?' ok':type==='err'?' err':''}`;
  clearTimeout(_tt);_tt=setTimeout(()=>el.classList.remove('on'),3000);
}

/* ══ INIT ══ */
async function init(){
  applyDark();applyLang();
  buildLoginDropdown();
  const fy=document.getElementById('fyear');if(fy)fy.textContent=new Date().getFullYear();
  // overlays close on bg click
  ['loginModal','editEventModal','docsModal','announceModal','docOverlay'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.addEventListener('click',e=>{if(e.target===el){if(id==='docOverlay')closeDoc();else closeModal(id);}});
  });
  // restore session
  const savedToken=localStorage.getItem('naposo_token');
  const savedName=localStorage.getItem('naposo_admin_name');
  if(savedToken&&savedName){isAdmin=true;_applyAdminUI(savedName);}
  await loadAnnounce();
  trackVisit();
  // load data
  try{
    try{
      const cats=await dbGet('categories','select=*&order=sort_order.asc');
      if(cats&&cats.length){const co={},ni={};cats.forEach(c=>{co[c.id]=c.color;ni[c.id]=c.label_id||c.label||c.id;});Object.assign(CATS,co);Object.assign(CNAMES,ni);}
    }catch(e){}
    EVENTS=await dbGet('events','select=*&order=date.asc');
    window.EVENTS=EVENTS;
    try{DOCS=await dbGet('home_docs','select=*&order=created_at.asc');}catch(e){DOCS=[];}
    renderEvents();renderRecap();renderDocs();
    if(isAdmin)renderDocAdmList();
  }catch(e){
    const g=document.getElementById('eventsGrid');
    if(g)g.innerHTML=`<div class="ev-empty">Gagal memuat data.</div>`;
  }
}
init();
