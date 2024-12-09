import express from "express";
import { getTotalCashWallet, getTotalDigitalPaymentWallet } from "../controllers/walletController.js";
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/cash", verifyToken, getTotalCashWallet);
router.get("/digital-payment", verifyToken, getTotalDigitalPaymentWallet);

export default router;
