'use strict';

// 100 Dentistas Dijeron · V2 gameplay layer
const V2_VERSION = '3.0.2-classroom-research-beta';
const RECENT_LIMIT = 24;
let v2RoundStartScores = [0, 0];
let v2RoundHistory = [];
let v2Paused = false;
let v2Sound = true;
let v2TimerSeconds = 30;
let v2Category = 'GENERAL';
let v2Difficulty = 'TODAS';
let v2VoiceTarget = 'main';
let v2Faceoff = null;
let v2SuddenDeath = false;
let v2Study = null;

const V2_SOURCES = {
  'Anatomía y fisiología': ['NCBI Bookshelf · Anatomy, Head and Neck', 'https://www.ncbi.nlm.nih.gov/books/'],
  'Preventiva y cariología': ['American Dental Association · Caries prevention', 'https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/caries-risk-assessment-and-management'],
  'Periodoncia': ['EFP · Clinical Practice Guidelines', 'https://www.efp.org/education/continuing-education/clinical-guidelines/'],
  'Endodoncia y restauradora': ['American Association of Endodontists · Clinical Resources', 'https://www.aae.org/specialty/clinical-resources/'],
  'Prótesis, oclusión y ATM': ['NCBI/PubMed · Prosthodontics and TMD literature', 'https://pubmed.ncbi.nlm.nih.gov/'],
  'Cirugía, anestesia y radiología': ['ADA · Oral health topics and radiography', 'https://www.ada.org/resources/ada-library/oral-health-topics/x-rays-radiographs'],
  'Patología y medicina oral': ['WHO · Oral health / oral cancer', 'https://www.who.int/news-room/fact-sheets/detail/oral-health'],
  'Odontopediatría y ortodoncia': ['AAPD · Policies & Recommendations', 'https://www.aapd.org/research/oral-health-policies--recommendations/'],
  'Control de infecciones y medicina': ['CDC · Dental Infection Prevention and Control', 'https://www.cdc.gov/dental-infection-control/'],
  'Materiales, estética e implantes': ['PubMed · Dental materials and implant evidence', 'https://pubmed.ncbi.nlm.nih.gov/'],
  'Ortodoncia y funciones orales': ['PubMed · Orthodontics / orofacial function evidence', 'https://pubmed.ncbi.nlm.nih.gov/']
};

const V2_ALIASES = {
  'succión digital': ['chuparse el dedo','succion del dedo','habito de dedo','succion de dedo'],
  'respiración oral': ['respiracion bucal','respirar por la boca','respirador oral'],
  'interconsulta con orl': ['otorrino','otorrinolaringologo','otorrinolaringología','consulta con otorrino','orl'],
  'terapia miofuncional': ['terapia miofuncional orofacial','ejercicios miofuncionales','terapia orofacial'],
  'mordida cruzada posterior bilateral': ['mordida cruzada bilateral','cruzada posterior bilateral'],
  'mordida cruzada posterior unilateral': ['mordida cruzada unilateral','cruzada posterior unilateral'],
  'hipoclorito de sodio': ['naocl','hipoclorito'],
  'radiografía panorámica': ['panoramica','ortopantomografia'],
  'radiografía cefalométrica': ['cefalometrica','telerradiografia'],
  'bloqueo del nervio alveolar inferior': ['bloqueo alveolar inferior','dentario inferior'],
  'prueba eléctrica pulpar': ['prueba electrica','test electrico pulpar'],
  'dique de hule': ['dique de goma','rubber dam'],
  'resina compuesta': ['composite','resina'],
  'ionómero de vidrio': ['ionomero de vidrio','glass ionomer'],
  'enfermedad periodontal': ['periodontitis','enfermedad de las encias'],
  'sangrado al sondaje': ['sangrado al sondeo','bop'],
  'pérdida de inserción clínica': ['perdida de insercion','cal'],
  'articaína': ['articaina'],
  'lidocaína': ['lidocaina'],
  'prilocaína': ['prilocaina'],
  'mepivacaína': ['mepivacaina'],
  'tomografía computarizada de haz cónico': ['cbct','cone beam','tomografia cone beam','tomografia de haz conico'],
  'articulación temporomandibular': ['atm','articulacion temporo mandibular'],
  'trastorno temporomandibular': ['ttm','tmd','trastorno de la atm'],
  'extracción dental': ['exodoncia','sacar el diente','extraccion'],
  'tercer molar': ['muela del juicio','cordal'],
  'alveolitis seca': ['osteitis alveolar','dry socket'],
  'radiografía periapical': ['periapical','rx periapical'],
  'radiografía bitewing': ['bitewing','aleta de mordida','interproximal'],
  'biofilm dental': ['placa dental','placa bacteriana','biofilm','placa'],
  'cálculo dental': ['sarro','tartaro','calculo'],
  'clorhexidina': ['chx'],
  'fluoruro de sodio': ['naf'],
  'diamino fluoruro de plata': ['sdf','fluoruro diamino de plata','plata diamina fluoruro'],
  'sellador de fosetas y fisuras': ['sellador de fisuras','sellador','sealant'],
  'unión amelocementaria': ['uac','cej','union cemento esmalte'],
  'ligamento periodontal': ['lpd','pdl'],
  'profundidad al sondaje': ['profundidad de sondaje','profundidad de bolsa','ps','pd'],
  'tratamiento de conductos': ['endodoncia','tratamiento endodontico','root canal'],
  'conducto radicular': ['canal radicular','conducto','canal'],
  'necrosis pulpar': ['pulpa necrotica','necrosis de la pulpa'],
  'agregado de trióxido mineral': ['mta','mineral trioxide aggregate'],
  'prótesis parcial removible': ['ppr','rpd','protesis removible'],
  'prótesis total': ['dentadura completa','dentadura total','protesis completa'],
  'corona de acero inoxidable': ['corona de acero','ssc','stainless steel crown'],
  'sobremordida': ['overbite'],
  'resalte': ['overjet'],
  'mordida abierta': ['open bite'],
  'mordida cruzada': ['crossbite'],
  'expansión rápida maxilar': ['disyuncion maxilar','expansion palatina rapida','rme'],
  'bruxismo': ['rechinar los dientes','apretar los dientes','rechinamiento dental']
};

