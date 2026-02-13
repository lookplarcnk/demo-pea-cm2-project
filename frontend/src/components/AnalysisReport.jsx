import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import LogoutModal from "./LogoutModal"; 
// ✅ นำเข้าคอมโพเนนต์โปรไฟล์ใหม่
import AdminProfileModal from "./AdminProfileModal";
import Logo from "../assets/img/logo-pea.png"; // ✅ นำเข้า Logo
import {
  FiPieChart, FiFileText, FiUsers, FiTrendingUp, FiSettings, FiLogOut,
  FiMenu, FiCalendar, FiArrowUpRight, FiArrowDownRight, FiDownload, FiChevronDown, FiX, FiCamera, FiCheck, FiRefreshCw,
  FiCheckCircle, FiSend // ✅ เพิ่มการนำเข้าไอคอนที่ขาดไปตรงนี้
} from "react-icons/fi";
import jsPDF from "jspdf";
import "jspdf-autotable"; 
import html2canvas from "html2canvas";
import * as XLSX from "xlsx"; 

export default function AnalyticalReportPage() {
  const navigate = useNavigate(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("ประจำเดือนนี้");
  
  const [selectedDate, setSelectedDate] = useState("");

  // --- State สำหรับข้อมูลจากฐานข้อมูล ---
  const [stats, setStats] = useState([
    { title: "ผู้ใช้งานใหม่", value: "0", trend: "0%", up: true },
    { title: "เอกสารที่บันทึก", value: "0", trend: "0%", up: true },
    { title: "การเข้าใช้งานระบบ", value: "0", trend: "0%", up: false },
    { title: "สิทธิ์ที่อนุมัติแล้ว", value: "0", trend: "0%", up: true },
  ]);
  const [usageData, setUsageData] = useState([]); 
  const [deptData, setDeptData] = useState([]);   
  const [loading, setLoading] = useState(true);

  // ✅ แก้ไข: ดึงข้อมูลจาก localStorage เพื่อให้โปรไฟล์คงที่ทุกหน้า
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("pea-admin-user");
    const adminData = savedUser ? JSON.parse(savedUser) : null;
    return {
      name: adminData?.name || "Admin Ratchaneekorn",
      role: adminData?.role || "System Administrator",
      email: adminData?.email || "admin.ratcha@pea.co.th",
      phone: adminData?.phone || "081-234-5678",
      department: adminData?.dept || "กองบริหาร", 
      employeeId: adminData?.id || "ADM-67001",
      avatar: adminData?.avatar || "https://i.pravatar.cc/150?u=admin"
    };
  });

  // ✅ ฟังก์ชันดึงข้อมูลจาก Database
  const fetchAnalytics = useCallback(async () => {
    try {
      let queryParams = `period=${reportPeriod}`;
      if (selectedDate) {
        queryParams += `&start=${selectedDate}&end=${selectedDate}`;
      }

      // ดึงข้อมูลวิเคราะห์ภาพรวม
      const statsRes = await fetch(`http://localhost:5000/api/admin/analytics?${queryParams}`);
      const statsData = await statsRes.json();

      if (statsRes.ok) {
        // ⭐ นำจำนวนผู้ใช้งานใหม่จากพนักงานและบุคคลทั่วไปมารวมกัน
        const combinedNewUsers = (parseInt(statsData.totalNewUsers?.count) || 0) + (parseInt(statsData.totalNewPublicUsers?.count) || 0);

        setStats([
          { 
            title: "ผู้ใช้งานใหม่", 
            value: combinedNewUsers.toLocaleString() || "0", 
            trend: statsData.totalNewUsers?.trend || "0%", 
            up: statsData.totalNewUsers?.isUp ?? true 
          },
          { 
            title: "เอกสารที่บันทึก", 
            value: statsData.docs?.count?.toLocaleString() || "0", 
            trend: statsData.docs?.trend || "0%", 
            up: statsData.docs?.isUp ?? true 
          },
          { 
            title: "การเข้าใช้งานระบบ", 
            value: statsData.logins?.count?.toLocaleString() || "0", 
            trend: statsData.logins?.trend || "0%", 
            up: statsData.logins?.isUp ?? true 
          },
          { 
            title: "สิทธิ์ที่อนุมัติแล้ว", 
            value: statsData.approved?.count?.toLocaleString() || "0", 
            trend: statsData.approved?.trend || "0%", 
            up: statsData.approved?.isUp ?? true 
          },
        ]);

        // ดึงข้อมูลสัดส่วนรายแผนก
        setDeptData(statsData.departments || []);

        // ดึงข้อมูลกราฟแนวโน้ม (เปรียบเทียบความสูงตามข้อมูลจริง)
        if (statsData.weeklyUsage && statsData.weeklyUsage.length > 0) {
          const maxVal = Math.max(...statsData.weeklyUsage.map(d => parseInt(d.height) || 0));
          const processedUsage = statsData.weeklyUsage.map((d, i) => ({
            label: d.label,
            height: maxVal > 0 ? `${(parseInt(d.height) / maxVal) * 80 + 15}%` : "15%",
            active: i === statsData.weeklyUsage.length - 1
          }));
          setUsageData(processedUsage);
        }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [reportPeriod, selectedDate]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); 
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const downloadExcel = async () => {
    try {
      const resDocs = await fetch(`http://localhost:5000/api/export/excel/documents`);
      const docsData = await resDocs.json();
      const resStats = await fetch(`http://localhost:5000/api/admin/stats`);
      const statsData = await resStats.json();

      const workbook = XLSX.utils.book_new();
      const wsDocs = XLSX.utils.json_to_sheet(docsData);
      XLSX.utils.book_append_sheet(workbook, wsDocs, "คลังเอกสาร");

      const userSummary = [
        ["หัวข้อสรุป", "จำนวน (ราย)"],
        ["ผู้ใช้งานทั้งหมด", statsData.totalUsers],
        ["ผู้ใช้งานใหม่เดือนนี้", statsData.newUsersThisMonth],
        ["เอกสารทั้งหมดในระบบ", statsData.totalDocs],
        ["เอกสารที่อัปโหลดเดือนนี้", statsData.docsThisMonth],
        ["วันที่ออกรายงาน", new Date().toLocaleDateString("th-TH")]
      ];
      const wsUsers = XLSX.utils.aoa_to_sheet(userSummary);
      XLSX.utils.book_append_sheet(workbook, wsUsers, "สรุปจำนวนผู้ใช้งาน");
      
      XLSX.writeFile(workbook, `Analytical-PEA-${reportPeriod}.xlsx`);
    } catch (error) {
      alert("ไม่สามารถดาวน์โหลดไฟล์ Excel ได้");
    }
  };

  // ✅ แก้ไข: Export PDF แบบสร้าง Table อัตโนมัติจาก Data (ไม่ใช่ภาพหน้าจอ)
  const downloadPDF = async () => {
    try {
      setLoading(true);
      const resDocs = await fetch(`http://localhost:5000/api/export/excel/documents`);
      const docsData = await resDocs.json();
      const resStats = await fetch(`http://localhost:5000/api/admin/stats`);
      const totalStats = await resStats.json();

      const doc = new jsPDF();
      
      // ส่วนหัวเอกสาร
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text("Analytical Report - PEA CM2", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Period: ${selectedDate || reportPeriod}`, 14, 28);
      doc.text(`Report Generated at: ${new Date().toLocaleString("th-TH")}`, 14, 34);

      // 1. ตารางสรุปสถิติหลัก
      doc.autoTable({
        startY: 40,
        head: [['Metric Category', 'Count', 'Trend']],
        body: [
          ['New Registered Users', stats[0].value, stats[0].trend],
          ['Total Documents Processed', stats[1].value, stats[1].trend],
          ['Active System Logins', stats[2].value, stats[2].trend],
          ['Approved Document Rights', stats[3].value, stats[3].trend],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' }
      });

      // 2. ตารางสัดส่วนแผนก
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text("Departmental Engagement Statistics", 14, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Department Name', 'Engagement Percentage']],
        body: deptData.map(d => [d.label, d.percent]),
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] } // Purple
      });

      // 3. รายการเอกสารล่าสุด (ขึ้นหน้าใหม่)
      doc.addPage();
      doc.text("Detailed Document Overview", 14, 15);
      doc.autoTable({
        startY: 20,
        head: [['ID', 'Document Title', 'Department', 'Status', 'Downloads']],
        body: docsData.map(d => [
            d["รหัสเอกสาร"], 
            d["ชื่อเอกสาร"], 
            d["แผนก"], 
            d["สถานะ"], 
            d["ยอดดาวน์โหลด"]
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 118, 110] } // Teal
      });

      doc.save(`PEA-Analytical-Data-${reportPeriod}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("pea-admin-token"); 
    setOpenLogoutModal(false);
    navigate("/"); 
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] font-sans text-slate-700 overflow-x-hidden text-left font-medium">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* ✅ แก้ไข: เปลี่ยนจากตัวอักษร A เป็น Logo การไฟฟ้า */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-50 text-left">
          <img 
            src={Logo} 
            alt="PEA Logo" 
            className="h-12 w-auto object-contain" 
          />
          <div className="leading-tight text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight">PEA ADMIN</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Chiang Mai 2 System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left">
          <Link to="/AdminDashboard"><SidebarItem icon={<FiPieChart />} label="หน้าสรุปผล (Overview)" /></Link>
          <Link to="/ManageDocs"><SidebarItem icon={<FiFileText />} label="จัดการเอกสารทั้งหมด" /></Link>
          <Link to="/AdminApprovalCenter"><SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" /></Link> 
          <Link to="/AdminSubmitApproval"><SidebarItem icon={<FiSend />} label="ส่งเอกสารให้พิจารณา" /></Link> 
          <Link to="/UserManage"><SidebarItem icon={<FiUsers />} label="จัดการผู้ใช้งาน" /></Link>
          <Link to="/AnalysisReport"><SidebarItem icon={<FiTrendingUp />} label="รายงานเชิงวิเคราะห์" active /></Link>
        </nav>
        <div className="p-6 border-t border-slate-50 space-y-2 font-bold text-left">
          <Link to="/AdminSetting"><SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" /></Link>
          <div onClick={() => setOpenLogoutModal(true)} className="cursor-pointer">
            <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto text-left">
        <div className="bg-white/50 backdrop-blur-md px-4 lg:px-10 py-6 border-b border-slate-100 sticky top-0 z-30 font-bold flex justify-between items-center">
          <div className="flex items-center gap-3 text-left">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 lg:hidden text-slate-600 flex items-center justify-center"><FiMenu size={20} /></button>
            <div className="flex flex-col text-left">
                <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">รายงานเชิงวิเคราะห์</h2>
                <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Dashboard
                </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                <FiCalendar className="text-slate-500" size={16} />
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  className="bg-transparent text-xs font-black outline-none border-none p-0 text-slate-700 w-28 uppercase" 
                />
                {selectedDate && (
                  <button onClick={() => setSelectedDate("")} className="ml-1 text-slate-400 hover:text-rose-500 transition-colors">
                    <FiX size={14}/>
                  </button>
                )}
            </div>

            <div className="flex gap-2">
                <button onClick={downloadExcel} className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest"><FiFileText size={14} /> EXCEL</button>
                <button onClick={downloadPDF} className="hidden md:flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest"><FiDownload size={14} /> PDF</button>
            </div>
            
            <div className="relative group">
               <select className="appearance-none bg-indigo-600 text-white pl-4 pr-10 py-2.5 rounded-xl text-sm font-black outline-none cursor-pointer shadow-lg transition-all hover:bg-indigo-700 uppercase tracking-widest" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
                  <option>ประจำเดือนนี้</option>
                  <option>ไตรมาสล่าสุด</option>
                  <option>ประจำปี 2568</option>
               </select>
               <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={14} />
            </div>

            <button onClick={() => setOpenProfileModal(true)} className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white shadow-md active:scale-95 transition-transform shrink-0">
              <img src={user.avatar} className="w-full h-full object-cover" alt="profile" />
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 space-y-8 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <ReportCard key={i} {...s} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-[450px]">
              <div className="flex justify-between items-center mb-8">
                <div className="text-left">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">แนวโน้มการเข้าใช้งาน</h3>
                  <p className="text-sm text-slate-400 font-bold">ข้อมูลสถิติรายวันเปรียบเทียบความหนาแน่น</p>
                </div>
                <button onClick={fetchAnalytics} className="p-2 text-slate-300 hover:text-indigo-600 transition-all active:rotate-180"><FiRefreshCw size={20}/></button>
              </div>
              <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4">
                {usageData.length > 0 ? usageData.map((d, i) => (
                  <Bar key={i} height={d.height} label={d.label} active={d.active} />
                )) : <p className="w-full text-center text-slate-300 italic">กำลังเชื่อมต่อข้อมูล...</p>}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-[450px]">
              <h3 className="text-lg font-black text-slate-800 mb-1 uppercase tracking-wider text-left">สัดส่วนผู้ใช้งาน</h3>
              <p className="text-sm text-slate-400 font-bold mb-8 text-left">แยกตามความเคลื่อนไหวรายแผนก</p>
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="w-48 h-48 rounded-full border-[20px] border-slate-50 relative flex items-center justify-center shadow-lg">
                  <div className="absolute inset-[-20px] rounded-full border-[20px] border-transparent border-t-indigo-500 border-r-purple-500 rotate-45 transition-transform duration-1000"></div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-slate-800">100%</p>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-tighter">Engagement</p>
                  </div>
                </div>
                <div className="mt-8 w-full space-y-4">
                  {deptData.length > 0 ? deptData.map((dept, i) => (
                    <DeptLegend key={i} {...dept} />
                  )) : <p className="text-center text-slate-300 italic">ไม่มีข้อมูลแผนก</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ เรียกใช้ AdminProfileModal แทนของเดิม */}
      {openProfileModal && (
        <AdminProfileModal 
          user={user} 
          setUser={setUser} 
          onClose={() => setOpenProfileModal(false)} 
        />
      )}
      <LogoutModal isOpen={openLogoutModal} onClose={() => setOpenLogoutModal(false)} onConfirm={handleConfirmLogout} />
    </div>
  );
}

/* --- Helper Components (คงเดิม) --- */

function ReportCard({ title, value, trend, up }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-left">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">{title}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-black text-slate-800 tracking-tight leading-none group-hover:scale-105 transition-transform origin-left">{value}</h4>
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black ${up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
          {up ? <FiArrowUpRight size={12}/> : <FiArrowDownRight size={12}/>}
          {trend}
        </div>
      </div>
    </div>
  );
}

function Bar({ height, label, active }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-3 group cursor-pointer text-left">
      <div className="w-full relative flex flex-col justify-end h-48 bg-slate-50/50 rounded-2xl overflow-hidden group-hover:bg-slate-100 transition-all border border-transparent group-hover:border-slate-200">
        <div 
            style={{ height: height }} 
            className={`w-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-100/50 ${active ? 'bg-gradient-to-t from-indigo-600 to-purple-500' : 'bg-slate-200 group-hover:bg-indigo-300'}`}
        ></div>
      </div>
      <span className={`text-[12px] font-black tracking-tighter ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{label}</span>
    </div>
  );
}

function DeptLegend({ label, color, percent }) {
  return (
    <div className="flex items-center justify-between w-full px-5 group text-left">
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-lg shadow-sm group-hover:scale-125 transition-transform duration-300 ${color}`}></div>
        <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-slate-50 rounded-full overflow-hidden hidden sm:block">
            <div style={{ width: percent }} className={`h-full opacity-30 ${color}`}></div>
        </div>
        <span className="text-[13px] font-black text-slate-800 bg-slate-50 px-2.5 py-1 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">{percent}</span>
      </div>
    </div>
  );
}

function ProfileInput({ label, value, onChange }) {
  return (
    <div className="space-y-2 text-left block font-bold text-left">
      <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold" />
    </div>
  );
}

function SidebarItem({ icon, label, active, danger }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer text-sm font-black transition-all text-left ${active ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"} ${danger ? "text-rose-500 mt-auto" : ""}`}>
      <span className={`${active ? "text-indigo-600" : "text-slate-300"} flex items-center justify-center text-lg`}>{icon}</span>{label}
    </div>
  );
}