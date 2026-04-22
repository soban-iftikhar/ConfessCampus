import jwt from 'jsonwebtoken';

const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.ACCESS_TOKEN_SECRET || 'access_secret_key',
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key',
        { expiresIn: '7d' }
    );
};

const generateTokens = (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || 'access_secret_key'
    );
};

const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key'
    );
};

export {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken
};
