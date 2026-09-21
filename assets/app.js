const state={articles:[],active:null,installPrompt:null,cssText:""};
const $=s=>document.querySelector(s);
const list=$("#archiveList"),mount=$("#articleMount"),outline=$("#pageOutline"),search=$("#searchInput");
const toastEl=$("#toast"),archive=$("#archive"),backdrop=$("#backdrop"),installBtn=$("#installBtn");

async function init(){
  try{
    const [articlesRes,cssRes]=await Promise.all([
      fetch("articles.json",{cache:"no-store"}),
      fetch("assets/styles.css",{cache:"force-cache"})
    ]);
    state.articles=(await articlesRes.json()).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
    state.cssText=await cssRes.text();
    renderArchive();
    await route();
  }catch(err){
    mount.innerHTML='<div class="loading">사이트 데이터를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 열어 주세요.</div>';
  }
}

function renderArchive(q=""){
  const term=q.trim().toLowerCase();
  list.innerHTML="";
  state.articles.forEach(a=>{
    const hay=[a.date,a.type,a.title,...(a.keywords||[])].join(" ").toLowerCase();
    if(term&&!hay.includes(term))return;
    const link=document.createElement("a");
    link.className="archive-item"+(state.active&&state.active.id===a.id?" active":"");
    link.href="#"+a.id;
    link.innerHTML='<div class="archive-date">'+a.date+'</div><div class="archive-title">'+a.title+'</div><div class="archive-type">'+a.type+'</div>';
    link.onclick=closeMenu;
    list.appendChild(link);
  });
}

async function route(){
  const requested=location.hash.slice(1);
  const item=state.articles.find(a=>a.id===requested)||state.articles[0];
  if(!item)return;
  state.active=item;
  if(requested!==item.id){
    history.replaceState(null,"","#"+item.id);
  }
  mount.innerHTML='<div class="loading">브리핑을 불러오는 중입니다…</div>';
  try{
    const res=await fetch(item.file,{cache:"no-store"});
    if(!res.ok)throw new Error("article fetch failed");
    mount.innerHTML=await res.text();
  }catch(err){
    mount.innerHTML='<div class="loading">이 글을 불러오지 못했습니다. 오프라인에서 처음 여는 글이라면 인터넷 연결 후 한 번 열어 주세요.</div>';
    return;
  }
  $("#currentTitle").textContent=item.date+" · "+item.title;
  document.title=item.title+" | Clinical Reasoning Archive";
  renderArchive(search.value);
  enhanceTables();
  buildOutline();
  buildNav();
  updateProgress();
  setTimeout(updateOutline,50);
  window.scrollTo({top:0,behavior:"instant"});
}

function enhanceTables(){
  mount.querySelectorAll("table").forEach(table=>{
    const headers=[...table.querySelectorAll("thead th")].map(th=>th.textContent.trim());
    table.querySelectorAll("tbody tr").forEach(row=>{
      [...row.children].forEach((cell,i)=>{
        if(i>0&&headers[i])cell.dataset.label=headers[i];
      });
    });
  });
}

function buildOutline(){
  outline.innerHTML="";
  [...mount.querySelectorAll(".section[data-section-title]")].forEach((s,i)=>{
    s.id="section-"+i;
    const a=document.createElement("a");
    a.href="#";
    a.dataset.target=s.id;
    a.textContent=s.dataset.sectionTitle;
    a.onclick=e=>{
      e.preventDefault();
      s.scrollIntoView({behavior:"smooth",block:"start"});
      history.replaceState(null,"","#"+state.active.id);
    };
    outline.appendChild(a);
  });
}

function updateOutline(){
  let current=null;
  [...mount.querySelectorAll(".section[data-section-title]")].forEach(s=>{
    if(s.getBoundingClientRect().top<=140)current=s;
  });
  outline.querySelectorAll("a").forEach(a=>{
    a.classList.toggle("active",!!current&&a.dataset.target===current.id);
  });
}

function buildNav(){
  const nav=mount.querySelector("[data-article-nav]");
  if(!nav)return;
  const i=state.articles.findIndex(a=>a.id===state.active.id);
  const newer=state.articles[i-1],older=state.articles[i+1];
  nav.innerHTML="";
  nav.append(makeNav(older,"이전 글"),makeNav(newer,"다음 글"));
}

