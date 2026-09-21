'use strict';

const CPU_OPPONENT_VERSION='3.0.16';
const CPU_PREF_KEY='dentistas-cpu-opponent-v1';
let cpuMode=false;
let cpuLevel='medium';
let cpuTimer=null;
let cpuResolvedBuzz=false;
window.cpuMode=false;

const CPU_LEVELS={
  basic:{
    name:'BÁSICO',icon:'🌱',
    desc:'Conoce lo esencial, duda más y comete errores frecuentes.',
    accuracy:{basic:.58,intermediate:.42,advanced:.26},
    reaction:[5000,7800],power:.15
  },
  medium:{
    name:'MEDIO',icon:'🦷',
    desc:'Buen dominio general, pero falla conceptos intermedios y avanzados.',
    accuracy:{basic:.76,intermediate:.62,advanced:.46},
    reaction:[3500,5600],power:.55
  },
  high:{
    name:'ALTO',icon:'🔥',
    desc:'Responde con seguridad y suele encontrar respuestas de mayor valor.',
    accuracy:{basic:.90,intermediate:.80,advanced:.66},
    reaction:[2200,3900],power:1.0
  },
  excellent:{
    name:'EXCELENTE',icon:'👑',
    desc:'Dominio clínico muy alto; incluso las preguntas difíciles son competitivas.',
    accuracy:{basic:.98,intermediate:.93,advanced:.84},
    reaction:[1200,2600],power:1.45
  }
};

(function cpuLoadPrefs(){
  try{
    const p=JSON.parse(localStorage.getItem(CPU_PREF_KEY)||'{}');
    if(CPU_LEVELS[p.level])cpuLevel=p.level;
  }catch(_){}
})();

function cpuCfg(){return CPU_LEVELS[cpuLevel]||CPU_LEVELS.medium;}
function cpuName(){return 'DR. BYTE · '+cpuCfg().name;}
function cpuClear(){if(cpuTimer){clearTimeout(cpuTimer);cpuTimer=null;}}
function cpuDelay(mult=1){
  const [a,b]=cpuCfg().reaction;
  return Math.round((a+Math.random()*(b-a))*mult);
}
function cpuQuestionDifficulty(q){
  return typeof spDifficultyOf==='function'?spDifficultyOf(q):(q?.difficulty||'intermediate');
}
function cpuAccuracy(q){
  const d=cpuQuestionDifficulty(q);
  return Number(cpuCfg().accuracy[d]??cpuCfg().accuracy.intermediate);
}
function cpuKnows(q){return Math.random()<cpuAccuracy(q);}
function cpuPickIndex(q,indices){
  const list=(indices||q.a.map((_,i)=>i)).filter(i=>q.a[i]);
  if(!list.length)return null;
  const power=cpuCfg().power;
  const weighted=list.map(i=>{
    const pts=Math.max(1,Number(q.a[i][1])||1);
    return {i,w:Math.pow(pts+5,power)};
  });
  let x=Math.random()*weighted.reduce((s,a)=>s+a.w,0);
  for(const a of weighted){x-=a.w;if(x<=0)return a.i;}
  return weighted[weighted.length-1].i;
}
function cpuAttempt(q,indices){
  if(!q||!cpuKnows(q))return null;
  const idx=cpuPickIndex(q,indices);
  if(idx==null)return null;
  return {idx,score:1,label:q.a[idx][0],shortLabel:typeof v2ShortLabel==='function'?v2ShortLabel(q.a[idx][0]):q.a[idx][0],points:Number(q.a[idx][1])||0};
}
function cpuThinking(text='Analizando la pregunta…'){
  if(typeof v2Host==='function')v2Host('🤖 '+cpuName()+': '+text,'tense');
  const turn=$('#turn');if(turn)turn.textContent='🤖 COMPUTADORA PENSANDO…';
}
function cpuSpeakResult(text){
  if(typeof v2Host==='function')v2Host('🤖 '+text,'normal');
  if(typeof narratorReadAnnouncement==='function'&&!window.v3MasterMuted)narratorReadAnnouncement(text,()=>{},'🤖 COMPUTADORA…');
}
function cpuUpdateControls(){
  if(!cpuMode)return;
  const cpuTurn=currentTeam===1&&(phase==='play'||phase==='steal');
  const input=$('#responseInput'),check=$('#checkBtn'),voice=$('#voiceBtn');
  if(input){input.disabled=cpuTurn;input.placeholder=cpuTurn?'La computadora está pensando…':'Escribe la respuesta…';}
  if(check)check.disabled=cpuTurn;
  if(voice)voice.disabled=cpuTurn;
  const t2=document.querySelector('.teamTwo');if(t2)t2.classList.toggle('cpuTeam',true);
  const turn=$('#turn');if(turn&&cpuTurn)turn.textContent='🤖 '+cpuName()+' · PENSANDO';
}

