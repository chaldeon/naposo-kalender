/* ══ CONFIG ══ */
const SUPA_URL='https://wejbubxrlqyazlodhbua.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlamJ1YnhybHF5YXpsb2RoYnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTU0NDUsImV4cCI6MjA5MTg5MTQ0NX0.fFBvRU7wlRvzigDLtN6ot_9D6GMxL9h4J_mwVaNoBsU';
const USER_NAMES=['Andre','Catherine','Daniel','David','Dea','Eliza','Frans','Grace','Gunawan','Lisken','Mutiara','Rut','Selfa','Tomy'];

function driveToThumbnail(url){
  if(!url)return '';
  const m=url.match(/\/file\/d\/([^/?\\s]+)/);
  if(m)return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
  return url;
}

/* ── Item 1 (XSS guard) — escapeHTML ── */
function escapeHTML(str){
  if(!str)return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ══ SUPABASE HELPER ══ */
async function sb(path,opts={}){
  const res=await fetch(`${SUPA_URL}/rest/v1/${path}`,{
    headers:{
      'apikey':SUPA_KEY,
      'Authorization':`Bearer ${SUPA_KEY}`,
      'Content-Type':'application/json',
      'Prefer':opts.prefer||'',
      ...(opts.headers||{})
    },
    method:opts.method||'GET',
    body:opts.body!=null?JSON.stringify(opts.body):undefined
  });
  if(!res.ok){const t=await res.text();throw new Error(t);}
  const ct=res.headers.get('content-type')||'';
  if(ct.includes('json')&&res.status!==204)return res.json();
  return null;
}

/* ══ I18N ══ */
let _lang=localStorage.getItem('naposo_lang')||'id';
const T={
  navHome:{id:'Home',en:'Home'},
  navHomeMob:{id:'Home',en:'Home'},
  navKalender:{id:'Kalender',en:'Calendar'},
  navKalenderMob:{id:'Kalender',en:'Calendar'},
  navRev:{id:'Reversement',en:'Reversement'},
  loginBtnTxt:{id:'Login',en:'Login'},
  loginBtnMobileTxt:{id:'Login',en:'Login'},
  loginTitle:{id:'Login Pengurus',en:'Admin Login'},
  lbName:{id:'Nama Pengurus',en:'Admin Name'},
  lbPw:{id:'Password',en:'Password'},
  loginCancelBtn:{id:'Batal',en:'Cancel'},
  loginSubmitBtn:{id:'Masuk',en:'Sign In'},
  logoutBtnMobTxt:{id:'Logout',en:'Logout'},
  ddLogout:{id:'Logout',en:'Logout'},
  darkModeLbl:{id:'Dark Mode',en:'Dark Mode'},
  langModeLbl:{id:'Bahasa',en:'Language'},
  revHeroEyebrow:{id:'Renungan Mingguan',en:'Weekly Devotion'},
  revHeroSub:{id:'Ayat dan renungan untuk memulai harimu bersama Naposo · Senin & Jumat',en:'Scripture and reflections to start your day with Naposo · Monday & Friday'},
  filterAll:{id:'Semua',en:'All'},
  filterSenin:{id:'🌅 Senin',en:'🌅 Monday'},
  filterJumat:{id:'🌿 Jumat',en:'🌿 Friday'},
  welcome:{id:'Selamat datang',en:'Welcome'},
  modeActive:{id:'Mode pengurus aktif.',en:'Admin mode active.'},
  addPost:{id:'+ Tambah Post',en:'+ Add Post'},
  adminFormTitle:{id:'Tambah Post Reversement',en:'Add Reversement Post'},
  adminFormEditTitle:{id:'Edit Post Reversement',en:'Edit Reversement Post'},
  fldTitle:{id:'Judul',en:'Title'},
  fldSeries:{id:'Nama Seri',en:'Series Name'},
  fldDayType:{id:'Hari',en:'Day'},
  fldDate:{id:'Tanggal',en:'Date'},
  fldVerseRef:{id:'Referensi Ayat',en:'Verse Reference'},
  fldPosterUrl:{id:'Link Poster Google Drive',en:'Google Drive Poster Link'},
  fldBody:{id:'Redaksi',en:'Body Text'},
  fldPublished:{id:'Tampilkan (Published)',en:'Publish'},
  btnSave:{id:'Simpan',en:'Save'},
  btnCancel:{id:'Batal',en:'Cancel'},
  btnDelete:{id:'Hapus Post',en:'Delete Post'},
  btnEdit:{id:'Edit',en:'Edit'},
  confirmDelete:{id:'Yakin hapus post ini?',en:'Delete this post?'},
  saving:{id:'Menyimpan…',en:'Saving…'},
  deleting:{id:'Menghapus…',en:'Deleting…'},
  saveOk:{id:'Post berhasil disimpan!',en:'Post saved!'},
  delOk:{id:'Post berhasil dihapus.',en:'Post deleted.'},
  errSave:{id:'Gagal menyimpan post.',en:'Failed to save post.'},
  errDel:{id:'Gagal menghapus post.',en:'Failed to delete post.'},
  errLoad:{id:'Gagal memuat konten.',en:'Failed to load content.'},
  footerVisitLbl:{id:'kunjungan',en:'visits'},
  feedbackFabTxt:{id:'Beri Saran',en:'Give Feedback'},
};
function tx(id){return T[id]?T[id][_lang]||T[id].id:'';}
function applyLang(){
  document.documentElement.lang=_lang;
  Object.keys(T).forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=tx(id);});
  const ltm=document.getElementById('langTrackMobile');if(ltm)ltm.classList.toggle('on',_lang==='en');
  const blt=document.getElementById('bnLangTrack');if(blt)blt.classList.toggle('on',_lang==='en');
  const ltb=document.getElementById('langToggleBtn');if(ltb)ltb.textContent=_lang==='id'?'EN':'ID';
  if(isAdmin&&_adminName){
    const abt=document.getElementById('adminBarTxt');
    if(abt)abt.textContent=(_lang==='en'?'Hello, ':'Halo, ')+_adminName+'.';
  }
  renderGrid();
}
function toggleLang(){_lang=_lang==='id'?'en':'id';localStorage.setItem('naposo_lang',_lang);applyLang();}
function toggleLangMobile(){toggleLang();}

