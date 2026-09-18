'use strict';

// 100 Dentistas Dijeron · Bancos por especialidad
const SPECIALTY_VERSION = '2.4-360-questions-beta';
const SPECIALTY_TARGET = 100;
const SPECIALTY_HISTORY_KEY = 'dentistas-specialty-history-v1';
const SPECIALTY_PREF_KEY = 'dentistas-specialty-preferences-v1';

const SPECIALTY_DEFS = [
  {id:'general', name:'TODO AL AZAR', icon:'🎲', desc:'Mezcla de todas las áreas', always:true},
  {id:'operatoria', name:'OPERATORIA DENTAL', icon:'🦷', desc:'Cariología, adhesión, restauraciones y materiales'},
  {id:'anestesia', name:'ANESTESIA DENTAL', icon:'💉', desc:'Anestésicos, técnicas, bloqueos y complicaciones'},
  {id:'ortopedia', name:'ORTOPEDIA DENTAL', icon:'🦴', desc:'Crecimiento, función y ortopedia dentofacial'},
  {id:'ortho_preventiva', name:'ORTODONCIA PREVENTIVA', icon:'🛡️', desc:'Hábitos, prevención y conservación del desarrollo'},
  {id:'ortho_interceptiva', name:'ORTODONCIA INTERCEPTIVA', icon:'🚦', desc:'Problemas tempranos durante el crecimiento'},
  {id:'ortho_correctiva', name:'ORTODONCIA CORRECTIVA', icon:'😁', desc:'Diagnóstico, cefalometría y aparatología'},
  {id:'odontopediatria', name:'ODONTOPEDIATRÍA', icon:'👶', desc:'Prevención, conducta, pulpa temporal y espacio'},
  {id:'cirugia', name:'CIRUGÍA BUCAL Y MAXILOFACIAL', icon:'🩺', desc:'Extracciones, cirugía y diagnóstico quirúrgico'},
  {id:'periodoncia', name:'PERIODONCIA', icon:'🩸', desc:'Encía, periodonto, diagnóstico y tratamiento'},
  {id:'protesis', name:'PRÓTESIS BUCAL', icon:'🦷', desc:'Fija, removible, total, oclusión e implantes'},
  {id:'endodoncia', name:'ENDODONCIA', icon:'🔬', desc:'Diagnóstico pulpar, conductos, irrigación y complicaciones'},
  {id:'anatomia', name:'ANATOMÍA DENTAL', icon:'🧠', desc:'Diente, periodonto, músculos, nervios y ATM'}
];

let specialtySelected = 'general';
let specialtyDifficulty = 'mix';
let specialtyStatsCache = null;

(function spLoadPrefs(){
  try {
    const p=JSON.parse(localStorage.getItem(SPECIALTY_PREF_KEY)||'{}');
    if(SPECIALTY_DEFS.some(x=>x.id===p.specialty)) specialtySelected=p.specialty;
    if(['mix','basic','intermediate','advanced'].includes(p.difficulty)) specialtyDifficulty=p.difficulty;
  } catch(_) {}
})();

