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

function showRound(reset = true) {
  if (!questions.length) return;
  roundIndex = (roundIndex + questions.length) % questions.length;
  if (reset) {
    revealed = Array(questions[roundIndex].a.length).fill(false);
    strikes = 0;
    bank = 0;
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
  saveState();
}

function revealAnswer(idx, btn) {
  if (revealed[idx]) return;
  revealed[idx] = true;
  btn.classList.remove('covered');
  btn.classList.add('revealed');
  bank += Number(questions[roundIndex].a[idx][1]) || 0;
  updateBankUI();
  play(audio.good);
}

function addStrike() {
  if (strikes >= 3) return;
  strikes += 1;
  updateStrikesUI();
  play(audio.bad);
  if (strikes === 3) {
    const flash = $('#strikeFlash');
    flash.classList.remove('hidden');
    setTimeout(() => flash.classList.add('hidden'), 900);
  }
}

function awardBank(team) {
  if (bank <= 0) return;
  const idx = team - 1;
  awardHistory.push({team: idx, points: bank});
  scores[idx] += bank;
  bank = 0;
  updateScoreUI();
  updateBankUI();
  saveState();
}

function undoAward() {
  const last = awardHistory.pop();
  if (!last) return;
  scores[last.team] = Math.max(0, scores[last.team] - last.points);
  bank += last.points;
  updateScoreUI();
  updateBankUI();
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
    <h2>¿Cómo se juega?</h2>
    <ol>
      <li>Toca una respuesta para revelarla y sumar sus puntos al <b>Banco</b>.</li>
      <li>Usa <b>✖ Error</b> para registrar hasta tres fallos.</li>
      <li>Al terminar la ronda, pulsa <b>+ Banco</b> bajo el equipo que ganó esos puntos.</li>
      <li>Usa ◀ y ▶ para cambiar de ronda. ↶ deshace la última asignación de puntos.</li>
      <li>Toca el nombre de un equipo para cambiarlo.</li>
    </ol>
    <p>El juego funciona completamente sin internet.</p>
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
