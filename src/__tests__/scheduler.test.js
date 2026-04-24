jest.mock('node-cron');
jest.mock('../services/dailyStandup');
jest.mock('../services/reminder');
jest.mock('../services/summary');

const cron = require('node-cron');
const { generateDailyPages } = require('../services/dailyStandup');
const { checkAndRemind } = require('../services/reminder');
const { aggregateStandups } = require('../services/summary');
const { startScheduler } = require('../jobs/scheduler');

describe('startScheduler', () => {
  let scheduledJobs;

  beforeEach(() => {
    scheduledJobs = [];
    cron.schedule.mockImplementation((pattern, fn, opts) => {
      scheduledJobs.push({ pattern, fn, opts });
    });
  });

  it('phải đăng ký đúng 3 cron jobs', () => {
    startScheduler();
    expect(cron.schedule).toHaveBeenCalledTimes(3);
  });

  it('phải dùng pattern 45 8 * * 1-5 cho generateDailyPages', () => {
    startScheduler();
    const job = scheduledJobs.find((j) => j.pattern === '45 8 * * 1-5');
    expect(job).toBeDefined();
  });

  it('phải dùng pattern 55 8 * * 1-5 cho checkAndRemind', () => {
    startScheduler();
    const job = scheduledJobs.find((j) => j.pattern === '55 8 * * 1-5');
    expect(job).toBeDefined();
  });

  it('phải dùng pattern 0 9 * * 1-5 cho aggregateStandups', () => {
    startScheduler();
    const job = scheduledJobs.find((j) => j.pattern === '0 9 * * 1-5');
    expect(job).toBeDefined();
  });

  it('phải cấu hình timezone Asia/Ho_Chi_Minh', () => {
    startScheduler();
    scheduledJobs.forEach((j) => {
      expect(j.opts.timezone).toBe('Asia/Ho_Chi_Minh');
    });
  });

  it('phải gọi generateDailyPages khi cron 8:45 trigger', async () => {
    generateDailyPages.mockResolvedValue([]);
    startScheduler();
    const job = scheduledJobs.find((j) => j.pattern === '45 8 * * 1-5');
    await job.fn();
    expect(generateDailyPages).toHaveBeenCalled();
  });

  it('phải gọi checkAndRemind khi cron 8:55 trigger', async () => {
    checkAndRemind.mockResolvedValue({ unfilled: 0, success: 0, failed: 0 });
    startScheduler();
    const job = scheduledJobs.find((j) => j.pattern === '55 8 * * 1-5');
    await job.fn();
    expect(checkAndRemind).toHaveBeenCalled();
  });

  it('phải gọi aggregateStandups khi cron 9:00 trigger', async () => {
    aggregateStandups.mockResolvedValue({ date: '2024-01-15', memberCount: 3 });
    startScheduler();
    const job = scheduledJobs.find((j) => j.pattern === '0 9 * * 1-5');
    await job.fn();
    expect(aggregateStandups).toHaveBeenCalled();
  });
});
