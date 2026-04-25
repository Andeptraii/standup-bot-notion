const { getNotionService } = require('./notion');
const { MemberService } = require('./member');
const { EmailService } = require('./email');
const logger = require('../utils/logger');

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function buildStandupBlocks() {
  const sections = ['Hôm qua', 'Hôm nay', 'Blocker'];
  const blocks = [];
  for (const section of sections) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: section } }],
      },
    });
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: '' } }],
      },
    });
  }
  return blocks;
}

async function generateDailyPages(date = new Date()) {
  const notion = getNotionService();
  const dbId = process.env.NOTION_STANDUP_DB_ID;
  const dateStr = formatDate(date);
  const members = await MemberService.getMembers();

  if (members.length === 0) {
    logger.warn('Không có member nào trong danh sách, bỏ qua tạo standup pages');
    return [];
  }

  const results = [];

  for (const member of members) {
    try {
      const title = `[Standup] ${dateStr} - ${member.name}`;
      const properties = {
        Name: {
          title: [{ text: { content: title } }],
        },
        Date: {
          date: { start: dateStr },
        },
        Assignee: {
          people: [{ id: member.notionId }],
        },
        Status: {
          select: { name: 'To Do' },
        },
      };

      const page = await notion.createPage(dbId, properties, buildStandupBlocks());
      logger.info(`Tạo standup page thành công`, { member: member.name, pageId: page.id });

      try {
        await EmailService.sendMorningInvite(member.email, member.name, page.url);
      } catch (emailErr) {
        logger.error(`Gửi email mời thất bại cho ${member.name}`, { error: emailErr.message });
      }

      results.push({ member: member.name, pageId: page.id, pageUrl: page.url });
    } catch (err) {
      logger.error(`Tạo standup page thất bại cho ${member.name}`, { error: err.message });
      results.push({ member: member.name, error: err.message });
    }
  }

  return results;
}

module.exports = { generateDailyPages, buildStandupBlocks, formatDate };
