import express from 'express';
import { createUser, loginUser, refreshAccessToken, logoutUser, getUser } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/signup').post(createUser);
router.route('/login').post(loginUser);
router.route('/refresh').post(refreshAccessToken);
router.route('/logout').post(authMiddleware, logoutUser);
router.route('/:id').get(getUser);

export default router;