/* English translation layer for categories 13-18. */
(function(){
const Q=[
["¿Qué debe realizarse ","What should be performed "],["¿Qué datos ayudan a ","What data help "],["¿Qué datos permiten ","What data allow "],
["¿Qué debe confirmarse ","What should be confirmed "],["¿Qué puede modificar ","What may modify "],["¿Qué antecedentes son especialmente relevantes en ","Which history items are especially relevant in "],
["¿Qué información debe registrarse ","What information should be recorded "],["¿Qué integra ","What does ... include "],
["¿Qué hallazgos apoyan ","What findings support "],["¿Qué ayuda al pronóstico ","What helps determine the prognosis of "],["¿Qué registros permiten ","Which records allow "],
["¿Qué es ","What is "],["¿Qué favorece ","What promotes "],["¿Qué cuatro elementos deben considerarse en ","What four elements should be considered in "],
["Al planificar un caso, ¿qué cuatro aspectos son relevantes para ","When planning a case, what four aspects are relevant to "],
["¿Qué debe revisar el clínico para valorar ","What should the clinician review to assess "],
["¿Qué grupo de cuatro criterios resume mejor ","Which group of four criteria best summarizes "],
["¿Qué cuatro elementos caracterizan ","What four elements characterize "],
["Durante el desarrollo dental, ¿qué cuatro aspectos son fundamentales para ","During dental development, what four aspects are fundamental to "],
["¿Qué debe reconocer el estudiante al estudiar ","What should the student recognize when studying "],
["¿Qué cuatro elementos deben considerarse en el enfoque de ","What four elements should be considered in the "],
["¿Qué debe evaluarse ","What should be evaluated "],["¿Qué factores ","What factors "],["¿Qué aspectos ","What aspects "],
["¿Qué características ","What characteristics "],["¿Qué información ","What information "],["¿Qué papel ","What role "],
["¿Cómo ","How "],["¿Por qué ","Why "],["¿Cuándo ","When "]
];
const T={
"cirugía bucal":"oral surgery","cirugía":"surgery","procedimiento quirúrgico":"surgical procedure","procedimiento":"procedure",
"riesgo quirúrgico":"surgical risk","plan quirúrgico":"surgical plan","cirugía oral":"oral surgery",
"historia clínica actualizada":"updated medical history","exploración clínica":"clinical examination","estudios complementarios indicados":"indicated ancillary studies",
"evaluación del riesgo":"risk assessment","plan quirúrgico individualizado":"individualized surgical plan","enfermedades sistémicas":"systemic diseases",
"medicación actual":"current medications","antecedentes relevantes":"relevant history","identidad del paciente":"patient identity",
"consentimiento":"consent","hallazgos anatómicos":"anatomical findings","condiciones sistémicas":"systemic conditions","diagnóstico definitivo":"definitive diagnosis",
"medicamentos":"medications","antecedentes hemorrágicos":"bleeding history","alergias":"allergies","hábitos relevantes":"relevant habits",
"periodontal":"periodontal","evaluación periodontal completa":"complete periodontal assessment","periodontograma":"periodontal chart",
"sondaje periodontal":"periodontal probing","radiografías indicadas":"indicated radiographs","pérdida de inserción":"attachment loss",
"pérdida ósea radiográfica":"radiographic bone loss","bolsas":"pockets","inflamación":"inflammation","severidad":"severity","progresión":"progression",
"biofilm dental":"dental biofilm","factores de riesgo":"risk factors","profundidad de sondaje":"probing depth","sangrado":"bleeding",
"nivel de inserción":"attachment level","movilidad":"mobility","comunidad microbiana adherida":"adherent microbial community","matriz extracelular":"extracellular matrix",
"implante dental":"dental implant","implantes dentales":"dental implants","indicación":"indication","estado sistémico y médico":"systemic and medical status",
"volumen y calidad ósea":"bone volume and quality","condición periodontal":"periodontal condition","objetivo restaurador":"restorative objective",
"enfermedad sistémica no controlada":"uncontrolled systemic disease","infección activa en el sitio":"active infection at the site",
"higiene oral insuficiente":"inadequate oral hygiene","expectativas incompatibles con el tratamiento":"expectations incompatible with treatment",
"enfermedades sistémicas":"systemic diseases","medicación habitual":"regular medications","antecedentes quirúrgicos":"surgical history",
"tabaquismo":"smoking","posición protésica prevista":"planned prosthetic position","espacio interoclusal":"interocclusal space",
"emergencia de la restauración":"restoration emergence","necesidades estéticas y funcionales":"esthetic and functional needs",
"altura disponible":"available height","anchura disponible":"available width",
"origen embrionario":"embryonic origin","tejidos dentales":"dental tissues","epitelio oral ectodérmico":"ectodermal oral epithelium",
"mesénquima derivado de cresta neural":"neural crest-derived mesenchyme","interacciones epitelio-mesénquima":"epithelial-mesenchymal interactions",
"primer arco faríngeo":"first pharyngeal arch","desarrollo dental":"dental development","lámina dental":"dental lamina",
"engrosamiento del epitelio oral":"thickening of the oral epithelium","gérmenes dentarios":"tooth germs","ectomesénquima":"ectomesenchyme",
"patrón de desarrollo de la dentición":"pattern of dentition development","proliferación epitelial":"epithelial proliferation",
"vestíbulo oral":"oral vestibule","degeneración celular central":"central cellular degeneration","separación entre labios o mejillas y arcadas":"separation between the lips or cheeks and the arches",
"epitelio dental":"dental epithelium","invaginación":"invagination","condensación del ectomesénquima":"ectomesenchymal condensation",
"órgano del esmalte":"enamel organ","papila dental":"dental papilla","folículo dental":"dental follicle","esmalte":"enamel","dentina":"dentin",
"pulpa dental":"dental pulp","cemento":"cementum","ligamento periodontal":"periodontal ligament",
"caries":"caries","diagnóstico de caries":"caries diagnosis","evaluación visual y táctil":"visual and tactile assessment",
"actividad y severidad de la lesión":"lesion activity and severity","radiografías cuando estén indicadas":"radiographs when indicated",
"riesgo individual de caries":"individual caries risk","enfoque de mínima intervención":"minimal intervention approach",
"preservación de tejido sano":"preservation of healthy tissue","control de la enfermedad de caries":"caries disease control",
"intervención restauradora cuando esté indicada":"restorative intervention when indicated",
"reparación o mantenimiento de restauraciones cuando sea posible":"repair or maintenance of restorations when possible",
"preservar tejido sano":"preserve healthy tissue","sellado restaurador adecuado":"adequate restorative seal","proteger la pulpa":"protect the pulp",
"profundidad de remoción":"removal depth","valoración pulpar":"pulpal assessment","remoción selectiva apropiada":"appropriate selective removal",
"dentina cercana a la pulpa":"dentin near the pulp","sellado restaurador eficaz":"effective restorative seal",
"control de humedad":"moisture control","visibilidad y acceso":"visibility and access",
"anestésico local":"local anesthetic","anestésicos locales":"local anesthetics","selección del anestésico local":"local anesthetic selection",
"anestesia":"anesthesia","antecedentes médicos":"medical history","peso y edad del paciente":"patient weight and age",
"duración del procedimiento":"procedure duration","tipo de procedimiento":"procedure type","mecanismo de acción":"mechanism of action",
"bloqueo de canales de sodio":"sodium channel blockade","disminución de la propagación del potencial de acción":"decreased propagation of the action potential",
"pérdida reversible de la conducción nerviosa":"reversible loss of nerve conduction","reducción de la transmisión nociceptiva":"reduced nociceptive transmission",
"lidocaína":"lidocaine","mepivacaína":"mepivacaine","prilocaína":"prilocaine","articaína":"articaine","procaína":"procaine",
"benzocaína":"benzocaine","tetracaína":"tetracaine","cloroprocaína":"chloroprocaine","disminución de la absorción sistémica":"decreased systemic absorption",
"prolongación del efecto local":"prolongation of local effect","vasoconstrictor":"vasoconstrictor","epinefrina":"epinephrine",
"toxicidad sistémica":"systemic toxicity","dosis máxima":"maximum dose","aspiración":"aspiration","inyección lenta":"slow injection",
"técnica anestésica":"anesthetic technique","bloqueo nervioso":"nerve block","infiltración":"infiltration"
};
const W={
"qué":"what","qué cuatro":"what four","cuatro":"four","elementos":"elements","aspectos":"aspects","criterios":"criteria","grupo":"group",
"características":"characteristics","datos":"data","información":"information","hallazgos":"findings","factores":"factors",
"debe":"should","deben":"should","puede":"may","pueden":"may","son":"are","es":"is","tiene":"has","tienen":"have",
"para":"for","de":"of","del":"of the","la":"the","el":"the","las":"the","los":"the","un":"a","una":"a","y":"and","o":"or",
"con":"with","sin":"without","durante":"during","antes":"before","después":"after","según":"according to",
"evaluar":"evaluate","valorar":"assess","revisar":"review","considerar":"consider","considerarse":"be considered",
"fundamental":"fundamental","fundamentales":"fundamental","relevante":"relevant","relevantes":"relevant",
"correcto":"correct","correcta":"correct","apropiado":"appropriate","apropiada":"appropriate",
"clínico":"clinical","clínica":"clinical","dental":"dental","dentales":"dental","sistémico":"systemic","sistémica":"systemic",
"actual":"current","individualizado":"individualized","individualizada":"individualized","activo":"active","activa":"active",
"médico":"medical","médica":"medical","oral":"oral","bucal":"oral","periodontal":"periodontal"
};
function esc(s){return s.replace(/[.*+?^$()|[\]\\]/g,"\\$&")}
function map(s,m){let x=s;for(const k of Object.keys(m).sort((a,b)=>b.length-a.length))x=x.replace(new RegExp("(?<![\\p{L}\\p{N}])"+esc(k)+"(?![\\p{L}\\p{N}])","giu"),m[k]);return x.replace(/\\s+/g," ").trim()}
function trTail(s){return map(s.replace(/^¿|\?$/g,"").trim(),T)}
function question(s){for(const [a,b] of Q)if(s.startsWith(a)){let r=trTail(s.slice(a.length).replace(/\?$/,"").trim());if(a.startsWith("Al ")||a.startsWith("Durante "))return b+r+".";return b+r+"?"}return "What "+trTail(s)+"?"}
window.DentistasEnglishAutoTranslate1318={translate:function(s){return /^¿|^Al |^Durante /i.test(s)?question(s):map(s,T)}};
})();
/* Global audit correction layer for categories 13-18. */
(function(){const M={"Qué":"what","qué":"what","Cuál":"what","cuál":"what","características":"characteristics","restauración":"restoration","función":"function","evaluación":"assessment","formación":"formation","odontogénesis":"odontogenesis","lesión":"lesion","planificación":"planning","clínicas":"clinical","información":"information","médica":"medical","colocación":"placement","ósea":"osseous","preparación":"preparation","posición":"position","selección":"selection","odontología":"dentistry","pediátrica":"pediatric","anestésicos":"anesthetics","cálculo":"calculus","atención":"care","relación":"relationship","administración":"administration","diseño":"design","extracción":"extraction","quirúrgica":"surgical","protésica":"prosthetic","anatómicas":"anatomic","integración":"integration","biológica":"biological","diseñado":"designed","oclusión":"occlusion","diagnóstico":"diagnosis","regeneración":"regeneration","lámina":"lamina","retículo":"reticulum","básica":"basic","vías":"pathways","señalización":"signaling","número":"number","interacción":"interaction","mesénquima":"mesenchyme","remoción":"removal","adhesión":"adhesion","ácido":"acid","clínico":"clinical","ionómeros":"glass ionomers","reconstrucción":"reconstruction","fotopolimerización":"light curing","contracción":"shrinkage","polimerización":"polymerization","después":"after","protección":"protection","reparación":"repair","clínica":"clinical","prevención":"prevention","éster":"ester","pediátricos":"pediatric","bupivacaína":"bupivacaine","tópicos":"topical","niños":"children","valoración":"assessment","cicatrización":"healing","luxación":"luxation","útil":"useful","antibióticos":"antibiotics","acompañar":"accompany","guía":"guidance","recesión":"recession","evalúa":"evaluates","furcación":"furcation","endodóntica":"endodontic","endodóntico":"endodontic","terapéuticas":"therapeutic","contaminación":"contamination","técnica":"technique","aséptica":"aseptic","odontosección":"odontectomy","osteotomía":"osteotomy","crítica":"critical","según":"according to","radiográfica":"radiographic","diseñarlo":"design it","células":"cells","remodelación":"remodeling","típico":"typical","propagación":"spread","infección":"infection","colección":"collection","comunicación":"communication","raíces":"roots","está":"is","alteración":"alteration","odontogénico":"odontogenic","histopatología":"histopathology","útiles":"useful","complicación":"complication","surgery":"surgery","consent":"consent","bleeding":"bleeding","antecedentes":"history","riesgo":"risk","medidas":"measures","instrumental":"instruments","reutilizable":"reusable","documentarse":"be documented","explicarse":"be explained","comprobarse":"be checked","comenzar":"begin","opciones":"options","terapéuticas":"therapeutic","contaminación":"contamination","durante":"during","varias":"several","una":"a","un":"a","el":"the","la":"the","los":"the","las":"the","de":"of","del":"of the","y":"and","con":"with","sin":"without","para":"for","por":"by","en":"in","al":"when","que":"that"};function esc(s){return s.replace(/[.*+?^$()|[\\]\\]/g,"\\$&")}function clean(s){let x=String(s||"");for(const k of Object.keys(M).sort((a,b)=>b.length-a.length))x=x.replace(new RegExp("(?<![\\p{L}\\p{N}])"+esc(k)+"(?![\\p{L}\\p{N}])","giu"),M[k]);return x.replace(/^what\s+what\b/i,"what").replace(/\s+/g," ").trim()}const old=window.DentistasEnglishAutoTranslate1318;window.DentistasEnglishAutoTranslate1318={translate:s=>clean(old.translate(s))};})();

(function(){const M={"situación":"situation","posponer":"postpone","principio":"principle","guía":"guidance","contraindicación":"contraindication","anatomía":"anatomy","revisarse":"be reviewed","vigilar":"monitor","evolución":"progression","acumulación":"accumulation","puede":"can","progresión":"progression","rápida":"rapid","alterar":"alter","interpretación":"interpretation","combinación":"combination","pérdida":"loss","objetivos":"objectives","instrumentación":"instrumentation","considerarse":"be considered","antibióticos":"antibiotics","sistémicos":"systemic","aporta":"provides","antiséptico":"antiseptic","signos":"signs","acompañan":"accompany"};function esc(s){return s.replace(/[.*+?^$()|[\\]\\]/g,"\\$&")}function clean(s){let x=String(s||"");for(const k of Object.keys(M).sort((a,b)=>b.length-a.length))x=x.replace(new RegExp("(?<![\\p{L}\\p{N}])"+esc(k)+"(?![\\p{L}\\p{N}])","giu"),M[k]);return x.replace(/\s+/g," ").trim()}const o=window.DentistasEnglishAutoTranslate1318;window.DentistasEnglishAutoTranslate1318={translate:s=>clean(o.translate(s))};})();
