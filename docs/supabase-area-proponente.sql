-- HUB RJ · Área do proponente. Supabase, projeto timeline-eventos (swznuvnqoylkekibrtij). Objetos novos, prefixados hubrj_.
-- Referência do que foi aplicado em 19/11/2026. As contas (auth.users / auth.identities) foram criadas uma vez por protocolo com
-- e-mail técnico <protocolo>@proponente.hubrj.local, senha provisória (bcrypt) e uma linha em hubrj_cards + hubrj_private.initial_password.
-- Senhas e hashes NÃO ficam neste repositório.
--
-- Redefinir a senha de um protocolo para a provisória e voltar a exigir a troca (rodar como administrador):
--   update auth.users u set encrypted_password = i.hash, updated_at = now() from hubrj_private.initial_password i
--     join public.hubrj_cards c on c.protocolo = i.protocolo where c.protocolo = '<PROTOCOLO>' and u.id = c.user_id;
--   update public.hubrj_cards set must_change_password = true where protocolo = '<PROTOCOLO>';
create schema if not exists hubrj_private;
revoke all on schema hubrj_private from public, anon, authenticated;

create table if not exists public.hubrj_cards (
  protocolo text primary key check (protocolo ~ '^[0-9]{6}$'),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  applicant text check (char_length(applicant) <= 200),
  area text check (char_length(area) <= 200),
  sector text check (char_length(sector) <= 200),
  summary text check (char_length(summary) <= 1500),
  full_summary text check (char_length(full_summary) <= 20000),
  problem text check (char_length(problem) <= 1500),
  solution text check (char_length(solution) <= 1500),
  difference text check (char_length(difference) <= 1500),
  market text check (char_length(market) <= 1500),
  stage text check (char_length(stage) <= 1500),
  mission text check (char_length(mission) <= 1000),
  website text check (website is null or (char_length(website) <= 300 and website ~* '^https?://[^\s"<>]+$')),
  image_url text check (image_url is null or (char_length(image_url) <= 500 and image_url ~ '^https://swznuvnqoylkekibrtij\.supabase\.co/storage/v1/object/public/hubrj-cards/[A-Za-z0-9/_.-]+$')),
  edited_at timestamptz,
  updated_at timestamptz not null default now(),
  must_change_password boolean not null default true
);
comment on table public.hubrj_cards is 'HUB RJ: campos editáveis do card de cada proponente (título, protocolo e município ficam na base estática do portal e não são editáveis).';

-- hash da senha provisória (privado; só usado para exigir troca real de senha)
create table if not exists hubrj_private.initial_password (
  protocolo text primary key references public.hubrj_cards(protocolo) on delete cascade,
  hash text not null
);
alter table hubrj_private.initial_password enable row level security;
revoke all on hubrj_private.initial_password from public, anon, authenticated;

alter table public.hubrj_cards enable row level security;
revoke all on public.hubrj_cards from public, anon, authenticated;
grant select (protocolo, applicant, area, sector, summary, full_summary, problem, solution, difference, market, stage, mission, website, image_url, edited_at) on public.hubrj_cards to anon, authenticated;
grant select (must_change_password, user_id, updated_at) on public.hubrj_cards to authenticated;
grant update (applicant, area, sector, summary, full_summary, problem, solution, difference, market, stage, mission, website, image_url, must_change_password) on public.hubrj_cards to authenticated;

drop policy if exists hubrj_cards_public_read on public.hubrj_cards;
create policy hubrj_cards_public_read on public.hubrj_cards for select to anon, authenticated using (edited_at is not null);
drop policy if exists hubrj_cards_own_read on public.hubrj_cards;
create policy hubrj_cards_own_read on public.hubrj_cards for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists hubrj_cards_own_update on public.hubrj_cards;
create policy hubrj_cards_own_update on public.hubrj_cards for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Trigger: carimba datas, impede troca de vínculo, exige troca real de senha antes de editar/limpar a flag
create or replace function hubrj_private.cards_before_update() returns trigger
language plpgsql security definer set search_path = '' as $$
declare cur_hash text; ini_hash text;
begin
  if new.protocolo is distinct from old.protocolo or new.user_id is distinct from old.user_id then
    raise exception 'Protocolo e vínculo não podem ser alterados';
  end if;
  if auth.uid() is not null then
    if old.must_change_password and not new.must_change_password then
      select u.encrypted_password into cur_hash from auth.users u where u.id = old.user_id;
      select i.hash into ini_hash from hubrj_private.initial_password i where i.protocolo = old.protocolo;
      if cur_hash is null or cur_hash = ini_hash then
        raise exception 'Troque a senha provisória antes de continuar' using errcode = 'P0001';
      end if;
    elsif new.must_change_password and not old.must_change_password then
      raise exception 'Operação não permitida';
    end if;
    if new.must_change_password and (
       new.applicant, new.area, new.sector, new.summary, new.full_summary, new.problem, new.solution, new.difference,
       new.market, new.stage, new.mission, new.website, new.image_url)
       is distinct from (old.applicant, old.area, old.sector, old.summary, old.full_summary, old.problem, old.solution, old.difference,
       old.market, old.stage, old.mission, old.website, old.image_url) then
      raise exception 'Troque a senha provisória antes de editar o card' using errcode = 'P0001';
    end if;
  end if;
  if (new.applicant, new.area, new.sector, new.summary, new.full_summary, new.problem, new.solution, new.difference,
      new.market, new.stage, new.mission, new.website, new.image_url)
     is distinct from (old.applicant, old.area, old.sector, old.summary, old.full_summary, old.problem, old.solution, old.difference,
      old.market, old.stage, old.mission, old.website, old.image_url) then
    new.edited_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;
revoke all on function hubrj_private.cards_before_update() from public, anon, authenticated;
drop trigger if exists hubrj_cards_before_update on public.hubrj_cards;
create trigger hubrj_cards_before_update before update on public.hubrj_cards for each row execute function hubrj_private.cards_before_update();

-- Storage: imagens dos cards (pasta = auth.uid())
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hubrj-cards','hubrj-cards', true, 2097152, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists hubrj_cards_img_insert on storage.objects;
create policy hubrj_cards_img_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'hubrj-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists hubrj_cards_img_select on storage.objects;
create policy hubrj_cards_img_select on storage.objects for select to authenticated
  using (bucket_id = 'hubrj-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists hubrj_cards_img_update on storage.objects;
create policy hubrj_cards_img_update on storage.objects for update to authenticated
  using (bucket_id = 'hubrj-cards' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'hubrj-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists hubrj_cards_img_delete on storage.objects;
create policy hubrj_cards_img_delete on storage.objects for delete to authenticated
  using (bucket_id = 'hubrj-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);
