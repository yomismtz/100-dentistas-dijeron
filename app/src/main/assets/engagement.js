'use strict';

const ENGAGEMENT_VERSION='3.0.15';
const ED_ACH_KEY='dentistas-achievements-v1';
let edSession={rounds:0,totalStrikes:0,bankLosses:0,roundStats:{},recorded:new Set()};
let edFinalChallengeDone=false;
let edChallenge=null;

function edStat(q=questions?.[roundIndex]){
  const k=q?.q||('r'+roundIndex);
  if(!edSession.roundStats[k])edSession.roundStats[k]={hits:0,strikes:0,top:false};
  return edSession.roundStats[k];
}
function edSpecialtyForQuestion(q){
  if(typeof spPrimaryTag==='function')return spPrimaryTag(q);
  return typeof specialtySelected==='string'?specialtySelected:'general';
}
function edMicroType(q){
  const s=edSpecialtyForQuestion(q);
  if(s==='anestesia')return ['anesthesia','💉','ANESTESIA LISTA'];
  if(s==='endodoncia')return ['endo','🦷','CONDUCTO LOCALIZADO'];
  if(s==='ortho_preventiva')return ['preventive','🛡️','PREVENCIÓN ACTIVADA'];
  if(s==='ortho_interceptiva'||s==='ortho_correctiva'||s==='ortopedia')return ['ortho','🦷🦷🦷','ALINEACIÓN CLÍNICA'];
  if(s==='protesis')return ['implant','🔩🦷','REHABILITACIÓN LISTA'];
  if(s==='periodoncia')return ['perio','🦷✨','PERIODONTO ESTABLE'];
  if(s==='cirugia')return ['surgery','🩺','DECISIÓN QUIRÚRGICA'];
  if(s==='odontopediatria')return ['pedo','🦷⭐','SONRISA EN CRECIMIENTO'];
  return ['tooth','🦷✨','CONOCIMIENTO QUE SONRÍE'];
}
function edMicroCelebrate(q=questions?.[roundIndex]){
  const board=document.querySelector('.board');if(!board||document.documentElement.classList.contains('reduceMotion'))return;
  const [type,icon,label]=edMicroType(q);
  const el=document.createElement('div');el.className='dentalMicro';el.dataset.type=type;
  if(type==='ortho')el.innerHTML='<div class="orthoTeeth"><i>🦷</i><em>▪</em><i>🦷</i><em>▪</em><i>🦷</i></div><b>'+label+'</b>';
  else if(type==='endo')el.innerHTML='<div class="endoTooth">🦷<i></i></div><b>'+label+'</b>';
  else if(type==='implant')el.innerHTML='<div class="implantAnim"><i>🔩</i><span>🦷</span></div><b>'+label+'</b>';
  else el.innerHTML='<div class="dentalMicroIcon">'+icon+'</div><b>'+label+'</b>';
  board.appendChild(el);setTimeout(()=>el.remove(),1150);
}

const edBaseReveal=revealAnswer;
revealAnswer=function(idx,btn){
  const was=!!revealed?.[idx],q=questions?.[roundIndex],oldPhase=phase;
  const r=edBaseReveal(idx,btn);
  if(!was&&revealed?.[idx]&&(oldPhase==='play'||oldPhase==='steal')){
    const st=edStat(q);st.hits++;if(idx===0)st.top=true;edMicroCelebrate(q);
  }
  return r;
};

const edBaseStrike=addStrike;
addStrike=function(reason='manual'){
  const q=questions?.[roundIndex],oldPhase=phase,oldBank=bank;
  const r=edBaseStrike(reason);
  const st=edStat(q);
  if((oldPhase==='play'&&strikes>0)||(oldPhase==='steal'&&phase==='over')){st.strikes++;edSession.totalStrikes++;}
  if(oldPhase==='steal'&&oldBank>0&&bank===0)edSession.bankLosses++;
  return r;
};

function edRecordRound(){
  const q=questions?.[roundIndex];if(!q||edSession.recorded.has(q.q))return;
  edSession.recorded.add(q.q);edSession.rounds++;
  const store=edAchStore(),spec=edSpecialtyForQuestion(q);
  store.counts[spec]=(store.counts[spec]||0)+1;edSaveAch(store);
}
function edAdaptiveNext(){
  if(typeof specialtyDifficulty!=='undefined'&&specialtyDifficulty!=='mix')return;
  if(typeof spBank!=='function'||typeof spDifficultyOf!=='function'||roundIndex>=questions.length-1)return;
  if(typeof offlineSettings!=='undefined'&&offlineSettings.adaptive)return;
  const q=questions?.[roundIndex],st=edStat(q);let target='intermediate';
  if(st.hits>=2&&st.strikes===0)target='advanced';
  else if(st.hits===0||st.strikes>=2)target='basic';
  const used=new Set(questions.map(x=>x.q));
  let pool=spBank(typeof specialtySelected==='string'?specialtySelected:'general').filter(x=>!x.disabled&&!used.has(x.q)&&spDifficultyOf(x)===target);
  if(!pool.length)return;
  questions[roundIndex+1]=pool[Math.floor(Math.random()*pool.length)];
}

