/* Choice Factory episode 01: externally approved watercolour illustration loader.
   Requires the ./art/ image files from this publication bundle.
   It replaces the earlier procedural-vector illustrations without changing the article reader. */
(()=>{
 'use strict';
 const descriptions={
  hero:'도입: 같은 사람도 상황에 따라 다르게 행동한다',
  section01:'같은 행동에 서로 다른 해석을 붙이는 귀인 오류',
  section02:'선한 사마리아인 실험: 도움 행동과 시간 압박',
  section03:'결과 하나에도 다양한 원인이 있다',
  section04:'낯선 상황과 친숙한 상황에서의 행동 차이',
  section05:'상황의 영향과 개인의 책임을 함께 고려한다',
  section06:'진료실에서 설명을 이해하지 못한 환자',
  section07:'한의원 접수 마감과 업무 구조',
  section08:'누구의 탓인지 단정하지 않는 사고실험',
  section09:'작고 안전한 운영 개선 실험',
  section10:'한 장면으로 사람 전체를 단정하지 않는다',
  case01:'환자가 진료 설명을 다시 요청하는 사례',
  case02:'치료 계획을 실행하기 어려운 일상',
  case03:'기다림과 불확실성에 관한 진료 사례',
  culture:'같은 행동을 다른 관점으로 해석하기',
  comb:'능력 기회 동기를 함께 살펴보는 COM-B 모형'
 };
 const figure=(key,featured=false)=>{
  const f=document.createElement('figure'); f.className='watercolour-figure'+(featured?' featured':'');
  f.innerHTML=`<img src="art/${key}.webp" alt="${descriptions[key]}" loading="${featured?'eager':'lazy'}" decoding="async"><figcaption>${descriptions[key]} · 창작 상황극</figcaption>`;
  return f;
 };
 const style=document.createElement('style'); style.textContent=`
 .watercolour-figure{max-width:100%;margin:2rem 0;border:1px solid var(--rule,#ddd);border-radius:16px;overflow:hidden;background:var(--panel,#fff);box-shadow:0 9px 35px #0000000c}
 .watercolour-figure img{display:block;width:100%;height:auto;object-fit:contain}
 .watercolour-figure figcaption{padding:11px 15px 14px;font-size:13px;line-height:1.7;color:var(--muted,#666)}
 .watercolour-figure.featured{margin:2rem 0 3rem}
 .case .watercolour-figure{margin:13px 0 18px;box-shadow:none}
 @media (max-width:760px){.watercolour-figure{margin:1.25rem 0}.watercolour-figure figcaption{font-size:12px}}
 @media print{.watercolour-figure{break-inside:avoid;box-shadow:none}}
 `;document.head.appendChild(style);
 const hero=document.querySelector('.hero-art,.choice-art-hero'); if(hero)hero.replaceWith(figure('hero',true));
 document.querySelectorAll('.prose section').forEach((s,i)=>{
  if(i>=10)return;
  const previous=s.querySelector('.cute-summary,.choice-art:not(.watercolour-figure)');
  const next=figure('section'+String(i+1).padStart(2,'0'));
  if(previous)previous.replaceWith(next); else s.appendChild(next);
 });
 document.querySelectorAll('.case').forEach((c,i)=>{
  if(i>=3)return;
  const prev=c.querySelector('.cute-summary,.choice-art:not(.watercolour-figure)');
  const next=figure('case0'+(i+1));
  if(prev)prev.replaceWith(next); else {const head=c.querySelector('.case-head');if(head)head.insertAdjacentElement('afterend',next);else c.prepend(next)}
 });
 document.querySelectorAll('figure.figure').forEach(f=>{
  const label=f.querySelector('.figlabel')?.textContent||'';
  // The same illustration appears at the end of each section; avoid duplicates.
  if(label.includes('FIGURE 02')||label.includes('FIGURE 03'))f.remove();
 });
 const culture=document.querySelector('#argument h3'); if(culture)culture.insertAdjacentElement('beforebegin',figure('culture'));
 const method=document.querySelector('#practice h3'); if(method)method.insertAdjacentElement('beforebegin',figure('comb'));
})();