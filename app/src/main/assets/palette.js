/* Selector de paletas inspiradas en aves. Cada tema define exactamente 10 colores. */
(function(){
'use strict';
const palettes={
 tucan:{name:'Tucán',primary:'#35105E',secondary:'#12AFAE',accent:'#A8E600',background:'#F7F5FB',surface:'#FFFFFF',text:'#26183A',muted:'#756A83',border:'#D8C9E8',success:'#DDF4E9',danger:'#C83D5A'},
 guacamaya:{name:'Guacamaya',primary:'#A51D32',secondary:'#087E8B',accent:'#F4B400',background:'#FFF8F0',surface:'#FFFFFF',text:'#38212A',muted:'#866C70',border:'#F0C8B8',success:'#DDF2E2',danger:'#B42332'},
 colibri:{name:'Colibrí',primary:'#145B75',secondary:'#13A89E',accent:'#B6D936',background:'#F1FAF8',surface:'#FFFFFF',text:'#16343B',muted:'#668087',border:'#BDE5DE',success:'#D9F2E6',danger:'#C34D67'},
 flamingo:{name:'Flamenco',primary:'#9D315F',secondary:'#E887A8',accent:'#F4C95D',background:'#FFF5F8',surface:'#FFFFFF',text:'#48283A',muted:'#8B687A',border:'#F1C7D8',success:'#E1F1E5',danger:'#B92E4C'},
 cardenal:{name:'Cardenal',primary:'#8F1D2C',secondary:'#365C48',accent:'#D6AD58',background:'#FAF7F0',surface:'#FFFFFF',text:'#302A26',muted:'#7B7167',border:'#E5D8C2',success:'#E2F0E4',danger:'#B42332'},
 martin:{name:'Martín pescador',primary:'#075A78',secondary:'#00A6A6',accent:'#F0A83A',background:'#F1F9FC',surface:'#FFFFFF',text:'#183440',muted:'#66808C',border:'#BBDCE7',success:'#DDF2E9',danger:'#C33B50'},
 pavo:{name:'Pavo real',primary:'#173F78',secondary:'#087F82',accent:'#9B6ACB',background:'#F4F6FC',surface:'#FFFFFF',text:'#202C45',muted:'#6D7890',border:'#C9D4EA',success:'#DDF1E8',danger:'#C4475A'},
 canario:{name:'Canario',primary:'#76520A',secondary:'#D9A900',accent:'#4D9B61',background:'#FFFBEB',surface:'#FFFFFF',text:'#3C321A',muted:'#82764F',border:'#E9DCA9',success:'#E4F3D9',danger:'#BD3E42'},
 lechuza:{name:'Lechuza',primary:'#55433A',secondary:'#A58A6A',accent:'#7C9A78',background:'#F8F5F0',surface:'#FFFFFF',text:'#302B27',muted:'#81766C',border:'#DED3C4',success:'#E4F0E2',danger:'#B84A4A'},
 pinguino:{name:'Pingüino',primary:'#243B53',secondary:'#5C9EAD',accent:'#E7B95C',background:'#F2F7FA',surface:'#FFFFFF',text:'#1D2A35',muted:'#697B89',border:'#C9D9E2',success:'#DDEFE7',danger:'#BE4653'}
};
const keys=['primary','secondary','accent','background','surface','text','muted','border','success','danger'];
const audioBase='bird-sounds/';
let active='tucan';
function apply(id,playSound){
 const p=palettes[id]||palettes.tucan;active=id;
 const root=document.documentElement;
 keys.forEach(k=>root.style.setProperty('--bird-'+k,p[k]));
 root.dataset.birdPalette=id;
 try{localStorage.setItem('dentistas-bird-palette',id);}catch(_){}
 document.querySelectorAll('[data-bird-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.birdPalette===id)));
 if(playSound){
   const a=new Audio(audioBase+id+'.mp3');a.preload='auto';
   a.play().catch(()=>{});
 }
}
function open(){
 const modal=document.getElementById('paletteModal');if(!modal)return;
 modal.hidden=false;
}
function close(){const m=document.getElementById('paletteModal');if(m)m.hidden=true;}
function init(){
 try{active=localStorage.getItem('dentistas-bird-palette')||'tucan';}catch(_){}
 apply(active,false);
 const btn=document.getElementById('paletteOpen');if(btn)btn.addEventListener('click',open);
 const closeBtn=document.getElementById('paletteClose');if(closeBtn)closeBtn.addEventListener('click',close);
 const modal=document.getElementById('paletteModal');
 if(modal)modal.addEventListener('click',e=>{if(e.target===modal)close();});
 const grid=document.getElementById('paletteGrid');
 if(grid){
   grid.innerHTML=Object.entries(palettes).map(([id,p])=>'<button type="button" class="paletteChoice" data-bird-palette="'+id+'" aria-pressed="false"><span class="paletteSwatches">'+[p.primary,p.secondary,p.accent,p.background,p.border].map(c=>'<i style="background:'+c+'"></i>').join('')+'</span><span><span class="paletteName">'+p.name+'</span><br><span class="paletteHint">10 colores · sonido del ave</span></span></button>').join('');
   grid.addEventListener('click',e=>{const b=e.target.closest('[data-bird-palette]');if(!b)return;apply(b.dataset.birdPalette,true);});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.BirdPalettes={apply,list:()=>Object.entries(palettes).map(([id,p])=>({id,name:p.name,colors:keys.map(k=>p[k])}))};
})();