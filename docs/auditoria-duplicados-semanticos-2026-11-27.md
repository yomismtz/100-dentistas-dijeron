# Auditoría de duplicados semánticos — 2026-11-27

## Alcance y estado de la rama

- Repositorio: `yomismtz/asi-los-dentistas-lo-dijeron`
- Rama de trabajo: `chatgpt/recovery-2026-09-22`
- HEAD al inicio de esta revisión: `7107e18761f8fc3c89eecef3e777f9d91e365665`
- `BANK_FILES`: 90 archivos JSON activos.
- Archivos JSON existentes en assets: 100.
- Los 10 archivos `primer_parcial_01.json` a `primer_parcial_10.json` no están incluidos en `BANK_FILES`; no se modificaron.
- No se cambió de rama, no se modificó `main` y no se hizo merge.

## Diferencia de conteo detectada

El conteo directo de registros recuperables en los 90 archivos activos antes de esta auditoría fue de **7,171**, no 7,170. La diferencia es de un registro respecto del conteo comunicado anteriormente. Se conserva esta discrepancia como punto de conciliación; no se ajustó artificialmente ningún archivo para forzar el total histórico.

Después de esta etapa se retiraron **1,789 registros redundantes**. El conteo actual calculado para los 90 archivos activos es de **5,382 registros**.

Este total es un conteo de registros presentes, no una declaración de validación clínica. La unicidad semántica global todavía requiere resolver los candidatos pendientes descritos abajo.

Se verificó la unicidad textual exacta dentro de cada uno de los 90 archivos activos: **5,382 enunciados únicos dentro de sus respectivos bancos y cero grupos de enunciados exactamente repetidos dentro de un mismo archivo**. Esta cifra no debe interpretarse como unicidad semántica global entre todos los bancos: las comparaciones cruzadas se realizaron entre bancos relacionados por especialidad o contenido, y los candidatos restantes siguen pendientes de revisión.

## Método de detección

Se compararon los enunciados y las respuestas, no solo palabras compartidas. Se usaron como señales:

1. Mismo objetivo de conocimiento y mismo concepto clínico.
2. Respuestas iguales, equivalentes o claramente contenidas en otra versión.
3. Cambios de plantilla verbal que no modifican lo que se pregunta.
4. Diferencias en el número de respuestas solicitadas cuando el contenido evaluado era el mismo.
5. Correspondencia entre bancos generales y especializados.

No se eliminaron automáticamente preguntas por compartir términos, respuestas parcialmente parecidas o un tema general. Cuando el alcance clínico podía ser distinto, se conservaron y se anotaron para revisión.

En grupos de variantes equivalentes se conservó el primer registro del grupo, con su identificador, categoría, dificultad, fuente y ponderaciones originales. No se renumeraron identificadores ni se reescribieron respuestas.

## Cambios efectuados

| Archivo | Registros antes | Registros después | Retirados |
|---|---:|---:|---:|
| `bank44_bioetica_legislacion.json` | 100 | 25 | 75 |
| `bank44_fotografia_documentacion.json` | 100 | 25 | 75 |
| `bank44_oclusion_funcional_avanzada.json` | 100 | 25 | 75 |
| `bank44_odontologia_forense.json` | 100 | 25 | 75 |
| `bank44_original_04.json` | 100 | 96 | 4 |
| `bank44_original_08.json` | 100 | 74 | 26 |
| `bank44_original_09.json` | 100 | 31 | 69 |
| `bank44_original_10.json` | 100 | 67 | 33 |
| `bank44_original_11.json` | 100 | 25 | 75 |
| `bank44_original_12.json` | 100 | 25 | 75 |
| `bank44_original_15.json` | 100 | 25 | 75 |
| `bank44_original_16.json` | 100 | 25 | 75 |
| `bank44_original_17.json` | 100 | 25 | 75 |
| `bank44_original_18.json` | 100 | 25 | 75 |
| `bank44_original_19.json` | 100 | 28 | 72 |
| `bank44_original_20.json` | 99 | 25 | 74 |
| `bank44_original_21.json` | 99 | 25 | 74 |
| `bank44_original_22.json` | 98 | 25 | 73 |
| `bank44_original_23.json` | 100 | 25 | 75 |
| `bank44_original_24.json` | 100 | 25 | 75 |
| `bank44_original_25.json` | 100 | 25 | 75 |
| `bank44_original_26.json` | 100 | 25 | 75 |
| `bank44_original_28.json` | 100 | 91 | 9 |
| `bank44_original_29.json` | 100 | 86 | 14 |
| `bank44_original_30.json` | 100 | 51 | 49 |
| `bank44_original_31.json` | 100 | 53 | 47 |
| `bank44_original_32.json` | 100 | 68 | 32 |
| `bank44_original_33.json` | 100 | 55 | 45 |
| `bank44_original_35.json` | 100 | 96 | 4 |
| `bank44_original_36.json` | 100 | 73 | 27 |
| `bank44_original_37.json` | 100 | 69 | 31 |
| `bank44_original_38.json` | 100 | 98 | 2 |
| `bank44_original_39.json` | 100 | 75 | 25 |
| `bank44_original_40.json` | 100 | 83 | 17 |
| `bank44_farmacologia.json` | 100 | 98 | 2 |
| `bank44_medicina_bucal.json` | 100 | 96 | 4 |
| `bank44_microbiologia_oral.json` | 100 | 98 | 2 |
| `bank44_odontologia_preventiva.json` | 100 | 99 | 1 |
| `bank44_salud_publica_comunitaria.json` | 100 | 98 | 2 |
| `questions_materiales_implantes.json` | 10 | 9 | 1 |
| **Total de archivos modificados** | **3,906** | **2,117** | **1,789** |

