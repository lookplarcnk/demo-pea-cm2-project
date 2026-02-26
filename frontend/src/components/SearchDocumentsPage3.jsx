import React, { useState, useMemo, useEffect } from "react";
import Logo from "../assets/img/logo-pea.png";
import axios from "axios"; 
import { 
  FiSearch, FiFileText, FiExternalLink, 
  FiChevronDown, FiLock, FiX, FiArrowLeft 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// ✅ 1. นำเข้า Navbar จากไฟล์แยก
import Navbar from "./Navbar"; 
import Footer from "./Footer"; 

const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

// --- ส่วนที่ 2: หน้าหลักการค้นหาเอกสาร (แบบฟอร์ม) (รักษาโครงสร้างเดิมห้ามหาย) ---
function SearchDocumentsPage3() {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState(""); 
  const [showAdvance, setShowAdvance] = useState(false);
  const [allDocs, setAllDocs] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [departments, setDepartments] = useState([]); 
  const [selectedDept, setSelectedDept] = useState("ทั้งหมด");
  // ✅ เพิ่ม State สำหรับเลือกปี พ.ศ.
  const [selectedYear, setSelectedYear] = useState("ทั้งหมด");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/departments`);
        if (Array.isArray(res.data)) {
          const deptNames = res.data.map(d => (typeof d === 'string' ? d : d.dept_name || d.name));
          setDepartments(deptNames.filter(name => name));
        }
      } catch (err) {
        console.error("Fetch departments error:", err);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchFormDocuments = async () => {
      try {
        setIsLoading(true);
        // ✅ แปลงปี พ.ศ. เป็น ค.ศ. ก่อนส่ง API (ถ้ามีการเลือก)
        let yearToSend = "";
        if (selectedYear !== "ทั้งหมด") {
          yearToSend = (parseInt(selectedYear) - 543).toString();
        }

        const res = await axios.get(`${API_BASE_URL}/public/documents/forms`, {
          params: {
            query: submittedSearch,
            dept: selectedDept === "ทั้งหมด" ? "" : selectedDept,
            year: yearToSend // ส่งปี ค.ศ. ไปยัง Backend
          }
        });
        
        // ✅ ปรับปรุงการ Map ข้อมูลให้แสดงผลเฉพาะปี พ.ศ.
        const mappedDocs = res.data.map(doc => ({
          ...doc,
          displayYear: doc.fiscal_year 
            ? (parseInt(doc.fiscal_year) < 2500 ? parseInt(doc.fiscal_year) + 543 : doc.fiscal_year)
            : (doc.created_at ? new Date(doc.created_at).getFullYear() + 543 : "ไม่ระบุ")
        }));

        setAllDocs(mappedDocs);
      } catch (err) {
        console.error("Error loading forms from system:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ แก้ไข: อนุญาตให้ fetch ข้อมูลเสมอ (แม้จะเป็นค่าว่าง) เพื่อรองรับการ "ค้นหาทั้งหมด"
    fetchFormDocuments();
    
  }, [submittedSearch, selectedDept, selectedYear]); 

  const handleSearchClick = (e) => {
    if (e) e.preventDefault();
    setSubmittedSearch(searchQuery); 
  };

  // ✅ แก้ไข: กรองข้อมูลใน Frontend อีกชั้นเพื่อให้แสดงเฉพาะปีที่เลือก
  const filteredDocs = useMemo(() => {
    if (selectedYear === "ทั้งหมด") return allDocs;
    return allDocs.filter(doc => doc.displayYear.toString() === selectedYear.toString());
  }, [allDocs, selectedYear]);

  const handleAccess = (doc) => {
    if (doc.require_login && !user) {
      alert("กรุณาเข้าสู่ระบบเพื่อเข้าถึงแบบฟอร์มความมั่นคงสูงนี้");
      navigate("/loginchoice");
    } else {
      const fileName = encodeURIComponent(`${doc.doc_name || doc.name}.pdf`);
      const fileUrl = `https://demo-pea-cm2-project.onrender.com/files/${fileName}`;
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-left flex flex-col">
      <Navbar />
      
      <header className="bg-[#74045F] py-16 px-4 border-b-4 border-[#74045F] text-center">
        <div className="container mx-auto max-w-[1200px] text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase tracking-wide text-center">ค้นหาเอกสารแบบฟอร์ม</h2>
          <p className="text-white opacity-90 text-sm md:text-base font-bold text-center">ศูนย์รวมแบบฟอร์มอิเล็กทรอนิกส์ การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2</p>
        </div>
      </header>

      <main className="container mx-auto max-w-[950px] px-4 -mt-12 pb-24 text-left flex-grow">
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100 text-left relative">
          
          <button 
            onClick={() => navigate("/")} 
            className="absolute left-6 top-6 flex items-center gap-2 text-gray-500 hover:text-[#74045F] transition-colors duration-200 font-semibold text-sm group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            กลับหน้าแรก
          </button>

          <form className="space-y-8 text-left mt-8" onSubmit={handleSearchClick}>
            <div>
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left">ค้นหาชื่อแบบฟอร์ม</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อแบบฟอร์มเพื่อเริ่มการค้นหา..."
                  className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#74045F]/10 focus:border-[#74045F] font-bold text-gray-700 transition-all text-left"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                    <FiX size={20}/>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left">ปี พ.ศ.</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-[#F8FAFC] font-bold text-gray-600 outline-none cursor-pointer focus:border-[#74045F] text-left"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  <option value="2569">2569</option>
                  <option value="2568">2568</option>
                  <option value="2567">2567</option>
                  <option value="2566">2566</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left">แผนกที่ออกเอกสาร</label>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-[#F8FAFC] font-bold text-gray-600 outline-none cursor-pointer focus:border-[#74045F] text-left"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  {departments.map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="button" onClick={() => setShowAdvance(!showAdvance)} className="flex items-center gap-2 text-sm font-bold text-[#74045F] hover:text-[#5a034a] transition-colors">
              <FiChevronDown className={`transition-transform duration-300 ${showAdvance ? 'rotate-180' : ''}`} />
              แสดง/ซ่อน ตัวเลือกการค้นหาเพิ่มเติม
            </button>
            <button type="submit" className="w-full bg-[#74045F] text-white py-4.5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#5a034a] transition-all shadow-xl shadow-purple-900/10 active:scale-[0.98] text-center">
              <FiSearch size={22} /> ค้นหาแบบฟอร์ม
            </button>
          </form>
        </div>

        <section className="mt-16 text-left">
          {/* ✅ แก้ไข: เปลี่ยนเงื่อนไขเพื่อให้แสดงผลลัพธ์เสมอแม้ไม่ได้พิมพ์คำค้นหา (ค้นหาทั้งหมด) */}
          <div className="results-container text-left">
            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] mb-8 border-l-4 border-[#74045F] pl-4 text-left">
              {submittedSearch || selectedDept !== "ทั้งหมด" || selectedYear !== "ทั้งหมด" ? `รายการแบบฟอร์มที่พบ (${filteredDocs.length})` : `แบบฟอร์มทั้งหมดในระบบ (${filteredDocs.length})`}
            </p>
            
            {isLoading ? (
              <div className="text-center py-12 font-bold text-gray-400 animate-pulse">กำลังดึงข้อมูลแบบฟอร์มล่าสุด...</div>
            ) : (
              <div className="space-y-5 text-left">
                {filteredDocs.map((doc) => (
                  <div key={doc.doc_id || doc.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md hover:shadow-xl hover:border-[#74045F] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group text-left">
                    <div className="flex items-center gap-5 flex-1 cursor-pointer text-left" onClick={() => handleAccess(doc)}>
                      <div className="w-16 h-16 bg-purple-50 text-[#74045F] rounded-2xl flex items-center justify-center text-3xl group-hover:bg-[#74045F] group-hover:text-white transition-all duration-300 shadow-sm text-center">
                        {doc.require_login && !user ? <FiLock /> : <FiFileText />}
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-gray-800 text-lg group-hover:text-[#74045F] transition-colors flex items-center gap-2 text-left">
                          {doc.doc_name || doc.name}
                          {doc.require_login && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><FiLock size={10}/> สิทธิ์พนักงานเท่านั้น</span>}
                        </h4>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 text-[11px] font-black text-gray-400 uppercase tracking-widest text-left">
                          <span className="text-[#74045F] font-bold">{doc.dept_name || doc.dept || "ทั่วไป"}</span>
                          <span>• ปี {doc.displayYear}</span>
                          <span>• {doc.file_size || doc.size || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleAccess(doc)} className="p-3 bg-gray-50 text-gray-400 hover:text-[#74045F] hover:bg-purple-50 rounded-xl transition-all shadow-sm" title="เปิดดูแบบฟอร์มฉบับจริง"><FiExternalLink size={24} /></button>
                    </div>
                  </div>
                ))}
                
                {filteredDocs.length === 0 && !isLoading && (
                  <div className="bg-white py-24 rounded-3xl border-2 border-dashed border-gray-200 text-center shadow-inner">
                    <FiSearch className="text-7xl text-purple-100 mx-auto mb-6 text-center" />
                    <p className="text-gray-400 font-bold text-xl uppercase tracking-widest text-center">ไม่พบข้อมูลแบบฟอร์มที่ค้นหา</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SearchDocumentsPage3;