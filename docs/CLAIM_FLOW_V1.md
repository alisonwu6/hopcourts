# Claim Flow v1.0 實作完成

## 概述
Claim Flow 是場館官方認領流程，讓場館管理者可以申請成為官方管理者，解鎖官方權限。

## 核心原則
- **申請免身份 (Identity-Free)**：認領申請不需要使用者登入，降低門檻以極大化意向收集。
- **身分區隔**：場館管理者與一般使用者（Player）是不同的實體。申請過程僅收集聯絡資訊，後續由 Admin 進行人工會議核實。
- **Claim ≠ 建立 Venue**：場館早已存在，Claim 只是建立「官方關係」
- **唯一入口**：在 Venue Page 顯示（`venue.status = 'unclaimed'`）
- **核實流程**：申請後由 Admin 聯絡並安排會議，核實身分後再於系統中賦予權限。

---

## 後端實作

### 1. 資料庫 Schema

#### venue_claims 表（已擴充）
```sql
CREATE TABLE public.venue_claims (
  id uuid PRIMARY KEY,
  venue_id uuid REFERENCES venues(id),
  owner_id uuid REFERENCES users(id),
  contact_name varchar(255),      -- 管理者名稱或公司名
  contact_person varchar(255),    -- 聯絡人姓名
  contact_title varchar(255),     -- 職務稱呼
  contact_phone varchar(50),      -- 聯絡電話
  contact_email varchar(255),     -- 聯絡 Email
  note text,                      -- 補充說明
  status text DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  claimed_at timestamptz,
  created_at timestamptz
);
```

### 2. API Endpoints

#### POST /api/v1/venues/:id/claim
申請認領場館

**Request Body:**
```json
{
  "contact_name": "ABC Sports Center",
  "contact_person": "王小明",
  "contact_title": "場館經理",
  "contact_phone": "0912-345-678",
  "contact_email": "contact@abc.com",
  "note": "我們是場館經營者"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "claim-uuid",
    "venue_id": "venue-uuid",
    "status": "pending",
    ...
  }
}
```

#### POST /api/v1/venue-claims/:id/approve (Admin)
核准認領申請

**效果:**
- `venue_claims.status` → `'approved'`
- `venue_claims.claimed_at` → `NOW()`
- `venues.status` → `'claimed'`

#### POST /api/v1/venue-claims/:id/reject (Admin)
拒絕認領申請

**效果:**
- `venue_claims.status` → `'rejected'`
- `venues.status` 不變

### 3. 權限檢查函數

```javascript
// 檢查使用者是否為場館官方管理者
async function isVenueOwner(userId, venueId) {
  const claim = await getApprovedClaimByUser(venueId, userId)
  return !!claim
}
```

**使用範例:**
```javascript
// 在發布官方活動前檢查
if (!await isVenueOwner(userId, venueId)) {
  throw new Error('Only venue owner can create official events')
}
```

---

## 前端實作

### 1. Claim Flow UI 流程

#### Step 1: 顯示 CTA（僅 unclaimed 場館）
```tsx
{venue.status !== 'claimed' && (
  <button onClick={handleStartClaim}>
    我是這個場館的管理者
  </button>
)}
```

#### Step 2: 說明彈窗
- 你將申請成為此場館的官方管理者
- 通過後可發布官方活動、查看成效
- 每個場館僅能有一位官方管理者

#### Step 2️⃣ 填寫完整 Claim 表單

必要欄位（完整聯絡資訊）
- **管理者名稱（或公司名）*** - 場館或公司的正式名稱
- **聯絡人姓名*** - 實際負責人的姓名
- **職務稱呼*** - 例如：場館經理、負責人、總監
- **聯絡電話*** - 方便聯繫的電話號碼
- **聯絡 Email*** - 官方聯絡信箱
- **補充說明**（選填）- 任何額外資訊

👉 提供完整資訊有助於加速審核流程
#### Step 4: 送出後顯示
✅ 申請已送出
我們將在 1-3 個工作天內完成審核。

