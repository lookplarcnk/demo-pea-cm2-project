const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const bcrypt = require('bcryptjs');

// ---------------------------------------------------------
// 1. ดึงข้อมูลพนักงานทั้งหมด (รองรับการแสดงรูปโปรไฟล์)
// ---------------------------------------------------------
router.get('/employees', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        emp_id, 
        emp_name, 
        emp_email, 
        emp_phone, 
        emp_gender, 
        dept_name, 
        role, 
        status,
        avatar, 
        created_at 
      FROM employees 
      ORDER BY emp_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้" });
  }
});

// ---------------------------------------------------------
// 2. ระบบเข้าสู่ระบบพนักงาน (Login) - ✅ ปรับปรุงการตรวจสอบข้อมูลให้แม่นยำขึ้น
// ---------------------------------------------------------
router.post('/employees/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ แก้ไข: ใช้ TRIM และ LOWER เพื่อป้องกันปัญหาเว้นวรรคและตัวพิมพ์เล็ก-ใหญ่จากหน้าเว็บ
    const userEmail = email ? email.toLowerCase().trim() : "";

    // ค้นหาพนักงานด้วยอีเมล
    const result = await pool.query('SELECT * FROM employees WHERE LOWER(TRIM(emp_email)) = $1', [userEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "ไม่พบอีเมลพนักงานนี้ในระบบ" });
    }

    const user = result.rows[0];

    // ตรวจสอบสถานะการใช้งาน
    if (user.status === 'ระงับการใช้งาน') {
      return res.status(403).json({ message: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อแอดมิน" });
    }

    // ตรวจสอบรหัสผ่านด้วย bcrypt
    // ⚠️ หมายเหตุ: พนักงานบางคนใน DB คุณยังเป็น Plain Text (เช่น ENG-7721) ซึ่งจะทำให้เปรียบเทียบไม่ได้
    const isMatch = await bcrypt.compare(password, user.emp_password);
    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    // ส่งข้อมูลกลับตามโครงสร้างที่ Loginemployee.jsx ต้องการ
    res.json({
      token: "jwt-token-placeholder", 
      user: {
        id: user.emp_id,
        name: user.emp_name,
        email: user.emp_email,
        dept: user.dept_name,
        role: user.role || "Officer",
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Database Error", details: err.message });
  }
});

// ---------------------------------------------------------
// 3. บันทึกพนักงานใหม่ (คงเดิมตามคำสั่ง)
// ---------------------------------------------------------
router.post('/employees', async (req, res) => {
  const { 
    emp_email, 
    emp_password, 
    emp_name, 
    dept_name, 
    role, 
    emp_phone, 
    emp_gender 
  } = req.body;

  try {
    if (!emp_email || !emp_name || !emp_password) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลอีเมล ชื่อ และรหัสผ่านให้ครบถ้วน" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(emp_password, salt);

    const result = await pool.query(
      `INSERT INTO employees (
        emp_email, 
        emp_password, 
        emp_name, 
        dept_name, 
        role, 
        emp_phone, 
        emp_gender, 
        status,
        created_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'ใช้งานอยู่', CURRENT_TIMESTAMP) 
      RETURNING emp_id, emp_name, emp_email, role, dept_name`,
      [
        emp_email, 
        hashedPassword, 
        emp_name, 
        dept_name || 'ไม่ระบุ', 
        role || 'พนักงานทั่วไป', 
        emp_phone || null, 
        emp_gender || 'ชาย'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Insert Error:", err.code);
    if (err.code === '23505') {
      return res.status(400).json({ error: "อีเมลนี้มีอยู่ในระบบแล้ว" });
    }
    res.status(500).json({ error: "ไม่สามารถบันทึกพนักงานได้" });
  }
});

// ---------------------------------------------------------
// 4. แก้ไขโปรไฟล์ (คงเดิมตามคำสั่ง)
// ---------------------------------------------------------
router.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { emp_name, emp_email, emp_phone, role, avatar, dept_name } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees 
       SET emp_name = COALESCE($1, emp_name), 
           emp_email = COALESCE($2, emp_email), 
           emp_phone = COALESCE($3, emp_phone), 
           role = COALESCE($4, role),
           avatar = COALESCE($5, avatar),
           dept_name = COALESCE($6, dept_name)
       WHERE emp_id::text = $7
       RETURNING emp_id, emp_name, emp_email, role, dept_name, avatar, status`,
      [emp_name, emp_email, emp_phone, role, avatar, dept_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลพนักงาน" });
    }

    res.json({ message: "อัปเดตโปรไฟล์สำเร็จ", user: result.rows[0] });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถแก้ไขข้อมูลได้" });
  }
});

// ---------------------------------------------------------
// 5. เปลี่ยนสถานะการใช้งาน (คงเดิมตามคำสั่ง)
// ---------------------------------------------------------
router.patch('/employees/:id/status', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE employees 
       SET status = CASE WHEN status = 'ใช้งานอยู่' THEN 'ระงับการใช้งาน' ELSE 'ใช้งานอยู่' END 
       WHERE emp_id::text = $1
       RETURNING status`, 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบพนักงาน" });
    }

    res.json({ message: "เปลี่ยนสถานะสำเร็จ", status: result.rows[0].status });
  } catch (err) {
    console.error("Status Update Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถเปลี่ยนสถานะได้" });
  }
});

module.exports = router;