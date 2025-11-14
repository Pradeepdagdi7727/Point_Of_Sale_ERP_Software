const mysql  = require("mysql");

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'supermarketDB'
});

db.connect(err => {
    if (err) {
        console.error('DB connection error:', err);
        process.exit(1);
    }
    console.log("database connection successfull");
});

module.exports = db;
