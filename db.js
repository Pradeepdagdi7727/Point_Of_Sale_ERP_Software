const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'supermarketDB',
    port: process.env.MYSQLPORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('DB connection error:', err);
        process.exit(1);
    }
    console.log("Database connection successful");
});

module.exports = db;
