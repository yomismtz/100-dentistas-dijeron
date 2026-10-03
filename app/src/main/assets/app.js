'use strict';

const $ = (s) => document.querySelector(s);
const GAME_SIZE = 8;
const TURN_SECONDS = 30;
const I18N = window.DentistasI18n;
const tx = (key) => I18N ? I18N.t(key) : key;
const narrate = (text, opts={}) => window.DentistasNarrator?.speak?.(text, opts);
const isEn = () => I18N?.getLang?.() === 'en';
const qText = q => { const ov = isEn() ? window.DentistasEnglishOverrides?.[q?.id] : null; const base = ov?.[0] || (isEn() && q?.q_en ? q.q_en : q?.q || ''); return isEn() && /^(ORG7|ORG8|ORG9|ORG10|ORG11|ORG12)-/.test(q?.id||'') && window.DentistasEnglishAutoTranslate ? window.DentistasEnglishAutoTranslate.translate(base) : base; };
const aText = (q, idx) => { const ov = isEn() ? window.DentistasEnglishOverrides?.[q?.id] : null; const base = ov?.[1]?.[idx] || (isEn() && Array.isArray(q?.a_en) && q.a_en[idx] ? q.a_en[idx] : q?.a?.[idx]?.[0] || ''); return isEn() && /^(ORG7|ORG8|ORG9|ORG10|ORG11|ORG12)-/.test(q?.id||'') && window.DentistasEnglishAutoTranslate ? window.DentistasEnglishAutoTranslate.translate(base) : base; };
const qVoiceLang = q => isEn() && q?.q_en ? 'en-US' : 'es-MX';
const BANK_FILES = [
  'bank44_original_01.json',
  'bank44_original_02.json',
  'bank44_original_03.json',
  'bank44_original_04.json',
  'bank44_original_05.json',
  'bank44_original_06.json',
  'bank44_original_07.json',
  'bank44_original_08.json',
  'bank44_original_09.json',
  'bank44_original_10.json',
  'bank44_original_11.json',
  'bank44_original_12.json',
  'bank44_original_13.json',
  'bank44_original_14.json',
  'bank44_original_15.json',
  'bank44_original_16.json',
  'bank44_original_17.json',
  'bank44_original_18.json',
  'bank44_original_19.json',
  'bank44_original_20.json',
  'bank44_original_21.json',
  'bank44_original_22.json',
  'bank44_original_23.json',
  'bank44_original_24.json',
  'bank44_original_25.json',
  'bank44_original_26.json',
  'bank44_original_27.json',
  'bank44_original_28.json',
  'bank44_original_29.json',
  'bank44_original_30.json',
  'bank44_original_31.json',
  'bank44_original_32.json',
  'bank44_original_33.json',
  'bank44_original_34.json',
  'bank44_original_35.json',
  'bank44_original_36.json',
  'bank44_original_37.json',
  'bank44_original_38.json',
  'bank44_original_39.json',
  'bank44_original_40.json',
  'bank44_original_41.json',
  'bank44_original_42.json',
  'bank44_original_43.json',
  'bank44_original_44.json',
  'bank44_original_45.json'
];

const STUDY_BANK_FILES = [
  'primer_parcial_01.json','primer_parcial_02.json','primer_parcial_03.json','primer_parcial_04.json','primer_parcial_05.json',
  'primer_parcial_06.json','primer_parcial_07.json','primer_parcial_08.json','primer_parcial_09.json','primer_parcial_10.json'
];
const EXTRA_BANK_FILES = [
  ['nomenclatura_etimologia_300.json','Nomenclatura y etimología médica'],
  ['expediente_clinico_300.json','Realización del expediente clínico'],
  ['laboratorio_ortodoncia_ortopedia_300.json','Laboratorio de ortodoncia y ortopedia']
];

let gameConfig = { mode:'teams', selectedAreas:[], teamSize:1, cpuCharacter:'NOVA', playerCharacter:'NOVA', difficulty:'mixed' };
let cpuTimerHandle = null;
let faceoffActive = false;
let faceoffDoneThisRound = false;
let faceoffCpuHandle = null;
let questionPoolPromise = null;

function loadJsonAsset(file) {
  try {
    const raw = window.AndroidAssets?.readText?.(file);
    if (raw) return Promise.resolve(JSON.parse(raw));
  } catch (_) {}
  return fetch(file).then(r => {
    if (!r.ok) throw new Error(file);
    return r.json();
  });
}

function normalizeStudyQuestion(q, forcedArea='') {
  if (!q || !q.q) return null;
  const area = forcedArea || q.category || 'Primer parcial';
  const accepted = Array.isArray(q.accepted_answers) ? q.accepted_answers.map(String).filter(Boolean) : [];
  const weights = Array.isArray(q.game_weights) ? q.game_weights.map(Number) : [];
  if (accepted.length < 3 || accepted.length > 7 || weights.length !== accepted.length) return null;
  if (weights.some(v => !Number.isFinite(v) || v <= 0) || weights.reduce((a,b)=>a+b,0) !== 100) return null;
  return {
    q:q.open_q || q.q, q_en:q.open_q_en || q.q_en || '',
    cat:area, area,
    a:accepted.map((answer,i)=>[answer,weights[i]]),
    source:q.source || 'Banco académico',
    weighting_note:q.weighting_note || ''
  };
}

function specialtyArea(q, file='') {
  const raw = [q?.q, q?.cat, q?.category, q?.subdomain, q?.source].filter(Boolean).join(' ').toLowerCase();
  const has = (...terms) => terms.some(t => raw.includes(t));

  if (file === 'questions_anatomia.json') return has('crecimiento','desarrollo','maxilar','mandíbula','mandibula','sutural','suturas') ? 'Desarrollo de los maxilares' : 'Anatomía';
  if (file === 'questions_preventiva.json') {
    if (has('fluor','sellador','cepill','higiene','placa','prevención','prevencion','índice de caries','indice de caries')) return 'Odontología preventiva';
    return 'Salud pública y odontología comunitaria';
  }
  if (file === 'questions_periodoncia.json') return 'Periodoncia';
  if (file === 'questions_endo_restauradora.json') return has('conducto','pulpa','pulpar','endodon','ápice','apice','irrig') ? 'Endodoncia' : 'Operatoria dental y restauradora';
  if (file === 'questions_protesis_atm.json') {
    if (has('atm','temporomandibular','cóndilo','condilo','disco articular','trastorno temporomandibular')) return 'Articulación temporomandibular (ATM)';
    if (has('oclusión','oclusion','contacto oclusal','guía canina','guia canina')) return 'Oclusión';
    return 'Prótesis dental';
  }
  if (file === 'questions_cirugia_radiologia.json') {
    if (has('radiograf','imagen','cbct','tomograf')) return 'Radiología oral y maxilofacial';
    if (has('fractura','ortogn','maxilofacial','le fort','trauma facial','tercer molar incluido','tercer molar retenido')) return 'Cirugía oral y maxilofacial';
    return 'Cirugía bucal';
  }
  if (file === 'questions_patologia.json') return 'Patología bucal';
  if (file === 'questions_odonto_ortho.json') return has('niñ','temporal','pediatr','conducta','mantenedor','dentición mixta','denticion mixta') ? 'Odontopediatría' : 'Ortodoncia';
  if (file === 'questions_infecciones_medicina.json') {
    if (has('infección','infeccion','absceso','celulitis','antibió','antibio','microb','bacteria','virus','hongo')) return 'Infecciones odontogénicas y microbiología';
    if (has('anestesia','anestés','anestes','analges','farmac','medicamento','dosis')) return 'Farmacología y anestesia';
    return 'Medicina bucal';
  }
  if (file === 'questions_materiales_implantes.json') {
    if (has('implant','oseointegr','periimplant')) return 'Implantología';
    if (has('biomaterial','material','resina','amalgama','cerámica','ceramica','cemento','adhesiv','yeso','alginato','silicona')) return 'Materiales dentales';
    return 'Rehabilitación oral';
  }
  if (file === 'questions.json') {
    if (has('maxilar','mandíbula','mandibula','crecimiento','desarrollo craneofacial')) return 'Desarrollo de los maxilares';
    if (has('ortopedia','aparato funcional','expansor','disyuntor')) return 'Ortopedia dentofacial';
    if (has('oclusión','oclusion')) return 'Oclusión';
    if (has('odontopediatr')) return 'Odontopediatría';
    if (has('ortodon','cefalometr')) return 'Ortodoncia';
  }
  return q?.area || q?.cat || q?.category || 'Odontología general';
}

function areaForQuestion(q) {
  return q?.area || q?.cat || 'General';
}

function availableAreas() {
  const canonicalAreas = ["Psicología infantil","Fisiología","Oclusión","Desarrollo de la oclusión","Desarrollo craneofacial","Nomenclatura y etimología médica","Hábitos y parafunciones","Laboratorio de ortodoncia y ortopedia","Realización del expediente clínico","Ortodoncia","Ortopedia maxilar","Endodoncia","Cirugía bucal","Periodoncia","Implantología","Embriología dental","Operatoria dental","Anestesia dental","Anatomía dental","Cariología","Odontopediatría","Prótesis dental","Odontología preventiva","Radiología oral y maxilofacial","Patología bucal","Medicina bucal","Farmacología odontológica","Materiales dentales","Prótesis fija","Prótesis removible","Prótesis total","Rehabilitación oral","Articulación temporomandibular y trastornos temporomandibulares","Odontología estética","Salud pública y odontología comunitaria","Microbiología oral","Infecciones odontogénicas","Urgencias médicas en odontología","Traumatología dental","Odontología geriátrica","Odontología para pacientes con necesidades especiales","Odontología forense","Bioética y legislación odontológica","Fotografía y documentación clínica odontológica","Oclusión funcional y ajuste oclusal avanzado"];
  const loaded = new Set(questionPool.map(q => areaForQuestion(q)).filter(Boolean));
  return canonicalAreas.filter(area => loaded.has(area));
}

function questionKey(q) {
  const clean = value => String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  return clean(q?.q || q?.open_q);
}

