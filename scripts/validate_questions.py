#!/usr/bin/env python3
import glob
import json
import sys
from pathlib import Path

FILES = sorted(glob.glob('app/src/main/assets/questions*.json'))
errors = []
seen_questions = set()
total = 0
specialty_counts = {}
specialty_levels = {}

if not FILES:
    errors.append('No se encontraron archivos questions*.json')

for filename in FILES:
    path = Path(filename)
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except Exception as exc:
        errors.append(f'{filename}: JSON inválido: {exc}')
        continue

    if not isinstance(data, list):
        errors.append(f'{filename}: el archivo debe contener una lista de preguntas')
        continue

    if path.name.startswith('questions_specialty_'):
        specialty_id = path.stem.replace('questions_specialty_', '')
        specialty_counts[specialty_id] = len(data)
        specialty_levels[specialty_id] = {'basic': 0, 'intermediate': 0, 'advanced': 0}
    else:
        specialty_id = None

    for idx, item in enumerate(data, start=1):
        total += 1
        prefix = f'{filename} pregunta {idx}'
        if not isinstance(item, dict):
            errors.append(f'{prefix}: formato inválido')
            continue

        q = str(item.get('q', '')).strip()
        answers = item.get('a')
        if specialty_id:
            if item.get('specialty') != specialty_id:
                errors.append(f'{prefix}: specialty debe ser {specialty_id!r}; es {item.get("specialty")!r}')
            level = item.get('difficulty')
            if level not in ('basic', 'intermediate', 'advanced'):
                errors.append(f'{prefix}: difficulty inválida: {level!r}')
            else:
                specialty_levels[specialty_id][level] += 1
            source = str(item.get('source', '')).strip()
            if not source.startswith('http'):
                errors.append(f'{prefix}: falta fuente web válida')
        if not q:
            errors.append(f'{prefix}: falta el texto de la pregunta')
            continue
        q_key = ' '.join(q.casefold().split())
        if q_key in seen_questions:
            errors.append(f'{prefix}: pregunta duplicada: {q}')
        seen_questions.add(q_key)

        if not isinstance(answers, list) or not (3 <= len(answers) <= 5):
            errors.append(f'{prefix}: debe tener entre 3 y 5 respuestas; tiene {len(answers) if isinstance(answers, list) else "formato inválido"}')
            continue

        answer_keys = set()
        point_sum = 0
        for a_idx, answer in enumerate(answers, start=1):
            if not isinstance(answer, list) or len(answer) != 2:
                errors.append(f'{prefix}, respuesta {a_idx}: debe ser [texto, puntos]')
                continue
            text, points = answer
            text = str(text).strip()
            if not text:
                errors.append(f'{prefix}, respuesta {a_idx}: texto vacío')
            key = ' '.join(text.casefold().split())
            if key in answer_keys:
                errors.append(f'{prefix}: respuesta duplicada: {text}')
            answer_keys.add(key)
            if not isinstance(points, (int, float)) or points <= 0:
                errors.append(f'{prefix}, respuesta {a_idx}: puntos inválidos: {points!r}')
            else:
                point_sum += points

        if point_sum != 100:
            errors.append(f'{prefix}: los puntos deben sumar 100; suman {point_sum}')

EXPECTED_TOTAL = 476
if total != EXPECTED_TOTAL:
    errors.append(f'La base debe contener {EXPECTED_TOTAL} preguntas; contiene {total}')

expected_specialties = {
    'operatoria','anestesia','ortopedia','ortho_preventiva','ortho_interceptiva',
    'ortho_correctiva','odontopediatria','cirugia','periodoncia','protesis',
    'endodoncia','anatomia'
}
if set(specialty_counts) != expected_specialties:
    errors.append(f'Bancos de especialidad inesperados: {sorted(specialty_counts)}')
for specialty in sorted(expected_specialties):
    count = specialty_counts.get(specialty, 0)
    if count != 30:
        errors.append(f'{specialty}: debe tener 30 preguntas nuevas; tiene {count}')
    levels = specialty_levels.get(specialty, {})
    for level in ('basic','intermediate','advanced'):
        if levels.get(level, 0) != 10:
            errors.append(f'{specialty}: debe tener 10 preguntas {level}; tiene {levels.get(level, 0)}')

if errors:
    print('VALIDACIÓN FALLIDA')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)

print(f'VALIDACIÓN CORRECTA: {total} preguntas en {len(FILES)} archivos; 360 nuevas = 12 bancos × 30, cada uno con 10 básicas, 10 medias y 10 extra difíciles; todas tienen 3–5 respuestas y 100 puntos base.')
