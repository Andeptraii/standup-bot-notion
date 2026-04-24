const express = require('express');
const { MemberService, MemberValidationError } = require('../services/member');

const router = express.Router();

router.get('/', (_req, res) => {
  const members = MemberService.getMembers();
  res.json(members);
});

router.post('/', (req, res) => {
  try {
    const member = MemberService.addMember(req.body);
    res.status(201).json(member);
  } catch (err) {
    if (err instanceof MemberValidationError) {
      return res.status(400).json({ error: err.message });
    }
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
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.delete('/:notionId', (req, res) => {
  const removed = MemberService.removeMember(req.params.notionId);
  if (!removed) return res.status(404).json({ error: 'Không tìm thấy member' });
  res.status(204).send();
});

module.exports = router;