const V2_TERM_EQUIVS = [
  ['radiografia panoramica','panoramica','ortopantomografia','ortopantomograma','rx panoramica'],
  ['radiografia cefalometrica','cefalometrica','telerradiografia','rx cefalometrica'],
  ['tomografia computarizada de haz conico','cbct','cone beam','tomografia cone beam'],
  ['articulacion temporomandibular','atm'],
  ['trastorno temporomandibular','ttm','tmd','trastorno atm'],
  ['bloqueo del nervio alveolar inferior','bloqueo alveolar inferior','bloqueo dentario inferior','dentario inferior'],
  ['hipoclorito de sodio','hipoclorito','naocl'],
  ['clorhexidina','chx'],
  ['fluoruro de sodio','naf'],
  ['diamino fluoruro de plata','sdf','fluoruro diamino de plata'],
  ['agregado de trioxido mineral','mta'],
  ['dique de hule','dique de goma','rubber dam','aislamiento absoluto'],
  ['resina compuesta','resina','composite'],
  ['ionomero de vidrio','cemento de ionomero de vidrio','civ','gic','glass ionomer'],
  ['biofilm dental','placa dental','placa bacteriana','biofilm'],
  ['calculo dental','sarro','tartaro'],
  ['extraccion dental','exodoncia','extraccion'],
  ['tercer molar','muela del juicio','cordal'],
  ['radiografia periapical','periapical','rx periapical'],
  ['radiografia bitewing','bitewing','aleta de mordida','interproximal'],
  ['sangrado al sondaje','sangrado al sondeo','bop'],
  ['perdida de insercion clinica','perdida de insercion','cal','nic'],
  ['union amelocementaria','uac','cej'],
  ['ligamento periodontal','lpd','pdl'],
  ['tratamiento de conductos','endodoncia','tratamiento endodontico'],
  ['conducto radicular','canal radicular','conducto'],
  ['protesis parcial removible','ppr','rpd'],
  ['protesis total','dentadura completa','dentadura total'],
  ['corona de acero inoxidable','corona de acero','ssc'],
  ['sobremordida','overbite'],
  ['resalte','overjet'],
  ['mordida abierta','open bite'],
  ['mordida cruzada','crossbite'],
  ['expansion rapida maxilar','disyuncion maxilar','rme'],
  ['succion digital','chuparse el dedo','habito de dedo'],
  ['respiracion oral','respiracion bucal','respirar por la boca'],
  ['terapia miofuncional','terapia orofacial','ejercicios miofuncionales'],
  ['historia medica','historial medico','antecedentes medicos','anamnesis'],
  ['medicamentos actuales','medicamentos','medicacion','farmacos actuales','medicinas que toma','que medicamentos toma'],
  ['encia','gingiva','tejido gingival'],
  ['inflamacion gingival','gingivitis','encia inflamada'],
  ['bolsa periodontal','bolsa','saco periodontal'],
  ['sondaje periodontal','sondeo periodontal','medicion periodontal'],
  ['supuracion','pus','secrecion purulenta'],
  ['recesion gingival','recesion de encia','encia retraida'],
  ['movilidad dental','diente flojo','movilidad del diente'],
  ['furcacion','compromiso de furca','lesion de furcacion'],
  ['higiene oral','higiene bucal','limpieza bucal'],
  ['cepillado dental','cepillado','lavado de dientes','lavarse los dientes'],
  ['hilo dental','seda dental','floss'],
  ['barniz de fluoruro','barniz de fluor','fluor barniz'],
  ['sellador de fosetas y fisuras','sellador de fisuras','sellador dental'],
  ['caries dental','caries','lesion cariosa'],
  ['lesion de caries','caries','lesion cariosa'],
  ['diente temporal','diente de leche','diente deciduo','diente primario'],
  ['dientes temporales','dientes de leche','dientes deciduos','dientes primarios'],
  ['diente permanente','diente definitivo','diente adulto'],
  ['mantenedor de espacio','aparato mantenedor','conservador de espacio'],
  ['banda y asa','band and loop','banda asa'],
  ['arco lingual','lingual arch'],
  ['boton de nance','nance'],
  ['arco transpalatino','tpa','transpalatino'],
  ['pulpotomia','amputacion pulpar'],
  ['pulpectomia','extirpacion pulpar'],
  ['recubrimiento pulpar directo','proteccion pulpar directa','direct pulp cap'],
  ['recubrimiento pulpar indirecto','proteccion pulpar indirecta','indirect pulp treatment'],
  ['localizador apical','localizador de apice','apex locator'],
  ['longitud de trabajo','longitud de conducto','working length'],
  ['gutapercha','gutta percha'],
  ['instrumentacion mecanica','preparacion mecanica','conformacion mecanica'],
  ['irrigacion endodontica','irrigacion de conductos','lavado de conductos'],
  ['retratamiento endodontico','reendodoncia','retratamiento de conductos'],
  ['obturacion endodontica','relleno de conductos','obturacion de conductos'],
  ['aislamiento absoluto','dique de hule','dique de goma'],
  ['grabado acido','acondicionamiento acido','etching'],
  ['sistema adhesivo','adhesivo dental','bonding'],
  ['fotopolimerizacion','curado con luz','polimerizacion con luz'],
  ['lampara de fotocurado','lampara de polimerizacion','luz de curado'],
  ['matriz dental','banda matriz','matriz'],
  ['cuña dental','cuna dental','wedge'],
  ['punto de contacto','contacto proximal','contacto interproximal'],
  ['abrasion','desgaste por friccion'],
  ['erosion dental','desgaste quimico','erosion'],
  ['abfraccion','lesion cervical por estres'],
  ['hipersensibilidad dentinaria','sensibilidad dental','dientes sensibles'],
  ['impresion dental','molde dental','impresion'],
  ['escaneo intraoral','scanner intraoral','escaneo digital'],
  ['registro de mordida','registro oclusal','bite registration'],
  ['protesis fija','puente fijo','restauracion fija'],
  ['puente dental','protesis fija parcial','fixed bridge'],
  ['pontico','diente falso del puente','pieza pontica'],
  ['implante dental','implante','tornillo dental'],
  ['periimplantitis','enfermedad periimplantaria','infeccion del implante'],
  ['mucositis periimplantaria','inflamacion periimplantaria','mucositis del implante'],
  ['alineadores','alineadores transparentes','aligners'],
  ['aparatos fijos','brackets','ortodoncia fija'],
  ['aparatos removibles','aparato removible','ortodoncia removible'],
  ['aparatos funcionales','aparato funcional','ortopedia funcional'],
  ['mantenedor de espacio','mantenedor','space maintainer'],
  ['mascara facial','facemask','mascara de protraccion'],
  ['expansor palatino','disyuntor','expansor maxilar'],
  ['quad helix','quadhelix','quad-helix'],
  ['clase i','angle clase i','clase uno'],
  ['clase ii','angle clase ii','clase dos'],
  ['clase iii','angle clase iii','clase tres'],
  ['linea media','midline','linea media dental'],
  ['apiñamiento','falta de espacio','dientes amontonados'],
  ['diastema','espacio entre dientes','separacion dental'],
  ['erupcion ectopica','erupcion fuera de lugar','diente ectopico'],
  ['interposicion lingual','empuje lingual','tongue thrust'],
  ['deglucion atipica','deglucion infantil','patron deglutorio atipico'],
  ['respiracion nasal','respirar por la nariz'],
  ['respiracion oral','respiracion bucal','respirar por la boca'],
  ['succion digital','chuparse el dedo','succion del pulgar','chuparse el pulgar'],
  ['uso de chupon','uso de pacificador','pacifier','chupete'],
  ['bruxismo','rechinar dientes','apretar dientes','apretamiento dental'],
  ['articaina','articaina 4'],
  ['lidocaina','lignocaina'],
  ['mepivacaina','carbocaina'],
  ['prilocaina','prilocaina'],
  ['vasoconstrictor','epinefrina','adrenalina'],
  ['epinefrina','adrenalina'],
  ['inyeccion intraligamentaria','anestesia intraligamentaria','pdl injection'],
  ['inyeccion intraosea','anestesia intraosea'],
  ['inyeccion intrapulpar','anestesia intrapulpar'],
  ['anestesia topica','topico anestesico','gel anestesico'],
  ['hematoma','moreton','equimosis por inyeccion'],
  ['parestesia','adormecimiento persistente','hormigueo persistente'],
  ['sincope','desmayo','lipotimia'],
  ['aspiracion','aspirar la jeringa','prueba de aspiracion'],
  ['biopsia','toma de biopsia','muestra de tejido'],
  ['alveolitis seca','alveolitis','osteitis alveolar'],
  ['comunicacion oroantral','comunicacion bucosinusal','oroantral'],
  ['hemostasia','control de sangrado','detener sangrado'],
  ['sutura','puntos','puntos de sutura'],
  ['anticoagulantes','medicamentos anticoagulantes','diluyentes de sangre'],
  ['antiagregantes','antiplaquetarios','medicamentos antiagregantes'],
  ['radiografia','rayos x','rx'],
  ['cefalometria','analisis cefalometrico','cefalometrica'],
  ['fotografias clinicas','fotos clinicas','fotografias'],
  ['modelos de estudio','modelos dentales','modelos'],
  ['escaneos digitales','escaneos intraorales','modelos digitales']
];

