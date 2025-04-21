require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const ejs = require('ejs');
const adminRoutes = require('./routes/admin');
const linksRoutes = require('./routes/links');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const Post = require('./models/Post');

const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.render('index', { posts });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});
// Get all posts
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find(); // or Post.find({}) if using MongoDB
  res.json(posts);
});

app.get('/post', async (req, res) => {
  const postId = req.query.id;
  const post = await Post.findById(postId);
  res.render('post', { post });
});
// Other routes above...
app.use('/api', postRoutes); // This handles /api/posts/:slug

// The static route for individual post page (optional if you want API + frontend)
app.get('/post/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).send('Post not found');
    res.render('post', { post });
  } catch (err) {
    res.status(500).send('Server error');
  }
});


app.use('/api/admin', adminRoutes);  // Admin routes for creating posts
app.use('/api', linksRoutes);        // Public route to fetch posts


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});