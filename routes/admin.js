// routes/admin.js
const express = require('express');
const Post = require('../models/post');
const router = express.Router();

// Route to create a new post
router.post('/create', async (req, res) => {
  const { title, description, content, category } = req.body;

  if (!title || !description || !content || !category) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newPost = new Post({
    title,
    description,
    content,
    category
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
