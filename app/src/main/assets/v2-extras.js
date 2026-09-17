'use strict';

showHelp=function(){
  openModal(`
    <h2>¿CÓMO SE JUEGA?</h2>
    <ol>
      <li>Dos equipos eligen nombre y personaje.</li>
      <li>Se juegan <b>6 rondas</b> con preguntas elegidas de toda la base.</li>
      <li>Cada ronda comienza con un <b>careo</b>. La respuesta de mayor valor obtiene el control y el equipo decide <b>JUGAR</b> o <b>PASAR</b>.</li>
      <li>Las respuestas pueden darse por <b>voz</b> o escribirse. Si la coincidencia es dudosa, decide el docente.</li>
      <li>El tiempo por respuesta es de <b>${v2TimerSeconds} segundos</b>. Al llegar a cero se marca un strike.</li>
      <li>Cada equipo puede acumular hasta <b>3 strikes</b>. Al tercero pierde el control.</li>
      <li>Si hay banco, el rival dispone de una respuesta para intentar el <b>robo</b>.</li>
      <li>Rondas 1–2 valen ×1, 3–4 valen ×2 y 5–6 valen ×3.</li>
      <li>Si terminan empatados, se activa una <b>muerte súbita</b>.</li>
      <li>El botón 🎓 abre el <b>modo docente</b>: pausa, fuentes, corrección de strikes, preguntas personalizadas y accesibilidad.</li>
    </ol>
    <p>Banco clínico: <b>${questionPool.length || 116} preguntas</b>.</p>
  `);
};

showMenu=function(){
  openModal(`
    <h2>MENÚ</h2>
    <div class="menuStack">
      <button id="v2Help">📋 Instrucciones</button>
      <button id="v2Teacher">🎓 Modo docente</button>
      <button id="v2SettingsBtn">⚙️ Accesibilidad</button>
      <button id="v2Info">📚 Explicación / fuente</button>
      <button id="v2Website">🌐 Sitio oficial</button>
      <button id="v2Privacy">🔒 Privacidad</button>
      <button id="v2New">🎲 Nueva partida</button>
      <button id="v2Home">⌂ Portada</button>
    </div>
  `);
  $('#v2Help').onclick=showHelp;
  $('#v2Teacher').onclick=v2TeacherMode;
  $('#v2SettingsBtn').onclick=v2Settings;
  $('#v2Info').onclick=v2QuestionInfo;
  $('#v2Website').onclick=()=>v2OpenUrl('https://yomismtz.github.io/100-dentistas-dijeron/');
  $('#v2Privacy').onclick=()=>v2OpenUrl('https://yomismtz.github.io/100-dentistas-dijeron/privacy.html');
  $('#v2New').onclick=()=>{ if(confirm('¿Terminar esta partida e iniciar otra con preguntas nuevas?')){closeModal(false);v2RoundHistory=[];startNewGame();} };
  $('#v2Home').onclick=()=>{closeModal(false);stopTimer();$('#game').classList.add('hidden');$('#home').classList.remove('hidden');};
};

$('#menu').onclick=showMenu;
$('#help').onclick=showHelp;
