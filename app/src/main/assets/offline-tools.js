'use strict';

const OFFLINE_TOOLS_VERSION='2.7-offline-tools';
const OT_OVERRIDES='dentistas-question-overrides-v2';
const OT_TOURNAMENT='dentistas-tournament-v2';
let otTournament=null;
let otFinal=null;
try{otTournament=JSON.parse(localStorage.getItem(OT_TOURNAMENT)||'null');}catch(_){}

function otQ(){return Array.isArray(questions)?questions[roundIndex]:null;}
function otAliasesText(q){
  const a=q&&q.aliases||{};return Object.entries(a).map(function(x){return x[0]+' = '+(Array.isArray(x[1])?x[1].join(', '):x[1]);}).join('\n');
}
function otParseAliases(text){
  const out={};String(text||'').split('\n').map(function(x){return x.trim();}).filter(Boolean).forEach(function(line){
    const p=line.split('=');if(p.length<2)return;out[p[0].trim()]=p.slice(1).join('=').split(',').map(function(x){return x.trim();}).filter(Boolean);
  });return out;
}
function otEditorial(q){return q&&q.editorialStatus?q.editorialStatus:(q&&q.source?'✅ Revisada':'🟡 Pendiente');}
function otExplain(q){return q&&q.explanation?q.explanation:(q&&q.source?'Las respuestas del tablero resumen los elementos clínicos aceptados para el tema. Consulta la fuente asociada para el fundamento completo.':'Explicación específica pendiente de revisión editorial.');}

function otApplyOverrides(){
  if(!questionPool||!questionPool.length)return;
  let all={};try{all=JSON.parse(localStorage.getItem(OT_OVERRIDES)||'{}');}catch(_){}
  questionPool.forEach(function(q){
    const key=q._overrideKey||q.q;
    q._overrideKey=key;
    if(all[key])Object.assign(q,all[key]);
  });
}
const otWait=setInterval(function(){if(questionPool&&questionPool.length){otApplyOverrides();clearInterval(otWait);}},400);

if(typeof spBank==='function'){
  const otBaseBank=spBank;
  spBank=function(id){return otBaseBank(id).filter(function(q){return !q.disabled;});};
}

function otEditQuestion(){
  const q=otQ();if(!q)return;
  openModal('<h2>✏️ EDITOR DE PREGUNTA</h2>'+
    '<input id="otq" class="wideInput" value="'+v2Escape(q.q)+'">'+
    '<label class="settingRow">Dificultad <select id="otd"><option value="basic">Básica</option><option value="intermediate">Media</option><option value="advanced">Extra difícil</option></select></label>'+
    '<input id="ots" class="wideInput" placeholder="Fuente" value="'+v2Escape(q.source||'')+'">'+
    '<div class="editorMetaGrid"><input id="otr" class="wideInput" placeholder="Revisor/a" value="'+v2Escape(q.reviewer||'')+'"><input id="otv" class="wideInput" placeholder="Versión del reactivo, ej. 1.0" value="'+v2Escape(q.questionVersion||'1.0')+'"></div>'+
    '<textarea id="otw" class="wideArea" placeholder="Explicación breve">'+v2Escape(q.explanation||'')+'</textarea>'+
    '<textarea id="ota" class="wideArea compactArea" placeholder="Respuesta = sinónimo 1, sinónimo 2">'+v2Escape(otAliasesText(q))+'</textarea>'+
    '<label class="settingRow">Estado <select id="ote"><option>✅ Revisada</option><option>🟡 Pendiente</option><option>🔄 Actualizar</option></select></label>'+
    '<label class="settingRow"><input id="otx" type="checkbox" '+(q.disabled?'checked':'')+'> Desactivar pregunta</label>'+
    '<div class="menuStack"><button id="otSave">💾 GUARDAR LOCALMENTE</button><button id="otClone">⧉ DUPLICAR COMO PERSONAL</button></div>');
  $('#otd').value=q.difficulty||(typeof spDifficultyOf==='function'?spDifficultyOf(q):'intermediate');$('#ote').value=otEditorial(q);
  $('#otSave').onclick=function(){
    const original=q._overrideKey||q.q;q._overrideKey=original;
    const patch={q:$('#otq').value.trim()||q.q,difficulty:$('#otd').value,source:$('#ots').value.trim(),reviewer:$('#otr').value.trim(),questionVersion:$('#otv').value.trim()||'1.0',explanation:$('#otw').value.trim(),aliases:otParseAliases($('#ota').value),editorialStatus:$('#ote').value,reviewedAt:new Date().toISOString().slice(0,10),disabled:$('#otx').checked};
    let all={};try{all=JSON.parse(localStorage.getItem(OT_OVERRIDES)||'{}');}catch(_){}
    all[original]=patch;localStorage.setItem(OT_OVERRIDES,JSON.stringify(all));Object.assign(q,patch);closeModal(false);if(typeof orSync==='function')orSync();
  };
  $('#otClone').onclick=function(){
    let list=[];try{list=JSON.parse(localStorage.getItem('dentistas-custom-questions')||'[]');}catch(_){}
    list.push({...q,q:q.q+' · COPIA'});localStorage.setItem('dentistas-custom-questions',JSON.stringify(list));alert('Copia guardada como pregunta personal.');
  };
}

