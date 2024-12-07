import express from 'express';
import {
  createIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
} from '../controllers/incomeController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/income', verifyToken, createIncome);
router.get('/income', verifyToken, getAllIncomes);
router.get('/income/:id', verifyToken, getIncomeById);
router.put('/income/:id', verifyToken, updateIncome);
router.delete('/income/:id', verifyToken, deleteIncome);

export default router;
