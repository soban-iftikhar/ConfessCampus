import User from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';

export const createUser = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email required"
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const user = await User.create({ name, email });

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
                email: user.email,
                bio: user.bio,
                isAnonymous: user.isAnonymous
            }
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
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
                email: user.email,
                bio: user.bio,
                isAnonymous: user.isAnonymous
            }
        });
    } catch (error) {
        next(error);
    }
};