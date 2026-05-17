import express from "express";
import { getUser, updateProfile, changePassword, deleteUser } from "../controllers/authController.js";
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Must come before /:id to avoid being matched by wildcard
router.route('/profile/update').post(authMiddleware, updateProfile);
router.route('/change-password').post(authMiddleware, changePassword);
router.route('/delete').delete(authMiddleware, deleteUser);
router.route('/:id').get(getUser);

export default router;