function cpuMaybeSchedule(){
  cpuClear();
  if(!cpuMode||currentTeam!==1||!['play','steal'].includes(phase)||!gameVisible())return;
  cpuUpdateControls();
  cpuThinking();
  cpuTimer=setTimeout(cpuAct,cpuDelay());
}
function cpuAct(){
  cpuTimer=null;
  if(!cpuMode||currentTeam!==1||!['play','steal'].includes(phase)||!gameVisible())return;
  const modal=$('#modal');
  if(modal&&!modal.classList.contains('hidden')){cpuTimer=setTimeout(cpuAct,500);return;}
  const q=questions?.[roundIndex];if(!q)return;
  const hidden=q.a.map((_,i)=>i).filter(i=>!revealed[i]);
  if(!hidden.length){
    if(bank>0){cpuSpeakResult(cpuName()+' asegura el banco.');setTimeout(()=>awardBank(2),450);}
    return;
  }
  const m=cpuAttempt(q,hidden);
  if(m){
    cpuSpeakResult(cpuName()+' responde: '+(m.shortLabel||m.label)+'.');
    if(typeof tvSfx==='function')tvSfx(m.idx===0?'topAnswer':'correct');
    setTimeout(()=>{
      if(!cpuMode||currentTeam!==1||!['play','steal'].includes(phase))return;
      const btn=$('#answers')?.children[m.idx];
      if(btn&&!revealed[m.idx])revealAnswer(m.idx,btn);
    },620);
  }else{
    cpuSpeakResult(cpuName()+' no encuentra una respuesta válida.');
    setTimeout(()=>{if(cpuMode&&currentTeam===1&&['play','steal'].includes(phase))addStrike('cpu');},520);
  }
}

const cpuBaseStartTimer=startTimer;
startTimer=function(){
  const r=cpuBaseStartTimer.apply(this,arguments);
  setTimeout(cpuMaybeSchedule,30);
  return r;
};

const cpuBaseStopTimer=stopTimer;
stopTimer=function(){cpuClear();return cpuBaseStopTimer.apply(this,arguments);};

const cpuBaseUpdateTurn=updateTurnUI;
updateTurnUI=function(){
  const r=cpuBaseUpdateTurn.apply(this,arguments);
  cpuUpdateControls();
  return r;
};

const cpuBaseStrike=addStrike;
addStrike=function(reason='manual'){
  const oldTeam=currentTeam;
  const r=cpuBaseStrike(reason);
  if(cpuMode){
    cpuUpdateControls();
    if(oldTeam===0&&currentTeam===1&&['play','steal'].includes(phase)){
      setTimeout(()=>{
        const modal=$('#modal');if(modal&&!modal.classList.contains('hidden'))closeModal(false);
        startTimer();
      },1050);
    }else if(currentTeam!==1)cpuClear();
  }
  return r;
};

function cpuDeactivate(){
  cpuClear();cpuMode=false;window.cpuMode=false;cpuResolvedBuzz=false;
  const t2=document.querySelector('.teamTwo');if(t2)t2.classList.remove('cpuTeam');
}
const cpuNormalStart=$('#start');
if(cpuNormalStart){
  const oldNormal=cpuNormalStart.onclick;
  cpuNormalStart.onclick=()=>{cpuDeactivate();if(typeof spShowTeamSetup==='function')spShowTeamSetup();else if(typeof oldNormal==='function')oldNormal();};
}

