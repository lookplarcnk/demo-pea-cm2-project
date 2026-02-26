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

// ✅ แก้ไข: กำหนด URL ให้ชี้ไปยัง Render
const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

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
        // ✅ แก้ไข: ดึงสถิติรวมจาก Render
        const statsRes = await fetch(`${API_BASE_URL}/admin/stats`);
        const statsData = await statsRes.json();
        setStats(statsData);

        // ✅ แก้ไข: ดึงกิจกรรมล่าสุดจาก Render
        const activityRes = await fetch(`${API_BASE_URL}/documents`);
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

        const colors = ["bg-[#74045F]", "bg-purple-600", "bg-purple-500", "bg-fuchsia-600", "bg-purple-400", "bg-fuchsia-400"];
        
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
      // ✅ แก้ไข: ส่งประกาศไปยัง Render
      const response = await fetch(`${API_BASE_URL}/announcements`, {
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
      setIsSending(false);
    }
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("pea-admin-token"); 
    localStorage.removeItem("pea-admin-user"); 
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
    bg: "bg-[#fcfaff]", 
    card: "bg-white border-purple-50",
    textMain: "text-slate-700",
    textSub: "text-slate-500",
    sidebar: "bg-white border-purple-50",
    header: "bg-white/70 border-purple-50",
    input: "bg-slate-50 border-purple-100",
    tableRow: "hover:bg-purple-50/50",
    divider: "border-purple-50",
  };

  return (
    <div className={`flex min-h-screen ${theme.bg} font-sans ${theme.textMain} overflow-x-hidden text-left font-medium text-left text-left`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${theme.sidebar} border-r flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`p-6 flex items-center gap-3 border-b ${theme.divider} text-left`}>
          <img 
            src={Logo} 
            alt="PEA Logo" 
            className="h-12 w-auto object-contain text-left" 
          />
          <div className="leading-tight text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight text-left">PEA ADMIN</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none text-left">Chiang Mai 2 System</p>
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

      <main className="flex-1 min-w-0 overflow-y-auto text-left">
        <div className={`backdrop-blur-md px-4 lg:px-10 py-6 border-b ${theme.header} sticky top-0 z-30 font-bold text-left`}>
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-3 text-left">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-purple-100 lg:hidden text-[#74045F] flex items-center justify-center text-center"><FiMenu size={20} /></button>
              <h2 className="text-xl lg:text-2xl font-bold text-[#74045F] tracking-tight text-left">หน้าสรุปผล (Overview)</h2>
            </div>
            
            <div className="flex items-center gap-4 text-left">
              <button onClick={() => setOpenProfileModal(true)} className="flex-shrink-0 active:scale-95 transition-transform flex items-center justify-center text-left">
                <img src={user.avatar} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md hover:border-[#74045F] transition-all text-left" alt="profile" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 text-left space-y-8 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-bold text-left text-left">
            <SummaryCard title="เอกสารทั้งหมดในระบบ" value={stats.totalDocs} icon={<FiBox />} color="purple" />
            <SummaryCard title="เอกสารอัปโหลดเดือนนี้" value={stats.docsThisMonth} icon={<FiClock />} color="purple" />
            <SummaryCard title="ผู้ใช้งานทั้งหมด" value={stats.totalUsers} icon={<FiUsers />} color="purple" />
            <SummaryCard title="ผู้ใช้งานใหม่เดือนนี้" value={stats.newUsersThisMonth} icon={<FiUserPlus />} color="purple" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-left">
            <div className="xl:col-span-2 space-y-8 text-left">
                <div className={`${theme.card} rounded-[2.5rem] shadow-sm border border-purple-100 overflow-hidden font-bold text-left`}>
                    <div className={`p-6 flex justify-between items-center border-b ${theme.divider} bg-purple-50/30 text-left`}>
                        <h3 className="font-bold text-[#74045F] text-base uppercase tracking-tight text-left">กิจกรรมล่าสุดในระบบ</h3>
                        <div className="relative group font-bold text-left">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-left" />
                            <input type="text" placeholder="ค้นหา..." className={`pl-10 pr-4 py-2.5 rounded-2xl ${theme.input} border focus:ring-4 focus:ring-purple-500/10 outline-none transition-all w-40 focus:w-56 font-bold text-xs text-left`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="overflow-x-auto text-left">
                        <table className="w-full min-w-[600px] text-left">
                            <thead className="bg-transparent text-slate-400 text-[11px] uppercase tracking-widest font-black border-b border-purple-50 text-left text-left">
                                <tr>
                                    <th className="px-6 py-4 text-left">รายการ</th>
                                    <th className="px-6 py-4 text-left">ผู้ดำเนินการ</th>
                                    <th className="px-6 py-4 text-center">สถานะ</th>
                                    <th className="hidden md:table-cell px-6 py-4 text-center">เวลา</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-left text-left">
                                {currentItems.map((act) => (
                                    <tr key={act.id} className={`${theme.tableRow} transition-all font-bold text-left`}>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex items-center gap-3 text-left">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold bg-purple-50 text-[#74045F] text-left`}><FiActivity /></div>
                                                <span className="text-slate-700 line-clamp-1 font-black text-sm text-left">{act.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-left text-left">
                                            <span className="text-slate-600 font-bold text-[13px] text-left">{act.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-center">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-center ${act.size === 'อนุมัติแล้ว' || act.size === 'สำเร็จ' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {act.size}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4 text-center text-slate-400 italic text-xs font-bold text-center">{act.uploadDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={`${theme.card} rounded-[2.5rem] p-8 border shadow-sm font-bold text-left`}>
                    <div className="flex items-center gap-3 mb-6 text-left">
                        <div className="w-10 h-10 bg-purple-50 text-[#74045F] rounded-xl flex items-center justify-center text-center"><FiAlertCircle size={20}/></div>
                        <h3 className="font-black text-[#74045F] text-base uppercase tracking-tight text-left">ประกาศแจ้งเตือนระบบ</h3>
                    </div>
                    <div className="flex gap-4 items-start text-left">
                        <textarea 
                          value={announcement}
                          onChange={(e) => setAnnouncement(e.target.value)}
                          placeholder="พิมพ์ประกาศแจ้งเตือน..." 
                          className="flex-1 bg-slate-50 text-slate-700 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-purple-200 outline-none h-24 resize-none text-left"
                        ></textarea>
                        
                        <button 
                          onClick={handleSendAnnouncement}
                          disabled={isSending}
                          className="bg-[#74045F] hover:bg-[#5a034a] text-white px-6 py-8 rounded-2xl font-black transition-all flex flex-col items-center justify-center gap-2 active:scale-95 shadow-lg shadow-purple-100 disabled:bg-slate-300 text-center"
                        >
                            <FiMessageSquare size={20} />
                            <span className="text-[10px] uppercase tracking-widest text-center">{isSending ? '...' : 'ส่ง'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-8 font-bold text-left">
                <div className={`${theme.card} rounded-[2.5rem] shadow-sm border border-purple-100 p-8 space-y-8 text-left`}>
                  <h3 className="font-black text-slate-800 text-base uppercase flex items-center gap-2 tracking-tight text-left">
                    <FiDatabase className="text-[#74045F] text-left" /> สัดส่วนเอกสารจริงตามรายแผนก
                  </h3>
                  <div className="space-y-5 text-left">
                    {deptStats.length > 0 ? (
                      deptStats.map((dept, idx) => (
                        <DeptProgress key={idx} label={dept.label} percent={dept.percent} color={dept.color} />
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-left">ไม่พบข้อมูลเอกสารในแต่ละแผนก</p>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#74045F] to-purple-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-purple-200 space-y-6 text-left">
                    <div className="flex items-center gap-3 text-left">
                        <FiTrendingUp size={24} className="text-purple-200 text-left" />
                        <h3 className="font-black text-base uppercase tracking-tight text-left">System Insight</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md text-left">
                            <p className="text-[10px] font-black uppercase text-purple-100 text-left">เฉลี่ยเวลา</p>
                            <p className="text-xl font-black text-left">1.5 วัน</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md text-left">
                            <p className="text-[10px] font-black uppercase text-purple-100 text-left">Uptime</p>
                            <p className="text-xl font-black text-left">99.9%</p>
                        </div>
                    </div>
                </div>

                <div className={`${theme.card} rounded-[2.5rem] p-8 border shadow-sm flex items-center gap-4 text-left`}>
                    <div className="w-12 h-12 bg-emerald-50 border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center border text-center">
                        <div className="relative flex h-3 w-3 text-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 text-center"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 text-center"></span>
                        </div>
                    </div>
                    <div className="text-left">
                        <p className={`text-xs font-black ${theme.textSub} uppercase tracking-widest leading-none mb-1 text-left`}>Server Status</p>
                        <p className="text-sm font-black text-emerald-600 text-left">Online</p>
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
          <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-left">
              <span className="text-slate-500 truncate max-w-[150px] text-left">{label}</span>
              <span className="text-[#74045F] font-black text-left">{percent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden text-left">
              <div 
                className={`h-full ${color} transition-all duration-1000 ease-out shadow-sm text-left`} 
                style={{ width: `${percent}%` }}
              ></div>
          </div>
      </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colors = { 
    purple: "bg-purple-50 text-[#74045F]", 
    blue: "bg-blue-50 text-blue-600", 
    amber: "bg-amber-50 text-amber-600", 
    rose: "bg-rose-50 text-rose-600" 
  };
  
  return (
    <div className="bg-white border-purple-50 rounded-[2rem] p-6 flex items-center gap-4 border transition-all hover:shadow-xl group text-left">
      <div className={`p-4 rounded-[1.2rem] text-2xl group-hover:scale-110 transition-transform ${colors[color]} flex items-center justify-center text-center`}>{icon}</div>
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
      <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1 font-bold text-left block">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 text-slate-700 border-none rounded-xl px-4 py-3 text-lg transition-all outline-none font-bold text-left focus:ring-4 focus:ring-purple-500/10" 
      />
    </div>
  );
}

function SidebarItem({ icon, label, active, danger }) {
  const activeClass = "bg-purple-50 text-[#74045F] shadow-sm shadow-purple-100 text-left font-black";
  const hoverClass = "text-slate-400 hover:bg-purple-50/50 hover:text-[#74045F] text-left font-black";

  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer text-sm font-black transition-all text-left ${active ? activeClass : hoverClass} ${danger ? "text-rose-500 mt-auto text-left" : ""}`}>
      <span className={`${active ? "text-[#74045F] text-left" : "text-slate-300 text-left"} flex items-center justify-center text-lg text-center`}>{icon}</span>{label}
    </div>
  );
}