'use strict';

const V3_CORE_VERSION='3.0.1-classroom-research';
const V3_SNAPSHOT_KEY='dentistas-v3-live-snapshot';
const V3_HISTORY_KEY='dentistas-v3-session-history';
const V3_CORE_SETTINGS='dentistas-v3-core-settings';
const V3_PACKS_KEY='dentistas-v3-class-packs';
const V3_CHAMP_KEY='dentistas-v3-championship';

let v3Settings={
  rehearsal:false,
  research:false,
  researchCode:'',
  activePack:'',
  roundDifficulties:['basic','basic','intermediate','intermediate','advanced','advanced','advanced','advanced']
};
let v3Latency=[null,null];
let v3Restoring=false;
let v3SessionStartedAt=0;
let v3SessionSaved=false;
let v3RehearsalLaunch=false;

try{v3Settings={...v3Settings,...JSON.parse(localStorage.getItem(V3_CORE_SETTINGS)||'{}')};}catch(_){}
function v3SaveSettings(){try{localStorage.setItem(V3_CORE_SETTINGS,JSON.stringify(v3Settings));}catch(_){}}

function v3NowCode(){
  const d=new Date();
  const p=n=>String(n).padStart(2,'0');
  return 'UAM-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
}
function v3QuestionId(q){return q?String(q.q||'').trim():'';}

function v3Snapshot(reason='auto'){
  if(v3Restoring||!Array.isArray(questions)||!questions.length||!gameVisible())return;
  const snap={
    version:V3_CORE_VERSION,
    savedAt:new Date().toISOString(),
    reason,
    active:phase!=='over',
    teamNames:[...teamNames],
    scores:[...scores],
    bank:Number(bank)||0,
    strikes:Number(strikes)||0,
    phase,
    roundIndex:Number(roundIndex)||0,
    timerRemaining:Number(timerRemaining)||v2TimerSeconds||30,
    revealed:Array.isArray(revealed)?[...revealed]:[],
    currentTeam:Number(currentTeam)||0,
    questions:questions.map(q=>JSON.parse(JSON.stringify(q))),
    specialty:typeof specialtySelected==='string'?specialtySelected:'general',
    difficulty:typeof specialtyDifficulty==='string'?specialtyDifficulty:'mix',
    group:typeof offlineSettings!=='undefined'?(offlineSettings.group||''):'',
    research:v3Settings.research,
    researchCode:v3Settings.researchCode||'',
    activePack:v3Settings.activePack||'',
    rehearsal:!!v3Settings.rehearsal,
    startedAt:v3SessionStartedAt||Date.now()
  };
  try{localStorage.setItem(V3_SNAPSHOT_KEY,JSON.stringify(snap));}catch(_){}
}

function v3ClearSnapshot(){
  try{localStorage.removeItem(V3_SNAPSHOT_KEY);}catch(_){}
}

function v3GetSnapshot(){
  try{return JSON.parse(localStorage.getItem(V3_SNAPSHOT_KEY)||'null');}catch(_){return null;}
}

