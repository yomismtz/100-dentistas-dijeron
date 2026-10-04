/* Global English cleanup layer for automatic translation banks 07-45. */
(function(){
const M={
"Qué":"what","qué":"what","Cuál":"what","cuál":"what","Cuáles":"which","cuáles":"which","Cómo":"how","cómo":"how",
"como":"as","cuando":"when","deben":"should","debe":"should","pueden":"can","puede":"can","paciente":"patient","pacientes":"patients",
"dientes":"teeth","diente":"tooth","tejidos":"tissues","tejido":"tissue","evaluación":"assessment","evaluacion":"assessment",
"diagnóstico":"diagnosis","diagnostico":"diagnosis","tratamiento":"treatment","selección":"selection","seleccion":"selection",
"prótesis":"prosthesis","protesis":"prosthesis","odontología":"dentistry","odontologia":"dentistry","salud":"health","atención":"care",
"atencion":"care","relación":"relationship","relacion":"relationship","restauración":"restoration","restauracion":"restoration",
"infección":"infection","infeccion":"infection","oclusión":"occlusion","oclusion":"occlusion","farmacología":"pharmacology",
"farmacologia":"pharmacology","anestésicos":"anesthetics","anestesicos":"anesthetics","radiografías":"radiographs","radiografias":"radiographs",
"ejemplos":"examples","salud previa":"previous health history","documentarse":"be documented","signos vitales":"vital signs","mediciones":"measurements",
"mediciones clínicas":"clinical measurements","mediciones clinicas":"clinical measurements","características":"characteristics","caracteristicas":"characteristics",
"hacen":"make","útil":"useful","irrigante":"irrigant","material de obturación":"obturation material","material":"material",
"obturación":"obturation","obturacion":"obturation","features":"features","complicaciones":"complications","asociarse":"be associated",
"asociados":"associated","dientes retenidos":"impacted teeth","objetivos":"objectives","tener":"have","estudio":"study","proporciona":"provides",
"proporcionar":"provide","información":"information","informacion":"information","tridimensional":"three-dimensional","indicado":"indicated",
"indicada":"indicated","lesión oral":"oral lesion","lesion oral":"oral lesion","determina":"determines","determinar":"determine",
"adicional":"additional","tejidos blandos":"soft tissues","blandos":"soft","busca regenerar":"aims to regenerate","regenerar":"regenerate",
"factores importantes":"important factors","estabilidad":"stability","periimplantarios":"peri-implant","aspectos que deben controlarse":"aspects that should be controlled",
"deben controlarse":"should be controlled","implantosoportada":"implant-supported","mantener":"maintain","tras":"after","furcaciones":"furcations",
"influye":"influences","estudio proporciona":"study provides","sodio":"sodium","hipoclorito de sodio":"sodium hypochlorite","gutapercha":"gutta-percha",
"gutta-percha":"gutta-percha","medicamento":"medication","intracanal":"intracanal","family medical history":"family medical history",
"historia clínica":"clinical history","historia clinica":"clinical history","previamente":"previously","vigente":"current","sistemáticamente":"systematically",
"sistematicamente":"systematically","representarse":"be represented","manera":"manner","mediante":"through","formulación":"formulation","formulacion":"formulation",
"sustentar":"support","proporcionarse":"be provided","válido":"valid","valido":"valid","registrada":"recorded","registrado":"recorded",
"procedimiento quirúrgico":"surgical procedure","cirugía":"surgery","cirugia":"surgery","vistas":"views","registros fotográficos":"photographic records",
"fotográficos":"photographic","fotograficos":"photographic","fotografías clínicas":"clinical photographs","fotografias clinicas":"clinical photographs",
"utilizarse":"be used","comparar":"compare","progresión clínica":"clinical progression","progresion clinica":"clinical progression",
"fenómenos":"phenomena","fenomenos":"phenomena","aparatología":"appliances","aparatologia":"appliances","ortodóntica":"orthodontic",
"ortodontica":"orthodontic","anclaje":"anchorage","biomecánica":"biomechanics","biomecanica":"biomechanics","situaciones clínicas":"clinical situations",
"situaciones clinicas":"clinical situations","justificar":"justify","terapéuticas":"therapeutic","terapeuticas":"therapeutic",
"contaminación":"contamination","contaminacion":"contamination","instrumental":"instruments","reutilizable":"reusable",
"varias":"several","una":"a","un":"a","el":"the","la":"the","los":"the","las":"the","de":"of","del":"of the","y":"and","o":"or",
"con":"with","sin":"without","para":"for","por":"by","en":"in","al":"when","sobre":"about","durante":"during","antes":"before","después":"after",
"despues":"after","que":"that","más":"more","mas":"more","según":"according to","segun":"according to","corresponde":"corresponds",
"relaciona":"is related","considerarse":"be considered","revisarse":"be reviewed","valorar":"assess","valoración":"assessment","valoracion":"assessment",
"fundamentales":"fundamental","prevención":"prevention","prevencion":"prevention","higiene":"hygiene","población":"population","poblacion":"population",
"planificación":"planning","planificacion":"planning","historia":"history","función":"function","funcion":"function","adaptación":"adaptation",
"adaptacion":"adaptation","expediente":"record","lesiones":"lesions","enfermedades":"diseases","síntomas":"symptoms","sintomas":"symptoms",
"signos":"signs","principios":"principles","espacio":"space","presión":"pressure","presion":"pressure","método":"method","metodo":"method",
"manejo":"management","recursos":"resources","participación":"participation","participacion":"participation","competencia":"competence",
"protocolo":"protocol","impresión":"impression","impresion":"impression","cubeta":"tray","rodillos":"rims","montaje":"arrangement",
"procesamiento":"processing","polimerización":"polymerization","polimerizacion":"polymerization","rebasado":"relining","mucosa":"mucosa","abrir":"open","datos de identificación":"identification data","datos":"data","identificación":"identification","verificarse":"be verified"
};
function esc(s){return s.replace(/[.*+?^$()|[\]\\]/g,"\\$&")}
function clean(s){
 let x=String(s||"");
 for(const k of Object.keys(M).sort((a,b)=>b.length-a.length))x=x.replace(new RegExp("(?<![\\p{L}\\p{N}])"+esc(k)+"(?![\\p{L}\\p{N}])","giu"),M[k]);
 x=x.replace(/\bwhat\s+what\b/gi,"what").replace(/\bwhat\s+qué\b/gi,"what").replace(/\bwhich\s+which\b/gi,"which");
 x=x.replace(/\s+([?.])/g,"$1").replace(/\?+$/,"?").replace(/\s+/g," ").trim();
 return x;
}
for(const key of ["DentistasEnglishAutoTranslate","DentistasEnglishAutoTranslate1318","DentistasEnglishAutoTranslate1924","DentistasEnglishAutoTranslate2530","DentistasEnglishAutoTranslate31","DentistasEnglishAutoTranslate3245"]){
 const old=window[key]; if(old?.translate) window[key]={translate:s=>clean(old.translate(s))};
}
})();