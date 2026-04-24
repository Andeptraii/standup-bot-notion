# 📋 Hướng dẫn Standup hàng ngày

## Quy trình Standup (Thời gian)

### ⏰ **8:45 AM** - Nhận thông báo
- Bạn sẽ nhận **email** từ Standup Bot
- Email chứa **link Notion page** standup của bạn
- **Hành động**: Click vào link

### ⏰ **8:55 AM** - Nhắc nhở
- Nếu chưa điền, bạn nhận **email nhắc nhở**
- Hãy **hoàn thành ngay** nếu chưa

### ⏰ **9:00 AM** - Tổng hợp
- Bot **tổng hợp** tất cả standup thành 1 page chung
- Team lead có thể xem **overview** tổng quát

---

## 📝 Cách điền Standup

### **Bước 1: Mở Notion page từ email**
- Click link trong email → mở Notion

### **Bước 2: Điền 3 phần**

**Page sẽ có 3 heading chính:**

```
[Standup] 2026-04-21 - Binh
├── Hôm qua (Yesterday)
├── Hôm nay (Today)
└── Blocker (Blocker/Impediment)
```

#### **Hôm qua** (What did you do yesterday?)
Liệt kê những gì bạn hoàn thành hôm qua:
- ✅ Hoàn thành task A
- ✅ Code review PR của X
- ✅ Fix bug #123

**Ví dụ:**
```
- Hoàn thành API endpoint /users GET
- Review code của Minh cho feature login
- Deploy version 1.2.0 lên staging
```

#### **Hôm nay** (What will you do today?)
Kế hoạch công việc cho hôm nay:
- 📌 Task B (cần làm)
- 📌 Meeting với PM (10:00)
- 📌 Testing feature X

**Ví dụ:**
```
- Implement feature tìm kiếm user
- Attend standup meeting (9:00 AM)
- Unit test cho API endpoint POST /users
- 1:1 sync với team lead
```

#### **Blocker** (Impediments/Blockers)
Những gì cản trở bạn (nếu có):
- ❌ Chờ approval từ PM cho design
- ❌ Server staging bị down
- ❌ Chưa có access vào service X

**Nếu không có blocker → để trống hoặc ghi "None"**

**Ví dụ:**
```
- Chờ code review của team lead (3 ngày rồi)
- Database migration script chưa được approve
```

---

## ✅ Mẫu hoàn chỉnh

```
[Standup] 2026-04-21 - Binh

Hôm qua
- Hoàn thành API endpoint GET /users
- Code review pull request #45 của Minh
- Fix 2 bugs trong authentication flow
- Deploy staging version 1.2.0

Hôm nay
- Implement feature tìm kiếm user (search/filter)
- Unit test cho 3 API endpoints
- Attend standup meeting (9:00 AM)
- 1:1 sync với team lead (3:00 PM)

Blocker
- Chờ product design approval cho new dashboard (3 ngày)
- Server staging bị slow, cần investigate
```

---

## 💡 Lưu ý & Best Practices

### ✅ Làm tốt
- **Cụ thể**: "Fix bug #123 trong login" (không phải "Fix bugs")
- **Ngắn gọn**: 3-5 dòng mỗi phần (không cần chi tiết quá)
- **Đúng giờ**: Điền trước 8:55 để tránh mail nhắc nhở
- **Thật lòng**: Ghi blocker thực sự (team lead sẽ help)

### ❌ Tránh
- ❌ Copy-paste từ hôm trước
- ❌ Quá vắn tắt ("làm code" - không cụ thể)
- ❌ Quá chi tiết (viết từng dòng code)
- ❌ Để trống các phần

---

## 🔧 Troubleshooting

### ❓ **Không nhận được email ở 8:45?**
1. Kiểm tra spam/junk folder
2. Liên hệ team lead
3. Có thể tự vào Notion database "Standup Log" → tìm page của bạn ngày hôm nay

### ❓ **Không tìm thấy Notion page?**
1. Mở Notion workspace
2. Tìm database "Standup Log"
3. Tìm page của bạn (search theo tên hoặc ngày hôm nay)

### ❓ **Quên điền standup?**
- Không sao! Có thể điền bất cứ lúc nào
- Nhưng khi tổng hợp (9:00), page của bạn sẽ được đánh dấu "chưa điền"

### ❓ **Có blocker nhưng không muốn mention trong standup?**
- Hãy mention riêng với team lead
- Blocker trong standup là để cả team biết & hỗ trợ

---

## 📞 Cần giúp?
- **Hỏi Team Lead** hoặc **@Standup Bot** trong Slack
- Hoặc reply email standup trực tiếp

---

**Happy standup! 🚀**