function dedupeQuestionPool(items) {
  const seen = new Set();
  return items.filter(q => {
    const key = questionKey(q);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function characterByName(name) {
  return (Array.isArray(window.DentistasCharacters) ? window.DentistasCharacters : []).find(ch => ch.name === name) || null;
}

function specialtyMatchesArea(specialty, area) {
  const norm = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const s = norm(specialty), a = norm(area);
  const aliases = {
    'ortodoncia':['ortodoncia'],
    'periodoncia':['periodoncia'],
    'cirugia bucal':['cirugia bucal'],
    'cirugia maxilofacial':['cirugia oral y maxilofacial','radiologia oral y maxilofacial'],
    'operatoria dental':['operatoria dental','restauradora','materiales dentales'],
    'patologia bucal':['patologia bucal','medicina bucal'],
    'odontopediatria':['odontopediatria'],
    'endodoncia':['endodoncia'],
    'dentista general':[],
    'asistente dental':['realizacion del expediente clinico'],
    'higienista dental':['odontologia preventiva','salud publica','periodoncia']
  };
  return (aliases[s] || [s]).some(term => term && a.includes(term));
}

function questionDifficulty(q) {
  const explicit = String(q?.difficulty || q?.dificultad || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const explicitMap = {facil:'basic',medio:'intermediate',dificil:'advanced',extremo:'extreme',super:'super',super_dificil:'super',superdifícil:'super',superdificil:'super',basic:'basic',intermediate:'intermediate',advanced:'advanced',extreme:'extreme'};
  if (explicitMap[explicit]) return explicitMap[explicit];
  const text = String(q?.q || '').toLowerCase();
  const area = areaForQuestion(q);
  const forcedCharacters = [gameConfig.playerCharacter, gameConfig.mode === 'cpu' ? gameConfig.cpuCharacter : null]
    .filter(Boolean).map(characterByName).filter(Boolean);
  if (forcedCharacters.some(ch => specialtyMatchesArea(ch.specialty, area))) return 'advanced';
  if (/caso|diagn[oó]st|tratamiento|conducta|complicaci[oó]n|diferencial|indicaci[oó]n|contraindicaci[oó]n|mecanismo|pron[oó]stico/.test(text)) return 'advanced';
  if (/define|identifica|nombre|funci[oó]n|qu[eé] es|cu[aá]l es/.test(text)) return 'basic';
  return 'intermediate';
}

function filteredPool() {
  const selected = gameConfig.selectedAreas || [];
  let pool = selected.length ? questionPool.filter(q => selected.includes(areaForQuestion(q))) : [...questionPool];
  const difficulty = gameConfig.difficulty || 'mixed';
  if (difficulty === 'mixed') return pool;
  const exact = pool.filter(q => questionDifficulty(q) === difficulty);
  return exact.length >= GAME_SIZE ? exact : pool;
}

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
let audioCtx = null;
let roundTransitionHandle = null;
let lastBankValue = 0;
let lastTurnSignature = '';
let lastActiveGameSaveAt = 0;
let sessionCorrect = 0;
let sessionStrikes = 0;
let sessionSteals = 0;
let sessionStealAttempts = 0;
let turnNarrationToken = 0;
let soundGeneration = 0;
let gamePaused = false;
let turnResolving = false;

const audio = {
  start: $('#sndStart'),
  good: $('#sndGood'),
  bad: $('#sndBad')
};

function tone(freq=440, duration=0.12, type='sine', volume=0.05) {
  try {
    const audioState = window.DentistasAudio?.state;
    if (audioState?.muted) return;
    if (audioState) volume *= Math.max(0, Math.min(1, Number(audioState.master) || 0));
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq; gain.gain.value = volume;
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now); osc.stop(now + duration);
  } catch (_) {}
}

function delayedTone(freq, duration, type, volume, delay) {
  const generation = soundGeneration;
  setTimeout(() => {
    if (generation !== soundGeneration || !gameVisible()) return;
    tone(freq, duration, type, volume);
  }, delay);
}

function gameSound(kind) {
  if (kind === 'countdown') return tone(760, .08, 'square', .035);
  if (kind === 'steal') { tone(520,.08,'triangle',.05); delayedTone(780,.14,'triangle',.05,90); return; }
  if (kind === 'victory') { [523,659,784,1047].forEach((f,i)=>delayedTone(f,.18,'triangle',.045,i*110)); return; }
  if (kind === 'transition') { tone(420,.07,'sine',.025); delayedTone(620,.1,'sine',.03,70); }
}

function stopGameAudio() {
  soundGeneration += 1;
  Object.values(audio).forEach(sound => {
    try { sound.pause(); sound.currentTime = 0; } catch (_) {}
  });
  try {
    if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
  } catch (_) {}
  audioCtx = null;
}

function play(sound) {
  try {
    const audioState = window.DentistasAudio?.state;
    if (audioState?.muted) return;
    sound.volume = audioState ? Math.max(0, Math.min(1, Number(audioState.master) || 0)) : 1;
    sound.currentTime = 0;
    const p = sound.play();
    if (p && p.catch) p.catch(() => {});
  } catch (_) {}
}

function saveState() {
  localStorage.setItem('dentistas-settings', JSON.stringify({teamNames}));
}

const GAME_SAVE_KEY = 'dentistas-active-game-v15';
const LEGACY_GAME_SAVE_KEY = 'dentistas-active-game-v14';
const GAME_SAVE_VERSION = 15;

function saveActiveGame() {
  try {
    const reason = arguments.length ? String(arguments[0] || '').slice(0,80) : '';
    if (reason === 'timer' && Date.now() - lastActiveGameSaveAt < 5000) return;
    if (!gameVisible() || phase === 'over' || !questions.length) return;
    const snapshot = {
      version: GAME_SAVE_VERSION,
      savedAt: Date.now(),
      gameConfig: JSON.parse(JSON.stringify(gameConfig)),
      questions: JSON.parse(JSON.stringify(questions)),
      roundIndex,
      revealed: [...revealed],
      strikes,
      bank,
      scores: [...scores],
      teamNames: [...teamNames],
      awardHistory: [...awardHistory],
      currentTeam,
      phase,
      timerRemaining,
      faceoffDoneThisRound,
      gamePaused,
      turnResolving: false,
      savedReason: reason
    };
    localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(snapshot));
    lastActiveGameSaveAt = Date.now();
  } catch (_) {}
}

function clearActiveGame() {
  try { localStorage.removeItem(GAME_SAVE_KEY); localStorage.removeItem(LEGACY_GAME_SAVE_KEY); } catch (_) {}
}

function normalizeSavedGame(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.questions) || !snapshot.questions.length) return null;

  snapshot.questions = snapshot.questions.filter(q => {
    return q && Array.isArray(q.a) && q.a.length >= 3 && q.a.length <= 7;
  });
  if (!snapshot.questions.length) return null;

  snapshot.roundIndex = Math.max(0, Math.min(Number(snapshot.roundIndex) || 0, snapshot.questions.length - 1));

  const currentQuestion = snapshot.questions[snapshot.roundIndex];
  if (!currentQuestion || !Array.isArray(currentQuestion.a)) return null;

  snapshot.scores = Array.isArray(snapshot.scores) && snapshot.scores.length === 2
    ? snapshot.scores.map(v => Math.max(0, Number(v) || 0))
    : [0,0];

  snapshot.revealed = Array.isArray(snapshot.revealed)
    ? snapshot.revealed.slice(0, currentQuestion.a.length)
    : [];

  while (snapshot.revealed.length < currentQuestion.a.length) snapshot.revealed.push(false);
  snapshot.revealed = snapshot.revealed.map(Boolean);

  snapshot.strikes = Math.max(0, Math.min(3, Number(snapshot.strikes) || 0));
  snapshot.bank = Math.max(0, Number(snapshot.bank) || 0);
  snapshot.currentTeam = Number(snapshot.currentTeam) === 1 ? 1 : 0;

  const validPhase = snapshot.phase === 'steal' || snapshot.phase === 'play';
  snapshot.phase = validPhase ? snapshot.phase : 'play';

  snapshot.timerRemaining = Math.max(
    1,
    Math.min(TURN_SECONDS, Number(snapshot.timerRemaining) || TURN_SECONDS)
  );

  snapshot.teamNames = Array.isArray(snapshot.teamNames) && snapshot.teamNames.length === 2
    ? snapshot.teamNames.map(v => String(v || '').trim().slice(0, 18))
    : ['EQUIPO 1','EQUIPO 2'];

  snapshot.awardHistory = Array.isArray(snapshot.awardHistory)
    ? snapshot.awardHistory
        .filter(x => x && (x.team === 0 || x.team === 1) && Number.isFinite(Number(x.points)) && Number(x.points) >= 0)
        .map(x => ({team:x.team, points:Math.max(0, Number(x.points))}))
    : [];

  snapshot.gamePaused = Boolean(snapshot.gamePaused);
  snapshot.faceoffDoneThisRound = Boolean(snapshot.faceoffDoneThisRound);
  snapshot.savedAt = Number.isFinite(Number(snapshot.savedAt)) ? Number(snapshot.savedAt) : Date.now();

  return snapshot;
}

function readActiveGame() {
  try {
    const raw = localStorage.getItem(GAME_SAVE_KEY) || localStorage.getItem(LEGACY_GAME_SAVE_KEY);
    if (!raw) return null;

    const snapshot = JSON.parse(raw);
    if (!snapshot || (snapshot.version !== 14 && snapshot.version !== GAME_SAVE_VERSION)) {
      clearActiveGame();
      return null;
    }

    const normalized = normalizeSavedGame(snapshot);
    if (!normalized) {
      clearActiveGame();
      return null;
    }

    // Migración transparente de partidas v14: al reabrir se actualizan al formato actual.
    if (normalized.version !== GAME_SAVE_VERSION) {
      normalized.version = GAME_SAVE_VERSION;
      try { localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(normalized)); localStorage.removeItem(LEGACY_GAME_SAVE_KEY); } catch (_) {}
    }
    return normalized;
  } catch (_) {
    clearActiveGame();
    return null;
  }
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('dentistas-settings') || '{}');
    if (Array.isArray(s.teamNames) && s.teamNames.length === 2) {
      teamNames = s.teamNames.map(String);
    }
  } catch (_) {}
}

function resumeActiveGame(snapshot) {
  if (!snapshot) return;
  gameConfig = {...gameConfig, ...(snapshot.gameConfig || {})};
  questions = snapshot.questions;
  roundIndex = snapshot.roundIndex;
  revealed = [...snapshot.revealed];
  strikes = Number(snapshot.strikes) || 0;
  bank = Number(snapshot.bank) || 0;
  scores = snapshot.scores.map(Number);
  teamNames = snapshot.teamNames?.length === 2 ? snapshot.teamNames.map(String) : teamNames;
  awardHistory = Array.isArray(snapshot.awardHistory) ? snapshot.awardHistory : [];
  currentTeam = Number(snapshot.currentTeam) || 0;
  phase = snapshot.phase === 'steal' ? 'steal' : 'play';
  gamePaused = Boolean(snapshot.gamePaused);
  turnResolving = false;
  timerRemaining = Math.max(1, Math.min(TURN_SECONDS, Number(snapshot.timerRemaining) || TURN_SECONDS));
  faceoffDoneThisRound = Boolean(snapshot.faceoffDoneThisRound);

  $('#home').classList.add('hidden');
  $('#game').classList.remove('hidden');
  updateScoreUI();
  showRound(false);
  updateTimerUI();
  setTimeout(() => {
    if (!gameVisible() || phase === 'over') return;
    if (gamePaused) {
      updateTimerUI();
      updateTurnUI();
      return;
    }
    if (phase === 'steal') {
      startFaceoff();
    } else if (faceoffDoneThisRound) {
      $('#answerEntry')?.classList.remove('hidden');
      startTimer(timerRemaining);
      if (gameConfig.mode === 'cpu' && currentTeam === 1) scheduleCpuTurn();
    } else {
      beginTurnAfterQuestion();
    }
  }, 120);
}

function offerResumeGame() {
  const snapshot = readActiveGame();
  if (!snapshot || !questionPool.length) return;
  const minutes = Math.max(1, Math.round((Date.now() - snapshot.savedAt) / 60000));
  const message = isEn()
    ? `A saved game was found from about ${minutes} minute${minutes === 1 ? '' : 's'} ago. Continue it?`
    : `Se encontró una partida guardada de hace aproximadamente ${minutes} minuto${minutes === 1 ? '' : 's'}. ¿Continuar?`;
  if (confirm(message)) {
    resumeActiveGame(snapshot);
  } else {
    clearActiveGame();
  }
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
  const pool = filteredPool();
  questions = shuffle(pool).slice(0, Math.min(GAME_SIZE, pool.length));
}

function roundMultiplier(index = roundIndex) {
  if (index <= 3) return 1;
  if (index <= 5) return 2;
  return 3;
}

function gameVisible() {
  return $('#game') && !$('#game').classList.contains('hidden');
}

/* Paso 8: precarga ligera para que el siguiente turno no tenga trabajo de red/DOM. */
const roundPreloadCache = new Map();

