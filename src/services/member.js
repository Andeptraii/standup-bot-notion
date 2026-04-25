const { getNotionService } = require('./notion');
const logger = require('../utils/logger');

class MemberValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MemberValidationError';
  }
}

function validateMember(data) {
  const required = ['name', 'email', 'notionId'];
  for (const field of required) {
    if (!data[field] || typeof data[field] !== 'string' || !data[field].trim()) {
      throw new MemberValidationError(`Trường bắt buộc "${field}" bị thiếu hoặc không hợp lệ`);
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new MemberValidationError('Email không hợp lệ');
  }
}

function pageToMember(page) {
  const props = page.properties;
  const name = props.Name?.title?.[0]?.plain_text || '';
  const email = props.Email?.email || '';
  const notionId = props.NotionId?.rich_text?.[0]?.plain_text || '';

  if (!name || !email || !notionId) {
    logger.warn('Bỏ qua member có properties không đầy đủ', { pageId: page.id });
    return null;
  }

  return { name, email, notionId, pageId: page.id };
}

const MemberService = {
  async getMembers() {
    try {
      const notion = getNotionService();
      const dbId = process.env.NOTION_MEMBERS_DB_ID;

      if (!dbId) {
        throw new MemberValidationError('NOTION_MEMBERS_DB_ID chưa được cấu hình');
      }

      const response = await notion.queryDatabase(dbId);
      const members = response.results
        .filter((page) => !page.archived)
        .map((page) => pageToMember(page))
        .filter((m) => m !== null);

      return members;
    } catch (err) {
      logger.error('Lỗi lấy members từ Notion', { error: err.message });
      return [];
    }
  },

  async getMemberByNotionId(notionId) {
    try {
      const members = await this.getMembers();
      return members.find((m) => m.notionId === notionId) || null;
    } catch (err) {
      logger.error('Lỗi tìm member theo notionId', { notionId, error: err.message });
      return null;
    }
  },

  async getMemberByEmail(email) {
    try {
      const members = await this.getMembers();
      return members.find((m) => m.email === email) || null;
    } catch (err) {
      logger.error('Lỗi tìm member theo email', { email, error: err.message });
      return null;
    }
  },

  async addMember(data) {
    try {
      validateMember(data);

      const notion = getNotionService();
      const dbId = process.env.NOTION_MEMBERS_DB_ID;

      if (!dbId) {
        throw new MemberValidationError('NOTION_MEMBERS_DB_ID chưa được cấu hình');
      }

      // Check if member already exists
      const existing = await this.getMemberByNotionId(data.notionId);
      if (existing) {
        throw new MemberValidationError(`Member với notionId "${data.notionId}" đã tồn tại`);
      }

      const newPage = await notion.createPage(dbId, {
        Name: {
          title: [{ text: { content: data.name.trim() } }],
        },
        Email: {
          email: data.email.trim().toLowerCase(),
        },
        NotionId: {
          rich_text: [{ text: { content: data.notionId.trim() } }],
        },
      });

      logger.info('Thêm member mới thành công', { name: data.name, notionId: data.notionId });

      return {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        notionId: data.notionId.trim(),
        pageId: newPage.id,
      };
    } catch (err) {
      if (err instanceof MemberValidationError) throw err;
      logger.error('Lỗi thêm member', { error: err.message });
      throw err;
    }
  },

  async removeMember(notionId) {
    try {
      const member = await this.getMemberByNotionId(notionId);
      if (!member) return false;

      const notion = getNotionService();
      await notion.updatePage(member.pageId, {
        archived: true,
      });

      logger.info('Xóa member thành công', { name: member.name, notionId });
      return true;
    } catch (err) {
      logger.error('Lỗi xóa member', { notionId, error: err.message });
      return false;
    }
  },

  async updateMember(notionId, updates) {
    try {
      const member = await this.getMemberByNotionId(notionId);
      if (!member) return null;

      const updated = { ...member, ...updates, notionId };
      validateMember(updated);

      const notion = getNotionService();
      const properties = {};

      if (updates.name) {
        properties.Name = {
          title: [{ text: { content: updates.name.trim() } }],
        };
      }

      if (updates.email) {
        properties.Email = {
          email: updates.email.trim().toLowerCase(),
        };
      }

      await notion.updatePage(member.pageId, properties);

      logger.info('Cập nhật member thành công', { name: updated.name, notionId });
      return updated;
    } catch (err) {
      if (err instanceof MemberValidationError) throw err;
      logger.error('Lỗi cập nhật member', { notionId, error: err.message });
      throw err;
    }
  },
};

module.exports = { MemberService, MemberValidationError };
