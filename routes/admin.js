const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Create a new post
router.post('/create', async (req, res) => {
  const { title, slug, excerpt, image, content } = req.body;

  // Simple field validation
  if (!title || !slug || !excerpt || !image || !content) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newPost = new Post({ title, slug, excerpt, image, content });
    await newPost.save();
    res.status(201).json({ message: 'Post created successfully.', post: newPost });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
