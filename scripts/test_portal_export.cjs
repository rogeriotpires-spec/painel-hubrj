// Downloads (images, CSV export, .ics calendar) were removed from the portal on 19/11/2026.
// "Salvar ficha em PDF" (window.print) was restored at the coordinator's request.
// These tests guard the removal, the restored PDF button and the Pitch_02 ranking title column.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const strip = html => html
 .replace(/<script[^>]*id="encoded-data"[^>]*>[\s\S]*?<\/script>/g, '')
 .replace(/data:[a-z/+]+;base64,[A-Za-z0-9+/=]+/g, '');
const sources = ['portal/index.html','portal/vitrine.html','portal/app.js','portal/i18n.js'].map(f => [f, strip(fs.readFileSync(f,'utf8'))]);
test('no image download, CSV export or calendar file remains in the portal', () => {
 for (const [file, text] of sources) {
  for (const pattern of [/\bdownload\b/i, /createObjectURL/, /text\/csv/, /exportCsv|buildCsv|csvCell|download-csv/, /Baixar|Exportar|Salvar datas/, /\.ics\b/]) {
   assert.ok(!pattern.test(text), `${file} still matches ${pattern}`);
  }
 }
});
test('save-as-PDF is available in the portal and the showcase', () => {
 const get = f => sources.find(([name]) => name === f)[1];
 assert.match(get('portal/app.js'), /id="printProject">Salvar ficha em PDF<\/button>/);
 assert.match(get('portal/app.js'), /\$\('#printProject'\)\.onclick=\(\)=>window\.print\(\)/);
 assert.match(get('portal/vitrine.html'), /id="print">Imprimir \/ Salvar ficha em PDF<\/button>/);
 assert.match(get('portal/vitrine.html'), /\$\('#print'\)\.onclick=\(\)=>window\.print\(\)/);
});
const context = vm.createContext({document:{addEventListener(){}},console});
vm.runInContext(fs.readFileSync('portal/app.js','utf8'),context);
test('ranking title comes from the project base by protocol, or a dash', () => {
 vm.runInContext(`projects=[{id:'319972',title:'GliomaChip'},{id:'319602',title:''}]`, context);
 assert.equal(vm.runInContext(`rxTitleFor('319972')`, context), 'GliomaChip');
 assert.equal(vm.runInContext(`rxTitleFor('319602')`, context), '—');
 assert.equal(vm.runInContext(`rxTitleFor('999999')`, context), '—');
});
test('every ranking protocol has a title in the public index', () => {
 const ex = JSON.parse(fs.readFileSync('portal/data/execucao.json','utf8'));
 const ids = new Set(JSON.parse(fs.readFileSync('portal/data/projects-index.json','utf8')).filter(p => p.title).map(p => p.id));
 const missing = ex.rankingPitch02.registros.filter(r => !ids.has(r[1])).map(r => r[1]);
 assert.deepEqual(missing, []);
});
