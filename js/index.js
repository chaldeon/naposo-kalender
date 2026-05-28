/* ══ CONFIG ══ */
const SUPA_URL='https://wejbubxrlqyazlodhbua.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlamJ1YnhybHF5YXpsb2RoYnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTU0NDUsImV4cCI6MjA5MTg5MTQ0NX0.fFBvRU7wlRvzigDLtN6ot_9D6GMxL9h4J_mwVaNoBsU';

function sb(p,o={}){return fetch(`${SUPA_URL}/rest/v1/${p}`,{headers:{'apikey':SUPA_KEY,'Authorization':`Bearer ${SUPA_KEY}`,'Content-Type':'application/json','Prefer':'return=representation',...(o.headers||{})},...o});}
async function dbGet(t,q=''){const r=await sb(`${t}?${q}`);if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbIns(t,d){const r=await sb(t,{method:'POST',body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbUpd(t,m,d){const r=await sb(`${t}?${m}`,{method:'PATCH',body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbWrite(table,method,data,match,log){
  const token=localStorage.getItem('naposo_token')||'';
  const r=await fetch(`${SUPA_URL}/functions/v1/db-write`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPA_KEY}`,'x-admin-token':token},body:JSON.stringify({table,method,data,match,log})});
  const json=await r.json();if(!r.ok)throw new Error(json.error||'Write failed');return json.data||[];
}
async function dbDel(t,m){const r=await sb(`${t}?${m}`,{method:'DELETE'});if(!r.ok)throw new Error(await r.text());}

const USER_NAMES=['Andre','Catherine','Daniel','David','Dea','Eliza','Frans','Grace','Gunawan','Lisken','Mutiara','Rut','Selfa','Tomy'];

/* ══ BIRTHDAY HELPERS (deklarasi di atas agar tersedia saat loadData) ══ */
function getBirthdaysToday(){
  const today=localDateStr();
  return EVENTS.filter(e=>e.date===today&&isBirthdayEv(e));
}
const DEF_COLORS={
  koor:'#7c3aed',ibadah:'#d97706',rapat:'#1d4ed8',latihan:'#16a34a',reversement:'#db2777',doa:'#0891b2',
  event:'#ec89b0',bph:'#dc2626',ultah:'#06b6d4',olahraga:'#08e7c2',other:'#94a3b8',
  'event-gabungan':'#ec89b0','perayaan-ulang-tahun':'#06b6d4',
  'ibadah/pelayanan':'#d97706','ibadah-pelayanan':'#d97706','ibadah / pelayanan':'#d97706',
  pelayanan:'#f97316',kesehatian:'#ec4899',acara:'#eab308','ulang-tahun':'#06b6d4'};
const DEF_LABELS={
  koor:'Koor',ibadah:'Ibadah / Pelayanan',rapat:'Rapat',latihan:'Latihan',reversement:'Reversement',doa:'Doa',
  event:'Event Gabungan',bph:'BPH',ultah:'Perayaan Ulang Tahun',olahraga:'Olahraga',other:'Lainnya',
  'event-gabungan':'Event Gabungan','perayaan-ulang-tahun':'Perayaan Ulang Tahun',
  'ibadah/pelayanan':'Ibadah / Pelayanan','ibadah-pelayanan':'Ibadah / Pelayanan','ibadah / pelayanan':'Ibadah / Pelayanan',
  pelayanan:'Pelayanan',kesehatian:'Kesehatian',acara:'Acara','ulang-tahun':'Perayaan Ulang Tahun'};
let CATS={...DEF_COLORS},CNAMES={...DEF_LABELS};
function catColor(c){return CATS[c]||'#94a3b8';}
function catLabel(c){return CNAMES[c]||c;}

// ── Extra fields per kategori (untuk form edit beranda) ──
const CAT_EXTRA_IDX={
  'Koor':               [{key:'judul_lagu',      label:'Judul Lagu',         type:'text'},
                         {key:'link_guide',       label:'Link Guide',         type:'url'}],
  'Ibadah':             [{key:'judul_tema',       label:'Judul Tema',         type:'text'}],
  'Ibadah / Pelayanan': [{key:'judul_tema',       label:'Judul Tema',         type:'text'}],
  'Latihan':            [{key:'judul_lagu',       label:'Judul Lagu',         type:'text'},
                         {key:'link_guide',       label:'Link Guide',         type:'url'}],
  'Reversement':        [{key:'tema_reversement', label:'Tema Reversement',   type:'text'}],
  'Olahraga':           [{key:'variant',          label:'Cabang Olahraga',    type:'select', options:['badminton','basket','futsal','renang']},
                         {key:'tempat',           label:'Tempat / Lapangan',  type:'text'},
                         {key:'uang_patungan',    label:'Uang Patungan',      type:'money'}],
  'Perayaan Ulang Tahun':[{key:'nama',       label:'Nama (yang berulang tahun)',       type:'text'},
                           {key:'poster_url', label:'Poster Acara (Google Drive link)', type:'url'},
                           {key:'foto_url',   label:'Foto Pribadi (Google Drive link)', type:'url'}],
  'Ulang Tahun Anggota': [{key:'nama',       label:'Nama (yang berulang tahun)',       type:'text'},
                           {key:'poster_url', label:'Poster Acara (Google Drive link)', type:'url'},
                           {key:'foto_url',   label:'Foto Pribadi (Google Drive link)', type:'url'}],
};
function getEditExtraFields(catId){
  const lbl=CNAMES[catId]||catId;
  return CAT_EXTRA_IDX[lbl]||[];
}
function updateEditExtraField(){
  const cat=document.getElementById('editCat')?.value;
  const wrap=document.getElementById('editExtraWrap');
  if(!wrap)return;
  const fields=getEditExtraFields(cat);
  if(!fields.length){wrap.style.display='none';wrap.innerHTML='';return;}
  wrap.style.display='block';
  wrap.innerHTML=fields.map(f=>{
    if(f.type==='select'){
      const opts=f.options.map(o=>`<option value="${o}">${o.charAt(0).toUpperCase()+o.slice(1)}</option>`).join('');
      return `<div class="form-g extra-field-item" style="margin-bottom:6px">
        <label class="extra-field-label">${f.label}</label>
        <select class="extra-field-input" data-key="${f.key}" data-type="select" style="width:100%">
          <option value="">— Pilih —</option>${opts}
        </select>
      </div>`;
    }
    return `<div class="form-g extra-field-item" style="margin-bottom:6px">
      <label class="extra-field-label">${f.label}</label>
      <input type="text" class="extra-field-input" data-key="${f.key}"
        placeholder="${f.type==='url'?'https://…':f.type==='money'?'contoh: Rp 20.000':''}"
        style="width:100%"/>
    </div>`;
  }).join('');
}
function getEditExtraValues(){
  const fields=[...document.querySelectorAll('#editExtraWrap .extra-field-input')];
  const extra={};
  fields.forEach(el=>{
    const key=el.dataset.key;
    const val=el.value.trim();
    if(key&&val)extra[key]=val;
  });
  return Object.keys(extra).length?extra:null;
}
function populateEditExtraValues(ev){
  const fields=[...document.querySelectorAll('#editExtraWrap .extra-field-input')];
  fields.forEach(el=>{
    const key=el.dataset.key;
    if(key&&ev.extra&&ev.extra[key]!=null)el.value=ev.extra[key];
  });
}


const CAT_ICONS={
  koor:'🎵',ibadah:'🙏',rapat:'📋',latihan:'🎶',
  reversement:'✝️',doa:'🕊️','event-gabungan':'🎉',
  bph:'📌',olahraga:'🏃','perayaan-ulang-tahun':'🎂',other:'📅'
};
function catIcon(c){return CAT_ICONS[c]||'📅';}

const CAT_THUMBS={
  ibadah:'img/categories/ibadah.png',
  koor:'img/categories/koor.png',
  latihan:'img/categories/latihan-koor.png',
  reversement:'img/categories/reversement.png',
  'perayaan-ulang-tahun':'img/categories/ulang-tahun.png',
  doa:'img/categories/doa.png',
};
const VARIANT_THUMBS={
  koor:{gabungan:'img/categories/koor-gabungan.png'},
  latihan:{gabungan:'img/categories/latihan-koor-gabungan.png'},
  ibadah:{gabungan:'img/categories/ibadah-gabungan.png'},
  olahraga:{badminton:'img/categories/badminton.png',basket:'img/categories/basket.png',basketball:'img/categories/basket.png',futsal:'img/categories/futsal.png',renang:'img/categories/renang.png'},
};
function getCatThumb(ev){
  const cat=ev.category;const extra=ev.extra||{};
  // Birthday selalu pakai thumbnail generik (foto pribadi hanya untuk confetti modal)
  if(isBirthdayEv(ev))return 'img/categories/ulang-tahun.png';
  if((cat==='koor'||cat==='ibadah'||cat==='latihan')&&extra.gabungan)return VARIANT_THUMBS[cat]?.gabungan||CAT_THUMBS[cat]||'';
  if(cat==='olahraga'&&extra.variant){const v=extra.variant.toLowerCase().trim();for(const key of Object.keys(VARIANT_THUMBS.olahraga)){if(v.includes(key))return VARIANT_THUMBS.olahraga[key];}}
  return CAT_THUMBS[cat]||'';
}

const MS_ID=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const MS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let darkMode=localStorage.getItem('naposo_dark')==='1';
let _lang=localStorage.getItem('naposo_lang')||'id';
let isAdmin=false,EVENTS=[],DOCS=[],_adminName='';
let _lastRevPost=null;
function isSuperAdmin(){return true;}
function _applyRoleBadge(){
  const badge=document.getElementById('bnAdminBadge');
  if(badge){badge.style.display='inline';}
  const recapBtn=document.getElementById('bnRecapBtn');
  if(recapBtn)recapBtn.style.display='';
  const ddRecapBtn=document.getElementById('ddRecapBtn');
  if(ddRecapBtn)ddRecapBtn.style.display='';
}
// ══ BANNERS — array dari tabel announcements ══
let BANNERS=[],_BANNERS_ALL=[];

/* ══ I18N ══ */
const T={
  navKalender:{id:'Kalender',en:'Calendar'},navKalenderMob:{id:'Kalender',en:'Calendar'},
  navRev:{id:'Reversement',en:'Reversement'},navRevMob:{id:'Reversement',en:'Reversement'},
  smIgLabel:{id:'Instagram',en:'Instagram'},smYtLabel:{id:'YouTube',en:'YouTube'},smTtLabel:{id:'TikTok',en:'TikTok'},
  loginBtnTxt:{id:'Login',en:'Login'},loginBtnMobileTxt:{id:'Login',en:'Login'},
  ddDocs:{id:'Kelola Dokumen',en:'Manage Documents'},ddAnnounce:{id:'Kelola Pengumuman',en:'Manage Announcements'},ddRecap:{id:'Kelola Recap',en:'Manage Recap'},mobRecap:{id:'Kelola Recap',en:'Manage Recap'},bnRecap:{id:'Kelola Recap',en:'Manage Recap'},recapAdmModalTitle:{id:'Kelola Recap',en:'Manage Recap'},ddLogout:{id:'Logout',en:'Logout'},
  darkModeLbl:{id:'Dark Mode',en:'Dark Mode'},langModeLbl:{id:'Bahasa',en:'Language'},
  mobDocs:{id:'Kelola Dokumen',en:'Manage Documents'},mobAnnounce:{id:'Kelola Pengumuman',en:'Manage Announcements'},logoutBtnMobTxt:{id:'Logout',en:'Logout'},
  heroTitle:{id:'Naposo HKBP Ujung Menteng',en:'Naposo HKBP Ujung Menteng'},
  heroSub:{id:'Shalom, Naps. Cek kegiatan Naposo dan renungan terbaru.',en:'Hello, Naps. Check out the latest Naposo activities and devotionals.'},
  secEvents:{id:'Kegiatan Terdekat',en:'Upcoming Events'},secEventsLink:{id:'Lihat semua →',en:'View all →'},
  secRecap:{id:'Recap Kegiatan',en:'Activity Recap'},secDocs:{id:'Dokumen',en:'Documents'},secContact:{id:'Hubungi Kami',en:'Contact Us'},
  cpLabel:{id:'Hubungi Contact Person',en:'Contact Person'},footerVisitLbl:{id:'kunjungan bulan ini',en:'visits this month'},
  loginTitle:{id:'Login Pengurus',en:'Admin Login'},lbName:{id:'Nama Pengurus',en:'Admin Name'},lbPw:{id:'Password',en:'Password'},
  loginCancelBtn:{id:'Batal',en:'Cancel'},loginSubmitBtn:{id:'Masuk',en:'Sign In'},
  editModalTitle:{id:'Ubah Kegiatan',en:'Edit Event'},lbEditDate:{id:'Tanggal',en:'Date'},lbEditTitle:{id:'Judul Event',en:'Event Title'},
  lbEditTimeStart:{id:'Waktu Mulai',en:'Start Time'},lbEditTimeEnd:{id:'Waktu Selesai',en:'End Time'},
  lbEditCat:{id:'Kategori',en:'Category'},lbEditExtra:{id:'Tema Acara',en:'Event Theme'},lbEditNote:{id:'Catatan (Opsional)',en:'Notes (Optional)'},
  lbEditLink:{id:'Link (Opsional)',en:'Link (Optional)'},lbEditThumbnail:{id:'🖼 Thumbnail Card',en:'🖼 Thumbnail Card'},
  lbEditFeatured:{id:'⭐ Tampilkan di Beranda',en:'⭐ Show on Homepage'},lbEditCaption:{id:'Caption (untuk modal poster)',en:'Caption (shown in poster modal)'},
  editCancelBtn:{id:'Batal',en:'Cancel'},editSubmitBtn:{id:'Simpan',en:'Save'},
  docsModalTitle:{id:'Kelola Dokumen',en:'Manage Documents'},lbDocTitle:{id:'Judul Dokumen',en:'Document Title'},
  lbDocLink:{id:'Link (Google Drive / URL)',en:'Link (Google Drive / URL)'},lbDocCat:{id:'Kategori',en:'Category'},
  addDocBtn:{id:'+ Tambah',en:'+ Add'},docCloseBtn:{id:'Tutup',en:'Close'},
  announceModalTitle:{id:'Kelola Pengumuman',en:'Manage Announcements'},
  annCancelBtn:{id:'Batal',en:'Cancel'},annSaveBtn:{id:'Simpan',en:'Save'},
  adminBarTxt:{id:'',en:''},feedbackFabTxt:{id:'Beri Saran',en:'Give Feedback'},
  // Recap modal tabs
  recapTabPhoto:{id:'📷 Foto',en:'📷 Photos'},recapTabVideo:{id:'▶ Video',en:'▶ Videos'},
  // Lightbox
  rlbDriveLinkTxt:{id:'Buka di Drive ↗',en:'Open in Drive ↗'},
  // Login modal
  loginSelectDefault:{id:'-- Pilih nama --',en:'-- Select name --'},
  loginErr:{id:'Password salah atau nama tidak dipilih.',en:'Wrong password or name not selected.'},
  loginPwPlaceholder:{id:'Masukkan password',en:'Enter password'},
  // Edit event modal
  editDraftLabel:{id:'📝 Simpan sebagai Draft (tidak tampil ke publik)',en:'📝 Save as Draft (hidden from public)'},
  editThumbnailHint:{id:'(16:9 landscape · opsional)',en:'(16:9 landscape · optional)'},
  editTitlePlaceholder:{id:'Judul kegiatan',en:'Event title'},
  editNotePlaceholder:{id:'Detail tambahan...',en:'Additional details...'},
  editCaptionPlaceholder:{id:'Teks panjang yang muncul saat poster dibuka...',en:'Long text shown when poster is opened...'},
  editLinkPlaceholder:{id:'https://...',en:'https://...'},
  // Birthday modal
  bdayModalTitle:{id:'Selamat Ulang Tahun!',en:'Happy Birthday!'},
  bdayModalSub:{id:'Kiriman kasih dari Naposo HKBP Ujung Menteng',en:'With love from Naposo HKBP Ujung Menteng'},
  bdayModalBtn:{id:'🙏 Amin!',en:'🙏 Amen!'},
  // Confirm modal
  confirmTitle:{id:'Konfirmasi',en:'Confirm'},
  // Bottom nav sheet section labels
  bnSheetActionsLbl:{id:'Aksi Cepat',en:'Quick Actions'},
  bnSheetLogLbl:{id:'Log Aktivitas',en:'Activity Log'},
  bnSheetAccountLbl:{id:'Akun',en:'Account'},
  // Activity log states
  actLogLoading:{id:'Memuat…',en:'Loading…'},
  actLogEmpty:{id:'Belum ada aktivitas.',en:'No activity yet.'},
  actLogError:{id:'Gagal memuat log.',en:'Failed to load log.'},
  // Recap admin modal
  recapAdmListTitle:{id:'Daftar Recap',en:'Recap List'},
  recapAdmEmpty:{id:'Belum ada recap.',en:'No recap yet.'},
  radmActiveLblOn:{id:'Aktif',en:'Active'},radmActiveLblOff:{id:'Nonaktif',en:'Inactive'},
  radmSaveBtnAdd:{id:'💾 Simpan',en:'💾 Save'},radmSaveBtnEdit:{id:'💾 Update',en:'💾 Update'},
  radmCancelEditBtn:{id:'Batal Edit',en:'Cancel Edit'},
  // Docs admin modal
  docAdmListTitle:{id:'DAFTAR DOKUMEN',en:'DOCUMENT LIST'},
  docAdmEmpty:{id:'Belum ada dokumen.',en:'No documents yet.'},
  docCatPublic:{id:'📂 Publik',en:'📂 Public'},docCatPrivate:{id:'🔒 Pengurus',en:'🔒 Members Only'},
  // Banner admin modal
  bannerFormTitleAdd:{id:'TAMBAH BANNER',en:'ADD BANNER'},
  bannerFormTitleEdit:{id:'EDIT BANNER',en:'EDIT BANNER'},
  bannerListTitle:{id:'DAFTAR BANNER',en:'BANNER LIST'},
  bannerTextLabel:{id:'Teks Banner',en:'Banner Text'},
  bannerColorLabel:{id:'Warna',en:'Color'},
  bannerLinkUrlLabel:{id:'Link (opsional)',en:'Link (optional)'},
  bannerBtnLblLabel:{id:'Label Tombol (opsional)',en:'Button Label (optional)'},
  bannerActiveCheckLbl:{id:'Aktifkan banner',en:'Activate banner'},
  bannerActiveStatus:{id:'✅ Aktif',en:'✅ Active'},bannerInactiveStatus:{id:'⏸ Nonaktif',en:'⏸ Inactive'},
  bannerAdmLoading:{id:'Memuat…',en:'Loading…'},bannerAdmEmpty:{id:'Belum ada banner.',en:'No banners yet.'},
  bannerAdmError:{id:'Gagal memuat.',en:'Failed to load.'},
  bannerSaveBtnAdd:{id:'+ Tambah',en:'+ Add'},bannerSaveBtnEdit:{id:'Simpan Perubahan',en:'Save Changes'},
  // Recap gallery states
  galleryLoading:{id:'Memuat foto...',en:'Loading photos...'},
  galleryNoPhoto:{id:'Belum ada foto.',en:'No photos yet.'},
  galleryNoVideo:{id:'Belum ada video.',en:'No videos yet.'},
  galleryNoFolder:{id:'Folder Drive belum dikonfigurasi untuk recap ini.',en:'Drive folder not configured for this recap.'},
  // Rev widget section header (injected by JS)
  revWidgetTitle:{id:'Renungan Terbaru',en:'Latest Devotional'},
  revWidgetSeeAll:{id:'Lihat semua →',en:'See all →'},
  searchPlaceholder:{id:'Cari kegiatan atau renungan…',en:'Search events or devotionals…'},
};
function tx(id){return T[id]?T[id][_lang]||T[id].id:'';}
function applyLang(){
  document.documentElement.lang=_lang;
  Object.keys(T).forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=tx(id);});
  const ltm=document.getElementById('langTrackMobile');if(ltm)ltm.classList.toggle('on',_lang==='en');
  const ltb=document.getElementById('langToggleBtn');if(ltb)ltb.textContent=_lang==='id'?'EN':'ID';
  const blt=document.getElementById('bnLangTrack');if(blt)blt.classList.toggle('on',_lang==='en');
  if(isAdmin&&_adminName){const abt=document.getElementById('adminBarTxt');if(abt)abt.textContent=(_lang==='en'?'Hello, ':'Halo, ')+_adminName+'.';}
  // Placeholders
  const hps=document.getElementById('homepageSearch');if(hps)hps.placeholder=tx('searchPlaceholder');
  const lpw=document.getElementById('loginPw');if(lpw)lpw.placeholder=tx('loginPwPlaceholder');
  const eti=document.getElementById('editTitle');if(eti)eti.placeholder=tx('editTitlePlaceholder');
  const eno=document.getElementById('editNote');if(eno)eno.placeholder=tx('editNotePlaceholder');
  const eca=document.getElementById('editCaption');if(eca)eca.placeholder=tx('editCaptionPlaceholder');
  // Login select default option
  buildLoginDropdown();
  // loginErr static text
  const lerr=document.getElementById('loginErr');if(lerr)lerr.textContent=tx('loginErr');
  // confirmModalTitle default (dynamic when shown, but set default)
  const cmt=document.getElementById('confirmModalTitle');if(cmt&&cmt.textContent==='Konfirmasi'||cmt&&cmt.textContent==='Confirm')cmt.textContent=tx('confirmTitle');
  // rlbDriveLink text
  const rld=document.getElementById('rlbDriveLink');if(rld)rld.textContent=tx('rlbDriveLinkTxt');
  // Recap tabs
  const rtp=document.getElementById('recapTabPhoto');if(rtp)rtp.textContent=tx('recapTabPhoto');
  const rtv=document.getElementById('recapTabVideo');if(rtv)rtv.textContent=tx('recapTabVideo');
  // Doc category select options
  const dcp=document.getElementById('docCatPublic');if(dcp)dcp.textContent=tx('docCatPublic');
  const dcr=document.getElementById('docCatPrivate');if(dcr)dcr.textContent=tx('docCatPrivate');
  renderEvents();renderRecap();renderDocs();renderRevWidget(undefined);
}
function toggleLang(){_lang=_lang==='id'?'en':'id';localStorage.setItem('naposo_lang',_lang);applyLang();}
function toggleLangMobile(){toggleLang();}

/* ══ DARK MODE ══ */
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

/* ── Custom confirm modal ── */
let _confirmCallback=null;
function showConfirmModal(msg,onConfirm,okLabel){
  const msgEl=document.getElementById('confirmModalMsg');
  const okBtn=document.getElementById('confirmOkBtn');
  const cancelBtn=document.getElementById('confirmCancelBtn');
  if(msgEl)msgEl.innerHTML=escapeHTML(msg);
  const okTxt=okLabel||(typeof _lang!=='undefined'&&_lang==='en'?'Delete':'Hapus');
  if(okBtn)okBtn.textContent=okTxt;
  if(cancelBtn)cancelBtn.textContent=_lang==='en'?'Cancel':'Batal';
  _confirmCallback=onConfirm;
  if(okBtn)okBtn.onclick=()=>{const cb=_confirmCallback;closeConfirmModal();if(cb)cb();};
  openModal('confirmModal');
}
function closeConfirmModal(){closeModal('confirmModal');_confirmCallback=null;}

/* ══ MODALS ══ */
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
function openModal(id){
  const el=document.getElementById(id);if(!el)return;
  el.classList.add('on');document.body.style.overflow='hidden';_attachFocusTrap(el);
}
function closeModal(id){
  const el=document.getElementById(id);if(!el)return;
  el.classList.remove('on');_detachFocusTrap();
  if(!document.querySelector('.overlay.on'))document.body.style.overflow='';
}

/* ══ LOGIN ══ */
function buildLoginDropdown(){
  const sel=document.getElementById('loginName');if(!sel)return;
  sel.innerHTML=`<option value="">${tx('loginSelectDefault')}</option>`;
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
    const res=await fetch(`${SUPA_URL}/functions/v1/verify-login`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPA_KEY}`},body:JSON.stringify({username:name,password:pw})});
    const data=await res.json();
    if(!data.success){err.style.display='block';btn.disabled=false;btn.textContent=tx('loginSubmitBtn');return;}
    localStorage.setItem('naposo_token',data.token||'1');
    localStorage.setItem('naposo_admin_name',name);
    isAdmin=true;closeModal('loginModal');_applyAdminUI(name);_applyRoleBadge();loadAdminActivityLog();
    renderEvents();renderDocs();renderDocAdmList();
    showToast('Selamat datang, '+name+'! 👋','ok');
  }catch(e){err.style.display='block';}
  btn.disabled=false;btn.textContent=tx('loginSubmitBtn');
}
function confirmLogout(){
  if(window.confirm('Keluar dari mode admin?')){doLogout();}
}
function doLogout(){
  isAdmin=false;localStorage.removeItem('naposo_token');localStorage.removeItem('naposo_admin_name');
  const dd=document.getElementById('adminDd');if(dd)dd.classList.remove('open');
  const dot=document.getElementById('adminActiveDot');if(dot)dot.style.display='none';
  _resetAuthUI();renderEvents();renderDocs();closeBnSheet();showToast('Logout berhasil.');
}
function togglePw(inputId){const inp=document.getElementById(inputId);if(!inp)return;inp.type=inp.type==='text'?'password':'text';}
function _applyAdminUI(name){
  _adminName=name;document.body.classList.add('is-admin');
  const dot=document.getElementById('adminActiveDot');if(dot)dot.style.display='inline-block';
  _applyRoleBadge();
  const loginBtn=document.getElementById('loginBtn');if(loginBtn){loginBtn.textContent=`✓ ${name}`;loginBtn.disabled=false;}
  const loginBtnMob=document.getElementById('loginBtnMobile');if(loginBtnMob)loginBtnMob.style.display='none';
  const amr=document.getElementById('adminMobileRow');if(amr)amr.style.display='flex';
  const ant=document.getElementById('adminMobileNameTxt');if(ant)ant.textContent=name;
  const bar=document.getElementById('adminBar');if(bar)bar.classList.add('on');
  const abt=document.getElementById('adminBarTxt');if(abt)abt.textContent=(_lang==='en'?'Hello, ':'Halo, ')+name+'.';
  const statPill=document.getElementById('navStatPill');if(statPill)statPill.style.display='';
  _syncBnAdminUI(name);
}
function _resetAuthUI(){
  _adminName='';document.body.classList.remove('is-admin');
  const dot=document.getElementById('adminActiveDot');if(dot)dot.style.display='none';
  const loginBtn=document.getElementById('loginBtn');
  if(loginBtn){loginBtn.innerHTML=`🔐 <span id="loginBtnTxt">${tx('loginBtnTxt')}</span>`;loginBtn.disabled=false;}
  const loginBtnMob=document.getElementById('loginBtnMobile');if(loginBtnMob)loginBtnMob.style.display='';
  const amr=document.getElementById('adminMobileRow');if(amr)amr.style.display='none';
  const bar=document.getElementById('adminBar');if(bar)bar.classList.remove('on');
  _syncBnAdminUI(null);applyLang();
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){const po=document.getElementById('posterOverlay');if(po&&po.classList.contains('on')){closePosterModalDirect();return;}}
});
document.addEventListener('click',e=>{
  const anchor=document.getElementById('adminDdAnchor');const dd=document.getElementById('adminDd');
  if(dd&&anchor&&!anchor.contains(e.target))dd.classList.remove('open');
  const panel=document.getElementById('hdrMenuPanel'),btn=document.getElementById('hamburgerBtn');
  if(panel&&btn&&!panel.contains(e.target)&&!btn.contains(e.target))panel.classList.remove('open');
});

/* ══════════════════════════════
   BANNER DINAMIS (tabel announcements)
   ══════════════════════════════ */
async function loadBanners(){
  try{
    const rows=await dbGet('announcements','select=*&active=eq.true&order=updated_at.desc');
    BANNERS=rows||[];
    _renderBanners();
  }catch(e){}
}

function _renderBanners(){
  const container=document.getElementById('bannerContainer');if(!container)return;
  container.innerHTML='';
  BANNERS.forEach(b=>{
    const dismissKey='banner_dismissed_'+b.id+'_'+(b.updated_at||'');
    if(localStorage.getItem(dismissKey))return;
    const bar=document.createElement('div');
    bar.className='announce-bar on';
    bar.style.background=b.color||'#1e5ac8';
    bar.dataset.bid=b.id;
    bar.innerHTML=`
      <span class="announce-icon">📋</span>
      <div class="announce-content">
        <div class="announce-title">${escapeHTML(b.text||'')}</div>
      </div>
      ${b.link?`<a class="announce-cta" href="${escapeHTML(b.link)}" target="_blank" rel="noopener">${escapeHTML(b.link_label||'Selengkapnya →')}</a>`:''}
      <button class="announce-close" onclick="dismissBanner('${b.id}','${b.updated_at||''}')" aria-label="Tutup">✕</button>`;
    container.appendChild(bar);
  });
}

function dismissBanner(id,updatedAt){
  const key='banner_dismissed_'+id+'_'+updatedAt;
  localStorage.setItem(key,'1');
  const bar=document.querySelector(`.announce-bar[data-bid="${id}"]`);
  if(bar)bar.remove();
}

/* ══ ADMIN — KELOLA BANNER (panel di kalender.html) ══
   Di index.html, admin membuka modal yang lebih sederhana:
   list banner aktif + tombol tambah/edit/hapus */
let _editBannerId=null;

function openAnnounceModal(){
  document.getElementById('adminDd').classList.remove('open');
  closeHamburger();
  _editBannerId=null;
  _resetBannerForm();
  _loadBannerList();
  openModal('announceModal');
}

async function _loadBannerList(){
  const list=document.getElementById('bannerAdmList');if(!list)return;
  list.innerHTML=`<div style="font-size:.78rem;color:var(--text3)">${tx('bannerAdmLoading')}</div>`;
  try{
    const rows=await dbGet('announcements','select=*&order=updated_at.desc');
    _BANNERS_ALL=rows||[];
    _renderBannerAdmList();
  }catch(e){list.innerHTML=`<div style="font-size:.78rem;color:var(--red)">${tx('bannerAdmError')}</div>`;}
}
function _renderBannerAdmList(){
  const list=document.getElementById('bannerAdmList');if(!list)return;
  if(!_BANNERS_ALL.length){list.innerHTML=`<div style="font-size:.78rem;color:var(--text3);padding:8px 0">${tx('bannerAdmEmpty')}</div>`;return;}
  list.innerHTML=_BANNERS_ALL.map(b=>`
      <div class="banner-adm-item" style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">
        <div style="width:12px;height:12px;border-radius:50%;background:${b.color||'#1e5ac8'};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHTML(b.text||'')}</div>
          <div style="font-size:.7rem;color:var(--text3)">${b.active?tx('bannerActiveStatus'):tx('bannerInactiveStatus')}</div>
        </div>
        <button class="btn btn-ghost btn-sm" title="${b.active?'Nonaktifkan':'Aktifkan'}" onclick="toggleBannerActive('${b.id}')">${b.active?'👁':'👁‍🗨'}</button>
        <button class="btn btn-ghost btn-sm" onclick="editBanner('${b.id}')">✎</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="deleteBanner('${b.id}')">×</button>
      </div>`).join('');
}

function _resetBannerForm(){
  _editBannerId=null;
  document.getElementById('annText').value='';
  document.getElementById('annColor').value='#1e5ac8';
  document.getElementById('annLink').value='';
  document.getElementById('annLinkLabel').value='';
  document.getElementById('annActiveCheck').checked=true;
  const title=document.getElementById('bannerFormTitle');if(title)title.textContent=tx('bannerFormTitleAdd');
  const btn=document.getElementById('annSaveBtn');if(btn)btn.textContent=tx('bannerSaveBtnAdd');
  const cancel=document.getElementById('annCancelBtn');if(cancel)cancel.style.display='none';
}

async function editBanner(id){
  try{
    const rows=await dbGet('announcements',`select=*&id=eq.${id}`);
    if(!rows||!rows.length)return;
    const b=rows[0];
    _editBannerId=id;
    document.getElementById('annText').value=b.text||'';
    document.getElementById('annColor').value=b.color||'#1e5ac8';
    document.getElementById('annLink').value=b.link||'';
    document.getElementById('annLinkLabel').value=b.link_label||'';
    document.getElementById('annActiveCheck').checked=!!b.active;
    const title=document.getElementById('bannerFormTitle');if(title)title.textContent=tx('bannerFormTitleEdit');
    const btn=document.getElementById('annSaveBtn');if(btn)btn.textContent=tx('bannerSaveBtnEdit');
    const cancel=document.getElementById('annCancelBtn');if(cancel)cancel.style.display='';
    document.getElementById('annText').focus();
  }catch(e){showToast('Gagal load banner.','err');}
}

async function saveAnnounce(){
  const text=document.getElementById('annText').value.trim();
  if(!text){showToast('Teks banner wajib diisi.','err');return;}
  const payload={
    text,
    color:document.getElementById('annColor').value||'#1e5ac8',
    link:document.getElementById('annLink').value.trim()||null,
    link_label:document.getElementById('annLinkLabel').value.trim()||null,
    active:document.getElementById('annActiveCheck').checked,
    updated_at:new Date().toISOString(),
  };
  const btn=document.getElementById('annSaveBtn');btn.disabled=true;
  try{
    if(_editBannerId){
      await dbWrite('announcements','UPDATE',payload,{id:_editBannerId});
      showToast('Banner diperbarui ✓','ok');
    }else{
      await dbWrite('announcements','INSERT',payload,null);
      showToast('Banner ditambahkan ✓','ok');
    }
    _resetBannerForm();
    await _loadBannerList();
    await loadBanners(); // refresh beranda
  }catch(e){showToast('Gagal: '+e.message,'err');}
  btn.disabled=false;btn.textContent=_editBannerId?tx('bannerSaveBtnEdit'):tx('bannerSaveBtnAdd');
}

async function deleteBanner(id){
  showConfirmModal('Hapus banner ini?',async()=>{
    try{
      await dbWrite('announcements','DELETE',null,{id});
      showToast('Banner dihapus.','ok');
      await _loadBannerList();
      await loadBanners();
    }catch(e){showToast('Gagal: '+e.message,'err');}
  });
}

async function toggleBannerActive(id){
  const b=_BANNERS_ALL.find(x=>x.id===id);if(!b)return;
  const newActive=!b.active;
  try{
    await dbWrite('announcements','UPDATE',{active:newActive,updated_at:new Date().toISOString()},{id});
    const idx=_BANNERS_ALL.findIndex(x=>x.id===id);if(idx>-1)_BANNERS_ALL[idx]={..._BANNERS_ALL[idx],active:newActive};
    _renderBannerAdmList();
    BANNERS=_BANNERS_ALL.filter(x=>x.active);_renderBanners();
    showToast(newActive?'Banner diaktifkan ✓':'Banner disembunyikan','ok');
  }catch(e){showToast('Gagal: '+e.message,'err');}
}
// Legacy compat — closeBanner tidak dipakai lagi tapi aman jika masih dipanggil dari HTML lama
function closeBanner(){
  const el=document.getElementById('announceBanner');if(el)el.classList.remove('on');
}

/* ══ EVENTS ══ */
/* ══ SEARCH BERANDA ══ */
let _searchQuery='';
let _revPostsCache=null;
let _searchDebounce=null;
let _searchReqId=0; // counter untuk guard race condition

function onHomepageSearch(val){
  const q=(val||'').trim();
  const clearBtn=document.getElementById('searchClearBtn');
  if(clearBtn)clearBtn.style.display=q?'':'none';
  clearTimeout(_searchDebounce);
  if(!q){closeSearchDropdown();_searchQuery='';return;}
  _searchQuery=q.toLowerCase();
  _searchDebounce=setTimeout(()=>_renderSearchDropdown(_searchQuery),200);
}

function onSearchKeydown(e){
  if(e.key==='Escape'){clearHomepageSearch();}
}

function clearHomepageSearch(){
  const inp=document.getElementById('homepageSearch');
  if(inp)inp.value='';
  onHomepageSearch('');
}

function closeSearchDropdown(){
  const dd=document.getElementById('searchDropdown');
  if(dd){dd.style.display='none';dd.innerHTML='';}
}

// Tutup dropdown saat klik di luar
document.addEventListener('click',e=>{
  const wrap=document.getElementById('searchWrap');
  const dd=document.getElementById('searchDropdown');
  if(dd&&wrap&&!wrap.contains(e.target)&&!dd.contains(e.target))closeSearchDropdown();
});

// Reposisi dropdown saat scroll
window.addEventListener('scroll',()=>{
  const dd=document.getElementById('searchDropdown');
  if(!dd||dd.style.display==='none')return;
  const wrap=document.getElementById('searchWrap');
  if(!wrap)return;
  const rect=wrap.getBoundingClientRect();
  dd.style.top=(rect.bottom+6)+'px';
  dd.style.left=rect.left+'px';
},{ passive:true });

async function _renderSearchDropdown(q){
  const dd=document.getElementById('searchDropdown');
  const wrap=document.getElementById('searchWrap');
  if(!dd||!wrap)return;

  // Guard race condition — kalau query berubah saat fetch masih berjalan, abaikan response lama
  const reqId=++_searchReqId;

  // Posisikan dropdown tepat di bawah search bar
  const rect=wrap.getBoundingClientRect();
  dd.style.top=(rect.bottom+6)+'px';
  dd.style.left=rect.left+'px';
  dd.style.width=rect.width+'px';
  dd.style.display='block';
  dd.innerHTML='<div class="sd-loading">🔍 Mencari…</div>';

  // Cari events
  const MS_=_lang==='en'?MS_EN:MS_ID;
  const evResults=EVENTS.filter(e=>(isAdmin||e.status!=='draft')&&(
    e.title.toLowerCase().includes(q)||
    (e.note||'').toLowerCase().includes(q)||
    catLabel(e.category).toLowerCase().includes(q)
  )).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);

  // Cari renungan
  if(!_revPostsCache){
    try{_revPostsCache=await dbGet('reversement_posts','select=id,title,verse_ref,date,day_type&published=eq.true&order=date.desc');}
    catch(e){_revPostsCache=[];}
  }
  // Cek setelah await — kalau sudah ada request lebih baru, batalkan
  if(reqId!==_searchReqId)return;
  const revResults=(_revPostsCache||[]).filter(p=>
    (p.title||'').toLowerCase().includes(q)||
    (p.verse_ref||'').toLowerCase().includes(q)
  ).slice(0,4);

  if(!evResults.length&&!revResults.length){
    dd.innerHTML=`<div class="sd-empty">Tidak ada hasil untuk "<strong>${escapeHTML(q)}</strong>"</div>`;
    return;
  }

  let html='';

  if(evResults.length){
    html+=`<div class="sd-group-title">📅 Kegiatan (${evResults.length})</div>`;
    html+=evResults.map(ev=>{
      const d=new Date(ev.date+'T00:00:00');
      const dateStr=`${d.getDate()} ${MS_[d.getMonth()]} ${d.getFullYear()}`;
      const col=catColor(ev.category);
      return `<div class="sd-item" onclick="window.location.href='kalender.html?date=${ev.date}'">
        <span style="width:8px;height:8px;border-radius:50%;background:${col};flex-shrink:0;margin-top:5px"></span>
        <div style="flex:1;min-width:0">
          <div class="sd-item-title">${_hl(ev.title,q)}</div>
          <div class="sd-item-sub">${catLabel(ev.category)} · ${dateStr}</div>
        </div>
        <span style="font-size:.7rem;color:var(--text3);flex-shrink:0;align-self:center">→</span>
      </div>`;
    }).join('');
  }

  if(revResults.length){
    html+=`<div class="sd-group-title" style="margin-top:${evResults.length?'4px':'0'}">✝️ Renungan (${revResults.length})</div>`;
    html+=revResults.map(p=>{
      const d=new Date(p.date+'T00:00:00');
      const MS2=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      const dateStr=`${d.getDate()} ${MS2[d.getMonth()]} ${d.getFullYear()}`;
      const dayLbl=p.day_type==='senin'?'Senin':'Jumat';
      return `<div class="sd-item" onclick="window.location.href='reversement.html?id=${encodeURIComponent(p.id)}'">
        <span style="font-size:.65rem;padding:1px 6px;border-radius:8px;background:rgba(139,92,246,.15);color:#8b5cf6;font-weight:700;flex-shrink:0;margin-top:2px">${dayLbl}</span>
        <div style="flex:1;min-width:0">
          <div class="sd-item-title">${_hl(p.title,q)}</div>
          <div class="sd-item-sub">${p.verse_ref?'📖 '+_hl(p.verse_ref,q)+' · ':''} ${dateStr}</div>
        </div>
        <span style="font-size:.7rem;color:var(--text3);flex-shrink:0;align-self:center">→</span>
      </div>`;
    }).join('');
  }

  // Footer
  html+=`<div class="sd-footer">
    <a href="kalender.html">Semua Kegiatan →</a>
    <a href="reversement.html">Semua Renungan →</a>
  </div>`;

  dd.innerHTML=html;
}