(function loadV2Settings(){
  try {
    const s = JSON.parse(localStorage.getItem('dentistas-v2-settings') || '{}');
    if (s.timerVersion === '30s-v1' && [10,15,20,30].includes(Number(s.timer))) v2TimerSeconds = Number(s.timer);
    else v2TimerSeconds = 30;
    v2Sound = s.sound !== false;
    document.documentElement.classList.toggle('reduceMotion', !!s.reduceMotion);
    document.documentElement.classList.toggle('largeText', !!s.largeText);
  } catch (_) {}
})();

function v2SaveSettings(){
  localStorage.setItem('dentistas-v2-settings', JSON.stringify({
    timer:v2TimerSeconds, timerVersion:'30s-v1', sound:v2Sound,
    reduceMotion:document.documentElement.classList.contains('reduceMotion'),
    largeText:document.documentElement.classList.contains('largeText')
  }));
}

function v2Escape(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function v2Norm(s){
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9ñ\s]/g,' ').replace(/\b(el|la|los|las|un|una|de|del|al|y|en|con|por|para)\b/g,' ')
    .replace(/\s+/g,' ').trim();
}
function v2Lev(a,b){
  a=v2Norm(a); b=v2Norm(b); if(!a||!b) return 0; const m=a.length,n=b.length;
  const d=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++)d[i][0]=i; for(let j=0;j<=n;j++)d[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return 1-d[m][n]/Math.max(m,n);
}
function v2Jaccard(a,b){
  const A=new Set(v2StemPhrase(a).split(' ').filter(Boolean)),B=new Set(v2StemPhrase(b).split(' ').filter(Boolean)); if(!A.size||!B.size)return 0;
  let inter=0; A.forEach(x=>{if(B.has(x))inter++;}); return inter/(A.size+B.size-inter);
}
function v2StemToken(token){
  let t=String(token||'');
  if(t.length>6&&t.endsWith('es'))t=t.slice(0,-2);
  else if(t.length>5&&t.endsWith('s'))t=t.slice(0,-1);
  return t;
}
function v2StemPhrase(s){
  return v2Norm(s).split(' ').filter(Boolean).map(v2StemToken).join(' ');
}
function v2Aliases(label,q=null){
  const n=v2Norm(label);
  const out=new Set([n,v2StemPhrase(n)]);
  Object.entries(V2_ALIASES).forEach(([k,vals])=>{
    if(v2Norm(k)===n) vals.forEach(v=>out.add(v2Norm(v)));
  });

  // Variantes naturales que no cambian el significado clínico.
  const clean=n
    .replace(/\bcuando (esta|este|sea|sean) (indicad[oa]s?|necesari[oa]s?)\b/g,' ')
    .replace(/\bcuando (se )?(requiera|requieren|corresponda)\b/g,' ')
    .replace(/\bsegun el caso\b/g,' ')
    .replace(/\bde acuerdo con el caso\b/g,' ')
    .replace(/\s+/g,' ').trim();
  if(clean)out.add(clean);

  // Sustituye términos equivalentes dentro de frases completas.
  V2_TERM_EQUIVS.forEach(group=>{
    const normalized=group.map(v2Norm);
    normalized.forEach(term=>{
      if(!term||!n.includes(term))return;
      normalized.forEach(alt=>{
        if(alt)out.add(n.replace(term,alt));
      });
    });
    if(normalized.includes(n)) normalized.forEach(x=>out.add(x));
  });

  // Acepta alternativas escritas explícitamente con "o" o "/".
  n.split(/\s+(?:o|u)\s+|\s*\/\s*/).forEach(part=>{
    if(part.length>=4)out.add(part.trim());
  });
  if(n.includes('orl')){out.add('otorrino');out.add('otorrinolaringologo');}

  // Equivalencias semánticas dependientes del contexto de la pregunta.
  const qn=v2Norm(q?.q||'');
  const add=(...vals)=>vals.forEach(v=>{const x=v2Norm(v);if(x)out.add(x);});
  const has=(re)=>re.test(n);
  const qhas=(re)=>re.test(qn);

  if(has(/duracion|tiempo/)){
    add('duracion','tiempo','cuanto tiempo','lapso','periodo de tiempo','desde hace cuanto','tiempo que lleva');
    if(qhas(/habito|succion/))add('tiempo del habito','duracion del habito','cuanto tiempo lleva el habito','desde hace cuanto tiene el habito','tiempo con el habito');
    if(qhas(/tratamiento|ortodon/))add('duracion del tratamiento','tiempo de tratamiento','cuanto dura el tratamiento');
    if(qhas(/procedimiento/))add('duracion del procedimiento','tiempo del procedimiento','cuanto dura el procedimiento');
    if(qhas(/anestes/))add('duracion de anestesia','tiempo de anestesia','cuanto dura la anestesia');
  }
  if(has(/frecuencia/)){
    add('frecuencia','cada cuanto','que tan seguido','cuantas veces','numero de veces','repeticion');
    if(qhas(/habito|succion/))add('frecuencia del habito','cada cuanto hace el habito','que tan seguido hace el habito','cuantas veces hace el habito');
  }
  if(has(/intensidad/)){
    add('intensidad','fuerza','que tan fuerte','con que fuerza','grado de fuerza');
    if(qhas(/habito|succion/))add('intensidad del habito','fuerza del habito','que tan fuerte hace el habito');
  }
  if(has(/edad/)){
    add('edad','anos','que edad','edad del paciente');
    if(qhas(/nino|pediatric/))add('edad del nino','anos del nino');
    if(has(/biologica/))add('edad biologica','madurez biologica');
  }
  if(has(/tipo/)){
    add('tipo','clase','que tipo','cual tipo');
    if(qhas(/anestes/))add('tipo de anestesia','tipo de anestesico','anestesia usada','anestesia utilizada','anestesico usado','anestesico utilizado','anestesico empleado','que anestesia se uso','que anestesia usaron','cual anestesia','cual anestesico','medio anestesico');
    if(qhas(/protesis/))add('tipo de protesis','que protesis','clase de protesis');
    if(qhas(/aparato|ortodon|ortoped/))add('tipo de aparato','que aparato','clase de aparato');
  }
  if(has(/tecnica|metodo/)){
    add('tecnica','metodo','forma de hacerlo','como se hizo','procedimiento');
    if(qhas(/anestes|inyeccion/))add('tecnica de anestesia','metodo de anestesia','forma de anestesiar','como se aplico la anestesia','tecnica de inyeccion','tipo de inyeccion','como se inyecto');
    if(qhas(/conduct|endodon/))add('tecnica endodontica','metodo endodontico','forma de instrumentacion');
  }
  if(has(/sitio|localizacion|ubicacion/)){
    add('sitio','lugar','localizacion','ubicacion','donde','en que lugar');
    if(qhas(/inyeccion|anestes/))add('sitio de inyeccion','lugar de inyeccion','donde se inyecto','donde pusieron la anestesia','lugar de la anestesia');
    if(qhas(/lesion|defecto|fragmento/))add('donde esta','ubicacion de la lesion','localizacion de la lesion');
  }
  if(has(/dosis|cantidad/)){
    add('dosis','cantidad','cuanto','cantidad usada','cantidad administrada','cuanto se uso','cuanto se administro');
    if(qhas(/anestes/))add('dosis de anestesia','cantidad de anestesia','cuanta anestesia','dosis del anestesico');
  }
  if(has(/concentracion/)){
    add('concentracion','porcentaje','que concentracion','concentracion del medicamento','concentracion de la solucion');
    if(qhas(/anestes/))add('concentracion del anestesico','porcentaje de anestesia','concentracion de anestesia');
  }
  if(has(/peso/))add('peso','peso corporal','cuanto pesa','peso del paciente');
  if(has(/severidad|grave|gravedad/))add('severidad','gravedad','grado','que tan grave','nivel de gravedad');
  if(has(/tamano|dimension/))add('tamano','dimensiones','que tan grande','medida','tamano de la lesion','tamano del defecto');
  if(has(/profundidad/))add('profundidad','que tan profundo','medida de profundidad','profundidad de bolsa');
  if(has(/posicion/))add('posicion','ubicacion','donde esta','localizacion','colocacion');
  if(has(/angulacion|inclinacion/))add('angulacion','angulo','inclinacion','como esta inclinado');
  if(has(/direccion/))add('direccion','sentido','hacia donde','orientacion');
  if(has(/magnitud/))add('magnitud','cantidad','intensidad','fuerza','que tanta fuerza');
  if(has(/velocidad/))add('velocidad','rapidez','que tan rapido','ritmo');
  if(has(/momento/))add('momento','cuando','en que momento','tiempo de hacerlo');
  if(has(/historia|antecedente/)){
    add('historia','historial','antecedentes','datos previos','historia clinica');
    if(qhas(/medic|cirugia|anestes/))add('historia medica','antecedentes medicos','historial medico','enfermedades previas');
    if(has(/familiar/))add('antecedentes familiares','historia familiar','familiares con el problema');
  }
  if(has(/medicamento|farmaco/))add('medicamentos','medicinas','farmacos','que toma','medicacion actual','medicamentos que usa');
  if(has(/sintoma|dolor/))add('sintomas','molestias','lo que siente','dolor','que molestias tiene');
  if(has(/causa|etiolog/))add('causa','etiologia','origen','por que ocurre','que lo causa','causa del problema');
  if(has(/calidad/))add('calidad','que tan buena','calidad del material','calidad del registro');
  if(has(/forma/))add('forma','morfologia','aspecto','forma anatomica');
  if(has(/funcion/))add('funcion','uso','para que sirve','funcionamiento');
  if(has(/patron/))add('patron','tipo de patron','tendencia','forma de crecimiento');
  if(has(/relacion/))add('relacion','como se relaciona','relacion entre ellos');
  if(has(/exposicion/))add('exposicion','contacto','estar expuesto','nivel de exposicion');

  // Combinaciones conceptuales frecuentes del banco.
  if(has(/edad/)&&has(/duracion/)&&qhas(/habito|succion/)){
    add('edad y tiempo del habito','edad y duracion del habito','tiempo del habito','cuanto tiempo tiene el habito','edad del nino y tiempo del habito');
  }
  if(has(/frecuencia/)&&has(/intensidad/)&&qhas(/habito|succion/)){
    add('frecuencia e intensidad del habito','cada cuanto y que tan fuerte','que tan seguido y que tan fuerte','frecuencia del habito','intensidad del habito','cada cuanto lo hace');
  }
  if(has(/tipo/)&&has(/tecnica/)&&qhas(/anestes|inyeccion/)){
    add('tipo de anestesia y tecnica','anestesia usada y tecnica','que anestesia usaron y como la pusieron','anestesico y metodo de inyeccion','tipo y tecnica');
  }
  if(has(/dosis/)&&has(/tecnica/)&&qhas(/anestes/)){
    add('dosis y tecnica','cantidad de anestesia y tecnica','cuanto anestesico y como se aplico');
  }
  if(has(/posicion/)&&has(/angulacion/))add('posicion y angulo','ubicacion e inclinacion','como esta colocado e inclinado');
  if(has(/edad/)&&has(/crecimiento/))add('edad y crecimiento','edad y desarrollo','etapa de crecimiento');
  if(has(/edad/)&&has(/maduracion/))add('edad y maduracion','edad y desarrollo esqueletico','madurez y edad');

  return [...new Set([...out].map(v2Norm).filter(Boolean))];
}

