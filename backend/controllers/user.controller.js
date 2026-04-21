// controllers/user.controller.js
import User from '../models/user.model.js';

// @desc    Update user profile (bio, avatar, name)
// @route   POST /api/users/profile/update
export const updateProfile = async (req, res, next) => {
    try {
        const { name, bio } = req.body;
        const userId = req.id; // This comes directly from your isAuthenticated middleware!

        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                errorCode: 404
            });
        }

        // Update fields if the user provided them in the request
        if (name) user.name = name;
        if (bio) user.bio = bio;

        // If your frontend partner sends an image file, Multer will attach it to req.file
        if (req.file) {
            // For now, we will just save the local path. (If you use Cloudinary later, you'd save that URL here)
            user.avatar = req.file.path; 
        }

        await user.save();

        // Send the exact response format requested in the midterm spec (Section 3.2)
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            createdAt: user.createdAt
        });

    } catch (error) {
        next(error);
    }
};