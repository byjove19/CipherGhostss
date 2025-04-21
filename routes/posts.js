const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// Fetch post by slug
router.get('/posts/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).send('Post not found');
    res.render('post', { post }); // post.ejs file required in views
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
