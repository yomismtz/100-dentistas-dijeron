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
    stats:[['Velocidad',5],['Sigilo',5],['Recolección',5],['Estrategia',5],['Magia',5]] },
  { name:'NOVA', specialty:'ESTUDIANTE DE ODONTOLOGÍA', role:'La Futura Especialista', icon:'🎓', image:'characters/nova_estudiante.webp', tone:'student', rarity:'INICIAL',
    strengths:['Aprendizaje','Versatilidad','Curiosidad clínica'], weaknesses:['Experiencia limitada','Aún sin especialidad'], power:'APRENDIZAJE RÁPIDO', tool:'Kit clínico universitario',
    stats:[['Conocimiento',3],['Diagnóstico',3],['Prevención',3],['Precisión',3],['Velocidad',3]] }
];

window.DentistasCharacters = CHARACTERS;

const CHARACTER_PROGRESS_KEY = 'dentistas-character-progression-v1';
const CHARACTER_UNLOCK_RULES = {
  'NOVA': { always:true, label:'Disponible desde el inicio' },
  'CARLOS': { requirements:[['Todos los temas',70]], label:'Aprueba el simulacro general con 70% o más' },
  'SOFÍA': { requirements:[['Laboratorio de ortodoncia y ortopedia',70]], label:'Laboratorio de ortodoncia y ortopedia · 70%' },
  'MÍA': { requirements:[['Realización del expediente clínico',70]], label:'Expediente clínico · 70%' },
  'DIEGO': { requirements:[['Psicología infantil',70],['Desarrollo de la oclusión',70]], label:'Psicología infantil + Desarrollo de la oclusión · 70%' },
  'EMMA': { requirements:[['Hábitos y parafunciones',70],['Fisiología',70]], label:'Hábitos/parafunciones + Fisiología · 70%' },
  'VALERIA': { requirements:[['Fisiología',75],['Oclusión',70]], label:'Fisiología 75% + Oclusión 70%' },
  'SANTIAGO': { requirements:[['Desarrollo craneofacial',75],['Oclusión',75]], label:'Desarrollo craneofacial + Oclusión · 75%' },
  'ALEX': { requirements:[['Desarrollo craneofacial',85],['Laboratorio de ortodoncia y ortopedia',75]], label:'Desarrollo craneofacial 85% + Laboratorio 75%' },
  'MATEO': { requirements:[['Nomenclatura y etimología médica',70]], label:'Nomenclatura y etimología · 70%' },
  'LUCÍA': { requirements:[['Nomenclatura y etimología médica',80],['Realización del expediente clínico',70]], label:'Nomenclatura 80% + Expediente 70%' },
  'RENATA': { requirements:[['Nomenclatura y etimología médica',85],['Fisiología',75]], label:'Nomenclatura 85% + Fisiología 75%' },
  'AURORA': { requirements:[['Todos los temas',85],['Nomenclatura y etimología médica',85],['Realización del expediente clínico',85],['Laboratorio de ortodoncia y ortopedia',85]], label:'Completa los 4 módulos principales con 85% o más' },
  'DON PÉREZ': { requirements:[['Todos los temas',90],['Nomenclatura y etimología médica',90],['Realización del expediente clínico',90],['Laboratorio de ortodoncia y ortopedia',90]], label:'Completa los 4 módulos principales con 90% o más' }
};

function loadCharacterProgress() {
  try { return JSON.parse(localStorage.getItem(CHARACTER_PROGRESS_KEY) || '{}') || {}; }
  catch (_) { return {}; }
}
function saveCharacterProgress(progress) {
  try { localStorage.setItem(CHARACTER_PROGRESS_KEY, JSON.stringify(progress)); } catch (_) {}
}
function recordCharacterModuleResult(moduleName, percent) {
  const p = loadCharacterProgress();
  const score = Math.max(0, Math.min(100, Math.round(Number(percent)||0)));
  p[moduleName] = Math.max(Number(p[moduleName]) || 0, score);
  saveCharacterProgress(p);
  window.dispatchEvent(new CustomEvent('dentistas-character-progress', {detail:{moduleName,percent:score}}));
  return p;
}
function characterUnlocked(character) {
  const rule = CHARACTER_UNLOCK_RULES[character?.name];
  if (!rule || rule.always) return true;
  const p = loadCharacterProgress();
  return (rule.requirements || []).every(([moduleName,min]) => (Number(p[moduleName]) || 0) >= min);
}
function characterUnlockLabel(character) {
  return CHARACTER_UNLOCK_RULES[character?.name]?.label || 'Progreso de módulos';
}

