/* ══ SUPABASE ══ */
const SUPA_URL='https://wejbubxrlqyazlodhbua.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlamJ1YnhybHF5YXpsb2RoYnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTU0NDUsImV4cCI6MjA5MTg5MTQ0NX0.fFBvRU7wlRvzigDLtN6ot_9D6GMxL9h4J_mwVaNoBsU';
function sb(p,o={}){return fetch(`${SUPA_URL}/rest/v1/${p}`,{headers:{'apikey':SUPA_KEY,'Authorization':`Bearer ${SUPA_KEY}`,'Content-Type':'application/json','Prefer':'return=representation',...(o.headers||{})},...o});}
async function dbGet(t,q=''){const r=await sb(`${t}?${q}`);if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbIns(t,d){const r=await sb(t,{method:'POST',body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbUpd(t,m,d){const r=await sb(`${t}?${m}`,{method:'PATCH',body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbDel(t,m){const r=await sb(`${t}?${m}`,{method:'DELETE'});if(!r.ok)throw new Error(await r.text());}

let adminToken=null;
async function dbWrite(table,method,data,match){
  const r=await fetch(`${SUPA_URL}/functions/v1/db-write`,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPA_KEY}`,'x-admin-token':adminToken||''},
    body:JSON.stringify({table,method,data,match})
  });
  const json=await r.json();
  if(!r.ok)throw new Error(json.error||'Write failed');
  return json.data||[];
}

/* ══ PASSWORDS ══ */
const USER_NAMES=['Andre','Catherine','Daniel','David','Dea','Eliza',
  'Frans','Grace','Gunawan','Lisken','Mutiara','Rut','Selfa','Tomy'];
  
/* ══ CATEGORIES ══ */
const BUILT_IN=['koor','ibadah','rapat','latihan','reversement','doa','other'];
const DEF_COLORS={koor:'#7c3aed',ibadah:'#c9a227',rapat:'#0891b2',latihan:'#16a34a',reversement:'#db2777',doa:'#4a90d9',other:'#94a3b8'};
const DEF_LBL_ID={koor:'Koor',ibadah:'Ibadah / Pelayanan',rapat:'Rapat',latihan:'Latihan',reversement:'Reversement',doa:'Doa',other:'Lainnya'};
const DEF_LBL_EN={koor:'Koor',ibadah:'Ibadah / Pelayanan',rapat:'Rapat',latihan:'Latihan',reversement:'Reversement',doa:'Doa',other:'Lainnya'};
const CAT_EXTRA={
  'Koor':               {key:'judul_lagu',     label:'Judul Lagu'},
  'Ibadah / Pelayanan': {key:'tema_acara',      label:'Tema Acara'},
  'Olahraga':           {key:'jenis_olahraga',  label:'Jenis Olahraga'},
};
function getExtraField(catId){
  const lbl=CNAMES_ID[catId]||catId;
  return CAT_EXTRA[lbl]||null;
}
function updateExtraField(){
  const cat=document.getElementById('evCat')?.value;
  const wrap=document.getElementById('extraFieldWrap');
  const lbl=document.getElementById('extraFieldLabel');
  const inp=document.getElementById('extraFieldInput');
  if(!wrap||!lbl||!inp) return;
  const extra=getExtraField(cat);
  if(extra){
    lbl.textContent=extra.label;
    wrap.style.display='block';
  } else {
    wrap.style.display='none';
    inp.value='';
  }
}

let CATS={...DEF_COLORS},CNAMES_ID={...DEF_LBL_ID},CNAMES_EN={...DEF_LBL_EN};
function catLabel(c){return(lang==='en'?CNAMES_EN:CNAMES_ID)[c]||CNAMES_ID[c]||c;}
function catColor(c){return CATS[c]||'#94a3b8';}
async function loadCatsFromDB(){
  try{
    const rows=await dbGet('categories','select=*&order=created_at.asc');
    rows.forEach(r=>{CATS[r.id]=r.color;CNAMES_ID[r.id]=r.label_id;CNAMES_EN[r.id]=r.label_en;});
  }catch(e){console.warn('Gagal load kategori:',e.message);}
}
async function saveCatToDB(id,color,label){
  try{await dbWrite('categories','INSERT',{id,color,label_id:label,label_en:label});}
  catch(e){console.warn('Gagal simpan kategori:',e.message);}
}
async function deleteCatFromDB(id){
  try{await dbWrite('categories','DELETE',null,{id});}
  catch(e){console.warn('Gagal hapus kategori:',e.message);}
}
async function updateCatInDB(id,fields){
  try{await dbWrite('categories','UPDATE',fields,{id});}
  catch(e){console.warn('Gagal update kategori:',e.message);}
}

/* ══ I18N ══ */
const T={
  id:{hdrSub:'Kalender Pelayanan 2026',loginBadgeView:'Lihat saja',loginBtnTxt:'Login',todayBtnTxt:'Hari ini',
    addBtnTxt:'Tambah',lbDate:'Tanggal',lbTitle:'Judul Event',lbStart:'Waktu Mulai',lbEnd:'Waktu Selesai',
    lbCat:'Kategori',lbNote:'Catatan (opsional)',cancelBtn:'Batal',saveBtn:'Simpan',
    loginTitle:'Login Pengurus',lbName:'Nama Pengurus',selectName:'-- Pilih nama --',
    lbPw:'Password',loginErr:'Password salah atau nama tidak dipilih.',
    loginBtn2:'Masuk',detailTitle:'Detail Event',closeBtn:'Tutup',editBtn:'Edit',
    evModalAdd:'Tambah Event',evModalEdit:'Ubah Event',
    connecting:'Menghubungkan…',connected:'Terhubung',saving:'Menyimpan…',
    saved:'Tersimpan ✓',deleted:'Event dihapus.',saveFail:'Gagal menyimpan',delFail:'Gagal menghapus',
    fieldReq:'Tanggal dan judul harus diisi!',dragMoved:'Event dipindahkan ✓',
    deleteConfirm:'Hapus event ini?',catAdded:'Kategori ditambahkan!',catDeleted:'Kategori dihapus.',
    welcome:'Selamat datang',modeActive:'Mode edit aktif.',
    searchPlaceholder:'Cari event…',allCats:'Semua Kategori',
    statTotal:'Total Event',statMonth:'Bulan ini',statToday:'Hari ini',statVisit:'Total kunjungan',
    footerVisit:'kunjungan',darkModeLbl:'Dark Mode',langModeLbl:'Bahasa',
    moreEventsLabel:(n)=>`+${n} lagi`,catMgrBtn:'⚙ Kelola',
  },
  en:{hdrSub:'Ministry Calendar 2026',loginBadgeView:'View only',loginBtnTxt:'Login',todayBtnTxt:'Hari ini',
    addBtnTxt:'Add',lbDate:'Date',lbTitle:'Event Title',lbStart:'Start Time',lbEnd:'End Time',
    lbCat:'Category',lbNote:'Notes (optional)',cancelBtn:'Cancel',saveBtn:'Save',
    loginTitle:'Admin Login',lbName:'Admin Name',selectName:'-- Select name --',
    lbPw:'Password',loginErr:'Wrong password or name not selected.',
    loginBtn2:'Sign In',detailTitle:'Event Detail',closeBtn:'Close',editBtn:'Edit',
    evModalAdd:'Add Event',evModalEdit:'Edit Event',
    connecting:'Connecting…',connected:'Connected',saving:'Saving…',
    saved:'Saved ✓',deleted:'Event deleted.',saveFail:'Save failed',delFail:'Delete failed',
    fieldReq:'Date and title are required!',dragMoved:'Event moved ✓',
    deleteConfirm:'Delete this event?',catAdded:'Category added!',catDeleted:'Category deleted.',
    welcome:'Welcome',modeActive:'Edit mode active.',
    searchPlaceholder:'Search events…',allCats:'All Categories',
    statTotal:'Total Events',statMonth:'This month',statToday:'Today',statVisit:'Total visits',
    footerVisit:'visits',darkModeLbl:'Dark Mode',langModeLbl:'Language',
    moreEventsLabel:(n)=>`+${n} more`,catMgrBtn:'⚙ Manage',
  }
};
function tx(k,...a){const fn=(T[lang]||T.id)[k]||T.id[k]||k;return typeof fn==='function'?fn(...a):fn;}

/* ══ CONSTANTS & STATE ══ */
const MONTHS_ID=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_ID=['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
const DAYS_EN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const YEAR=2026,TODAY=new Date();
const MAX_VISIBLE=3; // max pills shown per cell before "+N more"
let EVENTS=[],lang=localStorage.getItem('naposo_lang')||'id',darkMode=localStorage.getItem('naposo_dark')==='1';
let isAdmin=false,editingId=null,filterCat='all',currentView='grid';
let undoStack=[];
let copiedEvent=null;
function pushUndo(action){undoStack.push(action);}
function resetUndo(){undoStack=[];}
async function undoLast(){
  if(!undoStack.length){showToast('Tidak ada yang bisa di-undo.','err');return;}
  const action=undoStack.pop();
  try{
    if(action.type==='add'){
      await dbWrite('events','DELETE',null,{id:action.ev.id});
      EVENTS=EVENTS.filter(e=>e.id!==action.ev.id);
    } else if(action.type==='delete'){
      await dbWrite('events','INSERT',action.ev);
      EVENTS.push(action.ev);EVENTS.sort((a,b)=>a.date.localeCompare(b.date));
    } else if(action.type==='edit'){
      await dbWrite('events','UPDATE',action.prev,{id:action.prev.id});
      EVENTS=EVENTS.map(e=>e.id===action.prev.id?action.prev:e);
    } else if(action.type==='move'){
      await dbWrite('events','UPDATE',{date:action.oldDate},{id:action.ev.id});
      EVENTS=EVENTS.map(e=>e.id===action.ev.id?{...e,date:action.oldDate}:e);
    }
    renderCalendar();renderStats();
    showToast('Undo berhasil ✓','ok');
  } catch(e){showToast('Undo gagal: '+e.message,'err');}
}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();if(isAdmin)undoLast();}});
let currentMonth=Math.min(Math.max(TODAY.getFullYear()===YEAR?TODAY.getMonth():3,0),11);

/* ══ SEED ══ */
const SEED=[
  {id:'e1',date:'2026-04-02',title:'VG RN Passion III',time:'19:30–21:00',category:'ibadah',note:''},
  {id:'e2',date:'2026-04-03',title:'Koor RN Jumat Agung',time:'10:00–12:00',category:'koor',note:''},
  {id:'e3',date:'2026-04-04',title:'Paskah RN',time:'18:00',category:'ibadah',note:''},
  {id:'e4',date:'2026-04-05',title:'Koor RN Paskah',time:'17:00–18:30',category:'koor',note:''},
  {id:'e5',date:'2026-04-08',title:'Rapat BKR',time:'18:30–19:30',category:'rapat',note:''},
  {id:'e6',date:'2026-04-10',title:'Rapat Program Pelayanan Naposo 2026',time:'',category:'rapat',note:''},
  {id:'e7',date:'2026-04-11',title:'Pembekalan Pengurus Naposo Ke-1',time:'13:00–16:00',category:'ibadah',note:''},
  {id:'e8',date:'2026-04-12',title:'Latihan Koor Naposo-1 (19 Apr)',time:'11:30–13:00',category:'latihan',note:''},
  {id:'e9',date:'2026-04-17',title:'Evaluasi Paskah',time:'19:30–21:30',category:'rapat',note:''},
  {id:'e10',date:'2026-04-17',title:'Latihan Koor Naposo-2 (19 Apr)',time:'19:00–20:30',category:'latihan',note:''},
  {id:'e11',date:'2026-04-18',title:'Sosialisasi Program Pelayanan 2026–2028',time:'',category:'ibadah',note:''},
  {id:'e12',date:'2026-04-19',title:'Koor Naposo-1',time:'09:30–11:00',category:'koor',note:''},
  {id:'e13',date:'2026-04-20',title:'Reversement',time:'10:00',category:'reversement',note:''},
  {id:'e14',date:'2026-04-20',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'e15',date:'2026-04-21',title:'Pokok Doa Bulanan',time:'',category:'doa',note:''},
  {id:'e16',date:'2026-04-24',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'e17',date:'2026-04-24',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'e18',date:'2026-04-25',title:'Ibadah Naposo Pertama',time:'19:00–20:30',category:'ibadah',note:''},
  {id:'e19',date:'2026-04-26',title:'Latihan Koor Naposo-1 (3 Mei)',time:'11:30–13:00',category:'latihan',note:''},
  {id:'e20',date:'2026-04-27',title:'Reversement (Frans)',time:'10:00',category:'reversement',note:''},
  {id:'e21',date:'2026-04-27',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m1',date:'2026-05-01',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'m2',date:'2026-05-01',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m3',date:'2026-05-02',title:'Latihan Koor Naposo-2 (3 Mei)',time:'20:00–21:30',category:'latihan',note:''},
  {id:'m4',date:'2026-05-03',title:'Koor Naposo (3 Mei)',time:'09:30–11:00',category:'koor',note:''},
  {id:'m5',date:'2026-05-04',title:'Reversement (Frans)',time:'10:00',category:'reversement',note:''},
  {id:'m6',date:'2026-05-04',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m7',date:'2026-05-08',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'m8',date:'2026-05-08',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m9',date:'2026-05-09',title:'Latihan Koor Naposo-1 (17 Mei)',time:'19:00–20:30',category:'latihan',note:''},
  {id:'m10',date:'2026-05-09',title:'Ibadah Naposo Kedua',time:'19:00–20:30',category:'ibadah',note:''},
  {id:'m11',date:'2026-05-11',title:'Reversement (Frans)',time:'',category:'reversement',note:''},
  {id:'m12',date:'2026-05-11',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m13',date:'2026-05-15',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'m14',date:'2026-05-15',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m15',date:'2026-05-16',title:'Kesehatian x Kerohanian: Ibadah & Kunjungan RS',time:'',category:'ibadah',note:''},
  {id:'m16',date:'2026-05-16',title:'Latihan Koor Naposo-2 (17 Mei)',time:'19:00–20:30',category:'latihan',note:''},
  {id:'m17',date:'2026-05-17',title:'Koor Naposo (17 Mei)',time:'09:30–11:00',category:'koor',note:''},
  {id:'m18',date:'2026-05-18',title:'Reversement (Frans)',time:'',category:'reversement',note:''},
  {id:'m19',date:'2026-05-18',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m20',date:'2026-05-19',title:'Pokok Doa Bulanan',time:'',category:'doa',note:''},
  {id:'m21',date:'2026-05-22',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'m22',date:'2026-05-22',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m23',date:'2026-05-23',title:'Latihan Koor RN-1 (31 Mei)',time:'19:00–20:30',category:'latihan',note:''},
  {id:'m24',date:'2026-05-23',title:'Ibadah Naposo Ketiga',time:'19:00–20:30',category:'ibadah',note:''},
  {id:'m25',date:'2026-05-25',title:'Reversement (Frans)',time:'',category:'reversement',note:''},
  {id:'m26',date:'2026-05-25',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m27',date:'2026-05-29',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'m28',date:'2026-05-29',title:'Pokok Doa Pribadi',time:'',category:'doa',note:''},
  {id:'m29',date:'2026-05-29',title:'Evaluasi Pelayanan BPP',time:'',category:'rapat',note:''},
  {id:'m30',date:'2026-05-30',title:'Latihan Koor Naposo-2 (31 Mei)',time:'20:00–21:30',category:'latihan',note:''},
  {id:'m31',date:'2026-05-31',title:'Koor RN (31 Mei)',time:'09:30–11:00',category:'koor',note:''},
  {id:'j1',date:'2026-06-01',title:'Reversement (Frans)',time:'',category:'reversement',note:''},
  {id:'j2',date:'2026-06-05',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'j3',date:'2026-06-06',title:'Ibadah Naposo Ke-empat',time:'19:00–20:30',category:'ibadah',note:''},
  {id:'j4',date:'2026-06-06',title:'Latihan Koor Naposo-1 (14 Jun)',time:'20:00–21:30',category:'latihan',note:''},
  {id:'j5',date:'2026-06-08',title:'Reversement (Frans)',time:'',category:'reversement',note:''},
  {id:'j6',date:'2026-06-12',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'j7',date:'2026-06-13',title:'Kesehatian Naposo',time:'',category:'ibadah',note:''},
  {id:'j8',date:'2026-06-13',title:'Latihan Koor Naposo-2 (14 Jun)',time:'20:00–21:30',category:'latihan',note:''},
  {id:'j9',date:'2026-06-14',title:'Koor Naposo (14 Jun)',time:'09:30–11:00',category:'koor',note:''},
  {id:'j10',date:'2026-06-15',title:'Reversement (Frans)',time:'',category:'reversement',note:''},
  {id:'j11',date:'2026-06-19',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'j12',date:'2026-06-20',title:'Latihan Koor RN-1 (28 Jun)',time:'19:00–20:30',category:'latihan',note:''},
  {id:'j13',date:'2026-06-20',title:'Ibadah Naposo Kelima',time:'19:00–20:30',category:'ibadah',note:''},
  {id:'j14',date:'2026-06-22',title:'Reversement (Frans)',time:'',category:'reversement',note:''},
  {id:'j15',date:'2026-06-26',title:'Reversement (Lisken)',time:'10:00',category:'reversement',note:''},
  {id:'j16',date:'2026-06-27',title:'Perayaan Ulang Tahun',time:'',category:'ibadah',note:''},
  {id:'j17',date:'2026-06-27',title:'Latihan Koor RN-2 (28 Jun)',time:'20:00–21:30',category:'latihan',note:''},
  {id:'j18',date:'2026-06-28',title:'Koor RN (28 Jun)',time:'09:30–11:00',category:'koor',note:''},
  {id:'j19',date:'2026-06-29',title:'Reversement (Bersama)',time:'',category:'reversement',note:''},
];

/* ══ TRAFFIC ══ */
function trackVisit(){const k='naposo_visits_v2';let d=JSON.parse(localStorage.getItem(k)||'{}');d.total=(d.total||0)+1;localStorage.setItem(k,JSON.stringify(d));return d;}

/* ══ INIT ══ */
async function init(){
  applyDark();
  const visits=trackVisit();
  document.getElementById('footerYear').textContent=new Date().getFullYear();
  document.getElementById('footerVisits').textContent=visits.total||1;
  document.getElementById('stValVisit').textContent=visits.total||1;
  applyLangUI();buildLoginDropdown();buildCatFilterDropdown();buildLegend();buildTabs();
  document.addEventListener('click',e=>{
    if(!document.getElementById('catFilterWrap').contains(e.target)) document.getElementById('catFilterDropdown').classList.remove('open');
    if(!document.getElementById('infoBtn').parentElement.contains(e.target)) document.getElementById('statsPopup').classList.remove('open');
    if(!document.getElementById('hamburgerBtn').contains(e.target)&&!document.getElementById('hdrMenuPanel').contains(e.target)) closeHamburger();
  });
  try{
    await loadCatsFromDB();
    buildCatFilterDropdown();buildLegend();buildTabs();
    EVENTS=await dbGet('events','select=*&order=date.asc,created_at.asc');
    renderCalendar();renderStats();
    startRealtime();
  }catch(e){document.getElementById('calWrap').innerHTML=`<div class="loading-box" style="color:var(--red)">⚠ Gagal memuat data.<br><small>${e.message}</small></div>`;}
}

function startRealtime(){
  const evtSource=new EventSource(`${SUPA_URL}/realtime/v1/sse?apikey=${SUPA_KEY}&x-client-info=supabase-js/0`);
  // Gunakan polling ringan sebagai fallback realtime
  setInterval(async()=>{
    try{
      const newEvs=await dbGet('events','select=*&order=date.asc,created_at.asc');
      const newCats=await dbGet('categories','select=*&order=created_at.asc');
      // sync events
      const localIds=EVENTS.map(e=>e.id).sort().join(',');
      const remoteIds=newEvs.map(e=>e.id).sort().join(',');
      if(localIds!==remoteIds||JSON.stringify(EVENTS)!==JSON.stringify(newEvs)){
        EVENTS=newEvs;renderCalendar();renderStats();if(currentView==='agenda')renderAgenda();
      }
      // sync categories
      const customCats=newCats.filter(r=>!BUILT_IN.includes(r.id));
      customCats.forEach(r=>{CATS[r.id]=r.color;CNAMES_ID[r.id]=r.label_id;CNAMES_EN[r.id]=r.label_en;});
      // hapus kategori kustom yang sudah dihapus di DB
      Object.keys(CATS).filter(k=>!BUILT_IN.includes(k)).forEach(k=>{
        if(!customCats.find(r=>r.id===k)){delete CATS[k];delete CNAMES_ID[k];delete CNAMES_EN[k];}
      });
      buildCatFilterDropdown();buildLegend();
    }catch(_){}
  },15000); // poll tiap 15 detik
}

/* ══ DARK MODE ══ */
function applyDark(){
  document.documentElement.setAttribute('data-theme',darkMode?'dark':'light');
  ['darkTrackMobile'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('on',darkMode);});
  const btn=document.getElementById('darkToggleBtn');if(btn)btn.textContent=darkMode?'☀️':'🌙';
}
function toggleDark(){darkMode=!darkMode;localStorage.setItem('naposo_dark',darkMode?'1':'0');applyDark();}
function toggleDarkMobile(){darkMode=!darkMode;localStorage.setItem('naposo_dark',darkMode?'1':'0');applyDark();}

/* ══ LANGUAGE ══ */
function applyLangUI(){
  const isEn=lang==='en';
  ['langTrackMobile'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('on',isEn);});
  const langBtn=document.getElementById('langToggleBtn');if(langBtn)langBtn.textContent=isEn?'ID':'EN';
  const ids={hdrSub:'hdrSub',loginBtnTxt:'loginBtnTxt',adminBarTxt:'adminBarTxt',
    addBtnTxt:'addBtnTxt',lbDate:'lbDate',lbTitle:'lbTitle',lbStart:'lbStart',lbEnd:'lbEnd',
    lbCat:'lbCat',lbNote:'lbNote',cancelBtn:'cancelBtn',evSaveBtn:'saveBtn',
    loginTitle:'loginTitle',lbName:'lbName',lbPw:'lbPw',loginErr:'loginErr',
    loginBtn2:'loginBtn2',detailTitle:'detailTitle',cancelBtn2:'cancelBtn',
    catMgrBtn:'catMgrBtn',footerVisitLbl:'footerVisit',
    darkModeLbl:'darkModeLbl',langModeLbl:'langModeLbl',
    loginBtnMobileTxt:'loginBtnTxt',
  };
  Object.entries(ids).forEach(([el,key])=>{const e=document.getElementById(el);if(e)e.textContent=tx(key);});
  const todayBtn=document.getElementById('todayBtn');if(todayBtn)todayBtn.textContent=lang==='en'?'Today':'Hari ini';
  const si=document.getElementById('searchInput');if(si)si.placeholder=tx('searchPlaceholder');
  if(!isAdmin){
    ['loginBadgeTxt','loginBadgeMobileTxt'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=tx('loginBadgeView');});
  }
  document.getElementById('stLblTotal').textContent=tx('statTotal');
  document.getElementById('stLblMonth').textContent=tx('statMonth');
  document.getElementById('stLblToday').textContent=tx('statToday');
  document.getElementById('stLblVisit').textContent=tx('statVisit');
  buildCatFilterDropdown();buildLegend();buildTabs();buildCatSelect();
  if(EVENTS.length){renderCalendar();renderStats();}
}
function toggleLang(){lang=lang==='en'?'id':'en';localStorage.setItem('naposo_lang',lang);applyLangUI();}
function toggleLangMobile(){lang=lang==='en'?'id':'en';localStorage.setItem('naposo_lang',lang);applyLangUI();}

/* ══ HAMBURGER ══ */
function toggleHamburger(){document.getElementById('hdrMenuPanel').classList.toggle('open');}
function closeHamburger(){document.getElementById('hdrMenuPanel').classList.remove('open');}

/* ══ TABS ══ */
function buildTabs(){
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  document.getElementById('monthTabs').innerHTML=MO.map((m,i)=>`<button class="mtab ${i===currentMonth?'on':''}" onclick="switchMonth(${i})">${m.slice(0,3)}</button>`).join('');
}
function switchMonth(i){currentMonth=i;buildTabs();renderCalendar();renderStats();if(currentView==='agenda')renderAgenda();const tb=document.getElementById('todayBtn');if(tb)tb.classList.toggle('dim',i===TODAY.getMonth()&&YEAR===TODAY.getFullYear());}
function goToday(){if(TODAY.getFullYear()!==YEAR)return;currentMonth=TODAY.getMonth();buildTabs();renderCalendar();renderStats();if(currentView==='agenda')renderAgenda();const tb=document.getElementById('todayBtn');if(tb)tb.classList.add('dim');}

/* ══ STATS ══ */
function renderStats(){
  const todayStr=new Date().toISOString().slice(0,10);
  const monStr=`${YEAR}-${String(currentMonth+1).padStart(2,'0')}`;
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  document.getElementById('calTitle').innerHTML=`${MO[currentMonth]} <span>${YEAR}</span>`;
  document.getElementById('stValTotal').textContent=EVENTS.length;
  document.getElementById('stValMonth').textContent=EVENTS.filter(e=>e.date.startsWith(monStr)).length;
  document.getElementById('stValToday').textContent=EVENTS.filter(e=>e.date===todayStr).length;
}
function toggleStats(){
  const p=document.getElementById('statsPopup');p.classList.toggle('open');
  renderStats();
}

/* ══ CAT FILTER DROPDOWN ══ */
function buildCatFilterDropdown(){
  const dd=document.getElementById('catFilterDropdown');dd.innerHTML='';
  const allOpt=document.createElement('div');
  allOpt.className=`cat-filter-opt${filterCat==='all'?' on':''}`;
  allOpt.innerHTML=`<div class="cat-filter-dot" style="background:var(--blue)"></div>${tx('allCats')}`;
  allOpt.onclick=()=>setCatFilter('all');dd.appendChild(allOpt);
  Object.keys(CATS).forEach(cat=>{
    const opt=document.createElement('div');opt.className=`cat-filter-opt${filterCat===cat?' on':''}`;
    opt.innerHTML=`<div class="cat-filter-dot" style="background:${catColor(cat)}"></div>${catLabel(cat)}`;
    opt.onclick=()=>setCatFilter(cat);dd.appendChild(opt);
  });
  // update button label & style
  const btn=document.getElementById('catFilterBtn');
  if(filterCat==='all'){btn.classList.remove('active');document.getElementById('catFilterLabel').textContent=tx('allCats');}
  else{btn.classList.add('active');document.getElementById('catFilterLabel').textContent=catLabel(filterCat);}
}
function toggleCatFilter(){document.getElementById('catFilterDropdown').classList.toggle('open');}
function setCatFilter(cat){filterCat=cat;buildCatFilterDropdown();document.getElementById('catFilterDropdown').classList.remove('open');applyFilters();if(currentView==='agenda')renderAgenda();}

/* ══ LEGEND ══ */
function buildLegend(){
  const w=document.getElementById('legendWrap');w.innerHTML='';
  Object.keys(CATS).forEach(cat=>{
    const it=document.createElement('div');it.className='leg-item';
    it.innerHTML=`<div class="leg-dot" style="background:${catColor(cat)}"></div>${catLabel(cat)}`;
    w.appendChild(it);
  });
}

/* ══ CATEGORY SELECT (in form) ══ */
function buildCatSelect(){
  const sel=document.getElementById('evCat');if(!sel)return;
  const cur=sel.value;sel.innerHTML='';
  Object.keys(CATS).forEach(cat=>{const o=document.createElement('option');o.value=cat;o.textContent=catLabel(cat);sel.appendChild(o);});
  if(cur)sel.value=cur;
  sel.removeEventListener('change',updateExtraField);
  sel.addEventListener('change',updateExtraField);
}

/* ══ CAT MANAGER (inline in form) ══ */
function toggleCatMgr(){document.getElementById('catMgrPanel').classList.toggle('open');renderCatMgrList();}
function renderCatMgrList(){
  const list=document.getElementById('catMgrList');list.innerHTML='';
  Object.keys(CATS).forEach(cat=>{
    const row=document.createElement('div');row.className='cat-list-item';const isBI=BUILT_IN.includes(cat);
    row.innerHTML=`
      <input type="color" value="${catColor(cat)}" onchange="editCatColor('${cat}',this.value)" style="width:22px;height:22px;border:none;border-radius:4px;cursor:pointer;padding:1px;flex-shrink:0">
      <input type="text" value="${catLabel(cat)}" onchange="editCatName('${cat}',this.value)" style="flex:1;padding:3px 6px;border:1px solid var(--border2);border-radius:5px;font-family:var(--font-b);font-size:.77rem;background:var(--surface);color:var(--text)">
      ${isBI?`<span class="cat-built">bawaan</span>`:`<button class="cat-del-btn" onclick="deleteCategory('${cat}')">×</button>`}`;
    list.appendChild(row);
  });
}
async function addCategory(){
  const name=document.getElementById('newCatName').value.trim();const color=document.getElementById('newCatColor').value;
  if(!name)return;const id='cat_'+Date.now();
  CATS[id]=color;CNAMES_ID[id]=name;CNAMES_EN[id]=name;
  await saveCatToDB(id,color,name);
  buildCatFilterDropdown();buildLegend();buildCatSelect();renderCatMgrList();
  document.getElementById('newCatName').value='';showToast(tx('catAdded'),'ok');
}
async function editCatColor(cat,color){
  CATS[cat]=color;
  if(!BUILT_IN.includes(cat)) await updateCatInDB(cat,{color});
  buildCatFilterDropdown();buildLegend();buildCatSelect();renderCatMgrList();
  if(EVENTS.length)renderCalendar();showToast('Warna diperbarui!','ok');
}
async function editCatName(cat,name){
  if(!name.trim())return;
  CNAMES_ID[cat]=name;CNAMES_EN[cat]=name;
  if(!BUILT_IN.includes(cat)) await updateCatInDB(cat,{label_id:name,label_en:name});
  buildCatFilterDropdown();buildLegend();buildCatSelect();renderCatMgrList();
  if(EVENTS.length)renderCalendar();showToast('Nama diperbarui!','ok');
}
async function deleteCategory(cat){
  if(BUILT_IN.includes(cat))return;
  delete CATS[cat];delete CNAMES_ID[cat];delete CNAMES_EN[cat];
  await deleteCatFromDB(cat);
  buildCatFilterDropdown();buildLegend();buildCatSelect();renderCatMgrList();showToast(tx('catDeleted'));
}

/* ══ FILTERS ══ */
function applyFilters(){
  const q=document.getElementById('searchInput').value.trim().toLowerCase();
  document.querySelectorAll('.event-pill').forEach(pill=>{
    const ev=EVENTS.find(e=>e.id===pill.dataset.evid);if(!ev)return;
    const catOk=filterCat==='all'||ev.category===filterCat;
    const qOk=!q||(ev.title.toLowerCase().includes(q)||(ev.note||'').toLowerCase().includes(q));
    pill.style.display=(catOk&&qOk)?'':'none';
    pill.classList.toggle('ev-hl',catOk&&qOk&&!!q);
  });
  // update "+N more" buttons visibility
  document.querySelectorAll('.cal-cell:not(.empty)').forEach(cell=>{
    const allPills=[...cell.querySelectorAll('.event-pill')];
    const visible=allPills.filter(p=>p.style.display!=='none');
    // show/hide more btn
    const moreBtn=cell.querySelector('.ev-more');
    if(moreBtn){
      const ds=cell.dataset.date;
      const hidden=allPills.filter(p=>p.dataset.overflow==='1'&&p.style.display!=='none').length;
      moreBtn.style.display=hidden>0?'':'none';
      moreBtn.textContent=tx('moreEventsLabel',hidden);
    }
    cell.classList.toggle('no-match',visible.length===0&&!!q);
    });
    if(currentView==='agenda')renderAgenda(q);
}

/* ══ RENDER ══ */
function renderCalendar(){
  const w=document.getElementById('calWrap');w.innerHTML='';w.appendChild(buildMonth(YEAR,currentMonth));applyFilters();
}

function switchView(v){
  currentView=v;
  document.getElementById('btnGrid').classList.toggle('on',v==='grid');
  document.getElementById('btnAgenda').classList.toggle('on',v==='agenda');
  document.getElementById('calSection').style.display=v==='grid'?'':'none';
  const aw=document.getElementById('agendaWrap');
  if(v==='agenda'){aw.classList.add('on');renderAgenda();}
  else{aw.classList.remove('on');}
}

function renderAgenda(q){
  q=q||'';
  const aw=document.getElementById('agendaWrap');
  if(!aw)return;
  const DAYS_FULL=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const monthStr=`${YEAR}-${String(currentMonth+1).padStart(2,'0')}`;
  let evs=EVENTS.filter(e=>e.date.startsWith(monthStr));
  if(filterCat!=='all') evs=evs.filter(e=>e.category===filterCat);
  if(q) evs=evs.filter(e=>e.title.toLowerCase().includes(q)||(e.note||'').toLowerCase().includes(q));
  if(!evs.length){aw.innerHTML=`<div class="agenda-empty">Tidak ada event di bulan ini.</div>`;return;}
  evs.sort((a,b)=>a.date.localeCompare(b.date));
  const todayStr=new Date().toISOString().slice(0,10);
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  let html=`<div class="agenda-month-block">`;
  html+=`<div class="agenda-month-hdr">${MO[currentMonth]} ${YEAR} <span>${evs.length} event</span></div>`;
  html+=`<table class="agenda-table">`;
  evs.forEach(ev=>{
    const d=new Date(ev.date+'T00:00:00');
    const dow=DAYS_FULL[d.getDay()];
    const isToday=ev.date===todayStr;
    const col=catColor(ev.category);
    const lbl=catLabel(ev.category);
    const ef=getExtraField(ev.category);
    const extraVal=ef&&ev.extra?ev.extra[ef.key]:'';
    html+=`<tr onclick="openDetail(EVENTS.find(e=>e.id==='${ev.id}'))" class="agenda-row">
      <td class="ag-date${isToday?' today-row':''}">
        <span class="ag-date-num">${d.getDate()}</span>
        <span class="ag-date-day">${dow}</span>
      </td>
      <td class="ag-cat">
        <span class="ag-cat-badge" style="background:${col}22;color:${col};border:1px solid ${col}44">
          <span style="width:6px;height:6px;border-radius:50%;background:${col};display:inline-block;flex-shrink:0"></span>
          ${lbl}
        </span>
      </td>
      <td>
        <div class="ag-title">${ev.title}</div>
        ${ev.time?`<div class="ag-time">⏰ ${ev.time}</div>`:''}
        ${extraVal?`<div class="ag-extra">📌 ${ef.label}: <span>${extraVal}</span></div>`:''}
        ${ev.note?`<div class="ag-note">${ev.note.substring(0,80)}${ev.note.length>80?'…':''}</div>`:''}
      </td>
      <td class="ag-actions">
        ${isAdmin?`<button class="ag-del-btn" onclick="event.stopPropagation();confirmDel('${ev.id}',event)">✕</button>`:''}
      </td>
    </tr>`;
  });
  html+=`</table></div>`;
  aw.innerHTML=html;
}

function buildMonth(year,month){
  const DAYS=lang==='en'?DAYS_EN:DAYS_ID;
  const sec=document.createElement('div');sec.className='cal-section';
  const rawFirst=new Date(year,month,1).getDay();
  const first=(rawFirst===0?6:rawFirst-1);
  const total=new Date(year,month+1,0).getDate();
  const grid=document.createElement('div');grid.className='cal-grid';
  const names=document.createElement('div');names.className='cal-names';
  DAYS.forEach(d=>{const el=document.createElement('div');el.className='cal-name';el.textContent=d;names.appendChild(el);});
  grid.appendChild(names);
  const body=document.createElement('div');body.className='cal-body';
  for(let i=0;i<first;i++){const c=document.createElement('div');c.className='cal-cell empty';body.appendChild(c);}
  for(let d=1;d<=total;d++){
    const dow=new Date(year,month,d).getDay();
    const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday=TODAY.getFullYear()===year&&TODAY.getMonth()===month&&TODAY.getDate()===d;
    const cell=document.createElement('div');
    cell.className=`cal-cell${isToday?' today':''}${dow===0?' sunday':dow===6?' saturday':''}`;
    cell.dataset.date=ds;
    if(isAdmin){
      cell.addEventListener('dragover',e=>{e.preventDefault();cell.classList.add('drag-over');});
      cell.addEventListener('dragleave',()=>cell.classList.remove('drag-over'));
      cell.addEventListener('drop',e=>{e.preventDefault();cell.classList.remove('drag-over');dropEv(e,ds);});
    }
    const num=document.createElement('div');num.className='cal-num';num.textContent=d;cell.appendChild(num);
    if(isAdmin){const ab=document.createElement('button');ab.className='cal-add';ab.textContent='+';ab.onclick=e=>{e.stopPropagation();openAddModal(ds);};cell.appendChild(ab);}
    const dayEvs=EVENTS.filter(ev=>ev.date===ds);
    dayEvs.forEach((ev,idx)=>{
      const pill=makePill(ev);
      if(idx>=MAX_VISIBLE){pill.dataset.overflow='1';pill.style.display='none';}
      cell.appendChild(pill);
    });
    // "+N more" button
    if(dayEvs.length>MAX_VISIBLE){
      const more=document.createElement('button');more.className='ev-more';
      const hidden=dayEvs.length-MAX_VISIBLE;
      more.textContent=tx('moreEventsLabel',hidden);
      more.onclick=()=>showDayPopup(ds,dayEvs);
      cell.appendChild(more);
    }
    body.appendChild(cell);
  }
  grid.appendChild(body);sec.appendChild(grid);return sec;
}

/* ── SINGLE-LINE PILL (Apple Cal style) ── */
function makePill(ev){
  const pill=document.createElement('div');
  const catClass=BUILT_IN.includes(ev.category)?`ev-${ev.category}`:'ev-other';
  pill.className=`event-pill ${catClass}`;pill.dataset.evid=ev.id;
  const col=catColor(ev.category);
  const dot=document.createElement('div');dot.className='ev-dot';dot.style.background=col;
  const lbl=document.createElement('span');lbl.className='ev-label';lbl.textContent=ev.title;
  pill.appendChild(dot);pill.appendChild(lbl);
  if(ev.time){const t=document.createElement('span');t.className='ev-time-inline';t.textContent=ev.time.split('–')[0];pill.appendChild(t);}
  if(hasLink(ev.note)){
    const firstUrl=(ev.note.match(/https?:\/\/[^\s<]+/)||[])[0];
    const lnk=document.createElement('a');lnk.className='ev-link-icon';lnk.textContent='🔗';
    lnk.href=firstUrl;lnk.target='_blank';lnk.rel='noopener';lnk.title=firstUrl;
    lnk.onclick=e=>e.stopPropagation();
    pill.appendChild(lnk);
  }
  if(isAdmin){
    const del=document.createElement('button');del.className='ev-del';del.textContent='✕';
    del.onclick=e=>{e.stopPropagation();confirmDel(ev.id,e);};pill.appendChild(del);
    const cp=document.createElement('button');cp.className='ev-copy';cp.textContent='⧉';cp.title='Salin event';
    cp.onclick=e=>{e.stopPropagation();copyEvent(ev);};pill.appendChild(cp);
  }
  pill.onclick=()=>openDetail(ev);
  if(!BUILT_IN.includes(ev.category)){pill.style.background=col+'22';pill.style.color=col;}
  if(isAdmin){
    pill.draggable=true;
    pill.addEventListener('dragstart',e=>{
      e.dataTransfer.setData('evId',ev.id);
      e.dataTransfer.setData('evCopy',e.ctrlKey||e.metaKey?'1':'0');
      pill.classList.add('dragging');
    });
    pill.addEventListener('dragend',()=>pill.classList.remove('dragging'));
  }
  /* ===== HOVER PREVIEW ===== */

  pill.addEventListener('mouseenter', (e) => {
    console.log("HOVER MASUK", ev.title);
    showPreview(e, ev);
  });

  pill.addEventListener('mousemove', (e) => {
    movePreview(e);
  });

  pill.addEventListener('mouseleave', () => {
    hidePreview();
  });

  /* ===== END HOVER PREVIEW ===== */
  return pill;
}

/* ── DAY POPUP (shows all events for a date) ── */
function showDayPopup(ds,evs){
  window._detEv=null;
  const d=new Date(ds+'T00:00:00');
  const lbl=d.toLocaleDateString(lang==='en'?'en-US':'id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('detailTitle').textContent=lbl;
  const body=document.getElementById('detailBody');body.innerHTML='';
  evs.forEach(ev=>{
    const item=document.createElement('div');
    item.style.cssText='display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer';
    item.innerHTML=`<div style="width:9px;height:9px;border-radius:50%;background:${catColor(ev.category)};flex-shrink:0;margin-top:5px"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.85rem;font-weight:600;color:var(--text)">${ev.title}</div>
        ${ev.time?`<div style="font-size:.74rem;color:var(--text2)">⏰ ${ev.time}</div>`:''}
      </div>`;
    item.onclick=()=>openDetail(ev);
    body.appendChild(item);
  });
  document.getElementById('detailFoot').innerHTML=`<button class="btn btn-ghost" onclick="closeModal('detailModal')">${tx('closeBtn')}</button>`;
  openModal('detailModal');
}

/* ══ DRAG & DROP ══ */
async function dropEv(e,newDate){
  const evId=e.dataTransfer.getData('evId');if(!evId)return;
  const isCopy=e.dataTransfer.getData('evCopy')==='1';
  const ev=EVENTS.find(x=>x.id===evId);if(!ev)return;
  setSyncBadge('load',tx('saving'));
  try{
    if(isCopy){
      const newEv={...ev,id:'ev_'+Date.now(),date:newDate};
      const[ins]=await dbWrite('events','INSERT',newEv);
      EVENTS.push(ins||newEv);EVENTS.sort((a,b)=>a.date.localeCompare(b.date));
      pushUndo({type:'add',ev:ins||newEv});
      renderCalendar();renderStats();showToast('Event diduplikat ✓','ok');setSyncBadge('ok',tx('connected'));return;
    }
    if(ev.date===newDate)return;
    const oldDate=ev.date;
    await dbWrite('events','UPDATE',{date:newDate},{id:evId});
    ev.date=newDate;
    pushUndo({type:'move',ev:{...ev},oldDate});
    renderCalendar();renderStats();showToast(tx('dragMoved'),'ok');setSyncBadge('ok',tx('connected'));
  }
  catch(err){showToast(tx('dragFail'),'err');setSyncBadge('err','Error');}
}

/* ══ MODALS ══ */
function openModal(id){document.getElementById(id).classList.add('on');}
function closeModal(id){document.getElementById(id).classList.remove('on');if(id==='eventModal'){const p=document.getElementById('catMgrPanel');if(p)p.classList.remove('open');}}
document.querySelectorAll('.overlay').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)closeModal(el.id);}));

function openAddModal(ds){
  editingId=null;document.getElementById('evModalTitle').textContent=tx('evModalAdd');
  document.getElementById('evDate').value=ds||'';document.getElementById('evTitle').value='';
  document.getElementById('evStart').value='';document.getElementById('evEnd').value='';
  document.getElementById('evNote').value='';
  buildCatSelect();updateExtraField();openModal('eventModal');
}

function openEditModal(ev){
  editingId=ev.id;document.getElementById('evModalTitle').textContent=tx('evModalEdit');
  document.getElementById('evDate').value=ev.date;document.getElementById('evTitle').value=ev.title;
  const ts=(ev.time||'').split('–');
  document.getElementById('evStart').value=ts[0]||'';document.getElementById('evEnd').value=ts[1]||'';
  document.getElementById('evNote').value=ev.note||'';
  buildCatSelect();document.getElementById('evCat').value=ev.category||'other';
  updateExtraField();
  setTimeout(()=>{
    const extraField=getExtraField(ev.category);
    const inp=document.getElementById('extraFieldInput');
    if(extraField&&inp&&ev.extra) inp.value=ev.extra[extraField.key]||'';
  },30);
  openModal('eventModal');
}

function openDetail(ev){
  window._detEv=ev;
  const d=new Date(ev.date+'T00:00:00');
  const lbl=d.toLocaleDateString(lang==='en'?'en-US':'id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const col=catColor(ev.category);
  document.getElementById('detailTitle').textContent=tx('detailTitle');
  document.getElementById('detailBody').innerHTML=`<div class="det-card">
    <div class="det-date">${lbl}</div>
    <div class="det-title">${ev.title}</div>
    ${ev.time?`<div class="det-time">⏰ ${ev.time}</div>`:''}
    ${ev.link?`<div class="det-link"><a href="${ev.link}" target="_blank" rel="noopener" style="color:var(--blue);font-size:.82rem;word-break:break-all">🔗 ${ev.link}</a></div>`:''}
    ${(()=>{const ef=getExtraField(ev.category);const ev2=ev;const val=ef&&ev2.extra?ev2.extra[ef.key]:'';return val?`<div class="det-row" style="margin-bottom:6px"><span style="font-size:.78rem;color:var(--text2)">📌 ${ef.label}:</span> <span style="font-size:.82rem;font-weight:600">${val}</span></div>`:''})()}
    ${ev.note?`<div class="det-note">${linkify(ev.note.replace(/\r\n|\r|\n/g,'<br>'))}</div>`:''}    <span class="det-cat" style="background:${col}22;color:${col}">${catLabel(ev.category)}</span>
  </div>`;
  document.getElementById('detailFoot').innerHTML=`
    <button class="btn btn-ghost" onclick="closeModal('detailModal')">${tx('closeBtn')}</button>
    ${isAdmin?`<button class="btn btn-primary" onclick="closeModal('detailModal');openEditModal(window._detEv)">${tx('editBtn')}</button>`:''}`;
  openModal('detailModal');
}

/* ══ CRUD ══ */
async function saveEvent(){
  const date=document.getElementById('evDate').value,title=document.getElementById('evTitle').value.trim();
  const tS=document.getElementById('evStart').value,tE=document.getElementById('evEnd').value;
  const cat=document.getElementById('evCat').value,note=document.getElementById('evNote').value.trim();
  const link='';
  if(!date||!title){showToast(tx('fieldReq'),'err');return;}
  const time=tS?(tE?`${tS}–${tE}`:tS):'';
  const btn=document.getElementById('evSaveBtn');btn.disabled=true;btn.textContent=tx('saving');setSyncBadge('load',tx('saving'));
  try{
    const extraField=getExtraField(cat);
    const extraVal=document.getElementById('extraFieldInput')?.value.trim()||'';
    const extra=extraField&&extraVal?{[extraField.key]:extraVal}:{};
    if(editingId){
      const prev={...EVENTS.find(e=>e.id===editingId)};
      await dbWrite('events','UPDATE',{date,title,time,category:cat,note,link,extra},{id:editingId});
      const i=EVENTS.findIndex(e=>e.id===editingId);if(i!==-1)EVENTS[i]={...EVENTS[i],date,title,time,category:cat,note,link,extra};
      pushUndo({type:'edit',prev});
    }else{
      const id='ev_'+Date.now();
      const[ins]=await dbWrite('events','INSERT',{id,date,title,time,category:cat,note,link,extra});
      EVENTS.push(ins||{id,date,title,time,category:cat,note,link,extra});
      pushUndo({type:'add',ev:ins||{id,date,title,time,category:cat,note,link,extra}});
    }
    closeModal('eventModal');renderCalendar();renderStats();showToast(tx('saved'),'ok');setSyncBadge('ok',tx('connected'));
  }catch(e){showToast(`${tx('saveFail')}: ${e.message}`,'err');setSyncBadge('err','Error');}
  finally{btn.disabled=false;btn.textContent=tx('saveBtn');}
}
async function confirmDel(id,e){
  e.stopPropagation();if(!confirm(tx('deleteConfirm')))return;setSyncBadge('load',tx('saving'));
  try{
    const deleted={...EVENTS.find(ev=>ev.id===id)};
    await dbWrite('events','DELETE',null,{id});
    EVENTS=EVENTS.filter(ev=>ev.id!==id);
    pushUndo({type:'delete',ev:deleted});
    renderCalendar();renderStats();showToast(tx('deleted'));setSyncBadge('ok',tx('connected'));
  }
  catch(err){showToast(`${tx('delFail')}: ${err.message}`,'err');setSyncBadge('err','Error');}
}

/* ══ AUTH ══ */
function openLoginModal(){
  document.getElementById('loginErr').style.display='none';
  document.getElementById('loginName').value='';document.getElementById('loginPw').value='';
  buildLoginDropdown();openModal('loginModal');
}
function buildLoginDropdown(){
  const sel=document.getElementById('loginName');sel.innerHTML=`<option value="">${tx('selectName')}</option>`;
  [...USER_NAMES].sort().forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
}

async function doLogin(){
  const name=document.getElementById('loginName').value,pw=document.getElementById('loginPw').value;
  if(!name||!pw){document.getElementById('loginErr').style.display='block';return;}
  const btn=document.getElementById('loginBtn2');btn.disabled=true;btn.textContent='Memverifikasi…';
  let data;
  try{
    const res=await fetch(`${SUPA_URL}/functions/v1/verify-login`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPA_KEY}`},
      body:JSON.stringify({username:name,password:pw})
    });
    data=await res.json();
    if(!data.success){
      document.getElementById('loginErr').style.display='block';
      btn.disabled=false;btn.textContent=tx('loginBtn2');return;
    }
  }catch(e){
    document.getElementById('loginErr').style.display='block';
    btn.disabled=false;btn.textContent=tx('loginBtn2');return;
  }
  adminToken=data.token||null;
  isAdmin=true;resetUndo();document.body.classList.add('admin-mode');
  document.getElementById('adminBar').classList.add('on');
  ['loginBadge','loginBadgeMobile'].forEach(id=>document.getElementById(id).classList.add('on'));
  ['loginBadgeTxt','loginBadgeMobileTxt'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=name+' (Pengurus)';});
  document.getElementById('loginBtn').textContent=`✓ ${name}`;document.getElementById('loginBtn').disabled=true;
  document.getElementById('loginBtnMobile').textContent=`✓ ${name}`;document.getElementById('loginBtnMobile').disabled=true;
  document.getElementById('addEventBtn').style.display='';
  btn.disabled=false;btn.textContent=tx('loginBtn2');
  setSyncBadge('ok',tx('connected'));closeModal('loginModal');renderCalendar();
  showToast(`${tx('welcome')}, ${name}! ${tx('modeActive')}`,'ok');
}

function copyEvent(ev){
  copiedEvent={...ev};
  showToast('Event disalin: '+ev.title,'ok');
  document.getElementById('pasteBtn').style.opacity='1';
  document.getElementById('pasteBtn').disabled=false;
}
function pasteEvent(){
  if(!copiedEvent){showToast('Belum ada event yang disalin.','err');return;}
  openAddModal(null);
  setTimeout(()=>{
    document.getElementById('evTitle').value=copiedEvent.title;
    document.getElementById('evStart').value=copiedEvent.time?copiedEvent.time.split('–')[0]:'';
    document.getElementById('evEnd').value=copiedEvent.time?copiedEvent.time.split('–')[1]||'':'';
    document.getElementById('evCat').value=copiedEvent.category;
    document.getElementById('evNote').value=copiedEvent.note||'';
  },50);
}

function doLogout(){
  adminToken=null;
  isAdmin=false;document.body.classList.remove('admin-mode');
  document.getElementById('adminBar').classList.remove('on');
  ['loginBadge','loginBadgeMobile'].forEach(id=>document.getElementById(id).classList.remove('on'));
  ['loginBadgeTxt','loginBadgeMobileTxt'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=tx('loginBadgeView');});
  document.getElementById('loginBtn').textContent=`🔒 ${tx('loginBtnTxt')}`;document.getElementById('loginBtn').disabled=false;
  document.getElementById('loginBtnMobile').textContent=`🔒 ${tx('loginBtnTxt')}`;document.getElementById('loginBtnMobile').disabled=false;
  document.getElementById('addEventBtn').style.display='none';
  renderCalendar();showToast(tx('logoutBtn'));
}

/* ══ PASSWORD TOGGLE ══ */
function togglePw(id,btn){
  const inp=document.getElementById(id);const isT=inp.type==='text';inp.type=isT?'password':'text';
  btn.innerHTML=isT?`<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>`:
  `<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/></svg>`;
}

/* ══ SYNC BADGE ══ */
function setSyncBadge(type,txt){
  const b=document.getElementById('syncBadge'),d=document.getElementById('syncDot');
  b.className=`sync-badge ${type}`;d.className=`sync-dot${type==='load'?' pulse':''}`;
  document.getElementById('syncTxt').textContent=txt;
}

/* ══ TOAST ══ */
let _tt;
function showToast(msg,type=''){
  const el=document.getElementById('toast');el.textContent=msg;
  el.className=`toast on${type==='err'?' err':type==='ok'?' ok':''}`;
  clearTimeout(_tt);_tt=setTimeout(()=>el.classList.remove('on'),3200);
}

/* ══ EXPORT ══ */
let exportFormat='pdf', exportScope='all';

function openExportModal(){
  if(!isAdmin){showToast('Fitur export hanya untuk pengurus yang login.','err');return;}
  selectExportFormat('pdf');selectExportScope('all');
  document.getElementById('exportProgress').classList.remove('on');
  document.getElementById('doExportBtn').disabled=false;
  document.getElementById('doExportBtn').innerHTML=`<svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg> Export Sekarang`;
  openModal('exportModal');
}

function selectExportFormat(fmt){
  exportFormat=fmt;
  ['pdf','png','csv','ical'].forEach(f=>{
    const el=document.getElementById(`expCard${f.charAt(0).toUpperCase()+f.slice(1)}`);
    if(el) el.classList.toggle('selected', f===fmt);
  });
}

function selectExportScope(scope){
  exportScope=scope;
  ['all','month','pick','cat'].forEach(s=>{
    const el=document.getElementById(`scopeBtn${s.charAt(0).toUpperCase()+s.slice(1)}`);
    if(el) el.classList.toggle('on', s===scope);
  });
  const picker=document.getElementById('monthPickerRow');
  if(picker) picker.style.display=scope==='pick'?'flex':'none';
  if(scope==='pick'){
    const fromEl=document.getElementById('exportMonthFrom');
    const toEl=document.getElementById('exportMonthTo');
    fromEl.value=0;
    toEl.value=11;
    updateMonthRangeHint();
    fromEl.onchange=updateMonthRangeHint;
    toEl.onchange=()=>{
      const f=parseInt(fromEl.value), t=parseInt(toEl.value);
      if(t<f) fromEl.value=t;
      updateMonthRangeHint();
    };
  }
}

function updateMonthRangeHint(){
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  const f=parseInt(document.getElementById('exportMonthFrom').value);
  const t=parseInt(document.getElementById('exportMonthTo').value);
  const evCount=EVENTS.filter(e=>{
    const m=parseInt(e.date.slice(5,7))-1;
    return m>=f && m<=t;
  }).length;
  const hint=document.getElementById('monthRangeHint');
  if(f===t){
    hint.textContent=`${MO[f]} — ${evCount} event`;
  } else {
    hint.textContent=`${MO[f]} s/d ${MO[t]} — ${evCount} event`;
  }
}

function getExportEvents(){
  let evs=[...EVENTS];
  if(exportScope==='month'){
    const monStr=`${YEAR}-${String(currentMonth+1).padStart(2,'0')}`;
    evs=evs.filter(e=>e.date.startsWith(monStr));
  } else if(exportScope==='pick'){
    const f=parseInt(document.getElementById('exportMonthFrom').value);
    const t=parseInt(document.getElementById('exportMonthTo').value);
    const from=Math.min(f,t), to=Math.max(f,t);
    evs=evs.filter(e=>{
      const m=parseInt(e.date.slice(5,7))-1;
      return m>=from && m<=to;
    });
  } else if(exportScope==='cat' && filterCat!=='all'){
    evs=evs.filter(e=>e.category===filterCat);
  }
  return evs.sort((a,b)=>a.date.localeCompare(b.date));
}

function setExportProgress(pct, txt){
  document.getElementById('exportProgress').classList.add('on');
  document.getElementById('exportProgressFill').style.width=pct+'%';
  document.getElementById('exportProgressTxt').textContent=txt;
}

function doExport(){
  if(exportFormat==='pdf') exportPDF();
  else if(exportFormat==='png') exportPNG();
  else if(exportFormat==='csv') exportCSV();
  else if(exportFormat==='ical') exportICAL();
}

/* ── CSV ── */
function exportCSV(){
  setExportProgress(40,'Membuat spreadsheet…');
  const evs=getExportEvents();
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  const rows=[['Tanggal','Hari','Judul Event','Waktu','Kategori','Info Tambahan','Catatan']];
  const dayNames=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  evs.forEach(ev=>{
    const d=new Date(ev.date+'T00:00:00');
    const ef=getExtraField(ev.category);
    const extraVal=ef&&ev.extra?ev.extra[ef.key]||'':'';
    rows.push([ev.date, dayNames[d.getDay()], ev.title, ev.time||'', catLabel(ev.category), extraVal, ev.note||'']);
  });
  const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const f=exportScope==='pick'?parseInt(document.getElementById('exportMonthFrom').value):null;
  const t=exportScope==='pick'?parseInt(document.getElementById('exportMonthTo').value):null;
  const scopeLabel=exportScope==='month'?`_${MO[currentMonth]}`:exportScope==='pick'?`_${MO[Math.min(f,t)]}-${MO[Math.max(f,t)]}`:exportScope==='cat'&&filterCat!=='all'?`_${catLabel(filterCat)}`:'';  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  triggerDownload(blob,`Kalender_Naposo_2026${scopeLabel}.csv`);
  setExportProgress(100,'Selesai! File CSV siap diunduh.');
  showToast('Export CSV berhasil ✓','ok');
  setTimeout(()=>{document.getElementById('doExportBtn').disabled=false;},1200);
}

/* ── iCAL ── */
function exportICAL(){
  setExportProgress(40,'Membuat file kalender…');
  const evs=getExportEvents();
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  let ical='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Naposo HKBP Ujung Menteng//Kalender Pelayanan 2026//ID\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:Kalender Pelayanan Naposo HKBP Ujung Menteng\r\nX-WR-TIMEZONE:Asia/Jakarta\r\n';
  evs.forEach(ev=>{
    const uid=ev.id+'@naposo-hkbp-ujung-menteng';
    const dateStr=ev.date.replace(/-/g,'');
    let dtStart, dtEnd;
    if(ev.time && ev.time.includes('–')){
      const [ts,te]=ev.time.split('–');
      dtStart=`${dateStr}T${ts.replace(':','')}00`;
      dtEnd=`${dateStr}T${te.replace(':','')}00`;
    } else if(ev.time){
      dtStart=`${dateStr}T${ev.time.replace(':','')}00`;
      dtEnd=`${dateStr}T${(parseInt(ev.time.split(':')[0])+1).toString().padStart(2,'0')}${ev.time.split(':')[1]}00`;
    } else {
      dtStart=dateStr; dtEnd=dateStr;
    }
    const isAllDay=!ev.time;
    ical+='BEGIN:VEVENT\r\n';
    ical+=`UID:${uid}\r\n`;
    ical+=`SUMMARY:${ev.title}\r\n`;
    if(isAllDay){ical+=`DTSTART;VALUE=DATE:${dtStart}\r\n`;ical+=`DTEND;VALUE=DATE:${dtEnd}\r\n`;}
    else{ical+=`DTSTART;TZID=Asia/Jakarta:${dtStart}\r\n`;ical+=`DTEND;TZID=Asia/Jakarta:${dtEnd}\r\n`;}
    if(ev.note) ical+=`DESCRIPTION:${ev.note.replace(/\n/g,'\\n')}\r\n`;
    ical+=`CATEGORIES:${catLabel(ev.category)}\r\n`;
    ical+='END:VEVENT\r\n';
  });
  ical+='END:VCALENDAR\r\n';
  const f=exportScope==='pick'?parseInt(document.getElementById('exportMonthFrom').value):null;
  const t=exportScope==='pick'?parseInt(document.getElementById('exportMonthTo').value):null;
  const scopeLabel=exportScope==='month'?`_${MO[currentMonth]}`:exportScope==='pick'?`_${MO[Math.min(f,t)]}-${MO[Math.max(f,t)]}`:exportScope==='cat'&&filterCat!=='all'?`_${catLabel(filterCat)}`:'';
  const blob=new Blob([ical],{type:'text/calendar;charset=utf-8;'});
  triggerDownload(blob,`Kalender_Naposo_2026${scopeLabel}.ics`);
  setExportProgress(100,'Selesai! File .ics siap diunduh.');
  showToast('Export iCal berhasil ✓','ok');
}

/* ── PDF ── */
function exportPDF(){
  const evs=getExportEvents();
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  const f=exportScope==='pick'?parseInt(document.getElementById('exportMonthFrom').value):null;
  const t=exportScope==='pick'?parseInt(document.getElementById('exportMonthTo').value):null;
  const scopeLabel=exportScope==='month'?` — ${MO[currentMonth]} ${YEAR}`:exportScope==='pick'?` — ${MO[Math.min(f,t)]} s/d ${MO[Math.max(f,t)]} ${YEAR}`:exportScope==='cat'&&filterCat!=='all'?` — ${catLabel(filterCat)}`:`— Semua Bulan`;
  setExportProgress(30,'Menyiapkan dokumen PDF…');
  const w=window.open('','_blank');
  if(!w){showToast('Popup diblokir. Izinkan popup di browser.','err');return;}
  const groupByMonth={};
  evs.forEach(ev=>{
    const m=ev.date.slice(0,7);
    if(!groupByMonth[m]) groupByMonth[m]=[];
    groupByMonth[m].push(ev);
  });
  const dayNames=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  let tableRows='';
  Object.keys(groupByMonth).sort().forEach(ym=>{
    const [y,m]=ym.split('-');
    const mName=MO[parseInt(m)-1];
    tableRows+=`<tr class="month-header"><td colspan="6">${mName} ${y}</td></tr>`;
    groupByMonth[ym].forEach((ev,i)=>{
      const d=new Date(ev.date+'T00:00:00');
      const col=catColor(ev.category);
      const ef=getExtraField(ev.category);
      const xv=ef&&ev.extra?ev.extra[ef.key]||'—':'—';
      tableRows+=`<tr class="${i%2===1?'odd':''}">
        <td>${ev.date}</td>
        <td>${dayNames[d.getDay()]}</td>
        <td>${ev.title}</td>
        <td>${ev.time||'—'}</td>
        <td><span class="cat-badge" style="background:${col}22;color:${col};border:1px solid ${col}44">${catLabel(ev.category)}</span></td>
        <td>${xv}</td>
      </tr>`;
    });
  });
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Kalender Pelayanan Naposo HKBP Ujung Menteng 2026</title>
  <link rel="stylesheet" href="css/kalender.css"></head><body>
  <div class="cover">
    <h1>Kalender Pelayanan Naposo HKBP Ujung Menteng</h1>
    <p>Diekspor pada ${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
    <span class="scope">📅 ${scopeLabel}</span>
  </div>
  <table>
    <thead><tr><th>Tanggal</th><th>Hari</th><th>Judul Event</th><th>Waktu</th><th>Kategori</th><th>Info Tambahan</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">Naposo HKBP Ujung Menteng · Kalender Pelayanan 2026 · Total ${evs.length} event</div>
  </body></html>`;
  setExportProgress(80,'Membuka jendela cetak…');
  w.document.write(html);
  w.document.close();
  setTimeout(()=>{w.focus();w.print();setExportProgress(100,'Selesai!');showToast('PDF siap dicetak ✓','ok');},600);
}

/* ── PNG (html2canvas) ── */
async function exportPNG(){
  setExportProgress(20,'Memuat library screenshot…');
  document.getElementById('doExportBtn').disabled=true;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  setExportProgress(50,'Mengambil screenshot kalender…');
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  try{
    const target=document.getElementById('calWrap');
    const canvas=await html2canvas(target,{scale:2,useCORS:true,backgroundColor:getComputedStyle(document.documentElement).getPropertyValue('--surface')||'#ffffff',logging:false});
    setExportProgress(85,'Menyimpan gambar…');
    const f=exportScope==='pick'?parseInt(document.getElementById('exportMonthFrom').value):null;
    const t=exportScope==='pick'?parseInt(document.getElementById('exportMonthTo').value):null;
    const scopeLabel=exportScope==='month'?`_${MO[currentMonth]}`:exportScope==='pick'?`_${MO[Math.min(f,t)]}-${MO[Math.max(f,t)]}`:exportScope==='cat'&&filterCat!=='all'?`_${catLabel(filterCat)}`:'';
    canvas.toBlob(blob=>{
      triggerDownload(blob,`Kalender_Naposo_${MO[currentMonth]}_2026${scopeLabel}.png`);
      setExportProgress(100,'Selesai! Gambar PNG siap diunduh.');
      showToast('Export PNG berhasil ✓','ok');
      document.getElementById('doExportBtn').disabled=false;
    },'image/png');
  }catch(err){
    showToast('Gagal export PNG: '+err.message,'err');
    document.getElementById('doExportBtn').disabled=false;
  }
}

function loadScript(src){
  return new Promise((res,rej)=>{
    if(document.querySelector(`script[src="${src}"]`)){res();return;}
    const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);
  });
}

function triggerDownload(blob,filename){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

document.addEventListener("DOMContentLoaded", function(){
  init();
});

function getPreviewBox(){
  return document.getElementById('event-preview');
}

function showPreview(e, ev){
  const previewBox = getPreviewBox();
  if(!previewBox) return;
  const d = new Date(ev.date+'T00:00:00');
  const dateStr = d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'});
  const noteRaw = ev.note ? ev.note.substring(0,100)+(ev.note.length>100?'…':'') : '';
  const noteFmt = linkify(noteRaw.replace(/\r\n|\r|\n/g,'<br>'));
  const extraField=getExtraField(ev.category);
  const extraVal=extraField&&ev.extra?ev.extra[extraField.key]:'';
  previewBox.innerHTML = `
    <strong>${ev.title}</strong><br>
    📅 ${dateStr}<br>
    ${ev.time ? '⏰ '+ev.time+'<br>' : ''}
    ${extraVal?`<div style="margin-top:4px;font-size:11px;color:rgba(255,255,255,.75)">📌 ${extraField.label}: ${extraVal}</div>`:''}
    ${noteFmt ? '<div style="margin-top:5px;border-top:1px solid rgba(255,255,255,.15);padding-top:5px">'+noteFmt+'</div>' : ''}
  `
  previewBox.style.display = 'block';
  previewBox.classList.add('show');
  movePreview(e);
}

function movePreview(e){
  const previewBox = getPreviewBox();
  if(!previewBox) return;
  const x = e.clientX + 15;
  const y = e.clientY + 15;
  const boxW = 240;
  const safeX = (x + boxW > window.innerWidth) ? e.clientX - boxW - 10 : x;
  previewBox.style.left = safeX + 'px';
  previewBox.style.top = y + 'px';
}

function hidePreview(){
  const previewBox = getPreviewBox();
  if(!previewBox) return;
  previewBox.classList.remove('show');
  previewBox.style.display = 'none';
}

/* ── Auto-detect URL di teks → <a> ── */
function linkify(text){
  if(!text) return '';
  return text.replace(/(https?:\/\/[^\s<]+)/g, url =>
    `<a href="${url}" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:underline;word-break:break-all;" onclick="event.stopPropagation()">${url}</a>`
  );
}

/* ── Cek apakah teks mengandung URL ── */
function hasLink(text){
  return /https?:\/\/[^\s<]+/.test(text||'');
}

/* ── Auto-detect URL di teks → <a> ── */
function linkify(text){
  if(!text) return '';
  return text.replace(/(https?:\/\/[^\s<]+)/g, url =>
    `<a href="${url}" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:underline;word-break:break-all;" onclick="event.stopPropagation()">${url}</a>`
  );
}