/* ══ DARK MODE ══ */
let darkMode=localStorage.getItem('naposo_dark')==='1';
function applyDark(){
  document.documentElement.setAttribute('data-theme',darkMode?'dark':'light');
  const dtm=document.getElementById('darkTrackMobile');if(dtm)dtm.classList.toggle('on',darkMode);
  const dbt=document.getElementById('darkToggleBtn');if(dbt)dbt.textContent=darkMode?'☀️':'🌙';
  const bdt=document.getElementById('bnDarkTrack');if(bdt)bdt.classList.toggle('on',darkMode);
}
function toggleDark(){darkMode=!darkMode;localStorage.setItem('naposo_dark',darkMode?'1':'0');applyDark();}
function toggleDarkMobile(){darkMode=!darkMode;localStorage.setItem('naposo_dark',darkMode?'1':'0');applyDark();}

/* ══ HAMBURGER ══ */
function toggleHamburger(){document.getElementById('hdrMenuPanel').classList.toggle('open');}
function closeHamburger(){document.getElementById('hdrMenuPanel').classList.remove('open');}
document.addEventListener('click',e=>{
  const panel=document.getElementById('hdrMenuPanel'),btn=document.getElementById('hamburgerBtn');
  if(panel&&btn&&!panel.contains(e.target)&&!btn.contains(e.target))panel.classList.remove('open');
});

/* ══ MODAL HELPER ══ */
/* ── Item A11Y: Focus Trap ── */
const FOCUSABLE_SEL='button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';
let _trapEl=null,_trapHandler=null;
function _attachFocusTrap(el){
  _detachFocusTrap();
  const nodes=[...el.querySelectorAll(FOCUSABLE_SEL)].filter(n=>!n.closest('[hidden]')&&n.offsetParent!==null);
  if(!nodes.length)return;
  const first=nodes[0],last=nodes[nodes.length-1];
  setTimeout(()=>first.focus(),50);
  _trapEl=el;
  _trapHandler=e=>{
    if(e.key!=='Tab')return;
    if(e.shiftKey){if(document.activeElement===first){e.preventDefault();last.focus();}}
    else{if(document.activeElement===last){e.preventDefault();first.focus();}}
  };
  el.addEventListener('keydown',_trapHandler);
}
function _detachFocusTrap(){
  if(_trapEl&&_trapHandler){_trapEl.removeEventListener('keydown',_trapHandler);}
  _trapEl=null;_trapHandler=null;
}
function closeModal(id){const el=document.getElementById(id);if(el){el.classList.remove('on');_detachFocusTrap();}}
function openModal(id){const el=document.getElementById(id);if(el){el.classList.add('on');_attachFocusTrap(el);}}
function togglePw(inputId,btn){
  const inp=document.getElementById(inputId);if(!inp)return;
  inp.type=inp.type==='password'?'text':'password';
}

