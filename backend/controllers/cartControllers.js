import db from "../db.js";

// Add item to cart
// POST /cart/add
export const addToCart = async (req, res) => {
  try {
    const { cust_id, food_id, qty = 1 } = req.body; // Default qty = 1

    if (!cust_id || !food_id) {
      return res.status(400).json({ message: "Missing cust_id or food_id" });
    }

    // Check if cart exists for customer
    const [existingCart] = await db.query(
      "SELECT transaction_id FROM Cart WHERE cust_id = ?",
      [cust_id]
    );

    let transaction_id;
    if (existingCart.length === 0) {
      // Create new cart
      const [insertCart] = await db.query(
        "INSERT INTO Cart (cust_id, cart_total) VALUES (?, 0)",
        [cust_id]
      );
      transaction_id = insertCart.insertId;
    } else {
      transaction_id = existingCart[0].transaction_id;
    }

    // Insert or update cart item
    const [existingItem] = await db.query(
      "SELECT * FROM Cart_Items WHERE transaction_id = ? AND food_id = ?",
      [transaction_id, food_id]
    );

    if (existingItem.length > 0) {
      await db.query(
        "UPDATE Cart_Items SET qty = qty + ? WHERE transaction_id = ? AND food_id = ?",
        [qty, transaction_id, food_id]
      );
    } else {
      await db.query(
        "INSERT INTO Cart_Items (transaction_id, food_id, qty) VALUES (?, ?, ?)",
        [transaction_id, food_id, qty]
      );
    }

    // Update cart total
    await db.query(
      `UPDATE Cart c
       JOIN (
         SELECT ci.transaction_id, SUM(ci.qty * f.price) AS total
         FROM Cart_Items ci
         JOIN Food_items f ON ci.food_id = f.food_id
         WHERE ci.transaction_id = ?
         GROUP BY ci.transaction_id
       ) AS t ON c.transaction_id = t.transaction_id
       SET c.cart_total = t.total`,
      [transaction_id]
    );

    res.status(201).json({ message: "Item added to cart successfully", transaction_id });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: err.message });
  }
};


// GET /cart/:cust_id
export const getCart = async (req, res) => {
  const { cust_id } = req.params;

  try {
    const [rows] = await db.query(
      // `SELECT ci.food_id, f.food_name, f.price, ci.qty
      //  FROM Cart_Items ci
      //  JOIN Food_items f ON ci.food_id = f.food_id
      //  JOIN cart c ON c.transaction_id = ci.transaction_id
      //  WHERE c.cust_id = ?;`,
      `SELECT c.transaction_id AS transaction_id,
              ci.food_id,
              f.food_name,
              f.price,
              ci.qty
       FROM Cart_Items ci
       JOIN Food_items f ON ci.food_id = f.food_id
       JOIN Cart c ON c.transaction_id = ci.transaction_id
       WHERE c.cust_id = ?;`,
      [cust_id]
    );

    if (rows.length === 0)
      return res.status(200).json({ message: "Cart is empty", items: [] });

    res.status(200).json({ message: "Cart fetched successfully", items: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching cart", details: err.sqlMessage });
  }
};

//  Update quantity of an item
export const updateQuantity = async (req, res) => {
  const { transaction_id, food_id, qty } = req.body;
try {
  // Update quantity in Cart_Items
  const [result] = await db.query(
    "UPDATE Cart_Items SET qty = ? WHERE transaction_id = ? AND food_id = ?",
    [qty, transaction_id, food_id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Item not found in cart" });
  }

  // Recalculate and update Cart total
  await db.query(
    `UPDATE Cart 
     SET cart_total = (
       SELECT IFNULL(SUM(CI.qty * FI.price), 0)
       FROM Cart_Items CI
       JOIN Food_Items FI ON CI.food_id = FI.food_id
       WHERE CI.transaction_id = ?
     )
     WHERE transaction_id = ?`,
    [transaction_id, transaction_id]
  );

  res.status(200).json({ message: "Quantity updated" });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Server error while updating quantity"});
}
};

//  Remove single item from cart
export const removeFromCart = async (req, res) => {
  const { transaction_id, food_id } = req.body;

  try {
    await db.query("DELETE FROM Cart_Items WHERE transaction_id = ? AND food_id = ?", [transaction_id, food_id]);

    await db.query(
      `UPDATE Cart 
       SET cart_total = (
         SELECT IFNULL(SUM(CI.qty * FI.price), 0)
         FROM Cart_Items CI 
         JOIN Food_Items FI ON CI.food_id = FI.food_id
         WHERE CI.transaction_id = Cart.transaction_id
       )
       WHERE transaction_id = ?`,
      [transaction_id]
    );

    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error removing item from cart" });
  }
};

// //  Clear entire cart by customer ID
// export const clearCart = async (req, res) => {
//   const { cust_id } = req.body;

//   try {
//     const [cart] = await db.query("SELECT transaction_id FROM Cart WHERE cust_id = ?", [cust_id]);
//     if (cart.length === 0) return res.status(404).json({ message: "No cart found" });

//     const transaction_id = cart[0].transaction_id;

//     await db.query("DELETE FROM Cart_Items WHERE transaction_id = ?", [transaction_id]);
//     await db.query("DELETE FROM Cart WHERE transaction_id = ?", [transaction_id]);

//     res.status(200).json({ message: "Cart cleared successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error clearing cart" });
//   }
// };

//  Place order using stored procedure
export const placeOrder = async (req, res) => {
  const { transaction_id, cust_id, status } = req.body;
  // const allowedStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled']; // Update with your actual allowed values

  try {
    await db.query("CALL PlaceOrderFromCart(?, ?, ?)", [transaction_id, cust_id, status]);
    res.status(200).json({ message: "Order placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error placing order", details: err.sqlMessage });
  }
};

