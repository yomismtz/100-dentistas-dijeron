/* Mejora 8 — estadísticas persistentes */
(function(){
'use strict';
const KEY='dentistas-stats-v1';
const defaults={games:0,wins:0,losses:0,ties:0,points:0,rounds:0,correct:0,strikes:0,steals:0,stealAttempts:0,bestScore:0,finalWins:0};
function read(){try{const raw=localStorage.getItem(KEY);return {...defaults,...(raw?JSON.parse(raw):{})};}catch(_){return {...defaults};}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(_){}}
function update(fn){const s=read();fn(s);write(s);return s;}
function recordGame(r){return update(s=>{s.games++;s.points+=Math.max(0,Number(r.points)||0);s.rounds+=Math.max(0,Number(r.rounds)||0);s.correct+=Math.max(0,Number(r.correct)||0);s.strikes+=Math.max(0,Number(r.strikes)||0);s.steals+=Math.max(0,Number(r.steals)||0);s.stealAttempts+=Math.max(0,Number(r.stealAttempts)||0);if(r.outcome==='win')s.wins++;else if(r.outcome==='loss')s.losses++;else s.ties++;s.bestScore=Math.max(s.bestScore,Math.max(0,Number(r.points)||0));});}
function recordFinal(win){if(win)update(s=>s.finalWins++);}
function show(){const s=read();const accuracy=s.correct+s.strikes?Math.round(s.correct/(s.correct+s.strikes)*100):0;const stealRate=s.stealAttempts?Math.round(s.steals/s.stealAttempts*100):0;const en=typeof window.isEn==='function'&&window.isEn();const labels=en?['Games','Wins','Ties','Points','Best score','Rounds','Accuracy*','Steal success','Final wins']:['Partidas','Victorias','Empates','Puntos','Mejor marcador','Rondas','Precisión*','Robos exitosos','Rondas finales'];const vals=[s.games,s.wins,s.ties,s.points,s.bestScore,s.rounds,accuracy+'%',stealRate+'%',s.finalWins];let html='<h2>📊 '+(en?'Statistics':'Estadísticas')+'</h2><div class="statsGrid">';vals.forEach((v,i)=>{html+='<div><b>'+v+'</b><small>'+labels[i]+'</small></div>';});html+='</div><p>* '+(en?'Correct answers ÷ (correct answers + strikes).':'Respuestas correctas ÷ (correctas + strikes).')+'</p>';if(typeof window.openModal==='function')window.openModal(html);}
window.DentistasStats={read,recordGame,recordFinal,show};
document.addEventListener('click',e=>{if(e.target&&e.target.id==='stats')show();});
const style=document.createElement('style');style.textContent='.statsGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin:1rem 0}.statsGrid div{padding:.8rem;border:1px solid #3e7b86;border-radius:12px;background:#0d2830;text-align:center}.statsGrid b{display:block;font-size:1.35rem}.statsGrid small{opacity:.8}';document.head.appendChild(style);
})();