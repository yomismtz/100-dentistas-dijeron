#!/usr/bin/env python3
import json, sys
from pathlib import Path

errors=[]
base=Path("app/src/main/assets")
expected={"facil":30,"medio":20,"dificil":20,"extremo":30}

for n in range(1,46):
    path=base/f"bank44_original_{n:02d}.json"
    if not path.exists():
        errors.append(f"{path}: falta")
        continue
    try:
        data=json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{path}: JSON invalido: {exc}")
        continue
    if isinstance(data,list):
        items=data
    elif isinstance(data,dict) and isinstance(data.get("questions"),list):
        items=data["questions"]
    else:
        errors.append(f"{path}: formato de banco invalido")
        continue
    if len(items)!=100:
        errors.append(f"{path}: {len(items)} preguntas; deben ser 100")
    seen=set()
    counts={k:0 for k in expected}
    for i,item in enumerate(items,1):
        if not isinstance(item,dict):
            errors.append(f"{path}:{i}: pregunta invalida"); continue
        q=str(item.get("q") or item.get("question") or "").strip()
        if not q: errors.append(f"{path}:{i}: falta pregunta")
        key=" ".join(q.casefold().split())
        if key in seen: errors.append(f"{path}:{i}: pregunta duplicada")
        seen.add(key)
        diff=str(item.get("difficulty","")).strip()
        if diff not in expected: errors.append(f"{path}:{i}: dificultad invalida {diff!r}")
        else: counts[diff]+=1
        raw=item.get("a")
        if raw is None:
            raw=item.get("answers")
        if not isinstance(raw,list) or not 3<=len(raw)<=7:
            errors.append(f"{path}:{i}: respuestas fuera de 3-7"); continue
        pts=[]
        for a in raw:
            if isinstance(a,list) and len(a)>=2:
                try: pts.append(float(a[1]))
                except: pass
            elif isinstance(a,dict):
                try: pts.append(float(a.get("points")))
                except: pass
        if len(pts)!=len(raw) or abs(sum(pts)-100)>1e-9:
            errors.append(f"{path}:{i}: puntos no suman 100")
        elif pts.count(max(pts))!=1:
            errors.append(f"{path}:{i}: empate en respuesta lider")
    if counts!=expected:
        errors.append(f"{path}: distribucion {counts}, esperada {expected}")

if errors:
    print("\n".join(errors))
    sys.exit(1)
print("OK: 45 categorias, 4,500 preguntas, estructura y puntuacion validadas.")
