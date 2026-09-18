'use strict';

const $ = (s) => document.querySelector(s);
const GAME_SIZE = 8;
const TURN_SECONDS = 10;
const BANK_FILES = [
  'questions.json',
  'questions_anatomia.json',
  'questions_preventiva.json',
  'questions_periodoncia.json',
  'questions_endo_restauradora.json',
  'questions_protesis_atm.json',
  'questions_cirugia_radiologia.json',
  'questions_patologia.json',
  'questions_odonto_ortho.json',
  'questions_infecciones_medicina.json',
  'questions_materiales_implantes.json'
];

let questionPool = [];
let questions = [];
let roundIndex = 0;
let revealed = [];
let strikes = 0;
let bank = 0;
let scores = [0, 0];
let teamNames = ['EQUIPO 1', 'EQUIPO 2'];
let awardHistory = [];
let currentTeam = 0;
let phase = 'play'; // play | steal | over
let timerRemaining = TURN_SECONDS;
let timerHandle = null;

const audio = {
  start: $('#sndStart'),
  good: $('#sndGood'),
  bad: $('#sndBad')
};

function play(sound) {
  try {
    sound.currentTime = 0;
    const p = sound.play();
    if (p && p.catch) p.catch(() => {});
  } catch (_) {}
}

function saveState() {
  localStorage.setItem('dentistas-settings', JSON.stringify({teamNames}));
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('dentistas-settings') || '{}');
    if (Array.isArray(s.teamNames) && s.teamNames.length === 2) {
      teamNames = s.teamNames.map(String);
    }
  } catch (_) {}
}

function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function chooseGameQuestions() {
  questions = shuffle(questionPool).slice(0, Math.min(GAME_SIZE, questionPool.length));
}

function roundMultiplier(index = roundIndex) {
  if (index <= 1) return 1;
  if (index <= 3) return 2;
  return 3;
}

function gameVisible() {
  return $('#game') && !$('#game').classList.contains('hidden');
}

function updateTimerUI() {
  const timer = $('#timer');
  if (!timer) return;
  timer.textContent = phase === 'over' ? '—' : String(timerRemaining);
  timer.classList.toggle('urgent', phase !== 'over' && timerRemaining <= 3);
  timer.classList.toggle('paused', phase === 'over');
}

