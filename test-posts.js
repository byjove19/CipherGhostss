require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// Function to create a detailed blog post
async function createDetailedPost() {
  try {
    // First, create a test user (or use an existing one)
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('Creating test user first...');
      const newUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await newUser.save();
      console.log('Test user created successfully');
    }

    // Create a detailed blog post
    const post = new Post({
      title: 'Getting Started with Node.js and MongoDB',
      content: `# Getting Started with Node.js and MongoDB

In this comprehensive guide, we'll explore how to build a robust backend using Node.js and MongoDB.

## What You'll Learn
- Setting up a Node.js project
- Connecting to MongoDB
- Creating and managing data
- Best practices for database operations

## Prerequisites
- Basic knowledge of JavaScript
- Node.js installed on your system
- MongoDB installed or access to a MongoDB instance

## Step 1: Project Setup
First, initialize your Node.js project and install the necessary dependencies.

## Step 2: Database Connection
Learn how to establish a secure connection to your MongoDB database.

## Conclusion
By following this guide, you'll have a solid foundation for building Node.js applications with MongoDB.`,
      author: user._id,
      tags: ['node.js', 'mongodb', 'tutorial', 'backend', 'database']
    });

    // Save the post to database
    await post.save();
    console.log('Detailed post created successfully!');
    console.log('Post ID:', post._id);
    
    // Return the post ID for later use
    return post._id;
  } catch (error) {
    console.error('Error creating post:', error);
  }
}

// Function to get all posts with detailed information
async function getAllPosts() {
  try {
    const posts = await Post.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    
    console.log('\nAll Posts:');
    posts.forEach(post => {
      console.log('\n-------------------');
      console.log(`Title: ${post.title}`);
      console.log(`Author: ${post.author.username}`);
      console.log(`Created: ${post.createdAt}`);
      console.log(`Tags: ${post.tags.join(', ')}`);
      console.log('-------------------\n');
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

// Function to get a single post by ID with detailed information
async function getPostById(postId) {
  try {
    const post = await Post.findById(postId)
      .populate('author', 'username email')
      .populate('comments');
    
    if (!post) {
      console.log('Post not found');
      return;
    }

    console.log('\nPost Details:');
    console.log('-------------------');
    console.log(`Title: ${post.title}`);
    console.log(`Author: ${post.author.username}`);
    console.log(`Created: ${post.createdAt}`);
    console.log(`Tags: ${post.tags.join(', ')}`);
    console.log('\nContent:');
    console.log(post.content);
    console.log('-------------------\n');
  } catch (error) {
    console.error('Error fetching post:', error);
  }
}

// Main function to run the example
async function runExample() {
  console.log('Starting post creation and retrieval example...\n');
  
  // Create a detailed post
  const postId = await createDetailedPost();
  
  // Get all posts
  await getAllPosts();
  
  // Get the specific post we just created
  if (postId) {
    console.log('\nRetrieving specific post...');
    await getPostById(postId);
  }
}

// Run the example
runExample()
  .then(() => {
    console.log('\nExample completed successfully!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error running example:', err);
    mongoose.connection.close();
  }); 