function cpuSetup(){
  cpuDeactivate();
  if(typeof teamCharacters!=='undefined'){
    if(teamCharacters[0]===7)teamCharacters[1]=6;else teamCharacters[1]=7;
  }
  const defs=typeof SPECIALTY_DEFS!=='undefined'?SPECIALTY_DEFS:[];
  openModal(`<h2>🤖 PRACTICAR CONTRA LA COMPUTADORA</h2>
    <p>Juegas las mismas <b>8 rondas</b>, con careo, banco, strikes, robo, Gran Reto Clínico y logros académicos.</p>
    <p class="cpuFairNote">La computadora usa probabilidades de conocimiento y tiempos de reacción; <b>no acierta automáticamente</b>.</p>
    <label class="settingRow">Tu nombre <input id="cpuStudentName" maxlength="18" value="${v2Escape((teamNames[0]||'ESTUDIANTE').replace(/^EQUIPO 1$/,'ESTUDIANTE'))}"></label>
    <div><b>Tu personaje</b><div id="cpuStudentChars" class="characterGrid"></div></div>
    <h3>Nivel de la computadora</h3>
    <div class="cpuLevelGrid">${Object.entries(CPU_LEVELS).map(([id,x])=>`<button type="button" data-cpu-level="${id}" class="${cpuLevel===id?'selected':''}"><span>${x.icon}</span><b>${x.name}</b><small>${x.desc}</small></button>`).join('')}</div>
    <label class="settingRow">Especialidad<select id="cpuSpecialty">${defs.map(d=>`<option value="${v2Escape(d.id)}">${v2Escape(d.name)}</option>`).join('')}</select></label>
    <label class="settingRow">Dificultad<select id="cpuDifficulty"><option value="mix">🎲 Mezcla adaptativa</option><option value="basic">🌱 Básica</option><option value="intermediate">🦷 Intermedia</option><option value="advanced">🔥 Extra difícil</option></select></label>
    <button id="cpuStart" class="setupStart">COMENZAR PRÁCTICA 🤖</button>`);
  if(typeof setupCharacterCards==='function')setupCharacterCards(0,$('#cpuStudentChars'));
  $('#cpuSpecialty').value=typeof specialtySelected==='string'?specialtySelected:'general';
  $('#cpuDifficulty').value=typeof specialtyDifficulty==='string'?specialtyDifficulty:'mix';
  document.querySelectorAll('[data-cpu-level]').forEach(b=>b.onclick=()=>{
    cpuLevel=b.dataset.cpuLevel;
    document.querySelectorAll('[data-cpu-level]').forEach(x=>x.classList.toggle('selected',x===b));
  });
  $('#cpuStart').onclick=()=>{
    specialtySelected=$('#cpuSpecialty').value;
    specialtyDifficulty=$('#cpuDifficulty').value;
    const pool=typeof spFilteredBank==='function'?spFilteredBank(specialtySelected):questionPool;
    if(pool.length<GAME_SIZE){alert('Este filtro necesita al menos 8 preguntas.');return;}
    const student=($('#cpuStudentName').value||'ESTUDIANTE').trim().toUpperCase().slice(0,18)||'ESTUDIANTE';
    if(typeof teamCharacters!=='undefined'){
      if(teamCharacters[1]===teamCharacters[0])teamCharacters[1]=teamCharacters[0]===7?6:7;
      if(typeof saveCharacterSettings==='function')saveCharacterSettings();
    }
    teamNames=[student,cpuName()];
    cpuMode=true;window.cpuMode=true;
    try{localStorage.setItem(CPU_PREF_KEY,JSON.stringify({level:cpuLevel}));}catch(_){}
    try{localStorage.setItem(SPECIALTY_PREF_KEY,JSON.stringify({specialty:specialtySelected,difficulty:specialtyDifficulty}));}catch(_){}
    closeModal(false);
    if(typeof v2RoundHistory!=='undefined')v2RoundHistory=[];
    startNewGame();
  };
}

// CAREO: el estudiante compite contra el tiempo de reacción de la computadora.
const cpuBaseCareoAsk=typeof careoAsk==='function'?careoAsk:null;
if(cpuBaseCareoAsk)careoAsk=function(team,isSecond){
  if(cpuMode&&team===1)return cpuCareoRespond(isSecond);
  return cpuBaseCareoAsk(team,isSecond);
};

const cpuBaseCareoBuzzers=typeof careoShowBuzzers==='function'?careoShowBuzzers:null;
if(cpuBaseCareoBuzzers)careoShowBuzzers=function(){
  if(!cpuMode)return cpuBaseCareoBuzzers();
  const q=questions[roundIndex];if(!q)return;
  cpuClear();cpuResolvedBuzz=false;
  careoState={first:null,second:null,attempts:0,answerIdx:null};
  openModal(`<div class="careoBuzzScreen cpuCareo"><div class="careoKicker">⚡ CAREO CONTRA LA COMPUTADORA</div><h2>${v2Escape(q.q)}</h2><p>Presiona antes de que <b>${v2Escape(cpuName())}</b> reaccione.</p><div class="cpuBuzzRace"><button id="cpuStudentBuzz" class="careoBuzzer teamA"><span>${careoTeamLabel(0)}</span><b>¡PRESIONAR!</b></button><div class="cpuBrain"><span>🤖</span><b>${v2Escape(cpuCfg().name)}</b><small id="cpuBrainState">analizando…</small></div></div></div>`);
  const close=$('#closeModal');if(close)close.classList.add('careoNoClose');
  const win=team=>{
    if(cpuResolvedBuzz)return;cpuResolvedBuzz=true;cpuClear();
    careoState.first=team;careoState.second=1-team;
    const b=$('#cpuStudentBuzz');if(b)b.disabled=true;
    if(typeof tvSfx==='function')tvSfx('buzzerHit');
    if(team===0){if(b)b.classList.add('buzzWinner');setTimeout(()=>careoAsk(0,false),360);}
    else{
      const st=$('#cpuBrainState');if(st)st.textContent='¡respondió primero!';
      setTimeout(()=>careoAsk(1,false),360);
    }
  };
  $('#cpuStudentBuzz').addEventListener('pointerdown',()=>win(0),{once:true});
  cpuTimer=setTimeout(()=>win(1),cpuDelay(.72));
};

