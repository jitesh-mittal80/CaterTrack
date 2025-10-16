// server.js
import express from "express";
import cors from "cors";
import db from "./db.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/Food_items", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM Food_items");
    res.json(result);

  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/user-login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [results] = await db.query(
      "SELECT * FROM customer WHERE email = ? AND password = ?",
      [email, password]
    );

    if (results.length > 0) {
      res.json({ success: true, message: "Login successful", user: results[0] });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Database error:", err.sqlMessage || err.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/user-orders/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [orders] = await db.query(
      `
      SELECT 
        o.transaction_id AS order_id,
        o.cust_id,
        CONCAT(COUNT(oi.food_id), ' items') AS total_items,
        GROUP_CONCAT(f.food_name SEPARATOR ', ') AS items,
        CONCAT('₹', FORMAT(o.total_amount, 0)) AS total_price,
        DATE_FORMAT(o.order_date, '%Y-%m-%d at %h:%i %p') AS order_time,
        o.status
      FROM Orders o
      JOIN OrderItems oi ON o.transaction_id = oi.transaction_id
      JOIN Food_Items f ON oi.food_id = f.food_id
      WHERE o.cust_id = ?
      GROUP BY o.transaction_id, o.cust_id, o.total_amount, o.order_date, o.status
      ORDER BY o.order_date DESC;
      `,
      [userId]
    );

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Database error",
      details: err.sqlMessage || err.message,
    });
  }
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
