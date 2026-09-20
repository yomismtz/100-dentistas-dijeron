'use strict';

// Narrador y efectos globales · v2.6
const NARRATOR_VERSION = '2.6-narrator-beta';
const NARRATOR_SETTINGS_KEY = 'dentistas-narrator-settings-v1';
let narratorEnabled = true;
let narratorCurrentId = '';
let narratorDoneCallback = null;
let narratorFallbackHandle = null;
let narratorReading = false;
let narratorStatusText = '🔊 ESCUCHA LA PREGUNTA…';

(function loadNarratorSettings(){
  try{
    const saved=JSON.parse(localStorage.getItem(NARRATOR_SETTINGS_KEY)||'{}');
    narratorEnabled=saved.enabled!==false;
  }catch(_){}
})();

function narratorSaveSettings(){
  try{localStorage.setItem(NARRATOR_SETTINGS_KEY,JSON.stringify({enabled:narratorEnabled}));}catch(_){}
}

function narratorBadge(show,text='🔊 LEYENDO PREGUNTA…'){
  let el=$('#narratorBadge');
  if(!el){
    el=document.createElement('div');
    el.id='narratorBadge';
    el.className='narratorBadge hidden';
    document.body.appendChild(el);
  }
  el.textContent=text;
  el.classList.toggle('hidden',!show);
}

function narratorStop(){
  clearTimeout(narratorFallbackHandle);
  narratorFallbackHandle=null;
  narratorReading=false;
  narratorBadge(false);
  try{if(window.Android&&Android.stopSpeaking)Android.stopSpeaking();}catch(_){}
  try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(_){}
}

function narratorFinish(id){
  if(!narratorReading)return;
  if(id && narratorCurrentId && id!==narratorCurrentId)return;
  clearTimeout(narratorFallbackHandle);
  narratorFallbackHandle=null;
  narratorReading=false;
  narratorBadge(false);
  if(typeof tvSfx==='function')tvSfx('ready');
  const done=narratorDoneCallback;
  narratorDoneCallback=null;
  if(typeof done==='function')done();
}

function narratorRead(text,onDone,statusText='🔊 ESCUCHA LA PREGUNTA…'){
  narratorStop();
  narratorStatusText=statusText||'🔊 ESCUCHA LA PREGUNTA…';
  narratorDoneCallback=typeof onDone==='function'?onDone:null;

  if(!narratorEnabled || !String(text||'').trim()){
    setTimeout(()=>{const cb=narratorDoneCallback;narratorDoneCallback=null;if(cb)cb();},80);
    return;
  }

  narratorReading=true;
  narratorCurrentId='question_'+Date.now()+'_'+Math.floor(Math.random()*10000);
  narratorBadge(true,narratorStatusText);
  if(typeof tvSfx==='function')tvSfx('listen');

  const value=String(text).trim();
  const estimated=Math.min(26000,Math.max(7000,value.length*95));
  narratorFallbackHandle=setTimeout(()=>narratorFinish(narratorCurrentId),estimated);

  try{
    if(window.Android&&typeof Android.speakText==='function'){
      Android.speakText(value,narratorCurrentId);
      return;
    }
  }catch(_){}

  try{
    if('speechSynthesis' in window){
      const u=new SpeechSynthesisUtterance(value);
      u.lang='es-MX';
      u.rate=.90;
      u.pitch=1.02;
      u.onend=()=>narratorFinish(narratorCurrentId);
      u.onerror=()=>narratorFinish(narratorCurrentId);
      speechSynthesis.speak(u);
      return;
    }
  }catch(_){}

  setTimeout(()=>narratorFinish(narratorCurrentId),500);
}

function narratorReadQuestion(onDone){
  const q=questions?.[roundIndex];
  if(!q){if(onDone)onDone();return;}
  stopTimer();
  narratorRead(q.q,onDone,'🔊 ESCUCHA LA PREGUNTA…');
}

function narratorReadAnnouncement(text,onDone,statusText='🔊 ESCUCHA…'){
  narratorRead(text,onDone,statusText);
}

