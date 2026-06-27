-- ============================================================
-- お湯から、探す。— Supabase スキーマ(湯録 / チェックイン同期)
-- Supabase ダッシュボード → SQL Editor に貼り付けて Run。
-- ============================================================

-- 湯録(各ユーザーのチェックイン・記録)
create table if not exists public.yu_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  onsen_id   int  not null,                 -- 1..96
  date       date not null,
  color      text,
  smell      text[] default '{}',
  feel       text[] default '{}',
  word       text   default '',
  contrib    boolean default false,
  verified   boolean default false,         -- GPS現地チェックインなら true
  dist       int,                           -- チェックイン時の温泉までの距離(m)
  created_at timestamptz default now()
);

create index if not exists yu_logs_user_idx on public.yu_logs(user_id);

-- 行レベルセキュリティ:自分の記録だけ読み書きできる
alter table public.yu_logs enable row level security;

create policy "yu_logs_select_own" on public.yu_logs
  for select using (auth.uid() = user_id);
create policy "yu_logs_insert_own" on public.yu_logs
  for insert with check (auth.uid() = user_id);
create policy "yu_logs_update_own" on public.yu_logs
  for update using (auth.uid() = user_id);
create policy "yu_logs_delete_own" on public.yu_logs
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 補足:
--  ・anon public key はフロントに埋めてOK(RLSが守るので公開して安全)。
--  ・service_role key は絶対にフロントに置かない。
--  ・将来「初記録者クレジット」等で共有テーブルが要る場合は別途追加。
-- ============================================================
