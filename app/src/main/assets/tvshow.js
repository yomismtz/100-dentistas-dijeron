'use strict';

// 100 Dentistas Dijeron · TV Show Edition layer
const TV_SHOW_VERSION = '3.0.9';
let tvTransitionUntil = 0;
let tvWinnerPending = false;
let tvAudioCtx = null;
let tvSettings = { music:true, effects:true, applause:true, vibration:true };

(function tvLoadSettings(){
  try {
    const saved = JSON.parse(localStorage.getItem('dentistas-tv-settings') || '{}');
    tvSettings = {...tvSettings, ...saved};
  } catch (_) {}
})();

function tvSaveSettings(){
  localStorage.setItem('dentistas-tv-settings', JSON.stringify(tvSettings));
}

function tvCanAnimate(){
  return !document.documentElement.classList.contains('reduceMotion');
}

function tvEnsureStage(){
  if ($('#tvStage')) return;
  const stage = document.createElement('div');
  stage.id = 'tvStage';
  stage.className = 'tvStage hidden';
  stage.innerHTML = `
    <div class="tvSpot tvSpotLeft"></div>
    <div class="tvSpot tvSpotRight"></div>
    <div class="tvCurtain tvCurtainLeft"></div>
    <div class="tvCurtain tvCurtainRight"></div>
    <div class="tvStageCard">
      <div class="tvStageTooth">🦷🎤</div>
      <div id="tvStageKicker" class="tvStageKicker"></div>
      <div id="tvStageTitle" class="tvStageTitle"></div>
      <div id="tvStageSub" class="tvStageSub"></div>
    </div>`;
  document.body.appendChild(stage);

  const confetti = document.createElement('div');
  confetti.id = 'tvConfetti';
  confetti.className = 'tvConfetti';
  confetti.setAttribute('aria-hidden','true');
  document.body.appendChild(confetti);
}

tvEnsureStage();

function tvShowCue(title, sub='', kind='round', ms=1350){
  tvEnsureStage();
  const stage = $('#tvStage');
  const now = Date.now();
  tvTransitionUntil = now + ms;
  stage.className = `tvStage ${kind}`;
  $('#tvStageKicker').textContent = kind === 'winner' ? 'ASÍ LOS DENTISTAS LO DIJERON' : kind === 'steal' ? 'OPORTUNIDAD' : kind === 'sudden' ? 'DESEMPATE' : 'NUEVA RONDA';
  $('#tvStageTitle').textContent = title;
  $('#tvStageSub').textContent = sub;
  requestAnimationFrame(()=>stage.classList.add('show'));
  setTimeout(()=>{
    stage.classList.remove('show');
    setTimeout(()=>stage.classList.add('hidden'), tvCanAnimate()?420:0);
  }, Math.max(500, ms-380));
}

function tvGetAudioCtx(){
  if (!tvSettings.effects && !tvSettings.music && !tvSettings.applause) return null;
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    if (!tvAudioCtx) tvAudioCtx = new C();
    if (tvAudioCtx.state === 'suspended') tvAudioCtx.resume().catch(()=>{});
    return tvAudioCtx;
  } catch (_) { return null; }
}

function tvTone(freq, start, dur, gain=.045, type='sine'){
  const c = tvGetAudioCtx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(Math.max(.001,gain), c.currentTime + start + .015);
  g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + start + dur);
  o.connect(g); g.connect(c.destination);
  o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + .02);
}

function tvNoiseHit(start=0, dur=.07, gain=.045, center=1600){
  const c = tvGetAudioCtx(); if (!c) return;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const b = c.createBuffer(1, len, c.sampleRate); const data = b.getChannelData(0);
  for(let i=0;i<len;i++) data[i]=(Math.random()*2-1)*(1-i/len);
  const src=c.createBufferSource(), filter=c.createBiquadFilter(), g=c.createGain();
  src.buffer=b; filter.type='bandpass'; filter.frequency.value=center; filter.Q.value=.8; g.gain.value=gain;
  src.connect(filter); filter.connect(g); g.connect(c.destination); src.start(c.currentTime+start);
}

