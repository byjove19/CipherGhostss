module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    
    console.log('Token:', token); // Debug log to see the token

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message); // Log error
        return res.status(401).json({ msg: 'Invalid token' });
    }
};
