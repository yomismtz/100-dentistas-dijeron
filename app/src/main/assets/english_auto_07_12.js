/* English translation layer for categories 7-12.
   Uses dental terminology and sentence templates rather than blind substring replacement.
   It is intentionally scoped to ORG7-ORG12. */
(function(){
  const P = [
    ["¿Qué elementos son fundamentales para establecer ","What elements are essential for establishing "],
    ["¿Qué elementos permiten identificar ","What elements help identify "],
    ["¿Qué elementos permiten valorar ","What elements help assess "],
    ["¿Qué aspectos deben considerarse al analizar ","What aspects should be considered when analyzing "],
    ["¿Qué aspectos deben considerarse para ","What aspects should be considered regarding "],
    ["¿Qué factores son fundamentales para valorar ","What factors are essential when assessing "],
    ["¿Qué factores son relevantes al evaluar ","What factors are relevant when evaluating "],
    ["¿Qué hallazgos pueden apoyar el diagnóstico de ","What findings may support the diagnosis of "],
    ["¿Qué hallazgos pueden asociarse con ","What findings may be associated with "],
    ["¿Qué características pueden acompañar ","What features may accompany "],
    ["¿Qué información permite identificar correctamente ","What information helps correctly identify "],
    ["¿Qué información debe quedar clara al registrar ","What information should be clearly documented when recording "],
    ["¿Qué información debe documentarse ","What information should be documented "],
    ["¿Qué datos deben registrarse ","What data should be recorded "],
    ["¿Qué datos pueden registrarse ","What data can be recorded "],
    ["¿Qué elementos forman parte de ","What elements are part of "],
    ["¿Qué componentes forman parte de ","What components are part of "],
    ["¿Qué características deben observarse ","What features should be observed "],
    ["¿Qué hallazgos deben observarse ","What findings should be observed "],
    ["¿Qué aspectos pueden evaluarse ","What aspects can be evaluated "],
    ["¿Qué parámetros pueden formar parte de ","What parameters may be included in "],
    ["¿Qué parámetros ayudan a ","What parameters help "],
    ["¿Qué información puede ","What information can "],
    ["¿Qué factores deben considerarse ","What factors should be considered "],
    ["¿Qué factores pueden ","What factors can "],
    ["¿Qué debe evaluarse ","What should be evaluated "],
    ["¿Qué debe determinarse ","What should be determined "],
    ["¿Qué debe considerarse ","What should be considered "],
    ["¿Qué debe revisarse ","What should be reviewed "],
    ["¿Qué debe conocerse ","What should be known "],
    ["¿Qué puede acompañar ","What may accompany "],
    ["¿Qué puede producir ","What may produce "],
    ["¿Qué caracteriza ","What characterizes "],
    ["¿Qué describe correctamente ","What correctly describes "],
    ["¿Qué describe ","What describes "],
    ["¿Qué información aporta ","What information does ... provide "],
    ["¿Qué aporta ","What does ... provide "],
    ["¿Qué objetivos tiene ","What are the objectives of "],
    ["¿Qué objetivos debe cumplir ","What objectives should "],
    ["¿Qué funciones cumple ","What functions does "],
    ["¿Qué características hacen útil ","What characteristics make "],
    ["¿Qué función cumple ","What function does "],
    ["¿Qué puede incluir ","What may include "],
    ["¿Qué puede ocurrir ","What may occur "],
    ["¿Qué relación existe entre ","What is the relationship between "],
    ["¿Qué relación puede existir entre ","What relationship may exist between "],
    ["¿Qué diferencia debe hacerse ","What distinction should be made "],
    ["¿Qué enfoque es apropiado ","What approach is appropriate "],
    ["¿Qué principio debe ","What principle should "],
    ["¿Qué tipo de ","What type of "],
    ["¿Qué tipos de ","What types of "],
    ["¿Qué cambios ","What changes "],
    ["¿Qué signos ","What signs "],
    ["¿Qué pruebas ","What tests "],
    ["¿Qué métodos ","What methods "],
    ["¿Qué variables ","What variables "],
    ["¿Qué aspectos ","What aspects "],
    ["¿Qué elementos ","What elements "],
    ["¿Qué hallazgos ","What findings "],
    ["¿Qué información ","What information "],
    ["¿Qué características ","What features "],
    ["¿Qué factores ","What factors "],
    ["¿Qué debe ","What should "],
    ["¿Qué puede ","What may "],
    ["¿Qué afirmaciones son correctas sobre ","Which statements are correct about "],
    ["¿Qué afirmaciones son compatibles con ","Which statements are consistent with "],
    ["¿Qué elementos se revisan al describir ","What elements are reviewed when describing "],
    ["¿Qué elementos intervienen en la interpretación de ","What elements are involved in interpreting "],
    ["¿Cómo se interpreta clínicamente ","How is ... interpreted clinically "],
    ["¿Cómo se utiliza ","How is ... used "],
    ["¿Cómo se evalúa clínicamente ","How is ... evaluated clinically "],
    ["¿Cómo puede describirse ","How can ... be described "],
    ["¿Cómo se caracteriza ","How is ... characterized "],
    ["¿Cómo se registra ","How is ... recorded "],
    ["¿Por qué ","Why "],
    ["¿Cuándo ","When "],
    ["¿Cuál es ","What is "],
    ["¿Cuáles son ","What are "],
    ["Menciona un tipo de ","Name a type of "],
    ["Menciona una ","Name a "],
    ["Menciona un ","Name a "]
  ];

  const T = {
    "succión digital":"thumb/finger sucking","succión digital persistente":"persistent thumb/finger sucking",
    "succión digital crónica":"chronic thumb/finger sucking","uso prolongado del chupón":"prolonged pacifier use",
    "chupón":"pacifier","interposición lingual":"tongue interposition","interposición de la lengua entre incisivos":"tongue interposition between the incisors",
    "empuje lingual":"tongue thrust","empuje lingual anterior":"anterior tongue thrust","postura lingual":"tongue posture",
    "respiración oral":"mouth breathing","respiración nasal":"nasal breathing","permeabilidad nasal":"nasal patency",
    "obstrucción nasal o nasofaríngea":"nasal or nasopharyngeal obstruction","vía aérea superior":"upper airway",
    "postura labial abierta":"open-lip posture","sellado labial":"lip seal","incompetencia labial":"lip incompetence",
    "bruxismo del sueño":"sleep bruxism","bruxismo":"bruxism","masticatorios":"masticatory",
    "actividad repetitiva de los músculos masticatorios durante el sueño":"repetitive masticatory muscle activity during sleep",
    "desgaste dental":"tooth wear","fatiga o dolor muscular":"muscle fatigue or pain",
    "onicofagia":"nail biting","morder las uñas":"nail biting","tejidos periungueales":"periungual tissues",
    "mordedura":"biting","labio inferior":"lower lip","presión repetida del labio sobre los incisivos":"repeated lip pressure against the incisors",
    "lado preferido de masticación":"preferred chewing side","masticación unilateral":"unilateral chewing",
    "asimetría funcional de los contactos":"functional contact asymmetry","interferencia oclusal":"occlusal interference",
    "deglución":"swallowing","deglución funcional madura":"mature swallowing function","deglución atípica":"atypical swallowing",
    "músculos orofaciales":"orofacial muscles","tejidos blandos":"soft tissues","mucosa":"mucosa",
    "maloclusión":"malocclusion","oclusión":"occlusion","mordida abierta anterior":"anterior open bite",
    "mordida cruzada posterior":"posterior crossbite","mordida cruzada anterior":"anterior crossbite",
    "aumento del resalte":"increased overjet","aumento del resalte horizontal":"increased overjet",
    "sobremordida":"overbite","resalte horizontal":"overjet","posición incisiva":"incisor position",
    "incisivos superiores":"upper incisors","incisivos":"incisors","dientes":"teeth","diente":"tooth",
    "dentición":"dentition","crecimiento":"growth","desarrollo":"development","periodo de desarrollo":"developmental period",
    "frecuencia y duración":"frequency and duration","duración y frecuencia":"duration and frequency",
    "frecuencia y duración del hábito":"habit frequency and duration","duración del hábito":"habit duration",
    "exposición acumulada":"cumulative exposure","historia clínica":"clinical history","examen clínico":"clinical examination",
    "examen funcional":"functional examination","diagnóstico":"diagnosis","diagnóstico diferencial":"differential diagnosis",
    "pronóstico":"prognosis","tratamiento":"treatment","manejo":"management","evaluación":"evaluation",
    "hallazgo clínico":"clinical finding","hallazgos clínicos":"clinical findings","hallazgo":"finding","hallazgos":"findings",
    "tejidos periodontales":"periodontal tissues","periodonto":"periodontium","encía":"gingiva",
    "periodontitis apical sintomática":"symptomatic apical periodontitis","absceso apical agudo":"acute apical abscess",
    "necrosis pulpar":"pulp necrosis","pulpitis irreversible sintomática":"symptomatic irreversible pulpitis",
    "estado pulpar":"pulpal status","pruebas pulpares y periapicales":"pulpal and periapical tests",
    "longitud de trabajo":"working length","conductos radiculares":"root canals","sistema de conductos":"root canal system",
    "aislamiento absoluto":"rubber dam isolation","cavidad de acceso endodóntico":"endodontic access cavity",
    "preparación químico-mecánica":"chemo-mechanical preparation","irrigación":"irrigation",
    "hipoclorito de sodio":"sodium hypochlorite","irrigante":"irrigant","irrigantes":"irrigants",
    "capa de barrillo":"smear layer","gutapercha":"gutta-percha","sellador endodóntico":"endodontic sealer",
    "medicamento intraconducto":"intracanal medicament","obturación":"obturation","tratamiento de conductos":"root canal treatment",
    "urgencia endodóntica":"endodontic emergency","traumatismo dental":"dental trauma","compromiso pulpar":"pulpal involvement",
    "radiografía":"radiograph","imagen radiográfica":"radiographic image","tejidos periapicales":"periapical tissues",
    "anatomía radicular":"root anatomy","cambios óseos":"bone changes","dolor a la percusión":"pain on percussion",
    "dolor a la palpación apical":"pain on apical palpation","sensación de diente elevado":"feeling of an extruded tooth",
    "tumefacción":"swelling","acumulación de pus":"pus accumulation","ausencia de respuesta a pruebas de sensibilidad":"absence of response to sensibility tests",
    "ortodoncia":"orthodontics","ortopedia maxilar":"maxillary orthopedics","aparatología fija":"fixed orthodontic appliances",
    "aparatología removible":"removable appliances","aparato funcional":"functional appliance","máscara facial":"facemask",
    "disyunción maxilar":"maxillary expansion","expansión maxilar":"maxillary expansion","expansión transversal":"transverse expansion",
    "Clase I":"Class I","Clase II":"Class II","Clase III":"Class III","relación molar":"molar relationship",
    "relación canina":"canine relationship","mordida":"bite","apiñamiento dental":"dental crowding","diastema":"diastema",
    "curva de Spee":"curve of Spee","curva de Wilson":"curve of Wilson","línea media":"midline",
    "cefalometría":"cephalometry","ángulo SNA":"SNA angle","ángulo SNB":"SNB angle","ángulo ANB":"ANB angle",
    "ángulo SN-GoGn":"SN-GoGn angle","análisis de Wits":"Wits appraisal","relación esquelética sagital":"sagittal skeletal relationship",
    "crecimiento mandibular":"mandibular growth","crecimiento maxilar":"maxillary growth",
    "anclaje ortodóncico":"orthodontic anchorage","brackets":"brackets","arco de alambre":"archwire",
    "ligaduras":"ligatures","tubos molares":"molar tubes","ortodoncia interceptiva":"interceptive orthodontics",
    "mantenedor de espacio":"space maintainer","mantenedores de espacio":"space maintainers","cubeta":"tray",
    "cubeta de impresión":"impression tray","material de impresión":"impression material","materiales de impresión":"impression materials",
    "alginato":"alginate","silicona por adición":"addition silicone","silicona por condensación":"condensation silicone",
    "poliéter":"polyether","yeso piedra":"dental stone","modelo de estudio":"study cast","modelos de estudio":"study casts",
    "registro intermaxilar":"intermaxillary record","fotografía frontal":"frontal photograph","fotografía de perfil":"profile photograph",
    "fotografías intraorales":"intraoral photographs","odontograma":"dental chart","periodontograma":"periodontal chart",
    "consentimiento informado":"informed consent","confidencialidad":"confidentiality","datos personales":"personal data",
    "presión arterial":"blood pressure","frecuencia cardiaca":"heart rate","temperatura":"temperature",
    "frecuencia respiratoria":"respiratory rate","alergias":"allergies","medicación actual":"current medications",
    "antecedentes heredofamiliares":"family medical history","antecedentes personales patológicos":"personal medical history",
    "motivo de consulta":"chief complaint","referencia clínica":"clinical referral","nota de evolución":"progress note",
    "nota postoperatoria":"postoperative note","estudio de imagen":"imaging study",
    "nombre completo":"full name","número de expediente":"record number","edad":"age","sexo":"sex",
    "diabetes mellitus":"diabetes mellitus","hipertensión arterial":"hypertension","enfermedades cardiovasculares":"cardiovascular diseases",
    "anestésicos locales":"local anesthetics","látex":"latex","alimentos":"foods",
    "nombre del medicamento":"medication name","dosis":"dose","duración del tratamiento":"treatment duration",
    "riesgos":"risks","beneficios":"benefits","alternativas":"alternatives",
    "privacy":"privacy"
  };

  const W = {
    "qué":"what","cuál":"what","cuáles":"which","cómo":"how","por":"by","qué":"what",
    "menciona":"name","tipo":"type","tipos":"types","material":"material","materiales":"materials",
    "paso":"step","pasos":"steps","correcto":"correct","correcta":"correct","adecuado":"appropriate","adecuada":"appropriate",
    "puede":"may","pueden":"may","podría":"could","debe":"should","deben":"should",
    "es":"is","son":"are","tiene":"has","tienen":"have","existe":"exists","hay":"there is",
    "para":"for","durante":"during","antes":"before","después":"after","además":"in addition",
    "según":"according to","ante":"in the presence of","sobre":"about","entre":"between","con":"with","sin":"without",
    "de":"of","del":"of the","la":"the","el":"the","las":"the","los":"the","un":"a","una":"a",
    "y":"and","o":"or","en":"in","al":"to the","por":"by","que":"that","se":"is",
    "efecto":"effect","efectos":"effects","factor":"factor","factores":"factors","aspecto":"aspect","aspectos":"aspects",
    "elemento":"element","elementos":"elements","característica":"feature","características":"features",
    "hallazgo":"finding","hallazgos":"findings","información":"information","datos":"data",
    "evaluar":"evaluate","valorar":"assess","analizar":"analyze","revisar":"review","registrar":"record",
    "documentar":"document","identificar":"identify","establecer":"establish","describir":"describe",
    "relación":"relationship","relaciones":"relationships","posición":"position","cambio":"change","cambios":"changes",
    "aumento":"increase","disminución":"decrease","presencia":"presence","ausencia":"absence",
    "clínico":"clinical","clínica":"clinical","funcional":"functional","función":"function",
    "dental":"dental","dentario":"dental","dentaria":"dental","dentarios":"dental","dentarias":"dental",
    "superiores":"upper","inferiores":"lower","anterior":"anterior","posterior":"posterior",
    "derecho":"right","izquierdo":"left","bilateral":"bilateral","unilateral":"unilateral",
    "infantil":"pediatric","niño":"child","niños":"children","paciente":"patient","pacientes":"patients",
    "persistente":"persistent","prolongado":"prolonged","crónico":"chronic","crónica":"chronic",
    "frecuencia":"frequency","duración":"duration","intensidad":"intensity","edad":"age",
    "crecimiento":"growth","desarrollo":"development","tratamiento":"treatment","manejo":"management",
    "objetivo":"objective","objetivos":"objectives","principio":"principle","principios":"principles",
    "sistema":"system","conducto":"canal","conductos":"canals","tejido":"tissue","tejidos":"tissues",
    "dolor":"pain","inflamación":"inflammation","infección":"infection","sangrado":"bleeding",
    "espacio":"space","espacios":"spaces","arcada":"arch","arcadas":"arches","diente":"tooth","dientes":"teeth",
    "molar":"molar","molares":"molars","incisivo":"incisor","incisivos":"incisors","canino":"canine","caninos":"canines",
    "premolar":"premolar","premolares":"premolars","maxilar":"maxilla","mandíbula":"mandible",
    "paladar":"palate","lengua":"tongue","labio":"lip","labios":"lips","mejilla":"cheek","mejillas":"cheeks",
    "sueño":"sleep","respiración":"breathing","oclusión":"occlusion","maloclusión":"malocclusion"
  };

  function esc(s){return s.replace(/[.*+?^$()|[\]\\]/g,"\\$&");}
  function applyMap(s,map){
    let x=s;
    for(const k of Object.keys(map).sort((a,b)=>b.length-a.length)){
      const re=new RegExp("(?<![\\p{L}\\p{N}])"+esc(k)+"(?![\\p{L}\\p{N}])","giu");
      x=x.replace(re,map[k]);
    }
    return x;
  }

  function translateClause(s){
    let x=s.replace(/^¿|\?$/g,"").trim();
    x=applyMap(x,P.reduce((o,[a,b])=>(o[a]=b,o),{}));
    x=applyMap(x,T);
    x=applyMap(x,W);
    x=x.replace(/\\s+/g," ").replace(/\\s+([,.])/g,"$1").trim();
    return x;
  }

  function translateQuestion(s){
    if(!s)return s;
    let x=s.trim();
    for(const [a,b] of P){
      if(x.startsWith(a)){
        const rest=x.slice(a.length).replace(/\?$/,"").trim();
        const tr=translateClause(rest);
        if(a==="¿Qué información aporta ") return "What information does "+tr+" provide?";
        if(a==="¿Qué aporta ") return "What does "+tr+" provide?";
        if(a==="¿Cómo se interpreta clínicamente ") return "How is "+tr+" interpreted clinically?";
        if(a==="¿Cómo se utiliza ") return "How is "+tr+" used?";
        if(a==="¿Cómo se evalúa clínicamente ") return "How is "+tr+" evaluated clinically?";
        if(a==="¿Qué objetivos debe cumplir ") return "What objectives should "+tr+" meet?";
        if(a==="¿Qué funciones cumple ") return "What functions does "+tr+" perform?";
        if(a==="¿Qué función cumple ") return "What function does "+tr+" serve?";
        if(a==="¿Qué características hacen útil ") return "What characteristics make "+tr+" useful?";
        return b+tr+"?";
      }
    }
    return "What "+translateClause(x)+"?";
  }

  function translateAnswer(s){
    if(!s)return s;
    let x=applyMap(s,T);
    x=applyMap(x,W);
    return x.replace(/\\s+/g," ").trim();
  }

  window.DentistasEnglishAutoTranslate={
    translate:function(s){
      if(!s)return s;
      // Question templates are selected by punctuation/leading wording.
      return /^¿|^Menciona /i.test(s) ? translateQuestion(s) : translateAnswer(s);
    }
  };
})();