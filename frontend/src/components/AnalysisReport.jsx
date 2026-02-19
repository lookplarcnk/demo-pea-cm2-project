import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import LogoutModal from "./LogoutModal"; 
// ✅ นำเข้าคอมโพเนนต์โปรไฟล์ใหม่
import AdminProfileModal from "./AdminProfileModal";
import Logo from "../assets/img/logo-pea.png"; // ✅ นำเข้า Logo
import {
  FiPieChart, FiFileText, FiUsers, FiTrendingUp, FiSettings, FiLogOut,
  FiMenu, FiCalendar, FiArrowUpRight, FiArrowDownRight, FiDownload, FiX, FiCamera, FiCheck, FiRefreshCw,
  FiCheckCircle, FiSend, FiChevronDown
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
      setLoading(true);
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

  // ✅ แก้ไข: กรองข้อมูล Excel ตาม Period
  const downloadExcel = async () => {
    try {
      let queryParams = `period=${reportPeriod}`;
      if (selectedDate) queryParams += `&start=${selectedDate}&end=${selectedDate}`;
      
      const resDocs = await fetch(`http://localhost:5000/api/export/excel/documents?${queryParams}`);
      const docsData = await resDocs.json();

      const workbook = XLSX.utils.book_new();
      const wsDocs = XLSX.utils.json_to_sheet(docsData);
      XLSX.utils.book_append_sheet(workbook, wsDocs, "คลังเอกสาร");
      
      XLSX.writeFile(workbook, `Analytical-PEA-${reportPeriod}.xlsx`);
    } catch (error) {
      alert("ไม่สามารถดาวน์โหลดไฟล์ Excel ได้");
    }
  };

  // ✅ แก้ไข: ปรับปรุง PDF Export ให้กรองตาม Period สอดคล้องกับหน้าจอ
  const downloadPDF = async () => {
    try {
      setLoading(true);
      let queryParams = `period=${reportPeriod}`;
      if (selectedDate) queryParams += `&start=${selectedDate}&end=${selectedDate}`;
      
      const resDocs = await fetch(`http://localhost:5000/api/export/pdf/documents?${queryParams}`);
      if (!resDocs.ok) throw new Error("API Connection Failed");
      const docsData = await resDocs.json();

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(116, 4, 95); // #74045F
      doc.text("Analytical Report - PEA CM2", 14, 20);
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text(`Report Period: ${reportPeriod}`, 14, 28);
      doc.text(`Generated at: ${new Date().toLocaleString("th-TH")}`, 14, 34);

      doc.autoTable({
        startY: 40,
        head: [['Metric Category', 'Count', 'Trend']],
        body: stats.map(s => [s.title, s.value, s.trend]),
        theme: 'striped',
        headStyles: { fillColor: [116, 4, 95] }
      });

      doc.setFontSize(14); doc.setTextColor(30);
      doc.text("Departmental Engagement Statistics", 14, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Department Name', 'Engagement Percentage']],
        body: deptData.map(d => [d.label, d.percent]),
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] } 
      });

      if (docsData && docsData.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text(`Detailed Documents Overview (${reportPeriod})`, 14, 15);
        doc.autoTable({
          startY: 22,
          head: [['ID', 'Document Title', 'Department', 'Status', 'Usage']],
          body: docsData.map(d => [d.id || "-", d.title || "-", d.dept || "-", d.status || "-", d.downloads || "0"]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [15, 118, 110] }
        });
      }

      doc.save(`PEA-Analytical-${reportPeriod}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF: กรุณาตรวจสอบการเชื่อมต่อ API");
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
    <div className="flex min-h-screen bg-[#fcfaff] font-sans text-slate-700 overflow-x-hidden text-left font-medium">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-purple-50 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3 border-b border-purple-50 text-left">
          <img src={Logo} alt="PEA Logo" className="h-12 w-auto object-contain" />
          <div className="leading-tight text-left text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight text-left">PEA ADMIN</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none text-left">Chiang Mai 2 System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left text-left">
          <Link to="/AdminDashboard"><SidebarItem icon={<FiPieChart />} label="หน้าสรุปผล (Overview)" /></Link>
          <Link to="/ManageDocs"><SidebarItem icon={<FiFileText />} label="จัดการเอกสารทั้งหมด" /></Link>
          <Link to="/AdminApprovalCenter"><SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" /></Link> 
          <Link to="/AdminSubmitApproval"><SidebarItem icon={<FiSend />} label="ส่งเอกสารให้พิจารณา" /></Link> 
          <Link to="/UserManage"><SidebarItem icon={<FiUsers />} label="จัดการผู้ใช้งาน" /></Link>
          <SidebarItem icon={<FiTrendingUp />} label="รายงานเชิงวิเคราะห์" active />
        </nav>
        <div className="p-6 border-t border-purple-50 space-y-2 font-bold text-left text-left text-left">
          <Link to="/AdminSetting"><SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" /></Link>
          <div onClick={() => setOpenLogoutModal(true)} className="cursor-pointer">
            <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto text-left">
        <div className="bg-white/70 backdrop-blur-md px-4 lg:px-10 py-6 border-b border-purple-50 sticky top-0 z-30 font-bold flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-left">
          <div className="flex items-center gap-3 text-left">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-purple-100 lg:hidden text-[#74045F] flex items-center justify-center text-center"><FiMenu size={20} /></button>
            <div className="flex flex-col text-left">
                <h2 className="text-xl lg:text-2xl font-black text-[#74045F] tracking-tight">รายงานเชิงวิเคราะห์</h2>
                <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest text-left">
                    <span className="relative flex h-2 w-2 text-left">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 text-left"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 text-left"></span>
                    </span>
                    Live Dashboard
                </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-left">
            {/* ✅ ส่วน Responsive สำหรับปุ่มและตัวเลือกวันที่ */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-left">
              <div className="flex items-center gap-2 bg-purple-50/50 px-4 py-2.5 rounded-2xl border border-purple-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-purple-200 flex-1 sm:flex-none">
                  <FiCalendar className="text-[#74045F]" size={16} />
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-xs font-black outline-none border-none p-0 text-[#74045F] w-full sm:w-28 uppercase text-left" />
                  {selectedDate && (
                    <button onClick={() => setSelectedDate("")} className="ml-1 text-[#74045F]/50 hover:text-rose-500 transition-colors text-left"><FiX size={14}/></button>
                  )}
              </div>

              <div className="flex gap-2 flex-1 sm:flex-none text-left">
                  <button onClick={downloadExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest text-left"><FiFileText size={14} /> EXCEL</button>
                  <button onClick={downloadPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-purple-100 px-4 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-purple-50 text-[#74045F] transition-all uppercase tracking-widest text-left"><FiDownload size={14} /> PDF</button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between text-left">
              <div className="relative group flex-1 sm:flex-none text-left">
                 <select className="appearance-none w-full bg-[#74045F] text-white pl-4 pr-10 py-2.5 rounded-xl text-sm font-black outline-none cursor-pointer shadow-lg transition-all hover:bg-[#5a034a] uppercase tracking-widest text-left" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
                    <option>ประจำเดือนนี้</option>
                    <option>ไตรมาสล่าสุด</option>
                    <option>ประจำปี 2568</option>
                 </select>
                 <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none text-left" size={14} />
              </div>

              <button onClick={() => setOpenProfileModal(true)} className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white shadow-md active:scale-95 transition-transform shrink-0 text-left">
                <img src={user.avatar} className="w-full h-full object-cover text-left" alt="profile" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 space-y-8 text-left text-left text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {stats.map((s, i) => ( <ReportCard key={i} {...s} /> ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-left text-left">
            <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 border border-purple-50 shadow-sm flex flex-col h-[450px] text-left">
              <div className="flex justify-between items-center mb-8 text-left text-left">
                <div className="text-left text-left">
                  <h3 className="text-lg font-black text-[#74045F] uppercase tracking-wider text-left">แนวโน้มการเข้าใช้งาน</h3>
                  <p className="text-sm text-slate-400 font-bold text-left">ข้อมูลสถิติรายวันเปรียบเทียบความหนาแน่น</p>
                </div>
                <button onClick={fetchAnalytics} className="p-2 text-[#74045F]/30 hover:text-[#74045F] transition-all active:rotate-180 text-left"><FiRefreshCw size={20}/></button>
              </div>
              <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4 pb-4 text-left">
                {usageData.length > 0 ? usageData.map((d, i) => (
                  <Bar key={i} height={d.height} label={d.label} active={d.active} />
                )) : <p className="w-full text-center text-slate-300 italic">กำลังเชื่อมต่อข้อมูล...</p>}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-purple-50 shadow-sm flex flex-col h-[450px] text-left">
              <h3 className="text-lg font-black text-[#74045F] mb-1 uppercase tracking-wider text-left">สัดส่วนผู้ใช้งาน</h3>
              <p className="text-sm text-slate-400 font-bold mb-8 text-left">แยกตามความเคลื่อนไหวรายแผนก</p>
              <div className="flex-1 flex flex-col items-center justify-center relative text-left">
                <div className="w-48 h-48 rounded-full border-[20px] border-purple-50/20 relative flex items-center justify-center shadow-lg text-left">
                  <div className="absolute inset-[-20px] rounded-full border-[20px] border-transparent border-t-[#74045F] border-r-[#9333EA] rotate-45 transition-transform duration-1000 text-left"></div>
                  <div className="text-center text-left">
                    <p className="text-3xl font-black text-[#74045F] text-left">100%</p>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-tighter text-left">Engagement</p>
                  </div>
                </div>
                <div className="mt-8 w-full space-y-4 text-left">
                  {deptData.length > 0 ? deptData.map((dept, i) => ( <DeptLegend key={i} {...dept} /> )) : <p className="text-center text-slate-300 italic text-left">ไม่มีข้อมูลแผนก</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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

function ReportCard({ title, value, trend, up }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-purple-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-left text-left">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-[#74045F] transition-colors text-left">{title}</p>
      <div className="flex items-end justify-between text-left">
        <h4 className="text-3xl font-black text-[#74045F] tracking-tight leading-none group-hover:scale-105 transition-transform origin-left text-left">{value}</h4>
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black ${up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} text-left`}>
          {up ? <FiArrowUpRight size={12}/> : <FiArrowDownRight size={12}/>}
          {trend}
        </div>
      </div>
    </div>
  );
}