const otBaseTeacher=v2TeacherMode;
v2TeacherMode=function(){
  otBaseTeacher();
  const grid=document.querySelector('.teacherGrid');if(!grid)return;
  const locked=phase!=='over';
  const reveal=$('#tReveal');
  if(reveal){
    reveal.disabled=locked;
    reveal.textContent=locked?'🔒 RESPUESTAS AL CERRAR RONDA':'👁 REVELAR TODAS';
  }
  const info=$('#tInfo');
  if(info)info.textContent=locked?'🔒 CONSULTAR AL CERRAR RONDA':'📚 EXPLICACIÓN/FUENTE';
  const e=document.createElement('button');e.textContent='✏️ EDITAR PREGUNTA';e.onclick=otEditQuestion;grid.appendChild(e);
  const r=document.createElement('button');r.textContent='📡 AULA OFFLINE / QR';r.onclick=offlineClassroomPanel;grid.appendChild(r);
};

const otBaseMatch=v2Match;
v2Match=function(text,q){
  q=q||otQ();let best=otBaseMatch(text,q);if(!q)return best;
  const input=v2Norm(text),custom=q.aliases||{};
  const isCurrent=(Array.isArray(questions)&&q===questions[roundIndex]);
  q.a.forEach(function(ans,idx){
    if(isCurrent&&revealed&&revealed[idx]&&phase!=='faceoff'&&phase!=='sudden')return;
    const extras=custom[ans[0]]||[];
    extras.forEach(function(raw){
      const a=v2Norm(raw);let score=0;
      if(input===a)score=1;else score=Math.max(v2ContainmentScore(input,a),.58*v2Lev(input,a)+.42*v2Jaccard(input,a));
      if(v2OppositeConflict(input,a))score=Math.min(score,.45);
      if(!best||score>best.score)best={idx:idx,score:score,label:ans[0],points:Number(ans[1])||0};
    });
  });
  return best;
};

function otReferenceQr(){
  if(phase!=='over'){
    openModal('<h2>🔒 RESPUESTAS BLOQUEADAS</h2><p>La referencia y las respuestas completas se habilitan únicamente cuando la ronda ya terminó.</p>');
    return;
  }
  const base=typeof orBase==='function'?orBase():'';
  const url=base?base+'/r':'';
  try{if(window.Android&&Android.setReferenceUnlocked)Android.setReferenceUnlocked(true);}catch(_){}
  openModal('<h2>📚 QR DE REFERENCIA ACTUAL</h2><p>Este QR abre una página local con la pregunta, explicación y referencia. Se volverá a bloquear automáticamente al cambiar de pregunta.</p><div class="qrCard"><canvas id="otRefQr"></canvas><input readonly value="'+v2Escape(url)+'"></div>');
  if($('#otRefQr')&&typeof orDrawQr==='function')orDrawQr($('#otRefQr'),url);
}
v2QuestionInfo=function(){
  const q=otQ();if(!q)return;
  if(phase!=='over'){
    openModal('<h2>🔒 RESPUESTAS BLOQUEADAS</h2><p>Para evitar pistas durante el juego, las respuestas correctas, explicación y referencia se pueden consultar únicamente después de que termine la ronda.</p>');
    return;
  }
  openModal('<h2>📚 ¿POR QUÉ? · REFERENCIA</h2>'+
    '<p><b>'+v2Escape(q.q)+'</b></p>'+
    '<div class="whyBox">'+v2Escape(otExplain(q))+'</div>'+
    '<p><b>Respuestas aceptadas:</b> '+q.a.map(function(a){return v2Escape(a[0]);}).join(', ')+'</p>'+
    '<p><b>Nivel:</b> '+(typeof omDiff==='function'?omDiff(q):(q.difficulty||'Mixta'))+' · <b>Estado:</b> '+v2Escape(otEditorial(q))+'</p>'+
    '<p><b>Banco:</b> v1.2 · <b>Reactivo:</b> v'+v2Escape(q.questionVersion||'—')+' · <b>Última revisión:</b> '+v2Escape(q.reviewedAt||'Pendiente')+'</p>'+
    '<p><b>Revisor/a:</b> '+v2Escape(q.reviewer||'Pendiente de asignar')+'</p>'+
    '<p><b>Fuente:</b> '+v2Escape(q.source||'Fuente específica pendiente.')+'</p>'+
    '<div class="menuStack"><button id="otRef">📱 QR LOCAL DE REFERENCIA</button>'+(q.source?'<button id="otOpen">🌐 ABRIR FUENTE</button>':'')+'</div>');
  $('#otRef').onclick=otReferenceQr;if($('#otOpen'))$('#otOpen').onclick=function(){v2OpenUrl(q.source);};
};

