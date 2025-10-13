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
    // 1. Use [result] to get just the data rows from the query response.
    // 2. We use 'result' (singular) consistently.
    const [result] = await db.query("SELECT * FROM Food_items");

    // 3. Send back the 'result' variable that we defined above.
    res.json(result);

  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: err.message });
  }
});
// Endpoint for user login

app.post("/user-login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email+password);

  try {
    const [results] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (results.length > 0) {
      res.json({ success: true, message: "Login successful", user: results[0] });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
//write a query to insert a new column of image link in the food_items table
//write a query to add img links to the food_items table
//insert into food_items (img) values ('https://example.com/image1.jpg') where id = 1;
//insert into food_items (img) values ('https://example.com/image2.jpg') where id = 2;
//insert into food_items (img) values ('https://example.com/image3.jpg') where id = 3;
//insert into food_items (img) values ('https://example.com/image4.jpg') where id = 4;
//insert into food_items (img) values ('https://example.com/image5.jpg') where id = 5;
//insert into food_items (img) values ('https://example.com/image6.jpg') where id = 6;