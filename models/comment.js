const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // For replies
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