function _hl(text,q){
  if(!text)return '';
  const safe=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const i=safe.toLowerCase().indexOf(q.toLowerCase());
  if(i===-1)return safe;
  return safe.slice(0,i)+`<mark style="background:rgba(201,162,39,.35);border-radius:2px;padding:0 1px">${safe.slice(i,i+q.length)}</mark>`+safe.slice(i+q.length);
}

function getDisplayEvents(){
  const today=new Date();today.setHours(0,0,0,0);
  const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  function isPast(ev){return ev.date<todayStr;}
  function sortAsc(a,b){return a.date.localeCompare(b.date)||((a.time||'').localeCompare(b.time||''));}
  // Selalu tampil upcoming, tidak difilter search (search pakai dropdown)
  const eligible=EVENTS.filter(e=>isAdmin||e.status!=='draft');
  const pinnedUpcoming=eligible.filter(e=>e.featured&&!isPast(e)).sort(sortAsc);
  const autoUpcoming  =eligible.filter(e=>!e.featured&&!isPast(e)).sort(sortAsc);
  const isMobile=window.innerWidth<=560;
  const LIMIT=6;
  const sisa=Math.max(0,LIMIT*2-pinnedUpcoming.length);
  const combined=[...pinnedUpcoming,...autoUpcoming.slice(0,sisa)];
  combined.sort((a,b)=>{
    const dateCmp=a.date.localeCompare(b.date);
    if(dateCmp!==0)return dateCmp;
    if(a.featured!==b.featured)return a.featured?-1:1;
    return (a.time||'').localeCompare(b.time||'');
  });
  return combined.slice(0,LIMIT);
}

