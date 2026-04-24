jest.mock('../services/dailyStandup');
jest.mock('../services/reminder');
jest.mock('../services/summary');

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../app');
const { generateDailyPages } = require('../services/dailyStandup');
const { checkAndRemind } = require('../services/reminder');
const { aggregateStandups, fetchSummaryData } = require('../services/summary');

const MEMBERS_FILE = path.join(__dirname, '..', '..', 'data', 'members.json');
const ADMIN_TOKEN = 'test-token-123';

beforeEach(() => {
  process.env.ADMIN_TOKEN = ADMIN_TOKEN;
  fs.writeFileSync(MEMBERS_FILE, '[]', 'utf-8');
});

afterAll(() => {
  fs.writeFileSync(MEMBERS_FILE, '[]', 'utf-8');
});

function authHeader() {
  return { Authorization: `Bearer ${ADMIN_TOKEN}` };
}

describe('Auth Middleware', () => {
  it('phải trả về 401 khi thiếu token', async () => {
    const res = await request(app).get('/api/members');
    expect(res.status).toBe(401);
  });

  it('phải trả về 403 khi token sai', async () => {
    const res = await request(app).get('/api/members').set('Authorization', 'Bearer wrong-token');
    expect(res.status).toBe(403);
  });
});

describe('GET /api/members', () => {
  it('phải trả về mảng rỗng ban đầu', async () => {
    const res = await request(app).get('/api/members').set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/members', () => {
  it('phải thêm member mới và trả về 201', async () => {
    const res = await request(app)
      .post('/api/members')
      .set(authHeader())
      .send({ name: 'An Nguyen', email: 'an@nexlab.tech', notionId: 'notion-an' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('An Nguyen');
  });

  it('phải trả về 400 khi thiếu thông tin bắt buộc', async () => {
    const res = await request(app).post('/api/members').set(authHeader()).send({ name: 'An' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/members/:notionId', () => {
  it('phải xóa member và trả về 204', async () => {
    await request(app)
      .post('/api/members')
      .set(authHeader())
      .send({ name: 'Del User', email: 'del@test.com', notionId: 'del-id' });

    const res = await request(app).delete('/api/members/del-id').set(authHeader());

    expect(res.status).toBe(204);
  });

  it('phải trả về 404 khi không tìm thấy', async () => {
    const res = await request(app).delete('/api/members/ghost-id').set(authHeader());
    expect(res.status).toBe(404);
  });
});

describe('POST /api/trigger/standup', () => {
  it('phải gọi generateDailyPages và trả về kết quả', async () => {
    generateDailyPages.mockResolvedValue([{ member: 'An', pageId: 'p1' }]);

    const res = await request(app).post('/api/trigger/standup').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(generateDailyPages).toHaveBeenCalled();
  });
});

describe('POST /api/trigger/remind', () => {
  it('phải gọi checkAndRemind', async () => {
    checkAndRemind.mockResolvedValue({ unfilled: 1, success: 1, failed: 0 });

    const res = await request(app).post('/api/trigger/remind').set(authHeader());

    expect(res.status).toBe(200);
    expect(checkAndRemind).toHaveBeenCalled();
  });
});

describe('POST /api/trigger/summary', () => {
  it('phải gọi aggregateStandups', async () => {
    aggregateStandups.mockResolvedValue({ date: '2024-01-15', memberCount: 3 });

    const res = await request(app).post('/api/trigger/summary').set(authHeader());

    expect(res.status).toBe(200);
    expect(aggregateStandups).toHaveBeenCalled();
  });
});

describe('GET /api/trigger/summary', () => {
  it('phải fetch summary data khi có date query param', async () => {
    fetchSummaryData.mockResolvedValue({
      date: '2024-01-15',
      members: [
        { name: 'An', sections: { 'Hôm qua': ['task A'], 'Hôm nay': ['task B'], Blocker: [] } },
      ],
    });

    const res = await request(app).get('/api/trigger/summary?date=2024-01-15').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result.date).toBe('2024-01-15');
    expect(res.body.result.members).toHaveLength(1);
    expect(fetchSummaryData).toHaveBeenCalledWith(expect.any(Date));
  });

  it('phải trả về 400 khi date không hợp lệ', async () => {
    const res = await request(app).get('/api/trigger/summary?date=invalid-date').set(authHeader());

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Ngày không hợp lệ');
  });

  it('phải dùng ngày hôm nay khi không có date param', async () => {
    fetchSummaryData.mockResolvedValue({ date: expect.any(String), members: [] });

    const res = await request(app).get('/api/trigger/summary').set(authHeader());

    expect(res.status).toBe(200);
    expect(fetchSummaryData).toHaveBeenCalledWith(expect.any(Date));
  });
});
