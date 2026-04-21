import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res, next) => {
    try {
        const { content, userId } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Content required"
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

        const post = await Post.create({
            content,
            isAnonymous,
            user: userId || null
        });

        res.status(201).json({
            success: true,
            post: {
                id: post._id,
                content: post.content,
                isAnonymous: post.isAnonymous,
                createdAt: post.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email bio');

        const formattedPosts = posts.map(post => ({
            id: post._id,
            content: post.content,
            isAnonymous: post.isAnonymous,
            user: post.isAnonymous ? null : post.user,
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            createdAt: post.createdAt
        }));

        res.status(200).json(formattedPosts);
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: "Post deleted"
        });
    } catch (error) {
        next(error);
    }
};