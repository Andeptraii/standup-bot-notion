const { NotionService, NotionServiceError } = require('../services/notion');

jest.mock('@notionhq/client');
const { Client } = require('@notionhq/client');

describe('NotionService', () => {
  let service;
  let mockPages;
  let mockDatabases;
  let mockBlocks;

  beforeEach(() => {
    mockPages = { create: jest.fn(), update: jest.fn() };
    mockDatabases = { query: jest.fn(), retrieve: jest.fn() };
    mockBlocks = { children: { list: jest.fn(), append: jest.fn() } };

    Client.mockImplementation(() => ({
      pages: mockPages,
      databases: mockDatabases,
      blocks: mockBlocks,
    }));

    service = new NotionService('test_api_key');
  });

  describe('constructor', () => {
    it('phải throw lỗi nếu thiếu API key', () => {
      expect(() => new NotionService('')).toThrow(NotionServiceError);
      expect(() => new NotionService(null)).toThrow(NotionServiceError);
    });

    it('phải khởi tạo Notion Client với API key', () => {
      expect(Client).toHaveBeenCalledWith({ auth: 'test_api_key' });
    });
  });

  describe('createPage', () => {
    it('phải gọi notion.pages.create với đúng tham số', async () => {
      const mockPage = { id: 'page-123', url: 'https://notion.so/page-123' };
      mockPages.create.mockResolvedValue(mockPage);

      const result = await service.createPage('db-id', { Name: 'Test' }, []);

      expect(mockPages.create).toHaveBeenCalledWith({
        parent: { database_id: 'db-id' },
        properties: { Name: 'Test' },
        children: [],
      });
      expect(result).toBe(mockPage);
    });

    it('phải throw NotionServiceError khi API key không hợp lệ (401)', async () => {
      const authError = new Error('Unauthorized');
      authError.status = 401;
      mockPages.create.mockRejectedValue(authError);

      await expect(service.createPage('db-id', {})).rejects.toThrow(NotionServiceError);
    });

    it('phải throw NotionServiceError khi thiếu quyền (403)', async () => {
      const forbiddenErr = new Error('Forbidden');
      forbiddenErr.status = 403;
      mockPages.create.mockRejectedValue(forbiddenErr);

      await expect(service.createPage('db-id', {})).rejects.toThrow(NotionServiceError);
    });
  });

  describe('queryDatabase', () => {
    it('phải gọi notion.databases.query với filter', async () => {
      const mockResult = { results: [] };
      mockDatabases.query.mockResolvedValue(mockResult);

      const filter = { property: 'Date', date: { equals: '2024-01-01' } };
      const result = await service.queryDatabase('db-id', filter);

      expect(mockDatabases.query).toHaveBeenCalledWith({ database_id: 'db-id', filter });
      expect(result).toBe(mockResult);
    });

    it('phải gọi query không có filter khi filter rỗng', async () => {
      mockDatabases.query.mockResolvedValue({ results: [] });
      await service.queryDatabase('db-id', {});
      expect(mockDatabases.query).toHaveBeenCalledWith({ database_id: 'db-id' });
    });

    it('phải retry khi gặp rate limit (429)', async () => {
      const rateLimitErr = new Error('Rate limited');
      rateLimitErr.status = 429;
      mockDatabases.query
        .mockRejectedValueOnce(rateLimitErr)
        .mockResolvedValue({ results: [{ id: 'ok' }] });

      jest.useFakeTimers();
      const queryPromise = service.queryDatabase('db-id', {});
      await jest.runAllTimersAsync();
      const result = await queryPromise;

      expect(result.results).toHaveLength(1);
      expect(mockDatabases.query).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });
  });

  describe('getPageBlocks', () => {
    it('phải gọi blocks.children.list với pageId', async () => {
      mockBlocks.children.list.mockResolvedValue({ results: [] });
      await service.getPageBlocks('page-id');
      expect(mockBlocks.children.list).toHaveBeenCalledWith({ block_id: 'page-id' });
    });
  });

  describe('appendBlocks', () => {
    it('phải gọi blocks.children.append', async () => {
      mockBlocks.children.append.mockResolvedValue({});
      await service.appendBlocks('page-id', []);
      expect(mockBlocks.children.append).toHaveBeenCalledWith({
        block_id: 'page-id',
        children: [],
      });
    });
  });
});
