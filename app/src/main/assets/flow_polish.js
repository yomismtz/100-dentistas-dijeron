/* ===== FLUJO DE PARTIDA · PULIDO v1 =====
 * Microinteracciones visuales para que pregunta → careo → respuesta → ronda
 * se sienta continuo sin alterar las reglas ni el temporizador.
 */
'use strict';

(function installFlowPolish(){
  const style = document.createElement('style');
  style.id = 'flowPolishStyle';
  style.textContent = `
    /* Entrada suave de cada estado principal */
    #question{
      animation: flowQuestionIn .24s cubic-bezier(.2,.8,.25,1) both;
    }
    @keyframes flowQuestionIn{
      from{opacity:.35;transform:translateY(6px);filter:blur(2px)}
      to{opacity:1;transform:none;filter:none}
    }

    #answers .answer.flowAnswerIn{
      animation: flowAnswerIn .28s cubic-bezier(.2,.8,.25,1.12) both;
    }
    @keyframes flowAnswerIn{
      from{opacity:.15;transform:translateY(9px) scale(.985);filter:brightness(1.45)}
      to{opacity:1;transform:none;filter:none}
    }

    #answers .answer.flowAnswerReveal{
      animation: flowAnswerReveal .38s cubic-bezier(.16,.84,.25,1.16) both;
      border-color:#6fe8ef!important;
      box-shadow:0 0 0 1px #8cf6fb33,0 0 30px #16c7d52e!important;
    }
    @keyframes flowAnswerReveal{
      0%{opacity:.72;transform:scale(.965);filter:brightness(1.9)}
      45%{transform:scale(1.025);filter:brightness(1.35)}
      100%{opacity:1;transform:scale(1);filter:brightness(1)}
    }

    #answerFeedback.flowFeedbackIn{
      animation: flowFeedbackIn .24s ease-out both;
    }
    #answerFeedback.correct.flowFeedbackIn{
      text-shadow:0 0 14px #55d88799;
    }
    #answerFeedback.wrong.flowFeedbackIn{
      text-shadow:0 0 14px #ff5f6299;
    }
    @keyframes flowFeedbackIn{
      from{opacity:0;transform:translateY(5px) scale(.97)}
      to{opacity:1;transform:none}
    }

    #faceoff.flowFaceoffIn{
      animation: flowFaceoffIn .24s cubic-bezier(.2,.8,.25,1) both;
    }
    @keyframes flowFaceoffIn{
      from{opacity:0;transform:scale(.985);filter:brightness(.8)}
      to{opacity:1;transform:scale(1);filter:none}
    }

    #roundTransition .roundTransitionCard{
      animation: flowRoundCard .30s cubic-bezier(.18,.86,.24,1.18) both!important;
    }
    @keyframes flowRoundCard{
      from{opacity:0;transform:scale(.84) translateY(10px)}
      to{opacity:1;transform:scale(1) translateY(0)}
    }

    .team.flowTeamWin{
      animation: flowTeamWin .52s ease-out both;
    }
    @keyframes flowTeamWin{
      0%{transform:scale(1)}
      45%{transform:scale(1.035);box-shadow:0 0 34px #f6cb6966}
      100%{transform:scale(1)}
    }

    @media(prefers-reduced-motion:reduce){
      #question,#answers .answer,#answerFeedback,#faceoff,#roundTransition .roundTransitionCard,.team{
        animation:none!important;
      }
    }
  `;
  document.head.appendChild(style);

  const mark = (el, cls, delay=0) => {
    if(!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    if(delay) setTimeout(()=>el.classList.add(cls),delay);
    else el.classList.add(cls);
  };

  const answers = document.querySelector('#answers');
  if(answers){
    const observer = new MutationObserver(() => {
      const buttons = answers.querySelectorAll('.answer');
      buttons.forEach((btn,i)=>{
        if(!btn.dataset.flowReady){
          btn.dataset.flowReady='1';
          btn.style.animationDelay = Math.min(i*22,110)+'ms';
          mark(btn,'flowAnswerIn');
        }
        if(btn.classList.contains('revealed') && !btn.dataset.flowReveal){
          btn.dataset.flowReveal='1';
          mark(btn,'flowAnswerReveal');
        }
      });
    });
    observer.observe(answers,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  const faceoff = document.querySelector('#faceoff');
  if(faceoff){
    const observer = new MutationObserver(()=>{
      if(!faceoff.classList.contains('hidden')) mark(faceoff,'flowFaceoffIn');
    });
    observer.observe(faceoff,{attributes:true,attributeFilter:['class']});
  }

  const question = document.querySelector('#question');
  if(question){
    const observer = new MutationObserver(()=>mark(question,'flowQuestionIn'));
    observer.observe(question,{childList:true,characterData:true,subtree:true});
  }

  const feedback = document.querySelector('#answerFeedback');
  if(feedback){
    const observer = new MutationObserver(()=>mark(feedback,'flowFeedbackIn'));
    observer.observe(feedback,{childList:true,characterData:true,subtree:true});
  }

  const bodyObserver = new MutationObserver(()=>{
    const award = document.querySelector('.roundPointsAward.show');
    if(award){
      const teamText = award.querySelector('span')?.textContent || '';
      document.querySelectorAll('.team').forEach(team=>{
        const name = team.querySelector('.teamName')?.textContent || '';
        if(name && teamText.includes(name)) mark(team,'flowTeamWin');
      });
    }
  });
  bodyObserver.observe(document.body,{childList:true,subtree:true});

  window.DentistasFlowPolish = {version:1};
})();
