const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
let projects=[],filtered=[],page=1,mode='grid',session=null,currentLang='pt',activeSlide=0;const pageSize=6;
const visualFor=(p)=>{let s=(p.title+' '+p.area+' '+p.summary).toLowerCase();let palette,icon,sector;
if(/saúde|medic|biol|farm|fisioter|clínic|hospital|pele|odont|terapia|paciente/.test(s)){palette=['#005e72','#17b9aa'];icon='✚';sector='Saúde e biotecnologia'}
else if(/agro|agric|planta|rural|cultivo|solo|alimento|fazenda/.test(s)){palette=['#176a37','#77b94b'];icon='❀';sector='Agro e sustentabilidade'}
else if(/ensino|educa|escola|aprendiz|aluno|gamific|inglês|língua/.test(s)){palette=['#3e36ab','#8c77ed'];icon='✧';sector='Educação e aprendizagem'}
else if(/turismo|viagem|cultura|cidade|arte|patrim/.test(s)){palette=['#a75317','#ffb457'];icon='◈';sector='Turismo e cultura'}
else if(/ambient|resíduo|recicla|sustent|energia|solar/.test(s)){palette=['#117c6d','#50caad'];icon='♻';sector='Meio ambiente e energia'}
else{palette=['#073b94','#27bde4'];icon='⌘';sector='Tecnologia e serviços'}
return {palette,icon,sector};};
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const cut=(s,n=170)=>String(s||'').length>n?String(s).slice(0,n).trim()+'…':s;
const countBy=(field,arr=projects)=>Object.entries(arr.reduce((m,p)=>(m[p[field]||'Não informado']=(m[p[field]||'Não informado']||0)+1,m),{})).sort((a,b)=>b[1]-a[1]);
const slides=[{eyebrow:'HUB RJ · STARTUP 2025/2026',title:'Conectando ideias.<br><em>Transformando o Rio.</em>',desc:'Conheça os projetos que estão construindo novas soluções em tecnologia, ciência e empreendedorismo no estado.',label:'Explorar startups',link:'#vitrine'},{eyebrow:'OBSERVATÓRIO DE INOVAÇÃO',title:'Dados que mostram<br><em>novos caminhos.</em>',desc:'Explore municípios, áreas de conhecimento e os resultados do programa com dados rastreáveis.',label:'Explorar indicadores',link:'#observatorio'},{eyebrow:'HUB RJ INOVA 2026',title:'O futuro da inovação<br><em>nos conecta.</em>',desc:'Startups, inovação e conexões para transformar nosso estado. Acompanhe as informações do encontro.',label:'Conhecer o evento',link:'#evento'}];
function setSlide(i){activeSlide=i;let a=currentLang==='en'?englishSlides[i]:slides[i];$('#heroEyebrow').textContent=a.eyebrow;if($('#heroTitle').innerHTML!==a.title)$('#heroTitle').innerHTML=a.title;$('#heroDesc').textContent=a.desc;$('#heroAction').href=a.link;const actionHtml=a.label+' <span>↗</span>';if($('#heroAction').innerHTML!==actionHtml)$('#heroAction').innerHTML=actionHtml;$$('#heroDots button').forEach((x,j)=>x.classList.toggle('active',i===j));}
function options(sel,values,first){$(sel).innerHTML=`<option value="">${first}</option>`+values.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');}
function updateStats(){const cities=countBy('city'),areas=countBy('area');$('#kpiProjects').textContent=projects.length;$('#kpiCities').textContent=cities.length;$('#kpiAreas').textContent=areas.length;options('#cityFilter',cities.map(x=>x[0]),'Todos os municípios');options('#areaFilter',areas.map(x=>x[0]),'Todas as áreas');options('#obsCity',cities.map(x=>x[0]).sort((a,b)=>a.localeCompare(b,'pt-BR')),'Todos os municípios');options('#obsArea',areas.map(x=>x[0]).sort((a,b)=>a.localeCompare(b,'pt-BR')),'Todas as áreas');
updateObservatory();}

const aiIds=new Set(["319520", "319526", "319542", "319545", "319553", "319554", "319555", "319557", "319559", "319563", "319564", "319565", "319573", "319579", "319583", "319589", "319594", "319598", "319602", "319603", "319606", "319608", "319610", "319612", "319613", "319620", "319621", "319631", "319640", "319641", "319648", "319649", "319651", "319657", "319660", "319661", "319668", "319671", "319681", "319687", "319690", "319694", "319702", "319703", "319712", "319713", "319721", "319726", "319737", "319742", "319744", "319746", "319749", "319750", "319752", "319754", "319758", "319763", "319766", "319768", "319769", "319770", "319773", "319774", "319775", "319778", "319779", "319780", "319781", "319785", "319786", "319788", "319789", "319792", "319797", "319798", "319802", "319804", "319808", "319812", "319813", "319815", "319817", "319821", "319827", "319829", "319835", "319837", "319842", "319846", "319847", "319848", "319852", "319854", "319859", "319860", "319862", "319863", "319864", "319875", "319876", "319877", "319879", "319887", "319894", "319895", "319898", "319904", "319910", "319915", "319916", "319920", "319929", "319934", "319935", "319936", "319944", "319972", "319979", "319980", "319982", "319983", "319984", "319985", "319986", "319987", "319990", "319997", "319998", "319999", "320000", "320001", "320003", "320005", "320018", "320019", "320037", "320054", "320060", "320078", "320109", "320151", "320172"]);
const CARD_SIZES='(max-width:600px) 45vw, (max-width:1000px) 35vw, 210px';
function cardImage(p,full){
 const alt=`Ilustração temática do projeto ${escapeHtml(p.title)}`;
 if(!aiIds.has(p.id))return `<img loading="lazy" decoding="async" src="assets/startups/${encodeURIComponent(p.id)}.svg" alt="${alt}">`;
 const id=encodeURIComponent(p.id),original=`assets/ai/${id}.webp`;
 if(full)return `<img loading="lazy" decoding="async" src="${original}" width="1536" height="1024" alt="${alt}">`;
 return `<img loading="lazy" decoding="async" src="assets/ai/640/${id}.webp" srcset="assets/ai/640/${id}.webp 640w, assets/ai/960/${id}.webp 960w" sizes="${CARD_SIZES}" width="640" height="427" alt="${alt}" onerror="this.onerror=null;this.removeAttribute('srcset');this.src='${original}'">`;
}
function tile(p,full=false){const img=aiIds.has(p.id)?`assets/ai/${encodeURIComponent(p.id)}.webp`:`assets/startups/${encodeURIComponent(p.id)}.svg`;
 const text=(v)=>v?escapeHtml(full?v:cut(v,255)):'<span class="field-unavailable">Não informado no resumo.</span>';
 return `<article lang="pt-BR" class="project-tile dossier" aria-label="Ficha do projeto ${escapeHtml(p.title)}">
 <div class="dossier-header"><div class="dossier-year">HUB RJ STARTUP <b>2025</b><small>FASE 02 · RESUMO DOCUMENTAL</small></div><h3>${escapeHtml(p.title)}</h3></div>
 <div class="dossier-meta"><span>⌖ ${escapeHtml(p.city)}</span><span>${escapeHtml(p.area)}</span><span>Protocolo ${escapeHtml(p.id)}</span></div>
 <div class="dossier-top"><div class="dossier-block"><h4>❕ PROBLEMA</h4><p>${text(p.problem)}</p></div><div class="dossier-image">${cardImage(p,full)}<small>${aiIds.has(p.id)?"Imagem ilustrativa do projeto":"Ilustração vetorial provisória"} · ${escapeHtml(p.sector)}</small></div><div class="dossier-block solution"><h4>♧ SOLUÇÃO PROPOSTA</h4><p>${text(p.solution)}</p></div></div>
 <div class="dossier-bottom"><div class="dossier-block difference"><h4>✦ DIFERENCIAL INOVADOR</h4><p>${text(p.difference)}</p></div><div class="dossier-block market"><h4>▤ POTENCIAL DE MERCADO</h4><p>${text(p.market)}</p></div><div class="dossier-block stage"><h4>☑ ESTÁGIO DECLARADO NA FASE 02</h4><p>${text(p.stage||'Estágio não confirmado na descrição disponível.')}</p></div></div>
 <div class="dossier-mission"><strong>◎ OBJETIVO DO PROJETO</strong><span>${text(p.mission)}</span></div>
 <div class="dossier-actions"><span>${p.officialResult?'FAPERJ · Selecionado para a Fase 3':'Resumo fornecido pelo proponente · situação oficial pendente de conferência'}</span><button data-open="${escapeHtml(p.id)}">Ampliar ficha ↗</button></div>
 </article>`;}
function filter(){let term=normalize($('#projectSearch').value),city=$('#cityFilter').value,area=$('#areaFilter').value,sort=$('#sortFilter').value;filtered=projects.filter(p=>(!city||p.city===city)&&(!area||p.area===area)&&normalize(`${p.id} ${p.title} ${p.city} ${p.area} ${p.fullSummary||''}`).includes(term));if(term&&!fullLoaded)ensureFull().then(filter).catch(console.error);filtered.sort((a,b)=>String(a[sort]||'').localeCompare(String(b[sort]||''),'pt-BR'));page=1;render();}
function render(){let start=(page-1)*pageSize;$('#resultCount').textContent=currentLang==='en'?`${filtered.length} project(s) found · Phase 02 dataset`:`${filtered.length} projeto(s) encontrado(s) · base documental da Fase 02`;$('#projectGrid').classList.toggle('catalog',mode==='catalog');$('#projectGrid').innerHTML=filtered.slice(start,start+pageSize).map(p=>tile(p)).join('')||(currentLang==='en'?'<p>No projects found.</p>':'<p>Nenhum projeto encontrado.</p>');let total=Math.ceil(filtered.length/pageSize);let positions=[...new Set([1,page-1,page,page+1,total].filter(i=>i>0&&i<=total))];$('#pagination').innerHTML=total>1?positions.map(i=>`<button class="${page===i?'selected':''}" data-page="${i}">${i}</button>`).join(''):'';}
function panel(title,value,clazz=''){return `<div class="sheet-panel ${clazz}"><h4>${title}</h4><p>${value?escapeHtml(value):'<span class="missing">Informação não disponível na planilha. Preenchimento sujeito à validação.</span>'}</p></div>`;}
async function viewProject(id){const p=projects.find(x=>x.id===String(id));if(!p)return;if(!fullLoaded){try{await ensureFull()}catch(err){console.error(err)}}
 $('#modalContent').innerHTML=`<div class="modal-dossier">${tile(p,true).replace('class="project-tile dossier"','class="project-tile dossier enlarged"')}
 <p class="official-result">${p.officialResult?`<a href="${escapeHtml(p.officialResult.url)}#page=${p.officialResult.page}" target="_blank" rel="noopener">Selecionado para a Fase 3 · FAPERJ, 03/06/2026 · Página ${p.officialResult.page} ↗</a>`:'Resultado oficial ainda não conferido.'}</p>
 <details class="original-summary"><summary>Consultar resumo original enviado pelo proponente</summary><p>${p.fullSummary!=null?escapeHtml(p.fullSummary):'Resumo original indisponível no momento. Tente novamente.'}</p></details>
 <div class="modal-source">Fonte: HUBRJ25_ResumoProjeto_F02.xlsx · Fase 02 · Os campos são sínteses dos textos declarados, não atestados de realização. Dados pessoais e de contato não são exibidos.</div>
 <div class="sheet-footer"><button id="printProject">Salvar ficha em PDF</button><button id="closeProject">Fechar</button></div></div>`;
 $('#projectModal').showModal();$('#closeProject').onclick=()=>$('#projectModal').close();$('#printProject').onclick=()=>window.print();}
function globalSearch(text){let t=normalize(text);if(t&&!fullLoaded)ensureFull().then(()=>globalSearch($('#globalSearchInput').value)).catch(console.error);$('#globalResults').innerHTML=t?projects.filter(p=>normalize(`${p.id} ${p.title} ${p.city} ${p.area} ${p.fullSummary||''}`).includes(t)).slice(0,7).map(p=>`<button class="global-result" data-global="${escapeHtml(p.id)}" style="width:100%;text-align:left;border:0;border-bottom:1px solid #e5edf5;background:white"><strong>${escapeHtml(p.title)}</strong><small>${escapeHtml(p.city)} · ${escapeHtml(p.area)}</small></button>`).join('')||(currentLang==='en'?'<p>No results.</p>':'<p>Sem resultados.</p>'):'';}
const dict={pt:{navHome:'Início',navStartups:'Startups',navObs:'Observatório',navResults:'Resultados',navEdicts:'Editais e resultados',navEvent:'Inova 2026',navNews:'Notícias',navContact:'Contato',login:'Área restrita ↗'},en:{navHome:'Home',navStartups:'Startups',navObs:'Innovation Observatory',navResults:'Results',navEdicts:'Calls and results',navEvent:'Inova 2026',navNews:'News',navContact:'Contact',login:'Restricted area ↗'}};

function observatoryRecords(){
 const city=$('#obsCity').value,area=$('#obsArea').value;
 return projects.filter(p=>(!city||p.city===city)&&(!area||p.area===area));
}
let obsVisible=false,obsPending=false;
function updateObservatory(){
 if(!obsVisible){obsPending=true;return;}
 obsPending=false;
 const records=observatoryRecords();
 $('#obsCount').textContent=currentLang==='en'?`${records.length} of ${projects.length} projects · ${countBy('city',records).length} municipalities · ${countBy('area',records).length} fields`:`${records.length} de ${projects.length} projetos · ${countBy('city',records).length} municípios · ${countBy('area',records).length} áreas`;
 for(const [field,target] of [['city','#cityBars'],['area','#areaBars']]){
  const items=countBy(field,records);
  $(target).innerHTML=items.map(([name,count])=>`<div class="bar-row"><div class="bar-label" title="${escapeHtml(name)}">${escapeHtml(name)}</div><div class="bar-track"><div class="bar-fill" style="width:${100*count/items[0][1]}%"></div></div><span class="bar-val">${count}</span></div>`).join('')||(currentLang==='en'?'<p>No projects match these filters.</p>':'<p>Nenhum projeto nesta combinação.</p>');
 }
}

let fullLoaded=false,fullPromise=null;
// A vitrine abre com o índice leve; resumos completos (fullSummary) vêm de projects.json sob demanda.
function ensureFull(){
 if(fullLoaded)return Promise.resolve();
 if(!fullPromise)fullPromise=fetch('data/projects.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Base completa não encontrada');return r.json()}).then(full=>{const byId=new Map(full.map(x=>[x.id,x]));projects.forEach(p=>Object.assign(p,byId.get(p.id)||{}));fullLoaded=true;}).catch(err=>{fullPromise=null;throw err;});
 return fullPromise;
}
async function fetchProjectBase(){
 try{const r=await fetch('data/projects-index.json',{cache:'no-cache'});if(!r.ok)throw Error('index');return await r.json();}
 catch(e){const r=await fetch('data/projects.json',{cache:'no-cache'});if(!r.ok)throw Error('Base de projetos não encontrada');fullLoaded=true;return r.json();}
}
async function loadProjects(){try{projects=await fetchProjectBase();filtered=projects.slice();updateStats();filter();applyInterfaceLanguage();}catch(err){$('#resultCount').textContent='Não foi possível carregar a vitrine. Consulte a equipe do HUB RJ.';$('#projectGrid').innerHTML='<p>Falha na leitura dos projetos.</p>';console.error(err)}}
async function jsonApi(url,method='GET',body=null){let r=await fetch(url,{method,headers:{'Content-Type':'application/json',...(session?{'Authorization':'Bearer '+session.token}:{})},body:body?JSON.stringify(body):undefined});let j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.detail||'Falha de comunicação');return j;}
async function setupAdmin(){if(!session)return;try{let p=await jsonApi('/api/updates');$('#adminPanel').innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap"><strong>Perfil: ${escapeHtml(session.role)}</strong><button id="logout" class="btn outline">Sair</button></div><p>Atualizações pendentes: ${p.length}</p><div class="admin-list">${p.map(x=>`<div class="admin-item"><strong>${escapeHtml(x.project_id)} · ${escapeHtml(x.field)}</strong><span>${escapeHtml(x.value)}</span><small>Enviado por ${escapeHtml(x.author)} · ${escapeHtml(x.created_at)}</small><button data-approve="${x.id}">Aprovar</button></div>`).join('')||'<p>Nenhuma atualização pendente.</p>'}</div><form id="updateForm" style="margin-top:22px;display:grid;gap:10px"><h3>Solicitar atualização de startup</h3><input name="project_id" placeholder="Protocolo do projeto" required><select name="field"><option value="stage">Estágio atual</option><option value="summary">Resumo</option><option value="website">Site oficial</option></select><textarea name="value" required placeholder="Novo valor proposto"></textarea><button class="btn primary">Enviar para aprovação</button></form><p id="adminMessage"></p>`;$('#logout').onclick=()=>{session=null;location.hash='#administracao';location.reload()};$$('[data-approve]').forEach(b=>b.onclick=async()=>{try{await jsonApi('/api/updates/'+b.dataset.approve+'/approve','POST');setupAdmin()}catch(e){$('#adminMessage').textContent=e.message}});$('#updateForm').onsubmit=async e=>{e.preventDefault();let o=Object.fromEntries(new FormData(e.target));try{await jsonApi('/api/updates','POST',o);setupAdmin()}catch(e){$('#adminMessage').textContent=e.message}};}catch(e){$('#adminPanel').textContent=e.message;}}
document.addEventListener('DOMContentLoaded',()=>{prepareInterfaceTranslations();loadProjects();['obsCity','obsArea'].forEach(id=>$('#'+id).onchange=updateObservatory);$('#obsReset').onclick=()=>{$('#obsCity').value='';$('#obsArea').value='';updateObservatory()};$$('#heroDots button').forEach(b=>b.onclick=()=>setSlide(+b.dataset.slide));$('#viewGrid').onclick=()=>{mode='grid';$('#viewGrid').classList.add('selected');$('#viewList').classList.remove('selected');render()};$('#viewList').onclick=()=>{mode='catalog';$('#viewList').classList.add('selected');$('#viewGrid').classList.remove('selected');render()};['projectSearch','cityFilter','areaFilter','sortFilter'].forEach(id=>$('#'+id).addEventListener(id==='projectSearch'?'input':'change',filter));$('#projectGrid').onclick=e=>{let b=e.target.closest('[data-open]');if(b)viewProject(b.dataset.open)};$('#pagination').onclick=e=>{let b=e.target.closest('[data-page]');if(b){page=+b.dataset.page;render();$('#vitrine').scrollIntoView({behavior:'smooth'})}};$('#closeModal').onclick=()=>$('#projectModal').close();$('#menuToggle').onclick=()=>{const open=$('#mainNav').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));$('#menuToggle').setAttribute('aria-label',currentLang==='en'?(open?'Close menu':'Open menu'):(open?'Fechar menu':'Abrir menu'))};$$('#mainNav a').forEach(a=>a.onclick=()=>{$('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').setAttribute('aria-label',currentLang==='en'?'Open menu':'Abrir menu')});$('#globalSearchBtn').onclick=()=>$('#globalSearchDialog').showModal();$('#closeSearch').onclick=()=>$('#globalSearchDialog').close();$('#globalSearchInput').oninput=e=>globalSearch(e.target.value);$('#globalResults').onclick=e=>{let b=e.target.closest('[data-global]');if(b){$('#globalSearchDialog').close();viewProject(b.dataset.global)}};$('#contrastToggle').onclick=()=>document.body.classList.toggle('high-contrast');$('#fontToggle').onclick=()=>{let px=parseInt(getComputedStyle(document.documentElement).fontSize,10);document.documentElement.style.setProperty('--base',(px>=20?16:px+2)+'px')};$('#langToggle').onclick=()=>{currentLang=currentLang==='pt'?'en':'pt';document.documentElement.lang=currentLang==='pt'?'pt-BR':'en';$('#langToggle').textContent=currentLang==='pt'?'EN':'PT';$$('[data-i18n]').forEach(el=>el.textContent=dict[currentLang][el.dataset.i18n]);applyInterfaceLanguage()};if($('#loginForm'))$('#loginForm').onsubmit=async e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target));try{session=await jsonApi('/api/login','POST',d);setupAdmin()}catch(e){$('#adminMessage').textContent=e.message}};if($('#registerForm'))$('#registerForm').onsubmit=async e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target));d.consent=!!d.consent;try{let result=await jsonApi('/api/registrations','POST',d);$('#registerMessage').textContent='Inscrição registrada. Guarde seu QR Code.';$('#ticketResult').innerHTML=`<img src="${result.qr_data_url}" alt="QR Code de credenciamento" style="width:180px"><p><strong>Protocolo:</strong> ${escapeHtml(result.reference)}</p>`}catch(err){$('#registerMessage').textContent='Para registrar inscrições, execute o servidor do projeto. '+err.message}};if($('#contactForm'))$('#contactForm').onsubmit=async e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target));try{await jsonApi('/api/contact','POST',d);$('#contactMessage').textContent='Mensagem registrada para encaminhamento institucional.';e.target.reset()}catch(err){$('#contactMessage').textContent='O recebimento ficará ativo após configurar o servidor e o e-mail institucional.'}};});

