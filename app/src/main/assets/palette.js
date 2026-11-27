/* 12 paletas de aves: ocho colores basados en el plumaje característico. */
(function(){
'use strict';
const palettes={
 agaporni:{name:'Agapornis',primary:'#269447',secondary:'#1876B8',accent:'#F2D52E',background:'#FFFDF4',surface:'#FFFFFF',text:'#E98A55',muted:'#35B9B0',border:'#9B78B8'},
 'buho-real':{name:'Búho real',primary:'#765238',secondary:'#B58A5A',accent:'#D9C49B',background:'#F6F0E4',surface:'#FFFFFF',text:'#33271F',muted:'#8B8D88',border:'#4A4037'},
 colibri:{name:'Colibrí',primary:'#168B55',secondary:'#20B9A8',accent:'#1676B8',background:'#E7F5E9',surface:'#FFFFFF',text:'#14543D',muted:'#B6D94A',border:'#7655A8'},
 cuervo:{name:'Cuervo',primary:'#171717',secondary:'#343434',accent:'#777777',background:'#E8E8E8',surface:'#FFFFFF',text:'#252525',muted:'#A5A5A5',border:'#62566E'},
 faisan:{name:'Faisán',primary:'#A94F24',secondary:'#D58A25',accent:'#426B38',background:'#F3E6CE',surface:'#FFFFFF',text:'#4B3025',muted:'#315A83',border:'#171717'},
 gallo:{name:'Gallo',primary:'#C62828',secondary:'#171717',accent:'#FFFFFF',background:'#F5EBDD',surface:'#FFFDF7',text:'#E87524',muted:'#888888',border:'#7D1717'},
 'guacamaya-roja':{name:'Guacamaya roja',primary:'#D51F26',secondary:'#F07822',accent:'#F2D32D',background:'#F7EBD7',surface:'#FFFFFF',text:'#1766A5',muted:'#278447',border:'#171717'},
 'guacamayo-azul':{name:'Guacamayo azul',primary:'#1476B8',secondary:'#20AFC0',accent:'#F1D02D',background:'#E5F3F7',surface:'#FFFFFF',text:'#171717',muted:'#76D5D0',border:'#D5A52B'},
 ninfa:{name:'Ninfa',primary:'#888B8D',secondary:'#D5D5D2',accent:'#EBCB42',background:'#F4EBDD',surface:'#FFFFFF',text:'#55585A',muted:'#E77B32',border:'#B7AA91'},
 'pavo-real':{name:'Pavo real',primary:'#176A9D',secondary:'#16845D',accent:'#20B8B0',background:'#E5F1EC',surface:'#FFFFFF',text:'#244E86',muted:'#C69A35',border:'#718A9B'},
 quetzal:{name:'Quetzal',primary:'#087C50',secondary:'#16A99A',accent:'#C92C32',background:'#E5F1E7',surface:'#FFFFFF',text:'#176B91',muted:'#C5A044',border:'#064B37'},
 tucan:{name:'Tucán',primary:'#171717',secondary:'#F2D12D',accent:'#EF7625',background:'#FFFDF4',surface:'#FFFFFF',text:'#555555',muted:'#D94B2B',border:'#F4E4C8'}
};
const keys=['primary','secondary','accent','background','surface','text','muted','border'];
const audioFiles={agaporni:'agaporni.mp3','buho-real':'buho-real.mp3',colibri:'colibri.mp3',cuervo:'cuervo.mp3',faisan:'faisan.mp3',gallo:'gallo.mp3','guacamaya-roja':'guacamaya-roja.mp3','guacamayo-azul':'guacamayo-azul.mp3',ninfa:'ninfa.mp3','pavo-real':'pavo-real.mp3',quetzal:'quetzal.mp3',tucan:'tucan.mp3'};
const birdImages={agaporni:'agaporni.png','buho-real':'buho-real.png',colibri:'colibri.png',cuervo:'cuervo.png',faisan:'faisan.png',gallo:'gallo.png','guacamaya-roja':'guacamaya-roja.png','guacamayo-azul':'guacamayo-azul.png',ninfa:'ninfa.png','pavo-real':'pavo-real.png',quetzal:'quetzal.png',tucan:'tucan.png'};
const audioBase='bird-sounds/';let active='tucan',currentAudio=null;
function playBirdSound(id){if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;currentAudio=null;}const file=audioFiles[id];if(!file)return;try{currentAudio=new Audio(audioBase+file);currentAudio.preload='auto';const result=currentAudio.play();if(result&&result.catch)result.catch(()=>{});}catch(_){}}
function apply(id,playSound){const p=palettes[id]||palettes.tucan;active=id;keys.forEach(k=>document.documentElement.style.setProperty('--bird-'+k,p[k]));document.documentElement.style.setProperty('--bird-success',p.secondary);document.documentElement.style.setProperty('--bird-danger',p.accent);document.documentElement.dataset.birdPalette=id;try{localStorage.setItem('dentistas-bird-palette',id);}catch(_){}document.querySelectorAll('[data-bird-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.birdPalette===id)));if(playSound)playBirdSound(id);}
function open(){const m=document.getElementById('paletteModal');if(m)m.hidden=false;}
function close(){const m=document.getElementById('paletteModal');if(m)m.hidden=true;}
function init(){try{active=localStorage.getItem('dentistas-bird-palette')||'tucan';}catch(_){}apply(active,false);const btn=document.getElementById('paletteOpen');if(btn)btn.addEventListener('click',open);const cb=document.getElementById('paletteClose');if(cb)cb.addEventListener('click',close);const modal=document.getElementById('paletteModal');if(modal)modal.addEventListener('click',e=>{if(e.target===modal)close();});const grid=document.getElementById('paletteGrid');if(grid){grid.innerHTML=Object.entries(palettes).map(([id,p])=>'<button type="button" class="paletteChoice" data-bird-palette="'+id+'" aria-pressed="false"><img class="paletteBirdIcon" src="birds/'+birdImages[id]+'" alt="'+p.name+'" loading="lazy"><span class="paletteChoiceInfo"><span class="paletteName">'+p.name+'</span><span class="paletteSwatches">'+keys.map(k=>'<i style="background:'+p[k]+'"></i>').join('')+'</span><span class="paletteHint">8 colores · escuchar canto</span></span></button>').join('');grid.addEventListener('click',e=>{const b=e.target.closest('[data-bird-palette]');if(b)apply(b.dataset.birdPalette,true);});}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.BirdPalettes={apply,list:()=>Object.entries(palettes).map(([id,p])=>({id,name:p.name,colors:keys.map(k=>p[k])}))};
})();
