// const mysql = require("mysql2");
// require("dotenv").config();

// const db = mysql.createConnection({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "car_app",
// });

// db.connect((err) => {
//   if (err) {
//     console.error("❌ MySQL Connection error:", err.message);
//   } else {
//     console.log("✅ MySQL Connected (car_app)");
//   }
// });

// module.exports = db;

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "sql12.freesqldatabase.com",
  user: "sql12834568",
  password: "ZKDCfWt7N8",
  database: "sql12834568",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Database Connected");
  }
});

module.exports = db;