/* Resultados do Programa: dados agregados e anonimizados de data/execucao.json (sem nomes de startups, proponentes ou Agentes de Inovação). */
let EX=null,rxTab='geral',rxFilter={q:'',polo:''};
const RX_BAND_COLORS={'Destaque':'#3ccf91','Promissor':'#48c4f2','Intermediário':'#ffb457','Atenção':'#ff7a7a'};
const rxT=k=>(typeof execucaoText!=='undefined'&&execucaoText[currentLang]&&execucaoText[currentLang][k])||k;
const rxN=(v,d=0)=>Number(v).toLocaleString(currentLang==='en'?'en-US':'pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
function rxBars(items,{max,dec=0,suffix='',color}={}){
 const m=max??Math.max(...items.map(i=>i[1]));
 return `<div class="bars rx-bars">${items.map(([l,v,x])=>`<div class="bar-row"><div class="bar-label" title="${escapeHtml(l)}">${escapeHtml(l)}</div><div class="bar-track"><div class="bar-fill" style="width:${m?(100*v/m).toFixed(1):0}%${color?`;background:${color}`:''}"></div></div><span class="bar-val">${rxN(v,dec)}${suffix}${x!=null?` <small>${escapeHtml(x)}</small>`:''}</span></div>`).join('')}</div>`;
}
function rxCompare(labels,a,b,{max,dec=0,labA=rxT('phase1'),labB=rxT('phase2')}={}){
 const m=max??Math.max(...a,...b);
 return `<div class="rx-legend"><span><i class="rx-a"></i>${escapeHtml(labA)}</span><span><i class="rx-b"></i>${escapeHtml(labB)}</span></div><div class="rx-cmp">${labels.map((l,i)=>`<div class="rx-cmp-row"><div class="bar-label" title="${escapeHtml(l)}">${escapeHtml(l)}</div><div><div class="bar-row"><div class="bar-track"><div class="bar-fill rx-fill-a" style="width:${(100*a[i]/m).toFixed(1)}%"></div></div><span class="bar-val">${rxN(a[i],dec)}</span></div><div class="bar-row"><div class="bar-track"><div class="bar-fill rx-fill-b" style="width:${(100*b[i]/m).toFixed(1)}%"></div></div><span class="bar-val">${rxN(b[i],dec)}</span></div></div></div>`).join('')}</div>`;
}
function rxVbars(labels,vals){const m=Math.max(...vals);return `<div class="rx-vbars">${vals.map((v,i)=>`<div class="rx-vcol"><span>${rxN(v)}</span><div class="rx-vtrack"><div style="height:${(100*v/m).toFixed(1)}%"></div></div><small>${escapeHtml(labels[i])}</small></div>`).join('')}</div>`;}
const rxCard=(title,body,sub='',wide=false)=>`<article class="rx-card${wide?' wide':''}"><h3>${title}</h3>${sub?`<p class="rx-sub">${sub}</p>`:''}${body}</article>`;
const rxPairs=items=>`<div class="rx-pairs">${items.map(([b,s])=>`<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>`;
const rxSource=(fonte,versao)=>`<p class="rx-source">${rxT('source')}: ${escapeHtml(fonte)} · ${rxT('version')}: ${escapeHtml(versao)}</p>`;
function rxBandsBlock(faixas){const tot=faixas.reduce((a,b)=>a+b,0);return `<div class="rx-bands">${EX.programa.faixasRot.map((r,i)=>{const nome=r.split(' (')[0];return `<div style="--c:${RX_BAND_COLORS[nome]||'#48c4f2'}"><b>${rxN(faixas[i])}</b><span>${escapeHtml(r)}</span><small>${rxN(faixas[i]/tot*100,1)}%</small></div>`}).join('')}</div>`;}
function rxGeral(){
 const p=EX.programa,f=p.funil,m=f[0].v;
 const funil=`<div class="rx-funnel">${f.map((r,i)=>`<div><div class="rx-fn-top"><span>${escapeHtml(r.rot)}</span><b>${rxN(r.v)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${(100*r.v/m).toFixed(1)}%"></div></div><small>${escapeHtml(r.nota)}${i>0?` · ${rxN(r.v/m*100,1)}% ${rxT('ofApplied')}`:''}</small></div>`).join('')}</div>`;
 const resumo=x=>`<ul class="rx-list"><li><strong>${escapeHtml(x.periodo)}</strong><span>${rxT('period')}</span></li><li><strong>${x.cap.temas} · ${x.cap.turmas} · ${x.cap.horasTurma}h</strong><span>${rxT('themes')} · ${rxT('classes')} · ${rxN(x.cap.presencas)} ${rxT('attendance')}</span></li><li><strong>${x.men.ais} ${rxT('agents')} · ${rxN(x.men.registros)} ${rxT('records')}</strong><span>${x.men.startups} ${escapeHtml(x.entidade)} ${rxT('followed')} · ${escapeHtml(x.men.periodo)}</span></li><li><strong>${escapeHtml(x.pitch.nome)}: ${rxN(x.pitch.media,2)}</strong><span>${x.pitch.avaliados} ${rxT('evaluated')} · ${x.pitch.internos}+${x.pitch.externos} ${rxT('evaluators')} · ${escapeHtml(x.pitch.periodo)}</span></li></ul>`;
 return `${rxPairs(p.consolidados.map(([v,l])=>[escapeHtml(v),escapeHtml(l)]))}<div class="rx-grid">${rxCard(rxT('funnel'),funil,rxT('funnelSub'),true)}${rxCard(`${escapeHtml(EX.f1.nome)} · ${escapeHtml(EX.f1.titulo)}`,resumo(EX.f1))}${rxCard(`${escapeHtml(EX.f2.nome)} · ${escapeHtml(EX.f2.titulo)}`,resumo(EX.f2))}</div><p class="rx-note">${escapeHtml(p.nota)}</p>${rxSource(p.fonte,p.versao)}`;
}
function rxFase(k){
 const x=EX[k],isF2=k==='f2',P=EX.programa,tot=x.porPolo.reduce((a,b)=>a+b,0),ent=x.entidade;
 const polos=P.polos.map((p,i)=>[p,x.porPolo[i],`${rxN(x.porPolo[i]/tot*100,1)}%`]).sort((a,b)=>b[1]-a[1]);
 const metro=x.porPolo[0]+x.porPolo[1];
 const trilha=`<div class="rx-table"><table><thead><tr><th>${rxT('code')}</th><th>${rxT('theme')}</th><th class="r">${rxT('load')}</th><th class="r">${rxT('presences')}</th><th class="r">${rxT('perception')}</th></tr></thead><tbody>${x.cap.trilha.map(([c,t,h,pr,s])=>`<tr><td>${escapeHtml(c)}</td><td>${escapeHtml(t)}</td><td class="r">${h}h</td><td class="r">${rxN(pr)}</td><td class="r">${rxN(s,2)}</td></tr>`).join('')}</tbody></table></div>`;
 let valid='';
 if(isF2&&x.valid){const v=x.valid,gl=[rxT('validated'),rxT('inValidation'),rxT('notValidated')],gc=['#3ccf91','#ffb457','#ff7a7a'];
  const row=(lab,arr)=>`<div class="rx-stack-row"><span>${lab}</span><div class="rx-stack">${arr.map((n,i)=>`<div style="width:${n}%;background:${gc[i]}" title="${gl[i]}: ${rxN(n,1)}%">${n>=8?rxN(n,1)+'%':''}</div>`).join('')}</div></div>`;
  valid=`<h3 class="rx-section-title">${rxT('validation')}</h3><div class="rx-grid">${rxCard(rxT('valGlobal'),`<div class="rx-legend">${gl.map((g,i)=>`<span><i style="background:${gc[i]}"></i>${g}</span>`).join('')}</div>${row('S14',v.global[0])}${row('S17',v.global[1])}${rxPairs([[`${rxN(v.media[0],3)} → ${rxN(v.media[1],3)}`,rxT('valMean')],[`${rxN(v.mediana[0],3)} → ${rxN(v.mediana[1],3)}`,rxT('valMedian')],[`${v.s14} / ${v.s17}`,`${rxT('valCount')} (${v.ambos} ${rxT('valBoth')})`]])}`)}${rxCard(rxT('valDims'),`<ul class="rx-list">${v.dims.map(d=>`<li><strong>${escapeHtml(d)}</strong></li>`).join('')}</ul><p class="rx-note">${rxT('valScale')}</p>`)}</div>`;}
 const p=x.pitch;
 return `<p class="rx-kicker">${escapeHtml(x.nome)} · ${escapeHtml(x.titulo)} · ${escapeHtml(x.sub)} · ${rxT('period')} ${escapeHtml(x.periodo)}</p>
 ${rxPairs(x.kpis.map(([v,l])=>[escapeHtml(v),escapeHtml(l)]))}
 <h3 class="rx-section-title">${rxT('territory')}</h3><p class="rx-base">${rxT(isF2?'baseF2':'baseF1')}</p>
 <div class="rx-grid">${rxCard(`${ent[0].toUpperCase()+ent.slice(1)} ${rxT('byPolo')}`,rxBars(polos),`${rxT('metro')}: ${metro} ${ent} (${rxN(metro/tot*100,1)}%)`)}${rxCard(rxT('mainCities'),rxBars(x.municipios),`${x.municipiosTotal} ${rxT('municipalities')} · ${tot} ${ent}`)}</div>
 <h3 class="rx-section-title">${rxT('training')}</h3>${rxPairs([[x.cap.temas,rxT('themes')],[x.cap.turmas,rxT('classes')],[x.cap.encontros,rxT('meetings')],[x.cap.horasTotal+'h',`${rxT('hours')} (${x.cap.turmas} × ${x.cap.horasTurma}h)`],[rxN(x.cap.presencas),rxT('attendance')]])}
 <div class="rx-grid">${rxCard(rxT('track'),trilha,rxT('trackSub'),true)}${rxCard(rxT('byClass'),rxBars(x.cap.turmasLista.map(([t,n,pr])=>[t,pr,`(${n})`])),rxT('byClassSub'))}${rxCard(rxT('perCrit'),rxBars(x.cap.percepcao,{max:10,dec:2}),isF2&&x.cap.respostas?escapeHtml(x.cap.respostas):rxT('perCritSub'))}</div>
 <h3 class="rx-section-title">${rxT('mentoring')}</h3>${rxPairs([[x.men.ais,rxT('agents')],[rxN(x.men.registros),rxT('records')+(isF2?` (${x.men.padrao} + ${x.men.validacao} S14/S17)`:'')],[x.men.startups,`${ent} ${rxT('followed')}`],[escapeHtml(x.men.cobertura),rxT(isF2?'cov2':'cov1')],[escapeHtml(x.men.mediaReg),rxT(isF2?'avg2':'avg1')]])}
 <div class="rx-grid">${rxCard(escapeHtml(x.men.serieTitulo),rxVbars(x.men.serieRot,x.men.serie),`${rxT('period')} ${escapeHtml(x.men.periodo)}`)}${rxCard(escapeHtml(x.men.distTitulo),rxVbars(x.men.distRot,x.men.dist),rxT('regularity'))}${rxCard(rxT('dims'),rxBars(P.menDims.map((d,i)=>[d,x.men.dims[i]]),{max:5,dec:2}),`${rxT('dimsSub')} ${rxN(x.men.dimsMedia,2)}`)}</div><p class="rx-note">${rxT('mentNote')}</p>
 <h3 class="rx-section-title">${rxT('complementary')}</h3><div class="rx-grid">${rxCard(escapeHtml(x.compTotal),`<ul class="rx-list">${x.comp.map(([t,c,d])=>`<li><strong>${escapeHtml(t)}</strong><span>${escapeHtml(c)} · ${escapeHtml(d)}</span></li>`).join('')}</ul>`,rxT('compSub'),true)}</div>
 ${valid}
 <h3 class="rx-section-title">${rxT('pitch')} · ${escapeHtml(p.nome)}</h3>
 <div class="rx-grid">${rxCard(rxN(p.media,2),`<p class="rx-sub">${rxT('mean')}</p>${rxPairs([[p.avaliados,`${ent} ${rxT('evaluated')}`],[p.registros,rxT('indiv')],[`${p.internos} + ${p.externos}`,rxT('evaluators')]])}<p class="rx-note">${escapeHtml(p.periodo)} · ${escapeHtml(p.local)}</p>`)}${rxCard(rxT('dimMeans'),rxBars(p.dimsRot.map((d,i)=>[d,p.dims[i]]),{max:10,dec:2}))}${rxCard(rxT('bands'),rxBandsBlock(p.faixas)+`<p class="rx-note">${rxT('bandsNote')}</p>`,'',true)}</div>
 ${rxSource(x.fonte,x.versao)}`;
}
function rxComparativo(){
 const f1=EX.f1,f2=EX.f2,P=EX.programa,c=EX.comparativo;
 const ret=P.polos.map((p,i)=>[p,f2.porPolo[i]/f1.porPolo[i]*100,`${f1.porPolo[i]} → ${f2.porPolo[i]}`]).sort((a,b)=>b[1]-a[1]);
 const tabela=`<div class="rx-table"><table><thead><tr><th>${rxT('indicator')}</th><th class="r">${rxT('phase1')}</th><th class="r">${rxT('phase2')}</th></tr></thead><tbody>${c.quadro.map(([l,a,b])=>`<tr><td>${escapeHtml(l)}</td><td class="r">${escapeHtml(a)}</td><td class="r">${escapeHtml(b)}</td></tr>`).join('')}</tbody></table></div>`;
 return `<div class="rx-grid">${rxCard(rxT('summary'),tabela,'',true)}
 ${rxCard(rxT('cmpPitch'),rxCompare(f1.pitch.dimsRot.slice(0,5),f1.pitch.dims.slice(0,5),f2.pitch.dims.slice(0,5),{max:10,dec:2,labA:f1.pitch.nome,labB:f2.pitch.nome}),rxT('cmpPitchSub'))}
 ${rxCard(rxT('cmpMen'),rxCompare(P.menDims,f1.men.dims,f2.men.dims,{max:5,dec:2}),rxT('cmpMenSub'))}
 ${rxCard(rxT('cmpPerc'),rxCompare(f1.cap.percepcao.map(x=>x[0]),f1.cap.percepcao.map(x=>x[1]),f2.cap.percepcao.map(x=>x[1]),{max:10,dec:2}),rxT('perCritSub'))}
 ${rxCard(rxT('retention'),rxBars(ret,{max:100,dec:1,suffix:'%'}),rxT('retentionSub'))}
 ${rxCard(rxT('cmpBands'),rxCompare(P.faixasRot,f1.pitch.faixas.map(v=>v/f1.pitch.avaliados*100),f2.pitch.faixas.map(v=>v/f2.pitch.avaliados*100),{max:50,dec:1,labA:f1.pitch.nome,labB:f2.pitch.nome}),rxT('cmpBandsSub'),true)}</div>
 ${rxSource(c.fonte,c.versao)}`;
}
function rxTitleFor(protocol){const p=projects.find(x=>x.id===String(protocol));return p&&p.title?p.title:'—';}
function rxRankRows(){
 const r=EX.rankingPitch02.registros,q=normalize(rxFilter.q);
 const out=r.filter(([n,c,po])=>(!rxFilter.polo||po===rxFilter.polo)&&(!q||normalize(c).includes(q)));
 return {out,html:out.length?out.map(([n,c,po])=>`<tr><td class="r">${n}º</td><td class="rx-code">${escapeHtml(c)}</td><td>${escapeHtml(po)}</td><td class="rx-title">${escapeHtml(rxTitleFor(c))}</td></tr>`).join(''):`<tr><td colspan="4">${rxT('none')}</td></tr>`};
}
function rxRanking(){
 const R=EX.rankingPitch02;
 const polos=[...new Set(R.registros.map(x=>x[2]))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const {out,html}=rxRankRows();
 return `<div class="rx-grid">${rxCard(rxT('rank'),`<div class="rx-rank-tools"><input id="rxRankQ" type="search" inputmode="numeric" placeholder="${rxT('searchProtocol')}" aria-label="${rxT('searchProtocol')}" value="${escapeHtml(rxFilter.q)}"><select id="rxRankPolo" aria-label="${rxT('polo')}"><option value="">${rxT('allPolos')}</option>${polos.map(p=>`<option value="${escapeHtml(p)}"${rxFilter.polo===p?' selected':''}>${escapeHtml(p)}</option>`).join('')}</select></div><div class="rx-table rx-rank"><table><thead><tr><th class="r">${rxT('position')}</th><th>${rxT('protocol')}</th><th>${rxT('polo')}</th><th>${rxT('projectTitle')}</th></tr></thead><tbody id="rxRankBody">${html}</tbody></table></div><p class="rx-note" id="rxRankCount">${out.length} ${rxT('of')} ${R.registros.length} ${rxT('shown')}.</p><p class="rx-note">${rxT('rankNote')}</p>`,rxT('rankSub'),true)}</div>${rxSource(R.fonte,R.versao)}`;
}
function rxUpdateRank(){const {out,html}=rxRankRows();$('#rxRankBody').innerHTML=html;$('#rxRankCount').textContent=`${out.length} ${rxT('of')} ${EX.rankingPitch02.registros.length} ${rxT('shown')}.`;}
function renderExecucao(){
 const view=document.getElementById('rxView');if(!view)return;
 if(!EX){view.innerHTML=`<p>${rxT('loading')}</p>`;return;}
 $$('#rxTabs [data-rx]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.rx===rxTab)));
 const note=rxT('labelsNote');
 view.innerHTML=(note&&note!=='labelsNote'?`<p class="rx-note">${note}</p>`:'')+(rxTab==='f1'||rxTab==='f2'?rxFase(rxTab):rxTab==='cmp'?rxComparativo():rxTab==='rank'?rxRanking():rxGeral());
}
async function loadExecucao(){
 const view=document.getElementById('rxView');if(!view)return;
 const tabs=document.getElementById('rxTabs');
 if(tabs)tabs.addEventListener('click',e=>{const b=e.target.closest('[data-rx]');if(!b)return;rxTab=b.dataset.rx;renderExecucao();});
 view.addEventListener('input',e=>{if(e.target.id==='rxRankQ'){rxFilter.q=e.target.value;rxUpdateRank();}});
 view.addEventListener('change',e=>{if(e.target.id==='rxRankPolo'){rxFilter.polo=e.target.value;rxUpdateRank();}});
 try{const r=await fetch('data/execucao.json',{cache:'no-cache'});if(!r.ok)throw Error('execucao.json');EX=await r.json();renderExecucao();}
 catch(err){view.innerHTML=`<p>${rxT('error')}</p>`;console.error(err);}
}
// Observatório e Resultados só são desenhados quando se aproximam da área visível.
function whenNearViewport(selector,callback){
 const el=document.querySelector(selector);if(!el)return;
 if(!('IntersectionObserver' in window)){callback();return;}
 const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();callback();}},{rootMargin:'600px 0px'});
 io.observe(el);
}
document.addEventListener('DOMContentLoaded',()=>{
 whenNearViewport('#observatorio',()=>{obsVisible=true;if(obsPending&&projects.length)updateObservatory();});
 whenNearViewport('#resultados',loadExecucao);
});
