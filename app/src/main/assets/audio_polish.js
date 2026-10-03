/* Mejora 10 — audio y controles */
(function(){
'use strict';
const KEY='dentistas-audio-v1';
const state=(()=>{try{return {...{master:.8,effects:.8,muted:false},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(_){return {master:.8,effects:.8,muted:false}}})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){}}
function apply(){document.querySelectorAll('audio').forEach(a=>{a.volume=state.muted?0:Math.max(0,Math.min(1,state.master*state.effects));});}
function show(){const muted=state.muted;const html='<h2>🔊 AUDIO</h2><label>Volumen <input id="audioVol" type="range" min="0" max="100" value="'+Math.round(state.master*100)+'"></label><p><button id="audioMute">'+(muted?'🔇 ACTIVAR SONIDO':'🔊 SILENCIAR')+'</button></p><p>Los efectos y la narración respetan la configuración del dispositivo.</p>';if(typeof window.openModal==='function')window.openModal(html);const v=document.getElementById('audioVol');v?.addEventListener('input',()=>{state.master=Number(v.value)/100;state.muted=false;apply();save();});document.getElementById('audioMute')?.addEventListener('click',()=>{state.muted=!state.muted;apply();save();show();});}
window.DentistasAudio={state,apply,save,show};
document.addEventListener('click',e=>{if(e.target?.id==='audioSettings')show();});
document.addEventListener('click',()=>apply(),{once:true});
apply();
const style=document.createElement('style');style.textContent='.audioSettings{display:flex;gap:.7rem;align-items:center}.audioSettings input{width:100%}';document.head.appendChild(style);
})();