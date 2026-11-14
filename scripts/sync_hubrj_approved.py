#!/usr/bin/env python3
"""Import only approved revisions; keep source records and existing image files intact."""
import argparse,base64,copy,gzip,hashlib,json,os,re,urllib.request
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FIELDS=('problem','solution','difference','market','stage','mission')
def fingerprint(p):return hashlib.sha256(json.dumps({f:p.get(f) for f in FIELDS},ensure_ascii=False,sort_keys=True).encode()).hexdigest()
def plan_changes(local,remote,state):
 if remote.get('format')!='hubrj-approved-v1':raise ValueError('Unknown export format')
 rows=remote.get('projects',[]);by={p['id']:p for p in rows}
 if len(by)!=len(rows) or set(by)!={p['id'] for p in local}:raise ValueError('Protocol set differs from public portal')
 updated=copy.deepcopy(local);next_state=copy.deepcopy(state);changed=[]
 for p in updated:
  r=by[p['id']];previous=state['projects'][p['id']];version=r.get('reviewVersion')
  if type(version) is not int or version<previous['version']:raise ValueError('Review version rollback')
  for k,v in p.items():
   if k not in FIELDS and r.get(k)!=v:raise ValueError('Original source or metadata changed: '+p['id'])
  if version==previous['version']:continue
  if fingerprint(p)!=previous['field_sha256']:raise ValueError('Manual portal edit conflicts with approved revision: '+p['id'])
  for f in FIELDS:
   value=r.get(f)
   if value is not None and (not isinstance(value,str) or len(value)>8000):raise ValueError('Invalid editorial field')
   p[f]=value
  next_state['projects'][p['id']]={'version':version,'field_sha256':fingerprint(p)};changed.append(p['id'])
 return updated,next_state,changed
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):raise ValueError('Redirect refused for authenticated export')
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--fixture');args=parser.parse_args()
 if args.fixture:remote=json.loads(Path(args.fixture).read_text())
 else:
  service=os.environ.get('HUBRJ_SITE_SERVICE_TOKEN');key=os.environ.get('HUBRJ_SYNC_KEY')
  if not service or not key:raise ValueError('Configure HUBRJ_SITE_SERVICE_TOKEN and HUBRJ_SYNC_KEY in repository Actions secrets')
  req=urllib.request.Request('https://hubrj-gestao-startups.rogeriotpires.chatgpt.site/api/sync',headers={'OAI-Sites-Authorization':'Bearer '+service,'Authorization':'Bearer '+key,'Accept':'application/json'})
  with urllib.request.build_opener(NoRedirect).open(req,timeout=60) as response:
   raw=response.read(8_000_001)
  if len(raw)>8_000_000:raise ValueError('Export too large')
  remote=json.loads(raw)
 path=ROOT/'portal/data/projects.json';state_path=ROOT/'portal/data/review-sync.json';local=json.loads(path.read_text());state=json.loads(state_path.read_text())
 updated,state,changed=plan_changes(local,remote,state)
 if not changed:print('No new approved revisions.');return
 html_path=ROOT/'portal/vitrine.html';html=html_path.read_text();m=re.search(r'(<script[^>]*id="encoded-data"[^>]*>)(.*?)(</script>)',html,re.S)
 if not m:raise ValueError('Embedded dataset missing')
 embedded=json.loads(gzip.decompress(base64.b64decode(m[2])));by={p['id']:p for p in updated}
 if {p['id'] for p in embedded}!=set(by):raise ValueError('Embedded protocol mismatch')
 for p in embedded:
  for f in FIELDS:p[f]=by[p['id']][f]
 payload=base64.b64encode(gzip.compress(json.dumps(embedded,ensure_ascii=False,separators=(',',':')).encode(),mtime=0)).decode()
 state['last_sync_at']=datetime.now(timezone.utc).isoformat();state['last_updated_protocols']=changed
 path.write_text(json.dumps(updated,ensure_ascii=False,indent=2)+'\n');html_path.write_text(html[:m.start(2)]+payload+html[m.end(2):]);state_path.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
 print('Approved revisions imported:',len(changed))
if __name__=='__main__':main()