/* ══ Item 3: Custom Confirm Modal ══ */
let _confirmCallback=null;
function showConfirmModal(msg,onConfirm,okLabel){
  const overlay=document.getElementById('confirmModalOverlay');
  const msgEl=document.getElementById('confirmModalMsg');
  const okBtn=document.getElementById('confirmOkBtn');
  const cancelBtn=document.getElementById('confirmCancelBtn');
  if(msgEl)msgEl.textContent=msg;  // textContent = auto XSS-safe
  const okTxt=okLabel||(_lang==='en'?'Delete':'Hapus');
  if(okBtn)okBtn.textContent=okTxt;
  if(cancelBtn)cancelBtn.textContent=_lang==='en'?'Cancel':'Batal';
  _confirmCallback=onConfirm;
  if(okBtn)okBtn.onclick=()=>{closeConfirmModal();if(_confirmCallback)_confirmCallback();};
  if(overlay){overlay.style.display='flex';}
}
function closeConfirmModal(){
  const overlay=document.getElementById('confirmModalOverlay');
  if(overlay)overlay.style.display='none';
  _confirmCallback=null;
}

/* ══ LOGIN MODAL ══ */
let isAdmin=false;
function openLoginModal(){
  document.getElementById('loginErr').style.display='none';
  document.getElementById('loginPw').value='';
  buildLoginDropdown();
  openModal('loginModal');
}
function closeLoginModal(){closeModal('loginModal');}
function handleLoginBtn(){
  if(isAdmin){document.getElementById('adminDd').classList.toggle('open');return;}
  openLoginModal();
}
function handleLoginBtnMobile(){
  closeHamburger();
  if(isAdmin)return;
  openLoginModal();
}
function buildLoginDropdown(){
  const sel=document.getElementById('loginName');if(!sel)return;
  sel.innerHTML='<option value="">-- Pilih nama --</option>';
  [...USER_NAMES].sort().forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
}
async function doLogin(){
  const name=document.getElementById('loginName').value;
  const pw=document.getElementById('loginPw').value;
  const err=document.getElementById('loginErr');
  err.style.display='none';
  if(!name||!pw){err.textContent='Nama dan password wajib diisi.';err.style.display='block';return;}
  const btn=document.getElementById('loginSubmitBtn');
  btn.disabled=true;btn.textContent='...';
  try{
    const res=await fetch(`${SUPA_URL}/functions/v1/verify-login`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPA_KEY}`},
      body:JSON.stringify({username:name,password:pw})
    });
    const data=await res.json();
    if(!data.success){
      err.textContent='Password salah atau nama tidak dipilih.';
      err.style.display='block';
      btn.disabled=false;btn.textContent=tx('loginSubmitBtn');return;
    }
    localStorage.setItem('naposo_token',data.token||'1');
    localStorage.setItem('naposo_admin_name',name);
    isAdmin=true;
    closeModal('loginModal');
    _applyAdminUI(name);
    showToast(`${tx('welcome')}, ${name}! ${tx('modeActive')}`,'ok');
    await loadPosts();
  }catch(e){err.textContent='Gagal login.';err.style.display='block';}
  btn.disabled=false;btn.textContent=tx('loginSubmitBtn');
}
function doLogout(){
  isAdmin=false;
  localStorage.removeItem('naposo_token');
  localStorage.removeItem('naposo_admin_name');
  _resetAuthUI();
  showToast('Logout berhasil.');
  loadPosts();
}
let _adminName='';
function _applyAdminUI(name){
  _adminName=name;
  document.body.classList.add('is-admin');
  const btn=document.getElementById('loginBtn');
  if(btn){btn.textContent=`✓ ${name}`;}
  const mobRow=document.getElementById('adminMobileRow');
  const mobBtn=document.getElementById('loginBtnMobile');
  const mobName=document.getElementById('adminMobileNameTxt');
  if(mobRow){mobRow.style.display='flex';}
  if(mobBtn){mobBtn.style.display='none';}
  if(mobName){mobName.textContent=name;}
  const bar=document.getElementById('adminBar');if(bar)bar.classList.add('on');
  const abt=document.getElementById('adminBarTxt');if(abt)abt.textContent=(_lang==='en'?'Hello, ':'Halo, ')+name+'.';
  _syncBnAdminUI(name);
}
function _resetAuthUI(){
  _adminName='';
  document.body.classList.remove('is-admin');
  const btn=document.getElementById('loginBtn');
  if(btn){btn.innerHTML=`🔐 <span id="loginBtnTxt">${tx('loginBtnTxt')}</span>`;}
  const mobRow=document.getElementById('adminMobileRow');
  const mobBtn=document.getElementById('loginBtnMobile');
  if(mobRow){mobRow.style.display='none';}
  if(mobBtn){mobBtn.style.display='flex';}
  const bar=document.getElementById('adminBar');if(bar)bar.classList.remove('on');
  const dd=document.getElementById('adminDd');if(dd)dd.classList.remove('open');
  _syncBnAdminUI(null);
}
document.addEventListener('click',e=>{
  const dd=document.getElementById('adminDd');
  const anchor=document.getElementById('adminDdAnchor');
  if(dd&&anchor&&dd.classList.contains('open')&&!anchor.contains(e.target))dd.classList.remove('open');
});

/* ══ TOAST ══ */
let _tt;
function showToast(msg,type=''){
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=msg;
  el.className=`toast on${type==='ok'?' ok':type==='err'?' err':''}`;
  clearTimeout(_tt);_tt=setTimeout(()=>el.classList.remove('on'),3000);
}

/* ══ DATA STATE ══ */
let POSTS=[];

/* ══ Item 8: Skeleton Loader ══ */
function renderSkeletonGrid(){
  const grid=document.getElementById('revGrid');if(!grid)return;
  grid.innerHTML=Array(6).fill(0).map(()=>`
    <div class="sk-rev-card">
      <div class="sk-rev-img"></div>
      <div class="sk-rev-body">
        <div class="sk-line sk-line-sm"></div>
        <div class="sk-line sk-line-md"></div>
        <div class="sk-line sk-line-lg"></div>
        <div class="sk-line sk-line-md"></div>
      </div>
    </div>`).join('');
}

/* ══ LOAD FROM SUPABASE ══ */
async function loadPosts(){
  renderSkeletonGrid();
  try{
    const query='reversement_posts?select=*&published=eq.true&order=date.desc';
    POSTS=await sb(query)||[];
    renderGrid();
  }catch(e){
    console.error('loadPosts error:',e);
    const grid=document.getElementById('revGrid');
    if(grid)grid.innerHTML=`<div class="rev-empty">${tx('errLoad')}</div>`;
  }
}

/* ══ FILTER STATE ══ */
let _filter='all';
function filterPosts(f){
  _filter=f;
  document.querySelectorAll('.rev-filter-btn').forEach(b=>{
    b.classList.toggle('active',b.dataset.filter===f);
  });
  renderGrid();
}

/* ══ DATE FORMATTER ══ */
const MS_ID=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const MS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
function formatDate(dateStr){
  const d=new Date(dateStr+'T00:00:00');
  const MS=_lang==='en'?MS_EN:MS_ID;
  const days_id=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const days_en=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const days=_lang==='en'?days_en:days_id;
  return `${days[d.getDay()]}, ${d.getDate()} ${MS[d.getMonth()]} ${d.getFullYear()}`;
}

/* ══ RENDER GRID ══ */
function renderGrid(){
  const grid=document.getElementById('revGrid');
  if(!grid)return;
  const filtered=_filter==='all'?POSTS:POSTS.filter(p=>p.day_type===_filter);
  const sorted=[...filtered].sort((a,b)=>b.date.localeCompare(a.date));

  // Item 7: empty state informatif
  if(!sorted.length){
    const isFiltered=_filter!=='all';
    const icon=isFiltered?'🔍':'📖';
    const title=isFiltered
      ?(_lang==='en'?'No posts match this filter':'Tidak ada post untuk filter ini')
      :(_lang==='en'?'No posts yet':'Belum ada konten');
    const sub=isFiltered
      ?(_lang==='en'?'Try selecting All or a different day.':'Coba pilih Semua atau hari yang lain.')
      :(_lang==='en'?'Check back on Monday or Friday for a new devotion.':'Konten akan hadir setiap Senin dan Jumat.');
    grid.innerHTML=`<div class="rev-empty-state">
      <div class="rev-empty-state-icon">${icon}</div>
      <div class="rev-empty-state-title">${title}</div>
      <div class="rev-empty-state-sub">${sub}</div>
      ${isFiltered?`<button class="btn btn-sm" style="margin-top:8px" onclick="filterPosts('all')">${_lang==='en'?'Show All':'Tampilkan Semua'}</button>`:''}
    </div>`;
    return;
  }

  // Item 10: staggered card animation
  grid.innerHTML=sorted.map((p,idx)=>{
    const hasPoster=!!p.poster_url;
    const imgSrc=hasPoster?driveToThumbnail(p.poster_url):'';
    const dayLbl=p.day_type==='senin'?(_lang==='en'?'Monday':'Senin'):(_lang==='en'?'Friday':'Jumat');
    const snippet=(p.body||'').replace(/\n/g,' ').slice(0,140)+'…';
    const seriesLbl=p.series||'Reversement';
    const delay=idx*55;

    // Item 1: escapeHTML untuk alt + title
    const safeTitle=escapeHTML(p.title);
    const safeSeriesLbl=escapeHTML(seriesLbl);

    const posterHtml=hasPoster
      ?`<div class="rev-card-poster-wrap">
           <img class="rev-card-poster" src="${imgSrc}" alt="${safeTitle}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
           <div class="rev-card-poster-placeholder" style="display:none"><div class="rev-card-poster-placeholder-icon">✝️</div><div class="rev-card-poster-placeholder-text">${safeSeriesLbl}</div></div>
         </div>`
      :`<div class="rev-card-poster-wrap"><div class="rev-card-poster-placeholder"><div class="rev-card-poster-placeholder-icon">✝️</div><div class="rev-card-poster-placeholder-text">${safeSeriesLbl}</div></div></div>`;
    const draftBadge=(!p.published)?`<span class="rev-draft-badge">Draft</span>`:'';

    return `<div class="rev-card card-animate${!p.published?' rev-card-draft':''}" style="animation-delay:${delay}ms" onclick="openRevModal('${p.id}')">
      ${posterHtml}
      ${!p.published?draftBadge:''}
      <div class="rev-card-body">
        <div class="rev-card-meta">
          <span class="rev-day-badge ${p.day_type}">${dayLbl}</span>
          <span class="rev-card-date-lbl">${formatDate(p.date)}</span>
        </div>
        <div class="rev-card-title">${safeTitle}</div>
        <div class="rev-card-verse">${escapeHTML(p.verse_ref||'')}</div>
        <div class="rev-card-snippet">${escapeHTML(snippet)}</div>
        <div class="rev-card-cta">${_lang==='en'?'Read more':'Baca selengkapnya'} </div>
      </div>
    </div>`;
  }).join('');
}

/* ══ MODAL DETAIL ══ */
let _activePost=null;
const _isMobile=()=>window.innerWidth<=640;

function openRevModal(id){
  const post=POSTS.find(p=>p.id===id);
  if(!post)return;
  _activePost=post;
  const hasPoster=!!post.poster_url;
  const imgSrc=hasPoster?driveToThumbnail(post.poster_url):'';
  const dayLbl=post.day_type==='senin'?(_lang==='en'?'Monday':'Senin'):(_lang==='en'?'Friday':'Jumat');

  const inner=document.getElementById('revModalInner');
  const posterWrap=document.getElementById('revModalPosterWrap');
  const posterImg=document.getElementById('revModalPoster');

  inner.classList.toggle('no-poster',!hasPoster);

  if(hasPoster){
    posterWrap.style.display='';
    posterImg.src=imgSrc;
    posterImg.alt=escapeHTML(post.title);
  } else {
    posterWrap.style.display='none';
  }
  posterWrap.classList.remove('dimmed');

  const badge=document.getElementById('revModalDayBadge');
  badge.textContent=dayLbl;
  badge.className='rev-modal-day-badge '+post.day_type;
  document.getElementById('revModalDate').textContent=formatDate(post.date);
  // textContent auto-escapes — XSS safe
  document.getElementById('revModalTitle').textContent=post.title;
  document.getElementById('revModalVerse').textContent=post.verse_ref||'';
  document.getElementById('revModalBody').textContent=post.body||'';
  const adminActions=document.getElementById('revModalAdminActions');
  if(adminActions)adminActions.style.display=isAdmin?'flex':'none';
  const editBtn=document.getElementById('revModalEditBtn');
  const delBtn=document.getElementById('revModalDeleteBtn');
  if(editBtn)editBtn.textContent=tx('btnEdit');
  if(delBtn)delBtn.textContent=tx('btnDelete');

  _populateBottomSheet(post,dayLbl);

  document.getElementById('revModalOverlay').classList.add('open');
  document.getElementById('revModal').classList.add('open');
  document.body.style.overflow='hidden';
  _attachFocusTrap(document.getElementById('revModal'));

  if(_isMobile()&&hasPoster){
    const bs=document.getElementById('revBottomSheet');
    if(bs){
      bs.classList.add('hidden');
      bs.classList.remove('expanded');
      document.getElementById('revBsBody').style.display='none';
      document.getElementById('revBsStrip').style.display='';
      setTimeout(()=>bs.classList.remove('hidden'),80);
      _initSwipeGesture();
    }
  }
}

function _populateBottomSheet(post,dayLbl){
  const bs=document.getElementById('revBottomSheet');if(!bs)return;
  // textContent untuk semua — XSS safe
  document.getElementById('revBsTitle').textContent=post.title;
  document.getElementById('revBsTitle2').textContent=post.title;
  const bsBadge=document.getElementById('revBsDayBadge');
  bsBadge.textContent=dayLbl;
  bsBadge.className='rev-modal-day-badge '+post.day_type;
  document.getElementById('revBsDate').textContent=formatDate(post.date);
  document.getElementById('revBsVerse').textContent=post.verse_ref||'';
  document.getElementById('revBsBody2').textContent=post.body||'';
  const bsAdmin=document.getElementById('revBsAdminActions');
  if(bsAdmin)bsAdmin.style.display=isAdmin?'flex':'none';
  const bsEdit=document.getElementById('revBsEditBtn');
  const bsDel=document.getElementById('revBsDeleteBtn');
  if(bsEdit)bsEdit.textContent=tx('btnEdit');
  if(bsDel)bsDel.textContent=tx('btnDelete');
}

function closeRevModal(){
  document.getElementById('revModalOverlay').classList.remove('open');
  document.getElementById('revModal').classList.remove('open');
  document.getElementById('revModalPosterWrap')?.classList.remove('dimmed');
  const bs=document.getElementById('revBottomSheet');
  if(bs){bs.classList.add('hidden');bs.classList.remove('expanded');}
  document.body.style.overflow='';
  _activePost=null;
  _removeSwipeGesture();
  _detachFocusTrap();
}

/* ══ MOBILE BOTTOM SHEET ══ */
function expandBottomSheet(){
  const bs=document.getElementById('revBottomSheet');
  const posterWrap=document.getElementById('revModalPosterWrap');
  if(!bs)return;
  bs.classList.add('expanded');
  document.getElementById('revBsBody').style.display='';
  document.getElementById('revBsStrip').style.display='none';
  posterWrap.classList.add('dimmed');
}
function collapseBottomSheet(){
  const bs=document.getElementById('revBottomSheet');
  const posterWrap=document.getElementById('revModalPosterWrap');
  if(!bs)return;
  bs.classList.remove('expanded');
  document.getElementById('revBsBody').style.display='none';
  document.getElementById('revBsStrip').style.display='';
  posterWrap.classList.remove('dimmed');
}
function _onPosterTap(){
  if(!_isMobile())return;
  const bs=document.getElementById('revBottomSheet');
  if(bs?.classList.contains('expanded'))collapseBottomSheet();
}

/* ══ SWIPE DOWN GESTURE ══ */
let _swipeStartY=0;
function _onSwipeStart(e){_swipeStartY=e.touches[0].clientY;}
function _onSwipeEnd(e){
  const dy=e.changedTouches[0].clientY-_swipeStartY;
  if(dy>60)collapseBottomSheet();
}
function _initSwipeGesture(){
  const bs=document.getElementById('revBottomSheet');if(!bs)return;
  bs.addEventListener('touchstart',_onSwipeStart,{passive:true});
  bs.addEventListener('touchend',_onSwipeEnd,{passive:true});
}
function _removeSwipeGesture(){
  const bs=document.getElementById('revBottomSheet');if(!bs)return;
  bs.removeEventListener('touchstart',_onSwipeStart);
  bs.removeEventListener('touchend',_onSwipeEnd);
}
function expandRevModal(){}
function collapseRevModal(){}

/* ══ ADMIN — FORM MODAL ══ */
let _editingId=null;

function openAdminForm(postId=null){
  _editingId=postId;
  const f=document.getElementById('adminFormModal');if(!f)return;
  ['afTitle','afSeries','afDate','afVerseRef','afPosterUrl','afBody'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  document.getElementById('afSeries').value='Reversement';
  document.getElementById('afDayType').value='senin';
  document.getElementById('afPublished').checked=true;
  document.getElementById('adminFormErr').textContent='';
  const formTitle=document.getElementById('adminFormModalTitle');

  if(postId){
    const post=POSTS.find(p=>p.id===postId);
    if(post){
      if(formTitle)formTitle.textContent=tx('adminFormEditTitle');
      document.getElementById('afTitle').value=post.title||'';
      document.getElementById('afSeries').value=post.series||'Reversement';
      document.getElementById('afDayType').value=post.day_type||'senin';
      document.getElementById('afDate').value=post.date||'';
      document.getElementById('afVerseRef').value=post.verse_ref||'';
      document.getElementById('afPosterUrl').value=post.poster_url||'';
      document.getElementById('afBody').value=post.body||'';
      document.getElementById('afPublished').checked=post.published!==false;
    }
  } else {
    if(formTitle)formTitle.textContent=tx('adminFormTitle');
    document.getElementById('afDate').value=new Date().toISOString().split('T')[0];
  }

  closeRevModal();
  f.classList.add('open');
  document.getElementById('adminFormOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}

function closeAdminForm(){
  // Item 6: Dirty state warning
  if(_formDirty){
    const msg=_lang==='en'?'There are unsaved changes. Close without saving?':'Ada perubahan yang belum disimpan. Tutup tanpa menyimpan?';
    showConfirmModal(msg,()=>{
      _formDirty=false;
      _closeAdminFormForce();
    },'OK');
    return;
  }
  _closeAdminFormForce();
}
function _closeAdminFormForce(){
  const f=document.getElementById('adminFormModal');if(f)f.classList.remove('open');
  const o=document.getElementById('adminFormOverlay');if(o)o.classList.remove('open');
  document.body.style.overflow='';
  _editingId=null;
}

function generatePostId(date){
  return date?`rev-${date}`:`rev-${Date.now()}`;
}

async function saveAdminForm(){
  const titleVal=document.getElementById('afTitle').value.trim();
  const dateVal=document.getElementById('afDate').value.trim();
  const errEl=document.getElementById('adminFormErr');

  if(!titleVal||!dateVal){
    errEl.textContent=_lang==='en'?'Title and date are required.':'Judul dan tanggal wajib diisi.';
    return;
  }

  const isEdit=!!_editingId;
  const id=isEdit?_editingId:generatePostId(dateVal);
  const payload={
    title:titleVal,
    series:document.getElementById('afSeries').value.trim()||'Reversement',
    day_type:document.getElementById('afDayType').value,
    date:dateVal,
    verse_ref:document.getElementById('afVerseRef').value.trim()||null,
    poster_url:document.getElementById('afPosterUrl').value.trim()||null,
    body:document.getElementById('afBody').value.trim()||null,
    published:document.getElementById('afPublished').checked,
  };
  if(!isEdit)payload.id=id;

  const btn=document.getElementById('adminFormSaveBtn');
  btn.disabled=true;btn.textContent=tx('saving');
  errEl.textContent='';

  try{
    if(isEdit){
      await sb(`reversement_posts?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',prefer:'return=minimal',body:payload});
    } else {
      await sb('reversement_posts',{method:'POST',prefer:'return=minimal',body:payload});
    }
    _formDirty=false;
    showToast(tx('saveOk'),'ok');
    _closeAdminFormForce();
    await loadPosts();
  }catch(e){
    console.error('saveAdminForm:',e);
    errEl.textContent=tx('errSave');
  }
  btn.disabled=false;btn.textContent=tx('btnSave');
}

