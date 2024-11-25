// /middleware/auth.js
const jwt = require('jsonwebtoken');
const secretKey = 'your_jwt_secret_key';

// Middleware to verify JWT and user roles
const authenticateJWT = (roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: 'Access denied' });
    }

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      // Check if the user has the required role
      if (roles && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'You do not have access to this resource' });
      }

      req.user = user;  // Attach user to request object
      next();
    });
  };
};

module.exports = authenticateJWT;
