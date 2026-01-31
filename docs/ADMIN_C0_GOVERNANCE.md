# 🛡️ C0｜Admin Venue 治理層 v1.0 實作規範 (As Implemented)

## 一、定位宣告
Admin Venue 管理頁是「城市資料治理工具」，不是產品功能。
**唯一目的：** 處理錯誤、仲裁爭議、保護資料結構。

---

## 二、已實作功能清單 (Implemented Features)

### 1. 行政入口與防禦 (Entry & Guard)
- **URL**: `/admin/login` (專屬登入頁)
- **視覺**: 白色底、專業、臨床風格，無一般產品導覽列。
- **Guard**: `AdminRouteGuard`
    - 未認證 -> 導向 `/admin/login`
    - 權限不足 -> 顯示冷色調 **403 Forbidden 硬阻斷** (防止產品資訊洩露)。

### 2. 治理控制台 (Governance Console)
- **URL**: `/admin/venues`
- **監視**: 全場館列表，包含 `venue_id`, `status`, `claim_status`, `contact_email`。
- **監控指標**: `last_activity_at` (由 SQL 聚合聚合場館最後活動時間)。
- **搜尋**: 支援 `name` 與 `ID` 直接搜尋。

### 3. 三大治理動作 (Governance Actions)
- **仲裁 (Revoke)**: `POST /admin/venue-claims/:id/revoke`
    - 強制將申請設定為 `revoked`。
    - **強制理由 (Mandatory Reason)**: 必須提供理由，並記錄於 Audit Log。
    - 場館狀態重置為 `unclaimed`。
- **糾錯 (Patch)**: `PATCH /admin/venues/:id`
    - 僅限 `name_display` 與 `address_display`。
    - **硬紅線**: 禁止編輯 `lat/lng` 與 `id`。
- **審計 (Audit)**: 所有上述寫入操作會自動記錄於 `admin_audit_logs`。

---

## 三、技術架構 (Technical Architecture)

### 1. Backend 治理層
- **Router**: `backend/src/routes/v1/admin.routes.js` (前綴 `/api/v1/admin`)
- **Model**: `venues.model.js` 擴充了 `getAdminVenues`, `revokeVenueClaim`, `patchVenueDisplay`, `writeAuditLog`。
- **Middleware**: 
    - `verifyToken`: 身份驗證。
    - `verifyAdmin`: **硬性角色檢查** (檢查 `admin` 角色或內部 email)。

### 2. Frontend 治理層
- **Feature**: `features/admin/` (獨立於 `features/venues/`，實現物理隔離)。
- **Service**: `adminVenuesService.ts` (專屬 API 封裝)。
- **Pages**: 
    - `AdminLoginPage.tsx`
    - `AdminVenueManagementPage.tsx`

---

## 四、資料庫 Schema
- **Table**: `public.admin_audit_logs`
    - `id`, `admin_id`, `action`, `target_id`, `target_type`, `note`, `created_at`

---

## 五、完成定義 (DoD)
- [x] 行政路徑與產品路徑完全切開。
- [x] 具備撤銷 (Revoke) 權與修正 (Patch) 權。
- [x] 具備寫入動作的自動審計機制。
- [x] 成功守住「不提供營運功能」的紅線。

---

## 六、定錨宣言 (Finality)
C0 是治理層，不會再增加功能。任何新需求都不應該進入 C0。C0 的完成是為了確保系統具備基本的糾錯與仲裁機制。

---
**Status: Phase C0 COMPLETED.**
**Next Step: Phase C1 (Venue Official Portal).**
