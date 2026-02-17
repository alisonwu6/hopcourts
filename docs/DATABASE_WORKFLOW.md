# DATABASE_WORKFLOW.md

## 目標
- 本機先驗證 schema 與 API 契約，再推到 Supabase remote。
- `backend/supabase/migrations/` 是唯一 schema source of truth。

## 為什麼這樣做
- 快：日常用本機 Postgres 驗證，不必每次啟整套 Docker 服務。
- 穩：remote 只走 `supabase db push`，避免手動 SQL 漏步。
- 可檢驗：每次都跑 schema contract 檢查，防止 DB 與 OpenAPI 漂移。

## 環境變數
- `LOCAL_DATABASE_URL`：本機 Postgres 連線字串（預設 `postgresql://postgres:postgres@127.0.0.1:54322/postgres`）。
- `SUPABASE_DB_URL`：remote Supabase Postgres 連線字串（必填，給上版用）。

## 日常開發（本機）
1. 套 migration
```bash
cd backend
npm run db:local:migrate
```
2. 套 seed（如需要）
```bash
cd backend
npm run db:local:push-seed
```
3. 一次跑完整本機資料庫流程
```bash
cd backend
npm run db:local:rebuild
```
4. 驗證 schema 與 OpenAPI
```bash
cd backend
npm run db:verify
```

## 發版前（Remote）
1. 先確認本機已通過
```bash
cd backend
npm run db:verify
```
2. 推到 remote
```bash
cd backend
SUPABASE_DB_URL='postgresql://...'
npm run db:remote:push
```

## 現有 scripts 對照
- `npm run db:local:migrate`
  - 用 local DB 套用 `supabase/migrations`。
- `npm run db:local:push-seed`
  - 用 local DB 套 seed 檔（`supabase/seed/*.sql`）。
- `npm run db:local:rebuild`
  - 連跑 migration + seed。
- `npm run db:verify`
  - 先檢查 DB schema vs OpenAPI，再 lint OpenAPI。
- `npm run db:remote:push`
  - 用 `SUPABASE_DB_URL` 推 migration + seed 到 remote。

## 原則
- 不直接改 remote DB 結構。
- 結構變更一律改 migration 檔案，再跑流程驗證。
- `verify:schema` fail 時先修契約差異，再推 remote。