function renderSkeletonEvents(){
  const grid=document.getElementById('eventsGrid');if(!grid)return;
  grid.innerHTML=Array(6).fill(0).map(()=>`<div class="sk-card"><div class="sk-img"></div><div class="sk-body"><div class="sk-line sk-line-sm"></div><div class="sk-line sk-line-lg"></div><div class="sk-line sk-line-md"></div><div class="sk-line sk-line-xs"></div></div></div>`).join('');
}

function renderEvents(){
  const grid=document.getElementById('eventsGrid');if(!grid)return;
  const evs=getDisplayEvents();
  const MS=_lang==='en'?MS_EN:MS_ID;
  if(!evs.length){
    const emptyMsg=`<div class="ev-empty-state"><div class="ev-empty-state-icon">📅</div><div class="ev-empty-state-title">${_lang==='en'?'No upcoming events':'Belum ada kegiatan'}</div><div class="ev-empty-state-sub">${_lang==='en'?'Check back soon.':'Jadwal kegiatan akan muncul di sini.'}</div></div>`;
    grid.innerHTML=emptyMsg;return;
  }
  const todayStr=localDateStr();
  const nowHHMM=new Date().toTimeString().slice(0,5);
  grid.innerHTML=evs.map((ev,idx)=>{
    const d=new Date(ev.date+'T00:00:00');
    const col=catColor(ev.category);
    const isPast=ev.date<todayStr;const sameDay=ev.date===todayStr;
    const endTime=ev.time_end||(ev.time?ev.time.split(/[–-]/).pop().trim():'');
    const isFinished=isPast||(sameDay&&!!endTime&&endTime<=nowHHMM);
    const isDraft=ev.status==='draft';
    const note=ev.note||'';
    let timeStr='';
    if(ev.time_start&&ev.time_end)timeStr=`${ev.time_start}\u2013${ev.time_end}`;
    else if(ev.time)timeStr=ev.time;
    let extraParts=[];
    if(ev.extra){
      if(ev.extra.judul_lagu)extraParts.push('\ud83c\udfb5 '+ev.extra.judul_lagu);
      if(ev.extra.tema_acara)extraParts.push('\ud83d\udcd6 '+ev.extra.tema_acara);
      if(ev.extra.variant&&ev.category==='olahraga')extraParts.push('\u26bd '+ev.extra.variant);
    }
    const dayNum=d.getDate();const monStr=MS[d.getMonth()];const yrStr=d.getFullYear();
    const catThumb=getCatThumb(ev);
    // thumbnail_url (16:9) diutamakan untuk card; fallback ke catThumb
    const thumbSrc=ev.thumbnail_url?driveToThumbnail(ev.thumbnail_url):catThumb;
    const hasImg=!!thumbSrc;
    const fallbackSrc=catThumb||'';
    const onerrorAttr=fallbackSrc?`onerror="if(this.src!=='${fallbackSrc}'){this.src='${fallbackSrc}';}else{this.style.display='none';}this.onerror=null;"`:`onerror="this.style.display='none';this.onerror=null;"`;
    // thumbnail_url → aspect-ratio normal; catThumb → object-position:top (fallback poster 9:16)
    const thumbStyle=ev.thumbnail_url?'object-fit:cover':'object-position:top center';
    const imgWrap=hasImg
      ?`<div class="ev-card-img-wrap" onclick="openPosterModal('${ev.id}')"><img src="${thumbSrc}" loading="lazy" alt="${escapeHTML(ev.title)}" class="ev-card-poster" style="${thumbStyle}" ${onerrorAttr}><div class="ev-card-img-overlay">\ud83d\udd0d Lihat Poster</div></div>`
      :`<div class="ev-card-img-wrap ev-card-img-placeholder" onclick="openPosterModal('${ev.id}')" style="background:linear-gradient(135deg,${col}18,${col}38);"><div class="ev-card-poster-ph-icon" style="font-size:2.2rem">${catIcon(ev.category)}</div><div class="ev-card-poster-ph-label" style="font-size:10px;font-weight:700;color:${col};margin-top:4px;letter-spacing:.05em">${catLabel(ev.category)}</div></div>`;
    let countdownHtml='';
    if(!isFinished){
      const todayDate=new Date(todayStr+'T00:00:00');const evDate=new Date(ev.date+'T00:00:00');
      const diffDays=Math.round((evDate-todayDate)/(1000*60*60*24));
      if(diffDays===0)countdownHtml=`<span class="ev-countdown ev-countdown-today">\ud83d\udd14 ${_lang==='en'?'Today!':'Hari ini!'}</span>`;
      else if(diffDays===1)countdownHtml=`<span class="ev-countdown">\ud83d\udcc5 ${_lang==='en'?'Tomorrow!':'Besok!'}</span>`;
      else if(diffDays>1)countdownHtml=`<span class="ev-countdown">\u23f3 ${diffDays} ${_lang==='en'?'days away':'hari lagi'}</span>`;
    }
    const delay=idx*55;
    const isBday=isBirthdayEv(ev);
    const isToday=ev.date===todayStr;
    const bdayNama=isBday&&ev.extra&&ev.extra.nama?ev.extra.nama:'';
    const finalImgWrap=imgWrap; // thumbnail_url jika ada, fallback catThumb

    return `<div class="ev-card card-animate${isFinished?' ev-card-past':''}${isDraft?' ev-card-draft':''}${isBday?' ev-card-bday':''}${isBday&&isToday?' ev-card-bday-today':''}" style="animation-delay:${delay}ms">
      ${isDraft?'<div class="ev-draft-badge">Draft</div>':''}
      ${isBday&&isToday?'<div class="ev-bday-shimmer"></div>':''}
      ${finalImgWrap}
      <div class="ev-card-accent" style="background:${col}"></div>
      <div class="ev-card-body">
        <div class="ev-card-top">
          <div style="display:flex;flex-direction:column;gap:4px;min-width:0">
          <div class="ev-card-date"><span class="day">${dayNum}</span><span class="sep">\u00b7</span><span class="mon">${monStr}</span><span class="sep">\u00b7</span><span class="yr">${yrStr}</span></div>
          ${isBday&&isToday?`<span class="ev-countdown ev-countdown-bday">🎉 ${_lang==='en'?'Today!':'Hari ini!'}</span>`:countdownHtml}
          </div>
          <div class="ev-card-admin">
            <button class="ev-card-edit-btn" onclick="openEditEvent('${ev.id}');event.stopPropagation()">✎ ${_lang==='en'?'Edit':'Ubah'}</button>
            <button class="ev-card-unfeature-btn${ev.featured?' is-pinned':''}" onclick="toggleFeatured('${ev.id}',${!!ev.featured});event.stopPropagation()">${ev.featured?'\u2605':'\u2606'}</button>
          </div>
        </div>
        ${isBday&&bdayNama?`<div class="ev-card-bday-name">🎂 ${escapeHTML(bdayNama)}</div>`:''}
        <div class="ev-card-title">${escapeHTML(ev.title)}</div>
        <div class="ev-card-meta">
          <span class="ev-cat-badge" style="background:${col};cursor:pointer" onclick="window.location.href='kalender.html?cat='+encodeURIComponent('${ev.category}')" title="Filter di Kalender">${catLabel(ev.category)}</span>
          ${timeStr?`<span class="ev-card-time">\u23f0 ${timeStr}`:''}
          ${isFinished?`<span style="display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(220,38,38,.1);color:var(--red);border:1px solid rgba(220,38,38,.2)">${_lang==='en'?'\u2713 Finished':'\u2713 Sudah Selesai'}</span>`:''}
        </div>
        ${extraParts.length?`<div style="font-size:11px;color:var(--text3)">${extraParts.join(' \u00b7 ')}</div>`:''}
        ${note?`<div class="ev-card-note">${escapeHTML(note).slice(0,120)}${note.length>120?'\u2026':''}</div>`:''}
      </div>
    </div>`;
  }).join('');
  initScrollIndicator();
}

