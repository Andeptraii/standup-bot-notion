jest.mock('../services/notion');

const { getNotionService } = require('../services/notion');
const { validateNotionDatabase, REQUIRED_PROPERTIES } = require('../utils/schemaValidator');

const buildMockDb = (overrides = {}) => ({
  properties: {
    Name: { type: 'title' },
    Date: { type: 'date' },
    Assignee: { type: 'people' },
    Status: { type: 'select' },
    ...overrides,
  },
});

describe('validateNotionDatabase', () => {
  let mockNotion;

  beforeEach(() => {
    mockNotion = { getDatabaseSchema: jest.fn() };
    getNotionService.mockReturnValue(mockNotion);
  });

  it('phải pass khi database có đủ 4 property bắt buộc', async () => {
    mockNotion.getDatabaseSchema.mockResolvedValue(buildMockDb());
    await expect(validateNotionDatabase('db-id')).resolves.toBe(true);
  });

  it('phải throw lỗi khi thiếu property Name', async () => {
    mockNotion.getDatabaseSchema.mockResolvedValue(buildMockDb({ Name: undefined }));
    await expect(validateNotionDatabase('db-id')).rejects.toThrow('Name');
  });

  it('phải throw lỗi khi thiếu property Date', async () => {
    mockNotion.getDatabaseSchema.mockResolvedValue(buildMockDb({ Date: undefined }));
    await expect(validateNotionDatabase('db-id')).rejects.toThrow('Date');
  });

  it('phải throw lỗi khi property có type sai', async () => {
    mockNotion.getDatabaseSchema.mockResolvedValue(buildMockDb({ Assignee: { type: 'text' } }));
    await expect(validateNotionDatabase('db-id')).rejects.toThrow('Assignee');
  });

  it('phải throw lỗi khi không thể kết nối Notion', async () => {
    mockNotion.getDatabaseSchema.mockRejectedValue(new Error('Network error'));
    await expect(validateNotionDatabase('db-id')).rejects.toThrow('Không thể kết nối');
  });

  it('REQUIRED_PROPERTIES phải có đúng 4 property', () => {
    expect(REQUIRED_PROPERTIES).toHaveLength(4);
    expect(REQUIRED_PROPERTIES.map((p) => p.name)).toEqual(
      expect.arrayContaining(['Name', 'Date', 'Assignee', 'Status'])
    );
  });
});
