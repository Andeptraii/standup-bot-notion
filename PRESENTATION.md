# 📊 STANDUP BOT (NOTION)
## Bài Thuyết Trình Dự Án

---

## 🎯 SLIDE 1: GIỚI THIỆU DỰ ÁN

### Tên dự án
**Standup Bot for Notion** — Bot tự động hoá quy trình standup hằng ngày

### Mục tiêu chính
- Tự động hoá quy trình standup (8:45 → 8:55 → 9:00)
- Lưu trữ dữ liệu trực tiếp trên **Notion** (không cần tool bên ngoài)
- Giảm công sức thủ công, tăng độ chính xác

### Đối tượng sử dụng
Team phát triển sử dụng Notion làm workspace chính

---

## 📌 SLIDE 2: VẤN ĐỀ CẦN GIẢI QUYẾT

### Tình trạng hiện tại
❌ **Before:**
- Standup được làm thủ công hoặc trên tool riêng biệt
- Dữ liệu nằm rải rác ở nhiều nơi (Slack, Excel, email...)
- Khó tra cứu lại lịch sử standup theo ngày/theo người
- Tốn thời gian nhắc nhở thành viên điền form
- Không có sự thống nhất về format dữ liệu

### Nhu cầu
✅ **Cần:**
- Tự động gửi form standup vào lúc cố định (8:45)
- Tự động nhắc nhở những ai chưa điền (8:55)
- Tự động tổng hợp dữ liệu thành báo cáo (9:00)
- Lưu trữ tất cả trên Notion để dễ truy cập

---

## 💡 SLIDE 3: GIẢI PHÁP ĐỀ XUẤT

### Quy trình hoạt động 3 bước

```
┌─────────────────────────────────────────────────────────┐
│  8:45 AM - KHỞI TẠO FORM                               │
│  ✓ Tạo Notion page mới cho mỗi thành viên               │
│  ✓ Gửi email chứa link form (câu hỏi standup)          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  8:55 AM - NHẮC NHỞ                                     │
│  ✓ Quét database, tìm ai chưa điền                      │
│  ✓ Gửi email nhắc nhở tự động                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  9:00 AM - TỔNG HỢP                                     │
│  ✓ Lấy tất cả dữ liệu đã điền trong ngày               │
│  ✓ Tạo summary page trên Notion team workspace          │
│  ✓ Lưu trữ dữ liệu để tra cứu sau                      │
└─────────────────────────────────────────────────────────┘
```

### Template câu hỏi
- ❓ **Hôm qua làm gì?** (Yesterday)
- ❓ **Hôm nay làm gì?** (Today)
- ❓ **Có vướng mắc gì không?** (Blockers)

---

## 🏗️ SLIDE 4: KIẾN TRÚC HỆ THỐNG

```
┌──────────────────────────────────────────────────────┐
│                   FRONTEND (UI ADMIN)                 │
│  Express.js + HTML/CSS - Dashboard để xem log        │
│  • Trigger manual cron jobs                           │
│  • Xem lịch sử execution                              │
│  • Quản lý cấu hình                                   │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│                 BACKEND (NODE.JS CORE)               │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ SCHEDULER (node-cron)                        │    │
│  │ • 8:45 - triggerMorning()                    │    │
│  │ • 8:55 - triggerReminder()                   │    │
│  │ • 9:00 - triggerSummary()                    │    │
│  └─────────────────────────────────────────────┘    │
│                          ↓                            │
│  ┌─────────────────────────────────────────────┐    │
│  │ SERVICES LAYER                               │    │
│  │ • dailyStandup.js    - Tạo form              │    │
│  │ • reminder.js        - Gửi nhắc nhở          │    │
│  │ • summary.js         - Tổng hợp dữ liệu      │    │
│  │ • member.js          - Quản lý thành viên    │    │
│  │ • email.js           - Gửi email             │    │
│  │ • notion.js          - Kết nối Notion API    │    │
│  └─────────────────────────────────────────────┘    │
│                          ↓                            │
│  ┌─────────────────────────────────────────────┐    │
│  │ EXTERNAL SERVICES                            │    │
│  │ • Notion API (Free Tier)                     │    │
│  │ • SMTP Email Service (Nodemailer)            │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Luồng dữ liệu
```
Email → Notion Database ← Member fills in form
                    ↓
              Summary Service
                    ↓
            Create Summary Page
