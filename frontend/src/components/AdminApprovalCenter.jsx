import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import {
  FiFileText, FiClock, FiDownload, FiUser, FiLogOut, FiSettings,
  FiSearch, FiX, FiMenu, FiCheckCircle, FiInfo, FiFile, FiCamera, FiCheck, 
  FiFilter, FiBriefcase, FiTrendingUp, FiLayers, FiChevronLeft, FiChevronRight, 
  FiAlertCircle, FiEye, FiUpload, FiRotateCcw, FiEdit3, FiSend,
  FiPieChart, FiUsers 
} from "react-icons/fi";

// ✅ 1. Import Logo และคอมโพเนนต์โปรไฟล์ Admin
import Logo from "../assets/img/logo-pea.png"; 
import AdminProfileModal from "./AdminProfileModal"; 

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
          <h3 className="text-2xl font-black text-slate-800 tracking-tight text-center">ยืนยันการออกจากระบบ?</h3>
          <p className="text-slate-400 font-bold text-sm text-center">คุณต้องการออกจากเซสชันการทำงานปัจจุบันหรือไม่</p>
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

/* --- 2. Main Component สำหรับ Admin --- */
export default function AdminApprovalCenter() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("รออนุมัติ"); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selectedDept, setSelectedDept] = useState("ทุกแผนก");
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); 
  const [viewingDoc, setViewingDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ✅ นำส่วน user state เดิมกลับมาตามคำสั่ง
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

  const [approvalDocs, setApprovalDocs] = useState([]);
  // ✅ เพิ่ม State สำหรับเก็บข้อมูลแผนกจากฐานข้อมูลจริง
  const [dbDepartments, setDbDepartments] = useState(["ทุกแผนก"]);

  // ฟังก์ชันดึงเอกสารทั้งหมดในระบบเพื่อรอการพิจารณา (API จริง)
  const fetchAllPendingDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`);
      const formattedDocs = res.data
        .filter(doc => doc.approver_name === user.name && doc.owner !== user.name)
        .map(doc => ({
          id: doc.doc_id,
          name: doc.doc_name,
          category: doc.category || "ไม่ระบุหมวดหมู่",
          requester: doc.owner, 
          department: doc.dept || doc.dept_name,
          status: doc.status || "รออนุมัติ",
          size: doc.file_size,
          date: new Date(doc.created_at).toLocaleDateString('th-TH'),
          timestamp: new Date(doc.created_at).getTime(),
          description: doc.doc_description || doc.description || "", 
          fileUrl: `http://localhost:5000/${doc.file_url}`
        }));
      setApprovalDocs(formattedDocs);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  // ✅ ฟังก์ชันดึงข้อมูลแผนกจากฐานข้อมูล (API จริง)
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/departments`);
      if (res.data) {
        const deptNames = res.data.map(d => d.dept_name);
        setDbDepartments(["ทุกแผนก", ...deptNames]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  useEffect(() => {
    fetchAllPendingDocuments();
    fetchDepartments(); // ✅ เรียกใช้ฟังก์ชันดึงแผนกเมื่อโหลดหน้า
  }, [user.name]); 

  const categories = ["รออนุมัติ", "อนุมัติแล้ว", "ไม่อนุมัติ", "ทั้งหมด"];

  const handleSearchClick = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearchClick(); };

  const handleFinalAction = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/documents/${id}/status`, { status: newStatus });
      fetchAllPendingDocuments();
      setViewingDoc(null);
      alert(`ดำเนินการ ${newStatus} เรียบร้อยแล้ว`);
    } catch (err) {
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("pea-admin-token"); 
    navigate("/"); 
  };

  const filteredDocs = useMemo(() => {
    let result = approvalDocs.filter(doc => {
      const matchesStatus = activeTab === "ทั้งหมด" || doc.status === activeTab;
      const matchesSearch = (doc.name || "").toLowerCase().includes(submittedSearch.toLowerCase()) || (doc.requester || "").toLowerCase().includes(submittedSearch.toLowerCase());
      const matchesDept = selectedDept === "ทุกแผนก" || doc.department === selectedDept;
      return matchesStatus && matchesSearch && matchesDept;
    });
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [activeTab, selectedDept, approvalDocs, submittedSearch]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;

  return (
    <div className="flex min-h-screen bg-[#fcfaff] font-sans text-slate-700 overflow-x-hidden text-left font-medium">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-purple-50 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3 border-b border-purple-50 text-left">
          <img src={Logo} alt="PEA Logo" className="h-12 w-auto object-contain" />
          <div className="leading-tight text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight text-left">PEA ADMIN</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none text-left">CHIANG MAI 2 SYSTEM</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left">
          <Link to="/AdminDashboard" className="no-underline"><SidebarItem icon={<FiPieChart />} label="หน้าสรุปผล (Overview)" /></Link>
          <Link to="/ManageDocs" className="no-underline"><SidebarItem icon={<FiFileText />} label="จัดการเอกสารทั้งหมด" /></Link>
          <SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" active />
          <Link to="/AdminSubmitApproval" className="no-underline"><SidebarItem icon={<FiSend />} label="ส่งเอกสารให้พิจารณา" /></Link>
          <Link to="/UserManage" className="no-underline"><SidebarItem icon={<FiUsers />} label="จัดการผู้ใช้งาน" /></Link>
          <Link to="/AnalysisReport" className="no-underline"><SidebarItem icon={<FiTrendingUp />} label="รายงานเชิงวิเคราะห์" /></Link>
        </nav>

        <div className="p-6 border-t border-purple-50 space-y-2 font-bold text-left">
          <Link to="/AdminSetting" className="no-underline"><SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" /></Link>
          <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger onClick={() => setIsLogoutModalOpen(true)} />
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="bg-white/70 backdrop-blur-md px-4 lg:px-10 py-6 border-b border-purple-50 sticky top-0 z-30 font-bold text-left">
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-3 text-left">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-purple-100 lg:hidden text-[#74045F] flex items-center justify-center"><FiMenu size={20} /></button>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#74045F] tracking-tight text-left">พิจารณาเอกสาร</h2>
            </div>
            
            <div className="flex items-center gap-3 text-left">
              <button onClick={() => setOpenProfileModal(true)} className="active:scale-95 transition-transform flex-shrink-0 text-left">
                  <img src={user.avatar} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md hover:border-[#74045F] transition-all text-left" alt="profile" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 text-left">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-8 items-end bg-white p-6 rounded-[2.5rem] border border-purple-50 shadow-sm transition-all font-bold">
            {/* ✅ เปลี่ยนมาใช้ dbDepartments ที่ดึงจากฐานข้อมูลจริง */}
            <FilterSelect label="กรองตามแผนก" value={selectedDept} onChange={setSelectedDept} options={dbDepartments} icon={<FiBriefcase className="text-[#74045F]"/>} />
            <FilterSelect label="สถานะการพิจารณา" value={activeTab} onChange={setActiveTab} options={categories} icon={<FiLayers className="text-[#74045F]"/>} />
            <div className="md:col-span-2 space-y-2.5 text-left text-base">
              <label className="text-xs font-bold text-[#74045F]/60 uppercase tracking-widest ml-1 font-black">ค้นหาคำขอ</label>
              <div className="relative group flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                  <input type="text" placeholder="ค้นหาชื่อเอกสารหรือผู้ยื่น..." className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-semibold outline-none transition-all focus:ring-2 focus:ring-purple-100" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <button onClick={handleSearchClick} className="bg-[#74045F] hover:bg-[#5a034a] text-white px-6 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center"><FiSearch size={20} /></button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-purple-50 overflow-hidden font-bold">
            <div className="px-8 py-6 border-b border-purple-50 bg-purple-50/20 flex justify-between items-center text-left">
                <h3 className="font-bold text-[#74045F] text-lg text-left">รายการเอกสารรอการพิจารณา</h3>
                {submittedSearch && (
                  <button onClick={() => {setSearchQuery(""); setSubmittedSearch("");}} className="text-xs font-black text-rose-500 flex items-center justify-center gap-1 transition-colors hover:text-rose-600"><FiX /> ล้างการค้นหา</button>
                )}
            </div>
            <div className="overflow-x-auto text-left">
              <table className="w-full text-left border-collapse font-bold">
                <thead className="bg-white border-b border-purple-50 text-[#74045F]/60 text-[13px] uppercase font-black">
                  <tr>
                    <th className="px-6 py-5 text-center w-16 font-black">#</th>
                    <th className="px-4 py-5 font-black">เอกสาร</th>
                    <th className="px-6 py-5 font-black">ผู้ยื่นคำขอ</th>
                    <th className="px-6 py-5 text-center font-black">สถานะ</th>
                    <th className="px-8 py-5 text-right font-black">พิจารณา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 font-bold text-left">
                  {currentItems.map((doc, index) => (
                    <tr key={doc.id} className="hover:bg-purple-50/20 transition-colors group font-semibold text-sm lg:text-base text-left">
                      <td className="px-6 py-5 text-center font-bold text-purple-200">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-5 font-bold text-slate-700 text-left">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-purple-50 text-[#74045F] rounded-xl flex items-center justify-center flex-shrink-0 font-bold"><FiFile size={20} /></div>
                            <div className="text-left">
                              <p className="font-bold text-slate-700 line-clamp-1 text-left">{doc.name}</p>
                              <p className="text-[11px] text-[#74045F]/40 font-bold uppercase tracking-tighter text-left">{doc.category}</p>
                            </div>
                          </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-left">
                        <p className="text-sm text-slate-700 font-bold text-left">{doc.requester}</p>
                        <p className="text-[11px] text-slate-400 font-medium text-left">{doc.department}</p>
                      </td>
                      <td className="px-6 py-5 text-center font-bold">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            doc.status === 'รออนุมัติ' ? 'bg-amber-100 text-amber-600' : 
                            doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>{doc.status}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black">
                        <button onClick={() => setViewingDoc(doc)} className={`w-11 h-11 rounded-xl shadow-sm transition-all active:scale-90 flex items-center justify-center ml-auto ${doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-purple-50 text-[#74045F] hover:bg-[#74045F] hover:text-white'}`}>
                            <FiEye size={22}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold italic">ไม่พบรายการพิจารณาตามเงื่อนไข</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-6 border-t border-purple-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-purple-50/10 font-bold text-left">
              <div className="text-slate-400 text-sm font-black text-left">
                Showing <span className="text-slate-800 font-black">{filteredDocs.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDocs.length)}</span> of <span className="text-slate-800 font-black">{filteredDocs.length}</span> entries
              </div>
              <div className="flex items-center gap-1 font-bold text-left">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className={`p-2 rounded-lg transition-all flex items-center justify-center ${currentPage === 1 ? "text-purple-100 cursor-not-allowed" : "text-[#74045F] hover:bg-purple-50"}`}><FiChevronLeft size={20} /></button>
                <div className="flex items-center gap-1 text-left">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-black transition-all flex items-center justify-center ${currentPage === i + 1 ? "bg-[#74045F] text-white shadow-lg shadow-purple-100" : "text-slate-400 hover:bg-purple-50"}`}>{i + 1}</button>
                  ))}
                </div>
                <button disabled={currentPage === totalPages || filteredDocs.length === 0} onClick={() => setCurrentPage(prev => prev + 1)} className={`p-2 rounded-lg transition-all flex items-center justify-center ${currentPage === totalPages || filteredDocs.length === 0 ? "text-purple-100 cursor-not-allowed" : "text-[#74045F] hover:bg-purple-50"}`}><FiChevronRight size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ เรียกใช้งาน AdminProfileModal */}
      {openProfileModal && (
        <AdminProfileModal 
          user={user} 
          setUser={setUser} 
          onClose={() => setOpenProfileModal(false)} 
        />
      )}

      {viewingDoc && (
        <AdminSignatureWorkflow 
          doc={viewingDoc} 
          onApprove={() => handleFinalAction(viewingDoc.id, 'อนุมัติแล้ว')} 
          onReject={() => handleFinalAction(viewingDoc.id, 'ไม่อนุมัติ')} 
          onClose={() => setViewingDoc(null)} 
        />
      )}
      
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogoutConfirm} />
    </div>
  );
}

/* --- Signature Workflow สำหรับ Admin --- */
function AdminSignatureWorkflow({ doc, onApprove, onReject, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative text-left">
        <div className="lg:flex-[1.5] bg-slate-100 p-8 border-r border-purple-50 overflow-hidden flex flex-col hidden md:flex text-left">
          <div className="bg-white flex-1 rounded-[2.5rem] shadow-sm p-0 relative border border-purple-50 flex flex-col font-bold overflow-hidden">
             <iframe src={`${doc.fileUrl}#toolbar=0`} className="w-full h-full border-none" title="PDF Preview" />
          </div>
        </div>
        <div className="flex-1 p-10 flex flex-col bg-white overflow-y-auto border-l border-purple-50 font-bold text-left">
          <button onClick={onClose} className="self-end w-10 h-10 text-slate-300 hover:text-[#74045F] transition-all flex items-center justify-center hover:bg-purple-50 rounded-full text-left"><FiX size={24} /></button>
          <div className="mb-8 text-left">
              <h4 className="text-2xl font-black text-[#74045F] tracking-tight text-left">พิจารณาเอกสาร</h4>
          </div>
          <div className="flex-1 font-bold text-left space-y-6 text-left">
              <DetailItem label="ชื่อเอกสาร" value={doc.name} />
              <DetailItem label="ผู้ยื่นคำขอ" value={doc.requester} />
              <DetailItem label="แผนก/สังกัด" value={doc.department} />
              <div className="p-6 bg-purple-50/30 rounded-3xl space-y-4 text-left">
                  <h5 className="text-xs font-black text-[#74045F]/50 uppercase tracking-widest flex items-center gap-2 text-left"><FiInfo /> รายละเอียดเพิ่มเติม</h5>
                  <p className="text-sm text-slate-600 leading-relaxed italic text-left">"{doc.description || 'ไม่มีรายละเอียดเพิ่มเติม'}"</p>
              </div>
          </div>
          <div className="mt-10 space-y-4 text-left">
            {doc.status === 'รออนุมัติ' ? (
              <>
                <button onClick={onApprove} className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <FiCheckCircle size={20}/> อนุมัติเอกสาร
                </button>
                <button onClick={onReject} className="w-full py-4 text-rose-500 hover:bg-rose-50 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center">
                  ปฏิเสธการอนุมัติ
                </button>
              </>
            ) : (
               <button onClick={onClose} className="w-full bg-[#74045F] text-white py-5 rounded-[2rem] shadow-xl font-black uppercase tracking-widest active:scale-95 transition-all">
                  ปิดหน้าต่าง
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, icon }) {
  return (
    <div className="space-y-2 text-left font-bold">
      <label className="text-xs font-bold text-[#74045F]/60 uppercase tracking-widest ml-1 font-black block text-left">{label}</label>
      <div className="relative font-bold text-left">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#74045F]/40">{icon}</span>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-bold outline-none appearance-none cursor-pointer text-left focus:ring-2 focus:ring-purple-100">
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="space-y-1 text-left">
      <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest block font-bold text-left">{label}</span>
      <p className="text-base font-black text-slate-700 font-bold text-left">{value}</p>
    </div>
  );
}

function SidebarItem({ icon, label, active, danger, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all text-left ${
        active 
          ? "bg-purple-50 text-[#74045F] shadow-sm shadow-purple-100 font-black" 
          : "text-slate-400 hover:bg-purple-50 hover:text-[#74045F] font-black"
      } ${danger ? "text-rose-500 hover:bg-rose-50 mt-auto font-black" : ""}`}
    >
      <span className={active ? "text-[#74045F] text-lg" : "text-purple-200 text-lg"}>{icon}</span>
      <span className="text-[14px] font-black text-left">{label}</span>
    </div>
  );
}

function ProfileInput({ label, value, onChange }) {
  return (
    <div className="space-y-1 text-left block font-bold">
      <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest ml-1 font-black text-left">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-sm focus:ring-4 focus:ring-purple-100 transition-all outline-none font-bold text-left" 
      />
    </div>
  );
}