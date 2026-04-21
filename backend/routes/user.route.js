// routes/user.route.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { updateProfile } from "../controllers/user.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// 1. Must be logged in (isAuthenticated)
// 2. Must process any image attached (singleUpload)
// 3. Finally, run the controller logic (updateProfile)
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);

export default router;