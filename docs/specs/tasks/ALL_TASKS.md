## TASK-001: Khởi tạo Project và Môi trường TDD (Node.js, Jest, Express)

**Complexity**: S
**Priority**: P0

### Context
Để đảm bảo chất lượng hệ thống và tuân thủ nguyên tắc TDD (Test-Driven Development), bước đầu tiên là thiết lập repository với Node.js, cấu hình các công cụ linting (ESLint, Prettier) và framework testing (Jest). Project sẽ sử dụng Express.js để chuẩn bị cho Web UI Admin ở các bước sau. Toàn bộ code phải được test coverage cơ bản ngay từ đầu.

### Acceptance Criteria
- [ ] Khởi tạo `package.json` với các dependency: `express`, `jest`, `supertest`, `eslint`, `prettier`.
- [ ] Cấu hình `jest.config.js` để hỗ trợ mock và test coverage.
- [ ] Viết một test case giả định (dummy test) `server.test.js` đảm bảo Jest hoạt động.
- [ ] Viết API endpoint `GET /health` trả về status 200 (Viết test fail trước, sau đó implement Express app để pass test).
- [ ] Cấu hình `.eslintrc` và `.prettierrc`, thêm script `npm run lint` và `npm run test` vào `package.json`.

## TASK-002: Xây dựng Wrapper Module cho Notion API

**Complexity**: M
**Priority**: P0

### Context
Hệ thống cần giao tiếp liên tục với Notion Database để tạo page standup, đọc câu trả lời và tạo summary. Việc tương tác với `@notionhq/client` cần được gom gọn vào một service độc lập (Wrapper) để dễ dàng mock trong quá trình viết unit test và xử lý các lỗi rate limit của Notion API.

### Acceptance Criteria
- [ ] Cài đặt `@notionhq/client` và `dotenv`.
- [ ] Viết test file `notion.service.test.js`. Khởi tạo các mock functions cho `notion.pages.create` và `notion.databases.query`.
- [ ] Implement `NotionService` với phương thức `createPage(databaseId, properties)` và pass test.
- [ ] Implement `NotionService` với phương thức `queryDatabase(databaseId, filter)` và pass test.
- [ ] Xử lý lỗi (Error Handling): Nếu API key sai hoặc thiếu quyền, service phải throw custom error rõ ràng.

## TASK-003: Xây dựng Module Quản lý Thành viên (Member Service)

**Complexity**: S
**Priority**: P1

### Context
Bot cần danh sách các thành viên (tên, email, Notion User ID) để gán (assign) page và gửi email nhắc nhở. Dữ liệu này có thể lưu trong một file JSON cục bộ hoặc một Notion Database riêng (Admin Config). Để đơn giản cho MVP, ta sẽ load từ file cấu hình JSON được quản lý bởi Admin.

### Acceptance Criteria
- [ ] Viết test case cho `MemberService`: `getMembers()`, `getMemberByNotionId(id)`, `addMember(data)`.
- [ ] Các test phải cover trường hợp file JSON chưa tồn tại hoặc bị lỗi format.
- [ ] Implement `MemberService` đọc/ghi dữ liệu từ `members.json`.
- [ ] Tạo schema validate cho object member (bắt buộc có `name`, `email`, `notionId`).
- [ ] Pass toàn bộ unit test.

## TASK-004: Xây dựng Service Tạo Page Standup Hằng Ngày (8h45)

**Complexity**: M
**Priority**: P0

### Context
Tính năng cốt lõi: Tạo ra các page cá nhân mỗi sáng với template 3 câu hỏi ("Hôm qua làm gì?", "Hôm nay làm gì?", "Có blocker nào không?"). Service này nhận danh sách user từ `MemberService` và dùng `NotionService` để tạo page mới trong Standup Log Database.

### Acceptance Criteria
- [ ] Viết test `dailyStandup.service.test.js`: Mock `MemberService` trả về 2 users, verify `NotionService.createPage` được gọi đúng 2 lần với tham số chính xác.
- [ ] Implement `generateDailyPages(date)`: Tạo vòng lặp qua từng member, tạo Notion Page.
- [ ] Page tạo ra phải có title là `[Standup] YYYY-MM-DD - {Tên Member}`.
- [ ] Page content (Blocks) phải có sẵn 3 Heading (Hôm qua, Hôm nay, Blocker) kèm khoảng trống (Paragraph block) để user điền.
- [ ] Thuộc tính (Properties) của page phải được gán đúng `Assignee` (Notion User ID) và `Date` (Ngày hiện tại).

