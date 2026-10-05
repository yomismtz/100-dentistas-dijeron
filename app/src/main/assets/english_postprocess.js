/* Final English sentence normalization shared by the app and CI audit. */
(function(){
  function normalize(s){
    let x=String(s||'').replace(/\s+/g,' ').trim();
    x=x.replace(/\bwhat\s+what\b/gi,'what').replace(/\bwhich\s+which\b/gi,'which');
    x=x.replace(/\bof\s+of\b/gi,'of');
    x=x.replace(/^What\s+(?:what\s+)?statements\s+describen\s+correctly\s+(.+?)\?$/i,'Which statements correctly describe $1?');
    x=x.replace(/^What\s+(?:what\s+)?statements\s+describe\s+correctly\s+(.+?)\?$/i,'Which statements correctly describe $1?');
    x=x.replace(/^What\s+(?:what\s+)?of these aspects is part of\s+of\s+(.+?)\?$/i,'Which of these aspects is part of $1?');
    x=x.replace(/^What\s+(?:what\s+)?of these aspects is part of\s+(.+?)\?$/i,'Which of these aspects is part of $1?');
    x=x.replace(/\bdescriben\b/gi,'describe');
    x=x.replace(/\bnecesidad of\b/gi,'need for').replace(/\bno elimina todos the\b/gi,'does not eliminate all the');
    return x;
  }
  window.DentistasEnglishPostprocess=normalize;
})();