```

---

## 🔧 SLIDE 5: TECH STACK

| Thành phần | Công nghệ | Phiên bản | Tác dụng |
|---|---|---|---|
| **Runtime** | Node.js | ≥ 18.0.0 | Môi trường chạy |
| **Web Server** | Express.js | ^4.19.2 | REST API & Admin UI |
| **Scheduler** | node-cron | ^3.0.3 | Lên lịch cron jobs |
| **Database API** | @notionhq/client | ^2.2.15 | Kết nối Notion API |
| **Email** | Nodemailer | ^6.9.13 | Gửi email tự động |
| **Config** | dotenv | ^16.4.5 | Quản lý biến môi trường |
| **Testing** | Jest | ^29.7.0 | Unit tests |
| **Linting** | ESLint | ^8.57.0 | Code quality |

### Tiêu chí chọn công nghệ
✅ Minimal dependencies (giảm dung lượng, tăng bảo mật)  
✅ Free tier có sẵn (Notion API, SMTP)  
✅ Ram sử dụng < 512MB (phù hợp VPS nhỏ)  
✅ Chi phí < $10/tháng (dùng Railway hoặc Heroku)  

---

## 📁 SLIDE 6: CẤU TRÚC THƯ MỤC

```
standup-bot-notion/
├── src/
│   ├── index.js                 # Entry point
│   ├── app.js                   # Express app setup
│   ├── services/
│   │   ├── notion.js            # Notion API client
│   │   ├── dailyStandup.js      # Tạo form standup
│   │   ├── reminder.js          # Gửi nhắc nhở
│   │   ├── summary.js           # Tổng hợp dữ liệu
│   │   ├── email.js             # Email service
│   │   └── member.js            # Member management
│   ├── routes/
│   │   ├── admin.js             # Dashboard routes
│   │   └── triggers.js          # Manual trigger endpoints
│   ├── jobs/
│   │   ├── morning.js           # 8:45 job
│   │   ├── reminder.js          # 8:55 job
│   │   └── summary.js           # 9:00 job
│   ├── scripts/
│   │   ├── triggerMorning.js    # CLI: npm run trigger:morning
│   │   ├── triggerRemind.js     # CLI: npm run trigger:remind
│   │   └── triggerSummary.js    # CLI: npm run trigger:summary
│   ├── middleware/
│   │   └── auth.js              # Authentication
│   ├── utils/
│   │   ├── logger.js            # Logging
│   │   ├── schemaValidator.js   # Data validation
│   │   └── helpers.js           # Helper functions
│   └── __tests__/               # Unit tests
├── public/
│   ├── index.html               # Admin dashboard UI
│   └── app.js                   # Frontend scripts
├── data/
│   └── members.json             # Member configuration
├── .env                         # Environment variables
├── package.json
└── CLAUDE.md                    # Project rules
```

---

## 🔄 SLIDE 7: LUỒNG HOẠT ĐỘNG CHI TIẾT

### 8:45 AM - KHỞI TẠO FORM

```javascript
// Job: dailyStandup.triggerMorning()

1. Lấy danh sách tất cả thành viên từ members.json
   └─ Member: { name, email, notionPageId }

2. Với mỗi thành viên:
   ├─ Tạo Notion page mới
   │  └─ Title: "[STANDUP] {Name} - {Date}"
   │  └─ Template: Form 3 câu hỏi
   │
   └─ Gửi email
      └─ Subject: "Standup Form - {Date}"
      └─ Body: "Link to form" + Form link
      └─ To: {email}

