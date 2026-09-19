'use strict';

const V3_ACADEMIC_VERSION='3.0.1-academic';
const V3_ASSESS_KEY='dentistas-v3-assessments';
const V3_CASES_KEY='dentistas-v3-case-series';
const V3_MEDIA_SETTINGS='dentistas-v3-media-settings';

const V3_MEDIA_ASSETS=[
  {id:'tooth_anatomy',name:'Anatomía dental esquemática',src:'media/tooth_anatomy.svg',note:'Esquema educativo; no diagnóstico.'},
  {id:'tooth_surfaces',name:'Superficies dentales',src:'media/tooth_surfaces.svg',note:'Vestibular, lingual/palatina, mesial, distal y oclusal.'},
  {id:'canal_schematic',name:'Conductos radiculares esquemáticos',src:'media/canal_schematic.svg',note:'Esquema educativo; no representa una radiografía.'}
];
let v3AcademicSettings={imageMode:'together'};
try{v3AcademicSettings={...v3AcademicSettings,...JSON.parse(localStorage.getItem(V3_MEDIA_SETTINGS)||'{}')};}catch(_){}
let v3Assessment=null;
let v3PendingImageQuestion=null;
window.v3RemoteQuestionOverride=null;

function v3AssessmentHistory(){try{return JSON.parse(localStorage.getItem(V3_ASSESS_KEY)||'[]');}catch(_){return [];}}
function v3SaveAssessment(x){const a=v3AssessmentHistory();a.unshift(x);localStorage.setItem(V3_ASSESS_KEY,JSON.stringify(a.slice(0,100)));}