/* ══ SCROLL INDICATOR ══ */
function initScrollIndicator(){
  const grid=document.getElementById('eventsGrid');
  const track=document.getElementById('evScrollTrack');
  const thumb=document.getElementById('evScrollThumb');
  const dotsWrap=document.getElementById('evDots');
  const hint=document.getElementById('evSwipeHint');
  if(!grid)return;
  const isMob=window.innerWidth<=560;
  const cards=grid.querySelectorAll('.ev-card,.sk-card');
  const total=cards.length;
  if(!total)return;
  // ── progress bar (desktop/tablet) ──
  if(track&&thumb&&!isMob){
    track.classList.add('visible');
    const updateTrack=()=>{
      const max=grid.scrollWidth-grid.clientWidth;
      if(max<=0){track.classList.remove('visible');return;}
      const pct=grid.scrollLeft/max;
      const thumbW=Math.max(20,Math.round((grid.clientWidth/grid.scrollWidth)*100));
      thumb.style.width=thumbW+'%';
      thumb.style.marginLeft=Math.round(pct*(100-thumbW))+'%';
    };
    grid.addEventListener('scroll',updateTrack,{passive:true});
    updateTrack();
  }
  // ── dots (mobile) ──
  if(dotsWrap&&isMob){
    dotsWrap.innerHTML=Array.from({length:total},(_,i)=>'<div class="ev-dot'+(i===0?' active':'')+'"></div>').join('');
    const dots=dotsWrap.querySelectorAll('.ev-dot');
    const updateDots=()=>{
      const cardW=cards[0].offsetWidth+16;
      const idx=Math.min(total-1,Math.round(grid.scrollLeft/cardW));
      dots.forEach((d,i)=>d.classList.toggle('active',i===idx));
    };
    grid.addEventListener('scroll',updateDots,{passive:true});
  }
  // ── swipe hint (mobile, one-time) ──
  if(hint&&isMob){
    const KEY='naposo_swipe_seen';
    if(!localStorage.getItem(KEY)){
      hint.classList.add('show');
      localStorage.setItem(KEY,'1');
      setTimeout(()=>hint.classList.remove('show'),3200);
    }
  }
}

/* ══ GOOGLE CALENDAR LINK ══ */
function buildGCalLink(ev){
  const title=encodeURIComponent(ev.title||'');
  const dateStr=ev.date.replace(/-/g,'');
  let dates='';
  if(ev.time_start&&ev.time_end){
    const ts=ev.time_start.replace(':','')+'00';
    const te=ev.time_end.replace(':','')+'00';
    dates=`${dateStr}T${ts}/${dateStr}T${te}`;
  }else{
    // all-day: DTEND = day+1
    const d=new Date(ev.date+'T00:00:00');d.setDate(d.getDate()+1);
    const next=d.toISOString().slice(0,10).replace(/-/g,'');
    dates=`${dateStr}/${next}`;
  }
  const details=encodeURIComponent(ev.note||'');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}