const STUDENT_PROFILE_KEY = 'dentistas-student-profile-v1';
const FEEDBACK_SETTINGS_KEY = 'dentistas-feedback-settings-v1';

function loadStudentProfile() {
  try {
    const p = JSON.parse(localStorage.getItem(STUDENT_PROFILE_KEY) || '{}') || {};
    return {
      xp:Number(p.xp)||0,
      answered:Number(p.answered)||0,
      correct:Number(p.correct)||0,
      bestStreak:Number(p.bestStreak)||0
    };
  } catch (_) { return {xp:0,answered:0,correct:0,bestStreak:0}; }
}
function saveStudentProfile(p) {
  try { localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(p)); } catch (_) {}
}
function studentLevelFromXp(xp) { return Math.floor((Number(xp)||0) / 250) + 1; }
function addStudentXp(isCorrect, streak=0) {
  const p = loadStudentProfile();
  p.answered += 1;
  if (isCorrect) p.correct += 1;
  p.bestStreak = Math.max(p.bestStreak, Number(streak)||0);
  const streakBonus = isCorrect ? Math.min(10, Math.max(0, Number(streak)||0) * 2) : 0;
  const gained = 2 + (isCorrect ? 8 : 0) + streakBonus;
  p.xp += gained;
  saveStudentProfile(p);
  return {gained,profile:p,level:studentLevelFromXp(p.xp)};
}
function loadFeedbackSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(FEEDBACK_SETTINGS_KEY) || '{}') || {};
    return {sound:s.sound !== false,vibration:s.vibration !== false};
  } catch (_) { return {sound:true,vibration:true}; }
}
function saveFeedbackSettings(s) {
  try { localStorage.setItem(FEEDBACK_SETTINGS_KEY, JSON.stringify(s)); } catch (_) {}
}
function feedbackEnabled(kind) { return !!loadFeedbackSettings()[kind]; }
function vibrateFeedback(pattern) {
  if (!feedbackEnabled('vibration')) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
}
function topicStatsSummary() {
  let stats={};
  try { stats=JSON.parse(localStorage.getItem('dentistas-study-topic-stats-v1') || '{}') || {}; } catch (_) {}
  return Object.entries(stats).map(([category,s]) => {
    const seen=Number(s.seen)||0, wrong=Number(s.wrong)||0;
    const percent=seen ? Math.round(((seen-wrong)/seen)*100) : 0;
    const mastery = percent >= 85 ? charText('Dominado','Mastered') : percent >= 70 ? charText('Competente','Competent') : charText('En aprendizaje','Learning');
    return {category,seen,wrong,percent,mastery};
  }).sort((a,b)=>b.seen-a.seen);
}
function achievementList() {
  const p=loadStudentProfile();
  const progress=loadCharacterProgress();
  const unlocked=CHARACTERS.filter(characterUnlocked);
  const main=['Todos los temas','Nomenclatura y etimología médica','Realización del expediente clínico','Laboratorio de ortodoncia y ortopedia'];
  return [
    {icon:'💯',title:charText('100 respuestas correctas','100 correct answers'),done:p.correct>=100,detail:`${Math.min(p.correct,100)} / 100`},
    {icon:'🔥',title:charText('Racha de 10','10-answer streak'),done:p.bestStreak>=10,detail:`${Math.min(p.bestStreak,10)} / 10`},
    {icon:'🦷',title:charText('Primer especialista desbloqueado','First specialist unlocked'),done:unlocked.some(ch=>ch.name!=='NOVA'),detail:`${Math.max(0,unlocked.length-1)}`},
    {icon:'🏆',title:charText('Todos los módulos aprobados','All modules passed'),done:main.every(k=>(Number(progress[k])||0)>=70),detail:`${main.filter(k=>(Number(progress[k])||0)>=70).length} / 4`}
  ];
}
function characterProfileHtml(ch) {
  const unlocked=characterUnlocked(ch);
  const stats=(ch.stats||[]).map(([name,value])=>`<div class="charProfileStat"><span>${name}</span><b>${'★'.repeat(value)}${'☆'.repeat(Math.max(0,5-value))}</b></div>`).join('');
  return `<div class="charProfileModal">
    <img src="${ch.image}" alt="">
    <div class="charProfileBody">
      <span class="progressEyebrow">${ch.specialty}</span>
      <h2>${ch.icon} ${ch.name}</h2>
      <h4>${ch.role}</h4>
      <p><b>${charText('Habilidad','Ability')}:</b> ${ch.power}</p>
      <p><b>${charText('Herramienta','Tool')}:</b> ${ch.tool}</p>
      <p><b>${charText('Fortalezas','Strengths')}:</b> ${(ch.strengths||[]).join(' · ')}</p>
      <div class="charProfileStats">${stats}</div>
      <p class="${unlocked?'profileUnlocked':'profileLocked'}"><b>${unlocked?charText('✓ Desbloqueado','✓ Unlocked'):charText('🔒 Requisito','🔒 Requirement')}:</b> ${unlocked?charText('Disponible para tu colección.','Available in your collection.'):characterUnlockLabel(ch)}</p>
    </div>
  </div>`;
}
function showCharacterProfile(name) {
  const ch=CHARACTERS.find(x=>x.name===name);
  if (ch) openModal(characterProfileHtml(ch));
}
function showUnlockAnimation(names=[]) {
  if (!names.length) return;
  const chars=names.map(name=>CHARACTERS.find(ch=>ch.name===name)).filter(Boolean);
  if (!chars.length) return;
  vibrateFeedback([80,70,160]);
  openModal(`<div class="unlockCelebration">
    <div class="unlockBurst">✦</div>
    <div class="unlockTitle">${charText('NUEVO PERSONAJE DESBLOQUEADO','NEW CHARACTER UNLOCKED')}</div>
    <div class="unlockCards">${chars.map(ch=>`<button class="unlockCard" data-name="${ch.name}"><img src="${ch.image}" alt=""><b>${ch.name}</b><small>${ch.specialty}</small></button>`).join('')}</div>
    <p>${charText('Tu progreso académico acaba de ampliar tu colección.','Your academic progress just expanded your collection.')}</p>
  </div>`);
  document.querySelectorAll('.unlockCard').forEach(btn=>btn.onclick=()=>showCharacterProfile(btn.dataset.name));
}