function v3AssessmentBlueprint(q){
  return {
    q:q.q,
    specialty:q.specialty||q.cat||'',
    subtopic:q.subtopic||'',
    difficulty:q.difficulty||(typeof spDifficultyOf==='function'?spDifficultyOf(q):'')
  };
}
function v3MatchedPostQuestions(pool,pre,n){
  const used=new Set((pre.questions||[]).map(x=>x.q));
  const selected=[];
  for(const bp of (pre.blueprint||[])){
    let candidates=pool.filter(q=>!used.has(q.q)&&!selected.includes(q)&&
      (bp.subtopic?String(q.subtopic||'')===String(bp.subtopic):true)&&
      (bp.difficulty?String(q.difficulty||(typeof spDifficultyOf==='function'?spDifficultyOf(q):''))===String(bp.difficulty):true));
    if(!candidates.length)candidates=pool.filter(q=>!used.has(q.q)&&!selected.includes(q)&&
      (bp.difficulty?String(q.difficulty||(typeof spDifficultyOf==='function'?spDifficultyOf(q):''))===String(bp.difficulty):true));
    if(!candidates.length)candidates=pool.filter(q=>!used.has(q.q)&&!selected.includes(q));
    if(candidates.length)selected.push(candidates[Math.floor(Math.random()*candidates.length)]);
  }
  while(selected.length<n){
    const rest=pool.filter(q=>!used.has(q.q)&&!selected.includes(q));
    if(!rest.length)break;
    selected.push(rest[Math.floor(Math.random()*rest.length)]);
  }
  return selected.slice(0,n);
}
function v3AssessmentSetup(){
  openModal('<h2>📝 PRETEST / POSTEST</h2><p>Los estudiantes pueden responder desde el mismo QR de “Respuesta individual”. No se guardan nombres. El postest intenta usar reactivos diferentes pero equivalentes por subtema y dificultad al pretest más reciente del grupo.</p><label class="settingRow">Momento <select id="v3AssessType"><option value="pre">PRETEST</option><option value="post">POSTEST</option></select></label><label class="settingRow">Número de preguntas <select id="v3AssessN"><option>5</option><option>10</option></select></label><button id="v3AssessStart" class="setupStart">INICIAR</button>');
  $('#v3AssessStart').onclick=()=>{
    const type=$('#v3AssessType').value,n=Number($('#v3AssessN').value);
    const group=typeof offlineSettings!=='undefined'?(offlineSettings.group||'Sin grupo'):'Sin grupo';
    const specialty=typeof spSpecialtyName==='function'?spSpecialtyName():'General';
    let pool=(typeof v3ActivePack==='function'&&v3ActivePack())?v3PackPool(v3ActivePack()):(typeof spBank==='function'?spBank(typeof specialtySelected==='string'?specialtySelected:'general'):[...questionPool]);
    pool=pool.filter(q=>!q.disabled);
    let selected;
    if(type==='post'){
      const pre=v3AssessmentHistory().find(x=>x.group===group&&x.specialty===specialty&&x.type==='pre');
      selected=pre?v3MatchedPostQuestions(pool,pre,n):shuffle(pool).slice(0,n);
    }else selected=shuffle(pool).slice(0,n);
    if(selected.length<n){alert('No hay suficientes preguntas disponibles.');return;}
    v3Assessment={type,questions:selected,index:0,responses:[],started:new Date().toISOString(),blueprint:selected.map(v3AssessmentBlueprint)};
    v3AssessmentShow();
  };
}
function v3AssessmentShow(){
  const a=v3Assessment;if(!a)return;
  if(a.index>=a.questions.length)return v3AssessmentFinish();
  const q=a.questions[a.index];
  window.v3RemoteQuestionOverride=q;
  a.current={q:q.q,total:0,correct:0,answers:[]};
  openModal('<h2>📝 '+a.type.toUpperCase()+' · '+(a.index+1)+' / '+a.questions.length+'</h2><p class="assessmentQuestion">'+v2Escape(q.q)+'</p><div class="examCount"><b id="v3AssessCount">0</b><span> respuestas recibidas</span></div><p>Los estudiantes responden desde el QR individual. Cuando estén listos, cierra esta pregunta.</p><button id="v3AssessNext" class="setupStart">CERRAR PREGUNTA ▶</button>');
  $('#v3AssessNext').onclick=()=>{a.responses.push(a.current);a.index++;v3AssessmentShow();};
  if(typeof orSync==='function')orSync();
}
function v3AssessmentFinish(){
  const a=v3Assessment;if(!a)return;
  window.v3RemoteQuestionOverride=null;
  const total=a.responses.reduce((s,r)=>s+r.total,0),correct=a.responses.reduce((s,r)=>s+r.correct,0);
  const group=typeof offlineSettings!=='undefined'?(offlineSettings.group||'Sin grupo'):'Sin grupo';
  const record={date:new Date().toISOString(),type:a.type,group,specialty:typeof spSpecialtyName==='function'?spSpecialtyName():'General',researchCode:typeof v3Settings!=='undefined'?v3Settings.researchCode||'':'',questions:a.responses,blueprint:a.blueprint||[],total,correct,percent:total?Math.round(correct/total*100):0};
  v3SaveAssessment(record);v3Assessment=null;
  openModal('<h2>📊 '+record.type.toUpperCase()+' TERMINADO</h2><p><b>'+record.correct+' / '+record.total+'</b> respuestas correctas · <b>'+record.percent+'%</b>.</p><button id="v3AssessCompare" class="setupStart">COMPARAR PRE / POST</button>');
  $('#v3AssessCompare').onclick=v3AssessmentCompare;
  if(typeof orSync==='function')orSync();
}
const v3PrevRemoteExam=window.onRemoteExamAnswer;
window.onRemoteExamAnswer=function(answer){
  if(v3Assessment&&v3Assessment.current){
    const q=v3Assessment.questions[v3Assessment.index],m=v2Match(String(answer||''),q);
    v3Assessment.current.total++;
    if(m&&m.score>=.84)v3Assessment.current.correct++;
    v3Assessment.current.answers.push({answer:String(answer||'').slice(0,100),correct:!!(m&&m.score>=.84)});
    const c=$('#v3AssessCount');if(c)c.textContent=v3Assessment.current.total;
    return;
  }
  if(typeof v3PrevRemoteExam==='function')v3PrevRemoteExam(answer);
};
function v3AssessmentCompare(){
  const h=v3AssessmentHistory(),group=typeof offlineSettings!=='undefined'?(offlineSettings.group||'Sin grupo'):'Sin grupo';
  const pre=h.find(x=>x.group===group&&x.type==='pre'),post=h.find(x=>x.group===group&&x.type==='post');
  openModal('<h2>📈 PRETEST vs POSTEST</h2><p><b>Grupo:</b> '+v2Escape(group)+'</p><div class="academicCards"><div><b>'+(pre?pre.percent+'%':'—')+'</b><span>Pretest</span></div><div><b>'+(post?post.percent+'%':'—')+'</b><span>Postest</span></div><div><b>'+(pre&&post?((post.percent-pre.percent)>=0?'+':'')+(post.percent-pre.percent)+' pp':'—')+'</b><span>Cambio</span></div><div><b>'+(pre&&post?pre.total+' / '+post.total:'—')+'</b><span>Respuestas</span></div></div>');
}

