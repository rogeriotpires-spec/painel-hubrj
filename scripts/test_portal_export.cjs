const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({document:{addEventListener(){}},console});
vm.runInContext(fs.readFileSync('portal/app.js','utf8'),context);
const cell = value => vm.runInContext(`csvCell(${JSON.stringify(value)})`, context);
const csv = rows => vm.runInContext(`buildCsv(${JSON.stringify(rows)})`, context);
test('quotes, separators and newlines stay inside a CSV cell',()=>{
 assert.equal(cell('A; "B"\nC'),'"A; ""B""\nC"');
 assert.equal(cell(null),'""');
});
test('spreadsheet formulas from source records are treated as text',()=>{
 for(const value of ['=1+1','+SUM(A1)','@SUM(A1)','-1+2','\t=1','\r\n+1']) {
  assert.equal(cell(value).slice(0,2),'"\'');
 }
 assert.equal(cell('HUB RJ'),'"HUB RJ"');
});
test('export uses reviewed fields and dated official provenance',()=>{
 const result=csv([{id:'123',title:'Teste',city:'Rio',problem:'Problema revisado',solution:'Solução revisada',summary:'RESUMO ANTIGO',stage:null,officialResult:{status:'Selecionado',date:'2026-06-03',url:'https://www.faperj.br/?id=123'}}]);
 assert.ok(result.startsWith('\ufeff'));
 assert.ok(result.includes('Problema revisado'));
 assert.ok(result.includes('Solução revisada'));
 assert.ok(result.includes('2026-06-03'));
 assert.ok(!result.includes('RESUMO ANTIGO'));
 assert.equal(result.split('\r\n').length,2);
 assert.equal(result.split('\r\n')[0].split(';').length,14);
});
test('empty selection exports only the column headings',()=>{
 assert.equal(csv([]).split('\r\n').length,1);
});
