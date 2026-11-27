/* 12 paletas de aves: exactamente 8 colores por paleta. */
(function(){
'use strict';
const palettes={
 agaporni:{name:'Agapornis',primary:'#287347',secondary:'#8BCB45',accent:'#F08A32',background:'#F4FAEF',surface:'#FFFFFF',text:'#243B2C',muted:'#66806D',border:'#C8E2B5'},
 'buho-real':{name:'Búho real',primary:'#59402C',secondary:'#A77B4D',accent:'#D5B66A',background:'#F8F4EC',surface:'#FFFFFF',text:'#352B22',muted:'#807365',border:'#E1D2B9'},
 colibri:{name:'Colibrí',primary:'#075C69',secondary:'#18A99B',accent:'#B7D93B',background:'#F0FAF8',surface:'#FFFFFF',text:'#16373A',muted:'#66858A',border:'#B8E2D9'},
 cuervo:{name:'Cuervo',primary:'#252936',secondary:'#515A6B',accent:'#7664A8',background:'#F2F3F7',surface:'#FFFFFF',text:'#242733',muted:'#737887',border:'#D0D3DD'},
 faisan:{name:'Faisán',primary:'#75412D',secondary:'#35634A',accent:'#C78A35',background:'#FAF4EC',surface:'#FFFFFF',text:'#392B24',muted:'#847064',border:'#E5CDB4'},
 gallo:{name:'Gallo',primary:'#9E2934',secondary:'#E2A52F',accent:'#273C32',background:'#FFF8ED',surface:'#FFFFFF',text:'#3C2925',muted:'#85706A',border:'#EBD3B5'},
 'guacamaya-roja':{name:'Guacamaya roja',primary:'#B52832',secondary:'#E97925',accent:'#F3C83F',background:'#FFF6ED',surface:'#FFFFFF',text:'#482B26',muted:'#896E62',border:'#F0C8A7'},
 'guacamayo-azul':{name:'Guacamayo azul',primary:'#1556A3',secondary:'#18A6C7',accent:'#F1C43C',background:'#F0F8FC',surface:'#FFFFFF',text:'#1B3045',muted:'#6C8292',border:'#BBD8EA'},
 ninfa:{name:'Ninfa',primary:'#665F57',secondary:'#A7A49A',accent:'#E99A35',background:'#F7F6F1',surface:'#FFFFFF',text:'#35332F',muted:'#817E75',border:'#DDD9CE'},
 'pavo-real':{name:'Pavo real',primary:'#164C77',secondary:'#078B83',accent:'#C5A34A',background:'#F1F8F8',surface:'#FFFFFF',text:'#203746',muted:'#6D838A',border:'#C0DCD9'},
 quetzal:{name:'Quetzal',primary:'#12664F',secondary:'#1C9B83',accent:'#C9A64A',background:'#F0F8F2',surface:'#FFFFFF',text:'#1F3B32',muted:'#6B8378',border:'#BBDCC9'},
 tucan:{name:'Tucán',primary:'#35105E',secondary:'#12AFAE',accent:'#A8E600',background:'#F7F5FB',surface:'#FFFFFF',text:'#26183A',muted:'#756A83',border:'#D8C9E8'}
};
const keys=['primary','secondary','accent','background','surface','text','muted','border'];
const audioFiles={agaporni:'agaporni.mp3','buho-real':'buho-real.mp3',colibri:'colibri.mp3',cuervo:'cuervo.mp3',faisan:'faisan.mp3',gallo:'gallo.mp3','guacamaya-roja':'guacamaya-roja.mp3','guacamayo-azul':'guacamayo-azul.mp3',ninfa:'ninfa.mp3','pavo-real':'pavo-real.mp3',quetzal:'quetzal.mp3',tucan:'tucan.mp3'};
const audioBase='bird-sounds/';let active='tucan',currentAudio=null;
function playBirdSound(id){
 if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;currentAudio=null;}
 const file=audioFiles[id];if(!file)return;
 try{currentAudio=new Audio(audioBase+file);currentAudio.preload='auto';const result=currentAudio.play();if(result&&result.catch)result.catch(()=>{});}catch(_){}
}
function apply(id,playSound){
 const p=palettes[id]||palettes.tucan;active=id;
 keys.forEach(k=>document.documentElement.style.setProperty('--bird-'+k,p[k]));
 /* Estados semánticos reutilizan colores de la paleta: no agregan colores novenos. */
 document.documentElement.style.setProperty('--bird-success',p.secondary);
 document.documentElement.style.setProperty('--bird-danger',p.accent);
 document.documentElement.dataset.birdPalette=id;
 try{localStorage.setItem('dentistas-bird-palette',id);}catch(_){}
 document.querySelectorAll('[data-bird-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.birdPalette===id)));
 if(playSound)playBirdSound(id);
}
function open(){const m=document.getElementById('paletteModal');if(m)m.hidden=false;}
function close(){const m=document.getElementById('paletteModal');if(m)m.hidden=true;}
function init(){
 try{active=localStorage.getItem('dentistas-bird-palette')||'tucan';}catch(_){}
 apply(active,false);
 const btn=document.getElementById('paletteOpen');if(btn)btn.addEventListener('click',open);
 const cb=document.getElementById('paletteClose');if(cb)cb.addEventListener('click',close);
 const modal=document.getElementById('paletteModal');if(modal)modal.addEventListener('click',e=>{if(e.target===modal)close();});
 const grid=document.getElementById('paletteGrid');
 if(grid){grid.innerHTML=Object.entries(palettes).map(([id,p])=>'<button type="button" class="paletteChoice" data-bird-palette="'+id+'" aria-pressed="false"><span class="paletteSwatches">'+keys.map(k=>'<i style="background:'+p[k]+'"></i>').join('')+'</span><span><span class="paletteName">'+p.name+'</span><br><span class="paletteHint">8 colores · escuchar canto</span></span></button>').join('');grid.addEventListener('click',e=>{const b=e.target.closest('[data-bird-palette]');if(b)apply(b.dataset.birdPalette,true);});}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.BirdPalettes={apply,list:()=>Object.entries(palettes).map(([id,p])=>({id,name:p.name,colors:keys.map(k=>p[k])}))};
})();