const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  const token = req.cookies.token || req.headers['authorization'];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Pass user to next middleware
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}


module.exports = authenticateUser;