function v2ShortLabel(label){
  let s=String(label||'').trim();
  const exact={
    'Tomografía computarizada de haz cónico':'CBCT',
    'Radiografía panorámica':'Panorámica',
    'Radiografía cefalométrica':'Cefalometría',
    'Radiografía cefalométrica lateral':'Cefalometría lateral',
    'Articulación temporomandibular':'ATM',
    'Ionómero de vidrio modificado con resina':'Ionómero mod. con resina',
    'Bloqueo del nervio alveolar inferior':'Bloqueo alveolar inferior',
    'Pérdida de inserción clínica':'Pérdida de inserción',
    'Cantidad o dosis administrada':'Dosis administrada',
    'Técnica o tipo de inyección':'Técnica de inyección',
    'Peso y edad cuando influyen en la dosificación':'Peso y edad',
    'Retracción gingival cuando está indicada':'Retracción gingival',
    'Controlar la enfermedad y detener su progresión':'Control de la enfermedad',
    'Preservar la mayor cantidad posible de tejido sano':'Preservar tejido sano',
    'Facilitar higiene y mantenimiento':'Facilitar higiene',
    'Tomografía computarizada de haz cónico (CBCT)':'CBCT',
    'Prótesis parcial removible':'PPR',
    'Diamino fluoruro de plata':'SDF',
    'Tipo de anestésico':'Tipo de anestesia',
    'Tipo de anestésico y técnica utilizada':'Anestésico y técnica',
    'Agente y concentración':'Anestésico y concentración',
    'Cantidad o dosis administrada':'Dosis administrada',
    'Sitio de inyección':'Sitio de inyección',
    'Presencia y concentración de vasoconstrictor':'Vasoconstrictor',
    'Vascularidad del sitio de depósito':'Vascularidad del sitio',
    'Dosis acumuladas elevadas de agentes asociados':'Dosis acumulada',
    'Peso del paciente cuando aplica':'Peso del paciente',
    'Cantidad total ya administrada':'Cantidad administrada',
    'Diente perdido y tiempo desde la pérdida':'Diente y tiempo de pérdida',
    'Frecuencia e intensidad':'Frecuencia e intensidad',
    'Edad y duración':'Edad y duración',
    'Dirección y duración de las fuerzas':'Dirección y duración',
    'Magnitud y dirección de la fuerza':'Magnitud y dirección',
    'Duración prolongada de tratamiento':'Tratamiento prolongado',
    'Historia o presencia de periodontitis':'Historia de periodontitis',
    'Extensión y localización de la lesión':'Extensión y localización',
    'Relación corona-raíz y anatomía':'Relación corona-raíz',
    'Posición tridimensional protésicamente guiada':'Posición 3D protésica',
    'Síntomas e historia clínica':'Síntomas e historia',
    'Profundidad y posición del diente':'Profundidad y posición',
    'Tamaño estimado de dientes no erupcionados':'Tamaño dental estimado',
    'Antecedentes familiares de maloclusión severa':'Historia familiar',
    'Calidad de evidencia variable':'Calidad de evidencia',
    'Relación pérdida ósea/edad':'Pérdida ósea/edad',
    'Aumento de profundidad comparado con referencia':'Mayor profundidad',
    'Grado de compromiso horizontal':'Compromiso horizontal',
    'Control de infección y estabilidad del sitio':'Control y estabilidad'
  };
  if(exact[s])return exact[s];

  s=s
    .replace(/\s+cuando (?:está|este|sea|sean) (?:indicad[oa]s?|necesari[oa]s?).*$/i,'')
    .replace(/\s+cuando (?:se )?(?:requiera|requieren|corresponda).*$/i,'')
    .replace(/\s+según el caso.*$/i,'')
    .replace(/\s+de acuerdo con el caso.*$/i,'')
    .replace(/la mayor cantidad posible de /i,'')
    .replace(/tomografía computarizada de haz cónico/ig,'CBCT')
    .replace(/articulación temporomandibular/ig,'ATM')
    .replace(/radiografía panorámica/ig,'Panorámica')
    .replace(/bloqueo del nervio alveolar inferior/ig,'Bloqueo alveolar inferior')
    .replace(/ionómero de vidrio modificado con resina/ig,'Ionómero mod. con resina')
    .replace(/cantidad total ya administrada/ig,'Cantidad administrada')
    .replace(/presencia y concentración de vasoconstrictor/ig,'Vasoconstrictor')
    .replace(/vascularidad del sitio de depósito/ig,'Vascularidad del sitio')
    .replace(/duración prolongada de tratamiento/ig,'Tratamiento prolongado')
    .replace(/historia o presencia de periodontitis/ig,'Historia de periodontitis')
    .trim();

  // Si sigue siendo una oración larga, conserva la primera idea clínica completa.
  if(s.length>42){
    const cuts=[' y ',' para ',' mediante ',', ','; '];
    for(const sep of cuts){
      const i=s.toLowerCase().indexOf(sep);
      if(i>=14&&i<=40){s=s.slice(0,i).trim();break;}
    }
  }
  if(s.length>46){
    const cut=s.slice(0,43).lastIndexOf(' ');
    s=s.slice(0,cut>24?cut:43).trim()+'…';
  }
  return s;
}
window.v2ShortLabel=v2ShortLabel;
function v2OppositeConflict(a,b){
  const A=new Set(v2Norm(a).split(' ').filter(Boolean));
  const B=new Set(v2Norm(b).split(' ').filter(Boolean));
  const pairs=[
    ['maxilar','mandibular'],['superior','inferior'],['mesial','distal'],
    ['vestibular','lingual'],['vestibular','palatina'],['unilateral','bilateral'],
    ['abierta','profunda'],['abierto','profundo'],['aumento','disminucion'],
    ['aumentada','disminuida'],['positivo','negativo']
  ];
  return pairs.some(([x,y])=>(A.has(x)&&B.has(y)&&!B.has(x))||(A.has(y)&&B.has(x)&&!B.has(y)));
}
function v2ContainmentScore(input,alias){
  if(!(input.includes(alias)||alias.includes(input))) return 0;
  const shorter=input.length<=alias.length?input:alias;
  const longer=input.length>alias.length?input:alias;
  const tokens=shorter.split(' ').filter(Boolean).length;
  const ratio=shorter.length/Math.max(1,longer.length);
  if(tokens>=2&&shorter.length>=7&&ratio>=.60) return .90;
  return .72;
}
function v2Match(text, q=questions[roundIndex]){
  const input=v2Norm(text); if(!input||!q) return null;
  let best=null;
  const isCurrent=(Array.isArray(questions)&&q===questions[roundIndex]);

  const partialOwners=[];
  if(input.length>=5){
    q.a.forEach((ans,idx)=>{
      const aliases=v2Aliases(ans[0],q);
      const hit=aliases.some(alias=>{
        const a=' '+alias+' ',i=' '+input+' ';
        return a.includes(i) || (input.split(' ').length>=2 && alias.includes(input));
      });
      if(hit)partialOwners.push(idx);
    });
  }
  const uniquePartial=partialOwners.length===1?partialOwners[0]:-1;

  q.a.forEach((ans,idx)=>{
    if(isCurrent && revealed[idx] && phase!=='faceoff' && phase!=='sudden') return;
    let score=0;
    v2Aliases(ans[0],q).forEach(alias=>{
      let candidate=0;
      if(input===alias) candidate=1;
      else candidate=Math.max(v2ContainmentScore(input,alias),.58*v2Lev(input,alias)+.42*v2Jaccard(input,alias));
      if(idx===uniquePartial && candidate<.88) candidate=.88;
      if(v2OppositeConflict(input,alias)) candidate=Math.min(candidate,.45);
      score=Math.max(score,candidate);
    });
    if(!best||score>best.score) best={idx,score,label:ans[0],shortLabel:v2ShortLabel(ans[0]),points:Number(ans[1])||0};
  });
  return best;
}