function cpuCareoRespond(isSecond){
  cpuClear();careoStopClock?.();
  const q=questions[roundIndex];
  openModal(`<div class="cpuAnswering"><span>🤖</span><h2>${v2Escape(cpuName())}</h2><p>${v2Escape(q.q)}</p><div class="cpuThinkingDots">Analizando<span>…</span></div></div>`);
  const close=$('#closeModal');if(close)close.classList.add('careoNoClose');
  cpuTimer=setTimeout(()=>{
    cpuTimer=null;
    const m=cpuAttempt(q,q.a.map((_,i)=>i).filter(i=>!revealed[i]));
    if(m){
      openModal('<div class="cpuAnswering"><span>🤖</span><h2>'+v2Escape(cpuName())+'</h2><p>Responde: <b>'+v2Escape(m.shortLabel||m.label)+'</b></p></div>');
      setTimeout(()=>careoCorrect(1,m),620);
    }else{
      openModal('<div class="cpuAnswering wrong"><span>🤖</span><h2>'+v2Escape(cpuName())+'</h2><p>No logra encontrar una respuesta válida.</p></div>');
      setTimeout(()=>careoFail(1,isSecond,'RESPUESTA INCORRECTA'),620);
    }
  },Math.max(650,cpuDelay(.28)));
}

// Desempate contra computadora.
const cpuBaseFaceoff=v2StartFaceoff;
v2StartFaceoff=function(sudden=false){
  if(cpuMode&&sudden)return cpuSuddenFaceoff();
  return cpuBaseFaceoff(sudden);
};
function cpuSuddenFaceoff(){
  cpuClear();stopTimer();phase='sudden';const q=questions[roundIndex];
  openModal('<h2>⚡ DESEMPATE CONTRA LA COMPUTADORA</h2><p><b>'+v2Escape(q.q)+'</b></p><div class="faceInput"><input id="cpuSuddenInput" placeholder="Tu respuesta…"><button id="cpuSuddenMic">🎙️</button></div><button id="cpuSuddenSubmit" class="setupStart">RESPONDER</button>');
  $('#cpuSuddenMic').onclick=()=>v2Speak('cpuSudden');
  $('#cpuSuddenSubmit').onclick=cpuResolveSudden;
  $('#cpuSuddenInput').addEventListener('keydown',e=>{if(e.key==='Enter')cpuResolveSudden();});
}
function cpuResolveSudden(){
  const q=questions[roundIndex],txt=($('#cpuSuddenInput')?.value||'').trim();if(!txt)return;
  const human=v2Match(txt,q),hOk=!!(human&&human.score>=.64),bot=cpuAttempt(q,q.a.map((_,i)=>i)),bOk=!!bot;
  let winner=null;
  if(hOk&&!bOk)winner=0;else if(!hOk&&bOk)winner=1;
  else if(hOk&&bOk&&Number(human.points)!==Number(bot.points))winner=Number(human.points)>Number(bot.points)?0:1;
  if(winner!=null){
    openModal('<h2>⚡ DESEMPATE RESUELTO</h2><p>Tu respuesta: <b>'+(hOk?v2Escape(v2ShortLabel(human.label)):'sin coincidencia')+'</b>.</p><p>'+v2Escape(cpuName())+': <b>'+(bOk?v2Escape(v2ShortLabel(bot.label)):'sin coincidencia')+'</b>.</p>');
    setTimeout(()=>{closeModal(false);v2DeclareWinner(winner,true);},950);return;
  }
  openModal('<h2>⚡ SIGUEN EMPATADOS</h2><p>Ambas respuestas tuvieron el mismo valor o ninguno acertó.</p><button id="cpuSuddenAgain" class="setupStart">INTENTAR OTRA RESPUESTA</button>');
  $('#cpuSuddenAgain').onclick=cpuSuddenFaceoff;
}

