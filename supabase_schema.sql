-- ============================================================
-- DIARIO — Schema Supabase
-- Esegui questo file nell'SQL Editor del tuo progetto Supabase
-- ============================================================

-- Tabella entries: un record per utente per giorno
create table if not exists entries (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  date        date        not null,
  diary       text        default '',
  questions   jsonb       default '{}'::jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, date)
);

-- Tabella events: eventi speciali per utente per giorno
create table if not exists events (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  date        date        not null,
  title       text        not null,
  created_at  timestamptz default now()
);

-- Tabella profiles: dati extra utente (nome visualizzato)
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz default now()
);

-- ============================================================
-- Row Level Security: ogni utente vede SOLO i propri dati
-- ============================================================

alter table entries  enable row level security;
alter table events   enable row level security;
alter table profiles enable row level security;

-- entries
create policy "entries: accesso solo al proprietario"
  on entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- events
create policy "events: accesso solo al proprietario"
  on events for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- profiles
create policy "profiles: accesso solo al proprietario"
  on profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- Trigger: aggiorna updated_at su entries
-- ============================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists entries_updated_at on entries;
create trigger entries_updated_at
  before update on entries
  for each row execute function update_updated_at();

-- ============================================================
-- Trigger: crea profile automaticamente alla registrazione
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
