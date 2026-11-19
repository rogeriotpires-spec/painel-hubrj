// HUB RJ · Área do proponente. Login = protocolo (mapeado para um e-mail técnico), senha provisória com troca obrigatória
// no primeiro acesso e edição do próprio card. Usa somente a chave publicável; as regras de acesso (RLS) ficam no Supabase.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2/+esm';

const SUPABASE_URL = 'https://swznuvnqoylkekibrtij.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HRl6D718LUBZKiLN-8Kw4Q_WxKaEPuc';
const EMAIL_DOMAIN = 'proponente.hubrj.local';
const BUCKET = 'hubrj-cards';
// campo do formulário -> [coluna no Supabase, campo na base estática]
const FIELDS = { applicant:['applicant','applicant'], area:['area','area'], sector:['sector','sector'], problem:['problem','problem'], solution:['solution','solution'], difference:['difference','difference'], market:['market','market'], stage:['stage','stage'], mission:['mission','mission'], summary:['summary','summary'], fullSummary:['full_summary','fullSummary'], website:['website',null] };
const SELECT_COLS = ['protocolo','must_change_password', ...Object.values(FIELDS).map(f => f[0]), 'image_url'].join(',');

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { storageKey: 'hubrj-proponente-auth', persistSession: true, autoRefreshToken: true } });
const $ = s => document.querySelector(s);
let base = null, baseList = null, row = null, user = null, imageUrl = null, pendingFile = null;

const show = id => ['#loginBox', '#pwBox', '#editBox'].forEach(x => $(x).hidden = x !== id);
function msg(el, text, ok = false) { const m = $(el); m.textContent = text; m.className = 'msg ' + (text ? (ok ? 'ok' : 'err') : ''); }
const protocolFromEmail = e => String(e || '').split('@')[0];
const friendly = e => {
  const t = String(e?.message || e || '');
  if (/invalid login credentials/i.test(t)) return 'Protocolo ou senha incorretos.';
  if (/same.*password|different from the old/i.test(t)) return 'A nova senha precisa ser diferente da atual.';
  if (/weak|password should/i.test(t)) return 'Senha fraca: use pelo menos 10 caracteres, com letras e números.';
  if (/troque a senha/i.test(t)) return t;
  if (/rate limit|too many/i.test(t)) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
  if (/failed to fetch|network/i.test(t)) return 'Sem conexão com o servidor. Tente novamente.';
  return 'Não foi possível concluir: ' + t;
};

async function loadBase() {
  if (baseList) return baseList;
  const r = await fetch('data/projects.json', { cache: 'no-cache' });
  if (!r.ok) throw Error('Base de projetos indisponível');
  baseList = await r.json();
  return baseList;
}

async function afterLogin() {
  const { data: { user: u } } = await sb.auth.getUser();
  if (!u) { show('#loginBox'); return; }
  user = u; $('#logout').hidden = false;
  const pid = protocolFromEmail(u.email);
  const [{ data, error }, list] = await Promise.all([
    sb.from('hubrj_cards').select(SELECT_COLS).eq('protocolo', pid).maybeSingle(),
    loadBase()
  ]);
  if (error || !data) { await sb.auth.signOut(); show('#loginBox'); msg('#loginMsg', 'Cadastro do proponente não encontrado. Fale com a equipe do HUB RJ.'); return; }
  row = data; base = list.find(p => String(p.id) === pid) || { id: pid, title: '', city: '' };
  if (row.must_change_password) return openPw(true);
  openEditor();
}

function openPw(required) {
  $('#pwTitle').textContent = required ? 'Defina sua nova senha' : 'Alterar senha';
  $('#pwIntro').textContent = required ? 'Por segurança, troque a senha provisória antes de editar o card.' : 'Escolha uma nova senha para a sua conta.';
  $('#pwCancel').hidden = required; $('#pwUser').value = row?.protocolo || '';
  $('#pwForm').reset(); msg('#pwMsg', ''); show('#pwBox'); $('#pw1').focus();
}

function originalImage() { return `assets/ai/960/${encodeURIComponent(base.id)}.webp`; }
function setPreview() {
  const img = $('#imgPreview');
  img.onerror = () => { img.onerror = null; img.src = `assets/startups/${encodeURIComponent(base.id)}.svg`; };
  img.src = pendingFile ? URL.createObjectURL(pendingFile) : (imageUrl || originalImage());
}

