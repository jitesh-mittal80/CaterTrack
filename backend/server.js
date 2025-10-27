import express from "express";
import cors from "cors";
import db from "./db.js";
import env from "./env.js";
import foodRoutes from './routes/foodRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//paths 
app.use('/', authRoutes);
app.use('/Food_items', foodRoutes);
app.use('/user-orders', orderRoutes);

app.post("/create-account", async (req, res) => {
  const { name, email, password, mobile_no } = req.body;

  try {
    // Check if email already exists
    const [existingUser] = await db.query(
      "SELECT email FROM Customer WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    // Get the last customer ID
    const [rows] = await db.query(
      "SELECT cust_id FROM Customer ORDER BY cust_id DESC LIMIT 1"
    );

    let newId;
    if (rows.length > 0) {
      const lastId = rows[0].cust_id; // e.g. "NS105"
      const lastNum = parseInt(lastId.replace("NS", ""), 10);
      newId = "NS" + (lastNum + 1);
    } else {
      newId = "NS101"; // first user
    }

    // Insert new record
    await db.query(
      "INSERT INTO Customer (cust_id, name, email, password, mobile_no) VALUES (?, ?, ?, ?, ?)",
      [newId, name, email, password, mobile_no]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      customerId: newId,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.sqlMessage || err.message });
  }
});


const PORT = env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

