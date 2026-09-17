#!/usr/bin/env python3
import glob
import json
import sys
from pathlib import Path

FILES = sorted(glob.glob('app/src/main/assets/questions*.json'))
errors = []
seen_questions = set()
total = 0

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

    for idx, item in enumerate(data, start=1):
        total += 1
        prefix = f'{filename} pregunta {idx}'
        if not isinstance(item, dict):
            errors.append(f'{prefix}: formato inválido')
            continue

        q = str(item.get('q', '')).strip()
        answers = item.get('a')
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

if total != 116:
    errors.append(f'La base debe contener 116 preguntas; contiene {total}')

if errors:
    print('VALIDACIÓN FALLIDA')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)

print(f'VALIDACIÓN CORRECTA: {total} preguntas en {len(FILES)} archivos; todas tienen 3–5 respuestas y 100 puntos base.')
