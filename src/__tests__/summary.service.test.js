jest.mock('../services/notion');

const { getNotionService } = require('../services/notion');
const {
  aggregateStandups,
  extractTextFromBlocks,
  buildSummaryBlocks,
  getMemberName,
  fetchSummaryData,
} = require('../services/summary');

const makeStandupPage = (name, date = '2024-01-15') => ({
  id: `page-${name}`,
  url: `https://notion.so/page-${name}`,
  properties: {
    Name: { title: [{ plain_text: `[Standup] ${date} - ${name}` }] },
  },
});

const makeBlocks = (yesterday, today, blocker) => [
  { type: 'heading_2', heading_2: { rich_text: [{ plain_text: 'Hôm qua' }] } },
  { type: 'paragraph', paragraph: { rich_text: [{ plain_text: yesterday }] } },
  { type: 'heading_2', heading_2: { rich_text: [{ plain_text: 'Hôm nay' }] } },
  { type: 'paragraph', paragraph: { rich_text: [{ plain_text: today }] } },
  { type: 'heading_2', heading_2: { rich_text: [{ plain_text: 'Blocker' }] } },
  { type: 'paragraph', paragraph: { rich_text: [{ plain_text: blocker }] } },
];

describe('extractTextFromBlocks', () => {
  it('phải trích xuất text đúng theo từng section', () => {
    const blocks = makeBlocks('Làm task A', 'Làm task B', 'Bị block bởi devops');
    const result = extractTextFromBlocks(blocks);
    expect(result['Hôm qua']).toEqual(['Làm task A']);
    expect(result['Hôm nay']).toEqual(['Làm task B']);
    expect(result['Blocker']).toEqual(['Bị block bởi devops']);
  });

  it('phải bỏ qua paragraph rỗng', () => {
    const blocks = makeBlocks('', 'Task hôm nay', '');
    const result = extractTextFromBlocks(blocks);
    expect(result['Hôm qua']).toEqual([]);
    expect(result['Blocker']).toEqual([]);
  });
});

describe('getMemberName', () => {
  it('phải trích xuất tên từ title', () => {
    const page = makeStandupPage('An Nguyen');
    expect(getMemberName(page)).toBe('An Nguyen');
  });
});

describe('fetchSummaryData', () => {
  let mockNotion;

  beforeEach(() => {
    process.env.NOTION_STANDUP_DB_ID = 'db-id';

    mockNotion = {
      queryDatabase: jest.fn(),
      getPageBlocks: jest.fn(),
    };
    getNotionService.mockReturnValue(mockNotion);
  });

  it('phải fetch standup data cho ngày chỉ định và trả { date, members }', async () => {
    const pages = ['An', 'Binh'].map((name) => makeStandupPage(name, '2024-01-15'));
    mockNotion.queryDatabase.mockResolvedValue({ results: pages });
    mockNotion.getPageBlocks.mockResolvedValue({
      results: makeBlocks('task A', 'task B', ''),
    });

    const result = await fetchSummaryData(new Date('2024-01-15'));

    expect(result.date).toBe('2024-01-15');
    expect(result.members).toHaveLength(2);
    expect(result.members[0].name).toBe('An');
    expect(result.members[0].sections).toEqual({
      'Hôm qua': ['task A'],
      'Hôm nay': ['task B'],
      'Blocker': [],
    });
  });

  it('phải trả empty members array khi không có standup cho ngày đó', async () => {
    mockNotion.queryDatabase.mockResolvedValue({ results: [] });

    const result = await fetchSummaryData(new Date('2024-01-15'));

    expect(result.date).toBe('2024-01-15');
    expect(result.members).toEqual([]);
  });

  it('phải handle lỗi khi getPageBlocks fail cho 1 member', async () => {
    const pages = ['An', 'Binh'].map((name) => makeStandupPage(name, '2024-01-15'));
    mockNotion.queryDatabase.mockResolvedValue({ results: pages });
    mockNotion.getPageBlocks
      .mockResolvedValueOnce({ results: makeBlocks('task A', 'task B', '') })
      .mockRejectedValueOnce(new Error('Notion API error'));

    const result = await fetchSummaryData(new Date('2024-01-15'));

    expect(result.members).toHaveLength(2);
    expect(result.members[0].sections).toEqual({
      'Hôm qua': ['task A'],
      'Hôm nay': ['task B'],
      'Blocker': [],
    });
    expect(result.members[1].sections).toEqual({
      'Hôm qua': [],
      'Hôm nay': [],
      'Blocker': [],
    });
  });
});

