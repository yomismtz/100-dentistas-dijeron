'use strict';

const OFFLINE_REMOTE_VERSION='2.7-offline-remote';

function orEsc(s){return typeof v2Escape==='function'?v2Escape(s):String(s||'');}
function orQuestion(){return Array.isArray(questions)?questions[roundIndex]:null;}
function orBase(){
  try{return window.Android&&Android.getClassroomBaseUrl?String(Android.getClassroomBaseUrl()||''):'';}catch(_){return '';}
}
function orExplanation(q){
  if(q&&q.explanation)return q.explanation;
  if(q&&q.source)return 'Las respuestas del tablero resumen los elementos clínicos asociados a esta pregunta. Consulta la fuente vinculada para revisar el fundamento completo.';
  return 'Explicación específica pendiente de revisión editorial.';
}
function orEditorial(q){
  if(q&&q.editorialStatus)return q.editorialStatus;
  return q&&q.source?'✅ Revisada':'🟡 Pendiente';
}
function orSync(){
  try{
    if(!(window.Android&&Android.updateRemoteState))return;
    const q=orQuestion();
    const payload={
      question:q&&q.q||'',
      case:q&&q.case||'',
      image:q&&q.image||'',
      source:q&&q.source||'',
      explanation:orExplanation(q),
      editorial:orEditorial(q),
      reviewedAt:q&&q.reviewedAt||'2026-09',
      teams:[...teamNames],
      scores:[...scores],
      bank:bank,
      strikes:strikes,
      phase:phase,
      round:roundIndex+1,
      totalRounds:questions&&questions.length||GAME_SIZE,
      timer:timerRemaining,
      specialty:typeof spSpecialtyName==='function'?spSpecialtyName():'General',
      difficulty:q&&q.difficulty||'mix',
      answers:(q&&q.a||[]).map(function(a,i){return {label:a[0],points:a[1],revealed:!!(revealed&&revealed[i])};})
    };
    Android.updateRemoteState(JSON.stringify(payload));
  }catch(_){}
}
setInterval(orSync,700);

function orAcceptBuzz(team){
  if(!careoState||careoState.first!==null)return;
  careoState.first=team;
  careoState.second=1-team;
  try{if(window.Android&&Android.closeRemoteBuzz)Android.closeRemoteBuzz();}catch(_){}
  const a=$('#careoBuzz1'),b=$('#careoBuzz2');
  [a,b].forEach(function(x){if(x)x.disabled=true;});
  const winner=team===0?a:b;
  if(winner)winner.classList.add('buzzWinner');
  if(typeof tvSfx==='function')tvSfx('buzzerHit');
  if(typeof tvVibrate==='function')tvVibrate(45);
  if(typeof offlinePresenterCue==='function')offlinePresenterCue('control',{team:teamNames[team]});
  setTimeout(function(){careoAsk(team,false);},360);
}
window.onRemoteBuzz=function(team){orAcceptBuzz(Number(team)-1);};

careoShowBuzzers=function(){
  const q=orQuestion();if(!q)return;
  careoState={first:null,second:null,attempts:0,answerIdx:null};
  try{if(window.Android&&Android.armRemoteBuzz)Android.armRemoteBuzz();}catch(_){}
  openModal('<div class="careoBuzzScreen">'+
    '<div class="careoKicker">⚡ ¿QUIÉN CONTESTA PRIMERO?</div>'+
    '<h2>'+orEsc(q.q)+'</h2>'+
    '<p>Puede pulsarse aquí o desde los celulares conectados al modo aula.</p>'+
    '<div class="careoBuzzers">'+
      '<button id="careoBuzz1" class="careoBuzzer teamA"><span>'+careoTeamLabel(0)+'</span><b>¡PRESIONAR!</b></button>'+
      '<button id="careoBuzz2" class="careoBuzzer teamB"><span>'+careoTeamLabel(1)+'</span><b>¡PRESIONAR!</b></button>'+
    '</div></div>');
  const close=$('#closeModal');if(close)close.classList.add('careoNoClose');
  function local(team){
    let accepted=true;
    try{if(window.Android&&Android.tryLocalBuzz)accepted=!!Android.tryLocalBuzz(team+1);}catch(_){}
    if(accepted)orAcceptBuzz(team);
  }
  $('#careoBuzz1').addEventListener('pointerdown',function(){local(0);},{once:true});
  $('#careoBuzz2').addEventListener('pointerdown',function(){local(1);},{once:true});
  orSync();
};

