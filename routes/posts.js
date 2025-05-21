const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const auth = require('../middleware/auth'); // assuming you have auth middleware

// GET post by slug with comments populated
router.get('/posts/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username')
      .lean();

    // Organize nested replies
    const commentMap = {};
    comments.forEach(c => commentMap[c._id] = { ...c, replies: [] });
    const topLevel = [];

    comments.forEach(c => {
      if (c.parent) {
        commentMap[c.parent]?.replies.push(commentMap[c._id]);
      } else {
        topLevel.push(commentMap[c._id]);
      }
    });

    res.render('post', { post, comments: topLevel });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/comments', async (req, res) => {
  const { content, post, parent } = req.body;
  const userId = req.user?.id; // Assuming you're using auth

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const comment = await Comment.create({
      content,
      post,
      parent: parent || null,
      author: userId
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

router.post('/comments/:id/reaction', async (req, res) => {
  const { type } = req.body; // "like" or "dislike"
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).send('Not found');

    if (type === 'like') comment.likes += 1;
    if (type === 'dislike') comment.dislikes += 1;

    await comment.save();
    res.json({ likes: comment.likes, dislikes: comment.dislikes });
  } catch (err) {
    res.status(500).send('Error reacting');
  }
});


// POST new comment for a post by post ID
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }

    // Create a new comment linked to the post and logged-in user
    const newComment = new Comment({
      content,
      author: req.user.id,  // From auth middleware
      post: post._id,
      parentComment: parentComment || null
    });

    await newComment.save();

    res.redirect(`/posts/${post.slug}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to display all stories
router.get('/stories', async (req, res) => {
  try {
    const stories = await Post.find({ isStory: true });
    res.render('stories', { stories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching stories');
  }
});

module.exports = router;
