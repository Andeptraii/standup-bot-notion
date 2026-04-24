const { getNotionService } = require('../services/notion');
const logger = require('./logger');

const REQUIRED_PROPERTIES = [
  { name: 'Name', type: 'title' },
  { name: 'Date', type: 'date' },
  { name: 'Assignee', type: 'people' },
  { name: 'Status', type: 'select' },
];

async function validateNotionDatabase(databaseId) {
  const notion = getNotionService();
  let db;

  try {
    db = await notion.getDatabaseSchema(databaseId);
  } catch (err) {
    throw new Error(`Không thể kết nối Notion Database: ${err.message}`);
  }

  const props = db.properties || {};
  const missing = [];

  for (const required of REQUIRED_PROPERTIES) {
    const found = props[required.name];
    if (!found) {
      missing.push(`"${required.name}" (${required.type})`);
      continue;
    }
    if (found.type !== required.type) {
      missing.push(
        `"${required.name}" phải là type "${required.type}" nhưng tìm thấy "${found.type}"`
      );
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Notion Database thiếu các property bắt buộc:\n${missing.map((m) => `  - ${m}`).join('\n')}`
    );
  }

  logger.info('Notion Database schema hợp lệ', { databaseId });
  return true;
}

module.exports = { validateNotionDatabase, REQUIRED_PROPERTIES };
