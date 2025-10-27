import express from 'express';
import { getUserOrders } from "../controllers/orderControllers.js";

const router = express.Router();

router.get("/:userId", getUserOrders);

export default router;
