const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// --- ตั้งค่า Multer สำหรับการอัปโหลดไฟล์จริง ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // อย่าลืมสร้างโฟลเดอร์ uploads/ ที่ Root ของโปรเจกต์
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- ⭐ API สำหรับระบบส่งเอกสารพิจารณา (Document Submission) ---

// 1. ดึงรายชื่อพนักงานที่มีบทบาทหัวหน้าแผนกเท่านั้น (สำหรับเลือกผู้อนุมัติ)
router.get('/employees/approvers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT emp_id, emp_name, dept_name, emp_email 
      FROM employees 
      WHERE role = 'หัวหน้าแผนก' 
      ORDER BY emp_name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Get Approvers Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลหัวหน้าแผนกได้" });
  }
});

// 2. ดึงข้อมูลพนักงานรายบุคคล (สำหรับ User Profile)
router.get('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM employees WHERE emp_id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "ไม่พบข้อมูลพนักงาน" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database Error" });
  }
});

// 3. รับอัปโหลดไฟล์และบันทึกการส่งเอกสารพิจารณา
router.post('/documents/submit', upload.single('file'), async (req, res) => {
  const { doc_name, category, description, approver_id, requester_id } = req.body;
  const file_url = req.file ? `/uploads/${req.file.filename}` : null;
  const file_size = req.file ? (req.file.size / (1024 * 1024)).toFixed(2) + " MB" : "0 MB";

  try {
    const result = await pool.query(
      `INSERT INTO documents 
        (doc_name, cat_id, file_url, file_size, owner, approver_id, description, status, created_at) 
        VALUES ($1, (SELECT cat_id FROM categories WHERE cat_name = $2 LIMIT 1), $3, $4, 
        (SELECT emp_name FROM employees WHERE emp_id = $5), $6, $7, 'รออนุมัติ', CURRENT_TIMESTAMP) 
        RETURNING *`,
      [doc_name, category, file_url, file_size, requester_id, approver_id, description]
    );
    res.status(201).json({ success: true, doc_id: result.rows[0].doc_id });
  } catch (err) {
    console.error("Submit Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถส่งเอกสารพิจารณาได้" });
  }
});

// --- 1. API สำหรับหมวดหมู่ (Categories) ---
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY cat_id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  const { cat_name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (cat_name) VALUES ($1) RETURNING *',
      [cat_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "ไม่สามารถเพิ่มหมวดหมู่ได้" });
  }
});

router.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE documents SET cat_id = NULL WHERE cat_id = $1', [id]);
    const result = await pool.query('DELETE FROM categories WHERE cat_id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "ไม่พบหมวดหมู่ที่ต้องการลบ" });
    }
    res.json({ message: "ลบหมวดหมู่สำเร็จ", deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Database Error: ไม่สามารถลบหมวดหมู่ได้" });
  }
});

// --- 2. API สำหรับแผนก (Departments) ---
router.get('/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY dept_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Get Departments Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลแผนกได้" });
  }
});

