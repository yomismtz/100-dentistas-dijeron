'use strict';

const OFFLINE_MODES_VERSION='2.7-classroom-modes';
const OM_SETTINGS='dentistas-offline-settings-v2';
const OM_REPORTS='dentistas-group-reports-v2';
let offlineSettings={group:'',presenterStyle:'show',adaptive:false,projector:false,examMode:false,ambient:true};
let offlineSession=null;
let offlineAudioChecked=false;
let offlineLastSpokenSecond=null;
let offlineLightning=null;
let offlineAmbientHandle=null;
let omCareoRemaining=30;
let omCareoTeam=0;
let omCareoSecond=false;

try{offlineSettings={...offlineSettings,...JSON.parse(localStorage.getItem(OM_SETTINGS)||'{}')};}catch(_){}

function omSave(){
  try{localStorage.setItem(OM_SETTINGS,JSON.stringify(offlineSettings));}catch(_){}
  document.documentElement.classList.toggle('projectorMode',!!offlineSettings.projector);
}
omSave();

function offlineToggleProjector(){
  offlineSettings.projector=!offlineSettings.projector;omSave();
}
function omQ(){return Array.isArray(questions)?questions[roundIndex]:null;}
function omDiff(q){
  const d=q&&q.difficulty||(typeof spDifficultyOf==='function'?spDifficultyOf(q):'');
  return d==='basic'?'Básica':d==='intermediate'?'Media':d==='advanced'?'Extra difícil':'Mixta';
}
function omEditorial(q){return q&&q.editorialStatus?q.editorialStatus:(q&&q.source?'✅ Revisada':'🟡 Pendiente');}
function omExplain(q){
  if(q&&q.explanation)return q.explanation;
  return q&&q.source?'Las respuestas del tablero condensan los elementos clínicos asociados al tema. La fuente enlazada permite revisar el fundamento completo.':'Explicación específica pendiente de revisión editorial.';
}
function omMedia(q){
  let h='';
  if(q&&q.case)h+='<div class="clinicalCase"><b>CASO CLÍNICO</b><p>'+v2Escape(q.case)+'</p></div>';
  if(q&&q.image)h+='<img class="clinicalQuestionImage" src="'+v2Escape(q.image)+'" alt="Imagen clínica de apoyo">';
  return h;
}

