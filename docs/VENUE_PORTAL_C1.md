# 🏟️ C1｜Venue Official Portal - 場館官方後台 v1.0 規格

## 一、定位宣告
Venue Official Portal 是「場館主經營地盤」，是產品功能的延伸。
**核心目的：** 賦權場館主管理官方形象、發布官方活動、查看營運數據。

---

## 二、功能範疇 (Scope)

### Phase 1: 基礎架構 & 儀表板 (Dashboard)
- **入口**: `/admin`
- **身份驗證**: 必須是已登入用戶且擁有 `status='approved'` 的有效 Claim。
- **儀表板**:
    - 我的場館列表 (支援多場館切換)。
    - 基本狀態 (名稱、地址、狀態)。
    - 快速連結 (編輯Profile、發布活動)。

### Phase 2: 場館資料管理 (Profile)
- **資料表**: `venue_profiles` (1:1 關聯 venues)
- **可編輯內容**:
    - Logo / Cover Image
    - Description (設施介紹)
    - Social Links
    - Operating Hours
- **同步機制**: 部分欄位更新後需自動同步回 `venues` 表的 display 欄位。

### Phase 3: 官方活動 (Official Activities)
- **資料表**: `sessions` (擴充)
- **新欄位**: `is_official` (Boolean), `published_by_venue_id` (UUID)
- **功能**:
    - 發布帶有「官方認證」標記的活動。
    - 管理官方活動名單。

---

## 三、技術架構 (Technical Architecture)

### 1. Database Schema Changes
- **New Table**: `venue_profiles`
    - `venue_id` (PK, FK), `logo_url`, `description`, `social_links` (JSON), `created_at`, `updated_at`.
- **Alter Table**: `sessions`
    - Add `is_official` (BOOLEAN, default false).
    - Add `published_by_venue_id` (UUID, FK to venues).

### 2. Backend API (`/api/v1/admin`)
- `GET /me/venues`: 取得我管理的場館列表。
- `GET /venues/:id/dashboard`: 取得特定場館的儀表板數據。
- `GET /venues/:id/profile`: 取得場館詳細 Profile。
- `PATCH /venues/:id/profile`: 更新 Profile。

### 3. Frontend (`features/venue-portal`)
- **Guard**: `VenuePortalGuard` (檢查是否有管理權限)。
- **Layout**: `VenuePortalLayout` (側邊欄導航)。
- **Pages**: `VenueDashboardPage`, `VenueProfilePage`.

---

## 四、安全紅線 (Security Red Lines)
1. **權限隔離**: 用戶只能存取自己 `approved` 的場館，嚴禁越權存取他人場館。
2. **座標鎖定**: 場館主**不可**修改 `lat` / `lng`，地點修正需走 C0 申訴。
3. **ID 不變**: 場館 ID 永遠不可變更。

---
**Status: Phase C1 STARTED.**
