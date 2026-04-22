import { verifyAccessToken } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.slice(7); // Remove 'Bearer ' prefix

        const decoded = verifyAccessToken(token);
        req.user = { id: decoded.userId };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access token expired'
            });
        }
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};