3. Log execution & save status to database
   └─ Status: "pending" → "sent"
```

### 8:55 AM - NHẮC NHỞ

```javascript
// Job: reminder.triggerReminder()

1. Quét Notion database
   └─ Find pages với status = "pending" (chưa điền)

2. Với mỗi form chưa điền:
   ├─ Gửi email nhắc nhở
   │  └─ "Bạn chưa điền standup form, vui lòng hoàn thành trước 9:00"
   │
   └─ Update reminder_count trong database

3. Log reminders sent
```

### 9:00 AM - TỔNG HỢP

```javascript
// Job: summary.triggerSummary()

1. Lấy tất cả forms đã điền trong ngày hôm nay
   ├─ Query Notion by date filter
   └─ Get: yesterday, today, blockers từ mỗi member

2. Xử lý dữ liệu
   ├─ Validate format
   ├─ Handle missing fields
   └─ Prepare summary template

3. Tạo Summary Page trên Notion
   ├─ Title: "[SUMMARY] {Date}"
   ├─ Content:
   │  ├─ "Yesterday's Work" section
   │  ├─ "Today's Plan" section
   │  ├─ "Blockers & Issues" section
   │  └─ "Team Stats" (completion rate, etc)
   │
   └─ Pin to team workspace

4. Archive daily forms
   └─ Set archive=true để dọn giao diện
```

---

## 🔌 SLIDE 8: NOTION DATABASE SCHEMA

### Bảng: Standup Log (Main)
| Property | Type | Mô tả |
|---|---|---|
| Name (Title) | Text | [STANDUP] {Name} - {Date} |
| Date | Date | Ngày standup |
| Member | Relation | Link to Members |
| Status | Select | pending / submitted / archived |
| Yesterday | Rich Text | Hôm qua làm gì |
| Today | Rich Text | Hôm nay làm gì |
| Blockers | Rich Text | Vướng mắc gì |
| Created At | Created Time | Timestamp tạo |
| Updated At | Last Edited Time | Timestamp cập nhật |

### Bảng: Members (Config)
| Property | Type | Mô tả |
|---|---|---|
| Name (Title) | Text | Tên thành viên |
| Email | Email | Email để gửi form |
| Active | Checkbox | Có hoạt động không |
| Notion Page ID | Text | Page ID trong Notion |
| Role | Select | Developer / Manager / Designer |

### Bảng: Summary (Report)
| Property | Type | Mô tả |
|---|---|---|
| Title | Text | [SUMMARY] - {Date} |
| Date | Date | Ngày tổng hợp |
| Total Members | Number | Số thành viên trả lời |
| Completion Rate | Formula | {submitted} / {total} |
| Summary Content | Rich Text | Nội dung tổng hợp |

---

## 🚀 SLIDE 9: FEATURES & CAPABILITIES

### ✅ Core Features
- [x] Tự động tạo form standup vào 8:45
- [x] Tự động gửi email với form link
- [x] Tự động nhắc nhở vào 8:55
- [x] Tự động tổng hợp vào 9:00
- [x] Lưu trữ dữ liệu trên Notion
- [x] Admin dashboard để trigger manual
- [x] Email notification system
- [x] Error handling & retry logic

### 🔒 Tính năng bảo mật
- [x] Environment variable management (.env)
- [x] Authentication middleware cho admin routes
- [x] Rate limit handling từ Notion API
- [x] Input validation & schema checking
- [x] Error logging & monitoring

### 📊 Tính năng quản lý
- [x] Trigger manual cron jobs từ dashboard
- [x] Xem logs execution history
- [x] Quản lý member list
- [x] Cấu hình email templates
- [x] Monitor API usage

---

## 📈 SLIDE 10: TESTING & QUALITY ASSURANCE

### Test Coverage
```
Unit Tests:
├── notion.service.test.js       - Notion API integration
├── email.service.test.js        - Email sending
├── dailyStandup.service.test.js - Form creation
├── reminder.service.test.js     - Reminder logic
├── summary.service.test.js      - Summarization
├── member.service.test.js       - Member management
└── scheduler.test.js            - Cron scheduling

