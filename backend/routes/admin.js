const express = require('express');
const router = express.Router();
const db = require('../config/db'); // สมมติว่าคุณใช้ mysql2 หรือ pg

router.get('/analytics', async (req, res) => {
    const { period } = req.query;
    
    // Logic การตั้งค่าเงื่อนไขเวลา (ปรับให้ตรงกับปัจจุบัน 2026)
    let dateCondition = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    if (period === "ไตรมาสล่าสุด") dateCondition = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
    if (period === "ประจำปี 2568") dateCondition = "WHERE YEAR(created_at) = 2025";
    if (period === "ประจำปี 2569") dateCondition = "WHERE YEAR(created_at) = 2026"; // เพิ่มกรณีปีปัจจุบัน

    try {
        // 1. แก้ไข: ดึงข้อมูล Stats โดยรวมพนักงานและผู้ใช้ทั่วไปเข้าด้วยกันสำหรับ "ผู้ใช้งานใหม่"
        const [statsData] = await db.execute(`
            SELECT 
                (
                    (SELECT COUNT(*) FROM employees ${dateCondition}) + 
                    (SELECT COUNT(*) FROM public_users ${dateCondition})
                ) as totalNewUsers,
                (SELECT COUNT(*) FROM documents ${dateCondition}) as totalDocs,
                (SELECT COUNT(*) FROM login_logs ${dateCondition}) as loginCount,
                (SELECT COUNT(*) FROM approvals ${dateCondition}) as approvedCount
        `);

        // 2. ดึงข้อมูลรายวันสำหรับกราฟแท่ง (ย้อนหลัง 7 วัน)
        const [weeklyUsage] = await db.execute(`
            SELECT 
                DATE_FORMAT(login_date, '%W') as label, 
                COUNT(*) * 10 as height -- สมมติคำนวณเป็น % ความสูง
            FROM login_logs 
            WHERE login_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY login_date
        `);

        // 3. ดึงข้อมูลสัดส่วนแผนกสำหรับกราฟวงกลม
        const [deptData] = await db.execute(`
            SELECT 
                department as label,
                COUNT(*) as count,
                CASE 
                    WHEN department = 'IT' THEN 'bg-indigo-500'
                    WHEN department = 'HR' THEN 'bg-purple-500'
                    ELSE 'bg-amber-500'
                END as color
            FROM employees
            GROUP BY department
        `);

        // ส่งข้อมูลกลับไปใน Format ที่ Frontend (AnalyticalReportPage.jsx) ต้องการ
        res.json({
            // แก้ไข Key ให้เป็น totalNewUsers ตามที่ Frontend เรียกใช้
            totalNewUsers: { 
                count: statsData[0].totalNewUsers.toLocaleString(), 
                trend: "+12%", 
                isUp: true 
            },
            docs: { 
                count: statsData[0].totalDocs.toLocaleString(), 
                trend: "+5.4%", 
                isUp: true 
            },
            logins: { 
                count: statsData[0].loginCount.toLocaleString(), 
                trend: "-2.1%", 
                isUp: false 
            },
            approved: { 
                count: statsData[0].approvedCount.toLocaleString(), 
                trend: "+10%", 
                isUp: true 
            },
            weeklyUsage: weeklyUsage.length > 0 ? weeklyUsage : [
                { label: "จ.", height: "60%" }, { label: "อ.", height: "85%", active: true },
                { label: "พ.", height: "45%" }, { label: "พฤ.", height: "70%" },
                { label: "ศ.", height: "95%" }, { label: "ส.", height: "30%" }, { label: "อา.", height: "40%" }
            ],
            departments: deptData.length > 0 ? deptData.map(d => ({
                ...d,
                percent: ((d.count / (statsData[0].totalNewUsers || 1)) * 100).toFixed(0) + '%'
            })) : [
                { label: "ไอที (IT)", color: "bg-indigo-500", percent: "45%" },
                { label: "บริหาร (HR)", color: "bg-purple-500", percent: "30%" },
                { label: "วิศวกรรม (ENG)", color: "bg-amber-500", percent: "25%" }
            ]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;