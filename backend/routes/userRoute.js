import express from "express";
import { getUser, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.route('/:id').get(getUser);
router.route('/profile/update').post(updateProfile);

export default router;