/* Item 3+4: deletePost — pakai showConfirmModal, tampilkan judul ── */
async function deletePost(){
  if(!_activePost)return;
  const title=_activePost.title||(_lang==='en'?'this post':'post ini');
  const msg=_lang==='en'
    ?`Delete "${title}"? This cannot be undone.`
    :`Hapus post "${title}"? Tindakan ini tidak bisa dibatalkan.`;
  showConfirmModal(msg,async()=>{
    const btn=document.getElementById('revModalDeleteBtn');
    if(btn){btn.disabled=true;btn.textContent=tx('deleting');}
    try{
      await sb(`reversement_posts?id=eq.${encodeURIComponent(_activePost.id)}`,{method:'DELETE',prefer:'return=minimal'});
      showToast(tx('delOk'),'ok');
      closeRevModal();
      await loadPosts();
    }catch(e){
      console.error('deletePost:',e);
      showToast(tx('errDel'),'err');
      if(btn){btn.disabled=false;btn.textContent=tx('btnDelete');}
    }
  });
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.getElementById('adminFormModal')?.classList.contains('open'))closeAdminForm();
    else closeRevModal();
  }
});

/* ══ VISIT COUNTER ══ */
async function trackVisit(){
  const timeout=ms=>new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms));
  let sid=sessionStorage.getItem('naposo_sid');
  if(!sid){
    sid='sid_'+Date.now()+'_'+Math.random().toString(36).slice(2,9);
    sessionStorage.setItem('naposo_sid',sid);
    try{
      await Promise.race([
        sb('visits',{method:'POST',prefer:'resolution=ignore-duplicates,return=minimal',body:{session_id:sid}}),
        timeout(3000)
      ]);
    }catch(_){}
  }
  try{
    const res=await Promise.race([
      fetch(`${SUPA_URL}/rest/v1/visits?select=count`,{headers:{'apikey':SUPA_KEY,'Authorization':`Bearer ${SUPA_KEY}`,'Prefer':'count=exact','Range':'0-0'}}),
      timeout(3000)
    ]);
    const count=res.headers.get('content-range')?.split('/')?.pop()||'–';
    return {total:count};
  }catch(_){return {total:'–'};}
}