Los archivos modificados fueron serializados y comprobados con `JSON.parse` antes de cada actualización. Se volvieron a recuperar y validar varios grupos después de escribirlos en GitHub; todos los archivos actualizados en esta etapa fueron aceptados por GitHub.

## Grupos semánticos consolidados

### Variantes de cuatro plantillas por tema

Se consolidaron grupos en los que cuatro enunciados cambiaban entre expresiones como «menciona», «identifica», «señala», «enumera», «aspectos», «principios» o «elementos», pero mantenían el mismo tema y las mismas respuestas.

Ejemplos representativos:

- `BIO-001` conservado; `BIO-026`, `BIO-051` y `BIO-076` retirados: autonomía.
- `FOT-001` conservado; `FOT-026`, `FOT-051` y `FOT-076` retirados: fotografía clínica.
- `OCL-001` conservado; `OCL-026`, `OCL-051` y `OCL-076` retirados: posiciones mandibulares.
- `FOR-001` conservado; `FOR-026`, `FOR-051` y `FOR-076` retirados: identificación dental forense.
- En los bancos originales 09, 11, 12, 15, 16, 17, 18, 20–26 y varios posteriores se aplicó el mismo criterio a grupos equivalentes. Se conservaron los primeros registros y se dejaron intactos los grupos cuyas preguntas no compartían un concepto suficientemente específico.

### Duplicados dentro de bancos originales

- `bank44_original_04.json`: se retiraron `ORG4-006`, `ORG4-034`, `ORG4-076` y `ORG4-094`; se conservaron sus primeras versiones equivalentes.
- `bank44_original_08.json`: se retiraron las variantes con prefijo «En el laboratorio» cuando el resto del enunciado y las respuestas eran iguales, además de seis pares equivalentes adicionales. Ejemplos de IDs retirados: `ORG8-032`, `ORG8-034`, `ORG8-036`, `ORG8-038`, `ORG8-040`, `ORG8-042`, `ORG8-044`, `ORG8-046`, `ORG8-048`, `ORG8-050`, `ORG8-052`, `ORG8-054`, `ORG8-056`, `ORG8-058`, `ORG8-060`, `ORG8-062`, `ORG8-064`, `ORG8-066`, `ORG8-068`, `ORG8-070`, `ORG8-076`, `ORG8-080`, `ORG8-082`, `ORG8-090`, `ORG8-096` y `ORG8-100`.
- `bank44_original_30.json`: se consolidaron 40 grupos semánticos de prótesis removible; se retiraron 49 variantes y se conservaron 51 registros.
- `bank44_original_33.json`: se consolidaron 25 grupos de ATM/TTM; se conservaron 55 preguntas.
- `bank44_original_36.json`: se consolidaron grupos de microbiología oral; además se retiraron tres variantes de microbiota oral al conservar la pregunta más amplia `ORG36-004`.
- `bank44_original_37.json`, `39.json` y `40.json`: se consolidaron variantes de infecciones odontogénicas, traumatología dental y odontología geriátrica, respectivamente.

