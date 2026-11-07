const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, please log in' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) return res.status(401).json({ message: 'User not found, please log in again' });
  if (user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked' });

  // Role and company always come from the database, never from the token,
  // so role/company changes take effect immediately.
  req.user = { userId: user.id, role: user.role, companyId: user.companyId, name: user.name };
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: this action needs a ${roles
          .map((r) => r.replace(/_/g, ' ').toLowerCase())
          .join(' or ')} account (you are logged in as ${req.user.role.replace(/_/g, ' ').toLowerCase()} "${req.user.name}")`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
