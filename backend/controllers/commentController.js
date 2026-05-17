import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// Helper function to format comment data - hide user info if anonymous
const formatCommentData = (comment) => {
    const commentObj = comment.toObject ? comment.toObject() : comment;
    
    if (commentObj.isAnonymous) {
        // Remove user data for anonymous comments
        commentObj.user = null;
        commentObj.userId = null;
    }
    
    return commentObj;
};

// Create a comment on a post
export const createComment = async (req, res, next) => {
    try {
        const { postId, content } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - User not found'
            });
        }

        if (!postId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Post ID and content are required'
            });
        }

        if (content.length > 300) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot exceed 300 characters'
            });
        }

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Determine anonymity: if the post is anonymous, force comments anonymous.
        // Otherwise, respect the user's choice if provided (default false).
        const isAnonymousFlag = post.isAnonymous ? true : (req.body.isAnonymous ?? false);

        const comment = new Comment({
            post: postId,
            user: userId,
            content,
            isAnonymous: isAnonymousFlag
        });

        const savedComment = await comment.save();
        const populatedComment = await savedComment.populate('user', 'name bio');

        // Add comment to post
        post.comments.push(savedComment._id);
        await post.save();

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            comment: formatCommentData(populatedComment)
        });
    } catch (error) {
        next(error);
    }
};

// Get comments for a post
export const getCommentsByPost = async (req, res, next) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID is required'
            });
        }

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comments = await Comment.find({ post: postId })
            .populate('user', 'name bio')
            .sort({ createdAt: -1 });

        // Format comments to hide user info if anonymous
        const formattedComments = comments.map(comment => formatCommentData(comment));

        res.status(200).json({
            success: true,
            count: formattedComments.length,
            comments: formattedComments
        });
    } catch (error) {
        next(error);
    }
};

// Get a single comment by ID
export const getCommentById = async (req, res, next) => {
    try {
        const { commentId } = req.params;

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: 'Comment ID is required'
            });
        }

        const comment = await Comment.findById(commentId)
            .populate('user', 'name bio');

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        res.status(200).json({
            success: true,
            comment: formatCommentData(comment)
        });
    } catch (error) {
        next(error);
    }
};

// Update a comment
export const updateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - User not found'
            });
        }

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: 'Comment ID is required'
            });
        }

        if (!content || content.length > 300) {
            return res.status(400).json({
                success: false,
                message: 'Content is required and must not exceed 300 characters'
            });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Only author can update
        if (comment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - Can only edit your own comments'
            });
        }

        comment.content = content;
        const updatedComment = await comment.save();
        const populatedComment = await updatedComment.populate('user', 'name bio');

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            comment: formatCommentData(populatedComment)
        });
    } catch (error) {
        next(error);
    }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - User not found'
            });
        }

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: 'Comment ID is required'
            });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Only author can delete
        if (comment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - Can only delete your own comments'
            });
        }

        // Remove comment from post
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: commentId }
        });

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
