const { Client } = require('@notionhq/client');
const logger = require('../utils/logger');

const RETRY_DELAYS = [1000, 2000, 4000];

class NotionServiceError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'NotionServiceError';
    this.code = code;
  }
}

class NotionService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new NotionServiceError('NOTION_API_KEY chưa được cấu hình', 'MISSING_API_KEY');
    }
    this.client = new Client({ auth: apiKey });
  }

  async _withRetry(fn) {
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      try {
        return await fn();
      } catch (err) {
        const isRateLimit = err.status === 429 || err.code === 'rate_limited';
        const isUnauthorized = err.status === 401;
        const isForbidden = err.status === 403;

        if (isUnauthorized || isForbidden) {
          throw new NotionServiceError(
            'API key không hợp lệ hoặc thiếu quyền truy cập',
            'UNAUTHORIZED'
          );
        }

        if (isRateLimit && attempt < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attempt];
          logger.warn(`Notion API rate limit, thử lại sau ${delay}ms (lần ${attempt + 1})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw err;
      }
    }
  }

  async createPage(databaseId, properties, children = []) {
    return this._withRetry(() =>
      this.client.pages.create({
        parent: { database_id: databaseId },
        properties,
        children,
      })
    );
  }

  async queryDatabase(databaseId, filter = {}) {
    const params = { database_id: databaseId };
    if (Object.keys(filter).length) {
      params.filter = filter;
    }
    return this._withRetry(() => this.client.databases.query(params));
  }

  async getDatabaseSchema(databaseId) {
    return this._withRetry(() => this.client.databases.retrieve({ database_id: databaseId }));
  }

  async getPageBlocks(pageId) {
    return this._withRetry(() => this.client.blocks.children.list({ block_id: pageId }));
  }

  async appendBlocks(pageId, children) {
    return this._withRetry(() =>
      this.client.blocks.children.append({ block_id: pageId, children })
    );
  }

  async updatePage(pageId, properties) {
    return this._withRetry(() => this.client.pages.update({ page_id: pageId, properties }));
  }
}

let instance = null;

function getNotionService() {
  if (!instance) {
    instance = new NotionService(process.env.NOTION_API_KEY);
  }
  return instance;
}

module.exports = { NotionService, NotionServiceError, getNotionService };
