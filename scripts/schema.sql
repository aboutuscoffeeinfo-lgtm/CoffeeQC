-- aboutus-drip-qc: ドリップ抽出QCログ用テーブル
-- Supabase SQL Editor でこの内容を実行してください。
-- Supabaseプロジェクトは aboutus-food-qc と共有（テーブルのみ独立）。

create table drip_qc_entries (
  id bigint generated always as identity primary key,
  store text not null,
  date date not null,
  checker text not null default '',
  roast_date date,
  bean_name text not null default '',
  bean_origin text not null default '',
  bean_process text not null default '',
  bean_variety text not null default '',
  shots jsonb not null default '[]',
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table drip_qc_entries enable row level security;

drop policy if exists "drip_qc_entries open" on drip_qc_entries;
create policy "drip_qc_entries open" on drip_qc_entries for all using (true) with check (true);
