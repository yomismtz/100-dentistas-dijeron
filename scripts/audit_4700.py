#!/usr/bin/env python3
"""Auditoría reproducible del banco principal y Curiosidades.
No sustituye la revisión académica humana; detecta problemas estructurales,
respuestas largas, plantillas repetidas y huecos de trazabilidad.
"""
import glob, json, re, unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ASSETS=Path("app/src/main/assets")
BANK_FILES=sorted(ASSETS.glob("bank44_*.json"))
CURIOSITY=ASSETS/"curiosidades_odontologia_300.json"
REPORT=Path("build/question_audit_4700.json")
REPORT.parent.mkdir(parents=True,exist_ok=True)

PLACEHOLDER_PHRASES=(
    "evaluación sistemática","correlación clínica","reevaluación documentada",
    "evaluación contextual","manejo interdisciplinario","seguimiento documentado"
)

def norm(s):
    s=unicodedata.normalize("NFD",str(s))
    s="".join(c for c in s if unicodedata.category(c)!="Mn").casefold()
    return re.sub(r"[^a-z0-9]+"," ",s).strip()

def words(s):
    return [x for x in re.split(r"\s+",str(s).strip()) if x]

summary={
    "target":{"academic":4400,"curiosities":300,"total":4700},
    "academic":{"files":len(BANK_FILES),"questions":0,"categories":{}},
    "curiosities":{"present":CURIOSITY.exists(),"questions":0},
    "answers":{"total":0,"over_3_words":0,"with_aliases":0},
    "issues":{"structural":[],"long_answer_examples":[],"placeholder_examples":[]},
    "repetition":{"question_text_duplicates":0,"answer_set_duplicates":0,"most_repeated_answers":[]}
}
seen_q=Counter()
answer_sets=Counter()
answer_texts=Counter()
cat_stats=defaultdict(Counter)

def audit_items(items,filename,is_curiosity=False):
    for i,q in enumerate(items,1):
        prefix=f"{filename}:{i}"
        if not isinstance(q,dict):
            summary["issues"]["structural"].append(prefix+" no es objeto")
            continue
        if is_curiosity: summary["curiosities"]["questions"]+=1
        else: summary["academic"]["questions"]+=1
        cat=str(q.get("cat","")).strip()
        diff=str(q.get("difficulty","")).strip()
        if not is_curiosity:
            cat_stats[cat]["total"]+=1
            cat_stats[cat][diff]+=1
        text=str(q.get("q","")).strip()
        seen_q[norm(text)]+=1
        answers=q.get("a")
        if not isinstance(answers,list) or not 3<=len(answers)<=7:
            summary["issues"]["structural"].append(prefix+" respuestas fuera de 3-7")
            continue
        pts=[]
        aset=[]
        for j,a in enumerate(answers,1):
            if not isinstance(a,list) or len(a)<2:
                summary["issues"]["structural"].append(f"{prefix} respuesta {j} inválida")
                continue
            at=str(a[0]).strip(); p=a[1]
            aliases=a[2] if len(a)>2 and isinstance(a[2],list) else []
            summary["answers"]["total"]+=1
            if aliases: summary["answers"]["with_aliases"]+=1
            wc=len(words(at))
            if wc>3:
                summary["answers"]["over_3_words"]+=1
                if len(summary["issues"]["long_answer_examples"])<100:
                    summary["issues"]["long_answer_examples"].append({"file":filename,"id":q.get("id"),"answer":at,"words":wc})
            low=norm(at)
            answer_texts[low]+=1; aset.append(low)
            if any(norm(pat) in low for pat in PLACEHOLDER_PHRASES):
                if len(summary["issues"]["placeholder_examples"])<100:
                    summary["issues"]["placeholder_examples"].append({"file":filename,"id":q.get("id"),"answer":at})
            if not isinstance(p,(int,float)) or p<=0:
                summary["issues"]["structural"].append(f"{prefix} puntos inválidos")
            else: pts.append(p)
        if len(pts)==len(answers):
            if sum(pts)!=100: summary["issues"]["structural"].append(prefix+" puntos no suman 100")
            if pts.count(max(pts))!=1: summary["issues"]["structural"].append(prefix+" líder empatado")
        answer_sets[tuple(aset)]+=1
        if not str(q.get("source","")).strip():
            summary["issues"]["structural"].append(prefix+" sin fuente")

for path in BANK_FILES:
    try: data=json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        summary["issues"]["structural"].append(f"{path.name} JSON inválido: {e}"); continue
    if not isinstance(data,list):
        summary["issues"]["structural"].append(path.name+" no contiene lista"); continue
    audit_items(data,path.name)

if CURIOSITY.exists():
    try:
        data=json.loads(CURIOSITY.read_text(encoding="utf-8"))
        if isinstance(data,list): audit_items(data,CURIOSITY.name,True)
        else: summary["issues"]["structural"].append(CURIOSITY.name+" no contiene lista")
    except Exception as e: summary["issues"]["structural"].append(f"{CURIOSITY.name} JSON inválido: {e}")

summary["academic"]["categories"]={k:dict(v) for k,v in sorted(cat_stats.items())}
summary["repetition"]["question_text_duplicates"]=sum(v-1 for v in seen_q.values() if v>1)
summary["repetition"]["answer_set_duplicates"]=sum(v-1 for v in answer_sets.values() if v>1)
summary["repetition"]["most_repeated_answers"]=[{"answer":a,"count":n} for a,n in answer_texts.most_common(30)]
summary["answers"]["over_3_words_percent"]=round(100*summary["answers"]["over_3_words"]/max(1,summary["answers"]["total"]),2)
summary["status"]={
    "academic_count_ok":summary["academic"]["questions"]==4400,
    "academic_categories_ok":len(cat_stats)==44,
    "curiosities_count_ok":summary["curiosities"]["questions"]==300,
    "total_count_ok":summary["academic"]["questions"]+summary["curiosities"]["questions"]==4700,
    "short_answers_ok":summary["answers"]["over_3_words"]==0
}
REPORT.write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({
    "academic_questions":summary["academic"]["questions"],
    "categories":len(cat_stats),
    "curiosities_questions":summary["curiosities"]["questions"],
    "answers":summary["answers"]["total"],
    "answers_over_3_words":summary["answers"]["over_3_words"],
    "placeholder_examples_found":len(summary["issues"]["placeholder_examples"]),
    "question_text_duplicates":summary["repetition"]["question_text_duplicates"],
    "answer_set_duplicates":summary["repetition"]["answer_set_duplicates"],
    "structural_issues":len(summary["issues"]["structural"]),
    "report":str(REPORT)
},ensure_ascii=False,indent=2))
