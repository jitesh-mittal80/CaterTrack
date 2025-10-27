import db from "../db.js";
export const loginUser = async (req, res) => {
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
};

export const signupUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [existingUser] = await db.query(
      "SELECT * FROM customer WHERE email = ?",
      [email]
    ); 
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }
    const [result] = await db.query(
      "INSERT INTO customer (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    res.status(201).json({ success: true, message: "Signup successful", userId: result.insertId });
  } catch (err) {
    console.error("Database error:", err.sqlMessage || err.message);
    res.status(500).json({ error: "Database error" });
  }
};
