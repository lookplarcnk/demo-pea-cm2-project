import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
// ✅ 1. นำเข้า react-hot-toast สำหรับแจ้งเตือนแบบโมเดิร์น
import toast, { Toaster } from 'react-hot-toast';
import {
  FiFileText, FiClock, FiDownload, FiUser, FiLogOut, FiSettings,
  FiSearch, FiEdit, FiTrash2, FiPlus, FiX, FiCamera, FiCheck, FiMenu, FiUploadCloud, FiChevronLeft, FiChevronRight, FiCheckCircle, FiAlertCircle
} from "react-icons/fi";

// ✅ 2. Import Logo และคอมโพเนนต์แก้ไขโปรไฟล์พนักงาน
import Logo from "../assets/img/logo-pea.png"; 
import EmployeeProfileModal from "./EmployeeProfileModal"; 

const API_BASE_URL = "http://localhost:5000/api";

/* --- 1. LogoutModal Component --- */
function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-bold text-left animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative animate-in zoom-in duration-300 text-left">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
          <FiLogOut size={40} />
        </div>
        <div className="text-center space-y-2 mb-10 text-left">
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
export default function EmployeeDashboard() {
  const navigate = useNavigate(); 
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [deletedCount, setDeletedCount] = useState(0);
  const [editCount, setEditCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [editingDoc, setEditingDoc] = useState(null);

  const [latestAnnouncement, setLatestAnnouncement] = useState(null);

  const [user, setUser] = useState({
    name: "กำลังโหลด...",
    role: "Officer",
    email: "",
    phone: "081-234-5678",
    department: "กำลังโหลด...",
    employeeId: "PEA-XXXXX",
    avatar: ""
  });

  /* --- ส่วนดึงข้อมูลพนักงาน (ดึงจาก DB เสมอเพื่อให้ข้อมูลล่าสุด) --- */
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
      fetchCategories(); 
      fetchLatestAnnouncement();
    } else {
      navigate("/loginemployee");
    }
  }, [navigate]);

  const fetchLatestAnnouncement = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/announcements/latest`);
      if (res.data && res.data.ann_id) {
        setLatestAnnouncement(res.data);
      }
    } catch (err) {
      console.error("Fetch Announcement Error:", err);
    }
  };

  const fetchDocuments = async (currentUserName) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`);
      const myDocuments = res.data.filter(doc => doc.owner === currentUserName);
      setDocuments(myDocuments);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user.name !== "กำลังโหลด...") {
      fetchDocuments(user.name);
    }
  }, [user.name]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/loginemployee");
  };

  const monthlyUploadCount = useMemo(() => {
    const currentMonth = new Date().toLocaleString('en-GB', { month: 'short' });
    const currentYear = new Date().getFullYear().toString();
    return documents.filter(doc => {
      const docDate = doc.uploadDate || new Date(doc.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      return docDate.includes(currentMonth) && docDate.includes(currentYear);
    }).length;
  }, [documents]);

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบเอกสารนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`${API_BASE_URL}/documents/${id}`);
        setDocuments(documents.filter((doc) => (doc.doc_id || doc.id) !== id));
        setDeletedCount(prev => prev + 1);
        // ✅ ใช้ toast แจ้งเตือนการลบ
        toast.success("ลบเอกสารสำเร็จ");
      } catch (err) { 
        toast.error("ลบไม่สำเร็จ"); 
      }
    }
  };

  const handleSaveDocument = async (data) => {
    // ✅ ใช้ toast.loading ขณะประมวลผล
    const loadToast = toast.loading("กำลังบันทึกข้อมูล...");
    try {
      const selectedCat = categories.find(c => c.cat_name === data.category);
      
      const payload = {
        doc_name: data.name,
        cat_id: selectedCat ? selectedCat.cat_id : null,
        file_size: data.size,
        file_url: "files/emp-upload.pdf",
        require_login: true,
        fiscal_year: 2026,
        dept: user.department, 
        owner: user.name,
        status: "รออนุมัติ" 
      };

      if (editingDoc) {
        // Logic สำหรับการอัปเดต (ถ้ามี API)
        setEditCount(prev => prev + 1);
        toast.success("แก้ไขข้อมูลเอกสารแล้ว", { id: loadToast });
      } else {
        const res = await axios.post(`${API_BASE_URL}/documents`, payload);
        setDocuments([res.data, ...documents]);
        toast.success("อัปโหลดและส่งพิจารณาสำเร็จ", { id: loadToast });
      }
      setOpenUploadModal(false);
      setEditingDoc(null);
    } catch (err) {
      toast.error("บันทึกข้อมูลไม่สำเร็จ", { id: loadToast });
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => 
      (doc.doc_name || doc.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const totalEntries = filteredDocs.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] font-sans text-slate-700 overflow-x-hidden text-left font-medium">
      {/* ✅ 3. เพิ่ม Toaster Component */}
      <Toaster position="top-right" reverseOrder={false} />
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-50 text-left">
          <img src={Logo} alt="PEA Logo" className="h-12 w-auto object-contain" />
          <div className="leading-tight text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight">PEA CM2</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Employee System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left">
          <Link to="/EmployeeDashboard" className="block no-underline outline-none text-left">
            <SidebarItem icon={<FiFileText />} label="จัดการเอกสาร" active />
          </Link>
          <Link to="/EmpDownloadDocs" className="block no-underline outline-none text-left">
            <SidebarItem icon={<FiDownload />} label="ดาวน์โหลดเอกสาร" />
          </Link>
          <Link to="/EmpUseHistory" className="block no-underline outline-none text-left">
            <SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" />
          </Link>
          <Link to="/SubmitDocsApprov" className="block no-underline outline-none text-left">
            <SidebarItem icon={<FiUser />} label="ส่งเอกสารให้พิจารณา" />
          </Link>
        </nav>
        <div className="p-6 border-t border-slate-50 space-y-2 font-bold text-left">
          <Link to="/EmpSetting" className="block no-underline outline-none text-left">
            <SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" />
          </Link>
          <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger onClick={() => setIsLogoutModalOpen(true)} />
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto text-left">
        <div className="bg-white/50 backdrop-blur-md px-4 lg:px-10 py-6 border-b border-slate-100 sticky top-0 z-30 font-bold flex justify-between items-center text-left">
          <div className="flex items-center gap-3 text-left">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 lg:hidden text-slate-600 flex items-center justify-center text-left"><FiMenu size={20} /></button>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight text-left">จัดการเอกสาร</h2>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="text-right hidden sm:block text-left">
              <p className="text-sm font-black text-slate-800 leading-none">{user.name}</p>
              <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-1">{user.department}</p>
            </div>
            <button onClick={() => setOpenProfileModal(true)} className="flex-shrink-0 active:scale-95 transition-transform flex items-center justify-center text-left">
              <img src={user.avatar || "https://i.pravatar.cc/150?u=staff"} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md hover:border-purple-400 transition-all" alt="profile" />
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 text-left">
          {latestAnnouncement && (
            <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-[2rem] p-6 flex items-center gap-5 animate-in slide-in-from-top duration-500 text-left">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 flex-shrink-0 text-left">
                <FiAlertCircle size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-0.5 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">ประกาศแจ้งเตือนระบบ</span>
                  <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
                  <span className="text-[10px] font-bold text-slate-400 italic">โดย {latestAnnouncement.author}</span>
                </div>
                <p className="text-slate-700 font-black text-base leading-relaxed line-clamp-2 text-left">{latestAnnouncement.message}</p>
              </div>
              <button onClick={() => setLatestAnnouncement(null)} className="p-2 hover:bg-amber-100 rounded-full text-amber-400 transition-all text-left">
                <FiX size={20} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 font-bold text-left">
            <SummaryCard title="เอกสารทั้งหมด" value={documents.length} icon={<FiFileText />} color="purple" />
            <SummaryCard title="อัปโหลดเดือนนี้" value={monthlyUploadCount} icon={<FiClock />} color="blue" />
            <SummaryCard title="จำนวนการแก้ไข" value={editCount} icon={<FiEdit />} color="amber" />
            <SummaryCard title="รายการที่ลบ" value={deletedCount} icon={<FiTrash2 />} color="rose" />
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-bold text-left">
            <div className="p-6 lg:p-8 flex justify-between items-center border-b border-slate-100 bg-slate-50/30 text-left">
              <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight text-left">คลังข้อมูลส่วนตัว</h3>
              <div className="flex items-center gap-4 text-left">
                <div className="relative hidden md:block group font-bold text-left">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-left" />
                    <input type="text" placeholder="ค้นหาเอกสารของคุณ..." className="pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all w-64 font-medium text-left" value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}} />
                </div>
                <button onClick={() => { setEditingDoc(null); setOpenUploadModal(true); }} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-100 active:scale-95 text-base uppercase tracking-wider text-left">
                    <FiPlus strokeWidth={3} /> อัปโหลดใหม่
                </button>
              </div>
            </div>

            <div className="overflow-x-auto text-left">
              <table className="w-full min-w-[700px] text-left font-bold">
                <thead className="bg-white text-slate-500 text-[16px] uppercase tracking-widest font-black border-b border-slate-100 text-left">
                  <tr>
                    <th className="px-6 py-5 text-center w-16">#</th>
                    <th className="px-8 py-5 text-left">ชื่อเอกสาร</th>
                    <th className="px-6 py-5 text-left">หมวดหมู่</th>
                    <th className="px-6 py-5 text-center">สถานะ</th>
                    <th className="hidden md:table-cell px-6 py-5 text-center">อัปโหลดเมื่อ</th>
                    <th className="px-8 py-5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold text-left">
                  {currentItems.length > 0 ? currentItems.map((doc, index) => (
                    <tr key={doc.doc_id || doc.id} className="hover:bg-slate-50/50 transition-all font-bold text-left">
                      <td className="px-6 py-6 text-center text-slate-300 font-black">{indexOfFirstItem + index + 1}</td>
                      <td className="px-8 py-6 text-left text-left">
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 text-left"><FiFileText /></div>
                          <span className="text-slate-700 line-clamp-1 font-bold text-xl text-left">{doc.doc_name || doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-left">
                        <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-[13px] font-black uppercase text-left">{doc.category || "ไม่ระบุ"}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-100 text-emerald-600' : doc.status === 'รออนุมัติ' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                          {doc.status || "รออนุมัติ"}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-6 text-center text-slate-400 italic text-sm font-bold">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('th-TH') : doc.uploadDate}
                      </td>
                      <td className="px-8 py-6 text-right font-black text-left">
                        <div className="flex justify-end gap-2 text-left text-left">
                          <button onClick={() => { setEditingDoc(doc); setOpenUploadModal(true); }} className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm active:scale-90 font-bold flex items-center justify-center text-left text-left"><FiEdit size={18} /></button>
                          <button onClick={() => handleDelete(doc.doc_id || doc.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90 font-bold flex items-center justify-center text-left text-left"><FiTrash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="p-20 text-center text-slate-400 italic font-bold">
                         ไม่พบเอกสารของคุณในคลังข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-10 border-t border-slate-100 bg-slate-50/10 font-bold text-left flex items-center justify-between text-left">
              <div className="text-slate-400 text-sm font-black text-left">
                Showing <span className="text-slate-800 font-black">{totalEntries === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalEntries)}</span> of <span className="text-slate-800 font-black">{totalEntries}</span> entries
              </div>
              <div className="flex items-center gap-2 text-left">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm text-left ${currentPage === 1 ? "bg-white text-slate-200 cursor-not-allowed" : "bg-white text-slate-600 hover:bg-purple-600 hover:text-white active:scale-90 shadow-purple-100"}`}>
                    <FiChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 px-2 text-left text-left">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl font-black text-sm transition-all flex items-center justify-center shadow-sm text-left ${currentPage === i + 1 ? "bg-purple-600 text-white shadow-purple-200 scale-110" : "bg-white text-slate-400 hover:bg-slate-50 active:scale-95"}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button disabled={currentPage === totalPages || totalEntries === 0} onClick={() => setCurrentPage(prev => prev + 1)} className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm text-left ${currentPage === totalPages || totalEntries === 0 ? "bg-white text-slate-200 cursor-not-allowed" : "bg-white text-slate-600 hover:bg-purple-600 hover:text-white active:scale-90 shadow-purple-100"}`}>
                    <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {openUploadModal && <UploadModal onClose={() => { setOpenUploadModal(false); setEditingDoc(null); }} onSave={handleSaveDocument} editingDoc={editingDoc} categories={categories} />}
      
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

/* --- Sub-Components Helper --- */

function SidebarItem({ icon, label, active, danger, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer text-sm font-black transition-all text-left text-left ${active ? "bg-purple-50 text-purple-700 shadow-sm shadow-purple-100" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"} ${danger ? "text-rose-500 mt-auto hover:bg-rose-50" : ""}`}
    >
      <span className={`${active ? "text-purple-600 text-lg" : "text-slate-300 text-lg"} flex items-center justify-center text-left text-left`}>{icon}</span>
      {label}
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colors = { purple: "bg-purple-50 text-purple-600", blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600" };
  return (
    <div className="bg-white rounded-[2rem] p-8 flex items-center gap-6 border border-slate-100 transition-all hover:shadow-xl hover:shadow-purple-500/5 group text-left text-left">
      <div className={`p-5 rounded-[1.5rem] text-2xl group-hover:scale-110 transition-transform ${colors[color]} flex items-center justify-center text-left`}>{icon}</div>
      <div className="text-left font-bold text-left">
        <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">{title}</p>
        <p className="text-4xl font-black text-slate-800 tracking-tight text-left">{value}</p>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onSave, editingDoc, categories }) {
    const [name, setName] = useState(editingDoc?.name || editingDoc?.doc_name || "");
    const [category, setCategory] = useState(editingDoc?.category || categories[0]?.cat_name || "");
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
  
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        if (!name) setName(selectedFile.name.split('.')[0]);
      }
    };
  
    const handleSubmit = () => {
      if (!editingDoc && (!file || !name)) { alert("กรุณาเลือกไฟล์และระบุชื่อเอกสาร"); return; }
      onSave({ name, category, size: file ? (file.size / (1024 * 1024)).toFixed(2) + " MB" : editingDoc.file_size });
    };
  
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 text-left text-left text-left">
        <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl p-10 relative animate-in zoom-in duration-200 font-bold text-left text-left text-left">
          <button onClick={onClose} className="absolute right-8 top-8 w-10 h-10 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center hover:bg-rose-50 rounded-full font-black text-left text-left"><FiX size={24} /></button>
          <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight text-left"> {editingDoc ? "แก้ไขข้อมูลเอกสาร" : "อัปโหลดไฟล์ใหม่"} </h3>
          <div className="space-y-6 text-left text-left text-left text-left">
            {!editingDoc && (
              <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center transition-all cursor-pointer border-slate-200 bg-slate-50 hover:border-purple-300 text-left text-left">
                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} />
                <FiUploadCloud size={48} className="text-slate-300 text-left text-left" />
                <p className="mt-4 font-black text-center text-sm text-left"> {file ? file.name : "ลากไฟล์มาวางหรือคลิกที่นี่"} </p>
              </div>
            )}
            <ProfileInput label="ชื่อเรียกเอกสาร" value={name} onChange={setName} />
            <div className="text-left font-bold text-left text-left">
              <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1 font-bold text-left text-left text-left">หมวดหมู่</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold text-left text-left text-left text-left">
                  {categories.map(cat => <option key={cat.cat_id} value={cat.cat_name}>{cat.cat_name}</option>)}
              </select>
            </div>
            <button onClick={handleSubmit} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all text-left text-left text-left">ยืนยันการอัปโหลด</button>
          </div>
        </div>
      </div>
    );
}

function ProfileInput({ label, value, onChange }) {
  return (
    <div className="space-y-2 text-left block font-bold text-left text-left">
      <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1 font-bold text-left text-left text-left">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-sm focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold text-left text-left text-left" 
      />
    </div>
  );
}