function v2Host(text,state='normal'){
  let el=$('#hostBubble');
  if(!el){
    el=document.createElement('div'); el.id='hostBubble'; el.className='hostBubble';
    el.innerHTML='<span class="hostTooth">🦷🎤</span><span class="hostText"></span>';
    const board=document.querySelector('.board'); if(board) board.prepend(el);
  }
  el.dataset.state=state; el.querySelector('.hostText').textContent=text;
}
function v2React(team,state){
  const btn=document.querySelectorAll('.teamName')[team]; if(!btn)return;
  btn.classList.remove('reactGood','reactBad','reactTense');
  void btn.offsetWidth; btn.classList.add(state==='good'?'reactGood':state==='bad'?'reactBad':'reactTense');
  setTimeout(()=>btn.classList.remove('reactGood','reactBad','reactTense'),650);
}
function v2Beep(freq=740,dur=.08){
  if(!v2Sound)return;
  try{const C=window.AudioContext||window.webkitAudioContext; if(!C)return; const c=new C(),o=c.createOscillator(),g=c.createGain(); o.frequency.value=freq;g.gain.value=.05;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+dur);o.onended=()=>c.close();}catch(_){}
}

window.onSpeechResult=function(text){
  const t=String(text||'');
  if(v2VoiceTarget==='face1'&&$('#faceInput1')) $('#faceInput1').value=t;
  else if(v2VoiceTarget==='face2'&&$('#faceInput2')) $('#faceInput2').value=t;
  else if(v2VoiceTarget==='study'&&$('#studyInput')) $('#studyInput').value=t;
  else if($('#responseInput')) { $('#responseInput').value=t; v2SubmitMainResponse(); }
};
window.onSpeechError=function(){ v2Host('No pude escuchar con claridad. Puedes escribir la respuesta.','bad'); };
function v2Speak(target='main'){
  v2VoiceTarget=target;
  try{ if(window.Android&&Android.startSpeechRecognition) Android.startSpeechRecognition(); else v2Host('El reconocimiento de voz no está disponible en este dispositivo.','bad'); }
  catch(_){v2Host('El reconocimiento de voz no está disponible.','bad');}
}
function v2OpenUrl(url){ try{ if(window.Android&&Android.openUrl) Android.openUrl(url); }catch(_){} }

function v2EnsureResponseBar(){
  if($('#responseBar'))return;
  const bar=document.createElement('div'); bar.id='responseBar'; bar.className='responseBar';
  bar.innerHTML=`<button id="voiceBtn" class="voiceBtn">🎙️ RESPONDER</button><input id="responseInput" autocomplete="off" placeholder="Escribe la respuesta…" aria-label="Respuesta"><button id="checkBtn">COMPROBAR</button><button id="teacherBtn" title="Modo docente">🎓</button>`;
  const answers=$('#answers'); answers.parentNode.insertBefore(bar,answers);
  $('#voiceBtn').onclick=()=>v2Speak('main');
  $('#checkBtn').onclick=v2SubmitMainResponse;
  $('#responseInput').addEventListener('keydown',e=>{if(e.key==='Enter')v2SubmitMainResponse();});
  $('#teacherBtn').onclick=v2TeacherMode;
}

