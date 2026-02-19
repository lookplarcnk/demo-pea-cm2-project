import React, { useState, useRef, useMemo, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import LogoutModal from "./LogoutModal"; 
// ✅ นำเข้าคอมโพเนนต์โปรไฟล์ใหม่
import AdminProfileModal from "./AdminProfileModal";
import Logo from "../assets/img/logo-pea.png"; 
// ✅ เพิ่มการนำเข้า toast
import toast, { Toaster } from "react-hot-toast";
import {
  FiUsers, FiUserCheck, FiUserPlus, FiUserX, FiSearch, FiEdit, 
  FiMenu, FiSettings, FiLogOut, FiPieChart, FiFileText, 
  FiTrendingUp, FiX, FiCheck, FiCamera, FiFilter, 
  FiChevronLeft, FiChevronRight, FiShield, FiCalendar, FiPhone, FiChevronDown, FiHash, FiBriefcase, FiPlus, FiTrash2, FiEdit3,
  FiCheckCircle, FiSend 
} from "react-icons/fi";

const API_BASE_URL = "http://localhost:5000/api";

export default function UserManagementPage() {
  const navigate = useNavigate(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [openManageDeptModal, setOpenManageDeptModal] = useState(false);
  
  // ✅ State สำหรับการแก้ไข
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ทั้งหมด");
  const [activeTab, setActiveTab] = useState("พนักงานภายใน");
  const [sortBy, setSortBy] = useState("newest");

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

  const handleConfirmLogout = () => {
    localStorage.removeItem("pea-admin-token"); 
    setOpenLogoutModal(false);
    navigate("/"); 
  };

  const [users, setUsers] = useState([]);
  const [publicUsers, setPublicUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, [activeTab]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      const deptArray = response.data.map(d => d.dept_name); 
      setDepartments(deptArray);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartments([]); 
    }
  };

  const fetchData = async () => {
    try {
      const endpoint = activeTab === "พนักงานภายใน" ? "/employees" : "/public-users";
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      
      if (activeTab === "พนักงานภายใน") {
        const mappedUsers = response.data.map(u => ({
          id: u.emp_id,
          empCode: u.emp_id.toString().padStart(5, '0'), 
          name: u.emp_name,
          email: u.emp_email,
          phone: u.emp_phone || "ไม่ระบุ", 
          gender: u.emp_gender || "ไม่ระบุ", 
          department: u.dept_name || u.emp_dept || "ไม่ระบุแผนก",
          role: u.role || "พนักงานทั่วไป", 
          status: u.status || "ใช้งานอยู่",
          avatar: `https://i.pravatar.cc/150?u=${u.emp_id}`,
          canApprove: u.can_approve || false,
          joinDate: new Date(u.created_at || Date.now()).toISOString().split('T')[0]
        }));
        setUsers(mappedUsers);
      } else {
        const mappedPublicUsers = response.data.map(u => ({
          id: u.id,
          empCode: null,
          name: u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : (u.name || "ไม่ระบุชื่อ"),
          email: u.email,
          phone: u.phone || "ไม่ระบุ", 
          gender: u.gender || "ไม่ระบุ", 
          department: "บุคคลภายนอก",
          role: null,
          status: u.status || "ใช้งานอยู่",
          avatar: `https://ui-avatars.com/api/?name=${u.first_name || 'P'}&background=74045F&color=fff&rounded=true`,
          canApprove: false,
          joinDate: new Date(u.created_at || Date.now()).toISOString().split('T')[0]
        }));
        setPublicUsers(mappedPublicUsers);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      if (activeTab === "พนักงานภายใน") setUsers([]);
      else setPublicUsers([]);
    }
  };

  const stats = {
    total: activeTab === "พนักงานภายใน" ? users.length : publicUsers.length,
    active: activeTab === "พนักงานภายใน" ? users.filter(u => u.status === "ใช้งานอยู่").length : publicUsers.filter(u => u.status === "ใช้งานอยู่").length,
    suspended: activeTab === "พนักงานภายใน" ? users.filter(u => u.status === "ระงับการใช้งาน").length : publicUsers.filter(u => u.status === "ระงับการใช้งาน").length,
  };

  const filteredData = useMemo(() => {
    let dataSource = activeTab === "พนักงานภายใน" ? [...users] : [...publicUsers];
    dataSource = dataSource.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.empCode && u.empCode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = activeTab === "พนักงานภายใน" ? (selectedRole === "ทั้งหมด" || u.role === selectedRole) : true;
      return matchesSearch && matchesRole;
    });
    
    dataSource.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.joinDate) - new Date(a.joinDate);
      if (sortBy === "oldest") return new Date(a.joinDate) - new Date(b.joinDate);
      if (sortBy === "nameAsc") return a.name.localeCompare(b.name, 'th');
      if (sortBy === "nameDesc") return b.name.localeCompare(a.name, 'th');
      return 0;
    });
    return dataSource;
  }, [activeTab, users, publicUsers, searchQuery, selectedRole, sortBy]);

  const handleToggleStatus = async (id) => {
    try {
      const endpoint = activeTab === "พนักงานภายใน" ? `/employees/${id}/status` : `/public-users/${id}/status`;
      await axios.patch(`${API_BASE_URL}${endpoint}`);
      fetchData(); 
      toast.success("อัปเดตสถานะผู้ใช้งานสำเร็จ");
    } catch (err) {
      toast.error("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      await axios.post(`${API_BASE_URL}/employees`, {
        emp_email: newUser.email,
        emp_password: newUser.empCode,
        emp_name: newUser.name,
        dept_name: newUser.department,
        role: newUser.role,
        emp_phone: newUser.phone,    
        emp_gender: newUser.gender   
      });
      fetchData();
      setOpenAddUserModal(false);
      toast.success("เพิ่มพนักงานใหม่สำเร็จ");
    } catch (err) {
      toast.error(err.response?.data?.error || "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  // ✅ บันทึกการแก้ไขข้อมูลลงฐานข้อมูล
  const handleEditUserSubmit = async (updatedUser) => {
    try {
      const endpoint = activeTab === "พนักงานภายใน" 
        ? `/employees/${updatedUser.id}` 
        : `/public-users/${updatedUser.id}`;
        
      const payload = activeTab === "พนักงานภายใน" ? {
        emp_name: updatedUser.name,
        emp_email: updatedUser.email,
        emp_phone: updatedUser.phone,
        emp_gender: updatedUser.gender,
        dept_name: updatedUser.department,
        role: updatedUser.role
      } : {
        first_name: updatedUser.name.split(' ')[0],
        last_name: updatedUser.name.split(' ').slice(1).join(' '),
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender 
      };

      await axios.put(`${API_BASE_URL}${endpoint}`, payload);
      fetchData();
      setOpenEditModal(false);
      toast.success("บันทึกการแก้ไขข้อมูลสำเร็จ");
    } catch (err) {
      toast.error("ไม่สามารถบันทึกการแก้ไขได้");
    }
  };

  const getDeptColor = (dept) => {
    if (!dept) return "bg-purple-50 text-[#74045F] border-purple-100";
    if (dept.includes("IT")) return "bg-indigo-50 text-indigo-600 border-indigo-100";
    if (dept.includes("ทรัพยากรบุคคล")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    return "bg-purple-50 text-[#74045F] border-purple-100";
  };

  return (
    <div className="flex min-h-screen bg-[#fcfaff] font-sans text-slate-700 overflow-x-hidden text-left font-medium">
      {/* ✅ ติดตั้ง Toaster Container */}
      <Toaster position="top-right" reverseOrder={false} />
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-purple-50 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3 border-b border-purple-50 text-left">
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
          <Link to="/UserManage"><SidebarItem icon={<FiUsers />} label="จัดการผู้ใช้งาน" active /></Link>
          <Link to="/AnalysisReport"><SidebarItem icon={<FiTrendingUp />} label="รายงานเชิงวิเคราะห์" /></Link>
        </nav>
        <div className="p-6 border-t border-purple-50 space-y-2 font-bold text-left">
          <Link to="/AdminSetting"><SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" /></Link>
          <div onClick={() => setOpenLogoutModal(true)} className="cursor-pointer">
            <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="bg-white/70 backdrop-blur-md px-4 lg:px-10 py-6 border-b border-purple-50 sticky top-0 z-30 font-bold flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-purple-100 lg:hidden text-[#74045F] flex items-center justify-center"><FiMenu size={20} /></button>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#74045F] tracking-tight">จัดการผู้ใช้งาน</h2>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => { setActiveTab("พนักงานภายใน"); setSelectedRole("ทั้งหมด"); }} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "พนักงานภายใน" ? "bg-white text-[#74045F] shadow-sm" : "text-slate-400"}`}>พนักงานภายใน</button>
            <button onClick={() => { setActiveTab("บุคคลทั่วไป"); setSelectedRole("ทั้งหมด"); }} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "บุคคลทั่วไป" ? "bg-white text-[#74045F] shadow-sm" : "text-slate-400"}`}>บุคคลทั่วไป</button>
          </div>

          <button onClick={() => setOpenProfileModal(true)} className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white shadow-md active:scale-95 transition-transform">
            <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
          </button>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 text-left space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <SummaryCard title={`ทั้งหมด (${activeTab})`} value={stats.total} icon={<FiUsers />} color="blue" />
                <SummaryCard title="กำลังใช้งานอยู่" value={stats.active} icon={<FiUserCheck />} color="purple" />
                <SummaryCard title="ระงับการใช้งาน" value={stats.suspended} icon={<FiUserX />} color="rose" />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-purple-50 overflow-hidden font-bold">
                <div className="p-6 lg:p-8 flex flex-col xl:flex-row justify-between items-center gap-6 border-b border-purple-50 bg-purple-50/20">
                    <div className="relative w-full xl:w-96 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                        <input type="text" placeholder={`ค้นหาชื่อ, อีเมล หรือรหัส...`} className="pl-12 pr-4 py-3 rounded-2xl bg-white border border-purple-100 w-full outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3 w-full xl:w-auto font-bold">
                        {activeTab === "พนักงานภายใน" && (
                          <>
                            <button onClick={() => setOpenManageDeptModal(true)} className="bg-purple-50 hover:bg-purple-100 text-[#74045F] px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 active:scale-95 h-[48px]">
                                <FiBriefcase size={16} /> จัดการแผนก
                            </button>
                            <button onClick={() => setOpenAddUserModal(true)} className="bg-[#74045F] hover:bg-[#5a034a] text-white px-7 py-3 rounded-2xl font-black shadow-lg shadow-purple-100 flex items-center gap-2 uppercase tracking-wider text-xs transition-all active:scale-95 h-[48px]">
                                <FiUserPlus size={18}/> เพิ่มพนักงาน
                            </button>
                          </>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-[#74045F]/40 text-xs font-black uppercase tracking-widest border-b border-purple-50">
                            <tr>
                                <th className="px-6 py-5 text-center w-20">ลำดับ</th>
                                {activeTab === "พนักงานภายใน" && <th className="px-6 py-5">รหัสพนักงาน</th>}
                                <th className="px-8 py-5">ผู้ใช้งาน</th>
                                <th className="px-6 py-5">ติดต่อ</th>
                                <th className="px-6 py-5">เข้าร่วมเมื่อ</th>
                                {activeTab === "พนักงานภายใน" && <th className="px-6 py-5">แผนก</th>}
                                <th className="px-6 py-5 text-center">สถานะ</th>
                                <th className="px-8 py-5 text-right">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50 font-bold">
                            {filteredData.map((u, index) => (
                                <tr key={u.id} className="hover:bg-purple-50/20 transition-all font-bold group">
                                    <td className="px-6 py-5 text-center"><span className="text-purple-200 font-black text-sm">{index + 1}</span></td>
                                    {activeTab === "พนักงานภายใน" && (
                                        <td className="px-6 py-5 text-left">
                                            <span className={`text-[10px] px-3 py-1 rounded-lg border font-black tracking-widest uppercase shadow-sm ${getDeptColor(u.department)}`}>
                                              {u.empCode}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <img src={u.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="avatar" />
                                            <div>
                                                <p className="text-slate-800 text-lg font-black">{u.name}</p>
                                                <p className="text-xs text-purple-300 font-medium">{u.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5"><div className="flex items-center gap-2 text-slate-600 font-bold"><FiPhone size={14} className="text-purple-400" /><span className="text-xs">{u.phone}</span></div></td>
                                    <td className="px-6 py-5"><div className="flex items-center gap-2 text-slate-500 font-bold"><FiCalendar size={14} className="text-purple-400" /><span className="text-xs">{u.joinDate}</span></div></td>
                                    {activeTab === "พนักงานภายใน" && <td className="px-6 py-5"><span className="text-slate-600 font-bold">{u.department}</span></td>}
                                    <td className="px-6 py-5 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.status === 'ใช้งานอยู่' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{u.status}</span></td>
                                    <td className="px-8 py-5 text-right font-bold">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setSelectedUserForEdit(u); setOpenEditModal(true); }} className="p-2.5 bg-white border border-purple-50 text-purple-300 hover:text-[#74045F] hover:bg-purple-50 rounded-xl transition-all shadow-sm"><FiEdit size={16} /></button>
                                            <button onClick={() => handleToggleStatus(u.id)} className={`p-2.5 bg-white border border-purple-50 rounded-xl transition-all shadow-sm ${u.status === 'ระงับการใช้งาน' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-rose-500 hover:bg-rose-50'}`}>{u.status === 'ใช้งานอยู่' ? <FiUserX size={16} /> : <FiUserCheck size={16} />}</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </main>

      {openProfileModal && (
        <AdminProfileModal user={user} setUser={setUser} onClose={() => setOpenProfileModal(false)} />
      )}
      
      {openEditModal && (
        <EditUserModal 
          user={selectedUserForEdit} 
          onSave={handleEditUserSubmit} 
          onClose={() => setOpenEditModal(false)} 
          departments={departments} 
        />
      )}

      {openAddUserModal && <AddUserModal onAdd={handleAddUser} onClose={() => setOpenAddUserModal(false)} departments={departments} />}
      {openManageDeptModal && <ManageDeptModal departments={departments} onClose={() => setOpenManageDeptModal(false)} fetchDepartments={fetchDepartments} />}
      <LogoutModal isOpen={openLogoutModal} onClose={() => setOpenLogoutModal(false)} onConfirm={handleConfirmLogout} />
    </div>
  );
}

/* --- ✅ Modal สำหรับแก้ไขข้อมูลผู้ใช้งาน --- */
function EditUserModal({ user, onSave, onClose, departments }) {
  const [formData, setFormData] = useState({ ...user });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return toast.error("กรุณากรอกข้อมูลที่จำเป็น");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-bold">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in duration-300 text-left">
        <button onClick={onClose} className="absolute right-8 top-8 w-10 h-10 text-slate-400 hover:text-rose-50 flex items-center justify-center hover:bg-rose-50 rounded-full font-black"><FiX size={24} /></button>
        <h3 className="text-2xl font-black text-[#74045F] mb-8 uppercase tracking-tight">แก้ไขข้อมูลผู้ใช้งาน</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <ProfileInput label="ชื่อ-นามสกุล" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
            <ProfileInput label="อีเมล" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <ProfileInput label="เบอร์โทรศัพท์" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
            <div className="space-y-2 block text-left">
              <label className="text-[14px] font-black text-purple-300 uppercase tracking-widest ml-1">เพศ</label>
              <div className="relative">
                <select className="appearance-none w-full bg-slate-50 border border-purple-50 rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold cursor-pointer" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="ชาย">ชาย</option><option value="หญิง">หญิง</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
              </div>
            </div>
          </div>
          {formData.role && (
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2 block text-left">
                <label className="text-[14px] font-black text-purple-300 uppercase tracking-widest ml-1">แผนก</label>
                <div className="relative">
                  <select className="appearance-none w-full bg-slate-50 border border-purple-50 rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold cursor-pointer" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                      {departments.map((dept, idx) => <option key={idx} value={dept}>{dept}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2 block text-left">
                <label className="text-[14px] font-black text-purple-300 uppercase tracking-widest ml-1">ระดับสิทธิ์</label>
                <div className="relative">
                  <select className="appearance-none w-full bg-slate-50 border border-purple-50 rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold cursor-pointer" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                      <option>Admin</option><option>หัวหน้าแผนก</option><option>พนักงานทั่วไป</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full px-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full sm:w-40 bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-[1.5rem] transition-all active:scale-95 uppercase tracking-widest text-xs shadow-md shadow-rose-100 flex items-center justify-center"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-64 bg-[#74045F] hover:bg-[#5a034a] text-white font-black py-4 px-8 rounded-[1.5rem] shadow-lg shadow-purple-100 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <FiCheck size={18} /> บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageDeptModal({ departments, onClose, fetchDepartments }) {
  const [newDept, setNewDept] = useState("");
  const [editingDept, setEditingDept] = useState(null); 
  const [editValue, setEditValue] = useState(""); 

  const handleAdd = async () => {
    const trimmed = newDept.trim();
    if (!trimmed) return toast.error("กรุณากรอกชื่อแผนก");
    try {
      await axios.post(`${API_BASE_URL}/departments`, { dept_name: trimmed });
      setNewDept("");
      await fetchDepartments();
      toast.success("เพิ่มแผนกใหม่สำเร็จ");
    } catch (err) {
      toast.error(err.response?.data?.error || "ไม่สามารถเพิ่มแผนกได้");
    }
  };

  const handleUpdate = async (oldName) => {
    const trimmedValue = editValue.trim();
    if (!trimmedValue || trimmedValue === oldName) {
      setEditingDept(null);
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/departments/${encodeURIComponent(oldName)}`, { dept_name: trimmedValue });
      setEditingDept(null);
      await fetchDepartments();
      toast.success("แก้ไขชื่อแผนกสำเร็จ");
    } catch (err) {
      toast.error(err.response?.data?.error || "ไม่สามารถแก้ไขชื่อแผนกได้");
    }
  };

  const handleDelete = async (deptName) => {
    if (!window.confirm(`คุณต้องการลบแผนก "${deptName}" ใช่หรือไม่?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/departments/${encodeURIComponent(deptName)}`);
      await fetchDepartments();
      toast.success("ลบแผนกเรียบร้อยแล้ว");
    } catch (err) {
      toast.error("ไม่สามารถลบได้ เนื่องจากแผนกนี้อาจถูกใช้งานอยู่");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-bold text-left">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative animate-in zoom-in duration-300 text-left">
        <button onClick={onClose} className="absolute right-6 top-6 w-8 h-8 text-slate-400 hover:text-rose-50 flex items-center justify-center hover:bg-rose-50 rounded-full transition-all"><FiX size={20} /></button>
        <h3 className="text-xl font-black text-[#74045F] mb-6 uppercase tracking-tight">จัดการรายชื่อแผนก</h3>
        <div className="flex gap-3 mb-6 text-left">
          <input type="text" value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="ระบุชื่อแผนกใหม่..." className="flex-1 bg-slate-50 border border-purple-50 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-purple-500/10 outline-none font-bold" />
          <button onClick={handleAdd} className="bg-[#74045F] text-white px-5 py-3 rounded-xl font-black text-xs hover:bg-[#5a034a] transition-all flex items-center gap-2 shadow-lg shadow-purple-100"><FiPlus size={16}/> เพิ่ม</button>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {departments.length > 0 ? departments.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-purple-50 hover:shadow-sm border border-transparent hover:border-purple-100 transition-all">
              {editingDept === dept ? (
                <div className="flex-1 flex gap-2 items-center">
                  <input autoFocus type="text" className="flex-1 bg-white border border-purple-200 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 font-bold" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdate(dept)} />
                  <button onClick={() => handleUpdate(dept)} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"><FiCheck size={16}/></button>
                  <button onClick={() => setEditingDept(null)} className="text-rose-400 hover:bg-rose-50 p-2 rounded-lg transition-colors"><FiX size={16}/></button>
                </div>
              ) : (
                <>
                  <span className="text-slate-700 text-sm font-bold">{dept}</span>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditingDept(dept); setEditValue(dept); }} className="w-8 h-8 flex items-center justify-center text-purple-300 hover:bg-white hover:text-[#74045F] rounded-lg transition-all"><FiEdit3 size={15}/></button>
                    <button onClick={() => handleDelete(dept)} className="w-8 h-8 flex items-center justify-center text-purple-300 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all"><FiTrash2 size={15}/></button>
                  </div>
                </>
              )}
            </div>
          )) : (
            <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">ไม่มีข้อมูลแผนก</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddUserModal({ onAdd, onClose, departments }) {
  const [formData, setFormData] = useState({ 
    empCode: "", name: "", email: "", phone: "", department: "", role: "พนักงานทั่วไป", gender: "ชาย" 
  });

  useEffect(() => {
    if (departments && departments.length > 0) {
      setFormData(prev => ({ ...prev, department: departments[0] }));
    }
  }, [departments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.empCode || !formData.email || !formData.department) return toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-bold text-left">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute right-8 top-8 w-10 h-10 text-slate-400 hover:text-rose-50 flex items-center justify-center hover:bg-rose-50 rounded-full font-black"><FiX size={24} /></button>
        <h3 className="text-2xl font-black text-[#74045F] mb-8 uppercase tracking-tight">เพิ่มพนักงานใหม่</h3>
        <p className="text-xs text-[#74045F] mb-6 bg-purple-50 p-3 rounded-xl flex items-center gap-2 font-bold"><FiHash /> รหัสผ่านเริ่มต้นจะถูกตั้งเป็น "รหัสพนักงาน" โดยอัตโนมัติ</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <ProfileInput label="รหัสพนักงาน" value={formData.empCode} onChange={(v) => setFormData({...formData, empCode: v})} />
            <ProfileInput label="ชื่อ-นามสกุล" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <ProfileInput label="อีเมล" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
            <ProfileInput label="เบอร์โทรศัพท์" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2 block text-left">
              <label className="text-[14px] font-black text-purple-300 uppercase tracking-widest ml-1">เพศ</label>
              <div className="relative">
                <select className="appearance-none w-full bg-slate-50 border border-purple-50 rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold cursor-pointer" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="ชาย">ชาย</option><option value="หญิง">หญิง</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2 block text-left">
              <label className="text-[14px] font-black text-purple-300 uppercase tracking-widest ml-1">ระดับสิทธิ์</label>
              <div className="relative">
                <select className="appearance-none w-full bg-slate-50 border border-purple-50 rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold cursor-pointer" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option>Admin</option><option>หัวหน้าแผนก</option><option>พนักงานทั่วไป</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5">
             <div className="space-y-2 block text-left">
              <label className="text-[14px] font-black text-purple-300 uppercase tracking-widest ml-1">แผนก / หน่วยงาน</label>
              <div className="relative">
                <select className="appearance-none w-full bg-slate-50 border border-purple-50 rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold cursor-pointer" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                    {departments.map((dept, index) => <option key={index} value={dept}>{dept}</option>)}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full px-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full sm:w-40 bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-[1.5rem] transition-all active:scale-95 uppercase tracking-widest text-xs shadow-sm shadow-rose-100 flex items-center justify-center"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-64 bg-[#74045F] hover:bg-[#5a034a] text-white font-black py-4 px-8 rounded-[1.5rem] shadow-lg shadow-purple-100 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <FiCheck size={18} /> ยืนยันการเพิ่มพนักงาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, danger }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer text-sm font-black transition-all text-left ${active ? "bg-purple-50 text-[#74045F] shadow-sm shadow-purple-100" : "text-slate-400 hover:bg-purple-50 hover:text-[#74045F]"} ${danger ? "text-rose-500 mt-auto" : ""}`}>
      <span className={`flex items-center justify-center ${active ? 'text-[#74045F]' : 'text-purple-200'}`}>{icon}</span>{label}
    </div>
  );
}

function ProfileInput({ label, value, onChange }) {
  return (
    <div className="space-y-2 block font-bold text-left">
      <label className="text-[14px] font-black text-purple-300 uppercase tracking-widest ml-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-purple-50 rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold text-left" />
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colors = { purple: "bg-purple-50 text-[#74045F]", blue: "bg-blue-50 text-blue-600", rose: "bg-rose-50 text-rose-600" };
  return (
    <div className="bg-white rounded-[2rem] border border-purple-50 transition-all hover:shadow-lg group flex items-center p-6 shadow-sm relative overflow-hidden text-left">
      <div className={`w-14 h-14 rounded-2xl text-2xl group-hover:scale-110 transition-transform ${colors[color]} flex items-center justify-center shadow-sm shrink-0 mr-5 z-10`}>{icon}</div>
      <div className="flex flex-col z-10 overflow-hidden">
        <p className="text-[11px] font-black text-purple-200 uppercase tracking-[0.1em] truncate mb-0.5">{title}</p>
        <p className="text-3xl font-black text-slate-800 leading-tight">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}