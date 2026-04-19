
const SUPA_URL='https://wejbubxrlqyazlodhbua.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlamJ1YnhybHF5YXpsb2RoYnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTU0NDUsImV4cCI6MjA5MTg5MTQ0NX0.fFBvRU7wlRvzigDLtN6ot_9D6GMxL9h4J_mwVaNoBsU';
function sb(p,o={}){return fetch(`${SUPA_URL}/rest/v1/${p}`,{headers:{'apikey':SUPA_KEY,'Authorization':`Bearer ${SUPA_KEY}`,'Content-Type':'application/json','Prefer':'return=representation',...(o.headers||{})},...o});}
async function dbGet(t,q=''){const r=await sb(`${t}?${q}`);if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbIns(t,d){const r=await sb(t,{method:'POST',body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbUpd(t,m,d){const r=await sb(`${t}?${m}`,{method:'PATCH',body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();}
async function dbDel(t,m){const r=await sb(`${t}?${m}`,{method:'DELETE'});if(!r.ok)throw new Error(await r.text());}

const USER_NAMES=['Andre','Catherine','Daniel','David','Dea','Eliza',
  'Frans','Grace','Gunawan','Lisken','Mutiara','Rut','Selfa','Tomy'];

const DEF_COLORS={koor:'#7c3aed',ibadah:'#c9a227',rapat:'#0891b2',latihan:'#16a34a',reversement:'#db2777',doa:'#4a90d9',other:'#94a3b8'};
const DEF_LABELS={koor:'Koor',ibadah:'Ibadah / Pelayanan',rapat:'Rapat',latihan:'Latihan',reversement:'Reversement',doa:'Doa',other:'Lainnya'};
let CATS={...DEF_COLORS},CNAMES={...DEF_LABELS};
function catColor(c){return CATS[c]||'#94a3b8';}
function catLabel(c){return CNAMES[c]||c;}
function loadCatsLocal(){
  const s=JSON.parse(localStorage.getItem('naposo_cats')||'null');
  if(s){Object.assign(CATS,s.co||{});Object.assign(CNAMES,s.ni||{});}
}

let darkMode=localStorage.getItem('naposo_dark')==='1';
let isAdmin=false,EVENTS=[],DOCS=[],VIS={};
const TODAY=new Date();

/* ══ INIT ══ */
async function init(){
  applyDark();loadCatsLocal();
  document.getElementById('fyear').textContent=new Date().getFullYear();
  buildLoginDropdown();
  document.getElementById('docOverlay').addEventListener('click',e=>{if(e.target===document.getElementById('docOverlay'))closeDoc();});
  try{
    EVENTS=await dbGet('events','select=*&order=date.asc');
    try{const v=await dbGet('home_visibility','select=*&id=eq.config');VIS=v.length>0?(v[0].cats||{}):{};} catch(e){VIS={};}
    try{DOCS=await dbGet('home_docs','select=*&order=created_at.asc');} catch(e){DOCS=[];}
    renderPrograms();renderDocs();
  }catch(e){
    document.getElementById('progGrid').innerHTML=`<p style="color:var(--red);font-size:.82rem">Gagal memuat: ${e.message}</p>`;
  }
}

/* ══ DARK ══ */
function applyDark(){
  document.documentElement.setAttribute('data-theme',darkMode?'dark':'light');
  document.getElementById('darkTrack').classList.toggle('on',darkMode);
  document.getElementById('darkCb').checked=darkMode;
}
function toggleDark(){darkMode=document.getElementById('darkCb').checked;localStorage.setItem('naposo_dark',darkMode?'1':'0');applyDark();}

/* ══ AUTH ══ */
function toggleLoginBox(){
  if(isAdmin){document.getElementById('adminBox').classList.toggle('on');}
  else{document.getElementById('loginBox').classList.toggle('on');}
}
function buildLoginDropdown(){
  const sel=document.getElementById('loginName');
  sel.innerHTML='<option value="">-- Pilih --</option>';
  [...USER_NAMES].sort().forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
}
async function doLogin(){
  const name=document.getElementById('loginName').value,pw=document.getElementById('loginPw').value;
  if(!name||!pw){document.getElementById('loginErr').style.display='block';return;}
  const btn=document.getElementById('loginSubmitBtn');btn.disabled=true;btn.textContent='Memverifikasi…';
  try{
    const res=await fetch(`${SUPA_URL}/functions/v1/verify-login`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPA_KEY}`},
      body:JSON.stringify({username:name,password:pw})
    });
    const data=await res.json();
    if(!data.success){
      document.getElementById('loginErr').style.display='block';
      btn.disabled=false;btn.textContent='Masuk';return;
    }
  }catch(e){
    document.getElementById('loginErr').style.display='block';
    btn.disabled=false;btn.textContent='Masuk';return;
  }
  btn.disabled=false;btn.textContent='Masuk';
  isAdmin=true;
  document.getElementById('loginBox').classList.remove('on');
  document.getElementById('adminBox').classList.add('on');
  document.getElementById('adminNameLbl').textContent='— '+name;
  document.getElementById('adminBtn').textContent='⚙ Panel';
  renderVisList();renderDocAdmList();
  showToast('Selamat datang, '+name+'!','ok');
}
function doLogout(){
  isAdmin=false;
  document.getElementById('adminBox').classList.remove('on');
  document.getElementById('adminBtn').textContent='🔒 Pengurus';
  showToast('Logout berhasil.');
}
function togglePw(){
  const inp=document.getElementById('loginPw');
  inp.type=inp.type==='text'?'password':'text';
}

/* ══ ADMIN TABS ══ */
function switchTab(id,btn){
  document.querySelectorAll('.atab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.atab-content').forEach(t=>t.classList.remove('on'));
  btn.classList.add('on');document.getElementById('tab-'+id).classList.add('on');
  if(id==='vis')renderVisList();
  if(id==='docs')renderDocAdmList();
}

/* ══ VISIBILITY ══ */
function renderVisList(){
  const list=document.getElementById('visList');list.innerHTML='';
  Object.keys(CATS).forEach(cat=>{
    const isOn=VIS[cat]!==false;
    const row=document.createElement('div');row.className='vis-row';
    row.innerHTML=`<div class="vis-dot" style="background:${catColor(cat)}"></div>
      <span class="vis-name">${catLabel(cat)}</span>
      <label class="sw"><input type="checkbox" id="v_${cat}" ${isOn?'checked':''}><div class="sw-track"></div></label>`;
    list.appendChild(row);
  });
}
async function saveVisibility(){
  const nv={};
  Object.keys(CATS).forEach(cat=>{const cb=document.getElementById('v_'+cat);if(cb)nv[cat]=cb.checked;});
  VIS=nv;
  try{
    const ex=await dbGet('home_visibility','select=id&id=eq.config');
    if(ex.length>0)await dbUpd('home_visibility','id=eq.config',{cats:nv});
    else await dbIns('home_visibility',{id:'config',cats:nv});
    showToast('Tersimpan ✓','ok');renderPrograms();
  }catch(e){showToast('Gagal: '+e.message,'err');}
}

/* ══ PROGRAMS ══ */
function renderPrograms(){
  const grid=document.getElementById('progGrid');grid.innerHTML='';
  const todayStr=TODAY.toISOString().slice(0,10);
  const visCats=Object.keys(CATS).filter(cat=>VIS[cat]!==false);
  if(visCats.length===0){grid.innerHTML='<p style="color:var(--text3);font-size:.81rem;font-style:italic">Belum ada program yang dipilih untuk ditampilkan.</p>';return;}
  visCats.forEach(cat=>{
    const upcoming=EVENTS.filter(e=>e.category===cat&&e.date>=todayStr).slice(0,3);
    const col=catColor(cat);
    const card=document.createElement('a');card.className='prog-card';card.removeAttribute('href');
    card.innerHTML=`
      <div class="prog-card-top">
        <div class="prog-dot" style="background:${col}"></div>
        <span class="prog-cat-name">${catLabel(cat)}</span>
      </div>
      <div class="prog-card-body">
        ${upcoming.length===0?`<p class="prog-empty">Tidak ada event mendatang</p>`:
          upcoming.map(ev=>{
            const d=new Date(ev.date+'T00:00:00');
            const lbl=d.toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short'});
            return `<div class="prog-event-item">
              <div class="prog-ev-dot" style="background:${col}"></div>
              <div class="prog-ev-info">
                <div class="prog-ev-title">${ev.title}</div>
                <div class="prog-ev-date">${lbl}${ev.time?' · '+ev.time.split('–')[0]:''}</div>
              </div>
            </div>`;
          }).join('')}
      </div>
      <div class="prog-card-foot">Lihat di kalender →</div>`;card.style.pointerEvents='none';card.style.cursor='default';
    grid.appendChild(card);
  });
}

/* ══ DOCS ══ */
function toEmbedUrl(url){
  const m=url.match(/\/file\/d\/([^/?\s]+)/);
  if(m)return`https://drive.google.com/file/d/${m[1]}/preview`;
  return url;
}
function renderDocs(){
  const grid=document.getElementById('docGrid');grid.innerHTML='';
  const visible=DOCS.filter(d=>d.category==='publik'||(isAdmin&&d.category==='pengurus'));
  if(visible.length===0){grid.innerHTML='<p class="doc-empty">Belum ada dokumen.</p>';return;}
  visible.forEach(doc=>{
    const card=document.createElement('div');card.className='doc-card';
    card.innerHTML=`
      <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#2563be" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
      <div class="doc-info"><div class="doc-title">${doc.title}</div><div class="doc-meta">${doc.category==='pengurus'?'🔒 Pengurus':'📂 Publik'}</div></div>
      <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" style="color:var(--text3);flex-shrink:0"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>`;
    card.onclick=()=>openDoc(doc);grid.appendChild(card);
  });
}
function openDoc(doc){
  document.getElementById('docModalTitle').textContent=doc.title;
  document.getElementById('docFrame').src=toEmbedUrl(doc.link);
  document.getElementById('docOverlay').classList.add('on');
}
function closeDoc(){document.getElementById('docOverlay').classList.remove('on');document.getElementById('docFrame').src='';}
function renderDocAdmList(){
  const list=document.getElementById('docAdmList');list.innerHTML='';
  if(DOCS.length===0){list.innerHTML='<p class="doc-empty" style="margin-top:8px">Belum ada dokumen.</p>';return;}
  DOCS.forEach(doc=>{
    const item=document.createElement('div');item.className='doc-adm-item';
    item.innerHTML=`<div class="doc-adm-info"><div class="doc-adm-title">${doc.title}</div><div class="doc-adm-meta">${doc.category==='pengurus'?'🔒 Pengurus':'📂 Publik'}</div></div>
      <button class="doc-del" onclick="deleteDoc('${doc.id}')">×</button>`;
    list.appendChild(item);
  });
}
async function addDoc(){
  const title=document.getElementById('docTitle').value.trim();
  const link=document.getElementById('docLink').value.trim();
  const category=document.getElementById('docCat').value;
  if(!title||!link){showToast('Nama dan link harus diisi!','err');return;}
  try{
    const id='doc_'+Date.now();
    const[ins]=await dbIns('home_docs',{id,title,link,category});
    DOCS.push(ins);renderDocs();renderDocAdmList();
    document.getElementById('docTitle').value='';document.getElementById('docLink').value='';
    showToast('Dokumen ditambahkan ✓','ok');
  }catch(e){showToast('Gagal: '+e.message,'err');}
}
async function deleteDoc(id){
  if(!confirm('Hapus dokumen ini?'))return;
  try{
    await dbDel('home_docs',`id=eq.${id}`);
    DOCS=DOCS.filter(d=>d.id!==id);renderDocs();renderDocAdmList();
    showToast('Dokumen dihapus.');
  }catch(e){showToast('Gagal: '+e.message,'err');}
}

/* ══ TOAST ══ */
let _tt;
function showToast(msg,type=''){
  const el=document.getElementById('toast');el.textContent=msg;
  el.className=`toast on${type==='ok'?' ok':type==='err'?' err':''}`;
  clearTimeout(_tt);_tt=setTimeout(()=>el.classList.remove('on'),3000);
}

init();