/* ══ POSTER MODAL ══ */
function openPosterModal(evId){
  const ev=EVENTS.find(e=>e.id===evId);if(!ev)return;
  const MS=_lang==='en'?MS_EN:MS_ID;
  const d=new Date(ev.date+'T00:00:00');
  const col=catColor(ev.category);
  const catThumb=getCatThumb(ev);
  // Birthday: pakai poster_url dari extra kalau ada, fallback ke catThumb
  const posterSrc=isBirthdayEv(ev)&&ev.extra&&ev.extra.poster_url
    ?driveToThumbnail(ev.extra.poster_url)
    :catThumb;
  const img=document.getElementById('pmImg');
  if(img){
    if(posterSrc){img.src=posterSrc;img.style.display='block';img.onerror=()=>{if(catThumb&&img.src!==catThumb){img.src=catThumb;}else{img.style.display='none';}img.onerror=null;};}
    else{img.src='';img.style.display='none';}
  }
  const pmImgWrap=document.getElementById('pmImgWrap');
  if(pmImgWrap){if(posterSrc){pmImgWrap.style.background='#000';pmImgWrap.style.display='flex';}else{pmImgWrap.style.background=`linear-gradient(135deg,${col}22,${col}44)`;pmImgWrap.style.display='flex';}}
  const title=document.getElementById('pmTitle');if(title)title.textContent=ev.title;
  const dateEl=document.getElementById('pmDate');
  if(dateEl){let timeStr='';if(ev.time_start&&ev.time_end)timeStr=` · ${ev.time_start}–${ev.time_end}`;else if(ev.time)timeStr=` · ${ev.time}`;dateEl.innerHTML=`📅 ${d.getDate()} ${MS[d.getMonth()]} ${d.getFullYear()}${timeStr}`;}
  const meta=document.getElementById('pmMeta');
  if(meta){
    const _ts=localDateStr();const _hm=new Date().toTimeString().slice(0,5);
    const _et=ev.time_end||(ev.time?ev.time.split(/[-–]/).pop().trim():'');
    const _fin=(ev.date<_ts)||(ev.date===_ts&&!!_et&&_et<=_hm);
    let _cb='';
    if(_fin){_cb='<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(220,38,38,.12);color:var(--red);border:1px solid rgba(220,38,38,.2)">\u2713 Sudah Selesai</span>';}
    else{const _dd=Math.round((new Date(ev.date+'T00:00:00')-new Date(_ts+'T00:00:00'))/86400000);
      if(_dd===0){_cb=`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(234,179,8,.15);color:#ca8a04;border:1px solid rgba(234,179,8,.3)">\ud83d\udd14 ${_lang==='en'?'Today!':'Hari ini!'}</span>`;}
      else if(_dd===1){_cb=`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(59,130,246,.12);color:var(--blue);border:1px solid rgba(59,130,246,.25)">\ud83d\udcc5 ${_lang==='en'?'Tomorrow!':'Besok!'}</span>`;}
      else if(_dd>1){_cb='<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(59,130,246,.12);color:var(--blue);border:1px solid rgba(59,130,246,.25)">\u23f3 '+_dd+' hari lagi</span>';}
    }
    meta.innerHTML='<span class="ev-cat-badge" style="background:'+col+';font-size:11px;padding:3px 10px">'+catLabel(ev.category)+'</span>'+_cb;
  }
  const capEl=document.getElementById('pmCaption');
  if(capEl){const cap=ev.caption||'';if(cap){capEl.textContent=cap;capEl.style.display='block';}else capEl.style.display='none';}
  const extraEl=document.getElementById('pmExtra');
  if(extraEl){
    const parts=[];
    if(ev.extra){
      if(ev.extra.judul_lagu)parts.push(`🎵 ${escapeHTML(ev.extra.judul_lagu)}`);
      if(ev.extra.tema_acara)parts.push(`📖 ${escapeHTML(ev.extra.tema_acara)}`);
      if(ev.extra.variant&&ev.category==='olahraga')parts.push(`⚽ ${escapeHTML(ev.extra.variant)}`);
      if(ev.extra.link_guide)parts.push(`📌 Link Guide: <a href="${escapeHTML(ev.extra.link_guide)}" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:underline;word-break:break-all">${escapeHTML(ev.extra.link_guide)}</a>`);
    }
    if(parts.length){extraEl.innerHTML=parts.join('<br>');extraEl.style.display='flex';}
    else extraEl.style.display='none';
  }
  const noteEl=document.getElementById('pmNote');
  if(noteEl){const n=ev.note||'';if(n){noteEl.textContent=n;noteEl.style.display='block';}else noteEl.style.display='none';}
  const actEl=document.getElementById('pmActions');
  if(actEl){
    let btns='';
    if(ev.link)btns+=`<a class="btn btn-primary btn-sm" href="${escapeHTML(ev.link)}" target="_blank" rel="noopener">🔗 ${_lang==='en'?'Open Link':'Buka Link'}</a>`;
    const urlMatch=(ev.note||'').match(/(https?:\/\/[^\s]+)/);
    if(urlMatch&&!ev.link)btns+=`<a class="btn btn-primary btn-sm" href="${urlMatch[1]}" target="_blank" rel="noopener">🔗 Buka Link</a>`;
    // Google Calendar
    btns+=`<a class="btn btn-ghost btn-sm" href="${escapeHTML(buildGCalLink(ev))}" target="_blank" rel="noopener">📆 ${_lang==='en'?'Add to Calendar':'Tambah ke Kalender'}</a>`;
    btns+=`<a class="btn btn-ghost btn-sm" href="kalender.html?event=${encodeURIComponent(ev.id)}">📅 ${_lang==='en'?'View in Calendar':'Lihat di Kalender'}</a>`;
    if(isAdmin)btns+=`<button class="btn btn-ghost btn-sm" onclick="closePosterModalDirect();openEditEvent('${ev.id}')">✎ ${_lang==='en'?'Edit':'Ubah'}</button>`;
    actEl.innerHTML=btns;
  }
  // Galeri foto
  _loadPosterGallery(ev.id);
  document.getElementById('posterOverlay').classList.add('on');
  document.body.style.overflow='hidden';
}

async function _loadPosterGallery(evId){
  const wrap=document.getElementById('pmGallery');if(!wrap)return;
  wrap.innerHTML='';wrap.style.display='none';
  try{
    const rows=await dbGet('event_gallery',`select=*&event_id=eq.${evId}&order=order.asc,created_at.asc`);
    if(!rows||!rows.length)return;
    wrap.style.display='block';
    wrap.innerHTML=`<div class="pm-gallery-title">📸 Galeri</div><div class="pm-gallery-grid">${rows.map(r=>{const thumb=driveToThumbnail(r.drive_url);return `<div class="pm-gallery-item"><a href="${escapeHTML(r.drive_url)}" target="_blank" rel="noopener"><img src="${escapeHTML(thumb)}" alt="${escapeHTML(r.caption||'')}" loading="lazy" onerror="this.parentElement.parentElement.style.display='none'"></a>${r.caption?`<div class="pm-gallery-cap">${escapeHTML(r.caption)}</div>`:''}</div>`;}).join('')}</div>`;
  }catch(e){}
}

function closePosterModal(e){if(e&&e.target!==document.getElementById('posterOverlay'))return;closePosterModalDirect();}
function closePosterModalDirect(){document.getElementById('posterOverlay').classList.remove('on');document.body.style.overflow='';}

async function toggleFeatured(id,currentlyFeatured){
  try{
    await dbWrite('events','UPDATE',{featured:!currentlyFeatured},{id});
    const ev=EVENTS.find(e=>e.id===id);if(ev)ev.featured=!currentlyFeatured;
    localStorage.removeItem('naposo_featured_change');localStorage.setItem('naposo_featured_change',JSON.stringify({id,featured:!currentlyFeatured,ts:Date.now()}));
    renderEvents();showToast(currentlyFeatured?'Dihapus dari beranda.':'Ditambahkan ke beranda. ⭐','ok');
  }catch(e){showToast('Gagal: '+e.message,'err');}
}

/* ══ UBAH KEGIATAN ══ */
function buildCatDropdown(){
  const sel=document.getElementById('editCat');if(!sel)return;
  sel.innerHTML='';Object.keys(CATS).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=catLabel(k);sel.appendChild(o);});
  sel.onchange=updateEditExtraField;
}
function openEditEvent(id){
  const ev=EVENTS.find(e=>e.id===id);if(!ev)return;
  buildCatDropdown();
  document.getElementById('editEventId').value=id;
  document.getElementById('editTitle').value=ev.title||'';
  document.getElementById('editDate').value=ev.date||'';
  if(ev.time_start){document.getElementById('editTimeStart').value=ev.time_start;}
  else if(ev.time){const parts=ev.time.split(/[–\-]/);document.getElementById('editTimeStart').value=(parts[0]||'').trim();}
  else document.getElementById('editTimeStart').value='';
  if(ev.time_end){document.getElementById('editTimeEnd').value=ev.time_end;}
  else if(ev.time){const parts=ev.time.split(/[–\-]/);document.getElementById('editTimeEnd').value=(parts[1]||'').trim();}
  else document.getElementById('editTimeEnd').value='';
  document.getElementById('editCat').value=ev.category||'other';
  updateEditExtraField();
  populateEditExtraValues(ev);
  document.getElementById('editNote').value=ev.note||'';
  const lnkFld=document.getElementById('editLink');if(lnkFld)lnkFld.value=ev.link||'';
  const thumbFld=document.getElementById('editThumbnail');if(thumbFld)thumbFld.value=ev.thumbnail_url||'';
  document.getElementById('editFeatured').checked=!!ev.featured;
  const capFld=document.getElementById('editCaption');if(capFld)capFld.value=ev.caption||'';
  // Draft toggle
  const draftEl=document.getElementById('editDraft');if(draftEl)draftEl.checked=ev.status==='draft';
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
  const extraVal=null; // replaced by dynamic extra fields
  const note=document.getElementById('editNote').value.trim();
  const link=document.getElementById('editLink')?.value.trim()||'';
  const thumbnail_url=document.getElementById('editThumbnail')?.value.trim()||null;
  const featured=document.getElementById('editFeatured').checked;
  const status=document.getElementById('editDraft')?.checked?'draft':'published';
  if(!title||!date){showToast('Judul dan tanggal wajib diisi.','err');return;}
  const btn=document.getElementById('editSubmitBtn');btn.disabled=true;btn.textContent='...';
  let timeStr='';if(timeStart&&timeEnd)timeStr=`${timeStart}–${timeEnd}`;else if(timeStart)timeStr=timeStart;
  const extra=getEditExtraValues();
  try{
    const caption=document.getElementById('editCaption')?.value.trim()||'';
    const prev={...EVENTS.find(e=>e.id===id)};
    const payload={title,date,time:timeStr,time_start:timeStart||null,time_end:timeEnd||null,category,extra,note,link,thumbnail_url,featured,caption,status};
    const diff={};
    ['title','date','time','category','note','status','featured','thumbnail_url'].forEach(k=>{if(String(prev[k]??'')!==String(payload[k]??''))diff[k]={from:prev[k],to:payload[k]};});
    const log={event_id:id,admin_name:_adminName||'—',action:'update',diff:Object.keys(diff).length?diff:null};
    await dbWrite('events','UPDATE',payload,{id},log);
    const ev=EVENTS.find(e=>e.id===id);
    if(ev){Object.assign(ev,{...payload,time_start:timeStart,time_end:timeEnd});}
    closeModal('editEventModal');renderEvents();showToast('Tersimpan ✓','ok');
  }catch(e){showToast('Gagal: '+e.message,'err');}
  btn.disabled=false;btn.textContent=tx('editSubmitBtn');
}

let RECAP=[],RECAP_ALL=[];
async function renderRecap(){
  const el=document.getElementById('recapCarousel');if(!el)return;
  try{
    const rows=await dbGet('recap_items','select=*&active=eq.true&order=sort_order.asc');
    if(rows&&rows.length)RECAP=rows;
  }catch(e){}
  // fallback hardcode jika fetch gagal
  if(!RECAP.length)RECAP=[
    {id:'recap_natal2025',category:'ibadah',title:'Natal RN 2025',date:'2025-12-22',bg_color:'#7f1d1d',folder_id:'15-Q65ZNKw1yzO3nxx1aYNJ94eQh7v6QM'},
    {id:'recap_bonataon2026',category:'event-gabungan',title:'Bonataon RN',date:'2026-02-28',bg_color:'#065f46',folder_id:''},
    {id:'recap_paskah2026',category:'event-gabungan',title:'Paskah RN',date:'2026-04-04',bg_color:'#78350f',folder_id:''},
  ];
  el.innerHTML=RECAP.map(r=>{
    const meta=r.date?new Date(r.date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):'';
    const coverStyle=r.cover_url?`background-image:url('${escapeHTML(r.cover_url)}');background-size:cover;background-position:center`:'';
    // Item 3: count badge di card
    let countBadge='';
    if(r.photo_count!=null&&r.photo_count>0)countBadge=`<span class="recap-count-badge">📷 ${r.photo_count}</span>`;
    else if(r.folder_id)countBadge=`<span class="recap-count-badge">📷</span>`;
    return `<div class="recap-card" onclick="openRecapModal('${r.id}')" style="${coverStyle}"><div class="recap-overlay" style="background:${r.bg_color||'#1a2e5e'}"></div><div class="recap-gradient"></div><div class="recap-content"><span class="recap-tag">• ${catLabel(r.category).toUpperCase()}</span><div class="recap-title">${escapeHTML(r.title)}</div><div class="recap-meta-row"><span class="recap-meta">${meta}</span>${countBadge}</div></div></div>`;
  }).join('');
  renderRecapDots();
}
function renderRecapDots(){initRecapScrollIndicator();}
function updateRecapDots(){/* no-op */}
function updateRecapProgress(){
  const el=document.getElementById('recapCarousel');if(!el)return;
  const track=document.getElementById('recapScrollTrack');if(!track)return;
  const thumb=document.getElementById('recapScrollThumb');if(!thumb)return;
  const max=el.scrollWidth-el.clientWidth;
  if(max<=0){track.classList.remove('visible');return;}
  const pct=el.scrollLeft/max;
  const thumbW=Math.max(20,Math.round((el.clientWidth/el.scrollWidth)*100));
  thumb.style.width=thumbW+'%';
  thumb.style.marginLeft=Math.round(pct*(100-thumbW))+'%';
}
function initRecapScrollIndicator(){
  const el=document.getElementById('recapCarousel');if(!el)return;
  const track=document.getElementById('recapScrollTrack');if(!track)return;
  const thumb=document.getElementById('recapScrollThumb');if(!thumb)return;
  const max=el.scrollWidth-el.clientWidth;
  if(max<=0){track.classList.remove('visible');return;}
  track.classList.add('visible');
  updateRecapProgress();
  el.addEventListener('scroll',updateRecapProgress,{passive:true});
}
function recapScrollTo(idx){const el=document.getElementById('recapCarousel');if(!el)return;const card=el.querySelector('.recap-card');if(!card)return;el.scrollTo({left:idx*(card.offsetWidth+14),behavior:'smooth'});}
function recapScroll(dir){const el=document.getElementById('recapCarousel');if(!el)return;const card=el.querySelector('.recap-card');if(!card)return;el.scrollBy({left:dir*(card.offsetWidth+14),behavior:'smooth'});}

