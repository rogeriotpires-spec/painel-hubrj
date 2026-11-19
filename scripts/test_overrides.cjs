// Área do proponente: as atualizações vindas do Supabase não podem alterar título, protocolo nem município,
// e só aceitam imagens do bucket do projeto e links http(s).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ctx = vm.createContext({ window: {}, console, setTimeout, clearTimeout });
vm.runInContext(fs.readFileSync('portal/overrides.js', 'utf8'), ctx);
const H = ctx.window.HubrjOverrides;
test('applyOne never touches title, protocol or city and ignores blank values', () => {
 const p = { id: '319712', title: 'Original', city: 'Itaperuna', mission: 'antes', problem: 'base' };
 H.applyOne(p, { protocolo: '319712', title: 'X', city: 'Y', id: '1', mission: 'depois', problem: '  ', full_summary: 'completo', edited_at: '2026-11-19' });
 assert.equal(p.title, 'Original'); assert.equal(p.city, 'Itaperuna'); assert.equal(p.id, '319712');
 assert.equal(p.mission, 'depois'); assert.equal(p.problem, 'base'); assert.equal(p.fullSummary, 'completo');
});
test('image and link sanitizers', () => {
 assert.equal(H.safeUrl('https://swznuvnqoylkekibrtij.supabase.co/storage/v1/object/public/hubrj-cards/abc/card-1.webp'), 'https://swznuvnqoylkekibrtij.supabase.co/storage/v1/object/public/hubrj-cards/abc/card-1.webp');
 assert.equal(H.safeUrl('https://evil.example/x.webp'), '');
 assert.equal(H.safeUrl('https://swznuvnqoylkekibrtij.supabase.co/storage/v1/object/public/hubrj-cards/a"onerror=x'), '');
 assert.equal(H.safeLink('javascript:alert(1)'), '');
 assert.equal(H.safeLink('https://exemplo.com.br'), 'https://exemplo.com.br');
});
test('front-end never ships a service_role key', () => {
 for (const f of ['portal/overrides.js', 'portal/proponente.js', 'portal/proponente.html', 'portal/app.js']) {
  const t = fs.readFileSync(f, 'utf8');
  assert.ok(!/service_role|sb_secret_/.test(t), f);
 }
});
