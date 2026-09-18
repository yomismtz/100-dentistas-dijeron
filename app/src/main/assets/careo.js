'use strict';

// Careo de pulsadores · v2.5
const CAREO_VERSION = '2.5-buzzer-faceoff-beta';
const careoLegacyFaceoff = v2StartFaceoff;
const careoOriginalSpeechResult = window.onSpeechResult;
const careoOriginalShowRound = showRound;

let careoState = null;
let careoTimerHandle = null;
let careoIntroStopHandle = null;

function careoStopClock(){
  if(careoTimerHandle){ clearInterval(careoTimerHandle); careoTimerHandle=null; }
}

function careoLockBoard(locked=true){
  const game=$('#game');
  if(game) game.classList.toggle('careoLocked', !!locked);
}

function careoPlayLongIntro(){
  const s=$('#sndStart');
  if(!s || (typeof v2Sound!=='undefined' && !v2Sound)) return;
  try{
    clearTimeout(careoIntroStopHandle);
    s.pause();
    s.currentTime=0;
    s.loop=true;
    s.volume=.72;
    const p=s.play();
    if(p&&p.catch)p.catch(()=>{});
    careoIntroStopHandle=setTimeout(()=>careoStopIntro(true),9000);
  }catch(_){}
}

function careoStopIntro(fade=false){
  clearTimeout(careoIntroStopHandle);
  const s=$('#sndStart'); if(!s)return;
  if(!fade){try{s.loop=false;s.pause();s.currentTime=0;}catch(_){} return;}
  let vol=Number(s.volume)||.72;
  const id=setInterval(()=>{
    vol=Math.max(0,vol-.12);
    try{s.volume=vol;}catch(_){}
    if(vol<=0){
      clearInterval(id);
      try{s.loop=false;s.pause();s.currentTime=0;s.volume=.72;}catch(_){}
    }
  },70);
}

function careoTeamLabel(team){
  const c=typeof characterFor==='function'?characterFor(team):null;
  return `${c?.icon||''} ${v2Escape(teamNames[team])}`;
}

function careoQuestionScreen(){
  const q=questions[roundIndex];
  if(!q)return;
  stopTimer(); careoStopClock(); careoLockBoard(true);
  phase='faceoff';
  if(typeof tvShowCue==='function') tvShowCue(`RONDA ${roundIndex+1}`,'🎤 CAREO','round',950);
  openModal(`
    <div class="careoQuestionScreen">
      <div class="careoKicker">🎤 CAREO · RONDA ${roundIndex+1}</div>
      <h2>${v2Escape(q.q)}</h2>
      <p>Lean la pregunta. Cuando estén listos aparecerán los dos pulsadores.</p>
      <button id="careoReady" class="setupStart">⚡ LISTOS · MOSTRAR PULSADORES</button>
    </div>`);
  const close=$('#closeModal'); if(close)close.classList.add('careoNoClose');
  $('#careoReady').onclick=careoShowBuzzers;
}

function careoShowBuzzers(){
  const q=questions[roundIndex];
  if(!q)return;
  careoState={first:null,second:null,attempts:0,answerIdx:null};
  openModal(`
    <div class="careoBuzzScreen">
      <div class="careoKicker">⚡ ¿QUIÉN CONTESTA PRIMERO?</div>
      <h2>${v2Escape(q.q)}</h2>
      <p>El primer botón que se presione bloquea al otro equipo.</p>
      <div class="careoBuzzers">
        <button id="careoBuzz1" class="careoBuzzer teamA"><span>${careoTeamLabel(0)}</span><b>¡PRESIONAR!</b></button>
        <button id="careoBuzz2" class="careoBuzzer teamB"><span>${careoTeamLabel(1)}</span><b>¡PRESIONAR!</b></button>
      </div>
    </div>`);
  const close=$('#closeModal'); if(close)close.classList.add('careoNoClose');
  const buzz=(team)=>{
    if(!careoState || careoState.first!==null)return;
    careoState.first=team;careoState.second=1-team;
    const a=$('#careoBuzz1'),b=$('#careoBuzz2');
    [a,b].forEach(x=>{if(x)x.disabled=true;});
    const winner=team===0?a:b;
    if(winner)winner.classList.add('buzzWinner');
    if(typeof tvSfx==='function')tvSfx('correct');
    if(typeof tvVibrate==='function')tvVibrate(45);
    setTimeout(()=>careoAsk(team,false),360);
  };
  $('#careoBuzz1').addEventListener('pointerdown',()=>buzz(0),{once:true});
  $('#careoBuzz2').addEventListener('pointerdown',()=>buzz(1),{once:true});
}

function careoStartAnswerClock(team,isSecond){
  careoStopClock();
  let remaining=10;
  const el=$('#careoSeconds');
  if(el)el.textContent=String(remaining);
  careoTimerHandle=setInterval(()=>{
    remaining-=1;
    if(el){el.textContent=String(Math.max(0,remaining));el.classList.toggle('urgent',remaining<=3);}
    if(remaining<=3&&remaining>0&&typeof tvSfx==='function')tvSfx('tick');
    if(remaining<=0){
      careoStopClock();
      careoFail(team,isSecond,'TIEMPO AGOTADO');
    }
  },1000);
}