Integration Tests:
└── api.test.js                  - API endpoints
└── server.test.js               - Server startup
```

### Code Quality Tools
- **ESLint** - Static code analysis
- **Prettier** - Code formatting
- **Jest** - Unit testing framework
- **Coverage** - Test coverage metrics

### Lệnh chạy test
```bash
npm test                  # Run all tests with coverage
npm run test:watch       # Watch mode
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
```

---

## 🔧 SLIDE 11: CÀI ĐẶT & DEPLOYMENT

### Prerequisites
- Node.js ≥ 18.0.0
- Notion account + API token
- Email SMTP service (Gmail, SendGrid, etc.)

### Environment Variables
```
# .env file
NOTION_TOKEN=<your-notion-api-key>
NOTION_DATABASE_ID=<standup-log-db-id>
NOTION_MEMBERS_DB_ID=<members-db-id>
NOTION_SUMMARY_DB_ID=<summary-db-id>

SMTP_HOST=<smtp-host>
SMTP_PORT=<smtp-port>
SMTP_USER=<email-user>
SMTP_PASS=<email-password>
ADMIN_EMAIL=<admin-email>

NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### Development
```bash
npm install           # Install dependencies
npm run dev          # Start with nodemon
npm run trigger:morning   # Test 8:45 job
npm run trigger:remind    # Test 8:55 job
npm run trigger:summary   # Test 9:00 job
```

### Production
```bash
npm start            # Run production server
# Or deploy to Railway/Heroku
```

### Resource Requirements
- **Memory**: < 512MB
- **CPU**: Minimal (idle most of time)
- **Storage**: < 100MB
- **Monthly Cost**: < $10 (Railway, Heroku free tier)

---

## 🎨 SLIDE 12: USER INTERFACE

### Admin Dashboard
**Location**: `http://localhost:3000/admin`

**Features**:
- 📊 **Dashboard** - Real-time status overview
  - Execution history
  - Success/failure rate
  - Member completion status

- 🎮 **Manual Controls**
  - Button: "Trigger Morning (8:45)"
  - Button: "Trigger Reminder (8:55)"
  - Button: "Trigger Summary (9:00)"

- 📋 **Logs & Monitoring**
  - Real-time execution logs
  - Error tracking
  - Email sent history

- ⚙️ **Settings**
  - Member management
  - Email template editor
  - Cron schedule config

### Design System
- **Inspiration**: Airtable-inspired clean design
- **Colors**: Deep Navy + Airtable Blue
- **Typography**: Haas font family
- **Components**: Buttons, cards, tables with Airtable styling

---

## ✨ SLIDE 13: NHỮNG ĐẶC ĐIỂM NỔI BẬT

### 1️⃣ Hoàn toàn tự động
Không cần can thiệp thủ công, chỉ cần setup 1 lần

### 2️⃣ Không cần tool bên ngoài
Tất cả dữ liệu lưu trên Notion (workspace sẵn có)

### 3️⃣ Đơn giản & tiết kiệm
- Code base nhỏ gọn (< 2000 lines)
- Minimal dependencies
- Free tier Notion API có đủ dùng

### 4️⃣ Tin cậy & resilient
- Error handling cho Notion API rate limit
- Retry logic cho failed requests
- Comprehensive logging & monitoring

### 5️⃣ Dễ mở rộng
- Modular service architecture
- Clear separation of concerns
- Easy to add new features

### 6️⃣ Bảo mật
- Environment-based config
- No hardcoded secrets
- Input validation
- Authentication for admin routes

---

## 📊 SLIDE 14: CÁC THÀNH CÔNG & KỲ VỌNG

