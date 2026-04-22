import dotenv from 'dotenv';

// Load env vars first, before any other imports
dotenv.config({});

import express from 'express';
import session from 'express-session';
import connectDB from './utils/db.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import passport, { initializeGoogleStrategy } from './config/passport.js';
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import messageRoute from "./routes/messageRoute.js";

// Initialize Google OAuth strategy after env vars are loaded
initializeGoogleStrategy();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET || 'session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Public routes
app.use("/api/auth", authRoute);

// Protected routes
app.use("/api/users", authMiddleware, userRoute);
app.use("/api/posts", authMiddleware, postRoute);
app.use("/api/messages", authMiddleware, messageRoute);

app.get('/', (req, res) => {
    res.send('ConfessCampus API running');
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});