function Bar({ height, label, active }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-3 group cursor-pointer text-left text-left">
      <div className="w-full relative flex flex-col justify-end h-48 bg-purple-50/30 rounded-2xl overflow-hidden group-hover:bg-purple-50 transition-all border border-transparent group-hover:border-purple-100 text-left">
        <div style={{ height: height }} className={`w-full transition-all duration-1000 ease-out shadow-lg shadow-purple-100/50 ${active ? 'bg-gradient-to-t from-[#74045F] to-[#9333EA]' : 'bg-purple-100 group-hover:bg-purple-300'} text-left`}></div>
      </div>
      <span className={`text-[10px] sm:text-[12px] font-black tracking-tighter ${active ? 'text-[#74045F]' : 'text-purple-200 group-hover:text-[#74045F]'} text-left`}>{label}</span>
    </div>
  );
}

function DeptLegend({ label, color, percent }) {
  const peaColors = {
    "bg-indigo-500": "bg-[#74045F]",
    "bg-purple-500": "bg-[#9333EA]",
    "bg-blue-500": "bg-[#A855F7]",
    "bg-emerald-500": "bg-emerald-500",
    "bg-amber-500": "bg-amber-500",
    "bg-rose-500": "bg-rose-500"
  };
  const finalColor = peaColors[color] || color;

  return (
    <div className="flex items-center justify-between w-full px-2 sm:px-5 group text-left text-left">
      <div className="flex items-center gap-3 text-left text-left">
        <div className={`w-4 h-4 rounded-lg shadow-sm group-hover:scale-125 transition-transform duration-300 ${finalColor} text-left`}></div>
        <span className="text-[11px] sm:text-[13px] font-bold text-slate-600 group-hover:text-[#74045F] transition-colors text-left">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-right text-left">
        <div className="w-12 sm:w-16 h-1.5 bg-purple-50 rounded-full overflow-hidden hidden sm:block text-left">
            <div style={{ width: percent }} className={`h-full opacity-30 ${finalColor} text-left`}></div>
        </div>
        <span className="text-[11px] sm:text-[13px] font-black text-[#74045F] bg-purple-50 px-2.5 py-1 rounded-xl group-hover:bg-[#74045F] group-hover:text-white transition-all text-left">{percent}</span>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, danger }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer text-sm font-black transition-all text-left text-left ${active ? "bg-purple-50 text-[#74045F] shadow-sm shadow-purple-100" : "text-slate-400 hover:bg-purple-50 hover:text-[#74045F]"} ${danger ? "text-rose-500 mt-auto" : ""} text-left`}>
      <span className={`${active ? "text-[#74045F]" : "text-purple-200"} flex items-center justify-center text-lg text-left`}>{icon}</span>{label}
    </div>
  );
}