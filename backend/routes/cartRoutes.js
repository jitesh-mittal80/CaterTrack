import express from "express";
import db from "../db.js";
import {
  addToCart,
  updateQuantity,
  getCart,
  removeFromCart,
  placeOrder,
} from "../controllers/cartControllers.js";

const router = express.Router();

// Cart routes
router.post("/add", addToCart);
router.put("/update", updateQuantity);
router.get("/getCart/:cust_id", getCart);
router.delete("/remove", removeFromCart);
// Place order
router.post("/placeOrder", placeOrder);

export default router; 