function orQrMatrix(text){
  const bytes=new TextEncoder().encode(text);
  if(bytes.length>32)throw new Error('URL larga');
  function mul(x,y){let r=0;while(y){if(y&1)r^=x;y>>=1;x<<=1;if(x&0x100)x^=0x11d;}return r;}
  let gen=[1],alpha=1;
  for(let i=0;i<10;i++){const n=Array(gen.length+1).fill(0);gen.forEach(function(a,j){n[j]^=a;n[j+1]^=mul(a,alpha);});gen=n;alpha=mul(alpha,2);}
  const bits=[];
  function put(v,n){for(let i=n-1;i>=0;i--)bits.push((v>>i)&1);}
  put(4,4);put(bytes.length,8);bytes.forEach(function(b){put(b,8);});
  const max=272;for(let i=0;i<Math.min(4,max-bits.length);i++)bits.push(0);while(bits.length%8)bits.push(0);
  const data=[];for(let i=0;i<bits.length;i+=8){let v=0;for(let j=0;j<8;j++)v=(v<<1)|(bits[i+j]||0);data.push(v);}
  let pad=0;while(data.length<34)data.push(pad++%2===0?0xec:0x11);
  const work=data.concat(Array(10).fill(0));
  for(let i=0;i<data.length;i++){const coef=work[i];if(coef)gen.forEach(function(g,j){work[i+j]^=mul(g,coef);});}
  const code=data.concat(work.slice(-10)),size=25,m=Array.from({length:size},function(){return Array(size).fill(null);});
  function finder(row,col){
    for(let r=-1;r<=7;r++){const rr=row+r;if(rr<0||rr>=size)continue;
      for(let c=-1;c<=7;c++){const cc=col+c;if(cc<0||cc>=size)continue;
        m[rr][cc]=(r>=0&&r<=6&&(c===0||c===6))||(c>=0&&c<=6&&(r===0||r===6))||(r>=2&&r<=4&&c>=2&&c<=4);
      }
    }
  }
  finder(0,0);finder(size-7,0);finder(0,size-7);
  for(let r=-2;r<=2;r++)for(let c=-2;c<=2;c++)m[18+r][18+c]=(r===-2||r===2||c===-2||c===2||(r===0&&c===0));
  for(let r=8;r<size-8;r++)if(m[r][6]===null)m[r][6]=r%2===0;
  for(let c=8;c<size-8;c++)if(m[6][c]===null)m[6][c]=c%2===0;
  const format=0x77c4;
  for(let i=0;i<15;i++){const mod=((format>>i)&1)===1;if(i<6)m[i][8]=mod;else if(i<8)m[i+1][8]=mod;else m[size-15+i][8]=mod;}
  for(let i=0;i<15;i++){const mod=((format>>i)&1)===1;if(i<8)m[8][size-i-1]=mod;else if(i<9)m[8][15-i]=mod;else m[8][15-i-1]=mod;}
  m[size-8][8]=true;
  let inc=-1,row=size-1,bit=7,bi=0;
  for(let col=size-1;col>0;col-=2){
    if(col<=6)col--;
    while(true){
      [col,col-1].forEach(function(cc){
        if(m[row][cc]!==null)return;
        let dark=bi<code.length?((code[bi]>>bit)&1)===1:false;
        if((row+cc)%2===0)dark=!dark;
        m[row][cc]=dark;bit--;if(bit<0){bi++;bit=7;}
      });
      row+=inc;if(row<0||row>=size){row-=inc;inc=-inc;break;}
    }
  }
  return m;
}
function orDrawQr(canvas,url){
  try{
    const m=orQrMatrix(url),ctx=canvas.getContext('2d'),quiet=4,scale=7,side=(m.length+quiet*2)*scale;
    canvas.width=canvas.height=side;ctx.fillStyle='#fff';ctx.fillRect(0,0,side,side);ctx.fillStyle='#000';
    m.forEach(function(row,r){row.forEach(function(v,c){if(v)ctx.fillRect((c+quiet)*scale,(r+quiet)*scale,scale,scale);});});
  }catch(e){canvas.style.display='none';}
}
function orQrCard(label,url,id){
  return '<div class="qrCard"><h3>'+label+'</h3><canvas id="'+id+'"></canvas><input readonly value="'+orEsc(url)+'"></div>';
}
function offlineTeacherAccessPanel(){
  const base=orBase();
  if(!base){openModal('<h2>🎓 CONTROL DOCENTE</h2><p>Servidor local no disponible todavía.</p>');return;}
  const url=base+'/t';
  let pin='';
  try{if(window.Android&&Android.getTeacherPin)pin=String(Android.getTeacherPin()||'');}catch(_){}
  openModal('<h2>🎓 ACCESO DOCENTE PRIVADO</h2>'+
    '<p>No proyectes esta pantalla a los estudiantes.</p>'+
    '<div class="teacherPinBox"><span>PIN DOCENTE</span><b>'+orEsc(pin||'—')+'</b></div>'+
    '<div class="qrGrid singleQr">'+orQrCard('CONTROL DOCENTE',url,'qrt')+'</div>');
  const q=$('#qrt');if(q)orDrawQr(q,url);
}
function offlineClassroomPanel(){
  const base=orBase();
  if(!base){openModal('<h2>📡 AULA OFFLINE</h2><p>El servidor local todavía no está disponible. Espera un momento o activa Wi‑Fi/hotspot y vuelve a abrir esta pantalla.</p>');return;}
  const u1=base+'/1',u2=base+'/2',ue=base+'/e',ur=base+'/r';
  const warning=base.indexOf('127.0.0.1')>=0?'<p class="warningBox">⚠️ Activa Wi‑Fi o hotspot para obtener una dirección local que los otros celulares puedan abrir.</p>':'';
  openModal('<h2>📡 AULA OFFLINE · QR</h2>'+
    '<p>Todos los equipos deben estar en la misma red Wi‑Fi o hotspot. No se requiere Internet.</p>'+warning+
    '<div class="qrGrid">'+
      orQrCard('🔴 PULSADOR EQUIPO 1',u1,'qr1')+
      orQrCard('🔴 PULSADOR EQUIPO 2',u2,'qr2')+
      orQrCard('📝 EXAMEN INDIVIDUAL',ue,'qre')+
      orQrCard('📚 REFERENCIA ACTUAL',ur,'qrr')+
    '</div><button id="showTeacherAccess" class="secondaryWide">🔐 MOSTRAR ACCESO DOCENTE PRIVADO</button>');
  [['qr1',u1],['qr2',u2],['qre',ue],['qrr',ur]].forEach(function(x){const c=$('#'+x[0]);if(c)orDrawQr(c,x[1]);});
  $('#showTeacherAccess').onclick=offlineTeacherAccessPanel;
}