### Duplicados entre bancos generales y especializados

Se conservaron las versiones más apropiadas para la especialidad y se retiraron las copias redundantes:

- Incidencia epidemiológica: se conservó `SPC-005`; se retiró `ORG35-011`.
- Índice CPOD: se conservó `SPC-019`; se retiró `ORG35-016`.
- Determinantes sociales: se conservó la versión más amplia `ORG35-037`; se retiró `SPC-007`.
- Promoción de la salud: se conservó la versión más amplia `ORG35-080`; se retiraron `ORG35-077`, `ORG35-078` y `SPC-009`.
- Microbiota oral: se conservó `ORG36-004`, que incluye el conjunto más amplio; se retiraron `ORG36-001`, `ORG36-002`, `ORG36-003` y `MIC-001`.
- Infecciones odontogénicas: se conservó `INF-002`; se retiró `MIC-061`.
- Antibióticos innecesarios: se conservó `INF-049`; se retiró `FAR-024`.
- Efectos farmacológicos: se conservaron `FAR-044`, `FAR-045`, `FAR-046` y `FAR-080`; se retiraron las copias `MED-030`, `MED-093`, `MED-058` y `MED-061`.
- Resistencia antimicrobiana: se conservó `MIC-067`; se retiró `FAR-071`.
- Desgaste dental: se conservó `OCL-018`; se retiró `ODP-033`.
- Absceso odontogénico: se conservó la formulación clínica más específica `INF-005`; se retiró `ORG37-016`.
- Accidente cerebrovascular y síndrome coronario agudo: se conservaron `URG-047` y `URG-042`; se retiraron `ORG38-061` y `ORG38-056`.
- Hiperglucemia grave: se conservó la pregunta más amplia `ORG38-022`; se retiró `URG-022`.
- Subluxación: se conservó `TRA-018`; se retiró `ORG39-036`.
- Candidiasis oral: se conservó `GER-014`; se retiró `ORG40-091`.
- Componentes de resina compuesta: se conservó la pregunta del banco especializado de operatoria; se retiró la copia de `questions_materiales_implantes.json`.

Se restauraron `SPC-005` y `SPC-019` después de detectar que la primera pasada había retirado ambas copias de cada grupo. La versión canónica quedó en el banco de salud pública y las copias de `bank44_original_35.json` permanecen retiradas.

## Candidatos conservados para revisión

Estos grupos comparten respuestas, tema o vocabulario, pero tienen diferencias de alcance que impiden eliminarlos sin una decisión clínica adicional:

- `ORG4-085` frente a `ORG4-087`, y `ORG4-086` frente a `ORG4-088`: sobremordida y resalte horizontal son medidas distintas.
- `bank44_original_02.json`: preguntas sobre saliva en reposo y saliva estimulada; no son intercambiables.
- `bank44_original_04.json`: espacios primates maxilar y mandibular; se conserva la distinción anatómica.
- `ORG38-007`, `ORG38-008` y `URG-003`: evaluación inicial con listas de distinta amplitud; requiere revisar si evalúan ABC, ABCDE o una valoración primaria distinta.
- `ORG38-017` y `URG-018`: hipoglucemia, pero una lista incluye glucosa baja como dato diagnóstico y la otra signos clínicos.
- `ORG1-001` y la pregunta de guía de conducta de `questions_specialty_odontopediatria.json`: comparten objetivo, pero sus listas de técnicas no son iguales.
- `ORG18-009` y la pregunta sobre anestésicos locales frecuentes de `questions_specialty_anestesia.json`: una evalúa la familia amida y la otra los anestésicos frecuentes.
- `MAT-003` y `MAT-085`: propiedades ópticas generales de materiales frente a propiedades ópticas del esmalte.
- `TRA-006` y `TRA-071`: lesiones traumáticas dentales generales frente a lesiones en dentición temporal.
- `bank44_original_19.json`: queda un grupo con respuestas iguales, pero enunciados diferentes; se conserva hasta revisar su objetivo.

La igualdad de respuestas no se considera, por sí sola, prueba suficiente de duplicación.

## Bancos con menos de 100 registros después de la limpieza

