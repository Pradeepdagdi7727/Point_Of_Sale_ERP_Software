const mysql  = require("mysql");

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,        // Railway host
    user: process.env.MYSQLUSER,        // Railway user
    password: process.env.MYSQLPASSWORD, // Railway password
    database: process.env.MYSQLDATABASE, // Railway database name
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