function preloadResource(url) {
  if (!url || typeof url !== 'string') return;
  try {
    if (/\\.(png|jpe?g|webp|gif|svg)(\\?|#|$)/i.test(url)) {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  } catch (_) {}
}

function preloadRound(index) {
  const q = questions[index];
  if (!q) return;
  const key = String(q.id || questionKey(q) || index);
  if (roundPreloadCache.has(key)) return;

  const payload = {
    question: qText(q),
    answers: Array.isArray(q.a) ? q.a.map((_, i) => aText(q, i)) : []
  };
  roundPreloadCache.set(key, payload);

  const imageCandidates = [q.image, q.img, q.imageUrl, q.image_url, q.clinicalImage]
    .filter(Boolean);
  imageCandidates.forEach(preloadResource);

  /* Solicita las voces antes del turno para evitar el primer retraso de TTS. */
  try {
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
  } catch (_) {}
}

function preloadAdjacentRounds(index = roundIndex) {
  // Solo anticipamos la siguiente pregunta y descartamos las anteriores.
  preloadRound(index);
  preloadRound(index + 1);

  const keep = new Set([index, index + 1].map(i => {
    const q = questions[i];
    return q ? String(q.id || questionKey(q) || i) : null;
  }).filter(Boolean));

  roundPreloadCache.forEach((_, key) => {
    if (!keep.has(key)) roundPreloadCache.delete(key);
  });
}

function updateTimerUI() {
  const timer = $('#timer');
  if (!timer) return;
  timer.textContent = phase === 'over' ? '—' : String(timerRemaining);
  timer.classList.toggle('urgent', phase !== 'over' && timerRemaining <= 10);
  timer.classList.toggle('paused', phase === 'over');
}

function invalidateTurn() {
  turnNarrationToken += 1;
  stopTimer();
  clearCpuTurn();
  window.DentistasNarrator?.stop?.();
}

function stopTimer() {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function pauseGame() {
  if (phase === 'over' || !gameVisible()) return;
  turnResolving = false;
  gamePaused = true;
  stopTimer();
  clearCpuTurn();
  turnNarrationToken += 1;
  window.DentistasNarrator?.stop?.();
  updateTimerUI();
  saveActiveGame();
}

function resumeGame() {
  if (phase === 'over' || !gameVisible()) return;
  turnResolving = false;
  gamePaused = false;
  if (faceoffActive) { startFaceoff(); return; }
  if (faceoffDoneThisRound || phase === 'steal') {
    $('#answerEntry')?.classList.remove('hidden');
    const resume = () => {
      if (phase === 'over' || gamePaused) return;
      startTimer(Math.max(1, timerRemaining));
      if (gameConfig.mode === 'cpu' && currentTeam === 1) scheduleCpuTurn();
    };
    if (phase === 'steal') {
      const intro = isEn() ? 'STEAL! ' + teamNames[currentTeam] + ', answer now.' : '¡ROBO! ' + teamNames[currentTeam] + ', responde ahora.';
      const spoken = narrate(intro,{lang:isEn()?'en-US':'es-MX',rate:.94,onend:resume,onerror:resume});
      if (spoken === false) resume();
    } else resume();
    return;
  }
  beginTurnAfterQuestion();
}

const ANSWER_STOP=new Set(['el','la','los','las','un','una','unos','unas','de','del','al','y','e','o','u','en','con','por','para','que','se','su','sus','es','son']);
const ANSWER_WORD_ALIASES={
  infante:'nino',infantil:'nino',pediatrico:'nino',
  pieza:'diente',
  gingiva:'encias',gingival:'encias',
  rx:'radiografia',radiografica:'radiografia',radiografico:'radiografia',
  tension:'presion',
  farmaco:'medicamento',farmacos:'medicamento',medicamentos:'medicamento',
  analgesia:'analgesico',analgesicos:'analgesico',
  anestesico:'anestesia',anestesicos:'anestesia',
  bacterias:'bacteria',virus:'viral'
};
const ANSWER_PHRASE_ALIASES=[
  ['rayos x','radiografia'],
  ['organo dental','diente'],
  ['pieza dental','diente'],
  ['presion sanguinea','presion arterial']
];
function normAnswer(v){
  let s=String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9ñ ]/g,' ').replace(/\s+/g,' ').trim();
  for(const [from,to] of ANSWER_PHRASE_ALIASES)s=s.replace(new RegExp('\\b'+from.replace(/ /g,'\\s+')+'\\b','g'),to);
  return s;
}
function stemWord(w){
  let x=ANSWER_WORD_ALIASES[w]||w;
  if(x.length>5&&x.endsWith('es'))x=x.slice(0,-2);
  else if(x.length>4&&x.endsWith('s'))x=x.slice(0,-1);
  return ANSWER_WORD_ALIASES[x]||x;
}
function answerTokens(v){return normAnswer(v).split(' ').filter(w=>w.length>1&&!ANSWER_STOP.has(w)).map(stemWord);}
function editDistance(a,b){const m=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)m[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return m[a.length][b.length];}
function wordClose(a,b){if(a===b)return true;if(Math.min(a.length,b.length)<4)return false;return editDistance(a,b)<=Math.max(1,Math.floor(Math.max(a.length,b.length)*.20));}
function answerVariants(q,i){
  const a=q?.a?.[i];
  const out=[aText(q,i)];
  if(Array.isArray(a)&&Array.isArray(a[2]))out.push(...a[2]);
  if(q?.aliases&&Array.isArray(q.aliases[i]))out.push(...q.aliases[i]);
  return [...new Set(out.filter(Boolean))];
}
function scoreAnswerVariant(inputText,targetText){
  const rawIn=normAnswer(inputText),rawTarget=normAnswer(targetText);
  if(!rawIn||!rawTarget)return 0;
  if(rawIn===rawTarget)return 1;
  const input=answerTokens(rawIn),target=answerTokens(rawTarget);
  if(!input.length||!target.length)return 0;
  let hits=0;
  const used=new Set();
  for(const w of input){
    const j=target.findIndex((t,idx)=>!used.has(idx)&&wordClose(w,t));
    if(j>=0){hits++;used.add(j);}
  }
  if(!hits)return 0;
  const inputCoverage=hits/input.length;
  const targetCoverage=hits/target.length;
  if(input.length===1&&hits===1)return targetCoverage>=.34?.86:0;
  return (.62*inputCoverage)+(.38*targetCoverage);
}
function matchTypedAnswerDetailed(text){
  const q=questions[roundIndex];
  const raw=String(text||'').trim();
  if(!q||!raw)return {status:'empty',index:-1,score:0};
  const input=answerTokens(raw);
  if(!input.length)return {status:'empty',index:-1,score:0};
  const ranked=[];
  q.a.forEach((a,i)=>{
    if(revealed[i])return;
    let score=0;
    for(const variant of answerVariants(q,i))score=Math.max(score,scoreAnswerVariant(raw,variant));
    if(score>0)ranked.push({i,score});
  });
  ranked.sort((a,b)=>b.score-a.score);
  if(!ranked.length||ranked[0].score<.72)return {status:'wrong',index:-1,score:ranked[0]?.score||0};
  const second=ranked[1];
  if(second&&second.score>=ranked[0].score-.055){
    return {status:'ambiguous',index:-1,score:ranked[0].score,candidates:[ranked[0].i,second.i]};
  }
  return {status:'correct',index:ranked[0].i,score:ranked[0].score};
}
function matchTypedAnswer(text){return matchTypedAnswerDetailed(text).index;}
function setAnswerFeedback(message,state=''){
  const el=$('#answerFeedback');if(!el)return;
  el.textContent=message||'';
  el.className='answerFeedback'+(state?' '+state:'');
}
function submitTypedAnswer(){
  if(phase==='over'||!gameVisible())return;
  const input=$('#answerText');
  const raw=String(input?.value||'').trim();
  const result=matchTypedAnswerDetailed(raw);
  if(result.status==='empty'){
    setAnswerFeedback('Escribe o di una respuesta antes de enviarla.','hint');
    input?.focus();return;
  }
  if(result.status==='ambiguous'){
    setAnswerFeedback('La respuesta puede coincidir con más de una opción. Sé un poco más específico.','ambiguous');
    input?.select();return;
  }
  if(input)input.value='';
  if(result.status==='correct'){
    const btn=document.querySelectorAll('#answers button')[result.index];
    setAnswerFeedback('✓ Respuesta correcta','correct');
    if(btn)revealAnswer(result.index,btn);
    return;
  }
  setAnswerFeedback('✖ Esa respuesta no está entre las opciones ocultas.','wrong');
  addStrike('answer');
}
window.DentistasVoice=window.DentistasVoice||{
  nativeResult(text,ok){
    if(typeof window.__finalVoiceHandler==='function'){
      const handler=window.__finalVoiceHandler;
      window.__finalVoiceHandler=null;
      handler(String(text||''),Boolean(ok));
      return;
    }
    const b=$('#answerMic');if(b)b.textContent='🎤 RESPONDER';
    if(!ok){setAnswerFeedback('No se entendió la respuesta. Pulsa el micrófono y repite.','hint');return;}
    submitVoiceAnswer(String(text||''));
  }
};
function submitVoiceAnswer(text){
  if (phase === 'over' || gamePaused || turnResolving) return;
  const result=matchTypedAnswerDetailed(String(text||'').trim());
  if(result.status==='empty'){
    setAnswerFeedback('No se detectó una respuesta. Pulsa el micrófono y repite.','hint');return;
  }
  if(result.status==='ambiguous'){
    setAnswerFeedback('Respuesta ambigua. Repite la respuesta de forma más específica.','ambiguous');return;
  }
  if(result.status==='correct'){
    const btn=document.querySelectorAll('#answers button')[result.index];
    setAnswerFeedback('✓ Respuesta correcta','correct');
    if(btn)revealAnswer(result.index,btn);
    return;
  }
  setAnswerFeedback('✖ Esa respuesta no está entre las opciones ocultas.','wrong');
  addStrike('answer');
}
function startVoiceAnswer(){
  if (phase === 'over' || gamePaused || turnResolving) return;
  const b=$('#answerMic');if(b)b.textContent='🎙️ ESCUCHANDO';
  const lang=isEn()?'en-US':'es-MX';
  if(window.AndroidVoice?.isAvailable?.()){window.AndroidVoice.start(lang);return;}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){if(b)b.textContent='🎤 RESPONDER';setAnswerFeedback('El reconocimiento de voz no está disponible en este dispositivo.','hint');return;}
  const rec=new SR();rec.lang=lang;rec.interimResults=false;rec.maxAlternatives=1;
  rec.onresult=e=>{const t=e.results?.[0]?.[0]?.transcript||'';submitVoiceAnswer(t);};
  rec.onerror=()=>{if(b)b.textContent='🎤 RESPONDER';setAnswerFeedback('No se entendió la respuesta. Pulsa el micrófono y repite.','hint');};
  rec.onend=()=>{if(b)b.textContent='🎤 RESPONDER';};
  try{rec.start();}catch(_){if(b)b.textContent='🎤 RESPONDER';}
}
function finishFaceoff(winner){
  if(!faceoffActive || gamePaused || turnResolving)return;
  faceoffActive=false;
  clearTimeout(faceoffCpuHandle);faceoffCpuHandle=null;
  $('#faceoff')?.classList.add('hidden');
  $('#answerEntry')?.classList.remove('hidden');
  currentTeam=winner==='cpu'?1:Number(winner)||0;
  updateTurnUI();
  saveActiveGame();
  startTimer(TURN_SECONDS);
  if(winner==='cpu') scheduleCpuTurn();
}
function startFaceoff(){
  if (gamePaused || turnResolving) return;
  // Paso 3: el robo es automático. No hay segundo careo; el equipo rival recibe directamente el turno.
  if(phase === 'steal'){
    faceoffActive=false;
    clearTimeout(faceoffCpuHandle);faceoffCpuHandle=null;
    $('#faceoff')?.classList.add('hidden');
    $('#answerEntry')?.classList.remove('hidden');
    updateTurnUI();
    const stealIntro = isEn()
      ? `STEAL! ${teamNames[currentTeam]}, answer now.`
      : `¡ROBO! ${teamNames[currentTeam]}, responde ahora.`;
    const resume = () => {
      startTimer(TURN_SECONDS);
      if(gameConfig.mode==='cpu'&&currentTeam===1) scheduleCpuTurn();
    };
    const spoken = narrate(stealIntro,{lang:isEn()?'en-US':'es-MX',rate:.94,onend:resume,onerror:resume});
    if(spoken===false) resume();
    return;
  }
  if(faceoffDoneThisRound){
    $('#answerEntry')?.classList.remove('hidden');
    startTimer(TURN_SECONDS);
    if(gameConfig.mode==='cpu'&&currentTeam===1) scheduleCpuTurn();
    return;
  }
  faceoffDoneThisRound=true;
  faceoffActive=true;
  saveActiveGame();
  const fq=$('#faceoffQuestion');
  if(fq) fq.textContent=qText(questions[roundIndex]);
  $('#faceoff')?.classList.remove('hidden');
  $('#answerEntry')?.classList.add('hidden');
  const b1=$('#faceoffTeam1'), b2=$('#faceoffTeam2');
  if(b1)b1.textContent='🦷 '+(teamNames[0]||'EQUIPO 1');
  if(b2)b2.textContent='🦷 '+(teamNames[1]||'EQUIPO 2');
  if(gameConfig.mode==='cpu'){
    if(b2)b2.textContent='🤖 '+(teamNames[1]||'COMPUTADORA');
    const ch=cpuCharacterObject();
    const base=window.DentistasCharacterCPU?.delayFor?.(ch)||1200;
    faceoffCpuHandle=setTimeout(()=>finishFaceoff(1),Math.max(700,Math.min(3000,base+Math.random()*900)));
  }
}
function beginTurnAfterQuestion() {
  if (gamePaused || turnResolving) return;
  invalidateTurn();
  timerRemaining = TURN_SECONDS;
  updateTimerUI();
  const q = questions[roundIndex];
  if (!q || phase === 'over' || !gameVisible()) return;

  const token = ++turnNarrationToken;
  const start = () => {
    if (token !== turnNarrationToken || phase === 'over' || !gameVisible()) return;
    startFaceoff();
  };

  const spoken = narrate(qText(q), {lang:qVoiceLang(q), rate:.9, onend:start, onerror:start});
  if (spoken === false) start();
}

function startTimer(initialSeconds = TURN_SECONDS) {
  stopTimer();
  if (gamePaused) return;
  if (phase === 'over' || !gameVisible()) {
    updateTimerUI();
    return;
  }

  timerRemaining = Math.max(1, Number(initialSeconds) || TURN_SECONDS);
  updateTimerUI();

  timerHandle = setInterval(() => {
    timerRemaining -= 1;
    updateTimerUI();
    if (timerRemaining > 0 && timerRemaining <= 10) {
      const urgency = 11 - timerRemaining;
      gameSound('countdown');
      const timerEl=$('#timer');
      timerEl?.classList.remove('countdownPulse');
      void timerEl?.offsetWidth;
      timerEl?.classList.add('countdownPulse');
      if (timerRemaining <= 3) setTimeout(() => tone(900 + urgency * 35, .08, 'square', .055), 170);
    }

    if (timerRemaining <= 0) {
      stopTimer();
      addStrike('timeout');
    }
    // El guardado ya está limitado por ventana de tiempo; evitamos escrituras innecesarias.
    saveActiveGame('timer');
  }, 1000);
}

function updateScoreUI() {
  $('#s1').textContent = scores[0];
  $('#s2').textContent = scores[1];
  document.querySelectorAll('.teamName').forEach((b, idx) => b.textContent = teamNames[idx]);
}

function animatePointsGain(points) {
  if (!points || points <= 0 || !gameVisible()) return;
  const bankBox = document.querySelector('.bank');
  if (!bankBox) return;
  const el = document.createElement('div');
  el.className = 'pointsFloat';
  el.textContent = `+${points}`;
  bankBox.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => el.remove(), 850);
}
function updateBankUI() {
  const value = $('#bank');
  const box = document.querySelector('.bank');
  const changed = bank !== lastBankValue;
  if (value) value.textContent = bank;
  if (box && changed) {
    const delta = bank - lastBankValue;
    box.classList.remove('bump','bankFlash','bankGain','bankDrop');
    void box.offsetWidth;
    box.classList.add('bump');
    if (delta > 0) {
      box.classList.add('bankGain');
      animatePointsGain(delta);
    } else if (delta < 0) {
      box.classList.add('bankDrop');
    }
    setTimeout(() => box.classList.remove('bump','bankFlash','bankGain','bankDrop'), 520);
  }
  lastBankValue = bank;
}

