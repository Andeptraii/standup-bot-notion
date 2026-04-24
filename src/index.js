require('dotenv').config();
const app = require('./app');
const { startScheduler } = require('./jobs/scheduler');

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại port ${PORT}`);
    });

    startScheduler();
    console.log('Cron jobs đã được khởi động');
  } catch (err) {
    console.error('Lỗi khởi động server:', err);
    process.exit(1);
  }
}

main();
