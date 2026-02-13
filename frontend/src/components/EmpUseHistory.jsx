import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
// ✅ 1. นำเข้า react-hot-toast สำหรับแจ้งเตือน
import toast, { Toaster } from 'react-hot-toast';
import {
  FiFileText, FiClock, FiDownload, FiUser, FiLogOut, FiSettings,
  FiSearch, FiX, FiMenu, FiCheckCircle, FiInfo, FiFile, FiCamera, FiCheck, FiFilter, FiBriefcase, FiTrendingUp, FiLayers, FiChevronLeft, FiChevronRight, FiAlertCircle, FiEye, FiUpload, FiRotateCcw, FiEdit3, FiSend
} from "react-icons/fi";

// ✅ 2. Import Logo และคอมโพเนนต์แก้ไขโปรไฟล์พนักงาน
import Logo from "../assets/img/logo-pea.png"; 
import EmployeeProfileModal from "./EmployeeProfileModal"; 

const API_BASE_URL = "http://localhost:5000/api";

/* --- 1. LogoutModal Component --- */
function LogoutModal({ isOpen, onClose, onConfirm, type = "employee" }) {
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

/* --- 2. Main Component --- */
export default function DocumentApprovalCenter() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ทั้งหมด"); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selectedDept, setSelectedDept] = useState("ทุกแผนก");
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); 
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
        }
      };
      fetchEmployeeData();
    } else {
      navigate("/loginemployee");
    }
  }, [navigate]);

  const [approvalDocs, setApprovalDocs] = useState([]);

  const fetchApprovalDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`);
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const myEmpId = savedUser?.id || savedUser?.emp_id;

      const othersDocs = res.data.filter(doc => {
        return doc.user_id !== myEmpId && doc.owner !== user.name;
      });

      const formattedDocs = othersDocs.map(doc => ({
        id: doc.doc_id,
        name: doc.doc_name,
        category: doc.category || "ไม่ระบุหมวดหมู่",
        requester: doc.owner, 
        department: doc.dept,
        status: doc.status || "รออนุมัติ",
        size: doc.file_size,
        date: new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timestamp: new Date(doc.created_at).getTime(),
        description: doc.doc_description || "",
        signature: doc.signature_url || null
      }));
      setApprovalDocs(formattedDocs);
    } catch (error) {
      console.error("Fetch Approval Documents Error:", error);
    }
  };

  useEffect(() => {
    if (user.name !== "กำลังโหลด...") {
      fetchApprovalDocuments();
    }
  }, [user.name]);

  const categories = ["ทั้งหมด", "รออนุมัติ", "อนุมัติแล้ว", "ไม่อนุมัติ"];
  const departments = ["ทุกแผนก", "เทคโนโลยีสารสนเทศ (IT)", "ฝ่ายบริหารทรัพยากรบุคคล", "ฝ่ายพัสดุและจัดหา"];

  const handleSearchClick = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearchClick(); };

  const handleFinalSend = async (id, sigData) => {
    // ✅ 3. ใช้ toast.loading เพื่อรอการบันทึก
    const loadToast = toast.loading("กำลังบันทึกลายเซ็นและส่งเอกสาร...");
    try {
      await axios.put(`${API_BASE_URL}/documents/${id}/status`, {
        status: 'อนุมัติแล้ว',
        signature: sigData,
        approvedBy: user.name
      });
      fetchApprovalDocuments();
      setViewingDoc(null);
      // ✅ 4. แจ้งเตือนเมื่อสำเร็จ
      toast.success("ลงนามอนุมัติและส่งกลับสำเร็จ", { id: loadToast });
    } catch (err) {
      // ✅ 5. แจ้งเตือนเมื่อล้มเหลว
      toast.error("บันทึกข้อมูลไม่สำเร็จ", { id: loadToast });
    }
  };

  const handleReject = async (id) => {
    if(window.confirm(`ยืนยันการปฏิเสธเอกสารนี้และแจ้งผู้ยื่น?`)) {
      try {
        await axios.put(`${API_BASE_URL}/documents/${id}/status`, { status: 'ไม่อนุมัติ' });
        fetchApprovalDocuments();
        setViewingDoc(null);
        toast.success("ปฏิเสธการพิจารณาเรียบร้อยแล้ว");
      } catch (err) {
        toast.error("ไม่สามารถดำเนินการได้");
      }
    }
  };

  const handleLogoutConfirm = () => {
    localStorage.clear();
    window.location.href = "/loginemployee";
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
    <div className="flex min-h-screen bg-[#f8f9ff] font-sans text-slate-700 overflow-x-hidden text-left font-medium">
      {/* ✅ 6. เพิ่ม Toaster Component */}
      <Toaster position="top-right" reverseOrder={false} />

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-50 text-left">
          <img src={Logo} alt="PEA Logo" className="h-12 w-auto object-contain" />
          <div className="leading-tight text-left text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight">PEA CM2</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Employee System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left text-left">
          <Link to="/EmployeeDashboard" className="no-underline"><SidebarItem icon={<FiFileText />} label="จัดการเอกสาร" /></Link>
          <Link to="/EmpDownloadDocs" className="no-underline"><SidebarItem icon={<FiDownload />} label="ดาวน์โหลดเอกสาร" /></Link>
          <SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" active />
          <Link to="/SubmitDocsApprov" className="no-underline"><SidebarItem icon={<FiUser />} label="ส่งเอกสารให้พิจารณา" /></Link>
        </nav>
        <div className="p-6 border-t border-slate-50 space-y-2 font-bold text-left text-left text-left">
          <Link to="/EmpSetting" className="no-underline"><SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" /></Link>
          <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger onClick={() => setIsLogoutModalOpen(true)} />
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto text-left">
        <div className="bg-white/50 backdrop-blur-md px-4 lg:px-10 py-6 border-b border-slate-100 sticky top-0 z-30 font-bold flex justify-between items-center text-left">
          <div className="flex items-center gap-3 text-left">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 lg:hidden text-slate-600 flex items-center justify-center text-left"><FiMenu size={20} /></button>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight text-left">พิจารณาเอกสาร</h2>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="text-right hidden sm:block text-left text-left">
              <p className="text-[15px] font-black text-slate-800 leading-tight">{user.name}</p>
              <p className="text-[12px] font-bold text-[#A855F7] mt-0.5">{user.department}</p>
            </div>
            <button onClick={() => setOpenProfileModal(true)} className="active:scale-95 transition-transform flex-shrink-0 text-left">
                <img src={user.avatar || "https://i.pravatar.cc/150?u=staff"} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md hover:border-purple-400 transition-all" alt="profile" />
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 text-left text-left text-left text-left">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-8 items-end bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all font-bold text-left">
            <FilterSelect label="กรองตามแผนก" value={selectedDept} onChange={setSelectedDept} options={departments} icon={<FiBriefcase/>} />
            <FilterSelect label="สถานะเอกสาร" value={activeTab} onChange={setActiveTab} options={categories} icon={<FiLayers/>} />
            <div className="md:col-span-2 space-y-2.5 text-left text-base text-left text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 font-black text-left">ค้นหาเอกสาร</label>
              <div className="relative group flex gap-2 text-left">
                <div className="relative flex-1 text-left">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="ระบุชื่อเอกสารหรือผู้ยื่น..." className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-semibold outline-none transition-all text-left" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <button onClick={handleSearchClick} className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center text-left"><FiSearch size={20} /></button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-bold text-left text-left">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center text-left">
                <h3 className="font-bold text-slate-800 text-lg text-left">รายการพิจารณาเอกสาร</h3>
                {submittedSearch && (
                  <button onClick={() => {setSearchQuery(""); setSubmittedSearch("");}} className="text-xs font-black text-rose-500 flex items-center justify-center gap-1 transition-colors hover:text-rose-600 text-left"><FiX /> ล้างการค้นหา</button>
                )}
            </div>
            <div className="overflow-x-auto text-left text-left">
              <table className="w-full text-left border-collapse font-bold text-left">
                <thead className="bg-white border-b border-slate-100 text-slate-500 text-[13px] uppercase font-black text-left">
                  <tr>
                    <th className="px-6 py-5 text-center w-16 font-black text-left">#</th>
                    <th className="px-4 py-5 font-black text-left">ชื่อเอกสาร</th>
                    <th className="px-6 py-5 font-black text-left">ผู้ยื่นคำขอ</th>
                    <th className="px-6 py-5 text-center font-black text-left">สถานะ</th>
                    <th className="px-8 py-5 text-right font-black text-left">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold text-left">
                  {currentItems.map((doc, index) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group font-semibold text-sm lg:text-base text-left text-left">
                      <td className="px-6 py-5 text-center font-bold text-slate-300 text-left">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-5 font-bold text-slate-700 text-left text-left">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-left"><FiFile size={20} /></div>
                            <div className="text-left text-left">
                              <p className="font-bold text-slate-700 line-clamp-1 text-left">{doc.name}</p>
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter text-left">{doc.category}</p>
                            </div>
                          </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-left text-left">
                        <p className="text-sm text-slate-700 font-bold text-left">{doc.requester}</p>
                        <p className="text-[11px] text-slate-400 font-medium text-left">{doc.department}</p>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-left text-left">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-left ${doc.status === 'รออนุมัติ' ? 'bg-amber-100 text-amber-600' : doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{doc.status}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-left text-left">
                        <button onClick={() => setViewingDoc(doc)} className={`w-11 h-11 rounded-xl shadow-sm transition-all active:scale-90 flex items-center justify-center ml-auto text-left ${doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-700 hover:text-white'}`}>
                            {doc.status === 'อนุมัติแล้ว' ? <FiCheckCircle size={22}/> : <FiEye size={22}/>}
                        </button>
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
        <EmployeeProfileModal 
          user={user} 
          setUser={setUser} 
          onClose={() => setOpenProfileModal(false)} 
        />
      )}

      {viewingDoc && <SignatureWorkflow doc={viewingDoc} onFinalSend={handleFinalSend} onReject={() => handleReject(viewingDoc.id)} onClose={() => setViewingDoc(null)} user={user} />}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogoutConfirm} />
    </div>
  );
}

