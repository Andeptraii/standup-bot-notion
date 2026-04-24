jest.mock('../services/notion');
jest.mock('../services/member');
jest.mock('../services/email');

const { getNotionService } = require('../services/notion');
const { MemberService } = require('../services/member');
const { EmailService } = require('../services/email');
const { checkAndRemind } = require('../services/reminder');

describe('checkAndRemind', () => {
  let mockNotion;

  beforeEach(() => {
    process.env.NOTION_STANDUP_DB_ID = 'db-standup-id';

    mockNotion = { queryDatabase: jest.fn() };
    getNotionService.mockReturnValue(mockNotion);
    EmailService.sendReminder = jest.fn().mockResolvedValue(undefined);
  });

  it('phải gọi sendReminder chỉ 1 lần cho user chưa điền khi có 1 đã điền và 1 chưa điền', async () => {
    mockNotion.queryDatabase.mockResolvedValue({
      results: [
        {
          id: 'page-unfilled',
          url: 'https://notion.so/page-unfilled',
          properties: {
            Assignee: { people: [{ id: 'notion-binh' }] },
          },
        },
      ],
    });

    MemberService.getMemberByNotionId.mockImplementation((id) => {
      if (id === 'notion-binh')
        return { name: 'Binh', email: 'binh@nexlab.tech', notionId: 'notion-binh' };
      return null;
    });

    const result = await checkAndRemind(new Date('2024-01-15'));

    expect(EmailService.sendReminder).toHaveBeenCalledTimes(1);
    expect(EmailService.sendReminder).toHaveBeenCalledWith(
      'binh@nexlab.tech',
      'Binh',
      'https://notion.so/page-unfilled'
    );
    expect(result.unfilled).toBe(1);
    expect(result.success).toBe(1);
  });

  it('phải không gọi sendReminder khi tất cả đã điền', async () => {
    mockNotion.queryDatabase.mockResolvedValue({ results: [] });

    const result = await checkAndRemind(new Date('2024-01-15'));

    expect(EmailService.sendReminder).not.toHaveBeenCalled();
    expect(result.unfilled).toBe(0);
  });

  it('phải bỏ qua page không có Assignee', async () => {
    mockNotion.queryDatabase.mockResolvedValue({
      results: [
        { id: 'page-1', url: 'https://notion.so/page-1', properties: { Assignee: { people: [] } } },
      ],
    });

    await checkAndRemind();
    expect(EmailService.sendReminder).not.toHaveBeenCalled();
  });
});
