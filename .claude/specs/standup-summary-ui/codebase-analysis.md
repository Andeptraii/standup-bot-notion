# Codebase Analysis: Standup Summary UI

## Kiến trúc hiện tại

### Backend (Node.js/Express)
- `src/app.js` — Express app, mount routes, serve static `/public/`
- `src/routes/triggers.js` — POST `/api/trigger/summary` gọi `aggregateStandups()`, trả về `{ success, result: { date, memberCount } }`
- `src/services/summary.js` — Logic tổng hợp: `aggregateStandups()`, `extractTextFromBlocks()`, `buildSummaryBlocks()`, `getMemberName()`
- `src/services/notion.js` — `NotionService` singleton với `queryDatabase()`, `getPageBlocks()`, `appendBlocks()`
- `src/middleware/auth.js` — Bearer token auth middleware áp dụng cho tất cả `/api/*`

### Frontend (Vanilla HTML/CSS/JS trong `/public/`)
- `public/index.html` — Admin Dashboard: Auth section, Manual Triggers, Members Management
- `public/app.js` — Utility: `apiFetch()`, `showAlert()`, `triggerAction()`, `loadMembers()`, `escapeHtml()`
- `public/styles.css` — CSS variables, card layout (`.card`, `.card-title`, `.card-content`), table styles, alert styles

## Patterns Có thể Tái sử dụng

### API Pattern
```javascript
// Existing route pattern in src/routes/triggers.js
router.post('/summary', async (_req, res) => {
  try {
    const result = await aggregateStandups();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```
→ Thêm GET route cho `fetchSummary(date)` theo cùng pattern

### Frontend fetch pattern
```javascript
// public/app.js - tái sử dụng apiFetch()
const data = await apiFetch(`/api/summary?date=...`);
```
→ `apiFetch()` xử lý auth token, error handling — tái sử dụng trực tiếp

### Summary data từ Notion
- `aggregateStandups()` hiện tại fetch + push lên Notion; cần extract phần fetch thành function riêng `fetchSummaryData(date)` để UI có thể hiển thị mà không cần append lên Notion

### Existing Summary Structure (summary.js)
```javascript
memberSummaries = [
  { name: 'An', sections: { 'Hôm qua': ['...'], 'Hôm nay': ['...'], 'Blocker': [] } },
  ...
]
```

## Điểm Tích hợp
- Backend: thêm `GET /api/summary?date=YYYY-MM-DD` vào `src/routes/triggers.js`
- Service: thêm `fetchSummaryData(date)` trong `src/services/summary.js`
- Frontend: thêm section "Standup Summary" vào `public/index.html` + handler trong `public/app.js`
- Auth: sử dụng `authMiddleware` đã có, phù hợp pattern hiện tại

## Ràng buộc
- Chỉ dùng Notion API (không có DB ngoài)
- Static HTML/CSS/JS, không dùng framework
- RAM < 512MB — không cache summary ở server
- Notion rate limit: `_withRetry()` đã xử lý sẵn