/* ══ RECAP MODAL ══ */
let _recapModal={id:null,tab:'photo',files:[],loading:false};
async function openRecapModal(recapId){
  const r=RECAP.find(x=>x.id===recapId);if(!r)return;
  _recapModal={id:recapId,tab:'photo',files:[],loading:true};
  document.getElementById('recapModalTag').textContent=catLabel(r.category).toUpperCase();
  document.getElementById('recapModalTitle').textContent=r.title;
  const meta=r.date?new Date(r.date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}):'';
  document.getElementById('recapModalDate').textContent=meta;
  document.getElementById('recapModalHero').style.background=r.bg_color||'#1a2e5e';
  if(r.cover_url){document.getElementById('recapModalHero').style.backgroundImage=`url('${escapeHTML(r.cover_url)}')`;document.getElementById('recapModalHero').style.backgroundSize='cover';document.getElementById('recapModalHero').style.backgroundPosition='center';}
  else{document.getElementById('recapModalHero').style.backgroundImage='';}
  _renderRecapModalTabs();
  openModal('recapModal');
  closeLightbox();
  // Item 4 (Sesi 55): tampilkan count dari DB langsung, diupdate lagi setelah fetch Drive selesai
  const badge=document.getElementById('recapModalCount');
  if(badge)badge.textContent=r.photo_count?`${r.photo_count} foto`:'';
  if(!r.folder_id){_recapModal.loading=false;_renderRecapGallery([]);return;}
  try{
    const res=await fetch(`${SUPA_URL}/functions/v1/drive-gallery`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPA_KEY}`},body:JSON.stringify({folder_id:r.folder_id})});
    const data=await res.json();
    _recapModal.files=data.files||[];
  }catch(e){_recapModal.files=[];}
  _recapModal.loading=false;
  _renderRecapGallery(_recapModal.files);
}
function closeRecapModal(){closeLightbox();closeModal('recapModal');}
function switchRecapTab(tab){_recapModal.tab=tab;_renderRecapModalTabs();_renderRecapGallery(_recapModal.files);}
function _renderRecapModalTabs(){
  document.querySelectorAll('.recap-modal-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===_recapModal.tab));
}
function _renderRecapGallery(files){
  const photos=files.filter(f=>f.type==='photo');
  const videos=files.filter(f=>f.type==='video');
  const el=document.getElementById('recapGalleryInner');if(!el)return;
  if(_recapModal.loading){el.innerHTML=`<div class="recap-gallery-loading">${tx('galleryLoading')}</div>`;return;}
  if(_recapModal.tab==='photo'){
    if(!photos.length){
      const _r=RECAP.find(x=>x.id===_recapModal.id);
      const emptyMsg=_r&&!_r.folder_id?tx('galleryNoFolder'):tx('galleryNoPhoto');
      el.innerHTML=`<div class="recap-gallery-empty">${emptyMsg}</div>`;return;
    }
    // Item 2: thumbnail jadi button lightbox — lazy load batch 48
    const BATCH=48;
    let _rendered=BATCH;
    const _makeThumb=(f,i)=>`<button class="recap-gallery-thumb" onclick="openLightbox(${i})" title="${escapeHTML(f.name)}"><img src="${escapeHTML(f.thumbnail)}" alt="${escapeHTML(f.name)}" loading="lazy" onerror="this.parentElement.style.display='none'"></button>`;
    const grid=document.createElement('div');grid.className='recap-gallery-grid';
    grid.innerHTML=photos.slice(0,BATCH).map(_makeThumb).join('');
    el.innerHTML='';el.appendChild(grid);
    if(photos.length>BATCH){
      const sentinel=document.createElement('div');sentinel.className='recap-gallery-sentinel';
      el.appendChild(sentinel);
      const obs=new IntersectionObserver((entries)=>{
        if(!entries[0].isIntersecting)return;
        const next=photos.slice(_rendered,_rendered+BATCH);
        grid.insertAdjacentHTML('beforeend',next.map((f,j)=>_makeThumb(f,_rendered+j)).join(''));
        _rendered+=next.length;
        if(_rendered>=photos.length){obs.disconnect();sentinel.remove();}
      },{rootMargin:'200px'});
      obs.observe(sentinel);
    }
  }else{
    if(!videos.length){el.innerHTML=`<div class="recap-gallery-empty">${tx('galleryNoVideo')}</div>`;return;}
    el.innerHTML=`<div class="recap-video-grid">${videos.map(f=>`<a href="${escapeHTML(f.driveLink)}" target="_blank" rel="noopener" class="recap-video-thumb" title="${escapeHTML(f.name)}"><img src="${escapeHTML(f.thumbnail)}" alt="${escapeHTML(f.name)}" loading="lazy" onerror="this.src=''"><div class="recap-video-play">▶</div><div class="recap-video-name">${escapeHTML(f.name)}</div></a>`).join('')}</div>`;
  }
  // Item 3: update count badge di modal header
  const badge=document.getElementById('recapModalCount');
  if(badge)badge.textContent=`${photos.length} foto${videos.length?' · '+videos.length+' video':''}`;
}

/* helper: bangun URL gambar full-res dari Drive file ID — lh3 bisa dimuat browser tanpa CORS issue */
function _lbSrc(f){return `https://lh3.googleusercontent.com/d/${f.id}`;}
let _lbIdx=0;
function _lbPhotos(){return _recapModal.files.filter(f=>f.type==='photo');}
function _rlbShowSpinner(){const s=document.getElementById('rlbSpinner');if(s)s.style.display='flex';}
function _rlbHideSpinner(){const s=document.getElementById('rlbSpinner');if(s)s.style.display='none';}
function openLightbox(idx){
  const photos=_lbPhotos();if(!photos.length)return;
  _lbIdx=idx;
  const f=photos[_lbIdx];
  const lb=document.getElementById('recapLightbox');if(!lb)return;
  const img=document.getElementById('rlbImg');
  img.style.opacity='0';_rlbShowSpinner();
  img.src=_lbSrc(f);
  img.onload=()=>{_rlbHideSpinner();img.style.opacity='1';};
  img.onerror=()=>{_rlbHideSpinner();img.style.opacity='1';};
  document.getElementById('rlbCaption').textContent=`${f.name} · ${_lbIdx+1}/${photos.length}`;
  const rlbEl=document.getElementById('rlbDriveLink');rlbEl.href=f.driveLink;rlbEl.textContent=tx('rlbDriveLinkTxt');
  lb.style.display='flex';
  document.addEventListener('keydown',_lbKeydown);
  // touch swipe
  lb.addEventListener('touchstart',_lbTouchStart,{passive:true});
  lb.addEventListener('touchend',_lbTouchEnd,{passive:true});
}
function closeLightbox(){
  const lb=document.getElementById('recapLightbox');if(!lb)return;
  lb.style.display='none';
  document.getElementById('rlbImg').src='';
  document.removeEventListener('keydown',_lbKeydown);
  lb.removeEventListener('touchstart',_lbTouchStart);
  lb.removeEventListener('touchend',_lbTouchEnd);
}
function lightboxNav(dir){
  const photos=_lbPhotos();if(!photos.length)return;
  _lbIdx=(_lbIdx+dir+photos.length)%photos.length;
  const f=photos[_lbIdx];
  const img=document.getElementById('rlbImg');
  img.style.opacity='0';_rlbShowSpinner();
  img.onload=()=>{_rlbHideSpinner();img.style.opacity='1';};
  img.onerror=()=>{_rlbHideSpinner();img.style.opacity='1';};
  setTimeout(()=>{img.src=_lbSrc(f);},120);
  document.getElementById('rlbCaption').textContent=`${f.name} · ${_lbIdx+1}/${photos.length}`;
  const rlbEl=document.getElementById('rlbDriveLink');rlbEl.href=f.driveLink;rlbEl.textContent=tx('rlbDriveLinkTxt');
}
function _lbKeydown(e){
  if(e.key==='ArrowLeft')lightboxNav(-1);
  else if(e.key==='ArrowRight')lightboxNav(1);
  else if(e.key==='Escape')closeLightbox();
}
let _lbTouchX=0;
function _lbTouchStart(e){_lbTouchX=e.changedTouches[0].clientX;}
function _lbTouchEnd(e){
  const dx=e.changedTouches[0].clientX-_lbTouchX;
  if(Math.abs(dx)>40)lightboxNav(dx<0?1:-1);
}

/* ══ RECAP ADMIN (Item 5) ══ */
let _radmEdit=null,_radmActive=true;
function _updateCoverPreview(){
  const url=document.getElementById('radmCoverUrl').value.trim();
  const img=document.getElementById('radmCoverPreview');if(!img)return;
  if(url){img.src=url;img.style.display='block';img.onerror=()=>{img.style.display='none';};}
  else{img.src='';img.style.display='none';}
}
function toggleRadmActive(){
  _radmActive=!_radmActive;
  document.getElementById('radmActiveTrack').classList.toggle('on',_radmActive);
  document.getElementById('radmActiveLbl').textContent=_radmActive?tx('radmActiveLblOn'):tx('radmActiveLblOff');
}
async function openRecapAdminModal(){
  document.getElementById('adminDd').classList.remove('open');
  _radmEdit=null;_radmActive=true;
  _resetRecapAdmForm();
  try{
    const rows=await dbGet('recap_items','select=*&order=sort_order.asc');
    if(rows)RECAP_ALL=rows;
    else RECAP_ALL=[...RECAP];
  }catch(e){RECAP_ALL=[...RECAP];}
  _renderRecapAdmList();
  openModal('recapAdminModal');
}
function closeRecapAdminModal(){closeModal('recapAdminModal');}
function _resetRecapAdmForm(){
  document.getElementById('radmTitle').value='';
  document.getElementById('radmCategory').value='ibadah';
  document.getElementById('radmDate').value='';
  document.getElementById('radmCoverUrl').value='';_updateCoverPreview();
  document.getElementById('radmBgColor').value='#1a2e5e';
  document.getElementById('radmFolderId').value='';
  document.getElementById('radmPhotoCount').value='';
  document.getElementById('radmSortOrder').value='';
  _radmActive=true;
  document.getElementById('radmActiveTrack').classList.add('on');
  document.getElementById('radmActiveLbl').textContent=tx('radmActiveLblOn');
  document.getElementById('radmSaveBtn').textContent=tx('radmSaveBtnAdd');
  const _rcb=document.getElementById('radmCancelBtn');if(_rcb){_rcb.style.display='none';_rcb.textContent=tx('radmCancelEditBtn');}
  _radmEdit=null;
}
function cancelRecapAdminEdit(){_radmEdit=null;_resetRecapAdmForm();}
function editRecapAdmin(id){
  const r=RECAP_ALL.find(x=>x.id===id);if(!r)return;
  _radmEdit=id;
  document.getElementById('radmTitle').value=r.title||'';
  document.getElementById('radmCategory').value=r.category||'ibadah';
  document.getElementById('radmDate').value=r.date||'';
  document.getElementById('radmCoverUrl').value=r.cover_url||'';_updateCoverPreview();
  document.getElementById('radmBgColor').value=r.bg_color||'#1a2e5e';
  document.getElementById('radmFolderId').value=r.folder_id||'';
  document.getElementById('radmPhotoCount').value=r.photo_count!=null?r.photo_count:'';
  document.getElementById('radmSortOrder').value=r.sort_order!=null?r.sort_order:'';
  _radmActive=r.active!==false;
  document.getElementById('radmActiveTrack').classList.toggle('on',_radmActive);
  document.getElementById('radmActiveLbl').textContent=_radmActive?tx('radmActiveLblOn'):tx('radmActiveLblOff');
  document.getElementById('radmSaveBtn').textContent=tx('radmSaveBtnEdit');
  document.getElementById('radmCancelBtn').style.display='';
  document.getElementById('radmTitle').focus();
}
async function saveRecapAdmin(){
  const title=document.getElementById('radmTitle').value.trim();
  const date=document.getElementById('radmDate').value;
  if(!title){showToast('Judul harus diisi!','err');return;}
  if(!date){showToast('Tanggal harus diisi!','err');return;}
  const photoCountRaw=document.getElementById('radmPhotoCount').value;
  const sortOrderRaw=document.getElementById('radmSortOrder').value;
  const payload={
    title,
    category:document.getElementById('radmCategory').value,
    date,
    cover_url:document.getElementById('radmCoverUrl').value.trim()||null,
    bg_color:document.getElementById('radmBgColor').value||'#1a2e5e',
    folder_id:document.getElementById('radmFolderId').value.trim()||null,
    photo_count:photoCountRaw!==''?parseInt(photoCountRaw):null,
    sort_order:sortOrderRaw!==''?parseInt(sortOrderRaw):0,
    active:_radmActive,
  };
  const btn=document.getElementById('radmSaveBtn');btn.disabled=true;btn.textContent='Menyimpan...';
  try{
    if(_radmEdit){
      await dbWrite('recap_items','UPDATE',payload,{id:_radmEdit});
      const idx=RECAP_ALL.findIndex(x=>x.id===_radmEdit);
      if(idx>-1)RECAP_ALL[idx]={...RECAP_ALL[idx],...payload};
      showToast('Recap diupdate ✓','ok');
    }else{
      const newId='recap_'+Date.now();
      const inserted=await dbWrite('recap_items','INSERT',{id:newId,...payload});
      const row=Array.isArray(inserted)?inserted[0]:{id:newId,...payload};
      RECAP_ALL.push(row);
      showToast('Recap ditambahkan ✓','ok');
    }
    _resetRecapAdmForm();
    _renderRecapAdmList();
    await renderRecap();
  }catch(e){showToast('Gagal: '+e.message,'err');}
  btn.disabled=false;
}
async function deleteRecapAdmin(id){
  const r=RECAP_ALL.find(x=>x.id===id);const name=r?r.title:'recap ini';
  showConfirmModal(`Hapus recap "${name}"? Tindakan ini tidak bisa dibatalkan.`,async()=>{
    try{
      await dbWrite('recap_items','DELETE',null,{id});
      RECAP_ALL=RECAP_ALL.filter(x=>x.id!==id);
      _renderRecapAdmList();
      await renderRecap();
      showToast('Recap dihapus.');
    }catch(e){showToast('Gagal: '+e.message,'err');}
  });
}
async function toggleRecapActive(id){
  const r=RECAP_ALL.find(x=>x.id===id);if(!r)return;
  const newActive=r.active===false;
  try{
    await dbWrite('recap_items','UPDATE',{active:newActive},{id});
    const idx=RECAP_ALL.findIndex(x=>x.id===id);if(idx>-1)RECAP_ALL[idx]={...RECAP_ALL[idx],active:newActive};
    _renderRecapAdmList();await renderRecap();
    showToast(newActive?'Recap diaktifkan ✓':'Recap disembunyikan','ok');
  }catch(e){showToast('Gagal: '+e.message,'err');}
}
function _renderRecapAdmList(){
  const list=document.getElementById('recapAdmList');if(!list)return;
  const all=RECAP_ALL.slice().sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  if(!all.length){list.innerHTML=`<p style="color:var(--text3);font-size:.85rem;margin:0">${tx('recapAdmEmpty')}</p>`;return;}
  list.innerHTML=all.map(r=>{
    const meta=r.date?new Date(r.date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):'';
    const statusBadge=r.active===false?'<span style="font-size:.68rem;background:var(--surface2);color:var(--text3);padding:1px 6px;border-radius:10px;margin-left:4px">nonaktif</span>':'';
    const countBadge=r.photo_count?`<span style="font-size:.7rem;color:var(--text3)">· 📷 ${r.photo_count}</span>`:'';
    return `<div class="recap-adm-item">
      <div class="recap-adm-info">
        <div class="recap-adm-title">${escapeHTML(r.title)}${statusBadge}</div>
        <div class="recap-adm-meta">${meta} ${countBadge}</div>
      </div>
      <div class="recap-adm-actions">
        <button class="btn btn-ghost btn-sm" title="${r.active===false?'Aktifkan':'Nonaktifkan'}" onclick="toggleRecapActive('${r.id}')">${r.active===false?'👁‍🗨':'👁'}</button>
        <button class="btn btn-ghost btn-sm" onclick="editRecapAdmin('${r.id}')">✎</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="deleteRecapAdmin('${r.id}')">×</button>
      </div>
    </div>`;
  }).join('');
}

/* ══ DOCS ══ */
function toEmbedUrl(url){const m=url.match(/\/file\/d\/([\w-]+)/);if(m)return `https://drive.google.com/file/d/${m[1]}/preview`;return url;}
function renderDocs(){
  const grid=document.getElementById('docGrid');if(!grid)return;grid.innerHTML='';
  const visible=DOCS.filter(d=>(d.active!==false||isAdmin)&&(d.category==='publik'||(isAdmin&&d.category==='pengurus')));
  if(!visible.length){grid.innerHTML=`<p class="doc-empty">${_lang==='en'?'No documents yet.':'Belum ada dokumen.'}</p>`;return;}
  visible.forEach(doc=>{
    const card=document.createElement('div');card.className='doc-card';if(isAdmin&&doc.active===false)card.style.opacity='.5';
    card.innerHTML=`<div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><div class="doc-info"><div class="doc-title">${escapeHTML(doc.title)}</div><div class="doc-meta">${doc.category==='pengurus'?tx('docCatPrivate'):tx('docCatPublic')}</div></div><svg viewBox="0 0 16 16" fill="currentColor" width="10" style="color:var(--text3);flex-shrink:0"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>`;
    card.onclick=()=>openDocViewer(doc);grid.appendChild(card);
  });
}
function openDocViewer(doc){document.getElementById('docModalTitle').textContent=doc.title;document.getElementById('docFrame').src=toEmbedUrl(doc.link);openModal('docOverlay');}
function closeDoc(){closeModal('docOverlay');document.getElementById('docFrame').src='';}
let _docEditId=null;
function _resetDocForm(){_docEditId=null;document.getElementById('docTitle').value='';document.getElementById('docLink').value='';document.getElementById('docCat').value='publik';const docActiveEl=document.getElementById('docActive');if(docActiveEl)docActiveEl.checked=true;document.getElementById('addDocBtn').textContent=tx('addDocBtn');document.getElementById('cancelDocEditBtn').style.display='none';}
function cancelDocEdit(){_resetDocForm();}
function editDoc(id){
  const doc=DOCS.find(d=>d.id===id);if(!doc)return;
  _docEditId=id;
  document.getElementById('docTitle').value=doc.title;
  document.getElementById('docLink').value=doc.link;
  document.getElementById('docCat').value=doc.category||'publik';
  const docActiveEl=document.getElementById('docActive');if(docActiveEl)docActiveEl.checked=doc.active!==false;
  document.getElementById('addDocBtn').textContent=tx('bannerSaveBtnEdit');
  document.getElementById('cancelDocEditBtn').style.display='';
  document.getElementById('docTitle').focus();
}
function renderDocAdmList(){
  const list=document.getElementById('docAdmList');if(!list)return;list.innerHTML='';
  if(!DOCS.length){list.innerHTML=`<p class="doc-empty" style="margin-top:8px">${tx('docAdmEmpty')}</p>`;return;}
  DOCS.forEach(doc=>{
    const item=document.createElement('div');item.className='doc-adm-item';
    const isActive=doc.active!==false;
    const statusBadge=isActive?'':' <span style="font-size:.68rem;background:var(--surface2);color:var(--text3);padding:1px 6px;border-radius:10px;margin-left:4px">nonaktif</span>';
    item.innerHTML=`<div class="doc-adm-info"><div class="doc-adm-title">${escapeHTML(doc.title)}${statusBadge}</div><div class="doc-adm-meta">${doc.category==='pengurus'?tx('docCatPrivate'):tx('docCatPublic')}</div></div><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" title="${isActive?'Nonaktifkan':'Aktifkan'}" onclick="toggleDocActive('${doc.id}')">${isActive?'👁':'👁‍🗨'}</button><button class="btn btn-ghost btn-sm" onclick="editDoc('${doc.id}')">✎</button><button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="deleteDoc('${doc.id}')">×</button></div>`;
    list.appendChild(item);
  });
}
function openDocsModal(){document.getElementById('adminDd').classList.remove('open');_resetDocForm();renderDocAdmList();openModal('docsModal');}
async function addDoc(){
  const title=document.getElementById('docTitle').value.trim();const link=document.getElementById('docLink').value.trim();const category=document.getElementById('docCat').value;
  if(!title||!link){showToast('Nama dan link harus diisi!','err');return;}
  const active=document.getElementById('docActive')?.checked!==false;
  if(_docEditId){
    try{await dbWrite('home_docs','UPDATE',{title,link,category,active},{id:_docEditId},'edit-doc');const idx=DOCS.findIndex(d=>d.id===_docEditId);if(idx>-1)DOCS[idx]={...DOCS[idx],title,link,category,active};renderDocs();renderDocAdmList();_resetDocForm();showToast('Dokumen diperbarui ✓','ok');}
    catch(e){showToast('Gagal: '+e.message,'err');}
    return;
  }
  try{const ins=await dbIns('home_docs',{id:'doc_'+Date.now(),title,link,category,active});DOCS.push(Array.isArray(ins)?ins[0]:ins);renderDocs();renderDocAdmList();document.getElementById('docTitle').value='';document.getElementById('docLink').value='';showToast('Dokumen ditambahkan ✓','ok');}
  catch(e){showToast('Gagal: '+e.message,'err');}
}
async function deleteDoc(id){
  const doc=DOCS.find(d=>d.id===id);const name=doc?doc.title:'dokumen ini';
  showConfirmModal(_lang==='en'?`Delete "${name}"? This cannot be undone.`:`Hapus dokumen "${name}"? Tindakan ini tidak bisa dibatalkan.`,async()=>{
    try{await dbDel('home_docs',`id=eq.${id}`);DOCS=DOCS.filter(d=>d.id!==id);if(_docEditId===id)_resetDocForm();renderDocs();renderDocAdmList();showToast('Dokumen dihapus.');}
    catch(e){showToast('Gagal: '+e.message,'err');}
  });
}
async function toggleDocActive(id){
  const doc=DOCS.find(d=>d.id===id);if(!doc)return;
  const newActive=doc.active===false;
  try{
    await dbWrite('home_docs','UPDATE',{active:newActive},{id},'toggle-doc-active');
    const idx=DOCS.findIndex(d=>d.id===id);if(idx>-1)DOCS[idx]={...DOCS[idx],active:newActive};
    renderDocs();renderDocAdmList();
    showToast(newActive?'Dokumen diaktifkan ✓':'Dokumen disembunyikan','ok');
  }catch(e){showToast('Gagal: '+e.message,'err');}
}

/* ══ VISIT COUNTER ══ */
async function trackVisit(){
  try{
    const LS_KEY='naposo_sid';const LS_EXP='naposo_sid_exp';
    const now=Date.now();const exp=parseInt(localStorage.getItem(LS_EXP)||'0');
    let sid=localStorage.getItem(LS_KEY);
    if(!sid||now>exp){
      sid='s_'+now+'_'+Math.random().toString(36).slice(2);
      localStorage.setItem(LS_KEY,sid);
      localStorage.setItem(LS_EXP,String(now+86400000));
      await dbIns('visits',{session_id:sid});
    }
    const d=new Date();const monthStart=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    const rows=await dbGet('visits',`select=id&created_at=gte.${monthStart}`);
    const el=document.getElementById('footerVisits');if(el)el.textContent=rows.length;
  }catch(e){}
}

/* ══ SCROLL REVEAL ══ */
function initScrollReveal(){
  const obs=new IntersectionObserver((entries)=>{entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('visible');obs.unobserve(en.target);}});},{threshold:0.05});
  function observeCards(){requestAnimationFrame(()=>{document.querySelectorAll('.ev-card:not(.visible)').forEach(el=>obs.observe(el));document.querySelectorAll('.reveal:not(.visible)').forEach(el=>obs.observe(el));});}
  observeCards();window._observeCards=observeCards;
}

