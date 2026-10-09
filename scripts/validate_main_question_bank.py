#!/usr/bin/env python3
"""Valida únicamente el banco principal de 116 preguntas del modo concurso."""
import glob
import json
import sys
from pathlib import Path

files = sorted(glob.glob("app/src/main/assets/questions*.json"))
errors = []
seen_questions = set()
total = 0

if len(files) != 11:
    errors.append(f"Se esperaban 11 archivos del banco principal; se encontraron {len(files)}")

for filename in files:
    try:
        data = json.loads(Path(filename).read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{filename}: JSON inválido: {exc}")
        continue
    if not isinstance(data, list):
        errors.append(f"{filename}: debe contener una lista")
        continue

    for idx, item in enumerate(data, 1):
        total += 1
        prefix = f"{filename} pregunta {idx}"
        if not isinstance(item, dict):
            errors.append(f"{prefix}: registro inválido")
            continue

        q = str(item.get("q", "")).strip()
        q_en = str(item.get("q_en", "")).strip()
        answers = item.get("a")
        answers_en = item.get("a_en")
        if not q:
            errors.append(f"{prefix}: pregunta vacía")
        if not q_en:
            errors.append(f"{prefix}: falta traducción inglesa")
        q_key = " ".join(q.casefold().split())
        if q_key in seen_questions:
            errors.append(f"{prefix}: pregunta duplicada: {q}")
        seen_questions.add(q_key)

        if not isinstance(answers, list) or not 4 <= len(answers) <= 7:
            errors.append(f"{prefix}: debe tener entre 4 y 7 respuestas")
            continue
        if not isinstance(answers_en, list) or len(answers_en) != len(answers):
            errors.append(f"{prefix}: traducciones inglesas no coinciden con las respuestas")
        elif any(not str(x).strip() for x in answers_en):
            errors.append(f"{prefix}: traducción inglesa vacía")

        seen_answers = set()
        points = []
        for aidx, answer in enumerate(answers, 1):
            if not isinstance(answer, list) or len(answer) != 2:
                errors.append(f"{prefix}, respuesta {aidx}: formato esperado [texto, puntos]")
                continue
            text, value = answer
            key = " ".join(str(text).strip().casefold().split())
            if not key:
                errors.append(f"{prefix}, respuesta {aidx}: texto vacío")
            if key in seen_answers:
                errors.append(f"{prefix}: respuesta duplicada: {text}")
            seen_answers.add(key)
            if not isinstance(value, (int, float)) or value <= 0:
                errors.append(f"{prefix}, respuesta {aidx}: puntos inválidos")
            else:
                points.append(value)

        if len(points) != len(answers):
            continue
        if sum(points) != 100:
            errors.append(f"{prefix}: los puntos suman {sum(points)}, no 100")
        if points.count(max(points)) != 1:
            errors.append(f"{prefix}: debe existir una sola respuesta líder")

if total != 116:
    errors.append(f"El banco principal debe contener 116 preguntas; contiene {total}")

if errors:
    print("\\n".join(errors))
    sys.exit(1)

print("OK: 116 preguntas; 4–7 respuestas por pregunta; traducciones, puntos y respuesta líder validados.")
