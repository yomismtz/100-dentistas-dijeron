'use strict';

// Intercepta exclusivamente los bancos de preguntas cuando la app corre
// dentro del WebView Android. Esto evita los bloqueos de fetch(file://...).
(function installQuestionAssetLoader() {
  const originalFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;
  const questionFile = /^questions(?:_[a-z0-9_]+)?\.json$/i;

  window.fetch = function dentistasFetch(input, init) {
    const requested = typeof input === 'string' ? input : (input && input.url) || '';
    const cleanName = requested.split('?')[0].split('#')[0].split('/').pop();

    if (questionFile.test(cleanName) && window.Android && typeof Android.getAssetText === 'function') {
      try {
        const text = Android.getAssetText(cleanName);
        if (text) {
          const parsed = JSON.parse(text);
          return Promise.resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            url: requested,
            json: () => Promise.resolve(parsed),
            text: () => Promise.resolve(text)
          });
        }
      } catch (error) {
        console.error('No se pudo leer el banco nativo:', cleanName, error);
      }
    }

    if (originalFetch) return originalFetch(input, init);
    return Promise.reject(new Error('fetch no disponible para ' + requested));
  };

  window.__DENTISTAS_NATIVE_QUESTION_LOADER__ = true;
})();