// --- 3. API สำหรับเอกสาร (Documents) ---
router.get('/documents', async (req, res) => {
  try {
    const { requester_id } = req.query;
    let result;
    
    if (requester_id) {
      result = await pool.query(`
        SELECT d.*, c.cat_name as category, e.emp_name as approver_name, emp.dept_name
        FROM documents d
        LEFT JOIN categories c ON d.cat_id = c.cat_id
        LEFT JOIN employees e ON d.approver_id = e.emp_id
        LEFT JOIN employees emp ON d.owner = emp.emp_name
        WHERE d.owner = (SELECT emp_name FROM employees WHERE emp_id = $1)
        AND d.approver_id IS NOT NULL
        ORDER BY d.created_at DESC
      `, [requester_id]);
    } else {
      result = await pool.query(`
        SELECT d.*, c.cat_name as category, e.emp_name as approver_name, emp.dept_name as dept
        FROM documents d
        LEFT JOIN categories c ON d.cat_id = c.cat_id
        LEFT JOIN employees e ON d.approver_id = e.emp_id
        LEFT JOIN employees emp ON d.owner = emp.emp_name
        ORDER BY d.created_at DESC
      `);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/documents', async (req, res) => {
  const { doc_name, cat_id, file_url, file_size, require_login, fiscal_year, dept, owner, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO documents (doc_name, cat_id, file_url, file_size, require_login, fiscal_year, dept, owner, status, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) 
        RETURNING *`,
      [doc_name, cat_id, file_url, file_size, require_login, fiscal_year, dept, owner, status]
    );
    const completeDoc = await pool.query(`
      SELECT d.*, c.cat_name as category FROM documents d
      LEFT JOIN categories c ON d.cat_id = c.cat_id
      WHERE d.doc_id = $1
    `, [result.rows[0].doc_id]);
    res.status(201).json(completeDoc.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/documents/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE documents SET status = $1 WHERE doc_id = $2 RETURNING *',
      [status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "ไม่พบเอกสารที่ต้องการอัปเดตสถานะ" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "ไม่สามารถอัปเดตสถานะได้" });
  }
});

router.delete('/documents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM documents WHERE doc_id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "ไม่พบเอกสารที่ต้องการลบ" });
    }
    res.json({ message: "ลบเอกสารสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: "ไม่สามารถลบเอกสารได้" });
  }
});

router.get('/employee/documents', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, c.cat_name as category 
      FROM documents d
      LEFT JOIN categories c ON d.cat_id = c.cat_id
      WHERE d.status = 'อนุมัติแล้ว'
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Employee Docs Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลเอกสารสำหรับพนักงานได้" });
  }
});

// --- 4. API สำหรับค้นหาเอกสาร (Public Search) ---
router.get('/public/documents/regulations', async (req, res) => {
  try {
    const { query, year, dept } = req.query;
    let sql = `
      SELECT d.*, c.cat_name as category 
      FROM documents d
      LEFT JOIN categories c ON d.cat_id = c.cat_id
      WHERE (c.cat_name ILIKE '%กฎระเบียบ นโยบาย และข้อบังคับ%' OR d.cat_id = 4) 
      AND d.status = 'อนุมัติแล้ว'
    `;
    const params = [];
    let paramCount = 1;
    if (query) {
      sql += ` AND d.doc_name ILIKE $${paramCount} `;
      params.push(`%${query}%`);
      paramCount++;
    }
    if (year && year !== 'ทั้งหมด') {
      sql += ` AND d.fiscal_year = $${paramCount} `;
      params.push(year);
      paramCount++;
    }
    if (dept && dept !== 'ทั้งหมด') {
      sql += ` AND d.dept = $${paramCount} `;
      params.push(dept);
      paramCount++;
    }
    sql += ` ORDER BY d.created_at DESC `;
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/public/documents/manuals', async (req, res) => {
  try {
    const { query, year, dept } = req.query;
    let sql = `
      SELECT d.*, c.cat_name as category 
      FROM documents d
      LEFT JOIN categories c ON d.cat_id = c.cat_id
      WHERE (c.cat_name ILIKE '%คู่มือ%' OR c.cat_name ILIKE '%SOP%' OR d.cat_id IN (1, 2))
      AND d.status = 'อนุมัติแล้ว'
    `;
    const params = [];
    let paramCount = 1;
    if (query) {
      sql += ` AND d.doc_name ILIKE $${paramCount} `;
      params.push(`%${query}%`);
      paramCount++;
    }
    if (year && year !== 'ทั้งหมด') {
      sql += ` AND d.fiscal_year = $${paramCount} `;
      params.push(year);
      paramCount++;
    }
    if (dept && dept !== 'ทั้งหมด') {
      sql += ` AND d.dept = $${paramCount} `;
      params.push(dept);
      paramCount++;
    }
    sql += ` ORDER BY d.created_at DESC `;
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Search Manuals Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/public/documents/forms', async (req, res) => {
  try {
    const { query, dept } = req.query;
    let sql = `
      SELECT d.*, c.cat_name as category 
      FROM documents d
      LEFT JOIN categories c ON d.cat_id = c.cat_id
      WHERE (d.cat_id = 6 OR c.cat_name ILIKE '%แบบฟอร์ม%')
      AND d.status = 'อนุมัติแล้ว'
    `;
    const params = [];
    let paramCount = 1;
    if (query) {
      sql += ` AND d.doc_name ILIKE $${paramCount} `;
      params.push(`%${query}%`);
      paramCount++;
    }
    if (dept && dept !== 'ทั้งหมด') {
      sql += ` AND d.dept = $${paramCount} `;
      params.push(dept);
      paramCount++;
    }
    sql += ` ORDER BY d.created_at DESC `;
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Search Forms Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/public/documents/procurement', async (req, res) => {
  try {
    const { query, dept, year } = req.query;
    let sql = `
      SELECT d.*, c.cat_name as category 
      FROM documents d
      LEFT JOIN categories c ON d.cat_id = c.cat_id
      WHERE (d.cat_id = 7 OR c.cat_name ILIKE '%จัดซื้อจัดจ้าง%')
      AND d.status = 'อนุมัติแล้ว'
    `;
    const params = [];
    let paramCount = 1;
    if (query) {
      sql += ` AND d.doc_name ILIKE $${paramCount} `;
      params.push(`%${query}%`);
      paramCount++;
    }
    if (year && year !== 'ทั้งหมด') {
      sql += ` AND d.fiscal_year = $${paramCount} `;
      params.push(year);
      paramCount++;
    }
    if (dept && dept !== 'ทั้งหมด') {
      sql += ` AND d.dept = $${paramCount} `;
      params.push(dept);
      paramCount++;
    }
    sql += ` ORDER BY d.created_at DESC `;
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Search Procurement Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- 5. API สำหรับ Preview เอกสาร ---
router.get('/preview/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT doc_name, owner, dept, file_url, require_login 
      FROM documents 
      WHERE doc_id = $1
    `, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลเอกสารในระบบ" });
    }

    const doc = result.rows[0];
    const fileName = doc.doc_name;
    const previewUrl = `/files/${encodeURIComponent(fileName)}.pdf`;
    
    res.json({ 
      previewUrl, 
      owner: doc.owner, 
      dept: doc.dept,
      require_login: doc.require_login 
    });
  } catch (err) {
    console.error("Preview API Error:", err.message);
    res.status(500).json({ error: "เกิดข้อผิดพลาดทางระบบในการดึงข้อมูล Preview" });
  }
});

// --- 6. API สำหรับดึงเอกสารอัปเดตล่าสุด ---
router.get('/latest-updates', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.doc_id as id, 
        d.doc_name as title, 
        c.cat_name as category, 
        d.file_url as url, 
        d.file_size as size, 
        d.owner as uploader, 
        d.dept as department,
        d.created_at,
        COALESCE(d.download_count, 0) as downloads 
      FROM documents d
      LEFT JOIN categories c ON d.cat_id = c.cat_id
      WHERE d.status = 'อนุมัติแล้ว'
      ORDER BY d.created_at DESC
      LIMIT 5
    `);

    const formattedData = result.rows.map(doc => {
      const date = new Date(doc.created_at);
      const thaiDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear() + 543}`;
      return { 
        ...doc, 
        uploadDate: thaiDate 
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error("Latest Updates Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลเอกสารอัปเดตล่าสุดได้" });
  }
});

