/* Mejora 12 — Modo Estudio */
(function(){
'use strict';
const KEY='dentistas-study-v1';
const state=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(_){return {};}})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){}}
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
function answer(q){const a=Array.isArray(q?.a)?q.a:[];return [...a].sort((x,y)=>(Number(y?.[1])||0)-(Number(x?.[1])||0))[0]?.[0]||'';}
function area(q){return q?.area||q?.category||q?.specialty||'General';}
function open(){
 const pool=window.DentistasQuestionPool?.()||window.DentistasQuestions?.()||[];
 const qs=Array.isArray(pool)&&pool.length?pool:(window.questionPool||[]);
 const areas=[...new Set(qs.map(area))].filter(Boolean).sort();
 let html='<h2>📚 MODO ESTUDIO</h2><p>Practica sin cronómetro. Elige una especialidad:</p><div class="studyAreas">';
 html+='<button data-study-area="">TODAS</button>'+areas.map(a=>'<button data-study-area="'+a.replace(/"/g,'&quot;')+'">'+a+'</button>').join('');
 html+='</div><div id="studyCard"></div>';
 if(typeof window.openModal==='function')window.openModal(html);
 document.querySelectorAll('[data-study-area]').forEach(b=>b.onclick=()=>start(b.dataset.studyArea,qs));
 start('',qs);
}
function start(selected,qs){
 const list=qs.filter(q=>!selected||area(q)===selected);
 if(!list.length)return;
 let i=Math.floor(Math.random()*list.length),answered=false;
 const card=document.getElementById('studyCard');if(!card)return;
 function render(){
  const q=list[i];const a=answer(q);
  const options=(q.a||[]).map((x,n)=>'<div class="studyAnswer"><b>'+(n+1)+'.</b> '+(x[0]||'')+'</div>').join('');
  card.innerHTML='<div class="studyProgress">'+(selected||'General')+'</div><h3>'+qText(q)+'</h3><div>'+options+'</div><button id="studyReveal">👁️ MOSTRAR RESPUESTA</button><div id="studyExplanation" class="studyExplanation hidden"><b>Respuesta más popular:</b> '+a+'<br><small>Repasa las demás opciones y compáralas con su puntuación.</small></div><div class="studyNav"><button id="studyPrev">◀</button><button id="studyNext">SIGUIENTE ▶</button></div>';
  document.getElementById('studyReveal').onclick=()=>{document.getElementById('studyExplanation').classList.remove('hidden');state[answerKey(q)]=(state[answerKey(q)]||0)+1;save();};
  document.getElementById('studyPrev').onclick=()=>{i=(i-1+list.length)%list.length;render();};
  document.getElementById('studyNext').onclick=()=>{i=(i+1)%list.length;render();};
 }
 function answerKey(q){return String(q.id||q.question||q.q||i);}
 render();
}
window.DentistasStudy={open};
document.addEventListener('click',e=>{if(e.target?.id==='studyMode')open();});
const style=document.createElement('style');style.textContent='.studyAreas{display:grid;grid-template-columns:repeat(2,1fr);gap:.45rem;max-height:24vh;overflow:auto;margin:.7rem 0}.studyAreas button,.studyNav button,#studyReveal{padding:.65rem;border:1px solid #d6b26b;border-radius:10px;background:#0b4770;color:#fff;font-weight:900}.studyProgress{opacity:.7;font-size:.85rem}.studyAnswer{padding:.45rem .6rem;margin:.35rem 0;border:1px solid #385765;border-radius:8px}.studyExplanation{margin:.7rem 0;padding:.8rem;border:1px solid #d6b26b;border-radius:10px;background:#08283a}.studyNav{display:flex;gap:.6rem;margin-top:.7rem}.studyNav button{flex:1}';document.head.appendChild(style);
})();