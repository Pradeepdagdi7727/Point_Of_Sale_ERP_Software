const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DB_HOST,       // Railway DB host
    user: process.env.DB_USER,       // Railway DB user
    password: process.env.DB_PASS,   // Railway DB password
    database: process.env.DB_NAME,   // Railway DB name
    port: process.env.PORT || 3306
});

db.connect(err => {
    if (err) {
        console.error("DB connection error:", err);
        process.exit(1);
    }
    console.log("Database connection successful");
});

module.exports = db;
