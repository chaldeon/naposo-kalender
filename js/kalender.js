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
// Kategori bawaan — warna & label ini SELALU dipakai, tidak bisa di-override dari Supabase
const DEF_COLORS={koor:'#7c3aed',ibadah:'#c9a227',rapat:'#0891b2',latihan:'#16a34a',reversement:'#db2777',doa:'#4a90d9',other:'#94a3b8'};
const DEF_LBL_ID={koor:'Koor / Pelayanan',ibadah:'Ibadah',rapat:'Rapat',latihan:'Latihan',reversement:'Reversement',doa:'Doa',other:'Lainnya'};
const DEF_LBL_EN={koor:'Koor / Pelayanan',ibadah:'Ibadah',rapat:'Rapat',latihan:'Latihan',reversement:'Reversement',doa:'Doa',other:'Lainnya'};
// CAT_EXTRA: map dari label kategori ke array field ekstra
// Setiap field: {key, label, type} — type: 'text'|'url'|'money'
const CAT_EXTRA={
  'Koor':               [{key:'judul_lagu',      label:'Judul Lagu',         type:'text'},
                         {key:'link_guide',       label:'Link Guide',         type:'url'}],
  'Ibadah / Pelayanan': [{key:'tema_acara',       label:'Tema Acara',         type:'text'}],
  'Latihan':            [{key:'judul_lagu',       label:'Judul Lagu',         type:'text'},
                         {key:'link_guide',       label:'Link Guide',         type:'url'}],
  'Reversement':        [{key:'tema_reversement', label:'Tema Reversement',   type:'text'}],
  'Olahraga':           [{key:'jenis_olahraga',   label:'Jenis Olahraga',     type:'text'},
                         {key:'tempat',           label:'Tempat / Lapangan',  type:'text'},
                         {key:'uang_patungan',    label:'Uang Patungan',      type:'money'}],
};
// Kembalikan array field untuk kategori tsb (berdasarkan label ID)
function getExtraFields(catId){
  const lbl=CNAMES_ID[catId]||catId;
  return CAT_EXTRA[lbl]||[];
}
// Legacy helper — kembalikan field pertama (untuk backward compat tooltip & export lama)
function getExtraField(catId){
  const fields=getExtraFields(catId);
  return fields.length?fields[0]:null;
}
function updateExtraField(){
  const cat=document.getElementById('evCat')?.value;
  const container=document.getElementById('extraFieldWrap');
  if(!container) return;
  const fields=getExtraFields(cat);
  if(!fields.length){
    container.style.display='none';
    container.innerHTML='';
    return;
  }
  container.style.display='block';
  container.innerHTML=fields.map(f=>`
    <div class="form-g extra-field-item" style="margin-bottom:6px">
      <label class="extra-field-label">${f.label}</label>
      <input type="text" class="extra-field-input" data-key="${f.key}"
        placeholder="${f.type==='url'?'https://…':f.type==='money'?'contoh: Rp 20.000':''}"
        style="width:100%"/>
    </div>`).join('');
}

