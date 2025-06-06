const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const createToken = (id) => {
  return jwt.sign({ id }, 'cipherghostss', { expiresIn: '1d' });
};
// GET Register Page
router.get('/register', (req, res) => {
  res.render('signup', { errors: [] });
});

// GET Login Page
router.get('/login', (req, res) => {
  res.render('login', { errors: [] });
});

// POST Register User
router.post('/register', [
  check('username', 'Username is required').notEmpty(),
  check('email', 'Valid email required').isEmail(),
  check('password', 'Password must be 6+ characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('signup', { errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.render('signup', { errors: [{ msg: 'User already exists' }] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    // 🔐 Create JWT and set cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });

    res.redirect('/'); // Or render welcome page if desired
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// POST Login User
router.post('/login', [
  check('username', 'Username is required').notEmpty(),
  check('password', 'Password is required').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }); // Change email to username
    if (!user) {
      return res.render('login', { errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { errors: [{ msg: 'Invalid credentials' }] });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set the token in a secure cookie
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });

    res.redirect('/'); // Redirect user after successful login
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear JWT
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});


module.exports = router;
