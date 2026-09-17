# Validación científica del banco de preguntas

Fecha de revisión: 17 de septiembre de 2026.

## Criterio de esta revisión

La base se revisó con una regla editorial común para todo el juego:

- Cada pregunta debe tener **3 a 5 respuestas correctas**.
- Los puntos base de las respuestas de cada pregunta deben sumar **100**.
- Los puntos son una **ponderación lúdica del juego** para ordenar respuestas más centrales o frecuentes en docencia; **no son porcentajes obtenidos de una encuesta real a 100 dentistas**.
- Se evitó presentar como universal una intervención que depende del diagnóstico o cuya evidencia es limitada. En esos casos se usa redacción como “según el caso”, “cuando está indicado” o “como coadyuvante”.
- Las preguntas que naturalmente solo tienen dos elementos (por ejemplo, los dos puntos del plano de Frankfort) se reformularon a un concepto más amplio para cumplir la mecánica de 3–5 respuestas sin inventar opciones falsas.

## Correcciones relevantes

### Ortodoncia y cefalometría

- **Powell:** se corrigió la lista de ángulos. El análisis incluye nasofrontal, nasofacial, nasomental y mentocervical; se retiró “nasolabial” de esa pregunta.
- **ANB:** se cambió de “diagnósticos que da” a “relaciones esqueléticas sagitales que puede sugerir”, porque ANB debe interpretarse junto con otras variables cefalométricas y clínicas.
- **Bolton:** se reformuló para preguntar qué identifica/cuantifica: relación anterior, relación total y excesos relativos maxilar o mandibular. El stripping o las extracciones son decisiones terapéuticas, no un resultado directo del análisis.
- Se retiraron preguntas binarias o ambiguas sobre Frankfort, S-L y AB-Go-Gn y se sustituyeron por preguntas de planos y medidas cefalométricas con 3–5 respuestas válidas.

Fuentes:
- Hurmerinta K, Rahkamo A, Haavikko K. Comparison between cephalometric classification methods for sagittal jaw relationships. PubMed PMID 9249188. https://pubmed.ncbi.nlm.nih.gov/9249188/
- Bolton/tooth-size discrepancy: PubMed PMID 41939162. https://pubmed.ncbi.nlm.nih.gov/41939162/
- Heusdens M, Dermaut L, Verbeeck R. The effect of tooth size discrepancy on occlusion. PubMed PMID 10672219. https://pubmed.ncbi.nlm.nih.gov/10672219/
- Análisis de Powell del perfil facial en estudiantes de odontología, SciELO. https://scielo.senescyt.gob.ec/scielo.php?pid=S2661-67422025000300070&script=sci_arttext

### Terapia miofuncional y respiración oral

Se eliminaron tratamientos presentados como automáticos y la opción “Perla de Tucat”, para la que no se encontró respaldo suficiente en la búsqueda indexada. La terapia miofuncional se mantiene únicamente con redacción de intervención **según el caso/coadyuvante**, porque las revisiones muestran evidencia heterogénea y de calidad limitada.

Fuentes:
- Systematic review/meta-analysis, PMID 30152171. https://pubmed.ncbi.nlm.nih.gov/30152171/
- Systematic review, PMID 25279527. https://pubmed.ncbi.nlm.nih.gov/25279527/
- Scoping review, PMID 40166722. https://pubmed.ncbi.nlm.nih.gov/40166722/
- Mouth breathing interventions systematic review/meta-analysis, PMID 39815054. https://pubmed.ncbi.nlm.nih.gov/39815054/

### Odontopediatría

La guía de conducta se ajustó a terminología contemporánea de AAPD. Se sustituyó “modelado” en la lista básica por **ask-tell-ask**, manteniendo tell-show-do, refuerzo positivo y distracción.

Fuente:
- American Academy of Pediatric Dentistry. Behavior Guidance for the Pediatric Dental Patient. https://www.aapd.org/research/oral-health-policies--recommendations/behavior-guidance-for-the-pediatric-dental-patient/

