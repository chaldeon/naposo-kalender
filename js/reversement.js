/* ══ CONFIG ══ */
const SUPA_URL='https://wejbubxrlqyazlodhbua.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlamJ1YnhybHF5YXpsb2RoYnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTU0NDUsImV4cCI6MjA5MTg5MTQ0NX0.fFBvRU7wlRvzigDLtN6ot_9D6GMxL9h4J_mwVaNoBsU';
const USER_NAMES=['Andre','Catherine','Daniel','David','Dea','Eliza','Frans','Grace','Gunawan','Lisken','Mutiara','Rut','Selfa','Tomy'];

function driveToThumbnail(url){
  if(!url)return '';
  const m=url.match(/\/file\/d\/([^/?\s]+)/);
  if(m)return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
  return url;
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

/* ══ MODAL HELPER (pola kalender) ══ */
function closeModal(id){
  const el=document.getElementById(id);
  if(el)el.classList.remove('on');
}
function openModal(id){
  const el=document.getElementById(id);
  if(el)el.classList.add('on');
}
function togglePw(inputId,btn){
  const inp=document.getElementById(inputId);
  if(!inp)return;
  inp.type=inp.type==='password'?'text':'password';
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
      const err=document.getElementById('loginErr');
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
}
/* ══ ADMIN DROPDOWN — click outside ══ */
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

/* ══ LOAD FROM SUPABASE ══ */
async function loadPosts(){
  const grid=document.getElementById('revGrid');
  if(grid)grid.innerHTML=`<div class="rev-loading">
    <div class="rev-loading-dot"></div>
    <div class="rev-loading-dot"></div>
    <div class="rev-loading-dot"></div>
  </div>`;
  try{
    // Fetch hanya yang published — sesuai RLS policy anon
    // Draft tidak ditampilkan sampai sistem auth native diimplementasi
    const query='reversement_posts?select=*&published=eq.true&order=date.desc';
    POSTS=await sb(query)||[];
    renderGrid();
  }catch(e){
    console.error('loadPosts error:',e);
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
  if(!sorted.length){
    grid.innerHTML=`<div class="rev-empty">${_lang==='en'?'No posts yet.':'Belum ada konten.'}</div>`;
    return;
  }
  grid.innerHTML=sorted.map(p=>{
    const hasPoster=!!p.poster_url;
    const imgSrc=hasPoster?driveToThumbnail(p.poster_url):'';
    const dayLbl=p.day_type==='senin'?(_lang==='en'?'Monday':'Senin'):(_lang==='en'?'Friday':'Jumat');
    const snippet=(p.body||'').replace(/\n/g,' ').slice(0,140)+'…';
    const seriesLbl=p.series||'Reversement';
    const posterHtml=hasPoster
      ?`<div class="rev-card-poster-wrap">
           <img class="rev-card-poster" src="${imgSrc}" alt="${p.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
           <div class="rev-card-poster-placeholder" style="display:none"><div class="rev-card-poster-placeholder-icon">✝️</div><div class="rev-card-poster-placeholder-text">${seriesLbl}</div></div>
         </div>`
      :`<div class="rev-card-poster-wrap"><div class="rev-card-poster-placeholder"><div class="rev-card-poster-placeholder-icon">✝️</div><div class="rev-card-poster-placeholder-text">${seriesLbl}</div></div></div>`;
    const draftBadge=(!p.published)?`<span class="rev-draft-badge">Draft</span>`:'';
    return `<div class="rev-card${!p.published?' rev-card-draft':''}" onclick="openRevModal('${p.id}')">
      ${posterHtml}
      ${!p.published?draftBadge:''}
      <div class="rev-card-body">
        <div class="rev-card-meta">
          <span class="rev-day-badge ${p.day_type}">${dayLbl}</span>
          <span class="rev-card-date-lbl">${formatDate(p.date)}</span>
        </div>
        <div class="rev-card-title">${p.title}</div>
        <div class="rev-card-verse">${p.verse_ref||''}</div>
        <div class="rev-card-snippet">${snippet}</div>
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
    posterImg.alt=post.title;
  } else {
    posterWrap.style.display='none';
  }
  posterWrap.classList.remove('dimmed');

  // Isi desktop panel kanan
  const badge=document.getElementById('revModalDayBadge');
  badge.textContent=dayLbl;
  badge.className='rev-modal-day-badge '+post.day_type;
  document.getElementById('revModalDate').textContent=formatDate(post.date);
  document.getElementById('revModalTitle').textContent=post.title;
  document.getElementById('revModalVerse').textContent=post.verse_ref||'';
  document.getElementById('revModalBody').textContent=post.body||'';
  const adminActions=document.getElementById('revModalAdminActions');
  if(adminActions)adminActions.style.display=isAdmin?'flex':'none';
  const editBtn=document.getElementById('revModalEditBtn');
  const delBtn=document.getElementById('revModalDeleteBtn');
  if(editBtn)editBtn.textContent=tx('btnEdit');
  if(delBtn)delBtn.textContent=tx('btnDelete');

  // Isi mobile bottom sheet
  _populateBottomSheet(post,dayLbl);

  document.getElementById('revModalOverlay').classList.add('open');
  document.getElementById('revModal').classList.add('open');
  document.body.style.overflow='hidden';

  // Mobile: animasi bottom sheet muncul
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
  const bs=document.getElementById('revBottomSheet');
  if(!bs)return;
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
  const bs=document.getElementById('revBottomSheet');
  if(!bs)return;
  bs.addEventListener('touchstart',_onSwipeStart,{passive:true});
  bs.addEventListener('touchend',_onSwipeEnd,{passive:true});
}
function _removeSwipeGesture(){
  const bs=document.getElementById('revBottomSheet');
  if(!bs)return;
  bs.removeEventListener('touchstart',_onSwipeStart);
  bs.removeEventListener('touchend',_onSwipeEnd);
}

function expandRevModal(){}
function collapseRevModal(){}

/* ══ ADMIN — FORM MODAL ══ */
let _editingId=null;

function openAdminForm(postId=null){
  _editingId=postId;
  const f=document.getElementById('adminFormModal');
  if(!f)return;

  // Reset
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
      await sb(`reversement_posts?id=eq.${encodeURIComponent(id)}`,{
        method:'PATCH',
        prefer:'return=minimal',
        body:payload
      });
    } else {
      await sb('reversement_posts',{
        method:'POST',
        prefer:'return=minimal',
        body:payload
      });
    }
    showToast(tx('saveOk'),'ok');
    closeAdminForm();
    await loadPosts();
  }catch(e){
    console.error('saveAdminForm:',e);
    errEl.textContent=tx('errSave');
  }
  btn.disabled=false;btn.textContent=tx('btnSave');
}

async function deletePost(){
  if(!_activePost)return;
  if(!confirm(tx('confirmDelete')))return;
  const btn=document.getElementById('revModalDeleteBtn');
  if(btn){btn.disabled=true;btn.textContent=tx('deleting');}
  try{
    await sb(`reversement_posts?id=eq.${encodeURIComponent(_activePost.id)}`,{
      method:'DELETE',
      prefer:'return=minimal'
    });
    showToast(tx('delOk'),'ok');
    closeRevModal();
    await loadPosts();
  }catch(e){
    console.error('deletePost:',e);
    showToast(tx('errDel'),'err');
    if(btn){btn.disabled=false;btn.textContent=tx('btnDelete');}
  }
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
})();

/* ══ PWA SERVICE WORKER ══ */
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}