function updateStrikesUI() {
  $('#strikes').textContent = '✖ '.repeat(strikes).trim();
}


function cpuCharacterObject() {
  const list = window.DentistasCharacters || window.CHARACTERS || [];
  if (Array.isArray(list)) return list.find(c => c.name === gameConfig.cpuCharacter) || {name:gameConfig.cpuCharacter};
  return {name:gameConfig.cpuCharacter};
}

function clearCpuTurn() {
  if (cpuTimerHandle) {
    clearTimeout(cpuTimerHandle);
    cpuTimerHandle = null;
  }
}

function scheduleCpuTurn() {
  clearCpuTurn();
  if (gameConfig.mode !== 'cpu' || currentTeam !== 1 || phase === 'over' || !gameVisible()) return;
  const q = questions[roundIndex];
  if (!q) return;
  const character = cpuCharacterObject();
  const delay = window.DentistasCharacterCPU?.delayFor?.(character) || 1200;
  cpuTimerHandle = setTimeout(() => {
    cpuTimerHandle = null;
    if (gameConfig.mode !== 'cpu' || currentTeam !== 1 || phase === 'over' || gamePaused || turnResolving || !gameVisible()) return;
    const hidden = revealed.map((v,i)=>v ? -1 : i).filter(i=>i>=0);
    const accuracy = window.DentistasCharacterCPU?.accuracyFor?.(character,q) ?? .72;
    if (hidden.length && Math.random() <= accuracy) {
      const idx = hidden[Math.floor(Math.random()*hidden.length)];
      const btn = document.querySelectorAll('#answers button')[idx];
      if (btn) revealAnswer(idx, btn);
    } else {
      addStrike('cpu');
    }
  }, Math.min(3500, Math.max(650, delay)));
}

function updateTurnUI() {
  const turn = $('#turn');
  const teams = document.querySelectorAll('.team');
  teams.forEach((el, idx) => {
    el.classList.toggle('active', phase !== 'over' && idx === currentTeam);
    el.classList.toggle('steal', phase === 'steal' && idx === currentTeam);
  });

  if (phase === 'steal') {
    turn.textContent = `${tx('steal')}: ${teamNames[currentTeam]}`;
    $('#buzz').textContent = tx('failedSteal');
  } else if (phase === 'over') {
    turn.textContent = tx('roundOver');
    $('#buzz').textContent = tx('error');
  } else {
    turn.textContent = `${tx('turn')}: ${teamNames[currentTeam]}`;
    $('#buzz').textContent = tx('error');
  }

  const turnSignature = `${phase}:${currentTeam}`;
  if (turn && turnSignature !== lastTurnSignature) {
    turn.classList.remove('turnPulse');
    void turn.offsetWidth;
    turn.classList.add('turnPulse');
    setTimeout(() => turn.classList.remove('turnPulse'), 380);
    lastTurnSignature = turnSignature;
  }

  $('#buzz').disabled = phase === 'over' || gamePaused || turnResolving;
  const mic = $('#answerMic');
  if (mic) mic.disabled = phase === 'over' || gamePaused || turnResolving;
  document.querySelectorAll('.award').forEach(b => b.disabled = phase === 'over' || gamePaused || bank <= 0);
  updateTimerUI();
}

function showRoundTransition() {
  const old = document.querySelector('#roundTransition');
  if (old) old.remove();
  const overlay = document.createElement('div');
  overlay.id = 'roundTransition';
  overlay.className = 'roundTransition';
  const mult = roundMultiplier();
  const lang = I18N?.getLang?.() || 'es';
  overlay.innerHTML = `<div class="roundTransitionCard"><span>${lang === 'en' ? 'ROUND' : 'RONDA'} ${roundIndex + 1}</span><strong>×${mult}</strong><small>${lang === 'en' ? 'POINTS' : 'PUNTOS'}</small></div>`;
  document.body.appendChild(overlay);
  gameSound('transition');
  // La pregunta se narra inmediatamente después: no superponer la voz de "Ronda"
  // con la narración de la pregunta. La transición es solo visual y muy breve.
  clearTimeout(roundTransitionHandle);
  roundTransitionHandle = setTimeout(() => overlay.classList.add('hide'), 220);
  setTimeout(() => overlay.remove(), 360);
}

function showRound(reset = true) {
  if (!questions.length) return;
  turnResolving = false;
  const preservedTime = timerRemaining;
  stopTimer();
  roundIndex = Math.max(0, Math.min(roundIndex, questions.length - 1));

  if (reset) {
    setAnswerFeedback('');
    revealed = Array(questions[roundIndex].a.length).fill(false);
    strikes = 0;
    bank = 0;
    phase = 'play';
    currentTeam = roundIndex % 2;
    faceoffDoneThisRound = false;
  }

  const q = questions[roundIndex];
  preloadAdjacentRounds(roundIndex);
  const mult = roundMultiplier();
  $('#round').textContent = `${tx('round')} ${roundIndex + 1} · ×${mult}`;
  $('#progress').textContent = `${roundIndex + 1} / ${questions.length}`;
  $('#question').textContent = qText(q);

  updateStrikesUI();
  updateBankUI();

  const box = $('#answers');
  box.innerHTML = '';
  q.a.forEach((answer, idx) => {
    const btn = document.createElement('button');
    btn.className = revealed[idx] ? 'answer revealed' : 'answer covered';
    btn.innerHTML = `<span class="num">${idx + 1}</span><span class="txt">${aText(q, idx)}</span><span class="pts">${answer[1]}</span>`;
    btn.addEventListener('click', () => revealAnswer(idx, btn));
    box.appendChild(btn);
  });

  updateTurnUI();
  if (reset) showRoundTransition();
  try {
    window.dispatchEvent(new CustomEvent('dentistas-round-shown', {
      detail: { roundIndex, total: questions.length }
    }));
    window.DentistasPerformance?.memoryCheck?.();
  } catch (_) {}
  if (reset) beginTurnAfterQuestion();
  else startTimer(preservedTime);
}

function revealRemainingAndNarrate(onDone) {
  stopTimer();
  clearCpuTurn();
  turnNarrationToken += 1;
  window.DentistasNarrator?.stop?.();
  const q = questions[roundIndex];
  const buttons = document.querySelectorAll('#answers button');
  const remaining = [];
  revealed.forEach((isShown, idx) => {
    if (isShown) return;
    revealed[idx] = true;
    const btn = buttons[idx];
    if (btn) {
      btn.classList.remove('covered');
      btn.classList.add('revealed');
      btn.disabled = true;
    }
    remaining.push(`${aText(q, idx)}. ${Number(q.a[idx][1]) || 0} ${tx('points')}.`);
  });
  const finish = () => { if (typeof onDone === 'function') onDone(); };
  if (!remaining.length) { finish(); return; }
  const spoken = narrate(remaining.join(' '), {lang:qVoiceLang(q), rate:.9, onend:finish, onerror:finish});
  if (spoken === false) finish();
}

