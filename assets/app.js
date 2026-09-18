const state={articles:[],active:null};
const $=s=>document.querySelector(s);
const list=$('#archiveList'), mount=$('#articleMount'), outline=$('#pageOutline'), search=$('#searchInput');
const toastEl=$('#toast'), archive=$('#archive'), backdrop=$('#backdrop');

async function init(){
  const res=await fetch('articles.json',{cache:'no-store'});
  state.articles=(await res.json()).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
  renderArchive();
  await route();
}
function renderArchive(q=''){
  const term=q.trim().toLowerCase(); list.innerHTML='';
  state.articles.forEach(a=>{
    const hay=[a.date,a.type,a.title,...(a.keywords||[])].join(' ').toLowerCase();
    if(term&&!hay.includes(term)) return;
    const link=document.createElement('a'); link.className='archive-item'+(state.active?.id===a.id?' active':'');
    link.href='#'+a.id;
    link.innerHTML='<div class="archive-date">'+a.date+'</div><div class="archive-title">'+a.title+'</div><div class="archive-type">'+a.type+'</div>';
    link.onclick=closeMenu; list.appendChild(link);
  });
}
async function route(){
  const id=location.hash.slice(1);
  const item=state.articles.find(a=>a.id===id)||state.articles[0];
  if(!item) return;
  state.active=item;
  mount.innerHTML='<div class="loading">브리핑을 불러오는 중입니다…</div>';
  const res=await fetch(item.file,{cache:'no-store'});
  mount.innerHTML=await res.text();
  $('#currentTitle').textContent=item.date+' · '+item.title;
  document.title=item.title+' | Clinical Reasoning Archive';
  renderArchive(search.value);
  buildOutline();
  buildNav();
  updateProgress();
  window.scrollTo({top:0,behavior:'instant'});
}
function buildOutline(){
  outline.innerHTML='';
  [...mount.querySelectorAll('.section[data-section-title]')].forEach((s,i)=>{
    if(!s.id)s.id='section-'+i;
    const a=document.createElement('a');a.href='#';a.dataset.target=s.id;a.textContent=s.dataset.sectionTitle;
    a.onclick=e=>{e.preventDefault();s.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'','#'+state.active.id)};
    outline.appendChild(a);
  });
}
function updateOutline(){
  let current=null;
  [...mount.querySelectorAll('.section[data-section-title]')].forEach(s=>{if(s.getBoundingClientRect().top<=135)current=s});
  outline.querySelectorAll('a').forEach(a=>a.classList.toggle('active',current&&a.dataset.target===current.id));
}
function buildNav(){
  const nav=mount.querySelector('[data-article-nav]'); if(!nav)return;
  const i=state.articles.findIndex(a=>a.id===state.active.id), newer=state.articles[i-1], older=state.articles[i+1];
  nav.innerHTML='';
  const make=(a,kicker)=>{const x=document.createElement('a');x.className='nav-btn';x.href=a?'#'+a.id:'#';if(!a)x.style.opacity='.35';x.innerHTML='<div class="nav-kicker">'+kicker+'</div><div class="nav-title">'+(a?a.title:'없음')+'</div>';return x};
  nav.append(make(older,'Previous'),make(newer,'Next'));
}
function updateProgress(){
  if(!mount.offsetHeight)return;
  const start=mount.getBoundingClientRect().top+scrollY, h=mount.offsetHeight-innerHeight;
  const p=h<=0?1:(scrollY-start+70)/h; $('#progressBar').style.width=Math.max(0,Math.min(1,p))*100+'%';
}
function openMenu(){archive.classList.add('open');backdrop.classList.add('show')}
function closeMenu(){archive.classList.remove('open');backdrop.classList.remove('show')}
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>toastEl.classList.remove('show'),1700)}
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();return true}}
search.addEventListener('input',e=>renderArchive(e.target.value));
$('#menuBtn').onclick=openMenu;backdrop.onclick=closeMenu;
$('#copyLinkBtn').onclick=async()=>{await copyText(location.href);toast('현재 글 링크를 복사했습니다.')};
$('#copyHtmlBtn').onclick=async()=>{await copyText(mount.innerHTML);toast('현재 브리핑 HTML을 복사했습니다.')};
window.addEventListener('hashchange',route);
window.addEventListener('scroll',()=>{updateProgress();updateOutline()},{passive:true});
window.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==search){e.preventDefault();search.focus();openMenu()}if(e.key==='Escape'){closeMenu();search.blur()}});
init();