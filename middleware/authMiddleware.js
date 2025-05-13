function ensureAuthenticated(req, res, next) {
  console.log('Session:', req.session); // Debugging session content
  if (req.session.adminId) {
    return next(); // Proceed to the requested route if authenticated
  } else {
    res.redirect('/adminlogin'); // Redirect to login if not authenticated
  }
}

module.exports = ensureAuthenticated;
