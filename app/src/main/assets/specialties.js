'use strict';

// 100 Dentistas Dijeron · Bancos por especialidad
const SPECIALTY_VERSION = '3.0.16-clinical-classification-audit';
const SPECIALTY_TARGET = 100;
const SPECIALTY_HISTORY_KEY = 'dentistas-specialty-history-v1';
const SPECIALTY_PREF_KEY = 'dentistas-specialty-preferences-v1';

const SPECIALTY_DEFS = [
  {id:'general', name:'TODAS LAS ESPECIALIDADES', icon:'🦷', desc:'Mezcla preguntas de todas las áreas', always:true},
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

// Categorías adicionales: se generan desde los nombres reales de categoría del banco.
// Las especialidades ya representadas conservan su opción original; las demás
// aparecen como bancos independientes, sin inferir su área por palabras del enunciado.
const SP_BASE_CATEGORY_NAMES = new Set([
  'operatoria dental','anestesia dental','ortopedia maxilar','ortodoncia',
  'odontopediatria','cirugia bucal','periodoncia','protesis dental',
  'endodoncia','anatomia dental','anatomia','anestesia','cirugia',
  'operatoria','protesis','odontologia preventiva'
].map(spNorm));
// Clasificación editorial de categorías de origen. No sustituye la revisión individual del reactivo.
const SP_CATEGORY_CLASSIFICATION = {
  "anestesia dental": [
    "Anestesiología odontológica",
    "Anestésicos locales, selección y técnicas"
  ],
  "anatomía dental": [
    "Ciencias básicas",
    "Morfología dentaria y dentición"
  ],
  "articulación temporomandibular y trastornos temporomandibulares": [
    "Oclusión y dolor orofacial",
    "Anatomía funcional de ATM y TTM"
  ],
  "bioética y legislación odontológica": [
    "Ética y gestión profesional",
    "Autonomía, consentimiento y legislación"
  ],
  "cariología": [
    "Operatoria y cariología",
    "Proceso de caries, riesgo y diagnóstico"
  ],
  "cirugía bucal": [
    "Cirugía bucal y maxilofacial",
    "Valoración y procedimientos quirúrgicos"
  ],
  "desarrollo craneofacial": [
    "Crecimiento y desarrollo craneofacial",
    "Embriología y crecimiento de los maxilares"
  ],
  "desarrollo de la oclusión": [
    "Odontopediatría y ortodoncia",
    "Dentición, recambio y oclusión en desarrollo"
  ],
  "embriología dental": [
    "Ciencias básicas",
    "Origen embrionario de tejidos dentales"
  ],
  "endodoncia": [
    "Endodoncia",
    "Diagnóstico pulpar y periapical"
  ],
  "farmacología odontológica": [
    "Farmacología",
    "Prescripción y seguridad farmacológica"
  ],
  "fisiología": [
    "Ciencias básicas",
    "Fisiología general y oral"
  ],
  "fotografía y documentación clínica odontológica": [
    "Diagnóstico y documentación",
    "Fotografía y registros clínicos"
  ],
  "hábitos y parafunciones": [
    "Ortodoncia preventiva y terapia miofuncional",
    "Hábitos y efectos dentofaciales"
  ],
  "implantología": [
    "Implantología oral",
    "Indicación y planificación implantaria"
  ],
  "infecciones odontogénicas": [
    "Cirugía e infectología odontológica",
    "Etiología y propagación de infecciones"
  ],
  "laboratorio de ortodoncia y ortopedia": [
    "Ortodoncia y ortopedia maxilar",
    "Modelos, aparatos y laboratorio"
  ],
  "materiales dentales": [
    "Biomateriales odontológicos",
    "Propiedades y manipulación"
  ],
  "medicina bucal": [
    "Medicina bucal",
    "Valoración médica y atención odontológica"
  ],
  "microbiología oral": [
    "Ciencias básicas",
    "Microbiota y biofilm oral"
  ],
  "microbiologia oral": [
    "Ciencias básicas",
    "Microbiota y biofilm oral"
  ],
  "nomenclatura y etimología médica": [
    "Ciencias básicas",
    "Terminología médica"
  ],
  "odontología estética": [
    "Odontología estética",
    "Análisis facial y sonrisa"
  ],
  "odontología forense": [
    "Odontología forense",
    "Identificación y procedimientos forenses"
  ],
  "odontología geriátrica": [
    "Odontogeriatría",
    "Envejecimiento y salud oral"
  ],
  "odontologia geriatrica": [
    "Odontogeriatría",
    "Envejecimiento y salud oral"
  ],
  "odontología para pacientes con necesidades especiales": [
    "Atención a pacientes con necesidades especiales",
    "Valoración y adaptación de atención"
  ],
  "odontología preventiva": [
    "Prevención y salud pública bucal",
    "Prevención individual y control de caries"
  ],
  "odontopediatría": [
    "Odontopediatría",
    "Atención integral infantil"
  ],
  "oclusión": [
    "Oclusión y rehabilitación oral",
    "Relaciones oclusales y movimientos mandibulares"
  ],
  "oclusión funcional y ajuste oclusal avanzado": [
    "Oclusión y rehabilitación oral",
    "Oclusión funcional y ajuste"
  ],
  "operatoria dental": [
    "Operatoria y cariología",
    "Diagnóstico y restauración"
  ],
  "ortodoncia": [
    "Ortodoncia",
    "Diagnóstico de maloclusiones y tratamiento"
  ],
  "ortopedia maxilar": [
    "Ortopedia dentofacial",
    "Crecimiento y terapéutica ortopédica"
  ],
  "ortopedia dental": [
    "Ortopedia dentofacial",
    "Denominación por confirmar"
  ],
  "patología bucal": [
    "Patología y medicina bucal",
    "Lesiones y diagnóstico oral"
  ],
  "periodoncia": [
    "Periodoncia",
    "Salud y enfermedad periodontal"
  ],
  "psicología infantil": [
    "Odontopediatría",
    "Manejo conductual infantil"
  ],
  "prótesis dental": [
    "Rehabilitación oral y prótesis",
    "Diagnóstico y planificación protésica"
  ],
  "prótesis fija": [
    "Prótesis bucal",
    "Coronas, puentes y preparaciones"
  ],
  "prótesis removible": [
    "Prótesis bucal",
    "Prótesis parcial removible"
  ],
  "prótesis total": [
    "Prótesis bucal",
    "Paciente edéntulo y prótesis total"
  ],
  "prótesis bucal": [
    "Prótesis bucal",
    "Prótesis fija, removible y total"
  ],
  "radiología oral y maxilofacial": [
    "Imagenología odontológica",
    "Selección e interpretación de estudios"
  ],
  "realización del expediente clínico": [
    "Diagnóstico y documentación",
    "Integración y registro clínico"
  ],
  "rehabilitación oral": [
    "Rehabilitación oral",
    "Diagnóstico integral y plan de tratamiento"
  ],
  "salud pública y odontología comunitaria": [
    "Salud pública bucal",
    "Epidemiología y prevención colectiva"
  ],
  "traumatología dental": [
    "Traumatología dentoalveolar",
    "Evaluación y manejo del trauma"
  ],
  "urgencias médicas en odontología": [
    "Urgencias médicas odontológicas",
    "Reconocimiento y respuesta inicial"
  ]
};
function spClassificationForQuestion(q){
  const key=spNorm(q?.cat||'');
  const entry=SP_CATEGORY_CLASSIFICATION[key];
  const specialtyFallback={
    operatoria:['Operatoria y cariología','Restauración dental'],
    anestesia:['Anestesiología odontológica','Anestésicos y técnicas'],
    ortopedia:['Ortopedia dentofacial','Crecimiento y terapéutica'],
    ortho_preventiva:['Ortodoncia preventiva','Hábitos y prevención'],
    ortho_interceptiva:['Ortodoncia interceptiva','Tratamiento temprano'],
    ortho_correctiva:['Ortodoncia','Diagnóstico y tratamiento'],
    odontopediatria:['Odontopediatría','Atención infantil'],
    cirugia:['Cirugía bucal y maxilofacial','Procedimientos quirúrgicos'],
    periodoncia:['Periodoncia','Salud periodontal'],
    protesis:['Prótesis bucal','Rehabilitación protésica'],
    endodoncia:['Endodoncia','Diagnóstico y tratamiento pulpar'],
    anatomia:['Ciencias básicas','Anatomía dental']
  };
  const fallback=specialtyFallback[q?.specialty];
  return {
    sourceCategory:String(q?.cat||''),
    primaryArea:entry?.[0]||fallback?.[0]||'Pendiente de clasificación',
    subarea:entry?.[1]||fallback?.[1]||'Revisión requerida',
    status:entry||fallback?'classified':'pending'
  };
}

function spApplyClassification(q){
  if(!q || typeof q!=='object') return q;
  const c=spClassificationForQuestion(q);
  q.sourceCategory=q.sourceCategory||c.sourceCategory;
  q.primaryArea=c.primaryArea;
  q.subarea=c.subarea;
  q.classificationStatus=c.status;
  return q;
}

function spQuestionKey(value){
  return spNorm(value).replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}

function spAuditBank(){
  const exact=new Map();
  const byArea={};
  let pending=0, withoutCategory=0, emptyAnswers=0;
  questionPool.forEach(q=>{
    spApplyClassification(q);
    const area=q.primaryArea||'Pendiente de clasificación';
    byArea[area]=(byArea[area]||0)+1;
    if(q.classificationStatus!=='classified') pending++;
    if(!q.cat) withoutCategory++;
    if(!Array.isArray(q.a)||!q.a.length) emptyAnswers++;
    const key=spQuestionKey(q.q||'');
    if(key){if(!exact.has(key))exact.set(key,[]);exact.get(key).push(q);}
  });
  const exactGroups=[...exact.values()].filter(group=>group.length>1);
  const duplicateRecords=exactGroups.reduce((n,g)=>n+g.length-1,0);
  return {total:questionPool.length,byArea,pending,withoutCategory,emptyAnswers,exactDuplicateGroups:exactGroups.length,exactDuplicateRecords:duplicateRecords};
}

let spExtraCategoriesReady = false;
function spCategoryId(value){
  return 'cat_' + spNorm(value).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
}
function spEnsureCategoryDefs(){
  if(!Array.isArray(questionPool)) return;
  questionPool.forEach(spApplyClassification);
  if(spExtraCategoriesReady) return;
  const counts=new Map();
  questionPool.forEach(q=>{
    const value=String(q?.cat||'').trim();
    if(!value) return;
    const key=spNorm(value);
    if(!key || SP_BASE_CATEGORY_NAMES.has(key) || SPECIALTY_DEFS.some(d=>spNorm(d.id)===key || spNorm(d.name)===key)) return;
    const item=counts.get(key)||{name:value,count:0};
    item.count++;
    counts.set(key,item);
  });
  counts.forEach(item=>{
    const id=spCategoryId(item.name);
    if(SPECIALTY_DEFS.some(d=>d.id===id)) return;
    SPECIALTY_DEFS.push({id,name:item.name.toLocaleUpperCase('es-MX'),icon:'📚',desc:(SP_CATEGORY_CLASSIFICATION[spNorm(item.name)]||['Pendiente de clasificación','Revisión requerida'])[0],categoryValue:item.name,categoryExact:true,primaryArea:(SP_CATEGORY_CLASSIFICATION[spNorm(item.name)]||['Pendiente de clasificación','Revisión requerida'])[0],subarea:(SP_CATEGORY_CLASSIFICATION[spNorm(item.name)]||['Pendiente de clasificación','Revisión requerida'])[1]});
  });
  spExtraCategoriesReady=true;
  specialtyStatsCache=null;
}

function spTagsForQuestion(q){
  spEnsureCategoryDefs();
  const cat=spNorm(q?.cat||'');
  const text=spNorm((q?.q||'')+' '+cat);
  const tags=new Set();
  if(q?.specialty && SPECIALTY_DEFS.some(d=>d.id===q.specialty)) tags.add(q.specialty);
  SPECIALTY_DEFS.forEach(d=>{
    if(d.categoryExact && spNorm(q?.cat||'')===spNorm(d.categoryValue)) tags.add(d.id);
  });

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
  return priority.find(x=>tags.includes(x)) || spClassificationForQuestion(q).primaryArea;
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
  spEnsureCategoryDefs();
  const result={};
  SPECIALTY_DEFS.forEach(d=>{
    const n=spBank(d.id).length;
    result[d.id]={count:n,ready:d.id==='general'||n>=GAME_SIZE,complete:false};
  });
  specialtyStatsCache=result;
  return result;
}

function spReadHistory(){
  try{return JSON.parse(localStorage.getItem(SPECIALTY_HISTORY_KEY)||'{}')||{};}catch(_){return {};}
}
function spWriteHistory(h){ try{localStorage.setItem(SPECIALTY_HISTORY_KEY,JSON.stringify(h));}catch(_){} }

function spHistoryScope(id){
  return (id||'general')+'|'+(specialtyDifficulty||'mix');
}

function spFreshPool(id,pool){
  const h=spReadHistory();
  const scope=spHistoryScope(id);
  // Todo el banco permanece elegible. El historial solo modifica probabilidades.
  return {fresh:[...pool],history:h,scope};
}

function spWeightedRandomSample(pool,count,history,scope){
  const used=Array.isArray(history[scope])?history[scope]:[];
  const lastGame=new Set(used.slice(0,GAME_SIZE));
  const recent=new Set(used.slice(0,GAME_SIZE*2));
  const candidates=[...pool];
  const chosen=[];

  while(chosen.length<count && candidates.length){
    const weighted=candidates.map(q=>{
      let weight=1;
      if(recent.has(q.q))weight=.42;
      if(lastGame.has(q.q))weight=.18;
      return {q,weight};
    });
    const total=weighted.reduce((s,x)=>s+x.weight,0);
    let pick=Math.random()*total;
    let idx=0;
    for(;idx<weighted.length;idx++){
      pick-=weighted[idx].weight;
      if(pick<=0)break;
    }
    idx=Math.min(idx,weighted.length-1);
    chosen.push(weighted[idx].q);
    candidates.splice(candidates.indexOf(weighted[idx].q),1);
  }
  return chosen;
}

function spOrderForNewGame(selected,history,scope){
  if(selected.length<2)return [...selected];
  const firstKey=scope+'::first';
  const recentFirst=new Set(Array.isArray(history[firstKey])?history[firstKey].slice(0,5):[]);
  const pool=[...selected];
  const weighted=pool.map(q=>({q,weight:recentFirst.has(q.q)?.22:1}));
  const total=weighted.reduce((s,x)=>s+x.weight,0);
  let pick=Math.random()*total;
  let first=weighted[weighted.length-1].q;
  for(const x of weighted){pick-=x.weight;if(pick<=0){first=x.q;break;}}
  return [first,...shuffle(selected.filter(q=>q!==first))];
}

function spRemember(id,selected,history,scope=spHistoryScope(id)){
  const prev=Array.isArray(history[scope])?history[scope]:[];
  history[scope]=[...selected.map(q=>q.q),...prev].slice(0,Math.max(240,SPECIALTY_TARGET*2));

  const firstKey=scope+'::first';
  const prevFirst=Array.isArray(history[firstKey])?history[firstKey]:[];
  if(selected[0])history[firstKey]=[selected[0].q,...prevFirst].slice(0,12);
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
  const {fresh,history,scope}=spFreshPool(id,base);
  let chosen=[];
  if(id==='general'){
    const specialtyPools={};
    SPECIALTY_DEFS.filter(d=>d.id!=='general').forEach(d=>{
      const arr=fresh.filter(q=>spTagsForQuestion(q).includes(d.id));
      if(arr.length) specialtyPools[d.id]=arr;
    });
    const ids=shuffle(Object.keys(specialtyPools));
    while(chosen.length<GAME_SIZE&&ids.length){
      const sid=ids.shift();
      const candidates=shuffle(specialtyPools[sid]).filter(q=>!chosen.includes(q));
      if(candidates.length) chosen.push(candidates[0]);
    }
    if(chosen.length<GAME_SIZE) shuffle(fresh).forEach(q=>{if(chosen.length<GAME_SIZE&&!chosen.includes(q))chosen.push(q);});
  } else {
    // 8 de TODO el banco de la especialidad. Ningún subtema queda reservado
    // y ninguna pregunta queda excluida por haber aparecido recientemente.
    chosen=spWeightedRandomSample(fresh,GAME_SIZE,history,scope);
  }

  // La selección y el orden son aleatorios. Las aperturas recientes solo
  // reciben menor probabilidad; siguen siendo posibles.
  questions=spOrderForNewGame(chosen.slice(0,GAME_SIZE),history,scope);
  spRemember(id,questions,history,scope);
};

function spBadgeText(stat,id){
  if(id==='general') return questionPool.length+' disponibles';
  if(stat.count>=SPECIALTY_TARGET) return stat.count+'/100 registros · pendiente de validación';
  if(stat.ready) return stat.count+'/100 registros';
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
  spEnsureCategoryDefs();
  const stats=spStats();
  openModal(`
    <h2>2 · ELIGE LA ESPECIALIDAD</h2>
    <p class="specialtyLead">Cada partida toma <b>8 preguntas al azar de todo el banco</b> de la especialidad. Meta editorial: <b>100 preguntas verificadas por banco</b>.</p>
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
  return SPECIALTY_DEFS.find(x=>x.id===specialtySelected)?.name || 'TODAS LAS ESPECIALIDADES';
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
  const h=spReadHistory();
  const prefix=(id||'general')+'|';
  Object.keys(h).forEach(k=>{if(k===id||k.startsWith(prefix))delete h[k];});
  spWriteHistory(h);
}

function spBankStatusModal(){
  const stats=spStats();
  const audit=spAuditBank();
  openModal(`<h2>📚 ESTADO DE LOS BANCOS</h2>
    <div class="bankProgressList">
      ${SPECIALTY_DEFS.map(d=>`<div><span>${d.icon} ${d.name}</span><b>${d.id==='general'?stats[d.id].count:stats[d.id].count+'/100 registros'}</b></div>`).join('')}
    </div>
    <p>Solo se habilitan bancos con al menos 8 registros. Meta editorial: 100 preguntas únicas y revisadas.</p>
    <p><b>Auditoría del banco:</b> ${audit.total} registros · ${audit.pending} pendientes de clasificación · ${audit.withoutCategory} sin categoría de origen · ${audit.exactDuplicateRecords} posibles duplicados exactos en ${audit.exactDuplicateGroups} grupos · ${audit.emptyAnswers} sin respuestas.</p>
    <button id="spResetCurrent" class="secondaryWide">↻ REINICIAR PREGUNTAS RECIENTES DE ${spSpecialtyName()}</button>`);
  $('#spResetCurrent').onclick=()=>{spResetHistory();alert('Historial de este banco reiniciado.');};
}

const spOrigHelp=showHelp;
showHelp=function(){
  openModal(`
    <h2>¿CÓMO SE JUEGA?</h2>
    <ol>
      <li>Elige <b>dos equipos y personajes</b>.</li>
      <li>Después selecciona una <b>especialidad</b> o <b>Todas las especialidades</b>.</li>
      <li>Cada partida tiene <b>8 rondas</b> y 8 preguntas diferentes.</li>
      <li>Rondas 1–2: <b>×1</b>; rondas 3–4: <b>×2</b>; rondas 5–8: <b>×3</b>.</li>
      <li>La ronda 8 es la <b>Gran Final</b>.</li>
      <li>Cada especialidad mezcla preguntas y cambia su orden en cada partida. Todas las especialidades combina además áreas diferentes.</li>
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
  const art=typeof characterArtHtml==='function'?characterArtHtml(winner):char.icon;
  openModal(`<div class="winnerStage">
    <div class="winnerCharacters">${art} <span class="trophy">🏆</span></div>
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
