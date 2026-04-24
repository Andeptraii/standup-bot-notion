#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { Client } = require('@notionhq/client');

async function setupDatabase() {
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    console.error('\n❌ Lỗi: NOTION_API_KEY chưa được cấu hình');
    console.error(
      '\n📝 Thêm vào .env của bạn:\nNOTION_API_KEY=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\n'
    );
    process.exit(1);
  }

  const notion = new Client({ auth: apiKey });

  try {
    console.log('\n🚀 Bắt đầu setup Standup Bot Database...\n');

    const parentPageId = '3499f6069a6a809884c8e7bc6a4fd66b';
    console.log(`📁 Sử dụng parent page: ${parentPageId}\n`);

    // 1. Tạo Database "Standup Log"
    console.log('📋 Đang tạo Database "Standup Log"...');
    const dbResponse = await notion.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Standup Log' } }],
      properties: {
        Name: {
          title: {},
        },
        Date: {
          date: {},
        },
        Assignee: {
          people: {},
        },
        Status: {
          select: {
            options: [
              { name: 'To Do', color: 'red' },
              { name: 'Done', color: 'green' },
            ],
          },
        },
      },
    });

    const databaseId = dbResponse.id;
    console.log(`✅ Database tạo thành công!\n`);
    console.log(`   📌 Database ID: ${databaseId}\n`);

    // 2. Tạo Summary Page
    console.log('📄 Đang tạo Summary Page "📋 Standup Summary"...');
    const pageResponse = await notion.pages.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [
        {
          type: 'text',
          text: { content: '📋 Standup Summary' },
        },
      ],
    });

    const pageId = pageResponse.id;
    console.log(`✅ Summary Page tạo thành công!\n`);
    console.log(`   📌 Page ID: ${pageId}\n`);

    // 3. Hiển thị output
    console.log('=' + '='.repeat(59));
    console.log('✨ SETUP HOÀN TẤT! Thêm vào file .env của bạn:\n');
    console.log(`NOTION_STANDUP_DB_ID=${databaseId}`);
    console.log(`NOTION_SUMMARY_PAGE_ID=${pageId}`);
    console.log('\n' + '='.repeat(60));

    console.log('\n📚 Bước tiếp theo:\n');
    console.log('1️⃣  Copy 2 dòng trên vào file .env');
    console.log('2️⃣  Chạy test: npm test');
    console.log('3️⃣  Hoặc chạy dev: npm run dev\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Lỗi tạo Database:', err.message, '\n');

    if (err.status === 401) {
      console.error('   → NOTION_API_KEY không hợp lệ');
      console.error('   → Vui lòng kiểm tra lại token\n');
    } else if (err.status === 403) {
      console.error('   → Không có quyền truy cập workspace');
      console.error('   → Vui lòng kiểm tra quyền của Integration\n');
    } else if (err.code === 'notionhq_client_request_timeout') {
      console.error('   → Timeout: Notion API không phản hồi');
      console.error('   → Vui lòng thử lại sau\n');
    }

    process.exit(1);
  }
}

setupDatabase();
