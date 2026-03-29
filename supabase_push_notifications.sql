-- ============================================================
-- PUSH NOTIFICATIONS — Schema Supabase
-- Esegui nell'SQL Editor del progetto Supabase
-- ============================================================

-- Tabella subscriptions: una per utente/dispositivo
create table if not exists push_subscriptions (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  endpoint   text        not null,
  subscription jsonb     not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table push_subscriptions enable row level security;

drop policy if exists "push: accesso solo al proprietario" on push_subscriptions;
create policy "push: accesso solo al proprietario"
  on push_subscriptions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- pg_cron: invio notifica ogni giorno alle 21:30 ora italiana
-- (UTC+1 inverno = 20:30 UTC, UTC+2 estate = 19:30 UTC)
-- Usiamo 20:30 UTC che corrisponde alle 21:30 CET (inverno)
-- ============================================================

-- Abilita le estensioni necessarie (se non già attive)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Rimuovi job precedente se esiste
select cron.unschedule('diario-daily-notification') where exists (
  select 1 from cron.job where jobname = 'diario-daily-notification'
);

-- Schedula la chiamata all'Edge Function ogni giorno alle 20:30 UTC
select cron.schedule(
  'diario-daily-notification',
  '30 20 * * *',
  $$
  select net.http_post(
    url     := 'https://qxigdkunffvdbrsyyzej.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aWdka3VuZmZ2ZGJyc3l5emVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDcxMzUsImV4cCI6MjA5MDM4MzEzNX0.yYaKCxskZU8aP1t2y0NlgtymSLQI9IILsUWaK-ZFdcU'
    ),
    body    := '{}'::jsonb
  )
  $$
);