function v3Quality(q){
  if(!q||q.disabled||!q.source)return {level:'red',label:'🔴 NO UTILIZAR / REVISAR'};
  const e=String(q.editorialStatus||'').toLowerCase();
  if(e.includes('pendiente')||e.includes('actualizar')||!q.reviewedAt||!q.reviewer||!q.questionVersion)return {level:'yellow',label:'🟡 REVISIÓN PENDIENTE'};
  return {level:'green',label:'🟢 VERIFICADA'};
}
function v3QualityDashboard(){
  const all=questionPool||[],counts={green:0,yellow:0,red:0};
  all.forEach(q=>counts[v3Quality(q).level]++);
  openModal('<h2>🚦 CALIDAD DEL BANCO</h2><div class="academicCards"><div><b>'+counts.green+'</b><span>🟢 Verificadas</span></div><div><b>'+counts.yellow+'</b><span>🟡 Pendientes</span></div><div><b>'+counts.red+'</b><span>🔴 Revisar</span></div><div><b>'+all.length+'</b><span>Total</span></div></div><button id="v3Problems" class="setupStart">⚠ DETECTAR PREGUNTAS PROBLEMÁTICAS</button>');
  $('#v3Problems').onclick=v3ProblemQuestions;
}

function v3GroupReportsRaw(){try{return JSON.parse(localStorage.getItem('dentistas-group-reports-v2')||'[]');}catch(_){return [];}}
function v3ProblemStats(){
  const m={};
  v3GroupReportsRaw().forEach(s=>(s.questions||[]).forEach(q=>{
    const k=q.q||q.question;if(!k)return;
    if(!m[k])m[k]={q:k,uses:0,strikes:0,noHit:0,specialty:q.specialty||'',subtopic:q.subtopic||''};
    m[k].uses++;m[k].strikes+=Number(q.strikes||0);if(!(q.correct||[]).length)m[k].noHit++;
  }));
  return Object.values(m).map(x=>({...x,errorRate:x.uses?x.noHit/x.uses:0})).sort((a,b)=>(b.errorRate-b.errorRate)||(b.strikes-b.strikes));
}
function v3ApplyProblemFlags(flagged){
  let overrides={};try{overrides=JSON.parse(localStorage.getItem('dentistas-question-overrides-v2')||'{}');}catch(_){}
  const flaggedSet=new Set(flagged.map(x=>x.q));
  (questionPool||[]).forEach(q=>{
    const key=q._overrideKey||q.q;
    if(flaggedSet.has(q.q)){
      const stats=flagged.find(x=>x.q===q.q);
      q.autoFlag='⚠ REVISAR';
      q.autoFlagReason=Math.round((stats?.errorRate||0)*100)+'% sin acierto en '+(stats?.uses||0)+' usos';
      overrides[key]={...(overrides[key]||{}),autoFlag:q.autoFlag,autoFlagReason:q.autoFlagReason};
    }else if(q.autoFlag==='⚠ REVISAR'){
      delete q.autoFlag;delete q.autoFlagReason;
      if(overrides[key]){delete overrides[key].autoFlag;delete overrides[key].autoFlagReason;}
    }
  });
  localStorage.setItem('dentistas-question-overrides-v2',JSON.stringify(overrides));
}
function v3ProblemQuestions(){
  const flagged=v3ProblemStats().filter(x=>x.uses>=3&&(x.errorRate>=.5||x.strikes/x.uses>=1.5));
  v3ApplyProblemFlags(flagged);
  openModal('<h2>⚠ REACTIVOS PARA REVISAR</h2><p>Se marcan por comportamiento observado; esto no significa automáticamente que estén mal redactados.</p><div class="searchResults">'+
    (flagged.map((x,i)=>'<button data-problem="'+i+'"><b>'+Math.round(x.errorRate*100)+'% sin acierto · '+x.uses+' usos</b><span>'+v2Escape(x.q)+'</span></button>').join('')||'<p>No hay suficientes datos para marcar reactivos todavía.</p>')+
    '</div>');
  document.querySelectorAll('[data-problem]').forEach(b=>b.onclick=()=>{const x=flagged[Number(b.dataset.problem)],q=questionPool.find(z=>z.q===x.q);if(q)v3PreviewQuestion(q);});
}

