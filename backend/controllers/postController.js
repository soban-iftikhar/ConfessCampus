import Post from '../models/Post.js';
import User from '../models/User.js';

// Helper function to format post data - hide user info if anonymous
const formatPostData = (post) => {
    const postObj = post.toObject ? post.toObject() : post;
    
    if (postObj.isAnonymous) {
        // Remove user data for anonymous posts
        postObj.user = null;
        postObj.userId = null;
    }
    
    return postObj;
};

// Create a new post
const createPost = async (req, res) => {
    try {
        const { content, category, title, itemType, itemDescription, location, departure, destination, departureTime, seatsAvailable, tags } = req.body;
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        if (!content || content.length > 1000) {
            return res.status(400).json({ message: 'Post cannot be empty and cannot exceed 1000 characters' });
        }

        if (!category || !['confession', 'discussion', 'lost-found', 'carpool'].includes(category)) {
            return res.status(400).json({ message: 'Invalid or missing category' });
        }

        // Validate category-specific fields
        if (category === 'lost-found') {
            if (!itemType || !['lost', 'found'].includes(itemType)) {
                return res.status(400).json({ message: 'Lost & Found posts require itemType (lost/found)' });
            }
            if (!itemDescription) {
                return res.status(400).json({ message: 'Lost & Found posts require itemDescription' });
            }
            if (!location) {
                return res.status(400).json({ message: 'Lost & Found posts require location' });
            }
        }

        if (category === 'carpool') {
            if (!departure || !destination) {
                return res.status(400).json({ message: 'Carpool posts require departure and destination' });
            }
            if (!departureTime) {
                return res.status(400).json({ message: 'Carpool posts require departureTime' });
            }
            if (!seatsAvailable || seatsAvailable < 1) {
                return res.status(400).json({ message: 'Carpool posts require seatsAvailable (minimum 1)' });
            }
        }

        if (category === 'discussion') {
            if (!title) {
                return res.status(400).json({ message: 'Discussion posts require a title' });
            }
        }

        // Get user's anonymity preference from profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newPost = new Post({
            content,
            category,
            title: title || null,
            isAnonymous: user.isAnonymous,
            user: userId,
            itemType: itemType || null,
            itemDescription: itemDescription || null,
            location: location || null,
            departure: departure || null,
            destination: destination || null,
            departureTime: departureTime || null,
            seatsAvailable: seatsAvailable || null,
            tags: tags || []
        });

        const savedPost = await newPost.save();
        await savedPost.populate('user', 'name bio');
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: formatPostData(savedPost)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Get all posts with filtering and search
const getPosts = async (req, res) => {
    try {
        const { category, search, tag, sort = '-createdAt' } = req.query;
        const filter = {};

        // Filter by category
        if (category) {
            if (!['confession', 'discussion', 'lost-found', 'carpool'].includes(category)) {
                return res.status(400).json({ message: 'Invalid category' });
            }
            filter.category = category;
        }

        // Search in content, title, and other text fields
        if (search) {
            filter.$or = [
                { content: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { itemDescription: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { departure: { $regex: search, $options: 'i' } },
                { destination: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by tag (for discussion posts)
        if (tag) {
            filter.tags = { $in: [tag] };
        }

        const posts = await Post.find(filter)
            .populate('user', 'name bio')
            .populate('comments')
            .sort(sort);
        
        // Format posts to hide user info if anonymous
        const formattedPosts = posts.map(post => formatPostData(post));
        
        res.status(200).json({
            success: true,
            count: formattedPosts.length,
            posts: formattedPosts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Get a single post by ID
const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const postData = await Post.findById(postId)
            .populate('user', 'name bio')
            .populate('comments');
        if (!postData) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        
        // Format post to hide user info if anonymous
        const formattedPost = formatPostData(postData);
        
        res.status(200).json({
            success: true,
            post: formattedPost
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};


const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { content, title, isResolved, seatsAvailable } = req.body;
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized - User not found' });
        }

        if (content && content.length > 1000) {
            return res.status(400).json({ success: false, message: 'Content must not exceed 1000 characters' });
        }

        const postData = await Post.findById(postId);
        if (!postData) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (postData.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized - Can only edit your own posts' });
        }

        // Update allowed fields based on category
        if (content) postData.content = content;
        if (title && postData.category === 'discussion') postData.title = title;
        if (isResolved !== undefined && postData.category === 'discussion') postData.isResolved = isResolved;
        if (seatsAvailable !== undefined && postData.category === 'carpool') {
            if (seatsAvailable < 1) {
                return res.status(400).json({ success: false, message: 'Seats available must be at least 1' });
            }
            postData.seatsAvailable = seatsAvailable;
        }

        const updatedPost = await postData.save();
        await updatedPost.populate('user', 'name bio');

        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            post: formatPostData(updatedPost)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', details: error.message });
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
            return res.status(401).json({ success: false, message: 'Unauthorized - User not found' });
        }

        const postData = await Post.findById(postId);
        if (!postData) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (postData.likes.includes(userId)) {
            return res.status(400).json({ success: false, message: 'You have already liked this post' });
        }

        postData.likes.push(userId);
        await postData.save();
        res.status(200).json({
            success: true,
            message: 'Post liked successfully',
            likesCount: postData.likes.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

// Unlike a post
const unlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized - User not found' });
        }

        const postData = await Post.findById(postId);
        if (!postData) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (!postData.likes.includes(userId)) {
            return res.status(400).json({ success: false, message: 'You have not liked this post' });
        }

        postData.likes = postData.likes.filter(id => id.toString() !== userId);
        await postData.save();
        res.status(200).json({
            success: true,
            message: 'Post unliked successfully',
            likesCount: postData.likes.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

// Get user's public posts (for profile - excludes anonymous posts)
const getUserPublicPosts = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const posts = await Post.find({
            user: userId,
            isAnonymous: false
        })
            .populate('user', 'name bio')
            .populate('comments')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            posts: posts.map(post => formatPostData(post))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

export { createPost, getPosts, getPostById, updatePost, deletePost, likePost, unlikePost, getUserPublicPosts };