function v2SubmitMainResponse(){
  if(phase==='over'||phase==='faceoff'||phase==='sudden')return;
  const input=$('#responseInput'); const text=input.value.trim(); if(!text)return;
  stopTimer(); const m=v2Match(text); input.value='';
  if(m&&m.score>=.84){
    v2Host(`¡Tenemos respuesta! ${m.shortLabel||m.label}`,'good'); v2React(currentTeam,'good');
    const btn=$('#answers').children[m.idx]; revealAnswer(m.idx,btn);
  }else if(m&&m.score>=.64){
    openModal(`<h2>DECISIÓN DEL DOCENTE</h2><p>Se escuchó/escribió: <b>${v2Escape(text)}</b></p><p>¿Aceptar como <b>${v2Escape(m.label)}</b>?</p><div class="menuStack"><button id="acceptNear">✅ ACEPTAR</button><button id="rejectNear">❌ RECHAZAR / STRIKE</button><button id="cancelNear">VOLVER SIN PENALIZAR</button></div>`);
    $('#acceptNear').onclick=()=>{closeModal(false); const btn=$('#answers').children[m.idx]; revealAnswer(m.idx,btn);};
    $('#rejectNear').onclick=()=>{closeModal(false); addStrike('manual');};
    $('#cancelNear').onclick=()=>{closeModal(false); startTimer();};
  }else{
    v2Host('No está en el tablero.','bad'); v2React(currentTeam,'bad'); addStrike('manual');
  }
}

chooseGameQuestions=function(){
  let pool=[...questionPool];
  try{const custom=JSON.parse(localStorage.getItem('dentistas-custom-questions')||'[]'); if(Array.isArray(custom)) pool.push(...custom); }catch(_){}
  if(v2Category!=='GENERAL') pool=pool.filter(q=>(q.cat||'').toUpperCase()===v2Category);
  if(v2Difficulty!=='TODAS') pool=pool.filter(q=>{const n=q.a.length; return v2Difficulty==='BASICA'?n<=3:v2Difficulty==='INTERMEDIA'?n===4:n>=5;});
  let recent=[]; try{recent=JSON.parse(localStorage.getItem('dentistas-recent-questions')||'[]');}catch(_){}
  let fresh=pool.filter(q=>!recent.includes(q.q)); if(fresh.length<GAME_SIZE) fresh=pool;
  const byCat={}; shuffle(fresh).forEach(q=>{const c=q.cat||'Ortodoncia y funciones orales';(byCat[c]??=[]).push(q);});
  const chosen=[]; const cats=shuffle(Object.keys(byCat));
  while(chosen.length<GAME_SIZE&&cats.length){ const c=cats.shift(); if(byCat[c].length) chosen.push(byCat[c].shift()); }
  if(chosen.length<GAME_SIZE){ shuffle(fresh).forEach(q=>{if(chosen.length<GAME_SIZE&&!chosen.includes(q))chosen.push(q);}); }
  questions=chosen.slice(0,GAME_SIZE);
  const next=[...questions.map(q=>q.q),...recent].filter((v,i,a)=>a.indexOf(v)===i).slice(0,RECENT_LIMIT);
  localStorage.setItem('dentistas-recent-questions',JSON.stringify(next));
};

const v2OriginalPlay=play;
play=function(sound){ if(v2Sound) v2OriginalPlay(sound); };

startTimer=function(){
  stopTimer(); if(v2Paused||phase==='over'||!gameVisible()){updateTimerUI();return;}
  timerRemaining=v2TimerSeconds; updateTimerUI();
  timerHandle=setInterval(()=>{timerRemaining-=1;updateTimerUI();if(timerRemaining<=3&&timerRemaining>0){v2Beep(540+timerRemaining*90,.07);v2Host(`¡${timerRemaining}!`,'tense');}if(timerRemaining<=0){stopTimer();v2Beep(180,.18);addStrike('timeout');}},1000);
};

const v2OriginalShowRound=showRound;
showRound=function(reset=true){
  v2OriginalShowRound(reset); v2EnsureResponseBar(); v2RoundStartScores=[...scores];
  v2Host(`Ronda ${roundIndex+1}. ${roundMultiplier()}${roundMultiplier()>1?' veces los puntos.':''}`,'normal');
  if(reset) setTimeout(()=>v2StartFaceoff(false),120);
};
const v2OriginalReveal=revealAnswer;
revealAnswer=function(idx,btn){
  const team=currentTeam; v2OriginalReveal(idx,btn); v2React(team,'good');
  if(phase!=='over') v2Host('¡Respuesta correcta! El reloj vuelve a empezar.','good');
};
const v2OriginalStrike=addStrike;
addStrike=function(reason='manual'){
  const before=strikes,team=currentTeam; v2OriginalStrike(reason); v2React(team,'bad');
  if(reason==='timeout')v2Host('¡Tiempo! Se marca un error.','bad'); else v2Host(`Error ${Math.min(before+1,3)} de 3.`,'bad');
};

function v2RecordRound(){
  const delta=[scores[0]-v2RoundStartScores[0],scores[1]-v2RoundStartScores[1]];
  if(!v2RoundHistory.some(r=>r.round===roundIndex+1)) v2RoundHistory.push({round:roundIndex+1,mult:roundMultiplier(),delta,q:questions[roundIndex]?.q||''});
}
const v2OriginalNext=nextRound;
nextRound=function(){v2RecordRound();v2OriginalNext();};

function v2StartFaceoff(sudden=false){
  if(phase==='over'&&!sudden)return;
  stopTimer(); v2Faceoff={sudden,answers:['','']};
  openModal(`<h2>${sudden?'⚡ MUERTE SÚBITA':'🎤 CAREO'}</h2><p>${sudden?'Una pregunta decide el juego.':'Un jugador de cada equipo responde. La respuesta con mayor valor obtiene el control.'}</p><div class="faceoffGrid"><label>${v2Escape(teamNames[0])}<div class="faceInput"><input id="faceInput1" placeholder="Respuesta equipo 1"><button id="faceMic1">🎙️</button></div></label><label>${v2Escape(teamNames[1])}<div class="faceInput"><input id="faceInput2" placeholder="Respuesta equipo 2"><button id="faceMic2">🎙️</button></div></label></div><button id="resolveFace" class="setupStart">RESOLVER CAREO</button><button id="skipFace" class="secondaryWide">OMITIR CAREO · DECIDE DOCENTE</button>`);
  $('#faceMic1').onclick=()=>v2Speak('face1'); $('#faceMic2').onclick=()=>v2Speak('face2');
  $('#resolveFace').onclick=()=>v2ResolveFaceoff(sudden);
  $('#skipFace').onclick=()=>{openModal(`<h2>¿QUIÉN OBTIENE EL CONTROL?</h2><div class="menuStack"><button id="give1">${v2Escape(teamNames[0])}</button><button id="give2">${v2Escape(teamNames[1])}</button></div>`);$('#give1').onclick=()=>v2GiveControl(0,sudden);$('#give2').onclick=()=>v2GiveControl(1,sudden);};
}
function v2ResolveFaceoff(sudden){
  const a1=$('#faceInput1').value.trim(),a2=$('#faceInput2').value.trim(); const q=questions[roundIndex];
  const m1=v2Match(a1,q),m2=v2Match(a2,q); const ok1=m1&&m1.score>=.64,ok2=m2&&m2.score>=.64;
  if(sudden){
    if(ok1&&!ok2)return v2DeclareWinner(0,true); if(ok2&&!ok1)return v2DeclareWinner(1,true);
    if(ok1&&ok2&&m1.points!==m2.points)return v2DeclareWinner(m1.points>m2.points?0:1,true);
    openModal(`<h2>CAREO EMPATADO</h2><p>El docente decide quién respondió mejor.</p><div class="menuStack"><button id="sd1">${v2Escape(teamNames[0])}</button><button id="sd2">${v2Escape(teamNames[1])}</button><button id="sdAgain">OTRA RESPUESTA</button></div>`); $('#sd1').onclick=()=>v2DeclareWinner(0,true);$('#sd2').onclick=()=>v2DeclareWinner(1,true);$('#sdAgain').onclick=()=>v2StartFaceoff(true); return;
  }
  if(!ok1&&!ok2){openModal(`<h2>SIN RESPUESTA DEL TABLERO</h2><p>El docente puede repetir el careo o elegir quién inicia.</p><div class="menuStack"><button id="redoFace">REPETIR</button><button id="pick1">${v2Escape(teamNames[0])}</button><button id="pick2">${v2Escape(teamNames[1])}</button></div>`);$('#redoFace').onclick=()=>v2StartFaceoff(false);$('#pick1').onclick=()=>v2GiveControl(0,false);$('#pick2').onclick=()=>v2GiveControl(1,false);return;}
  let winner=ok1&&!ok2?0:ok2&&!ok1?1:(m1.points>=m2.points?0:1); v2GiveControl(winner,false);
}
function v2GiveControl(team,sudden){
  if(sudden)return v2DeclareWinner(team,true); currentTeam=team; phase='play';closeModal(false);updateTurnUI();v2Host(`${teamNames[team]} gana el careo. ¿Jugar o pasar?`,'good');
  openModal(`<h2>${v2Escape(teamNames[team])} GANA EL CAREO</h2><p>¿Qué desean hacer?</p><div class="menuStack"><button id="facePlay">▶ JUGAR</button><button id="facePass">↪ PASAR AL RIVAL</button></div>`);
  $('#facePlay').onclick=()=>{closeModal(false);currentTeam=team;updateTurnUI();startTimer();};
  $('#facePass').onclick=()=>{closeModal(false);currentTeam=1-team;updateTurnUI();startTimer();};
}

