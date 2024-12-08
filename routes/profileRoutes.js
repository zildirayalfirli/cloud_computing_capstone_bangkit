import express from "express";
import { 
    getProfile, 
    updateProfile 
} from "../controllers/profileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/getprofile", verifyToken, getProfile);
router.put("/editprofile", verifyToken, upload.single("profileImage"), updateProfile);

export default router;