function stopTimer() {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function startTimer() {
  stopTimer();
  if (phase === 'over' || !gameVisible()) {
    updateTimerUI();
    return;
  }

  timerRemaining = TURN_SECONDS;
  updateTimerUI();

  timerHandle = setInterval(() => {
    timerRemaining -= 1;
    updateTimerUI();

    if (timerRemaining <= 0) {
      stopTimer();
      addStrike('timeout');
    }
  }, 1000);
}

function updateScoreUI() {
  $('#s1').textContent = scores[0];
  $('#s2').textContent = scores[1];
  document.querySelectorAll('.teamName').forEach((b, idx) => b.textContent = teamNames[idx]);
}

function updateBankUI() {
  $('#bank').textContent = bank;
}

function updateStrikesUI() {
  $('#strikes').textContent = '✖ '.repeat(strikes).trim();
}

function updateTurnUI() {
  const turn = $('#turn');
  const teams = document.querySelectorAll('.team');
  teams.forEach((el, idx) => {
    el.classList.toggle('active', phase !== 'over' && idx === currentTeam);
    el.classList.toggle('steal', phase === 'steal' && idx === currentTeam);
  });

  if (phase === 'steal') {
    turn.textContent = `ROBO: ${teamNames[currentTeam]}`;
    $('#buzz').textContent = '✖ FALLÓ ROBO';
  } else if (phase === 'over') {
    turn.textContent = 'RONDA TERMINADA';
    $('#buzz').textContent = '✖ ERROR';
  } else {
    turn.textContent = `TURNO: ${teamNames[currentTeam]}`;
    $('#buzz').textContent = '✖ ERROR';
  }

  $('#buzz').disabled = phase === 'over';
  document.querySelectorAll('.award').forEach(b => b.disabled = phase === 'over' || bank <= 0);
  updateTimerUI();
}

function showRound(reset = true) {
  if (!questions.length) return;
  stopTimer();
  roundIndex = Math.max(0, Math.min(roundIndex, questions.length - 1));

  if (reset) {
    revealed = Array(questions[roundIndex].a.length).fill(false);
    strikes = 0;
    bank = 0;
    phase = 'play';
    currentTeam = roundIndex % 2;
  }

  const q = questions[roundIndex];
  const mult = roundMultiplier();
  $('#round').textContent = `RONDA ${roundIndex + 1} · ×${mult}`;
  $('#progress').textContent = `${roundIndex + 1} / ${questions.length}`;
  $('#question').textContent = q.q;

  updateStrikesUI();
  updateBankUI();

  const box = $('#answers');
  box.innerHTML = '';
  q.a.forEach((answer, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer covered';
    btn.innerHTML = `<span class="num">${idx + 1}</span><span class="txt">${answer[0]}</span><span class="pts">${answer[1]}</span>`;
    btn.addEventListener('click', () => revealAnswer(idx, btn));
    box.appendChild(btn);
  });

  updateTurnUI();
  startTimer();
}

function revealAnswer(idx, btn) {
  if (phase === 'over' || revealed[idx]) return;

  stopTimer();
  revealed[idx] = true;
  btn.classList.remove('covered');
  btn.classList.add('revealed');

  const basePoints = Number(questions[roundIndex].a[idx][1]) || 0;
  const gainedPoints = basePoints * roundMultiplier();
  bank += gainedPoints;
  updateBankUI();
  play(audio.good);

  if (phase === 'steal') {
    const pointsWon = bank;
    awardHistory.push({team: currentTeam, points: pointsWon});
    scores[currentTeam] += pointsWon;
    bank = 0;
    phase = 'over';
    updateScoreUI();
    updateBankUI();
    updateTurnUI();

    openModal(
      `<h2>¡ROBO EXITOSO!</h2>
       <p><b>${teamNames[currentTeam]}</b> encontró una respuesta del tablero y gana <b>${pointsWon} puntos</b>.</p>
       <p>${roundIndex === questions.length - 1 ? 'Pulsa ▶ para ver el resultado final.' : 'Pulsa ▶ para continuar.'}</p>`
    );
  } else {
    updateTurnUI();
    startTimer();
  }
}

function flashThreeStrikes() {
  const flash = $('#strikeFlash');
  flash.classList.remove('hidden');
  setTimeout(() => flash.classList.add('hidden'), 900);
}

function addStrike(reason = 'manual') {
  if (phase === 'over') return;
  stopTimer();

  if (phase === 'steal') {
    play(audio.bad);
    flashThreeStrikes();
    const lostPoints = bank;
    bank = 0;
    phase = 'over';
    updateBankUI();
    updateTurnUI();

    openModal(
      `<h2>${reason === 'timeout' ? 'TIEMPO AGOTADO · ROBO FALLIDO' : 'ROBO FALLIDO'}</h2>
       <p><b>${teamNames[currentTeam]}</b> no encontró una respuesta del tablero.</p>
       <p>Los <b>${lostPoints} puntos</b> del banco se pierden y la ronda termina.</p>
       <p>${roundIndex === questions.length - 1 ? 'Pulsa ▶ para ver el resultado final.' : 'Pulsa ▶ para continuar.'}</p>`
    );
    return;
  }

  if (strikes >= 3) return;

  strikes += 1;
  updateStrikesUI();
  play(audio.bad);

  if (strikes === 3) {
    flashThreeStrikes();

    const previousTeam = currentTeam;
    currentTeam = 1 - currentTeam;

    if (bank > 0) {
      phase = 'steal';
      updateTurnUI();
      openModal(
        `<h2>3 ERRORES · CAMBIO DE TURNO</h2>
         <p><b>${teamNames[previousTeam]}</b> pierde el control de la ronda.</p>
         <p><b>${teamNames[currentTeam]}</b> tiene <b>10 segundos y una sola respuesta</b> para robar el banco de <b>${bank} puntos</b>.</p>
         <p>Si acierta una respuesta todavía oculta, gana todo el banco. Si falla o se termina el tiempo, esos puntos se pierden.</p>`
      );
    } else {
      strikes = 0;
      phase = 'play';
      updateStrikesUI();
      updateTurnUI();
      openModal(
        `<h2>3 ERRORES · CAMBIO DE TURNO</h2>
         <p><b>${teamNames[previousTeam]}</b> pierde el turno.</p>
         <p>Ahora juega <b>${teamNames[currentTeam]}</b> y tendrá 10 segundos para responder.</p>`
      );
    }
  } else {
    updateTurnUI();
    startTimer();
  }
}

function awardBank(team) {
  if (bank <= 0 || phase === 'over') return;
  stopTimer();

  const idx = team - 1;
  const pointsWon = bank;
  awardHistory.push({team: idx, points: pointsWon});
  scores[idx] += pointsWon;
  bank = 0;
  phase = 'over';

  updateScoreUI();
  updateBankUI();
  updateTurnUI();

  openModal(
    `<h2>BANCO ASIGNADO</h2>
     <p><b>${teamNames[idx]}</b> recibe <b>${pointsWon} puntos</b>.</p>
     <p>${roundIndex === questions.length - 1 ? 'Pulsa ▶ para ver el resultado final.' : 'Pulsa ▶ para continuar.'}</p>`
  );
}

function undoAward() {
  const last = awardHistory.pop();
  if (!last) return;

  scores[last.team] = Math.max(0, scores[last.team] - last.points);
  bank += last.points;
  currentTeam = last.team;
  phase = 'play';
  strikes = 0;

  updateScoreUI();
  updateBankUI();
  updateStrikesUI();
  updateTurnUI();
  startTimer();
}

function resetRound() {
  showRound(true);
}

function startNewGame() {
  if (!questionPool.length) {
    openModal('<h2>Base no disponible</h2><p>Las preguntas todavía no se han cargado.</p>');
    return;
  }

  stopTimer();
  chooseGameQuestions();
  scores = [0, 0];
  roundIndex = 0;
  awardHistory = [];
  revealed = [];
  strikes = 0;
  bank = 0;
  currentTeam = 0;
  phase = 'play';

  $('#home').classList.add('hidden');
  $('#game').classList.remove('hidden');
  updateScoreUI();
  play(audio.start);
  showRound(true);
}

function finishGame() {
  stopTimer();
  phase = 'over';
  updateTurnUI();

  let result;
  if (scores[0] > scores[1]) {
    result = `<h2>🏆 ${teamNames[0]} GANA</h2><p><b>${scores[0]}</b> a <b>${scores[1]}</b> puntos.</p>`;
  } else if (scores[1] > scores[0]) {
    result = `<h2>🏆 ${teamNames[1]} GANA</h2><p><b>${scores[1]}</b> a <b>${scores[0]}</b> puntos.</p>`;
  } else {
    result = `<h2>EMPATE</h2><p>Ambos equipos terminaron con <b>${scores[0]} puntos</b>.</p>`;
  }

  openModal(
    `${result}
     <p>Marcador final = suma de los bancos ganados durante las 8 rondas.</p>
     <p>Rondas 1–2: <b>×1</b> · Rondas 3–4: <b>×2</b> · Rondas 5–8: <b>×3</b>.</p>
     <p>Se jugaron <b>${questions.length} preguntas</b> elegidas al azar de una base de <b>${questionPool.length}</b>.</p>
     <div class="menuStack">
       <button id="mAgain">NUEVA PARTIDA ALEATORIA</button>
       <button id="mHomeFinal">VOLVER A PORTADA</button>
     </div>`
  );

  $('#mAgain').onclick = () => {
    closeModal(false);
    startNewGame();
  };

  $('#mHomeFinal').onclick = () => {
    closeModal(false);
    $('#game').classList.add('hidden');
    $('#home').classList.remove('hidden');
  };
}

function nextRound() {
  closeModal(false);
  if (roundIndex >= questions.length - 1) {
    finishGame();
    return;
  }
  roundIndex += 1;
  showRound(true);
}

function previousRound() {
  closeModal(false);
  if (roundIndex <= 0) return;
  roundIndex -= 1;
  showRound(true);
}

function renameTeam(team) {
  const idx = team - 1;
  stopTimer();
  const name = prompt(`Nombre del equipo ${team}:`, teamNames[idx]);
  if (name && name.trim()) {
    teamNames[idx] = name.trim().toUpperCase().slice(0, 18);
    updateScoreUI();
    updateTurnUI();
    saveState();
  }
  if (gameVisible() && phase !== 'over') startTimer();
}

function openModal(html) {
  stopTimer();
  $('#modalContent').innerHTML = html;
  $('#modal').classList.remove('hidden');
}

function closeModal(resumeTimer = true) {
  $('#modal').classList.add('hidden');
  if (resumeTimer && gameVisible() && phase !== 'over') startTimer();
}

function showHelp() {
  openModal(`
    <h2>¿Cómo se juega VS?</h2>
    <ol>
      <li>La partida es para <b>2 equipos</b>.</li>
      <li>Cada partida usa <b>8 preguntas aleatorias</b> elegidas de toda la base.</li>
      <li>Las preguntas no se repiten dentro de la misma partida.</li>
      <li>Cada respuesta debe darse antes de que termine el <b>cronómetro de 10 segundos</b>.</li>
      <li>Si el cronómetro llega a cero sin respuesta correcta, se registra automáticamente <b>1 strike</b>.</li>
      <li>Después de una respuesta correcta o de un strike, el cronómetro vuelve a empezar en 10 segundos.</li>
      <li>Las rondas <b>1 y 2 valen ×1</b>, las rondas <b>3 y 4 valen ×2</b> y las rondas <b>5 y 6 valen ×3</b>.</li>
      <li>Una respuesta correcta revela la casilla y suma al <b>Banco</b> sus puntos multiplicados por el valor de la ronda.</li>
      <li>Cada equipo puede cometer como máximo <b>3 errores</b> durante su turno.</li>
      <li>Al tercer error pierde el control y el turno pasa al rival.</li>
      <li>Si había puntos en el banco, el rival dispone de <b>10 segundos y una sola respuesta</b> para robarlo.</li>
      <li>Si el rival acierta, gana todo el banco. Si falla o se termina el tiempo, el banco se pierde.</li>
      <li><b>DAR BANCO</b> queda como control manual del moderador.</li>
      <li>Después de la ronda 8 se muestra el marcador final y el ganador.</li>
    </ol>
    <p>Base actual: <b>${questionPool.length || 116} preguntas</b>.</p>
  `);
}

function showMenu() {
  openModal(`
    <h2>Menú</h2>
    <div class="menuStack">
      <button id="mHelp">Instrucciones</button>
      <button id="mNew">Nueva partida aleatoria</button>
      <button id="mHome">Portada</button>
    </div>
  `);

  $('#mHelp').onclick = showHelp;
  $('#mNew').onclick = () => {
    if (confirm('¿Terminar esta partida y sortear 8 preguntas nuevas?')) {
      closeModal(false);
      startNewGame();
    }
  };
  $('#mHome').onclick = () => {
    closeModal(false);
    stopTimer();
    $('#game').classList.add('hidden');
    $('#home').classList.remove('hidden');
  };
}

async function loadQuestionPool() {
  try {
    const banks = await Promise.all(
      BANK_FILES.map(file =>
        fetch(file).then(r => {
          if (!r.ok) throw new Error(file);
          return r.json();
        })
      )
    );
    questionPool = banks.flat().filter(q => q && q.q && Array.isArray(q.a) && q.a.length);
    updateScoreUI();
  } catch (err) {
    openModal(`<h2>Error</h2><p>No se pudo cargar la base completa de preguntas.</p><p>${String(err.message || err)}</p>`);
  }
}

loadState();
loadQuestionPool();
updateTimerUI();

$('#start').onclick = startNewGame;
$('#help').onclick = showHelp;
$('#prev').onclick = previousRound;
$('#next').onclick = nextRound;
$('#buzz').onclick = () => addStrike('manual');
$('#undo').onclick = undoAward;
$('#resetRound').onclick = resetRound;
$('#menu').onclick = showMenu;
$('#closeModal').onclick = () => closeModal(true);
$('#modal').addEventListener('click', (e) => {
  if (e.target === $('#modal')) closeModal(true);
});
document.querySelectorAll('.award').forEach(b => b.onclick = () => awardBank(Number(b.dataset.team)));
document.querySelectorAll('.teamName').forEach(b => b.onclick = () => renameTeam(Number(b.dataset.team)));
