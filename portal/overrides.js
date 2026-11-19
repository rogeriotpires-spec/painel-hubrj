/* HUB RJ · atualizações dos cards feitas pelos proponentes (Área do proponente).
   Lê, numa única consulta pública, os campos editados no Supabase e aplica por cima da base estática.
   Título, protocolo e município nunca são sobrescritos. Usa apenas a chave publicável (somente leitura pública). */
(function(){
 const SUPABASE_URL='https://swznuvnqoylkekibrtij.supabase.co';
 const SUPABASE_KEY='sb_publishable_HRl6D718LUBZKiLN-8Kw4Q_WxKaEPuc';
 // coluna no Supabase -> campo do projeto no portal
 const FIELDS={applicant:'applicant',area:'area',sector:'sector',summary:'summary',full_summary:'fullSummary',problem:'problem',solution:'solution',difference:'difference',market:'market',stage:'stage',mission:'mission',website:'website',image_url:'imageUrl'};
 const LOCKED=new Set(['id','title','city']);
 let promise=null,map=null;
 function load(timeoutMs=4000){
  if(promise)return promise;
  const ctrl=typeof AbortController!=='undefined'?new AbortController():null;
  const timer=ctrl?setTimeout(()=>ctrl.abort(),timeoutMs):null;
  const cols=['protocolo','edited_at',...Object.keys(FIELDS)].join(',');
  promise=fetch(`${SUPABASE_URL}/rest/v1/hubrj_cards?select=${cols}&edited_at=not.is.null`,{headers:{apikey:SUPABASE_KEY,Accept:'application/json'},cache:'no-store',signal:ctrl?ctrl.signal:undefined})
   .then(r=>{if(!r.ok)throw Error('overrides '+r.status);return r.json();})
   .then(rows=>{map=new Map(rows.map(r=>[String(r.protocolo),r]));return map;})
   .catch(err=>{console.warn('Atualizações dos proponentes indisponíveis; usando a base estática.',err);map=new Map();return map;})
   .finally(()=>{if(timer)clearTimeout(timer);});
  return promise;
 }
 function applyOne(p,row){
  if(!p||!row)return p;
  for(const [col,field] of Object.entries(FIELDS)){
   if(LOCKED.has(field))continue;
   const v=row[col];
   if(v!==null&&v!==undefined&&String(v).trim()!=='')p[field]=v;
  }
  p.updatedByApplicant=row.edited_at||true;
  return p;
 }
 function apply(list){if(!map||!Array.isArray(list))return list;list.forEach(p=>applyOne(p,map.get(String(p.id))));return list;}
 const safeUrl=u=>/^https:\/\/swznuvnqoylkekibrtij\.supabase\.co\/storage\/v1\/object\/public\/hubrj-cards\/[A-Za-z0-9\/_.-]+$/.test(String(u||''))?String(u):'';
 const safeLink=u=>/^https?:\/\//i.test(String(u||''))?String(u):'';
 window.HubrjOverrides={load,apply,applyOne,safeUrl,safeLink,get map(){return map;},SUPABASE_URL,SUPABASE_KEY,FIELDS};
})();
