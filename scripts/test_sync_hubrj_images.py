import io,json,tempfile,unittest
from pathlib import Path
from PIL import Image
from sync_hubrj_images import plan,sha,validate_image
class ImageSyncTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name);(self.root/'portal/data').mkdir(parents=True);(self.root/'portal/assets/ai').mkdir(parents=True)
  (self.root/'portal/data/projects.json').write_text(json.dumps([{'id':'319712'}]))
  out=io.BytesIO();Image.new('RGB',(1536,1024),'blue').save(out,'WEBP');self.data=out.getvalue()
  (self.root/'portal/assets/ai/319712.webp').write_bytes(self.data)
  self.state={'projects':{'319712':{'version':0,'sha256':sha(self.data)}}};self.row={'projectId':'319712','version':1,'imageId':'00000000-0000-0000-0000-000000000001','sha256':sha(self.data),'size':len(self.data)}
 def tearDown(self):self.tmp.cleanup()
 def remote(self,row=None):return {'format':'hubrj-images-v1','images':[row or self.row]}
 def test_approved_image_plan_preserves_original_bytes(self):
  changes=plan(self.root,self.remote(),self.state,lambda _:self.data);self.assertEqual(changes[0][2],self.data);self.assertEqual((self.root/'portal/assets/ai/319712.webp').read_bytes(),self.data)
 def test_empty_export_changes_nothing(self):self.assertEqual(plan(self.root,{'format':'hubrj-images-v1','images':[]},self.state,lambda _:b''),[])
 def test_unknown_protocol_and_corrupt_payload_rejected(self):
  with self.assertRaises(ValueError):plan(self.root,self.remote({**self.row,'projectId':'../escape'}),self.state,lambda _:self.data)
  with self.assertRaises(ValueError):plan(self.root,self.remote(),self.state,lambda _:b'bad')
 def test_manual_image_conflict_rejected(self):
  (self.root/'portal/assets/ai/319712.webp').write_bytes(b'manual')
  with self.assertRaises(ValueError):plan(self.root,self.remote(),self.state,lambda _:self.data)
 def test_rollback_and_missing_approved_record_rejected(self):
  self.state['projects']['319712']['version']=2
  with self.assertRaises(ValueError):plan(self.root,self.remote(),self.state,lambda _:self.data)
  with self.assertRaises(ValueError):plan(self.root,{'format':'hubrj-images-v1','images':[]},self.state,lambda _:self.data)
 def test_wrong_dimensions_rejected_even_with_correct_hash(self):
  out=io.BytesIO();Image.new('RGB',(10,10)).save(out,'WEBP');data=out.getvalue()
  with self.assertRaises(ValueError):validate_image(data,{'size':len(data),'sha256':sha(data)})
if __name__=='__main__':unittest.main()
