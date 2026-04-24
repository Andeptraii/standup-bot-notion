const cron = require('node-cron');
const { generateDailyPages } = require('../services/dailyStandup');
const { checkAndRemind } = require('../services/reminder');
const { aggregateStandups } = require('../services/summary');
const logger = require('../utils/logger');

const TIMEZONE = process.env.TZ || 'Asia/Ho_Chi_Minh';

function startScheduler() {
  // 8:45 Thứ 2 - Thứ 6: Tạo standup pages và gửi email mời
  cron.schedule(
    '45 8 * * 1-5',
    async () => {
      logger.info('Cron 8:45 — Bắt đầu tạo standup pages');
      try {
        const results = await generateDailyPages();
        logger.info('Cron 8:45 — Hoàn thành', { count: results.length });
      } catch (err) {
        logger.error('Cron 8:45 — Lỗi', { error: err.message });
      }
    },
    { timezone: TIMEZONE }
  );

  // 8:55 Thứ 2 - Thứ 6: Kiểm tra và nhắc nhở
  cron.schedule(
    '55 8 * * 1-5',
    async () => {
      logger.info('Cron 8:55 — Bắt đầu kiểm tra standup chưa điền');
      try {
        const result = await checkAndRemind();
        logger.info('Cron 8:55 — Hoàn thành', result);
      } catch (err) {
        logger.error('Cron 8:55 — Lỗi', { error: err.message });
      }
    },
    { timezone: TIMEZONE }
  );

  // 9:00 Thứ 2 - Thứ 6: Tổng hợp summary
  cron.schedule(
    '0 9 * * 1-5',
    async () => {
      logger.info('Cron 9:00 — Bắt đầu tổng hợp standup');
      try {
        const result = await aggregateStandups();
        logger.info('Cron 9:00 — Hoàn thành', result);
      } catch (err) {
        logger.error('Cron 9:00 — Lỗi', { error: err.message });
      }
    },
    { timezone: TIMEZONE }
  );

  logger.info('Scheduler đã khởi động', { timezone: TIMEZONE });
}

module.exports = { startScheduler };