// ... (ส่วน SignatureWorkflow, FilterSelect, DetailItem, SidebarItem, ProfileInput คงเดิมตามที่คุณส่งมา)
function SignatureWorkflow({ doc, onFinalSend, onReject, onClose, user }) {
  const [step, setStep] = useState(doc.status === 'อนุมัติแล้ว' ? 'result' : 'preview'); 
  const [signMethod, setSignMethod] = useState("draw");
  const [signatureImage, setSignatureImage] = useState(doc.signature === 'already_signed' ? "https://via.placeholder.com/150x50?text=PEA+Signed" : doc.signature);
  const [isSending, setIsSending] = useState(false);
  const [docPage, setDocPage] = useState(1);
  const totalDocPages = 3; 
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (step === "signing" && signMethod === "draw" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.strokeStyle = "#4338ca";
    }
  }, [step, signMethod]);

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };

  const confirmDraw = () => {
    const data = canvasRef.current.toDataURL();
    setSignatureImage(data);
    setStep("result");
  };

  const startSending = () => {
    setIsSending(true);
    setTimeout(() => {
      onFinalSend(doc.id, signatureImage);
      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative text-left">
        <div className="lg:flex-[1.5] bg-slate-100 p-8 border-r border-slate-200 overflow-hidden flex flex-col hidden md:flex text-left">
          <div className="bg-white flex-1 rounded-[2.5rem] shadow-sm p-10 relative border border-slate-200 flex flex-col font-bold text-left">
            <div className="border-b-2 border-slate-100 pb-4 mb-6 flex justify-between items-center text-slate-300 font-black italic uppercase text-[10px] text-left">
                PEA Multi-page Document <FiFileText size={18}/>
            </div>
            <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
                <div className="flex justify-between items-start mb-6 text-left">
                    <h3 className="text-xl font-bold text-slate-800 text-left">{doc.name}</h3>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] uppercase font-black tracking-widest italic text-left">Page {docPage} / {totalDocPages}</span>
                </div>
                <div className="space-y-4 text-slate-500 text-sm leading-relaxed text-left">
                    <div className="animate-in fade-in duration-500 text-left">
                        {docPage === 1 && <p className="bg-purple-50/50 text-purple-700 p-4 rounded-2xl border-l-4 border-purple-500 font-bold text-left">{doc.description}</p>}
                        {docPage === 2 && <div className="h-40 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center italic text-slate-300 text-left">Section 2: Budget Details and Resources</div>}
                        {docPage === 3 && <p className="p-4 bg-slate-50 rounded-2xl italic text-left">"ข้าพเจ้าขอรับรองว่าข้อมูลทั้งหมดเป็นความจริงทุกประการ"</p>}
                    </div>
                </div>
            </div>
            {docPage === totalDocPages && (
              <div className="mt-6 flex justify-end animate-in zoom-in duration-300 font-bold text-left text-left">
                  <div className={`w-48 h-24 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${signatureImage ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50'} text-left`}>
                      {signatureImage ? <img src={signatureImage} className="max-h-full object-contain p-2" alt="sig_preview" /> : <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest text-left text-left text-left">พื้นที่ลงนาม</span>}
                  </div>
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-6 text-left">
                <button disabled={docPage === 1} onClick={() => setDocPage(prev => prev - 1)} className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${docPage === 1 ? 'text-slate-200' : 'text-purple-600 bg-purple-50 hover:bg-purple-100 active:scale-90'}`}><FiChevronLeft size={22}/></button>
                <div className="flex gap-2 text-left">{[1, 2, 3].map(p => <div key={p} className={`h-1.5 rounded-full transition-all duration-300 ${docPage === p ? 'w-8 bg-purple-600' : 'w-1.5 bg-slate-200'}`} />)}</div>
                <button disabled={docPage === totalDocPages} onClick={() => setDocPage(prev => prev - 1)} className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${docPage === totalDocPages ? 'text-slate-200' : 'text-purple-600 bg-purple-50 hover:bg-purple-100 active:scale-90'}`}><FiChevronRight size={22}/></button>
            </div>
          </div>
        </div>
        <div className="flex-1 p-10 flex flex-col bg-white overflow-y-auto border-l border-slate-50 font-bold text-left text-left">
          <button onClick={onClose} className="self-end w-10 h-10 text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center hover:bg-rose-50 rounded-full text-left text-left"><FiX size={24} /></button>
          <div className="mb-8 text-left text-left"><h4 className="text-2xl font-black text-slate-800 tracking-tight text-left">{isSending ? 'กำลังนำส่งข้อมูล...' : doc.status === 'อนุมัติแล้ว' ? 'อนุมัติเสร็จสิ้น' : step === 'preview' ? 'ตรวจสอบรายละเอียด' : 'ลงนามอนุมัติ'}</h4></div>
          <div className="flex-1 font-bold text-left text-left">{isSending ? (<div className="flex flex-col items-center justify-center h-full gap-4 text-center text-left"><div className="w-16 h-16 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin text-left"></div><p className="text-slate-400 font-bold text-left text-left">ระบบกำลังส่งแจ้งเตือนและไฟล์<br/>ไปที่ผู้ยื่นคำขอ...</p></div>) : (<> {step === "preview" && doc.status !== 'อนุมัติแล้ว' && (<div className="space-y-6 text-left text-left text-left text-left"><DetailItem label="ชื่อผู้ยื่นคำขอ" value={doc.requester} /><DetailItem label="หน่วยงาน" value={doc.department} /><DetailItem label="ขนาดไฟล์" value={doc.size} /><div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl border border-purple-100 text-left"><p className="text-xs text-purple-700 leading-relaxed font-bold italic text-center">"กรุณาเลื่อนดูเอกสารให้ครบทุกหน้า (1-{totalDocPages}) ทางฝั่งซ้ายมือ ก่อนทำการกดปุ่มไปที่หน้าลงนาม"</p></div></div>)} {step === "signing" && (<div className="space-y-6 font-bold animate-in slide-in-from-right-4 duration-300 text-left text-left text-left text-left"><div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 font-bold text-left text-left text-left"><button onClick={() => setSignMethod("draw")} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center ${signMethod === 'draw' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}>วาด</button><button onClick={() => setSignMethod("upload")} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center ${signMethod === 'upload' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}>รูปภาพ</button></div> {signMethod === "draw" ? (<div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] h-60 relative overflow-hidden font-bold text-left text-left text-left"><canvas ref={canvasRef} width={400} height={240} className="w-full h-full touch-none cursor-crosshair font-bold text-left text-left text-left" onMouseDown={() => setIsDrawing(true)} onMouseUp={() => setIsDrawing(false)} onMouseMove={draw} onTouchStart={() => setIsDrawing(true)} onTouchEnd={() => setIsDrawing(false)} onTouchMove={draw} /><button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,400,240)} className="absolute bottom-4 right-4 p-3 bg-white text-slate-400 rounded-xl shadow-md hover:text-rose-500 font-bold flex items-center justify-center transition-all text-left"><FiRotateCcw/></button></div>) : (<label className="border-2 border-dashed border-slate-200 rounded-[2.5rem] h-60 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all bg-slate-50 overflow-hidden relative font-bold text-left text-left text-left text-left"><FiUpload size={32} className="text-slate-300 mb-2"/><span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">อัปโหลดภาพลายเซ็น</span><input type="file" hidden accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setSignatureImage(reader.result); setStep("result"); }; reader.readAsDataURL(file); } }} /></label>)}</div>)} {step === "result" && (<div className="space-y-6 animate-in slide-in-from-bottom-4 text-left text-left text-left text-left text-left"><div className="p-8 rounded-[2.5rem] border text-center font-bold border-emerald-100 bg-emerald-50/50 text-left text-left text-left text-left text-left"><div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200 animate-bounce text-left text-left text-left"><FiCheck size={32} strokeWidth={3} /></div><p className="font-black text-emerald-800 text-xl mb-1 text-left text-left text-left">ลายเซ็นพร้อมใช้งาน!</p><p className="text-xs text-emerald-600/80 font-bold text-left text-left text-left">สามารถตรวจสอบพรีวิวลายเซ็นได้ที่หน้า {totalDocPages} ฝั่งซ้าย</p></div></div>)} </>)}</div>
          <div className="mt-10 space-y-4 text-left">
            {!isSending && step === "preview" && doc.status !== 'อนุมัติแล้ว' && (<><button onClick={() => {setStep("signing"); setDocPage(totalDocPages);}} className="w-full bg-purple-600 text-white py-5 rounded-[2rem] shadow-xl hover:bg-purple-700 active:scale-95 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-2 text-left">ไปที่หน้าลงนาม</button><button onClick={onReject} className="w-full py-4 text-rose-500 hover:bg-rose-50 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center text-left">ส่งคืนเพื่อแก้ไข</button></>)}
            {!isSending && step === "signing" && signMethod === "draw" && <button onClick={confirmDraw} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] shadow-xl active:scale-95 font-black uppercase tracking-widest flex items-center justify-center text-left">ดูตัวอย่างผลลัพธ์</button>}
            {!isSending && step === "result" && doc.status !== 'อนุมัติแล้ว' && <button onClick={startSending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[2rem] shadow-xl active:scale-95 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-left"><FiSend /> ยืนยันและส่งให้ผู้ยื่น</button>}
            {doc.status === 'อนุมัติแล้ว' && <button className="w-full bg-slate-900 text-white py-5 rounded-[2rem] shadow-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-800 active:scale-95 font-black uppercase tracking-widest text-left"><FiDownload size={20}/> ดาวน์โหลดทั้งหมด</button>}
            {!isSending && step !== "preview" && doc.status !== 'อนุมัติแล้ว' && <button onClick={() => {setStep("preview"); setSignatureImage(null); setDocPage(1);}} className="w-full py-2 text-slate-400 text-[11px] font-black flex items-center justify-center uppercase tracking-widest hover:text-slate-600 transition-colors text-left">ยกเลิกขั้นตอน</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, icon }) {
  return (
    <div className="space-y-2 text-left font-bold text-left text-left text-left">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 font-black block text-left text-left text-left">{label}</label>
      <div className="relative font-bold text-left text-left text-left text-left">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-left text-left text-left">{icon}</span>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base font-bold outline-none appearance-none cursor-pointer text-left text-left text-left">
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="space-y-1 text-left text-left text-left text-left text-left">
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block font-bold text-left text-left text-left">{label}</span>
      <p className="text-base font-black text-slate-700 font-bold text-left text-left text-left">{value}</p>
    </div>
  );
}

function SidebarItem({ icon, label, active, danger, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer text-sm font-black transition-all text-left text-left ${
        active 
          ? "bg-purple-50 text-purple-700 shadow-sm shadow-purple-100 font-black" 
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 font-black"
      } ${danger ? "text-rose-500 hover:bg-rose-50 mt-auto font-black" : ""}`}
    >
      <span className={active ? "text-purple-600 text-lg" : "text-slate-300 text-lg"}>{icon}</span>
      {label}
    </div>
  );
}

function ProfileInput({ label, value, onChange }) {
  return (
    <div className="space-y-1 text-left block font-bold text-left text-left text-left text-left text-left text-left">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-black text-left text-left text-left">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-sm focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-bold text-left text-left text-left" 
      />
    </div>
  );
}