function tvSfx(name){
  if (!tvSettings.effects && !['applause','bigApplause','fanfare','drumroll'].includes(name)) return;
  if (name==='click'){ tvTone(520,0,.045,.022,'triangle'); }
  else if(name==='select'){ tvTone(560,0,.055,.025,'triangle');tvTone(760,.045,.07,.022,'triangle'); }
  else if(name==='listen'){ tvTone(330,0,.08,.025,'sine');tvTone(440,.075,.1,.022,'sine'); }
  else if(name==='ready'){ tvTone(620,0,.065,.03,'triangle');tvTone(830,.07,.075,.035,'triangle');tvTone(1040,.145,.11,.04,'triangle'); }
  else if(name==='buzzerHit'){ tvTone(220,0,.08,.055,'square');tvTone(440,.055,.12,.045,'triangle'); }
  else if (name==='tick'){ tvTone(880,0,.06,.035,'square'); }
  else if(name==='buzz'){ tvTone(155,0,.22,.07,'sawtooth'); tvTone(120,.04,.23,.05,'square'); }
  else if(name==='correct'){ tvTone(660,0,.08,.045,'triangle'); tvTone(880,.08,.11,.05,'triangle'); }
  else if(name==='topAnswer'){ tvTone(660,0,.07,.05,'triangle');tvTone(880,.07,.08,.05,'triangle');tvTone(1100,.15,.16,.055,'triangle');tvApplause(.55); }
  else if(name==='round'){ tvTone(392,0,.11,.04,'triangle');tvTone(523,.10,.12,.045,'triangle');tvTone(659,.22,.18,.05,'triangle'); }
  else if(name==='double'){ tvTone(440,0,.09,.04,'square');tvTone(659,.1,.1,.05,'square');tvTone(880,.21,.17,.055,'triangle'); }
  else if(name==='triple'){ [392,523,659,784].forEach((f,i)=>tvTone(f,i*.085,.15,.05,'triangle')); }
  else if(name==='steal'){ tvTone(294,0,.12,.04,'sawtooth');tvTone(370,.13,.12,.045,'sawtooth');tvTone(494,.27,.2,.05,'triangle'); }
  else if(name==='bank'){ tvTone(523,0,.08,.04,'triangle');tvTone(659,.08,.09,.045,'triangle');tvTone(784,.17,.13,.05,'triangle'); }
  else if(name==='review'){ tvTone(330,0,.13,.04,'triangle');tvTone(392,.14,.13,.042,'triangle');tvTone(494,.29,.14,.045,'triangle');tvTone(659,.46,.30,.052,'triangle'); }\n  else if(name==='nav'){ tvTone(420,0,.045,.018,'sine');tvTone(630,.045,.055,.022,'triangle'); }\n  else if(name==='undo'){ tvTone(660,0,.06,.022,'triangle');tvTone(440,.07,.08,.02,'triangle'); }\n  else if(name==='reset'){ [392,494,587].forEach((f,i)=>tvTone(f,i*.055,.08,.018,'sine')); }\n  else if(name==='startGame'){ [392,523,659,784].forEach((f,i)=>tvTone(f,i*.07,.14,.03,'triangle')); }\n  else if(name==='muteOff'){ tvTone(523,0,.05,.022,'sine');tvTone(784,.07,.09,.025,'triangle'); }
  else if(name==='applause'){ tvApplause(1.4); }
  else if(name==='bigApplause'){ tvApplause(2.7); }
  else if(name==='drumroll'){ tvDrumroll(); }
  else if(name==='fanfare'){ tvFanfare(); }
}

