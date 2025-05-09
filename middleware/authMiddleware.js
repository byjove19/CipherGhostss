// authMiddleware.js

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  } else {
    res.redirect('/adminlogin');
  }
}

module.exports = ensureAuthenticated;
