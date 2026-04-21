import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

export const toggleLike = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const { userId } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: isLiked ? "Unliked" : "Liked",
            likesCount: post.likes.length
        });
    } catch (error) {
        next(error);
    }
};

export const addComment = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const { content, userId } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Comment required"
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        let user = null;
        let isAnonymous = true;

        if (userId) {
            user = await User.findById(userId);
            if (user) {
                isAnonymous = user.isAnonymous;
            }
        }

        const comment = await Comment.create({
            post: postId,
            user: userId || null,
            content,
            isAnonymous
        });

        post.comments.push(comment._id);
        await post.save();

        res.status(201).json({
            success: true,
            comment: {
                id: comment._id,
                content: comment.content,
                isAnonymous: comment.isAnonymous,
                createdAt: comment.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getComments = async (req, res, next) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate('user', 'name email bio');

        const formattedComments = comments.map(comment => ({
            id: comment._id,
            content: comment.content,
            isAnonymous: comment.isAnonymous,
            user: comment.isAnonymous ? null : comment.user,
            createdAt: comment.createdAt
        }));

        res.status(200).json(formattedComments);
    } catch (error) {
        next(error);
    }
};