## TASK-005: Tích hợp Nodemailer cho Hệ thống Nhắc nhở (Email Reminder)

**Complexity**: M
**Priority**: P1

### Context
Để đáp ứng yêu cầu không dùng tool mới (chỉ dùng email + Notion), bot sẽ gửi email thông báo/nhắc nhở cho thành viên thay vì gửi tin nhắn qua Slack/Discord. Service này sẽ lo việc setup SMTP và gửi email template.

### Acceptance Criteria
- [ ] Cài đặt `nodemailer`.
- [ ] Viết unit test cho `EmailService.sendReminder(email, name, link)` bằng cách mock `nodemailer.createTransport`.
- [ ] Implement `EmailService` hỗ trợ SMTP transport (nhận config từ `.env` như `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`).
- [ ] Tạo HTML template đơn giản cho email nhắc nhở điền standup kèm link trực tiếp vào Notion page của user.
- [ ] Pass toàn bộ test cases (bao gồm test handle lỗi gửi mail thất bại).

## TASK-006: Feature Kiểm tra và Nhắc nhở Thành viên chưa điền Standup (8h55)

**Complexity**: M
**Priority**: P0

### Context
Vào lúc 8h55, hệ thống cần kiểm tra xem các page standup tạo lúc 8h45 đã được user điền hay chưa. Việc kiểm tra dựa trên sự thay đổi `last_edited_time` của block nội dung hoặc property "Status" trên Notion DB. Những ai chưa điền sẽ nhận được email nhắc nhở.

### Acceptance Criteria
- [ ] Viết test `reminder.service.test.js`: Mock Notion trả về 1 page đã điền, 1 page chưa điền -> Verify `EmailService.sendReminder` chỉ được gọi 1 lần cho user chưa điền.
- [ ] Implement logic `checkAndRemind()`: Query Notion DB lấy các page tạo trong ngày hôm nay.
- [ ] Logic phân biệt trang "chưa điền": Dựa vào property `Status` (To Do/Done) hoặc đọc trực tiếp content block để xem có text hay không.
- [ ] Lấy thông tin email từ `MemberService` thông qua Notion ID và gọi `EmailService`.
- [ ] Cập nhật database hoặc log lại trạng thái đã nhắc nhở để tránh spam.

## TASK-007: Feature Tổng hợp Standup và Tạo Summary Page (9h00)

**Complexity**: L
**Priority**: P0

### Context
Đúng 9h00 sáng, bot cần thu thập toàn bộ câu trả lời của team, tổng hợp lại thành một báo cáo chung (Summary) và đẩy vào một Page hoặc Channel chung trên Notion để Team Lead dễ theo dõi toàn cảnh.

### Acceptance Criteria
- [ ] Viết test `summary.service.test.js`: Cung cấp mock data gồm 3 trang standup cá nhân, kiểm tra hàm tạo content tổng hợp.
- [ ] Implement `aggregateStandups(date)`: Query tất cả standup pages của ngày hiện tại.
- [ ] Đọc nội dung chi tiết (Blocks) của từng page cá nhân, trích xuất text dưới các mục Hôm qua, Hôm nay, Blocker.
- [ ] Tạo một Notion Page mới (hoặc append block vào 1 trang Dashboard chỉ định), format dưới dạng Toggle List hoặc Bullet list theo từng thành viên.
- [ ] Highlight (Tô màu/Bôi đậm) phần "Blocker" nếu có text để Team Lead chú ý.

## TASK-008: Cấu hình Cron Job Tự Động Hóa Workflow

**Complexity**: S
**Priority**: P0

### Context
Đã có các functions độc lập (tạo page, nhắc nhở, tổng hợp). Cần sử dụng `node-cron` để lên lịch chạy tự động theo đúng yêu cầu thời gian thực tế: 8h45 (tạo page), 8h55 (nhắc nhở), 9h00 (tổng hợp). Cần chú ý múi giờ (Timezone).

### Acceptance Criteria
- [ ] Cài đặt package `node-cron`.
- [ ] Tạo module `scheduler.js`.
- [ ] Cấu hình cron pattern `45 8 * * 1-5` (8:45 AM từ Thứ 2 đến Thứ 6) để gọi `generateDailyPages`.
- [ ] Cấu hình cron pattern `55 8 * * 1-5` để gọi `checkAndRemind`.
- [ ] Cấu hình cron pattern `0 9 * * 1-5` để gọi `aggregateStandups`.
- [ ] Cấu hình đúng timezone (`Asia/Ho_Chi_Minh` hoặc timezone tuỳ chọn của team).
- [ ] Viết test đảm bảo các hàm service được trigger khi cron job chạy (mock node-cron).

