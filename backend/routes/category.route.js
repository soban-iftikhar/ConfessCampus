// routes/category.route.js
import express from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(createCategory); // can lock this behind an admin middleware later 

export default router;