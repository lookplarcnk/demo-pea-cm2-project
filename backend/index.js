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

/**
 * ✅ แก้ไข: ปรับปรุง CORS ให้รองรับการส่ง Header และ Credentials
 * เพื่อป้องกันปัญหา "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้" เมื่อ Frontend พยายามส่ง Token
 */
app.use(cors({ 
  origin: "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true 
})); 

/**
 * ✅ แก้ไข: เพิ่ม Middleware สำหรับ Parse ข้อมูล JSON และ URL-encoded
 * ต้องวางไว้ก่อนการประกาศ Routes ทุกชนิด เพื่อให้ req.body ไม่เป็น undefined
 */
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 2. ส่วนการจัดการไฟล์เอกสาร (Static Assets) ---

/**
 * Middleware ขั้นสูงสำหรับจัดการชื่อไฟล์ภาษาไทยและการแมปชื่อไฟล์ฉบับจริง
 * 1. ถอดรหัส URL (decodeURIComponent) สำหรับอักขระพิเศษภาษาไทย
 * 2. ทำ Unicode Normalization (NFC) เพื่อให้ Express ค้นหาไฟล์บนดิสก์เจอ 
 * แม้ชื่อไฟล์จะถูกบันทึกมาจากระบบปฏิบัติการที่ต่างกัน (Windows/Mac/Linux)
 */
const handleThaiFileName = (req, res, next) => {
  try {
    // ถอดรหัส %E0%B9... และปรับรูปแบบตัวอักษรให้เป็นมาตรฐานเดียวกัน
    req.url = decodeURIComponent(req.url).normalize('NFC');
    next();
  } catch (e) {
    console.error("URL Decoding Error:", e);
    next();
  }
};

/**
 * ตั้งค่า Static Folder เพื่อรองรับการ Preview เอกสารฉบับจริง
 * แก้ปัญหา 404 โดยแมปทุกลิงก์ที่เรียกหา /files หรือ /uploads เข้าไปยังโฟลเดอร์ 'uploads' จริง
 * หมายเหตุ: ต้องวาง handleThaiFileName ไว้หน้า express.static เสมอเพื่อให้ถอดรหัสชื่อก่อนค้นหาไฟล์
 */
app.use('/files', handleThaiFileName, express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', handleThaiFileName, express.static(path.join(__dirname, 'uploads')));

// --- 3. การกำหนด Routes ของ API ---
/**
 * ✅ ตรวจสอบ: Routes เหล่านี้จะสามารถเข้าถึง req.body ได้แล้ว 
 * เพราะมีการประกาศ express.json() ไว้ด้านบนเรียบร้อยแล้ว
 */
app.use('/api', authRoutes);
app.use('/api', docRoutes); 
app.use('/api', employeesRoutes); 
app.use('/api/public-users', publicUsersRoutes);
app.use('/api', resetPasswordRoutes);

// --- 4. เริ่มการทำงานของ Server ---
app.listen(PORT, () => {
  console.log(`🚀 Backend server (index.js) running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'uploads')}`);
  console.log(`✅ Thai filename support & Unicode Normalization: Enabled`);
  console.log(`📦 JSON Body Parser: Ready`);
});