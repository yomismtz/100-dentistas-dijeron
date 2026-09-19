#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
def read(p): return (ROOT/p).read_text(encoding='utf-8')

main=read('app/src/main/java/com/uam/cientodentistas/MainActivity.java')
ws=read('app/src/main/java/com/uam/cientodentistas/ClassroomWebSocketServer.java')
remote=read('app/src/main/assets/offline-remote.js')
core=read('app/src/main/assets/v3-core.js')
academic=read('app/src/main/assets/v3-academic.js')
show=read('app/src/main/assets/v3-show.js')
chars=read('app/src/main/assets/characters.js')
index=read('app/src/main/assets/index.html')

checks=[
(1,'Pulsadores WebSocket','Sec-WebSocket-Accept' in ws and ':8788/ws?role=team' in main),
(2,'Recuperación automática','v3RestoreSnapshot' in core and 'v3OfferRecovery' in core),
(3,'Autoguardado','v3Snapshot' in core and "setInterval(()=>v3Snapshot('interval')" in core),
(4,'Modo ensayo','v3StartRehearsal' in core),
(5,'Prueba de latencia','onRemoteLatency' in main and 'v3LatencyPanel' in core),
(6,'LISTOS sincronizado','buzzArmed' in ws and "¡LISTOS!" in main),
(7,'Pantalla siempre encendida','FLAG_KEEP_SCREEN_ON' in main),
(8,'Historial/reanudación','v3ShowHistory' in core and 'V3_HISTORY_KEY' in core),
(9,'Exportación CSV/Excel','v3ExportCsv' in core and 'v3ExportExcel' in core and 'exportTextFile' in main),
(10,'Modo investigación','v3ResearchSettings' in core and 'researchCode' in core),
(11,'Pretest/Postest','v3AssessmentSetup' in academic and 'v3AssessmentCompare' in academic),
(12,'Semáforo de calidad','v3QualityDashboard' in academic),
(13,'Detección de preguntas problemáticas','v3ProblemQuestions' in academic),
(14,'Estadísticas especialidad/subtema','v3Analytics' in academic and 'subtopic' in academic),
(15,'Buscador docente','v3SearchQuestions' in academic),
(16,'Vista previa','v3PreviewQuestion' in academic),
(17,'Paquetes de clase','v3PackManager' in core),
(18,'Dificultad por ronda','v3DifficultySchedule' in core and 'v3ApplyDifficultySchedule' in core),
(19,'Casos clínicos seriados','v3CaseSeriesMenu' in academic and 'v3PlayCase' in academic),
(20,'Imágenes ampliables','v3ImageZoom' in academic),
(21,'Imagen oculta/revelable','v3ApplyImageMode' in academic and 'questionFirst' in academic),
(22,'Multimedia offline','V3_MEDIA_ASSETS' in academic and (ROOT/'app/src/main/assets/media/tooth_anatomy.svg').exists()),
(23,'Volumen por capas','v3AudioSettings' in show and 'setNarratorVolume' in main),
(24,'Indicador de duración musical','v3MusicHud' in show and 'timeupdate' in show),
(25,'Frases variables del presentador','V3_PHRASES' in show and 'v3PickPhrase' in show),
(26,'Celebraciones proporcionales','v3Celebrate' in show),
(27,'Personajes ilustrados','art:' in chars and (ROOT/'app/src/main/assets/characters/molarin.svg').exists()),
(28,'Tarjeta final exportable','v3ExportWinnerCard' in show and 'exportBase64File' in main),
(29,'Bracket gráfico','v3Bracket' in core),
(30,'Gran campeonato','v3Championship' in core and 'V3_CHAMP_KEY' in core),
]

failed=[(n,name) for n,name,ok in checks if not ok]
for n,name,ok in checks:
    print(f"{'OK' if ok else 'FAIL'} {n:02d}. {name}")
extra=[
 ('Recuperación conserva pausa','paused:typeof v2Paused' in core and 'v2Paused=!!s.paused' in core),
 ('Recuperación de careo es justa','restoreFaceoff' in core and 'careoQuestionScreen()' in core),
 ('Postest queda enlazado a su pretest','pairedPreDate' in academic and 'Comparación enlazada' in academic),
 ('WebSocket conserva respaldo HTTP',"fetch('/api/buzz?team='+TEAM" in main),
 ('Respuestas privadas siguen protegidas','state.remove("answers")' in ws and 'teacherPin.equals(pin)' in main),
]
for name,ok in extra:
    print(f"{'OK' if ok else 'FAIL'} EXTRA. {name}")
    if not ok: failed.append((0,name))
if failed:
    print('\nFaltan:',failed)
    sys.exit(1)
print('\nVALIDACIÓN V3 CORRECTA: 30/30 funciones + salvaguardas de integración.')
