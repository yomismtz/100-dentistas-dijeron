(function(){
  const style=document.createElement('style');
  style.textContent=`
    .voiceRecognized{margin:.45rem auto 0;padding:.6rem .75rem;border:1px solid #62c8d2;border-radius:14px;background:linear-gradient(180deg,#123842,#0a222a);box-shadow:inset 0 1px #ffffff12,0 8px 18px #0005;text-align:center;animation:voiceCardIn .22s ease-out both}
    .voiceRecognized.show{display:block!important}
    .voiceRecognized::before{content:'ENTENDÍ';display:block;margin-bottom:.2rem;color:#9feaf1;font-size:.7em;font-weight:900;letter-spacing:.12em}
    #voiceRecognizedText{display:block;font-size:clamp(16px,2vw,25px);font-weight:900;color:#fff}
    .voiceConfirmActions{display:flex;justify-content:center;gap:.5rem;margin-top:.5rem}
    .voiceConfirmActions button{min-height:40px;padding:.45rem .8rem;border:1px solid #5c9da7;border-radius:10px;background:#12343d;font-weight:900}
    #voiceConfirm{border-color:#68c98b;background:#174b2b}
    #voiceRepeat{border-color:#d0a754;background:#3b2b0d}
    #answerMic.listening{background:linear-gradient(180deg,#159fb3,#086275)!important;border-color:#a8f5fc!important;box-shadow:0 0 24px #0dd9ef66!important;animation:voiceListening .8s ease-in-out infinite alternate}
    @keyframes voiceListening{from{transform:scale(1)}to{transform:scale(1.035)}}
    @keyframes voiceCardIn{from{opacity:0;transform:translateY(5px) scale(.97)}to{opacity:1;transform:none}}
    @media(prefers-reduced-motion:reduce){.voiceRecognized,#answerMic.listening{animation:none!important}}
  `;
  document.head.appendChild(style);
  let pendingText='';
  let listening=false;
  const mic=()=>document.querySelector('#answerMic');
  const card=()=>document.querySelector('#voiceRecognized');
  const textEl=()=>document.querySelector('#voiceRecognizedText');

  function setListening(on){
    listening=Boolean(on);
    const b=mic();
    if(b){
      b.classList.toggle('listening',listening);
      b.textContent=listening?'🎙️ ESCUCHANDO…':'🎤 RESPONDER';
    }
  }
  function hideCard(){card()?.classList.add('hidden');pendingText='';}
  function showCard(text){
    pendingText=String(text||'').trim();
    if(!pendingText){hideCard();return;}
    const el=card(), out=textEl();
    if(out)out.textContent='“'+pendingText+'”';
    if(el){el.classList.remove('hidden');el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}
  }

  const oldStart=window.startVoiceAnswer;
  window.startVoiceAnswer=function(){
    if(window.gamePaused||window.turnResolving||window.phase==='over')return;
    hideCard();
    setListening(true);
    if(typeof oldStart==='function')oldStart();
  };

  const oldSubmit=window.submitVoiceAnswer;
  window.submitVoiceAnswer=function(text){
    setListening(false);
    const raw=String(text||'').trim();
    if(!raw){
      hideCard();
      if(typeof setAnswerFeedback==='function')setAnswerFeedback('No se entendió la respuesta. Pulsa el micrófono y repite, sin penalización.','hint');
      return;
    }
    showCard(raw);
    if(typeof setAnswerFeedback==='function')setAnswerFeedback('Revisa lo que entendí y confirma o repite.','hint');
  };

  const native=window.DentistasVoice||{};
  const oldNative=native.nativeResult;
  native.nativeResult=function(text,ok){
    setListening(false);
    if(typeof oldNative==='function'){
      // Intercept only normal-round results; final-round handler remains handled by the original bridge.
      if(typeof window.__finalVoiceHandler==='function'){oldNative(String(text||''),Boolean(ok));return;}
    }
    if(!ok){
      hideCard();
      if(typeof setAnswerFeedback==='function')setAnswerFeedback('No se entendió la respuesta. Pulsa “REPETIR”. No se penaliza.','hint');
      return;
    }
    window.submitVoiceAnswer(String(text||''));
  };
  window.DentistasVoice=native;

  document.addEventListener('click',e=>{
    if(e.target.closest('#voiceRepeat')){hideCard();setListening(false);window.startVoiceAnswer?.();return;}
    if(e.target.closest('#voiceConfirm')){
      const raw=pendingText;
      hideCard();
      if(raw)oldSubmit?oldSubmit(raw):window.submitVoiceAnswer(raw);
    }
  });
})();