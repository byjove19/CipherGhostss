const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  image: { type: String, required: true },
  content: { type: String, required: true },

  // Make isStory optional (not required)
  isStory: { type: Boolean, default: false },

  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // comments array

}, { timestamps: true });

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);