function omBegin(){
  offlineSession={
    date:new Date().toISOString(),
    group:offlineSettings.group||'Sin grupo',
    specialty:typeof spSpecialtyName==='function'?spSpecialtyName():'General',
    difficulty:typeof specialtyDifficulty!=='undefined'?specialtyDifficulty:'mix',
    teams:[...teamNames],
    scores:[0,0],
    questions:[],
    achievements:[]
  };
}
function omRec(){
  const q=omQ();if(!q)return null;if(!offlineSession)omBegin();
  let r=offlineSession.questions.find(function(x){return x.q===q.q;});
  if(!r){r={q:q.q,specialty:q.specialty||q.cat||(typeof spSpecialtyName==='function'?spSpecialtyName():'General'),subtopic:q.subtopic||'Sin subtema',difficulty:omDiff(q),correct:[],strikes:0,top:false,individualTotal:0,individualCorrect:0};offlineSession.questions.push(r);}
  return r;
}
function offlineRecordIndividual(answer,correct){
  const r=omRec();if(!r)return;r.individualTotal++;if(correct)r.individualCorrect++;
}
function omFinish(){
  if(!offlineSession||offlineSession.saved)return;
  offlineSession.finished=new Date().toISOString();offlineSession.scores=[...scores];
  const qs=offlineSession.questions;
  const hits=qs.filter(function(q){return q.correct.length>0;}).length;
  const strikes=qs.reduce(function(s,q){return s+q.strikes;},0);
  offlineSession.summary={played:qs.length,hits:hits,strikes:strikes,percent:qs.length?Math.round(hits/qs.length*100):0,individualTotal:qs.reduce(function(s,q){return s+q.individualTotal;},0),individualCorrect:qs.reduce(function(s,q){return s+q.individualCorrect;},0)};
  const a=[];if(strikes===0&&qs.length)a.push('🛡️ SIN ERRORES');if(qs.some(function(q){return q.top;}))a.push('⭐ RESPUESTA #1');if(hits>=5)a.push('🔥 RACHA CLÍNICA');offlineSession.achievements=a;
  offlineSession.saved=true;
  try{let list=JSON.parse(localStorage.getItem(OM_REPORTS)||'[]');list.unshift(offlineSession);localStorage.setItem(OM_REPORTS,JSON.stringify(list.slice(0,120)));}catch(_){}
}
function omShowReport(s){
  s=s||offlineSession;if(!s){openModal('<h2>📊 SIN REPORTE</h2>');return;}
  const sum=s.summary||{played:0,hits:0,strikes:0,percent:0};
  const hard=[...(s.questions||[])].sort(function(a,b){return b.strikes-a.strikes;}).slice(0,4);
  openModal('<h2>📊 REPORTE ACADÉMICO</h2>'+
    '<p><b>Grupo:</b> '+v2Escape(s.group||'Sin grupo')+' · <b>'+v2Escape(s.specialty||'')+'</b></p>'+
    '<div class="academicCards"><div><b>'+sum.played+'</b><span>preguntas</span></div><div><b>'+sum.hits+'</b><span>con acierto</span></div><div><b>'+sum.strikes+'</b><span>errores</span></div><div><b>'+sum.percent+'%</b><span>desempeño</span></div></div>'+
    (sum.individualTotal?'<p><b>Individual:</b> '+sum.individualCorrect+'/'+sum.individualTotal+' coincidieron con respuestas del tablero.</p>':'')+
    '<h3>Preguntas que más costaron</h3><div class="reportHard">'+hard.map(function(q){return '<div><b>'+q.strikes+' X</b><span>'+v2Escape(q.q)+'</span></div>';}).join('')+'</div>'+
    '<h3>Logros</h3><p>'+(s.achievements||[]).join(' · ')+'</p>');
}
function omReports(){
  let list=[];try{list=JSON.parse(localStorage.getItem(OM_REPORTS)||'[]');}catch(_){}
  const groups=[...new Set(list.map(function(x){return x.group||'Sin grupo';}))];
  openModal('<h2>📚 REPORTES POR GRUPO</h2><div class="menuStack">'+groups.map(function(g,i){return '<button data-rg="'+i+'">'+v2Escape(g)+' · '+list.filter(function(x){return (x.group||'Sin grupo')===g;}).length+' sesiones</button>';}).join('')+'</div>');
  document.querySelectorAll('[data-rg]').forEach(function(b){
    b.onclick=function(){
      const g=groups[Number(b.dataset.rg)],ss=list.filter(function(x){return (x.group||'Sin grupo')===g;});
      const played=ss.reduce(function(t,x){return t+(x.summary&&x.summary.played||0);},0),hits=ss.reduce(function(t,x){return t+(x.summary&&x.summary.hits||0);},0),strikes=ss.reduce(function(t,x){return t+(x.summary&&x.summary.strikes||0);},0);
      openModal('<h2>📊 '+v2Escape(g)+'</h2><p>'+ss.length+' sesiones · '+played+' preguntas · '+(played?Math.round(hits/played*100):0)+'% con acierto · '+strikes+' errores.</p><button id="rgBack" class="setupStart">VOLVER</button>');
      $('#rgBack').onclick=omReports;
    };
  });
}

