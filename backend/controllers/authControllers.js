
import db from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.cust_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const signupUser = async (req, res) => {
  const { name, email, password, mobile_no } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: "name,email,password required" });

  try {
    const [existing] = await db.query("SELECT * FROM customer WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: "Email already in use" });

    const [rows] = await db.query("SELECT cust_id FROM customer ORDER BY cust_id DESC LIMIT 1");
    let newId = "NS101";
    if (rows.length > 0) {
      const lastId = rows[0].cust_id || "";
      const lastNum = parseInt(lastId.replace(/^NS/, ""), 10) || 100;
      newId = "NS" + (lastNum + 1);
    }

    await db.query(
      "INSERT INTO customer (cust_id, name, email, password, mobile_no) VALUES (?, ?, ?, ?, ?)",
      [newId, name, email, password, mobile_no || null]
    );

    const user = { cust_id: newId, name, email, mobile_no: mobile_no || null };
    const token = generateToken(user);

    res.status(201).json({ success: true, message: "Signup successful", user, token });
  } catch (err) {
    console.error("signupUser error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "email and password required" });

  try {
    const [results] = await db.query("SELECT * FROM customer WHERE email = ? AND password = ?", [email, password]);
    if (results.length === 0) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const user = results[0];
    const safeUser = { cust_id: user.cust_id, name: user.name, email: user.email, mobile_no: user.mobile_no };
    const token = generateToken(safeUser);

    res.json({ success: true, message: "Login successful", user: safeUser, token });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

export const getMe = async (req, res) => {
  // requireAuth middleware attaches req.user
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