/* ══ PARALLAX HERO ══ */
function initParallax(){
  const wm=document.querySelector('.hero-watermark');const hero=document.querySelector('.hero');if(!wm||!hero)return;
  let ticking=false;
  window.addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const heroBottom=hero.getBoundingClientRect().bottom;if(heroBottom>0)wm.style.transform=`translateY(${window.scrollY*0.28}px)`;ticking=false;});},{passive:true});
}

/* ══ INIT ══ */

/* ══ ADMIN ACTIVITY LOG ══ */
async function loadAdminActivityLog(){
  const el=document.getElementById('bnActivityLog');if(!el)return;
  el.innerHTML=`<span class="bn-act-empty">${tx('actLogLoading')}</span>`;
  try{
    const rows=await dbGet('event_logs','select=action,actor,note,created_at&order=created_at.desc&limit=10');
    if(!rows||!rows.length){el.innerHTML=`<span class="bn-act-empty">${tx('actLogEmpty')}</span>`;return;}
    el.innerHTML=rows.map(r=>{
      const d=new Date(r.created_at);
      const ts=d.toLocaleDateString('id-ID',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
      return `<div class="bn-act-row"><span class="bn-act-action">${escapeHTML(r.action||'')}</span><span class="bn-act-note">${escapeHTML(r.note||r.actor||'')}</span><span class="bn-act-ts">${ts}</span></div>`;
    }).join('');
  }catch(e){el.innerHTML=`<span class="bn-act-empty">${tx('actLogError')}</span>`;}
}

async function init(){
  applyDark();applyLang();buildLoginDropdown();
  const fy=document.getElementById('fyear');if(fy)fy.textContent=new Date().getFullYear();
  ['loginModal','editEventModal','docsModal','announceModal','docOverlay','recapAdminModal'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.addEventListener('click',e=>{if(e.target===el){if(id==='docOverlay')closeDoc();else closeModal(id);}});
  });
  // Item 5 (Sesi 55): auto-extract folder ID kalau admin paste full Drive URL
  const radmFolderEl=document.getElementById('radmFolderId');
  if(radmFolderEl)radmFolderEl.addEventListener('blur',function(){
    const m=this.value.trim().match(/\/folders\/([^/?&#]+)/);
    if(m)this.value=m[1];
  });
  const savedToken=localStorage.getItem('naposo_token');const savedName=localStorage.getItem('naposo_admin_name');
  if(savedToken&&savedName){isAdmin=true;_applyAdminUI(savedName);_applyRoleBadge();}
  await loadBanners();
  trackVisit();
  await loadData();
  initPullToRefresh();initScrollTop();initDirtyState();
}

function initScrollTop(){
  const btn=document.getElementById('scrollTopBtn');if(!btn)return;
  window.addEventListener('scroll',()=>{btn.classList.toggle('visible',window.scrollY>300);},{passive:true});
}

function initDirtyState(){
  let _dirty=false;
  const formInputs=['editTitle','editDate','editTimeStart','editTimeEnd','editCat','editExtra','editNote','editLink','editCaption','editFeatured','editDraft'];
  function markDirty(){_dirty=true;}
  formInputs.forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener(el.type==='checkbox'?'change':'input',markDirty);});
  const _origClose=window.closeModal;
  window.closeModal=function(id){
    if(id==='editEventModal'&&_dirty){const msg=_lang==='en'?'There are unsaved changes. Close without saving?':'Ada perubahan yang belum disimpan. Tutup tanpa menyimpan?';showConfirmModal(msg,()=>{_dirty=false;_origClose(id);},'OK');return;}
    _origClose(id);
  };
  const _origSave=window.saveEditEvent;
  window.saveEditEvent=async function(){await _origSave();_dirty=false;};
}

/* ══ WIDGET RENUNGAN TERBARU ══ */
function driveToThumbnailIdx(url){if(!url)return '';const m=url.match(/(?:id=|\/d\/)([A-Za-z0-9_-]{20,})/);return m?`https://lh3.googleusercontent.com/d/${m[1]}`:url;}
function renderRevWidget(post){
  const sec=document.getElementById('revWidgetSection');if(!sec)return;
  if(post!==undefined)_lastRevPost=post;
  if(!_lastRevPost){sec.style.display='none';return;}
  post=_lastRevPost;
  sec.style.display='';
  const MS=_lang==='en'?MS_EN:MS_ID;
  const d=new Date(post.date+'T00:00:00');
  const dateLbl=`${d.getDate()} ${MS[d.getMonth()]} ${d.getFullYear()}`;
  const imgSrc=driveToThumbnailIdx(post.poster_url);
  const dayType=post.day_type||'senin';
  const dayLbl=dayType==='senin'?'Senin':'Jumat';
  const href=`reversement.html?id=${encodeURIComponent(post.id)}`;
  const eyebrow=tx('revWidgetTitle');
  const ctaTxt=_lang==='en'?'Read more →':'Baca selengkapnya →';
  const posterHTML=imgSrc
    ?`<img src="${escapeHTML(imgSrc)}" alt="${escapeHTML(post.title)}" class="rev-widget-poster-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="rev-widget-poster-fb" style="display:none">📖</div>`
    :`<div class="rev-widget-poster-fb">📖</div>`;
  const verseHTML=post.verse_ref?`<div class="rev-widget-verse"><svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" style="color:var(--text3);flex-shrink:0"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-11zm1.5-.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-11z"/><path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/></svg>${escapeHTML(post.verse_ref)}</div>`:'';
  const excerptHTML=post.excerpt?`<div class="rev-widget-excerpt">${escapeHTML(post.excerpt)}</div>`:'';
  const seriesHTML=post.series_name?`<span style="color:var(--border)">·</span><span class="rev-widget-series">Seri: ${escapeHTML(post.series_name)}</span>`:'';
  document.getElementById('revWidgetInner').innerHTML=`
    <div class="rev-widget-card" onclick="window.location.href='${href}'">
      <div class="rev-widget-poster-wrap">
        <div class="rev-widget-poster-inner">
          ${posterHTML}
          <span class="rev-widget-day-badge ${dayType}">${dayLbl}</span>
        </div>
      </div>
      <div class="rev-widget-body">
        <div class="rev-widget-eyebrow">${eyebrow}</div>
        <div class="rev-widget-title">${escapeHTML(post.title)}</div>
        <div class="rev-widget-meta"><span>${dateLbl}</span>${seriesHTML}</div>
        ${verseHTML}
        ${excerptHTML}
        <a class="rev-widget-cta" href="${href}">${ctaTxt}</a>
      </div>
    </div>`;
}

/* ══ LOAD DATA ══ */
async function loadData(){
  renderSkeletonEvents();
  try{
    // Fetch paralel — cats, events, docs, rev widget dilakukan bersamaan
    // renderEvents() tetap menunggu cats selesai agar warna kategori benar
    const [catsRes,eventsRes,docsRes,revRes]=await Promise.allSettled([
      dbGet('categories','select=*&order=sort_order.asc'),
      dbGet('events','select=*&order=date.asc'),
      dbGet('home_docs','select=*&order=created_at.asc'),
      dbGet('reversement_posts','select=id,title,verse_ref,poster_url,date,day_type&published=eq.true&order=date.desc&limit=1')
    ]);
    if(catsRes.status==='fulfilled'&&catsRes.value?.length){
      const co={},ni={};catsRes.value.forEach(c=>{co[c.id]=c.color;ni[c.id]=c.label_id||c.label||c.id;});
      Object.assign(CATS,co);Object.assign(CNAMES,ni);
    }
    if(eventsRes.status==='fulfilled'){EVENTS=eventsRes.value||[];window.EVENTS=EVENTS;}
    else throw eventsRes.reason; // events wajib — lempar error ke outer catch
    DOCS=docsRes.status==='fulfilled'?docsRes.value||[]:[];
    const revPosts=revRes.status==='fulfilled'?revRes.value:null;
    renderRevWidget(revPosts?.length?revPosts[0]:null);
    renderEvents();await renderRecap();renderDocs();
    if(isAdmin)renderDocAdmList();
    initScrollReveal();initParallax();if(window._observeCards)window._observeCards();
    checkBirthdays();
  }catch(e){const g=document.getElementById('eventsGrid');if(g)g.innerHTML=`<div class="ev-empty">Gagal memuat data.</div>`;}
}

/* ══ PULL TO REFRESH ══ */
function initPullToRefresh(){
  let startY=0,pulling=false,triggered=false;const THRESHOLD=60;
  const spinner=document.createElement('div');spinner.className='ptr-spinner';
  spinner.innerHTML=`<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="10" stroke-linecap="round"/></svg><span id="ptrLabel">${_lang==='en'?'Refreshing…':'Memuat ulang…'}</span>`;
  document.body.appendChild(spinner);
  function showSpinner(){spinner.classList.add('ptr-visible');}function hideSpinner(){spinner.classList.remove('ptr-visible');}
  document.addEventListener('touchstart',e=>{if(window.scrollY!==0)return;startY=e.touches[0].clientY;pulling=true;triggered=false;},{passive:true});
  document.addEventListener('touchmove',e=>{if(!pulling)return;const dy=e.touches[0].clientY-startY;if(dy>=THRESHOLD&&!triggered){triggered=true;showSpinner();}},{passive:true});
  document.addEventListener('touchend',async()=>{if(!pulling)return;pulling=false;if(!triggered)return;await loadData();hideSpinner();},{passive:true});
}

/* ══ BOTTOM NAV ══ */
function openBnSheet(){
  document.getElementById('bnSheet').classList.add('open');
  if(isAdmin)loadAdminActivityLog();document.getElementById('bnSheetOverlay').classList.add('open');
  const bdt=document.getElementById('bnDarkTrack');if(bdt)bdt.classList.toggle('on',darkMode);
  const blt=document.getElementById('bnLangTrack');if(blt)blt.classList.toggle('on',_lang==='en');
  const stt=document.getElementById('scrollTopBtn');if(stt)stt.style.opacity='0';
}
function closeBnSheet(){
  document.getElementById('bnSheet').classList.remove('open');document.getElementById('bnSheetOverlay').classList.remove('open');
  const stt=document.getElementById('scrollTopBtn');if(stt)stt.style.opacity='';
}
function _syncBnAdminUI(name){
  const adminSec=document.getElementById('bnAdminSection');const guestSec=document.getElementById('bnGuestSection');
  const bnName=document.getElementById('bnAdminName');const bnNameTop=document.getElementById('bnAdminNameTop');
  const bnTopRow=document.getElementById('bnAdminTopName');const bnTab=document.getElementById('bnLoginTab');
  const bnIcon=document.getElementById('bnLoginIcon');const bnLabel=document.getElementById('bnLoginLabel');
  if(name){
    if(adminSec)adminSec.style.display='flex';if(guestSec)guestSec.style.display='none';
    if(bnName)bnName.textContent=name;if(bnNameTop)bnNameTop.textContent=name;
    if(bnTopRow)bnTopRow.style.display='block';if(bnIcon)bnIcon.textContent='✓';
    if(bnLabel)bnLabel.textContent=name.split(' ')[0];
    const bnBadge=document.getElementById('bnAdminBadge');if(bnBadge)bnBadge.style.display='inline';
  }else{
    if(adminSec)adminSec.style.display='none';if(guestSec)guestSec.style.display='block';
    if(bnTopRow)bnTopRow.style.display='none';if(bnIcon)bnIcon.textContent='🔐';
    if(bnLabel)bnLabel.textContent=tx('loginBtnTxt')||'Login';
  }
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const sh=document.getElementById('bnSheet');if(sh&&sh.classList.contains('open')){closeBnSheet();return;}}});

