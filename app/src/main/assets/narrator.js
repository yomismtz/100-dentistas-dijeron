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
    const prefix = lang.slice(0,2).toLowerCase();
    const exact = voices.find(v => String(v.lang||'').toLowerCase() === lang.toLowerCase());
    if (exact) return exact;
    const sameLanguage = voices.find(v => String(v.lang||'').toLowerCase().startsWith(prefix));
    if (sameLanguage) return sameLanguage;
    return voices.find(v => /female|mujer|sabina|paulina|zira|samantha|victoria|aria|jenny/i.test(v.name)) || voices[0] || null;
  }

  function speak(text, opts={}){
    if (!enabled || !text) return;
    const clean = String(text).replace(/<[^>]*>/g,' ').replace(/[×]/g,' times ').replace(/\s+/g,' ').trim();
    if (!clean) return;
    const lang = opts.lang || currentLang();

    try {
      if (window.AndroidNarrator && typeof window.AndroidNarrator.speak === 'function') {
        let ready = true;
        try { if (typeof window.AndroidNarrator.isReady === 'function') ready = !!window.AndroidNarrator.isReady(); } catch (_) {}
        if (ready) {
          window.AndroidNarrator.speak(clean, lang);
          return;
        }
      }
    } catch (_) {}

    if (!('speechSynthesis' in window)) return;
    if (opts.interrupt !== false) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang;
    const voice = chooseVoice(lang);
    if (voice) u.voice = voice;
    u.rate = opts.rate || 0.94;
    u.pitch = opts.pitch || 1.03;
    u.volume = opts.volume || 1;
    window.speechSynthesis.speak(u);
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

  return {speak,stop,toggle,setEnabled,isEnabled,refreshVoices,currentLang};
})();
