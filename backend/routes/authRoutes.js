import express from 'express';
import { loginUser,signupUser,getMe } from "../controllers/authControllers.js";
import  requireAuth  from '../middleware/requireAuth.js';


const router = express.Router();
router.post("/login", loginUser);
router.post("/signup", signupUser);
router.get('/me', requireAuth, getMe);

export default router;