window.onRemoteTeacherCommand=function(command,arg){
  function click(ids){for(const id of ids){const el=$('#'+id);if(el){el.click();return true;}}return false;}
  if(command==='pause'){if(typeof offlineTogglePause==='function')offlineTogglePause();else{v2Paused=!v2Paused;if(v2Paused)stopTimer();else if(gameVisible()&&phase!=='over')startTimer();updateTimerUI();}}
  else if(command==='read'&&typeof narratorReadQuestion==='function')narratorReadQuestion(function(){});
  else if(command==='strike')addStrike('remote');
  else if(command==='revealNext'){const i=revealed.findIndex(function(x){return !x;});if(i>=0)revealAnswer(i,$('#answers')&&$('#answers').children[i]);}
  else if(command==='reveal'){const i=Number(arg);if(Number.isInteger(i)&&i>=0&&i<revealed.length&&!revealed[i])revealAnswer(i,$('#answers')&&$('#answers').children[i]);}
  else if(command==='accept')click(['careoAccept','acceptNear']);
  else if(command==='reject')click(['careoReject','rejectNear']);
  else if(command==='award')awardBank(Number(arg));
  else if(command==='prev')previousRound();
  else if(command==='next')nextRound();
  else if(command==='projector'&&typeof offlineToggleProjector==='function')offlineToggleProjector();
  else if(command==='finish')finishGame();
  orSync();
};

let offlineExamCollecting=false;
let offlineExamStats={total:0,correct:0};
window.onRemoteExamAnswer=function(answer){
  if(!offlineExamCollecting)return;
  offlineExamStats.total++;
  const m=v2Match(String(answer||''),orQuestion());
  if(m&&m.score>=.84)offlineExamStats.correct++;
  const el=$('#examCount');if(el)el.textContent=String(offlineExamStats.total);
  if(typeof offlineRecordIndividual==='function')offlineRecordIndividual(String(answer||''),!!(m&&m.score>=.84));
};
function offlineExamCollect(proceed){
  offlineExamCollecting=true;offlineExamStats={total:0,correct:0};
  openModal('<h2>📝 EXAMEN-JUEGO</h2><p>Los alumnos conectados al QR de respuesta individual pueden responder ahora.</p>'+
    '<div class="examCount"><b id="examCount">0</b><span> respuestas recibidas</span></div>'+
    '<button id="examClose" class="setupStart">CERRAR RESPUESTAS · IR AL CAREO ⚡</button>');
  const close=$('#closeModal');if(close)close.classList.add('careoNoClose');
  $('#examClose').onclick=function(){offlineExamCollecting=false;proceed();};
}
