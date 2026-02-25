const express = require('express');
const cors = require('cors');
const path = require('path'); 
const authRoutes = require('./routes/auth');
const docRoutes = require('./routes/docs');
const employeesRoutes = require ('./routes/employees');
const publicUsersRoutes = require('./routes/public-users');
const resetPasswordRoutes = require('./routes/resetpassword'); 

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. Middlewares พื้นฐาน ---

app.use(cors({ 
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true 
})); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 2. ส่วนการจัดการไฟล์เอกสาร (Static Assets) ---

const handleThaiFileName = (req, res, next) => {
  try {
    req.url = decodeURIComponent(req.url).normalize('NFC');
    next();
  } catch (e) {
    console.error("URL Decoding Error:", e);
    next();
  }
};

app.use('/files', handleThaiFileName, express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', handleThaiFileName, express.static(path.join(__dirname, 'uploads')));

// --- 3. การกำหนด Routes ของ API ---

// เพิ่ม Route หน้าแรกเพื่อให้หน้าเว็บไม่ขึ้น Cannot GET /
app.get('/', (req, res) => {
  res.send('🚀 PEA CM2 Backend server is running perfectly!');
});

app.use('/api', authRoutes);
app.use('/api', docRoutes); 
app.use('/api', employeesRoutes); 
app.use('/api/public-users', publicUsersRoutes);
app.use('/api', resetPasswordRoutes);

// --- 4. เริ่มการทำงานของ Server (ปรับปรุงสำหรับ Render) ---

/**
 * ✅ แก้ไขจุดตาย: บน Render ห้ามเช็ค process.env.NODE_ENV !== 'production' 
 * เพราะ Render ต้องการให้สั่ง app.listen เสมอเพื่อให้เครื่อง Server เปิดทำงานได้
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});

// คงเดิมห้ามแก้ไขส่วนนี้เพื่อรองรับกรณีรันบน Vercel ในอนาคต
module.exports = app;