function v3RestoreSnapshot(s){
  if(!s||!Array.isArray(s.questions)||!s.questions.length)return false;
  v3Restoring=true;
  try{
    stopTimer();
    questions=s.questions;
    teamNames=Array.isArray(s.teamNames)&&s.teamNames.length===2?s.teamNames:['EQUIPO 1','EQUIPO 2'];
    scores=Array.isArray(s.scores)&&s.scores.length===2?s.scores:[0,0];
    bank=Number(s.bank)||0;
    strikes=Number(s.strikes)||0;
    phase=s.phase||'play';
    roundIndex=Math.max(0,Math.min(Number(s.roundIndex)||0,questions.length-1));
    timerRemaining=Number(s.timerRemaining)||30;
    revealed=Array.isArray(s.revealed)?s.revealed:Array(questions[roundIndex].a.length).fill(false);
    currentTeam=Number(s.currentTeam)||0;
    if(typeof specialtySelected!=='undefined')specialtySelected=s.specialty||specialtySelected;
    if(typeof specialtyDifficulty!=='undefined')specialtyDifficulty=s.difficulty||specialtyDifficulty;
    if(typeof offlineSettings!=='undefined'&&s.group)offlineSettings.group=s.group;
    v3Settings.research=!!s.research;v3Settings.researchCode=s.researchCode||'';
    v3Settings.activePack=s.activePack||'';v3Settings.rehearsal=!!s.rehearsal;
    v3SessionStartedAt=s.startedAt||Date.now();v3SessionSaved=false;
    $('#home').classList.add('hidden');$('#game').classList.remove('hidden');
    updateScoreUI();
    showRound(false);
    const box=$('#answers');
    if(box){
      revealed.forEach((on,i)=>{
        const btn=box.children[i];
        if(on&&btn){btn.classList.remove('covered');btn.classList.add('revealed');}
      });
    }
    updateBankUI();updateStrikesUI();updateTurnUI();
    stopTimer();
    if(phase!=='over'&&!v2Paused){
      timerRemaining=Math.max(1,Number(s.timerRemaining)||30);
      updateTimerUI();
      timerHandle=setInterval(()=>{
        timerRemaining-=1;updateTimerUI();v3Snapshot('timer');
        if(timerRemaining<=0){stopTimer();addStrike('timeout');}
      },1000);
    }
    v3SaveSettings();
    return true;
  }finally{v3Restoring=false;}
}

function v3OfferRecovery(){
  const s=v3GetSnapshot();
  if(!s||!s.active||!s.questions?.length)return;
  const age=Date.now()-new Date(s.savedAt||0).getTime();
  if(!Number.isFinite(age)||age>1000*60*60*24*14)return;
  setTimeout(()=>{
    openModal('<h2>↻ RECUPERAR PARTIDA</h2><p>Hay una partida guardada automáticamente de <b>'+new Date(s.savedAt).toLocaleString()+'</b>.</p><p>'+v2Escape((s.teamNames||[]).join(' vs '))+' · Ronda '+(Number(s.roundIndex)+1)+' · '+(s.scores||[0,0]).join('–')+'</p><div class="menuStack"><button id="v3Recover" class="setupStart">CONTINUAR PARTIDA</button><button id="v3Discard">DESCARTAR GUARDADO</button></div>');
    $('#v3Recover').onclick=()=>{closeModal(false);v3RestoreSnapshot(s);};
    $('#v3Discard').onclick=()=>{v3ClearSnapshot();closeModal(false);};
  },650);
}

function v3History(){
  try{return JSON.parse(localStorage.getItem(V3_HISTORY_KEY)||'[]');}catch(_){return [];}
}
function v3SaveHistory(entry){
  if(v3Settings.rehearsal)return;
  const list=v3History();list.unshift(entry);
  try{localStorage.setItem(V3_HISTORY_KEY,JSON.stringify(list.slice(0,250)));}catch(_){}
  v3UpdateChampionship(entry);
}

