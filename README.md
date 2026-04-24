# Standup Bot (Notion)

Team đã dùng Notion làm workspace chính, muốn standup được ghi nhận và lưu trữ thẳng vào Notion — có thể tra cứu lại theo ngày, theo người, không cần thêm tool mới.

## Deployment trên Railway

### Cấu hình Persistent Volume
1. Tìm project trên Railway dashboard
2. Vào trang settings của service
3. Thêm persistent volume:
   - Path: `/data`
   - Size: 1GB (hoặc tùy ý)
4. Sau khi thêm volume, redeploy application

### Environment Variables trên Railway
Ngoài các biến standard (`NOTION_API_KEY`, `SMTP_*`), thêm:
- `NODE_ENV=production` (để app sử dụng persistent volume)
- `MEMBERS_FILE_PATH=/data/members.json` (tuỳ chọn, để rõ ràng)
