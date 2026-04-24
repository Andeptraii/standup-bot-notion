# Design: Standup Summary UI

## Overview

Thêm section "Standup Summary" vào Admin Dashboard hiện tại, cho phép Admin chọn ngày và xem bảng tổng hợp standup ngay trên UI. Backend thêm `GET /api/summary?date=YYYY-MM-DD` endpoint bằng cách tách logic đọc dữ liệu từ `aggregateStandups()` thành hàm riêng `fetchSummaryData(date)` (không append lên Notion). Frontend tái sử dụng toàn bộ `apiFetch()`, `showAlert()`, CSS classes sẵn có.

## Architecture / Data Flow

```mermaid
flowchart TD
  A[Admin chọn ngày + click Load] --> B[apiFetch GET /api/summary?date=...]
  B --> C{authMiddleware}
  C -- 401/403 --> D[showAlert error]
  C -- OK --> E[summaryRoute handler]
  E --> F[fetchSummaryData(date)]
  F --> G[notion.queryDatabase - lọc theo Date]
  G --> H{pages.length == 0?}
  H -- Yes --> I[return empty array]
  H -- No --> J[loop: notion.getPageBlocks per page]
  J --> K[extractTextFromBlocks]
  K --> L[return memberSummaries array]
  L --> M[res.json - success + data]
  M --> N[renderSummaryTable in UI]
  I --> M
```

## Components Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `src/services/summary.js` | modify | Tách `fetchSummaryData(date)` từ `aggregateStandups()` — chỉ đọc, không append |
| `src/routes/triggers.js` | modify | Thêm `GET /api/summary?date=` route gọi `fetchSummaryData` |
| `public/index.html` | modify | Thêm section card "Standup Summary" với date picker + table container |
| `public/app.js` | modify | Thêm `loadSummary()`, `renderSummaryTable()` functions |

## Interface Definitions

### Functions

```javascript
// src/services/summary.js — mới
// Đọc standup data từ Notion DB cho 1 ngày, KHÔNG append lên summary page
async function fetchSummaryData(date = new Date()) {
  // input: date (Date object)
  // output: { date: string, members: Array<{ name, sections }> }
  //   sections: { 'Hôm qua': string[], 'Hôm nay': string[], 'Blocker': string[] }
}

// public/app.js — mới
async function loadSummary() {
  // Lấy giá trị date input, gọi apiFetch GET /api/summary?date=..., render table
}

function renderSummaryTable(members) {
  // input: Array<{ name, sections }>
  // output: inject HTML table vào #summaryResult container
}
```

### Data Models

```javascript
// Response từ GET /api/summary
{
  success: true,
  result: {
    date: "2026-04-23",         // YYYY-MM-DD
    members: [
      {
        name: "An Nguyen",
        sections: {
          "Hôm qua": ["Làm task A", "Review PR"],
          "Hôm nay": ["Fix bug B"],
          "Blocker": []           // rỗng = không có blocker
        }
      }
    ]
  }
}

// Response khi không có data
{
  success: true,
  result: { date: "2026-04-23", members: [] }
}
```

## Integration Points

- **`fetchSummaryData`** tái sử dụng `extractTextFromBlocks()` và `getMemberName()` đã có trong `summary.js`
- **Route** được mount trong `src/app.js` qua `triggersRouter` đã có (không cần tạo router mới)
- **authMiddleware** đã apply trên toàn bộ `/api/trigger/*` — GET endpoint kế thừa tự động
- **Frontend** tái sử dụng `apiFetch()`, `showAlert()`, `escapeHtml()` từ `public/app.js` (không load thêm lib)
- **CSS**: tái sử dụng `.card`, `.card-title`, `.card-content`, `table`, `th`, `td`, `.btn`, `.form-control`, `.text-muted` từ `public/styles.css`

## Error Handling

- Notion rate limit → `_withRetry()` trong `NotionService` đã xử lý (retry 3 lần); nếu vẫn lỗi, route trả `500 { error: msg }`, UI hiển thị `showAlert(error, 'danger')`
- Ngày không hợp lệ (NaN) → validate ở frontend trước khi gọi API; nếu bypass, backend trả `400 { error: 'Ngày không hợp lệ' }`
- Token thiếu/sai → `authMiddleware` trả 401/403 → `apiFetch()` throw error → `showAlert`
- `getPageBlocks` lỗi cho 1 member → catch per-member trong `fetchSummaryData`, push member với sections rỗng (giữ hành vi hiện tại của `aggregateStandups`)

## Open Questions

- [ ] Default date khi mở UI: hôm nay (auto-fill `new Date()` vào date input)?
- [ ] Giới hạn số lượng member trong 1 query (Notion mặc định 100 results/page — đủ cho team nhỏ)?
