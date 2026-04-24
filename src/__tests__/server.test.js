const request = require('supertest');
const app = require('../app');

describe('GET /health', () => {
  it('phải trả về status 200 và body ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
