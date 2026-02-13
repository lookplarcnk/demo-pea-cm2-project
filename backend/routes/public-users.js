// filepath: backend/routes/public-users.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/public-users - ดึงข้อมูล public_users ทั้งหมด
router.get('/', async (req, res) => {
  try {
    // แก้ไขจาก phone เป็น phone_no AS phone เพื่อให้ตรงกับฐานข้อมูลของคุณ
    const result = await pool.query(`
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        phone_no AS phone, 
        gender, 
        status, 
        created_at 
      FROM public_users 
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).json({ error: 'Database Error: ' + err.message });
  }
});

// PATCH /api/public-users/:id/status - ส่วนนี้คงเดิมตามที่คุณระบุไว้
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  try {
    const current = await pool.query('SELECT status FROM public_users WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    const newStatus = current.rows[0].status === 'ใช้งานอยู่' ? 'ระงับการใช้งาน' : 'ใช้งานอยู่';
    await pool.query('UPDATE public_users SET status = $1 WHERE id = $2', [newStatus, id]);
    res.json({ message: 'อัปเดตสถานะสำเร็จ' });
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).json({ error: 'Database Error: ไม่สามารถอัปเดตสถานะได้ ' + err.message });
  }
});

module.exports = router;