/* 12 paletas de aves: 8 tonos inspirados en su plumaje característico. */
(function(){
'use strict';
const palettes={
 agaporni:{name:'Agapornis',primary:'#269447',secondary:'#1876B8',accent:'#F2D52E',background:'#FFFDF4',surface:'#FFFFFF',text:'#E98A55',muted:'#35B9B0',border:'#9B78B8'},
 'buho-real':{name:'Búho real',primary:'#765238',secondary:'#B58A5A',accent:'#D9C49B',background:'#F6F0E4',surface:'#FFFFFF',text:'#33271F',muted:'#8B8D88',border:'#4A4037'},
 colibri:{name:'Colibrí',primary:'#087F65',secondary:'#13B8A6',accent:'#1768B0',background:'#F1FCF8',surface:'#FFFFFF',text:'#183E39',muted:'#9BCE4A',border:'#7652A4'},
 cuervo:{name:'Cuervo',primary:'#17191F',secondary:'#343943',accent:'#59616D',background:'#F3F4F5',surface:'#FFFFFF',text:'#252A32',muted:'#777E88',border:'#66527E'},
 faisan:{name:'Faisán',primary:'#A64E25',secondary:'#D18A32',accent:'#285B3E',background:'#F8F0E5',surface:'#FFFFFF',text:'#392A23',muted:'#376C8A',border:'#22272A'},
 gallo:{name:'Gallo',primary:'#C52232',secondary:'#202126',accent:'#F1F0E9',background:'#F7F5F0',surface:'#FFFFFF',text:'#E87532',muted:'#92979B',border:'#6A3438'},
 'guacamaya-roja':{name:'Guacamaya roja',primary:'#D3262E',secondary:'#F08A24',accent:'#F4D43A',background:'#FFF9EA',surface:'#FFFFFF',text:'#1766A8',muted:'#28764B',border:'#292B31'},
 'guacamayo-azul':{name:'Guacamayo azul',primary:'#0754A4',secondary:'#168CC2',accent:'#F2D12E',background:'#F3FAFC',surface:'#FFFFFF',text:'#20262D',muted:'#42B7B0',border:'#E7A53A'},
 ninfa:{name:'Ninfa',primary:'#858783',secondary:'#B9B9B2',accent:'#F0D34A',background:'#FAF8F0',surface:'#FFFFFF',text:'#4B4D4C',muted:'#E98A37',border:'#D7D2C8'},
 'pavo-real':{name:'Pavo real',primary:'#075B83',secondary:'#087F68',accent:'#20AFC0',background:'#F1F8F6',surface:'#FFFFFF',text:'#C7A13A',muted:'#315A87',border:'#263A46'},
 quetzal:{name:'Quetzal',primary:'#08764D',secondary:'#20A88B',accent:'#D52D35',background:'#F0F8F1',surface:'#FFFFFF',text:'#155C78',muted:'#D6C16B',border:'#263A32'},
 tucan:{name:'Tucán',primary:'#17191D',secondary:'#F2D52E',accent:'#F28A24',background:'#FFFDF5',surface:'#FFFFFF',text:'#F4F0E6',muted:'#D94B2B',border:'#343B43'}
};
const keys=['primary','secondary','accent','background','surface','text','muted','border'];
const audioFiles={agaporni:'agaporni.mp3','buho-real':'buho-real.mp3',colibri:'colibri.mp3',cuervo:'cuervo.mp3',faisan:'faisan.mp3',gallo:'gallo.mp3','guacamaya-roja':'guacamaya-roja.mp3','guacamayo-azul':'guacamayo-azul.mp3',ninfa:'ninfa.mp3','pavo-real':'pavo-real.mp3',quetzal:'quetzal.mp3',tucan:'tucan.mp3'};
const audioBase='bird-sounds/';let active='tucan',currentAudio=null;
function playBirdSound(id){if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;currentAudio=null;}const file=audioFiles[id];if(!file)return;try{currentAudio=new Audio(audioBase+file);currentAudio.preload='auto';const result=currentAudio.play();if(result&&result.catch)result.catch(()=>{});}catch(_){}}
function apply(id,playSound){const p=palettes[id]||palettes.tucan;active=id;keys.forEach(k=>document.documentElement.style.setProperty('--bird-'+k,p[k]));document.documentElement.style.setProperty('--bird-success',p.secondary);document.documentElement.style.setProperty('--bird-danger',p.accent);document.documentElement.dataset.birdPalette=id;try{localStorage.setItem('dentistas-bird-palette',id);}catch(_){}document.querySelectorAll('[data-bird-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.birdPalette===id)));if(playSound)playBirdSound(id);}
function open(){const m=document.getElementById('paletteModal');if(m)m.hidden=false;}
function close(){const m=document.getElementById('paletteModal');if(m)m.hidden=true;}
function init(){try{active=localStorage.getItem('dentistas-bird-palette')||'tucan';}catch(_){}apply(active,false);const btn=document.getElementById('paletteOpen');if(btn)btn.addEventListener('click',open);const cb=document.getElementById('paletteClose');if(cb)cb.addEventListener('click',close);const modal=document.getElementById('paletteModal');if(modal)modal.addEventListener('click',e=>{if(e.target===modal)close();});const grid=document.getElementById('paletteGrid');if(grid){grid.innerHTML=Object.entries(palettes).map(([id,p])=>'<button type="button" class="paletteChoice" data-bird-palette="'+id+'" aria-pressed="false"><span class="paletteSwatches">'+keys.map(k=>'<i style="background:'+p[k]+'"></i>').join('')+'</span><span><span class="paletteName">'+p.name+'</span><br><span class="paletteHint">8 colores · escuchar canto</span></span></button>').join('');grid.addEventListener('click',e=>{const b=e.target.closest('[data-bird-palette]');if(b)apply(b.dataset.birdPalette,true);});}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.BirdPalettes={apply,list:()=>Object.entries(palettes).map(([id,p])=>({id,name:p.name,colors:keys.map(k=>p[k])}))};
})();