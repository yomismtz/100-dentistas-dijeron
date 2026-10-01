# Auditoría del banco académico de 44 categorías

## Objetivo contractual
- 44 categorías.
- 100 preguntas jugables por categoría.
- Total: 4,400.
- Distribución por categoría: 30 fácil, 20 medio, 20 difícil, 30 extremo.
- 3 a 7 respuestas correctas.
- Puntos positivos, suma 100 y un único máximo.

## Resultado de la auditoría
### 22 categorías nuevas
Los 22 archivos bank44_* contienen 100 preguntas cada uno (2,200 en total). Cada archivo fue validado al integrarse con distribución 30/20/20/30 y sin errores estructurales de número de respuestas, suma de puntos ni máximo único.

### 22 categorías originales
El repositorio NO contiene todavía un banco consolidado de 2,200 preguntas jugables distribuido exactamente en 100 por cada una de las 22 categorías originales.

Fuentes heredadas detectadas:
- questions*.json: banco pequeño heredado (116 registros en el validador histórico).
- primer_parcial_01..10.json: 200 reactivos de opción múltiple; no tienen accepted_answers/game_weights y por tanto normalizeStudyQuestion no los incorpora al juego abierto.
- nomenclatura_etimologia_300.json: banco ampliado convertible al modo abierto.
- laboratorio_ortodoncia_ortopedia_300.json: banco ampliado convertible al modo abierto.
- expediente_clinico_300.json: reactivos de opción múltiple; no constituyen por sí solos 100 preguntas abiertas válidas bajo el esquema actual.

Por ello, no es correcto declarar todavía 4,400 preguntas jugables ni 44 categorías × 100.

## Integración al juego
app.js fue actualizado para cargar los 22 archivos bank44_* nuevos. Antes de esta corrección estaban guardados en assets pero no formaban parte de BANK_FILES.

## Estado
- Nuevas: 2,200/2,200 creadas e integradas al cargador.
- Originales: requieren consolidación/normalización por categoría y completar faltantes hasta exactamente 2,200.
- Total objetivo final: pendiente hasta reconstruir y validar las 22 categorías originales.

## Criterio de cierre
La auditoría solo puede marcar APROBADO GLOBAL cuando un validador final confirme simultáneamente:
1. 4,400 preguntas.
2. 44 categorías exactas.
3. 100 por categoría.
4. 30/20/20/30 por categoría.
5. 3–7 respuestas.
6. suma 100.
7. máximo único.
8. sin duplicados exactos y con revisión de duplicados semánticos.