function tvApplause(seconds=1){
  if (!tvSettings.applause) return;
  const count = Math.min(36, Math.max(10, Math.round(seconds*22)));
  for(let i=0;i<count;i++){
    const t = i*(seconds/count) + Math.random()*.035;
    tvNoiseHit(t,.035+Math.random()*.035,.025+Math.random()*.035,1100+Math.random()*1500);
  }
}
function tvDrumroll(){
  if (!tvSettings.effects) return;
  for(let i=0;i<15;i++) tvNoiseHit(i*.055,.045,.028+i*.001,650);
  tvTone(110,.82,.22,.055,'sine');
}
function tvFanfare(){
  if (!tvSettings.music) return;
  const phrase=[523,659,784,1047,784,880,1047,1319];
  phrase.forEach((f,i)=>tvTone(f,i*.16,.30,.05,'triangle'));
  [523,659,784].forEach(f=>tvTone(f,1.35,.85,.028,'sine'));
  [659,784,1047,1319].forEach((f,i)=>tvTone(f,1.55+i*.08,.72,.032,'triangle'));
}

function tvVibrate(pattern){
  if (!tvSettings.vibration) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(_){}
}

function tvConfetti(burst=70){
  if (!tvCanAnimate()) return;
  const layer=$('#tvConfetti'); if(!layer)return;
  const chars=['◆','●','▲','★','■'];
  for(let i=0;i<burst;i++){
    const p=document.createElement('span');
    p.textContent=chars[Math.floor(Math.random()*chars.length)];
    p.style.left=`${Math.random()*100}%`;
    p.style.setProperty('--fall',`${1.5+Math.random()*1.7}s`);
    p.style.setProperty('--delay',`${Math.random()*.35}s`);
    p.style.setProperty('--spin',`${360+Math.random()*900}deg`);
    p.style.fontSize=`${10+Math.random()*18}px`;
    layer.appendChild(p);
    setTimeout(()=>p.remove(),3600);
  }
}

function tvCount(el, from, to, ms=650){
  if(!el){return;} if(!tvCanAnimate()||from===to){el.textContent=String(to);return;}
  const start=performance.now();
  const step=(now)=>{const p=Math.min(1,(now-start)/ms);const eased=1-Math.pow(1-p,3);el.textContent=String(Math.round(from+(to-from)*eased));if(p<1)requestAnimationFrame(step);};
  requestAnimationFrame(step);
}

function tvFlyPoints(team, points){
  if(!tvCanAnimate()||!points)return;
  const bankEl=$('#bank'), target=document.querySelectorAll('.team')[team]; if(!bankEl||!target)return;
  const b=bankEl.getBoundingClientRect(), t=target.getBoundingClientRect();
  const chip=document.createElement('div'); chip.className='tvPointChip'; chip.textContent=`+${points}`;
  chip.style.left=`${b.left+b.width/2}px`;chip.style.top=`${b.top+b.height/2}px`;document.body.appendChild(chip);
  requestAnimationFrame(()=>{chip.style.transform=`translate(${t.left+t.width/2-(b.left+b.width/2)}px,${t.top+t.height/2-(b.top+b.height/2)}px) scale(.7)`;chip.style.opacity='0';});
  setTimeout(()=>chip.remove(),900);
}

function tvSpotlight(team){
  document.querySelectorAll('.team').forEach((el,i)=>el.classList.toggle('tvSpotlightTeam',i===team));
}

const tvOriginalUpdateTurn = updateTurnUI;
updateTurnUI = function(){
  tvOriginalUpdateTurn();
  if (phase!=='over') tvSpotlight(currentTeam); else document.querySelectorAll('.team').forEach(el=>el.classList.remove('tvSpotlightTeam'));
};

const tvOriginalStartTimer = startTimer;
startTimer = function(){
  tvOriginalStartTimer();
  const timer=$('#timer'); if(timer) timer.parentElement?.parentElement?.classList.remove('tvTimeOut');
};

const tvOriginalTimerUI = updateTimerUI;
updateTimerUI = function(){
  tvOriginalTimerUI();
  const box=$('#timer')?.closest('.timerBox'); if(!box)return;
  box.classList.toggle('tvCountdown', phase!=='over' && timerRemaining<=3 && timerRemaining>0);
};

