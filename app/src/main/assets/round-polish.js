'use strict';

// Ajustes de tablero y cierre de ronda.
const ROUND_POLISH_VERSION='3.0.8-synced-spoken-missing-answers';

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
  // Se conserva esta formulación para accesibilidad y validación, pero cada
  // respuesta se locuta por separado para sincronizar voz + recuadro:
  // "La respuesta faltante es:" / "Las respuestas faltantes son:"
  const speechLead=labels.length===1
    ? 'La respuesta faltante es:'
    : 'Las respuestas faltantes son:';

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

  const revealOne=(idx,pos)=>{
    const btn=box&&box.children[idx];
    revealed[idx]=true;
    if(btn){
      btn.classList.remove('covered');
      // Reinicia la animación por si la clase ya estuvo presente en una restauración.
      btn.classList.remove('revealed','missedAnswer','spokenReveal');
      void btn.offsetWidth;
      btn.classList.add('revealed','missedAnswer','spokenReveal');
      btn.setAttribute('aria-label','Respuesta no encontrada: '+answers[idx][0]);
    }
    const status=$('#roundReviewStatus');
    if(status)status.textContent='🔊 '+(pos+1)+' de '+missing.length+': '+String(answers[idx]?.[0]||'');
    if(typeof orSync==='function')orSync();
  };

  const speakOne=(pos)=>{
    if(pos>=missing.length){
      visualDone=true;
      speechDone=true;
      maybeEnable();
      return;
    }

    const idx=missing[pos];
    const label=String(answers[idx]?.[0]||'').trim();
    revealOne(idx,pos);

    // El recuadro aparece justo cuando empieza a decirse esa respuesta.
    const spokenLine=(missing.length===1 ? speechLead+' ' : (pos+1)+'. ')+label+'.';
    const next=()=>{
      // Da un instante para que la respuesta recién revelada permanezca visible
      // antes de comenzar la siguiente.
      setTimeout(()=>speakOne(pos+1), narratorEnabled===false ? 520 : 220);
    };

    if(typeof narratorReadAnnouncement==='function'){
      narratorReadAnnouncement(spokenLine,next,'🔊 RESPUESTAS FALTANTES…');
    }else if(typeof narratorRead==='function'){
      narratorRead(spokenLine,next,'🔊 RESPUESTAS FALTANTES…');
    }else{
      setTimeout(next,700);
    }
  };

  // Primero anuncia que vienen las respuestas; después las revela y pronuncia una por una.
  setTimeout(()=>{
    const startSequence=()=>speakOne(0);
    if(missing.length>1){
      if(typeof narratorReadAnnouncement==='function'){
        narratorReadAnnouncement(speechLead,startSequence,'🔊 RESPUESTAS FALTANTES…');
      }else if(typeof narratorRead==='function'){
        narratorRead(speechLead,startSequence,'🔊 RESPUESTAS FALTANTES…');
      }else{
        startSequence();
      }
    }else{
      startSequence();
    }
  },620);

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
