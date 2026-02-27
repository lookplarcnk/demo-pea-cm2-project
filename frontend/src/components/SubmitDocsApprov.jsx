import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
// ✅ 1. นำเข้า react-hot-toast สำหรับแจ้งเตือน
import toast, { Toaster } from 'react-hot-toast';
import {
  FiFileText, FiClock, FiDownload, FiUser, FiLogOut, FiSettings,
  FiSearch, FiX, FiMenu, FiCheckCircle, FiInfo, FiFile, FiCamera, FiCheck, FiFilter, FiBriefcase, FiTrendingUp, FiLayers, FiChevronLeft, FiChevronRight, FiAlertCircle, FiEye, FiUpload, FiRotateCcw, FiEdit3, FiSend, FiPlus
} from "react-icons/fi";

// ✅ 2. Import Logo และคอมโพเนนต์แก้ไขโปรไฟล์พนักงาน
import Logo from "../assets/img/logo-pea.png"; 
import EmployeeProfileModal from "./EmployeeProfileModal"; 

const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";
const SERVER_URL = "https://demo-pea-cm2-project.onrender.com";

/* --- 1. LogoutModal Component --- */
function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-bold text-left animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative animate-in zoom-in duration-300 text-left">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100 text-center">
          <FiLogOut size={40} />
        </div>
        <div className="text-center space-y-2 mb-10 text-center text-left">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight text-center text-left">ยืนยันการออกจากระบบ?</h3>
          <p className="text-slate-400 font-bold text-sm text-center text-left">คุณต้องการออกจากเซสชันการทำงานปัจจุบันหรือไม่</p>
        </div>
        <div className="flex flex-col gap-3 text-left">
          <button onClick={onConfirm} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs text-center text-left">
            <FiCheck size={18} /> ยืนยันออกจากระบบ
          </button>
          <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs text-center text-left">
            ยกเลิก
          </button>
        </div>
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-all text-left">
          <FiX size={24} />
        </button>
      </div>
    </div>
  );
}

