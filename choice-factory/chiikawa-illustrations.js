/* 선택하는 인간 01: unofficial character-inspired study art / © original Chiikawa characters Nagano */
(function(){
"use strict";
var chapters=[
["같은 친구, 다른 상황","도입","road","으… 늦어…","저 친구도 바빴던 걸까?","우라!","행동보다 그 행동이 벌어진 상황을 먼저 보자."],
["같은 행동, 두 가지 설명","01 · 귀인 오류","road","미안해…","나에게도 사정이 있잖아!","야하!","남에게 성격을, 자신에게는 상황을 붙이기 쉽다."],
["시간 압박이 행동을 바꾼다","02 · 실험","lab","서둘러야 해…","여유가 있을 때 더 많이 멈췄대!","우라!","관찰된 도움 행동: 10% · 45% · 63%"],
["결과가 같아도 이유는 다르다","03 · 원인","lab","정신없어…","주의? 책임? 불확실성도 있겠지?","야하!","관찰된 사실과 마음속 원인을 구별하자."],
["상황에 따라 드러나는 성격","04 · 성격","park","낯설면 떨려…","익숙한 친구랑은 편하잖아!","우라!","사람마다 상황에 따라 나타나는 반응의 무늬가 다르다."],
["상황만으로 전부 설명할까?","05 · 반론","park","으…?","선택과 책임도 무시할 수 없어.","나 귀엽지?","사람, 상황, 문화, 책임을 함께 살펴보자."],
["다시 묻는 환자는 왜 그럴까?","06 · 진료실","clinic","또 잊었어…","괜찮아! 같이 다시 확인하자.","야하!","의지가 아니라 능력·기회의 문제일 수도."],
["마감 직전, 직원은 왜 서두를까?","07 · 조직","office","벌써 마감…","업무량과 규칙도 확인하자!","우라!","책임을 묻기 전에 책임질 여건을 확인하자."],
["첫 설명은 다음 질문을 바꾼다","08 · 사고실험","office","어떡하지…","무엇부터 확인해야 할까?","야하!","하나의 가설에 갇히면 다른 원인을 놓친다."],
["조금 바꾸고 다시 관찰하기","09 · 적용","clinic","응…!","대기 안내부터 시험해 볼까?","우라!","환자의 권리를 지키며 작은 개선부터 시험하자."],
["한순간이 그 사람 전부는 아니다","10 · 결말","park","응…!","더 좋은 상황을 우리도 만들 수 있어!","야하!","한 장면만으로 사람을 확정하지 말자."],
["이해하지 못한 환자","CASE 01","clinic","다시 알려줘…","우리 같이 다시 확인하자!","우라!","설명했다는 사실과 이해했다는 사실은 다르다."],
["계획을 실천하기 어려운 날","CASE 02","road","시간이 없었어…","어떤 사정이 힘들었을까?","야하!","의지에 앞서 시간·비용·선호를 확인."],
["오래 기다리는 환자","CASE 03","clinic","언제 내 차례야…","대기 시간이 어느 정도일까?","우라!","기다림 자체와 불확실한 기다림은 다르다."]
];
var colors=[["#fff2e7","#d49f88","#e8cec2"],["#eaf2f7","#8ab3ca","#cbdce3"],["#fff5e1","#d7b481","#ead9b3"],["#eff5eb","#94ba9e","#cfe1cd"],["#f3eef7","#b6a0ce","#ddd0e8"]];
function txt(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function critter(kind,x,y,k,emotion,prop){
 var st='stroke="#5c4b43" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"';
 var body="#fffdf9",ears="",cap="",tail="";
 if(kind==="chii"){ears='<ellipse cx="-47" cy="-68" rx="19" ry="21" fill="#fffdf9" '+st+'/><ellipse cx="47" cy="-68" rx="19" ry="21" fill="#fffdf9" '+st+'/>';}
 if(kind==="hachi"){
  ears='<path d="M-67 -41L-59 -106Q-55 -120 -41 -105L-12 -83L40 -109Q60 -119 65 -100L69 -41Z" fill="#78a8c2" '+st+'/>';
  cap='<path d="M-67-45Q-40-92-5-68Q11-90 36-85Q62-77 69-42L66-28Q46-37 40-51Q10-62-3-46Q-31-68-62-28Z" fill="#83afc8"/>';
  tail='<path d="M62 55Q112 50 93 86Q83 95 68 81" fill="#76a9c3" '+st+'/>';
 }
 if(kind==="usagi"){
  body="#ffe6ad";
  ears='<path d="M-46-49Q-74-143-48-154Q-17-162-15-50Z" fill="#ffe6ad" '+st+'/><path d="M-38-78L-43-143Q-32-141-27-80Z" fill="#f7b4a9"/><path d="M17-50Q17-150 39-155Q67-153 48-51Z" fill="#ffe6ad" '+st+'/><path d="M30-79L40-145Q50-139 36-78Z" fill="#f7b4a9"/>';
  tail='<circle cx="70" cy="58" r="18" fill="#ffe6ad" '+st+'/>';
 }
 if(kind==="momonga"){
  ears='<circle cx="-50" cy="-66" r="20" fill="#a5c7db" '+st+'/><circle cx="50" cy="-66" r="20" fill="#a5c7db" '+st+'/>';
  tail='<path d="M56 54Q128 51 106-15Q152 42 121 96Q80 130 12 82Z" fill="#a4c6d8" '+st+'/>';
  cap='<path d="M-63-56Q-34-84-4-65Q27-91 64-53L61-27Q24-52-6-45Q-41-59-63-28Z" fill="#b0cfe1"/>';
 }
 var face=emotion==="worry"?'<ellipse cx="-22" cy="-15" rx="6" ry="9" fill="#514037"/><ellipse cx="22" cy="-15" rx="6" ry="9" fill="#514037"/><path d="M-9 19q9-9 18 0" stroke="#514037" stroke-width="4" fill="none"/><path d="M56-12q14 20 0 27q-12 1 -7-14Z" fill="#8dccdf" stroke="#70b5c7" stroke-width="2"/>':emotion==="loud"?'<path d="M-33-12q12-15 23 0m21 0q12-15 23 0" fill="none" stroke="#514037" stroke-width="4" stroke-linecap="round"/><ellipse cx="0" cy="20" rx="12" ry="14" fill="#97585b" stroke="#514037" stroke-width="4"/>':'<path d="M-33-12q12-15 23 0m21 0q12-15 23 0" fill="none" stroke="#514037" stroke-width="4" stroke-linecap="round"/><path d="M-11 17q7 13 11 0q6 13 12 0" stroke="#514037" stroke-width="4" fill="none" stroke-linecap="round"/>';
 var thing="";
 if(prop==="sheet")thing='<g transform="translate(55 51) rotate(-10)"><rect x="-27" y="-30" width="53" height="63" rx="4" fill="#fffbf1" stroke="#9f948a" stroke-width="3"/><path d="M-16-12H15M-16 2H16M-16 16H9" stroke="#acc8bc" stroke-width="3"/></g>';
 if(prop==="clock")thing='<g transform="translate(68 48)"><circle r="21" fill="#fffbf1" stroke="#95acae" stroke-width="3"/><path d="M0 0v-14m0 14l10 5" stroke="#85776b" stroke-width="3"/></g>';
 if(prop==="book")thing='<g transform="translate(0 63)"><path d="M-45 0q24-12 45 0q22-12 45 0v39q-24-10-45 1q-21-11-45-1Z" fill="#b0d0c8" stroke="#71625c" stroke-width="3"/><path d="M0 0v38" stroke="#71625c" stroke-width="3"/></g>';
 return '<g transform="translate('+x+' '+y+') scale('+k+')"><ellipse cy="103" rx="81" ry="13" fill="#7b726b" opacity=".12"/>'+tail+'<ellipse cx="-34" cy="83" rx="24" ry="15" fill="'+body+'" '+st+'/><ellipse cx="34" cy="83" rx="24" ry="15" fill="'+body+'" '+st+'/>'+ears+'<path d="M0-79Q-78-88-79 1Q-87 95 0 98Q87 95 79 1Q79-88 0-79Z" fill="'+body+'" '+st+'/>'+cap+'<path d="M-67 38q-31-12-22 14q11 15 26 3m130-17q31-12 22 14q-11 15-26 3" fill="'+body+'" '+st+'/><ellipse cx="-46" cy="17" rx="19" ry="11" fill="#f4b0b2" opacity=".88"/><ellipse cx="46" cy="17" rx="19" ry="11" fill="#f4b0b2" opacity=".88"/><path d="M-55 15l7-2m-6 11l7-2m94-7l7-2m-7 11l7-2" stroke="#dc8c8d" stroke-width="2"/>'+face+thing+'</g>';
}
function talk(x,y,w,s,c){
 var words=s.split("|");if(words.length<2&&s.length>14){var p=s.lastIndexOf(" ",Math.ceil(s.length/2)+5);if(p>4)words=[s.slice(0,p),s.slice(p+1)];}
 var h=words.length*27+28;
 return '<g><rect x="'+(x-w/2)+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="26" fill="#fffefb" stroke="'+c+'" stroke-width="3"/><path d="M'+(x-13)+' '+(y+h-2)+'l13 19l13-19" fill="#fffefb" stroke="'+c+'" stroke-width="3"/><path d="M'+(x-10)+' '+(y+h-3)+'h20" stroke="#fffefb" stroke-width="5"/>'+words.map(function(t,i){return '<text x="'+x+'" y="'+(y+35+i*27)+'" font-size="'+(t.length>16?18:21)+'" text-anchor="middle" font-weight="750" fill="#52463f">'+txt(t)+'</text>';}).join("")+'</g>';
}
function background(place,ink){
 var s='<path d="M0 342Q180 288 339 344Q551 392 725 335Q904 295 1000 351V485H0Z" fill="'+ink+'" opacity=".42"/><path d="M0 418Q250 392 510 419Q730 392 1000 417" stroke="#b4a89d" stroke-width="4" stroke-dasharray="7 11" fill="none"/>';
 if(place==="road"||place==="office"){
  s+='<rect x="28" y="199" width="150" height="160" rx="13" fill="#e7e9df" stroke="#b9c6bf" stroke-width="3"/><rect x="53" y="223" width="44" height="50" rx="4" fill="#c9dcd8"/><rect x="112" y="223" width="44" height="50" rx="4" fill="#c9dcd8"/><rect x="822" y="217" width="148" height="156" rx="12" fill="#eddfd6" stroke="#d5c3b4" stroke-width="3"/><path d="M848 246h94m-94 26h94m-94 26h70" stroke="#d7c3b8" stroke-width="8" stroke-linecap="round"/>';
  if(place==="office")s+='<rect x="52" y="387" width="898" height="19" rx="9" fill="#bca28e"/><path d="M95 406v51m815-51v51" stroke="#b99b83" stroke-width="15"/>';
 }
 if(place==="clinic")s+='<rect x="29" y="203" width="158" height="155" rx="15" fill="#fafffd" stroke="#b4d0c4" stroke-width="3"/><path d="M56 232h105M56 254h86M56 277h97" stroke="#bdd9d1" stroke-width="9" stroke-linecap="round"/><path d="M100 292v43m-20-22h40" stroke="#81b5a4" stroke-width="10"/><rect x="793" y="365" width="192" height="23" rx="11" fill="#8db5ac"/><rect x="808" y="385" width="14" height="52" fill="#accbc4"/><rect x="963" y="385" width="14" height="52" fill="#accbc4"/>';
 if(place==="lab")s+='<rect x="30" y="207" width="161" height="136" rx="13" fill="#e6f0e7" stroke="#afc7b6" stroke-width="4"/><path d="M51 300l39-47l28 33l48-64" stroke="#d99c8d" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="817" y="210" width="153" height="132" rx="13" fill="#fff6df" stroke="#cbb9a5" stroke-width="4"/><path d="M841 247h101m-101 23h81m-81 23h97" stroke="#d6c5ad" stroke-width="8" stroke-linecap="round"/>';
 if(place==="park")s+='<path d="M25 423q8-105 72-95q38 17 19 72M860 418q26-95 69-90q31 7 25 80" fill="#c2d9b1" stroke="#91b89b" stroke-width="4"/><g fill="#f8dfbd"><circle cx="105" cy="381" r="14"/><circle cx="93" cy="370" r="13"/><circle cx="120" cy="369" r="13"/><circle cx="938" cy="382" r="14"/><circle cx="926" cy="369" r="13"/><circle cx="951" cy="369" r="13"/></g>';
 return s;
}
function drawing(d,n){
 var col=colors[n%colors.length],title=d[0],label=d[1],which=d[2],ch=d[3],ha=d[4],ua=d[5],sum=d[6],mom=n===5;
 var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 575" role="img" aria-label="'+txt(title)+'"><defs><linearGradient id="g'+n+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf7"/><stop offset="1" stop-color="'+col[0]+'"/></linearGradient></defs><rect width="1000" height="575" rx="28" fill="url(#g'+n+')"/><circle cx="60" cy="30" r="100" fill="#fff" opacity=".35"/><circle cx="949" cy="33" r="102" fill="#fff" opacity=".32"/>'+background(which,col[2]);
 svg+='<rect x="32" y="20" width="73" height="33" rx="16" fill="'+col[1]+'"/><text x="69" y="42" text-anchor="middle" fill="#fff" font-size="13" font-weight="800">CH 01</text><text x="120" y="43" fill="#81766d" font-size="14" font-weight="750">'+txt(label)+'</text><text x="500" y="79" text-anchor="middle" fill="#564942" font-size="'+(title.length>20?29:33)+'" font-weight="850">'+txt(title)+'</text>';
 svg+=critter("chii",203,331,1.1,ch.indexOf("…")>=0?"worry":"smile",which==="lab"?"clock":"");
 svg+=critter("hachi",495,329,1.1,"smile",which==="clinic"?"book":"sheet");
 svg+=critter(mom?"momonga":"usagi",790,330,.96,mom?"smile":"loud","");
 svg+=talk(206,116,216,ch,"#be9389")+talk(497,106,293,ha,"#82abb7")+talk(790,116,214,ua,"#c8aa77");
 svg+='<rect x="30" y="468" width="940" height="80" rx="26" fill="#fffdfa" stroke="'+col[1]+'" stroke-width="3.5"/><text x="69" y="502" font-size="14" font-weight="800" fill="'+col[1]+'">그림 요약</text><text x="500" y="518" text-anchor="middle" font-size="'+(sum.length>37?19:22)+'" font-weight="800" fill="#51473f">'+txt(sum)+'</text></svg>';
 return svg;
}
function makeArt(d,index,small){
 var fig=document.createElement("figure");fig.className="cute-summary"+(small?" cute-small":"");
 if(!small){var hd=document.createElement("div");hd.className="cute-heading";hd.innerHTML='<span>ILLUSTRATED RECAP</span><strong>'+txt(d[1])+'</strong>';fig.appendChild(hd);}
 fig.insertAdjacentHTML("beforeend",drawing(d,index));
 var cap=document.createElement("figcaption");cap.textContent=d[6];fig.appendChild(cap);return fig;
}
function inject(){
 var sty=document.createElement("style");
 sty.textContent='.cute-summary{margin:34px 0 12px;background:var(--panel);border:1px solid var(--rule);border-radius:17px;box-shadow:var(--shadow);overflow:hidden}.cute-summary svg{display:block;width:100%;height:auto}.cute-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 19px 10px;color:var(--accent);font-size:11px;font-weight:800;letter-spacing:.08em}.cute-heading strong{color:var(--muted);font-size:12px;letter-spacing:0}.cute-summary figcaption{font-size:13px;color:var(--muted);line-height:1.7;padding:10px 19px 15px}.cute-small{margin:15px 0 20px;box-shadow:none}.cute-small svg{max-height:340px}.hero-art svg{display:block}.cute-primer{background:var(--sage);border-left:3px solid var(--accent);padding:12px 15px;margin:0 0 26px;font-size:13px;line-height:1.8;color:var(--muted)}@media(max-width:760px){.cute-summary{margin:25px 0 5px}.cute-heading{padding:10px 12px}.cute-summary figcaption{font-size:12px;padding:8px 13px 14px}.cute-small svg{max-height:none}}@media print{.cute-summary{break-inside:avoid;box-shadow:none}}';
 document.head.appendChild(sty);
 var hero=document.querySelector(".hero-art");if(hero)hero.replaceWith(makeArt(chapters[0],0,true));
 var legend=document.querySelector(".source-legend");
 if(legend){var primer=document.createElement("div");primer.className="cute-primer";primer.textContent="비공식 창작 삽화: 치이카와는 소심하게 망설이고, 하치와레는 궁금한 것을 질문하고 친구를 격려하며, 우사기는 ‘우라!’와 ‘야하!’를 외칩니다. 각 절이 끝날 때 그림으로 핵심을 요약합니다.";legend.parentNode.insertBefore(primer,legend);}
 Array.from(document.querySelectorAll(".prose section")).forEach(function(sec,i){if(i<10&&!sec.querySelector(".cute-summary"))sec.appendChild(makeArt(chapters[i+1],i+1,false));});
 Array.from(document.querySelectorAll(".case")).slice(0,3).forEach(function(c,i){var head=c.querySelector(".case-head");if(head)head.insertAdjacentElement("afterend",makeArt(chapters[11+i],11+i,true));});
 Array.from(document.querySelectorAll("figure.figure")).forEach(function(fig){var tag=fig.querySelector(".figlabel");if(!tag)return;
  if(tag.textContent.indexOf("FIGURE 02")>=0){fig.innerHTML=drawing(chapters[4],4)+'<figcaption>상황에 따른 성격 반응을 보여주는 비공식 캐릭터 창작 개념도. 실제 연구 데이터가 아니다.</figcaption>';}
  if(tag.textContent.indexOf("FIGURE 03")>=0){fig.innerHTML=drawing(chapters[7],7)+'<figcaption>예약 안내 문제의 원인을 개인·상황·제도 측면에서 살펴보는 그림.</figcaption>';}
 });
 var refs=document.querySelector("#sources p");if(refs){var notice=document.createElement("p");notice.style.fontSize="13px";notice.textContent="시각 자료는 나가노(Nagano)의 《치이카와》 등장인물을 바탕으로 새롭게 구성한 비공식 팬아트풍 학습용 삽화다. 말풍선은 원작 대사가 아닌 이 글의 창작 대사다.";refs.parentNode.insertBefore(notice,refs);}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",inject,{once:true});else inject();
})();