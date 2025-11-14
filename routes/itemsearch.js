const express = require("express");
const router = express.Router();
const db = require("../db");

// 🔍 Search items by name or barcode
router.get("/", (req, res) => {
  const q = req.query.q;

  if (!q || q.trim() === "") {
    return res.json([]);
  }

  const sql = `
    SELECT id, barcode, name, category, price, discount, final_price
    FROM items
    WHERE name LIKE ? OR barcode LIKE ?
    LIMIT 10
  `;

  const searchTerm = `%${q}%`;
  db.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("Error fetching items:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});
// 🔹 Fetch single product by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT id, barcode, name, category, price, discount, final_price FROM items WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching product by ID:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(results[0]);
  });
});


module.exports = router;