export default function DocumentSubmissionCenter() {
  const navigate = useNavigate();
  
  // ✅ ประกาศ categories ไว้ด้านบนสุดของ Component เพื่อป้องกัน ReferenceError
  const categoriesList = ["ทั้งหมด", "รออนุมัติ", "อนุมัติแล้ว", "ไม่อนุมัติ"];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [user, setUser] = useState({
    name: "กำลังโหลด...",
    role: "Officer",
    email: "",
    phone: "081-234-5678",
    department: "กำลังโหลด...",
    employeeId: "PEA-XXXXX",
    avatar: ""
  });

  const [myDocs, setMyDocs] = useState([]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser && (savedUser.id || savedUser.emp_id)) {
      const empId = savedUser.id || savedUser.emp_id;
      
      const fetchEmployeeData = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/employees/${empId}`);
          if (res.data) {
            const userData = {
              name: res.data.emp_name,
              role: res.data.role || "Officer",
              email: res.data.emp_email,
              phone: res.data.emp_phone || "081-234-5678", 
              department: res.data.dept_name || res.data.emp_dept || "ไม่ระบุแผนก",
              employeeId: `PEA-${res.data.emp_id}`,
              avatar: res.data.avatar && res.data.avatar !== "null" ? res.data.avatar : savedUser.avatar 
            };
            setUser(userData);
            fetchMyDocuments(empId, res.data.emp_name);
          }
        } catch (err) {
          console.error("Error fetching employee data:", err);
        }
      };
      fetchEmployeeData();
    } else {
      navigate("/loginemployee");
    }
  }, [navigate]);

  const fetchMyDocuments = async (empId, userName) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`);
      if (res.data) {
        const formattedDocs = res.data
          .filter(doc => (doc.owner === userName) && doc.approver_id !== null)
          .map(doc => ({
            id: doc.doc_id,
            name: doc.doc_name,
            category: doc.category || "เอกสารทั่วไป",
            requester: doc.owner,
            approver: doc.approver_name,
            department: doc.dept,
            status: doc.status,
            size: doc.file_size,
            date: new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            timestamp: new Date(doc.created_at).getTime(),
            description: doc.description,
            fileUrl: doc.file_url ? `${SERVER_URL}${doc.file_url}` : null,
          }));
        setMyDocs(formattedDocs);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/loginemployee");
  };

  const handleSearchClick = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearchClick(); };

  const handleUploadSubmit = async (newDoc) => {
    setIsLoading(true);
    const loadToast = toast.loading("กำลังอัปโหลดและส่งเอกสารไปยังผู้อนุมัติ...");
    try {
      const formData = new FormData();
      formData.append("file", newDoc.file);
      formData.append("doc_name", newDoc.name);
      formData.append("category", newDoc.category);
      formData.append("approver_id", newDoc.approverId);
      formData.append("owner", user.name); 
      formData.append("dept", user.department); 
      formData.append("description", newDoc.description || "");

      await axios.post(`${API_BASE_URL}/documents/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      fetchMyDocuments(user.employeeId.replace("PEA-", ""), user.name);
      setIsUploadModalOpen(false);
      toast.success("สร้างและส่งคำขอพิจารณาสำเร็จ", { id: loadToast });
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล", { id: loadToast });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = useMemo(() => {
    let result = myDocs.filter(doc => {
      const matchesStatus = activeTab === "ทั้งหมด" || doc.status === activeTab;
      const matchesSearch = (doc.name || "").toLowerCase().includes(submittedSearch.toLowerCase()) || (doc.approver && doc.approver.toLowerCase().includes(submittedSearch.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [activeTab, myDocs, submittedSearch]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;

  return (
    <div className="flex min-h-screen bg-[#fcfaff] font-sans text-slate-700 overflow-x-hidden text-left font-medium text-left">
      <Toaster position="top-right" />
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-purple-50 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3 border-b border-purple-50 text-left text-left text-left">
          <img src={Logo} alt="PEA Logo" className="h-12 w-auto object-contain text-left" />
          <div className="leading-tight text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight text-left">PEA CM2</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none text-left">Employee System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left text-left text-left">
          <Link to="/EmployeeDashboard" className="no-underline"><SidebarItem icon={<FiFileText />} label="จัดการเอกสาร" /></Link>
          <Link to="/EmpDownloadDocs" className="no-underline"><SidebarItem icon={<FiDownload />} label="ดาวน์โหลดเอกสาร" /></Link>
          <Link to="/EmpUseHistory" className="no-underline"><SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" /></Link>
          <SidebarItem icon={<FiSend />} label="ส่งเอกสารให้พิจารณา" active />
        </nav>
        <div className="p-6 border-t border-purple-50 space-y-2 font-bold text-left text-left text-left text-left">
          <Link to="/EmpSetting" className="no-underline"><SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" /></Link>
          <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger onClick={() => setIsLogoutModalOpen(true)} />
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto text-left">
        <div className="bg-white/70 backdrop-blur-md px-4 lg:px-10 py-6 border-b border-purple-50 sticky top-0 z-30 font-bold flex justify-between items-center text-left text-left text-left">
          <div className="flex items-center gap-3 text-left">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-purple-100 lg:hidden text-[#74045F] flex items-center justify-center text-center text-left text-left"><FiMenu size={20} /></button>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#74045F] tracking-tight text-left">ส่งเอกสารให้พิจารณา</h2>
          </div>
          <div className="flex items-center gap-3 text-left text-left">
            <div className="text-right hidden sm:block text-left text-left text-left text-left text-left">
              <p className="text-sm font-black text-slate-800 leading-none text-left">{user.name}</p>
              <p className="text-[10px] font-bold text-[#74045F] uppercase tracking-widest mt-1 text-left">{user.department}</p>
            </div>
            <button onClick={() => setOpenProfileModal(true)} className="flex-shrink-0 active:scale-95 transition-transform flex items-center justify-center text-left text-left text-left text-left text-left">
                <img src={user.avatar || "https://i.pravatar.cc/150?u=staff"} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md hover:border-[#74045F] transition-all text-left" alt="profile" />
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 text-left text-left">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8 items-end bg-white p-6 rounded-[2.5rem] border border-purple-50 shadow-sm transition-all font-bold text-left text-left">
            <FilterSelect label="สถานะเอกสารของฉัน" value={activeTab} onChange={setActiveTab} options={categoriesList} icon={<FiLayers className="text-[#74045F] text-left text-left text-left"/>} />
            <div className="md:col-span-2 space-y-2.5 text-left text-base text-left text-left text-left">
              <label className="text-xs font-bold text-[#74045F]/60 uppercase tracking-widest ml-1 font-black text-left block">ค้นหาเอกสารที่ส่ง</label>
              <div className="relative group flex gap-2 text-left">
                <div className="relative flex-1 text-left">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 text-left" size={18} />
                  <input type="text" placeholder="ค้นหาชื่อเอกสารหรือผู้อนุมัติ..." className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-semibold outline-none transition-all focus:ring-2 focus:ring-purple-100 text-left text-slate-700 font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <button onClick={handleSearchClick} className="bg-[#74045F] hover:bg-[#5a034a] text-white px-6 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center text-center text-left text-left text-left"><FiSearch size={20} /></button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-purple-50 overflow-hidden font-bold text-left text-left text-left text-left">
            <div className="px-8 py-6 border-b border-purple-50 bg-purple-50/20 flex justify-between items-center text-left text-left text-left text-left text-left">
                <h3 className="font-bold text-[#74045F] text-lg tracking-tight text-left">รายการคำขอที่ส่งพิจารณา</h3>
                <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-[#74045F] hover:bg-[#5a034a] text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-purple-100 active:scale-95 text-center text-left text-left text-left text-left"><FiPlus size={20}/> สร้างคำขอใหม่</button>
            </div>
            <div className="overflow-x-auto text-left text-left text-left text-left text-left text-left">
              <table className="w-full text-left border-collapse font-bold text-left text-left text-left text-left text-left">
                <thead className="bg-white border-b border-purple-50 text-[#74045F]/60 text-[13px] uppercase font-black text-left text-left text-left text-left">
                  <tr>
                    <th className="px-6 py-5 text-center w-16 font-black text-left text-left text-left">#</th>
                    <th className="px-4 py-5 font-black text-left text-left text-left text-left text-left">รายการเอกสาร</th>
                    <th className="px-6 py-5 font-black text-left text-left text-left text-left text-left text-left">ผู้อนุมัติ</th>
                    <th className="px-6 py-5 text-center font-black text-left text-left text-left text-left text-center">สถานะ</th>
                    <th className="px-8 py-5 text-right font-black text-left text-left text-left text-left text-right">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 font-bold text-left">
                  {currentItems.map((doc, index) => (
                    <tr key={doc.id} className="hover:bg-purple-50/20 transition-colors group font-semibold text-sm lg:text-base text-left">
                      <td className="px-6 py-5 text-center font-bold text-purple-200 text-center text-left">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-5 font-bold text-slate-700 text-left">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-purple-50 text-[#74045F] rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-center text-left text-left text-left text-left text-left text-left text-left text-left"><FiFile size={20} /></div>
                            <div className="text-left text-left text-left text-left text-left text-left">
                              <p className="font-bold text-slate-700 line-clamp-1">{doc.name}</p>
                              <p className="text-[11px] text-[#74045F]/40 font-bold uppercase tracking-tighter">{doc.category} • {doc.date}</p>
                            </div>
                          </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-left text-left text-left text-left">
                        <p className="text-sm text-slate-700 font-bold">{doc.approver}</p>
                        <p className="text-[11px] text-slate-400 font-medium italic text-left">ส่งพิจารณา</p>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-center text-left text-left">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-center ${doc.status === 'รออนุมัติ' ? 'bg-amber-100 text-amber-600' : doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{doc.status}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-right text-left text-left">
                        <button onClick={() => setViewingDoc(doc)} className="w-11 h-11 bg-purple-50 text-[#74045F] hover:bg-[#74045F] hover:text-white rounded-xl shadow-sm transition-all active:scale-90 flex items-center justify-center ml-auto text-center text-left text-left"><FiEye size={22}/></button>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr><td colSpan="5" className="px-6 py-24 text-center text-[#74045F]/30 font-bold italic bg-purple-50/5 text-center text-left text-left">
                        <div className="flex flex-col items-center gap-2 text-center text-left text-left text-left text-left">
                           <FiFileText size={48} className="opacity-20 text-center" />
                           <span className="text-center text-left text-left text-left">ไม่พบประวัติการส่งเอกสารพิจารณา</span>
                        </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-6 border-t border-purple-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-purple-50/10 font-bold text-left text-left text-left text-left text-left text-left text-left">
              <div className="text-slate-400 text-sm font-black text-left text-left text-left text-left text-left text-left text-left text-left text-left">Showing <span className="text-slate-800 font-black">{filteredDocs.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDocs.length)}</span> of <span className="text-slate-800 font-black">{filteredDocs.length}</span> entries</div>
              <div className="flex items-center gap-1 font-bold text-center text-left text-left text-left text-left">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className={`p-2 rounded-lg transition-all flex items-center justify-center text-center text-left text-left text-left text-left ${currentPage === 1 ? "text-purple-100 cursor-not-allowed" : "text-[#74045F] hover:bg-purple-50"}`}><FiChevronLeft size={20} className="text-left text-left text-left"/></button>
                <div className="flex items-center gap-1 text-center text-left text-left text-left">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-black transition-all flex items-center justify-center text-center text-left ${currentPage === i + 1 ? "bg-[#74045F] text-white shadow-lg shadow-purple-100" : "text-slate-400 hover:bg-purple-50"}`}>{i + 1}</button>
                  ))}
                </div>
                <button disabled={currentPage === totalPages || filteredDocs.length === 0} onClick={() => setCurrentPage(prev => prev + 1)} className={`p-2 rounded-lg transition-all flex items-center justify-center text-center text-left text-left text-left text-left ${currentPage === totalPages || filteredDocs.length === 0 ? "text-purple-100 cursor-not-allowed" : "text-[#74045F] hover:bg-purple-50"}`}><FiChevronRight size={20} className="text-left text-left text-left"/></button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isUploadModalOpen && <UploadDocumentModal onClose={() => setIsUploadModalOpen(false)} onSubmit={handleUploadSubmit} isLoading={isLoading} />}
      {viewingDoc && <DocumentDetailModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
      {openProfileModal && <EmployeeProfileModal user={user} setUser={setUser} onClose={() => setOpenProfileModal(false)} />}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogoutConfirm} />
    </div>
  );
}