const OM_PHRASES={
 formal:{control:' obtiene el control.',correct:'Respuesta correcta.',top:'Respuesta número uno.',x1:'Primer error.',x2:'Segundo error.',steal:'Oportunidad de robo.',double:'Ronda de puntos dobles.',triple:'Ronda de puntos triples.',final:'Última ronda.',review:'Estas eran las respuestas que faltaron.',winner:'Los ganadores son '},
 show:{control:' tiene el control.',correct:'¡Respuesta correcta!',top:'¡Respuesta número uno!',x1:'¡Primera equis!',x2:'¡Segunda equis!',steal:'¡Oportunidad de robo!',double:'¡Puntos dobles!',triple:'¡Puntos triples!',final:'¡Última ronda!',review:'¡Estas eran las respuestas que faltaron!',winner:'¡Los ganadores son '},
 fun:{control:' manda en el tablero.',correct:'¡Sí señor, está en el tablero!',top:'¡Bingo dental! ¡Respuesta número uno!',x1:'¡Uy! Primera equis.',x2:'¡Cuidado! Segunda equis.',steal:'¡Se abre la puerta del robo!',double:'¡Se duplican los puntos!',triple:'¡Puntos triples, esto se pone serio!',final:'¡Última ronda, a brillar!',review:'¡Veamos cuáles respuestas se nos escaparon!',winner:'¡Confeti para '}
};
function offlinePresenterCue(event,vars){
  if(!narratorEnabled)return;
  vars=vars||{};const p=OM_PHRASES[offlineSettings.presenterStyle]||OM_PHRASES.show;let text=p[event]||'';
  if(event==='control')text=(vars.team||teamNames[currentTeam])+text;
  if(event==='winner')text=text+(vars.team||'')+'!';
  try{if(window.Android&&Android.speakCue){Android.speakCue(text);return;}}catch(_){}
  try{const u=new SpeechSynthesisUtterance(text);u.lang='es-MX';u.rate=.98;speechSynthesis.speak(u);}catch(_){}
}
function omSpeakNumber(n){
  const w={3:'tres',2:'dos',1:'uno'};if(!w[n]||!narratorEnabled)return;
  try{if(window.Android&&Android.speakCue){Android.speakCue(w[n]);return;}}catch(_){}
}
const omBaseStart=startTimer;
startTimer=function(){offlineLastSpokenSecond=null;omBaseStart();};
const omBaseTimer=updateTimerUI;
updateTimerUI=function(){omBaseTimer();if(timerRemaining>=1&&timerRemaining<=3&&phase!=='over'&&offlineLastSpokenSecond!==timerRemaining){offlineLastSpokenSecond=timerRemaining;omSpeakNumber(timerRemaining);}};

function omDuck(on){const a=$('#sndStart');if(a&&!a.paused)try{a.volume=on?.08:.68;}catch(_){}}
if(typeof narratorRead==='function'){
  const bRead=narratorRead,bStop=narratorStop;
  narratorRead=function(t,done){bRead(t,function(){omDuck(false);if(done)done();});omDuck(true);};
  narratorStop=function(){bStop();omDuck(false);};
}

function omAmbient(){
  if(!offlineSettings.ambient||!tvSettings.music||narratorReading||!gameVisible()||phase==='over')return;
  const ns=phase==='steal'?[196,247]:phase==='faceoff'?[220,277]:[262,330];
  ns.forEach(function(f,i){tvTone(f,i*.16,.36,.006,'sine');});
}
offlineAmbientHandle=setInterval(omAmbient,2800);

const omReveal=revealAnswer;
revealAnswer=function(idx,btn){
  const was=revealed&&revealed[idx],team=currentTeam;omReveal(idx,btn);if(was||!(revealed&&revealed[idx]))return;
  const r=omRec();if(r){if(r.correct.indexOf(idx)<0)r.correct.push(idx);if(idx===0)r.top=true;}
  if(idx===0){tvShowCue('⭐ ¡RESPUESTA NÚMERO UNO! ⭐',teamNames[team],'winner',1050);tvConfetti(50);offlinePresenterCue('top',{team:teamNames[team]});}
  else offlinePresenterCue('correct',{team:teamNames[team]});
  if(typeof orSync==='function')orSync();
};
const omStrike=addStrike;
addStrike=function(reason){
  const before=strikes,old=phase,bankBefore=bank;
  omStrike(reason||'manual');
  const changed=(old==='steal'&&phase==='over')||(strikes>before)||(bankBefore!==bank&&old==='steal');
  if(changed){
    const r=omRec();if(r)r.strikes++;
    if(old!=='steal'){
      if(before===0)offlinePresenterCue('x1');
      else if(before===1)offlinePresenterCue('x2');
      else if(before===2)offlinePresenterCue('steal');
    }
  }
  if(typeof orSync==='function')orSync();
};

const omShow=showRound;
showRound=function(reset){
  omShow(reset===undefined?true:reset);if(reset!==false)omRec();
  const q=omQ(),row=document.querySelector('.questionRow'),board=document.querySelector('.board');
  if(board){board.querySelectorAll('.clinicalCase,.clinicalQuestionImage').forEach(function(x){x.remove();});if(q&&q.case&&row){const d=document.createElement('div');d.className='clinicalCase';d.innerHTML='<b>CASO CLÍNICO</b><p>'+v2Escape(q.case)+'</p>';row.after(d);}if(q&&q.image&&row){const im=document.createElement('img');im.className='clinicalQuestionImage';im.src=q.image;im.alt='Imagen clínica';(board.querySelector('.clinicalCase')||row).after(im);}}
  if(roundIndex===GAME_SIZE-1)offlinePresenterCue('final');else if(roundMultiplier()===2)offlinePresenterCue('double');else if(roundMultiplier()===3)offlinePresenterCue('triple');
  if(typeof orSync==='function')orSync();
};

