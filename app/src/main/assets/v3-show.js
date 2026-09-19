'use strict';

const V3_SHOW_VERSION='3.0.2-show';
const V3_AUDIO_KEY='dentistas-v3-audio-layers';
let v3Audio={music:.85,effects:1,applause:.9,narrator:1};
try{v3Audio={...v3Audio,...JSON.parse(localStorage.getItem(V3_AUDIO_KEY)||'{}')};}catch(_){}
let v3AudioLayer='effects';
let v3LastPhrase={};

function v3AudioSave(){
  localStorage.setItem(V3_AUDIO_KEY,JSON.stringify(v3Audio));
  try{if(window.Android&&Android.setNarratorVolume)Android.setNarratorVolume(Number(v3Audio.narrator)||1);}catch(_){}
  const s=$('#sndStart');if(s&&!s.paused&&!narratorReading)s.volume=.72*v3Audio.music;
}
v3AudioSave();

if(typeof tvTone==='function'){
  const v3Tone=tvTone;
  tvTone=function(freq,start,dur,gain=.045,type='sine'){
    const scale=v3AudioLayer==='music'?v3Audio.music:v3AudioLayer==='applause'?v3Audio.applause:v3Audio.effects;
    return v3Tone(freq,start,dur,gain*Math.max(0,Math.min(1,scale)),type);
  };
}
if(typeof tvNoiseHit==='function'){
  const v3Noise=tvNoiseHit;
  tvNoiseHit=function(start=0,dur=.07,gain=.045,center=1600){
    const scale=v3AudioLayer==='applause'?v3Audio.applause:v3Audio.effects;
    return v3Noise(start,dur,gain*Math.max(0,Math.min(1,scale)),center);
  };
}
if(typeof tvApplause==='function'){
  const v3Applause=tvApplause;
  tvApplause=function(seconds=1){const prev=v3AudioLayer;v3AudioLayer='applause';try{return v3Applause(seconds);}finally{v3AudioLayer=prev;}};
}
if(typeof tvFanfare==='function'){
  const v3Fanfare=tvFanfare;
  tvFanfare=function(){const prev=v3AudioLayer;v3AudioLayer='music';try{return v3Fanfare();}finally{v3AudioLayer=prev;}};
}
if(typeof omDuck==='function'){
  omDuck=function(on){
    const a=$('#sndStart');if(a&&!a.paused)try{a.volume=(on?.08:.72)*v3Audio.music;}catch(_){}
  };
}

const V3_PHRASES={
  formal:{
    control:[' obtiene el control.',' responderá primero.',' tiene el turno.'],
    correct:['Respuesta correcta.','Respuesta aceptada.','La respuesta está en el tablero.'],
    top:['Respuesta número uno.','Han encontrado la respuesta principal.','Respuesta de mayor puntuación.'],
    x1:['Primer error.','Se registra el primer error.'],
    x2:['Segundo error.','Se registra el segundo error.'],
    steal:['Oportunidad de robo.','El otro equipo tiene oportunidad de robo.'],
    double:['Ronda de puntos dobles.'],triple:['Ronda de puntos triples.'],final:['Última ronda.'],
    review:['Estas eran las respuestas que faltaron.','Revisemos las respuestas restantes.'],
    winner:['Los ganadores son ','El equipo ganador es ']
  },
  show:{
    control:[' tiene el control!',' se queda con el tablero!',' va primero!'],
    correct:['¡Respuesta correcta!','¡Sí está en el tablero!','¡Tenemos respuesta!','¡Eso suma!'],
    top:['¡Respuesta número uno!','¡Encontraron la número uno!','¡La respuesta estrella del tablero!'],
    x1:['¡Primera equis!','¡Primer error!'],x2:['¡Segunda equis!','¡Cuidado, segunda equis!'],
    steal:['¡Oportunidad de robo!','¡Se abre el robo!','¡El banco está en juego!'],
    double:['¡Puntos dobles!'],triple:['¡Puntos triples!'],final:['¡Llegamos a la última ronda!'],
    review:['¡Estas eran las respuestas que faltaron!','¡Veamos qué quedó en el tablero!'],
    winner:['¡Los ganadores son ','¡Tenemos campeones: ']
  },
  fun:{
    control:[' manda en el tablero!',' entra con todo!',' tiene la primera oportunidad!'],
    correct:['¡Sí señor, está en el tablero!','¡Esa neurona dental funcionó!','¡Bien jugado, respuesta correcta!','¡El tablero dice que sí!'],
    top:['¡Bingo dental, respuesta número uno!','¡Directo a la cima del tablero!','¡La respuesta estrella!'],
    x1:['¡Uy, primera equis!','¡Se escapó esa, primera equis!'],x2:['¡Cuidado, segunda equis!','¡Una más y el banco peligra!'],
    steal:['¡Se abre la puerta del robo!','¡A robar ese banco!','¡Momento de tensión: robo!'],
    double:['¡Ahora todo vale doble!'],triple:['¡Triple puntuación, esto se pone serio!'],final:['¡Última ronda, que brillen esas neuronas!'],
    review:['¡Veamos cuáles se nos escaparon!','¡Estas estaban escondidas en el tablero!'],
    winner:['¡Confeti para ','¡Tenemos campeones: ']
  }
};
function v3PickPhrase(style,event){
  const arr=V3_PHRASES[style]?.[event]||V3_PHRASES.show[event]||[''];
  let idx=Math.floor(Math.random()*arr.length);
  if(arr.length>1&&v3LastPhrase[style+event]===idx)idx=(idx+1)%arr.length;
  v3LastPhrase[style+event]=idx;return arr[idx];
}
offlinePresenterCue=function(event,vars={}){
  if(!narratorEnabled)return;
  const style=offlineSettings?.presenterStyle||'show';
  let text=v3PickPhrase(style,event);
  if(event==='control')text=(vars.team||teamNames[currentTeam])+text;
  if(event==='winner')text=text+(vars.team||'')+'!';
  if(!text)return;
  try{if(window.Android&&Android.speakCue){Android.speakCue(text);return;}}catch(_){}
  try{const u=new SpeechSynthesisUtterance(text);u.lang='es-MX';u.rate=.98;u.volume=v3Audio.narrator;speechSynthesis.speak(u);}catch(_){}
};

