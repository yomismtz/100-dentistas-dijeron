'use strict';

const CHARACTERS = [
  { name: 'MOLARÍN', icon: '🦷', subtitle: 'El clásico' },
  { name: 'CANINO', icon: '😁', subtitle: 'El competitivo' },
  { name: 'INCISIVA', icon: '✨', subtitle: 'La brillante' },
  { name: 'CEPILLÍN', icon: '🪥', subtitle: 'El preventivo' },
  { name: 'BRACKETS', icon: '😬', subtitle: 'El ortodóncico' },
  { name: 'FLUORITA', icon: '🧚', subtitle: 'La protectora' },
  { name: 'DR. MUELA', icon: '🥼', subtitle: 'El clínico' },
  { name: 'MUELA DEL JUICIO', icon: '😎', subtitle: 'El sabio' }
];

let teamCharacters = [0, 4];

(function loadCharacterSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('dentistas-characters') || '{}');
    if (Array.isArray(saved.teamCharacters) && saved.teamCharacters.length === 2) {
      teamCharacters = saved.teamCharacters.map((n, idx) => {
        const value = Number(n);
        return Number.isInteger(value) && value >= 0 && value < CHARACTERS.length ? value : (idx === 0 ? 0 : 4);
      });
    }
  } catch (_) {}
})();

const characterStyle = document.createElement('style');
characterStyle.textContent = `
  .setupTeams{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem}
  .setupTeam{border:1px solid #9d743e;border-radius:16px;padding:1rem;background:#0c0505}
  .setupTeam h3{margin:.1rem 0 .7rem;color:#ffe1a1}
  .teamInput{width:100%;padding:.75rem;border:1px solid #b99151;border-radius:10px;background:#240707;color:white;font:inherit;font-weight:800;text-transform:uppercase}
  .characterGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:.45rem;margin-top:.75rem}
  .characterCard{min-height:82px;border:1px solid #704b28;border-radius:12px;background:#260808;padding:.45rem .25rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.18rem}
  .characterCard .charIcon{font-size:2rem;line-height:1}
  .characterCard .charName{font-size:.68rem;font-weight:900;text-align:center}
  .characterCard.selected{border:2px solid #ffd36e;background:#7b150b;box-shadow:0 0 14px #b76b16}
  .characterCard.unavailable{opacity:.35}
  .setupStart{margin-top:1rem;width:100%;padding:1rem;border:2px solid #f1c56b;border-radius:14px;background:#a60b0b;font-weight:900;font-size:1.15rem}
  .characterHint{text-align:center;opacity:.75;font-size:.9rem}
  .teamName .avatar{font-size:1.35em;margin-right:.25rem;vertical-align:-.08em}
  .winnerStage{text-align:center;padding:.5rem}
  .winnerCharacters{font-size:clamp(70px,13vw,150px);line-height:1.1;margin:.25rem 0;filter:drop-shadow(0 0 16px #d69b30)}
  .winnerCharacters .trophy{display:inline-block;transform:translateY(-.08em);margin-left:.12em}
  .winnerName{font-size:clamp(26px,4vw,48px);font-weight:900;color:#ffe09a;margin:.4rem 0}
  .winnerScore{font-size:clamp(22px,3vw,38px);font-weight:900}
  @media(max-width:760px){.setupTeams{grid-template-columns:1fr}.characterGrid{grid-template-columns:repeat(4,1fr)}}
`;
document.head.appendChild(characterStyle);

function characterFor(teamIndex) {
  return CHARACTERS[teamCharacters[teamIndex]] || CHARACTERS[0];
}

function saveCharacterSettings() {
  localStorage.setItem('dentistas-characters', JSON.stringify({ teamCharacters }));
}

const originalUpdateScoreUI = updateScoreUI;
updateScoreUI = function updateScoreUIWithCharacters() {
  originalUpdateScoreUI();
  document.querySelectorAll('.teamName').forEach((button, idx) => {
    const character = characterFor(idx);
    button.innerHTML = `<span class="avatar" aria-hidden="true">${character.icon}</span>${teamNames[idx]}`;
    button.title = character.name;
  });
};

const originalUpdateTurnUI = updateTurnUI;
updateTurnUI = function updateTurnUIWithCharacters() {
  originalUpdateTurnUI();
  const turn = $('#turn');
  if (!turn || phase === 'over') return;
  const character = characterFor(currentTeam);
  turn.textContent = phase === 'steal'
    ? `ROBO: ${character.icon} ${teamNames[currentTeam]}`
    : `TURNO: ${character.icon} ${teamNames[currentTeam]}`;
};