function omAdaptNext(){
  if(!offlineSettings.adaptive||typeof spBank!=='function'||typeof spDifficultyOf!=='function'||roundIndex>=questions.length-1)return;
  if(typeof specialtyDifficulty!=='undefined'&&specialtyDifficulty!=='mix')return;
  const r=omRec();if(!r)return;let target='intermediate';if(r.correct.length&&r.strikes===0)target='advanced';else if(!r.correct.length||r.strikes>=2)target='basic';
  const pool=spBank(typeof specialtySelected==='string'?specialtySelected:'general').filter(function(q){return spDifficultyOf(q)===target&&!q.disabled&&!questions.some(function(x){return x.q===q.q;});});
  if(pool.length)questions[roundIndex+1]=pool[Math.floor(Math.random()*pool.length)];
}
const omNext=nextRound;
nextRound=function(){omAdaptNext();omNext();if(typeof orSync==='function')orSync();};

const omCareoFailBase=careoFail;
careoFail=function(team,isSecond,reason){
  const r=omRec();if(r)r.strikes++;
  omCareoFailBase(team,isSecond,reason);
  if(typeof orSync==='function')orSync();
};

function omRunCareoClock(reset){
  careoStopClock();
  if(reset)omCareoRemaining=v2TimerSeconds;
  const el=$('#careoSeconds');if(el)el.textContent=String(omCareoRemaining);
  if(v2Paused)return;
  careoTimerHandle=setInterval(function(){
    omCareoRemaining--;
    const node=$('#careoSeconds');
    if(node){node.textContent=String(Math.max(0,omCareoRemaining));node.classList.toggle('urgent',omCareoRemaining<=3);}
    if(omCareoRemaining<=3&&omCareoRemaining>0){tvSfx('tick');omSpeakNumber(omCareoRemaining);}
    if(omCareoRemaining<=0){careoStopClock();careoFail(omCareoTeam,omCareoSecond,'TIEMPO AGOTADO');}
  },1000);
}
const omCareoClock=careoStartAnswerClock;
careoStartAnswerClock=function(team,isSecond){
  omCareoTeam=team;omCareoSecond=isSecond;omRunCareoClock(true);
};
function offlineTogglePause(){
  v2Paused=!v2Paused;
  if($('#careoSeconds')&&careoState&&careoState.attempts){
    if(v2Paused)careoStopClock();else omRunCareoClock(false);
  }else{
    if(v2Paused)stopTimer();else if(gameVisible()&&phase!=='over')startTimer();
    updateTimerUI();
  }
  return v2Paused;
}

const omBaseCareoQuestion=careoQuestionScreen;
careoQuestionScreen=function(){
  const q=omQ();if(!q)return;
  const sudden=!!(careoState&&careoState.sudden);
  stopTimer();careoStopClock();careoLockBoard(true);phase='faceoff';
  tvShowCue(sudden?'⚡ MUERTE SÚBITA':'RONDA '+(roundIndex+1),'🎤 ESCUCHA LA PREGUNTA',sudden?'sudden':'round',950);
  openModal('<div class="careoQuestionScreen"><div class="careoKicker">'+(sudden?'⚡ MUERTE SÚBITA':'🎤 CAREO · RONDA '+(roundIndex+1))+'</div>'+omMedia(q)+'<h2>'+v2Escape(q.q)+'</h2><div class="careoListenState">🔊 El presentador está leyendo…</div><p>El tiempo todavía no corre.</p><button id="skipRead" class="secondaryWide">⏭ OMITIR LECTURA</button></div>');
  const close=$('#closeModal');if(close)close.classList.add('careoNoClose');let done=false;
  function go(){if(done)return;done=true;if(typeof narratorStop==='function')narratorStop();tvSfx('ready');setTimeout(function(){if(offlineSettings.examMode&&typeof offlineExamCollect==='function')offlineExamCollect(careoShowBuzzers);else careoShowBuzzers();},320);}
  $('#skipRead').onclick=go;if(typeof narratorReadQuestion==='function')narratorReadQuestion(go);else setTimeout(go,500);
};