Tener menos de 100 preguntas no significa que el banco esté clínicamente validado ni que deba completarse automáticamente. Se informa el conteo actual.

### Bancos de preguntas iniciales y especializados

- `questions.json` (16)
- `questions_anatomia.json` (10)
- `questions_preventiva.json` (10)
- `questions_periodoncia.json` (10)
- `questions_endo_restauradora.json` (10)
- `questions_protesis_atm.json` (10)
- `questions_cirugia_radiologia.json` (10)
- `questions_patologia.json` (10)
- `questions_odonto_ortho.json` (10)
- `questions_infecciones_medicina.json` (10)
- `questions_materiales_implantes.json` (9)
- `questions_specialty_operatoria.json` (30)
- `questions_specialty_anestesia.json` (30)
- `questions_specialty_ortopedia.json` (30)
- `questions_specialty_ortho_preventiva.json` (30)
- `questions_specialty_ortho_interceptiva.json` (30)
- `questions_specialty_ortho_correctiva.json` (30)
- `questions_specialty_odontopediatria.json` (30)
- `questions_specialty_cirugia.json` (30)
- `questions_specialty_periodoncia.json` (30)
- `questions_specialty_protesis.json` (30)
- `questions_specialty_endodoncia.json` (30)
- `questions_specialty_anatomia.json` (29)

### Bancos originales

- `bank44_original_04.json` (96)
- `bank44_original_08.json` (74)
- `bank44_original_09.json` (31)
- `bank44_original_10.json` (67)
- `bank44_original_11.json` (25)
- `bank44_original_12.json` (25)
- `bank44_original_15.json` (25)
- `bank44_original_16.json` (25)
- `bank44_original_17.json` (25)
- `bank44_original_18.json` (25)
- `bank44_original_19.json` (28)
- `bank44_original_20.json` (25)
- `bank44_original_21.json` (25)
- `bank44_original_22.json` (25)
- `bank44_original_23.json` (25)
- `bank44_original_24.json` (25)
- `bank44_original_25.json` (25)
- `bank44_original_26.json` (25)
- `bank44_original_28.json` (91)
- `bank44_original_29.json` (86)
- `bank44_original_30.json` (51)
- `bank44_original_31.json` (53)
- `bank44_original_32.json` (68)
- `bank44_original_33.json` (55)
- `bank44_original_35.json` (96)
- `bank44_original_36.json` (73)
- `bank44_original_37.json` (69)
- `bank44_original_38.json` (98)
- `bank44_original_39.json` (75)
- `bank44_original_40.json` (83)

### Bancos de especialidad bank44

- `bank44_bioetica_legislacion.json` (25)
- `bank44_fotografia_documentacion.json` (25)
- `bank44_oclusion_funcional_avanzada.json` (25)
- `bank44_odontologia_forense.json` (25)
- `bank44_farmacologia.json` (98)
- `bank44_medicina_bucal.json` (96)
- `bank44_microbiologia_oral.json` (98)
- `bank44_odontologia_preventiva.json` (99)
- `bank44_salud_publica_comunitaria.json` (98)

**Total: 62 de los 90 bancos activos tienen menos de 100 registros.**

## Integridad y pruebas

- Los 40 archivos modificados se serializaron y validaron sintácticamente antes de enviarse a GitHub.
- Los archivos modificados conservan los objetos de pregunta que permanecieron, incluidos sus IDs, categorías, fuentes, dificultad y ponderaciones.
- No se alteró `BANK_FILES`; continúa enumerando 90 archivos.
- No se modificó el normalizador ni el motor del juego.
- No se modificaron las reglas de puntuación ni el número de respuestas de preguntas individuales.
- No se ejecutó build, test automatizado ni prueba de juego en navegador; por tanto, no se declara compilación ni funcionamiento integral verificado.
- No se marcaron bancos como clínicamente validados.

## Siguiente trabajo pendiente

1. Completar el segundo pase semántico entre bancos que no comparten categoría nominal.
2. Revisar manualmente los grupos conservados en la sección de candidatos.
3. Auditar respuestas duplicadas dentro de cada pregunta y opciones incorrectas potencialmente correctas.
4. Revisar calidad clínica, redacción, dificultad y respaldo de fuentes.
5. Ejecutar las pruebas del juego y recalcular el total desde el mismo normalizador que utiliza la aplicación.
