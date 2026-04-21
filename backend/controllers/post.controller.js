import Post from '../models/post.model.js';


export const createPost = async (req, res, next) => {
    try {
        const { content, category, isAnonymous } = req.body;
        const userId = req.id; // Comes from isAuthenticated middleware

        if (!content || !category) {
            return res.status(400).json({
                success: false,
                message: "Content and category are required",
                errorCode: 400
            });
        }

        let imageString = null;
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            imageString = `data:${req.file.mimetype};base64,${b64}`;
        }

        const post = await Post.create({
            content,
            category, 
            isAnonymous: isAnonymous === 'true' || isAnonymous === true,
            image: imageString,
            user: userId,
            status: 'approved' // approved because of middleware
        });

        res.status(201).json({
            success: true,
            post: {
                id: post._id,
                content: post.content,
                isAnonymous: post.isAnonymous,
                category: post.category,
                image: post.image,
                createdAt: post.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .populate('user', 'name avatar') 
            .populate('category', 'name');  

        const formattedPosts = posts.map(post => ({
            id: post._id,
            content: post.content,
            image: post.image,
            category: post.category,
            isAnonymous: post.isAnonymous,
            // If anonymous is true, return null for the user object. Otherwise, return the user data.
            user: post.isAnonymous ? null : post.user,
            likesCount: post.likesCount, // Uses the virtual property from your schema!
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
                message: "Post not found",
                errorCode: 404
            });
        }

        if (post.user.toString() !== req.id) {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized to delete this post",
                errorCode: 401
            });
        }

        await post.deleteOne();
        
        res.status(200).json({ 
            success: true, 
            message: "Post deleted successfully" 
        });
    } catch (error) {
        next(error);
    }
};