function omMaybeTopReportButton(){
  const stack=document.querySelector('#modalContent .menuStack');if(!stack||$('#omReport'))return;
  const b=document.createElement('button');b.id='omReport';b.textContent='📊 REPORTE ACADÉMICO';b.onclick=function(){omShowReport(offlineSession);};stack.prepend(b);
}
const omWinner=v2DeclareWinner;
v2DeclareWinner=function(winner,sudden){
  omFinish();offlinePresenterCue('winner',{team:teamNames[winner]});omWinner(winner,sudden);setTimeout(omMaybeTopReportButton,2100);
};

function omLightning(){
  openModal('<h2>⚡ RONDA RELÁMPAGO</h2><div class="menuStack"><button id="l60">60 SEGUNDOS</button><button id="l90">90 SEGUNDOS</button></div>');
  $('#l60').onclick=function(){omLaunchLightning(60);};$('#l90').onclick=function(){omLaunchLightning(90);};
}
function omLaunchLightning(sec){
  let pool=typeof spBank==='function'?spBank(typeof specialtySelected==='string'?specialtySelected:'general'):[...questionPool];pool=shuffle(pool.filter(function(q){return !q.disabled;})).slice(0,40);
  offlineLightning={pool:pool,index:0,score:0,remaining:sec,handle:null};omShowLightning();
  offlineLightning.handle=setInterval(function(){if(!offlineLightning)return;offlineLightning.remaining--;const t=$('#lt');if(t)t.textContent=offlineLightning.remaining;if(offlineLightning.remaining<=3&&offlineLightning.remaining>0)omSpeakNumber(offlineLightning.remaining);if(offlineLightning.remaining<=0)omEndLightning();},1000);
}
function omShowLightning(){
  const s=offlineLightning;if(!s)return;const q=s.pool[s.index%s.pool.length];
  openModal('<h2>⚡ RELÁMPAGO · <span id="lt">'+s.remaining+'</span>s</h2><p><b>'+v2Escape(q.q)+'</b></p><div class="faceInput"><input id="li" placeholder="Una respuesta"><button id="lm">🎙️</button></div><button id="lc" class="setupStart">COMPROBAR</button><p>Aciertos: <b>'+s.score+'</b></p>');
  $('#lm').onclick=function(){v2Speak('lightning');};$('#lc').onclick=function(){const m=v2Match($('#li').value,q);if(m&&m.score>=.84){s.score++;tvSfx('correct');}else tvSfx('buzz');s.index++;omShowLightning();};
}
function omEndLightning(){const s=offlineLightning;if(!s)return;clearInterval(s.handle);const sc=s.score;offlineLightning=null;openModal('<h2>⚡ FIN</h2><p><b>'+sc+'</b> respuestas correctas.</p>');}
const omSpeech=window.onSpeechResult;
window.onSpeechResult=function(t){if(v2VoiceTarget==='lightning'&&$('#li')){$('#li').value=String(t||'');return;}omSpeech(t);};

function omRoulette(){
  const defs=SPECIALTY_DEFS.filter(function(d){return d.id!=='general'&&spBank(d.id).length>=8;});let n=0;
  openModal('<h2>🎡 ESPECIALIDAD SORPRESA</h2><div id="rn" class="rouletteName">...</div>');
  const id=setInterval(function(){const d=defs[n%defs.length];$('#rn').textContent=d.icon+' '+d.name;n++;if(n>18){clearInterval(id);const c=defs[Math.floor(Math.random()*defs.length)];specialtySelected=c.id;$('#rn').textContent='🎯 '+c.name;tvFanfare();setTimeout(spShowSpecialties,900);}},90);
}
function omTeacherVs(){teamNames=['DOCENTE','SALÓN'];saveState();closeModal(false);spShowSpecialties();}