// Torneo 4/8/16
function otSaveTournament(){if(otTournament)localStorage.setItem(OT_TOURNAMENT,JSON.stringify(otTournament));else localStorage.removeItem(OT_TOURNAMENT);}
function otTournamentSetup(){
  openModal('<h2>🏆 TORNEO</h2><label class="settingRow">Equipos <select id="otn"><option>4</option><option>8</option><option>16</option></select></label><textarea id="otNames" class="wideArea" placeholder="Un equipo por línea"></textarea><button id="otStart" class="setupStart">CREAR TORNEO</button>');
  $('#otStart').onclick=function(){
    const n=Number($('#otn').value),names=$('#otNames').value.split('\n').map(function(x){return x.trim().toUpperCase();}).filter(Boolean);
    if(names.length!==n){alert('Escribe exactamente '+n+' equipos.');return;}
    otTournament={active:true,round:1,current:0,winners:[],matches:[],champion:null,lastKey:'',history:[]};
    for(let i=0;i<n;i+=2)otTournament.matches.push([names[i],names[i+1]]);
    otSaveTournament();otTournamentPlay();
  };
}
function otTournamentPlay(){
  if(!otTournament||!otTournament.active)return;
  const m=otTournament.matches[otTournament.current];if(!m)return;
  teamNames=[m[0],m[1]];saveState();closeModal(false);spShowSpecialties();
}
function otTournamentRecord(name){
  if(!otTournament||!otTournament.active)return;
  if(!Array.isArray(otTournament.history))otTournament.history=[];
  const key=otTournament.round+'-'+otTournament.current;if(otTournament.lastKey===key)return;otTournament.lastKey=key;
  otTournament.winners.push(name);
  if(otTournament.current<otTournament.matches.length-1){
    otTournament.current++;
  }else{
    otTournament.history.push({
      round:otTournament.round,
      matches:otTournament.matches.map(m=>[...m]),
      winners:[...otTournament.winners]
    });
    if(otTournament.winners.length===1){
      otTournament.champion=otTournament.winners[0];otTournament.active=false;
    }else{
      const w=[...otTournament.winners];otTournament.round++;otTournament.current=0;otTournament.winners=[];otTournament.matches=[];otTournament.lastKey='';
      for(let i=0;i<w.length;i+=2)otTournament.matches.push([w[i],w[i+1]]);
    }
  }
  otSaveTournament();
}
function otTournamentView(){
  if(!otTournament){openModal('<h2>🏆 TORNEO</h2><p>No hay torneo creado.</p><button id="otCreate" class="setupStart">CREAR</button>');$('#otCreate').onclick=otTournamentSetup;return;}
  openModal('<h2>🏆 TORNEO · RONDA '+otTournament.round+'</h2>'+
    (otTournament.champion?'<h3>CAMPEÓN: '+v2Escape(otTournament.champion)+' 🏆</h3>':otTournament.matches.map(function(m,i){return '<p class="'+(i===otTournament.current?'currentMatch':'')+'">'+v2Escape(m[0])+' <b>VS</b> '+v2Escape(m[1])+'</p>';}).join(''))+
    '<div class="menuStack">'+(otTournament.active?'<button id="otContinue">JUGAR PARTIDO ACTUAL</button>':'')+'<button id="otReset">CERRAR TORNEO</button></div>');
  if($('#otContinue'))$('#otContinue').onclick=otTournamentPlay;$('#otReset').onclick=function(){otTournament=null;otSaveTournament();closeModal(false);};
}

