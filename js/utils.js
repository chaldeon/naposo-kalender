/* ══════════════════════════════════════════════════════════════
   js/utils.js — Shared utilities Naposo HKBP Ujung Menteng
   Dipindah dari index.js & kalender.js — Sesi 49
   Fungsi di sini: escapeHTML, localDateStr, isBirthdayEv+BDAY_CATS,
                   showToast, applyDark, applyLang (stub), driveToThumbnail
   ══════════════════════════════════════════════════════════════ */

/* ── escapeHTML ── */
function escapeHTML(str){
  if(!str)return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ── localDateStr ── hindari bug timezone UTC vs WIB ── */
function localDateStr(d){
  const t=d||new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

/* ── isBirthdayEv ── */
const BDAY_CATS=['perayaan-ulang-tahun','ultah','ulang-tahun','perayaan ulang tahun'];
function isBirthdayEv(ev){
  const c=(ev.category||'').toLowerCase().trim();
  if(BDAY_CATS.includes(c))return true;
  // catLabel belum tentu tersedia di utils; cek langsung string label via argumen opsional
  const lbl=(typeof catLabel==='function'?catLabel(ev.category):'').toLowerCase();
  return lbl.includes('ulang tahun')||lbl.includes('birthday')||lbl.includes('ultah');
}

/* ── showToast — canonical (null guard + timeout 3000) ── */
let _toastTimer;
function showToast(msg,type=''){
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=msg;
  el.className=`toast on${type==='ok'?' ok':type==='err'?' err':''}`;
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>el.classList.remove('on'),3000);
}

/* ── driveToThumbnail (index.js / kalender.js variant — lh3) ── */
function driveToThumbnail(url){
  if(!url)return '';
  const m=url.match(/\/file\/d\/([\w-]+)/);
  if(m)return `https://lh3.googleusercontent.com/d/${m[1]}`;
  return url;
}