function omSettings(){
  openModal('<h2>⚙️ VOZ, AULA Y SHOW</h2>'+
    '<label class="settingRow">Grupo <input id="sg" value="'+v2Escape(offlineSettings.group||'')+'" placeholder="Ej. 3.º A"></label>'+
    '<label class="settingRow">Presentador <select id="spres"><option value="formal">Formal</option><option value="show">Concurso</option><option value="fun">Divertido</option></select></label>'+
    '<label class="settingRow">Tiempo <select id="st"><option>10</option><option>15</option><option>20</option><option>30</option></select></label>'+
    '<label class="settingRow"><input id="sn" type="checkbox" '+(narratorEnabled?'checked':'')+'> 🎙 Leer preguntas</label>'+
    '<label class="settingRow"><input id="sa" type="checkbox" '+(offlineSettings.adaptive?'checked':'')+'> 🧠 Adaptativo</label>'+
    '<label class="settingRow"><input id="se" type="checkbox" '+(offlineSettings.examMode?'checked':'')+'> 📝 Examen-juego</label>'+
    '<label class="settingRow"><input id="spj" type="checkbox" '+(offlineSettings.projector?'checked':'')+'> 📺 Proyector</label>'+
    '<label class="settingRow"><input id="samb" type="checkbox" '+(offlineSettings.ambient?'checked':'')+'> 🎵 Ambiente discreto</label>'+
    '<label class="settingRow"><input id="ss" type="checkbox" '+(v2Sound?'checked':'')+'> 🔊 Sonidos</label>'+
    '<label class="settingRow"><input id="sm" type="checkbox" '+(tvSettings.music?'checked':'')+'> 🎶 Música</label>'+
    '<label class="settingRow"><input id="sfx" type="checkbox" '+(tvSettings.effects?'checked':'')+'> 🔔 Efectos</label>'+
    '<label class="settingRow"><input id="sap" type="checkbox" '+(tvSettings.applause?'checked':'')+'> 👏 Aplausos</label>'+
    '<div class="menuStack"><button id="ptest">🎙️ PROBAR PRESENTADOR</button><button id="saveOm" class="setupStart">GUARDAR</button></div>');
  $('#spres').value=offlineSettings.presenterStyle;$('#st').value=String(v2TimerSeconds);$('#ptest').onclick=function(){offlinePresenterCue('correct');};
  $('#saveOm').onclick=function(){offlineSettings.group=$('#sg').value.trim();offlineSettings.presenterStyle=$('#spres').value;offlineSettings.adaptive=$('#sa').checked;offlineSettings.examMode=$('#se').checked;offlineSettings.projector=$('#spj').checked;offlineSettings.ambient=$('#samb').checked;narratorEnabled=$('#sn').checked;v2TimerSeconds=Number($('#st').value);v2Sound=$('#ss').checked;tvSettings.music=$('#sm').checked;tvSettings.effects=$('#sfx').checked;tvSettings.applause=$('#sap').checked;narratorSaveSettings();v2SaveSettings();tvSaveSettings();omSave();closeModal(false);};
}
v2Settings=omSettings;

const omStart=startNewGame;
startNewGame=function(){
  if(!offlineAudioChecked){
    openModal('<h2>🔊 PRUEBA DE AUDIO</h2><p>Comprueba que el salón escucha la voz y los efectos.</p><div class="menuStack"><button id="at">▶ PROBAR</button><button id="ao">✅ SE ESCUCHA · COMENZAR</button><button id="as">⚙️ AJUSTES</button></div>');
    $('#at').onclick=function(){tvFanfare();narratorRead('Bienvenidos a 100 Dentistas Dijeron. Si puedes escucharme, el audio está listo.',function(){});};$('#ao').onclick=function(){offlineAudioChecked=true;closeModal(false);omBegin();omStart();};$('#as').onclick=omSettings;return;
  }
  omBegin();omStart();
};

function omModes(){
  openModal('<h2>🎮 MODOS Y AULA</h2><div class="menuStack">'+
    '<button id="mr">📡 PULSADORES + CONTROL DOCENTE + QR</button>'+
    '<button id="ml">⚡ RONDA RELÁMPAGO</button>'+
    '<button id="mru">🎡 ESPECIALIDAD SORPRESA</button>'+
    '<button id="mt">🎓 DOCENTE VS SALÓN</button>'+
    '<button id="mrep">📊 REPORTES POR GRUPO</button>'+
    '<button id="ms">⚙️ VOZ, AULA Y SHOW</button></div>');
  $('#mr').onclick=offlineClassroomPanel;$('#ml').onclick=omLightning;$('#mru').onclick=omRoulette;$('#mt').onclick=omTeacherVs;$('#mrep').onclick=omReports;$('#ms').onclick=omSettings;
}

(function(){
  const home=$('.homeActions');if(home&&!$('#offlineModesBtn')){const b=document.createElement('button');b.id='offlineModesBtn';b.textContent='🎮 MODOS Y AULA';b.onclick=omModes;home.appendChild(b);}
  document.documentElement.classList.toggle('projectorMode',!!offlineSettings.projector);
})();
