# Catálogo maestro de categorías clínicas

**Versión:** 1.0 · **Rama:** `chatgpt/recovery-2026-09-22`  
**Alcance:** auditoría de las categorías visibles en los bancos JSON revisados. Este catálogo propone una taxonomía de organización; no certifica por sí solo la validez científica de cada reactivo.

## Criterio de clasificación

- **Área principal:** ubicación editorial única para contabilizar una pregunta en el banco que le corresponde.
- **Subárea:** tema específico dentro del área principal.
- **Etiquetas relacionadas:** permiten recuperar una pregunta desde otras áreas cuando existe relación interdisciplinaria, sin duplicar su conteo principal.
- **Categoría de origen:** etiqueta conservada tal como aparece en el JSON para mantener trazabilidad.
- **Conteo de origen:** número de registros en el archivo fuente observado. No equivale a preguntas únicas, correctas o clínicamente validadas.

## Catálogo de categorías revisadas

| Categoría de origen | Área principal propuesta | Subárea / alcance | Decisión editorial |
|---|---|---|---|
| Anestesia dental | Anestesiología odontológica | Anestésicos locales, selección, técnicas y complicaciones | Banco independiente |
| Anatomía dental | Ciencias básicas | Morfología dentaria y organización de la dentición | Banco independiente |
| Articulación temporomandibular y trastornos temporomandibulares | Oclusión y dolor orofacial | Anatomía funcional de ATM y TTM | Banco independiente |
| Bioética y legislación odontológica | Gestión y ética profesional | Autonomía, consentimiento, legislación y responsabilidad | Banco independiente |
| Cariología | Operatoria y cariología | Proceso de caries, riesgo y diagnóstico | Subárea de operatoria; conservar como banco temático |
| Cirugía bucal | Cirugía bucal y maxilofacial | Valoración, procedimientos y cuidados quirúrgicos | Banco independiente |
| Desarrollo craneofacial | Crecimiento y desarrollo craneofacial | Embriología, crecimiento facial y desarrollo de maxilares | Banco temático; relacionada con ortopedia |
| Desarrollo de la oclusión | Odontopediatría y ortodoncia | Denticiones, cronología, recambio y oclusión en desarrollo | Banco temático transversal |
| Embriología dental | Ciencias básicas | Origen embrionario de tejidos dentales | Banco independiente |
| Endodoncia | Endodoncia | Diagnóstico pulpar y periapical, conductos y tratamiento | Banco independiente |
| Farmacología odontológica | Farmacología | Prescripción, vías, grupos farmacológicos y seguridad | Banco independiente |
| Fisiología | Ciencias básicas | Fisiología general y oral; requiere distinguir preguntas no odontológicas | Banco temático |
| Fotografía y documentación clínica odontológica | Diagnóstico y documentación | Fotografía clínica, registros y documentación | Banco independiente |
| Hábitos y parafunciones | Ortodoncia preventiva y terapia miofuncional | Succión, hábitos, parafunciones y efectos dentofaciales | Banco temático transversal |
| Implantología | Implantología oral | Indicación, planificación y componentes implantarios | Banco independiente |
| Infecciones odontogénicas | Cirugía e infectología odontológica | Etiología, microbiología, propagación y manejo | Banco independiente |
| Laboratorio de ortodoncia y ortopedia | Ortodoncia y ortopedia maxilar | Impresiones, modelos, aparatos y procedimientos de laboratorio | Banco temático; separar contenido protésico si aparece |
| Materiales dentales | Biomateriales odontológicos | Propiedades, selección y manipulación | Banco independiente |
| Medicina bucal | Medicina bucal | Historia médica, valoración sistémica y atención odontológica | Banco independiente |
| Microbiología oral / Microbiologia oral | Ciencias básicas | Microbiota, biofilm y microorganismos orales | Unificar acentuación; un solo banco |
| Nomenclatura y etimología médica | Ciencias básicas | Terminología, prefijos y raíces médicas | Banco de apoyo, no especialidad clínica |
| Odontología estética | Odontología estética | Análisis facial, sonrisa y procedimientos estéticos | Banco independiente |
| Odontología forense | Odontología forense | Identificación y procedimientos forenses | Banco independiente |
| Odontología geriátrica / Odontologia geriatrica | Odontogeriatría | Envejecimiento, necesidades y patologías del adulto mayor | Unificar acentuación; un solo banco |
| Odontología para pacientes con necesidades especiales | Atención a pacientes con necesidades especiales | Adaptación, valoración y planificación de atención | Banco independiente |
| Odontología preventiva | Prevención y salud pública bucal | Prevención individual, control de caries y promoción | Banco independiente |
| Odontopediatría | Odontopediatría | Atención integral, dentición temporal y manejo infantil | Banco independiente |
| Oclusión | Oclusión y rehabilitación oral | Relaciones oclusales y movimientos mandibulares | Subárea temática; distinguirla de ATM |
| Oclusión funcional y ajuste oclusal avanzado | Oclusión y rehabilitación oral | Relaciones funcionales, guías y ajuste | Banco independiente |
| Operatoria dental | Operatoria y cariología | Diagnóstico y restauración de tejidos dentarios | Banco independiente |
| Ortodoncia | Ortodoncia | Diagnóstico, maloclusiones y tratamiento | Banco independiente |
| Ortopedia maxilar | Ortopedia dentofacial | Crecimiento, diagnóstico y terapéutica ortopédica | Banco independiente |
| Ortopedia dental | Ortopedia dentofacial | Denominación por confirmar contra el contenido | Revisar equivalencia con ortopedia maxilar |
| Patología bucal | Patología y medicina bucal | Lesiones elementales, diagnóstico y patología oral | Banco independiente |
| Periodoncia | Periodoncia | Salud periodontal, gingivitis, periodontitis y tratamiento | Banco independiente |
| Psicología infantil | Odontopediatría | Ansiedad, conducta y comunicación con pacientes infantiles | Subárea de manejo conductual |
| Prótesis dental | Rehabilitación oral y prótesis | Diagnóstico y planificación protésica | Categoría paraguas; distribuir por tipo si procede |
| Prótesis fija | Prótesis bucal | Coronas, puentes, preparaciones y cementación | Banco independiente |
| Prótesis removible | Prótesis bucal | Prótesis parcial removible y diseño | Banco independiente |
| Prótesis total | Prótesis bucal | Paciente edéntulo, soporte, retención y estabilidad | Banco independiente |
| Prótesis bucal | Prótesis bucal | Fija, removible, total y planificación | Categoría paraguas; no sumar junto con subbancos sin deduplicar |
| Radiología oral y maxilofacial | Imagenología odontológica | Selección e interpretación de estudios | Banco independiente |
| Realización del expediente clínico | Diagnóstico y documentación | Integración, registro y resguardo del expediente | Banco temático transversal |
| Rehabilitación oral | Rehabilitación oral | Diagnóstico integral y plan de tratamiento | Banco independiente; revisar solapamiento protésico |
| Salud pública y odontología comunitaria | Salud pública bucal | Epidemiología, prevención colectiva y comunidad | Banco independiente |
| Traumatología dental | Traumatología dentoalveolar | Evaluación y manejo del trauma dental | Banco independiente |
| Urgencias médicas en odontología | Urgencias médicas odontológicas | Preparación, reconocimiento y respuesta inicial | Banco independiente |

