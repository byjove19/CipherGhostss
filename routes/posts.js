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
router.post('/:id/comments', async (req, res) => {
  const { username, comment } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post.comments) post.comments = [];

    post.comments.push({
      username,
      comment,
      date: new Date()
    });

    await post.save();
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving comment');
  }
});

// Route to display all stories
router.get('/stories', async (req, res) => {
  try {
    const stories = await Post.find({ isStory: true });  // Filter posts marked as stories
    res.render('stories', { stories });
  } catch (error) {
    res.status(500).send('Error fetching stories');
  }
});

module.exports = router;
