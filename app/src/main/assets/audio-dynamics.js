'use strict';

// Audio dinámico original para Así los Dentistas lo Dijeron.
// La música se sintetiza en tiempo real: no usa pistas comerciales ni material externo.
const DYNAMIC_AUDIO_VERSION='3.0.10';
const AUDIO_MASTER_KEY='dentistas-master-audio-v1';
let v3MasterMuted=false;
try{v3MasterMuted=localStorage.getItem(AUDIO_MASTER_KEY)==='muted';}catch(_){}
window.v3MasterMuted=v3MasterMuted;

let adAmbientGain=null;
let adAmbientTimer=null;
let adAmbientStep=0;
let adAmbientRunning=false;
let adDucked=false;
let adLastTimerSecond=null;

function adMusicVolume(){
  try{return Math.max(0,Math.min(1,Number(v3Audio?.music ?? .85)));}catch(_){return .85;}
}
function adCtx(){
  try{return typeof tvGetAudioCtx==='function'?tvGetAudioCtx():null;}catch(_){return null;}
}
function adEnsureAmbient(){
  const c=adCtx();if(!c)return null;
  if(!adAmbientGain){
    adAmbientGain=c.createGain();
    adAmbientGain.gain.value=.0001;
    adAmbientGain.connect(c.destination);
  }
  return c;
}
function adGameVisible(){
  try{return !!$('#game')&&!$('#game').classList.contains('hidden');}catch(_){return false;}
}
function adIntroPlaying(){
  const a=$('#sndStart');return !!a&&!a.paused&&!a.ended;
}
function adTargetGain(){
  if(v3MasterMuted||!adGameVisible()||!tvSettings?.music)return .0001;
  const base=.065*adMusicVolume();
  if(adDucked)return Math.max(.0001,base*.14);
  if(adIntroPlaying())return Math.max(.0001,base*.22);
  return Math.max(.0001,base);
}
function adUpdateGain(fast=false){
  const c=adEnsureAmbient();if(!c||!adAmbientGain)return;
  const now=c.currentTime;
  try{
    adAmbientGain.gain.cancelScheduledValues(now);
    adAmbientGain.gain.setTargetAtTime(adTargetGain(),now,fast?.03:.20);
  }catch(_){adAmbientGain.gain.value=adTargetGain();}
}
function adNote(freq,dur=.65,gain=.018,type='triangle',offset=0){
  const c=adEnsureAmbient();if(!c||!adAmbientGain||v3MasterMuted)return;
  const start=c.currentTime+Math.max(0,offset);
  const o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,start);
  g.gain.setValueAtTime(.0001,start);
  g.gain.exponentialRampToValueAtTime(Math.max(.001,gain),start+.035);
  g.gain.exponentialRampToValueAtTime(.0001,start+dur);
  o.connect(g);g.connect(adAmbientGain);
  o.start(start);o.stop(start+dur+.04);
}
function adAmbientPulse(){
  if(v3MasterMuted||!adGameVisible()||!tvSettings?.music)return;
  // Progresión original suave: C · Am · F · G, con variación de tensión en robo/desempate.
  const tense=phase==='steal'||phase==='sudden';
  const roots=tense?[220.00,196.00,174.61,196.00]:[261.63,220.00,174.61,196.00];
  const arp=tense?[0,7,3,10,7,12,3,7]:[0,7,12,4,7,12,9,7];
  const chord=Math.floor(adAmbientStep/8)%roots.length;
  const pos=adAmbientStep%8;
  const root=roots[chord];
  const f=root*Math.pow(2,arp[pos]/12);
  adNote(f,.72,.014,'triangle');
  if(pos===0){
    adNote(root/2,1.55,.021,'sine');
    adNote(root,1.15,.008,'sine',.05);
  }
  if(pos===3||pos===7)adNote(f*2,.32,.006,'sine',.05);
  adAmbientStep=(adAmbientStep+1)%32;
}
function adAmbientStart(){
  if(v3MasterMuted||!adGameVisible()||!tvSettings?.music)return;
  const c=adEnsureAmbient();if(!c)return;
  try{if(c.state==='suspended')c.resume().catch(()=>{});}catch(_){}
  if(!adAmbientTimer){
    adAmbientStep=0;
    adAmbientPulse();
    adAmbientTimer=setInterval(adAmbientPulse,520);
  }
  adAmbientRunning=true;
  adUpdateGain();
  adUpdateButtons();
}
function adAmbientStop(){
  if(adAmbientTimer){clearInterval(adAmbientTimer);adAmbientTimer=null;}
  adAmbientRunning=false;
  if(adAmbientGain){
    const c=adCtx();
    if(c)try{adAmbientGain.gain.setTargetAtTime(.0001,c.currentTime,.08);}catch(_){}
  }
  adUpdateButtons();
}
function adDuck(on){
  adDucked=!!on;adUpdateGain(true);
}
function adDuckFor(ms=1300){
  adDuck(true);setTimeout(()=>adDuck(false),ms);
}
function adMuteMedia(muted){
  document.querySelectorAll('audio').forEach(a=>{try{a.muted=muted;}catch(_){}});
}
function adUpdateButtons(){
  const icon=v3MasterMuted?'🔇':'🔊';
  const label=v3MasterMuted?'Activar todo el sonido':'Apagar todo el sonido';
  const b=$('#soundToggle');
  if(b){
    b.textContent=icon;b.setAttribute('aria-label',label);b.title=label;
    b.classList.toggle('audioOn',!v3MasterMuted&&adAmbientRunning);
    b.classList.toggle('audioMuted',v3MasterMuted);
  }
  const h=$('#v3MusicMute');
  if(h){h.textContent=icon;h.title=label;}
}
function adSetMasterMuted(muted){
  v3MasterMuted=!!muted;window.v3MasterMuted=v3MasterMuted;
  try{localStorage.setItem(AUDIO_MASTER_KEY,v3MasterMuted?'muted':'on');}catch(_){}
  adMuteMedia(v3MasterMuted);
  if(v3MasterMuted){
    try{if(window.Android&&Android.stopSpeaking)Android.stopSpeaking();}catch(_){}
    try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(_){}
    try{
      if(typeof narratorReading!=='undefined'&&narratorReading&&typeof narratorFinish==='function')narratorFinish(narratorCurrentId);
    }catch(_){}
    adUpdateGain(true);
  }else{
    if(adGameVisible())adAmbientStart();
    if(typeof tvSfx==='function')setTimeout(()=>tvSfx('muteOff'),30);
  }
  adUpdateButtons();
}

