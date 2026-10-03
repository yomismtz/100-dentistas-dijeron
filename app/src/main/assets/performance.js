/* Mejora 5 — rendimiento del WebView */
(function(){
  'use strict';

  const loadedCharacterImages = new Set();
  const cleanups = new Set();

  function preloadCharacter(src){
    if (!src || loadedCharacterImages.has(src)) return;
    loadedCharacterImages.add(src);
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }

  function preloadCurrentCharacter(){
    try {
      const ch = window.currentCharacter || window.selectedCharacter;
      const src = ch && (ch.image || ch.img || ch.path);
      if (src) preloadCharacter(src);
    } catch (_) {}
  }

  function cleanupRoundResources(){
    // Limpia solo callbacks registrados por este módulo; no toca la lógica de juego.
    cleanups.forEach(fn => { try { fn(); } catch (_) {} });
    cleanups.clear();
  }

  function memoryCheck(){
    try {
      const mem = performance.memory;
      if (!mem || !mem.jsHeapSizeLimit) return;
      const ratio = mem.usedJSHeapSize / mem.jsHeapSizeLimit;
      if (ratio >= 0.85) {
        window.dispatchEvent(new CustomEvent('dentistas-memory-warning', {
          detail: { used: mem.usedJSHeapSize, limit: mem.jsHeapSizeLimit, ratio }
        }));
      }
    } catch (_) {}
  }

  window.DentistasPerformance = {
    preloadCharacter,
    preloadCurrentCharacter,
    cleanupRoundResources,
    memoryCheck
  };

  window.addEventListener('dentistas-round-shown', preloadCurrentCharacter);
  window.addEventListener('dentistas-round-finished', cleanupRoundResources);
  window.addEventListener('dentistas-memory-check', memoryCheck);

  // El diagnóstico se ejecuta al cambiar de ronda; no mantenemos un temporizador permanente.
})();