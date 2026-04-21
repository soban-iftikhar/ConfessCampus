import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { singleUpload } from '../middlewares/multer.js';
import { moderateContent } from '../middlewares/moderation.js';
import { createPost, getPosts, deletePost } from '../controllers/post.controller.js';
import { toggleLike, addComment, getComments } from '../controllers/interaction.controller.js';

const router = express.Router();


router.route('/')
    .get(getPosts)
    .post(isAuthenticated, singleUpload, moderateContent, createPost);

router.route('/:id')
    .delete(isAuthenticated, deletePost);


router.route('/:id/like')
    .post(isAuthenticated, toggleLike);

router.route('/:id/comments')
    .get(getComments) // Public can read comments
    .post(isAuthenticated, moderateContent, addComment); // Moderation middleware apply

export default router;