'use strict';

// Ajustes de tablero y cierre de ronda.
const ROUND_POLISH_VERSION='3.0.3-spoken-missing-answers';

let rpReviewing=false;
let rpSkipReviewOnce=false;

function rpCurrentAnswers(){
  const q=Array.isArray(questions)?questions[roundIndex]:null;
  return q&&Array.isArray(q.a)?q.a:[];
}

function rpSyncAnswerCount(){
  const box=$('#answers');
  if(!box)return;
  box.dataset.count=String(rpCurrentAnswers().length||0);
}

const rpBaseShowRound=showRound;
showRound=function(reset=true){
  rpBaseShowRound(reset);
  rpSyncAnswerCount();
};

function rpMissingIndices(){
  const answers=rpCurrentAnswers();
  const out=[];
  for(let i=0;i<answers.length;i++){
    if(!revealed[i])out.push(i);
  }
  return out;
}

function rpRemovePrompt(){
  const old=$('#roundReviewPrompt');
  if(old)old.remove();
}

function rpRevealMissingBeforeAdvance(){
  if(rpReviewing)return true;
  const missing=rpMissingIndices();
  if(!missing.length)return false;

  const answers=rpCurrentAnswers();
  const labels=missing.map(idx=>String(answers[idx]?.[0]||'').trim()).filter(Boolean);
  const speech=labels.length===1
    ? 'La respuesta faltante es: '+labels[0]+'.'
    : 'Las respuestas faltantes son: '+labels.map((label,i)=>(i+1)+', '+label).join('. ')+'.';

  rpReviewing=true;
  stopTimer();
  if(typeof careoStopClock==='function')careoStopClock();
  try{if(window.Android&&Android.closeRemoteBuzz)Android.closeRemoteBuzz();}catch(_){}

  const close=$('#closeModal');
  if(close)close.classList.remove('careoNoClose');
  closeModal(false);

  phase='over';
  updateTurnUI();

  rpRemovePrompt();
  const prompt=document.createElement('div');
  prompt.id='roundReviewPrompt';
  prompt.className='roundReviewPrompt';
  prompt.innerHTML=
    '<div><b>📋 RESPUESTAS FALTANTES</b><span id="roundReviewStatus">🔊 Escucha las respuestas que faltaron…</span></div>'+
    '<button id="roundReviewContinue" disabled>'+(roundIndex>=questions.length-1?'VER RESULTADO FINAL ▶':'SIGUIENTE RONDA ▶')+'</button>';
  document.body.appendChild(prompt);

  if(typeof tvSfx==='function')tvSfx('review');
  else if(typeof tvTone==='function'){
    tvTone(330,0,.13,.04,'triangle');
    tvTone(494,.22,.15,.045,'triangle');
    tvTone(659,.46,.28,.05,'triangle');
  }

  const box=$('#answers');
  let visualDone=false;
  let speechDone=false;

  const maybeEnable=()=>{
    if(!visualDone||!speechDone)return;
    const status=$('#roundReviewStatus');
    if(status)status.textContent='✓ Ya puedes pasar a la siguiente ronda.';
    const b=$('#roundReviewContinue');
    if(b)b.disabled=false;
  };

  missing.forEach((idx,pos)=>{
    const btn=box&&box.children[idx];
    setTimeout(()=>{
      revealed[idx]=true;
      if(btn){
        btn.classList.remove('covered');
        btn.classList.add('revealed','missedAnswer');
        btn.setAttribute('aria-label','Respuesta no encontrada: '+answers[idx][0]);
      }
      if(typeof orSync==='function')orSync();
      if(pos===missing.length-1){
        setTimeout(()=>{visualDone=true;maybeEnable();},160);
      }
    },240+pos*320);
  });

  const visualFallback=240+Math.max(0,missing.length-1)*320+420;
  setTimeout(()=>{visualDone=true;maybeEnable();},visualFallback);

  setTimeout(()=>{
    if(typeof narratorReadAnnouncement==='function'){
      narratorReadAnnouncement(
        speech,
        ()=>{speechDone=true;maybeEnable();},
        '🔊 RESPUESTAS FALTANTES…'
      );
    }else if(typeof narratorRead==='function'){
      narratorRead(
        speech,
        ()=>{speechDone=true;maybeEnable();},
        '🔊 RESPUESTAS FALTANTES…'
      );
    }else{
      speechDone=true;
      maybeEnable();
    }
  },820);

  $('#roundReviewContinue').onclick=()=>{
    const b=$('#roundReviewContinue');
    if(b&&b.disabled)return;
    rpRemovePrompt();
    rpReviewing=false;
    rpSkipReviewOnce=true;
    nextRound();
  };
  return true;
}

const rpBaseNextRound=nextRound;
nextRound=function(){
  if(rpSkipReviewOnce){
    rpSkipReviewOnce=false;
    return rpBaseNextRound();
  }
  if(phase==='over'&&rpRevealMissingBeforeAdvance())return;
  return rpBaseNextRound();
};

const rpBaseResetRound=resetRound;
resetRound=function(){
  rpRemovePrompt();
  rpReviewing=false;
  rpSkipReviewOnce=false;
  rpBaseResetRound();
};

const rpBaseStartNewGame=startNewGame;
startNewGame=function(){
  rpRemovePrompt();
  rpReviewing=false;
  rpSkipReviewOnce=false;
  rpBaseStartNewGame();
};

rpSyncAnswerCount();