### Lợi ích dự kiến
| Khía cạnh | Trước | Sau | Cải thiện |
|---|---|---|---|
| **Thời gian setup** | 30+ phút/ngày | 0 phút | ✅ 100% |
| **Tỷ lệ hoàn thành** | 70% (thủ công) | 95%+ | ✅ +25% |
| **Dữ liệu lưu trữ** | Rải rác | Tập trung Notion | ✅ Dễ tra cứu |
| **Accuracy** | Dễ nhầm lẫn | Standardized | ✅ Cao hơn |
| **Audit trail** | Không có | Đầy đủ | ✅ Transparent |

### Key Metrics to Track
```
1. Daily Completion Rate (%)
   = (Submitted forms / Total members) × 100
   Target: > 90%

2. Average Response Time
   = Time from email sent to form submitted
   Target: < 10 minutes

3. System Uptime
   = (Successful cron runs / Total scheduled) × 100
   Target: > 99%

4. Email Delivery Rate
   = (Delivered emails / Sent emails) × 100
   Target: > 98%
```

---

## 🚧 SLIDE 15: HIỆN TRẠNG & ROADMAP

### ✅ Đã hoàn thành
- [x] Core scheduler (node-cron)
- [x] Notion API integration
- [x] Email service (Nodemailer)
- [x] Daily standup form creation
- [x] Reminder system
- [x] Summary generation
- [x] Admin dashboard (basic)
- [x] Error handling & logging
- [x] Unit & integration tests
- [x] Documentation

### 🔄 Đang phát triển
- [ ] UI/UX improvements
- [ ] Advanced analytics
- [ ] Custom templates
- [ ] Multi-team support

### 📅 Kế hoạch tương lai (Roadmap)

**Phase 2 (Q2 2026)**
- [ ] Real-time notifications (WebSocket)
- [ ] Slack integration (optional)
- [ ] Custom standup questions per team
- [ ] Performance analytics dashboard

**Phase 3 (Q3 2026)**
- [ ] Mobile-friendly responsive design
- [ ] Historical data export (CSV/PDF)
- [ ] Team performance metrics
- [ ] Predictive analytics

**Phase 4 (Q4 2026)**
- [ ] Multi-workspace support
- [ ] API for third-party integrations
- [ ] Advanced permission system
- [ ] Self-hosted & SaaS version

---

## 🎯 SLIDE 16: RISK & MITIGATION

### Potential Risks
| Risk | Impact | Mitigation |
|---|---|---|
| **Notion API downtime** | Service fail | Implement queue system, retry logic |
| **Email delivery fail** | Users miss form | Fallback notification, dashboard link |
| **Memory leak in node** | Server crash | Monitor memory, implement limits |
| **Rate limit exceeded** | API blocks | Implement exponential backoff |
| **Data loss** | Irreversible | Regular Notion backups |
| **Security breach** | Data leak | Environment security, access control |

### Mitigation Strategies
1. ✅ Comprehensive error handling
2. ✅ Retry mechanisms (exponential backoff)
3. ✅ Monitoring & alerting system
4. ✅ Regular data backups
5. ✅ Security audit regularly
6. ✅ Load testing before scale

---

## 💼 SLIDE 17: BUSINESS VALUE

### ROI Calculation
```
Anumm Effort Saved:
- Manual standup creation: 1 hour/week × 52 = 52 hours
- Manual reminders: 0.5 hour/week × 52 = 26 hours
- Manual compilation: 1 hour/week × 52 = 52 hours
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 130 hours/year ≈ 3 weeks equivalent

Cost Saved:
- Labor: 130 hours × $30/hour = $3,900
- Tool subscriptions: $0 (use free tier)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: $3,900/year

Development Cost: ~$1,000 (one-time)
Break-even: 3 months ✅
```

### Qualitative Benefits
- 📈 **Better visibility** - Centralized team progress tracking
- 🎯 **Improved accountability** - Automated tracking, transparent metrics
- 🔍 **Historical insights** - Query past standups by date/person
- 📊 **Data-driven decisions** - Identify blockers, patterns
- ⚡ **Team productivity** - Reduce admin overhead, focus on work

