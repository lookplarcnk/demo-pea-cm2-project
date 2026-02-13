// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

/* =========================
   REGISTER PUBLIC USER
========================= */
router.post("/register-public", async (req, res) => {
  try {
    console.log("📨 Incoming Register:", req.body);

    const { firstName, lastName, email, phone, gender, password } = req.body || {};

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // ตรวจสอบอีเมลซ้ำ
    const exists = await pool.query(
      "SELECT id FROM public_users WHERE email = $1",
      [email]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // กำหนด role = public
    const result = await pool.query(
      `INSERT INTO public_users
        (first_name, last_name, email, phone_no, gender, password_hash, role)
       VALUES ($1,$2,$3,$4,$5,$6,'public')
       RETURNING id, first_name, last_name, email, phone_no, gender, role, created_at`,
      [firstName, lastName, email, phone || null, gender || null, passwordHash]
    );

    return res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error /register-public:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

/* =========================
   LOGIN PUBLIC USER
========================= */
router.post("/login-public", async (req, res) => {
  try {
    console.log("🔐 Incoming Login:", req.body);

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    const userRes = await pool.query(
      "SELECT * FROM public_users WHERE email = $1",
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }

    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    // ✅ สร้าง JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    return res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone_no,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Error /login-public:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

module.exports = router;
