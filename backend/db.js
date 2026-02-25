// db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  // เปลี่ยนจากค่าตายตัว ให้ไปอ่านจาก Environment Variables ที่ตั้งไว้ใน Render
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // *** สำคัญมาก: Render บังคับให้ใช้ SSL สำหรับ External Connection ***
  ssl: {
    rejectUnauthorized: false
  }
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

module.exports = pool;