// routes/links.js
const express = require('express');
const Post = require('../models/post');
const router = express.Router();

// Route to fetch all posts
router.get('/links', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
