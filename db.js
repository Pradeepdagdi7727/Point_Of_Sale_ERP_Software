const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectTimeout: 20000
});

db.connect(err => {
    if (err) {
        console.error('DB connection error:', err);
        return;
    }
    console.log("Connected to Railway MySQL!");
});

module.exports = db;