function openEditor() {
  $('#fTitle').value = base.title || ''; $('#fId').value = base.id; $('#fCity').value = base.city || '';
  const sectors = [...new Set(baseList.map(p => p.sector).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  $('#sector').innerHTML = sectors.map(s => `<option></option>`).join('');
  [...$('#sector').options].forEach((o, i) => { o.value = o.textContent = sectors[i]; });
  const areas = [...new Set(baseList.map(p => p.area).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  $('#areas').innerHTML = ''; areas.forEach(a => { const o = document.createElement('option'); o.value = a; $('#areas').appendChild(o); });
  for (const [id, [col, baseKey]] of Object.entries(FIELDS)) {
    const v = row[col] ?? (baseKey ? base[baseKey] : '') ?? '';
    if (id === 'sector' && v && !sectors.includes(v)) { const o = document.createElement('option'); o.value = o.textContent = v; $('#sector').appendChild(o); }
    $('#' + id).value = v || '';
  }
  imageUrl = row.image_url || null; pendingFile = null; $('#image').value = ''; setPreview();
  document.querySelectorAll('.count').forEach(updateCount);
  msg('#cardMsg', ''); show('#editBox');
}
function updateCount(c) { const el = $('#' + c.dataset.for); c.textContent = `${el.value.length}/${el.maxLength}`; }

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); msg('#loginMsg', '');
  const pid = $('#protocolo').value.trim();
  if (!/^\d{6}$/.test(pid)) return msg('#loginMsg', 'Informe o protocolo com 6 dígitos.');
  const btn = e.submitter; if (btn) btn.disabled = true;
  try {
    const { error } = await sb.auth.signInWithPassword({ email: `${pid}@${EMAIL_DOMAIN}`, password: $('#senha').value });
    if (error) throw error;
    $('#senha').value = ''; await afterLogin();
  } catch (err) { msg('#loginMsg', friendly(err)); }
  finally { if (btn) btn.disabled = false; }
});

$('#pwForm').addEventListener('submit', async e => {
  e.preventDefault(); msg('#pwMsg', '');
  const a = $('#pw1').value, b = $('#pw2').value;
  if (a !== b) return msg('#pwMsg', 'As senhas não conferem.');
  if (a.length < 10 || !/[A-Za-z]/.test(a) || !/\d/.test(a)) return msg('#pwMsg', 'Use pelo menos 10 caracteres, com letras e números.');
  const btn = e.submitter; if (btn) btn.disabled = true;
  try {
    const { error } = await sb.auth.updateUser({ password: a });
    if (error) throw error;
    if (row.must_change_password) {
      const { error: e2 } = await sb.from('hubrj_cards').update({ must_change_password: false }).eq('protocolo', row.protocolo);
      if (e2) throw e2;
      row.must_change_password = false;
    }
    openEditor(); msg('#cardMsg', 'Senha alterada. Agora você já pode atualizar o card.', true);
  } catch (err) { msg('#pwMsg', friendly(err)); }
  finally { if (btn) btn.disabled = false; }
});
$('#pwCancel').onclick = () => openEditor();
$('#changePw').onclick = () => openPw(false);

$('#image').addEventListener('change', e => {
  const f = e.target.files[0]; msg('#cardMsg', '');
  if (!f) { pendingFile = null; return setPreview(); }
  if (!['image/webp', 'image/jpeg', 'image/png'].includes(f.type)) { e.target.value = ''; return msg('#cardMsg', 'Formato não aceito. Use WebP, JPG ou PNG.'); }
  if (f.size > 2 * 1024 * 1024) { e.target.value = ''; return msg('#cardMsg', 'A imagem passa de 2 MB. Reduza o arquivo e tente de novo.'); }
  pendingFile = f; setPreview();
});
$('#imgReset').onclick = () => { pendingFile = null; imageUrl = null; $('#image').value = ''; setPreview(); };
document.querySelectorAll('.count').forEach(c => $('#' + c.dataset.for).addEventListener('input', () => updateCount(c)));

$('#cardForm').addEventListener('submit', async e => {
  e.preventDefault(); msg('#cardMsg', '');
  const btn = $('#saveBtn'); btn.disabled = true;
  try {
    const payload = {};
    for (const [id, [col, baseKey]] of Object.entries(FIELDS)) {
      let v = $('#' + id).value.trim();
      if (id === 'website' && v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
      const original = baseKey ? String(base[baseKey] ?? '').trim() : '';
      payload[col] = v && v !== original ? v : null;
    }
    const previous = row.image_url;
    if (pendingFile) {
      const ext = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }[pendingFile.type];
      const path = `${user.id}/card-${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage.from(BUCKET).upload(path, pendingFile, { contentType: pendingFile.type, cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      imageUrl = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
    payload.image_url = imageUrl || null;
    const { data, error } = await sb.from('hubrj_cards').update(payload).eq('protocolo', row.protocolo).select(SELECT_COLS).single();
    if (error) throw error;
    row = data; pendingFile = null; $('#image').value = '';
    const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
    if (previous && previous !== row.image_url && previous.startsWith(prefix)) await sb.storage.from(BUCKET).remove([previous.slice(prefix.length)]).catch(() => {});
    msg('#cardMsg', 'Card salvo e publicado. A vitrine já mostra a nova versão (recarregue a página da vitrine).', true);
  } catch (err) { msg('#cardMsg', friendly(err)); }
  finally { btn.disabled = false; }
});

$('#logout').onclick = async () => { await sb.auth.signOut(); location.reload(); };

(async () => {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session) await afterLogin(); else show('#loginBox');
  } catch (err) { show('#loginBox'); msg('#loginMsg', friendly(err)); }
  finally { $('#loading').hidden = true; }
})();
