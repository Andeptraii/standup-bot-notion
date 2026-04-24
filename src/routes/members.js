const express = require('express');
const { MemberService, MemberValidationError } = require('../services/member');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', (_req, res) => {
  try {
    const members = MemberService.getMembers();
    res.json(members);
  } catch (err) {
    logger.error('GET /api/members failed', { error: err.message });
    res.status(500).json({ error: 'Lỗi khi tải danh sách members' });
  }
});

router.post('/', (req, res) => {
  try {
    const member = MemberService.addMember(req.body);
    res.status(201).json(member);
  } catch (err) {
    if (err instanceof MemberValidationError) {
      return res.status(400).json({ error: err.message });
    }
    logger.error('POST /api/members failed', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.put('/:notionId', (req, res) => {
  try {
    const updated = MemberService.updateMember(req.params.notionId, req.body);
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy member' });
    res.json(updated);
  } catch (err) {
    if (err instanceof MemberValidationError) {
      return res.status(400).json({ error: err.message });
    }
    logger.error('PUT /api/members failed', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.delete('/:notionId', (req, res) => {
  try {
    const removed = MemberService.removeMember(req.params.notionId);
    if (!removed) return res.status(404).json({ error: 'Không tìm thấy member' });
    res.status(204).send();
  } catch (err) {
    logger.error('DELETE /api/members failed', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Lỗi khi xoá member' });
  }
});

module.exports = router;
