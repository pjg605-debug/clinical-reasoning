const state={articles:[],active:null,installPrompt:null,cssText:"",annotations:[],pendingSelection:null,jumpAnnotation:null,vaultFilter:"all"};
const $=s=>document.querySelector(s);
const list=$("#archiveList"),mount=$("#articleMount"),outline=$("#pageOutline"),search=$("#searchInput");
const toastEl=$("#toast"),archive=$("#archive"),backdrop=$("#backdrop"),installBtn=$("#installBtn");
const annotationToolbar=$("#annotationToolbar"),annotationVault=$("#annotationVault"),annotationBackdrop=$("#annotationBackdrop");
const vaultList=$("#vaultList"),vaultCount=$("#vaultCount"),noteDialog=$("#noteDialog"),noteInput=$("#noteInput"),noteQuote=$("#noteQuote");
const ANNOTATION_KEY="clinical-reasoning.annotations.v1";

async function init(){
  try{
    const [articlesRes,cssRes]=await Promise.all([
      fetch("articles.json",{cache:"no-store"}),
      fetch("assets/styles.css",{cache:"force-cache"})
    ]);
    state.articles=(await articlesRes.json()).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
    state.cssText=await cssRes.text();
    loadAnnotations();
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
  renderAnnotations();
  renderVault();
  updateProgress();
  setTimeout(updateOutline,50);
  if(state.jumpAnnotation){
    const jumpId=state.jumpAnnotation;
    state.jumpAnnotation=null;
    setTimeout(()=>scrollToAnnotation(jumpId),80);
  }else{
    window.scrollTo({top:0,behavior:"instant"});
  }
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
  await Promise.all([...article.querySelectorAll("img[src]")].map(async img=>{
    const url=new URL(img.getAttribute("src"),document.baseURI).href;
    try{
      const res=await fetch(url);
      if(!res.ok)throw new Error("image export failed");
      const blob=await res.blob();
      img.src=await new Promise((resolve,reject)=>{
        const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);
      });
    }catch(e){img.src=url;}
  }));
  article.querySelectorAll("a[href]").forEach(a=>{
    a.href=new URL(a.getAttribute("href"),document.baseURI).href;
  });
  const printCss='body{background:#f3f3ef}.article{max-width:920px;margin:40px auto;padding:0 24px}.hero,.body{display:block}.archive,.topbar,.rail{display:none}';
  return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+
    escapeHtml(state.active.title)+'</title><style>'+state.cssText+"\n"+printCss+'</style></head><body><main class="article">'+article.innerHTML+
    '</main></body></html>';
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}


function loadAnnotations(){
  try{
    const raw=localStorage.getItem(ANNOTATION_KEY);
    state.annotations=raw?JSON.parse(raw):[];
    if(!Array.isArray(state.annotations))state.annotations=[];
  }catch(e){state.annotations=[];}
  updateVaultCount();
}

function persistAnnotations(){
  localStorage.setItem(ANNOTATION_KEY,JSON.stringify(state.annotations));
  updateVaultCount();
  renderVault();
}

function updateVaultCount(){
  if(vaultCount)vaultCount.textContent=String(state.annotations.length);
}