function spNorm(s){
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function spHas(text, words){ return words.some(w=>text.includes(w)); }

function spTagsForQuestion(q){
  const cat=spNorm(q?.cat||'');
  const text=spNorm((q?.q||'')+' '+cat);
  const tags=new Set();
  if(q?.specialty && SPECIALTY_DEFS.some(d=>d.id===q.specialty)) tags.add(q.specialty);

  if(cat.includes('anatomia y fisiologia') || spHas(text,['tejidos forman un diente','periodonto','glandulas salivales','musculos de la masticacion','nervio trigemino','superficies anatomicas','grupos dentarios','articulacion temporomandibular'])) tags.add('anatomia');

  if(cat.includes('periodoncia') || spHas(text,['periodontal','periodontitis','gingivitis','mucogingival','sangrado al sondaje','biofilm periodontal'])) tags.add('periodoncia');

  if(cat.includes('endodoncia') || spHas(text,['pulpar','periapical','conductos','irrigantes','hipoclorito','periodontitis apical','endodoncia'])) tags.add('endodoncia');

  if(cat.includes('protesis') || spHas(text,['protesis','protesica','pontico','oclusion estable','impresion','color dental','restauracion implantosoportada','periimplantaria','injertos oseos'])) tags.add('protesis');

  if(cat.includes('preventiva') || cat.includes('materiales') || cat.includes('endodoncia y restauradora') ||
      spHas(text,['caries','restauracion','resina','adhesiva','aislamiento','selladores','fluoruro','desmineralizacion','hipersensibilidad dentinaria','amalgama','ceramicas','blanqueamiento','estetica de la sonrisa'])) tags.add('operatoria');

  if(cat.includes('cirugia') && spHas(text,['anestes','bloqueo','lidocaina','articaina','mepivacaina','prilocaina'])) tags.add('anestesia');
  if(spHas(text,['anestesicos locales','tecnicas de anestesia','complicaciones posibles de la anestesia','bloqueo del nervio'])) tags.add('anestesia');

  if(cat.includes('cirugia') && spHas(text,['extraccion','instrumentos habituales','biops','muestra diagnostica','cirugia'])) tags.add('cirugia');
  if(spHas(text,['extraccion dental','despues de una extraccion','muestra diagnostica','lesiones de la region oral'])) tags.add('cirugia');

  if(cat.includes('odontopediatria') || spHas(text,['ninos','odontopediatria','dientes temporales','mantenedores de espacio','conducta','caries en ninos'])) tags.add('odontopediatria');

  if(cat.includes('ortodoncia') || cat.includes('cefalometr') || cat.includes('fisiologia orofacial') || cat.includes('terapia miofuncional') || cat.includes('respiracion oral') || cat.includes('analisis facial')){
    if(spHas(text,['habitos','respiracion oral','terapia miofuncional','funciones orofaciales','mantenedores de espacio'])) tags.add('ortho_preventiva');
    if(spHas(text,['mordida cruzada','transversales','interceptiva','crecimiento','respiracion oral','problemas que pueden abordarse','mantenedores de espacio'])) tags.add('ortho_interceptiva');
    if(spHas(text,['anb','steiner','bolton','powell','cefalometr','angle','aparatos ortodoncicos','patron vertical','perfil facial','angulo goniaco'])) tags.add('ortho_correctiva');
    if(spHas(text,['crecimiento','funcion','respiracion oral','terapia miofuncional','transversales','mordida cruzada','patron vertical','mandibular'])) tags.add('ortopedia');
  }

  return [...tags];
}

function spPrimaryTag(q){
  const tags=spTagsForQuestion(q);
  const priority=['operatoria','anestesia','ortopedia','ortho_preventiva','ortho_interceptiva','ortho_correctiva','odontopediatria','cirugia','periodoncia','protesis','endodoncia','anatomia'];
  return priority.find(x=>tags.includes(x)) || 'general';
}

function spBank(id){
  if(id==='general') return [...questionPool];
  return questionPool.filter(q=>spTagsForQuestion(q).includes(id));
}

function spDifficultyOf(q){
  if(['basic','intermediate','advanced'].includes(q?.difficulty)) return q.difficulty;
  const n=Array.isArray(q?.a)?q.a.length:0;
  if(n<=3) return 'basic';
  if(n===4) return 'intermediate';
  return 'advanced';
}

function spFilteredBank(id){
  let pool=spBank(id);
  if(specialtyDifficulty!=='mix') pool=pool.filter(q=>spDifficultyOf(q)===specialtyDifficulty);
  return pool;
}

function spStats(){
  const result={};
  SPECIALTY_DEFS.forEach(d=>{
    const n=spBank(d.id).length;
    result[d.id]={count:n,ready:d.id==='general'||n>=GAME_SIZE,complete:d.id!=='general'&&n>=SPECIALTY_TARGET};
  });
  specialtyStatsCache=result;
  return result;
}

function spReadHistory(){
  try{return JSON.parse(localStorage.getItem(SPECIALTY_HISTORY_KEY)||'{}')||{};}catch(_){return {};}
}
function spWriteHistory(h){ try{localStorage.setItem(SPECIALTY_HISTORY_KEY,JSON.stringify(h));}catch(_){} }

function spFreshPool(id,pool){
  const h=spReadHistory();
  const used=Array.isArray(h[id])?h[id]:[];
  let fresh=pool.filter(q=>!used.includes(q.q));
  if(fresh.length<GAME_SIZE){
    h[id]=[];
    spWriteHistory(h);
    fresh=[...pool];
  }
  return {fresh,history:h};
}

function spRemember(id,selected,history){
  const prev=Array.isArray(history[id])?history[id]:[];
  history[id]=[...selected.map(q=>q.q),...prev].filter((x,i,a)=>a.indexOf(x)===i).slice(0,Math.max(SPECIALTY_TARGET,48));
  spWriteHistory(history);
}

function spDiverseSample(pool,count){
  const groups={};
  shuffle(pool).forEach(q=>{
    const key=spPrimaryTag(q);
    (groups[key]??=[]).push(q);
  });
  const keys=shuffle(Object.keys(groups));
  const chosen=[];
  while(chosen.length<count && keys.length){
    const k=keys.shift();
    if(groups[k]?.length) chosen.push(groups[k].shift());
  }
  if(chosen.length<count){
    shuffle(pool).forEach(q=>{if(chosen.length<count&&!chosen.includes(q))chosen.push(q);});
  }
  return chosen.slice(0,count);
}

chooseGameQuestions=function(){
  const id=specialtySelected||'general';
  const base=spFilteredBank(id);
  if(base.length<GAME_SIZE){
    questions=[];
    return;
  }
  const {fresh,history}=spFreshPool(id,base);
  if(id==='general'){
    const specialtyPools={};
    SPECIALTY_DEFS.filter(d=>d.id!=='general').forEach(d=>{
      const arr=fresh.filter(q=>spTagsForQuestion(q).includes(d.id));
      if(arr.length) specialtyPools[d.id]=arr;
    });
    const ids=shuffle(Object.keys(specialtyPools));
    const chosen=[];
    while(chosen.length<GAME_SIZE&&ids.length){
      const sid=ids.shift();
      const candidates=shuffle(specialtyPools[sid]).filter(q=>!chosen.includes(q));
      if(candidates.length) chosen.push(candidates[0]);
    }
    if(chosen.length<GAME_SIZE) shuffle(fresh).forEach(q=>{if(chosen.length<GAME_SIZE&&!chosen.includes(q))chosen.push(q);});
    questions=chosen.slice(0,GAME_SIZE);
  } else {
    questions=spDiverseSample(fresh,GAME_SIZE);
  }
  spRemember(id,questions,history);
};

function spBadgeText(stat,id){
  if(id==='general') return questionPool.length+' disponibles';
  if(stat.complete) return '✓ 100/100 COMPLETO';
  if(stat.ready) return stat.count+'/100 verificadas';
  return stat.count+'/100 · faltan '+Math.max(0,GAME_SIZE-stat.count)+' para jugar';
}

function spShowTeamSetup(){
  stopTimer();
  openModal(`
    <h2>1 · ELIGE TUS EQUIPOS</h2>
    <p class="specialtyLead">Primero nombres y personajes. Después elegirán la especialidad.</p>
    <div class="setupTeams">
      <section class="setupTeam">
        <h3>EQUIPO 1</h3>
        <input id="spName1" class="teamInput" maxlength="18" value="${String(teamNames[0]).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">
        <div id="spChars1" class="characterGrid"></div>
      </section>
      <section class="setupTeam">
        <h3>EQUIPO 2</h3>
        <input id="spName2" class="teamInput" maxlength="18" value="${String(teamNames[1]).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">
        <div id="spChars2" class="characterGrid"></div>
      </section>
    </div>
    <button id="spNextSpecialty" class="setupStart">SIGUIENTE · ELEGIR ESPECIALIDAD ▶</button>
  `);
  if(typeof setupCharacterCards==='function'){
    setupCharacterCards(0,$('#spChars1'));
    setupCharacterCards(1,$('#spChars2'));
  }
  $('#spNextSpecialty').onclick=()=>{
    const n1=($('#spName1').value||'EQUIPO 1').trim().toUpperCase().slice(0,18);
    const n2=($('#spName2').value||'EQUIPO 2').trim().toUpperCase().slice(0,18);
    if(typeof teamCharacters!=='undefined'&&teamCharacters[0]===teamCharacters[1]){alert('Cada equipo debe elegir un personaje diferente.');return;}
    teamNames=[n1||'EQUIPO 1',n2||'EQUIPO 2'];
    if(typeof saveState==='function')saveState();
    if(typeof saveCharacterSettings==='function')saveCharacterSettings();
    spShowSpecialties();
  };
}

function spShowSpecialties(){
  const stats=spStats();
  openModal(`
    <h2>2 · ELIGE LA ESPECIALIDAD</h2>
    <p class="specialtyLead">Cada partida juega <b>8 preguntas</b>. Meta editorial: <b>100 preguntas verificadas por banco</b>.</p>
    <div class="specialtyGrid">
      ${SPECIALTY_DEFS.map(d=>{
        const s=stats[d.id];
        return `<button class="specialtyCard ${s.ready?'':'disabled'} ${specialtySelected===d.id?'selected':''}" data-specialty="${d.id}" ${s.ready?'':'disabled'}>
          <span class="specialtyIcon">${d.icon}</span>
          <strong>${d.name}</strong>
          <small>${d.desc}</small>
          <span class="specialtyCount">${spBadgeText(s,d.id)}</span>
        </button>`;
      }).join('')}
    </div>
    <div class="specialtyBottom">
      <label>Dificultad
        <select id="spDifficulty">
          <option value="mix">🎲 Mezcla</option>
          <option value="basic">🌱 Básica</option>
          <option value="intermediate">🦷 Intermedia</option>
          <option value="advanced">🔥 Extra difícil</option>
        </select>
      </label>
      <button id="spStartGame" class="setupStart">COMENZAR · 8 RONDAS</button>
    </div>
  `);
  $('#spDifficulty').value=specialtyDifficulty;
  document.querySelectorAll('.specialtyCard:not(.disabled)').forEach(card=>card.onclick=()=>{
    specialtySelected=card.dataset.specialty;
    document.querySelectorAll('.specialtyCard').forEach(x=>x.classList.toggle('selected',x.dataset.specialty===specialtySelected));
  });
  $('#spStartGame').onclick=()=>{
    specialtyDifficulty=$('#spDifficulty').value;
    let pool=spFilteredBank(specialtySelected);
    if(pool.length<GAME_SIZE){
      alert('Con esta dificultad todavía no hay 8 preguntas verificadas. Elige Mezcla u otra especialidad.');
      return;
    }
    localStorage.setItem(SPECIALTY_PREF_KEY,JSON.stringify({specialty:specialtySelected,difficulty:specialtyDifficulty}));
    closeModal(false);
    if(typeof v2RoundHistory!=='undefined')v2RoundHistory=[];
    startNewGame();
  };
}

function spSpecialtyName(){
  return SPECIALTY_DEFS.find(x=>x.id===specialtySelected)?.name || 'TODO AL AZAR';
}

const spOrigShowRound=showRound;
showRound=function(reset=true){
  spOrigShowRound(reset);
  if(!questions.length)return;
  if(roundIndex===GAME_SIZE-1){
    $('#round').textContent=`🏆 GRAN FINAL · RONDA ${roundIndex+1} · ×${roundMultiplier()}`;
  }
  const ver=document.querySelector('.bankVersion');
  if(ver)ver.textContent=`Banco clínico · ${spSpecialtyName()} · ${SPECIALTY_VERSION}`;
};

const spOrigStartNew=startNewGame;
startNewGame=function(){
  const pool=spFilteredBank(specialtySelected);
  if(pool.length<GAME_SIZE){
    openModal(`<h2>BANCO EN CONSTRUCCIÓN</h2><p><b>${spSpecialtyName()}</b> tiene ${pool.length} preguntas verificadas disponibles con este filtro.</p><p>Se necesitan al menos <b>8</b> para jugar y la meta es <b>100</b>.</p><button id="backSpecialties" class="setupStart">ELEGIR OTRA ESPECIALIDAD</button>`);
    $('#backSpecialties').onclick=spShowSpecialties;
    return;
  }
  spOrigStartNew();
};

function spResetHistory(id=specialtySelected){
  const h=spReadHistory(); h[id]=[]; spWriteHistory(h);
}

function spBankStatusModal(){
  const stats=spStats();
  openModal(`<h2>📚 ESTADO DE LOS BANCOS</h2>
    <div class="bankProgressList">
      ${SPECIALTY_DEFS.map(d=>`<div><span>${d.icon} ${d.name}</span><b>${d.id==='general'?stats[d.id].count:stats[d.id].count+'/100'}</b></div>`).join('')}
    </div>
    <p>Solo se habilitan especialidades con al menos 8 preguntas verificadas. La meta editorial es 100 por especialidad.</p>
    <button id="spResetCurrent" class="secondaryWide">↻ REINICIAR PREGUNTAS RECIENTES DE ${spSpecialtyName()}</button>`);
  $('#spResetCurrent').onclick=()=>{spResetHistory();alert('Historial de este banco reiniciado.');};
}

const spOrigHelp=showHelp;
showHelp=function(){
  openModal(`
    <h2>¿CÓMO SE JUEGA?</h2>
    <ol>
      <li>Elige <b>dos equipos y personajes</b>.</li>
      <li>Después selecciona una <b>especialidad</b> o <b>Todo al azar</b>.</li>
      <li>Cada partida tiene <b>8 rondas</b> y 8 preguntas diferentes.</li>
      <li>Rondas 1–2: <b>×1</b>; rondas 3–4: <b>×2</b>; rondas 5–8: <b>×3</b>.</li>
      <li>La ronda 8 es la <b>Gran Final</b>.</li>
      <li>El modo Todo al azar intenta mezclar áreas diferentes para evitar partidas monótonas.</li>
      <li>Cada banco recuerda preguntas recientes para reducir repeticiones.</li>
      <li>Careo, cronómetro, 3 strikes y robo siguen funcionando igual.</li>
    </ol>
    <p><b>Meta:</b> 100 preguntas verificadas por cada especialidad.</p>
  `);
};

(function spInit(){
  const start=$('#start');
  if(start){start.textContent='JUGAR · ELEGIR EQUIPOS';start.onclick=spShowTeamSetup;}
  const home=$('.homeActions');
  if(home&&!$('#bankStatusBtn')){
    const b=document.createElement('button');b.id='bankStatusBtn';b.textContent='📚 BANCOS DE ESPECIALIDADES';b.onclick=spBankStatusModal;home.appendChild(b);
  }
  const round=$('#round');if(round&&round.textContent.includes('Ronda 1'))round.textContent='Ronda 1 · ×1';
})();


const spOriginalDeclareWinner = v2DeclareWinner;
v2DeclareWinner=function(winner,sudden=false){
  closeModal(false);
  const char=typeof characterFor==='function'?characterFor(winner):{icon:'🦷'};
  openModal(`<div class="winnerStage">
    <div class="winnerCharacters">${char.icon} 🏆</div>
    <div class="winnerName">¡${v2Escape(teamNames[winner])} GANA!</div>
    <div class="winnerScore">${scores[winner]} PUNTOS${sudden?' · MUERTE SÚBITA':''}</div>
    <p><b>${spSpecialtyName()}</b> · 8 rondas</p>
  </div>
  ${v2ResultsTable()}
  <div class="menuStack">
    <button id="spAgainSame">🎲 OTRA PARTIDA · MISMA ESPECIALIDAD</button>
    <button id="spChangeBank">📚 CAMBIAR ESPECIALIDAD</button>
    <button id="spHomeWinner">⌂ VOLVER A PORTADA</button>
  </div>`);
  $('#spAgainSame').onclick=()=>{closeModal(false);v2RoundHistory=[];startNewGame();};
  $('#spChangeBank').onclick=()=>{closeModal(false);spShowSpecialties();};
  $('#spHomeWinner').onclick=()=>{closeModal(false);$('#game').classList.add('hidden');$('#home').classList.remove('hidden');};
};

showMenu=function(){
  openModal(`<h2>MENÚ · ${spSpecialtyName()}</h2>
    <div class="menuStack">
      <button id="spMenuHelp">📋 Instrucciones</button>
      <button id="spMenuTeacher">🎓 Modo docente</button>
      <button id="spMenuSettings">⚙️ Accesibilidad y Show</button>
      <button id="spMenuInfo">📚 Explicación / fuente</button>
      <button id="spMenuBanks">📊 Estado de bancos</button>
      <button id="spMenuChange">🔁 Cambiar especialidad</button>
      <button id="spMenuNew">🎲 Nueva partida · mismo banco</button>
      <button id="spMenuHome">⌂ Portada</button>
    </div>`);
  $('#spMenuHelp').onclick=showHelp;
  $('#spMenuTeacher').onclick=v2TeacherMode;
  $('#spMenuSettings').onclick=v2Settings;
  $('#spMenuInfo').onclick=v2QuestionInfo;
  $('#spMenuBanks').onclick=spBankStatusModal;
  $('#spMenuChange').onclick=spShowSpecialties;
  $('#spMenuNew').onclick=()=>{if(confirm('¿Terminar esta partida e iniciar otra de la misma especialidad?')){closeModal(false);v2RoundHistory=[];startNewGame();}};
  $('#spMenuHome').onclick=()=>{closeModal(false);stopTimer();$('#game').classList.add('hidden');$('#home').classList.remove('hidden');};
};
$('#menu').onclick=showMenu;
