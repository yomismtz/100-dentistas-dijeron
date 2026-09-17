'use strict';

const $ = (s) => document.querySelector(s);
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
let stealFromTeam = null;

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
  localStorage.setItem('dentistas-state', JSON.stringify({roundIndex, scores, teamNames}));
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('dentistas-state') || '{}');
    if (Number.isInteger(s.roundIndex)) roundIndex = s.roundIndex;
    if (Array.isArray(s.scores) && s.scores.length === 2) scores = s.scores.map(n => Math.max(0, Number(n) || 0));
    if (Array.isArray(s.teamNames) && s.teamNames.length === 2) teamNames = s.teamNames.map(String);
  } catch (_) {}
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
}

function showRound(reset = true) {
  if (!questions.length) return;
  roundIndex = (roundIndex + questions.length) % questions.length;
  if (reset) {
    revealed = Array(questions[roundIndex].a.length).fill(false);
    strikes = 0;
    bank = 0;
    phase = 'play';
    stealFromTeam = null;
    currentTeam = roundIndex % 2;
  }
  const q = questions[roundIndex];
  $('#round').textContent = `RONDA ${roundIndex + 1}`;
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
  saveState();
}

function revealAnswer(idx, btn) {
  if (phase === 'over' || revealed[idx]) return;
  revealed[idx] = true;
  btn.classList.remove('covered');
  btn.classList.add('revealed');
  bank += Number(questions[roundIndex].a[idx][1]) || 0;
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
    saveState();
    openModal(`<h2>¡ROBO EXITOSO!</h2><p><b>${teamNames[currentTeam]}</b> encontró una respuesta del tablero y gana <b>${pointsWon} puntos</b>.</p><p>La ronda terminó. Pulsa ▶ para continuar.</p>`);
  } else {
    updateTurnUI();
  }
}

function flashThreeStrikes() {
  const flash = $('#strikeFlash');
  flash.classList.remove('hidden');
  setTimeout(() => flash.classList.add('hidden'), 900);
}

function addStrike() {
  if (phase === 'over') return;

  if (phase === 'steal') {
    play(audio.bad);
    flashThreeStrikes();
    const lostPoints = bank;
    bank = 0;
    phase = 'over';
    updateBankUI();
    updateStrikesUI();
    updateTurnUI();
    saveState();
    openModal(`<h2>ROBO FALLIDO</h2><p><b>${teamNames[currentTeam]}</b> no encontró una respuesta del tablero.</p><p>Los <b>${lostPoints} puntos</b> del banco se pierden y la ronda termina.</p><p>Pulsa ▶ para continuar.</p>`);
    return;
  }

  if (strikes >= 3) return;
  strikes += 1;
  updateStrikesUI();
  play(audio.bad);

  if (strikes === 3) {
    flashThreeStrikes();
    const previousTeam = currentTeam;
    strikes = 0;
    updateStrikesUI();
    currentTeam = 1 - currentTeam;

    if (bank > 0) {
      phase = 'steal';
      stealFromTeam = previousTeam;
      updateTurnUI();
      openModal(`<h2>3 ERRORES · CAMBIO DE TURNO</h2><p><b>${teamNames[previousTeam]}</b> pierde el control de la ronda.</p><p><b>${teamNames[currentTeam]}</b> tiene <b>una sola respuesta</b> para robar el banco de <b>${bank} puntos</b>.</p><p>Si acierta una respuesta que aún está oculta, gana todo el banco. Si falla, esos puntos se pierden.</p>`);
    } else {
      phase = 'play';
      updateTurnUI();
      openModal(`<h2>3 ERRORES · CAMBIO DE TURNO</h2><p><b>${teamNames[previousTeam]}</b> pierde el turno.</p><p>Ahora juega <b>${teamNames[currentTeam]}</b>.</p>`);
    }
  } else {
    updateTurnUI();
  }
}

