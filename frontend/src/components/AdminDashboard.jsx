import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import LogoutModal from "./LogoutModal"; 
// ✅ นำเข้าคอมโพเนนต์โปรไฟล์ใหม่
import AdminProfileModal from "./AdminProfileModal";
import Logo from "../assets/img/logo-pea.png"; // ✅ นำเข้า Logo
import {
  FiFileText, FiClock, FiDownload, FiUser, FiLogOut, FiSettings,
  FiSearch, FiEdit, FiTrash2, FiPlus, FiX, FiCamera, FiCheck, FiMenu, 
  FiUploadCloud, FiChevronLeft, FiChevronRight, FiPieChart, FiTrendingUp, 
  FiActivity, FiUsers, FiBox, FiUserPlus, FiDatabase, FiServer, FiAlertCircle, FiMessageSquare, FiHash,
  FiCheckCircle,
  FiSend
} from "react-icons/fi";

export default function AdminOverviewDashboard() {
  const navigate = useNavigate(); 
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [announcement, setAnnouncement] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [stats, setStats] = useState({
    totalDocs: 0,
    docsThisMonth: 0,
    totalUsers: 0,
    newUsersThisMonth: 0
  });

  const [activities, setActivities] = useState([]); 
  const [deptStats, setDeptStats] = useState([]); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await fetch('http://localhost:5000/api/admin/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        const activityRes = await fetch('http://localhost:5000/api/documents');
        const activityData = await activityRes.json();
        
        const formattedActivities = activityData.slice(0, 10).map(doc => ({
          id: doc.doc_id,
          name: doc.doc_name,
          category: doc.owner || "ไม่ระบุ",
          uploadDate: new Date(doc.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          size: doc.status,
          type: "upload"
        }));
        setActivities(formattedActivities);

        const deptCount = activityData.reduce((acc, doc) => {
          const deptName = doc.dept || "อื่นๆ";
          acc[deptName] = (acc[deptName] || 0) + 1;
          return acc;
        }, {});

        const colors = ["bg-indigo-500", "bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
        
        const formattedDeptStats = Object.keys(deptCount).map((key, index) => ({
          label: key,
          percent: activityData.length > 0 ? Math.round((deptCount[key] / activityData.length) * 100) : 0,
          color: colors[index % colors.length]
        })).sort((a, b) => b.percent - a.percent);

        setDeptStats(formattedDeptStats);
      } catch (err) {
        console.error("Dashboard Data Error:", err);
      }
    };
    fetchDashboardData();
  }, []);

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return alert("กรุณาพิมพ์ข้อความประกาศ");
    
    setIsSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: announcement,
          author: user.name
        })
      });

      if (response.ok) {
        alert("ส่งประกาศแจ้งเตือนสำเร็จ!");
        setAnnouncement("");
      } else {
        alert("เกิดข้อผิดพลาดในการส่งประกาศ");
      }
    } catch (err) {
      console.error("Announcement Error:", err);
    } finally {
      setAnnouncement(false);
      setIsSending(false);
    }
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("pea-admin-token"); 
    setOpenLogoutModal(false);
    navigate("/"); 
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(act => 
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  const currentItems = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const theme = {
    bg: "bg-[#f8f9ff]",
    card: "bg-white border-slate-100",
    textMain: "text-slate-700",
    textSub: "text-slate-500",
    sidebar: "bg-white border-slate-100",
    header: "bg-white/50 border-slate-100",
    input: "bg-white border-slate-200",
    tableRow: "hover:bg-slate-50/50",
    divider: "border-slate-50",
  };

  return (
    <div className={`flex min-h-screen ${theme.bg} font-sans ${theme.textMain} overflow-x-hidden text-left font-medium`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${theme.sidebar} border-r flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* ✅ แก้ไข: เปลี่ยนจากตัวอักษร A เป็น Logo การไฟฟ้า */}
        <div className={`p-6 flex items-center gap-3 border-b ${theme.divider} text-left`}>
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
          <Link to="/AdminDashboard">
            <SidebarItem icon={<FiPieChart />} label="หน้าสรุปผล (Overview)" active />
          </Link>
          <Link to="/ManageDocs">
            <SidebarItem icon={<FiFileText />} label="จัดการเอกสารทั้งหมด" />
          </Link>
          <Link to="/AdminApprovalCenter">
            <SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" />
          </Link>
          <Link to="/AdminSubmitApproval">
            <SidebarItem icon={<FiSend />} label="ส่งเอกสารให้พิจารณา" />
          </Link>
          <Link to="/UserManage">
            <SidebarItem icon={<FiUsers />} label="จัดการผู้ใช้งาน" />
          </Link>
          <Link to="/AnalysisReport">
            <SidebarItem icon={<FiTrendingUp />} label="รายงานเชิงวิเคราะห์" />
          </Link>
        </nav>
        
        <div className={`p-6 border-t ${theme.divider} space-y-2 font-bold text-left`}>
          <Link to="/AdminSetting">
            <SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" />
          </Link>
          <div onClick={() => setOpenLogoutModal(true)} className="cursor-pointer">
            <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className={`backdrop-blur-md px-4 lg:px-10 py-6 border-b ${theme.header} sticky top-0 z-30 font-bold`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 lg:hidden text-slate-600 flex items-center justify-center"><FiMenu size={20} /></button>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight text-left">หน้าสรุปผล (Overview)</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setOpenProfileModal(true)} className="flex-shrink-0 active:scale-95 transition-transform flex items-center justify-center">
                <img src={user.avatar} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md hover:border-indigo-400 transition-all" alt="profile" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 text-left space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-bold text-left">
            <SummaryCard title="เอกสารทั้งหมดในระบบ" value={stats.totalDocs} icon={<FiBox />} color="blue" />
            <SummaryCard title="เอกสารอัปโหลดเดือนนี้" value={stats.docsThisMonth} icon={<FiClock />} color="amber" />
            <SummaryCard title="ผู้ใช้งานทั้งหมด" value={stats.totalUsers} icon={<FiUsers />} color="purple" />
            <SummaryCard title="ผู้ใช้งานใหม่เดือนนี้" value={stats.newUsersThisMonth} icon={<FiUserPlus />} color="rose" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
                <div className={`${theme.card} rounded-[2.5rem] shadow-sm border overflow-hidden font-bold`}>
                    <div className={`p-6 flex justify-between items-center border-b ${theme.divider} bg-slate-50/30 text-left`}>
                        <h3 className="font-bold text-slate-800 text-base uppercase tracking-tight text-left">กิจกรรมล่าสุดในระบบ</h3>
                        <div className="relative group font-bold">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="ค้นหา..." className={`pl-10 pr-4 py-2.5 rounded-2xl ${theme.input} border focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all w-40 focus:w-56 font-bold text-xs`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="overflow-x-auto text-left">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-transparent text-slate-400 text-[11px] uppercase tracking-widest font-black border-b border-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">รายการ</th>
                                    <th className="px-6 py-4 text-left">ผู้ดำเนินการ</th>
                                    <th className="px-6 py-4 text-center">สถานะ</th>
                                    <th className="hidden md:table-cell px-6 py-4 text-center">เวลา</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-left">
                                {currentItems.map((act) => (
                                    <tr key={act.id} className={`${theme.tableRow} transition-all font-bold`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-left">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold bg-blue-50 text-blue-500`}><FiActivity /></div>
                                                <span className="text-slate-700 line-clamp-1 font-black text-sm text-left">{act.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <span className="text-slate-600 font-bold text-[13px]">{act.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${act.size === 'อนุมัติแล้ว' || act.size === 'สำเร็จ' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {act.size}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4 text-center text-slate-400 italic text-xs font-bold">{act.uploadDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={`${theme.card} rounded-[2.5rem] p-8 border shadow-sm font-bold`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center"><FiAlertCircle size={20}/></div>
                        <h3 className="font-black text-slate-800 text-base uppercase tracking-tight">ประกาศแจ้งเตือนระบบ</h3>
                    </div>
                    <div className="flex gap-4 items-start">
                        <textarea 
                          value={announcement}
                          onChange={(e) => setAnnouncement(e.target.value)}
                          placeholder="พิมพ์ประกาศแจ้งเตือน..." 
                          className="flex-1 bg-slate-50 text-slate-700 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-rose-200 outline-none h-24 resize-none"
                        ></textarea>
                        
                        <button 
                          onClick={handleSendAnnouncement}
                          disabled={isSending}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-8 rounded-2xl font-black transition-all flex flex-col items-center justify-center gap-2 active:scale-95 shadow-lg shadow-rose-100 disabled:bg-slate-300"
                        >
                            <FiMessageSquare size={20} />
                            <span className="text-[10px] uppercase tracking-widest">{isSending ? '...' : 'ส่ง'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-8 font-bold text-left">
                <div className={`${theme.card} rounded-[2.5rem] shadow-sm border p-8 space-y-8`}>
                  <h3 className="font-black text-slate-800 text-base uppercase flex items-center gap-2 tracking-tight text-left">
                    <FiDatabase className="text-indigo-500" /> สัดส่วนเอกสารจริงตามรายแผนก
                  </h3>
                  <div className="space-y-5">
                    {deptStats.length > 0 ? (
                      deptStats.map((dept, idx) => (
                        <DeptProgress key={idx} label={dept.label} percent={dept.percent} color={dept.color} />
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">ไม่พบข้อมูลเอกสารในแต่ละแผนก</p>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <FiTrendingUp size={24} className="text-indigo-200" />
                        <h3 className="font-black text-base uppercase tracking-tight">System Insight</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <p className="text-[10px] font-black uppercase text-indigo-100">เฉลี่ยเวลา</p>
                            <p className="text-xl font-black">1.5 วัน</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <p className="text-[10px] font-black uppercase text-indigo-100">Uptime</p>
                            <p className="text-xl font-black">99.9%</p>
                        </div>
                    </div>
                </div>

                <div className={`${theme.card} rounded-[2.5rem] p-8 border shadow-sm flex items-center gap-4`}>
                    <div className="w-12 h-12 bg-emerald-50 border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center border">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                    </div>
                    <div>
                        <p className={`text-xs font-black ${theme.textSub} uppercase tracking-widest leading-none mb-1`}>Server Status</p>
                        <p className="text-sm font-black text-emerald-600">Online</p>
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

      <LogoutModal 
        isOpen={openLogoutModal} 
        onClose={() => setOpenLogoutModal(false)} 
        onConfirm={handleConfirmLogout} 
      />

    </div>
  );
}

/* --- Helper Components --- */

function DeptProgress({ label, percent, color }) {
  return (
      <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
              <span className="text-slate-500 truncate max-w-[150px]">{label}</span>
              <span className="text-indigo-600 font-black">{percent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${color} transition-all duration-1000 ease-out shadow-sm`} 
                style={{ width: `${percent}%` }}
              ></div>
          </div>
      </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colors = { 
    purple: "bg-purple-50 text-purple-600", 
    blue: "bg-blue-50 text-blue-600", 
    amber: "bg-amber-50 text-amber-600", 
    rose: "bg-rose-50 text-rose-600" 
  };
  
  return (
    <div className="bg-white border-slate-100 rounded-[2rem] p-6 flex items-center gap-4 border transition-all hover:shadow-xl group text-left">
      <div className={`p-4 rounded-[1.2rem] text-2xl group-hover:scale-110 transition-transform ${colors[color]} flex items-center justify-center text-left`}>{icon}</div>
      <div className="text-left font-bold">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5 text-left leading-none">{title}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight text-left leading-none">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function ProfileInput({ label, value, onChange }) {
  return (
    <div className="space-y-2 text-left block font-bold">
      <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1 font-bold text-left">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 text-slate-700 border-none rounded-xl px-4 py-3 text-lg transition-all outline-none font-bold text-left focus:ring-4 focus:ring-indigo-500/10" 
      />
    </div>
  );
}

function SidebarItem({ icon, label, active, danger }) {
  const activeClass = "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100 text-left";
  const hoverClass = "text-slate-400 hover:bg-slate-50 hover:text-slate-700 text-left";

  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer text-sm font-black transition-all text-left ${active ? activeClass : hoverClass} ${danger ? "text-rose-500 mt-auto text-left" : ""}`}>
      <span className={`${active ? "text-indigo-600 text-left" : "text-slate-300 text-left"} flex items-center justify-center text-left text-lg`}>{icon}</span>{label}
    </div>
  );
}