// utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    // 1. Create the token payload with the user's ID
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token expires in 30 days
    });

    // 2. Set the token in an HTTP-only cookie for security
    res.cookie('jwt', token, {
        httpOnly: true, // Prevents client-side JS from reading the cookie (protects against XSS attacks)
        secure: process.env.NODE_ENV !== 'development', // Uses HTTPS in production
        sameSite: 'strict', // Protects against CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    });
};

export default generateToken;