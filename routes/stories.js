// routes/stories.js
const express = require('express');
const router = express.Router();
const Post = require('../models/post');  
router.get('/', async (req, res) => {
  try {
    const stories = await Post.find({ isStory: true });  // Fetch posts where `isStory` is true
    res.render('stories', { stories });  // Pass the stories to the 'stories.ejs' template
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