// Gran Reto Clínico: la computadora responde sola a su pregunta.
const cpuBaseChallengeQuestion=typeof edChallengeQuestion==='function'?edChallengeQuestion:null;
if(cpuBaseChallengeQuestion)edChallengeQuestion=function(){
  if(!cpuMode||!edChallenge||edChallenge.index!==1)return cpuBaseChallengeQuestion();
  const q=edChallenge.items[1];if(!q)return edFinishChallenge();
  if(typeof tvSfx==='function')tvSfx('drumroll');
  openModal('<h2>👑 RETO DE '+v2Escape(cpuName())+'</h2><p class="finalChallengeQ"><b>'+v2Escape(q.q)+'</b></p><div class="cpuAnswering"><span>🤖</span><div class="cpuThinkingDots">Analizando<span>…</span></div></div>');
  cpuTimer=setTimeout(()=>{
    cpuTimer=null;const m=cpuAttempt(q,q.a.map((_,i)=>i)),ok=!!m;
    if(ok){scores[1]+=50;updateScoreUI();if(typeof tvSfx==='function')tvSfx('fanfare');if(typeof edMicroCelebrate==='function')edMicroCelebrate(q);}else if(typeof tvSfx==='function')tvSfx('buzz');
    openModal('<h2>'+(ok?'🤖 +50 PUNTOS':'🤖 SIN BONUS')+'</h2><p>'+(ok?cpuName()+' respondió <b>'+v2Escape(v2ShortLabel(m.label))+'</b>.':cpuName()+' no encontró una respuesta válida.')+'</p><button id="cpuChallengeDone" class="setupStart">VER RESULTADO</button>');
    $('#cpuChallengeDone').onclick=()=>{closeModal(false);edChallenge.index++;edFinishChallenge();};
  },cpuDelay(.45));
};

// Los resultados contra CPU alimentan los logros persistentes.
if(typeof ED_ACHIEVEMENTS!=='undefined'){
  ED_ACHIEVEMENTS.push(
    {id:'cpuPractice5',icon:'🤖',name:'Práctica autónoma',desc:'Completa 5 partidas contra la computadora.',test:s=>(s.counts.cpuGames||0)>=5},
    {id:'cpuHighWin',icon:'🔥',name:'Superé al experto',desc:'Gana una partida contra nivel Alto o Excelente.',test:s=>(s.counts.cpuHighWins||0)>=1},
    {id:'cpuExcellentWin',icon:'👑',name:'Dominio contra IA',desc:'Gana una partida contra nivel Excelente.',test:s=>(s.counts.cpuExcellentWins||0)>=1}
  );
}
const cpuBaseDeclareWinner=typeof v2DeclareWinner==='function'?v2DeclareWinner:null;
if(cpuBaseDeclareWinner)v2DeclareWinner=function(winner,sudden=false){
  if(cpuMode&&typeof edAchStore==='function'){
    const s=edAchStore();s.counts.cpuGames=(s.counts.cpuGames||0)+1;
    if(winner===0&&(cpuLevel==='high'||cpuLevel==='excellent'))s.counts.cpuHighWins=(s.counts.cpuHighWins||0)+1;
    if(winner===0&&cpuLevel==='excellent')s.counts.cpuExcellentWins=(s.counts.cpuExcellentWins||0)+1;
    edSaveAch(s);
  }
  return cpuBaseDeclareWinner(winner,sudden);
};

const cpuSpeechBase=window.onSpeechResult;
window.onSpeechResult=function(text){
  if(cpuMode&&v2VoiceTarget==='cpuSudden'&&$('#cpuSuddenInput')){$('#cpuSuddenInput').value=String(text||'');cpuResolveSudden();return;}
  return typeof cpuSpeechBase==='function'?cpuSpeechBase(text):undefined;
};

document.addEventListener('visibilitychange',()=>{if(document.hidden)cpuClear();else if(cpuMode)setTimeout(cpuMaybeSchedule,120);});

(function cpuInit(){
  const h=$('.homeActions');
  if(h&&!$('#cpuPracticeBtn')){
    const b=document.createElement('button');b.id='cpuPracticeBtn';b.className='cpuPracticeBtn';b.textContent='🤖 PRACTICAR CONTRA LA COMPUTADORA';b.onclick=cpuSetup;
    const quick=$('#quickStreakBtn');h.insertBefore(b,quick||$('#help'));
  }
})();
