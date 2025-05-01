require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const ejs = require('ejs');
const path = require('path');

// Routes
const adminRoutes = require('./routes/admin');
const linksRoutes = require('./routes/links');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const commentsRoutes = require('./routes/comments');

// Models
const Post = require('./models/Post');
const Comment = require('./models/comment');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Public Pages
app.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.render('index', { posts });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { errors: [] });

});

app.get('/signup', (req, res) => {
  res.render('signup');
});


// Show admin page
app.get('/admin', async (req, res) => {
  const posts = await Post.find();
  res.render('admin', { posts });
});

// Create post
app.post('/admin/create', async (req, res) => {
  await Post.create({ title: req.body.title, content: req.body.content });
  res.redirect('/admin');
});

// Delete post
app.post('/admin/delete/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});

// Edit form
app.get('/admin/edit/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('edit', { post });
});

// Update post
app.post('/admin/edit/:id', async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, { title: req.body.title, content: req.body.content });
  res.redirect('/admin');
});

app.get('/post', async (req, res) => {
  const postId = req.query.id; under /api/comments
app.use('/posts', require('./routes/posts')); // Keep if needed for legacy support

  const post = await Post.findById(postId);
  res.render('post', { post });
});

app.get('/post/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).send('Post not found');
    res.render('post', { post });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// API Routes
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

app.use('/api/admin', adminRoutes);    
app.use('/api', linksRoutes);           
app.use('/api', postRoutes);
app.use('/api/comments', commentsRoutes);  
app.use('/api/auth', authRoutes);    


// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
