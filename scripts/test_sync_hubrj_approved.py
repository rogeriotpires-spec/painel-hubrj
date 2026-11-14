import copy,unittest
from sync_hubrj_approved import fingerprint,plan_changes
class SyncTests(unittest.TestCase):
 def setUp(self):
  self.p={'id':'1','title':'Original','fullSummary':'Fonte preservada','solution':'Texto antigo'}
  self.local=[self.p];self.state={'projects':{'1':{'version':1,'field_sha256':fingerprint(self.p)}}}
  self.remote={'format':'hubrj-approved-v1','projects':[{**self.p,'reviewVersion':2,'solution':'Texto aprovado'}]}
 def test_approved_fields_only(self):
  p,s,changed=plan_changes(self.local,self.remote,self.state);self.assertEqual(p[0]['solution'],'Texto aprovado');self.assertEqual(p[0]['fullSummary'],'Fonte preservada');self.assertEqual(s['projects']['1']['version'],2);self.assertEqual(changed,['1']);self.assertEqual(self.p['solution'],'Texto antigo')
 def test_no_approval_does_not_overwrite(self):
  self.remote['projects'][0]['reviewVersion']=1;p,s,c=plan_changes(self.local,self.remote,self.state);self.assertEqual(p,self.local);self.assertFalse(c)
 def test_rejects_protocol_changes(self):
  self.remote['projects'][0]['id']='2'
  with self.assertRaises(ValueError):plan_changes(self.local,self.remote,self.state)
 def test_rejects_original_changes(self):
  self.remote['projects'][0]['fullSummary']='Outra fonte'
  with self.assertRaises(ValueError):plan_changes(self.local,self.remote,self.state)
 def test_rejects_manual_edit_conflict(self):
  self.local[0]['solution']='Edição manual'
  with self.assertRaises(ValueError):plan_changes(self.local,self.remote,self.state)
 def test_rejects_rollback(self):
  self.remote['projects'][0]['reviewVersion']=0
  with self.assertRaises(ValueError):plan_changes(self.local,self.remote,self.state)
if __name__=='__main__':unittest.main()
