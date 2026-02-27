import React, { useState, useEffect } from "react";
import axios from "axios"; 
import { 
  FiSearch, FiFileText, FiExternalLink, 
  FiChevronDown, FiLock, FiArrowLeft 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// ✅ 1. นำเข้า Navbar จากไฟล์แยก (แทนการประกาศ Navbar เดิมภายในไฟล์นี้)
import Navbar from "./Navbar"; 
import Footer from "./Footer"; 

const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

// --- ส่วนที่ 2: หน้าหลักการค้นหาเอกสาร (รายงานประจำปี) (รักษาโครงสร้างเดิมห้ามหาย) ---
function SearchDocumentsPage5() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("ทั้งหมด");
  const [selectedDept, setSelectedDept] = useState("ทั้งหมด");
  const [departments, setDepartments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ กำหนด SERVER URL สำหรับเปิดไฟล์ PDF (Render)
  const RENDER_SERVER_URL = "https://demo-pea-cm2-project.onrender.com";

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/departments`);
        if (Array.isArray(res.data)) {
          const deptNames = res.data.map(item => item.dept_name).filter(Boolean);
          setDepartments(deptNames); 
        }
      } catch (err) {
        console.error("Fetch departments error:", err);
      }
    };
    fetchDepts();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    // ✅ แปลงปี พ.ศ. เป็น ค.ศ. ก่อนส่งไปยัง Backend (ถ้าไม่ใช่ "ทั้งหมด")
    let yearToSend = "";
    if (selectedYear !== "ทั้งหมด") {
      yearToSend = (parseInt(selectedYear) - 543).toString();
    }

    try {
      // ✅ แก้ไขจุดที่ผิด: เปลี่ยนจาก /manuals เป็น /reports (หรือ endpoint ที่จัดการรายงานประจำปี)
      const response = await axios.get(`${API_BASE_URL}/public/documents/reports`, {
        params: {
          query: searchQuery,
          year: yearToSend, // ส่งเป็น ค.ศ.
          dept: selectedDept === "ทั้งหมด" ? "" : selectedDept
        }
      });

      // ✅ แปลงปี ค.ศ. ที่ได้จากฐานข้อมูลกลับเป็น พ.ศ. เพื่อแสดงผลในรายการ
      const mappedDocs = response.data.map(doc => ({
        ...doc,
        // เพิ่มตัวแปรสำหรับแสดงผลแผนก
        displayDept: doc.dept_name || doc.dept || "ไม่ระบุแผนก",
        displayYear: doc.fiscal_year 
          ? (parseInt(doc.fiscal_year) < 2500 ? parseInt(doc.fiscal_year) + 543 : doc.fiscal_year)
          : "ไม่ระบุ"
      }));

      setDocuments(mappedDocs);
    } catch (err) {
      console.error("Search error:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ แก้ไข: ฟังก์ชันเปิดไฟล์ PDF ให้ชี้ไปยัง Render Server (Production URL)
  const handleAccess = (doc) => {
    if (doc.require_login && !user) {
      alert("🔒 กรุณาเข้าสู่ระบบเพื่อเข้าถึงรายงานฉบับเต็ม");
      navigate("/loginchoice");
    } else {
      // ตรวจสอบชื่อเอกสารและสร้าง URL ที่ถูกต้องสำหรับ Production
      const fileName = encodeURIComponent(`${doc.doc_name}.pdf`);
      const fileUrl = `${RENDER_SERVER_URL}/files/${fileName}`;
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-left flex flex-col text-left">
      {/* ✅ 2. เรียกใช้คอมโพเนนต์ Navbar ที่นำเข้าจากภายนอก ซึ่งปรับสีปุ่มสมัครสมาชิกแล้ว */}
      <Navbar />
      
      <header className="bg-[#74045F] py-16 px-4 border-b-4 border-[#74045F] text-center">
        <div className="container mx-auto max-w-[1200px] text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase tracking-wide text-center">ค้นหาเอกสารรายงานประจำปี</h2>
          <p className="text-white opacity-90 text-sm md:text-base font-bold text-center">สรุปผลการดำเนินงาน ข้อมูลสถิติ และรายงานความยั่งยืน การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2</p>
        </div>
      </header>

      <main className="container mx-auto max-w-[950px] px-4 -mt-12 pb-24 text-left flex-grow text-left">
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100 text-left relative text-left">
          
          <button 
            onClick={() => navigate("/")} 
            className="absolute left-6 top-6 flex items-center gap-2 text-gray-500 hover:text-[#74045F] transition-colors duration-200 font-semibold text-sm group text-left"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform text-left" />
            กลับหน้าแรก
          </button>

          <form className="space-y-8 text-left mt-8 text-left text-left" onSubmit={handleSearch}>
            <div className="text-left text-left text-left">
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left">ค้นหาชื่อรายงาน / ปีงบประมาณ</label>
              <input
                type="text"
                placeholder="พิมพ์ชื่อรายงานเพื่อเริ่มการค้นหา..."
                className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#74045F]/10 focus:border-[#74045F] font-bold text-gray-700 transition-all text-left text-left"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-left text-left">
              <div className="text-left text-left text-left">
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left text-left text-left">ปี พ.ศ.</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-[#F8FAFC] font-bold text-gray-600 outline-none cursor-pointer focus:border-[#74045F] text-left text-left"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  <option value="2569">2569</option>
                  <option value="2568">2568</option>
                  <option value="2567">2567</option>
                  <option value="2566">2566</option>
                </select>
              </div>
              <div className="text-left text-left text-left text-left">
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left text-left text-left text-left">แผนก</label>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-[#F8FAFC] font-bold text-gray-600 outline-none cursor-pointer focus:border-[#74045F] text-left text-left"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  {departments.length > 0 ? (
                    departments.map((name, idx) => (
                      <option key={idx} value={name}>{name}</option>
                    ))
                  ) : (
                    <option disabled>กำลังโหลดแผนก...</option>
                  )}
                </select>
              </div>
            </div>
            <button type="button" onClick={() => setShowAdvance(!showAdvance)} className="flex items-center gap-2 text-sm font-bold text-[#74045F] hover:text-[#5a034a] transition-colors text-left text-left text-left text-left">
              <FiChevronDown className={`transition-transform duration-300 ${showAdvance ? 'rotate-180' : ''} text-left`} />
              แสดง/ซ่อน ตัวเลือกการค้นหาเพิ่มเติม
            </button>
            <button type="submit" className="w-full bg-[#74045F] text-white py-4.5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#5a034a] transition-all shadow-xl shadow-purple-900/10 active:scale-[0.98] text-center text-center">
              {loading ? "กำลังค้นหา..." : <><FiSearch size={22} className="text-left" /> ค้นหารายงานตอนนี้</>}
            </button>
          </form>
        </div>

        <section className="mt-16 text-left text-left text-left text-left text-left text-left">
          {documents.length > 0 ? (
            <div className="results-container text-left text-left text-left text-left">
              <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] mb-8 border-l-4 border-[#74045F] pl-4 text-left text-left text-left text-left">รายงานที่เกี่ยวข้อง ({documents.length})</p>
              <div className="space-y-5 text-left text-left text-left text-left text-left">
                {documents.map((doc) => (
                  <div key={doc.doc_id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md hover:shadow-xl hover:border-[#74045F] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group text-left text-left text-left text-left text-left">
                    <div className="flex items-center gap-5 flex-1 cursor-pointer text-left text-left text-left text-left text-left" onClick={() => handleAccess(doc)}>
                      <div className="w-16 h-16 bg-purple-50 text-[#74045F] rounded-2xl flex items-center justify-center text-3xl group-hover:bg-[#74045F] group-hover:text-white transition-all duration-300 shadow-sm text-center text-left text-left">
                        {doc.require_login && !user ? <FiLock /> : <FiFileText />}
                      </div>
                      <div className="text-left text-left text-left text-left text-left">
                        <h4 className="font-black text-gray-800 text-lg group-hover:text-[#74045F] transition-colors flex items-center gap-2 text-left text-left text-left text-left text-left">
                          {doc.doc_name}
                          {doc.require_login && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 text-left shadow-sm text-left"><FiLock size={10} /> Staff Only</span>}
                        </h4>
                        {/* ✅ แสดงผลเฉพาะ แผนก • ขนาดไฟล์ • ปี พ.ศ. */}
                        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 text-[11px] font-black text-gray-400 uppercase tracking-widest text-left text-left text-left text-left text-left">
                          <span className="text-[#74045F] font-bold text-left">{doc.displayDept}</span>
                          <span className="text-left text-left text-left">• {doc.file_size || "N/A"}</span>
                          <span className="text-left text-left text-left">• ปี {doc.displayYear}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                      <button 
                        onClick={() => handleAccess(doc)} 
                        className="p-3 bg-gray-50 text-gray-400 hover:text-[#74045F] hover:bg-purple-50 rounded-xl transition-all shadow-sm text-center text-left text-left" 
                        title="เปิดดูรายงานฉบับจริง"
                      >
                        <FiExternalLink size={24} className="text-left" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-purple-50/50 py-20 rounded-3xl border border-purple-100 text-center text-center text-center">
              <FiSearch className="text-6xl text-purple-200 mx-auto mb-4 text-center text-center text-center" />
              <p className="text-purple-400 font-bold uppercase tracking-widest italic text-center text-center text-center text-center">
                {searchQuery ? "ไม่พบรายงานที่คุณต้องการ" : "กรุณาพิมพ์ปี พ.ศ. หรือชื่อรายงานเพื่อแสดงข้อมูล"}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SearchDocumentsPage5;