'use strict';

window.DentistasI18n = (() => {
  const STORAGE_KEY = 'dentistas-language';
  let lang = localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'es';

  const strings = {
    es: {
      language:'Idioma', spanish:'ES', english:'EN',
      playVs:'JUGAR VS · 2 EQUIPOS', howTo:'¿CÓMO SE JUEGA?',
      studyStart:'JUEGA Y APRUEBA',
      round:'RONDA', turn:'TURNO', steal:'ROBO', roundOver:'RONDA TERMINADA',
      time:'TIEMPO', bank:'BANCO', giveBank:'DAR BANCO', error:'✖ ERROR',
      failedSteal:'✖ FALLÓ ROBO', resetRound:'↻ RONDA',
      previousRound:'Ronda anterior', nextRound:'Ronda siguiente', menu:'Menú',
      errors:'Errores', backHome:'Volver a portada', narratorOn:'Narradora activada', narratorOff:'Narradora desactivada', points:'puntos', successfulSteal:'¡Robo exitoso!', failedStealTitle:'Robo fallido', timeUp:'Tiempo agotado', bankAwarded:'Banco asignado', wins:'gana', tie:'Empate', newGame:'Nueva partida aleatoria',
      studyTitle:'JUEGA Y APRUEBA',
      studySubtitle:'Banco de los 5 exámenes', studyMode:'MODO DE ESTUDIO',
      etymologyModule:'MÓDULO INDEPENDIENTE', etymologyTitle:'Nomenclatura y etimología médica/odontológica',
      etymologyDesc:'300 preguntas de prefijos, raíces, lexemas y sufijos aplicados a odontología, especialidades, células, histología, microbiología, patología y medicina.',
      etymology10:'⚡ RETO · 10', etymology40:'📝 SIMULACRO · 40', etymology100:'🔤 BANCO COMPLETO · 300',
      clinicalModule:'MÓDULO INDEPENDIENTE', clinicalTitle:'Realización del expediente clínico',
      clinicalDesc:'300 preguntas prácticas sobre identificación, interrogatorio, antecedentes, ASA, signos vitales, exploración oral, odontograma, índices, auxiliares diagnósticos, consentimiento informado y notas de evolución.',
      clinical10:'⚡ RETO · 10', clinical40:'📝 SIMULACRO · 40', clinical300:'📋 BANCO COMPLETO · 300',
      firstMidterm:'Primer parcial', items:'reactivos',
      intro:'Repasa por materia con preguntas tomadas de los cinco exámenes. Los reactivos de relación de columnas y nomenclatura se adaptaron a opción múltiple para poder jugar, conservando su respuesta correcta.',
      quick:'⚡ RETO RÁPIDO · 10 PREGUNTAS', mock:'📝 SIMULACRO · 40 PREGUNTAS',
      target:'Meta lúdica: 80% de aciertos. No sustituye la calificación oficial del curso.',
      loading:'Cargando banco…', fromFive:'reactivos de los 5 exámenes',
      question:'Reactivo', correctCount:'correctas', correct:'✓ Correcto.',
      incorrect:'✖ Incorrecto.', correctAnswer:'Respuesta correcta:',
      next:'SIGUIENTE ▶', result:'VER RESULTADO ▶', resultTitle:'Resultado del reto',
      passed:'✅ RETO SUPERADO', keepStudying:'📚 SIGUE REPASANDO',
      got:'Obtuviste', of:'de', correctResponses:'respuestas correctas en',
      reached:'Alcanzaste la meta lúdica de 80%.',
      notReached:'La meta lúdica de este modo es 80%. Puedes repetir el mismo tema con preguntas aleatorias.',
      disclaimer:'Este porcentaje es una herramienta de estudio y no equivale a una calificación oficial.',
      retry:'↻ REPETIR TEMA', choose:'☰ ELEGIR OTRA MATERIA', home:'⌂ VOLVER A PORTADA',
      originalLanguage:'Reactivo conservado en el idioma original del examen.',
      categories:{
        'Desarrollo craneofacial':'Desarrollo craneofacial',
        'Desarrollo de la oclusión':'Desarrollo de la oclusión',
        'Fisiología':'Fisiología','Toma de impresión':'Toma de impresión',
        'Psicología infantil':'Psicología infantil','Hábitos y parafunciones':'Hábitos y parafunciones',
        'Nomenclatura':'Nomenclatura','Nomenclatura y etimología médica':'Nomenclatura y etimología médica/odontológica','Realización del expediente clínico':'Realización del expediente clínico','Oclusión':'Oclusión','Otros del parcial':'Otros del parcial',
        'Todos los temas':'Todos los temas'
      },
      categoryDescs:{
        'Desarrollo craneofacial':'Crecimiento, modelado, remodelado, suturas y patrones de crecimiento.',
        'Desarrollo de la oclusión':'Dentición temporal y mixta, espacios, planos terminales y pérdida de espacio.',
        'Fisiología':'Masticación, deglución, fonación, lengua, bolo y control neuromuscular.',
        'Toma de impresión':'No hay reactivos de toma de impresión en los cinco exámenes adjuntos.',
        'Psicología infantil':'Edad mental/cognoscitiva, comunicación y conducta infantil.',
        'Hábitos y parafunciones':'Succión digital, respiración oral, bruxismo y alteraciones funcionales.',
        'Nomenclatura':'Prefijos, lexemas, sufijos y formación de términos odontológicos.',
        'Nomenclatura y etimología médica':'Prefijos, raíces, sufijos y formación de términos de odontología, células, microbiología, patología y medicina.',
        'Realización del expediente clínico':'Llenado, organización y documentación clínica del expediente odontológico.',
        'Oclusión':'Máxima intercuspidación, guías, función en grupo, interferencias y TTM.',
        'Otros del parcial':'Reactivos del expediente clínico que no encajan de forma limpia en otra materia.'
      }
    },
    en: {
      language:'Language', spanish:'ES', english:'EN',
      playVs:'PLAY VS · 2 TEAMS', howTo:'HOW TO PLAY',
      studyStart:'PLAY & PASS',
      round:'ROUND', turn:'TURN', steal:'STEAL', roundOver:'ROUND OVER',
      time:'TIME', bank:'BANK', giveBank:'AWARD BANK', error:'✖ ERROR',
      failedSteal:'✖ FAILED STEAL', resetRound:'↻ ROUND',
      previousRound:'Previous round', nextRound:'Next round', menu:'Menu',
      errors:'Errors', backHome:'Back to home', narratorOn:'Narrator on', narratorOff:'Narrator off', points:'points', successfulSteal:'Successful steal!', failedStealTitle:'Failed steal', timeUp:'Time is up', bankAwarded:'Bank awarded', wins:'wins', tie:'Tie', newGame:'New random game',
      studyTitle:'PLAY & PASS',
      studySubtitle:'Question bank from the 5 exams', studyMode:'STUDY MODE',
      etymologyModule:'INDEPENDENT MODULE', etymologyTitle:'Medical & dental nomenclature and etymology',
      etymologyDesc:'300 questions on prefixes, roots, lexemes, and suffixes used in dentistry, specialties, cells, histology, microbiology, pathology, and medicine.',
      etymology10:'⚡ CHALLENGE · 10', etymology40:'📝 MOCK · 40', etymology100:'🔤 FULL BANK · 300',
      clinicalModule:'INDEPENDENT MODULE', clinicalTitle:'Clinical record completion',
      clinicalDesc:'300 practical questions on identification, interview, medical history, ASA, vital signs, oral examination, odontogram, indices, diagnostic aids, informed consent, and progress notes.',
      clinical10:'⚡ CHALLENGE · 10', clinical40:'📝 MOCK · 40', clinical300:'📋 FULL BANK · 300',
      firstMidterm:'First midterm', items:'items',
      intro:'Review by subject using questions taken from the five exams. Matching-column and nomenclature items were adapted to multiple choice while preserving the correct answer.',
      quick:'⚡ QUICK CHALLENGE · 10 QUESTIONS', mock:'📝 MOCK EXAM · 40 QUESTIONS',
      target:'Study goal: 80% correct. This does not replace the official course grade.',
      loading:'Loading question bank…', fromFive:'items from the 5 exams',
      question:'Item', correctCount:'correct', correct:'✓ Correct.',
      incorrect:'✖ Incorrect.', correctAnswer:'Correct answer:',
      next:'NEXT ▶', result:'VIEW RESULT ▶', resultTitle:'Challenge result',
      passed:'✅ CHALLENGE PASSED', keepStudying:'📚 KEEP STUDYING',
      got:'You got', of:'of', correctResponses:'correct answers in',
      reached:'You reached the 80% study goal.',
      notReached:'The study goal for this mode is 80%. You can repeat the same subject with randomized questions.',
      disclaimer:'This percentage is a study tool and is not an official course grade.',
      retry:'↻ RETRY SUBJECT', choose:'☰ CHOOSE ANOTHER SUBJECT', home:'⌂ BACK TO HOME',
      originalLanguage:'Question wording is preserved in the original exam language.',
      categories:{
        'Desarrollo craneofacial':'Craniofacial Development',
        'Desarrollo de la oclusión':'Occlusal Development',
        'Fisiología':'Physiology','Toma de impresión':'Dental Impressions',
        'Psicología infantil':'Pediatric Psychology','Hábitos y parafunciones':'Habits and Parafunctions',
        'Nomenclatura':'Dental Nomenclature','Nomenclatura y etimología médica':'Medical & Dental Nomenclature/Etymology','Realización del expediente clínico':'Clinical Record Completion','Oclusión':'Occlusion','Otros del parcial':'Other Midterm Topics',
        'Todos los temas':'All Subjects'
      },
      categoryDescs:{
        'Desarrollo craneofacial':'Growth, modeling, remodeling, sutures, and growth patterns.',
        'Desarrollo de la oclusión':'Primary and mixed dentition, spacing, terminal planes, and space loss.',
        'Fisiología':'Mastication, swallowing, phonation, tongue, bolus, and neuromuscular control.',
        'Toma de impresión':'The five source exams contain no dental-impression items.',
        'Psicología infantil':'Mental/cognitive age, communication, and child behavior.',
        'Hábitos y parafunciones':'Thumb sucking, mouth breathing, bruxism, and functional alterations.',
        'Nomenclatura':'Prefixes, roots, suffixes, and formation of dental terms.',
        'Nomenclatura y etimología médica':'Prefixes, roots, suffixes, and word formation across dentistry, cells, microbiology, pathology, and medicine.',
        'Realización del expediente clínico':'Completion, organization, and clinical documentation of the dental record.',
        'Oclusión':'Maximum intercuspation, guidance, group function, interferences, and TMD.',
        'Otros del parcial':'Exam items that do not fit cleanly into another subject.'
      }
    }
  };

  function t(key) {
    return key.split('.').reduce((o,k)=>o && o[k], strings[lang]) ?? key;
  }

  function category(name) { return strings[lang].categories[name] || name; }
  function categoryDesc(name) { return strings[lang].categoryDescs[name] || ''; }

  function applyStatic() {
    document.documentElement.lang = lang;
    const set=(sel,text)=>{const el=document.querySelector(sel); if(el) el.textContent=text;};
    set('#start',t('playVs')); set('#help',t('howTo'));
    set('.timerBox>span',t('time')); set('.bank>span',t('bank'));
    document.querySelectorAll('.award').forEach(el=>el.textContent=t('giveBank'));
    set('#resetRound',t('resetRound'));
    const prev=document.querySelector('#prev'), next=document.querySelector('#next'), menu=document.querySelector('#menu'), strikes=document.querySelector('#strikes');
    if(prev) prev.setAttribute('aria-label',t('previousRound'));
    if(next) next.setAttribute('aria-label',t('nextRound'));
    if(menu) menu.setAttribute('aria-label',t('menu'));
    if(strikes) strikes.setAttribute('aria-label',t('errors'));
    document.querySelectorAll('[data-lang]').forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===lang));
    window.dispatchEvent(new CustomEvent('dentistas-language-changed',{detail:{lang}}));
  }

  function setLang(next) {
    lang = next === 'en' ? 'en' : 'es';
    localStorage.setItem(STORAGE_KEY,lang);
    applyStatic();
  }

  function getLang(){ return lang; }

  document.addEventListener('DOMContentLoaded',() => {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
    applyStatic();
  });
  return {t,category,categoryDesc,setLang,getLang,applyStatic};
})();
