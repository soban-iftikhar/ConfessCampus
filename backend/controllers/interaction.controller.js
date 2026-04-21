import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js'; 


export const toggleLike = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.id; // From isAuthenticated

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                errorCode: 404
            });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // User already liked it, so we remove their ID from the array
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            // User hasn't liked it, so we add their ID to the array
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: isLiked ? "Post unliked" : "Post liked",
            // Return the new likes count so the frontend can update immediately
            likesCount: post.likes.length 
        });

    } catch (error) {
        next(error);
    }
};


export const addComment = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.id;
        const { content, isAnonymous } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
                errorCode: 400
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                errorCode: 404
            });
        }

        // Create the comment 
        const comment = await Comment.create({
            post: postId,
            user: userId,
            content,
            isAnonymous: isAnonymous === 'true' || isAnonymous === true
        });

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
            .populate('user', 'name avatar'); // Populate the user who made the comment

        // Map it to hide anonymous users
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