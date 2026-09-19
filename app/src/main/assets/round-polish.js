'use strict';

// Ajustes de tablero y cierre de ronda.
const ROUND_POLISH_VERSION='2.8-round-review';

let rpReviewing=false;

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

  rpReviewing=true;
  stopTimer();
  if(typeof careoStopClock==='function')careoStopClock();
  try{if(window.Android&&Android.closeRemoteBuzz)Android.closeRemoteBuzz();}catch(_){}

  const close=$('#closeModal');
  if(close)close.classList.remove('careoNoClose');
  closeModal(false);

  phase='over';
  updateTurnUI();

  const box=$('#answers');
  missing.forEach((idx,pos)=>{
    const btn=box&&box.children[idx];
    setTimeout(()=>{
      revealed[idx]=true;
      if(btn){
        btn.classList.remove('covered');
        btn.classList.add('revealed','missedAnswer');
        btn.setAttribute('aria-label','Respuesta no encontrada: '+rpCurrentAnswers()[idx][0]);
      }
      if(typeof tvTone==='function')tvTone(410+pos*55,0,.12,.018,'sine');
      if(typeof orSync==='function')orSync();
    },pos*180);
  });

  rpRemovePrompt();
  const prompt=document.createElement('div');
  prompt.id='roundReviewPrompt';
  prompt.className='roundReviewPrompt';
  prompt.innerHTML=
    '<div><b>📋 RESPUESTAS QUE FALTARON</b><span>Se muestran '+missing.length+' respuesta'+(missing.length===1?'':'s')+' sin sumar puntos.</span></div>'+
    '<button id="roundReviewContinue" disabled>'+(roundIndex>=questions.length-1?'VER RESULTADO FINAL ▶':'SIGUIENTE RONDA ▶')+'</button>';
  document.body.appendChild(prompt);

  if(typeof offlinePresenterCue==='function'){
    setTimeout(()=>offlinePresenterCue('review'),250);
  }

  const delay=Math.max(650,missing.length*180+220);
  setTimeout(()=>{
    const b=$('#roundReviewContinue');
    if(b)b.disabled=false;
  },delay);

  $('#roundReviewContinue').onclick=()=>{
    const b=$('#roundReviewContinue');
    if(b&&b.disabled)return;
    rpRemovePrompt();
    rpReviewing=false;
    rpBaseNextRound();
  };
  return true;
}

const rpBaseNextRound=nextRound;
nextRound=function(){
  if(phase==='over'&&rpRevealMissingBeforeAdvance())return;
  rpBaseNextRound();
};

const rpBaseResetRound=resetRound;
resetRound=function(){
  rpRemovePrompt();
  rpReviewing=false;
  rpBaseResetRound();
};

const rpBaseStartNewGame=startNewGame;
startNewGame=function(){
  rpRemovePrompt();
  rpReviewing=false;
  rpBaseStartNewGame();
};

rpSyncAnswerCount();
