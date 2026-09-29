'use strict';

const charLang = () => window.DentistasI18n?.getLang?.() || 'es';
const charText = (es,en) => charLang() === 'en' ? en : es;

const CHARACTERS = [
  { name:'SOFÍA', specialty:'ORTODONCIA', role:'La Arquitecta de Sonrisas', icon:'🦷', image:'characters/sofia_ortodoncia.webp', tone:'violet',
    strengths:['Alineación','Planificación','Precisión'], weaknesses:['Tratamientos prolongados','Dependencia de cooperación'], power:'ARCO MAESTRO', tool:'Alicate ortodóncico',
    stats:[['Precisión',5],['Velocidad',3],['Diagnóstico',4],['Prevención',3],['Complejidad',5]] },
  { name:'VALERIA', specialty:'PERIODONCIA', role:'Guardiana del Periodonto', icon:'🌿', image:'characters/valeria_periodoncia.webp', tone:'emerald',
    strengths:['Diagnóstico periodontal','Control de inflamación','Mantenimiento'], weaknesses:['Progresión silenciosa','Requiere seguimiento'], power:'ESCUDO PERIODONTAL', tool:'Sonda periodontal',
    stats:[['Diagnóstico',5],['Prevención',5],['Cirugía',4],['Velocidad',3],['Regeneración',5]] },
  { name:'SANTIAGO', specialty:'CIRUGÍA BUCAL', role:'El Cirujano de Precisión', icon:'⚕️', image:'characters/santiago_cirugia_bucal.webp', tone:'blue',
    strengths:['Extracciones','Control quirúrgico','Precisión'], weaknesses:['Recuperación postoperatoria','Riesgo anatómico'], power:'EXTRACCIÓN PERFECTA', tool:'Elevador quirúrgico',
    stats:[['Cirugía',5],['Diagnóstico',4],['Velocidad',4],['Precisión',5],['Prevención',2]] },
  { name:'ALEX', specialty:'CIRUGÍA MAXILOFACIAL', role:'Dominio Craneofacial', icon:'💀', image:'characters/alex_maxilofacial.webp', tone:'petrol',
    strengths:['Trauma facial','Reconstrucción','Anatomía compleja'], weaknesses:['Alta complejidad','Tratamientos invasivos'], power:'RECONSTRUCCIÓN 3D', tool:'Planificación craneofacial holográfica',
    stats:[['Cirugía',5],['Anatomía',5],['Diagnóstico',5],['Velocidad',2],['Complejidad',5]] },
  { name:'MATEO', specialty:'OPERATORIA DENTAL', role:'Maestro de la Restauración', icon:'✨', image:'characters/mateo_operatoria.webp', tone:'gold',
    strengths:['Estética','Restauración','Precisión'], weaknesses:['Humedad','Aislamiento deficiente'], power:'RESTAURACIÓN PERFECTA', tool:'Lámpara de fotocurado',
    stats:[['Estética',5],['Precisión',5],['Velocidad',4],['Diagnóstico',4],['Cirugía',2]] },
  { name:'LUCÍA', specialty:'PATOLOGÍA BUCAL', role:'Detective de Lesiones', icon:'🔬', image:'characters/lucia_patologia.webp', tone:'burgundy',
    strengths:['Diagnóstico diferencial','Observación','Detección temprana'], weaknesses:['Muchos diagnósticos similares','Puede requerir biopsia'], power:'VISIÓN DIAGNÓSTICA', tool:'Lupa / microscopio digital',
    stats:[['Diagnóstico',5],['Observación',5],['Velocidad',3],['Cirugía',2],['Complejidad',5]] },
  { name:'DIEGO', specialty:'ODONTOPEDIATRÍA', role:'Héroe de los Pequeños', icon:'⭐', image:'characters/diego_odontopediatria.webp', tone:'turquoise',
    strengths:['Manejo infantil','Prevención','Comunicación'], weaknesses:['Ansiedad infantil','Cooperación variable'], power:'MODO VALIENTE', tool:'Espejo pediátrico',
    stats:[['Comunicación',5],['Prevención',5],['Diagnóstico',4],['Cirugía',3],['Paciencia',5]] },
  { name:'RENATA', specialty:'ENDODONCIA', role:'Guardiana de la Pulpa', icon:'❤️', image:'characters/renata_endodoncia.webp', tone:'red',
    strengths:['Dolor dental','Conductos','Conservación del diente'], weaknesses:['Anatomía compleja','Conductos calcificados'], power:'PULSO APICAL', tool:'Localizador apical',
    stats:[['Precisión',5],['Diagnóstico',5],['Complejidad',5],['Velocidad',3],['Estética',2]] },
  { name:'CARLOS', specialty:'DENTISTA GENERAL', role:'El Todoterreno', icon:'🪞', image:'characters/carlos_general.webp', tone:'navy',
    strengths:['Versatilidad','Diagnóstico inicial','Atención integral'], weaknesses:['Menor especialización extrema','Casos complejos requieren referencia'], power:'VISIÓN INTEGRAL', tool:'Espejo clínico',
    stats:[['Diagnóstico',4],['Versatilidad',5],['Prevención',4],['Cirugía',3],['Especialización',3]] },
  { name:'MÍA', specialty:'ASISTENTE DENTAL', role:'Control Total', icon:'🧤', image:'characters/mia_asistente.webp', tone:'sky',
    strengths:['Organización','Trabajo en equipo','Control del campo'], weaknesses:['No realiza diagnóstico independiente','Depende del procedimiento clínico'], power:'CUATRO MANOS', tool:'Eyector de alta potencia',
    stats:[['Organización',5],['Velocidad',5],['Apoyo clínico',5],['Diagnóstico',2],['Prevención',3]] },
  { name:'EMMA', specialty:'HIGIENISTA DENTAL', role:'Escudo Preventivo', icon:'🛡️', image:'characters/emma_higienista.webp', tone:'mint',
    strengths:['Prevención','Control de biofilm','Educación'], weaknesses:['No sustituye tratamiento especializado','Requiere mantenimiento periódico'], power:'BARRERA ANTIBIOFILM', tool:'Ultrasonido periodontal',
    stats:[['Prevención',5],['Educación',5],['Biofilm',5],['Cirugía',1],['Restauración',2]] },
  { name:'AURORA', specialty:'HADA DE LOS DIENTES', role:'Guardiana del Brillo Dental', icon:'🧚', image:'characters/aurora_hada_dientes.webp', tone:'legendary-mint', rarity:'LEGENDARIO',
    strengths:['Protección mágica','Curación','Inspiración infantil'], weaknesses:['Depende de energía mágica','Menor fuerza física'], power:'LLUVIA DE ESMALTE', tool:'Varita del brillo dental',
    stats:[['Magia',5],['Protección',5],['Prevención',5],['Velocidad',5],['Curación',5]] },
  { name:'DON PÉREZ', specialty:'RATÓN DE LOS DIENTES', role:'El Coleccionista Legendario', icon:'🐭', image:'characters/don_perez_raton_dientes.webp', tone:'legendary-gold', rarity:'LEGENDARIO',
    strengths:['Velocidad nocturna','Recolección perfecta','Sigilo mágico'], weaknesses:['Tamaño pequeño','Depende del factor sorpresa'], power:'RECOLECCIÓN ESTELAR', tool:'Maletín recolector de dientes',
    stats:[['Velocidad',5],['Sigilo',5],['Recolección',5],['Estrategia',5],['Magia',5]] }
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
  @media(max-width:760px){.setupTeams{grid-template-columns:1fr}.characterGrid{grid-template-columns:repeat(3,1fr)!important;max-height:42vh}.characterCard{min-height:148px!important}}

  /* Visual refresh */
  .setupTeams{gap:1.15rem!important}
  .setupTeam{border:1px solid #3d717b!important;border-radius:22px!important;padding:1.05rem!important;background:linear-gradient(180deg,#102b33,#081b21)!important;box-shadow:0 14px 32px #0006,inset 0 1px #ffffff0d!important}
  .setupTeam h3{color:#dffbff!important;text-shadow:0 0 12px #6ee7f23a!important}
  .teamInput{border:1px solid #4f8590!important;border-radius:13px!important;background:#091d23!important;color:#f3fcff!important;box-shadow:inset 0 1px #ffffff0d!important}
  .teamInput:focus{outline:2px solid #58ceda;outline-offset:2px}
  .characterGrid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:.65rem!important;max-height:52vh;overflow-y:auto;padding:.2rem .15rem .45rem;scrollbar-gutter:stable}
  .characterCard{min-height:164px!important;padding:.5rem!important;justify-content:flex-start!important;border:1px solid #315f68!important;border-radius:15px!important;background:linear-gradient(180deg,#15323a,#0b2228)!important;box-shadow:inset 0 1px #ffffff0c,0 6px 14px #0004!important;transition:transform .13s ease,border-color .17s ease,box-shadow .17s ease!important}
  .characterCard:hover:not(.unavailable){transform:translateY(-3px);border-color:#6edbe7!important}
  .charPortraitWrap{position:relative;width:100%;aspect-ratio:4/5;border-radius:12px;overflow:hidden;background:radial-gradient(circle at 50% 20%,#1e4d59,#081b21);border:1px solid #4c808a}
  .charPortrait{width:100%;height:100%;object-fit:cover;object-position:50% 20%;display:block}
  .charPortrait.missing{display:none}
  .charFallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:radial-gradient(circle,#1c4a54,#091b21)}
  .charFallback.hidden{display:none}
  .characterCard .charName{margin-top:.35rem;color:#eefcff!important;font-size:.78rem!important;letter-spacing:.04em}
  .charSpecialty{font-size:.55rem;line-height:1.1;text-align:center;color:#89dbe5;font-weight:900;letter-spacing:.035em}
  .tone-violet{box-shadow:inset 0 0 20px #8d5cff33}.tone-emerald{box-shadow:inset 0 0 20px #1fd47e33}.tone-blue{box-shadow:inset 0 0 20px #3a8fff33}.tone-petrol{box-shadow:inset 0 0 20px #1aa6a633}.tone-gold{box-shadow:inset 0 0 20px #ffc54833}.tone-burgundy{box-shadow:inset 0 0 20px #d43b6b33}.tone-turquoise{box-shadow:inset 0 0 20px #20dbc633}.tone-red{box-shadow:inset 0 0 20px #ff484833}.tone-navy{box-shadow:inset 0 0 20px #3e72ff33}.tone-sky{box-shadow:inset 0 0 20px #66ccff33}.tone-mint{box-shadow:inset 0 0 20px #7ef0db33}
  .tone-legendary-mint{box-shadow:inset 0 0 26px #6fffe866,0 0 24px #6fffe833;border-color:#bafff4!important}
  .tone-legendary-gold{box-shadow:inset 0 0 26px #ffd66d66,0 0 24px #ffc24733;border-color:#ffe39a!important}
  .charRarity{margin-top:.22rem;padding:.16rem .42rem;border-radius:999px;font-size:.48rem;font-weight:1000;letter-spacing:.09em;color:#1a1300;background:linear-gradient(180deg,#fff0a7,#e9b735);box-shadow:0 0 10px #ffc84d66}
  .characterCard.selected{border:2px solid #f0c967!important;background:linear-gradient(180deg,#453418,#251a08)!important;box-shadow:0 0 0 1px #ffeaa126,0 0 22px #e0a43142!important;transform:translateY(-2px)}
  .characterCard.unavailable{opacity:.28!important;filter:grayscale(.6)}
  .setupStart{border:1px solid #97eaf3!important;border-radius:16px!important;background:linear-gradient(180deg,#16a8bc,#087082)!important;box-shadow:inset 0 1px #ffffff26,0 10px 24px #003b45aa!important}
  .characterHint{color:#b8d0d5!important}
  .teamName .avatar{filter:drop-shadow(0 0 8px #6ee7f244)}
  .winnerStage{padding:1rem .6rem!important}
  .winnerCharacters{filter:drop-shadow(0 0 22px #f3c34d7a)!important;animation:winnerPop .45s cubic-bezier(.2,.9,.3,1.18)}
  .winnerName{color:#fff0b7!important;text-shadow:0 0 18px #e3ae365c!important}
  .winnerScore{color:#dffaff!important}
  @keyframes winnerPop{from{transform:scale(.72);opacity:0}to{transform:scale(1);opacity:1}}
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
    ? `${charText('ROBO','STEAL')}: ${character.icon} ${teamNames[currentTeam]}`
    : `${charText('TURNO','TURN')}: ${character.icon} ${teamNames[currentTeam]}`;
};

function setupCharacterCards(teamIndex, container) {
  container.innerHTML = CHARACTERS.map((character, idx) => `
    <button type="button" class="characterCard ${teamCharacters[teamIndex] === idx ? 'selected' : ''}" data-character="${idx}">
      <span class="charPortraitWrap tone-${character.tone}">
        <img class="charPortrait" src="${character.image}" alt="" onerror="this.classList.add('missing');this.nextElementSibling.classList.remove('hidden')">
        <span class="charFallback hidden" aria-hidden="true">${character.icon}</span>
      </span>
      <span class="charName">${character.name}</span>
      <span class="charSpecialty">${character.specialty}</span>
      ${character.rarity ? `<span class="charRarity">${character.rarity}</span>` : ''}
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
    <h2>${charText('ELIGE TUS EQUIPOS Y PERSONAJES','CHOOSE YOUR TEAMS AND CHARACTERS')}</h2>
    <p class="characterHint">${charText('Cada personaje es visual: ninguno da ventajas o puntos extra.','Characters are visual only: none provide advantages or extra points.')}</p>
    <div class="setupTeams">
      <section class="setupTeam">
        <h3>${charText('EQUIPO 1','TEAM 1')}</h3>
        <input id="setupName1" class="teamInput" maxlength="18" value="${teamNames[0].replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" aria-label="Nombre del equipo 1">
        <div id="charactersTeam1" class="characterGrid"></div>
      </section>
      <section class="setupTeam">
        <h3>${charText('EQUIPO 2','TEAM 2')}</h3>
        <input id="setupName2" class="teamInput" maxlength="18" value="${teamNames[1].replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" aria-label="Nombre del equipo 2">
        <div id="charactersTeam2" class="characterGrid"></div>
      </section>
    </div>
    <button id="confirmTeams" class="setupStart">${charText('COMENZAR PARTIDA · 6 RONDAS','START GAME · 6 ROUNDS')}</button>
  `);

  setupCharacterCards(0, $('#charactersTeam1'));
  setupCharacterCards(1, $('#charactersTeam2'));

  $('#confirmTeams').onclick = () => {
    const name1 = ($('#setupName1').value || charText('EQUIPO 1','TEAM 1')).trim().toUpperCase().slice(0, 18);
    const name2 = ($('#setupName2').value || charText('EQUIPO 2','TEAM 2')).trim().toUpperCase().slice(0, 18);
    if (teamCharacters[0] === teamCharacters[1]) {
      alert(charText('Cada equipo debe elegir un personaje diferente.','Each team must choose a different character.'));
      return;
    }
    teamNames = [name1 || charText('EQUIPO 1','TEAM 1'), name2 || charText('EQUIPO 2','TEAM 2')];
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
        <div class="winnerName">${charText('EMPATE','TIE')}</div>
        <div class="winnerScore">${scores[0]} ${charText('PUNTOS CADA EQUIPO','POINTS EACH')}</div>
      </div>`;
  } else {
    const winner = scores[0] > scores[1] ? 0 : 1;
    const loser = 1 - winner;
    const character = characterFor(winner);
    result = `
      <div class="winnerStage">
        <div class="winnerCharacters"><span>${character.icon}</span><span class="trophy">🏆</span></div>
        <div class="winnerName">${charText(`¡${teamNames[winner]} GANA!`,`${teamNames[winner]} WINS!`)}</div>
        <div class="winnerScore">${scores[winner]} ${charText('PUNTOS','POINTS')}</div>
        <p>${charText(`${teamNames[loser]} termina con <b>${scores[loser]}</b> puntos.`,`${teamNames[loser]} finishes with <b>${scores[loser]}</b> points.`)}</p>
      </div>`;
  }

  openModal(`
    ${result}
    <p>${charText('Marcador final = suma de los bancos ganados durante las 6 rondas.','Final score = total bank points won over the 6 rounds.')}</p>
    <p>${charText('Rondas','Rounds')} 1–2: <b>×1</b> · ${charText('Rondas','Rounds')} 3–4: <b>×2</b> · ${charText('Rondas','Rounds')} 5–6: <b>×3</b>.</p>
    <div class="menuStack">
      <button id="mAgain">${charText('OTRA PARTIDA · MISMOS EQUIPOS','PLAY AGAIN · SAME TEAMS')}</button>
      <button id="mCharacters">${charText('CAMBIAR EQUIPOS / PERSONAJES','CHANGE TEAMS / CHARACTERS')}</button>
      <button id="mHomeFinal">${charText('VOLVER A PORTADA','BACK TO HOME')}</button>
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

window.addEventListener('dentistas-language-changed', () => {
  try { updateScoreUI(); updateTurnUI(); } catch (_) {}
});


/* Perfiles de dificultad por especialidad para VS computadora.
   No alteran el modo 2 equipos; quedan disponibles para el motor CPU. */
const CHARACTER_CPU_PROFILES = {
  SOFÍA: {
    tier:'specialist', focus:['Odontopediatría y ortodoncia'],
    keywords:['ortodon','oclusión','oclusion','angle','mordida','alineador','bracket','cefalometr','aparato','apiñamiento','erupción ectópica'],
    accuracy:{focus:.90,neutral:.64,weak:.48}, delay:[900,1800]
  },
  VALERIA: {
    tier:'specialist', focus:['Periodoncia'],
    keywords:['periodon','gingiv','sondaje','inserción','insercion','bolsa','furcación','furcacion','recesión','recesion','cálculo','calculo','biofilm'],
    accuracy:{focus:.91,neutral:.63,weak:.47}, delay:[900,1750]
  },
  SANTIAGO: {
    tier:'specialist', focus:['Cirugía, anestesia y radiología'],
    keywords:['extracción','extraccion','fórceps','forceps','elevador','anestesia','quirúrg','quirurg','sutura','tercer molar'],
    accuracy:{focus:.90,neutral:.62,weak:.46}, delay:[850,1700]
  },
  ALEX: {
    tier:'expert', focus:['Cirugía, anestesia y radiología','Anatomía'],
    keywords:['maxilar','mandíbula','mandibula','cráneo','craneo','trauma','fractura','reconstrucción','reconstruccion','cbct','osteosíntesis','osteosintesis'],
    accuracy:{focus:.93,neutral:.67,weak:.50}, delay:[800,1600]
  },
  MATEO: {
    tier:'specialist', focus:['Endodoncia y restauradora','Materiales e implantes'],
    keywords:['restaur','resina','adhes','aislamiento','fotocurado','esmalte','dentina','material'],
    accuracy:{focus:.90,neutral:.64,weak:.48}, delay:[900,1800]
  },
  LUCÍA: {
    tier:'specialist', focus:['Patología y medicina oral'],
    keywords:['lesión','lesion','mucosa','biopsia','úlcera','ulcera','candid','leucoplas','eritroplas','cáncer oral','cancer oral','salival'],
    accuracy:{focus:.92,neutral:.64,weak:.47}, delay:[950,1850]
  },
  DIEGO: {
    tier:'specialist', focus:['Odontopediatría y ortodoncia','Preventiva y cariología'],
    keywords:['niñ','temporal','pulpotom','pulpectom','mantenedor','conducta','sellador','flúor','fluor','caries en niños','caries en ninos'],
    accuracy:{focus:.89,neutral:.65,weak:.49}, delay:[950,1850]
  },
  RENATA: {
    tier:'expert', focus:['Endodoncia y restauradora'],
    keywords:['endodon','pulpar','periapical','conducto','ápice','apice','irrig','hipoclorito','edta','gutapercha','longitud de trabajo','percusión','percusion'],
    accuracy:{focus:.94,neutral:.66,weak:.48}, delay:[800,1550]
  },
  CARLOS: {
    tier:'balanced', focus:[],
    keywords:[],
    accuracy:{focus:.78,neutral:.78,weak:.72}, delay:[1050,1950]
  },
  MÍA: {
    tier:'support', focus:['Preventiva y cariología','Endodoncia y restauradora'],
    keywords:['aislamiento','succión','succion','instrument','campo operatorio','biofilm','higiene','prevención','prevencion'],
    accuracy:{focus:.82,neutral:.60,weak:.42}, delay:[800,1650]
  },
  EMMA: {
    tier:'specialist', focus:['Preventiva y cariología','Periodoncia'],
    keywords:['biofilm','cálculo','calculo','profilaxis','higiene','flúor','fluor','cepill','hilo dental','prevención','prevencion','gingiv'],
    accuracy:{focus:.91,neutral:.61,weak:.43}, delay:[850,1700]
  },
  AURORA: {
    tier:'legendary', focus:[],
    keywords:[],
    accuracy:{focus:.96,neutral:.93,weak:.88}, delay:[650,1250]
  },
  'DON PÉREZ': {
    tier:'legendary', focus:[],
    keywords:[],
    accuracy:{focus:.95,neutral:.92,weak:.87}, delay:[600,1200]
  }
};

function normalizeCpuText(value='') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}

function cpuProfileFor(character) {
  return CHARACTER_CPU_PROFILES[character?.name] || CHARACTER_CPU_PROFILES.CARLOS;
}

function cpuAffinity(character, question) {
  const profile = cpuProfileFor(character);
  if (profile.tier === 'legendary') return 'focus';
  const cat = normalizeCpuText(question?.cat || '');
  const q = normalizeCpuText(question?.q || '');
  const focusHit = profile.focus.some(x => cat.includes(normalizeCpuText(x)));
  const keywordHit = profile.keywords.some(x => q.includes(normalizeCpuText(x)));
  if (focusHit || keywordHit) return 'focus';

  // Áreas quirúrgicas/endodónticas avanzadas penalizan más a perfiles de apoyo.
  if (profile.tier === 'support' && /(cirugia|endodoncia|maxilofacial|conducto|anestesia)/.test(cat + ' ' + q)) return 'weak';
  return 'neutral';
}

function cpuAccuracyFor(character, question) {
  const profile = cpuProfileFor(character);
  return profile.accuracy[cpuAffinity(character, question)] ?? profile.accuracy.neutral;
}

function cpuDelayFor(character) {
  const [min,max] = cpuProfileFor(character).delay;
  return Math.round(min + Math.random() * Math.max(0, max - min));
}

function cpuQuestionWeight(character, question) {
  const affinity = cpuAffinity(character, question);
  const tier = cpuProfileFor(character).tier;
  if (tier === 'legendary') return 2.2;
  if (affinity === 'focus') return tier === 'expert' ? 4.0 : 3.4;
  if (affinity === 'weak') return .55;
  return 1;
}

window.DentistasCharacterCPU = {
  profileFor: cpuProfileFor,
  affinity: cpuAffinity,
  accuracyFor: cpuAccuracyFor,
  delayFor: cpuDelayFor,
  questionWeight: cpuQuestionWeight
};