function v3SessionEntry(winnerOverride=null,sudden=false){
  const live=(typeof offlineSession!=='undefined'&&offlineSession&&Array.isArray(offlineSession.questions))?offlineSession.questions:[];
  const liveByQ=new Map(live.map(x=>[x.q||x.question,x]));
  return {
    id:v3Settings.researchCode||('S-'+Date.now()),
    date:new Date().toISOString(),
    startedAt:v3SessionStartedAt?new Date(v3SessionStartedAt).toISOString():'',
    group:typeof offlineSettings!=='undefined'?(offlineSettings.group||'Sin grupo'):'Sin grupo',
    specialty:typeof spSpecialtyName==='function'?spSpecialtyName():'General',
    specialtyId:typeof specialtySelected==='string'?specialtySelected:'general',
    difficulty:typeof specialtyDifficulty==='string'?specialtyDifficulty:'mix',
    teams:[...teamNames],
    scores:[...scores],
    winner:Number.isInteger(winnerOverride)?teamNames[winnerOverride]:(scores[0]===scores[1]?'EMPATE':teamNames[scores[1]>scores[0]?1:0]),
    wonBySuddenDeath:!!sudden,
    questions:(questions||[]).map((q,i)=>{
      const r=liveByQ.get(q.q)||{};
      return {
        q:q.q,
        specialty:q.specialty||q.cat||r.specialty||'',
        subtopic:q.subtopic||r.subtopic||'',
        difficulty:q.difficulty||(typeof spDifficultyOf==='function'?spDifficultyOf(q):r.difficulty||''),
        source:q.source||'',
        round:i+1,
        hits:Array.isArray(r.correct)?r.correct.length:0,
        strikes:Number(r.strikes)||0,
        topAnswer:!!r.top,
        individualTotal:Number(r.individualTotal)||0,
        individualCorrect:Number(r.individualCorrect)||0,
        timeSeconds:Number(r.timeSeconds)||Math.max(0,Math.round(((r.endedAt||Date.now())-(r.startedAt||Date.now()))/1000))
      };
    }),
    research:!!v3Settings.research,
    appVersion:V3_CORE_VERSION,
    bankVersion:typeof SPECIALTY_VERSION!=='undefined'?SPECIALTY_VERSION:'',
    config:{
      timer:typeof v2TimerSeconds!=='undefined'?v2TimerSeconds:30,
      adaptive:typeof offlineSettings!=='undefined'?!!offlineSettings.adaptive:false,
      examMode:typeof offlineSettings!=='undefined'?!!offlineSettings.examMode:false,
      presenter:typeof offlineSettings!=='undefined'?offlineSettings.presenterStyle:'',
      roundDifficulties:[...v3Settings.roundDifficulties],
      pack:v3Settings.activePack||''
    }
  };
}

function v3CompleteSession(winnerOverride=null,sudden=false){
  if(v3SessionSaved)return;
  if(v3Settings.rehearsal){v3SessionSaved=true;v3Settings.rehearsal=false;v3SaveSettings();v3ClearSnapshot();return;}
  v3SessionSaved=true;
  const e=v3SessionEntry(winnerOverride,sudden);v3SaveHistory(e);
  v3ClearSnapshot();
}