---

## 🔐 SLIDE 18: SECURITY & COMPLIANCE

### Security Measures
```
1. API Authentication
   ├─ Notion API token in .env (not hardcoded)
   ├─ SMTP credentials in .env
   └─ Admin auth middleware on dashboard

2. Data Protection
   ├─ Input validation on all endpoints
   ├─ SQL injection prevention (using Notion SDK)
   ├─ XSS prevention (sanitize user input)
   └─ CSRF tokens on admin forms

3. Access Control
   ├─ Authentication required for admin routes
   ├─ Role-based access (Admin, User levels)
   └─ Audit logging of admin actions

4. Infrastructure
   ├─ HTTPS only for production
   ├─ Environment isolation (dev/staging/prod)
   ├─ Dependency scanning (npm audit)
   └─ Regular security updates
```

### Compliance
- ✅ GDPR-ready (no personal data beyond necessary)
- ✅ SOC 2-aligned (audit logs, access control)
- ✅ No PCI compliance needed (no payment processing)

---

## 📚 SLIDE 19: DOCUMENTATION & SUPPORT

### Available Documentation
- ✅ [README.md](README.md) - Overview & quick start
- ✅ [CLAUDE.md](CLAUDE.md) - Project rules & architecture
- ✅ [QUICK_START.md](QUICK_START.md) - Setup guide
- ✅ [DESIGN.md](DESIGN.md) - UI design system
- ✅ Code comments & JSDoc

### Support Resources
```
📖 Documentation
  └─ In-code comments
  └─ Architecture decision records
  └─ API documentation

🧪 Testing & Examples
  └─ Unit tests in src/__tests__/
  └─ Example .env.example
  └─ Mock data in test fixtures

🎯 Setup Scripts
  └─ npm run trigger:* for testing
  └─ npm run dev for development
  └─ npm start for production
```

### Getting Help
1. **Check logs** - Detailed error messages
2. **Run tests** - `npm test` to verify setup
3. **Read code comments** - Self-documenting code
4. **Check CLAUDE.md** - Project rules

---

## 🎓 SLIDE 20: LESSONS LEARNED & BEST PRACTICES

### ✅ What Worked Well
1. **Modular architecture** - Easy to test & maintain
2. **Notion API** - Perfect for team workspace
3. **Minimal dependencies** - Less security risk
4. **Automated scheduling** - Reliable cron jobs
5. **Error handling** - Graceful degradation

### 📝 Best Practices Applied
```
Code Quality:
✅ Single Responsibility Principle
✅ DRY (Don't Repeat Yourself)
✅ Clear naming conventions
✅ Comprehensive error handling
✅ Logging at key checkpoints

Testing:
✅ Unit tests for each service
✅ Integration tests for flows
✅ Mock external services
✅ > 80% code coverage target

DevOps:
✅ Environment-based config
✅ Automated linting
✅ Pre-commit hooks ready
✅ Easy deployment process
```

### 🎯 Recommendations for Scaling
1. **Add caching layer** - Redis for frequently accessed data
2. **Implement job queue** - Bull/RabbitMQ for async processing
3. **Add metrics** - Prometheus/Grafana for monitoring
4. **Setup alerting** - PagerDuty/OpsGenie for incidents
5. **Multi-instance support** - Load balancing, session management

---

## ❓ SLIDE 21: Q&A

### Câu hỏi thường gặp

**Q1: Nếu Notion API down, hệ thống làm gì?**
A: Hệ thống sẽ retry theo exponential backoff strategy. Nếu thất bại, sẽ:
  - Log error chi tiết
  - Gửi alert email cho admin
  - Dashboard sẽ show status = "failed"
  - Admin có thể trigger lại manually

**Q2: Có thể custom câu hỏi standup không?**
A: Hiện tại câu hỏi cứng trong code. Trong Phase 2, sẽ cho custom per team.

**Q3: Có mở rộng cho multiple teams được không?**
A: Hiện tại support 1 team. Phase 2 sẽ support multiple teams.

