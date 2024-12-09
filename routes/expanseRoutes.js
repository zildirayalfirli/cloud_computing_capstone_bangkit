import express from 'express';
import {
  createExpanse,
  getAllExpanses,
  getExpanseById,
  updateExpanse,
  deleteExpanse,
} from '../controllers/expanseController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/expanse', verifyToken, createExpanse);
router.get('/expanse', verifyToken, getAllExpanses);
router.get('/expanse/:id', verifyToken, getExpanseById);
router.put('/expanse/:id', verifyToken, updateExpanse);
router.delete('/expanse/:id', verifyToken, deleteExpanse);

export default router;