const edBaseNext=nextRound;
nextRound=function(){edRecordRound();edAdaptiveNext();return edBaseNext();};

const edBaseStart=startNewGame;
startNewGame=function(){
  edSession={rounds:0,totalStrikes:0,bankLosses:0,roundStats:{},recorded:new Set()};edFinalChallengeDone=false;edChallenge=null;
  return edBaseStart();
};

function edChallengePool(){
  const used=new Set((questions||[]).map(q=>q.q));
  let pool=typeof spBank==='function'?spBank(typeof specialtySelected==='string'?specialtySelected:'general'):[...questionPool];
  let hard=pool.filter(q=>!q.disabled&&!used.has(q.q)&&typeof spDifficultyOf==='function'&&spDifficultyOf(q)==='advanced');
  if(hard.length<2)hard=pool.filter(q=>!q.disabled&&!used.has(q.q));
  return shuffle(hard).slice(0,2);
}
function edOfferFinalChallenge(){
  const pool=edChallengePool();
  if(pool.length<2){edFinalChallengeDone=true;return edBaseFinish();}
  stopTimer();
  openModal('<h2>👑 GRAN RETO CLÍNICO</h2><p>Una pregunta difícil para cada equipo. Cada acierto suma <b>50 puntos extra</b>.</p><p>Es opcional y usa el mismo reconocimiento de sinónimos del juego.</p><div class="menuStack"><button id="edChallengeGo" class="setupStart">ACEPTAR EL RETO 👑</button><button id="edChallengeSkip">IR AL RESULTADO</button></div>');
  $('#edChallengeGo').onclick=()=>{closeModal(false);edChallenge={index:0,items:pool};edChallengeQuestion();};
  $('#edChallengeSkip').onclick=()=>{closeModal(false);edFinalChallengeDone=true;edBaseFinish();};
}
function edChallengeQuestion(){
  const team=edChallenge.index,q=edChallenge.items[team];if(!q)return edFinishChallenge();
  if(typeof tvSfx==='function')tvSfx('drumroll');
  const caseText=q.case?'<div class="clinicalCase"><b>CASO CLÍNICO</b><p>'+v2Escape(q.case)+'</p></div>':'';
  openModal('<h2>👑 RETO DE '+v2Escape(teamNames[team])+'</h2>'+caseText+'<p class="finalChallengeQ"><b>'+v2Escape(q.q)+'</b></p><div class="faceInput"><input id="edChallengeInput" placeholder="Una respuesta…"><button id="edChallengeMic">🎙️</button></div><button id="edChallengeSubmit" class="setupStart">RESPONDER</button>');
  $('#edChallengeMic').onclick=()=>{if(typeof v2Speak==='function')v2Speak('finalChallenge');};
  $('#edChallengeSubmit').onclick=edChallengeSubmit;
  $('#edChallengeInput').addEventListener('keydown',e=>{if(e.key==='Enter')edChallengeSubmit();});
  if(typeof narratorReadAnnouncement==='function'&&!window.v3MasterMuted)narratorReadAnnouncement('Gran reto clínico para '+teamNames[team]+'. '+q.q,()=>{},'👑 GRAN RETO…');
}
function edChallengeSubmit(){
  const team=edChallenge.index,q=edChallenge.items[team],txt=($('#edChallengeInput')?.value||'').trim();if(!txt)return;
  const m=typeof v2Match==='function'?v2Match(txt,q):null,ok=!!(m&&m.score>=.78),top=[...q.a].sort((a,b)=>Number(b[1])-Number(a[1]))[0];
  if(ok){scores[team]+=50;updateScoreUI();if(typeof tvSfx==='function')tvSfx('fanfare');edMicroCelebrate(q);}else if(typeof tvSfx==='function')tvSfx('buzz');
  openModal('<h2>'+(ok?'✅ +50 PUNTOS':'📚 SIN BONUS')+'</h2><p>'+(ok?'Coincide con <b>'+v2Escape(v2ShortLabel(m.label))+'</b>.':'La respuesta de mayor valor era <b>'+v2Escape(v2ShortLabel(top[0]))+'</b>.')+'</p><button id="edChallengeNext" class="setupStart">'+(team===0?'RETO DEL SIGUIENTE EQUIPO':'VER RESULTADO')+'</button>');
  $('#edChallengeNext').onclick=()=>{closeModal(false);edChallenge.index++;edChallenge.index>=2?edFinishChallenge():edChallengeQuestion();};
}
function edFinishChallenge(){edFinalChallengeDone=true;edBaseFinish();}

