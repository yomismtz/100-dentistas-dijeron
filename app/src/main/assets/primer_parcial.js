'use strict';

(() => {
  const DATA_FILES = ['primer_parcial_01.json','primer_parcial_02.json','primer_parcial_03.json','primer_parcial_04.json','primer_parcial_05.json','primer_parcial_06.json','primer_parcial_07.json','primer_parcial_08.json','primer_parcial_09.json','primer_parcial_10.json'];
  const ETYMOLOGY_FILE = 'nomenclatura_etimologia_300.json';
  const CLINICAL_RECORD_FILE = 'expediente_clinico_300.json';
  const ORTHO_LAB_FILE = 'laboratorio_ortodoncia_ortopedia_300.json';
  const QUICK_LENGTH = 10;
  const MOCK_LENGTH = 40;
  const PASS_TARGET = 80;
  const I18N = window.DentistasI18n;
  const tx = (key) => I18N ? I18N.t(key) : key;
  const catLabel = (name) => I18N ? I18N.category(name) : name;
  const catDesc = (name) => I18N ? I18N.categoryDesc(name) : (CATEGORY_META[name]?.[1] || '');
  const narrateStudy = (text, opts={}) => window.DentistasNarrator?.speak?.(text, opts);
  const studyQText = q => I18N?.getLang?.() === 'en' && q?.q_en ? q.q_en : q?.q || '';
  const studyContextText = q => I18N?.getLang?.() === 'en' && q?.context_en ? q.context_en : q?.context || '';
  const studyOptions = q => I18N?.getLang?.() === 'en' && Array.isArray(q?.options_en) && q.options_en.length === q.options.length ? q.options_en : q.options;
  const studyVoiceLang = q => I18N?.getLang?.() === 'en' && q?.q_en ? 'en-US' : 'es-MX';

  const CATEGORY_ORDER = [
    'Desarrollo craneofacial',
    'Desarrollo de la oclusión',
    'Fisiología',
    'Toma de impresión',
    'Psicología infantil',
    'Hábitos y parafunciones',
    'Nomenclatura',
    'Oclusión',
    'Otros del parcial'
  ];

  const CATEGORY_META = {
    'Desarrollo craneofacial': ['🦴', 'Crecimiento, modelado, remodelado, suturas y patrones de crecimiento.'],
    'Desarrollo de la oclusión': ['🦷', 'Dentición temporal y mixta, espacios, planos terminales y pérdida de espacio.'],
    'Fisiología': ['👅', 'Masticación, deglución, fonación, lengua, bolo y control neuromuscular.'],
    'Toma de impresión': ['🥄', 'No hay reactivos de toma de impresión en los cinco exámenes adjuntos.'],
    'Psicología infantil': ['🧠', 'Edad mental/cognoscitiva, comunicación y conducta infantil.'],
    'Hábitos y parafunciones': ['😬', 'Succión digital, respiración oral, bruxismo y alteraciones funcionales.'],
    'Nomenclatura': ['🔤', 'Prefijos, lexemas, sufijos y formación de términos odontológicos.'],
    'Oclusión': ['⚙️', 'Máxima intercuspidación, guías, función en grupo, interferencias y TTM.'],
    'Otros del parcial': ['📋', 'Reactivos del expediente clínico que no encajan de forma limpia en otra materia.']
  };

  let bank = [];
  let etymologyBank = [];
  let clinicalRecordBank = [];
  let orthoLabBank = [];
  let currentCategory = 'Todos los temas';
  let session = [];
  let sessionIndex = 0;
  let sessionScore = 0;
  let sessionStreak = 0;
  let bestStreak = 0;
  let answered = false;
  let currentPrepared = null;
  let sessionTopicStats = {};
  let studyDifficulty = localStorage.getItem('dentistas-study-difficulty') || 'medium';
  const STUDY_STATS_KEY = 'dentistas-study-topic-stats-v1';

  function loadTopicStats() {
    try { return JSON.parse(localStorage.getItem(STUDY_STATS_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function saveTopicStats(stats) {
    try { localStorage.setItem(STUDY_STATS_KEY, JSON.stringify(stats)); } catch (_) {}
  }

  function registerTopicAnswer(q, isCorrect) {
    const cat = q?.category || 'Otros del parcial';
    const sessionStat = sessionTopicStats[cat] || { seen: 0, wrong: 0 };
    sessionStat.seen += 1;
    if (!isCorrect) sessionStat.wrong += 1;
    sessionTopicStats[cat] = sessionStat;

    const total = loadTopicStats();
    const stat = total[cat] || { seen: 0, wrong: 0 };
    stat.seen += 1;
    if (!isCorrect) stat.wrong += 1;
    total[cat] = stat;
    saveTopicStats(total);
  }

  function weakestTopic() {
    const score = entries => entries
      .filter(([,s]) => s.wrong > 0)
      .sort((a,b) => (b[1].wrong - a[1].wrong) || ((b[1].wrong / b[1].seen) - (a[1].wrong / a[1].seen)))[0] || null;

    const sessionWeak = score(Object.entries(sessionTopicStats));
    if (sessionWeak && sessionWeak[1].wrong >= 2) return { category: sessionWeak[0], ...sessionWeak[1], scope: 'session' };

    const totalWeak = score(Object.entries(loadTopicStats()).filter(([,s]) => s.wrong >= 2));
    if (totalWeak) return { category: totalWeak[0], ...totalWeak[1], scope: 'history' };

    if (sessionWeak) return { category: sessionWeak[0], ...sessionWeak[1], scope: 'session' };
    return null;
  }

  function explanationFor(q, correctText) {
    const en = I18N?.getLang?.() === 'en';
    const category = q?.category || '';
    const intro = en ? '<b>Why:</b> ' : '<b>¿Por qué?</b> ';
    const templates = {
      'Psicología infantil': en
        ? `The clinical approach should match the child's actual developmental and communication level; <b>${correctText}</b> best fits the situation described.`
        : `El manejo clínico debe adaptarse al nivel real de desarrollo y comprensión del niño; <b>${correctText}</b> es lo que mejor corresponde al caso descrito.`,
      'Fisiología': en
        ? `The mechanism, phase, or function described in the stem corresponds to <b>${correctText}</b>; the other options describe a different physiologic event or structure.`
        : `El mecanismo, fase o función descrita en el enunciado corresponde a <b>${correctText}</b>; las otras opciones representan otro evento fisiológico o estructura.`,
      'Oclusión': en
        ? `The contact pattern or mandibular movement described is characteristic of <b>${correctText}</b>; that is the defining occlusal feature in this item.`
        : `El patrón de contactos o movimiento mandibular descrito es característico de <b>${correctText}</b>; esa es la característica oclusal definitoria del reactivo.`,
      'Desarrollo de la oclusión': en
        ? `The eruption, spacing, arch, or primary-to-permanent dentition relationship described corresponds to <b>${correctText}</b>.`
        : `La relación eruptiva, de espacios, de arcada o de transición entre dentición temporal y permanente descrita corresponde a <b>${correctText}</b>.`,
      'Desarrollo craneofacial': en
        ? `The growth pattern, cell, suture, or bone adaptation process described has the defining characteristics of <b>${correctText}</b>.`
        : `El patrón de crecimiento, célula, sutura o proceso de adaptación ósea descrito presenta las características definitorias de <b>${correctText}</b>.`,
      'Hábitos y parafunciones': en
        ? `The functional finding and its clinical context are most consistent with <b>${correctText}</b>, without assuming a single causal relationship beyond what the stem states.`
        : `El hallazgo funcional y su contexto clínico son más compatibles con <b>${correctText}</b>, sin asumir una causalidad única más allá de lo que indica el enunciado.`,
      'Nomenclatura': en
        ? `The directional or morphologic components given in the stem combine to form <b>${correctText}</b>; the distractors use a different prefix, root, or type of movement.`
        : `Los componentes direccionales o morfológicos indicados en el enunciado forman <b>${correctText}</b>; los distractores emplean otro prefijo, lexema o tipo de movimiento.`,
      'Nomenclatura y etimología médica': en
        ? `The prefix, root, suffix, or compound term in the stem corresponds to <b>${correctText}</b>. Its etymologic components help explain the medical or dental meaning.`
        : `El prefijo, raíz, sufijo o término compuesto del enunciado corresponde a <b>${correctText}</b>. Sus componentes etimológicos ayudan a explicar el significado médico u odontológico.`,
      'Realización del expediente clínico': en
        ? `The clinical-record section, datum, or documentation rule described in the stem corresponds to <b>${correctText}</b>. The answer follows the uploaded clinical-record materials.`
        : `El apartado, dato o regla de documentación descrita en el enunciado corresponde a <b>${correctText}</b>. La respuesta sigue los materiales de expediente clínico proporcionados.`,
      'Laboratorio de ortodoncia y ortopedia': en
        ? `The laboratory procedure, appliance, component, analysis, or design described is best represented by <b>${correctText}</b>. Other accepted answers may also be valid in the open-game version.`
        : `El procedimiento, aparato, componente, análisis o diseño de laboratorio descrito se representa principalmente con <b>${correctText}</b>. En la versión abierta del juego pueden existir otras respuestas válidas.`
    };
    return intro + (templates[category] || (en
      ? `The information in the stem most directly supports <b>${correctText}</b>.`
      : `La información del enunciado sustenta de forma más directa <b>${correctText}</b>.`));
  }

  const studyButton = document.createElement('button');
  studyButton.id = 'studyStart';
  studyButton.className = 'studyHomeButton';
  studyButton.textContent = tx('studyStart');
  const homeActions = document.querySelector('.homeActions');
  if (homeActions) homeActions.appendChild(studyButton);

  const studyScreen = document.createElement('main');
  studyScreen.id = 'study';
  studyScreen.className = 'screen studyScreen hidden';
  studyScreen.innerHTML = `
    <header class="studyTopbar">
      <button id="studyExit" class="studyIconBtn" aria-label="Volver a portada">⌂</button>
      <div>
        <strong id="studyTitleText">${tx('studyTitle')}</strong>
        <span id="studySubtitle">${tx('studySubtitle')}</span>
      </div>
      <button id="studyMenuBtn" class="studyIconBtn hidden" aria-label="Volver a materias">☰</button>
    </header>

    <section id="studyMenu" class="studyScroll">
      <div class="studyIntro">
        <span id="studyModeText" class="studyEyebrow">${tx('studyMode')}</span>
        <h1 id="studyIntroTitle">${tx('firstMidterm')} · 200 ${tx('items')}</h1>
        <p id="studyIntroText">${tx('intro')}</p>
        <div class="studyDifficultyPanel">
          <span>${I18N?.getLang?.()==='en'?'Difficulty':'Dificultad'}</span>
          <div>
            <button type="button" data-difficulty="easy">🟢 ${I18N?.getLang?.()==='en'?'Easy':'Fácil'}</button>
            <button type="button" data-difficulty="medium">🟡 ${I18N?.getLang?.()==='en'?'Medium':'Media'}</button>
            <button type="button" data-difficulty="advanced">🔴 ${I18N?.getLang?.()==='en'?'Advanced':'Avanzada'}</button>
          </div>
          <small id="studyDifficultyDesc"></small>
        </div>
        <div class="studyActions">
          <button id="studyQuickAll" class="studyPrimary">${tx('quick')}</button>
          <button id="studyMockAll">${tx('mock')}</button>
        </div>
        <p class="studyNote">${tx('target')}</p>
      </div>
      <section class="studyEtymologyFeature" aria-label="Nomenclatura y etimología médica">
        <div class="studyEtymologyHead">
          <span class="studyEtymologyIcon">🔤</span>
          <div>
            <span class="studyEtymologyEyebrow">${tx('etymologyModule')}</span>
            <h2 id="studyEtymologyTitle">${tx('etymologyTitle')}</h2>
            <p id="studyEtymologyDesc">${tx('etymologyDesc')}</p>
          </div>
        </div>
        <div class="studyEtymologyActions">
          <button id="studyEtymology10" class="studyPrimary">${tx('etymology10')}</button>
          <button id="studyEtymology40">${tx('etymology40')}</button>
          <button id="studyEtymology100">${tx('etymology100')}</button>
        </div>
        <small id="studyEtymologyCount">300 ${tx('items')}</small>
      </section>
      <section class="studyClinicalFeature" aria-label="Realización del expediente clínico">
        <div class="studyClinicalHead">
          <span class="studyClinicalIcon">📋</span>
          <div>
            <span class="studyClinicalEyebrow">${tx('clinicalModule')}</span>
            <h2 id="studyClinicalTitle">${tx('clinicalTitle')}</h2>
            <p id="studyClinicalDesc">${tx('clinicalDesc')}</p>
          </div>
        </div>
        <div class="studyClinicalActions">
          <button id="studyClinical10" class="studyPrimary">${tx('clinical10')}</button>
          <button id="studyClinical40">${tx('clinical40')}</button>
          <button id="studyClinical300">${tx('clinical300')}</button>
        </div>
        <small id="studyClinicalCount">300 ${tx('items')}</small>
      </section>
      <section class="studyOrthoLabFeature" aria-label="Laboratorio de ortodoncia y ortopedia">
        <div class="studyOrthoLabHead">
          <span class="studyOrthoLabIcon">🧰</span>
          <div>
            <span class="studyOrthoLabEyebrow">${tx('orthoLabModule')}</span>
            <h2 id="studyOrthoLabTitle">${tx('orthoLabTitle')}</h2>
            <p id="studyOrthoLabDesc">${tx('orthoLabDesc')}</p>
          </div>
        </div>
        <div class="studyOrthoLabActions">
          <button id="studyOrthoLab10" class="studyPrimary">${tx('orthoLab10')}</button>
          <button id="studyOrthoLab40">${tx('orthoLab40')}</button>
          <button id="studyOrthoLab300">${tx('orthoLab300')}</button>
        </div>
        <small id="studyOrthoLabCount">300 ${tx('items')}</small>
      </section>
      <div id="studyCategories" class="studyCategoryGrid"></div>
    </section>

    <section id="studyQuiz" class="studyQuiz hidden">
      <div class="studyQuizStatus">
        <span id="studyCategoryLabel">Todos los temas</span>
        <span id="studyProgress">1 / 10</span>
        <span id="studyScore">0 correctas</span>
        <span id="studyStreak" class="studyStreak">🔥 0</span>
      </div>
      <div class="studyQuestionCard">
        <div id="studySource" class="studySource"></div>
        <div id="studyContext" class="studyContext hidden"></div>
        <h2 id="studyQuestion"></h2>
        <div id="studyOptions" class="studyOptions"></div>
        <div id="studyFeedback" class="studyFeedback hidden"></div>
        <button id="studyNext" class="studyPrimary studyNext hidden">SIGUIENTE ▶</button>
      </div>
    </section>

    <section id="studyResult" class="studyResult hidden"></section>
  `;
  document.body.appendChild(studyScreen);

  const studyStyle = document.createElement('style');
  studyStyle.textContent = `
    .homeActions{flex-wrap:wrap;justify-content:center;max-width:96vw}
    .studyHomeButton{background:#0c6475!important;border-color:#9de8f5!important}
    .studyScreen{background:radial-gradient(circle at top,#173541 0,#071217 48%,#04090b 100%);overflow:hidden;color:#fff}
    .studyTopbar{height:10%;min-height:64px;display:grid;grid-template-columns:64px 1fr 64px;align-items:center;gap:.6rem;padding:.6rem 1rem;background:#071319;border-bottom:2px solid #5aa9b7;box-shadow:0 4px 20px #0008}
    .studyTopbar>div{text-align:center;display:grid;gap:.15rem}
    .studyTopbar strong{font-size:clamp(16px,2vw,28px);color:#dffaff}
    .studyTopbar span{font-size:clamp(11px,1.2vw,16px);opacity:.78}
    .studyIconBtn{height:46px;border:1px solid #6da6b0;border-radius:12px;background:#12313a;font-size:1.35rem}
    .studyScroll{height:90%;overflow:auto;padding:clamp(18px,3vw,40px)}
    .studyIntro{max-width:1040px;margin:0 auto 1.5rem;text-align:center}
    .studyEyebrow{display:inline-block;padding:.35rem .75rem;border:1px solid #66b9c6;border-radius:999px;color:#b7f3fc;font-weight:900;letter-spacing:.08em}
    .studyIntro h1{margin:.7rem 0 .4rem;font-size:clamp(30px,5vw,58px)}
    .studyIntro p{max-width:900px;margin:.5rem auto;line-height:1.45;font-size:clamp(14px,1.5vw,20px);color:#d6e7ea}
    .studyActions{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin:1.1rem 0}
    .studyActions button,.studyNext,.studyResult button{padding:.9rem 1.15rem;border:1px solid #7ecad4;border-radius:13px;background:#164653;font-weight:900}
    .studyPrimary{background:#0c7589!important;border-color:#a4eff9!important}
    .studyNote{font-size:.9rem!important;opacity:.8}
    .studyDifficultyPanel{max-width:760px;margin:.9rem auto;padding:.8rem 1rem;border:1px solid #426f79;border-radius:16px;background:#0b2228}.studyDifficultyPanel>span{display:block;font-weight:900;color:#dffaff;margin-bottom:.45rem}.studyDifficultyPanel>div{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap}.studyDifficultyPanel button{padding:.55rem .8rem;border:1px solid #4d7580;border-radius:11px;background:#112d35;color:#eafcff;font-weight:900}.studyDifficultyPanel button.active{border-color:#f0cf6d;background:#493916;box-shadow:0 0 0 1px #f0cf6d33}.studyDifficultyPanel small{display:block;margin-top:.45rem;color:#a9c6cb}
    .studyEtymologyFeature{max-width:1120px;margin:0 auto 1.25rem;padding:1.15rem 1.2rem;border:1px solid #7c5db0;border-radius:22px;background:linear-gradient(145deg,#211a35,#111b2a 62%,#0b2026);box-shadow:0 16px 36px #0006,inset 0 1px #ffffff10}
    .studyEtymologyHead{display:flex;gap:1rem;align-items:flex-start}.studyEtymologyIcon{font-size:2.6rem}.studyEtymologyEyebrow{font-size:.76rem;font-weight:900;letter-spacing:.1em;color:#d9b8ff}.studyEtymologyFeature h2{margin:.15rem 0 .35rem;font-size:clamp(20px,2.3vw,32px);color:#f6edff}.studyEtymologyFeature p{margin:0;color:#d4c9df;line-height:1.4}.studyEtymologyActions{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1rem}.studyEtymologyActions button{padding:.75rem 1rem;border:1px solid #8063ad;border-radius:13px;background:#2a2140;font-weight:900}.studyEtymologyActions button:last-child{background:linear-gradient(180deg,#6f3fa6,#43226b);border-color:#c89dff}.studyEtymologyFeature small{display:block;margin-top:.7rem;color:#cba8f4;font-weight:900}
    .studyClinicalFeature{max-width:1120px;margin:0 auto 1.25rem;padding:1.15rem 1.2rem;border:1px solid #3d8f7d;border-radius:22px;background:linear-gradient(145deg,#12342f,#10242a 62%,#081d22);box-shadow:0 16px 36px #0006,inset 0 1px #ffffff10}.studyClinicalHead{display:flex;gap:1rem;align-items:flex-start}.studyClinicalIcon{font-size:2.6rem}.studyClinicalEyebrow{font-size:.76rem;font-weight:900;letter-spacing:.1em;color:#8ce7ce}.studyClinicalFeature h2{margin:.15rem 0 .35rem;font-size:clamp(20px,2.3vw,32px);color:#e9fff8}.studyClinicalFeature p{margin:0;color:#c9e3dc;line-height:1.4}.studyClinicalActions{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1rem}.studyClinicalActions button{padding:.75rem 1rem;border:1px solid #407f71;border-radius:13px;background:#14372f;font-weight:900}.studyClinicalActions button:last-child{background:linear-gradient(180deg,#287a67,#185244);border-color:#79d8bd}.studyClinicalFeature small{display:block;margin-top:.7rem;color:#87d9c2;font-weight:900}
    .studyOrthoLabFeature{max-width:1120px;margin:0 auto 1.25rem;padding:1.15rem 1.2rem;border:1px solid #9f7a37;border-radius:22px;background:linear-gradient(145deg,#342811,#22200f 62%,#151b13);box-shadow:0 16px 36px #0006,inset 0 1px #ffffff10}.studyOrthoLabHead{display:flex;gap:1rem;align-items:flex-start}.studyOrthoLabIcon{font-size:2.6rem}.studyOrthoLabEyebrow{font-size:.76rem;font-weight:900;letter-spacing:.1em;color:#f4cf78}.studyOrthoLabFeature h2{margin:.15rem 0 .35rem;font-size:clamp(20px,2.3vw,32px);color:#fff8df}.studyOrthoLabFeature p{margin:0;color:#e8ddbd;line-height:1.4}.studyOrthoLabActions{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1rem}.studyOrthoLabActions button{padding:.75rem 1rem;border:1px solid #8f733c;border-radius:13px;background:#342b18;font-weight:900}.studyOrthoLabActions button:last-child{background:linear-gradient(180deg,#9c7428,#6f4e16);border-color:#e5c269}.studyOrthoLabFeature small{display:block;margin-top:.7rem;color:#e4c777;font-weight:900}
    .studyCategoryGrid{max-width:1120px;margin:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;padding-bottom:2rem}
    .studyCategoryCard{min-height:165px;text-align:left;padding:1rem;border:1px solid #477983;border-radius:18px;background:linear-gradient(145deg,#112a31,#0b1c22);box-shadow:0 10px 25px #0005;display:grid;grid-template-rows:auto auto 1fr auto;gap:.35rem}
    .studyCategoryCard:hover{border-color:#9ce7f0;transform:translateY(-2px)}
    .studyCategoryCard:disabled{opacity:.55;cursor:not-allowed;transform:none}
    .studyCategoryIcon{font-size:2rem}
    .studyCategoryName{font-size:1.1rem;font-weight:900;color:#e6fbff}
    .studyCategoryDesc{font-size:.88rem;line-height:1.35;color:#bdd1d5}
    .studyCategoryCount{font-size:.8rem;font-weight:900;color:#7ed6e2}
    .studyQuiz{height:90%;overflow:auto;padding:clamp(14px,2.2vw,28px)}
    .studyQuizStatus{max-width:1000px;margin:0 auto .8rem;display:flex;gap:.6rem;justify-content:space-between;flex-wrap:wrap}
    .studyQuizStatus span{padding:.45rem .75rem;border-radius:999px;background:#102b33;border:1px solid #396a74;font-size:.84rem;font-weight:800}
    .studyStreak{transition:transform .18s ease,box-shadow .18s ease,color .18s ease}
    .studyStreak.hot{color:#ffd66b;box-shadow:0 0 18px #ff9c0045;transform:scale(1.08)}
    .studyMedal{font-size:clamp(58px,10vw,112px);line-height:1;filter:drop-shadow(0 0 18px #ffc94d66);animation:studyMedalPop .45s cubic-bezier(.2,.9,.25,1.25)}
    .studyMedalLabel{font-weight:900;color:#ffe5a1;letter-spacing:.05em;margin:.35rem 0 .5rem}
    .studyBestStreak{font-size:1.05rem!important;color:#ffd98a}
    @keyframes studyMedalPop{from{transform:scale(.55) rotate(-8deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
    .studyQuestionCard{max-width:1000px;margin:auto;padding:clamp(18px,3vw,34px);border:1px solid #477983;border-radius:20px;background:#0b1a1f;box-shadow:0 16px 40px #0007}
    .studySource{font-size:.82rem;color:#8dd8e3;font-weight:900;letter-spacing:.03em}
    .studyContext{margin:.8rem 0;padding:.8rem 1rem;border-left:4px solid #558e99;background:#10252c;color:#d8e7e9;line-height:1.45;font-size:.92rem}
    .studyQuestionCard h2{font-size:clamp(20px,2.5vw,34px);line-height:1.28;margin:1rem 0 1.1rem}
    .studyOptions{display:grid;gap:.72rem}
    .studyOption{width:100%;text-align:left;padding:.9rem 1rem;border:1px solid #466f77;border-radius:12px;background:#12272d;line-height:1.35;font-weight:700}
    .studyOption:hover:not(:disabled){border-color:#9de8f5;background:#17363e}
    .studyOption.correct{border-color:#74d68a;background:#153f25}
    .studyOption.wrong{border-color:#ff7a7a;background:#501b1b}
    .studyOption:disabled{cursor:default}
    .studyFeedback{margin-top:1rem;padding:1rem;border-radius:12px;background:#10272e;line-height:1.45}
    .studyFeedback.good{border:1px solid #62bf7a}
    .studyFeedback.bad{border:1px solid #e36f6f}
    .studyNext{margin-top:1rem;width:100%}
    .studyResult{height:90%;overflow:auto;padding:3rem 1rem;text-align:center}
    .studyResultCard{max-width:720px;margin:auto;padding:2rem;border:1px solid #57919c;border-radius:24px;background:#0b1a1f}
    .studyResultBig{font-size:clamp(54px,10vw,110px);font-weight:900;color:#b8f3fb}
    .studyResult h1{font-size:clamp(28px,4vw,48px)}
    .studyResultActions{display:grid;gap:.8rem;margin-top:1.5rem}

    .studyCategoryCard:nth-child(1)::before{background:linear-gradient(#60bfff,#3979d8)}
    .studyCategoryCard:nth-child(2)::before{background:linear-gradient(#65e6f1,#16a8bd)}
    .studyCategoryCard:nth-child(3)::before{background:linear-gradient(#65dda0,#2b9b68)}
    .studyCategoryCard:nth-child(4)::before{background:linear-gradient(#d3b46d,#927334)}
    .studyCategoryCard:nth-child(5)::before{background:linear-gradient(#b28cff,#7451cf)}
    .studyCategoryCard:nth-child(6)::before{background:linear-gradient(#ff9c82,#d65c50)}
    .studyCategoryCard:nth-child(7)::before{background:linear-gradient(#d48cff,#8b4ccc)}
    .studyCategoryCard:nth-child(8)::before{background:linear-gradient(#ffd66c,#be8e2f)}
    .studyCategoryCard:nth-child(9)::before{background:linear-gradient(#9db4bb,#607981)}
    @media(max-width:800px){.studyCategoryGrid{grid-template-columns:1fr 1fr}.studyTopbar{grid-template-columns:50px 1fr 50px;padding:.5rem}.studyQuestionCard{border-radius:14px}.studyQuiz{padding:12px}}
    @media(max-width:520px){.studyCategoryGrid{grid-template-columns:1fr}.homeActions{bottom:2%;gap:.5rem}.homeActions button{min-width:170px;padding:.65rem 1rem}.studyIntro h1{font-size:30px}.studyTopbar strong{font-size:14px}}

    /* Visual refresh */
    .studyScreen{background:radial-gradient(circle at 50% -10%,#173b46 0,#07171d 45%,#030a0d 100%)!important}
    .studyTopbar{background:linear-gradient(180deg,#0d2a33,#07171d)!important;border-bottom:1px solid #3e7b85!important;box-shadow:0 9px 26px #0007!important}
    .studyTopbar strong{color:#f0fdff!important;text-shadow:0 0 14px #6ee7f244}
    .studyIconBtn{border:1px solid #4f8993!important;border-radius:14px!important;background:linear-gradient(180deg,#173c46,#0c252c)!important;box-shadow:inset 0 1px #ffffff12,0 5px 13px #0005}
    .studyScroll{background:linear-gradient(180deg,#07181e55,#03101522)}
    .studyIntro{padding:1.25rem 1rem 1.4rem;border:1px solid #376b75;border-radius:26px;background:linear-gradient(180deg,#0f2b34cc,#081b21dd);box-shadow:0 18px 42px #0006,inset 0 1px #ffffff10}
    .studyEyebrow{border-color:#62cbd7!important;background:#0f3944!important;color:#c8faff!important;box-shadow:inset 0 1px #ffffff12}
    .studyIntro h1{color:#f6fdff;text-shadow:0 0 18px #44c6d53d}
    .studyIntro p{color:#c9dfe3!important}
    .studyActions button,.studyNext,.studyResult button{border-radius:16px!important;box-shadow:inset 0 1px #ffffff14,0 8px 20px #0005!important;transition:transform .12s ease,filter .15s ease,box-shadow .18s ease!important}
    .studyActions button:hover,.studyNext:hover,.studyResult button:hover{filter:brightness(1.1);transform:translateY(-1px)}
    .studyPrimary{background:linear-gradient(180deg,#16a9bd,#087082)!important;border-color:#97e9f3!important}
    #studyMockAll{background:linear-gradient(180deg,#423417,#241b08)!important;border-color:#c9a34f!important;color:#ffe5a2!important}
    .studyCategoryGrid{gap:1.05rem!important}
    .studyCategoryCard{position:relative;overflow:hidden;min-height:175px!important;padding:1.05rem!important;border:1px solid #315f69!important;border-radius:20px!important;background:linear-gradient(155deg,#112d35,#0a1d23 65%,#07171c)!important;box-shadow:0 13px 28px #0005,inset 0 1px #ffffff0d!important;transition:transform .15s ease,border-color .18s ease,box-shadow .18s ease!important}
    .studyCategoryCard::before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:linear-gradient(#78e5f0,#1aa4ba);opacity:.85}
    .studyCategoryCard:hover{transform:translateY(-4px)!important;border-color:#6bdbe7!important;box-shadow:0 18px 34px #0007,0 0 0 1px #6ee7f21f!important}
    .studyCategoryCard:disabled{filter:saturate(.45);opacity:.5!important}
    .studyCategoryIcon{font-size:2.35rem!important;filter:drop-shadow(0 5px 8px #0005)}
    .studyCategoryName{font-size:1.12rem!important;color:#f1fcff!important}
    .studyCategoryDesc{color:#b8d1d6!important}
    .studyCategoryCount{display:inline-block;width:max-content;max-width:100%;padding:.28rem .55rem;border-radius:999px;background:#0f3944;color:#8fe9f2!important;border:1px solid #275b65}
    .studyQuizStatus{margin-bottom:.95rem!important}
    .studyQuizStatus span{background:linear-gradient(180deg,#12333c,#0a2229)!important;border-color:#356a74!important;color:#dff9fc!important;box-shadow:inset 0 1px #ffffff0d}
    .studyStreak.hot{background:#3a2a0f!important;border-color:#d6a94a!important;color:#ffd86f!important}
    .studyQuestionCard{border:1px solid #396d77!important;border-radius:24px!important;background:linear-gradient(180deg,#0f2830,#081a20)!important;box-shadow:0 20px 50px #0008,inset 0 1px #ffffff10!important}
    .studySource{color:#8de9f3!important}
    .studyContext{border-left-color:#66d5e0!important;background:#0d3039!important;border-radius:0 12px 12px 0;color:#d6e8eb!important}
    .studyQuestionCard h2{color:#f7fdff;text-shadow:0 2px 12px #000}
    .studyOptions{gap:.78rem!important}
    .studyOption{position:relative;padding:1rem 1.05rem!important;border:1px solid #345f68!important;border-radius:15px!important;background:linear-gradient(180deg,#123039,#0b2229)!important;color:#edfafd;box-shadow:inset 0 1px #ffffff0d,0 7px 16px #0004!important;transition:transform .12s ease,border-color .16s ease,filter .16s ease!important}
    .studyOption:hover:not(:disabled){transform:translateY(-2px);border-color:#6bdbe7!important;filter:brightness(1.08)}
    .studyOption b{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;margin-right:.45rem;border-radius:50%;background:#173f49;border:1px solid #4f8590;color:#c9f7fb}
    .studyOption.correct{border-color:#61d886!important;background:linear-gradient(180deg,#174a2a,#0c2b18)!important;box-shadow:0 0 0 1px #5add8424,0 8px 20px #001!important}
    .studyOption.wrong{border-color:#ff7779!important;background:linear-gradient(180deg,#5b2223,#321112)!important}
    .studyFeedback{border-radius:15px!important;background:#0d2931!important;box-shadow:inset 0 1px #ffffff0d}
    .studyFeedback.good{border-color:#57cb7a!important}
    .studyFeedback.bad{border-color:#e87373!important}
    .xpGain{display:inline-block;margin:0 .35rem;padding:.12rem .38rem;border-radius:999px;background:#3b3213;border:1px solid #a98b38;color:#ffe68d;font-size:.72rem;font-weight:1000}
    .studyResultCard{border:1px solid #4b8994!important;border-radius:28px!important;background:linear-gradient(180deg,#102d35,#081b21)!important;box-shadow:0 22px 55px #0008,inset 0 1px #ffffff10!important}
    .studyResultBig{color:#c9fbff!important;text-shadow:0 0 26px #61e4ef55}
    .studyMedal{filter:drop-shadow(0 0 26px #ffc94d77)!important}
    .studyMedalLabel{padding:.35rem .7rem;border-radius:999px;background:#35290f;border:1px solid #a98645;display:inline-block}
    .studyResultActions button{background:linear-gradient(180deg,#173740,#0c242b)!important;border-color:#4e7e87!important}
    .studyResultActions .studyPrimary{background:linear-gradient(180deg,#16a9bd,#087082)!important}
    @media(max-width:800px){
      .studyIntro{border-radius:20px;padding:1rem .8rem}
      .studyCategoryCard{min-height:160px!important}
      .studyQuestionCard{border-radius:18px!important}
    }
  `;
  document.head.appendChild(studyStyle);

  const $s = (selector) => studyScreen.querySelector(selector);

  function shuffle(items) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function playStudySound(ok) {
    try {
      if (window.DentistasProgression?.feedbackEnabled && !window.DentistasProgression.feedbackEnabled('sound')) return;
      const sound = document.querySelector(ok ? '#sndGood' : '#sndBad');
      if (!sound) return;
      sound.currentTime = 0;
      const p = sound.play();
      if (p && p.catch) p.catch(() => {});
    } catch (_) {}
  }

  async function ensureBank() {
    if (bank.length) return true;
    try {
      const responses = await Promise.all(DATA_FILES.map(file => fetch(file)));
      const etymologyResponse = await fetch(ETYMOLOGY_FILE);
      const clinicalRecordResponse = await fetch(CLINICAL_RECORD_FILE);
      const orthoLabResponse = await fetch(ORTHO_LAB_FILE);
      const bad = responses.find(r => !r.ok);
      if (bad) throw new Error(`HTTP ${bad.status}`);
      if (!etymologyResponse.ok) throw new Error(`HTTP ${etymologyResponse.status} · etimología`);
      if (!clinicalRecordResponse.ok) throw new Error(`HTTP ${clinicalRecordResponse.status} · expediente clínico`);
      if (!orthoLabResponse.ok) throw new Error(`HTTP ${orthoLabResponse.status} · laboratorio ortodoncia/ortopedia`);
      const data = (await Promise.all(responses.map(r => r.json()))).flat();
      if (!Array.isArray(data)) throw new Error('Formato inválido');
      bank = data.filter(q =>
        q && q.q && Array.isArray(q.options) &&
        Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length
      );
      const etymologyData = await etymologyResponse.json();
      etymologyBank = Array.isArray(etymologyData) ? etymologyData.filter(q =>
        q && q.q && Array.isArray(q.options) &&
        Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length
      ) : [];
      const ec = $s('#studyEtymologyCount'); if (ec) ec.textContent = `${etymologyBank.length} ${tx('items')}`;
      const clinicalRecordData = await clinicalRecordResponse.json();
      clinicalRecordBank = Array.isArray(clinicalRecordData) ? clinicalRecordData.filter(q =>
        q && q.q && Array.isArray(q.options) &&
        Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length
      ) : [];
      const cc = $s('#studyClinicalCount'); if (cc) cc.textContent = `${clinicalRecordBank.length} ${tx('items')}`;
      const orthoLabData = await orthoLabResponse.json();
      orthoLabBank = Array.isArray(orthoLabData) ? orthoLabData.filter(q =>
        q && q.q && Array.isArray(q.options) &&
        Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length
      ) : [];
      const oc = $s('#studyOrthoLabCount'); if (oc) oc.textContent = `${orthoLabBank.length} ${tx('items')}`;
      renderCategories();
      return true;
    } catch (err) {
      if (typeof openModal === 'function') {
        openModal(`<h2>No se pudo abrir el primer parcial</h2><p>${String(err.message || err)}</p>`);
      } else {
        alert('No se pudo cargar el banco del primer parcial.');
      }
      return false;
    }
  }

  function countFor(category) {
    if (category === 'Todos los temas') return bank.length;
    return bank.filter(q => q.category === category).length;
  }

  function renderCategories() {
    const box = $s('#studyCategories');
    if (!box) return;
    box.innerHTML = CATEGORY_ORDER.map(category => {
      const count = countFor(category);
      const meta = CATEGORY_META[category] || ['📚', ''];
      return `
        <button class="studyCategoryCard" data-category="${category.replace(/"/g, '&quot;')}" ${count ? '' : 'disabled'}>
          <span class="studyCategoryIcon">${meta[0]}</span>
          <span class="studyCategoryName">${catLabel(category)}</span>
          <span class="studyCategoryDesc">${catDesc(category)}</span>
          <span class="studyCategoryCount">${count ? `${count} ${tx('items')} · ${I18N?.getLang() === 'en' ? 'random challenge' : 'reto aleatorio'}` : I18N?.getLang() === 'en' ? '0 items in the 5 exams' : '0 reactivos en los 5 exámenes'}</span>
        </button>
      `;
    }).join('');

    box.querySelectorAll('.studyCategoryCard:not(:disabled)').forEach(button => {
      button.onclick = () => startSession(button.dataset.category, QUICK_LENGTH);
    });
  }

  function showStudyMenu() {
    try { if (typeof stopTimer === 'function') stopTimer(); } catch (_) {}
    document.querySelector('#home')?.classList.add('hidden');
    document.querySelector('#game')?.classList.add('hidden');
    studyScreen.classList.remove('hidden');
    $s('#studyMenu').classList.remove('hidden');
    $s('#studyQuiz').classList.add('hidden');
    $s('#studyResult').classList.add('hidden');
    $s('#studyMenuBtn').classList.add('hidden');
    $s('#studySubtitle').textContent = bank.length ? `${bank.length} ${tx('fromFive')}` : tx('loading');
    updateDifficultyUi();
    ensureBank().then(ok => {
      if (ok) $s('#studySubtitle').textContent = `${bank.length} ${tx('fromFive')}`;
    });
  }

  function exitStudy() {
    studyScreen.classList.add('hidden');
    document.querySelector('#game')?.classList.add('hidden');
    document.querySelector('#home')?.classList.remove('hidden');
  }

  function poolFor(category) {
    if (category === 'Nomenclatura y etimología médica') return [...etymologyBank];
    if (category === 'Realización del expediente clínico') return [...clinicalRecordBank];
    if (category === 'Laboratorio de ortodoncia y ortopedia') return [...orthoLabBank];
    return category === 'Todos los temas' ? [...bank] : bank.filter(q => q.category === category);
  }

  function startSession(category, requestedLength) {
    const pool = poolFor(category);
    if (!pool.length) {
      if (category === 'Toma de impresión' && typeof openModal === 'function') {
        openModal('<h2>Toma de impresión</h2><p>Los cinco exámenes adjuntos no contienen reactivos de toma de impresión. Este modo no añade preguntas externas ni inventadas.</p>');
      }
      return;
    }

    currentCategory = category;
    session = shuffle(pool).slice(0, Math.min(requestedLength, pool.length));
    sessionIndex = 0;
    sessionScore = 0;
    sessionStreak = 0;
    bestStreak = 0;
    answered = false;
    currentPrepared = null;
    sessionTopicStats = {};

    $s('#studyMenu').classList.add('hidden');
    $s('#studyResult').classList.add('hidden');
    $s('#studyQuiz').classList.remove('hidden');
    $s('#studyMenuBtn').classList.remove('hidden');
    renderQuestion();
  }

  function preparedQuestion(q) {
    const localized = studyOptions(q);
    let choices = localized.map((text, idx) => ({ text, correct: idx === q.correct }));
    const correct = choices.find(x=>x.correct);
    const wrong = shuffle(choices.filter(x=>!x.correct));
    const maxChoices = studyDifficulty === 'easy' ? 2 : studyDifficulty === 'medium' ? 3 : choices.length;
    choices = correct ? [correct, ...wrong.slice(0, Math.max(1,maxChoices-1))] : choices.slice(0,maxChoices);
    return { ...q, choices: shuffle(choices), studyDifficulty };
  }

  function renderQuestion() {
    answered = false;
    const q = session[sessionIndex];
    currentPrepared = preparedQuestion(q);

    $s('#studySubtitle').textContent = catLabel(currentCategory);
    $s('#studyCategoryLabel').textContent = catLabel(currentCategory);
    $s('#studyProgress').textContent = `${sessionIndex + 1} / ${session.length}`;
    $s('#studyScore').textContent = `${sessionScore} ${tx('correctCount')}`;
    const streakEl = $s('#studyStreak');
    if (streakEl) streakEl.textContent = `🔥 ${sessionStreak}`;
    $s('#studySource').textContent = `${q.source} · ${tx('question')} ${q.number} · ${q.type}`;

    const context = $s('#studyContext');
    const localizedContext = studyContextText(q);
    if (localizedContext) {
      context.textContent = localizedContext;
      context.classList.remove('hidden');
    } else {
      context.textContent = '';
      context.classList.add('hidden');
    }

    $s('#studyQuestion').textContent = studyQText(q);
    setTimeout(() => narrateStudy(studyQText(q), {lang:studyVoiceLang(q), rate:.9}), 220);
    $s('#studyFeedback').className = 'studyFeedback hidden';
    $s('#studyFeedback').innerHTML = '';
    $s('#studyNext').classList.add('hidden');

    const options = $s('#studyOptions');
    options.innerHTML = '';
    currentPrepared.choices.forEach((choice, idx) => {
      const button = document.createElement('button');
      button.className = 'studyOption';
      button.innerHTML = `<b>${String.fromCharCode(65 + idx)}.</b> ${choice.text}`;
      button.onclick = () => answerQuestion(idx);
      options.appendChild(button);
    });
  }

  function answerQuestion(index) {
    if (answered || !currentPrepared) return;
    answered = true;

    const choice = currentPrepared.choices[index];
    const buttons = [...$s('#studyOptions').querySelectorAll('.studyOption')];
    buttons.forEach((button, idx) => {
      button.disabled = true;
      if (currentPrepared.choices[idx].correct) button.classList.add('correct');
    });

    registerTopicAnswer(currentPrepared, choice.correct);

    if (choice.correct) {
      sessionScore += 1;
      sessionStreak += 1;
      bestStreak = Math.max(bestStreak, sessionStreak);
      playStudySound(true);
    } else {
      sessionStreak = 0;
      buttons[index].classList.add('wrong');
      playStudySound(false);
    }
    let xpGain = 0;
    try {
      window.DentistasProgression?.recordStudyActivity?.(choice.correct, sessionStreak);
      const xp = window.DentistasProgression?.addStudentXp?.(choice.correct, sessionStreak);
      xpGain = Number(xp?.gained)||0;
      window.DentistasProgression?.vibrateFeedback?.(choice.correct ? 45 : [70,45,70]);
    } catch (_) {}

    $s('#studyScore').textContent = `${sessionScore} ${tx('correctCount')}`;
    const streakEl = $s('#studyStreak');
    if (streakEl) {
      streakEl.textContent = `🔥 ${sessionStreak}`;
      streakEl.classList.toggle('hot', sessionStreak >= 3);
    }
    const correct = currentPrepared.choices.find(c => c.correct)?.text || '';
    const translated = I18N?.getLang?.() === 'en' && !!currentPrepared.q_en;
    const feedback = $s('#studyFeedback');
    feedback.className = `studyFeedback ${choice.correct ? 'good' : 'bad'}`;
    const explanation = explanationFor(currentPrepared, correct);
    feedback.innerHTML = choice.correct
      ? `<b>${tx('correct')}</b> <span class="xpGain">+${xpGain} XP</span> ${currentPrepared.source}, ${tx('question').toLowerCase()} ${currentPrepared.number}.${translated ? '' : `<br><small>${tx('originalLanguage')}</small>`}<div class="studyExplanation">${explanation}</div>`
      : `<b>${tx('incorrect')}</b> <span class="xpGain">+${xpGain} XP</span> ${tx('correctAnswer')} <b>${correct}</b><br><small>${currentPrepared.source}, ${tx('question').toLowerCase()} ${currentPrepared.number}.${translated ? '' : ` · ${tx('originalLanguage')}`}</small><div class="studyExplanation">${explanation}</div>`;
    $s('#studyNext').textContent = sessionIndex === session.length - 1 ? tx('result') : tx('next');
    narrateStudy(choice.correct ? tx('correct') : `${tx('incorrect')} ${tx('correctAnswer')} ${correct}`, {lang: translated ? 'en-US' : (I18N?.getLang?.()==='en' ? 'en-US' : 'es-MX'), rate:.92});
    $s('#studyNext').classList.remove('hidden');
  }

  function nextQuestion() {
    if (!answered) return;
    if (sessionIndex >= session.length - 1) {
      showResult();
      return;
    }
    sessionIndex += 1;
    renderQuestion();
  }

  function showResult() {
    $s('#studyQuiz').classList.add('hidden');
    $s('#studyResult').classList.remove('hidden');
    const percent = session.length ? Math.round((sessionScore / session.length) * 100) : 0;
    const passed = percent >= PASS_TARGET;
    const lang = I18N?.getLang?.() || 'es';
    let newlyUnlocked = [];
    try {
      const progression = window.DentistasProgression;
      if (progression && typeof CHARACTERS !== 'undefined') {
        const before = new Set(CHARACTERS.filter(ch => progression.isUnlocked(ch)).map(ch => ch.name));
        progression.recordModuleResult(currentCategory, percent);
        const after = CHARACTERS.filter(ch => progression.isUnlocked(ch)).map(ch => ch.name);
        newlyUnlocked = after.filter(name => !before.has(name));
      }
    } catch (_) {}
    let medal = '';
    let medalLabel = '';
    if (percent >= 90) { medal = '🏆'; medalLabel = lang === 'en' ? 'Mastery Trophy' : 'Trofeo de excelencia'; }
    else if (percent >= 80) { medal = '🥇'; medalLabel = lang === 'en' ? 'Gold Medal' : 'Medalla de oro'; }
    else if (percent >= 70) { medal = '🥈'; medalLabel = lang === 'en' ? 'Silver Medal' : 'Medalla de plata'; }
    else if (percent >= 60) { medal = '🥉'; medalLabel = lang === 'en' ? 'Bronze Medal' : 'Medalla de bronce'; }
    const unlockHtml = newlyUnlocked.length
      ? `<div class="studyWeakTopic good"><b>${lang === 'en' ? 'New character unlocked:' : 'Nuevo personaje desbloqueado:'}</b> 🎉 ${newlyUnlocked.join(', ')}</div>`
      : '';
    let nextUnlockHtml = '';
    try {
      const hint = window.DentistasProgression?.nextUnlockHint?.();
      if (hint) {
        nextUnlockHtml = `<div class="studyWeakTopic"><b>${lang === 'en' ? 'Next unlock:' : 'Siguiente desbloqueo:'}</b> ${hint.name}<br><small>${lang === 'en' ? `You need ${hint.remaining} more points in ${hint.moduleName} (best: ${hint.current}% / target: ${hint.target}%).` : `Te faltan ${hint.remaining} puntos en ${hint.moduleName} (mejor: ${hint.current}% / meta: ${hint.target}%).`}</small></div>`;
      }
    } catch (_) {}
    const weak = weakestTopic();
    const weakHtml = weak
      ? `<div class="studyWeakTopic"><b>${lang === 'en' ? 'Topic to review:' : 'Tema que más conviene repasar:'}</b> ${catLabel(weak.category)}<br><small>${lang === 'en' ? 'Errors' : 'Errores'}: ${weak.wrong} / ${weak.seen} ${weak.scope === 'history' ? (lang === 'en' ? 'in saved practice history' : 'en el historial guardado') : (lang === 'en' ? 'in this session' : 'en esta sesión')}</small></div>`
      : `<div class="studyWeakTopic good"><b>${lang === 'en' ? 'No weak topic detected in this session.' : 'No se detectó un tema débil en esta sesión.'}</b></div>`;

    $s('#studySubtitle').textContent = tx('resultTitle');
    narrateStudy(`${tx('resultTitle')}. ${percent} ${lang === 'en' ? 'percent' : 'por ciento'}. ${passed ? tx('passed') : tx('keepStudying')}.`, {lang: lang === 'en' ? 'en-US' : 'es-MX', rate:.92});
    $s('#studyResult').innerHTML = `
      <div class="studyResultCard">
        <div class="studyMedal">${medal || '📘'}</div>
        <div class="studyResultBig">${percent}%</div>
        ${medalLabel ? `<div class="studyMedalLabel">${medalLabel}</div>` : ''}
        <h1>${passed ? tx('passed') : tx('keepStudying')}</h1>
        <p>${tx('got')} <b>${sessionScore} ${tx('of')} ${session.length}</b> ${tx('correctResponses')} <b>${catLabel(currentCategory)}</b>.</p>
        <p class="studyBestStreak">🔥 ${lang === 'en' ? 'Best streak' : 'Mejor racha'}: <b>${bestStreak}</b></p>
        ${weakHtml}
        ${unlockHtml}
        ${nextUnlockHtml}
        <p>${passed ? tx('reached') : tx('notReached')}</p>
        <p class="studyNote">${tx('disclaimer')}</p>
        <div class="studyResultActions">
          <button id="studyRetry" class="studyPrimary">${tx('retry')}</button>
          <button id="studyResultMenu">${tx('choose')}</button>
          <button id="studyResultHome">${tx('home')}</button>
        </div>
      </div>
    `;
    $s('#studyRetry').onclick = () => startSession(currentCategory, session.length);
    $s('#studyResultMenu').onclick = showStudyMenu;
    $s('#studyResultHome').onclick = exitStudy;
    if (newlyUnlocked.length) {
      setTimeout(() => {
        try { window.DentistasProgression?.showUnlockAnimation?.(newlyUnlocked); } catch (_) {}
      }, 650);
    }
  }

  function difficultyDescription() {
    const en = I18N?.getLang?.()==='en';
    if (studyDifficulty==='easy') return en ? '2 options per question. Best for learning and first contact.' : '2 opciones por pregunta. Ideal para aprender y tener un primer contacto.';
    if (studyDifficulty==='advanced') return en ? 'All available options. Maximum challenge.' : 'Todas las opciones disponibles. Máximo reto.';
    return en ? '3 options per question. Balanced practice.' : '3 opciones por pregunta. Práctica equilibrada.';
  }
  function updateDifficultyUi() {
    $s('#studyMenu')?.querySelectorAll('[data-difficulty]').forEach(btn=>btn.classList.toggle('active',btn.dataset.difficulty===studyDifficulty));
    const d=$s('#studyDifficultyDesc'); if(d) d.textContent=difficultyDescription();
  }
  $s('#studyMenu')?.querySelectorAll('[data-difficulty]').forEach(btn=>btn.onclick=()=>{
    studyDifficulty=btn.dataset.difficulty;
    try{localStorage.setItem('dentistas-study-difficulty',studyDifficulty);}catch(_){}
    updateDifficultyUi();
  });
  updateDifficultyUi();

  studyButton.onclick = showStudyMenu;
  $s('#studyExit').onclick = exitStudy;
  $s('#studyMenuBtn').onclick = showStudyMenu;
  $s('#studyNext').onclick = nextQuestion;
  $s('#studyQuickAll').onclick = () => {
    if (bank.length) startSession('Todos los temas', QUICK_LENGTH);
    else ensureBank().then(ok => ok && startSession('Todos los temas', QUICK_LENGTH));
  };
  $s('#studyMockAll').onclick = () => {
    if (bank.length) startSession('Todos los temas', MOCK_LENGTH);
    else ensureBank().then(ok => ok && startSession('Todos los temas', MOCK_LENGTH));
  };
  const startEtymology = length => {
    if (etymologyBank.length) startSession('Nomenclatura y etimología médica', length);
    else ensureBank().then(ok => ok && startSession('Nomenclatura y etimología médica', length));
  };
  $s('#studyEtymology10').onclick = () => startEtymology(10);
  $s('#studyEtymology40').onclick = () => startEtymology(40);
  $s('#studyEtymology100').onclick = () => startEtymology(300);
  const startClinicalRecord = length => {
    if (clinicalRecordBank.length) startSession('Realización del expediente clínico', length);
    else ensureBank().then(ok => ok && startSession('Realización del expediente clínico', length));
  };
  $s('#studyClinical10').onclick = () => startClinicalRecord(10);
  $s('#studyClinical40').onclick = () => startClinicalRecord(40);
  $s('#studyClinical300').onclick = () => startClinicalRecord(300);
  const startOrthoLab = length => {
    if (orthoLabBank.length) startSession('Laboratorio de ortodoncia y ortopedia', length);
    else ensureBank().then(ok => ok && startSession('Laboratorio de ortodoncia y ortopedia', length));
  };
  $s('#studyOrthoLab10').onclick = () => startOrthoLab(10);
  $s('#studyOrthoLab40').onclick = () => startOrthoLab(40);
  $s('#studyOrthoLab300').onclick = () => startOrthoLab(300);

  ensureBank();

  window.DentistasStudyBack = function () {
    try {
      if (studyScreen.classList.contains('hidden')) return false;
      const quizVisible = !$s('#studyQuiz').classList.contains('hidden');
      const resultVisible = !$s('#studyResult').classList.contains('hidden');
      if (quizVisible || resultVisible) {
        showStudyMenu();
        window.DentistasNarrator?.stop?.();
        return true;
      }
      exitStudy();
      window.DentistasNarrator?.stop?.();
      return true;
    } catch (_) {
      return false;
    }
  };

window.addEventListener('dentistas-language-changed', () => {
  studyButton.textContent = tx('studyStart');
  const title = $s('#studyTitleText'); if (title) title.textContent = tx('studyTitle');
  const mode = $s('#studyModeText'); if (mode) mode.textContent = tx('studyMode');
  const introTitle = $s('#studyIntroTitle'); if (introTitle) introTitle.textContent = `${tx('firstMidterm')} · ${bank.length || 200} ${tx('items')}`;
  const introText = $s('#studyIntroText'); if (introText) introText.textContent = tx('intro');
  const quick = $s('#studyQuickAll'); if (quick) quick.textContent = tx('quick');
  const mock = $s('#studyMockAll'); if (mock) mock.textContent = tx('mock');
  const etyTitle = $s('#studyEtymologyTitle'); if (etyTitle) etyTitle.textContent = tx('etymologyTitle');
  const etyDesc = $s('#studyEtymologyDesc'); if (etyDesc) etyDesc.textContent = tx('etymologyDesc');
  const ety10 = $s('#studyEtymology10'); if (ety10) ety10.textContent = tx('etymology10');
  const ety40 = $s('#studyEtymology40'); if (ety40) ety40.textContent = tx('etymology40');
  const ety100 = $s('#studyEtymology100'); if (ety100) ety100.textContent = tx('etymology100');
  const etyCount = $s('#studyEtymologyCount'); if (etyCount) etyCount.textContent = `${etymologyBank.length || 300} ${tx('items')}`;
  const clinicalTitle = $s('#studyClinicalTitle'); if (clinicalTitle) clinicalTitle.textContent = tx('clinicalTitle');
  const clinicalDesc = $s('#studyClinicalDesc'); if (clinicalDesc) clinicalDesc.textContent = tx('clinicalDesc');
  const clinical10 = $s('#studyClinical10'); if (clinical10) clinical10.textContent = tx('clinical10');
  const clinical40 = $s('#studyClinical40'); if (clinical40) clinical40.textContent = tx('clinical40');
  const clinical300 = $s('#studyClinical300'); if (clinical300) clinical300.textContent = tx('clinical300');
  const clinicalCount = $s('#studyClinicalCount'); if (clinicalCount) clinicalCount.textContent = `${clinicalRecordBank.length || 300} ${tx('items')}`;
  const orthoLabTitle = $s('#studyOrthoLabTitle'); if (orthoLabTitle) orthoLabTitle.textContent = tx('orthoLabTitle');
  const orthoLabDesc = $s('#studyOrthoLabDesc'); if (orthoLabDesc) orthoLabDesc.textContent = tx('orthoLabDesc');
  const orthoLab10 = $s('#studyOrthoLab10'); if (orthoLab10) orthoLab10.textContent = tx('orthoLab10');
  const orthoLab40 = $s('#studyOrthoLab40'); if (orthoLab40) orthoLab40.textContent = tx('orthoLab40');
  const orthoLab300 = $s('#studyOrthoLab300'); if (orthoLab300) orthoLab300.textContent = tx('orthoLab300');
  const orthoLabCount = $s('#studyOrthoLabCount'); if (orthoLabCount) orthoLabCount.textContent = `${orthoLabBank.length || 300} ${tx('items')}`;
  const note = studyScreen.querySelector('.studyNote'); if (note && !$s('#studyResult')?.classList.contains('hidden')) {} else if (note) note.textContent = tx('target');
  renderCategories();
  if (!$s('#studyQuiz').classList.contains('hidden') && session.length) renderQuestion();
});

})();