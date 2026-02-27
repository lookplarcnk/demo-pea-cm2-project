import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiFileText, FiExternalLink, FiLock, FiCalendar, FiUser, FiBriefcase, FiHardDrive, FiArrowLeft } from "react-icons/fi"; // ✅ เพิ่ม FiArrowLeft
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AllDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ✅ แก้ไข: กำหนด URL ให้ชี้ไปยัง Render
  const RENDER_API_BASE = "https://demo-pea-cm2-project.onrender.com";

  useEffect(() => {
    setLoading(true);
    // ✅ แก้ไข: เปลี่ยนจาก localhost เป็น RENDER_API_BASE
    fetch(`${RENDER_API_BASE}/api/all-documents`)
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data);
      })
      .catch((err) => console.error("Error fetching docs:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.department && doc.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.uploader && doc.uploader.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, documents]);

  // ✅ แก้ไข: ฟังก์ชันเปิดไฟล์ PDF ให้ชี้ไปยัง Render Server พร้อม encode ชื่อไฟล์
  const handleAccess = (doc) => {
    if (doc.require_login && !user) {
      alert("🔒 เอกสารนี้เฉพาะสมาชิกเท่านั้น กรุณาเข้าสู่ระบบ");
      navigate("/loginchoice");
    } else {
      // ใช้ชื่อเอกสารต่อท้ายด้วย .pdf และ encode สำหรับภาษาไทย
      const fileName = encodeURIComponent(`${doc.title}.pdf`);
      const fileUrl = `${RENDER_API_BASE}/files/${fileName}`;
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-left font-sans">
      <Navbar />
      
      {/* 🔹 ส่วนหัวสีม่วง PEA (#74045F) */}
      <div className="bg-[#74045F] py-12 px-4 border-b-4 border-[#74045F]">
        <div className="container mx-auto max-w-[1320px] text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-wide text-center">คลังเอกสารทั้งหมด</h1>
          <p className="text-white opacity-90 font-bold text-center">รวบรวมระเบียบและข้อบังคับ เรียงตามลำดับการอัปเดตล่าสุด</p>
        </div>
      </div>

      <div className="container mx-auto max-w-[1320px] py-10 px-4 -mt-10 flex-grow text-left">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-left relative text-left">
          
          {/* ✅ เพิ่มปุ่มกลับหน้าแรก */}
          <button 
            onClick={() => navigate("/")} 
            className="absolute left-6 top-6 hidden md:flex items-center gap-2 text-gray-500 hover:text-[#74045F] transition-colors duration-200 font-semibold text-sm group text-left"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform text-left" />
            กลับหน้าแรก
          </button>

          <div className="p-6 pt-16 md:pt-16 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
            <div className="relative w-full md:w-96 text-left">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-left" />
              <input
                type="text"
                placeholder="ค้นหาชื่อเอกสาร, แผนก, หรือผูัปโหลด..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-[#74045F]/10 focus:border-[#74045F] font-bold text-sm transition-all text-left text-[#4B5563]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-slate-500 font-bold bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm text-sm">
              พบทั้งหมด <span className="text-[#74045F]">{filteredDocs.length}</span> รายการ
            </span>
          </div>

          <div className="overflow-x-auto text-left">
            <table className="w-full text-left border-collapse min-w-[1100px] text-left">
              <thead className="bg-gray-50 border-b-2 border-slate-100 text-left">
                <tr className="text-gray-600 text-left">
                  <th className="p-6 font-black text-xs md:text-sm uppercase tracking-wider text-left">ลำดับ</th>
                  <th className="p-6 font-black text-xs md:text-sm uppercase tracking-wider w-[25%] text-left">ชื่อเอกสาร</th>
                  <th className="p-6 font-black text-xs md:text-sm uppercase tracking-wider text-center">ขนาดไฟล์</th>
                  <th className="p-6 font-black text-xs md:text-sm uppercase tracking-wider text-center">หมวดหมู่</th>
                  <th className="p-6 font-black text-xs md:text-sm uppercase tracking-wider text-center">วันที่อัปโหลด</th>
                  <th className="p-6 font-black text-xs md:text-sm uppercase tracking-wider text-center">ผู้อัปโหลด</th>
                  <th className="p-6 font-black text-xs md:text-sm uppercase tracking-wider text-center">แผนก</th>
                  <th className="p-6 font-black text-xs md:text-sm uppercase tracking-wider text-center">ยอดอ่าน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-left">
                {loading ? (
                  <tr className="text-left">
                    <td colSpan="8" className="p-20 text-center text-slate-400 font-bold italic text-center">กำลังโหลดคลังเอกสาร...</td>
                  </tr>
                ) : filteredDocs.length > 0 ? (
                  filteredDocs.map((doc, index) => (
                    <tr key={doc.id} className="hover:bg-purple-50/30 transition-colors group text-left">
                      <td className="p-6 text-[#4B5563] font-bold text-sm text-center">{index + 1}</td>
                      <td className="p-6 text-left">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 bg-purple-50 text-[#74045F] rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#74045F] group-hover:text-white transition-all shadow-sm text-center">
                            {doc.require_login ? <FiLock size={18} /> : <FiFileText size={18} />}
                          </div>
                          <button 
                            onClick={() => handleAccess(doc)}
                            className="font-bold text-[#4B5563] group-hover:text-[#74045F] transition-colors text-left hover:underline line-clamp-1 text-left"
                          >
                            {doc.title}
                          </button>
                        </div>
                      </td>
                      <td className="p-6 text-center text-xs font-bold text-[#4B5563]">
                        <div className="flex items-center justify-center gap-1 text-center">
                          <FiHardDrive className="text-slate-300 text-center" />
                          {doc.size || "0.00 MB"}
                        </div>
                      </td>
                      <td className="p-6 text-center text-center">
                        <span className="inline-block px-3 py-1 bg-purple-50 text-[#74045F] rounded-full text-[10px] font-black uppercase shadow-sm text-center">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-6 text-center text-xs font-bold text-[#4B5563] text-center">
                        <div className="flex items-center justify-center gap-2 text-center">
                          <FiCalendar className="text-slate-300 text-center" />
                          {doc.uploadDate}
                        </div>
                      </td>
                      <td className="p-6 text-center text-xs font-bold text-[#74045F] text-center">
                        <div className="flex items-center justify-center gap-2 text-center">
                          <FiUser className="text-purple-300 text-center" />
                          {doc.uploader || "ระบบ"}
                        </div>
                      </td>
                      <td className="p-6 text-center text-center">
                        <div className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#4B5563] bg-slate-100 py-1 px-3 rounded-md text-center">
                          <FiBriefcase className="text-slate-400 text-center" />
                          {doc.department || "-"}
                        </div>
                      </td>
                      <td className="p-6 text-center text-center">
                        <span className="text-sm font-black text-slate-400 text-center">
                          {doc.downloads || 0} <span className="text-[9px] uppercase ml-1">ครั้ง</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-left">
                    <td colSpan="8" className="p-20 text-center text-slate-400 font-bold italic text-center">
                      ไม่พบข้อมูลเอกสารที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllDocumentsPage;