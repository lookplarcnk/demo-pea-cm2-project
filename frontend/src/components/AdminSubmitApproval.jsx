import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import {
  FiFileText, FiClock, FiDownload, FiUser, FiLogOut, FiSettings,
  FiSearch, FiX, FiMenu, FiCheckCircle, FiInfo, FiFile, FiCamera, FiCheck, 
  FiFilter, FiBriefcase, FiTrendingUp, FiLayers, FiChevronLeft, FiChevronRight, 
  FiAlertCircle, FiEye, FiUpload, FiRotateCcw, FiEdit3, FiSend,
  FiPieChart, FiUsers, FiPlus 
} from "react-icons/fi";

// ✅ 1. Import Logo และคอมโพเนนต์โปรไฟล์ Admin
import Logo from "../assets/img/logo-pea.png"; 
import AdminProfileModal from "./AdminProfileModal"; 

const API_BASE_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

/* --- 1. LogoutModal Component (คงเดิม) --- */
function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-bold text-left animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
          <FiLogOut size={40} />
        </div>
        <div className="text-center space-y-2 mb-10 text-left">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">ยืนยันการออกจากระบบ?</h3>
          <p className="text-slate-400 font-bold text-sm">คุณต้องการออกจากเซสชันการทำงานปัจจุบันหรือไม่</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"><FiCheck size={18} /> ยืนยันออกจากระบบ</button>
          <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs text-left">ยกเลิก</button>
        </div>
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-all text-left"><FiX size={24} /></button>
      </div>
    </div>
  );
}

