import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import {
  FiFileText, FiClock, FiDownload, FiUser, FiLogOut, FiSettings,
  FiSearch, FiX, FiMenu, FiCheckCircle, FiInfo, FiFile, FiCamera, FiCheck, FiFilter, FiBriefcase, FiTrendingUp, FiLayers, FiChevronLeft, FiChevronRight
} from "react-icons/fi";

// ✅ 1. Import Logo การไฟฟ้า และคอมโพเนนต์โปรไฟล์
import Logo from "../assets/img/logo-pea.png"; 
import EmployeeProfileModal from "./EmployeeProfileModal"; 

const API_BASE_URL = "http://localhost:5000/api";

/* --- 1. LogoutModal Component --- */
function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-bold text-left animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
          <FiLogOut size={40} />
        </div>
        <div className="text-center space-y-2 mb-10">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">ยืนยันการออกจากระบบ?</h3>
          <p className="text-slate-400 font-bold text-sm">คุณต้องการออกจากเซสชันการทำงานปัจจุบันหรือไม่</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
            <FiCheck size={18} /> ยืนยันออกจากระบบ
          </button>
          <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs">
            ยกเลิก
          </button>
        </div>
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-all">
          <FiX size={24} />
        </button>
      </div>
    </div>
  );
}

/* --- 2. Main Dashboard Component --- */
export default function EmployeeDownloadCenter() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ทั้งหมด"); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [submittedSearch, setSubmittedSearch] = useState(""); 
  const [sortOption, setSortOption] = useState("newest"); 
  const [selectedDept, setSelectedDept] = useState("ทุกแผนก");
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const [availableFiles, setAvailableFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState({
    name: "กำลังโหลด...",
    role: "Officer",
    email: "",
    phone: "081-234-5678",
    department: "กำลังโหลด...",
    employeeId: "PEA-XXXXX",
    avatar: ""
  });

  /* --- ดึงข้อมูลพนักงานจากฐานข้อมูลโดยตรงเหมือน EmployeeDashboard.jsx --- */
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
          setUser(prev => ({ 
            ...prev, 
            name: savedUser.fullName || `${savedUser.firstName} ${savedUser.lastName}`, 
            department: savedUser.dept || "ไม่ระบุแผนก",
            avatar: savedUser.avatar
          }));
        }
      };

      fetchEmployeeData();
      fetchDocuments();
    } else {
      navigate("/loginemployee");
    }
  }, [navigate]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/documents`); 
      const data = await response.json();
      const approvedDocs = data.filter(doc => doc.status === 'อนุมัติแล้ว');
      setAvailableFiles(approvedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["ทั้งหมด", "กฏระเบียบ นโยบาย และข้อบังคับ", "คู่มือและ SOP", "เอกสารแบบฟอร์ม", "เอกสารการจัดซื้อจัดจ้าง", "เอกสารรายงานประจำปี", "คำสั่งและประกาศ"];
  const departments = ["ทุกแผนก", "เทคโนโลยีสารสนเทศ (IT)", "ฝ่ายบริหารทรัพยากรบุคคล", "ฝ่ายพัสดุและจัดหา", "ฝ่ายบัญชีและการเงิน"];

  const handleSearchClick = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(1);
  };
  
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearchClick(); };

  const handleLogoutConfirm = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/loginemployee";
  };

  const allFilteredFiles = useMemo(() => {
    let result = availableFiles.filter(file => {
      const isNotMine = file.owner !== user.name;
      const matchesTab = activeTab === "ทั้งหมด" || file.category === activeTab;
      const matchesSearch = (file.doc_name || "").toLowerCase().includes(submittedSearch.toLowerCase());
      const matchesDept = selectedDept === "ทุกแผนก" || file.dept === selectedDept;
      return isNotMine && matchesTab && matchesSearch && matchesDept;
    });

    return result.sort((a, b) => {
      if (sortOption === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortOption === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortOption === "az") return (a.doc_name || "").localeCompare((b.doc_name || ""), 'th');
      return 0;
    });
  }, [activeTab, submittedSearch, sortOption, selectedDept, availableFiles, user.name]);

  const totalEntries = allFilteredFiles.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allFilteredFiles.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] font-sans text-slate-700 overflow-x-hidden text-left font-medium">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-50 text-left">
          {/* ✅ แก้ไข: เปลี่ยนจากตัวอักษร P เป็น Logo การไฟฟ้า */}
          <img src={Logo} alt="PEA Logo" className="h-12 w-auto object-contain" />
          <div className="leading-tight text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight">PEA CM2</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Employee System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left">
          <Link to="/EmployeeDashboard" className="block outline-none">
            <SidebarItem icon={<FiFileText />} label="จัดการเอกสาร" />
          </Link>
          <Link to="/EmpDownloadDocs" className="block outline-none">
            <SidebarItem icon={<FiDownload />} label="ดาวน์โหลดเอกสาร" active />
          </Link>
          <Link to="/EmpUseHistory" className="block outline-none">
            <SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" />
          </Link>
          <Link to="/SubmitDocsApprov" className="block outline-none">
            <SidebarItem icon={<FiUser />} label="ส่งเอกสารให้พิจารณา" />
          </Link>
        </nav>
        <div className="p-6 border-t border-slate-50 space-y-2">
          <Link to="/EmpSetting">
             <SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" />
          </Link>
          <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger onClick={() => setIsLogoutModalOpen(true)} />
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="bg-white/50 backdrop-blur-md px-4 lg:px-10 py-6 border-b border-slate-100 sticky top-0 z-30 font-bold">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 lg:hidden text-slate-600"><FiMenu size={20} /></button>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight text-left">ดาวน์โหลดเอกสาร</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-1">{user.department}</p>
              </div>
              <button onClick={() => setOpenProfileModal(true)} className="flex-shrink-0 active:scale-95 transition-transform">
                <img src={user.avatar || "https://i.pravatar.cc/150?u=staff"} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md hover:border-purple-400 transition-all" alt="profile" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 text-left">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-8 items-end bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all text-left">
            <div className="space-y-2.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">เลือกแผนก</label>
              <div className="relative">
                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select value={selectedDept} onChange={(e) => {setSelectedDept(e.target.value); setCurrentPage(1);}} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500/20 outline-none appearance-none cursor-pointer">
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">หมวดหมู่เอกสาร</label>
              <div className="relative">
                <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select value={activeTab} onChange={(e) => {setActiveTab(e.target.value); setCurrentPage(1);}} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500/20 outline-none appearance-none cursor-pointer">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">เรียงตาม</label>
              <div className="relative">
                <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500/20 outline-none appearance-none cursor-pointer">
                  <option value="newest">ใหม่ล่าสุด</option>
                  <option value="oldest">เก่าที่สุด</option>
                  <option value="az">ชื่อ (ก - ฮ)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ค้นหาเอกสาร</label>
              <div className="relative group flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="ระบุชื่อไฟล์..." className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <button onClick={handleSearchClick} className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center">
                  <FiSearch size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-bold">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 text-left">
                <h3 className="font-bold text-slate-800 text-lg">รายการเอกสารจากเพื่อนพนักงานและส่วนกลาง</h3>
                {submittedSearch && (
                  <button onClick={() => {setSearchQuery(""); setSubmittedSearch("");}} className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"><FiX /> ล้างการค้นหา</button>
                )}
            </div>

            <div className="overflow-x-auto text-left">
              {isLoading ? (
                <div className="p-20 text-center text-slate-400 font-bold">กำลังโหลดข้อมูลเอกสาร...</div>
              ) : (
                <table className="w-full text-left border-collapse font-bold">
                  <thead className="bg-white border-b border-slate-100 text-slate-500 text-[13px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-5 text-center w-16">#</th>
                      <th className="px-4 py-5 text-left">ชื่อเอกสาร</th>
                      <th className="px-6 py-5 hidden md:table-cell text-left">ผู้อัปโหลด</th>
                      <th className="px-6 py-5 hidden md:table-cell text-left">แผนกที่รับผิดชอบ</th>
                      <th className="px-6 py-5 text-center">ขนาด</th>
                      <th className="px-6 py-5 text-center">วันที่อัปโหลด</th>
                      <th className="px-8 py-5 text-right">ดาวน์โหลด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold">
                    {currentItems.map((file, index) => (
                      <tr key={file.doc_id} className="hover:bg-slate-50/50 transition-colors group font-semibold text-sm lg:text-base">
                        <td className="px-6 py-5 text-center font-bold text-slate-300">{indexOfFirstItem + index + 1}</td>
                        <td className="px-4 py-5 text-slate-700">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"><FiFile size={20} /></div>
                            <span className="line-clamp-1">{file.doc_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell text-sm text-slate-500 font-medium text-left">{file.owner === "Admin Ratchaneekorn" ? "PEA Admin" : file.owner}</td>
                        <td className="px-6 py-5 hidden md:table-cell text-sm text-slate-500 italic font-medium text-left">{file.dept}</td>
                        <td className="px-6 py-5 text-center text-sm font-bold text-slate-500 font-mono">{file.file_size}</td>
                        <td className="px-6 py-5 text-center text-sm text-slate-700 font-bold">{new Date(file.created_at).toLocaleDateString('th-TH')}</td>
                        <td className="px-8 py-5 text-right">
                          <DownloadButton fileUrl={file.file_url} />
                        </td>
                      </tr>
                    ))}
                    {currentItems.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan="7" className="p-20 text-center text-slate-400 italic font-medium">ไม่พบเอกสารของสมาชิกท่านอื่น</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/10 font-bold">
              <div className="text-slate-400 text-sm font-bold">
                Showing <span className="font-bold text-slate-700">{totalEntries === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalEntries)}</span> of <span className="font-bold text-slate-700">{totalEntries}</span> entries
              </div>
              <div className="flex items-center gap-1 font-bold">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className={`p-2 rounded-lg transition-all ${currentPage === 1 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:bg-slate-100"}`}><FiChevronLeft size={20} /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`min-w-[36px] h-9 px-2 rounded-lg font-bold text-sm transition-all ${currentPage === i + 1 ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-100"}`}>{i + 1}</button>
                ))}
                <button disabled={currentPage === totalPages || totalEntries === 0} onClick={() => setCurrentPage(prev => prev + 1)} className={`p-2 rounded-lg transition-all ${currentPage === totalPages || totalEntries === 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:bg-slate-100"}`}><FiChevronRight size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ 2. เรียกใช้งาน EmployeeProfileModal */}
      {openProfileModal && (
        <EmployeeProfileModal 
          user={user} 
          setUser={setUser} 
          onClose={() => setOpenProfileModal(false)} 
        />
      )}

      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogoutConfirm} />
    </div>
  );
}

