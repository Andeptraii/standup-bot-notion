# Tasks: Standup Summary UI

## Estimated Total Time: 75–105 minutes

## Task Overview

Tách `fetchSummaryData()` từ service hiện tại, thêm GET API endpoint, sau đó thêm UI section với date picker và bảng kết quả vào Admin Dashboard.

## Tasks

- [x] **TASK-001**: Tách `fetchSummaryData(date)` từ `aggregateStandups()` trong summary service `src/services/summary.js`
  - Requirement: US-4 (read-only, không append Notion)
  - Files: `src/services/summary.js`
  - Outcome: Hàm `fetchSummaryData(date)` export được, trả `{ date, members }`, `aggregateStandups()` gọi lại `fetchSummaryData` nội bộ — test hiện tại vẫn pass ✅
  - Est. time: 20 min

- [x] **TASK-002**: Thêm `GET /api/summary?date=` route vào triggers router `src/routes/triggers.js`
  - Requirement: US-1, US-4
  - Files: `src/routes/triggers.js`
  - Outcome: `GET /api/summary?date=2026-04-23` trả `{ success: true, result: { date, members } }`; date thiếu/invalid trả `400` ✅
  - Est. time: 15 min

- [x] **TASK-003**: Thêm section "Standup Summary" vào Admin Dashboard HTML `public/index.html`
  - Requirement: US-1, US-5
  - Files: `public/index.html`
  - Outcome: Card mới gồm date input (default = hôm nay), button "Load Summary", div `#summaryResult` — layout dùng CSS class sẵn có ✅
  - Est. time: 15 min

- [x] **TASK-004**: Thêm `loadSummary()` và `renderSummaryTable()` vào frontend JS `public/app.js`
  - Requirement: US-1, US-2, US-3, US-5
  - Files: `public/app.js`
  - Outcome: `loadSummary()` gọi API + disable button khi loading; `renderSummaryTable()` render table với blocker màu đỏ, "(chưa điền)" cho member thiếu data, "(chưa có)" cho blocker rỗng, hiển thị member count ✅
  - Est. time: 25 min

- [x] **TASK-005**: Cập nhật unit test cho `fetchSummaryData` `src/__tests__/summary.service.test.js`
  - Requirement: US-1, US-4
  - Files: `src/__tests__/summary.service.test.js`
  - Outcome: Test cover: ngày có data, ngày không có data, member có blocker, member chưa điền — `aggregateStandups()` test vẫn pass ✅
  - Est. time: 20 min

## Dependency Map

```
TASK-001 ──→ TASK-002 ──→ TASK-005
TASK-003 ──→ TASK-004
```

- TASK-002 phụ thuộc TASK-001 (cần hàm `fetchSummaryData` trước)
- TASK-003 và TASK-004 có thể làm song song với TASK-001/002
- TASK-005 cần TASK-001 hoàn thành
- TASK-003 phải xong trước TASK-004 (cần DOM element `#summaryResult`)

## Testing Strategy

- **Unit**: `src/__tests__/summary.service.test.js` — mock `NotionService`, test `fetchSummaryData()` với các case: empty results, 1 member đầy đủ, 1 member có blocker, 1 member chưa điền
- **Integration**: Gọi `GET /api/summary?date=<today>` với `curl` hoặc từ UI với token hợp lệ — xác nhận response JSON đúng shape
- **Manual UI**: Mở Admin Dashboard, nhập token, chọn ngày có standup data, nhấn "Load Summary" — kiểm tra bảng hiển thị, blocker đỏ, member count đúng; thử ngày không có data — kiểm tra thông báo "Không có dữ liệu"
