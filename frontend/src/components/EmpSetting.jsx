import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import LogoutModal from "./LogoutModal"; 
// ✅ นำเข้าคอมโพเนนต์โปรไฟล์พนักงาน
import EmployeeProfileModal from "./EmployeeProfileModal";
import Logo from "../assets/img/logo-pea.png"; 
// ✅ นำเข้า react-hot-toast
import toast, { Toaster } from 'react-hot-toast'; 

import {
  FiUsers, FiUserCheck, FiUserPlus, FiUserX, FiSearch, FiEdit, 
  FiMenu, FiSettings, FiLogOut, FiPieChart, FiFileText, 
  FiTrendingUp, FiX, FiCheck, FiCamera, FiFilter, 
  FiChevronLeft, FiChevronRight, FiShield, FiCalendar, FiPhone, FiChevronDown, FiHash, FiBell, FiGlobe, FiDatabase, FiSmartphone,
  FiCheckCircle,
  FiSend,
  FiDownload,
  FiUser,
  FiMail
} from "react-icons/fi";

const API_BASE_URL = "http://localhost:5000/api";

export default function EmpSetting() {
  const navigate = useNavigate(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); 
  
  const [user, setUser] = useState({
    name: "กำลังโหลด...",
    role: "Officer",
    email: "",
    phone: "081-234-5678",
    department: "กำลังโหลด...",
    employeeId: "PEA-XXXXX",
    avatar: ""
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlert: true,
    twoFactorAuth: false
  });

  // ✅ 1. ดึงข้อมูลพนักงาน
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser && (savedUser.id || savedUser.emp_id)) {
      const empId = savedUser.id || savedUser.emp_id;
      
      const fetchEmployeeData = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/employees/${empId}`);
          if (res.data) {
            setUser({
              name: res.data.emp_name,
              role: res.data.role || "Officer",
              email: res.data.emp_email,
              phone: res.data.emp_phone || "081-234-5678", 
              department: res.data.dept_name || res.data.emp_dept || "ไม่ระบุแผนก",
              employeeId: `PEA-${res.data.emp_id}`,
              avatar: res.data.avatar && res.data.avatar !== "null" ? res.data.avatar : savedUser.avatar 
            });
          }
        } catch (err) {
          console.error("Error fetching employee data:", err);
          toast.error("ดึงข้อมูลโปรไฟล์ไม่สำเร็จ");
        }
      };
      fetchEmployeeData();
    } else {
      navigate("/loginemployee");
    }
  }, [navigate]);

  // ✅ 2. ฟังก์ชันจัดการการออกจากระบบ
  const handleLogoutConfirm = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("ออกจากระบบเรียบร้อยแล้ว");
    navigate("/loginemployee"); 
  };

  // ✅ 3. ฟังก์ชันบันทึกการตั้งค่าพร้อม Toast (ใช้โทนสีม่วง PEA)
  const handleSaveSettings = () => {
    const loadToast = toast.loading("กำลังบันทึกการตั้งค่า...");
    setTimeout(() => {
        if (settings.notifications) {
            toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว', { 
              id: loadToast,
              style: { background: '#74045F', color: '#fff' }
            });
          } else {
            toast('บันทึกข้อมูลแล้ว', { id: loadToast, icon: 'ℹ️' });
          }
    }, 800);
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const theme = {
    bg: "bg-[#fcfaff]", // ✅ ม่วงขาวนวล
    card: "bg-white border-purple-50",
    textMain: "text-slate-700",
    textSub: "text-slate-500",
    sidebar: "bg-white border-purple-50",
    header: "bg-white/70 border-purple-50",
  };

  return (
    <div className={`flex min-h-screen ${theme.bg} font-sans ${theme.textMain} overflow-x-hidden text-left font-medium`}>
      <Toaster position="top-right" reverseOrder={false} />

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${theme.sidebar} border-r flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`p-6 flex items-center gap-3 border-b border-purple-50 text-left`}>
          <img src={Logo} alt="PEA Logo" className="h-12 w-auto object-contain" />
          <div className="leading-tight text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight">PEA CM2</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Employee System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left">
          <Link to="/EmployeeDashboard" className="no-underline"><SidebarItem icon={<FiFileText />} label="จัดการเอกสาร" /></Link>
          <Link to="/EmpDownloadDocs" className="no-underline"><SidebarItem icon={<FiDownload />} label="ดาวน์โหลดเอกสาร" /></Link>
          <Link to="/EmpUseHistory" className="no-underline"><SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" /></Link>
          <Link to="/SubmitDocsApprov" className="no-underline"><SidebarItem icon={<FiSend />} label="ส่งเอกสารให้พิจารณา" /></Link>
        </nav>
        <div className={`p-6 border-t border-purple-50 space-y-2 font-bold text-left`}>
          <SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" active />
          <div onClick={() => setIsLogoutModalOpen(true)} className="cursor-pointer">
            <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto text-left">
        <div className={`backdrop-blur-md px-4 lg:px-10 py-6 border-b ${theme.header} sticky top-0 z-30 font-bold flex justify-between items-center text-left`}>
          <div className="flex items-center gap-3 text-left">
            <button onClick={() => setIsSidebarOpen(true)} className={`p-2.5 bg-white border-purple-100 rounded-xl shadow-sm border lg:hidden text-[#74045F] flex items-center justify-center text-left`}><FiMenu size={20} /></button>
            <h2 className={`text-2xl lg:text-3xl font-bold text-[#74045F] tracking-tight text-left`}>ตั้งค่าระบบ</h2>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="text-right hidden sm:block text-left">
              <p className="text-[15px] font-black text-slate-800 leading-tight text-left">{user.name}</p>
              <p className="text-[12px] font-bold text-[#74045F] mt-0.5 text-left">{user.department}</p>
            </div>
            <button onClick={() => setOpenProfileModal(true)} className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white shadow-md active:scale-95 transition-transform text-left">
              <img src={user.avatar || "https://i.pravatar.cc/150?u=staff"} alt="profile" className="w-full h-full object-cover text-left" />
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 space-y-8 max-w-5xl mx-auto text-left">
          {/* ✅ เปลี่ยนสีไอคอนเป็น ม่วง PEA */}
          <section className="space-y-4 text-left">
            <div className="flex items-center gap-3 mb-6 text-left">
              <div className={`w-10 h-10 bg-purple-50 text-[#74045F] rounded-xl flex items-center justify-center text-left`}><FiBell size={20} /></div>
              <h3 className={`text-xl font-black text-[#74045F] text-left`}>การแจ้งเตือน</h3>
            </div>
            <div className="grid gap-4 text-left">
              <SettingToggleItem icon={<FiSmartphone />} title="การแจ้งเตือนในระบบ" desc="รับแจ้งเตือนเมื่อเอกสารของคุณได้รับการอนุมัติหรือถูกส่งกลับ" active={settings.notifications} onToggle={() => toggleSetting('notifications')} />
              <SettingToggleItem icon={<FiMail />} title="แจ้งเตือนผ่านอีเมล" desc="ส่งสำเนาสถานะเอกสารไปยังอีเมลติดต่อของคุณ" active={settings.emailAlert} onToggle={() => toggleSetting('emailAlert')} />
            </div>
          </section>

          {/* ✅ เปลี่ยนสีไอคอนเป็น Rose/Purple */}
          <section className="space-y-4 text-left">
            <div className="flex items-center gap-3 mb-6 text-left">
              <div className={`w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-left`}><FiShield size={20} /></div>
              <h3 className={`text-xl font-black text-slate-800 text-left`}>ความปลอดภัย</h3>
            </div>
            <div className="grid gap-4 text-left">
              <SettingToggleItem icon={<FiShield />} title="การยืนยันตัวตนสองชั้น (2FA)" desc="เพิ่มความปลอดภัยในการเข้าสู่ระบบด้วยรหัส OTP" active={settings.twoFactorAuth} onToggle={() => toggleSetting('twoFactorAuth')} />
            </div>
          </section>

          <section className="space-y-4 text-left">
            <div className="flex items-center gap-3 mb-6 text-left">
              <div className={`w-10 h-10 bg-purple-50 text-[#74045F] rounded-xl flex items-center justify-center text-left`}><FiSettings size={20} /></div>
              <h3 className={`text-xl font-black text-slate-800 text-left`}>ยืนยันรายการ</h3>
            </div>
            <div className={`${theme.card} p-8 rounded-[2.5rem] border border-purple-50 shadow-sm space-y-6 text-left`}>
               <div className="text-left">
                  <p className={`font-black text-slate-800 text-lg text-left`}>บันทึกข้อมูลการตั้งค่า</p>
                  <p className={`text-sm ${theme.textSub} font-bold text-left`}>การเปลี่ยนแปลงจะมีผลทันทีหลังจากที่คุณกดบันทึก</p>
               </div>
               <hr className="border-purple-50" />
               <div className="flex gap-4 text-left">
                  {/* ✅ เปลี่ยนสีปุ่มบันทึกเป็น ม่วง PEA */}
                  <button onClick={handleSaveSettings} className="bg-[#74045F] text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-purple-100 hover:bg-[#5a034a] transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2 text-left">
                    <FiCheck size={18} /> บันทึกการตั้งค่า
                  </button>
                  <button onClick={() => navigate("/EmployeeDashboard")} className="bg-white border border-purple-200 text-slate-500 px-8 py-3 rounded-2xl font-black hover:bg-purple-50 transition-all active:scale-95 text-sm uppercase tracking-widest text-left">
                    ยกเลิก
                  </button>
               </div>
            </div>
          </section>
        </div>
      </main>

      {openProfileModal && <EmployeeProfileModal user={user} setUser={setUser} onClose={() => setOpenProfileModal(false)} />}
      
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogoutConfirm} 
      />
    </div>
  );
}