/* --- Sub-Components --- */

function SidebarItem({ icon, label, active, danger, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer text-sm font-black transition-all text-left ${
        active 
          ? "bg-purple-50 text-purple-700 shadow-sm shadow-purple-100 font-black" 
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 font-black"
      } ${danger ? "text-rose-500 hover:bg-rose-50 mt-auto font-black" : ""}`}
    >
      <span className={active ? "text-purple-600 text-lg" : "text-slate-300 text-lg"}>{icon}</span>
      <span className="text-[14px]">{label}</span>
    </div>
  );
}

function DownloadButton({ fileUrl }) {
  const [status, setStatus] = useState("idle");
  const handleDownload = () => {
    setStatus("loading");
    setTimeout(() => { 
      window.open(`http://localhost:5000/${fileUrl}`, '_blank');
      setStatus("success"); 
      setTimeout(() => setStatus("idle"), 2000); 
    }, 800);
  };
  if (status === "loading") return <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center ml-auto transition-all"><div className="w-4 h-4 border-2 border-slate-300 border-t-purple-600 rounded-full animate-spin" /></div>;
  if (status === "success") return <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center ml-auto animate-in zoom-in"><FiCheckCircle size={20} /></div>;
  return <button onClick={handleDownload} className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all ml-auto block shadow-sm active:scale-90"><FiDownload size={18} strokeWidth={2.5} /></button>;
}

// ✅ 3. คงรักษาฟังก์ชัน ProfileInput ไว้ในไฟล์เดิมตามคำสั่ง
function ProfileInput({ label, value, onChange }) {
  return (
    <div className="space-y-2 text-left block font-bold">
      <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1 font-bold">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-sm focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold" 
      />
    </div>
  );
}