let CATS={...DEF_COLORS},CNAMES_ID={...DEF_LBL_ID},CNAMES_EN={...DEF_LBL_EN};
function catLabel(c){return(lang==='en'?CNAMES_EN:CNAMES_ID)[c]||CNAMES_ID[c]||c;}
function catColor(c){return CATS[c]||'#94a3b8';}
async function loadCatsFromDB(){
  try{
    const rows=await dbGet('categories','select=*&order=sort_order.asc');
    if(rows&&rows.length){
      // Reset hanya custom cats — BUILT_IN selalu dari DEF_* dan tidak bisa di-override
      Object.keys(CATS).filter(k=>!BUILT_IN.includes(k)).forEach(k=>{delete CATS[k];});
      Object.keys(CNAMES_ID).filter(k=>!BUILT_IN.includes(k)).forEach(k=>{delete CNAMES_ID[k];});
      Object.keys(CNAMES_EN).filter(k=>!BUILT_IN.includes(k)).forEach(k=>{delete CNAMES_EN[k];});
      // Restore BUILT_IN ke nilai default
      BUILT_IN.forEach(k=>{CATS[k]=DEF_COLORS[k];CNAMES_ID[k]=DEF_LBL_ID[k];CNAMES_EN[k]=DEF_LBL_EN[k];});
      // Load custom cats dari Supabase (skip BUILT_IN)
      const sorted=[...rows.filter(r=>!BUILT_IN.includes(r.id)&&r.id!=='lainnya'),...rows.filter(r=>r.id==='lainnya'&&!BUILT_IN.includes(r.id))];
      sorted.forEach(r=>{CATS[r.id]=r.color;CNAMES_ID[r.id]=r.label_id;CNAMES_EN[r.id]=r.label_en;});
    }
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
    lbCat:'Kategori',lbNote:'Catatan (opsional)',lbPoster:'Link Poster (Google Drive)',cancelBtn:'Batal',saveBtn:'Simpan',
    loginTitle:'Login Pengurus',lbName:'Nama Pengurus',selectName:'-- Pilih nama --',
    lbPw:'Password',loginErr:'Password salah atau nama tidak dipilih.',
    loginBtn2:'Masuk',detailTitle:'Detail Event',closeBtn:'Tutup',editBtn:'Ubah',deleteBtn:'Hapus',
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
    undoBtn:'Undo',pasteBtn:'Paste',exportBtn:'Export',logoutBtn:'Logout',
    exportModalTitle:'Export Kalender',expSecFormat:'Format Export',expSecScope:'Data yang Di-export',
    expDescPdf:'Dokumen siap cetak, tabel rapi',expDescPng:'Screenshot tampilan kalender',
    expDescCsv:'Data spreadsheet, bisa diedit',expDescIcal:'Import ke Google / Apple Calendar',
    scopeLblAll:'Semua Bulan',scopeLblMonth:'Bulan Ini Saja',scopeLblPick:'Pilih Bulan…',scopeLblCat:'Kategori Aktif',
    exportRangeSep:'s/d',exportCancelBtn:'Batal',doExportBtnTxt:'Export Sekarang',
    exportProgressTxt:'Menyiapkan…',
  },
  en:{hdrSub:'Ministry Calendar 2026',loginBadgeView:'View only',loginBtnTxt:'Login',todayBtnTxt:'Hari ini',
    addBtnTxt:'Add',lbDate:'Date',lbTitle:'Event Title',lbStart:'Start Time',lbEnd:'End Time',
    lbCat:'Category',lbNote:'Notes (optional)',lbPoster:'Poster Link (Google Drive)',cancelBtn:'Cancel',saveBtn:'Save',
    loginTitle:'Admin Login',lbName:'Admin Name',selectName:'-- Select name --',
    lbPw:'Password',loginErr:'Wrong password or name not selected.',
    loginBtn2:'Sign In',detailTitle:'Event Detail',closeBtn:'Close',editBtn:'Edit',deleteBtn:'Delete',
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
    undoBtn:'Undo',pasteBtn:'Paste',exportBtn:'Export',logoutBtn:'Logout',
    exportModalTitle:'Export Calendar',expSecFormat:'Export Format',expSecScope:'Data to Export',
    expDescPdf:'Print-ready document, clean table',expDescPng:'Screenshot of calendar view',
    expDescCsv:'Spreadsheet data, editable',expDescIcal:'Import to Google / Apple Calendar',
    scopeLblAll:'All Months',scopeLblMonth:'This Month Only',scopeLblPick:'Pick Month…',scopeLblCat:'Active Category',
    exportRangeSep:'to',exportCancelBtn:'Cancel',doExportBtnTxt:'Export Now',
    exportProgressTxt:'Preparing…',
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
function pushUndo(action){undoStack.push(action);syncUndoBtn();}
function resetUndo(){undoStack=[];syncUndoBtn();}
function syncUndoBtn(){const btn=document.getElementById('undoBtn');if(btn)btn.disabled=undoStack.length===0;}
function setAdminBarTxt(name){
  const abt=document.getElementById('adminBarTxt');
  if(abt)abt.textContent='Halo, '+name+'.';
}
async function undoLast(){
  if(!undoStack.length){showToast('Tidak ada yang bisa di-undo.','err');return;}
  const action=undoStack.pop();syncUndoBtn();
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
document.addEventListener('keydown',e=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
  if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();if(isAdmin)undoLast();return;}
  if(document.querySelector('.overlay.open')) return;
  switch(e.key){
    case 'g':case 'G':switchView('grid');break;
    case 'a':case 'A':switchView('agenda');break;
    case 't':case 'T':goToday();break;
    case 'ArrowLeft':switchMonth(currentMonth-1<0?11:currentMonth-1);break;
    case 'ArrowRight':switchMonth(currentMonth+1>11?0:currentMonth+1);break;
    case '/':e.preventDefault();document.getElementById('searchInput')?.focus();break;
    case '?':toggleShortcutHelp();break;
    case 'Escape':closeAllModals();break;
  }
});
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
async function trackVisit(){
  const timeout=ms=>new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms));
  let sid=sessionStorage.getItem('naposo_sid');
  if(!sid){
    sid='sid_'+Date.now()+'_'+Math.random().toString(36).slice(2,9);
    sessionStorage.setItem('naposo_sid',sid);
    try{
      await Promise.race([
        sb('visits',{method:'POST',headers:{'Prefer':'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({session_id:sid})}),
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
async function init(){
  applyDark();
  const visits=await trackVisit();
  document.getElementById('footerYear').textContent=new Date().getFullYear();
  document.getElementById('footerVisits').textContent=visits.total||'–';
  applyLangUI();buildLoginDropdown();buildCatFilterDropdown();buildLegend();buildTabs();
  document.addEventListener('click',e=>{
    if(!document.getElementById('catFilterWrap').contains(e.target)) document.getElementById('catFilterDropdown').classList.remove('open');
    if(!document.getElementById('infoBtn').parentElement.contains(e.target)) document.getElementById('statsPopup').classList.remove('open');
    if(!document.getElementById('hamburgerBtn').contains(e.target)&&!document.getElementById('hdrMenuPanel').contains(e.target)) closeHamburger();
    const deskWrap=document.getElementById('deskMonthBtn')?.closest('.desk-month-picker-wrap');
    if(deskWrap&&!deskWrap.contains(e.target)) closeDeskMonthPicker();
    const sw=document.getElementById('searchDropdown');
    const swrap=document.getElementById('searchInput')?.closest('.search-wrap');
    if(sw&&swrap&&!swrap.contains(e.target)) closeSearchDropdown();
    const mbar=document.getElementById('mobSearchBar');
    if(mbar&&!mbar.contains(e.target)) closeSearchDropdown();
  });
  try{
    await loadCatsFromDB();
    buildCatFilterDropdown();buildLegend();buildTabs();
    EVENTS=await dbGet('events','select=*&order=date.asc,created_at.asc');
    renderCalendar();renderStats();
    switchView(currentView);
    updateMobMonthLabel();
    // Auto-restore login session
    const savedToken=localStorage.getItem('naposo_token');
    const savedName=localStorage.getItem('naposo_admin_name');
    if(savedToken&&savedName){
      adminToken=savedToken;
      isAdmin=true;document.body.classList.add('admin-mode');
      document.getElementById('adminBar').classList.add('on');
      const abt=document.getElementById('adminBarTxt');
      setAdminBarTxt(savedName);
      const amr=document.getElementById('adminMobileRow');if(amr)amr.style.display='flex';
      const amt=document.getElementById('adminMobileNameTxt');if(amt)amt.textContent=savedName;
      const lbm=document.getElementById('loginBtnMobile');if(lbm)lbm.style.display='none';
      ['loginBadge','loginBadgeMobile'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('on');});
      ['loginBadgeTxt','loginBadgeMobileTxt'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=savedName+' (Pengurus)';});
      document.getElementById('loginBtn').textContent=`✓ ${savedName}`;document.getElementById('loginBtn').disabled=true;
      document.getElementById('loginBtnMobile').textContent=`✓ ${savedName}`;document.getElementById('loginBtnMobile').disabled=true;
      const mobAddBtn=document.getElementById('addEventBtnMob');if(mobAddBtn)mobAddBtn.style.display='';
      setSyncBadge('ok',tx('connected'));
      renderCalendar();
    }
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
  const ids={hdrSub:'hdrSub',loginBtnTxt:'loginBtnTxt',
    addBtnTxt:'addBtnTxt',lbDate:'lbDate',lbTitle:'lbTitle',lbStart:'lbStart',lbEnd:'lbEnd',
    lbCat:'lbCat',lbNote:'lbNote',lbPoster:'lbPoster',cancelBtn:'cancelBtn',evSaveBtn:'saveBtn',
    loginTitle:'loginTitle',lbName:'lbName',lbPw:'lbPw',loginErr:'loginErr',
    loginBtn2:'loginBtn2',detailTitle:'detailTitle',cancelBtn2:'cancelBtn',
    catMgrBtn:'catMgrBtn',footerVisitLbl:'footerVisit',
    darkModeLbl:'darkModeLbl',langModeLbl:'langModeLbl',
    loginBtnMobileTxt:'loginBtnTxt',
    undoBtnTxt:'undoBtn',pasteBtnTxt:'pasteBtn',exportBtnTxt:'exportBtn',logoutBtnTxt:'logoutBtn',
    exportModalTitle:'exportModalTitle',expSecFormat:'expSecFormat',expSecScope:'expSecScope',
    expDescPdf:'expDescPdf',expDescPng:'expDescPng',expDescCsv:'expDescCsv',expDescIcal:'expDescIcal',
    scopeLblAll:'scopeLblAll',scopeLblMonth:'scopeLblMonth',scopeLblPick:'scopeLblPick',scopeLblCat:'scopeLblCat',
    exportRangeSep:'exportRangeSep',exportCancelBtn:'exportCancelBtn',doExportBtnTxt:'doExportBtnTxt',
  };
  Object.entries(ids).forEach(([el,key])=>{const e=document.getElementById(el);if(e)e.textContent=tx(key);});
  const todayBtn=document.getElementById('todayBtn');if(todayBtn)todayBtn.textContent=lang==='en'?'Today':'Hari ini';
  // mobile "Hari ini" button
  document.querySelectorAll('.mob-toolbar .mob-nav-btn').forEach(btn=>{
    if(btn.textContent.trim()==='Hari ini'||btn.textContent.trim()==='Today'){
      btn.textContent=lang==='en'?'Today':'Hari ini';
    }
  });
  const si=document.getElementById('searchInput');if(si)si.placeholder=tx('searchPlaceholder');
  const msi=document.getElementById('mobSearchInput');if(msi)msi.placeholder=tx('searchPlaceholder');
  if(!isAdmin){
    ['loginBadgeTxt','loginBadgeMobileTxt'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=tx('loginBadgeView');});
  }
  document.getElementById('stLblTotal').textContent=tx('statTotal');
  document.getElementById('stLblMonth').textContent=tx('statMonth');
  document.getElementById('stLblToday').textContent=tx('statToday');
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
  buildDeskMonthGrid();
  updateDeskMonthBtn();
}
function buildDeskMonthGrid(){
  const grid=document.getElementById('deskMonthGrid');if(!grid)return;
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  grid.innerHTML=MO.map((m,i)=>`<div class="desk-mtab${i===currentMonth?' on':''}" onclick="switchMonth(${i});closeDeskMonthPicker()">${m.slice(0,3)}</div>`).join('');
}
function updateDeskMonthBtn(){
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  const el=document.getElementById('calTitle');
  if(el)el.innerHTML=`${MO[currentMonth]} <span>${YEAR}</span>`;
}
function toggleDeskMonthPicker(){
  const dd=document.getElementById('deskMonthDropdown');if(!dd)return;
  const isOpen=dd.style.display!=='none';
  if(isOpen){dd.style.display='none';}
  else{buildDeskMonthGrid();dd.style.display='block';}
}
function closeDeskMonthPicker(){
  const dd=document.getElementById('deskMonthDropdown');if(dd)dd.style.display='none';
}
function switchMonth(i){
  if(i<0||i>11)return;
  currentMonth=i;buildTabs();renderCalendar();renderStats();
  syncTodayBtn();
  updateMobMonthLabel();buildMobMonthGrid();
}

function syncTodayBtn(){
  const isToday=YEAR===TODAY.getFullYear()&&currentMonth===TODAY.getMonth();
  ['todayBtn','mobTodayBtn'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.classList.toggle('dim',isToday);
  });
}
function goToday(){
  if(TODAY.getFullYear()!==YEAR)return;
  currentMonth=TODAY.getMonth();
  buildTabs();renderCalendar();renderStats();
  syncTodayBtn();
  updateMobMonthLabel();
  if(currentView==='agenda'){
    renderAgenda();
    setTimeout(()=>{
      const el=document.getElementById('agTodayRow');
      if(el)el.scrollIntoView({behavior:'smooth',block:'center'});
    },50);
  }
}

/* ══ MOBILE TOOLBAR ══ */
function updateMobMonthLabel(){
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  const el=document.getElementById('mobMonthLabel');
  if(el)el.textContent=`${MO[currentMonth]} ${YEAR}`;
}
function buildMobMonthGrid(){
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  const grid=document.getElementById('mobMonthGrid');if(!grid)return;
  grid.innerHTML=MO.map((m,i)=>`<div class="mob-mtab${i===currentMonth?' on':''}" onclick="switchMonth(${i});closeMobMonthPicker()">${m.slice(0,3)}</div>`).join('');
}
function toggleMobMonthPicker(){
  const p=document.getElementById('mobMonthPicker');
  const isOpen=p.style.display!=='none';
  closeMobMenu();
  if(isOpen){p.style.display='none';}
  else{buildMobMonthGrid();p.style.display='block';}
}
function closeMobMonthPicker(){
  const p=document.getElementById('mobMonthPicker');if(p)p.style.display='none';
}
function toggleMobSearch(){
  const bar=document.getElementById('mobSearchBar');
  const btn=document.getElementById('mobSearchBtn');
  const isOpen=bar.style.display!=='none';
  closeMobMenu();closeMobMonthPicker();
  if(isOpen){bar.style.display='none';btn.classList.remove('active');document.getElementById('searchInput').value='';applyFilters();}
  else{bar.style.display='block';btn.classList.add('active');setTimeout(()=>document.getElementById('mobSearchInput').focus(),50);}
}
function toggleMobMenu(){
  const p=document.getElementById('mobMenuPanel');
  const isOpen=p.style.display!=='none';
  closeMobMonthPicker();
  if(isOpen){p.style.display='none';}
  else{buildMobCatList();p.style.display='block';}
}
function closeMobMenu(){
  const p=document.getElementById('mobMenuPanel');if(p)p.style.display='none';
}
function applyFiltersMob(){
  const mob=document.getElementById('mobSearchInput');
  const desk=document.getElementById('searchInput');
  if(mob&&desk) desk.value=mob.value;
  onSearchInput(mob?.value||'');
}
function buildMobCatList(){
  const list=document.getElementById('mobCatList');if(!list)return;
  list.innerHTML='';
  // update judul section filter
  const sec=document.querySelector('.mob-menu-section');
  if(sec)sec.textContent=lang==='en'?'Filter Category':'Filter Kategori';
  const allOpt=document.createElement('div');allOpt.className='mob-menu-item';
  allOpt.innerHTML=`<div style="width:10px;height:10px;border-radius:50%;background:var(--blue);flex-shrink:0"></div><span>${tx('allCats')}</span>${filterCat==='all'?'<span class="mob-menu-check">✓</span>':''}`;
  allOpt.onclick=()=>{setCatFilter('all');closeMobMenu();};list.appendChild(allOpt);
  const catKeys=Object.keys(CATS).filter(k=>k!=='other');
  if(CATS['other']) catKeys.push('other');
  catKeys.forEach(cat=>{
    const opt=document.createElement('div');opt.className='mob-menu-item';
    opt.innerHTML=`<div style="width:10px;height:10px;border-radius:50%;background:${catColor(cat)};flex-shrink:0"></div><span>${catLabel(cat)}</span>${filterCat===cat?'<span class="mob-menu-check">✓</span>':''}`;
    opt.onclick=()=>{setCatFilter(cat);closeMobMenu();};list.appendChild(opt);
  });
}

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
  const catKeys=Object.keys(CATS).filter(k=>k!=='other');
  if(CATS['other']) catKeys.push('other');
  catKeys.forEach(cat=>{
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
  const catKeys=Object.keys(CATS).filter(k=>k!=='other');
  if(CATS['other']) catKeys.push('other');
  catKeys.forEach(cat=>{
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
  const q=(document.getElementById('searchInput').value||document.getElementById('mobSearchInput')?.value||'').trim().toLowerCase();
  document.querySelectorAll('.event-pill').forEach(pill=>{
    const ev=EVENTS.find(e=>e.id===pill.dataset.evid);if(!ev)return;
    const catOk=filterCat==='all'||ev.category===filterCat;
    const qOk=!q||(ev.title.toLowerCase().includes(q)||(ev.note||'').toLowerCase().includes(q));
    const isOverflow=pill.dataset.overflow==='1';
    pill.style.display=(catOk&&qOk&&pill.dataset.overflow!=='1')?'':'none';
    pill.classList.toggle('ev-hl',catOk&&qOk&&!!q&&pill.dataset.overflow!=='1');
  });
  // update "+N more" buttons visibility
  document.querySelectorAll('.cal-cell:not(.empty)').forEach(cell=>{
    const allPills=[...cell.querySelectorAll('.event-pill')];
    const visible=allPills.filter(p=>p.style.display!=='none');
    // show/hide more btn
    const moreBtn=cell.querySelector('.ev-more');
    if(moreBtn){
      const ds=cell.dataset.date;
      const maxV=window.innerWidth<=680?2:MAX_VISIBLE;
      const visibleNonOverflow=allPills.filter(p=>p.dataset.overflow!=='1'&&p.style.display!=='none').length;
      const totalHidden=allPills.filter(p=>p.dataset.overflow==='1').length;
      const hidden=Math.max(0, totalHidden + Math.max(0, visibleNonOverflow - maxV));
      moreBtn.style.display=hidden>0?'':'none';
      moreBtn.textContent=tx('moreEventsLabel',hidden);
    }
    cell.classList.toggle('no-match',visible.length===0&&!!q);
    });
    if(currentView==='agenda')renderAgenda(q);
}

/* ══ SEARCH DROPDOWN ══ */
let _searchDebounce;
function onSearchInput(val){
  clearTimeout(_searchDebounce);
  // sync mobile ↔ desktop
  const desk=document.getElementById('searchInput');
  const mob=document.getElementById('mobSearchInput');
  if(desk&&desk.value!==val) desk.value=val;
  if(mob&&mob.value!==val) mob.value=val;

  applyFilters();

  _searchDebounce=setTimeout(()=>{
    const q=val.trim().toLowerCase();
    if(q.length<3){closeSearchDropdown();return;}
    showSearchDropdown(q);
  },300);
}

function showSearchDropdown(q){
  const isMob=window.innerWidth<=680;
  const dd=document.getElementById(isMob?'mobSearchDropdown':'searchDropdown');if(!dd)return;
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  const dayNames=lang==='en'
    ?['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    :['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

  // cari di semua bulan
  const results=EVENTS.filter(e=>
    e.title.toLowerCase().includes(q)||(e.note||'').toLowerCase().includes(q)
  ).sort((a,b)=>a.date.localeCompare(b.date));

  if(!results.length){
    dd.innerHTML=`<div class="sd-empty">Tidak ada hasil untuk "<strong>${q}</strong>"</div>`;
    dd.style.display='block';return;
  }

  const preview=results.slice(0,5);
  const hasMore=results.length>5;

  let html='';
  let lastMonth='';
  preview.forEach(ev=>{
    const month=ev.date.slice(0,7);
    if(month!==lastMonth){
      const [y,m]=month.split('-');
      html+=`<div class="sd-month-sep">${MO[parseInt(m)-1]} ${y}</div>`;
      lastMonth=month;
    }
    const d=new Date(ev.date+'T00:00:00');
    const col=catColor(ev.category);
    const dayStr=`${dayNames[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()].slice(0,3)}`;
    html+=`<div class="sd-item" onclick="jumpToEvent('${ev.id}')">
      <div class="sd-dot" style="background:${col}"></div>
      <div class="sd-body">
        <div class="sd-title">${highlightMatch(ev.title,q)}</div>
        <div class="sd-meta">${dayStr} · ${catLabel(ev.category)}</div>
      </div>
    </div>`;
  });

  if(hasMore){
    html+=`<div class="sd-show-all" onclick="showAllSearchResults('${q}')">
      Tampilkan semua ${results.length} hasil →
    </div>`;
  }

  dd.innerHTML=html;
  dd.style.display='block';
}

function highlightMatch(text,q){
  const i=text.toLowerCase().indexOf(q);
  if(i===-1) return text;
  return text.slice(0,i)+`<mark class="sd-hl">${text.slice(i,i+q.length)}</mark>`+text.slice(i+q.length);
}

function jumpToEvent(id){
  const ev=EVENTS.find(e=>e.id===id);if(!ev)return;
  const month=parseInt(ev.date.slice(5,7))-1;
  closeSearchDropdown();
  document.getElementById('searchInput').value='';
  if(document.getElementById('mobSearchInput')) document.getElementById('mobSearchInput').value='';

  // selalu pindah ke bulan event, render agenda normal, lalu scroll + highlight
  switchMonth(month);
  switchView('agenda');
  renderAgenda();
  setTimeout(()=>{
    const agRow=document.querySelector(`[data-agid="${id}"]`);
    const pill=document.querySelector(`[data-evid="${id}"]`);
    const target=agRow||pill;
    if(target){
      target.scrollIntoView({behavior:'smooth',block:'center'});
      target.classList.add('ev-jump-hl');
      setTimeout(()=>target.classList.remove('ev-jump-hl'),2500);
    }
  },200);
}

function showAllSearchResults(q){
  closeSearchDropdown();
  document.getElementById('searchInput').value=q;
  if(document.getElementById('mobSearchInput')) document.getElementById('mobSearchInput').value=q;
  // switch ke agenda view, tampilkan semua bulan
  switchView('agenda');
  renderAgendaAllMonths(q);
}

function renderAgendaAllMonths(q){
  const aw=document.getElementById('agendaWrap');if(!aw)return;
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;
  const isMobile=window.innerWidth<=680;
  const DAYS_FULL=lang==='en'
    ?(isMobile?['SUN','MON','TUE','WED','THU','FRI','SAT']:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'])
    :(isMobile?['MIN','SEN','SEL','RAB','KAM','JUM','SAB']:['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']);

  const results=EVENTS.filter(e=>
    e.title.toLowerCase().includes(q.toLowerCase())||(e.note||'').toLowerCase().includes(q.toLowerCase())
  ).sort((a,b)=>a.date.localeCompare(b.date));

  if(!results.length){aw.innerHTML=`<div class="agenda-empty">Tidak ada hasil untuk "${q}".</div>`;return;}

  // kelompok per bulan
  const byMonth={};
  results.forEach(ev=>{
    const m=ev.date.slice(0,7);
    if(!byMonth[m])byMonth[m]=[];
    byMonth[m].push(ev);
  });

  let html=`<div class="agenda-search-banner">🔍 ${results.length} hasil untuk "<strong>${q}</strong>" <button class="agenda-search-clear" onclick="clearAllSearch()">✕ Hapus pencarian</button></div>`;

  Object.keys(byMonth).sort().forEach(ym=>{
    const [y,m]=ym.split('-');
    const monthEvs=byMonth[ym];
    html+=`<div class="agenda-month-block">`;
    html+=`<div class="agenda-month-hdr">${MO[parseInt(m)-1]} ${y} <span>${monthEvs.length} hasil</span></div>`;
    const groups={};
    monthEvs.forEach(ev=>{if(!groups[ev.date])groups[ev.date]=[];groups[ev.date].push(ev);});
    Object.keys(groups).sort().forEach(date=>{
      const dayEvs=groups[date];
      const d=new Date(date+'T00:00:00');
      const dow=DAYS_FULL[d.getDay()];
      html+=`<div class="ag-day-group">`;
      html+=`<div class="ag-date-col"><span class="ag-date-num">${d.getDate()}</span><span class="ag-date-day">${dow}</span></div>`;
      html+=`<div class="ag-events-col">`;
      dayEvs.forEach((ev,idx)=>{
        const col=catColor(ev.category);
        html+=`<div class="ag-event-row${idx>0?' ag-event-row--border':''}" data-agid="${ev.id}" onclick="jumpToEvent('${ev.id}')">
          <div class="ag-event-main">
            <div class="ag-cat-dot" style="background:${col}"></div>
            <div class="ag-event-body">
              <div class="ag-title">${highlightMatch(ev.title,q)}</div>
              ${ev.time?`<div class="ag-time">⏰ ${ev.time}</div>`:''}
            </div>
          </div>
        </div>`;
      });
      html+=`</div></div>`;
    });
    html+=`</div>`;
  });

  aw.innerHTML=html;
}

function clearAllSearch(){
  document.getElementById('searchInput').value='';
  if(document.getElementById('mobSearchInput')) document.getElementById('mobSearchInput').value='';
  closeSearchDropdown();
  applyFilters();
  renderAgenda();
}

function closeSearchDropdown(){
  const dd=document.getElementById('searchDropdown');if(dd)dd.style.display='none';
  const ddm=document.getElementById('mobSearchDropdown');if(ddm)ddm.style.display='none';
}

/* ══ RENDER ══ */
function renderCalendar(){
  const w=document.getElementById('calWrap');w.innerHTML='';w.appendChild(buildMonth(YEAR,currentMonth));applyFilters();
}

function switchView(v){
  currentView=v;
  document.getElementById('btnGrid').classList.toggle('on',v==='grid');
  document.getElementById('btnAgenda').classList.toggle('on',v==='agenda');
  const mg=document.getElementById('btnGridMob');if(mg)mg.classList.toggle('on',v==='grid');
  const ma=document.getElementById('btnAgendaMob');if(ma)ma.classList.toggle('on',v==='agenda');
  document.getElementById('calSection').style.display=v==='grid'?'':'none';
  const aw=document.getElementById('agendaWrap');
  if(v==='agenda'){aw.classList.add('on');renderAgenda();}
  else{aw.classList.remove('on');}
  const cg=document.getElementById('menuCheckGrid');if(cg)cg.textContent=v==='grid'?'✓':'';
  const ca=document.getElementById('menuCheckAgenda');if(ca)ca.textContent=v==='agenda'?'✓':'';
}

function renderAgenda(q){
  q=q||'';
  const aw=document.getElementById('agendaWrap');
  if(!aw)return;
  const isMobile=window.innerWidth<=680;
  const DAYS_FULL=lang==='en'
    ?(isMobile?['SUN','MON','TUE','WED','THU','FRI','SAT']:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'])
    :(isMobile?['MIN','SEN','SEL','RAB','KAM','JUM','SAB']:['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']);
  const monthStr=`${YEAR}-${String(currentMonth+1).padStart(2,'0')}`;
  let evs=EVENTS.filter(e=>e.date.startsWith(monthStr));
  if(filterCat!=='all') evs=evs.filter(e=>e.category===filterCat);
  if(q) evs=evs.filter(e=>e.title.toLowerCase().includes(q)||(e.note||'').toLowerCase().includes(q));
  if(!evs.length){aw.innerHTML=`<div class="agenda-empty">Tidak ada event di bulan ini.</div>`;return;}
  evs.sort((a,b)=>a.date.localeCompare(b.date));
  const todayStr=new Date().toISOString().slice(0,10);
  const MO=lang==='en'?MONTHS_EN:MONTHS_ID;

  // Kelompokkan event per tanggal
  const groups={};
  evs.forEach(ev=>{
    if(!groups[ev.date]) groups[ev.date]=[];
    groups[ev.date].push(ev);
  });
  // Pastikan hari ini selalu muncul jika masih di bulan yang sama
  const todayInThisMonth=todayStr.startsWith(monthStr);
  if(todayInThisMonth&&!groups[todayStr]) groups[todayStr]=[];

  let html=`<div class="agenda-month-block">`;
  html+=`<div class="agenda-month-hdr">${MO[currentMonth]} ${YEAR} <span>${evs.length} event</span></div>`;

  Object.keys(groups).sort().forEach(date=>{
    const dayEvs=groups[date];
    const d=new Date(date+'T00:00:00');
    const dow=DAYS_FULL[d.getDay()];
    const isToday=date===todayStr;

    html+=`<div class="ag-day-group"${isToday?' id="agTodayRow"':''}>`;
    // Kolom tanggal — hanya muncul sekali per grup
    html+=`<div class="ag-date-col${isToday?' today-row':''}">
      <span class="ag-date-num${isToday?' ag-today-circle':''}">${d.getDate()}</span>
      <span class="ag-date-day">${dow}</span>
    </div>`;
    // Kolom event — semua event hari itu
    html+=`<div class="ag-events-col">`;
    if(dayEvs.length===0){
      html+=`<div class="ag-empty-today">${lang==='en'?'No events scheduled for today — enjoy your day! 🌿':'Tidak ada kegiatan hari ini — nikmati harimu! 🌿'}</div>`;
    }
    dayEvs.forEach((ev,idx)=>{
      const col=catColor(ev.category);
      const lbl=catLabel(ev.category);
      const fields=getExtraFields(ev.category);
      const extraHtml=fields.length&&ev.extra?fields.map(f=>{const val=ev.extra[f.key]||'';if(!val)return '';const disp=f.type==='url'?`<a href="${val}" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:underline;word-break:break-all" onclick="event.stopPropagation()">${val}</a>`:val;return `<div class="ag-extra">📌 ${f.label}: <span>${disp}</span></div>`;}).join(''):'';
      html+=`<div class="ag-event-row${idx>0?' ag-event-row--border':''}" data-agid="${ev.id}" onclick="openDetail(EVENTS.find(e=>e.id==='${ev.id}'))">
        <div class="ag-event-main">
          <div class="ag-cat-dot" style="background:${col}"></div>
          <div class="ag-event-body">
            <div class="ag-title">${ev.title}</div>
            ${ev.time?`<div class="ag-time">⏰ ${ev.time}</div>`:''}
            ${extraHtml}
            ${ev.note?`<div class="ag-note">${linkify(ev.note.replace(/\r\n|\r|\n/g,'<br>'))}</div>`:''}
          </div>
        </div>
        <div class="ag-admin-btns">
          ${ev.note&&/(https?:\/\/[^\s<]+)/.test(ev.note)?`<button class="ag-link-btn" title="Buka link" onclick="event.stopPropagation();window.open('${ev.note.match(/(https?:\/\/[^\s<]+)/)[1]}','_blank')">🔗</button>`:''}
          ${isAdmin?`<button class="ag-edit-btn" onclick="event.stopPropagation();closeModal('detailModal');openEditModal(EVENTS.find(e=>e.id==='${ev.id}'))">✎</button>`:''}
          ${isAdmin?`<button class="ag-del-btn" onclick="event.stopPropagation();confirmDel('${ev.id}',event)">✕</button>`:''}
        </div>
      </div>`;
    });
    html+=`</div></div>`;
  });

  html+=`</div>`;
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
    const maxV=window.innerWidth<=680?(dayEvs.length>3?2:dayEvs.length):MAX_VISIBLE; 
    dayEvs.forEach((ev,idx)=>{
      const pill=makePill(ev);
      if(idx>=maxV){pill.dataset.overflow='1';pill.style.display='none';}
      else{pill.dataset.overflow='0';}
      cell.appendChild(pill);
    });
    // "+N more" button
    if(dayEvs.length>maxV){
      const more=document.createElement('button');more.className='ev-more';
      const hidden=dayEvs.length-maxV;
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
  document.getElementById('detailFoot').innerHTML=`<button class="btn btn-sm" onclick="shareEvent(window._detEv)" style="margin-right:auto;background:none;border:1px solid var(--border2);color:var(--text2)">🔗 Bagikan</button>${isAdmin?`<button class="btn btn-danger" onclick="closeModal('detailModal');confirmDel(window._detEv.id,{stopPropagation:()=>{}})">X Hapus</button>`:''} ${isAdmin?`<button class="btn btn-primary" onclick="closeModal('detailModal');openEditModal(window._detEv)">✎ ${tx('editBtn')}</button>`:''}`;
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
  const posterClr=document.getElementById('evPoster');if(posterClr)posterClr.value='';
  document.getElementById('evDate').value=ds||'';document.getElementById('evTitle').value='';
  document.getElementById('evStart').value='';document.getElementById('evEnd').value='';
  document.getElementById('evNote').value='';
  const fc=document.getElementById('evFeatured');if(fc)fc.checked=false;
  buildCatSelect();updateExtraField();openModal('eventModal');
}

function openEditModal(ev){
  editingId=ev.id;document.getElementById('evModalTitle').textContent=tx('evModalEdit');
  const posterFld=document.getElementById('evPoster');if(posterFld)posterFld.value=ev.poster_url||'';
  document.getElementById('evDate').value=ev.date;document.getElementById('evTitle').value=ev.title;
  const ts=(ev.time||'').split('–');
  document.getElementById('evStart').value=ts[0]||'';document.getElementById('evEnd').value=ts[1]||'';
  document.getElementById('evNote').value=ev.note||'';
  buildCatSelect();document.getElementById('evCat').value=ev.category||'other';
  updateExtraField();
  setTimeout(()=>{
    const fields=getExtraFields(ev.category);
    if(fields.length&&ev.extra){
      document.querySelectorAll('#extraFieldWrap .extra-field-input').forEach(inp=>{
        const key=inp.dataset.key;
        if(key&&ev.extra[key]) inp.value=ev.extra[key];
      });
    }
    const fc=document.getElementById('evFeatured');if(fc)fc.checked=!!ev.featured;
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
    ${(()=>{const fields=getExtraFields(ev.category);if(!fields.length||!ev.extra)return '';return fields.map(f=>{const val=ev.extra[f.key]||'';if(!val)return '';const disp=f.type==='url'?`<a href="${val}" target="_blank" rel="noopener" style="color:var(--blue);word-break:break-all;text-decoration:underline" onclick="event.stopPropagation()">${val}</a>`:val;return `<div class="det-row" style="margin-bottom:6px"><span style="font-size:.78rem;color:var(--text2)">📌 ${f.label}:</span> <span style="font-size:.82rem;font-weight:600">${disp}</span></div>`;}).join('');})()}
    ${ev.note?`<div class="det-note">${linkify(ev.note.replace(/\r\n|\r|\n/g,'<br>'))}</div>`:''}    <span class="det-cat" style="background:${col}22;color:${col}">${catLabel(ev.category)}</span>
  </div>`;
  document.getElementById('detailFoot').innerHTML=`
    <button class="btn btn-sm" onclick="shareEvent(window._detEv)" style="background:none;border:1px solid var(--border2);color:var(--text2)">🔗 Bagikan</button>
    ${isAdmin?`<button class="btn btn-sm" id="featBtn" onclick="toggleFeatured(window._detEv)" style="background:${window._detEv&&window._detEv.featured?'var(--gold)':'none'};border:1px solid ${window._detEv&&window._detEv.featured?'var(--gold)':'var(--border2)'};color:${window._detEv&&window._detEv.featured?'var(--navy)':'var(--text2)'};margin-right:auto">${window._detEv&&window._detEv.featured?'★ Di Beranda':'☆ Beranda'}</button>`:'<span style="margin-right:auto"></span>'}
    ${isAdmin?`<button class="btn btn-danger" onclick="closeModal('detailModal');confirmDel(window._detEv.id,{stopPropagation:()=>{}})">${tx('deleteBtn')}</button>`:''}
    ${isAdmin?`<button class="btn btn-primary" onclick="closeModal('detailModal');openEditModal(window._detEv)">✎ ${tx('editBtn')}</button>`:''}`;
  openModal('detailModal');
}

/* ══ CRUD ══ */

/* ══ POSTER HELPER ══ */
function driveToThumbnail(url){
  if(!url)return '';
  // format: https://drive.google.com/file/d/FILE_ID/view
  const m=url.match(/\/file\/d\/([^/?\s]+)/);
  if(m)return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
  // already a direct/thumbnail URL
  return url;
}

async function saveEvent(){
  const date=document.getElementById('evDate').value,title=document.getElementById('evTitle').value.trim();
  const tS=document.getElementById('evStart').value,tE=document.getElementById('evEnd').value;
  const cat=document.getElementById('evCat').value,note=document.getElementById('evNote').value.trim();
  const link='';
  const rawPoster=document.getElementById('evPoster')?.value.trim()||'';
  const poster_url=driveToThumbnail(rawPoster);
  if(!date||!title){showToast(tx('fieldReq'),'err');return;}
  const time=tS?(tE?`${tS}–${tE}`:tS):'';
  const btn=document.getElementById('evSaveBtn');btn.disabled=true;btn.textContent=tx('saving');setSyncBadge('load',tx('saving'));
  try{
    const fields=getExtraFields(cat);
    const extra={};
    if(fields.length){
      document.querySelectorAll('#extraFieldWrap .extra-field-input').forEach(inp=>{
        const key=inp.dataset.key;
        const val=inp.value.trim();
        if(key&&val) extra[key]=val;
      });
    }
    const featured=!!(document.getElementById('evFeatured')?.checked);
    if(editingId){
      const prev={...EVENTS.find(e=>e.id===editingId)};
      await dbWrite('events','UPDATE',{date,title,time,category:cat,note,link,extra,featured,poster_url},{id:editingId});
      const i=EVENTS.findIndex(e=>e.id===editingId);if(i!==-1)EVENTS[i]={...EVENTS[i],date,title,time,category:cat,note,link,extra,featured,poster_url};
      pushUndo({type:'edit',prev});
    }else{
      const id='ev_'+Date.now();
      const[ins]=await dbWrite('events','INSERT',{id,date,title,time,category:cat,note,link,extra,featured,poster_url});
      EVENTS.push(ins||{id,date,title,time,category:cat,note,link,extra,featured,poster_url});
      pushUndo({type:'add',ev:ins||{id,date,title,time,category:cat,note,link,extra,featured,poster_url}});
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
  localStorage.setItem('naposo_token', adminToken);
  localStorage.setItem('naposo_admin_name', name);
  isAdmin=true;resetUndo();document.body.classList.add('admin-mode');
  document.getElementById('adminBar').classList.add('on');
  setAdminBarTxt(name);
  ['loginBadge','loginBadgeMobile'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('on');});
  ['loginBadgeTxt','loginBadgeMobileTxt'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=name+' (Pengurus)';});
  document.getElementById('loginBtn').textContent=`✓ ${name}`;document.getElementById('loginBtn').disabled=true;
  document.getElementById('loginBtnMobile').textContent=`✓ ${name}`;document.getElementById('loginBtnMobile').disabled=true;
  const mobAddBtn=document.getElementById('addEventBtnMob');if(mobAddBtn)mobAddBtn.style.display='';
  btn.disabled=false;btn.textContent=tx('loginBtn2');
  setSyncBadge('ok',tx('connected'));closeModal('loginModal');renderCalendar();syncUndoBtn();
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
  localStorage.removeItem('naposo_token');
  localStorage.removeItem('naposo_admin_name');
  isAdmin=false;document.body.classList.remove('admin-mode');
  document.getElementById('adminBar').classList.remove('on');
  ['loginBadge','loginBadgeMobile'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('on');});
  ['loginBadgeTxt','loginBadgeMobileTxt'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=tx('loginBadgeView');});
  document.getElementById('loginBtn').textContent=`🔒 ${tx('loginBtnTxt')}`;document.getElementById('loginBtn').disabled=false;
  document.getElementById('loginBtnMobile').textContent=`🔒 ${tx('loginBtnTxt')}`;document.getElementById('loginBtnMobile').disabled=false;
  const mobAddBtn=document.getElementById('addEventBtnMob');if(mobAddBtn)mobAddBtn.style.display='none';
  renderCalendar();showToast('Logout berhasil.');
  const amr2=document.getElementById('adminMobileRow');if(amr2)amr2.style.display='none';
  const lbm2=document.getElementById('loginBtnMobile');if(lbm2)lbm2.style.display='';
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
  if(b) b.className=`sync-dot-only ${type}`;
  if(d) d.className=`sync-dot${type==='load'?' pulse':''}`;
  const t=document.getElementById('syncTxt');
  if(t) t.textContent=type==='ok'?'':txt;
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
    const fields=getExtraFields(ev.category);
    const extraVal=fields.length&&ev.extra?fields.filter(f=>ev.extra[f.key]).map(f=>`${f.label}: ${ev.extra[f.key]}`).join('; '):'';
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
  const fields=getExtraFields(ev.category);
  const extraHtml=fields.length&&ev.extra?fields.map(f=>{const val=ev.extra[f.key]||'';return val?`<div style="margin-top:3px;font-size:11px;color:rgba(255,255,255,.75)">📌 ${f.label}: ${val}</div>`:''}).join(''):'';
  previewBox.innerHTML = `
    <strong>${ev.title}</strong><br>
    📅 ${dateStr}<br>
    ${ev.time ? '⏰ '+ev.time+'<br>' : ''}
    ${extraHtml}
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

/* ── Cek apakah teks mengandung URL ── */
function hasLink(text){
  return /https?:\/\/[^\s<]+/.test(text||'');
}

/* ══ Toggle Featured ══ */
async function toggleFeatured(ev){
  if(!ev)return;
  const newVal=!ev.featured;
  try{
    await dbWrite('events','UPDATE',{featured:newVal},{id:ev.id});
    const i=EVENTS.findIndex(e=>e.id===ev.id);
    if(i!==-1){EVENTS[i]={...EVENTS[i],featured:newVal};window._detEv=EVENTS[i];}
    showToast(newVal?'Event ditampilkan di beranda ★':'Event dihapus dari beranda','ok');
    openDetail(EVENTS.find(e=>e.id===ev.id));
  }catch(e){showToast('Gagal update: '+e.message,'err');}
}

/* ══ Share Event ══ */
function shareEvent(ev){
  if(!ev)return;
  const d=new Date(ev.date+"T00:00:00");
  const MO=lang==="en"?MONTHS_EN:MONTHS_ID;
  const dateStr=d.getDate()+" "+MO[d.getMonth()]+" "+d.getFullYear();
  const lines=["📅 "+ev.title,"🗓 "+dateStr];
  if(ev.time) lines.push("⏰ "+ev.time);
  if(ev.note) lines.push("📝 "+ev.note);
  lines.push("","— Kalender Naposo HKBP Ujung Menteng");
  const text=lines.join("\n");
  if(navigator.share){navigator.share({title:ev.title,text}).catch(()=>{});}
  else{navigator.clipboard.writeText(text).then(()=>showToast("Info event disalin ke clipboard!","ok")).catch(()=>showToast("Gagal menyalin.","err"));}
}

/* ══ Keyboard Shortcut Help ══ */
function toggleShortcutHelp(){
  let el=document.getElementById('shortcutHelp');
  if(el){el.remove();return;}
  el=document.createElement('div');
  el.id='shortcutHelp';
  const rows=[['G','Tampilan Grid'],['A','Tampilan Agenda'],['T','Hari ini'],
    ['←','Bulan sebelumnya'],['→','Bulan berikutnya'],
    ['/','Fokus ke search'],['Ctrl+Z','Undo (admin)'],['Esc','Tutup modal'],['?','Panduan ini']];
  const rowsHtml=rows.map(r=>`<div class="shortcut-row"><kbd>${r[0]}</kbd><span>${r[1]}</span></div>`).join('');
  const closeBtn=`<button onclick="document.getElementById('shortcutHelp').remove()" style="background:none;border:none;cursor:pointer;color:var(--text2);font-size:1.1rem">×</button>`;
  el.innerHTML=`<div class="shortcut-panel"><div class="shortcut-hdr"><strong>⌨️ Keyboard Shortcuts</strong>${closeBtn}</div><div class="shortcut-grid">${rowsHtml}</div></div>`;
  el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:999;display:flex;align-items:center;justify-content:center';
  el.onclick=e=>{if(e.target===el)el.remove();};
  document.body.appendChild(el);
}
function closeAllModals(){
  ["eventModal","loginModal","detailModal","exportModal"].forEach(id=>closeModal(id));
  closeSearchDropdown();closeDeskMonthPicker();
}

/* ── Auto-detect URL di teks → <a> ── */
function linkify(text){
  if(!text) return '';
  return text.replace(/(https?:\/\/[^\s<]+)/g, url =>
    `<a href="${url}" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:underline;word-break:break-all;" onclick="event.stopPropagation()">${url}</a>`
  );
}