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
  const { name, email, password, mobile_no } = req.body;
  console.log(req.body)
  try {
    const [existingUser] = await db.query(
      "SELECT * FROM customer WHERE email = ?",
      [email]
    ); 
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }
    // if (mobile_no.length != 10) {
    //   return res.status(409).json({ success: false, message: "Mobile Number must have 10 digits" });
    // }
    // Get the last customer ID
    const [rows] = await db.query(
      "SELECT cust_id FROM customer ORDER BY cust_id DESC LIMIT 1"
    );
    let newId = 'NS101';
    if (rows.length > 0) {
      const lastId = rows[0].cust_id;
      const lastNum = parseInt(lastId.replace("NS", ""), 10);
      newId = "NS" + (lastNum + 1);
    }

    //Inserting into DB
    const [result] = await db.query(
      "INSERT INTO customer (cust_id,name, email, password, mobile_no) VALUES (?, ?, ?,?,?)",
      [newId,name,email, password,mobile_no]
    );
    res.status(201).json({ success: true, message: "Signup successful", userId: result.insertId });
    console.log("Signup successful")
  } catch (err) {
    console.error("Database error:", err.sqlMessage || err.message);
    res.status(500).json({ error: "Database error" });
  }
};