function awardBank(team) {
  if (bank <= 0 || phase === 'over') return;
  const idx = team - 1;
  const pointsWon = bank;
  awardHistory.push({team: idx, points: pointsWon});
  scores[idx] += pointsWon;
  bank = 0;
  phase = 'over';
  updateScoreUI();
  updateBankUI();
  updateTurnUI();
  saveState();
  openModal(`<h2>BANCO ASIGNADO</h2><p><b>${teamNames[idx]}</b> recibe <b>${pointsWon} puntos</b>.</p><p>La ronda terminó. Pulsa ▶ para continuar.</p>`);
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
  saveState();
}

function resetRound() { showRound(true); }

function resetGame() {
  scores = [0, 0];
  roundIndex = 0;
  awardHistory = [];
  updateScoreUI();
  showRound(true);
  saveState();
}

function renameTeam(team) {
  const idx = team - 1;
  const name = prompt(`Nombre del equipo ${team}:`, teamNames[idx]);
  if (name && name.trim()) {
    teamNames[idx] = name.trim().toUpperCase().slice(0, 18);
    updateScoreUI();
    updateTurnUI();
    saveState();
  }
}

function openModal(html) {
  $('#modalContent').innerHTML = html;
  $('#modal').classList.remove('hidden');
}
function closeModal() { $('#modal').classList.add('hidden'); }

function showHelp() {
  openModal(`
    <h2>¿Cómo se juega VS?</h2>
    <ol>
      <li>La partida es para <b>2 equipos</b>. El equipo activo aparece resaltado.</li>
      <li>Una respuesta correcta revela la casilla y suma sus puntos al <b>Banco</b>.</li>
      <li>Cada equipo puede cometer como máximo <b>3 errores</b> durante su turno.</li>
      <li>Al tercer error pierde el control de la ronda y el turno pasa automáticamente al rival.</li>
      <li>Si ya había puntos en el banco, el rival entra en <b>modo ROBO</b> y tiene una sola respuesta.</li>
      <li>Si el rival acierta, gana todo el banco. Si falla, el banco se pierde.</li>
      <li><b>DAR BANCO</b> queda como control manual del moderador para cerrar una ronda cuando sea necesario.</li>
      <li>◀ y ▶ cambian de ronda. ↶ deshace la última asignación de puntos.</li>
    </ol>
    <p>Las rondas alternan qué equipo comienza para que ambos tengan oportunidad de iniciar.</p>
  `);
}

function showMenu() {
  openModal(`
    <h2>Menú</h2>
    <div class="menuStack">
      <button id="mHelp">Instrucciones</button>
      <button id="mHome">Portada</button>
      <button id="mReset" class="danger">Reiniciar marcador</button>
    </div>
  `);
  $('#mHelp').onclick = showHelp;
  $('#mHome').onclick = () => { closeModal(); $('#game').classList.add('hidden'); $('#home').classList.remove('hidden'); };
  $('#mReset').onclick = () => { if (confirm('¿Reiniciar todo el marcador?')) { resetGame(); closeModal(); } };
}

fetch('questions.json')
  .then(r => r.json())
  .then(data => {
    questions = data;
    loadState();
    roundIndex = Math.min(roundIndex, questions.length - 1);
    updateScoreUI();
  })
  .catch(() => openModal('<h2>Error</h2><p>No se pudieron cargar las preguntas.</p>'));

$('#start').onclick = () => {
  $('#home').classList.add('hidden');
  $('#game').classList.remove('hidden');
  play(audio.start);
  showRound(true);
};
$('#help').onclick = showHelp;
$('#prev').onclick = () => { roundIndex -= 1; showRound(true); };
$('#next').onclick = () => { roundIndex += 1; showRound(true); };
$('#buzz').onclick = addStrike;
$('#undo').onclick = undoAward;
$('#resetRound').onclick = resetRound;
$('#menu').onclick = showMenu;
$('#closeModal').onclick = closeModal;
$('#modal').addEventListener('click', (e) => { if (e.target === $('#modal')) closeModal(); });
document.querySelectorAll('.award').forEach(b => b.onclick = () => awardBank(Number(b.dataset.team)));
document.querySelectorAll('.teamName').forEach(b => b.onclick = () => renameTeam(Number(b.dataset.team)));
