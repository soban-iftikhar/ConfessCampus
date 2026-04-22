import express from 'express';
import { createPost, getPosts, getPostById, updatePost, deletePost, likePost, unlikePost } from '../controllers/postController.js';

const router = express.Router();

router.route('/')
    .get(getPosts)
    .post(createPost);

router.route('/:id')
    .get(getPostById)
    .put(updatePost)
    .delete(deletePost);

router.route('/:id/like')
    .post(likePost);

router.route('/:id/unlike')
    .post(unlikePost);


export default router;