// Botón maestro visible durante la partida.
const adSoundButton=$('#soundToggle');
if(adSoundButton)adSoundButton.onclick=()=>adSetMasterMuted(!v3MasterMuted);

// El pequeño control existente de la intro también actúa como mute maestro.
const adLegacyMute=$('#v3MusicMute');
if(adLegacyMute)adLegacyMute.onclick=()=>adSetMasterMuted(!v3MasterMuted);

// El narrador atenúa la música de fondo automáticamente.
if(typeof narratorRead==='function'){
  const adNarratorRead=narratorRead;
  narratorRead=function(text,onDone,statusText){
    if(v3MasterMuted){
      if(typeof onDone==='function')setTimeout(onDone,70);
      return;
    }
    adDuck(true);
    return adNarratorRead(text,()=>{adDuck(false);if(typeof onDone==='function')onDone();},statusText);
  };
}
if(typeof offlinePresenterCue==='function'){
  const adPresenterCue=offlinePresenterCue;
  offlinePresenterCue=function(event,vars={}){
    if(v3MasterMuted)return;
    adDuckFor(event==='winner'?2600:1500);
    return adPresenterCue(event,vars);
  };
}
if(typeof omSpeakNumber==='function'){
  const adSpeakNumber=omSpeakNumber;
  omSpeakNumber=function(n){
    if(v3MasterMuted)return;
    adDuckFor(520);
    return adSpeakNumber(n);
  };
}

// Mantiene música durante todas las rondas y la detiene al declarar al ganador.
if(typeof startNewGame==='function'){
  const adStartNewGame=startNewGame;
  startNewGame=function(){
    const r=adStartNewGame.apply(this,arguments);
    setTimeout(()=>{if(adGameVisible()){adAmbientStart();if(typeof tvSfx==='function')tvSfx('startGame');}},80);
    return r;
  };
}
if(typeof v2DeclareWinner==='function'){
  const adDeclareWinner=v2DeclareWinner;
  v2DeclareWinner=function(){
    adAmbientStop();
    return adDeclareWinner.apply(this,arguments);
  };
}

// Tick musical en los últimos 5 segundos; no altera el cronómetro.
if(typeof updateTimerUI==='function'){
  const adUpdateTimerUI=updateTimerUI;
  updateTimerUI=function(){
    const r=adUpdateTimerUI.apply(this,arguments);
    if(timerRemaining>5)adLastTimerSecond=null;
    if(!v3MasterMuted&&adGameVisible()&&phase!=='over'&&timerRemaining>0&&timerRemaining<=5&&adLastTimerSecond!==timerRemaining){
      adLastTimerSecond=timerRemaining;
      if(typeof tvSfx==='function')tvSfx('tick');
    }
    return r;
  };
}

// Cambios de configuración afectan la música sin reiniciar la partida.
if(typeof v3AudioSave==='function'){
  const adAudioSave=v3AudioSave;
  v3AudioSave=function(){const r=adAudioSave.apply(this,arguments);adUpdateGain();return r;};
}
if(typeof tvSaveSettings==='function'){
  const adTvSave=tvSaveSettings;
  tvSaveSettings=function(){
    const r=adTvSave.apply(this,arguments);
    if(tvSettings.music&&adGameVisible()&&!v3MasterMuted)adAmbientStart();else if(!tvSettings.music)adAmbientStop();
    return r;
  };
}

// Sonidos particulares de controles importantes.
document.addEventListener('pointerdown',e=>{
  if(v3MasterMuted)return;
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.id==='prev'||b.id==='next'){if(typeof tvSfx==='function')tvSfx('nav');}
  else if(b.id==='undo'){if(typeof tvSfx==='function')tvSfx('undo');}
  else if(b.id==='resetRound'){if(typeof tvSfx==='function')tvSfx('reset');}
},{passive:true});

// Si un modo inicia la partida mediante un wrapper anterior, detecta la pantalla automáticamente.
const adGame=$('#game');
if(adGame&&window.MutationObserver){
  new MutationObserver(()=>{
    if(adGameVisible()&&!v3MasterMuted&&tvSettings?.music)adAmbientStart();
    else if(!adGameVisible())adAmbientStop();
  }).observe(adGame,{attributes:true,attributeFilter:['class']});
}

document.addEventListener('visibilitychange',()=>{
  if(document.hidden)adAmbientStop();
  else if(adGameVisible()&&!v3MasterMuted&&tvSettings?.music)adAmbientStart();
});
['sndStart'].forEach(id=>{
  const a=$('#'+id);if(!a)return;
  a.addEventListener('play',()=>adUpdateGain());
  a.addEventListener('pause',()=>adUpdateGain());
  a.addEventListener('ended',()=>adUpdateGain());
});

// Al volver a portada desde cualquier menú se apaga la música de partida.
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(['mHome','mHomeV2','mHomeFinal'].includes(b.id))setTimeout(adAmbientStop,40);
});

adMuteMedia(v3MasterMuted);
adUpdateButtons();