// --- 7. API สำหรับเพิ่มจำนวนดาวน์โหลด ---
router.patch('/documents/:id/download', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE documents 
        SET download_count = COALESCE(download_count, 0) + 1 
        WHERE doc_id = $1 
        RETURNING download_count`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "ไม่พบเอกสาร" });
    res.json({ success: true, newCount: result.rows[0].download_count });
  } catch (err) {
    console.error("Download Update Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถอัปเดตจำนวนดาวน์โหลดได้" });
  }
});

// --- ⭐ API สำหรับหน้า Analytical Report (Admin Analytics) ---
router.get('/admin/analytics', async (req, res) => {
  try {
    const { start, end, period } = req.query;
    
    let docTimeFilter = "d.created_at >= date_trunc('month', CURRENT_DATE)";
    let empTimeFilter = "e.created_at >= date_trunc('month', CURRENT_DATE)";
    let pubTimeFilter = "p.created_at >= date_trunc('month', CURRENT_DATE)";
    const filterParams = [];

    if (start && end) {
      if (start === end) {
        docTimeFilter = "d.created_at::date = $1";
        empTimeFilter = "e.created_at::date = $1";
        pubTimeFilter = "p.created_at::date = $1";
        filterParams.push(start);
      } else {
        docTimeFilter = "d.created_at BETWEEN $1 AND $2";
        empTimeFilter = "e.created_at BETWEEN $1 AND $2";
        pubTimeFilter = "p.created_at BETWEEN $1 AND $2";
        filterParams.push(`${start} 00:00:00`, `${end} 23:59:59`);
      }
    } else if (period === "ไตรมาสล่าสุด") {
      docTimeFilter = "d.created_at >= CURRENT_DATE - INTERVAL '3 months'";
      empTimeFilter = "e.created_at >= CURRENT_DATE - INTERVAL '3 months'";
      pubTimeFilter = "p.created_at >= CURRENT_DATE - INTERVAL '3 months'";
    } else if (period === "ประจำปี 2568") {
      docTimeFilter = "EXTRACT(YEAR FROM d.created_at) = 2025";
      empTimeFilter = "EXTRACT(YEAR FROM e.created_at) = 2025";
      pubTimeFilter = "EXTRACT(YEAR FROM p.created_at) = 2025";
    }

    const newEmp = await pool.query(`SELECT COUNT(*) FROM employees e WHERE ${empTimeFilter}`, filterParams);
    const newPub = await pool.query(`SELECT COUNT(*) FROM public_users p WHERE ${pubTimeFilter}`, filterParams);
    const docsCount = await pool.query(`SELECT COUNT(*) FROM documents d WHERE ${docTimeFilter}`, filterParams);
    const approved = await pool.query(`SELECT COUNT(*) FROM documents d WHERE d.status = 'อนุมัติแล้ว' AND ${docTimeFilter}`, filterParams);

    const deptStats = await pool.query(`
      SELECT e.dept_name as label, 
      ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM documents d WHERE ${docTimeFilter}), 0)), 0)::text || '%' as percent
      FROM documents d
      JOIN employees e ON d.owner = e.emp_name
      WHERE ${docTimeFilter}
      GROUP BY e.dept_name ORDER BY COUNT(*) DESC LIMIT 3
    `, filterParams);

    const weeklyUsage = await pool.query(`
      SELECT to_char(day, 'Dy') as label, COALESCE(count(d.doc_id), 0) as height 
      FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') day
      LEFT JOIN documents d ON date_trunc('day', d.created_at) = day
      GROUP BY day ORDER BY day ASC
    `);

    res.json({
      totalNewUsers: { count: newEmp.rows[0].count, trend: "+10%", isUp: true },
      totalNewPublicUsers: { count: newPub.rows[0].count }, 
      docs: { count: docsCount.rows[0].count, trend: "+5%", isUp: true },
      logins: { count: "85", trend: "+2%", isUp: true },
      approved: { count: approved.rows[0].count, trend: "+12%", isUp: true },
      weeklyUsage: weeklyUsage.rows,
      departments: deptStats.rows.map((d, i) => ({
        ...d,
        color: ["bg-indigo-500", "bg-purple-500", "bg-amber-500"][i] || "bg-slate-500"
      }))
    });
  } catch (err) {
    console.error("Admin Analytics Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถประมวลผลข้อมูลวิเคราะห์ได้" });
  }
});

// ⭐ API สำหรับดึงสถิติภาพรวม (Admin Stats Summary)
router.get('/admin/stats', async (req, res) => {
  try {
    const docsAll = await pool.query('SELECT COUNT(*) FROM documents');
    const docsMonth = await pool.query("SELECT COUNT(*) FROM documents WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)");
    const empCount = await pool.query('SELECT COUNT(*) FROM employees');
    const pubCount = await pool.query('SELECT COUNT(*) FROM public_users');
    const empMonth = await pool.query("SELECT COUNT(*) FROM employees WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)");
    const pubMonth = await pool.query("SELECT COUNT(*) FROM public_users WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)");

    res.json({
      totalDocs: parseInt(docsAll.rows[0].count) || 0,
      docsThisMonth: parseInt(docsMonth.rows[0].count) || 0,
      totalUsers: (parseInt(empCount.rows[0].count) || 0) + (parseInt(pubCount.rows[0].count) || 0),
      newUsersThisMonth: (parseInt(empMonth.rows[0].count) || 0) + (parseInt(pubMonth.rows[0].count) || 0)
    });
  } catch (err) {
    console.error("Admin Stats Summary Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ⭐ แก้ไข: API สำหรับส่งออกรายการเอกสาร เพื่อให้รองรับการกรองตาม Period (รองรับทั้ง Excel และ PDF)
router.get('/export/excel/documents', async (req, res) => {
  try {
    const { start, end, period } = req.query;
    let timeFilter = "TRUE";
    const params = [];

    if (start && end) {
      if (start === end) {
        timeFilter = "d.created_at::date = $1";
        params.push(start);
      } else {
        timeFilter = "d.created_at BETWEEN $1 AND $2";
        params.push(`${start} 00:00:00`, `${end} 23:59:59`);
      }
    } else if (period === "ไตรมาสล่าสุด") {
      timeFilter = "d.created_at >= CURRENT_DATE - INTERVAL '3 months'";
    } else if (period === "ประจำปี 2568") {
      timeFilter = "EXTRACT(YEAR FROM d.created_at) = 2025";
    } else if (period === "ประจำเดือนนี้") {
      timeFilter = "d.created_at >= date_trunc('month', CURRENT_DATE)";
    }

    const result = await pool.query(`
      SELECT 
        d.doc_id as id, 
        d.doc_name as title, 
        e.dept_name as dept, 
        d.owner, 
        d.status, 
        COALESCE(d.download_count, 0) as downloads
      FROM documents d
      LEFT JOIN employees e ON d.owner = e.emp_name
      WHERE ${timeFilter}
      ORDER BY d.created_at DESC
    `, params);

    const formattedData = result.rows.map(row => ({
      "รหัสเอกสาร": row.id,
      "ชื่อเอกสาร": row.title,
      "แผนก": row.dept,
      "ผู้ส่งคำขอ": row.owner,
      "สถานะ": row.status,
      "ยอดดาวน์โหลด": row.downloads,
      id: row.id,
      title: row.title,
      dept: row.dept,
      status: row.status,
      downloads: row.downloads
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Export API Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลสำหรับส่งออกได้" });
  }
});

// ⭐ แก้ไข: เพิ่ม Endpoint เฉพาะสำหรับ PDF กรองช่วงเวลา
router.get('/export/pdf/documents', async (req, res) => {
  try {
    const { start, end, period } = req.query;
    let timeFilter = "TRUE";
    const params = [];

    if (start && end) {
      if (start === end) {
        timeFilter = "d.created_at::date = $1";
        params.push(start);
      } else {
        timeFilter = "d.created_at BETWEEN $1 AND $2";
        params.push(`${start} 00:00:00`, `${end} 23:59:59`);
      }
    } else if (period === "ไตรมาสล่าสุด") {
      timeFilter = "d.created_at >= CURRENT_DATE - INTERVAL '3 months'";
    } else if (period === "ประจำปี 2568") {
      timeFilter = "EXTRACT(YEAR FROM d.created_at) = 2025";
    } else if (period === "ประจำเดือนนี้") {
      timeFilter = "d.created_at >= date_trunc('month', CURRENT_DATE)";
    }

    const result = await pool.query(`
      SELECT 
        d.doc_id as id, 
        d.doc_name as title, 
        e.dept_name as dept, 
        d.status, 
        COALESCE(d.download_count, 0) as downloads
      FROM documents d
      LEFT JOIN employees e ON d.owner = e.emp_name
      WHERE ${timeFilter}
      ORDER BY d.created_at DESC
    `, params);

    res.json(result.rows);
  } catch (err) {
    console.error("PDF Export API Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลสำหรับ PDF ได้" });
  }
});

module.exports = router;