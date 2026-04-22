import express from 'express';
import passport from 'passport';
import { signup, login, refreshAccessToken, logoutUser, getUser, googleCallback, googleAuthFailure } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Email/Password auth
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/refresh').post(refreshAccessToken);
router.route('/logout').post(authMiddleware, logoutUser);
router.route('/:id').get(getUser);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/google/callback', passport.authenticate('google', { 
    failureRedirect: '/api/auth/google/failure',
    session: false 
}), googleCallback);

router.get('/google/failure', googleAuthFailure);

export default router;