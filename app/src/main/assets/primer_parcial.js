'use strict';

(() => {
  const DATA_FILES = ['primer_parcial_01.json','primer_parcial_02.json','primer_parcial_03.json','primer_parcial_04.json','primer_parcial_05.json','primer_parcial_06.json','primer_parcial_07.json','primer_parcial_08.json','primer_parcial_09.json','primer_parcial_10.json'];
  const QUICK_LENGTH = 10;
  const MOCK_LENGTH = 40;
  const PASS_TARGET = 80;

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
  let answered = false;
  let currentPrepared = null;

  const studyButton = document.createElement('button');
  studyButton.id = 'studyStart';
  studyButton.className = 'studyHomeButton';
  studyButton.textContent = 'JUEGA Y APRUEBA EL 1ER PARCIAL';
  const homeActions = document.querySelector('.homeActions');
  if (homeActions) homeActions.appendChild(studyButton);

  const studyScreen = document.createElement('main');
  studyScreen.id = 'study';
  studyScreen.className = 'screen studyScreen hidden';
  studyScreen.innerHTML = `
    <header class="studyTopbar">
      <button id="studyExit" class="studyIconBtn" aria-label="Volver a portada">⌂</button>
      <div>
        <strong>JUEGA Y APRUEBA EL PRIMER PARCIAL</strong>
        <span id="studySubtitle">Banco de los 5 exámenes</span>
      </div>
      <button id="studyMenuBtn" class="studyIconBtn hidden" aria-label="Volver a materias">☰</button>
    </header>

    <section id="studyMenu" class="studyScroll">
      <div class="studyIntro">
        <span class="studyEyebrow">MODO DE ESTUDIO</span>
        <h1>Primer parcial · 200 reactivos</h1>
        <p>Repasa por materia con preguntas tomadas de los cinco exámenes. Los reactivos de relación de columnas y nomenclatura se adaptaron a opción múltiple para poder jugar, conservando su respuesta correcta.</p>
        <div class="studyActions">
          <button id="studyQuickAll" class="studyPrimary">⚡ RETO RÁPIDO · 10 PREGUNTAS</button>
          <button id="studyMockAll">📝 SIMULACRO · 40 PREGUNTAS</button>
        </div>
        <p class="studyNote">Meta lúdica: 80% de aciertos. No sustituye la calificación oficial del curso.</p>
      </div>
      <div id="studyCategories" class="studyCategoryGrid"></div>
    </section>

    <section id="studyQuiz" class="studyQuiz hidden">
      <div class="studyQuizStatus">
        <span id="studyCategoryLabel">Todos los temas</span>
        <span id="studyProgress">1 / 10</span>
        <span id="studyScore">0 correctas</span>
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
    @media(max-width:800px){.studyCategoryGrid{grid-template-columns:1fr 1fr}.studyTopbar{grid-template-columns:50px 1fr 50px;padding:.5rem}.studyQuestionCard{border-radius:14px}.studyQuiz{padding:12px}}
    @media(max-width:520px){.studyCategoryGrid{grid-template-columns:1fr}.homeActions{bottom:2%;gap:.5rem}.homeActions button{min-width:170px;padding:.65rem 1rem}.studyIntro h1{font-size:30px}.studyTopbar strong{font-size:14px}}
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
          <span class="studyCategoryName">${category}</span>
          <span class="studyCategoryDesc">${meta[1]}</span>
          <span class="studyCategoryCount">${count ? `${count} reactivo${count === 1 ? '' : 's'} · reto aleatorio` : '0 reactivos en los 5 exámenes'}</span>
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
    $s('#studySubtitle').textContent = bank.length ? `${bank.length} reactivos de los 5 exámenes` : 'Cargando banco…';
    ensureBank().then(ok => {
      if (ok) $s('#studySubtitle').textContent = `${bank.length} reactivos de los 5 exámenes`;
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
    answered = false;
    currentPrepared = null;

    $s('#studyMenu').classList.add('hidden');
    $s('#studyResult').classList.add('hidden');
    $s('#studyQuiz').classList.remove('hidden');
    $s('#studyMenuBtn').classList.remove('hidden');
    renderQuestion();
  }

  function preparedQuestion(q) {
    const choices = q.options.map((text, idx) => ({ text, correct: idx === q.correct }));
    return { ...q, choices: shuffle(choices) };
  }

  function renderQuestion() {
    answered = false;
    const q = session[sessionIndex];
    currentPrepared = preparedQuestion(q);

    $s('#studySubtitle').textContent = currentCategory;
    $s('#studyCategoryLabel').textContent = currentCategory;
    $s('#studyProgress').textContent = `${sessionIndex + 1} / ${session.length}`;
    $s('#studyScore').textContent = `${sessionScore} correcta${sessionScore === 1 ? '' : 's'}`;
    $s('#studySource').textContent = `${q.source} · Reactivo ${q.number} · ${q.type}`;

    const context = $s('#studyContext');
    if (q.context) {
      context.textContent = q.context;
      context.classList.remove('hidden');
    } else {
      context.textContent = '';
      context.classList.add('hidden');
    }

    $s('#studyQuestion').textContent = q.q;
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
      playStudySound(true);
    } else {
      buttons[index].classList.add('wrong');
      playStudySound(false);
    }

    $s('#studyScore').textContent = `${sessionScore} correcta${sessionScore === 1 ? '' : 's'}`;
    const correct = currentPrepared.choices.find(c => c.correct)?.text || '';
    const feedback = $s('#studyFeedback');
    feedback.className = `studyFeedback ${choice.correct ? 'good' : 'bad'}`;
    feedback.innerHTML = choice.correct
      ? `<b>✓ Correcto.</b> ${currentPrepared.source}, reactivo ${currentPrepared.number}.`
      : `<b>✖ Incorrecto.</b> Respuesta correcta: <b>${correct}</b><br><small>${currentPrepared.source}, reactivo ${currentPrepared.number}.</small>`;
    $s('#studyNext').textContent = sessionIndex === session.length - 1 ? 'VER RESULTADO ▶' : 'SIGUIENTE ▶';
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
    $s('#studySubtitle').textContent = 'Resultado del reto';
    $s('#studyResult').innerHTML = `
      <div class="studyResultCard">
        <div class="studyResultBig">${percent}%</div>
        <h1>${passed ? '✅ RETO SUPERADO' : '📚 SIGUE REPASANDO'}</h1>
        <p>Obtuviste <b>${sessionScore} de ${session.length}</b> respuestas correctas en <b>${currentCategory}</b>.</p>
        <p>${passed ? 'Alcanzaste la meta lúdica de 80%.' : 'La meta lúdica de este modo es 80%. Puedes repetir el mismo tema con preguntas aleatorias.'}</p>
        <p class="studyNote">Este porcentaje es una herramienta de estudio y no equivale a una calificación oficial.</p>
        <div class="studyResultActions">
          <button id="studyRetry" class="studyPrimary">↻ REPETIR TEMA</button>
          <button id="studyResultMenu">☰ ELEGIR OTRA MATERIA</button>
          <button id="studyResultHome">⌂ VOLVER A PORTADA</button>
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
})();