const STUDY_ACTIVITY_KEY = 'dentistas-study-activity-v1';
function activityDayKey() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
function loadStudyActivity() {
  try {
    const saved = JSON.parse(localStorage.getItem(STUDY_ACTIVITY_KEY) || '{}') || {};
    if (saved.date !== activityDayKey()) return {date:activityDayKey(),answered:0,correct:0,bestStreak:0};
    return {date:saved.date,answered:Number(saved.answered)||0,correct:Number(saved.correct)||0,bestStreak:Number(saved.bestStreak)||0};
  } catch (_) {
    return {date:activityDayKey(),answered:0,correct:0,bestStreak:0};
  }
}
function recordStudyActivity(isCorrect, streak=0) {
  const a = loadStudyActivity();
  a.answered += 1;
  if (isCorrect) a.correct += 1;
  a.bestStreak = Math.max(a.bestStreak, Number(streak)||0);
  try { localStorage.setItem(STUDY_ACTIVITY_KEY, JSON.stringify(a)); } catch (_) {}
  return a;
}
function unlockRequirementProgress(character) {
  const rule = CHARACTER_UNLOCK_RULES[character?.name];
  if (!rule || rule.always) return {done:true,ratio:1,missing:[]};
  const p = loadCharacterProgress();
  const reqs = rule.requirements || [];
  const missing = reqs.map(([moduleName,min]) => {
    const current = Number(p[moduleName]) || 0;
    return {moduleName,min,current,remaining:Math.max(0,min-current)};
  }).filter(x => x.remaining > 0);
  const ratio = reqs.length ? reqs.reduce((sum,[moduleName,min]) => sum + Math.min(1,(Number(p[moduleName])||0)/min),0)/reqs.length : 1;
  return {done:missing.length===0,ratio,missing};
}
function nextUnlockHint() {
  const locked = CHARACTERS
    .filter(ch => !characterUnlocked(ch))
    .map(ch => ({character:ch, progress:unlockRequirementProgress(ch)}))
    .sort((a,b) => b.progress.ratio - a.progress.ratio);
  const next = locked[0];
  if (!next) return null;
  const m = next.progress.missing.sort((a,b)=>a.remaining-b.remaining)[0];
  if (!m) return null;
  return {
    name:next.character.name,
    moduleName:m.moduleName,
    current:m.current,
    target:m.min,
    remaining:m.remaining
  };
}
function progressDashboardHtml() {
  const progress = loadCharacterProgress();
  const unlocked = CHARACTERS.filter(characterUnlocked);
  const total = CHARACTERS.length;
  const pct = Math.round((unlocked.length / total) * 100);
  const activity = loadStudyActivity();
  const student = loadStudentProfile();
  const level = studentLevelFromXp(student.xp);
  const nextLevelXp = level * 250;
  const levelBaseXp = (level - 1) * 250;
  const levelPct = Math.max(0,Math.min(100,Math.round(((student.xp-levelBaseXp)/(nextLevelXp-levelBaseXp))*100)));
  const topicRows = topicStatsSummary().map(t => `<div class="topicStatRow"><span>${t.category}</span><b>${t.percent}%</b><small class="mastery-${t.percent>=85?'high':t.percent>=70?'mid':'low'}">${t.mastery}</small></div>`).join('') || `<p class="progressEmpty">${charText('Aún no hay estadísticas por tema. Responde algunas preguntas para comenzar.','No topic statistics yet. Answer a few questions to begin.')}</p>`;
  const achievements = achievementList().map(a => `<div class="achievement ${a.done?'done':''}"><span>${a.icon}</span><div><b>${a.title}</b><small>${a.detail}</small></div><strong>${a.done?'✓':'🔒'}</strong></div>`).join('');
  const feedback = loadFeedbackSettings();
  const missions = [
    {icon:'📚',label:charText('Responde 10 preguntas hoy','Answer 10 questions today'),value:activity.answered,target:10},
    {icon:'✅',label:charText('Consigue 7 respuestas correctas hoy','Get 7 correct answers today'),value:activity.correct,target:7},
    {icon:'🔥',label:charText('Logra una racha de 5','Reach a streak of 5'),value:activity.bestStreak,target:5}
  ];
  const moduleRows = [
    ['Todos los temas',charText('Primer parcial','First midterm')],
    ['Nomenclatura y etimología médica',charText('Nomenclatura y etimología','Nomenclature & etymology')],
    ['Realización del expediente clínico',charText('Expediente clínico','Clinical record')],
    ['Laboratorio de ortodoncia y ortopedia',charText('Laboratorio de ortodoncia y ortopedia','Orthodontic & orthopedic lab')]
  ].map(([key,label]) => {
    const score = Number(progress[key]) || 0;
    return `<div class="progressModuleRow"><span>${label}</span><b>${score}%</b><div><i style="width:${score}%"></i></div></div>`;
  }).join('');

  const collection = CHARACTERS.map(ch => {
    const unlockedNow = characterUnlocked(ch);
    const req = unlockRequirementProgress(ch);
    const nearest = req.missing.sort((a,b)=>a.remaining-b.remaining)[0];
    const status = unlockedNow
      ? charText('DESBLOQUEADO','UNLOCKED')
      : nearest
        ? charText(`Faltan ${nearest.remaining} pts en ${nearest.moduleName}`,`${nearest.remaining} pts needed in ${nearest.moduleName}`)
        : characterUnlockLabel(ch);
    return `
      <article class="progressCharCard ${unlockedNow ? 'open' : 'locked'}" data-character-name="${ch.name}" role="button" tabindex="0">
        <div class="progressCharPortrait">
          <img src="${ch.image}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <span style="display:none">${ch.icon}</span>
          ${unlockedNow ? '' : '<em>🔒</em>'}
        </div>
        <strong>${ch.name}</strong>
        <small>${ch.specialty}</small>
        <p>${status}</p>
      </article>`;
  }).join('');

  const missionHtml = missions.map(m => {
    const done = m.value >= m.target;
    const shown = Math.min(m.value,m.target);
    return `<div class="progressMission ${done?'done':''}"><span>${m.icon}</span><div><b>${m.label}</b><small>${shown} / ${m.target}</small></div><strong>${done?'✓':'+'}</strong></div>`;
  }).join('');

  return `
    <div class="progressDashboard">
      <div class="progressHero">
        <div><span class="progressEyebrow">${charText('TU CAMINO EN ODONTOLOGÍA','YOUR DENTAL JOURNEY')}</span><h2>🎓 ${charText('Progreso y colección','Progress & collection')}</h2><p>${charText('Empieza con Nova y demuestra dominio para sumar especialistas a tu equipo.','Start with Nova and demonstrate mastery to add specialists to your team.')}</p></div>
        <div class="progressRing"><b>${pct}%</b><small>${unlocked.length}/${total}</small></div>
      </div>
      <div class="studentLevelCard"><div><span>${charText('NIVEL DEL ESTUDIANTE','STUDENT LEVEL')}</span><b>${level}</b></div><div class="studentXp"><strong>${student.xp} XP</strong><small>${charText('Siguiente nivel','Next level')}: ${nextLevelXp} XP</small><i><em style="width:${levelPct}%"></em></i></div></div>
      <h3>${charText('Progreso de módulos principales','Main module progress')}</h3>
      <div class="progressModules">${moduleRows}</div>
      <h3>${charText('Metas de hoy','Today’s goals')}</h3>
      <div class="progressMissions">${missionHtml}</div>
      <h3>${charText('Estadísticas y dominio por tema','Topic statistics & mastery')}</h3>
      <div class="topicStats">${topicRows}</div>
      <h3>${charText('Logros','Achievements')}</h3>
      <div class="achievementsGrid">${achievements}</div>
      <h3>${charText('Sonido y vibración','Sound & vibration')}</h3>
      <div class="feedbackSettings">
        <button id="toggleProgressSound">${feedback.sound?'🔊':'🔇'} ${charText('Sonido','Sound')}: ${feedback.sound?'ON':'OFF'}</button>
        <button id="toggleProgressVibration">${feedback.vibration?'📳':'📴'} ${charText('Vibración','Vibration')}: ${feedback.vibration?'ON':'OFF'}</button>
      </div>
      <h3>${charText('Colección de personajes','Character collection')}</h3>
      <div class="progressCollection">${collection}</div>
    </div>`;
}
function showProgressDashboard() {
  try { stopTimer(); } catch (_) {}
  openModal(progressDashboardHtml());
  document.querySelectorAll('.progressCharCard[data-character-name]').forEach(card => {
    card.onclick=()=>showCharacterProfile(card.dataset.characterName);
    card.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();showCharacterProfile(card.dataset.characterName);} };
  });
  const sound=document.querySelector('#toggleProgressSound');
  if(sound) sound.onclick=()=>{const s=loadFeedbackSettings();s.sound=!s.sound;saveFeedbackSettings(s);showProgressDashboard();};
  const vib=document.querySelector('#toggleProgressVibration');
  if(vib) vib.onclick=()=>{const s=loadFeedbackSettings();s.vibration=!s.vibration;saveFeedbackSettings(s);if(s.vibration)vibrateFeedback(70);showProgressDashboard();};
}
window.DentistasProgression = {
  recordModuleResult: recordCharacterModuleResult,
  recordStudyActivity,
  addStudentXp,
  getStudentProfile: loadStudentProfile,
  studentLevelFromXp,
  feedbackEnabled,
  vibrateFeedback,
  showUnlockAnimation,
  showCharacterProfile,
  isUnlocked: characterUnlocked,
  unlockLabel: characterUnlockLabel,
  getProgress: loadCharacterProgress,
  getActivity: loadStudyActivity,
  nextUnlockHint,
  showDashboard: showProgressDashboard,
  rules: CHARACTER_UNLOCK_RULES
};

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
  .tone-student{box-shadow:inset 0 0 24px #4fc7d455,0 0 18px #4fc7d422;border-color:#8cebf3!important}
  .charProgressBadge{margin-top:.22rem;padding:.16rem .42rem;border-radius:999px;font-size:.48rem;font-weight:1000;letter-spacing:.05em;background:#0b1d23;border:1px solid #487985;color:#c7f7ff}.charProgressBadge.locked{background:#251b12;border-color:#8e6a39;color:#f7d48f}
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
  .progressHomeButton{border:1px solid #e7c36a!important;background:linear-gradient(180deg,#594419,#30230d)!important;color:#fff1bd!important}
  .studentLevelCard{display:grid;grid-template-columns:auto 1fr;gap:1rem;align-items:center;padding:.8rem 1rem;margin:1rem 0;border:1px solid #805fc4;border-radius:15px;background:linear-gradient(135deg,#251b43,#10242c)}.studentLevelCard>div:first-child{display:flex;gap:.45rem;align-items:center}.studentLevelCard span{font-size:.65rem;font-weight:900;color:#cbb7ff;letter-spacing:.08em}.studentLevelCard>div:first-child b{font-size:2rem;color:#fff}.studentXp{display:grid;gap:.2rem}.studentXp strong{color:#ffe18a}.studentXp small{color:#b9cdd1}.studentXp i{display:block;height:8px;background:#09161a;border-radius:99px;overflow:hidden}.studentXp em{display:block;height:100%;background:linear-gradient(90deg,#8f6fe7,#e4c15d);border-radius:99px}.topicStats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem}.topicStatRow{display:grid;grid-template-columns:1fr auto;gap:.2rem .5rem;padding:.65rem;border:1px solid #355e67;border-radius:12px;background:#0b2228}.topicStatRow span{font-size:.75rem;font-weight:800}.topicStatRow small{grid-column:1/-1;width:max-content;padding:.15rem .45rem;border-radius:99px;font-size:.6rem;font-weight:900}.mastery-low{background:#402426;color:#ffacac}.mastery-mid{background:#403718;color:#ffe28e}.mastery-high{background:#163b28;color:#9af0b7}.achievementsGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem}.achievement{display:grid;grid-template-columns:auto 1fr auto;gap:.55rem;align-items:center;padding:.65rem;border:1px solid #3a5660;border-radius:12px;background:#101e23;opacity:.72}.achievement.done{opacity:1;border-color:#8b7537;background:#2d2713}.achievement>span{font-size:1.5rem}.achievement small{display:block;color:#a9bdc1}.feedbackSettings{display:flex;gap:.55rem;flex-wrap:wrap}.feedbackSettings button{padding:.65rem .85rem;border:1px solid #46747e;border-radius:12px;background:#102a31;color:#e7f9fc;font-weight:800}.progressEmpty{color:#9fb9bd}.charProfileModal{display:grid;grid-template-columns:minmax(180px,34%) 1fr;gap:1.1rem;align-items:start}.charProfileModal>img{width:100%;max-height:58vh;object-fit:cover;object-position:50% 20%;border-radius:18px;border:1px solid #4c7a84}.charProfileBody h2{margin:.25rem 0}.charProfileBody h4{color:#b8d5da;margin:.25rem 0 1rem}.charProfileStats{display:grid;gap:.3rem;margin:.8rem 0}.charProfileStat{display:flex;justify-content:space-between;gap:1rem;padding:.3rem .5rem;border-radius:8px;background:#0c2329}.charProfileStat b{color:#ffd96a}.profileUnlocked{color:#9be8b4}.profileLocked{color:#ffd28c}.unlockCelebration{text-align:center;padding:.6rem}.unlockBurst{font-size:4rem;color:#ffe06e;animation:unlockPulse .75s ease-in-out infinite alternate}.unlockTitle{font-weight:1000;letter-spacing:.08em;color:#fff1b2;margin-bottom:.8rem}.unlockCards{display:flex;justify-content:center;gap:.8rem;flex-wrap:wrap}.unlockCard{width:min(180px,42vw);padding:.5rem;border:1px solid #e0b850;border-radius:16px;background:linear-gradient(180deg,#3c3116,#161b1c);color:#fff}.unlockCard img{width:100%;aspect-ratio:4/5;object-fit:cover;object-position:50% 20%;border-radius:11px}.unlockCard b,.unlockCard small{display:block}.unlockCard small{color:#bfe4e8}@keyframes unlockPulse{from{transform:scale(.85) rotate(-8deg);opacity:.65}to{transform:scale(1.12) rotate(8deg);opacity:1}}@media(max-width:760px){.topicStats,.achievementsGrid{grid-template-columns:1fr}.charProfileModal{grid-template-columns:1fr}.charProfileModal>img{max-height:38vh}}
  .progressDashboard{max-height:76vh;overflow:auto;padding:.15rem}.progressHero{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem;border:1px solid #557984;border-radius:18px;background:linear-gradient(135deg,#12323a,#0b2026)}.progressEyebrow{font-size:.7rem;letter-spacing:.1em;color:#92e6ef;font-weight:900}.progressHero h2{margin:.2rem 0}.progressHero p{margin:.2rem 0;color:#bfd8dc}.progressRing{min-width:92px;aspect-ratio:1;border-radius:50%;border:7px solid #e7c36a;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#111e21}.progressRing b{font-size:1.35rem}.progressRing small{color:#b9ced2}.progressDashboard h3{margin:1.1rem 0 .55rem;color:#fff0bd}.progressModules{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}.progressModuleRow{padding:.65rem;border:1px solid #315861;border-radius:12px;background:#0b2228}.progressModuleRow span{font-size:.78rem;font-weight:800}.progressModuleRow>b{float:right}.progressModuleRow>div{clear:both;height:7px;margin-top:.45rem;border-radius:99px;background:#08161a;overflow:hidden}.progressModuleRow i{display:block;height:100%;background:linear-gradient(90deg,#35b8c8,#e1c15f);border-radius:99px}.progressMissions{display:grid;gap:.45rem}.progressMission{display:grid;grid-template-columns:auto 1fr auto;gap:.6rem;align-items:center;padding:.65rem;border:1px solid #3b6068;border-radius:12px;background:#0c2228}.progressMission.done{border-color:#508d69;background:#102a20}.progressMission>span{font-size:1.45rem}.progressMission small{display:block;color:#a9c5ca}.progressMission>strong{font-size:1.2rem;color:#ffd36f}.progressCollection{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.55rem}.progressCharCard{padding:.45rem;border:1px solid #365e67;border-radius:13px;background:#0b2228;text-align:center}.progressCharCard.locked{filter:saturate(.45);opacity:.8}.progressCharPortrait{position:relative;aspect-ratio:4/5;border-radius:10px;overflow:hidden;background:#102d34}.progressCharPortrait img{width:100%;height:100%;object-fit:cover;object-position:50% 20%}.progressCharPortrait>span{width:100%;height:100%;align-items:center;justify-content:center;font-size:2.5rem}.progressCharPortrait em{position:absolute;inset:auto .35rem .35rem auto;font-style:normal;font-size:1.25rem;filter:drop-shadow(0 2px 4px #000)}.progressCharCard strong{display:block;margin-top:.35rem;font-size:.75rem}.progressCharCard small{display:block;color:#81c8d2;font-size:.55rem}.progressCharCard p{font-size:.52rem;line-height:1.2;color:#c8d9dc;min-height:2.5em}.progressCharCard.open p{color:#98e2b2}@media(max-width:760px){.progressModules{grid-template-columns:1fr}.progressCollection{grid-template-columns:repeat(3,minmax(0,1fr))}}
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
      <span class="charProgressBadge ${characterUnlocked(character) ? '' : 'locked'}" title="${characterUnlockLabel(character)}">${characterUnlocked(character) ? charText('✓ DESBLOQUEADO','✓ UNLOCKED') : charText('🔒 CPU','🔒 CPU')}</span>
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
    <p class="characterHint">${charText('En VS de 2 equipos puedes probar todos. En el futuro VS computadora, Nova inicia desbloqueada y los especialistas se obtienen con tu progreso académico.','In 2-team VS you can try everyone. In future VS-computer mode, Nova starts unlocked and specialists are earned through academic progress.')}</p>
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

const progressHomeButton = document.createElement('button');
progressHomeButton.id = 'progressCollection';
progressHomeButton.className = 'progressHomeButton';
progressHomeButton.textContent = charText('🏆 PROGRESO / COLECCIÓN','🏆 PROGRESS / COLLECTION');
document.querySelector('.homeActions')?.appendChild(progressHomeButton);
progressHomeButton.onclick = showProgressDashboard;

$('#start').onclick = showCharacterSetup;
updateScoreUI();

window.addEventListener('dentistas-language-changed', () => {
  try {
    updateScoreUI(); updateTurnUI();
    const b = document.querySelector('#progressCollection');
    if (b) b.textContent = charText('🏆 PROGRESO / COLECCIÓN','🏆 PROGRESS / COLLECTION');
  } catch (_) {}
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
