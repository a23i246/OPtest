-- ランキングにゲームの到達状況を保存する列を追加します。
-- Supabaseの「SQL Editor」に貼り付けて、1回だけ実行してください。

alter table public.shooting_scores
add column if not exists progress_stage text;

alter table public.shooting_scores
drop constraint if exists shooting_scores_progress_stage_check;

alter table public.shooting_scores
add constraint shooting_scores_progress_stage_check
check (
  progress_stage is null
  or progress_stage in ('boss1', 'boss2', 'clear')
);

comment on column public.shooting_scores.progress_stage is
'ゲーム到達状況: boss1=第1ボス挑戦, boss2=第2ボス挑戦, clear=完全クリア';
