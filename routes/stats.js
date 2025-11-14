const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM invoices) AS totalInvoices,
      (SELECT IFNULL(SUM(total_amount), 0) FROM invoices WHERE DATE(created_at) = CURDATE()) AS todayRevenue,
      (SELECT COUNT(DISTINCT customer_name) FROM invoices) AS totalCustomers,
      (SELECT IFNULL(SUM(quantity), 0) FROM invoice_items) AS totalQuantity
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("STATS ERROR:", err);
      return res.json({ success: false });
    }

    res.json({ success: true, data: rows[0] });
  });
});

module.exports = router;
