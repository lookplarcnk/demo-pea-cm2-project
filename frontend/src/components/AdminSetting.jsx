import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import LogoutModal from "./LogoutModal"; 
import AdminProfileModal from "./AdminProfileModal";
import Logo from "../assets/img/logo-pea.png"; 
// ✅ 1. นำเข้า react-hot-toast
import toast, { Toaster } from 'react-hot-toast'; 

import {
  FiUsers, FiUserCheck, FiUserPlus, FiUserX, FiSearch, FiEdit, 
  FiMenu, FiSettings, FiLogOut, FiPieChart, FiFileText, 
  FiTrendingUp, FiX, FiCheck, FiCamera, FiFilter, 
  FiChevronLeft, FiChevronRight, FiShield, FiCalendar, FiPhone, FiChevronDown, FiHash, FiBell, FiGlobe, FiDatabase, FiSmartphone,
  FiCheckCircle,
  FiSend
} from "react-icons/fi";

export default function SystemSettingsPage() {
  const navigate = useNavigate(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false); 
  
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
    }
  });

  const [settings, setSettings] = useState({
    notifications: true,
    twoFactorAuth: false,
    autoBackup: true,
    maintenanceMode: false
  });

  // ✅ 2. เปลี่ยนจาก alert เป็น toast
  const handleSaveSettings = () => {
    if (settings.notifications) {
      toast.success('บันทึกการตั้งค่าและเปิดการแจ้งเตือนแล้ว', {
        duration: 4000,
        position: 'top-right',
        style: {
          borderRadius: '15px',
          background: '#333',
          color: '#fff',
          fontFamily: 'inherit',
          fontWeight: 'bold'
        },
      });
    } else {
      toast('บันทึกข้อมูลแล้ว (ปิดการแจ้งเตือน)', {
        icon: 'ℹ️',
        position: 'top-right',
      });
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("pea-admin-token"); 
    setOpenLogoutModal(false);
    navigate("/"); 
  };

  const theme = {
    bg: "bg-[#f8f9ff]",
    card: "bg-white border-slate-100",
    textMain: "text-slate-700",
    textSub: "text-slate-500",
    sidebar: "bg-white border-slate-100",
    header: "bg-white/50 border-slate-100",
    input: "bg-slate-50 text-slate-700",
  };

  return (
    <div className={`flex min-h-screen ${theme.bg} font-sans ${theme.textMain} overflow-x-hidden text-left font-medium`}>
      {/* ✅ 3. เพิ่มคอมโพเนนต์ Toaster ไว้บนสุดของหน้า */}
      <Toaster />

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${theme.sidebar} border-r flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`p-6 flex items-center gap-3 border-b border-slate-50 text-left`}>
          <img src={Logo} alt="PEA Logo" className="h-12 w-auto object-contain" />
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
          <Link to="/AnalysisReport"><SidebarItem icon={<FiTrendingUp />} label="รายงานเชิงวิเคราะห์" /></Link>
        </nav>
        <div className={`p-6 border-t border-slate-50 space-y-2 font-bold text-left`}>
          <Link to="/AdminSetting"><SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" active /></Link>
          <div onClick={() => setOpenLogoutModal(true)} className="cursor-pointer">
            <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className={`backdrop-blur-md px-4 lg:px-10 py-6 border-b ${theme.header} sticky top-0 z-30 font-bold flex justify-between items-center`}>
          <div className="flex items-center gap-3 text-left">
            <button onClick={() => setIsSidebarOpen(true)} className={`p-2.5 bg-white border-slate-200 rounded-xl shadow-sm border lg:hidden text-slate-600 flex items-center justify-center`}><FiMenu size={20} /></button>
            <h2 className={`text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight`}>ตั้งค่าระบบ</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setOpenProfileModal(true)} className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white shadow-md active:scale-95 transition-transform">
              <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 space-y-8 max-w-5xl mx-auto text-left text-left">
          <section className="space-y-4 text-left">
            <div className="flex items-center gap-3 mb-6 text-left">
              <div className={`w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center`}><FiGlobe size={20} /></div>
              <h3 className={`text-xl font-black text-slate-800`}>การตั้งค่าทั่วไป</h3>
            </div>
            <div className="grid gap-4 text-left">
              <SettingToggleItem 
                icon={<FiBell />} 
                title="การแจ้งเตือนระบบ" 
                desc="รับการแจ้งเตือนเมื่อมีการอัปโหลดเอกสารใหม่หรือมีการขออนุมัติสิทธิ์"
                active={settings.notifications}
                onToggle={() => toggleSetting('notifications')}
              />
            </div>
          </section>

          <section className="space-y-4 text-left">
            <div className="flex items-center gap-3 mb-6 text-left">
              <div className={`w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center`}><FiShield size={20} /></div>
              <h3 className={`text-xl font-black text-slate-800`}>ความปลอดภัยและสิทธิ์</h3>
            </div>
            <div className="grid gap-4 text-left">
              <SettingToggleItem 
                icon={<FiShield />} 
                title="การยืนยันตัวตนสองชั้น (2FA)" 
                desc="เพิ่มความปลอดภัยอีกขั้นโดยใช้แอปยืนยันตัวตน"
                active={settings.twoFactorAuth}
                onToggle={() => toggleSetting('twoFactorAuth')}
              />
              <SettingToggleItem 
                icon={<FiDatabase />} 
                title="สำรองข้อมูลอัตโนมัติ" 
                desc="ระบบจะทำการสำรองฐานข้อมูลเอกสารทุกวันเวลา 00:00 น."
                active={settings.autoBackup}
                onToggle={() => toggleSetting('autoBackup')}
              />
            </div>
          </section>

          <section className="space-y-4 text-left">
            <div className="flex items-center gap-3 mb-6 text-left">
              <div className={`w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center`}><FiSettings size={20} /></div>
              <h3 className={`text-xl font-black text-slate-800`}>การจัดการขั้นสูง</h3>
            </div>
            <div className={`${theme.card} p-8 rounded-[2.5rem] border shadow-sm space-y-6 text-left`}>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                  <div className="text-left text-left">
                    <p className={`font-black text-slate-800 text-lg`}>โหมดปิดปรับปรุงระบบ</p>
                    <p className={`text-sm ${theme.textSub} font-bold`}>จำกัดการเข้าถึงของผู้ใช้งานทั่วไปชั่วคราวเพื่ออัปเดตระบบ</p>
                  </div>
                  <button 
                    onClick={() => toggleSetting('maintenanceMode')}
                    className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${settings.maintenanceMode ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {settings.maintenanceMode ? 'เปิดใช้งานอยู่' : 'ปิดใช้งาน'}
                  </button>
               </div>
               <hr className="border-slate-50" />
               <div className="flex gap-4 text-left">
                  <button 
                    onClick={handleSaveSettings}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <FiCheck size={18}/> บันทึกการตั้งค่า
                  </button>
                  <button className="bg-white border border-slate-200 text-slate-500 px-8 py-3 rounded-2xl font-black hover:bg-slate-50 transition-all active:scale-95 text-sm uppercase tracking-widest">
                    คืนค่าเริ่มต้น
                  </button>
               </div>
            </div>
          </section>
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

/* --- Sub Components (คงเดิม) --- */

function SettingToggleItem({ icon, title, desc, active, onToggle }) {
  return (
    <div className={`bg-white border-slate-100 hover:border-indigo-100 p-6 rounded-[2rem] border shadow-sm flex items-center justify-between group transition-all text-left`}>
      <div className="flex items-center gap-5 text-left text-left">
        <div className={`w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-sm`}>
          {icon}
        </div>
        <div className="text-left text-left">
          <p className={`font-black text-slate-800 text-lg leading-tight mb-1`}>{title}</p>
          <p className={`text-sm text-slate-400 font-bold max-w-md`}>{desc}</p>
        </div>
      </div>
      <button 
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function SidebarItem({ icon, label, active, danger }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer text-sm font-black transition-all text-left ${active ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"} ${danger ? "text-rose-500 mt-auto text-left" : ""}`}>
      <span className={`${active ? "text-indigo-600" : "text-slate-300"} flex items-center justify-center text-left text-left`}>{icon}</span>{label}
    </div>
  );
}