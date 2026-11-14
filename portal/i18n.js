/* Interface translations. Project records and original documents are never rewritten. */
const interfaceTranslations = [
 ['title','HUB RJ | Innovation Portal'],
 ['.utility-inner > span:first-child','HUB RJ · Innovation, science and technology in the State of Rio de Janeiro'],
 ['.hero-actions > a:nth-child(2)','View results ↗'],
 ['.hero-art-label','STARTUPS<br><b>INNOVATION</b><br>CONNECTIONS'],
 ['.art-bubble.b1','AI'],['.hero-float small','The future happens here'],
 ['.hero-bottom > span',"Discover Rio de Janeiro’s innovation ecosystem"],['.hero-bottom > a','↓ Explore the portal'],
 ['.kpi:nth-child(1) > span','PROJECTS IN THE PHASE 02 DATASET'],['.kpi:nth-child(1) small','Imported records'],
 ['.kpi:nth-child(2) > span','MUNICIPALITIES REPRESENTED'],['.kpi:nth-child(2) small','As reported by applicants'],
 ['.kpi:nth-child(3) > span','FIELDS OF KNOWLEDGE'],['.kpi:nth-child(3) small','Fields reported in the projects'],
 ['.kpi:nth-child(4) > span','PROGRAM EDITION'],['.kpi:nth-child(4) small','FAPERJ Call No. 04/2025'],
 ['#vitrine .eyebrow','MEET THE INNOVATORS'],['#vitrine h2','Startup <span>showcase</span>'],
 ['#vitrine .section-head p','143 projects with AI-generated illustrations. Phase 02 summaries and Phase 3 selection checked by application number against the official FAPERJ list.'],
 ['#viewGrid','▦ Gallery'],['#viewList','☷ Catalogue'],
 ['#sortFilter option[value="title"]','Name A–Z'],['#sortFilter option[value="city"]','Municipality A–Z'],
 ['.result-head > a','View official results ↗'],
 ['#observatorio .eyebrow','DATA INSIGHTS'],['#observatorio h2','Innovation <span>Observatory</span>'],
 ['#observatorio .section-head p','Explore the geographical distribution and fields of knowledge represented in the project dataset.'],
 ['#exportCsv','Export public dataset as CSV ↧'],['#obsReset','Clear filters'],
 ['.obs-hint','Charts show all groups in the current selection. Scroll each list to see more results. The CSV export uses these same filters.'],
 ['.chart-card:nth-child(1) .card-title','Projects by municipality <span>PHASE 02</span>'],
 ['.chart-card:nth-child(2) .card-title','Fields of knowledge <span>PHASE 02</span>'],
 ['.obs-footer strong','History and transparency'],
 ['.obs-footer p','All 143 application numbers appear in the Phase 3 selection list published by FAPERJ on June 3, 2026. The charts describe the municipalities and fields reported in Phase 02 summaries; they do not represent rankings or disbursements.'],
 ['.obs-footer a','View FAPERJ results ↗'],
 ['#editais .eyebrow','OFFICIAL DOCUMENTATION'],['#editais h2','Calls and <span>results</span>'],
 ['#editais .section-head p','FAPERJ documents and announcements. Links lead to official sources.'],
 ['.doc-card:nth-child(1) strong','FAPERJ Call No. 04/2025'],['.doc-card:nth-child(1) p','HUB RJ Startup 2025 program and official publications.'],['.doc-card:nth-child(1) small','OPEN DOCUMENTATION ↗'],
 ['.doc-card:nth-child(2) strong','Selected for Phase 03'],['.doc-card:nth-child(2) p','Published June 3, 2026. All 143 application numbers were checked against the official list.'],['.doc-card:nth-child(2) small','VIEW SOURCE ↗'],
 ['.doc-card:nth-child(3) strong','Existing program dashboard'],['.doc-card:nth-child(3) p','Phases 01 and 02, comparison and ranking. Restricted access.'],['.doc-card:nth-child(3) small','OPEN ORIGINAL DASHBOARD ↗'],
 ['#evento .eyebrow','STARTUPS, SCIENCE AND TECHNOLOGY MEETUP'],['.event-lede','Startups, innovation and connections to transform our state.'],
 ['.event-details p:first-child','<strong>December 3–4, 2026</strong>'],['.event-details p:last-child','Times and program will be announced soon.'],
 ['.event-details + p','A gathering of professionals, researchers and entrepreneurs leading technological change in the state.'],
 ['.event-actions a:first-child','Save dates to calendar ↧'],['.event-actions a:last-child','Open invitation ↗'],
 ['.event-registration-status','Registration, check-in and certificate information will be announced after confirmation by the organizers.'],
 ['#noticias .eyebrow','FOLLOW THE ECOSYSTEM'],['#noticias h2','News and <span>achievements</span>'],
 ['#noticias .section-head p','Selected news published by FAPERJ. Each summary includes its publication date and original link.'],
 ['.news-card:nth-child(1) h3','HUB RJ startups present solutions at Rio Innovation Week'],['.news-card:nth-child(1) p','Phase 3 participants presented health, environmental, mobility and other projects on the Disruptive Stage at RIW 2026.'],
 ['.news-card:nth-child(2) h3','FAPERJ announces 143 projects selected for Phase 3'],['.news-card:nth-child(2) p','The official list includes projects approved following presentations in May. The portal’s application numbers were checked against this list.'],
 ['.news-card:nth-child(3) h3','HUB RJ de Inovação opens its doors in Catete'],['.news-card:nth-child(3) p','The space provides coworking areas, meeting rooms and studios to support entrepreneurs, researchers and initiatives in Rio de Janeiro’s innovation ecosystem.'],
 ['.news-card a','Read the official source ↗'],
 ['#contato .eyebrow','GET IN TOUCH'],['#contato h2','Institutional <span>contact</span>'],
 ['.contact-grid > div:first-child h3','Information about the call'],['.contact-grid > div:first-child p','Contact FAPERJ’s support center for questions about the Foundation’s programs, calls and procedures.'],['.contact-grid > div:first-child a','Contact FAPERJ support ↗'],
 ['.contact-grid > div:last-child h3','HUB RJ coordination'],['.contact-grid > div:last-child p','The coordination team’s direct contact channel will be announced after institutional confirmation. FAPERJ’s support center serves the Foundation and does not replace HUB RJ-specific assistance.'],
 ['.footer-grid > div:first-child p','Innovation Portal of the State of Rio de Janeiro'],['.footer-grid > div:first-child small','Prototype in development · Public data subject to validation'],
 ['.footer-grid > div:nth-child(2) strong','Explore'],['.footer-grid a[href="#observatorio"]','Observatory'],['.footer-grid a[href="#editais"]','Calls'],['.footer-grid a[href="#evento"]','Event'],
 ['.footer-grid > div:nth-child(3) strong','Institutional'],['.footer-grid > div:nth-child(3) a:first-of-type','Management area · restricted access ↗'],['.footer-grid > div:nth-child(3) p','Official partner logos will be added using authorized files.'],
 ['.foot-bottom','HUB RJ · Prototype for validation <span>2026</span>'],
 ['#globalSearchDialog h3','What are you looking for?']
];
const interfaceAttributes = [
 ['#projectSearch','placeholder','Search application number, name, solution or municipality'],['#projectSearch','aria-label','Search startups'],
 ['#globalSearchInput','placeholder','Search startups, municipalities and fields'],['#globalSearchDialog','aria-label','Search the portal'],
 ['#cityFilter','aria-label','Filter by municipality'],['#areaFilter','aria-label','Filter by field'],['#sortFilter','aria-label','Sort projects'],
 ['#contrastToggle','aria-label','Toggle contrast'],['#fontToggle','aria-label','Increase text size'],['#mainNav','aria-label','Main navigation'],
 ['#globalSearchBtn','aria-label','Search the portal'],['#closeSearch','aria-label','Close'],['#closeModal','aria-label','Close'],
 ['#projectModal','aria-label','Full project profile'],['#viewGrid','aria-label','Gallery view'],['#viewList','aria-label','Catalogue view'],
 ['#indicadores','aria-label','Dataset indicators'],['.brand','aria-label','HUB RJ, home'],
 ['.event-visual a','aria-label','Enlarge the HUB RJ Inova 2026 invitation'],
 ['.event-poster','alt','HUB RJ Inova 2026 invitation in Portuguese. December 3–4, Rua do Catete, 243, Rio de Janeiro. Further details to be announced.']
];
const englishSlides=[
 {eyebrow:'HUB RJ · STARTUP 2025/2026',title:'Connecting ideas.<br><em>Transforming Rio.</em>',desc:'Discover projects developing new technology, science and entrepreneurship solutions in the state.',label:'Explore startups',link:'#vitrine'},
 {eyebrow:'INNOVATION OBSERVATORY',title:'Data revealing<br><em>new directions.</em>',desc:'Explore municipalities, fields of knowledge and program results using traceable data.',label:'Explore indicators',link:'#observatorio'},
 {eyebrow:'HUB RJ INOVA 2026',title:'The future of innovation<br><em>connects us.</em>',desc:'Startups, innovation and connections to transform our state. Follow the event updates.',label:'Discover the event',link:'#evento'}
];
let interfaceOriginals=[];
function prepareInterfaceTranslations(){
 interfaceOriginals=interfaceTranslations.flatMap(([selector,en])=>Array.from(document.querySelectorAll(selector),node=>({node,pt:node.innerHTML,en})));
 interfaceOriginals.push(...interfaceAttributes.flatMap(([selector,attribute,en])=>Array.from(document.querySelectorAll(selector),node=>({node,attribute,pt:node.getAttribute(attribute),en}))));
 // Translate label text without replacing their select controls or event handlers.
 document.querySelectorAll('.obs-controls label').forEach((node,i)=>{const text=node.firstChild;interfaceOriginals.push({node:text,text:true,pt:text.textContent,en:i===0?'Municipality':'Field of knowledge'});});
 const note=document.createElement('p');note.id='translationNotice';note.className='obs-hint';note.hidden=true;note.lang='en';note.textContent='Project titles, summaries, classifications, source documents and CSV data remain in Portuguese. English translations of project content are pending editorial review.';document.querySelector('#vitrine .filters').before(note);
}
function applyInterfaceLanguage(){
 for(const entry of interfaceOriginals){const value=entry[currentLang];if(entry.attribute)entry.node.setAttribute(entry.attribute,value);else if(entry.text)entry.node.textContent=value;else entry.node.innerHTML=value;}
 document.querySelector('#translationNotice').hidden=currentLang!=='en';
 for(const [selector,en,pt] of [['#cityFilter','All municipalities','Todos os municípios'],['#obsCity','All municipalities','Todos os municípios'],['#areaFilter','All fields','Todas as áreas'],['#obsArea','All fields','Todas as áreas']]){const first=document.querySelector(selector).options[0];if(first)first.textContent=currentLang==='en'?en:pt;}
 document.querySelector('#menuToggle').setAttribute('aria-label',currentLang==='en'?(document.querySelector('#mainNav').classList.contains('open')?'Close menu':'Open menu'):(document.querySelector('#mainNav').classList.contains('open')?'Fechar menu':'Abrir menu'));
 document.querySelector('#langToggle').setAttribute('aria-label',currentLang==='en'?'Mudar para português':'Switch to English');
 setSlide(activeSlide);render();updateObservatory();
}
