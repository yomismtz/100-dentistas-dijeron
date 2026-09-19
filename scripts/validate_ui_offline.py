#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
errors=[]

def read(p):
    return (ROOT/p).read_text(encoding='utf-8')

index=read(Path('app/src/main/assets/index.html'))
manifest=read(Path('app/src/main/AndroidManifest.xml'))
main=read(Path('app/src/main/java/com/uam/cientodentistas/MainActivity.java'))
remote=read(Path('app/src/main/assets/offline-remote.js'))
modes=read(Path('app/src/main/assets/offline-modes.js'))
tools=read(Path('app/src/main/assets/offline-tools.js'))
v2=read(Path('app/src/main/assets/v2.js'))
app=read(Path('app/src/main/assets/app.js'))
careo=read(Path('app/src/main/assets/careo.js'))
roundpolish=read(Path('app/src/main/assets/round-polish.js'))
intro_generator=read(Path('scripts/generate_intro_audio.py'))
roundcss=read(Path('app/src/main/assets/round-polish.css'))
careo=read(Path('app/src/main/assets/careo.js'))
offtools=read(Path('app/src/main/assets/offline-tools.js'))
wsjava=read(Path('app/src/main/java/com/uam/cientodentistas/ClassroomWebSocketServer.java'))
v3core=read(Path('app/src/main/assets/v3-core.js'))
v3academic=read(Path('app/src/main/assets/v3-academic.js'))
v3show=read(Path('app/src/main/assets/v3-show.js'))

for name,text in [('index.html',index),('AndroidManifest.xml',manifest)]:
    if r'\n' in text:
        errors.append(f'{name}: contiene una secuencia literal \\n')

required_scripts=[
    'questions-loader.js','app.js','characters.js','v2.js','v2-extras.js',
    'specialties.js','tvshow.js','careo.js','narrator.js',
    'offline-remote.js','offline-modes.js','offline-tools.js','round-polish.js',
    'v3-core.js','v3-academic.js','v3-show.js'
]
positions=[]
for s in required_scripts:
    token=f'<script src="{s}"></script>'
    if index.count(token)!=1:
        errors.append(f'index.html: {s} debe aparecer exactamente una vez')
    positions.append(index.find(token))
if any(p<0 for p in positions) or positions!=sorted(positions):
    errors.append('index.html: el orden de scripts no es el esperado')

for css in ['style.css','v2.css','tvshow.css','specialties.css','careo.css','narrator.css','offline-classroom.css','round-polish.css','v3.css']:
    if index.count(f'href="{css}"')!=1:
        errors.append(f'index.html: falta o se duplica {css}')

if 'android.permission.INTERNET' not in manifest:
    errors.append('AndroidManifest.xml: falta INTERNET para sockets LAN')
if '@mipmap/ic_launcher' not in manifest:
    errors.append('AndroidManifest.xml: falta icono launcher')

native_required=[
    'getTeacherPin()','/api/teacher-state','teacherPin.equals(pin)',
    'publicStateJson()','obj.remove("answers")','obj.remove("scores")',
    'setReferenceUnlocked(boolean unlocked)','/api/reference',
    'obj.remove("source")','obj.remove("explanation")',
    'referenceUnlocked','referenceStateJson()',
    'teacherStateJson()','isRoundOver()','ROUND_ACTIVE'
]
for token in native_required:
    if token not in main:
        errors.append(f'MainActivity.java: falta protección {token}')

js_required=[
    ('offline-remote.js','offlineTeacherAccessPanel',remote),
    ('offline-remote.js','Android.getTeacherPin',remote),
    ('offline-modes.js','offlineTogglePause',modes),
    ('offline-tools.js','_overrideKey',tools),
    ('offline-tools.js','Android.setReferenceUnlocked(true)',tools),
    ('offline-remote.js','offlineTeacherAccessPanel',remote),
    ('v2.js','v2OppositeConflict',v2),
    ('v2.js','v2ContainmentScore',v2),
]
for name,token,text in js_required:
    if token not in text:
        errors.append(f'{name}: falta {token}')

team_start=main.find('private String teamPage')
teacher_start=main.find('private String teacherPage')
team_block=main[team_start:teacher_start] if team_start>=0 and teacher_start>team_start else ''
if "new WebSocket('ws://'+location.hostname+':8788/ws?role=team&team='+TEAM)" not in team_block:
    errors.append('MainActivity.java: el pulsador remoto no usa WebSocket')
