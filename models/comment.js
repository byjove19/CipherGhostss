const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  reactions: {
    like: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    love: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    laugh: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    angry: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', CommentSchema);
