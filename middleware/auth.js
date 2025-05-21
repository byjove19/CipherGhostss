const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  let token = req.cookies.token;

  // Support 'Authorization: Bearer <token>' header too
  if (!token && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload (e.g., user ID) to request
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticateUser;
