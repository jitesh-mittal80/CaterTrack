import db from "../db.js";

export const getAllFoodItems = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM Food_items");
    res.json(result);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: err.message });
  }
}