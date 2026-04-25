const { getNotionService } = require('./notion');
const { MemberService } = require('./member');
const { EmailService } = require('./email');
const { formatDate } = require('./dailyStandup');
const logger = require('../utils/logger');

async function checkAndRemind(date = new Date()) {
  const notion = getNotionService();
  const dbId = process.env.NOTION_STANDUP_DB_ID;

  if (!dbId) {
    throw new Error('NOTION_STANDUP_DB_ID chưa được cấu hình');
  }

  const dateStr = formatDate(date);

  const response = await notion.queryDatabase(dbId, {
    and: [
      { property: 'Date', date: { equals: dateStr } },
      { property: 'Status', select: { equals: 'To Do' } },
    ],
  });

  const unfilledPages = response.results;
  logger.info(`Tìm thấy ${unfilledPages.length} standup chưa điền`, { date: dateStr });

  const remindedCount = { success: 0, failed: 0, skipped: 0 };

  for (const page of unfilledPages) {
    const assigneeProp = page.properties?.Assignee?.people;
    if (!assigneeProp || assigneeProp.length === 0) {
      remindedCount.skipped++;
      continue;
    }

    const notionUserId = assigneeProp[0].id;
    const member = MemberService.getMemberByNotionId(notionUserId);

    if (!member) {
      logger.warn(`Không tìm thấy member với notionId ${notionUserId}`);
      remindedCount.skipped++;
      continue;
    }

    try {
      await EmailService.sendReminder(member.email, member.name, page.url);
      remindedCount.success++;
      logger.info(`Đã nhắc nhở ${member.name}`, { pageId: page.id });
    } catch (err) {
      remindedCount.failed++;
      logger.error(`Nhắc nhở thất bại cho ${member.name}`, { error: err.message });
    }
  }

  logger.info('Hoàn thành kiểm tra và nhắc nhở', remindedCount);
  return { date: dateStr, unfilled: unfilledPages.length, ...remindedCount };
}

module.exports = { checkAndRemind };
