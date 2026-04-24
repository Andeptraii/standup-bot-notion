function authMiddleware(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return res.status(500).json({ error: 'ADMIN_TOKEN chưa được cấu hình' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Thiếu Authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);
  if (token !== adminToken) {
    return res.status(403).json({ error: 'Token không hợp lệ' });
  }

  next();
}

module.exports = authMiddleware;