## Reglas para la integración en la aplicación

1. Una pregunta tendrá un solo `primaryCategoryId` para los conteos de cobertura.
2. Puede tener cero o más `relatedCategoryIds`, pero esas etiquetas no incrementarán el número de preguntas únicas del banco.
3. Se conservarán `sourceCategory`, `sourceFile` y `sourceId` para rastrear el origen.
4. Las categorías paraguas (por ejemplo, Prótesis dental / Prótesis bucal) no deben sumarse a sus subbancos hasta ejecutar deduplicación.
5. Las diferencias de acentuación y mayúsculas se normalizarán sin alterar la etiqueta original.
6. Las categorías de ciencias básicas y competencias transversales pueden aparecer como opciones de juego, pero no deben presentarse como especialidades clínicas.
7. Ningún banco se marcará como “100 preguntas verificadas” solo por contener 100 registros: primero deben pasar revisión de duplicados, claridad, respuesta correcta y pertinencia temática.

## Pendientes de validación

- Revisar todos los reactivos de cada categoría; las muestras revisadas sirven para orientar la clasificación, no para certificar el banco completo.
- Verificar la equivalencia entre “Ortopedia dental” y “Ortopedia maxilar”.
- Separar preguntas de fisiología general de fisiología oral.
- Identificar preguntas de laboratorio que pertenezcan a prótesis y no a ortodoncia/ortopedia.
- Revisar solapamientos entre Prótesis dental, Prótesis bucal, Prótesis fija, removible, total y Rehabilitación oral.
- Definir el límite entre Oclusión, ATM/TTM y Oclusión funcional.
- Confirmar que los bancos temáticos transversales no dupliquen reactivos de los bancos de especialidad.

## Nota sobre cantidades

Los archivos dedicados revisados incluyen bancos de 100 registros por categoría. Ese número es un conteo de registros fuente, no un conteo deduplicado del conjunto completo. El total global y las cantidades por categoría deberán calcularse después de aplicar el normalizador y la deduplicación a todos los archivos cargados por la aplicación.