### 2. 前端服務

```typescript
// venuesService.ts
async requestVenueClaim(id: string, claimData: {
  contact_name: string
  contact_email: string
  note?: string
}): Promise<ApiResponse<any>>
```

---

## 狀態流轉

```
unclaimed venue
    ↓
[使用者點擊「我是場館管理者」]
    ↓
[填寫表單] → POST /venues/:id/claim
    ↓
venue_claims (status: pending)
    ↓
[Admin 審核]
    ↓
┌─────────────┬─────────────┐
│   Approve   │   Reject    │
└─────────────┴─────────────┘
      ↓              ↓
  approved       rejected
      ↓              ↓
venues.status   venues.status
  = claimed      不變
```

---

## 完成檢查清單

### Backend ✅
- [x] 新增 `contact_name`, `contact_email`, `note` 欄位到 `venue_claims`
- [x] POST `/venues/:id/claim` 接收完整表單資料
- [x] POST `/venue-claims/:id/approve` (Admin)
- [x] POST `/venue-claims/:id/reject` (Admin)
- [x] `isVenueOwner(userId, venueId)` 權限檢查函數
- [x] 只有 `approved` 會改變 `venues.status`

### Frontend ✅
- [x] Venue Page 顯示 Claim CTA（僅 unclaimed）
- [x] Claim 說明彈窗
- [x] Claim 表單（contact_name, contact_email, note）
- [x] 送出後顯示「申請已送出」狀態
- [x] `venuesService.requestVenueClaim()` 支援完整表單

### Database ✅
- [x] Migration 已執行（`131_add_venue_claim_contact_fields.sql`）
- [x] `venue_claims` 表包含所有必要欄位

---

## 下一步建議

你提到的三個選項：

### 1️⃣ Claim 後的場館後台頁（功能清單）
**建議優先級：高**
- 官方管理者登入後看到什麼？
- 可以編輯哪些資訊？
- 如何發布官方活動？
- 如何查看數據？

### 2️⃣ 官方活動 vs 使用者活動的顯示與權限差異
**建議優先級：中**
- UI 上如何區分官方/使用者活動？
- 官方活動有哪些特殊權限？
- 資料結構如何支援？

### 3️⃣ Claim → 收費的自然轉換點設計
**建議優先級：低（但很重要）**
- 什麼時候開始談錢？
- 如何讓場館主動想付費？
- 定價策略與價值主張

---

## 技術債務 & TODO

- [ ] Admin 角色檢查（目前 approve/reject 只有 `verifyToken`）
- [ ] Email 通知（申請送出、審核結果）
- [ ] Claim 歷史記錄查詢
- [ ] 防止重複申請的前端提示
- [ ] 審核後台 UI（列出所有 pending claims）

---

## 測試建議

### 手動測試流程
1. 訪問任一 `unclaimed` 場館頁面
2. 點擊「我是這個場館的管理者」
3. 閱讀說明，點擊「繼續申請」
4. 填寫表單並送出
5. 確認顯示「申請已送出」
6. (Admin) 使用 Postman 測試 approve/reject API
7. 確認 `venues.status` 正確更新

### API 測試
```bash
# 1. 申請認領
curl -X POST http://localhost:3001/api/v1/venues/{venue_id}/claim \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_name": "ABC 運動中心",
    "contact_person": "王小明",
    "contact_title": "場館經理",
    "contact_phone": "0912-345-678",
    "contact_email": "contact@abc.com",
    "note": "我們是場館經營者"
  }'

# 2. 核准申請 (Admin)
curl -X POST http://localhost:3001/api/v1/venue-claims/{claim_id}/approve \
  -H "Authorization: Bearer {admin_token}"

# 3. 拒絕申請 (Admin)
curl -X POST http://localhost:3001/api/v1/venue-claims/{claim_id}/reject \
  -H "Authorization: Bearer {admin_token}"
```

---

**實作完成時間:** 2026-01-31
**版本:** v1.0
**狀態:** ✅ Ready for Testing