/* ══ Item 9: Scroll to Top ══ */
function initScrollTop(){
  const btn=document.getElementById('scrollTopBtn');if(!btn)return;
  window.addEventListener('scroll',()=>{
    btn.classList.toggle('visible',window.scrollY>300);
  },{passive:true});
}

/* ══ Item 6: Dirty State tracking for admin form ══ */
let _formDirty=false;
function initDirtyState(){
  const watchIds=['afTitle','afSeries','afDate','afVerseRef','afPosterUrl','afBody'];
  watchIds.forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.addEventListener('input',()=>{_formDirty=true;});
  });
  const dayEl=document.getElementById('afDayType');
  if(dayEl)dayEl.addEventListener('change',()=>{_formDirty=true;});
  const pubEl=document.getElementById('afPublished');
  if(pubEl)pubEl.addEventListener('change',()=>{_formDirty=true;});

  // Reset dirty saat form dibuka
  const _origOpen=window.openAdminForm;
  window.openAdminForm=function(postId=null){_formDirty=false;_origOpen(postId);};
}

/* ══ INIT ══ */
(async function init(){
  applyDark();

  const token=localStorage.getItem('naposo_token');
  const name=localStorage.getItem('naposo_admin_name');
  if(token&&name){isAdmin=true;_applyAdminUI(name);}

  applyLang();

  const visits=await trackVisit();
  document.getElementById('footerYear').textContent=new Date().getFullYear();
  const fv=document.getElementById('footerVisits');
  if(fv)fv.textContent=visits.total||'–';

  await loadPosts();

  const deepId=new URLSearchParams(location.search).get('id');
  if(deepId){
    const target=POSTS.find(p=>p.id===deepId);
    if(target)openRevModal(target.id);
  }

  initScrollTop();   // Item 9
  initDirtyState();  // Item 6
  initPullToRefresh();
})();

