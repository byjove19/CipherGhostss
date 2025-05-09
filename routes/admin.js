const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const ensureAuthenticated = require('../middleware/authMiddleware');

// Create a new post
router.post('/create', async (req, res) => {
  const { title, slug, excerpt, image, content, isStory } = req.body;

  // Simple field validation
  if (!title || !slug || !excerpt || !image || !content || typeof isStory === 'undefined') {
    return res.status(400).json({ message: 'All fields are required, including isStory.' });
  }

  try {
    const newPost = new Post({
      title,
      slug,
      excerpt,
      image,
      content,
      isStory: isStory === 'true' || isStory === true // ✅ parse correctly
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully.', post: newPost });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});
// Secure the admin dashboard
router.get('/admin', ensureAuthenticated, async (req, res) => {
  const posts = await Post.find({});
  res.render('admin', { posts });
});

// Protect delete
router.post('/admin/delete/:id', ensureAuthenticated, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});

// Protect edit
router.get('/admin/edit/:id', ensureAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('edit', { post });
});
module.exports = router;