// Reto final 200
function otFinalSetup(winner){
  const p1=prompt('Nombre del jugador 1 del equipo ganador:','JUGADOR 1')||'JUGADOR 1';
  const p2=prompt('Nombre del jugador 2:','JUGADOR 2')||'JUGADOR 2';
  let pool=typeof spBank==='function'?spBank(typeof specialtySelected==='string'?specialtySelected:'general'):[...questionPool];
  const used=new Set(questions.map(function(q){return q.q;}));pool=shuffle(pool.filter(function(q){return !used.has(q.q)&&!q.disabled;})).slice(0,10);
  if(pool.length<10){alert('No hay suficientes preguntas frescas para el reto final.');return;}
  otFinal={winner:winner,names:[p1,p2],pool:pool,index:0,player:0,score:0,playerScores:[0,0],remaining:25,handle:null};otFinalPlayer();
}
function otFinalPlayer(){
  const s=otFinal;if(!s)return;clearInterval(s.handle);s.remaining=25;
  openModal('<h2>🏆 RETO FINAL 200</h2><p><b>'+v2Escape(s.names[s.player])+'</b> · 5 preguntas · <span id="otFT">25</span>s</p><div id="otFBody"></div>');
  otFinalQuestion();
  s.handle=setInterval(function(){s.remaining--;if($('#otFT'))$('#otFT').textContent=s.remaining;if(s.remaining<=3&&s.remaining>0&&typeof omSpeakNumber==='function')omSpeakNumber(s.remaining);if(s.remaining<=0)otFinalNextPlayer();},1000);
}
function otFinalQuestion(){
  const s=otFinal;if(!s)return;const local=s.index-s.player*5;if(local>=5){otFinalNextPlayer();return;}
  const q=s.pool[s.index];
  $('#otFBody').innerHTML='<p><b>'+v2Escape(q.q)+'</b></p><input id="otFI" class="wideInput" placeholder="Una respuesta"><button id="otFC" class="setupStart">RESPONDER</button><p>Puntos: <b>'+s.playerScores[s.player]+'</b></p>';
  $('#otFC').onclick=function(){const m=v2Match($('#otFI').value,q);if(m&&m.score>=.84){s.playerScores[s.player]+=m.points;tvSfx('correct');}else tvSfx('buzz');s.index++;otFinalQuestion();};
}
function otFinalNextPlayer(){
  const s=otFinal;if(!s)return;clearInterval(s.handle);
  if(s.player===0){s.player=1;s.index=5;otFinalPlayer();return;}
  const total=s.playerScores[0]+s.playerScores[1],won=total>=200;otFinal=null;
  openModal('<h2>'+(won?'🏆 ¡RETO SUPERADO!':'🎯 RETO TERMINADO')+'</h2><p>Total: <b>'+total+' / 200</b></p><p>'+v2Escape(s.names[0])+': '+s.playerScores[0]+' · '+v2Escape(s.names[1])+': '+s.playerScores[1]+'</p>');
  if(won){tvFanfare();tvConfetti(90);}
}

const otWinnerBase=v2DeclareWinner;
v2DeclareWinner=function(winner,sudden){
  if(otTournament&&otTournament.active)otTournamentRecord(teamNames[winner]);
  otWinnerBase(winner,sudden);
  setTimeout(function(){
    const stack=document.querySelector('#modalContent .menuStack');if(!stack)return;
    if(!$('#otFinalBtn')){const f=document.createElement('button');f.id='otFinalBtn';f.textContent='🏆 RETO FINAL 200';f.onclick=function(){otFinalSetup(winner);};stack.prepend(f);}
    if(otTournament){const t=document.createElement('button');t.textContent=otTournament.active?'🏆 SIGUIENTE PARTIDO':'🏆 VER CAMPEÓN';t.onclick=otTournament.active?otTournamentPlay:otTournamentView;stack.prepend(t);}
  },2300);
};

function offlineToolsMenu(){
  openModal('<h2>🧰 HERRAMIENTAS DOCENTES</h2><div class="menuStack"><button id="otEditM">✏️ EDITAR PREGUNTA ACTUAL</button><button id="otTourM">🏆 CREAR TORNEO</button><button id="otTourV">🗂 VER TORNEO</button><button id="otQrM">📡 AULA OFFLINE / QR</button></div>');
  $('#otEditM').onclick=otEditQuestion;$('#otTourM').onclick=otTournamentSetup;$('#otTourV').onclick=otTournamentView;$('#otQrM').onclick=offlineClassroomPanel;
}

const otBaseModes=typeof omModes==='function'?omModes:null;
if(otBaseModes){
  omModes=function(){
    otBaseModes();
    const stack=document.querySelector('#modalContent .menuStack');
    if(stack&&!$('#otToolsMenu')){const b=document.createElement('button');b.id='otToolsMenu';b.textContent='🧰 HERRAMIENTAS DOCENTES';b.onclick=offlineToolsMenu;stack.appendChild(b);}
  };
}