function v2QuestionInfo(){
  const q=questions[roundIndex]; if(!q)return;
  const cat=q.cat||q.specialty||'Odontología';
  const fallback=V2_SOURCES[cat]||V2_SOURCES['Ortodoncia y funciones orales'];
  const sourceUrl=q.source||fallback[1];
  const sourceLabel=q.source?'Fuente clínica/indexada asociada a esta pregunta':fallback[0];
  const level=q.difficulty==='basic'?'Básica':q.difficulty==='intermediate'?'Media':q.difficulty==='advanced'?'Extra difícil':'No etiquetada';
  openModal(`<h2>📚 EXPLICACIÓN Y FUENTE</h2><p><b>${v2Escape(q.q)}</b></p><p>En este tablero se aceptan como respuestas correctas: <b>${q.a.map(x=>v2Escape(x[0])).join(', ')}</b>.</p><p>Los puntos son una ponderación didáctica del juego; no representan resultados de una encuesta real a dentistas.</p><p><b>Área:</b> ${v2Escape(cat)} · <b>Nivel:</b> ${v2Escape(level)}</p><p><b>Fuente de referencia:</b> ${v2Escape(sourceLabel)}</p><button id="openSource" class="setupStart">ABRIR FUENTE EN EL NAVEGADOR</button>`);
  $('#openSource').onclick=()=>v2OpenUrl(sourceUrl);
}

function v2TeacherMode(){
  stopTimer();
  openModal(`<h2>🎓 MODO DOCENTE</h2><div class="teacherGrid"><button id="tPause">${v2Paused?'▶ REANUDAR':'⏸ PAUSAR'}</button><button id="tInfo">📚 EXPLICACIÓN/FUENTE</button><button id="tReveal">👁 REVELAR TODAS</button><button id="tStrikePlus">✖ AÑADIR STRIKE</button><button id="tStrikeMinus">↩ QUITAR STRIKE</button><button id="tTeam">🔁 CAMBIAR TURNO</button><button id="tAddQ">➕ NUEVA PREGUNTA</button><button id="tImport">📥 IMPORTAR JSON</button><button id="tExport">📤 VER JSON PERSONAL</button><button id="tSettings">⚙️ ACCESIBILIDAD</button></div>`);
  $('#tPause').onclick=()=>{v2Paused=!v2Paused;closeModal(false);if(!v2Paused)startTimer();else updateTimerUI();};
  $('#tInfo').onclick=v2QuestionInfo;
  $('#tReveal').onclick=()=>{closeModal(false);[...$('#answers').children].forEach((b,i)=>{if(!revealed[i]){revealed[i]=true;b.classList.remove('covered');b.classList.add('revealed');}});v2Paused=true;stopTimer();};
  $('#tStrikePlus').onclick=()=>{closeModal(false);addStrike('manual');};
  $('#tStrikeMinus').onclick=()=>{strikes=Math.max(0,strikes-1);updateStrikesUI();closeModal(false);startTimer();};
  $('#tTeam').onclick=()=>{currentTeam=1-currentTeam;updateTurnUI();closeModal(false);startTimer();};
  $('#tAddQ').onclick=v2NewQuestionForm; $('#tImport').onclick=v2ImportQuestions; $('#tExport').onclick=v2ExportQuestions; $('#tSettings').onclick=v2Settings;
}
function v2NewQuestionForm(){
  openModal(`<h2>➕ NUEVA PREGUNTA LOCAL</h2><input id="newQQ" class="wideInput" placeholder="Pregunta"><input id="newQCat" class="wideInput" placeholder="Categoría" value="Personal"><textarea id="newQAnswers" class="wideArea" placeholder="Una respuesta por línea: Respuesta | puntos\nLos puntos deben sumar 100 y debe haber 3–5 respuestas."></textarea><button id="saveNewQ" class="setupStart">GUARDAR EN ESTE DISPOSITIVO</button>`);
  $('#saveNewQ').onclick=()=>{const q=$('#newQQ').value.trim(),cat=$('#newQCat').value.trim()||'Personal';const lines=$('#newQAnswers').value.split('\n').map(x=>x.trim()).filter(Boolean);const a=lines.map(l=>{const p=l.split('|');return [p[0].trim(),Number(p[1])];});if(!q||a.length<3||a.length>5||a.some(x=>!x[0]||!Number.isFinite(x[1]))||a.reduce((s,x)=>s+x[1],0)!==100){alert('Revisa: 3–5 respuestas y exactamente 100 puntos.');return;}let list=[];try{list=JSON.parse(localStorage.getItem('dentistas-custom-questions')||'[]');}catch(_){}list.push({cat,q,a});localStorage.setItem('dentistas-custom-questions',JSON.stringify(list));closeModal(false);v2Host('Pregunta guardada localmente.','good');};
}
function v2ImportQuestions(){
  openModal(`<h2>📥 IMPORTAR PREGUNTAS JSON</h2><p>Formato: [{"cat":"...","q":"...","a":[["Respuesta",40],...] }]</p><textarea id="importJSON" class="wideArea"></textarea><button id="doImport" class="setupStart">VALIDAR E IMPORTAR</button>`);
  $('#doImport').onclick=()=>{try{const list=JSON.parse($('#importJSON').value);if(!Array.isArray(list))throw Error('Debe ser una lista');list.forEach(q=>{if(!q.q||!Array.isArray(q.a)||q.a.length<3||q.a.length>5||q.a.reduce((s,x)=>s+Number(x[1]||0),0)!==100)throw Error('Hay una pregunta inválida');});localStorage.setItem('dentistas-custom-questions',JSON.stringify(list));closeModal(false);alert(`${list.length} preguntas personales importadas.`);}catch(e){alert(`No se pudo importar: ${e.message}`);}};
}
function v2ExportQuestions(){let list=[];try{list=JSON.parse(localStorage.getItem('dentistas-custom-questions')||'[]');}catch(_){}openModal(`<h2>📤 PREGUNTAS PERSONALES</h2><textarea class="wideArea" readonly>${v2Escape(JSON.stringify(list,null,2))}</textarea>`);}
function v2Settings(){
  openModal(`<h2>⚙️ ACCESIBILIDAD</h2><label class="settingRow">Tiempo por respuesta <select id="setTimer"><option>10</option><option>15</option><option>20</option><option>30</option></select></label><label class="settingRow"><input id="setSound" type="checkbox" ${v2Sound?'checked':''}> Sonidos</label><label class="settingRow"><input id="setMotion" type="checkbox" ${document.documentElement.classList.contains('reduceMotion')?'checked':''}> Reducir animaciones</label><label class="settingRow"><input id="setText" type="checkbox" ${document.documentElement.classList.contains('largeText')?'checked':''}> Texto grande</label><button id="saveSettings" class="setupStart">GUARDAR</button>`);$('#setTimer').value=String(v2TimerSeconds);$('#saveSettings').onclick=()=>{v2TimerSeconds=Number($('#setTimer').value);v2Sound=$('#setSound').checked;document.documentElement.classList.toggle('reduceMotion',$('#setMotion').checked);document.documentElement.classList.toggle('largeText',$('#setText').checked);v2SaveSettings();closeModal(false);if(gameVisible()&&phase!=='over')startTimer();};
}

