const express = require("express");
const router = express.Router();
const db = require("../db"); // ✅ ensure db.js exports a connected MySQL instance

// ✅ POST route to add new item
router.post("/", (req, res) => {
  const { barcode, name, category, quantity, price, discount, finalPrice } = req.body;

  if (!barcode || !name || !category || !quantity || !price) {
    return res.json({ success: false, message: "Please fill all required fields." });
  }

  const sql = `
    INSERT INTO items (barcode, name, category, quantity, price, discount, final_Price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [barcode, name, category, quantity, price, discount, finalPrice], (err, result) => {
    if (err) {
      console.error("❌ Error inserting item:", err);
      return res.json({ success: false, message: "Database error while inserting item." });
    }

    res.json({ success: true, message: "✅ Item added successfully!" });
  });
});

module.exports = router;
