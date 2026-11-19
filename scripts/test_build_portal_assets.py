import io,json,unittest
from pathlib import Path
from PIL import Image
import build_portal_assets as b
class BuildPortalAssetsTests(unittest.TestCase):
 def test_thumbnails_keep_aspect_ratio_and_are_webp(self):
  out=io.BytesIO();Image.new('RGB',(1536,1024),'blue').save(out,'WEBP')
  for width in b.THUMB_WIDTHS:
   with Image.open(io.BytesIO(b.thumbnail_bytes(out.getvalue(),width))) as image:
    self.assertEqual(image.format,'WEBP');self.assertEqual(image.size,(width,round(1024*width/1536)))
 def test_index_keeps_card_fields_and_drops_long_summaries(self):
  record={k:k+'-v' for k in b.INDEX_FIELDS};record.update(fullSummary='longo',summary='antigo',applicant='Nome')
  index=json.loads(b.index_bytes([record]))
  self.assertEqual(set(index[0]),set(b.INDEX_FIELDS))
  for key in b.INDEX_FIELDS:self.assertEqual(index[0][key],record[key])
  for key in ('fullSummary','summary','applicant'):self.assertNotIn(key,index[0])
 def test_index_covers_every_csv_column(self):
  csv_fields={'id','title','city','area','phase','problem','solution','difference','market','stage','mission','officialResult'}
  self.assertTrue(csv_fields<=set(b.INDEX_FIELDS))
if __name__=='__main__':unittest.main()