function setupCharacterCards(teamIndex, container) {
  container.innerHTML = CHARACTERS.map((character, idx) => `
    <button type="button" class="characterCard ${teamCharacters[teamIndex] === idx ? 'selected' : ''}" data-character="${idx}">
      <span class="charIcon">${character.icon}</span>
      <span class="charName">${character.name}</span>
    </button>
  `).join('');

  const refresh = () => {
    container.querySelectorAll('.characterCard').forEach(card => {
      const idx = Number(card.dataset.character);
      card.classList.toggle('selected', teamCharacters[teamIndex] === idx);
      card.classList.toggle('unavailable', teamCharacters[1 - teamIndex] === idx && teamCharacters[teamIndex] !== idx);
    });
  };

  container.querySelectorAll('.characterCard').forEach(card => {
    card.onclick = () => {
      const idx = Number(card.dataset.character);
      if (teamCharacters[1 - teamIndex] === idx) return;
      teamCharacters[teamIndex] = idx;
      refresh();
      const other = document.querySelector(`#charactersTeam${2 - teamIndex}`);
      if (other) {
        other.querySelectorAll('.characterCard').forEach(otherCard => {
          const otherIdx = Number(otherCard.dataset.character);
          otherCard.classList.toggle('unavailable', otherIdx === idx && teamCharacters[1 - teamIndex] !== otherIdx);
        });
      }
    };
  });

  refresh();
}

function showCharacterSetup() {
  stopTimer();
  openModal(`
    <h2>ELIGE TUS EQUIPOS Y PERSONAJES</h2>
    <p class="characterHint">Cada personaje es visual: ninguno da ventajas o puntos extra.</p>
    <div class="setupTeams">
      <section class="setupTeam">
        <h3>EQUIPO 1</h3>
        <input id="setupName1" class="teamInput" maxlength="18" value="${teamNames[0].replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" aria-label="Nombre del equipo 1">
        <div id="charactersTeam1" class="characterGrid"></div>
      </section>
      <section class="setupTeam">
        <h3>EQUIPO 2</h3>
        <input id="setupName2" class="teamInput" maxlength="18" value="${teamNames[1].replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" aria-label="Nombre del equipo 2">
        <div id="charactersTeam2" class="characterGrid"></div>
      </section>
    </div>
    <button id="confirmTeams" class="setupStart">COMENZAR PARTIDA · 6 RONDAS</button>
  `);

  setupCharacterCards(0, $('#charactersTeam1'));
  setupCharacterCards(1, $('#charactersTeam2'));

  $('#confirmTeams').onclick = () => {
    const name1 = ($('#setupName1').value || 'EQUIPO 1').trim().toUpperCase().slice(0, 18);
    const name2 = ($('#setupName2').value || 'EQUIPO 2').trim().toUpperCase().slice(0, 18);
    if (teamCharacters[0] === teamCharacters[1]) {
      alert('Cada equipo debe elegir un personaje diferente.');
      return;
    }
    teamNames = [name1 || 'EQUIPO 1', name2 || 'EQUIPO 2'];
    saveState();
    saveCharacterSettings();
    closeModal(false);
    startNewGame();
  };
}

const originalFinishGame = finishGame;
finishGame = function finishGameWithCharacters() {
  stopTimer();
  phase = 'over';
  updateTurnUI();

  let result;
  if (scores[0] === scores[1]) {
    result = `
      <div class="winnerStage">
        <div class="winnerCharacters">${characterFor(0).icon} 🤝 ${characterFor(1).icon}</div>
        <div class="winnerName">EMPATE</div>
        <div class="winnerScore">${scores[0]} PUNTOS CADA EQUIPO</div>
      </div>`;
  } else {
    const winner = scores[0] > scores[1] ? 0 : 1;
    const loser = 1 - winner;
    const character = characterFor(winner);
    result = `
      <div class="winnerStage">
        <div class="winnerCharacters"><span>${character.icon}</span><span class="trophy">🏆</span></div>
        <div class="winnerName">¡${teamNames[winner]} GANA!</div>
        <div class="winnerScore">${scores[winner]} PUNTOS</div>
        <p>${teamNames[loser]} termina con <b>${scores[loser]}</b> puntos.</p>
      </div>`;
  }

  openModal(`
    ${result}
    <p>Marcador final = suma de los bancos ganados durante las 6 rondas.</p>
    <p>Rondas 1–2: <b>×1</b> · Rondas 3–4: <b>×2</b> · Rondas 5–6: <b>×3</b>.</p>
    <div class="menuStack">
      <button id="mAgain">OTRA PARTIDA · MISMOS EQUIPOS</button>
      <button id="mCharacters">CAMBIAR EQUIPOS / PERSONAJES</button>
      <button id="mHomeFinal">VOLVER A PORTADA</button>
    </div>
  `);

  $('#mAgain').onclick = () => {
    closeModal(false);
    startNewGame();
  };
  $('#mCharacters').onclick = () => {
    closeModal(false);
    $('#game').classList.add('hidden');
    $('#home').classList.remove('hidden');
    showCharacterSetup();
  };
  $('#mHomeFinal').onclick = () => {
    closeModal(false);
    $('#game').classList.add('hidden');
    $('#home').classList.remove('hidden');
  };
};

$('#start').onclick = showCharacterSetup;
updateScoreUI();
