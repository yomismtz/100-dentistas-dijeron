'use strict';

window.DentistasNarrator = (() => {
  const STORAGE_KEY = 'dentistas-narrator-enabled';
  let enabled = localStorage.getItem(STORAGE_KEY) !== 'false';
  let voices = [];

  function refreshVoices(){
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  }
  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }

  function currentLang(){
    return window.DentistasI18n?.getLang?.() === 'en' ? 'en-US' : 'es-MX';
  }

  function chooseVoice(lang){
    if (!voices.length) refreshVoices();
    const wanted = String(lang || currentLang()).toLowerCase();
    const prefix = wanted.slice(0,2);
    const candidates = voices.filter(v => String(v.lang||'').toLowerCase().startsWith(prefix));
    if (!candidates.length) return voices[0] || null;
    const score = voice => {
      const locale = String(voice.lang||'').toLowerCase();
      const region = locale.split('-')[1] || '';
      const name = String(voice.name||'').toLowerCase();
      let points = 0;
      if (region === 'mx') points += 520;
      else if (/^(419|us|ar|bo|cl|co|cr|cu|do|ec|sv|gt|hn|ni|pa|py|pe|pr|uy|ve)$/i.test(region)) points += 360;
      else if (region === 'es') points -= 700;
      else if (!region) points += 40;
      if (locale === wanted) points += 120;
      if (/female|feminine|mujer|sabina|paulina|zira|samantha|victoria|aria|jenny/i.test(name)) points += 70;
      if (voice.localService === false) points += 20;
      return points;
    };
    return candidates.reduce((best, voice) => !best || score(voice) > score(best) ? voice : best, null);
  }

  function speak(text, opts={}){
    if (!enabled || !text) return false;
    const lang = opts.lang || currentLang();
    const multiplierWord = String(lang).toLowerCase().startsWith('en') ? ' times ' : ' por ';
    const clean = String(text).replace(/<[^>]*>/g,' ').replace(/[×]/g,multiplierWord).replace(/\s+/g,' ').trim();
    if (!clean) return false;

    try {
      if (window.AndroidNarrator && typeof window.AndroidNarrator.speak === 'function') {
        let ready = true;
        try { if (typeof window.AndroidNarrator.isReady === 'function') ready = !!window.AndroidNarrator.isReady(); } catch (_) {}
        if (ready) {
          const id = `js-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          if (opts.onend || opts.onerror) {
            window.DentistasNarratorCallbacks = window.DentistasNarratorCallbacks || {};
            window.DentistasNarratorCallbacks[id] = {onend:opts.onend, onerror:opts.onerror};
          }
          window.AndroidNarrator.speakWithId(clean, lang, id, Number.isFinite(Number(opts.rate)) ? Number(opts.rate) : 0.90, Number.isFinite(Number(opts.pitch)) ? Number(opts.pitch) : 1.0);
          return true;
        }
      }
    } catch (_) {}

    if (!('speechSynthesis' in window)) return false;
    if (opts.interrupt !== false) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang;
    const voice = chooseVoice(lang);
    if (voice) u.voice = voice;
    u.rate = Math.max(0.82, Math.min(1.05, Number.isFinite(Number(opts.rate)) ? Number(opts.rate) : 0.90));
    u.pitch = Math.max(0.90, Math.min(1.10, Number.isFinite(Number(opts.pitch)) ? Number(opts.pitch) : 1.0));
    u.volume = Math.max(0, Math.min(1, Number.isFinite(Number(opts.volume)) ? Number(opts.volume) : 1));
    if (opts.onend) u.onend = opts.onend;
    if (opts.onerror) u.onerror = opts.onerror;
    window.speechSynthesis.speak(u);
    return true;
  }

  function stop(){
    try { if (window.AndroidNarrator && typeof window.AndroidNarrator.stop === 'function') window.AndroidNarrator.stop(); } catch (_) {}
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function updateButton(){
    const b=document.querySelector('#voiceToggle');
    if(!b) return;
    const en=window.DentistasI18n?.getLang?.()==='en';
    b.textContent = enabled ? '🔊' : '🔇';
    b.title = enabled ? (en?'Narrator on':'Narradora activada') : (en?'Narrator off':'Narradora desactivada');
    b.setAttribute('aria-label',b.title);
    b.classList.toggle('off',!enabled);
  }

  function setEnabled(value){
    enabled=!!value;
    localStorage.setItem(STORAGE_KEY,String(enabled));
    if(!enabled) stop();
    updateButton();
    if(enabled) speak(window.DentistasI18n?.getLang?.()==='en'?'Narrator on':'Narradora activada');
  }

  function toggle(){ setEnabled(!enabled); }
  function isEnabled(){ return enabled; }

  document.addEventListener('DOMContentLoaded',()=>{
    const b=document.querySelector('#voiceToggle');
    if(b) b.addEventListener('click',toggle);
    updateButton();
  });
  window.addEventListener('dentistas-language-changed',()=>{
    updateButton();
    if(enabled) speak(window.DentistasI18n?.getLang?.()==='en'?'English selected':'Español seleccionado');
  });

  function nativeFinished(id, ok=true){
    const cb=window.DentistasNarratorCallbacks?.[id];
    if(!cb) return;
    delete window.DentistasNarratorCallbacks[id];
    try { (ok ? cb.onend : cb.onerror)?.(); } catch (_) {}
  }

  return {speak,stop,toggle,setEnabled,isEnabled,refreshVoices,currentLang,nativeFinished};
})();