function v3CsvEscape(v){
  const s=String(v??'');
  return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
}
function v3HistoryRows(){
  const rows=[['session_id','date','group','specialty','team_1','score_1','team_2','score_2','winner','sudden_death','research','app_version','bank_version','question','subtopic','difficulty','round','hits','strikes','top_answer','individual_total','individual_correct','time_seconds','source']];
  v3History().forEach(s=>{
    (s.questions||[{}]).forEach(q=>rows.push([
      s.id,s.date,s.group,s.specialty,s.teams?.[0],s.scores?.[0],s.teams?.[1],s.scores?.[1],s.winner,s.wonBySuddenDeath?'1':'0',s.research?'1':'0',s.appVersion,s.bankVersion,q.q||'',q.subtopic||'',q.difficulty||'',q.round||'',q.hits||0,q.strikes||0,q.topAnswer?'1':'0',q.individualTotal||0,q.individualCorrect||0,q.timeSeconds||0,q.source||''
    ]));
  });
  return rows;
}
function v3ExportText(name,mime,content){
  try{if(window.Android&&Android.exportTextFile){Android.exportTextFile(name,mime,content);return;}}catch(_){}
  const blob=new Blob([content],{type:mime}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function v3ExportCsv(){
  const csv='\ufeff'+v3HistoryRows().map(r=>r.map(v3CsvEscape).join(',')).join('\r\n');
  v3ExportText('100_Dentistas_Resultados.csv','text/csv',csv);
}
function v3ExportExcel(){
  const rows=v3HistoryRows();
  const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const xml='<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'+
  '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Resultados"><Table>'+
  rows.map(r=>'<Row>'+r.map(v=>'<Cell><Data ss:Type="String">'+esc(v)+'</Data></Cell>').join('')+'</Row>').join('')+
  '</Table></Worksheet></Workbook>';
  v3ExportText('100_Dentistas_Resultados.xls','application/vnd.ms-excel',xml);
}
window.onExportFinished=ok=>{if(typeof v2Host==='function')v2Host(ok?'Archivo exportado correctamente.':'No se pudo exportar el archivo.',ok?'good':'bad');};

function v3ShowHistory(){
  const list=v3History();
  openModal('<h2>🗂 HISTORIAL DE PARTIDAS</h2><div class="v3HistoryList">'+
    (list.slice(0,40).map((s,i)=>'<button data-v3h="'+i+'"><b>'+v2Escape(s.group||'Sin grupo')+'</b><span>'+new Date(s.date).toLocaleString()+' · '+v2Escape(s.specialty||'')+' · '+v2Escape((s.teams||[]).join(' '+(s.scores||[]).join('-')+' '))+'</span></button>').join('')||'<p>No hay partidas guardadas.</p>')+
    '</div><div class="menuStack"><button id="v3Csv">⬇ CSV</button><button id="v3Xls">⬇ EXCEL</button></div>');
  document.querySelectorAll('[data-v3h]').forEach(b=>b.onclick=()=>{
    const s=list[Number(b.dataset.v3h)];
    openModal('<h2>📊 '+v2Escape(s.group||'Sesión')+'</h2><p>'+new Date(s.date).toLocaleString()+'</p><p><b>'+v2Escape((s.teams||[])[0]||'')+'</b> '+(s.scores?.[0]||0)+' – '+(s.scores?.[1]||0)+' <b>'+v2Escape((s.teams||[])[1]||'')+'</b></p><p>'+v2Escape(s.specialty||'')+' · '+(s.questions?.length||0)+' preguntas</p><p>Código: <b>'+v2Escape(s.id||'')+'</b></p><button id="v3HistBack" class="setupStart">VOLVER</button>');
    $('#v3HistBack').onclick=v3ShowHistory;
  });
  $('#v3Csv').onclick=v3ExportCsv;$('#v3Xls').onclick=v3ExportExcel;
}

window.onRemoteLatency=function(team,ms){
  const i=Number(team)-1;if(i<0||i>1)return;
  v3Latency[i]=Number(ms)||0;
  const el=$('#v3Latency'+team);if(el)el.textContent=v3Latency[i]+' ms';
};
function v3LatencyPanel(){
  openModal('<h2>⚡ PRUEBA DE LATENCIA</h2><p>Los dos pulsadores deben estar conectados. WebSocket mide el viaje real de mensajes dentro de la red local.</p><div class="latencyCards"><div><span>'+v2Escape(teamNames[0])+'</span><b id="v3Latency1">'+(v3Latency[0]??'—')+(v3Latency[0]!=null?' ms':'')+'</b></div><div><span>'+v2Escape(teamNames[1])+'</span><b id="v3Latency2">'+(v3Latency[1]??'—')+(v3Latency[1]!=null?' ms':'')+'</b></div></div><p>Como referencia práctica para el salón, cuanto más próximos sean ambos valores entre sí, más equitativa será la carrera.</p><button id="v3LatencyQr" class="setupStart">📡 VER QR DE PULSADORES</button>');
  $('#v3LatencyQr').onclick=offlineClassroomPanel;
}

function v3ResearchSettings(){
  openModal('<h2>🔬 MODO INVESTIGACIÓN</h2><label class="settingRow"><input id="v3ResearchOn" type="checkbox" '+(v3Settings.research?'checked':'')+'> Registrar sesiones de forma anónima</label><label class="settingRow">Código de sesión <input id="v3ResearchCode" value="'+v2Escape(v3Settings.researchCode||v3NowCode())+'"></label><p>No se solicitan nombres de estudiantes. Se conserva versión de app, banco, configuración, grupo/código y resultados del juego.</p><button id="v3ResearchSave" class="setupStart">GUARDAR</button>');
  $('#v3ResearchSave').onclick=()=>{v3Settings.research=$('#v3ResearchOn').checked;v3Settings.researchCode=$('#v3ResearchCode').value.trim()||v3NowCode();v3SaveSettings();closeModal(false);};
}

function v3StartRehearsal(){
  v3RehearsalLaunch=true;v3Settings.rehearsal=true;v3SaveSettings();v3SessionStartedAt=Date.now();v3SessionSaved=false;
  closeModal(false);startNewGame();
}

function v3Packs(){try{return JSON.parse(localStorage.getItem(V3_PACKS_KEY)||'[]');}catch(_){return [];}}
function v3SavePacks(x){localStorage.setItem(V3_PACKS_KEY,JSON.stringify(x));}
function v3PackPool(pack){
  if(!pack||typeof spBank!=='function')return [];
  let pool=spBank(pack.specialty||'general').filter(q=>!q.disabled);
  if(pack.difficulty&&pack.difficulty!=='mix'&&typeof spDifficultyOf==='function')pool=pool.filter(q=>spDifficultyOf(q)===pack.difficulty);
  if(Array.isArray(pack.subtopics)&&pack.subtopics.length)pool=pool.filter(q=>pack.subtopics.includes(String(q.subtopic||'Sin subtema')));
  return pool;
}
function v3ActivePack(){
  return v3Packs().find(p=>p.name===v3Settings.activePack)||null;
}
function v3RenderPackSubtopics(){
  const box=$('#v3PackTopics');if(!box)return;
  const spec=$('#v3PackSpec')?.value||'general',diff=$('#v3PackDiff')?.value||'mix';
  let pool=typeof spBank==='function'?spBank(spec).filter(q=>!q.disabled):[];
  if(diff!=='mix'&&typeof spDifficultyOf==='function')pool=pool.filter(q=>spDifficultyOf(q)===diff);
  const counts={};
  pool.forEach(q=>{const s=String(q.subtopic||'Sin subtema');counts[s]=(counts[s]||0)+1;});
  box.innerHTML=Object.entries(counts).sort((a,b)=>a[0].localeCompare(b[0])).map(([name,count])=>
    '<label class="topicCheck"><input type="checkbox" value="'+v2Escape(name)+'" checked> <span>'+v2Escape(name)+'</span><b>'+count+'</b></label>'
  ).join('')||'<p>Sin subtemas disponibles con este filtro.</p>';
  const total=$('#v3PackAvailable');if(total)total.textContent=pool.length+' preguntas disponibles antes de filtrar subtemas';
}
function v3PackManager(){
  const packs=v3Packs();
  openModal('<h2>📦 PAQUETES DE CLASE</h2><div class="v3HistoryList">'+
    (packs.map((p,i)=>'<button data-pack="'+i+'"><b>'+v2Escape(p.name)+'</b><span>'+v2Escape(p.specialty)+' · '+v2Escape(p.difficulty)+' · '+((p.subtopics||[]).length?((p.subtopics||[]).length+' subtemas'):'todos los subtemas')+'</span></button>').join('')||'<p>No hay paquetes creados.</p>')+
    '</div><button id="v3NewPack" class="setupStart">＋ CREAR PAQUETE</button>');
  document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>{
    const p=packs[Number(b.dataset.pack)];
    const available=v3PackPool(p);
    if(available.length<GAME_SIZE){alert('Este paquete solo tiene '+available.length+' preguntas disponibles. Se necesitan al menos '+GAME_SIZE+'.');return;}
    v3Settings.activePack=p.name;v3SaveSettings();
    if(typeof specialtySelected!=='undefined')specialtySelected=p.specialty;
    if(typeof specialtyDifficulty!=='undefined')specialtyDifficulty=p.difficulty;
    closeModal(false);
    const onHome=$('#home')&&!$('#home').classList.contains('hidden');
    if(onHome&&typeof showCharacterSetup==='function')showCharacterSetup();
    else startNewGame();
  });
  $('#v3NewPack').onclick=()=>{
    const specs=(typeof SPECIALTY_DEFS!=='undefined'?SPECIALTY_DEFS:[]).filter(d=>d.id!=='general');
    openModal('<h2>＋ NUEVO PAQUETE</h2><label class="settingRow">Nombre <input id="v3PackName" placeholder="Repaso Parcial 1"></label><label class="settingRow">Especialidad <select id="v3PackSpec">'+specs.map(d=>'<option value="'+d.id+'">'+d.name+'</option>').join('')+'</select></label><label class="settingRow">Dificultad <select id="v3PackDiff"><option value="mix">Mezcla</option><option value="basic">Básica</option><option value="intermediate">Media</option><option value="advanced">Extra difícil</option></select></label><p id="v3PackAvailable" class="specialtyLead"></p><div id="v3PackTopics" class="topicGrid"></div><button id="v3PackSave" class="setupStart">GUARDAR PAQUETE</button>');
    $('#v3PackSpec').onchange=v3RenderPackSubtopics;$('#v3PackDiff').onchange=v3RenderPackSubtopics;v3RenderPackSubtopics();
    $('#v3PackSave').onclick=()=>{
      const selected=[...document.querySelectorAll('#v3PackTopics input:checked')].map(x=>x.value);
      const p={name:$('#v3PackName').value.trim()||'PAQUETE '+(v3Packs().length+1),specialty:$('#v3PackSpec').value,difficulty:$('#v3PackDiff').value,subtopics:selected};
      const count=v3PackPool(p).length;
      if(count<GAME_SIZE){alert('Con esos subtemas solo hay '+count+' preguntas. Selecciona más temas o cambia dificultad.');return;}
      const a=v3Packs();a.push(p);v3SavePacks(a);v3PackManager();
    };
  };
}

function v3DifficultySchedule(){
  const labels={basic:'Básica',intermediate:'Media',advanced:'Extra difícil',mix:'Mixta'};
  openModal('<h2>🎚 DIFICULTAD POR RONDA</h2><p>Define qué nivel debe buscar cada una de las 8 rondas.</p><div class="difficultySchedule">'+
    Array.from({length:8},(_,i)=>'<label>R'+(i+1)+'<select data-v3diff="'+i+'"><option value="basic">Básica</option><option value="intermediate">Media</option><option value="advanced">Extra difícil</option><option value="mix">Mixta</option></select></label>').join('')+
    '</div><button id="v3DiffSave" class="setupStart">GUARDAR</button>');
  document.querySelectorAll('[data-v3diff]').forEach(s=>s.value=v3Settings.roundDifficulties[Number(s.dataset.v3diff)]||'mix');
  $('#v3DiffSave').onclick=()=>{v3Settings.roundDifficulties=[...document.querySelectorAll('[data-v3diff]')].map(s=>s.value);v3SaveSettings();closeModal(false);};
}
function v3ApplyDifficultySchedule(){
  if(!Array.isArray(questions)||questions.length<2||typeof spBank!=='function'||typeof spDifficultyOf!=='function')return;
  const pack=v3ActivePack();
  const pool=(pack?v3PackPool(pack):spBank(typeof specialtySelected==='string'?specialtySelected:'general').filter(q=>!q.disabled));
  if(pack&&pool.length<questions.length){
    if(typeof v2Host==='function')v2Host('El paquete activo no tiene suficientes preguntas; se conserva la selección original.','bad');
    return;
  }
  const used=new Set();
  questions=questions.map((existing,i)=>{
    const target=v3Settings.roundDifficulties[i]||'mix';
    let candidates=pool.filter(q=>!used.has(v3QuestionId(q))&&(target==='mix'||spDifficultyOf(q)===target));
    if(!candidates.length)candidates=pool.filter(q=>!used.has(v3QuestionId(q)));
    const q=candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:existing;
    used.add(v3QuestionId(q));return q;
  });
}

function v3UpdateChampionship(entry){
  if(!entry||entry.winner==='EMPATE')return;
  let board={};try{board=JSON.parse(localStorage.getItem(V3_CHAMP_KEY)||'{}');}catch(_){}
  (entry.teams||[]).forEach((name,i)=>{
    const k=String(name||'EQUIPO').trim().toUpperCase();
    if(!board[k])board[k]={team:k,played:0,wins:0,points:0};
    board[k].played++;board[k].points+=Number(entry.scores?.[i]||0);
    if(k===String(entry.winner).trim().toUpperCase())board[k].wins++;
  });
  localStorage.setItem(V3_CHAMP_KEY,JSON.stringify(board));
}
function v3Championship(){
  let board={};try{board=JSON.parse(localStorage.getItem(V3_CHAMP_KEY)||'{}');}catch(_){}
  const rows=Object.values(board).sort((a,b)=>b.wins-a.wins||b.points-a.points);
  openModal('<h2>🏆 GRAN CAMPEONATO</h2><div class="champTable"><div><b>#</b><b>Equipo</b><b>J</b><b>G</b><b>Puntos</b></div>'+rows.map((r,i)=>'<div><b>'+(i+1)+'</b><span>'+v2Escape(r.team)+'</span><span>'+r.played+'</span><span>'+r.wins+'</span><span>'+r.points+'</span></div>').join('')+'</div><button id="v3ChampReset" class="secondaryWide">REINICIAR CAMPEONATO</button>');
  $('#v3ChampReset').onclick=()=>{if(confirm('¿Borrar la clasificación acumulada?')){localStorage.removeItem(V3_CHAMP_KEY);v3Championship();}};
}

function v3RoundName(round,totalRounds){
  if(totalRounds===1)return 'FINAL';
  if(round===totalRounds)return 'FINAL';
  if(round===totalRounds-1)return 'SEMIFINAL';
  if(round===totalRounds-2)return 'CUARTOS';
  return 'RONDA '+round;
}
function v3Bracket(){
  if(typeof otTournament==='undefined'||!otTournament){if(typeof otTournamentSetup==='function')return otTournamentSetup();return;}
  const history=Array.isArray(otTournament.history)?otTournament.history:[];
  const current=otTournament.matches||[];
  const allRounds=[...history];
  if(otTournament.active&&current.length)allRounds.push({round:otTournament.round,matches:current,winners:[]});
  const totalRounds=Math.max(1,...allRounds.map(r=>r.round||1));
  openModal('<h2>🏆 BRACKET DEL TORNEO</h2><div class="bracketTree">'+
    allRounds.map((r,ri)=>'<section class="bracketRound"><h3>'+v3RoundName(r.round,totalRounds)+'</h3>'+
      (r.matches||[]).map((m,i)=>{
        const winner=(r.winners||[])[i]||'';
        const active=otTournament.active&&r.round===otTournament.round&&i===otTournament.current;
        return '<div class="bracketMatch '+(active?'active':'')+'"><span class="'+(winner===m[0]?'winner':'')+'">'+v2Escape(m[0])+'</span><b>VS</b><span class="'+(winner===m[1]?'winner':'')+'">'+v2Escape(m[1])+'</span></div>';
      }).join('')+'</section>').join('')+
    (otTournament.champion?'<div class="bracketChampion">🏆 '+v2Escape(otTournament.champion)+'</div>':'')+
    '</div>');
}

if(typeof spShowSpecialties==='function'){
  const v3BaseSpecialtyPicker=spShowSpecialties;
  spShowSpecialties=function(){
    v3Settings.activePack='';v3SaveSettings();
    return v3BaseSpecialtyPicker();
  };
}

window.v3AfterGameStarted=function(){
  if(!Array.isArray(questions)||!questions.length)return;
  v3ApplyDifficultySchedule();
  if(v3Settings.rehearsal&&questions.length>3)questions=questions.slice(0,3);
  showRound(true);v3Snapshot('start');
  if(v3Settings.rehearsal&&typeof v2Host==='function')v2Host('Modo ensayo: 3 preguntas. No se guardará en estadísticas.','good');
};
const v3BaseStart=startNewGame;
startNewGame=function(){
  v3Settings.rehearsal=!!v3RehearsalLaunch;v3RehearsalLaunch=false;v3SaveSettings();
  v3SessionStartedAt=Date.now();v3SessionSaved=false;
  if(v3Settings.research&&!v3Settings.researchCode)v3Settings.researchCode=v3NowCode();
  return v3BaseStart();
};

const v3BaseShow=showRound;
showRound=function(reset=true){v3BaseShow(reset);setTimeout(()=>v3Snapshot('round'),40);};

for(const name of ['revealAnswer','addStrike','awardBank','previousRound','resetRound']){
  const base=window[name];
  if(typeof base==='function')window[name]=function(...args){const r=base.apply(this,args);setTimeout(()=>v3Snapshot(name),40);return r;};
}
const v3BaseNext=nextRound;
nextRound=function(){const r=v3BaseNext();setTimeout(()=>v3Snapshot('nextRound'),60);return r;};

if(typeof v2DeclareWinner==='function'){
  const v3BaseWinner=v2DeclareWinner;
  v2DeclareWinner=function(winner,sudden=false){v3CompleteSession(winner,sudden);return v3BaseWinner(winner,sudden);};
}
const v3BaseFinish=finishGame;
finishGame=function(){
  const r=v3BaseFinish();
  if(phase==='sudden'||phase==='faceoff')setTimeout(()=>v3Snapshot('suddenDeath'),60);
  return r;
};

document.addEventListener('visibilitychange',()=>{if(document.hidden)v3Snapshot('background');});
window.addEventListener('pagehide',()=>v3Snapshot('pagehide'));
setInterval(()=>v3Snapshot('interval'),2500);

function v3CoreMenu(){
  openModal('<h2>🧭 CLASSROOM RESEARCH</h2><div class="menuStack"><button id="v3AcademicMenu">🎓 HERRAMIENTAS ACADÉMICAS</button><button id="v3ShowMenuBtn">🎭 SHOW Y AUDIO</button><button id="v3RecoverMenu">↻ RECUPERAR ÚLTIMA PARTIDA</button><button id="v3Rehearsal">🧪 MODO ENSAYO · 3 PREGUNTAS</button><button id="v3Latency">⚡ PRUEBA DE LATENCIA</button><button id="v3History">🗂 HISTORIAL / EXPORTAR</button><button id="v3Research">🔬 MODO INVESTIGACIÓN</button><button id="v3Packs">📦 PAQUETES DE CLASE</button><button id="v3Diff">🎚 DIFICULTAD POR RONDA</button><button id="v3Bracket">🏆 BRACKET DEL TORNEO</button><button id="v3Champ">🥇 GRAN CAMPEONATO</button></div>');
  $('#v3AcademicMenu').onclick=()=>typeof v3AcademicMenu==='function'&&v3AcademicMenu();
  $('#v3ShowMenuBtn').onclick=()=>typeof v3ShowMenu==='function'&&v3ShowMenu();
  $('#v3RecoverMenu').onclick=()=>{const s=v3GetSnapshot();if(s){closeModal(false);v3RestoreSnapshot(s);}else alert('No hay una partida recuperable.');};
  $('#v3Rehearsal').onclick=v3StartRehearsal;$('#v3Latency').onclick=v3LatencyPanel;$('#v3History').onclick=v3ShowHistory;$('#v3Research').onclick=v3ResearchSettings;$('#v3Packs').onclick=v3PackManager;$('#v3Diff').onclick=v3DifficultySchedule;$('#v3Bracket').onclick=v3Bracket;$('#v3Champ').onclick=v3Championship;
}

(function(){
  const home=$('.homeActions');
  if(home&&!$('#v3ResearchBtn')){const b=document.createElement('button');b.id='v3ResearchBtn';b.textContent='🔬 CLASSROOM RESEARCH';b.onclick=v3CoreMenu;home.appendChild(b);}
  v3OfferRecovery();
})();
