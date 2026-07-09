const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "car_app",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection error:", err.message);
  } else {
    console.log("✅ MySQL Connected (car_app)");
  }
});

module.exports = db;