function careoAsk(team,isSecond){
  careoState.attempts=isSecond?2:1;
  v2VoiceTarget='careo';
  const q=questions[roundIndex];
  openModal(`
    <div class="careoAnswerScreen">
      <div class="careoKicker">${isSecond?'↪ SEGUNDA OPORTUNIDAD':'⚡ GANÓ EL PULSADOR'}</div>
      <h2>${careoTeamLabel(team)}</h2>
      <p class="careoQuestionSmall">${v2Escape(q.q)}</p>
      <div class="careoClock"><span>TIEMPO</span><b id="careoSeconds">10</b><small>s</small></div>
      <div class="careoAnswerEntry">
        <input id="careoInput" autocomplete="off" placeholder="Respuesta del equipo">
        <button id="careoMic">🎙️</button>
      </div>
      <button id="careoSubmit" class="setupStart">COMPROBAR RESPUESTA</button>
    </div>`);
  const close=$('#closeModal'); if(close)close.classList.add('careoNoClose');
  $('#careoMic').onclick=()=>v2Speak('careo');
  $('#careoSubmit').onclick=()=>careoCheck(team,isSecond);
  $('#careoInput').addEventListener('keydown',e=>{if(e.key==='Enter')careoCheck(team,isSecond);});
  careoStartAnswerClock(team,isSecond);
}

function careoCheck(team,isSecond){
  const input=$('#careoInput');
  const text=(input?.value||'').trim();
  if(!text)return;
  careoStopClock();
  const m=v2Match(text,questions[roundIndex]);
  if(m&&m.score>=.84) return careoCorrect(team,m);
  if(m&&m.score>=.64){
    openModal(`<h2>🎓 DECISIÓN DEL DOCENTE</h2>
      <p>Se respondió: <b>${v2Escape(text)}</b></p>
      <p>¿Aceptar como <b>${v2Escape(m.label)}</b>?</p>
      <div class="menuStack"><button id="careoAccept">✅ ACEPTAR</button><button id="careoReject">❌ NO ES CORRECTA</button></div>`);
    const close=$('#closeModal'); if(close)close.classList.add('careoNoClose');
    $('#careoAccept').onclick=()=>careoCorrect(team,m);
    $('#careoReject').onclick=()=>careoFail(team,isSecond,'RESPUESTA INCORRECTA');
    return;
  }
  careoFail(team,isSecond,'RESPUESTA INCORRECTA');
}

function careoFail(team,isSecond,reason){
  careoStopClock();
  if(typeof tvSfx==='function')tvSfx('buzz');
  if(typeof tvVibrate==='function')tvVibrate([70,35,70]);
  if(typeof v2React==='function')v2React(team,'bad');

  if(!isSecond){
    const other=1-team;
    openModal(`<div class="careoFailScreen"><div class="careoBigX">✖</div><h2>${v2Escape(reason)}</h2><p>Ahora responde <b>${careoTeamLabel(other)}</b>.</p></div>`);
    const close=$('#closeModal'); if(close)close.classList.add('careoNoClose');
    setTimeout(()=>careoAsk(other,true),850);
    return;
  }

  bank=0;updateBankUI();strikes=0;updateStrikesUI();phase='over';
  openModal(`<div class="careoFailScreen"><div class="careoBigX">✖ ✖</div><h2>NINGÚN EQUIPO ACERTÓ</h2><p>La ronda termina sin puntos y se pasa a la siguiente.</p><button id="careoNextNow" class="setupStart">SIGUIENTE RONDA ▶</button></div>`);
  const close=$('#closeModal'); if(close)close.classList.add('careoNoClose');
  let advanced=false;
  const go=()=>{if(advanced)return;advanced=true;careoStopClock();closeModal(false);careoLockBoard(true);nextRound();};
  $('#careoNextNow').onclick=go;
  setTimeout(go,1800);
}

function careoCorrect(team,m){
  careoStopClock();
  currentTeam=team;phase='play';strikes=0;updateStrikesUI();
  closeModal(false);careoLockBoard(false);updateTurnUI();
  const close=$('#closeModal'); if(close)close.classList.remove('careoNoClose');
  if(typeof tvSfx==='function'){tvSfx(m.idx===0?'topAnswer':'correct');tvSfx('applause');}
  if(typeof tvVibrate==='function')tvVibrate(35);
  if(typeof v2Host==='function')v2Host(`${teamNames[team]} gana el careo y toma el tablero.`,'good');
  const btn=$('#answers')?.children[m.idx];
  if(btn && !revealed[m.idx]) revealAnswer(m.idx,btn);
  else startTimer();
}

v2StartFaceoff=function(sudden=false){
  if(sudden) return careoLegacyFaceoff(true);
  if(phase==='over')return;
  careoQuestionScreen();
};

showRound=function(reset=true){
  careoOriginalShowRound(reset);
  if(reset){
    stopTimer();
    phase='faceoff';
    careoLockBoard(true);
  }
};

window.onSpeechResult=function(text){
  if(v2VoiceTarget==='careo'&&$('#careoInput')){
    $('#careoInput').value=String(text||'');
    return;
  }
  return careoOriginalSpeechResult(text);
};

document.addEventListener('visibilitychange',()=>{if(document.hidden)careoStopClock();});

const careoStart=$('#start');
if(careoStart)careoStart.addEventListener('pointerdown',()=>careoStopIntro(true),{capture:true});

setTimeout(careoPlayLongIntro,220);