function makeNav(article,kicker){
  const a=document.createElement("a");
  a.className="nav-btn";
  if(article){
    a.href="#"+article.id;
    a.innerHTML='<div class="nav-kicker">'+kicker+'</div><div class="nav-title">'+article.title+"</div>";
  }else{
    a.href="#";
    a.style.opacity=".35";
    a.onclick=e=>e.preventDefault();
    a.innerHTML='<div class="nav-kicker">'+kicker+'</div><div class="nav-title">없음</div>';
  }
  return a;
}

function updateProgress(){
  if(!mount.offsetHeight)return;
  const start=mount.getBoundingClientRect().top+scrollY;
  const h=mount.offsetHeight-innerHeight;
  const p=h<=0?1:(scrollY-start+75)/h;
  $("#progressBar").style.width=Math.max(0,Math.min(1,p))*100+"%";
}

function openMenu(){archive.classList.add("open");backdrop.classList.add("show")}
function closeMenu(){archive.classList.remove("open");backdrop.classList.remove("show")}
function toast(msg){
  toastEl.textContent=msg;
  toastEl.classList.add("show");
  clearTimeout(window._tt);
  window._tt=setTimeout(()=>toastEl.classList.remove("show"),1800);
}

async function copyText(t){
  try{
    await navigator.clipboard.writeText(t);
  }catch(e){
    const ta=document.createElement("textarea");
    ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();
  }
}

function stablePermalink(){
  return location.origin+location.pathname+"#"+state.active.id;
}

async function standaloneHtml(){
  if(!state.cssText){
    state.cssText=await (await fetch("assets/styles.css")).text();
  }
  const article=mount.cloneNode(true);
  const nav=article.querySelector("[data-article-nav]");
  if(nav)nav.remove();
  const printCss='body{background:#f3f3ef}.article{max-width:920px;margin:40px auto;padding:0 24px}.hero,.body{display:block}.archive,.topbar,.rail{display:none}';
  return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+
    escapeHtml(state.active.title)+'</title><style>'+state.cssText+"\n"+printCss+'</style></head><body><main class="article">'+article.innerHTML+
    '</main></body></html>';
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

async function registerServiceWorker(){
  if("serviceWorker" in navigator){
    try{
      await navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"});
    }catch(e){console.warn("오프라인 준비에 실패했습니다.",e);}
  }
}

const standaloneMode=window.matchMedia("(display-mode: standalone)");
function updateInstallButton(){
  installBtn.hidden=standaloneMode.matches||navigator.standalone===true;
}
standaloneMode.addEventListener("change",updateInstallButton);
updateInstallButton();

window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  state.installPrompt=e;
  updateInstallButton();
});
window.addEventListener("appinstalled",()=>{
  state.installPrompt=null;
  installBtn.hidden=true;
  toast("앱 설치가 완료되었습니다.");
});
installBtn.addEventListener("click",async()=>{
  if(!state.installPrompt){
    $("#installHelp").showModal();
    return;
  }
  const prompt=state.installPrompt;
  state.installPrompt=null;
  installBtn.disabled=true;
  try{
    await prompt.prompt();
    const choice=await prompt.userChoice;
    installBtn.hidden=choice.outcome==="accepted";
  }catch(e){
    $("#installHelp").showModal();
  }finally{
    installBtn.disabled=false;
  }
});

search.addEventListener("input",e=>renderArchive(e.target.value));
$("#menuBtn").onclick=openMenu;
backdrop.onclick=closeMenu;
$("#copyLinkBtn").onclick=async()=>{
  await copyText(stablePermalink());
  history.replaceState(null,"","#"+state.active.id);
  toast("이 글의 고정 링크를 복사했습니다.");
};
$("#copyHtmlBtn").onclick=async()=>{
  const html=await standaloneHtml();
  await copyText(html);
  toast("디자인이 포함된 독립 HTML을 복사했습니다.");
};

window.addEventListener("hashchange",route);
window.addEventListener("scroll",()=>{updateProgress();updateOutline()},{passive:true});
window.addEventListener("keydown",e=>{
  if(e.key==="/"&&document.activeElement!==search){e.preventDefault();search.focus();openMenu()}
  if(e.key==="Escape"){closeMenu();search.blur()}
});
registerServiceWorker();
init();