if "fetch('/api/buzz?team='+TEAM" not in team_block:
    errors.append('MainActivity.java: falta respaldo HTTP del pulsador')
if 'Sec-WebSocket-Accept' not in wsjava or 'onBuzz(int team)' not in wsjava:
    errors.append('ClassroomWebSocketServer.java: servidor WebSocket incompleto')
if 'const TURN_SECONDS = 30;' not in app:
    errors.append('app.js: el tiempo base debe ser 30 segundos')
if 'let v2TimerSeconds = 30;' not in v2 or "timerVersion:'30s-v1'" not in v2:
    errors.append('v2.js: falta migración del cronómetro a 30 segundos')
if 'let remaining=v2TimerSeconds;' not in careo:
    errors.append('careo.js: el careo debe usar el tiempo configurado')
if 'rpRevealMissingBeforeAdvance' not in roundpolish or "classList.add('revealed','missedAnswer')" not in roundpolish:
    errors.append('round-polish.js: falta revelar respuestas pendientes antes de avanzar')
if "Las respuestas faltantes son:" not in roundpolish or "La respuesta faltante es:" not in roundpolish:
    errors.append('round-polish.js: falta locución de respuestas faltantes')
if "tvSfx('review')" not in roundpolish:
    errors.append('round-polish.js: falta efecto de sonido antes de respuestas faltantes')
if "narratorReadAnnouncement" not in roundpolish:
    errors.append('round-polish.js: las respuestas faltantes no usan el narrador')
if "roundReviewContinue\" disabled" not in roundpolish or "speechDone" not in roundpolish or "visualDone" not in roundpolish:
    errors.append('round-polish.js: siguiente ronda debe esperar lectura y revelado')
if 'bank +=' in roundpolish or 'scores[' in roundpolish:
    errors.append('round-polish.js: revelar respuestas faltantes no debe sumar puntos')
if ".answer.covered{pointer-events:none}" not in roundcss:
    errors.append('round-polish.css: las casillas cubiertas deben bloquear toque manual')
if "if(phase!=='over')" not in offtools or "RESPUESTAS BLOQUEADAS" not in offtools:
    errors.append('offline-tools.js: la consulta de respuestas debe bloquearse mientras la ronda está activa')
if 's.loop=true' in careo:
    errors.append('careo.js: la música de entrada no debe usar bucle')
if 'careoStopIntro(true)' in careo:
    errors.append('careo.js: la música no debe cortarse por cambios de fase')
if 'intro_full_original.wav' not in index:
    errors.append('index.html: debe usar la intro completa generada')
if 'DURATION=28.0' not in intro_generator:
    errors.append('generate_intro_audio.py: la intro completa debe durar 28 segundos')
if 'answers:(q&&q.a||[])' not in remote:
    errors.append('offline-remote.js: el host debe seguir enviando respuestas al estado nativo privado')
if "orQrCard('📚 REFERENCIA ACTUAL'" in remote or "'qrr'" in remote:
    errors.append('offline-remote.js: la referencia no debe aparecer en el panel público del aula')
if "Android.setReferenceUnlocked(true)" not in tools:
    errors.append('offline-tools.js: el QR de referencia debe requerir desbloqueo docente')

if 'V3_SNAPSHOT_KEY' not in v3core or 'v3ExportCsv' not in v3core or 'v3LatencyPanel' not in v3core:
    errors.append('v3-core.js: faltan recuperación/exportación/latencia')
if 'v3AssessmentSetup' not in v3academic or 'v3QualityDashboard' not in v3academic or 'v3CaseSeriesMenu' not in v3academic:
    errors.append('v3-academic.js: faltan herramientas académicas')
if 'v3AudioSettings' not in v3show or 'v3ExportWinnerCard' not in v3show:
    errors.append('v3-show.js: faltan mezclador o tarjeta final')

if errors:
    print('VALIDACIÓN UI/OFFLINE FALLÓ:')
    for e in errors:
        print(' -',e)
    sys.exit(1)

print('VALIDACIÓN UI/OFFLINE CORRECTA: carga, PIN docente, estado público y módulos verificados.')