window.onNarrationStarted=function(id){
  if(id===narratorCurrentId) narratorBadge(true,narratorStatusText);
};
window.onNarrationDone=function(id){
  narratorFinish(String(id||''));
};

document.addEventListener('pointerdown',event=>{
  const button=event.target.closest('button');
  if(!button||button.disabled)return;
  if(button.classList.contains('careoBuzzer'))return;
  if(button.id==='buzz'||button.classList.contains('danger'))return;
  if(button.classList.contains('award'))return;
  if(typeof tvSfx==='function')tvSfx(button.classList.contains('primary')?'select':'click');
},{passive:true});

document.addEventListener('change',event=>{
  if(event.target.matches('select,input[type="checkbox"],input[type="radio"]')){
    if(typeof tvSfx==='function')tvSfx('select');
  }
});

const narratorBaseSettings=v2Settings;
v2Settings=function(){
  openModal(`<h2>⚙️ ACCESIBILIDAD, VOZ Y SHOW</h2>
    <label class="settingRow">Tiempo por respuesta <select id="setTimer"><option>10</option><option>15</option><option>20</option><option>30</option></select></label>
    <label class="settingRow"><input id="setNarrator" type="checkbox" ${narratorEnabled?'checked':''}> 🎙️ Leer preguntas en voz alta antes del cronómetro</label>
    <label class="settingRow"><input id="setSound" type="checkbox" ${v2Sound?'checked':''}> 🔊 Sonidos básicos</label>
    <label class="settingRow"><input id="setMusic" type="checkbox" ${tvSettings.music?'checked':''}> 🎵 Música / fanfarrias</label>
    <label class="settingRow"><input id="setEffects" type="checkbox" ${tvSettings.effects?'checked':''}> 🔔 Efectos de concurso</label>
    <label class="settingRow"><input id="setApplause" type="checkbox" ${tvSettings.applause?'checked':''}> 👏 Aplausos / ovación</label>
    <label class="settingRow"><input id="setVibration" type="checkbox" ${tvSettings.vibration?'checked':''}> 📳 Vibración</label>
    <label class="settingRow"><input id="setMotion" type="checkbox" ${document.documentElement.classList.contains('reduceMotion')?'checked':''}> Reducir animaciones</label>
    <label class="settingRow"><input id="setText" type="checkbox" ${document.documentElement.classList.contains('largeText')?'checked':''}> Texto grande</label>
    <button id="testNarrator" class="secondaryWide">🎙️ PROBAR VOZ DEL PRESENTADOR</button>
    <button id="previewShow" class="secondaryWide">👏 PROBAR APLAUSOS Y FANFARRIA</button>
    <button id="saveSettings" class="setupStart">GUARDAR</button>`);
  $('#setTimer').value=String(v2TimerSeconds);
  $('#testNarrator').onclick=()=>{
    narratorEnabled=true;
    narratorRead('Bienvenidos a Así los Dentistas lo Dijeron. La pregunta será leída antes de iniciar el tiempo de respuesta.',()=>{});
  };
  $('#previewShow').onclick=()=>{
    tvSettings.applause=$('#setApplause').checked;
    tvSettings.music=$('#setMusic').checked;
    tvSettings.effects=$('#setEffects').checked;
    tvApplause(1);tvFanfare();
  };
  $('#saveSettings').onclick=()=>{
    v2TimerSeconds=Number($('#setTimer').value);
    narratorEnabled=$('#setNarrator').checked;
    v2Sound=$('#setSound').checked;
    tvSettings.music=$('#setMusic').checked;
    tvSettings.effects=$('#setEffects').checked;
    tvSettings.applause=$('#setApplause').checked;
    tvSettings.vibration=$('#setVibration').checked;
    document.documentElement.classList.toggle('reduceMotion',$('#setMotion').checked);
    document.documentElement.classList.toggle('largeText',$('#setText').checked);
    narratorSaveSettings();v2SaveSettings();tvSaveSettings();
    closeModal(false);
    if(gameVisible()&&phase!=='over'&&phase!=='faceoff')startTimer();
  };
};