/* ══ PULL TO REFRESH ══ */
function initPullToRefresh(){
  let startY=0,pulling=false,triggered=false;
  const THRESHOLD=60;
  const spinner=document.createElement('div');
  spinner.className='ptr-spinner';
  spinner.innerHTML=`<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="10" stroke-linecap="round"/></svg><span id="ptrLabel">${_lang==='en'?'Refreshing…':'Memuat ulang…'}</span>`;
  document.body.appendChild(spinner);
  function showSpinner(){spinner.classList.add('ptr-visible');}
  function hideSpinner(){spinner.classList.remove('ptr-visible');}
  document.addEventListener('touchstart',e=>{
    if(window.scrollY!==0)return;
    startY=e.touches[0].clientY;pulling=true;triggered=false;
  },{passive:true});
  document.addEventListener('touchmove',e=>{
    if(!pulling)return;
    const dy=e.touches[0].clientY-startY;
    if(dy>=THRESHOLD&&!triggered){triggered=true;showSpinner();}
  },{passive:true});
  document.addEventListener('touchend',async()=>{
    if(!pulling)return;pulling=false;
    if(!triggered)return;
    const lbl=document.getElementById('ptrLabel');
    if(lbl)lbl.textContent=_lang==='en'?'Refreshing…':'Memuat ulang…';
    await loadPosts();
    hideSpinner();
  },{passive:true});
}