function articleTextNodes(){
  const walker=document.createTreeWalker(mount,NodeFilter.SHOW_TEXT,{
    acceptNode(node){
      if(!node.nodeValue||!node.nodeValue.length)return NodeFilter.FILTER_REJECT;
      const p=node.parentElement;
      if(!p||p.closest(".annotation-toolbar,.annotation-vault,script,style"))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes=[];let n;
  while(n=walker.nextNode())nodes.push(n);
  return nodes;
}

function offsetsFromRange(range){
  const nodes=articleTextNodes();
  let cursor=0,start=null,end=null;
  for(const n of nodes){
    const len=n.nodeValue.length;
    if(n===range.startContainer)start=cursor+range.startOffset;
    if(n===range.endContainer)end=cursor+range.endOffset;
    cursor+=len;
  }
  return start===null||end===null?null:{start,end};
}

function rangeFromOffsets(start,end){
  const nodes=articleTextNodes();
  const range=document.createRange();
  let cursor=0,startNode=null,endNode=null,startOffset=0,endOffset=0;
  for(const n of nodes){
    const next=cursor+n.nodeValue.length;
    if(startNode===null&&start>=cursor&&start<=next){
      startNode=n;startOffset=Math.min(n.nodeValue.length,start-cursor);
    }
    if(endNode===null&&end>=cursor&&end<=next){
      endNode=n;endOffset=Math.min(n.nodeValue.length,end-cursor);
      break;
    }
    cursor=next;
  }
  if(!startNode||!endNode)return null;
  try{
    range.setStart(startNode,startOffset);
    range.setEnd(endNode,endOffset);
    return range;
  }catch(e){return null;}
}

function resolveAnnotationRange(annotation){
  if(!annotation||annotation.articleId!==state.active?.id)return null;
  let range=rangeFromOffsets(annotation.start,annotation.end);
  if(range&&range.toString()===annotation.quote)return range;
  const full=mount.textContent||"";
  const index=full.indexOf(annotation.quote||"");
  if(index<0)return null;
  range=rangeFromOffsets(index,index+annotation.quote.length);
  if(range){
    annotation.start=index;annotation.end=index+annotation.quote.length;
  }
  return range;
}

function renderAnnotations(){
  if(!state.active)return;
  const groups={highlight:[],underline:[],note:[],save:[]};
  const names={highlight:"cr-highlight",underline:"cr-underline",note:"cr-note",save:"cr-save"};
  if(CSS.highlights){
    Object.values(names).forEach(name=>CSS.highlights.delete(name));
    state.annotations.filter(a=>a.articleId===state.active.id).forEach(a=>{
      const range=resolveAnnotationRange(a);
      if(range&&groups[a.type])groups[a.type].push(range);
    });
    Object.entries(groups).forEach(([type,ranges])=>{
      if(ranges.length)CSS.highlights.set(names[type],new Highlight(...ranges));
    });
  }
}

function selectionPayload(){
  const sel=window.getSelection();
  if(!sel||sel.rangeCount===0||sel.isCollapsed)return null;
  const range=sel.getRangeAt(0);
  if(!mount.contains(range.commonAncestorContainer))return null;
  const quote=sel.toString().replace(/\s+/g," ").trim();
  if(!quote||quote.length<2)return null;
  const offsets=offsetsFromRange(range);
  if(!offsets)return null;
  return {quote,start:offsets.start,end:offsets.end,range:range.cloneRange()};
}

function showAnnotationToolbar(){
  const payload=selectionPayload();
  if(!payload){hideAnnotationToolbar();return;}
  state.pendingSelection=payload;
  const rect=payload.range.getBoundingClientRect();
  annotationToolbar.hidden=false;
  annotationToolbar.classList.add("show");
  const w=annotationToolbar.offsetWidth||360;
  const left=Math.max(10,Math.min(innerWidth-w-10,rect.left+rect.width/2-w/2));
  const top=Math.max(68,rect.top-54);
  annotationToolbar.style.left=left+"px";
  annotationToolbar.style.top=top+"px";
}

function hideAnnotationToolbar(){
  if(!annotationToolbar)return;
  annotationToolbar.classList.remove("show");
  annotationToolbar.hidden=true;
}

function addAnnotation(type,note=""){
  const p=state.pendingSelection;
  if(!p||!state.active)return;
  const annotation={
    id:"ann-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),
    articleId:state.active.id,articleTitle:state.active.title,articleDate:state.active.date,
    type,quote:p.quote,start:p.start,end:p.end,note,
    createdAt:new Date().toISOString()
  };
  state.annotations.unshift(annotation);
  persistAnnotations();
  renderAnnotations();
  window.getSelection()?.removeAllRanges();
  state.pendingSelection=null;
  hideAnnotationToolbar();
  toast(type==="highlight"?"형광펜으로 표시했습니다.":type==="underline"?"밑줄을 저장했습니다.":type==="note"?"메모를 저장했습니다.":"보관함에 넣었습니다.");
}

function annotationLabel(type){
  return ({highlight:"형광펜",underline:"밑줄",note:"메모",save:"보관"})[type]||type;
}

function openVault(filter=state.vaultFilter||"all"){
  state.vaultFilter=filter;
  renderVault();
  annotationVault.classList.add("open");
  annotationVault.setAttribute("aria-hidden","false");
  annotationBackdrop.classList.add("show");
  hideAnnotationToolbar();
}

function closeVault(){
  annotationVault.classList.remove("open");
  annotationVault.setAttribute("aria-hidden","true");
  annotationBackdrop.classList.remove("show");
}

function renderVault(){
  if(!vaultList)return;
  document.querySelectorAll("[data-vault-filter]").forEach(b=>b.classList.toggle("active",b.dataset.vaultFilter===state.vaultFilter));
  const rows=state.annotations.filter(a=>state.vaultFilter==="all"||a.type===state.vaultFilter);
  vaultList.innerHTML="";
  if(!rows.length){
    vaultList.innerHTML='<div class="vault-empty">아직 저장한 문장이 없습니다.<br>본문에서 문장을 드래그하면 형광펜·밑줄·메모·보관을 사용할 수 있습니다.</div>';
    return;
  }
  rows.forEach(a=>{
    const card=document.createElement("article");
    card.className="vault-item";
    card.innerHTML='<div class="vault-item-top"><span class="vault-kind kind-'+a.type+'">'+annotationLabel(a.type)+'</span><span class="vault-date">'+escapeHtml(a.articleDate||"")+'</span></div>'+
      '<div class="vault-article">'+escapeHtml(a.articleTitle||"")+'</div>'+
      '<blockquote>'+escapeHtml(a.quote||"")+'</blockquote>'+
      (a.note?'<div class="vault-note">'+escapeHtml(a.note)+'</div>':"")+
      '<div class="vault-item-actions"><button type="button" data-jump="'+a.id+'">원문 위치</button>'+
      (a.type==="note"?'<button type="button" data-edit-note="'+a.id+'">메모 수정</button>':"")+
      '<button type="button" class="danger" data-delete-ann="'+a.id+'">삭제</button></div>';
    vaultList.appendChild(card);
  });
}

function scrollToAnnotation(id){
  const a=state.annotations.find(x=>x.id===id);
  if(!a)return;
  const range=resolveAnnotationRange(a);
  if(!range){toast("원문에서 이 위치를 찾지 못했습니다.");return;}
  const el=range.startContainer.parentElement;
  if(el)el.scrollIntoView({behavior:"smooth",block:"center"});
  try{
    const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
    setTimeout(()=>sel.removeAllRanges(),1100);
  }catch(e){}
}

function jumpToAnnotation(id){
  const a=state.annotations.find(x=>x.id===id);
  if(!a)return;
  closeVault();
  if(state.active?.id===a.articleId){
    scrollToAnnotation(id);
  }else{
    state.jumpAnnotation=id;
    location.hash=a.articleId;
  }
}

function deleteAnnotation(id){
  state.annotations=state.annotations.filter(a=>a.id!==id);
  persistAnnotations();renderAnnotations();toast("표시를 삭제했습니다.");
}

function editNote(id){
  const a=state.annotations.find(x=>x.id===id&&x.type==="note");
  if(!a)return;
  noteQuote.textContent=a.quote;
  noteInput.value=a.note||"";
  noteDialog.dataset.editId=id;
  noteDialog.showModal();
  setTimeout(()=>noteInput.focus(),50);
}

function openNewNote(){
  if(!state.pendingSelection)return;
  delete noteDialog.dataset.editId;
  noteQuote.textContent=state.pendingSelection.quote;
  noteInput.value="";
  noteDialog.showModal();
  setTimeout(()=>noteInput.focus(),50);
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
$("#vaultBtn").onclick=()=>openVault();
$("#vaultCloseBtn").onclick=closeVault;
annotationBackdrop.onclick=closeVault;
$("#vaultFilters").addEventListener("click",e=>{
  const b=e.target.closest("[data-vault-filter]");
  if(b){state.vaultFilter=b.dataset.vaultFilter;renderVault();}
});
vaultList.addEventListener("click",e=>{
  const jump=e.target.closest("[data-jump]");
  const del=e.target.closest("[data-delete-ann]");
  const edit=e.target.closest("[data-edit-note]");
  if(jump)jumpToAnnotation(jump.dataset.jump);
  else if(del)deleteAnnotation(del.dataset.deleteAnn);
  else if(edit)editNote(edit.dataset.editNote);
});
annotationToolbar.addEventListener("pointerdown",e=>e.preventDefault());
annotationToolbar.addEventListener("click",e=>{
  const b=e.target.closest("[data-annotation-type]");
  if(e.target.closest("[data-open-vault]")){openVault();return;}
  if(!b)return;
  if(b.dataset.annotationType==="note")openNewNote();
  else addAnnotation(b.dataset.annotationType);
});
$("#noteCancelBtn").onclick=()=>noteDialog.close();
$("#noteForm").addEventListener("submit",e=>{
  e.preventDefault();
  const editId=noteDialog.dataset.editId;
  const note=noteInput.value.trim();
  if(editId){
    const a=state.annotations.find(x=>x.id===editId);
    if(a){a.note=note;persistAnnotations();renderAnnotations();toast("메모를 수정했습니다.");}
  }else addAnnotation("note",note);
  noteDialog.close();
});
mount.addEventListener("mouseup",()=>setTimeout(showAnnotationToolbar,20));
mount.addEventListener("touchend",()=>setTimeout(showAnnotationToolbar,180),{passive:true});
document.addEventListener("pointerdown",e=>{
  if(annotationToolbar.hidden)return;
  if(!annotationToolbar.contains(e.target)&&!mount.contains(e.target))hideAnnotationToolbar();
});

$("#copyHtmlBtn").onclick=async()=>{
  const html=await standaloneHtml();
  await copyText(html);
  toast("디자인이 포함된 독립 HTML을 복사했습니다.");
};

window.addEventListener("hashchange",route);
window.addEventListener("scroll",()=>{updateProgress();updateOutline();if(!annotationToolbar.hidden)hideAnnotationToolbar()},{passive:true});
window.addEventListener("keydown",e=>{
  if(e.key==="/"&&document.activeElement!==search){e.preventDefault();search.focus();openMenu()}
  if(e.key==="Escape"){closeMenu();closeVault();hideAnnotationToolbar();if(noteDialog.open)noteDialog.close();search.blur()}
});
registerServiceWorker();
init();