function animateScoreGain(team, points) {
  if (!points || points <= 0) return;
  const teamEls = document.querySelectorAll('.team');
  const target = teamEls[team];
  if (!target) return;
  const el = document.createElement('div');
  el.className = 'scoreFloat';
  el.textContent = `+${points}`;
  target.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => el.remove(), 1100);
}
function showRoundPointsAward(team, points){
  const old = document.querySelector('.roundPointsAward');
  if(old) old.remove();
  const el = document.createElement('div');
  el.className = 'roundPointsAward';
  el.innerHTML = `<strong>+${points}</strong><span>${teamNames[team] || ''}</span>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => el.remove(), 1200);
}
function announceRoundWinner(team, points, reason='bank'){
  const name = team !== null && team !== undefined ? teamNames[team] : '';
  const lastRound = roundIndex >= questions.length - 1;
  const message = reason === 'steal'
    ? (isEn() ? `Steal successful. ${name} wins the bank: ${points} points.` : `¡Robo exitoso! ${name} gana el banco: ${points} puntos.`)
    : (isEn() ? `${name} wins the round and receives ${points} points.` : `${name} gana la ronda y recibe ${points} puntos.`);
  const finish = () => {
    setTimeout(() => {
      if (lastRound) finishGame();
      else nextRound();
    }, 500);
  };
  const spoken = narrate(message, {lang:isEn()?'en-US':'es-MX', rate:.9, onend:finish, onerror:finish});
  if (spoken === false) finish();
}
function endRoundAfterSteal(winnerTeam, successful) {
  const pointsWon = Math.max(0, Number(bank) || 0);
  // El robo/fallo asigna el banco exactamente una sola vez.
  // Si el robo falla, vuelve al equipo que construyó el banco.
  const awardedTeam = successful
    ? (winnerTeam === 1 ? 1 : 0)
    : (winnerTeam === null ? 1 - currentTeam : (winnerTeam === 1 ? 1 : 0));

  if (pointsWon > 0) {
    awardHistory.push({team:awardedTeam, points:pointsWon});
    scores[awardedTeam] += pointsWon;
  }

  bank = 0;
  phase = 'over';
  clearActiveGame();
  updateScoreUI();
  updateBankUI();
  updateTurnUI();
  if (pointsWon > 0) showRoundPointsAward(awardedTeam, pointsWon);
  revealRemainingAndNarrate(() => {
    if (successful) announceRoundWinner(winnerTeam, pointsWon, 'steal');
    else {
      const lastRound = roundIndex >= questions.length - 1;
      const message = isEn()
        ? `Steal failed. ${teamNames[awardedTeam]} keeps the ${pointsWon}-point bank.`
        : `Robo fallido. ${teamNames[awardedTeam]} conserva el banco de ${pointsWon} puntos.`;
      const finish = () => setTimeout(() => lastRound ? finishGame() : nextRound(), 500);
      const spoken = narrate(message, {lang:isEn()?'en-US':'es-MX',rate:.9,onend:finish,onerror:finish});
      if (spoken === false) finish();
    }
  });
}
function awardCompletedRound(team, points){
  if (phase === 'over' || gamePaused || turnResolving) return;
  team = team === 1 ? 1 : 0;
  // La fuente de verdad es el banco actual; evita discrepancias por un valor stale.
  const awardedPoints = Math.max(0, Number(bank) || 0);
  bank = 0;
  if (awardedPoints > 0) {
    awardHistory.push({team, points:awardedPoints});
    scores[team] += awardedPoints;
  }
  phase = 'over';
  clearActiveGame();
  if (awardedPoints > 0) animateScoreGain(team, awardedPoints);
  updateScoreUI();
  updateBankUI();
  updateTurnUI();
  if (points > 0) showRoundPointsAward(team, points);
  const message = isEn()
    ? `${teamNames[team]} wins the round and receives ${points} points.`
    : `${teamNames[team]} gana la ronda y recibe ${points} puntos.`;
  const finish = () => setTimeout(() => {
    if (roundIndex >= questions.length - 1) finishGame();
    else nextRound();
  }, 500);
  const spoken = narrate(message, {lang:isEn()?'en-US':'es-MX',rate:.9,onend:finish,onerror:finish});
  if (spoken === false) finish();
}

function revealAnswer(idx, btn) {
  if (phase === 'over' || gamePaused || turnResolving || revealed[idx]) return;
  turnResolving = true;
  stopTimer(); clearCpuTurn(); turnNarrationToken += 1; window.DentistasNarrator?.stop?.();

  const q = questions[roundIndex];
  revealed[idx] = true;
  sessionCorrect += 1;
  saveActiveGame();
  btn.classList.remove('covered'); btn.classList.add('revealed'); btn.disabled = true;

  if (phase === 'steal') {
    sessionStealAttempts += 1;
    sessionSteals += 1;
    const answerAnnouncement = `${aText(q, idx)}. ${Number(q.a[idx][1]) || 0} ${tx('points')}.`;
    const finish = () => { turnResolving = false; endRoundAfterSteal(currentTeam, true); };
    showCorrectFeedback(isEn() ? 'STEAL SUCCESSFUL' : '¡ROBO EXITOSO!');
    const spoken = narrate(answerAnnouncement, {lang:qVoiceLang(q), rate:.93, onend:finish, onerror:finish});
    if (spoken === false) finish();
    return;
  }

  showCorrectFeedback(isEn() ? 'CORRECT!' : '¡CORRECTO!');
  const gainedPoints = (Number(q.a[idx][1]) || 0) * roundMultiplier();
  bank += gainedPoints;
  updateBankUI();
  play(audio.good);
  updateTurnUI();
  const allRevealed = revealed.every(Boolean);
  if (allRevealed) {
    const finishRound = () => { turnResolving = false; awardCompletedRound(currentTeam, bank); };
    const spoken = narrate(`${aText(q, idx)}. ${gainedPoints} ${tx('points')}.`, {lang:qVoiceLang(q), rate:.93, onend:finishRound, onerror:finishRound});
    if (spoken === false) finishRound();
    return;
  }
  const nextTurn = () => {
    if (phase === 'over' || !gameVisible()) return;
    setTimeout(() => {
      turnResolving = false;
      if (!gamePaused && phase !== 'over' && gameVisible()) beginTurnAfterQuestion();
    }, 500);
  };
  const spoken = narrate(`${aText(q, idx)}. ${gainedPoints} ${tx('points')}.`, {lang:qVoiceLang(q), rate:.93, onend:nextTurn, onerror:nextTurn});
  if (spoken === false) nextTurn();
}

function flashThreeStrikes() {
  const flash = $('#strikeFlash');
  flash.classList.remove('hidden');
  setTimeout(() => flash.classList.add('hidden'), 900);
}

function showErrorFeedback(message, level = 1) {
  const el = $('#answerFeedback');
  if (!el) return;
  el.className = 'answerFeedback errorFeedback';
  el.textContent = message;
  el.dataset.level = String(level);
  el.classList.remove('errorPulse');
  void el.offsetWidth;
  el.classList.add('errorPulse');
  setTimeout(() => { if (el.dataset.level === String(level)) el.classList.remove('errorPulse'); }, 900);
}

function showCorrectFeedback(message) {
  const el = $('#answerFeedback');
  if (!el) return;
  el.className = 'answerFeedback correctFeedback';
  el.textContent = message;
  el.classList.remove('correctPulse');
  void el.offsetWidth;
  el.classList.add('correctPulse');
  setTimeout(() => el.classList.remove('correctPulse'), 900);
}

function addStrike(reason = 'manual') {
  if (phase === 'over' || gamePaused || turnResolving) return;
  sessionStrikes += 1;
  if (strikes >= 3 && phase !== 'steal') return;
  turnResolving = true;
  stopTimer(); clearCpuTurn(); turnNarrationToken += 1; window.DentistasNarrator?.stop?.();

  if (phase === 'steal') {
    sessionStealAttempts += 1;
    play(audio.bad);
    showErrorFeedback(isEn() ? 'STEAL FAILED' : 'ROBO FALLIDO', 3);
    turnResolving = false;
    endRoundAfterSteal(null, false);
    return;
  }

  if (strikes >= 3) return;
  strikes += 1;
  saveActiveGame();
  updateStrikesUI();
  play(audio.bad);

  const labels = isEn()
    ? ['','FIRST MISTAKE','SECOND MISTAKE','THIRD MISTAKE']
    : ['','PRIMER ERROR','SEGUNDO ERROR','TERCER ERROR'];
  showErrorFeedback(labels[strikes], strikes);

  if (strikes >= 3) {
    strikes = 3;
    flashThreeStrikes();
    const previousTeam = currentTeam;
    currentTeam = 1 - currentTeam;
    phase = 'steal';
    saveActiveGame();
    updateTurnUI();
    const intro = isEn()
      ? `Third mistake. ${teamNames[previousTeam]} loses control. ${teamNames[currentTeam]} can steal the bank.`
      : `Tercer error. ${teamNames[previousTeam]} pierde el control. ${teamNames[currentTeam]} puede robar el banco.`;
    const startSteal = () => { turnResolving = false; beginTurnAfterQuestion(); };
    const spoken = narrate(intro, {lang:isEn()?'en-US':'es-MX', rate:.92, onend:startSteal, onerror:startSteal});
    if (spoken === false) startSteal();
    return;
  }

  updateTurnUI();
  const warning = isEn()
    ? `Second mistake. ${teamNames[1-currentTeam]} may now discuss possible answers as a team.`
    : `Segundo error. ${teamNames[1-currentTeam]} ya puede reunirse y buscar alternativas.`;
  const resume = () => { turnResolving = false; beginTurnAfterQuestion(); };
  const spoken = strikes === 2
    ? narrate(warning, {lang:isEn()?'en-US':'es-MX', rate:.92, onend:resume, onerror:resume})
    : false;
  if (spoken === false) resume();
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

  revealRemainingAndNarrate(() => openModal(
    isEn() ? `<h2>BANK AWARDED</h2><p><b>${teamNames[idx]}</b> receives <b>${pointsWon} points</b>.</p><p>${roundIndex === questions.length - 1 ? 'Press ▶ to see the final result.' : 'Press ▶ to continue.'}</p>` : `<h2>BANCO ASIGNADO</h2><p><b>${teamNames[idx]}</b> recibe <b>${pointsWon} puntos</b>.</p><p>${roundIndex === questions.length - 1 ? 'Pulsa ▶ para ver el resultado final.' : 'Pulsa ▶ para continuar.'}</p>`
  ));
}

function undoAward() {
  const last = awardHistory.pop();
  if (!last) return;

  scores[last.team] = Math.max(0, scores[last.team] - last.points);
  bank += last.points;
  currentTeam = last.team;
  phase = 'play';
  strikes = 0;
  saveActiveGame();

  updateScoreUI();
  updateBankUI();
  updateStrikesUI();
  updateTurnUI();
  startTimer();
}

function resetRound() {
  showRound(true);
}


function areaSelectorHtml(title) {
  const areas = availableAreas();
  return `
    <h2>${title}</h2>
    <p>Selecciona entre <b>1 y 5</b> especialidades o apartados. Si eliges varias, se mezclarán durante la partida.</p>
    <div id="areaPicker" class="areaPicker">
      ${areas.map(a=>`<button type="button" class="areaPick" data-area="${a.replace(/"/g,'&quot;')}">${a}</button>`).join('')}
    </div>
    <p id="areaCount"><b>0 / 5</b> seleccionadas</p>
    <div class="menuStack"><button id="startConfigured" class="primary" disabled>INICIAR PARTIDA</button></div>`;
}

function wireAreaPicker() {
  const chosen = new Set();
  const count = $('#areaCount');
  const startBtn = $('#startConfigured');
  document.querySelectorAll('.areaPick').forEach(btn => {
    btn.onclick = () => {
      const area = btn.dataset.area;
      if (chosen.has(area)) {
        chosen.delete(area);
        btn.classList.remove('selected');
      } else {
        if (chosen.size >= 5) return;
        chosen.add(area);
        btn.classList.add('selected');
      }
      if (count) count.innerHTML = `<b>${chosen.size} / 5</b> seleccionadas`;
      if (startBtn) startBtn.disabled = chosen.size < 1;
    };
  });
  startBtn.onclick = () => {
    gameConfig.selectedAreas = [...chosen];
    showDifficultySelector();
  };
}

function showAreaSelector(mode) {
  gameConfig.mode = mode;
  const label = mode === 'cpu' ? 'CONTRA LA COMPUTADORA' : mode === '1v1' ? '1 CONTRA 1' : 'EQUIPO CONTRA EQUIPO';
  openModal(areaSelectorHtml(label));
  wireAreaPicker();
}

function showDifficultySelector() {
  openModal(`
    <h2>🎓 DIFICULTAD</h2>
    <p>Elige la dificultad general. Para desbloquear al personaje de una especialidad, la ronda final debe superarse en <b>SÚPER DIFÍCIL</b>.</p>
    <div class="menuStack">
      <button data-difficulty="basic">🟢 BÁSICO</button>
      <button data-difficulty="intermediate">🟡 INTERMEDIO</button>
      <button data-difficulty="advanced">🔴 AVANZADO</button>
      <button data-difficulty="extreme">⚫ EXTREMO</button>
      <button data-difficulty="super">🟣 SÚPER DIFÍCIL</button>
      <button data-difficulty="mixed">🎲 MIXTO</button>
    </div>`);
  document.querySelectorAll('[data-difficulty]').forEach(btn => btn.onclick = () => {
    gameConfig.difficulty = btn.dataset.difficulty;
    closeModal(false);
    startNewGame();
  });
}

function showPlayerCharacterSelector(next) {
  const chars = Array.isArray(window.DentistasCharacters) ? window.DentistasCharacters : [];
  openModal(`
    <h2>🦷 ELIGE TU PERSONAJE</h2>
    <p>NOVA está disponible desde el inicio. Los especialistas se desbloquean con tu progreso académico.</p>
    <div class="cpuPicker">
      ${chars.map(ch => {
        const unlocked = typeof window.DentistasCharacterUnlocked === 'function' ? window.DentistasCharacterUnlocked(ch) : ch.name === 'NOVA';
        return `<button type="button" data-player="${ch.name}" ${unlocked?'':'disabled'}>${unlocked?'':'🔒 '}${ch.specialty}</button>`;
      }).join('')}
    </div>`);
  document.querySelectorAll('[data-player]:not([disabled])').forEach(btn => btn.onclick = () => {
    gameConfig.playerCharacter = btn.dataset.player;
    if (typeof next === 'function') next();
  });
}

function showTeamSetup() {
  openModal(`
    <h2>👥 EQUIPO CONTRA EQUIPO</h2>
    <p>Elige cuántas personas habrá en cada equipo.</p>
    <div class="menuStack setupGrid">
      <button data-team-size="1">1 vs 1</button>
      <button data-team-size="2">2 vs 2</button>
      <button data-team-size="3">3 vs 3</button>
      <button data-team-size="4">4 vs 4</button>
    </div>`);
  document.querySelectorAll('[data-team-size]').forEach(btn => btn.onclick = () => {
    gameConfig.teamSize = Number(btn.dataset.teamSize) || 1;
    teamNames = ['EQUIPO 1','EQUIPO 2'];
    showAreaSelector('teams');
  });
}

function showCpuSetup() {
  const chars = Array.isArray(window.DentistasCharacters) ? window.DentistasCharacters : [];
  const fallback = ['SOFÍA','VALERIA','SANTIAGO','ALEX','MATEO','LUCÍA','DIEGO','RENATA','CARLOS','MÍA','EMMA','EL RATÓN DE LOS DIENTES','LA MUELA DEL JUICIO','SANTA APOLONIA','EL DIOS DE LOS DIENTES','NOVA'];
  const names = chars.length ? chars.map(c=>c.name) : fallback;
  openModal(`
    <h2>🤖 CONTRA LA COMPUTADORA</h2>
    <p>Elige al especialista que será tu rival.</p>
    <div class="cpuPicker">
      ${names.map(n=>{const ch=chars.find(c=>c.name===n);return `<button type="button" data-cpu="${n}">${ch?.specialty||n}</button>`}).join('')}
    </div>`);
  document.querySelectorAll('[data-cpu]').forEach(btn => btn.onclick = () => {
    gameConfig.cpuCharacter = btn.dataset.cpu;
    teamNames = ['JUGADOR', gameConfig.cpuCharacter];
    showAreaSelector('cpu');
  });
}

function showOneVsOneSetup() {
  teamNames = ['JUGADOR 1','JUGADOR 2'];
  gameConfig.teamSize = 1;
  showAreaSelector('1v1');
}

function startFinalChallenge(){
  invalidateTurn();
  // Final: 10 preguntas, 15 s por pregunta y 150 s de tiempo total.
  // "PASO", "SKIP" y "NEXT" dejan la pregunta pendiente para el repaso final.
  gameConfig.difficulty = 'super';
  const selectedAreas = gameConfig.selectedAreas || [];
  const selectedPool = selectedAreas.length
    ? questionPool.filter(q => selectedAreas.includes(areaForQuestion(q)))
    : [...questionPool];
  const superPool = selectedPool.filter(q => questionDifficulty(q) === 'super');

  if(superPool.length < 10){
    openModal(isEn()
      ? '<h2>FINAL UNAVAILABLE</h2><p>There are not enough SÚPER DIFÍCIL questions in the selected area(s) to build the 10-question final.</p>'
      : '<h2>RONDA FINAL NO DISPONIBLE</h2><p>No hay suficientes preguntas de SÚPER DIFÍCIL en los apartados seleccionados para formar las 10 preguntas de la final.</p>');
    return;
  }

  const pool = shuffle(superPool).slice(0,10);
  const pending = [];
  let n = 0;
  let total = 0;
  let finalResolving = false;
  let finalTimer = null;
  let finalSeconds = 15;
  let finalTotalSeconds = 150;
  let phase = 'firstPass';
  let currentPoolIndex = -1;

  const stopFinalTimer = () => {
    if(finalTimer){ clearInterval(finalTimer); finalTimer = null; }
  };

  const cleanup = () => {
    stopFinalTimer();
    finalResolving = true;
  };

  const normalizeFinalCommand = text =>
    String(text || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')
      .replace(/[^a-z0-9 ]/g,' ')
      .replace(/\\s+/g,' ').trim();

  const isSkipCommand = text => {
    const v = normalizeFinalCommand(text);
    return v === 'paso' || v === 'skip' || v === 'skid' || v === 'next' || v === 'siguiente';
  };

  const recordAnswer = (q, txt, timeout = false) => {
    const oldQ = questions[roundIndex];
    const oldRev = revealed;
    questions[roundIndex] = q;
    revealed = Array(q.a.length).fill(false);

    const idx = txt ? matchTypedAnswer(txt) : -1;

    questions[roundIndex] = oldQ;
    revealed = oldRev;

    const pts = idx >= 0 ? (Number(q.a[idx][1]) || 0) : 0;
    total += pts;
    return {
      idx,
      pts,
      said: idx >= 0
        ? aText(q, idx)
        : (timeout
          ? (isEn() ? 'Time' : 'Tiempo agotado')
          : (isEn() ? 'No valid answer' : 'Sin respuesta válida'))
    };
  };

  const moveToNext = () => {
    stopFinalTimer();
    n += 1;
    finalResolving = false;
    ask();
  };

  const resolveNormalAnswer = (q, txt, timeout = false) => {
    const result = recordAnswer(q, txt, timeout);
    const spoken = narrate(`${result.said}. ${result.pts} ${tx('points')}.`, {
      lang:qVoiceLang(q), rate:.93,
      onend:moveToNext, onerror:moveToNext
    });
    if(spoken === false) moveToNext();
  };

  const skipCurrent = () => {
    if(finalResolving) return;
    finalResolving = true;
    stopFinalTimer();

    if(!pending.includes(currentPoolIndex)) pending.push(currentPoolIndex);

    const q = pool[currentPoolIndex];
    const next = () => {
      stopFinalTimer();
      n += 1;
      finalResolving = false;
      ask();
    };
    const spoken = narrate(
      isEn() ? 'Skipped. We will return to this question if time remains.' : 'Paso. Regresaremos a esta pregunta si queda tiempo.',
      {lang:isEn()?'en-US':'es-MX', rate:.96, onend:next, onerror:next}
    );
    if(spoken === false) next();
  };

  const finish = (timeout = false) => {
    if(finalResolving) return;

    const q = pool[currentPoolIndex];
    const txt = timeout ? '' : String($('#finalAnswer')?.value || '').trim();

    // PASO/SKIP/SKID/NEXT debe entrar al flujo de pausa antes de activar
    // el guard de resolución; de lo contrario skipCurrent() sería bloqueado.
    if(!timeout && isSkipCommand(txt)){
      skipCurrent();
      return;
    }

    finalResolving = true;
    stopFinalTimer();
    resolveNormalAnswer(q, txt, timeout);
  };

  const startQuestionTimer = () => {
    if(finalResolving) return;
    finalSeconds = 15;
    const el = $('#finalSeconds');
    if(el) el.textContent = '15';

    stopFinalTimer();
    finalTimer = setInterval(() => {
      if(finalResolving) return;
      finalSeconds -= 1;
      finalTotalSeconds -= 1;

      const timerEl = $('#finalSeconds');
      const totalEl = $('#finalTotalSeconds');
      if(timerEl) timerEl.textContent = String(Math.max(0, finalSeconds));
      if(totalEl) totalEl.textContent = String(Math.max(0, finalTotalSeconds));

      if(finalTotalSeconds <= 0){
        stopFinalTimer();
        finalResolving = true;
        // El tiempo total terminó: no se inicia el repaso de pendientes.
        cleanup();
        showFinalResults();
        return;
      }

      if(finalSeconds <= 0) finish(true);
    },1000);
  };

  const showFinalResults = () => {
    cleanup();
    const won = total >= 300;
    window.DentistasStats?.recordFinal?.(won);
    const unlockArea = selectedAreas.length === 1 ? selectedAreas[0] : '';
    const result = window.DentistasRecordFinalResult?.({
      score:total,
      difficulty:'super',
      area:unlockArea
    }) || {unlocked:[]};
    const chars = Array.isArray(window.DentistasCharacters) ? window.DentistasCharacters : [];
    const unlocked = (result.unlocked || []).map(name => chars.find(ch => ch.name === name)).filter(Boolean);
    const unlockMsg = unlocked.length
      ? `<p>🔓 <b>DESBLOQUEADO:</b> ${unlocked.map(ch=>ch.specialty).join(' · ')}</p>`
      : (total>=300 && selectedAreas.length!==1
        ? '<p>La meta de 300 puntos se alcanzó, pero para desbloquear un especialista debes jugar con un solo apartado seleccionado.</p>'
        : '');

    openModal(`<h2>🏆 RONDA FINAL</h2><p>Obtuviste <b>${total} puntos</b>.</p><p>${won?'¡META ALCANZADA! Superaste los 300 puntos.':'La meta era 300 puntos.'}</p><p>Tiempo final: <b>${Math.max(0, finalTotalSeconds)} s</b>.</p>${unlockMsg}<div class="menuStack"><button id="finalAgain">JUGAR OTRA VEZ</button><button id="finalHome">PORTADA</button></div>`);
    $('#finalAgain').onclick=()=>{closeModal(false);startFinalChallenge();};
    $('#finalHome').onclick=()=>{closeModal(false);$('#game').classList.add('hidden');$('#home').classList.remove('hidden');};
  };

  const ask = () => {
    // Primera pasada: 10 preguntas. Después, solo se repasan las que se marcaron PASO/SKIP/NEXT.
    if(n >= pool.length){
      if(phase === 'firstPass' && pending.length && finalTotalSeconds > 0){
        phase = 'review';
        n = 0;
      } else {
        showFinalResults();
        return;
      }
    }

    let poolIndex;
    if(phase === 'firstPass'){
      poolIndex = n;
    } else {
      if(n >= pending.length){
        showFinalResults();
        return;
      }
      poolIndex = pending[n];
    }

    currentPoolIndex = poolIndex;
    const q = pool[poolIndex];
    finalResolving = true;
    finalSeconds = 15;

    const reviewLabel = phase === 'review'
      ? (isEn() ? ' · REVIEW' : ' · REPASO')
      : '';

    openModal(`<h2>⚡ RONDA FINAL${reviewLabel} · ${phase === 'firstPass' ? n+1 : n+1}/10</h2>
      <p class="finalQuestion">${qText(q)}</p>
      <p>Tiempo: <b id="finalSeconds">15</b>s · Total: <b id="finalTotalSeconds">${Math.max(0,finalTotalSeconds)}</b>s · Puntos: <b>${total}</b>/300</p>
      <div class="answerEntry finalEntry">
        <input id="finalAnswer" type="text" autocomplete="off" placeholder="Respuesta, PASO, SKIP, SKID o NEXT…">
        <button id="finalMic" type="button">🎤 VOZ</button><button id="finalSend">RESPONDER</button>
      </div>
      <p class="finalSkipHint">Puedes usar <b>PASO</b>, <b>SKIP</b>, <b>SKID</b> o <b>NEXT</b> para dejar esta pregunta pendiente y continuar.</p>`);

    const input = $('#finalAnswer');
    const send = $('#finalSend');
    const mic = $('#finalMic');

    const begin = () => {
      if(!finalResolving) return;
      finalResolving = false;
      if(send) send.disabled = false;
      if(input) input.disabled = false;
      startQuestionTimer();
    };

    if(send) send.disabled = true;
    if(input) input.disabled = true;

    const spoken = narrate(qText(q), {
      lang:qVoiceLang(q), rate:.9, onend:begin, onerror:begin
    });
    if(spoken === false) begin();

    const submit = () => {
      if(finalResolving) return;
      finish(false);
    };

    if(send) send.onclick = submit;
    if(mic) mic.onclick = () => {
      if(finalResolving) return;
      mic.textContent='🎙️ ESCUCHANDO';
      const handleResult=(text,ok)=>{
        if(mic) mic.textContent='🎤 VOZ';
        if(!ok) return;
        if(input) input.value=String(text||'');
        finish(false);
      };
      if(window.AndroidVoice?.isAvailable?.()){
        window.__finalVoiceHandler=handleResult;
        try{ window.AndroidVoice.start(isEn()?'en-US':'es-MX'); return; }
        catch(_){ window.__finalVoiceHandler=null; }
      }
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SR){ mic.textContent='🎤 VOZ NO DISPONIBLE'; setTimeout(()=>mic.textContent='🎤 VOZ',1200); return; }
      const rec=new SR(); rec.lang=isEn()?'en-US':'es-MX'; rec.interimResults=false; rec.maxAlternatives=1;
      rec.onresult=e=>{ const t=e.results?.[0]?.[0]?.transcript||''; handleResult(t,true); };
      rec.onerror=()=>handleResult('',false);
      rec.onend=()=>{ if(mic.textContent==='🎙️ ESCUCHANDO') mic.textContent='🎤 VOZ'; };
      try{rec.start();}catch(_){handleResult('',false);}
    };
    if(input){
      input.focus();
      input.onkeydown = e => {
        if(e.key === 'Enter'){
          e.preventDefault();
          submit();
        }
      };
    }
  };

  ask();
}

async function startNewGame() {
  if (!questionPool.length) {
    try { await (questionPoolPromise || loadQuestionPool()); } catch (_) {}
  }
  const pool = filteredPool();
  if (!pool.length) {
    openModal(isEn()
      ? '<h2>No questions in this selection</h2><p>Choose another specialty or section.</p>'
      : '<h2>No hay preguntas en esta selección</h2><p>Elige otra especialidad o apartado.</p>');
    return;
  }

  invalidateTurn();
  chooseGameQuestions();
  scores = [0, 0];
  roundIndex = 0;
  awardHistory = [];
  revealed = [];
  strikes = 0;
  bank = 0;
  sessionCorrect = 0;
  sessionStrikes = 0;
  sessionSteals = 0;
  sessionStealAttempts = 0;
  currentTeam = 0;
  phase = 'play';
  gamePaused = false;
  turnResolving = false;
  clearActiveGame();

  $('#home').classList.add('hidden');
  $('#game').classList.remove('hidden');
  updateScoreUI();
  play(audio.start);
  showRound(true);
}

function finishGame() {
  const totalPoints = Math.max(0, Number(scores[0]) || 0) + Math.max(0, Number(scores[1]) || 0);
  const outcome = scores[0] > scores[1] ? 'win' : scores[1] > scores[0] ? 'loss' : 'tie';
  window.DentistasStats?.recordGame?.({
    outcome,
    points: totalPoints,
    rounds: questions.length,
    correct: sessionCorrect,
    strikes: sessionStrikes,
    steals: sessionSteals,
    stealAttempts: sessionStealAttempts
  });
  invalidateTurn();
  phase = 'over';
  clearActiveGame();
  gameSound('victory');
  updateTurnUI();

  let result;
  if (scores[0] > scores[1]) {
    result = `<h2>🏆 ${teamNames[0]} ${tx('wins')}</h2><p><b>${scores[0]}</b> - <b>${scores[1]}</b> ${tx('points')}.</p>`;
  } else if (scores[1] > scores[0]) {
    result = `<h2>🏆 ${teamNames[1]} ${tx('wins')}</h2><p><b>${scores[1]}</b> - <b>${scores[0]}</b> ${tx('points')}.</p>`;
  } else {
    result = `<h2>${tx('tie')}</h2><p><b>${scores[0]} ${tx('points')}</b>.</p>`;
  }

  openModal(
    `${result}
${isEn() ? `<p>Final score = total bank points won over 8 rounds.</p><p>Rounds 1–4: <b>×1</b> · Rounds 5–6: <b>×2</b> · Rounds 7–8: <b>×3</b>.</p><p><b>${questions.length} questions</b> were drawn at random from a bank of <b>${questionPool.length}</b>.</p>` : `<p>Marcador final = suma de los bancos ganados durante las 8 rondas.</p><p>Rondas 1–4: <b>×1</b> · Rondas 5–6: <b>×2</b> · Rondas 7–8: <b>×3</b>.</p><p>Se jugaron <b>${questions.length} preguntas</b> elegidas al azar de una base de <b>${questionPool.length}</b>.</p>`}
     <div class="menuStack">
       <button id="mFinal">⚡ RONDA FINAL · META 300</button>
       <button id="mAgain"> ${tx('newGame')} </button>
       <button id="mHomeFinal"> ${tx('backHome')} </button>
     </div>`
  );

  $('#mFinal').onclick = () => { closeModal(false); startFinalChallenge(); };

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
  preloadAdjacentRounds(roundIndex);
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
  const name = prompt(isEn() ? `Team ${team} name:` : `Nombre del equipo ${team}:`, teamNames[idx]);
  if (name && name.trim()) {
    teamNames[idx] = name.trim().toUpperCase().slice(0, 18);
    updateScoreUI();
    updateTurnUI();
    saveState();
  }
  if (gameVisible() && phase !== 'over') beginTurnAfterQuestion();
}

function openModal(html) {
  invalidateTurn();
  $('#modalContent').innerHTML = html;
  $('#modal').classList.remove('hidden');

}

function closeModal(resumeTimer = true) {
  invalidateTurn();
  $('#modal').classList.add('hidden');
  if (resumeTimer && gameVisible() && phase !== 'over') beginTurnAfterQuestion();
}

function showHelp() {
  if (isEn()) {
    openModal(`
      <h2>How to play VS</h2>
      <ol>
        <li>The game is for <b>2 teams</b>.</li>
        <li>Each game uses <b>8 random questions</b> from the full bank.</li>
        <li>Questions do not repeat within the same game.</li>
        <li>Each answer must be given before the <b>30-second timer</b> ends.</li>
        <li>If time reaches zero without a correct answer, <b>1 strike</b> is added automatically.</li>
        <li>After a correct answer or a strike, the timer restarts after the question is narrated, with 30 seconds.</li>
        <li>Rounds <b>1–4 are ×1</b>, rounds <b>5–6 are ×2</b>, and rounds <b>7–8 are ×3</b>.</li>
        <li>A correct answer reveals the board item and adds its multiplied value to the <b>Bank</b>.</li>
        <li>Each team can make up to <b>3 mistakes</b> during its turn.</li>
        <li>On the third mistake, control passes to the opposing team.</li>
        <li>If the bank has points, the opponent gets <b>30 seconds and one answer</b> to steal it.</li>
        <li>If the steal succeeds, the opponent wins the whole bank. If it fails, the points remain with the original team.</li>
        <li>Round points are assigned <b>automatically</b> to the team that wins the round.</li>
        <li>After round 8, the final score and winner are shown.</li>
      </ol>
      <p>Current bank: <b>${questionPool.length || 116} questions</b>.</p>
    `);
  } else {
    openModal(`
      <h2>¿Cómo se juega VS?</h2>
      <ol>
        <li>La partida es para <b>2 equipos</b>.</li>
        <li>Cada partida usa <b>8 preguntas aleatorias</b> elegidas de toda la base.</li>
        <li>Las preguntas no se repiten dentro de la misma partida.</li>
        <li>Cada respuesta debe darse antes de que termine el <b>cronómetro de 30 segundos</b>.</li>
        <li>Si el cronómetro llega a cero sin respuesta correcta, se registra automáticamente <b>1 strike</b>.</li>
        <li>Después de una respuesta correcta o de un strike, el cronómetro vuelve a empezar en 30 segundos después de narrar la pregunta.</li>
        <li>Las rondas <b>1–4 valen ×1</b>, las rondas <b>5–6 valen ×2</b> y las rondas <b>7–8 valen ×3</b>.</li>
        <li>Una respuesta correcta revela la casilla y suma al <b>Banco</b> sus puntos multiplicados por el valor de la ronda.</li>
        <li>Cada equipo puede cometer como máximo <b>3 errores</b> durante su turno.</li>
        <li>Al tercer error pierde el control y el turno pasa al rival.</li>
        <li>Si había puntos en el banco, el rival dispone de <b>30 segundos y una sola respuesta</b> para robarlo.</li>
        <li>Si el rival acierta, gana todo el banco. Si falla, los puntos permanecen con el equipo original.</li>
        <li>Los puntos de la ronda se asignan <b>automáticamente</b> al equipo que gana la ronda.</li>
        <li>Después de la ronda 8 se muestra el marcador final y el ganador.</li>
      </ol>
      <p>Base actual: <b>${questionPool.length || 116} preguntas</b>.</p>
    `);
  }
}

function showMenu() {
  openModal(isEn() ? `
    <h2>Game Menu</h2>
    <div class="menuStack">
      <button id="mHelp">Instructions</button>
      <button id="mNew">New random game</button>
      <button id="mPresenter">Presenter controls</button>
      <button id="mHome">Home</button>
    </div>`
  : `
    <h2>Menú del juego</h2>
    <div class="menuStack">
      <button id="mHelp">Instrucciones</button>
      <button id="mNew">Nueva partida aleatoria</button>
      <button id="mPresenter">Controles del moderador</button>
      <button id="mHome">Portada</button>
    </div>`);

  $('#mHelp').onclick = showHelp;
  $('#mPresenter').onclick = showPresenterControls;
  $('#mNew').onclick = () => {
    const msg = isEn() ? 'End this game and draw 8 new questions?' : '¿Terminar esta partida y sortear 8 preguntas nuevas?';
    if (confirm(msg)) {
      closeModal(false);
      startNewGame();
    }
  };
  $('#mHome').onclick = () => {
    closeModal(false);
    invalidateTurn();
    stopGameAudio();
    $('#game').classList.add('hidden');
    $('#home').classList.remove('hidden');
  };
}

function presenterRoundSafetyCheck() {
  if (phase === 'over' || !questions[roundIndex]) return false;
  stopTimer();
  clearCpuTurn();
  turnNarrationToken += 1;
  window.DentistasNarrator?.stop?.();
  return true;
}

function showPresenterControls() {
  openModal(isEn() ? `
    <h2>Presenter controls</h2>
    <div class="menuStack presenterMenu">
      <button id="pRepeat">🔊 Repeat question</button>
      <button id="pReveal">👁 Reveal answers and finish round</button>
      <button id="pPause">⏸ Pause / resume</button>
      <button id="pError">✖ Add strike</button>
    </div>`
  : `
    <h2>Controles del moderador</h2>
    <div class="menuStack presenterMenu">
      <button id="pRepeat">🔊 Repetir pregunta</button>
      <button id="pReveal">👁 Revelar respuestas y cerrar ronda</button>
      <button id="pPause">⏸ Pausar / continuar</button>
      <button id="pError">✖ Añadir error</button>
    </div>`);

  $('#pRepeat').onclick = () => {
    closeModal(false);
    presenterRoundSafetyCheck();
    const q = questions[roundIndex];
    if (q) narrate(qText(q), {lang:qVoiceLang(q), rate:.9});
  };
  $('#pReveal').onclick = () => {
    closeModal(false);
    if (!presenterRoundSafetyCheck()) return;
    const team = currentTeam;
    revealRemainingAndNarrate(() => {
      if (phase === 'over') return;
      awardCompletedRound(team, bank);
    });
  };
  $('#pPause').onclick = () => {
    closeModal(false);
    if (gamePaused) resumeGame();
    else pauseGame();
  };
  $('#pError').onclick = () => {
    closeModal(false);
    if (!presenterRoundSafetyCheck()) return;
    addStrike('presenter');
  };
}

function auditQuestionRecord(q, source) {
  const issues = [];
  const text = String(q?.q || '').trim();
  if (!text) issues.push('pregunta vacía');
  if (!Array.isArray(q?.a) || q.a.length < 3 || q.a.length > 7) issues.push('respuestas fuera de 3–7');
  const seen = new Set();
  (q?.a || []).forEach((a, i) => {
    const answer = String(a?.[0] || '').trim();
    const points = Number(a?.[1]);
    if (!answer) issues.push('respuesta vacía #' + (i + 1));
    const key = answer.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
    if (seen.has(key)) issues.push('respuesta duplicada');
    seen.add(key);
    if (!Number.isFinite(points) || points <= 0) issues.push('puntos inválidos');
  });
  const points = (q?.a || []).map(a => Number(a?.[1]));
  const total = points.reduce((s,p) => s + p, 0);
  if (points.length && total !== 100) issues.push('puntos no suman 100');
  const max = points.length ? Math.max(...points) : 0;
  if (points.length && points.filter(p => p === max).length !== 1) issues.push('sin líder único');
  return {ok: issues.length === 0, issues, source, id: q?.id || null};
}

function buildQuestionAudit(records) {
  const audit = { totalInput: records.length, valid: 0, invalid: 0, duplicates: 0, issues: [] };
  const ids = new Set();
  const textKeys = new Set();
  records.forEach(q => {
    const result = auditQuestionRecord(q, q?.__source || '');
    if (result.ok) audit.valid += 1;
    else {
      audit.invalid += 1;
      if (audit.issues.length < 100) audit.issues.push(result);
    }
    const idKey = q?.id ? String(q.id) : '';
    const textKey = String(q?.q || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
    if (idKey && ids.has(idKey)) audit.duplicates += 1;
    if (textKey && textKeys.has(textKey)) audit.duplicates += 1;
    if (idKey) ids.add(idKey);
    if (textKey) textKeys.add(textKey);
  });
  return audit;
}

async function loadQuestionPool() {
  const task = (async () => {
    const combined = [];

    for (const file of BANK_FILES) {
      try {
        const data = await loadJsonAsset(file);
        const records = Array.isArray(data) ? data : (Array.isArray(data?.questions) ? data.questions.map(item => ({...item, q:item.question, cat:item.category, a:(item.answers || []).map(a => [a.text, a.points])})) : []);
        if (records.length) {
          records.forEach(q => {
            if (q && q.q && Array.isArray(q.a) && q.a.length >= 3 && q.a.length <= 7) {
              const points = q.a.map(a => Number(a?.[1]));
              const validPoints = points.every(p => Number.isFinite(p) && p > 0);
              const total = points.reduce((sum,p)=>sum+p,0);
              const highest = validPoints ? Math.max(...points) : 0;
              const uniqueLeader = validPoints && points.filter(p => p === highest).length === 1;
              if (validPoints && total === 100 && uniqueLeader) {
                const normalized = {...q, area:specialtyArea(q, file), __source:file};
                const audit = auditQuestionRecord(normalized, file);
                if (audit.ok) combined.push(normalized);
              }
            }
          });
        }
      } catch (err) { console.warn('No se pudo cargar', file, err); }
    }

    for (const file of STUDY_BANK_FILES) {
      try {
        const data = await loadJsonAsset(file);
        if (Array.isArray(data)) data.forEach(q => {
          const normalized = normalizeStudyQuestion(q, q.category || 'Primer parcial');
          if (normalized) combined.push(normalized);
        });
      } catch (err) { console.warn('No se pudo cargar', file, err); }
    }

    for (const [file, area] of EXTRA_BANK_FILES) {
      try {
        const data = await loadJsonAsset(file);
        if (Array.isArray(data)) data.forEach(q => {
          const normalized = normalizeStudyQuestion(q, area);
          if (normalized) combined.push(normalized);
        });
      } catch (err) { console.warn('No se pudo cargar', file, err); }
    }

    questionPool = dedupeQuestionPool(combined);
    window.DentistasQuestionAudit = buildQuestionAudit(combined);
    window.DentistasQuestionAudit.uniquePool = questionPool.length;
    window.DentistasQuestionAudit.sources = BANK_FILES.length;
    updateScoreUI();
    return questionPool;
  })();
  questionPoolPromise = task;
  return task;
}

loadState();
window.DentistasQuestionPool=()=>questionPool;
loadQuestionPool().then(() => offerResumeGame());
updateTimerUI();

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveActiveGame();
});
window.addEventListener('pagehide', saveActiveGame);
window.addEventListener('beforeunload', saveActiveGame);

$('#mode1v1').onclick = () => showPlayerCharacterSelector(showOneVsOneSetup);
$('#modeTeams').onclick = () => showPlayerCharacterSelector(showTeamSetup);
$('#modeCpu').onclick = () => showPlayerCharacterSelector(showCpuSetup);
$('#help').onclick = showHelp;
$('#prev').onclick = previousRound;
$('#next').onclick = nextRound;
$('#buzz').onclick = () => addStrike('manual');
$('#undo').onclick = undoAward;
$('#resetRound').onclick = resetRound;
$('#menu').onclick = showMenu;
const exitGame = $('#exitGame');
if (exitGame) exitGame.onclick = () => {
  const msg = isEn() ? 'Exit this game and return to the main menu?' : '¿Salir de esta partida y volver al menú principal?';
  if (!confirm(msg)) return;
  closeModal(false);
  invalidateTurn();
  stopGameAudio();
  phase = 'over';
  clearActiveGame();
  $('#game').classList.add('hidden');
  $('#home').classList.remove('hidden');
};
$('#closeModal').onclick = () => closeModal(true);
$('#modal').addEventListener('click', (e) => {
  if (e.target === $('#modal')) closeModal(true);
});
document.querySelectorAll('.award').forEach(b => b.onclick = () => awardBank(Number(b.dataset.team)));
document.querySelectorAll('.teamName').forEach(b => b.onclick = () => renameTeam(Number(b.dataset.team)));

window.addEventListener('dentistas-language-changed', () => {
  if (teamNames[0] === 'EQUIPO 1' || teamNames[0] === 'TEAM 1') teamNames[0] = isEn() ? 'TEAM 1' : 'EQUIPO 1';
  if (teamNames[1] === 'EQUIPO 2' || teamNames[1] === 'TEAM 2') teamNames[1] = isEn() ? 'TEAM 2' : 'EQUIPO 2';
  updateScoreUI();
  if (typeof updateTurnUI === 'function') updateTurnUI();
  if (questions.length && typeof showRound === 'function' && gameVisible()) showRound(false);
  const one = $('#mode1v1'); if (one) one.textContent = isEn() ? '👤 1 VS 1' : '👤 1 CONTRA 1';
  const teamsBtn = $('#modeTeams'); if (teamsBtn) teamsBtn.textContent = isEn() ? '👥 TEAM VS TEAM' : '👥 EQUIPO CONTRA EQUIPO';
  const cpuBtn = $('#modeCpu'); if (cpuBtn) cpuBtn.textContent = isEn() ? '🤖 VS COMPUTER' : '🤖 CONTRA LA COMPUTADORA';
  const help = $('#help'); if (help) help.textContent = tx('howTo');
  const timerLabel = document.querySelector('.timerBox>span'); if (timerLabel) timerLabel.textContent = tx('time');
  const bankLabel = document.querySelector('.bank>span'); if (bankLabel) bankLabel.textContent = tx('bank');
  document.querySelectorAll('.award').forEach(el => el.textContent = tx('giveBank'));
  const reset = $('#resetRound'); if (reset) reset.textContent = tx('resetRound');
});

window.DentistasAppBack = function () {
  try {
    const modal = document.querySelector('#modal');
    if (modal && !modal.classList.contains('hidden')) {
      closeModal(true);
      return true;
    }
    const game = document.querySelector('#game');
    if (game && !game.classList.contains('hidden')) {
      saveActiveGame();
      stopTimer();
      game.classList.add('hidden');
      document.querySelector('#home')?.classList.remove('hidden');
      window.DentistasNarrator?.stop?.();
      return true;
    }
  } catch (_) {}
  return false;
};

(function addGameSetupStyles(){
  const st=document.createElement('style');
  st.textContent=`
    .areaPicker{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.65rem;max-height:48vh;overflow:auto;margin:1rem 0;padding:.35rem}
    .areaPick,.cpuPicker button,.setupGrid button{min-height:58px;border:1px solid #3e7b86;border-radius:14px;background:#0d2830;color:#eefcff;font-weight:900}
    .areaPick.selected{background:linear-gradient(180deg,#18aabc,#0a6775);border-color:#bff8ff;box-shadow:0 0 18px #42dceb55}
    .cpuPicker{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.55rem;max-height:52vh;overflow:auto}
    .setupGrid{grid-template-columns:repeat(2,minmax(140px,1fr))}
    #startConfigured:disabled{opacity:.45;filter:grayscale(.5)}
  `;
  document.head.appendChild(st);
})();
$('#faceoffTeam1')?.addEventListener('click',()=>finishFaceoff(0));
$('#faceoffTeam2')?.addEventListener('click',()=>finishFaceoff(1));
$('#answerMic')?.addEventListener('click',startVoiceAnswer);
