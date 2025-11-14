const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("../db");

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

/*
  REGISTER endpoint (example). Use this to create users with hashed password.
  If you already have users with plain passwords, see migration script below.
*/
router.post("/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Provide fullname, email, password" });
    }

    // check existing
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err)
          return res.status(500).json({ success: false, message: "DB error" });
        if (results.length > 0)
          return res
            .status(400)
            .json({ success: false, message: "Email already registered" });

        // hash password
        const saltRounds = 10;
        const hashed = await bcrypt.hash(password, saltRounds);

        const insert =
          "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)";
        db.query(insert, [fullname, email, hashed], (err2, res2) => {
          if (err2)
            return res
              .status(500)
              .json({ success: false, message: "DB insert error" });
          return res.json({ success: true, message: "User registered" });
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* LOGIN: compare plaintext password with stored hash */
router.post("/", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.send(
      "<script>alert('Please enter both email and password!'); window.location.href='/';</script>"
    );
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.send(
          "<script>alert('Database error'); window.location.href='/';</script>"
        );
      }

      if (results.length === 0) {
       
         
          return res.json({ success: false, message: "Invalid email or password!" });

        
      }

      const user = results[0];
      const hashed = user.password;

      try {
        const match = await bcrypt.compare(password, hashed);
        if (match) {
          return res.json({ success: true, message: "Login successful" });
          
        } else {
         return res.json({ success: false, message: "Invalid email or password!" });

        }
      } catch (compareErr) {
        console.error(compareErr);
        return res.send(
          "<script>alert('Server error'); window.location.href='/';</script>"
        );
      }
    }
  );
});

module.exports = router;
