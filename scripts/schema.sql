-- aboutus-drip-qc: ドリップ抽出QC報告書 用テーブル（v2: qc_reports/qc_slots/qc_commentsの3テーブル構成）
-- Supabase SQL Editor でこの内容を実行してください。
-- Supabaseプロジェクトは aboutus-food-qc と共有（テーブルのみ独立）。

-- 旧テーブル（v1の drip_qc_entries、または別スキーマで作成済みの場合）を先に削除
drop table if exists drip_qc_entries;
drop table if exists qc_comments;
drop table if exists qc_slots;
drop table if exists qc_reports;

create table qc_reports (
  id bigint generated always as identity primary key,
  store text not null,
  date date not null,
  country text not null default '',
  lot_name text not null default '',
  variety text not null default '',
  process text not null default '',
  roast_date date,
  checker text not null default '',
  tendency text not null default '',
  created_at timestamptz not null default now()
);

create table qc_slots (
  id bigint generated always as identity primary key,
  report_id bigint not null references qc_reports(id) on delete cascade,
  slot_index int not null,
  dose_g text not null default '',
  mesh text not null default '',
  pours jsonb not null default '[]',
  sensory jsonb not null default '{}',
  intensity text not null default '',
  remarks text not null default ''
);

create table qc_comments (
  id bigint generated always as identity primary key,
  report_id bigint not null references qc_reports(id) on delete cascade,
  date date,
  roast_date date,
  comment text not null default '',
  created_at timestamptz not null default now()
);

create index qc_reports_country_idx on qc_reports (country);
create index qc_reports_variety_idx on qc_reports (variety);
create index qc_reports_process_idx on qc_reports (process);
create index qc_slots_report_id_idx on qc_slots (report_id);
create index qc_comments_report_id_idx on qc_comments (report_id);

alter table qc_reports enable row level security;
alter table qc_slots enable row level security;
alter table qc_comments enable row level security;

drop policy if exists "qc_reports open" on qc_reports;
create policy "qc_reports open" on qc_reports for all using (true) with check (true);

drop policy if exists "qc_slots open" on qc_slots;
create policy "qc_slots open" on qc_slots for all using (true) with check (true);

drop policy if exists "qc_comments open" on qc_comments;
create policy "qc_comments open" on qc_comments for all using (true) with check (true);