function v3Analytics(){
  const reports=v3GroupReportsRaw(),map={};
  reports.forEach(s=>(s.questions||[]).forEach(q=>{
    const spec=q.specialty||s.specialty||'General',sub=q.subtopic||'Sin subtema',key=spec+'||'+sub;
    if(!map[key])map[key]={spec,sub,n:0,hits:0,strikes:0};
    map[key].n++;if((q.correct||[]).length)map[key].hits++;map[key].strikes+=Number(q.strikes||0);
  }));
  const rows=Object.values(map).sort((a,b)=>(a.spec.localeCompare(b.spec)||a.sub.localeCompare(b.sub)));
  openModal('<h2>📊 ESTADÍSTICAS POR SUBTEMA</h2><div class="analyticsTable"><div><b>Área</b><b>Subtema</b><b>N</b><b>Acierto</b><b>X</b></div>'+
    rows.map(r=>'<div><span>'+v2Escape(r.spec)+'</span><span>'+v2Escape(r.sub)+'</span><span>'+r.n+'</span><span>'+Math.round(r.hits/r.n*100)+'%</span><span>'+r.strikes+'</span></div>').join('')+
    '</div>');
}

function v3SearchQuestions(){
  openModal('<h2>🔎 BUSCAR EN EL BANCO</h2><input id="v3SearchInput" class="wideInput" placeholder="MTA, Frankl, Angle, fluoruro…"><div id="v3SearchOut" class="searchResults"></div>');
  const input=$('#v3SearchInput'),out=$('#v3SearchOut');
  const render=()=>{
    const term=v2Norm(input.value);
    if(term.length<2){out.innerHTML='<p>Escribe al menos dos caracteres.</p>';return;}
    const matches=(questionPool||[]).filter(q=>v2Norm([q.q,q.subtopic,q.specialty,...(q.a||[]).map(a=>a[0])].join(' ')).includes(term)).slice(0,60);
    out.innerHTML=matches.map((q,i)=>'<button data-qidx="'+i+'"><span class="qualityDot '+v3Quality(q).level+'"></span><b>'+v2Escape(q.q)+'</b><small>'+v2Escape(q.specialty||'')+' · '+v2Escape(q.subtopic||'')+(q.autoFlag?' · '+v2Escape(q.autoFlag):'')+'</small></button>').join('')||'<p>Sin resultados.</p>';
    document.querySelectorAll('[data-qidx]').forEach(b=>b.onclick=()=>v3PreviewQuestion(matches[Number(b.dataset.qidx)]));
  };
  input.addEventListener('input',render);setTimeout(()=>input.focus(),120);
}
function v3PreviewQuestion(q){
  const qual=v3Quality(q);
  openModal('<h2>👁 VISTA PREVIA</h2><p class="qualityBanner '+qual.level+'">'+qual.label+'</p><p><b>'+v2Escape(q.q)+'</b></p>'+
    (q.case?'<div class="clinicalCase"><b>CASO CLÍNICO</b><p>'+v2Escape(q.case)+'</p></div>':'')+
    (q.image?'<img class="clinicalQuestionImage v3Zoomable" src="'+v2Escape(q.image)+'" alt="Imagen de la pregunta">':'')+
    '<div class="previewAnswers">'+(q.a||[]).map((a,i)=>'<div><b>'+(i+1)+'.</b><span>'+v2Escape(a[0])+'</span><b>'+a[1]+'</b></div>').join('')+'</div>'+
    (q.aliases&&Object.keys(q.aliases).length?'<h3>Sinónimos aceptados</h3><div class="aliasPreview">'+Object.entries(q.aliases).map(([k,v])=>'<p><b>'+v2Escape(k)+':</b> '+v2Escape((Array.isArray(v)?v:[v]).join(', '))+'</p>').join('')+'</div>':'<p><b>Sinónimos personalizados:</b> —</p>')+
    '<p><b>Especialidad:</b> '+v2Escape(q.specialty||'')+' · <b>Subtema:</b> '+v2Escape(q.subtopic||'')+' · <b>Dificultad:</b> '+v2Escape(q.difficulty||'')+'</p><p><b>Fuente:</b> '+v2Escape(q.source||'Pendiente')+'</p><p><b>Estado:</b> '+qual.label+'</p><div class="menuStack"><button id="v3PreviewEdit">✏ EDITAR LOCALMENTE</button><button id="v3PreviewBack">🔎 VOLVER A BUSCAR</button></div>');
  $('#v3PreviewEdit').onclick=()=>{const old=questions,oldIndex=roundIndex;questions=[q];roundIndex=0;otEditQuestion();questions=old;roundIndex=oldIndex;};
  $('#v3PreviewBack').onclick=v3SearchQuestions;
}

