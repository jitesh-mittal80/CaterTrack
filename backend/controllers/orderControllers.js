import db from "../db.js";
export const getUserOrders = async (req, res) => {
const { userId } = req.params;
  try {
    const [orders] = await db.query(
    `SELECT 
    o.order_id,
    o.cust_id,
    CONCAT(COUNT(oi.food_id), ' items') AS total_items,
    GROUP_CONCAT(f.food_name SEPARATOR ', ') AS items,
    CONCAT('₹', FORMAT(o.total_amount, 0)) AS total_price,
    DATE_FORMAT(o.order_date, '%Y-%m-%d at %h:%i %p') AS order_time,
    o.status
    FROM Orders o
    JOIN OrderItems oi ON o.order_id = oi.order_id
    JOIN Food_Items f ON oi.food_id = f.food_id
    WHERE o.cust_id = ?
    GROUP BY o.order_id, o.cust_id, o.total_amount, o.order_date, o.status
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
};
export const placeOrder = async (req,res) =>{
  const {transaction_id, cust_id} = req.body;
}