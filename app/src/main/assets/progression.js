'use strict';
(function(){
  const style=document.createElement('style');
  style.textContent=`
    .progressionHero{padding:.9rem;border:1px solid #7b6330;border-radius:18px;background:linear-gradient(145deg,#111f31,#09141e);box-shadow:inset 0 1px #fff1,0 10px 28px #0006}
    .progressionHero h2{margin:.1rem 0 .35rem}
    .progressBar{height:14px;border-radius:99px;background:#071019;overflow:hidden;border:1px solid #36515d}
    .progressBar>span{display:block;height:100%;width:0;background:linear-gradient(90deg,#20b8c9,#e4b54d);transition:width .5s ease}
    .progressMeta{display:flex;justify-content:space-between;gap:1rem;margin-top:.4rem;font-weight:900}
    .collectionGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.55rem;max-height:54vh;overflow:auto;padding:.2rem}
    .collectionCard{position:relative;min-height:145px;padding:.35rem;border:1px solid #3b6974;border-radius:13px;background:#0b1d27;color:#fff;cursor:pointer;overflow:hidden}
    .collectionCard.unlocked{border-color:#c7a657;box-shadow:0 0 13px #c7a65722}
    .collectionCard.legendary{border-color:#a96bc9}
    .collectionCard img{display:block;width:100%;height:88px;object-fit:contain}
    .collectionCard.locked img{filter:grayscale(1) brightness(.25);opacity:.75}
    .collectionCard .cNum{position:absolute;top:4px;left:5px;font-size:.7rem;font-weight:900}
    .collectionCard .cLock{position:absolute;top:4px;right:5px}
    .collectionCard .cName{display:block;font-size:.66rem;font-weight:900;line-height:1.05}
    .collectionCard .cReq{display:block;margin-top:.2rem;font-size:.54rem;line-height:1.1;opacity:.72}
    .collectionLegend{display:flex;gap:.8rem;flex-wrap:wrap;margin:.55rem 0;font-size:.72rem;font-weight:800}
    .collectionLegend span{padding:.2rem .45rem;border-radius:8px;background:#102b35}
    .characterDetail{display:grid;grid-template-columns:130px 1fr;gap:.8rem;align-items:center}
    .characterDetail img{width:130px;height:150px;object-fit:contain}
    .characterDetail h3{margin:.1rem 0}
    .statRow{display:grid;grid-template-columns:1fr auto;gap:.5rem;margin:.22rem 0;font-size:.78rem}
    .miniBar{height:7px;background:#071019;border-radius:9px;overflow:hidden;grid-column:1/-1}
    .miniBar span{display:block;height:100%;width:0;background:#36bdc9}
    .unlockBurst{position:fixed;inset:0;z-index:120;display:grid;place-items:center;background:#031018cc;backdrop-filter:blur(4px);animation:unlockFade .9s ease-out both}
    .unlockBurst .burstCard{padding:1.2rem 1.6rem;border:2px solid #e5bd59;border-radius:22px;background:linear-gradient(145deg,#17243a,#09131e);text-align:center;box-shadow:0 0 50px #e5bd5944;animation:unlockPop .55s cubic-bezier(.2,1.5,.4,1) both}
    .unlockBurst img{width:190px;height:190px;object-fit:contain}
    @keyframes unlockPop{from{transform:scale(.55) rotate(-3deg);opacity:0}to{transform:none;opacity:1}}
    @keyframes unlockFade{0%,75%{opacity:1}100%{opacity:0;pointer-events:none}}
    @media(max-width:700px){.collectionGrid{grid-template-columns:repeat(3,minmax(0,1fr))}.characterDetail{grid-template-columns:95px 1fr}.characterDetail img{width:95px;height:120px}}
    @media(prefers-reduced-motion:reduce){.progressBar>span,.unlockBurst,.unlockBurst .burstCard{animation:none!important;transition:none}}
  `;
  document.head.appendChild(style);

  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const chars=()=>Array.isArray(window.DentistasCharacters)?window.DentistasCharacters:[];
  const unlocked=ch=>typeof window.DentistasCharacterUnlocked==='function'&&window.DentistasCharacterUnlocked(ch);
  const num=ch=>chars().indexOf(ch)+1;
  const progress=()=>{const all=chars().filter(c=>c.rarity==='ESPECIALISTA');return {all,done:all.filter(unlocked).length};};
  const label=ch=>typeof window.DentistasCharacterUnlockLabel==='function'?window.DentistasCharacterUnlockLabel(ch):'Progreso del juego';

  function render(){
    const {all,done}=progress(), total=chars().length;
    const pct=Math.round(done/all.length*100);
    const fp=typeof window.DentistasLoadFinalProgress==='function'?window.DentistasLoadFinalProgress():null;
    const finalWins=fp?.wins||0;
    const html=`
      <h2>🏆 PROGRESIÓN Y COLECCIÓN</h2>
      <div class="progressionHero">
        <div><b>Especialidades dominadas</b></div>
        <div class="progressBar"><span style="width:${pct}%"></span></div>
        <div class="progressMeta"><span>${done} / ${all.length}</span><span>${pct}%</span></div>
        <p style="margin:.5rem 0 0;opacity:.78">Colección: <b>${total} personajes</b> · Finales ganadas ≥300: <b>${finalWins}</b></p>
      </div>
      <div class="collectionLegend"><span>🦷 Especialista</span><span>🌟 Legendario</span><span>🔒 Bloqueado</span><span>🎓 Inicial</span></div>
      <div class="collectionGrid">
        ${chars().map(ch=>{
          const ok=unlocked(ch), n=num(ch), special=ch.rarity==='ESPECIALISTA', legendary=ch.rarity==='LEGENDARIO'||ch.rarity==='MÍTICO';
          return `<button type="button" class="collectionCard ${ok?'unlocked':'locked'} ${legendary?'legendary':''}" data-char="${esc(ch.name)}">
            <span class="cNum">#${n}</span><span class="cLock">${ok?'✓':'🔒'}</span>
            <img src="${esc(ch.image)}" alt="">
            <span class="cName">${esc(ch.name)}</span>
            <span class="cReq">${ok?'DESBLOQUEADO':esc(label(ch))}</span>
          </button>`;
        }).join('')}
      </div>
      <div class="menuStack"><button id="closeProgression">CERRAR</button></div>`;
    openModal(html);
    document.querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>detail(chars().find(c=>c.name===b.dataset.char)));
    $('#closeProgression').onclick=()=>closeModal(false);
  }

  function detail(ch){
    if(!ch)return;
    const ok=unlocked(ch);
    const stats=Array.isArray(ch.stats)?ch.stats:[];
    openModal(`
      <h2>${ok?'🦷':'🔒'} ${esc(ch.name)}</h2>
      <div class="characterDetail">
        <img src="${esc(ch.image)}" alt="">
        <div>
          <h3>${esc(ch.category||ch.specialty)}</h3>
          <p style="margin:.25rem 0"><b>${esc(ch.role)}</b></p>
          <p style="opacity:.78">${ok?'Personaje desbloqueado.':esc(label(ch))}</p>
          ${stats.map(([name,value])=>`<div class="statRow"><span>${esc(name)}</span><b>${Number(value)||0}/5</b><div class="miniBar"><span style="width:${Math.min(100,(Number(value)||0)*20)}%"></span></div></div>`).join('')}
        </div>
      </div>
      <div class="menuStack"><button id="backCollection">← COLECCIÓN</button></div>`);
    $('#backCollection').onclick=render;
  }

  function burst(ch){
    if(!ch)return;
    const old=document.querySelector('.unlockBurst');if(old)old.remove();
    const el=document.createElement('div');el.className='unlockBurst';
    el.innerHTML=`<div class="burstCard"><div style="font-weight:900;letter-spacing:.12em">🔓 PERSONAJE DESBLOQUEADO</div><img src="${esc(ch.image)}" alt=""><h2>${esc(ch.name)}</h2><p>${esc(ch.category||ch.specialty)}</p></div>`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),950);
  }

  window.DentistasShowProgression=render;
  window.DentistasShowCharacterUnlock=burst;

  document.addEventListener('click',e=>{
    if(e.target.closest('#progression'))render();
  });

  window.addEventListener('dentistas-character-progress',()=>{});
  const oldRecord=window.DentistasRecordFinalResult;
  window.DentistasRecordFinalResult=function(data){
    const before=new Set((typeof window.DentistasCharacters==='object'?chars():[]).filter(unlocked).map(c=>c.name));
    const result=typeof oldRecord==='function'?oldRecord(data):{unlocked:[]};
    const newly=(result.unlocked||[]).map(n=>chars().find(c=>c.name===n)).filter(c=>c&&!before.has(c.name));
    setTimeout(()=>newly.forEach(burst),80);
    return result;
  };
})();