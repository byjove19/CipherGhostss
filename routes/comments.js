const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Comment = require('../models/comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// @route   POST api/comments
// @desc    Add a comment
// @access  Private
router.post(
    '/',
    [
        auth,
        check('content', 'Content is required').not().isEmpty(),
        check('post', 'Post ID is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const post = await Post.findById(req.body.post);
            if (!post) {
                return res.status(404).json({ msg: 'Post not found' });
            }

            const newComment = new Comment({
                content: req.body.content,
                author: req.user.id,
                post: req.body.post,
                parentComment: req.body.parentComment
            });

            const comment = await newComment.save();

            post.comments.push(comment._id);
            await post.save();

            res.json(comment);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/comments/:id/reaction
// @desc    Add/remove reaction to comment
// @access  Private
router.put(
    '/:id/reaction',
    [
        auth,
        check('reactionType', 'Reaction type is required').not().isEmpty(),
        check('action', 'Action is required').isIn(['add', 'remove'])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const comment = await Comment.findById(req.params.id);
            if (!comment) {
                return res.status(404).json({ msg: 'Comment not found' });
            }

            const { reactionType, action } = req.body;

            if (!comment.reactions[reactionType]) {
                comment.reactions[reactionType] = [];
            }

            if (action === 'add') {
                if (!comment.reactions[reactionType].includes(req.user.id)) {
                    comment.reactions[reactionType].push(req.user.id);
                }
            } else {
                comment.reactions[reactionType] = comment.reactions[reactionType].filter(
                    id => id.toString() !== req.user.id
                );
            }

            await comment.save();
            res.json(comment);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const post = await Post.findById(comment.post);
        post.comments = post.comments.filter(
            commentId => commentId.toString() !== req.params.id
        );
        await post.save();

        await comment.remove();
        res.json({ msg: 'Comment removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