function v3CaseSeries(){try{return JSON.parse(localStorage.getItem(V3_CASES_KEY)||'[]');}catch(_){return [];}}
function v3SaveCases(x){localStorage.setItem(V3_CASES_KEY,JSON.stringify(x));}
function v3CaseSeriesMenu(){
  const list=v3CaseSeries();
  openModal('<h2>🩺 CASOS CLÍNICOS SERIADOS</h2><div class="v3HistoryList">'+(list.map((x,i)=>'<button data-case="'+i+'"><b>'+v2Escape(x.name)+'</b><span>'+x.questions.length+' etapas</span></button>').join('')||'<p>No hay casos seriados creados.</p>')+'</div><button id="v3NewCase" class="setupStart">＋ CREAR CASO SERIADO</button>');
  document.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>v3PlayCase(list[Number(b.dataset.case)]));
  $('#v3NewCase').onclick=v3CreateCaseSeries;
}
function v3CreateCaseSeries(){
  const pool=(typeof spBank==='function'?spBank(typeof specialtySelected==='string'?specialtySelected:'general'):questionPool).slice(0,100);
  openModal('<h2>＋ CASO SERIADO</h2><label class="settingRow">Nombre <input id="v3CaseName" placeholder="Caso 1 · diagnóstico y tratamiento"></label><textarea id="v3CaseText" class="wideArea" placeholder="Edad, antecedentes, signos y síntomas que se revelarán en todas las etapas."></textarea>'+
    [1,2,3].map(n=>'<label class="settingRow">Etapa '+n+' <select id="v3CaseQ'+n+'">'+pool.map((q,i)=>'<option value="'+i+'">'+v2Escape(q.q.slice(0,90))+'</option>').join('')+'</select></label>').join('')+
    '<button id="v3CaseSave" class="setupStart">GUARDAR CASO</button>');
  $('#v3CaseSave').onclick=()=>{
    const item={name:$('#v3CaseName').value.trim()||'CASO CLÍNICO',caseText:$('#v3CaseText').value.trim(),questions:[1,2,3].map(n=>v3QuestionId(pool[Number($('#v3CaseQ'+n).value)]))};
    const a=v3CaseSeries();a.push(item);v3SaveCases(a);v3CaseSeriesMenu();
  };
}
function v3PlayCase(item){
  const qs=item.questions.map(id=>questionPool.find(q=>v3QuestionId(q)===id)).filter(Boolean).map((q,i)=>({...q,case:item.caseText,caseSeries:{name:item.name,step:i+1,total:item.questions.length}}));
  if(qs.length<2){alert('No se pudieron recuperar las preguntas del caso.');return;}
  questions=qs;roundIndex=0;scores=[0,0];bank=0;strikes=0;revealed=[];phase='play';currentTeam=0;
  closeModal(false);$('#home').classList.add('hidden');$('#game').classList.remove('hidden');updateScoreUI();showRound(true);
}


