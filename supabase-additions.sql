-- ============================================================
-- YU 追加SQL(2点セット)— Supabase SQL Editor に貼って Run
-- 注意: ビューが onsen_id を参照していると型変更がブロックされるため、
--       drop view → alter → create view の順で実行する。
-- ============================================================

drop view if exists public.yu_popular;

-- ① OSM解放の下準備: onsen_id を bigint に(OSMのIDが int に収まらないため)
alter table public.yu_logs alter column onsen_id type bigint;

-- ② みんなが灯した湯: チェックイン集計の公開ビュー
--    個人の記録(誰が・いつ・どこ)は一切見えず、湯ごとの合計だけを公開する。
create or replace view public.yu_popular as
  select onsen_id,
         count(*)::int              as checkins,  -- のべチェックイン数
         count(distinct user_id)::int as bathers  -- 灯した人数
  from public.yu_logs
  group by onsen_id;

grant select on public.yu_popular to anon, authenticated;
