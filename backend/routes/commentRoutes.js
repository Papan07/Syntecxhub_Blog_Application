import express from 'express';
import {
  getCommentsByPostId,
  addComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:postId')
  .get(getCommentsByPostId)
  .post(protect, addComment);

router.route('/:id').delete(protect, deleteComment);

export default router;
