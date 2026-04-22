import User from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';

export const signup = async (req, res, next) => {
    try {
        const { name, username, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !username || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Check if user exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            return res.status(409).json({
                success: false,
                message: "Email or username already exists"
            });
        }

        // Create user (password will be hashed by pre-save hook)
        const user = await User.create({
            name,
            username,
            email,
            password
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id.toString());

        // Store refresh token
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(201).json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                isAnonymous: user.isAnonymous
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password required"
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Validate password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id.toString());

        // Store refresh token
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                isAnonymous: user.isAnonymous
            }
        });
    } catch (error) {
        next(error);
    }
};

export const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token required"
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if refresh token exists in user's tokens
        if (!user.refreshTokens.includes(refreshToken)) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Generate new access token
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());

        // Replace old refresh token with new one
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        res.status(200).json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Refresh token expired"
            });
        }
        next(error);
    }
};

export const logoutUser = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Remove refresh token
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                isAnonymous: user.isAnonymous
            }
        });
    } catch (error) {
        next(error);
    }
};

// Google OAuth callback - called by Passport
export const googleCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(req.user._id.toString());

        // Store refresh token
        req.user.refreshTokens.push(refreshToken);
        await req.user.save();

        // Redirect to frontend with tokens
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(
            `${frontendURL}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}&id=${req.user._id}`
        );
    } catch (error) {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendURL}/auth/failed?error=${error.message}`);
    }
};

// OAuth failure handler
export const googleAuthFailure = (req, res) => {
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/auth/failed?error=Authentication failed`);
};