function v3PersistQuestionImage(q,dataUrl){
  if(!q||!dataUrl)return;
  const key=q._overrideKey||q.q;q._overrideKey=key;
  q.image=dataUrl;
  q.imageSource='teacher-imported';
  q.imageRights='user-authorized';
  let all={};try{all=JSON.parse(localStorage.getItem('dentistas-question-overrides-v2')||'{}');}catch(_){}
  all[key]={...(all[key]||{}),image:dataUrl,imageSource:'teacher-imported',imageRights:'user-authorized',reviewedAt:new Date().toISOString().slice(0,10)};
  try{localStorage.setItem('dentistas-question-overrides-v2',JSON.stringify(all));}
  catch(_){alert('La imagen es demasiado grande para el almacenamiento local. Prueba con una imagen más pequeña.');}
}
function v3ResizeImportedImage(dataUrl,q){
  const img=new Image();
  img.onload=()=>{
    const max=1200,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
    const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
    const out=canvas.toDataURL('image/jpeg',.82);
    v3PersistQuestionImage(q,out);
    alert('Imagen clínica guardada localmente para este reactivo.');
    v3MediaLibrary();
  };
  img.onerror=()=>alert('No se pudo leer la imagen seleccionada.');
  img.src=dataUrl;
}
function v3ImportClinicalImage(){
  const q=typeof otQ==='function'?otQ():(questions&&questions[roundIndex]);
  if(!q){alert('Abre primero un reactivo para adjuntar la imagen.');return;}
  v3PendingImageQuestion=q;
  try{
    if(window.Android&&Android.pickImageFile){Android.pickImageFile();return;}
  }catch(_){}
  alert('El selector de imágenes requiere la app Android.');
}
window.onImageImported=function(dataUrl){
  const q=v3PendingImageQuestion;v3PendingImageQuestion=null;
  if(q)v3ResizeImportedImage(String(dataUrl||''),q);
};
window.onImageImportError=function(message){
  v3PendingImageQuestion=null;alert(String(message||'No se pudo importar la imagen.'));
};

