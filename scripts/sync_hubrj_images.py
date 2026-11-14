#!/usr/bin/env python3
"""Publish only approved WebP images; archive every replaced public file."""
import hashlib,io,json,os,re,urllib.request
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://hubrj-gestao-startups.rogeriotpires.chatgpt.site'
MAX_BYTES=4*1024*1024
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):raise ValueError('Authenticated redirect refused')
def sha(data):return hashlib.sha256(data).hexdigest()
def validate_image(data,expected):
 if len(data)>MAX_BYTES or len(data)!=expected['size'] or sha(data)!=expected['sha256']:raise ValueError('Image size or hash mismatch')
 with Image.open(io.BytesIO(data)) as image:
  if image.format!='WEBP' or image.size!=(1536,1024) or getattr(image,'n_frames',1)!=1:raise ValueError('Invalid image format, dimensions or animation')
  image.load()
def plan(root,remote,state,download):
 if remote.get('format')!='hubrj-images-v1' or not isinstance(remote.get('images'),list):raise ValueError('Invalid image export')
 records={p['id'] for p in json.loads((root/'portal/data/projects.json').read_text())}
 rows=remote['images'];seen=set();changes=[]
 if len(rows)>len(records):raise ValueError('Unexpected image count')
 for row in rows:
  pid=row.get('projectId');version=row.get('version');image_id=row.get('imageId')
  if pid not in records or pid in seen:raise ValueError('Unknown or duplicate protocol')
  seen.add(pid)
  if type(version) is not int or version<1 or not isinstance(image_id,str) or not re.fullmatch(r'[0-9a-f-]{36}',image_id):raise ValueError('Invalid approved image metadata')
  if not re.fullmatch(r'[a-f0-9]{64}',row.get('sha256','')) or type(row.get('size')) is not int or not 0<row['size']<=MAX_BYTES:raise ValueError('Invalid image hash or size')
  old=state['projects'][pid];current=(root/f'portal/assets/ai/{pid}.webp').read_bytes()
  if sha(current)!=old['sha256']:raise ValueError('Manual image change conflicts: '+pid)
  if version<old['version']:raise ValueError('Image version rollback')
  if version==old['version']:
   if row['sha256']!=old['sha256']:raise ValueError('Same version has different image')
   continue
  data=download(image_id);validate_image(data,row);changes.append((pid,version,current,data))
 if any(v['version']>0 and k not in seen for k,v in state['projects'].items()):raise ValueError('Previously approved image missing from export')
 return changes
def main():
 service=os.environ['HUBRJ_SITE_SERVICE_TOKEN'];key=os.environ['HUBRJ_SYNC_KEY']
 def get(path,limit):
  request=urllib.request.Request(ORIGIN+path,headers={'OAI-Sites-Authorization':'Bearer '+service,'Authorization':'Bearer '+key})
  with urllib.request.build_opener(NoRedirect).open(request,timeout=60) as response:raw=response.read(limit+1)
  if len(raw)>limit:raise ValueError('Response too large')
  return raw
 remote=json.loads(get('/api/image-sync',200000));state_path=ROOT/'portal/data/image-review-sync.json';state=json.loads(state_path.read_text())
 changes=plan(ROOT,remote,state,lambda image_id:get('/api/image-sync?id='+image_id,MAX_BYTES))
 for pid,version,previous,data in changes:
  backup=ROOT/f'portal/assets/ai/history/{pid}/{sha(previous)}.webp';backup.parent.mkdir(parents=True,exist_ok=True)
  if backup.exists() and backup.read_bytes()!=previous:raise ValueError('Backup conflict')
  backup.write_bytes(previous)
  target=ROOT/f'portal/assets/ai/{pid}.webp';temp=target.with_suffix('.tmp');temp.write_bytes(data);temp.replace(target)
  state['projects'][pid]={'version':version,'sha256':sha(data)}
 if changes:state_path.write_text(json.dumps(state,indent=2)+'\n')
 print('Approved images published:',len(changes),'; previous public images archived.')
if __name__=='__main__':main()
