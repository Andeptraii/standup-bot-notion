# CLAUDE.md - Standup Bot (Notion)

## Quy tắc bắt buộc (Hard Rules)
- TUYỆT ĐỐI KHÔNG dùng thêm tool/database ngoài, chỉ sử dụng Notion API Free Tier.
- KHÔNG yêu cầu user cài app mới; tương tác hoàn toàn qua Notion account và Email.
- Tuân thủ chính xác timeline Cron job: 8:45 (Tạo/Hỏi) -> 8:55 (Nhắc nhở) -> 9:00 (Tổng hợp).
- Bắt buộc xử lý lỗi Rate Limit của Notion API (try/catch và retry logic).
- Không vượt quá tài nguyên VPS nhỏ/Railway (RAM < 512MB, chi phí < $10/tháng).

## Tech Stack & Công cụ
- **Backend Core**: Node.js
- **Web UI Admin**: Express.js (HTTPS endpoint)
- **Tương tác Dữ liệu**: `@notionhq/client` (Notion API)
- **Lập lịch**: `node-cron`
- **Thông báo**: `nodemailer` (hoặc email SMTP service cơ bản)

## Cấu trúc thư mục (Khuyến nghị)
- `/src/jobs`: Chứa các file định nghĩa cron job theo từng khung giờ.
- `/src/services`: Chứa `notion.js` (giao tiếp Notion) và `email.js` (gửi mail).
- `/src/routes`: Chứa API endpoints cho Admin UI.
- `/src/utils`: Helper functions, xử lý log và format thời gian.

## Luồng xử lý Standup (Workflow)
1. **8:45 Sáng**:
   - `node-cron` trigger khởi tạo Notion page mới cho từng member trong database `Standup Log`.
   - Gửi email DM chứa link Notion page để member điền (Template: Hôm qua làm gì? Hôm nay làm gì? Blocker?).
2. **8:55 Sáng**:
   - Quét Notion DB xem ai chưa điền form. Gửi email nhắc nhở tự động.
3. **9:00 Sáng**:
   - Truy xuất tất cả dữ liệu đã điền trong DB của ngày hôm nay.
   - Tạo bài post tổng hợp (Summary Page) trên Notion page chung của team.

## Tiêu chuẩn Code (Coding Style)
- Tên biến, tên hàm, tên file viết bằng **tiếng Anh** (camelCase).
- Comments, mô tả PR, README viết hoàn toàn bằng **tiếng Việt**.
- Quản lý mọi biến môi trường (`NOTION_TOKEN`, `NOTION_DATABASE_ID`, `SMTP_URL`) bằng file `.env`, tuyệt đối không hardcode.
- Thiết kế Dashboard UI Admin đơn giản (HTML/CSS thuần hoặc template engine) để xem log và trigger cronjob thủ công khi cần test.

## Lệnh thông dụng (Commands)
- `npm run dev`: Chạy server môi trường dev (có nodemon).
- `npm start`: Chạy server production.
- `npm run trigger:morning`: Chạy giả lập script 8:45.
- `npm run trigger:summary`: Chạy giả lập script 9:00.