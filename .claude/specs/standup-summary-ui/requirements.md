# Requirements: Standup Summary UI

## Overview

Tính năng này cho phép Admin xem nội dung Standup Summary của team trực tiếp trên Admin Dashboard (UI), thay vì phải mở Notion thủ công. Admin chọn ngày, nhấn "Load", và thấy bảng tổng hợp gồm tên thành viên, công việc hôm qua, hôm nay, và blocker — với blocker được tô màu đỏ nếu có. Tính năng không tạo thêm page Notion mà chỉ đọc dữ liệu standup đã có trong DB.

## User Stories

- As an **Admin**, I want to select a date and view the standup summary table in the dashboard, so that I can review team progress without opening Notion manually.
- As an **Admin**, I want blockers to be visually highlighted in the summary table, so that I can quickly identify members with issues.
- As an **Admin**, I want to see which members have not filled in their standup for the selected date, so that I know who still needs to submit.
- As an **Admin**, I want the summary to load without re-triggering the Notion summary append, so that I don't accidentally create duplicate pages.
- As an **Admin**, I want to see a loading indicator while data is being fetched, so that I know the request is in progress.

## Acceptance Criteria

### US-1: View standup summary by date
- WHEN Admin enters a valid date and clicks "Load Summary", THEN the dashboard SHALL display a table with columns: Thành viên, Hôm qua, Hôm nay, Blocker.
- WHEN no standup records exist for the selected date, THEN the dashboard SHALL display a "Không có dữ liệu" message.
- WHEN the date input is empty and Admin clicks "Load Summary", THEN the system SHALL show a warning alert "Vui lòng chọn ngày".

### US-2: Highlight blockers
- WHEN a member has at least one Blocker entry, THEN the Blocker cell SHALL be displayed with red text color.
- IF a member's Blocker section is empty, THEN the cell SHALL display "(chưa có)" with default text color.

### US-3: Show unfilled members
- WHEN a member's standup page exists but all sections are empty, THEN their row SHALL display "(chưa điền)" in each content cell.
- WHEN the summary table renders, THEN the member count SHALL be displayed (e.g., "3 thành viên").

### US-4: Read-only fetch (no Notion append)
- WHEN Admin loads the summary via the UI, THEN the system SHALL NOT append any new blocks to the Notion summary page.
- IF the Notion API returns a rate-limit error, THEN the system SHALL retry and return the error message to the UI if all retries fail.

### US-5: Loading state
- WHEN the fetch request is in progress, THEN the "Load Summary" button SHALL be disabled and show "Đang tải..." text.
- WHEN the fetch completes (success or error), THEN the button SHALL return to its normal state.

## Out of Scope

- Tạo/cập nhật Notion summary page từ UI (chức năng đó đã có ở "Generate Summary" trigger).
- Export summary ra CSV hoặc PDF.
- Real-time auto-refresh (không cần polling).
- Phân quyền theo role (tất cả admin đều có quyền như nhau).

## Non-functional Requirements

- **Performance**: Fetch summary phải hoàn thành trong < 5 giây với 10 thành viên (giới hạn Notion API call per-page).
- **Compatibility**: Hoạt động trên Chrome, Firefox, Safari (không dùng framework JS, vanilla only).
- **Security**: Endpoint GET `/api/summary` phải bảo vệ bởi cùng `authMiddleware` Bearer token như các route hiện tại.

## Dependencies

- `src/services/summary.js` — `aggregateStandups()` (refactor để extract `fetchSummaryData(date)`)
- `src/services/notion.js` — `getNotionService()`, `queryDatabase()`, `getPageBlocks()`
- `src/routes/triggers.js` — thêm GET route `/api/summary`
- `public/app.js` — tái sử dụng `apiFetch()`, `showAlert()`, `escapeHtml()`
- `public/styles.css` — tái sử dụng CSS classes: `.card`, `.table`, `.btn`, `.alert`, CSS variable `--color-danger`
