#!/usr/bin/env python3
import glob
import json
import sys
from pathlib import Path

FILES = sorted(glob.glob('app/src/main/assets/questions*.json'))
PARCIAL_FILES = sorted(glob.glob('app/src/main/assets/primer_parcial_*.json'))
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
        q_en = str(item.get('q_en', '')).strip()
        answers_en = item.get('a_en')
        if not q:
            errors.append(f'{prefix}: falta el texto de la pregunta')
            continue
        if not q_en:
            errors.append(f'{prefix}: falta traducción inglesa q_en')
        q_key = ' '.join(q.casefold().split())
        if q_key in seen_questions:
            errors.append(f'{prefix}: pregunta duplicada: {q}')
        seen_questions.add(q_key)

        if not isinstance(answers, list) or not (3 <= len(answers) <= 7):
            errors.append(f'{prefix}: debe tener entre 3 y 7 respuestas; tiene {len(answers) if isinstance(answers, list) else "formato inválido"}')
            continue
        if not isinstance(answers_en, list) or len(answers_en) != len(answers):
            errors.append(f'{prefix}: a_en debe tener exactamente {len(answers)} respuestas traducidas')
        elif any(not str(text).strip() for text in answers_en):
            errors.append(f'{prefix}: a_en contiene traducciones vacías')

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

        point_values = [answer[1] for answer in answers if isinstance(answer, list) and len(answer) == 2 and isinstance(answer[1], (int, float))]
        if len(point_values) == len(answers):
            highest = max(point_values)
            if point_values.count(highest) != 1:
                errors.append(f'{prefix}: debe existir una sola respuesta líder; el puntaje máximo {highest} está empatado')


if total != 116:
    errors.append(f'La base debe contener 116 preguntas; contiene {total}')

# Validación del modo Juega y Aprueba (200 reactivos)
parcial_total = 0
parcial_ids = set()
source_counts = {}
for filename in PARCIAL_FILES:
    path = Path(filename)
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except Exception as exc:
        errors.append(f'{filename}: JSON inválido: {exc}')
        continue

    if not isinstance(data, list):
        errors.append(f'{filename}: el archivo debe contener una lista de reactivos')
        continue

    for idx, item in enumerate(data, start=1):
        parcial_total += 1
        prefix = f'{filename} reactivo {idx}'
        if not isinstance(item, dict):
            errors.append(f'{prefix}: formato inválido')
            continue

        qid = str(item.get('id', '')).strip()
        qtext = str(item.get('q', '')).strip()
        options = item.get('options')
        correct = item.get('correct')
        source_file = str(item.get('file', '')).strip()
        q_en = str(item.get('q_en', '')).strip()
        options_en = item.get('options_en')
        context = str(item.get('context', '')).strip()
        context_en = str(item.get('context_en', '')).strip()

        if not qid:
            errors.append(f'{prefix}: falta id')
        elif qid in parcial_ids:
            errors.append(f'{prefix}: id duplicado: {qid}')
        parcial_ids.add(qid)

        if not qtext:
            errors.append(f'{prefix}: falta texto de pregunta')
        if not q_en:
            errors.append(f'{prefix}: falta traducción inglesa q_en')

        if not isinstance(options, list) or len(options) < 2:
            errors.append(f'{prefix}: options debe contener al menos 2 opciones')
            continue

        normalized = [' '.join(str(x).casefold().split()) for x in options]
        if not isinstance(options_en, list) or len(options_en) != len(options):
            errors.append(f'{prefix}: options_en debe tener exactamente {len(options)} opciones traducidas')
        else:
            normalized_en = [' '.join(str(x).casefold().split()) for x in options_en]
            if any(not x for x in normalized_en):
                errors.append(f'{prefix}: existe una opción inglesa vacía')
            if len(normalized_en) != len(set(normalized_en)):
                errors.append(f'{prefix}: existen opciones inglesas duplicadas')
        if context and not context_en:
            errors.append(f'{prefix}: el contexto español existe pero falta context_en')
        if any(not x for x in normalized):
            errors.append(f'{prefix}: existe una opción vacía')
        if len(normalized) != len(set(normalized)):
            errors.append(f'{prefix}: existen opciones duplicadas')

        if not isinstance(correct, int) or not (0 <= correct < len(options)):
            errors.append(f'{prefix}: índice correct inválido: {correct!r}')

        if source_file:
            source_counts[source_file] = source_counts.get(source_file, 0) + 1

if parcial_total != 200:
    errors.append(f'Juega y Aprueba debe contener 200 reactivos; contiene {parcial_total}')
if len(parcial_ids) != parcial_total:
    errors.append(f'Juega y Aprueba debe tener IDs únicos; hay {len(parcial_ids)} IDs para {parcial_total} reactivos')
for expected_source in ('1.docx', '2.docx', '3.docx', '4.docx', '5.docx'):
    if source_counts.get(expected_source) != 40:
        errors.append(f'{expected_source}: se esperaban 40 reactivos y hay {source_counts.get(expected_source, 0)}')

if errors:
    print('VALIDACIÓN FALLIDA')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)

print(f'VALIDACIÓN CORRECTA: {total} preguntas VS + {parcial_total} reactivos de Juega y Aprueba.')
print('VS: respuestas únicas, 3–7 por pregunta, 100 puntos, una respuesta líder inequívoca y traducción inglesa completa.')
print('Juega y Aprueba: 200 IDs únicos, índices correctos válidos, 40 reactivos por examen y traducción inglesa completa.')
