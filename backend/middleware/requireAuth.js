import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../db.js";

dotenv.config();

export default async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Authorization header missing" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [results] = await db.query(
      "SELECT cust_id, name, email, mobile_no FROM customer WHERE cust_id = ?",
      [decoded.id]
    );

    if (results.length === 0)
      return res.status(401).json({ error: "Invalid or expired token" });

    req.user = results[0];
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
