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
 * ✅ แก้ไข: ปรับปรุง CORS ให้รองรับทั้ง Localhost และ Production URL ของ Vercel
 * เพื่อให้ Frontend ที่ Deploy แล้วสามารถติดต่อ Backend ได้
 */
app.use(cors({ 
  origin: true, // ✅ ปรับเป็น true เพื่อให้รองรับทุก Origin ในช่วงเริ่มต้น Deploy
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
 */
const handleThaiFileName = (req, res, next) => {
  try {
    req.url = decodeURIComponent(req.url).normalize('NFC');
    next();
  } catch (e) {
    console.error("URL Decoding Error:", e);
    next();
  }
};

/**
 * ตั้งค่า Static Folder เพื่อรองรับการ Preview เอกสารฉบับจริง
 */
app.use('/files', handleThaiFileName, express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', handleThaiFileName, express.static(path.join(__dirname, 'uploads')));

// --- 3. การกำหนด Routes ของ API ---
app.use('/api', authRoutes);
app.use('/api', docRoutes); 
app.use('/api', employeesRoutes); 
app.use('/api/public-users', publicUsersRoutes);
app.use('/api', resetPasswordRoutes);

// --- 4. เริ่มการทำงานของ Server ---
// ตรวจสอบว่าไม่ได้รันบน Vercel (Serverless) ถึงจะสั่ง app.listen
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server (index.js) running at http://localhost:${PORT}`);
  });
}

// ✅ ส่วนสำคัญ: ส่งออก app เพื่อให้ Vercel (Serverless Functions) นำไปใช้งานได้
module.exports = app;