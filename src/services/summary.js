const { getNotionService } = require('./notion');
const { formatDate } = require('./dailyStandup');
const logger = require('../utils/logger');

const SECTION_KEYS = ['Hôm qua', 'Hôm nay', 'Blocker'];

function buildRichText(content, { bold = false, color = 'default' } = {}) {
  return { type: 'text', text: { content }, annotations: { bold, color } };
}

function buildTableRow(cells) {
  return { object: 'block', type: 'table_row', table_row: { cells } };
}

function extractTextFromBlocks(blocks) {
  const sections = { 'Hôm qua': [], 'Hôm nay': [], Blocker: [] };
  let currentSection = null;

  for (const block of blocks) {
    if (block.type === 'heading_2') {
      const text = block.heading_2?.rich_text?.map((r) => r.plain_text).join('') || '';
      if (SECTION_KEYS.includes(text)) {
        currentSection = text;
      }
      continue;
    }

    if (currentSection && block.type === 'paragraph') {
      const text = block.paragraph?.rich_text
        ?.map((r) => r.plain_text)
        .join('')
        .trim();
      if (text) {
        sections[currentSection].push(text);
      }
    }
  }

  return sections;
}

function getMemberName(page) {
  const titleProp = page.properties?.Name?.title;
  if (!titleProp || titleProp.length === 0) return 'Unknown';
  const fullTitle = titleProp.map((t) => t.plain_text).join('');
  const match = fullTitle.match(/\[Standup\] \d{4}-\d{2}-\d{2} - (.+)/);
  return match ? match[1] : fullTitle;
}

function buildSummaryBlocks(dateStr, memberSummaries) {
  const blocks = [
    {
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [{ type: 'text', text: { content: `📋 Standup Summary — ${dateStr}` } }],
      },
    },
    {
      object: 'block',
      type: 'divider',
      divider: {},
    },
  ];

  const headerRow = buildTableRow([
    [buildRichText('Thành viên', { bold: true })],
    [buildRichText('Hôm qua', { bold: true })],
    [buildRichText('Hôm nay', { bold: true })],
    [buildRichText('Blocker', { bold: true })],
  ]);

  const dataRows = memberSummaries.map(({ name, sections }) => {
    const homQua = sections['Hôm qua'].join('\n') || '(chưa điền)';
    const homNay = sections['Hôm nay'].join('\n') || '(chưa điền)';
    const blocker = sections['Blocker'].join('\n') || '(chưa điền)';
    const hasBlocker = sections['Blocker'].length > 0;

    return buildTableRow([
      [buildRichText(name)],
      [buildRichText(homQua)],
      [buildRichText(homNay)],
      [buildRichText(blocker, { color: hasBlocker ? 'red' : 'default' })],
    ]);
  });

  blocks.push({
    object: 'block',
    type: 'table',
    table: {
      table_width: 4,
      has_column_header: true,
      has_row_header: false,
      children: [headerRow, ...dataRows]
    },
  });

  return blocks;
}

async function fetchSummaryData(date = new Date()) {
  const notion = getNotionService();
  const dbId = process.env.NOTION_STANDUP_DB_ID;
  const dateStr = formatDate(date);

  const response = await notion.queryDatabase(dbId, {
    property: 'Date',
    date: { equals: dateStr },
  });

  const pages = response.results;
  logger.info(`Tổng hợp standup cho ${pages.length} member`, { date: dateStr });

  const members = [];

  for (const page of pages) {
    const name = getMemberName(page);
    try {
      const blocksResponse = await notion.getPageBlocks(page.id);
      const sections = extractTextFromBlocks(blocksResponse.results);
      members.push({ name, sections });
    } catch (err) {
      logger.error(`Không đọc được blocks của ${name}`, { error: err.message });
      members.push({
        name,
        sections: { 'Hôm qua': [], 'Hôm nay': [], Blocker: [] },
      });
    }
  }

  return { date: dateStr, members };
}

async function aggregateStandups(date = new Date()) {
  const notion = getNotionService();
  const summaryPageId = process.env.NOTION_SUMMARY_PAGE_ID;

  const { date: dateStr, members } = await fetchSummaryData(date);

  const summaryBlocks = buildSummaryBlocks(dateStr, members);

  await notion.appendBlocks(summaryPageId, summaryBlocks);
  logger.info(`Đã tạo summary page cho ngày ${dateStr}`);

  return { date: dateStr, memberCount: members.length };
}

module.exports = { aggregateStandups, fetchSummaryData, extractTextFromBlocks, buildSummaryBlocks, getMemberName };