const edSpeech=window.onSpeechResult;
window.onSpeechResult=function(text){
  if(edChallenge&&v2VoiceTarget==='finalChallenge'&&$('#edChallengeInput')){$('#edChallengeInput').value=String(text||'');edChallengeSubmit();return;}
  if(typeof edSpeech==='function')return edSpeech(text);
};

const edBaseFinish=finishGame;
finishGame=function(){
  edRecordRound();
  if(!edFinalChallengeDone)return edOfferFinalChallenge();
  return edBaseFinish();
};

function edAchStore(){
  try{const x=JSON.parse(localStorage.getItem(ED_ACH_KEY)||'{}');return {counts:x.counts||{},unlocked:x.unlocked||{}};}catch(_){return{counts:{},unlocked:{}};}
}
function edSaveAch(x){try{localStorage.setItem(ED_ACH_KEY,JSON.stringify(x));}catch(_){}}
const ED_ACHIEVEMENTS=[
  {id:'anestesia25',icon:'💉',name:'Anestesiólogo',desc:'Completa 25 preguntas de Anestesia Dental.',test:s=>(s.counts.anestesia||0)>=25},
  {id:'endo25',icon:'🔬',name:'Endodoncista',desc:'Completa 25 preguntas de Endodoncia.',test:s=>(s.counts.endodoncia||0)>=25},
  {id:'perio25',icon:'🩸',name:'Maestro periodontal',desc:'Completa 25 preguntas de Periodoncia.',test:s=>(s.counts.periodoncia||0)>=25},
  {id:'sinCaries',icon:'🦷',name:'Sin caries',desc:'Termina 8 rondas de Operatoria sin errores.',test:()=>specialtySelected==='operatoria'&&edSession.rounds>=8&&edSession.totalStrikes===0},
  {id:'diagnostico',icon:'🎯',name:'Diagnóstico perfecto',desc:'Completa una partida de 8 rondas sin ningún strike.',test:()=>edSession.rounds>=8&&edSession.totalStrikes===0},
  {id:'banco8',icon:'🏦',name:'8 rondas sin perder banco',desc:'Completa 8 rondas sin perder un banco en un robo fallido.',test:()=>edSession.rounds>=8&&edSession.bankLosses===0}
];
function edUnlockToast(a){
  const t=document.createElement('div');t.className='achievementToast';t.innerHTML='<span>'+a.icon+'</span><div><small>LOGRO DESBLOQUEADO</small><b>'+a.name+'</b></div>';document.body.appendChild(t);
  if(typeof tvSfx==='function')tvSfx('fanfare');setTimeout(()=>t.classList.add('show'),30);setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),350);},3200);
}
function edEvaluateAchievements(){
  const s=edAchStore();ED_ACHIEVEMENTS.forEach(a=>{if(!s.unlocked[a.id]&&a.test(s)){s.unlocked[a.id]=new Date().toISOString();edUnlockToast(a);}});edSaveAch(s);
}
const edBaseWinner=typeof v2DeclareWinner==='function'?v2DeclareWinner:null;
if(edBaseWinner)v2DeclareWinner=function(winner,sudden=false){edRecordRound();const r=edBaseWinner(winner,sudden);setTimeout(edEvaluateAchievements,700);return r;};

function edAchievementsModal(){
  const s=edAchStore();
  openModal('<h2>🏆 LOGROS ACADÉMICOS</h2><div class="achievementGrid">'+ED_ACHIEVEMENTS.map(a=>'<div class="'+(s.unlocked[a.id]?'unlocked':'locked')+'"><span>'+a.icon+'</span><section><b>'+a.name+'</b><small>'+a.desc+'</small></section><em>'+(s.unlocked[a.id]?'✓':'🔒')+'</em></div>').join('')+'</div><h3>Progreso por especialidad</h3><div class="achievementProgress"><span>💉 Anestesia <b>'+(s.counts.anestesia||0)+'/25</b></span><span>🔬 Endodoncia <b>'+(s.counts.endodoncia||0)+'/25</b></span><span>🩸 Periodoncia <b>'+(s.counts.periodoncia||0)+'/25</b></span></div>');
}
(function(){
  const h=$('.homeActions');if(h&&!$('#achievementsBtn')){const b=document.createElement('button');b.id='achievementsBtn';b.textContent='🏆 LOGROS ACADÉMICOS';b.onclick=edAchievementsModal;h.appendChild(b);}
})();
