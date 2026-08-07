# aboutus-drip-qc

ドリップ抽出の品質管理を記録する「抽出品質QCログ」アプリ。React + Vite + Supabase。
伏見・二条の両店舗共通で使用。

aboutus-food-qc / aboutus-staff-todo とは独立したアプリ。Supabaseプロジェクトのみ共有（テーブルは独立）。

## セットアップ（初回のみ・手動）

1. **Supabaseにテーブルを作成**
   Supabase SQL Editorで [`scripts/schema.sql`](scripts/schema.sql) の内容を実行する（テーブル`drip_qc_entries`の作成）。

2. **ローカル動作確認**
   ```bash
   npm install
   npm run dev
   ```
   `.env` はすでに用意済み（既存Supabaseプロジェクトの接続情報）。

3. **GitHubリポジトリ・Pages・Secrets**（既に設定済みならスキップ）
   - Secrets: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`

## 使い方

- **新規記録**：報告書ヘッダー（日付・Origin・焙煎日・確認者）と店舗・豆銘柄・プロセス・品種、ショット記録（Dose・Mesh・抽出時間・官能評価H/W）を入力して保存。ショットは2〜4件まで追加可能
- **履歴**：店舗で絞り込み、記録をタップして詳細を確認・削除

## データ構造

- `drip_qc_entries` — QCログ1件（店舗・日付・確認者・焙煎日・豆情報・ショット記録のJSON配列・総合メモ）
