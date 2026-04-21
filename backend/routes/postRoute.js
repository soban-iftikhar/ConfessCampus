import express from 'express';
import { createPost, getPosts, deletePost } from '../controllers/postController.js';
import { toggleLike, addComment, getComments } from '../controllers/interactionController.js';

const router = express.Router();

router.route('/')
    .get(getPosts)
    .post(createPost);

router.route('/:id')
    .delete(deletePost);

router.route('/:id/like')
    .post(toggleLike);

router.route('/:id/comments')
    .get(getComments)
    .post(addComment);

export default router;