**Q4: Chi phí triển khai như thế nào?**
A: < $10/tháng (dùng Railway/Heroku free tier). Notion API free tier đủ.

**Q5: Bảo mật dữ liệu như thế nào?**
A: Tất cả token/password trong .env, không hardcode. HTTPS production.

---

## 🎉 SLIDE 22: KẾT LUẬN

### Tóm tắt dự án

**Standup Bot for Notion** là một giải pháp tự động hoá hoàn toàn cho quy trình standup hằng ngày:

✅ **Giải quyết bài toán** - Tự động hoá từ creation → reminder → summary  
✅ **Tiết kiệm chi phí** - Free tier, minimal infra, ROI 3 tháng  
✅ **Dễ triển khai** - Setup 1 lần, chạy tự động theo lịch  
✅ **Dễ mở rộng** - Modular architecture, sẵn sàng cho features mới  
✅ **Bảo mật tốt** - Proper handling of secrets, audit logs  

### Call to Action

🚀 **Sẵn sàng triển khai**
- Tất cả code, test, docs đã hoàn thành
- Có thể deploy lên production ngay
- Hỗ trợ training cho team

📞 **Liên hệ**
- Developer: an.nguyen@nexlab.tech
- Support: [available 24/7]

---

## 📞 SLIDE 23: CONTACT & RESOURCES

### Project Links
- **Repository**: [GitHub link]
- **Documentation**: See README.md, CLAUDE.md, QUICK_START.md
- **Demo Dashboard**: http://localhost:3000/admin (after setup)

### Contact Information
- **Team Lead**: an.nguyen@nexlab.tech
- **Support Email**: support@nexlab.tech
- **Slack Channel**: #standup-bot (internal)

### Useful Links
- Notion API Docs: https://developers.notion.com
- node-cron Docs: https://www.npmjs.com/package/node-cron
- Express.js Docs: https://expressjs.com
- Nodemailer Docs: https://nodemailer.com

### Version Info
- **Version**: 1.0.0
- **Last Updated**: April 2026
- **Node.js Required**: ≥ 18.0.0
- **Status**: Production Ready ✅

---

## 📎 APPENDIX A: CRON SCHEDULE REFERENCE

```
TIME     JOB NAME           FUNCTION              WHAT IT DOES
────────────────────────────────────────────────────────────
08:45    triggerMorning     dailyStandup()        Create forms, send emails
08:55    triggerReminder    reminder()            Send reminders
09:00    triggerSummary     summary()             Collect & summarize

Testing (manual):
npm run trigger:morning        # Simulate 8:45
npm run trigger:remind         # Simulate 8:55
npm run trigger:summary        # Simulate 9:00
```

## 📎 APPENDIX B: ERROR CODES REFERENCE

```
CODE    MEANING                           ACTION
────────────────────────────────────────────────────
E001    Notion API rate limit             Wait & retry (backoff)
E002    Invalid Notion token              Check .env NOTION_TOKEN
E003    Database not found                Check database IDs
E004    Email send failed                 Check SMTP credentials
E005    Invalid member data               Validate members.json
E006    Scheduler initialization error    Check cron syntax
E007    Missing required fields           Validate input schema
```

## 📎 APPENDIX C: ENVIRONMENT VARIABLES TEMPLATE

```bash
# Copy to .env file before running

# Notion Configuration
NOTION_TOKEN=your_notion_integration_token_here
NOTION_DATABASE_ID=db_id_for_standup_log
NOTION_MEMBERS_DB_ID=db_id_for_members
NOTION_SUMMARY_DB_ID=db_id_for_summaries

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=standup-bot@yourcompany.com
ADMIN_EMAIL=admin@yourcompany.com

# Application Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
TIMEZONE=Asia/Ho_Chi_Minh

# Admin Dashboard (optional)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_here
```

---

**© 2026 Nexlab. All rights reserved.**  
**Last Updated: April 23, 2026**