### Periodoncia

Se redujo redundancia entre “biofilm” e “higiene deficiente” y se separaron factores clínicamente relevantes como tabaquismo, control glucémico y mantenimiento periodontal. Las preguntas de diagnóstico y terapia se mantuvieron centradas en pérdida de inserción, pérdida ósea, sondaje, sangrado y control de factores de riesgo.

Referencia marco:
- EFP S3 Clinical Practice Guideline for treatment of stage I–III periodontitis. https://www.efp.org/education/continuing-education/clinical-guidelines/

### Patología y medicina oral

Se precisaron las lesiones rojas y las fuentes de trauma crónico. Las formas de candidiasis se conservaron con base en revisiones que incluyen presentaciones pseudomembranosa y eritematosa, y lesiones asociadas como queilitis angular y glositis romboidal media.

Fuentes:
- Candidiasis: Red and White Manifestations in the Oral Cavity. PubMed PMID 30693459. https://pubmed.ncbi.nlm.nih.gov/30693459/
- Classification and clinical manifestations of oral yeast infections. PubMed PMID 2181811. https://pubmed.ncbi.nlm.nih.gov/2181811/

### Implantes y materiales

La pregunta de riesgo periimplantario se actualizó a indicadores con respaldo más consistente: periodontitis, tabaquismo, diabetes/hiperglucemia y falta de mantenimiento preventivo. La clasificación de cerámicas se hizo más específica: feldespática, reforzada con leucita, disilicato de litio y zirconia. En hipersensibilidad dentinaria se priorizaron recesión, desgaste/erosión, abrasión y terapia periodontal con exposición radicular.

Fuentes:
- AO/AAP systematic review/meta-analysis on peri-implant diseases, PubMed PMID 40489307. https://pubmed.ncbi.nlm.nih.gov/40489307/
- Umbrella review of peri-implantitis risk factors, PubMed PMID 38762079. https://pubmed.ncbi.nlm.nih.gov/38762079/
- Ceramic veneers systematic review/meta-analysis, PubMed PMID 39523553. https://pubmed.ncbi.nlm.nih.gov/39523553/
- Chairside CAD/CAM ceramic review, PubMed PMID 41990584. https://pubmed.ncbi.nlm.nih.gov/41990584/
- Dentine hypersensitivity guidelines, PubMed PMID 24147382. https://pubmed.ncbi.nlm.nih.gov/24147382/

### Control de infecciones y radiología

Se conservaron las preguntas que concuerdan con recomendaciones de control de infecciones: limpieza antes de desinfección y esterilización mediante vapor a presión, calor seco o vapor químico insaturado cuando el instrumental es compatible.

Fuente:
- CDC Dental Infection Prevention and Control. https://www.cdc.gov/dental-infection-control/hcp/dental-ipc-faqs/cleaning-disinfecting-environmental-surface.html

## Control automático

El repositorio incluye `scripts/validate_questions.py`. Antes de compilar el APK, GitHub Actions comprueba automáticamente:

1. que existan exactamente 116 preguntas;
2. que cada pregunta tenga entre 3 y 5 respuestas;
3. que no haya preguntas o respuestas duplicadas dentro de su ámbito de validación;
4. que cada respuesta tenga puntuación positiva;
5. que las respuestas de cada pregunta sumen exactamente 100 puntos base.

Si alguna de estas reglas falla, la compilación se detiene y no se genera un APK nuevo.

## Nota sobre “popularidad”

La evidencia científica permite decidir si una respuesta es **correcta**, pero no permite afirmar qué porcentaje de “100 dentistas” la mencionaría. Para que las cifras fueran popularidad real sería necesario aplicar una encuesta a una muestra definida de profesionales y calcular las frecuencias observadas. Hasta entonces, los valores 10–50 del tablero son una ponderación lúdica y didáctica, no una estadística epidemiológica ni una encuesta publicada.
