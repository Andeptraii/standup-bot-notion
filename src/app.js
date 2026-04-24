const express = require('express');
const path = require('path');
const authMiddleware = require('./middleware/auth');
const membersRouter = require('./routes/members');
const triggersRouter = require('./routes/triggers');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/members', authMiddleware, membersRouter);
app.use('/api/trigger', authMiddleware, triggersRouter);

module.exports = app;
