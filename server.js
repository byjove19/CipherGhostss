require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');



// Routes
const adminRoutes = require('./routes/admin');
const linksRoutes = require('./routes/links');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const commentsRoutes = require('./routes/comments');
const storiesRoutes = require('./routes/stories'); 
const ensureAuthenticated = require('./middleware/authMiddleware'); 

// Models
const Post = require('./models/Post');
const Comment = require('./models/comment');
const Admin = require('./models/admin');

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

//admin login
app.get('/adminlogin', (req, res) => {
  res.render('adminlogin');  // Make sure you have 'adminlogin' view
});

// Handle admin login logic
app.post('/adminlogin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).send('Admin not found');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).send('Invalid password');
    }

    // Save session with adminId
    req.session.adminId = admin._id;

    res.redirect('/admin/dashboard'); // Redirect to admin dashboard
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Render admin dashboard
app.get('/admin/dashboard', ensureAuthenticated, async (req, res) => {
  const posts = await Post.find(); // Fetch all posts
  res.render('admin', { posts });  // Make sure you have 'admin' view
});

// Create new post
app.post('/admin/create', async (req, res) => {
  await Post.create({
    title: req.body.title,
    content: req.body.content,
  });
  res.redirect('/admin/dashboard');
});

// Delete post
app.post('/admin/delete/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
});

// Edit post form
app.get('/admin/edit/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('edit', { post });  // Make sure you have 'edit' view
});

// Update post
app.post('/admin/edit/:id', async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content,
  });
  res.redirect('/admin/dashboard');
});

// Log out and destroy session
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    res.redirect('/adminlogin');  // Redirect to login page
  });
});


app.get('/post', async (req, res) => {
  const postId = req.query.id; under /api/comments
app.use('/posts', require('./routes/posts')); 
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
app.use('/stories', storiesRoutes);
app.use(session({
  secret: 'c1pher@ghostss#',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://odionyejovy:Z5Fc7zOXIqkhr2Jw@cipherghostss.lpr2noh.mongodb.net/' }),
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } // 1hr
}));

app.get('/stories', async (req, res) => {
  try {
    const stories = await Post.find({ isStory: true }); // Fetch only story-type posts
    res.render('stories', { stories }); // Render the correct EJS file
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.render('stories', { stories: [] }); // Prevent crash if DB fails
  }
});


// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