function v3AttachMedia(asset){
  const q=typeof otQ==='function'?otQ():(questions&&questions[roundIndex]);
  if(!q){alert('Abre una pregunta primero para adjuntar el recurso.');return;}
  const key=q._overrideKey||q.q;q._overrideKey=key;q.image=asset.src;
  let all={};try{all=JSON.parse(localStorage.getItem('dentistas-question-overrides-v2')||'{}');}catch(_){}
  all[key]={...(all[key]||{}),image:asset.src,reviewedAt:new Date().toISOString().slice(0,10)};
  localStorage.setItem('dentistas-question-overrides-v2',JSON.stringify(all));
  alert('Recurso adjuntado localmente a la pregunta actual.');
}
function v3MediaLibrary(){
  const items=(questionPool||[]).filter(q=>q.image||q.case);
  openModal('<h2>🖼 BANCO MULTIMEDIA OFFLINE</h2><p>Estos recursos vienen dentro del APK y no requieren Internet. Los esquemas son educativos y no sustituyen imágenes diagnósticas reales.</p><div class="menuStack"><button id="v3ImportClinical">📷 IMPORTAR IMAGEN CLÍNICA AUTORIZADA</button></div><p class="specialtyLead">La imagen importada se procesa y guarda solo en este dispositivo. Usa únicamente material propio o con permiso de uso.</p><div class="mediaAssetGrid">'+V3_MEDIA_ASSETS.map((a,i)=>'<button data-v3asset="'+i+'"><img src="'+a.src+'" alt=""><b>'+v2Escape(a.name)+'</b><span>'+v2Escape(a.note)+'</span></button>').join('')+'</div><h3>Preguntas que ya usan multimedia</h3><div class="mediaLibrary">'+(items.map((q,i)=>'<button data-media="'+i+'">'+(q.image?'🖼':'🩺')+' '+v2Escape(q.q)+'</button>').join('')||'<p>Todavía ninguna pregunta del banco principal usa imagen.</p>')+'</div><button id="v3ImageMode" class="secondaryWide">⚙ MODO DE REVELADO DE IMAGEN</button>');
  $('#v3ImportClinical').onclick=v3ImportClinicalImage;
  document.querySelectorAll('[data-v3asset]').forEach(b=>b.onclick=()=>{const a=V3_MEDIA_ASSETS[Number(b.dataset.v3asset)];openModal('<h2>'+v2Escape(a.name)+'</h2><div class="v3ImageZoom"><img src="'+a.src+'" alt="'+v2Escape(a.name)+'"></div><p>'+v2Escape(a.note)+'</p><button id="v3AttachAsset" class="setupStart">📎 ADJUNTAR A PREGUNTA ACTUAL</button><button id="v3MediaBack" class="secondaryWide">VOLVER</button>');$('#v3AttachAsset').onclick=()=>v3AttachMedia(a);$('#v3MediaBack').onclick=v3MediaLibrary;});
  document.querySelectorAll('[data-media]').forEach(b=>b.onclick=()=>v3PreviewQuestion(items[Number(b.dataset.media)]));
  $('#v3ImageMode').onclick=v3ImageSettings;
}
function v3ImageSettings(){
  openModal('<h2>🖼 PRESENTACIÓN DE IMÁGENES</h2><label class="settingRow">Orden <select id="v3ImageModeSelect"><option value="together">Pregunta + imagen juntas</option><option value="questionFirst">Pregunta primero; revelar imagen</option><option value="imageFirst">Imagen primero; revelar pregunta</option></select></label><button id="v3ImageSave" class="setupStart">GUARDAR</button>');
  $('#v3ImageModeSelect').value=v3AcademicSettings.imageMode;
  $('#v3ImageSave').onclick=()=>{v3AcademicSettings.imageMode=$('#v3ImageModeSelect').value;localStorage.setItem(V3_MEDIA_SETTINGS,JSON.stringify(v3AcademicSettings));closeModal(false);};
}
function v3ApplyImageMode(){
  const img=document.querySelector('.clinicalQuestionImage'),q=$('#question');if(!img)return;
  document.querySelectorAll('.v3MediaReveal').forEach(x=>x.remove());
  img.classList.add('v3Zoomable');
  if(v3AcademicSettings.imageMode==='questionFirst'){
    img.classList.add('v3MediaHidden');
    const b=document.createElement('button');b.className='v3MediaReveal';b.textContent='👁 MOSTRAR IMAGEN';b.onclick=()=>{img.classList.remove('v3MediaHidden');b.remove();};img.before(b);
  }else if(v3AcademicSettings.imageMode==='imageFirst'&&q){
    q.classList.add('v3QuestionHidden');
    const b=document.createElement('button');b.className='v3MediaReveal';b.textContent='👁 MOSTRAR PREGUNTA';b.onclick=()=>{q.classList.remove('v3QuestionHidden');b.remove();};img.before(b);
  }
}
document.addEventListener('click',e=>{
  const img=e.target.closest('.v3Zoomable,.clinicalQuestionImage');
  if(!img||img.classList.contains('v3MediaHidden'))return;
  openModal('<div class="v3ImageZoom"><img src="'+v2Escape(img.getAttribute('src'))+'" alt="Imagen ampliada"><p>🔍 Toca ✕ para volver al tablero.</p></div>');
});

const v3AcademicShow=showRound;
showRound=function(reset=true){v3AcademicShow(reset);setTimeout(v3ApplyImageMode,60);};

function v3AcademicMenu(){
  openModal('<h2>🎓 HERRAMIENTAS ACADÉMICAS</h2><div class="menuStack"><button id="v3Assess">📝 PRETEST / POSTEST</button><button id="v3AssessCompare">📈 COMPARAR PRE / POST</button><button id="v3Quality">🚦 CALIDAD DEL BANCO</button><button id="v3Analytics">📊 ESTADÍSTICAS POR SUBTEMA</button><button id="v3Search">🔎 BUSCAR / PREVISUALIZAR PREGUNTAS</button><button id="v3Cases">🩺 CASOS CLÍNICOS SERIADOS</button><button id="v3Media">🖼 MULTIMEDIA OFFLINE</button></div>');
  $('#v3Assess').onclick=v3AssessmentSetup;$('#v3AssessCompare').onclick=v3AssessmentCompare;$('#v3Quality').onclick=v3QualityDashboard;$('#v3Analytics').onclick=v3Analytics;$('#v3Search').onclick=v3SearchQuestions;$('#v3Cases').onclick=v3CaseSeriesMenu;$('#v3Media').onclick=v3MediaLibrary;
}

// Acceso integrado dentro de Classroom Research para mantener limpia la portada.