/* ── Confetti ── */
function fireConfetti(){
  if(typeof confetti==='undefined')return;
  const colors=['#c9a227','#0a1f44','#fff','#f59e0b','#ec4899','#6366f1'];
  confetti({particleCount:120,spread:80,origin:{y:0.55},colors});
  setTimeout(()=>confetti({particleCount:60,spread:120,origin:{y:0.4},colors,angle:60}),300);
  setTimeout(()=>confetti({particleCount:60,spread:120,origin:{y:0.4},colors,angle:120}),500);
}

/* ── Modal surprise ── */
const BDAY_MESSAGES=[
  'Selamat ulang tahun. Kiranya Tuhan senantiasa memberkati setiap langkah hidupmu dengan damai, sukacita, dan kasih-Nya.',
  'Bertambah usia, bertambah hikmat, iman, dan berkat dari Tuhan.',
  'Kiranya di usia yang baru ini, Tuhan memberikan kesehatan, kekuatan, dan pengharapan yang baru.',
  'Selamat ulang tahun. Tetap menjadi terang dan berkat bagi banyak orang.',
  'Hari ini adalah anugerah dari Tuhan. Bersyukurlah dan bersukacitalah dalam kasih-Nya.',
  'Selamat ulang tahun. Tetap setia dalam iman dan terus berjalan bersama Tuhan.',
  'Selamat ulang tahun. Semoga kasih karunia Tuhan selalu menyertai hidupmu hari ini dan selamanya.',
  'Kiranya setiap doa dan harapanmu dijawab indah pada waktu Tuhan yang terbaik.',
  'Selamat ulang tahun. Tuhan Yesus senantiasa menyertai perjalanan hidupmu dengan damai dan kasih-Nya.',
  'Di usia yang baru ini, kiranya imanmu semakin dikuatkan dan langkahmu selalu dipimpin oleh Tuhan.',
];
const BDAY_VERSES=[
  {ref:'Mazmur 20:4',   text:'Kiranya diberikan-Nya kepadamu apa yang kaukehendaki dan dijadikan-Nya berhasil apa yang kaurancangkan.'},
  {ref:'Mazmur 118:24', text:'Inilah hari yang dijadikan TUHAN, marilah kita bersorak-sorak dan bersukacita karenanya!'},
  {ref:'Ratapan 3:22-23',text:'Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!'},
  {ref:'Amsal 3:16',    text:'Umur panjang ada di tangan kanannya, di tangan kirinya kekayaan dan kehormatan.'},
  {ref:'1 Korintus 1:5',text:'Sebab di dalam Dia kamu telah menjadi kaya dalam segala hal: dalam segala macam perkataan dan segala macam pengetahuan.'},
];
function _bdayHash(str,mod){
  let h=0;for(let i=0;i<str.length;i++)h=(Math.imul(31,h)+str.charCodeAt(i))|0;
  return Math.abs(h)%mod;
}

function checkBirthdays(){
  const today=localDateStr();
  // Bersihkan key hari lain yang mungkin tersimpan
  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith('bday_shown_')&&k!=='bday_shown_'+today)localStorage.removeItem(k);
  });
  const dismissKey='bday_shown_'+today;
  if(localStorage.getItem(dismissKey))return;
  const bdayEvs=getBirthdaysToday();
  if(!bdayEvs.length)return;
  setTimeout(()=>openBirthdayModal(bdayEvs,dismissKey),800);
}

function openBirthdayModal(evs,dismissKey){
  const modal=document.getElementById('birthdayModal');
  const content=document.getElementById('birthdayModalContent');
  if(!modal||!content)return;

  // Subtitle & pesan: pakai nama orang pertama sebagai seed
  const seedName=((evs[0].extra&&evs[0].extra.nama)||evs[0].title||'').toLowerCase().trim();
  const msg=BDAY_MESSAGES[_bdayHash(seedName,BDAY_MESSAGES.length)];
  const verse=BDAY_VERSES[_bdayHash(seedName+'v',BDAY_VERSES.length)];
  const subEl=document.getElementById('bdayModalSub');
  if(subEl)subEl.textContent=msg;

  // Render foto
  content.innerHTML=evs.map(ev=>{const nama=(ev.extra&&ev.extra.nama)||ev.title;
    const fotoUrl=ev.extra&&ev.extra.foto_url?driveToThumbnail(ev.extra.foto_url):'';
    return `<div class="bday-person">
      ${fotoUrl
        ?`<div class="bday-foto-free"><img src="${escapeHTML(fotoUrl)}" alt="${escapeHTML(nama)}" class="bday-foto-img" onerror="this.parentElement.style.display='none'"/></div>`
        :`<div class="bday-foto-placeholder">🎂</div>`
      }
      <div class="bday-name">${escapeHTML(nama)}</div>
    </div>`;
  }).join('')+
  `<div style="margin-top:4px;padding:12px 16px;border-radius:12px;background:var(--bg2,rgba(255,255,255,.07));text-align:center">
    <div style="font-size:.72rem;font-weight:800;letter-spacing:.08em;color:var(--gold,#c9a227);margin-bottom:6px">${escapeHTML(verse.ref)}</div>
    <div style="font-size:.82rem;font-style:italic;color:var(--text,#e2e8f0);line-height:1.55">"${escapeHTML(verse.text)}"</div>
  </div>`;

  modal.classList.add('on');
  document.body.style.overflow='hidden';
  localStorage.setItem(dismissKey,'1');
  // Poll sampai confetti library siap (CDN bisa butuh waktu)
  let tries=0;
  const tryConfetti=()=>{
    if(typeof confetti!=='undefined'){fireConfetti();}
    else if(tries++<20){setTimeout(tryConfetti,200);}
  };
  setTimeout(tryConfetti,300);
}

function closeBirthdayModal(){
  const modal=document.getElementById('birthdayModal');
  if(modal){modal.classList.remove('on');document.body.style.overflow='';}
}

init();

/* ══ PWA SERVICE WORKER ══ */
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});
  navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='SW_UPDATED'&&!sessionStorage.getItem('sw_reloaded')){sessionStorage.setItem('sw_reloaded','1');location.reload();}});
}

/* ══ CROSS-TAB FEATURED SYNC ══ */
window.addEventListener('storage',e=>{
  if(e.key!=='naposo_featured_change'||!e.newValue)return;
  try{const{id,featured}=JSON.parse(e.newValue);const ev=EVENTS.find(e=>e.id===id);if(ev){ev.featured=featured;renderEvents();}}catch(_){}
});