const tvOriginalShowRound = showRound;
showRound = function(reset=true){
  tvOriginalShowRound(reset);
  const mult=roundMultiplier();
  const finalRound = typeof GAME_SIZE!=='undefined' && roundIndex===GAME_SIZE-1;
  const title=finalRound?'🏆 GRAN FINAL':`RONDA ${roundIndex+1}`;
  const sub=finalRound?`RONDA ${roundIndex+1} · ×${mult}`:mult===1?'PUNTUACIÓN NORMAL':mult===2?'¡PUNTOS DOBLES! ×2':'🔥 ¡PUNTOS TRIPLES! ×3';
  tvShowCue(title,sub,finalRound?'winner':mult===3?'triple':mult===2?'double':'round',finalRound?1650:1450);
  tvSfx(finalRound?'fanfare':mult===3?'triple':mult===2?'double':'round');
};

const tvOriginalFaceoff = v2StartFaceoff;
v2StartFaceoff = function(sudden=false){
  if (Date.now() < tvTransitionUntil && !sudden){
    setTimeout(()=>v2StartFaceoff(false), Math.max(80,tvTransitionUntil-Date.now()+80));
    return;
  }
  if (sudden && Date.now() >= tvTransitionUntil){
    tvShowCue('⚡ MUERTE SÚBITA ⚡','UNA RESPUESTA DECIDE EL JUEGO','sudden',1500);
    tvSfx('drumroll');
    tvTransitionUntil=Date.now()+1450;
    setTimeout(()=>tvOriginalFaceoff(true),1500);
    return;
  }
  tvOriginalFaceoff(sudden);
};

const tvOriginalGiveControl = v2GiveControl;
v2GiveControl = function(team,sudden){
  tvOriginalGiveControl(team,sudden);
  if(!sudden){tvSfx('applause');tvVibrate(35);tvSpotlight(team);}
};

const tvOriginalReveal = revealAnswer;
revealAnswer = function(idx,btn){
  const beforeBank=bank,beforeScores=[...scores],beforePhase=phase,team=currentTeam;
  tvOriginalReveal(idx,btn);
  if(btn){btn.classList.add('tvAnswerReveal');setTimeout(()=>btn.classList.remove('tvAnswerReveal'),700);}
  tvCount($('#bank'),beforeBank,bank,500);
  if(idx===0) tvSfx('topAnswer'); else tvSfx('correct');
  tvVibrate(25);
  if(beforePhase==='steal' && scores[team]>beforeScores[team]){
    const won=scores[team]-beforeScores[team]; tvFlyPoints(team,won);tvCount(team===0?$('#s1'):$('#s2'),beforeScores[team],scores[team],800);tvConfetti(42);tvSfx('bigApplause');
  }
};

const tvOriginalStrike = addStrike;
addStrike = function(reason='manual'){
  const before=strikes,beforePhase=phase;
  tvOriginalStrike(reason);
  tvSfx('buzz');
  tvVibrate(before>=2 || beforePhase==='steal' ? [80,45,110] : 65);
  const flash=document.createElement('div');flash.className='tvSingleStrike';flash.textContent='✖';document.body.appendChild(flash);setTimeout(()=>flash.remove(),700);
  if(before<3 && strikes===3 && beforePhase!=='steal'){
    tvShowCue('✖ ✖ ✖','¡OPORTUNIDAD DE ROBO!','steal',1200);tvSfx('steal');
  }
  if(reason==='timeout') $('#timer')?.closest('.timerBox')?.classList.add('tvTimeOut');
};

const tvOriginalAward = awardBank;
awardBank = function(team){
  const idx=team-1, before=scores[idx], points=bank;
  tvOriginalAward(team);
  if(points>0){tvFlyPoints(idx,points);tvCount(idx===0?$('#s1'):$('#s2'),before,scores[idx],850);tvSfx('bank');tvSfx('applause');tvVibrate([35,25,35]);}
};

