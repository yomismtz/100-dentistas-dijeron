'use strict';

(() => {
  const DATA_FILES = ['primer_parcial_01.json','primer_parcial_02.json','primer_parcial_03.json','primer_parcial_04.json','primer_parcial_05.json','primer_parcial_06.json','primer_parcial_07.json','primer_parcial_08.json','primer_parcial_09.json','primer_parcial_10.json'];
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
  let currentCategory = 'Todos los temas';
  let session = [];
  let sessionIndex = 0;
  let sessionScore = 0;
  let sessionStreak = 0;
  let bestStreak = 0;
  let answered = false;
  let currentPrepared = null;

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
        <div class="studyActions">
          <button id="studyQuickAll" class="studyPrimary">${tx('quick')}</button>
          <button id="studyMockAll">${tx('mock')}</button>
        </div>
        <p class="studyNote">${tx('target')}</p>
      </div>
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
      const bad = responses.find(r => !r.ok);
      if (bad) throw new Error(`HTTP ${bad.status}`);
      const data = (await Promise.all(responses.map(r => r.json()))).flat();
      if (!Array.isArray(data)) throw new Error('Formato inválido');
      bank = data.filter(q =>
        q && q.q && Array.isArray(q.options) &&
        Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length
      );
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

    $s('#studyMenu').classList.add('hidden');
    $s('#studyResult').classList.add('hidden');
    $s('#studyQuiz').classList.remove('hidden');
    $s('#studyMenuBtn').classList.remove('hidden');
    renderQuestion();
  }

  function preparedQuestion(q) {
    const localized = studyOptions(q);
    const choices = localized.map((text, idx) => ({ text, correct: idx === q.correct }));
    return { ...q, choices: shuffle(choices) };
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
    feedback.innerHTML = choice.correct
      ? `<b>${tx('correct')}</b> ${currentPrepared.source}, ${tx('question').toLowerCase()} ${currentPrepared.number}.${translated ? '' : `<br><small>${tx('originalLanguage')}</small>`}`
      : `<b>${tx('incorrect')}</b> ${tx('correctAnswer')} <b>${correct}</b><br><small>${currentPrepared.source}, ${tx('question').toLowerCase()} ${currentPrepared.number}.${translated ? '' : ` · ${tx('originalLanguage')}`}</small>`;
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
    let medal = '';
    let medalLabel = '';
    if (percent >= 90) { medal = '🏆'; medalLabel = lang === 'en' ? 'Mastery Trophy' : 'Trofeo de excelencia'; }
    else if (percent >= 80) { medal = '🥇'; medalLabel = lang === 'en' ? 'Gold Medal' : 'Medalla de oro'; }
    else if (percent >= 70) { medal = '🥈'; medalLabel = lang === 'en' ? 'Silver Medal' : 'Medalla de plata'; }
    else if (percent >= 60) { medal = '🥉'; medalLabel = lang === 'en' ? 'Bronze Medal' : 'Medalla de bronce'; }
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
  }

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

  ensureBank();
window.addEventListener('dentistas-language-changed', () => {
  studyButton.textContent = tx('studyStart');
  const title = $s('#studyTitleText'); if (title) title.textContent = tx('studyTitle');
  const mode = $s('#studyModeText'); if (mode) mode.textContent = tx('studyMode');
  const introTitle = $s('#studyIntroTitle'); if (introTitle) introTitle.textContent = `${tx('firstMidterm')} · ${bank.length || 200} ${tx('items')}`;
  const introText = $s('#studyIntroText'); if (introText) introText.textContent = tx('intro');
  const quick = $s('#studyQuickAll'); if (quick) quick.textContent = tx('quick');
  const mock = $s('#studyMockAll'); if (mock) mock.textContent = tx('mock');
  const note = studyScreen.querySelector('.studyNote'); if (note && !$s('#studyResult')?.classList.contains('hidden')) {} else if (note) note.textContent = tx('target');
  renderCategories();
  if (!$s('#studyQuiz').classList.contains('hidden') && session.length) renderQuestion();
});

})();