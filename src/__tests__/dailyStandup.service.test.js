jest.mock('../services/notion');
jest.mock('../services/member');
jest.mock('../services/email');

const { getNotionService } = require('../services/notion');
const { MemberService } = require('../services/member');
const { EmailService } = require('../services/email');
const { generateDailyPages, buildStandupBlocks } = require('../services/dailyStandup');

const mockMembers = [
  { name: 'An Nguyen', email: 'an@nexlab.tech', notionId: 'notion-an' },
  { name: 'Binh Tran', email: 'binh@nexlab.tech', notionId: 'notion-binh' },
];

describe('generateDailyPages', () => {
  let mockNotion;

  beforeEach(() => {
    process.env.NOTION_STANDUP_DB_ID = 'db-standup-id';

    mockNotion = {
      createPage: jest.fn().mockImplementation((_dbId, props) => {
        const title = props.Name.title[0].text.content;
        return Promise.resolve({ id: `page-${title}`, url: `https://notion.so/page-${title}` });
      }),
    };
    getNotionService.mockReturnValue(mockNotion);
    MemberService.getMembers.mockReturnValue(mockMembers);
    EmailService.sendMorningInvite = jest.fn().mockResolvedValue(undefined);
  });

  it('phải gọi createPage đúng 2 lần cho 2 members', async () => {
    await generateDailyPages(new Date('2024-01-15'));
    expect(mockNotion.createPage).toHaveBeenCalledTimes(2);
  });

  it('phải tạo page với title đúng format [Standup] YYYY-MM-DD - {Name}', async () => {
    await generateDailyPages(new Date('2024-01-15'));

    const firstCall = mockNotion.createPage.mock.calls[0];
    const title = firstCall[1].Name.title[0].text.content;
    expect(title).toBe('[Standup] 2024-01-15 - An Nguyen');
  });

  it('phải gán đúng property Assignee với notionId của member', async () => {
    await generateDailyPages(new Date('2024-01-15'));

    const firstCall = mockNotion.createPage.mock.calls[0];
    expect(firstCall[1].Assignee.people[0].id).toBe('notion-an');
  });

  it('phải gán Status là "To Do"', async () => {
    await generateDailyPages(new Date('2024-01-15'));
    const firstCall = mockNotion.createPage.mock.calls[0];
    expect(firstCall[1].Status.select.name).toBe('To Do');
  });

  it('phải gọi sendMorningInvite cho mỗi member', async () => {
    await generateDailyPages(new Date('2024-01-15'));
    expect(EmailService.sendMorningInvite).toHaveBeenCalledTimes(2);
  });

  it('phải trả về mảng rỗng khi không có member', async () => {
    MemberService.getMembers.mockReturnValue([]);
    const results = await generateDailyPages();
    expect(results).toEqual([]);
    expect(mockNotion.createPage).not.toHaveBeenCalled();
  });
});

describe('buildStandupBlocks', () => {
  it('phải tạo 6 blocks (3 heading + 3 paragraph)', () => {
    const blocks = buildStandupBlocks();
    expect(blocks).toHaveLength(6);
  });

  it('phải có heading cho Hôm qua, Hôm nay, Blocker', () => {
    const blocks = buildStandupBlocks();
    const headings = blocks
      .filter((b) => b.type === 'heading_2')
      .map((b) => b.heading_2.rich_text[0].text.content);
    expect(headings).toEqual(['Hôm qua', 'Hôm nay', 'Blocker']);
  });
});