const tvOriginalHost = v2Host;
v2Host = function(text,state='normal'){
  tvOriginalHost(text,state);
  const tooth=$('#hostBubble .hostTooth'); if(!tooth)return;
  tooth.classList.remove('tvHostGood','tvHostBad','tvHostTense');
  void tooth.offsetWidth;
  tooth.classList.add(state==='good'?'tvHostGood':state==='bad'?'tvHostBad':'tvHostTense');
};

const tvOriginalDeclareWinner = v2DeclareWinner;
v2DeclareWinner = function(winner,sudden=false){
  if(tvWinnerPending) return;
  tvWinnerPending=true;
  stopTimer();
  tvShowCue('Y LOS GANADORES SON…', teamNames[winner], 'winner', 1750);
  tvSfx('drumroll');
  setTimeout(()=>{
    tvOriginalDeclareWinner(winner,sudden);
    tvFanfare();tvApplause(2);tvConfetti(105);tvVibrate([80,50,80,50,160]);
    const wc=document.querySelector('.winnerCharacters');if(wc)wc.classList.add('tvTrophyBounce');
    const score=document.querySelector('.winnerScore');if(score){const target=scores[winner];let n=document.createElement('span');n.className='tvWinnerNumber';n.textContent='0';score.innerHTML='';score.appendChild(n);score.append(` PUNTOS${sudden?' · MUERTE SÚBITA':''}`);tvCount(n,0,target,1100);}
    tvWinnerPending=false;
  },1700);
};

v2Settings = function(){
  openModal(`<h2>⚙️ ACCESIBILIDAD Y EXPERIENCIA</h2>
    <label class="settingRow">Tiempo por respuesta <select id="setTimer"><option>10</option><option>15</option><option>20</option></select></label>
    <label class="settingRow"><input id="setSound" type="checkbox" ${v2Sound?'checked':''}> Sonidos básicos</label>
    <label class="settingRow"><input id="setMusic" type="checkbox" ${tvSettings.music?'checked':''}> 🎵 Música ambiental / fanfarrias</label>
    <label class="settingRow"><input id="setEffects" type="checkbox" ${tvSettings.effects?'checked':''}> 🔔 Efectos de juego</label>
    <label class="settingRow"><input id="setApplause" type="checkbox" ${tvSettings.applause?'checked':''}> 👏 Aplausos / ovación</label>
    <label class="settingRow"><input id="setVibration" type="checkbox" ${tvSettings.vibration?'checked':''}> 📳 Vibración</label>
    <label class="settingRow"><input id="setMotion" type="checkbox" ${document.documentElement.classList.contains('reduceMotion')?'checked':''}> Reducir animaciones</label>
    <label class="settingRow"><input id="setText" type="checkbox" ${document.documentElement.classList.contains('largeText')?'checked':''}> Texto grande</label>
    <button id="previewShow" class="secondaryWide">▶ PROBAR APLAUSOS Y FANFARRIA</button>
    <button id="saveSettings" class="setupStart">GUARDAR</button>`);
  $('#setTimer').value=String(v2TimerSeconds);
  $('#previewShow').onclick=()=>{tvSettings.applause=$('#setApplause').checked;tvSettings.music=$('#setMusic').checked;tvSettings.effects=$('#setEffects').checked;tvApplause(1);tvFanfare();};
  $('#saveSettings').onclick=()=>{
    v2TimerSeconds=Number($('#setTimer').value);v2Sound=$('#setSound').checked;
    tvSettings.music=$('#setMusic').checked;tvSettings.effects=$('#setEffects').checked;tvSettings.applause=$('#setApplause').checked;tvSettings.vibration=$('#setVibration').checked;
    document.documentElement.classList.toggle('reduceMotion',$('#setMotion').checked);document.documentElement.classList.toggle('largeText',$('#setText').checked);
    v2SaveSettings();tvSaveSettings();closeModal(false);if(gameVisible()&&phase!=='over')startTimer();
  };
};

document.addEventListener('pointerdown',()=>{tvGetAudioCtx();},{once:true});
document.body.classList.add('tvShowEdition');
const version=document.querySelector('.bankVersion');if(version)version.textContent=`Banco clínico v1.0 · ${TV_SHOW_VERSION}`;
