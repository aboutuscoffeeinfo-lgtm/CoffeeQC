-- aboutus-drip-qc: 下書き機能・リリース中フラグの追加（既存データは保持）
-- Supabase SQL Editor でこの内容を実行してください。

alter table qc_reports add column if not exists status text not null default 'saved';
alter table qc_reports add column if not exists is_released boolean not null default false;

-- 既存の全レコードは「保存済み・未リリース」として扱う（デフォルト値で自動的にそうなる）