/* --- 2. Main Component สำหรับ Admin Submit --- */
export default function AdminSubmitApproval() {
  const navigate = useNavigate();
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

  const [myDocs, setMyDocs] = useState([]);

  const fetchAdminSubmittedDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`);
      if (res.data) {
        const formattedDocs = res.data
          .filter(doc => doc.owner === user.name && doc.approver_id !== null)
          .map(doc => ({
            id: doc.doc_id,
            name: doc.doc_name,
            category: doc.category || "เอกสารทั่วไป",
            requester: doc.owner,
            approver: doc.approver_name,
            department: doc.dept_name,
            status: doc.status,
            size: doc.file_size,
            date: new Date(doc.created_at).toLocaleDateString('th-TH'),
            timestamp: new Date(doc.created_at).getTime(),
            description: doc.doc_description || doc.description || "",
            fileUrl: doc.file_url ? `${SERVER_URL}${doc.file_url}` : null,
          }));
        setMyDocs(formattedDocs);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchAdminSubmittedDocuments();
  }, [user.name]);

  const handleLogoutConfirm = () => {
    localStorage.removeItem("pea-admin-token"); 
    navigate("/"); 
  };

  const handleSearchClick = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearchClick(); };

  const handleUploadSubmit = async (newDoc) => {
    setIsLoading(true);
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

      fetchAdminSubmittedDocuments();
      setIsUploadModalOpen(false);
      alert("ส่งคำขอพิจารณาสำเร็จ");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการส่งเอกสาร");
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
    <div className="flex min-h-screen bg-[#f8f9ff] font-sans text-slate-700 overflow-x-hidden text-left font-medium">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-50 text-left">
          <img src={Logo} alt="PEA Logo" className="h-12 w-auto object-contain text-left" />
          <div className="leading-tight text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight text-left">PEA ADMIN</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none text-left">CHIANG MAI 2 SYSTEM</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left">
          <Link to="/AdminDashboard"><SidebarItem icon={<FiPieChart />} label="หน้าสรุปผล (Overview)" /></Link>
          <Link to="/ManageDocs"><SidebarItem icon={<FiFileText />} label="จัดการเอกสารทั้งหมด" /></Link>
          <Link to="/AdminApprovalCenter"><SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" /></Link>
          <SidebarItem icon={<FiSend />} label="ส่งเอกสารให้พิจารณา" active />
          <Link to="/UserManage"><SidebarItem icon={<FiUsers />} label="จัดการผู้ใช้งาน" /></Link>
          <Link to="/AnalysisReport"><SidebarItem icon={<FiTrendingUp />} label="รายงานเชิงวิเคราะห์" /></Link>
        </nav>
        <div className="p-6 border-t border-slate-50 space-y-2 font-bold text-left">
          <Link to="/AdminSetting"><SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" /></Link>
          <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger onClick={() => setIsLogoutModalOpen(true)} />
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto text-left">
        <div className="bg-white/50 backdrop-blur-md px-4 lg:px-10 py-6 border-b border-slate-100 sticky top-0 z-30 font-bold text-left">
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-3 text-left text-left">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 lg:hidden text-slate-600 flex items-center justify-center text-left"><FiMenu size={20} /></button>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight text-left">ส่งเอกสารให้พิจารณา</h2>
            </div>
            <div className="flex items-center gap-3 text-left">
              <button onClick={() => setOpenProfileModal(true)} className="active:scale-95 transition-transform text-left">
                  <img src={user.avatar} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md text-left" alt="profile" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 text-left">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8 items-end bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all font-bold text-left">
            <FilterSelect label="สถานะคำขอของ Admin" value={activeTab} onChange={setActiveTab} options={["ทั้งหมด", "รออนุมัติ", "อนุมัติแล้ว", "ไม่อนุมัติ"]} icon={<FiLayers/>} />
            <div className="md:col-span-2 space-y-2.5 text-left text-base text-left text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 font-black text-left">ค้นหาประวัติการส่ง</label>
              <div className="relative group flex gap-2 text-left">
                <div className="relative flex-1 text-left text-left text-left">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-left" size={18} />
                  <input type="text" placeholder="ระบุชื่อเอกสารหรือผู้รับพิจารณา..." className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-semibold outline-none transition-all text-left" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <button onClick={handleSearchClick} className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center text-left text-left"><FiSearch size={20} /></button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-bold text-left text-left">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center text-left">
                <h3 className="font-bold text-slate-800 text-lg tracking-tight text-left">รายการคำขอที่ Admin ยื่น</h3>
                <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 text-left"><FiPlus size={20}/> สร้างคำขอใหม่</button>
            </div>
            <div className="overflow-x-auto text-left text-left text-left">
              <table className="w-full text-left border-collapse font-bold text-left text-left">
                <thead className="bg-white border-b border-slate-100 text-slate-500 text-[13px] uppercase font-black text-left text-left">
                  <tr>
                    <th className="px-6 py-5 text-center w-16 font-black text-left">#</th>
                    <th className="px-4 py-5 font-black text-left">รายการเอกสาร</th>
                    <th className="px-6 py-5 font-black text-left">ส่งถึงผู้อนุมัติ</th>
                    <th className="px-6 py-5 text-center font-black text-left text-left">สถานะ</th>
                    <th className="px-8 py-5 text-right font-black text-left text-left">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold text-left text-left text-left">
                  {currentItems.map((doc, index) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group font-semibold text-sm lg:text-base text-left text-left text-left">
                      <td className="px-6 py-5 text-center font-bold text-slate-300 text-left">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-5 font-bold text-slate-700 text-left text-left text-left">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-left text-left text-left"><FiFileText size={20} /></div>
                            <div className="text-left text-left">
                              <p className="font-bold text-slate-700 line-clamp-1 text-left">{doc.name}</p>
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter text-left">{doc.category} • {doc.date}</p>
                            </div>
                          </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-left text-left">
                        <p className="text-sm text-slate-700 font-bold text-left">{doc.approver}</p>
                        <p className="text-[11px] text-slate-400 font-medium italic text-left">ผู้อนุมัติคำขอ</p>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-left text-left">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-left ${doc.status === 'รออนุมัติ' ? 'bg-amber-100 text-amber-600' : doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{doc.status}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-left text-left">
                        <button onClick={() => setViewingDoc(doc)} className="w-11 h-11 bg-slate-50 text-slate-400 hover:bg-purple-600 hover:text-white rounded-xl shadow-sm transition-all active:scale-90 flex items-center justify-center ml-auto text-left"><FiEye size={22}/></button>
                      </td>
                    </tr>
                  ))}
                  {/* ✅ ส่วนที่แก้ไข: ปรับปรุงให้ข้อความ "ไม่พบประวัติ" อยู่กึ่งกลางตารางอย่างสมบูรณ์ */}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-24 text-center text-slate-400 font-bold italic bg-slate-50/10">
                        <div className="flex flex-col items-center justify-center gap-3">
                           <FiFileText size={48} className="opacity-20" />
                           <span className="text-base">ไม่พบประวัติการส่งเอกสารของ Admin</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/10 font-bold text-left text-left text-left">
              <div className="text-slate-400 text-sm font-black text-left">Showing <span className="text-slate-800 font-black">{filteredDocs.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDocs.length)}</span> of <span className="text-slate-800 font-black">{filteredDocs.length}</span> entries</div>
              <div className="flex items-center gap-1 font-bold text-left text-left">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className={`p-2 rounded-lg transition-all flex items-center justify-center text-left ${currentPage === 1 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:bg-slate-100"}`}><FiChevronLeft size={20} /></button>
                <div className="flex items-center gap-1 text-left text-left">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-black transition-all flex items-center justify-center text-left ${currentPage === i + 1 ? "bg-purple-600 text-white shadow-lg shadow-purple-100" : "text-slate-400 hover:bg-slate-100"}`}>{i + 1}</button>
                  ))}
                </div>
                <button disabled={currentPage === totalPages || filteredDocs.length === 0} onClick={() => setCurrentPage(prev => prev + 1)} className={`p-2 rounded-lg transition-all flex items-center justify-center text-left ${currentPage === totalPages || filteredDocs.length === 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:bg-slate-100"}`}><FiChevronRight size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isUploadModalOpen && <AdminUploadModal onClose={() => setIsUploadModalOpen(false)} onSubmit={handleUploadSubmit} isLoading={isLoading} />}
      {viewingDoc && <DocumentDetailModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
      {openProfileModal && <AdminProfileModal user={user} setUser={setUser} onClose={() => setOpenProfileModal(false)} />}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogoutConfirm} />
    </div>
  );
}

/* --- Modal สำหรับ Admin ส่งเอกสาร (คงเดิม) --- */
function AdminUploadModal({ onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({ name: "", category: "เอกสารทั่วไป", description: "", file: null, approver: "", approverId: null });
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

  const filteredApprovers = useMemo(() => {
    if (!approverSearch || formData.approver) return [];
    return dbApprovers.filter(emp => (emp.emp_name || "").toLowerCase().includes(approverSearch.toLowerCase()));
  }, [approverSearch, dbApprovers, formData.approver]);

  const handleFileChange = (file) => {
    if (file) setFormData(prev => ({ ...prev, file: file, name: file.name }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 relative flex flex-col font-bold max-h-[90vh] overflow-y-auto text-left">
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-300 hover:text-rose-50 transition-all text-left"><FiX size={24} /></button>
        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight text-left">สร้างคำขอพิจารณาใหม่ (Admin)</h3>
        <p className="text-slate-400 text-sm mb-8 font-bold text-left">ระบุผู้รับพิจารณาและแนบไฟล์เอกสารเพื่อดำเนินการ</p>
        <div className="space-y-6 text-left text-left">
          <div className="space-y-1 relative text-left">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 text-left"><FiUser className="text-purple-500"/> ค้นหาผู้อนุมัติปลายทาง <span className="text-rose-500">*</span></label>
            <input type="text" placeholder="ระบุชื่อผู้อนุมัติ..." value={approverSearch} 
              onChange={(e) => { setApproverSearch(e.target.value); setShowApproverList(true); if(formData.approver !== e.target.value) setFormData(prev => ({...prev, approver: "", approverId: null})); }} 
              className="w-full bg-slate-50 border-none rounded-xl pl-6 py-3.5 font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all text-left" 
            />
            {showApproverList && filteredApprovers.length > 0 && (
              <div className="absolute z-[110] w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto text-left">
                {filteredApprovers.map(emp => (
                  <div key={emp.emp_id} onClick={() => { setFormData(prev => ({...prev, approver: emp.emp_name, approverId: emp.emp_id})); setApproverSearch(emp.emp_name); setShowApproverList(false); }} className="px-5 py-3 hover:bg-purple-50 cursor-pointer border-b border-slate-50 last:border-none text-left">
                    <p className="text-sm text-slate-700 font-black text-left">{emp.emp_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase text-left">{emp.emp_dept || "บุคลากร"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={`border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all relative text-left ${formData.file ? 'border-purple-500 bg-purple-50' : 'border-slate-100 bg-slate-50'}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files[0]); }}>
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-left"><FiUpload size={28} className="text-purple-600 text-left" /></div>
            <p className="text-slate-600 font-bold text-left">{formData.file ? formData.file.name : "เลือกหรือลากไฟล์ PDF มาวางที่นี่ *"}</p>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer text-left" onChange={(e) => handleFileChange(e.target.files[0])} />
          </div>
          <button disabled={!formData.approver || !formData.file || isLoading} onClick={() => onSubmit(formData)} className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 text-left ${formData.approver && formData.file && !isLoading ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95' : 'bg-slate-200 text-slate-400'}`}>
            {isLoading ? "กำลังดำเนินการ..." : <><FiSend /> ยืนยันส่งคำขอ</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Detail Modal และ Helper Components อื่นๆ (คงเดิม) --- */
function DocumentDetailModal({ doc, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row font-bold text-left text-left">
        <div className="flex-[1.5] bg-slate-200 p-8 overflow-hidden flex flex-col relative text-center text-left text-left text-left">
          <iframe src={`${doc.fileUrl}#toolbar=0`} className="w-full h-full rounded-2xl border-none text-left text-left text-left" title="Preview" />
        </div>
        <div className="flex-1 bg-white p-12 flex flex-col border-l border-slate-100 overflow-y-auto text-left text-left text-left">
          <button onClick={onClose} className="self-end w-10 h-10 text-slate-300 hover:text-rose-50 transition-all mb-6 flex items-center justify-center bg-slate-50 rounded-full text-left text-left"><FiX size={24} /></button>
          <div className="mb-8 text-left text-left"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-left ${doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{doc.status}</span><h3 className="text-2xl font-black text-slate-800 mt-2 text-left">{doc.name}</h3></div>
          <div className="space-y-6 flex-1 text-left text-left text-left"><div className="grid grid-cols-2 gap-4 text-left text-left text-left"><DetailItem label="วันที่ส่ง" value={doc.date} /><DetailItem label="ขนาด" value={doc.size} /></div><DetailItem label="ผู้รับพิจารณา" value={doc.approver} /><div className="p-6 bg-slate-50 rounded-3xl space-y-4 text-left text-left text-left text-left"><h5 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">ข้อมูลเพิ่มเติม</h5><p className="text-sm text-slate-600 italic text-left">"{doc.description || 'ไม่มีข้อมูลเพิ่มเติม'}"</p></div></div>
          <button onClick={onClose} className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-left text-left">ปิดหน้าต่าง</button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, icon }) {
  return (
    <div className="space-y-2 text-left font-bold text-left text-left">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 font-black block text-left">{label}</label>
      <div className="relative text-left">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-left">{icon}</span>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-bold outline-none appearance-none cursor-pointer text-left">{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="space-y-1 text-left text-left">
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block font-bold text-left">{label}</span>
      <p className="text-base font-black text-slate-700 font-bold text-left">{value}</p>
    </div>
  );
}

function SidebarItem({ icon, label, active, danger, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all text-left ${active ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100 font-black" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 font-black" } ${danger ? "text-rose-500 hover:bg-rose-50 mt-auto font-black" : ""}`}>
      <span className={active ? "text-indigo-600 text-lg" : "text-slate-300 text-lg"}>{icon}</span><span className="text-[14px]">{label}</span>
    </div>
  );
}

function ProfileInput({ label, value, onChange }) {
  return (
    <div className="space-y-1 text-left block font-bold text-left">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-black text-left">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-sm focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold text-left text-left" />
    </div>
  );
}