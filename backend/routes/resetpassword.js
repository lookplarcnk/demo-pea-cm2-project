const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const router = express.Router();
const pool = require("../db");

/* ================= 1. API: Forgot Password ================= */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // ระบุ public.schema เพื่อความแม่นยำตามโครงสร้าง Postgres
    let userResult = await pool.query("SELECT * FROM public.public_users WHERE email = $1", [email]);
    let tableName = "public.public_users";
    let emailCol = "email";

    if (userResult.rows.length === 0) {
      userResult = await pool.query("SELECT * FROM public.employees WHERE emp_email = $1", [email]);
      tableName = "public.employees";
      emailCol = "emp_email";
    }

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); 

    await pool.query(
      `UPDATE ${tableName} SET reset_password_token = $1, reset_password_expires = $2 WHERE ${emailCol} = $3`,
      [resetToken, expires, email]
    );

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    res.json({ 
      message: "สร้างลิงก์สำหรับรีเซ็ตรหัสผ่านสำเร็จ", 
      resetLink: resetUrl 
    });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์: " + err.message });
  }
});

/* ================= 2. API: Reset Password ================= */
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // ใช้ password_hash สำหรับ public_users และ emp_password สำหรับ employees ตามที่คุณแจ้ง
    let userResult = await pool.query(
      "SELECT id as uid, 'public.public_users' as source, 'password_hash' as pass_col, 'id' as id_col FROM public.public_users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
      [token]
    );
    
    if (userResult.rows.length === 0) {
      userResult = await pool.query(
        "SELECT emp_id as uid, 'public.employees' as source, 'emp_password' as pass_col, 'emp_id' as id_col FROM public.employees WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
        [token]
      );
    }

    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: "ลิงก์หมดอายุหรือรหัสตรวจสอบไม่ถูกต้อง" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      `UPDATE ${user.source} SET ${user.pass_col} = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE ${user.id_col} = $2`,
      [hashedPassword, user.uid]
    );

    res.json({ message: "เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว" });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์" });
  }
});

module.exports = router;