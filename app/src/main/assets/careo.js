/* Careo modular recuperado de la primera versión, adaptado al banco y audios actuales. */
'use strict';
(() => {
  let state = null;
  const sound = id => {
    const el = document.getElementById(id);
    if (!el) return;
    try { el.pause(); el.currentTime = 0; const p = el.play(); if (p?.catch) p.catch(() => {}); } catch (_) {}
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const teamLabel = team => esc(window.DentistasTeamNames?.[team] || (typeof teamNames !== 'undefined' ? teamNames[team] : (team ? 'EQUIPO 2' : 'EQUIPO 1')));
  const question = () => questions?.[roundIndex] || null;
  const lockBoard = locked => {
    document.querySelectorAll('#answers button').forEach((b,i) => {
      b.disabled = !!locked || !!revealed?.[i];
      b.style.pointerEvents = locked ? 'none' : '';
    });
  };
  const showModal = html => {
    const close = document.querySelector('#closeModal');
    if (close) close.classList.add('careoNoClose');
    openModal('<div class="careoModal">' + html + '</div>');
  };
  const closeCareo = () => {
    const close = document.querySelector('#closeModal');
    if (close) close.classList.remove('careoNoClose');
    try { window.DentistasNarrator?.stop?.(); } catch (_) {}
    closeModal(false);
  };
  const setModalAction = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };
  function questionScreen() {
    const q = question();
    if (!q || phase === 'over' || gamePaused) return;
    stopTimer();
    window.DentistasNarrator?.stop?.();
    state = { first:null, second:null, attempts:0 };
    phase = 'play';
    faceoffActive = false;
    faceoffDoneThisRound = false;
    careoStartedThisRound = true;
    questionVisibleThisRound = true;
    turnResolving = false;
    document.querySelector('#question').textContent = qText(q);
    document.querySelector('#faceoff')?.classList.add('hidden');
    document.querySelector('#answerEntry')?.classList.add('hidden');
    lockBoard(true);
    updateCareoButton();
    updateTurnUI();
    sound('sndStart');
    showModal(
      '<div class="careoKicker">🎤 CAREO · RONDA ' + (roundIndex+1) + '</div>' +
      '<h2>' + esc(qText(q)) + '</h2>' +
      '<p class="careoListenState">🔊 Escucha la pregunta. El moderador decide cuándo abrir los pulsadores.</p>' +
      '<div class="careoActions"><button id="careoShowBuzzers" class="careoPrimary">MOSTRAR PULSADORES</button><button id="careoSkipRead" class="careoSecondary">OMITIR LECTURA</button></div>'
    );
    const spoken = narrate(qText(q), {lang:qVoiceLang(q),rate:.91});
    if (spoken === false) {
      const note = document.querySelector('.careoListenState');
      if (note) note.textContent = 'La narración no está disponible. Puedes mostrar los pulsadores.';
    }
    setModalAction('careoShowBuzzers', showBuzzers);
    setModalAction('careoSkipRead', () => { window.DentistasNarrator?.stop?.(); showBuzzers(); });
    saveActiveGame();
  }
  function showBuzzers() {
    if (!state || phase === 'over') return;
    window.DentistasNarrator?.stop?.();
    sound('sndFaceoff');
    faceoffActive = true;
    faceoffDoneThisRound = false;
    showModal(
      '<div class="careoKicker">⚡ ¿QUIÉN CONTESTA PRIMERO?</div>' +
      '<h2>' + esc(qText(question())) + '</h2><p>El primer pulsador bloquea al otro equipo.</p>' +
      '<div class="careoBuzzers">' +
      '<button id="careoBuzz1" class="careoBuzzer teamA"><span>' + teamLabel(0) + '</span><b>¡PRESIONAR!</b></button>' +
      '<button id="careoBuzz2" class="careoBuzzer teamB"><span>' + teamLabel(1) + '</span><b>¡PRESIONAR!</b></button></div>'
    );
    const buzz = team => {
      if (!state || state.first !== null || !faceoffActive) return;
      state.first = team;
      state.second = 1-team;
      sound('sndFaceoff');
      const one = document.getElementById('careoBuzz1');
      const two = document.getElementById('careoBuzz2');
      [one,two].forEach(b => { if (b) b.disabled = true; });
      (team === 0 ? one : two)?.classList.add('buzzWinner');
      showModal(
        '<div class="careoKicker">🏁 GANÓ EL PULSADOR</div><h2>' + teamLabel(team) + '</h2>' +
        '<p>El otro equipo queda en espera. Cuando el moderador lo indique, comienza la respuesta.</p>' +
        '<button id="careoContinueAnswer" class="careoPrimary">CONTINUAR CON ' + teamLabel(team) + '</button>'
      );
      setModalAction('careoContinueAnswer', () => ask(team,false));
      saveActiveGame();
    };
    setModalAction('careoBuzz1', () => buzz(0));
    setModalAction('careoBuzz2', () => buzz(1));
    saveActiveGame();
  }
  function ask(team, second) {
    if (!state || phase === 'over') return;
    state.attempts = second ? 2 : 1;
    state.activeTeam = team;
    faceoffActive = false;
    faceoffDoneThisRound = true;
    currentTeam = team;
    turnResolving = false;
    const q = question();
    showModal(
      '<div class="careoKicker">' + (second ? '↪ SEGUNDA OPORTUNIDAD' : '⚡ RESPONDE EL EQUIPO') + '</div>' +
      '<h2>' + teamLabel(team) + '</h2><p class="careoQuestionSmall">' + esc(qText(q)) + '</p>' +
      '<div class="careoAnswerEntry"><input id="careoInput" autocomplete="off" placeholder="Respuesta del equipo" aria-label="Respuesta del equipo"></div>' +
      '<button id="careoSubmit" class="careoPrimary">COMPROBAR RESPUESTA</button>'
    );
    const input = document.getElementById('careoInput');
    setModalAction('careoSubmit', () => check(team,second));
    input?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();check(team,second);}});
    input?.focus();
    updateTurnUI();
    saveActiveGame();
  }
  function check(team, second) {
    const input = document.getElementById('careoInput');
    const raw = String(input?.value || '').trim();
    if (!raw) { input?.focus(); return; }
    const result = matchTypedAnswerDetailed(raw);
    if (result.status === 'ambiguous') {
      const feedback = document.getElementById('careoFeedback');
      if (feedback) feedback.textContent = 'La respuesta coincide con más de una opción. Precísala.';
      else {
        const p = document.createElement('p'); p.id='careoFeedback'; p.className='careoFeedback';
        p.textContent='La respuesta coincide con más de una opción. Precísala.';
        input?.after(p);
      }
      return;
    }
    if (result.status === 'correct') return correct(team,result.index);
    fail(team,second);
  }
  function fail(team, second) {
    sound(second ? 'sndStrike23' : 'sndBad');
    if (!second) {
      state.attempts = 1;
      showModal(
        '<div class="careoBigX">✖</div><div class="careoKicker">RESPUESTA INCORRECTA</div>' +
        '<h2>Ahora tiene oportunidad ' + teamLabel(1-team) + '</h2>' +
        '<p>El primer equipo ya utilizó su intento. El moderador puede entregar el turno al contrario.</p>' +
        '<button id="careoOtherTeam" class="careoPrimary">DAR OPORTUNIDAD AL OTRO EQUIPO</button>'
      );
      setModalAction('careoOtherTeam', () => ask(1-team,true));
      return;
    }
    bank = 0;
    updateBankUI();
    strikes = 0;
    updateStrikesUI();
    phase = 'over';
    faceoffActive = false;
    faceoffDoneThisRound = false;
    lockBoard(true);
    showModal(
      '<div class="careoBigX">✖ ✖</div><div class="careoKicker">RONDA SIN PUNTOS</div>' +
      '<h2>Ningún equipo acertó</h2><p>El banco queda en cero. El moderador decide cuándo continuar.</p>' +
      '<button id="careoNextRound" class="careoPrimary">SIGUIENTE RONDA ▶</button>'
    );
    setModalAction('careoNextRound', () => { closeCareo(); state=null; nextRound(); });
    updateTurnUI();
    saveActiveGame();
  }
  function correct(team,index) {
    const q = question();
    const btn = document.querySelectorAll('#answers button')[index];
    if (!q || !btn) return;
    currentTeam = team;
    faceoffActive = false;
    faceoffDoneThisRound = true;
    phase = 'play';
    turnResolving = false;
    sound('sndGood');
    closeCareo();
    lockBoard(false);
    updateTurnUI();
    revealAnswer(index,btn);
    state = null;
    saveActiveGame();
  }
  function startCareo() { questionScreen(); }
  beginTurnAfterQuestion = function(startCareo=false) {
    if (!startCareo) return;
    if (gamePaused || phase === 'over' || !gameVisible() || careoStartedThisRound) return;
    startCareo();
  };
  startFaceoff = function() {
    if (phase === 'steal') {
      faceoffActive = false;
      document.querySelector('#faceoff')?.classList.add('hidden');
      document.querySelector('#answerEntry')?.classList.remove('hidden');
      updateTurnUI();
      return;
    }
    if (state && faceoffActive) { showBuzzers(); return; }
    if (!careoStartedThisRound) questionScreen();
  };
  finishFaceoff = function(winner) {
    if (!state || state.first !== null || !faceoffActive) return;
    const team = Number(winner) === 1 ? 1 : 0;
    state.first = team;
    state.second = 1-team;
    ask(team,false);
  };
  const start = document.getElementById('startFaceoff');
  if (start) start.onclick = e => { e.preventDefault(); startCareo(); };
  window.DentistasCareo = {start:startCareo, showBuzzers, ask, check, fail, getState:()=>state, version:'restored-manual-1'};
  window.addEventListener('dentistas-language-changed', () => {
    if (state && !document.querySelector('#modal')?.classList.contains('hidden')) {
      // La partida conserva su estado; el contenido de la pregunta se vuelve a pintar en el idioma elegido.
      const q = question(); if (q) document.querySelector('#question').textContent = qText(q);
    }
  });
  console.info('[CAREO] estructura modular restaurada; banco y sonidos actuales conservados');
})();