## TASK-009: Phát triển API và Business Logic cho Web UI Admin

**Complexity**: M
**Priority**: P1

### Context
Team Lead cần một giao diện Admin (HTTPS endpoint) để quản lý cấu hình bot, thêm sửa xoá danh sách member, hoặc bấm nút kích hoạt standup thủ công (manual trigger) trong những ngày cần thiết mà không phải đợi đến đúng giờ cron job.

### Acceptance Criteria
- [ ] Viết API Integration Test bằng `supertest` cho các endpoints CRUD member và trigger cron.
- [ ] Implement `POST /api/trigger/standup` - Chạy logic tạo page thủ công.
- [ ] Implement `POST /api/trigger/summary` - Chạy logic tổng hợp thủ công.
- [ ] Implement CRUD RESTful APIs cho `/api/members`.
- [ ] Thêm middleware Basic Auth hoặc Token tĩnh bảo vệ toàn bộ các endpoints `/api/*` (đảm bảo bảo mật tối thiểu).

## TASK-010: Xây dựng Giao diện Web UI Admin (Frontend)

**Complexity**: M
**Priority**: P2

### Context
Tạo một Web UI cực kỳ đơn giản (Vanilla HTML/CSS/JS) được serve thẳng từ Express server. UI giúp Team Lead có cái nhìn trực quan, không cần phải gọi API bằng Postman. Đáp ứng constraint có giao diện web UI của dự án.

### Acceptance Criteria
- [ ] Cấu hình Express phục vụ thư mục tĩnh `public/`.
- [ ] Tạo file `index.html` với giao diện Dashboard tối giản (dùng Bootstrap hoặc Tailwind CDN).
- [ ] Giao diện hiển thị danh sách các members hiện có.
- [ ] Giao diện có 3 nút bấm: "Tạo Standup ngay", "Gửi nhắc nhở", "Tổng hợp Standup".
- [ ] Viết script Javascript (Fetch API) gọi các endpoints tạo ở TASK-009, kèm theo xử lý Auth token trong header.
- [ ] Bắt lỗi và hiển thị Alert thành công/thất bại trên UI cho user.

## TASK-011: Setup Notion Database Architecture & Validator Service

**Complexity**: S
**Priority**: P0

### Context
Bot phụ thuộc rất nhiều vào cấu trúc chuẩn của Notion Database. Ta cần định nghĩa rõ lược đồ dữ liệu (Schema) và viết một hàm khởi động (Startup Check) để khi server chạy, nó kiểm tra xem Notion DB có đủ các property cần thiết hay không, tránh lỗi runtime.

### Acceptance Criteria
- [ ] Document rõ cấu trúc Notion DB "Standup Log" cần có: Cột Name (Title), Cột Date (Date), Cột Assignee (Person), Cột Status (Select: To Do, Done).
- [ ] Viết test `schemaValidator.test.js` kiểm tra logic validate property của database.
- [ ] Implement `validateNotionDatabase()` chạy lúc khởi động app. Báo lỗi và dừng server (graceful shutdown) nếu thiếu cột bắt buộc.
- [ ] Cung cấp script hoặc tài liệu markdown ngắn hướng dẫn Team Lead set up Dashboard Views (Filter by date, person, blocker) trên Notion UI.

## TASK-012: Đóng gói Docker, Cấu hình CI/CD và Deployment (Railway)

**Complexity**: M
**Priority**: P0

### Context
Đưa hệ thống lên môi trường production. Dự án yêu cầu deploy trên VPS nội bộ hoặc Railway với chi phí dưới 10$/tháng. Để code chạy ổn định trên mọi môi trường và hỗ trợ CI/CD tốt, cần containerize ứng dụng bằng Docker.

### Acceptance Criteria
- [ ] Tạo `Dockerfile` tối ưu hóa kích thước cho Node.js app (dùng node:alpine).
- [ ] Tạo `.dockerignore` để bỏ qua `node_modules` và file test.
- [ ] Thêm file cấu hình `railway.toml` (nếu cần) và thiết lập lệnh start: `npm start`.
- [ ] Tạo file `.env.example` chứa toàn bộ biến môi trường (NOTION_API_KEY, DB_ID, SMTP_..., PORT).
- [ ] Tạo GitHub Actions (`.github/workflows/test.yml`) tự động chạy `npm run test` và `npm run lint` khi có Pull Request vào nhánh `main`.
- [ ] Đảm bảo HTTP server lắng nghe cổng động `$PORT` để Railway tự động cung cấp HTTPS endpoint.