const express = require('express');
const { generateDailyPages } = require('../services/dailyStandup');
const { checkAndRemind } = require('../services/reminder');
const { aggregateStandups, fetchSummaryData } = require('../services/summary');

const router = express.Router();

router.post('/standup', async (_req, res) => {
  try {
    const results = await generateDailyPages();
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/remind', async (_req, res) => {
  try {
    const result = await checkAndRemind();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/summary', async (_req, res) => {
  try {
    const result = await aggregateStandups();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    let date = new Date();
    if (req.query.date) {
      date = new Date(req.query.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Ngày không hợp lệ. Định dạng: YYYY-MM-DD' });
      }
    }
    const result = await fetchSummaryData(date);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