/* --- Sub Components --- */
function SettingToggleItem({ icon, title, desc, active, onToggle }) {
  return (
    <div className={`bg-white border-purple-50 hover:border-[#74045F]/30 p-6 rounded-[2rem] border shadow-sm flex items-center justify-between group transition-all text-left`}>
      <div className="flex items-center gap-5 text-left">
        <div className={`w-12 h-12 bg-purple-50 text-purple-300 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 group-hover:text-[#74045F] transition-all shadow-sm text-left`}>{icon}</div>
        <div className="text-left">
          <p className={`font-black text-slate-800 text-lg leading-tight mb-1 text-left`}>{title}</p>
          <p className={`text-sm text-slate-400 font-bold max-w-md text-left`}>{desc}</p>
        </div>
      </div>
      {/* ✅ เปลี่ยนสี Toggle เป็น ม่วง PEA */}
      <button onClick={onToggle} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${active ? 'bg-[#74045F]' : 'bg-slate-200'} text-left`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'} text-left`} />
      </button>
    </div>
  );
}

function SidebarItem({ icon, label, active, danger, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer text-sm font-black transition-all text-left ${active ? "bg-purple-50 text-[#74045F] shadow-sm shadow-purple-100" : "text-slate-400 hover:bg-purple-50/50 hover:text-[#74045F]"} ${danger ? "text-rose-500 mt-auto text-left" : ""} text-left`}>
      <span className={`${active ? "text-[#74045F]" : "text-purple-200"} flex items-center justify-center text-lg`}>{icon}</span>{label}
    </div>
  );
}