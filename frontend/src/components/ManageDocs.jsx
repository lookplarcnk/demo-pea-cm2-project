import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
// ✅ 1. นำเข้า react-hot-toast
import toast, { Toaster } from 'react-hot-toast';
import {
  FiFileText, FiSearch, FiTrash2, FiEye, FiFilter, FiDownload,
  FiChevronLeft, FiChevronRight, FiCheckCircle, FiXCircle, FiClock,
  FiMenu, FiSettings, FiLogOut, FiPieChart, FiUsers, FiTrendingUp, FiX, FiCheck,
  FiPlus, FiLayers, FiUploadCloud, FiTag, FiBox, FiCamera, FiBriefcase, FiEdit3, FiInfo, FiFile,
  FiSend
} from "react-icons/fi";
import LogoutModal from "./LogoutModal";
// ✅ นำเข้าคอมโพเนนต์โปรไฟล์ใหม่
import AdminProfileModal from "./AdminProfileModal";
import Logo from "../assets/img/logo-pea.png"; // ✅ นำเข้า Logo

const API_BASE_URL = "http://localhost:5000/api";

export default function ManageDocs() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openAddDocModal, setOpenAddDocModal] = useState(false);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const [allDocuments, setAllDocuments] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [docsRes, catsRes, deptsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/documents`),
        axios.get(`${API_BASE_URL}/categories`),
        axios.get(`${API_BASE_URL}/departments`)
      ]);
      
      setAllDocuments(docsRes.data);
      setCategories(catsRes.data); 
      setDepartments(deptsRes.data.map(dept => dept.dept_name));
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("ดึงข้อมูลเริ่มต้นไม่สำเร็จ");
      setCategories([]); 
      setDepartments([]);
    }
  };

  const handleConfirmLogout = () => { window.location.href = "/"; };

  const handleDelete = async (id) => {
    if (window.confirm("ยืนยันการลบเอกสารนี้ออกจากระบบอย่างถาวร?")) {
      try {
        await axios.delete(`${API_BASE_URL}/documents/${id}`);
        setAllDocuments(allDocuments.filter(doc => (doc.id || doc.doc_id) !== id));
        // ✅ 2. เปลี่ยน alert เป็น toast
        toast.success("ลบเอกสารออกจากระบบเรียบร้อยแล้ว");
      } catch (err) {
        toast.error("ไม่สามารถลบเอกสารได้");
      }
    }
  };

  const handleViewFile = (doc) => {
    const docName = doc.doc_name || doc.name;
    const fileUrl = `http://localhost:5000/files/${encodeURIComponent(docName)}.pdf`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleAddDocument = async (newDoc) => {
    try {
      const selectedCategory = categories.find(c => c.cat_name === newDoc.category);
      const isAdmin = user.role.toLowerCase().includes("admin");

      const payload = {
        doc_name: newDoc.name,
        cat_id: selectedCategory ? selectedCategory.cat_id : null, 
        file_size: newDoc.size,
        file_url: `uploads/${newDoc.name}.pdf`, 
        require_login: false,
        fiscal_year: 2026, 
        dept: newDoc.dept,
        owner: user.name, 
        status: isAdmin ? "อนุมัติแล้ว" : "รออนุมัติ"
      };

      const response = await axios.post(`${API_BASE_URL}/documents`, payload);
      
      const addedDoc = {
        ...response.data,
        category: newDoc.category 
      };

      setAllDocuments(prev => [addedDoc, ...prev]);
      setOpenAddDocModal(false);
      // ✅ 3. เปลี่ยน alert เป็น toast
      toast.success(isAdmin ? "อัปโหลดและอนุมัติทันทีสำเร็จ" : "อัปโหลดสำเร็จ รอการตรวจสอบจาก Admin");
    } catch (err) {
      toast.error("อัปโหลดไม่สำเร็จ: " + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/documents/${id}/status`, { status: newStatus });
      setAllDocuments(allDocuments.map(doc => 
        (doc.doc_id === id || doc.id === id) ? { ...doc, status: newStatus } : doc
      ));
      // ✅ 4. เปลี่ยน alert เป็น toast
      toast.success(`อัปเดตสถานะเป็น ${newStatus} เรียบร้อยแล้ว`);
    } catch (err) {
      console.error("Update Status Error:", err);
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  const handleAddCategory = async (catName) => {
    if (catName && !categories.some(c => c.cat_name === catName)) {
      try {
        const response = await axios.post(`${API_BASE_URL}/categories`, { cat_name: catName });
        setCategories(prev => [...prev, response.data]); 
        toast.success("เพิ่มหมวดหมู่สำเร็จ");
      } catch (err) {
        toast.error("ไม่สามารถเพิ่มหมวดหมู่ได้");
      }
    }
    setOpenAddCategoryModal(false);
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?")) {
      try {
        await axios.delete(`${API_BASE_URL}/categories/${catId}`);
        setCategories(categories.filter(c => c.cat_id !== catId));
        fetchInitialData();
        toast.success("ลบหมวดหมู่สำเร็จ");
      } catch (err) {
        toast.error("ไม่สามารถลบหมวดหมู่ได้");
      }
    }
  };

  const handleEditCategory = async (catId, newName) => {
    try {
      await axios.put(`${API_BASE_URL}/categories/${catId}`, { cat_name: newName });
      setCategories(categories.map(c => c.cat_id === catId ? { ...c, cat_name: newName } : c));
      fetchInitialData();
      toast.success("แก้ไขหมวดหมู่สำเร็จ");
    } catch (err) {
      toast.error("ไม่สามารถแก้ไขหมวดหมู่ได้");
    }
  };

  const filteredDocs = useMemo(() => {
    return allDocuments.filter(doc => {
      const name = (doc.doc_name || doc.name || "").toLowerCase();
      const owner = (doc.owner || "").toLowerCase();
      const dept = (doc.dept || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = name.includes(query) || owner.includes(query) || dept.includes(query);
      const matchesStatus = statusFilter === "ทั้งหมด" || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allDocuments, searchQuery, statusFilter]);

  const currentItems = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);

  const theme = {
    bg: "bg-[#fcfaff]", // ✅ ปรับเป็นม่วงขาวนวล
    card: "bg-white border-purple-50",
    sidebar: "bg-white border-purple-50",
    header: "bg-white/50 border-purple-50",
    divider: "border-purple-50",
  };

  return (
    <div className={`flex min-h-screen ${theme.bg} font-sans text-slate-700 overflow-x-hidden text-left font-medium`}>
      {/* ✅ 5. เพิ่ม Toaster Component เพื่อใช้แสดงผล Toast */}
      <Toaster position="top-right" reverseOrder={false} />

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${theme.sidebar} border-r flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`p-6 flex items-center gap-3 border-b border-purple-50 text-left`}>
          <img 
            src={Logo} 
            alt="PEA Logo" 
            className="h-12 w-auto object-contain" 
          />
          <div className="leading-tight text-left">
            <h1 className="text-base font-black text-[#74045F] uppercase tracking-tight">PEA ADMIN</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Chiang Mai 2 System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 font-bold text-left">
          <Link to="/AdminDashboard"><SidebarItem icon={<FiPieChart />} label="หน้าสรุปผล (Overview)" /></Link>
          <SidebarItem icon={<FiFileText />} label="จัดการเอกสารทั้งหมด" active />
          <Link to="/AdminApprovalCenter"><SidebarItem icon={<FiCheckCircle />} label="พิจารณาเอกสาร" /></Link>
          <Link to="/AdminSubmitApproval"><SidebarItem icon={<FiSend />} label="ส่งเอกสารให้พิจารณา" /></Link>
          <Link to="/UserManage"><SidebarItem icon={<FiUsers />} label="จัดการผู้ใช้งาน" /></Link>
          <Link to="/AnalysisReport"><SidebarItem icon={<FiTrendingUp />} label="รายงานเชิงวิเคราะห์" /></Link>
        </nav>
        <div className={`p-6 border-t ${theme.divider} space-y-2 font-bold text-left`}>
          <Link to="/AdminSetting"><SidebarItem icon={<FiSettings />} label="ตั้งค่าระบบ" /></Link>
          <div onClick={() => setOpenLogoutModal(true)} className="cursor-pointer">
            <SidebarItem icon={<FiLogOut />} label="ออกจากระบบ" danger />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className={`backdrop-blur-md px-4 lg:px-10 py-6 border-b ${theme.header} sticky top-0 z-30 font-bold flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-xl shadow-sm border border-purple-100 lg:hidden text-[#74045F] flex items-center justify-center"><FiMenu size={20} /></button>
            <h2 className="text-xl lg:text-2xl font-bold text-[#74045F] tracking-tight text-left">จัดการเอกสารทั้งหมด</h2>
          </div>
          <div className="flex items-center gap-4 text-left">
            <button onClick={() => setOpenProfileModal(true)} className="flex-shrink-0 active:scale-95 transition-transform flex items-center justify-center">
              <img src={user.avatar} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md hover:border-[#74045F] transition-all text-left" alt="profile" />
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-10 pb-10 mt-8 space-y-8 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-bold text-left">
            <SummaryCard title="เอกสารทั้งหมด" value={allDocuments.length} icon={<FiBox />} color="purple" />
            <SummaryCard title="หมวดหมู่เอกสาร" value={categories.length} icon={<FiLayers />} color="purple" />
            <SummaryCard title="รอการตรวจสอบ" value={allDocuments.filter(d => d.status === "รออนุมัติ").length} icon={<FiClock />} color="amber" />
            <SummaryCard title="อนุมัติแล้ว" value={allDocuments.filter(d => d.status === "อนุมัติแล้ว").length} icon={<FiCheckCircle />} color="purple" />
            <SummaryCard title="ถูกปฏิเสธ" value={allDocuments.filter(d => d.status === "ไม่อนุมัติ").length} icon={<FiXCircle />} color="rose" />
          </div>

          <div className={`${theme.card} p-5 rounded-[2.5rem] border shadow-sm flex flex-col lg:flex-row gap-5 items-center justify-end text-left`}>
            <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto text-left">
                <div className="relative w-full md:w-72 font-bold text-left">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input type="text" placeholder="ค้นหาเอกสาร/แผนก..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-purple-50 rounded-2xl focus:ring-4 focus:ring-[#74045F]/5 focus:bg-white outline-none font-bold text-sm transition-all text-left" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="relative w-full md:w-44 font-bold text-left">
                  <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                  <select className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-purple-50 rounded-2xl focus:ring-4 focus:ring-[#74045F]/5 focus:bg-white outline-none font-bold text-sm appearance-none cursor-pointer transition-all text-left" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option>ทั้งหมด</option><option>อนุมัติแล้ว</option><option>รออนุมัติ</option><option>ไม่อนุมัติ</option>
                  </select>
                </div>
                <button onClick={() => setOpenAddCategoryModal(true)} className="flex-1 md:flex-none px-5 py-3 bg-purple-50 text-[#74045F] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-100 transition-all flex items-center justify-center gap-2.5 active:scale-95 text-left"><FiLayers size={16} /> <span className="whitespace-nowrap">จัดการหมวดหมู่</span></button>
                <button onClick={() => setOpenAddDocModal(true)} className="flex-1 md:flex-none px-6 py-3 bg-[#74045F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#5a034a] shadow-lg shadow-purple-100 transition-all flex items-center justify-center gap-2.5 active:scale-95 text-left"><FiPlus size={18} /> <span className="whitespace-nowrap">อัปโหลดเอกสาร</span></button>
            </div>
          </div>

          <div className={`${theme.card} rounded-[2.5rem] shadow-sm border overflow-hidden font-bold text-left`}>
            <div className="overflow-x-auto text-left">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-purple-50/30 text-purple-400 text-[11px] uppercase tracking-widest font-black border-b border-purple-50 text-left">
                  <tr>
                    <th className="px-6 py-5 text-left">ข้อมูลเอกสาร</th>
                    <th className="px-6 py-5 text-left">หมวดหมู่</th>
                    <th className="px-6 py-5 text-left">แผนก</th>
                    <th className="px-6 py-5 text-left">เจ้าของ</th>
                    <th className="px-6 py-5 text-center">สถานะ</th>
                    <th className="px-6 py-5 text-center">วันที่อัปโหลด</th>
                    <th className="px-8 py-5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 text-left">
                  {currentItems.map((doc) => (
                    <tr key={doc.doc_id || doc.id} className="hover:bg-purple-50/20 transition-all text-sm font-bold text-left">
                      <td className="px-6 py-5 text-left cursor-pointer" onClick={() => handleViewFile(doc)}>
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-11 h-11 bg-purple-50 text-[#74045F] rounded-2xl flex items-center justify-center text-xl shadow-sm flex-shrink-0 text-left"><FiFileText /></div>
                          <div className="text-left">
                            <p className="text-slate-800 font-black hover:text-[#74045F] transition-colors text-left">{doc.doc_name || doc.name}</p>
                            <p className="text-slate-400 text-[11px] text-left">{doc.file_size || doc.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <span className="text-[#74045F] bg-purple-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap text-left">
                          {doc.category || "ไม่ระบุ"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <span className="text-slate-500 text-[12px] font-bold flex items-center gap-1.5 italic text-left">
                          <FiBriefcase size={12}/> {doc.dept}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-left font-bold text-slate-700">{doc.owner}</td>
                      <td className="px-6 py-5 text-center text-left">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1.5 text-left ${doc.status === 'อนุมัติแล้ว' ? 'bg-emerald-100 text-emerald-600' : doc.status === 'รออนุมัติ' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                          {doc.status === 'อนุมัติแล้ว' ? <FiCheckCircle /> : doc.status === 'รออนุมัติ' ? <FiClock /> : <FiXCircle />} {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center text-slate-400 text-[13px] text-left">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('th-TH') : (doc.date || "-")}
                      </td>
                      <td className="px-8 py-5 text-right text-left">
                        <div className="flex justify-end gap-2 text-left">
                          {doc.status === 'รออนุมัติ' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(doc.doc_id || doc.id, 'อนุมัติแล้ว')} 
                                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center text-left" 
                                title="อนุมัติ"
                              >
                                <FiCheck size={16} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(doc.doc_id || doc.id, 'ไม่อนุมัติ')} 
                                className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center text-left" 
                                title="ปฏิเสธ"
                              >
                                <FiX size={16} />
                              </button>
                            </>
                          )}
                          <button onClick={() => handleViewFile(doc)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-[#74045F] hover:text-white transition-all shadow-sm flex items-center justify-center text-left" title="เปิดดูเอกสาร"><FiEye size={16} /></button>
                          <button onClick={() => handleDelete(doc.doc_id || doc.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center text-left" title="ลบเอกสาร"><FiTrash2 size={16} /></button>
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

      {openAddCategoryModal && (
        <AddCategoryModal onClose={() => setOpenAddCategoryModal(false)} onSave={handleAddCategory} onEdit={handleEditCategory} categories={categories} onDelete={handleDeleteCategory} />
      )}
      {openAddDocModal && <AddDocModal onClose={() => setOpenAddDocModal(false)} onSave={handleAddDocument} categories={categories} departments={departments} />}
      {openProfileModal && (
        <AdminProfileModal 
          user={user} 
          setUser={setUser} 
          onClose={() => setOpenProfileModal(false)} 
        />
      )}
      <LogoutModal isOpen={openLogoutModal} onClose={() => setOpenLogoutModal(false)} onConfirm={handleConfirmLogout} />
    </div>
  );
}

/* --- Helper Components --- */

function SummaryCard({ title, value, icon, color }) {
  const colors = { 
    purple: "bg-purple-50 text-[#74045F]", 
    amber: "bg-amber-50 text-amber-600", 
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600"
  };
  return (
    <div className="bg-white border-purple-50 rounded-[2rem] p-6 flex items-center gap-4 border transition-all hover:shadow-xl hover:shadow-[#74045F]/5 group text-left">
      <div className={`p-4 rounded-[1.2rem] text-2xl group-hover:scale-110 transition-transform ${colors[color]} flex items-center justify-center text-left`}>{icon}</div>
      <div className="text-left font-bold text-left">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none text-left">{title}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none text-left">{value !== null ? value.toLocaleString() : 0}</p>
      </div>
    </div>
  );
}

function AddCategoryModal({ onClose, onSave, categories, onDelete, onEdit }) {
    const [catName, setCatName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 text-left">
            <div className="bg-white w-full max-md rounded-[3rem] shadow-2xl p-0 animate-in zoom-in duration-300 font-bold text-left overflow-hidden border border-purple-50">
                <div className="bg-purple-50/30 px-8 py-6 border-b border-purple-50 flex justify-between items-center text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#74045F] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-100 text-left"><FiTag size={20}/></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight text-left">จัดการหมวดหมู่</h3>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-rose-500 hover:shadow-md rounded-full transition-all border border-purple-50 text-left"><FiX size={18}/></button>
                </div>
                <div className="p-8 text-left">
                    <div className="mb-8 p-6 bg-purple-50/30 rounded-3xl border border-purple-100/50 text-left">
                        <label className="text-[11px] font-black text-[#74045F]/60 uppercase tracking-widest ml-1 mb-3 block text-left">เพิ่มหมวดหมู่ใหม่</label>
                        <div className="flex gap-2 text-left">
                          <input autoFocus type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className="flex-1 bg-white text-slate-700 border border-purple-100 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-[#74045F]/5 focus:border-[#74045F]/30 transition-all text-left" placeholder="ระบุชื่อหมวดหมู่..." />
                          <button onClick={() => { if(catName){ onSave(catName); setCatName(""); } }} className="bg-[#74045F] text-white px-5 rounded-2xl font-black shadow-lg shadow-purple-100 hover:bg-[#5a034a] active:scale-95 transition-all flex items-center justify-center text-left"><FiPlus size={22}/></button>
                        </div>
                    </div>
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar text-left">
                        {categories.map((cat) => (
                          <div key={cat.cat_id} className="group flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-purple-100 hover:bg-white hover:shadow-md hover:shadow-purple-500/5 transition-all text-left">
                            {editingId === cat.cat_id ? (
                              <div className="flex gap-2 w-full animate-in slide-in-from-left-2 text-left">
                                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 bg-white border border-purple-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-[#74045F]/5 font-bold text-left" />
                                <button onClick={() => { onEdit(cat.cat_id, editValue); setEditingId(null); }} className="w-9 h-9 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-100 hover:bg-emerald-600 transition-colors text-left"><FiCheck size={18}/></button>
                                <button onClick={() => setEditingId(null)} className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors text-left"><FiX size={18}/></button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3 text-left">
                                  <div className="w-2 h-2 rounded-full bg-purple-300 group-hover:bg-[#74045F] group-hover:scale-125 transition-all text-left"></div>
                                  <span className="text-slate-700 text-sm font-bold tracking-tight text-left">{cat.cat_name}</span>
                                </div>
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 text-left">
                                  <button onClick={() => { setEditingId(cat.cat_id); setEditValue(cat.cat_name); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-purple-50 hover:text-[#74045F] rounded-lg transition-all text-left"><FiEdit3 size={15}/></button>
                                  <button onClick={() => onDelete(cat.cat_id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all text-left"><FiTrash2 size={15}/></button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddDocModal({ onClose, onSave, categories, departments }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState(categories[0]?.cat_name || ""); 
    const [dept, setDept] = useState(departments[0] || "");
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setSelectedFile(file); setName(file.name.split('.').slice(0, -1).join('.')); }
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 text-left">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300 font-bold relative text-left">
                <button onClick={onClose} className="absolute right-8 top-8 w-10 h-10 text-slate-300 hover:text-rose-50 flex items-center justify-center hover:bg-rose-50 rounded-full transition-all text-left"><FiX size={24} /></button>
                <div className="flex flex-col items-center mb-8 text-left">
                  <div className="w-16 h-16 bg-purple-50 text-[#74045F] rounded-3xl flex items-center justify-center mb-4 text-left"><FiUploadCloud size={32} /></div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight text-left">อัปโหลดเอกสารส่วนกลาง</h3>
                  <p className="text-slate-400 text-sm font-bold text-left">เลือกไฟล์ PDF ที่ต้องการเผยแพร่เข้าสู่ระบบ</p>
                </div>
                <div className="space-y-6 text-left">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                    <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) { setSelectedFile(file); setName(file.name.split('.').slice(0, -1).join('.')); } }} onClick={() => fileInputRef.current.click()} className={`relative border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${isDragging ? 'border-[#74045F] bg-purple-50' : 'border-purple-100 bg-slate-50/50 hover:border-purple-200'} text-left`}><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all ${selectedFile ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-purple-400 shadow-sm'} text-left`}>{selectedFile ? <FiFileText size={28} /> : <FiUploadCloud size={28} />}</div><div className="text-center text-left"><span className="block text-sm font-black text-slate-700 text-left">{selectedFile ? selectedFile.name : "ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์"}</span><span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 block text-left">รองรับเฉพาะไฟล์ .PDF (สูงสุด 20MB)</span></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                      <div className="space-y-2 text-left"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 text-left"><FiTag size={12}/> หมวดหมู่เอกสาร</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 text-slate-700 border border-purple-50 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm appearance-none cursor-pointer hover:bg-white transition-all text-left">{categories.map(c => <option key={c.cat_id} value={c.cat_name}>{c.cat_name}</option>)}</select>
                      </div>
                      <div className="space-y-2 text-left"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 text-left"><FiBriefcase size={12}/> แผนกที่รับผิดชอบ</label>
                        <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full bg-slate-50 text-slate-700 border border-purple-50 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm appearance-none cursor-pointer hover:bg-white transition-all text-left">{departments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                      </div>
                    </div>
                    <button disabled={!selectedFile} onClick={() => onSave({ name, size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`, category, dept })} className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${selectedFile ? 'bg-[#74045F] text-white shadow-purple-100 hover:bg-[#5a034a] active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'} text-left`}><FiCheckCircle size={18} /> เริ่มการอัปโหลด</button>
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, active, danger, onClick }) {
  const activeClass = "bg-purple-50 text-[#74045F] shadow-sm shadow-purple-100 text-left";
  const hoverClass = "text-slate-400 hover:bg-purple-50/50 hover:text-[#74045F] text-left";
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer text-sm font-black transition-all text-left ${active ? activeClass : hoverClass} ${danger ? "text-rose-500 mt-auto hover:bg-rose-50" : ""} text-left`}>
      <span className={`flex items-center justify-center text-lg ${active ? 'text-[#74045F]' : 'text-slate-300'}`}>{icon}</span>{label}
    </div>
  );
}

function ProfileInput({ label, value, onChange }) {
  return (
    <div className="space-y-1.5 text-left font-bold">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-slate-700 text-sm focus:ring-4 focus:ring-[#74045F]/10 transition-all outline-none font-bold text-left" />
    </div>
  );
}