describe('buildSummaryBlocks', () => {
  it('phải tạo đúng 1 table block', () => {
    const summaries = [
      { name: 'An', sections: { 'Hôm qua': ['task A'], 'Hôm nay': ['task B'], Blocker: [] } },
    ];
    const blocks = buildSummaryBlocks('2024-01-15', summaries);
    const tables = blocks.filter((b) => b.type === 'table');
    expect(tables).toHaveLength(1);
  });

  it('phải tạo table với table_width: 4', () => {
    const summaries = [
      { name: 'An', sections: { 'Hôm qua': ['task A'], 'Hôm nay': ['task B'], Blocker: [] } },
    ];
    const blocks = buildSummaryBlocks('2024-01-15', summaries);
    const table = blocks.find((b) => b.type === 'table');
    expect(table.table.table_width).toBe(4);
  });

  it('phải tạo table với has_column_header: true', () => {
    const summaries = [
      { name: 'An', sections: { 'Hôm qua': ['task A'], 'Hôm nay': ['task B'], Blocker: [] } },
    ];
    const blocks = buildSummaryBlocks('2024-01-15', summaries);
    const table = blocks.find((b) => b.type === 'table');
    expect(table.table.has_column_header).toBe(true);
  });

  it('header row phải có 4 bold cells với label cột', () => {
    const summaries = [
      { name: 'An', sections: { 'Hôm qua': ['task A'], 'Hôm nay': ['task B'], Blocker: [] } },
    ];
    const blocks = buildSummaryBlocks('2024-01-15', summaries);
    const table = blocks.find((b) => b.type === 'table');
    const headerRow = table.children[0];
    expect(headerRow.type).toBe('table_row');
    expect(headerRow.table_row.cells).toHaveLength(4);
    expect(headerRow.table_row.cells[0][0].text.content).toBe('Thành viên');
    expect(headerRow.table_row.cells[1][0].text.content).toBe('Hôm qua');
    expect(headerRow.table_row.cells[2][0].text.content).toBe('Hôm nay');
    expect(headerRow.table_row.cells[3][0].text.content).toBe('Blocker');
    headerRow.table_row.cells.forEach((cell) => {
      expect(cell[0].annotations.bold).toBe(true);
    });
  });

  it('phải tạo 1 data row cho mỗi member', () => {
    const summaries = [
      { name: 'An', sections: { 'Hôm qua': ['task A'], 'Hôm nay': ['task B'], Blocker: [] } },
      { name: 'Binh', sections: { 'Hôm qua': [], 'Hôm nay': ['task C'], Blocker: ['JIRA-123'] } },
    ];
    const blocks = buildSummaryBlocks('2024-01-15', summaries);
    const table = blocks.find((b) => b.type === 'table');
    // 1 header row + 2 data rows
    expect(table.children).toHaveLength(3);
  });

  it('phải highlight đỏ cell Blocker khi có nội dung', () => {
    const summaries = [
      { name: 'Binh', sections: { 'Hôm qua': [], 'Hôm nay': [], Blocker: ['JIRA-123'] } },
    ];
    const blocks = buildSummaryBlocks('2024-01-15', summaries);
    const table = blocks.find((b) => b.type === 'table');
    const dataRow = table.children[1]; // first data row (after header)
    const blockerCell = dataRow.table_row.cells[3]; // 4th column
    expect(blockerCell[0].annotations.color).toBe('red');
  });

  it('phải hiển thị (chưa điền) cho cell rỗng', () => {
    const summaries = [
      { name: 'An', sections: { 'Hôm qua': [], 'Hôm nay': [], Blocker: [] } },
    ];
    const blocks = buildSummaryBlocks('2024-01-15', summaries);
    const table = blocks.find((b) => b.type === 'table');
    const dataRow = table.children[1];
    expect(dataRow.table_row.cells[1][0].text.content).toBe('(chưa điền)'); // hôm qua
    expect(dataRow.table_row.cells[2][0].text.content).toBe('(chưa điền)'); // hôm nay
    expect(dataRow.table_row.cells[3][0].text.content).toBe('(chưa điền)'); // blocker
  });

  it('heading_1 và divider vẫn phải là 2 block đầu', () => {
    const summaries = [
      { name: 'An', sections: { 'Hôm qua': ['task A'], 'Hôm nay': ['task B'], Blocker: [] } },
    ];
    const blocks = buildSummaryBlocks('2024-01-15', summaries);
    expect(blocks[0].type).toBe('heading_1');
    expect(blocks[1].type).toBe('divider');
  });

  it('empty memberSummaries phải vẫn có 1 header row', () => {
    const summaries = [];
    const blocks = buildSummaryBlocks('2024-01-15', summaries);
    const table = blocks.find((b) => b.type === 'table');
    expect(table.children).toHaveLength(1); // header row only
  });
});

describe('aggregateStandups', () => {
  let mockNotion;

  beforeEach(() => {
    process.env.NOTION_STANDUP_DB_ID = 'db-id';
    process.env.NOTION_SUMMARY_PAGE_ID = 'summary-page-id';

    mockNotion = {
      queryDatabase: jest.fn(),
      getPageBlocks: jest.fn(),
      appendBlocks: jest.fn().mockResolvedValue({}),
    };
    getNotionService.mockReturnValue(mockNotion);
  });

  it('phải tổng hợp 3 standup pages và append vào summary page', async () => {
    const pages = ['An', 'Binh', 'Cuong'].map(makeStandupPage);
    mockNotion.queryDatabase.mockResolvedValue({ results: pages });
    mockNotion.getPageBlocks.mockResolvedValue({
      results: makeBlocks('task hôm qua', 'task hôm nay', ''),
    });

    const result = await aggregateStandups(new Date('2024-01-15'));

    expect(mockNotion.getPageBlocks).toHaveBeenCalledTimes(3);
    expect(mockNotion.appendBlocks).toHaveBeenCalledTimes(1);
    expect(mockNotion.appendBlocks).toHaveBeenCalledWith('summary-page-id', expect.any(Array));
    expect(result.memberCount).toBe(3);
  });
});
