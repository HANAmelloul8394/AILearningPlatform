const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AuthorizationError } = require('../utils/errorFactory');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthorizationError('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new AuthorizationError('User not found'));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return next(new AuthorizationError('Invalid or expired token'));
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError('You do not have permission to access this resource'));
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  authorizeRoles,
};
