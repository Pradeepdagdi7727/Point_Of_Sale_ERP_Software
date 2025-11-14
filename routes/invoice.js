const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  const { customerName, cart, finalAmount } = req.body;

  if (!cart || cart.length === 0) {
    return res.json({ success: false, message: "Cart is empty" });
  }

  // 1️⃣ Insert invoice data
  const invoiceSQL = `
    INSERT INTO invoices (customer_name, total_amount)
    VALUES (?, ?)
  `;

  db.query(invoiceSQL, [customerName, finalAmount], (err, result) => {
    if (err) {
      console.log("INVOICE SAVE ERROR:", err);
      return res.json({ success: false, message: "Invoice save failed" });
    }

    const invoiceId = result.insertId;

    // 2️⃣ Prepare item rows
    const itemValues = cart.map(item => [
      invoiceId,
      item.barcode || "",
      item.name,
      item.qty,
      item.price,      // item MRP
      item.discount,   // per unit discount FROM FRONTEND
      item.taxRate,    // tax percentage rate
      item.total       // final amount after tax
    ]);

    const itemsSQL = `
      INSERT INTO invoice_items 
      (invoice_id, barcode, item_name, quantity, price, discount, tax_rate, total)
      VALUES ?
    `;

    db.query(itemsSQL, [itemValues], (err2) => {
      if (err2) {
        console.log("ITEMS SAVE ERROR:", err2);
        return res.json({ success: false, message: "Invoice items save failed" });
      }

      return res.json({ success: true, message: "Invoice saved successfully" });
    });

  });
});

module.exports = router;