/* ══════════════════════════════
   SESI 35 — BOTTOM NAV
   ══════════════════════════════ */
function openBnSheet(){
  document.getElementById('bnSheet').classList.add('open');
  document.getElementById('bnSheetOverlay').classList.add('open');
  const bdt=document.getElementById('bnDarkTrack');if(bdt)bdt.classList.toggle('on',darkMode);
  const blt=document.getElementById('bnLangTrack');if(blt)blt.classList.toggle('on',_lang==='en');
  const stt=document.getElementById('scrollTopBtn');if(stt)stt.style.opacity='0';
}
function closeBnSheet(){
  document.getElementById('bnSheet').classList.remove('open');
  document.getElementById('bnSheetOverlay').classList.remove('open');
  const stt=document.getElementById('scrollTopBtn');if(stt)stt.style.opacity='';
}
function _syncBnAdminUI(name){
  const adminSec=document.getElementById('bnAdminSection');
  const guestSec=document.getElementById('bnGuestSection');
  const bnName=document.getElementById('bnAdminName');
  const bnNameTop=document.getElementById('bnAdminNameTop');
  const bnTopRow=document.getElementById('bnAdminTopName');
  const bnIcon=document.getElementById('bnLoginIcon');
  const bnLabel=document.getElementById('bnLoginLabel');
  if(name){
    if(adminSec)adminSec.style.display='flex';
    if(guestSec)guestSec.style.display='none';
    if(bnName)bnName.textContent=name;
    if(bnNameTop)bnNameTop.textContent=name;
    if(bnTopRow)bnTopRow.style.display='block';
    if(bnIcon)bnIcon.textContent='✓';
    if(bnLabel)bnLabel.textContent=name.split(' ')[0];
  } else {
    if(adminSec)adminSec.style.display='none';
    if(guestSec)guestSec.style.display='block';
    if(bnTopRow)bnTopRow.style.display='none';
    if(bnIcon)bnIcon.textContent='🔐';
    if(bnLabel)bnLabel.textContent=tx('loginBtnTxt')||'Login';
  }
}
// Tutup sheet saat Escape (reversement sudah punya keydown listener, tambah pengecekan di sini)
(function(){
  const _origKeydown=window._bnKeydownAttached;
  if(!_origKeydown){
    window._bnKeydownAttached=true;
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){
        const sh=document.getElementById('bnSheet');
        if(sh&&sh.classList.contains('open')){closeBnSheet();}
      }
    });
  }
})();

/* ══ PWA SERVICE WORKER ══ */
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}
