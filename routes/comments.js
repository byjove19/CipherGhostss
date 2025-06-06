const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Comment = require('../models/comment');
const Post = require('../models/post');
const auth = require('../middleware/auth');

// @route   POST api/comments
// @desc    Add a comment
// @access  Private (requires authentication)
router.post(
  '/',
  [
    auth, // JWT middleware to check user token
    check('content', 'Content is required').not().isEmpty(),
    check('post', 'Post ID is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if the post exists
      const post = await Post.findById(req.body.post);
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }

      // Create new comment
      const newComment = new Comment({
        content: req.body.content,
        author: req.user.id,  // From JWT payload (user ID)
        post: req.body.post,
        parentComment: req.body.parentComment || null
      });

      const comment = await newComment.save();

      // Initialize comments array if undefined
      post.comments = post.comments || [];
      post.comments.push(comment._id);
      await post.save();

      res.json(comment); // Return new comment data
    } catch (err) {
      console.error('Error in comment route:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
