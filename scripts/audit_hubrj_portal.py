#!/usr/bin/env python3
"""Audit canonical/embedded records, images and official protocol references."""
import base64,gzip,json,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
projects=json.loads((ROOT/'portal/data/projects.json').read_text())
html=(ROOT/'portal/vitrine.html').read_text()
m=re.search(r'<script[^>]*id="encoded-data"[^>]*>(.*?)</script>',html,re.S)
embedded=json.loads(gzip.decompress(base64.b64decode(m[1])))
reference=json.loads((ROOT/'portal/data/official-results.json').read_text())
ids={p['id'] for p in projects}
assert len(ids)==len(projects)==143
assert ids=={p['id'] for p in embedded}=={p['id'] for p in reference['protocols']}
by_id={p['id']:p for p in embedded}
for p in projects:
    for key in p:
        assert by_id[p['id']][key]==p[key],(p['id'],key)
    assert (ROOT/'portal/assets/ai'/f"{p['id']}.webp").is_file()
    assert p['officialResult']['url']==reference['source']
    assert p['officialResult']['page']==next(x['page'] for x in reference['protocols'] if x['id']==p['id'])
fields=['problem','solution','difference','market','stage','mission']
report={'checked_at':'2026-11-14','projects':len(projects),'cities':len({p['city'] for p in projects}),'areas':len({p['area'] for p in projects}),'official_protocols_matched':len(ids),'missing_fields':{f:sum(not p.get(f) for p in projects) for f in fields},'editorial_queue':[{'id':p['id'],'title':p['title'],'missing':[f for f in fields if not p.get(f)],'repeated_fields':[[a,b] for i,a in enumerate(fields) for b in fields[i+1:] if p.get(a) and p[a]==p.get(b)]} for p in projects]}
reviews=[]
for path in sorted((ROOT/'docs').glob('revisao-editorial*2026-11-14.json')):
    review=json.loads(path.read_text())
    reviews.extend(review['full_editorial_reviews'])
    for record in review['records']:
        source=next(p['fullSummary'] for p in projects if p['id']==record['id'])
        assert hashlib.sha256(source.encode()).hexdigest()==record['source_sha256'],record['id']
        for excerpt in record.get('stage_evidence',[]):
            assert excerpt in source,(record['id'],'stage evidence')
assert set(reviews)==ids
assert len(reviews)==len(set(reviews))
report['editorially_reviewed']=len(reviews)
report['institutional_approval']='pending'
(ROOT/'docs/auditoria-editorial.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='editorial_queue'},ensure_ascii=False,indent=2))