function v2StartStudy(){
  let pool=shuffle(questionPool).slice(0,10); v2Study={pool,index:0,correct:0}; v2ShowStudy();
}
function v2ShowStudy(){
  const s=v2Study,q=s.pool[s.index]; openModal(`<h2>📖 MODO ESTUDIO · ${s.index+1}/10</h2><p><b>${v2Escape(q.q)}</b></p><div class="faceInput"><input id="studyInput" placeholder="Escribe una respuesta"><button id="studyMic">🎙️</button></div><button id="studyCheck" class="setupStart">COMPROBAR</button><p>Aciertos: <b>${s.correct}</b></p>`);$('#studyMic').onclick=()=>v2Speak('study');$('#studyCheck').onclick=()=>{const text=$('#studyInput').value;const fakeRevealed=revealed;revealed=Array(q.a.length).fill(false);const m=v2Match(text,q);revealed=fakeRevealed;const ok=m&&m.score>=.64;if(ok)s.correct++;openModal(`<h2>${ok?'✅ CORRECTO':'❌ NO COINCIDE'}</h2><p>Respuestas aceptadas: <b>${q.a.map(x=>v2Escape(x[0])).join(', ')}</b>.</p><button id="studyNext" class="setupStart">${s.index===9?'VER RESULTADO':'SIGUIENTE'}</button>`);$('#studyNext').onclick=()=>{if(s.index===9){openModal(`<h2>📚 RESULTADO</h2><p><b>${s.correct}/10</b> respuestas correctas.</p><button id="studyDone" class="setupStart">VOLVER</button>`);$('#studyDone').onclick=()=>closeModal(false);}else{s.index++;v2ShowStudy();}};};
}

function v2DeclareWinner(winner,sudden=false){
  closeModal(false); const c=typeof characterFor==='function'?characterFor(winner):{icon:'🦷'};
  const art=typeof characterArtHtml==='function'?characterArtHtml(winner):c.icon;
  openModal(`<div class="winnerStage"><div class="winnerCharacters">${art} <span class="trophy">🏆</span></div><div class="winnerName">¡${v2Escape(teamNames[winner])} GANA!</div><div class="winnerScore">${scores[winner]} PUNTOS${sudden?' · MUERTE SÚBITA':''}</div></div>${v2ResultsTable()}<div class="menuStack"><button id="mAgainV2">OTRA PARTIDA</button><button id="mHomeV2">VOLVER A PORTADA</button></div>`);$('#mAgainV2').onclick=()=>{closeModal(false);v2RoundHistory=[];startNewGame();};$('#mHomeV2').onclick=()=>{closeModal(false);$('#game').classList.add('hidden');$('#home').classList.remove('hidden');};
}
function v2ResultsTable(){
  if(!v2RoundHistory.length)return''; return `<div class="resultTable">${v2RoundHistory.map(r=>`<div><span>R${r.round} ×${r.mult}</span><b>${r.delta[0]>=0?'+':''}${r.delta[0]}</b><b>${r.delta[1]>=0?'+':''}${r.delta[1]}</b></div>`).join('')}<div class="resultTotal"><span>TOTAL</span><b>${scores[0]}</b><b>${scores[1]}</b></div></div>`;
}
finishGame=function(){
  stopTimer();phase='over';updateTurnUI();v2RecordRound();
  if(scores[0]===scores[1]){
    const used=new Set(questions.map(q=>q.q));const suddenBase=(typeof spFilteredBank==='function'?spFilteredBank(typeof specialtySelected==='string'?specialtySelected:'general'):questionPool);const q=shuffle(suddenBase.filter(x=>!used.has(x.q)))[0]||shuffle(suddenBase)[0]||shuffle(questionPool)[0];questions.push(q);roundIndex=questions.length-1;revealed=Array(q.a.length).fill(false);phase='sudden';$('#question').textContent=q.q;$('#round').textContent='⚡ MUERTE SÚBITA';$('#progress').textContent='DESEMPATE';const box=$('#answers');box.innerHTML='';q.a.forEach((answer,idx)=>{const b=document.createElement('button');b.className='answer covered';const displayLabel=v2ShortLabel(answer[0]);b.innerHTML=`<span class="num">${idx+1}</span><span class="txt" title="${v2Escape(answer[0])}">${v2Escape(displayLabel)}</span><span class="pts">${answer[1]}</span>`;box.appendChild(b);});updateTurnUI();v2StartFaceoff(true);return;
  }
  v2DeclareWinner(scores[0]>scores[1]?0:1,false);
};

if(typeof showCharacterSetup==='function'){
  const origSetup=showCharacterSetup;
  showCharacterSetup=function(){origSetup();const btn=$('#confirmTeams');if(!btn)return;const controls=document.createElement('div');controls.className='setupOptions';controls.innerHTML=`<label>Modalidad<select id="setupCategory"><option value="GENERAL">Odontología general</option>${[...new Set(questionPool.map(q=>q.cat).filter(Boolean))].sort().map(c=>`<option value="${v2Escape(c.toUpperCase())}">${v2Escape(c)}</option>`).join('')}</select></label><label>Dificultad<select id="setupDifficulty"><option value="TODAS">Mezcla</option><option value="BASICA">Básica</option><option value="INTERMEDIA">Intermedia</option><option value="AVANZADA">Avanzada</option></select></label></div>`;btn.parentNode.insertBefore(controls,btn);$('#setupCategory').onchange=e=>v2Category=e.target.value;$('#setupDifficulty').onchange=e=>v2Difficulty=e.target.value;};
}

(function initV2(){
  const home=$('.homeActions'); if(home&&!$('#studyStart')){const b=document.createElement('button');b.id='studyStart';b.textContent='📖 MODO ESTUDIO';b.onclick=v2StartStudy;home.appendChild(b);}
  v2EnsureResponseBar();
  const info=document.createElement('button');info.id='infoBtn';info.className='iconBtn infoBtn';info.textContent='📚';info.title='Explicación y fuente';info.onclick=v2QuestionInfo;const menu=$('#menu');if(menu)menu.parentNode.insertBefore(info,menu);
  const ver=document.createElement('div');ver.className='bankVersion';ver.textContent=`Banco clínico v1.0 · ${V2_VERSION}`;const game=$('#game');if(game)game.appendChild(ver);
})();
