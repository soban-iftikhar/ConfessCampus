import Post from '../models/Post.js';
import User from '../models/User.js';

// Create a new post
const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        if (!content || content.length > 1000) {
            return res.status(400).json({ message: 'Post cannot be empty and cannot exceed 1000 characters' });
        }

        // Get user's anonymity preference from profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newPost = new Post({
            content,
            isAnonymous: user.isAnonymous, // Use user's profile setting
            user: userId
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Get all posts
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name')
            .populate('comments')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Get a single post by ID
const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const postData = await Post.findById(postId)
            .populate('user', 'name')
            .populate('comments');
        if (!postData) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(postData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};


const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body; // Don't accept isAnonymous from request
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        if (!content || content.length > 1000) {
            return res.status(400).json({ message: 'Content is required and must not exceed 1000 characters' });
        }

        const postData = await Post.findById(postId);
        if (!postData) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (postData.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized - Can only edit your own posts' });
        }

        postData.content = content;
        const updatedPost = await postData.save();
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Delete a post
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const postData = await Post.findById(postId);
        if (!postData) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (postData.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized - Can only delete your own posts' });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};


// Like a post
const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const postData = await Post.findById(postId);
        if (!postData) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (postData.likes.includes(userId)) {
            return res.status(400).json({ message: 'You have already liked this post' });
        }

        postData.likes.push(userId);
        await postData.save();
        res.status(200).json({ message: 'Post liked successfully', likesCount: postData.likes.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};


//  Unlike a post
const unlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const postData = await Post.findById(postId);
        if (!postData) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (!postData.likes.includes(userId)) {
            return res.status(400).json({ message: 'You have not liked this post' });
        }

        postData.likes = postData.likes.filter(id => id.toString() !== userId);
        await postData.save();
        res.status(200).json({ message: 'Post unliked successfully', likesCount: postData.likes.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

export { createPost, getPosts, getPostById, updatePost, deletePost, likePost, unlikePost };