function v3MusicHud(){
  let hud=$('#v3MusicHud');
  if(!hud){
    hud=document.createElement('div');hud.id='v3MusicHud';hud.className='v3MusicHud hidden';
    hud.innerHTML='<button id="v3MusicMute">🎵</button><div><span id="v3MusicTime">0:00 / 0:00</span><i><b id="v3MusicBar"></b></i></div>';
    document.body.appendChild(hud);
    $('#v3MusicMute').onclick=()=>{const a=$('#sndStart');if(!a)return;a.muted=!a.muted;$('#v3MusicMute').textContent=a.muted?'🔇':'🎵';};
  }
  return hud;
}
(function(){
  const a=$('#sndStart');if(!a)return;v3MusicHud();
  const fmt=s=>{if(!Number.isFinite(s))return'0:00';s=Math.max(0,Math.floor(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
  const draw=()=>{const h=$('#v3MusicHud');if(!h)return;h.classList.toggle('hidden',a.paused||a.ended);$('#v3MusicTime').textContent=fmt(a.currentTime)+' / '+fmt(a.duration);$('#v3MusicBar').style.width=(a.duration?Math.min(100,a.currentTime/a.duration*100):0)+'%';};
  a.addEventListener('play',()=>{a.volume=.72*v3Audio.music;draw();});a.addEventListener('timeupdate',draw);a.addEventListener('durationchange',draw);a.addEventListener('ended',draw);a.addEventListener('pause',draw);
})();

function v3AudioSettings(){
  openModal('<h2>🎚 MEZCLADOR DE AUDIO</h2>'+
    [['music','🎵 Música'],['narrator','🎙 Presentador'],['effects','🔔 Efectos'],['applause','👏 Aplausos']].map(([k,l])=>'<label class="audioSlider">'+l+'<input id="v3Vol_'+k+'" type="range" min="0" max="100" value="'+Math.round(v3Audio[k]*100)+'"><b id="v3Val_'+k+'">'+Math.round(v3Audio[k]*100)+'%</b></label>').join('')+
    '<div class="menuStack"><button id="v3AudioTest">▶ PROBAR MEZCLA</button><button id="v3AudioSave" class="setupStart">GUARDAR</button></div>');
  ['music','narrator','effects','applause'].forEach(k=>$('#v3Vol_'+k).oninput=e=>{$('#v3Val_'+k).textContent=e.target.value+'%';});
  $('#v3AudioTest').onclick=()=>{['music','narrator','effects','applause'].forEach(k=>v3Audio[k]=Number($('#v3Vol_'+k).value)/100);v3AudioSave();tvSfx('correct');tvApplause(.7);offlinePresenterCue('correct');};
  $('#v3AudioSave').onclick=()=>{['music','narrator','effects','applause'].forEach(k=>v3Audio[k]=Number($('#v3Vol_'+k).value)/100);v3AudioSave();closeModal(false);};
}

function v3Celebrate(kind,team=currentTeam){
  if(kind==='normal'){tvSfx('correct');return;}
  if(kind==='top'){tvShowCue('⭐ RESPUESTA #1',teamNames[team],'winner',1150);tvConfetti(55);tvApplause(1.2);return;}
  if(kind==='steal'){tvShowCue('🏦 ¡ROBO EXITOSO!',teamNames[team],'steal',1350);tvConfetti(70);tvApplause(1.8);return;}
  if(kind==='winner'){tvShowCue('🏆 CAMPEONES',teamNames[team],'winner',1800);tvConfetti(120);tvFanfare();tvApplause(2.8);}
}
const v3ShowReveal=revealAnswer;
revealAnswer=function(idx,btn){
  const oldPhase=phase,was=!!revealed?.[idx],team=currentTeam;
  const r=v3ShowReveal(idx,btn);
  if(!was&&revealed?.[idx]){
    if(oldPhase==='steal')v3Celebrate('steal',team);
    else if(idx===0)v3Celebrate('top',team);
  }
  return r;
};

function v3WinnerCard(winner){
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=675;
  const x=canvas.getContext('2d');
  const g=x.createLinearGradient(0,0,1200,675);g.addColorStop(0,'#220505');g.addColorStop(1,'#071b20');x.fillStyle=g;x.fillRect(0,0,1200,675);
  x.textAlign='center';x.fillStyle='#ffe2a0';x.font='900 56px Arial';x.fillText('100 DENTISTAS DIJERON',600,90);
  x.font='900 90px Arial';x.fillText('🏆',600,210);
  x.fillStyle='#fff';x.font='900 72px Arial';x.fillText(teamNames[winner]||'EQUIPO GANADOR',600,315);
  x.fillStyle='#ffd36e';x.font='900 54px Arial';x.fillText((scores[winner]||0)+' PUNTOS',600,390);
  x.fillStyle='#ddd';x.font='32px Arial';x.fillText((typeof offlineSettings!=='undefined'&&offlineSettings.group?offlineSettings.group+' · ':'')+(typeof spSpecialtyName==='function'?spSpecialtyName():'Odontología'),600,455);
  x.font='26px Arial';x.fillText(new Date().toLocaleDateString()+' · '+V3_SHOW_VERSION,600,510);
  x.strokeStyle='#d7b36c';x.lineWidth=5;x.strokeRect(30,30,1140,615);
  return canvas;
}
function v3ExportWinnerCard(winner){
  const c=v3WinnerCard(winner),data=c.toDataURL('image/png');
  try{if(window.Android&&Android.exportBase64File){Android.exportBase64File('Campeones_100_Dentistas.png','image/png',data);return;}}catch(_){}
  const a=document.createElement('a');a.href=data;a.download='Campeones_100_Dentistas.png';a.click();
}

if(typeof v2DeclareWinner==='function'){
  const v3ShowWinner=v2DeclareWinner;
  v2DeclareWinner=function(winner,sudden=false){
    v3Celebrate('winner',winner);
    const r=v3ShowWinner(winner,sudden);
    setTimeout(()=>{
      const stack=document.querySelector('#modalContent .menuStack');
      if(stack&&!$('#v3WinnerCard')){const b=document.createElement('button');b.id='v3WinnerCard';b.textContent='📸 EXPORTAR TARJETA DE CAMPEONES';b.onclick=()=>v3ExportWinnerCard(winner);stack.prepend(b);}
    },2450);
    return r;
  };
}

function v3ShowMenu(){
  openModal('<h2>🎭 SHOW Y AUDIO</h2><div class="menuStack"><button id="v3Mixer">🎚 VOLUMEN POR CAPAS</button><button id="v3PresenterTest">🎙 PROBAR FRASES DEL PRESENTADOR</button><button id="v3Celebrations">✨ PROBAR CELEBRACIONES</button></div>');
  $('#v3Mixer').onclick=v3AudioSettings;$('#v3PresenterTest').onclick=()=>offlinePresenterCue('correct');$('#v3Celebrations').onclick=()=>{closeModal(false);v3Celebrate('top',currentTeam);};
}

// Acceso integrado dentro de Classroom Research para mantener limpia la portada.