/* --- Sub-components (ส่วนแสดงรายละเอียด) --- */

function UploadDocumentModal({ onClose, onSubmit, isLoading }) {
    const [formData, setFormData] = useState({ name: "", category: "เอกสารแบบฟอร์ม", description: "", file: null, approver: "", approverId: null });
    const [approverSearch, setApproverSearch] = useState("");
    const [showApproverList, setShowApproverList] = useState(false);
    const [dbApprovers, setDbApprovers] = useState([]);

    useEffect(() => {
        const fetchApprovers = async () => {
            try { 
                const res = await axios.get(`${API_BASE_URL}/employees/approvers`); 
                setDbApprovers(res.data); 
            } catch (err) { console.error(err); }
        };
        fetchApprovers();
    }, []);

    const handleFileChange = (file) => {
        if (file) { setFormData(prev => ({ ...prev, file: file, name: file.name.split('.')[0] })); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left text-left">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 relative flex flex-col font-bold max-h-[90vh] overflow-y-auto text-left border border-purple-50 text-left text-left">
                <button onClick={onClose} className="absolute right-8 top-8 text-slate-300 hover:text-rose-50 z-50 text-center text-left"><FiX size={24} /></button>
                <h3 className="text-2xl font-black text-[#74045F] mb-2 tracking-tight text-left">สร้างคำขอพิจารณาใหม่</h3>
                <p className="text-slate-400 text-sm mb-8 font-bold text-left">ระบุผู้รับพิจารณาและอัปโหลดเอกสารเพื่อดำเนินการ</p>
                <div className="space-y-6 text-left text-left text-left">
                    <div className="space-y-1 relative text-left text-left text-left text-left">
                        <label className="text-xs font-black text-purple-300 uppercase tracking-widest ml-1 flex items-center gap-2 text-left text-left"><FiUser className="text-[#74045F] text-left text-left"/> ค้นหาผู้รับพิจารณา <span className="text-rose-500">*</span></label>
                        <input type="text" placeholder="พิมพ์ชื่อผู้อนุมัติ..." value={approverSearch} onChange={(e) => { setApproverSearch(e.target.value); setShowApproverList(true); if(formData.approver !== e.target.value) setFormData(prev => ({...prev, approver: "", approverId: null})); }} className="w-full bg-slate-50 border-none rounded-xl pl-6 py-3.5 font-bold outline-none focus:ring-2 focus:ring-[#74045F] transition-all text-left text-slate-700" />
                        {showApproverList && !formData.approver && dbApprovers.filter(emp => (emp.emp_name || "").toLowerCase().includes(approverSearch.toLowerCase())).length > 0 && (
                            <div className="absolute z-[110] w-full mt-2 bg-white rounded-2xl shadow-xl border border-purple-50 overflow-hidden max-h-60 overflow-y-auto text-left text-slate-700 text-left text-left">
                                {dbApprovers.filter(emp => (emp.emp_name || "").toLowerCase().includes(approverSearch.toLowerCase())).map(emp => (
                                    <div key={emp.emp_id} onClick={() => { setFormData(prev => ({...prev, approver: emp.emp_name, approverId: emp.emp_id})); setApproverSearch(emp.emp_name); setShowApproverList(false); }} className="px-5 py-3 hover:bg-purple-50 cursor-pointer border-b border-purple-50 last:border-none text-left">
                                        <p className="text-sm font-black text-left">{emp.emp_name}</p>
                                        <p className="text-[10px] text-[#74045F]/50 font-bold uppercase text-left">{emp.dept_name || "หน่วยงานบริหาร"}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={`border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all relative text-left text-left text-left ${formData.file ? 'border-[#74045F] bg-purple-50' : 'border-purple-100 bg-slate-50'}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files[0]); }}>
                        <div className={`w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-center ${formData.file ? 'text-emerald-500' : 'text-[#74045F]'}`}>{formData.file ? <FiCheckCircle size={28} /> : <FiUpload size={28} />}</div>
                        {formData.file ? <div className="text-center text-left text-left"><p className="text-[#74045F] font-black text-sm text-left">{formData.file.name}</p><button onClick={() => setFormData(prev => ({...prev, file: null, name: ""}))} className="text-rose-500 text-[10px] uppercase font-black mt-2 relative z-10 text-center">เปลี่ยนไฟล์</button></div> : <div className="text-center pointer-events-none text-center text-left text-left"><p className="text-slate-600 font-bold mb-1 text-center">ลากไฟล์ PDF มาวางที่นี่ *</p><p className="text-slate-400 text-[11px] text-center">รองรับเฉพาะไฟล์ .PDF (สูงสุด 10MB)</p></div>}
                        {!formData.file && <input type="file" className="absolute inset-0 opacity-0 cursor-pointer text-left" onChange={(e) => handleFileChange(e.target.files[0])} accept="application/pdf" />}
                    </div>
                    <div className="space-y-1 text-left text-left text-left">
                        <label className="text-xs font-black text-purple-300 uppercase tracking-widest ml-1 text-left text-left">หมายเหตุ / รายละเอียด</label>
                        <textarea placeholder="ระบุเหตุผลในการส่งพิจารณา..." value={formData.description} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} className="w-full bg-slate-50 border-none rounded-xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#74045F] transition-all text-left text-slate-700 min-h-[100px] resize-none text-left" />
                    </div>
                    <button disabled={!formData.approver || !formData.file || isLoading} onClick={() => onSubmit(formData)} className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 text-center text-left text-left ${formData.approver && formData.file && !isLoading ? 'bg-[#74045F] text-white hover:bg-[#5a034a]' : 'bg-slate-200 text-slate-400'}`}>
                        {isLoading ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin text-center"></div> : <><FiSend className="text-left text-left" /> ยืนยันและส่งคำขอ</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ✅ ส่วนที่แก้ไข: ปรับปุ่มปิดหน้าต่างให้อยู่ตรงกลาง (mx-auto)
function DocumentDetailModal({ doc, onClose }) {
    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row font-bold text-left border border-purple-50 text-left text-left">
                <div className="flex-[1.5] bg-slate-200 p-8 overflow-hidden flex flex-col relative text-center text-left">
                    <iframe src={`${doc.fileUrl}#toolbar=0`} className="w-full h-full rounded-2xl border-none text-left" title="PDF Preview" />
                </div>
                <div className="flex-1 bg-white p-12 flex flex-col border-l border-purple-50 overflow-y-auto text-left text-left text-left">
                    <button onClick={onClose} className="self-end w-10 h-10 text-slate-300 hover:text-[#74045F] transition-all mb-6 flex items-center justify-center bg-purple-50 rounded-full text-center text-left"><FiX size={24} /></button>
                    <div className="mb-8 text-left text-left text-left"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-left ${doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{doc.status}</span><h3 className="text-2xl font-black text-[#74045F] mt-2 text-left">{doc.name}</h3></div>
                    <div className="space-y-6 flex-1 text-left text-left text-left"><div className="grid grid-cols-2 gap-4 text-left"><DetailItem label="ส่งเมื่อ" value={doc.date} /><DetailItem label="ขนาด" value={doc.size} /></div><DetailItem label="ผู้อนุมัติ" value={doc.approver} /><div className="p-6 bg-purple-50/20 rounded-3xl space-y-4 text-left"><h5 className="text-xs font-black text-[#74045F]/60 uppercase tracking-widest flex items-center gap-2 text-left text-left"><FiInfo className="text-left" /> รายละเอียด</h5><p className="text-sm text-slate-600 leading-relaxed italic text-left">"{doc.description || 'ไม่มีรายละเอียดเพิ่มเติม'}"</p></div></div>
                    
                    {/* ✅ ปรับปรุงปุ่มปิดให้อยู่กึ่งกลาง */}
                    <div className="flex justify-center w-full mt-10">
                        <button 
                            onClick={onClose} 
                            className="w-full sm:w-64 bg-[#74045F] text-white py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-all text-center"
                        >
                            ปิดหน้าต่าง
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterSelect({ label, value, onChange, options, icon }) {
  return (
    <div className="space-y-2 text-left font-bold text-left">
      <label className="text-xs font-bold text-[#74045F]/60 uppercase tracking-widest ml-1 font-black block text-left text-left">{label}</label>
      <div className="relative text-left text-left text-left">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 text-left text-left">{icon}</span>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-bold outline-none appearance-none cursor-pointer text-left focus:ring-2 focus:ring-purple-100 text-slate-700">
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="space-y-1 text-left text-left text-left">
      <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block font-bold text-left text-left">{label}</span>
      <p className="text-base font-black text-slate-700 font-bold text-left text-left">{value}</p>
    </div>
  );
}

function SidebarItem({ icon, label, active, danger, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer text-sm font-black transition-all text-left text-left text-left text-left ${
        active 
          ? "bg-purple-50 text-[#74045F] shadow-sm shadow-purple-100 font-black text-left text-left" 
          : "text-slate-400 hover:bg-purple-50/50 hover:text-[#74045F] font-black text-left text-left"
      } ${danger ? "text-rose-500 mt-auto hover:bg-rose-50 font-black text-center text-left text-left text-left" : ""}`}
    >
      <span className={active ? "text-[#74045F] text-lg text-center text-left" : "text-purple-200 text-lg text-center text-left"}>{icon}</span>
      <span className="text-[14px] text-left text-left">{label}</span>
    </div>
  );
}