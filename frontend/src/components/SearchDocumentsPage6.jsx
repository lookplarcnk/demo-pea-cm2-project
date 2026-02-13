import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import Logo from "../assets/img/logo-pea.png";
import { 
  FiUser, FiLogOut, FiEdit, FiSearch, 
  FiFileText, FiExternalLink, 
  FiChevronDown, FiLock 
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer"; // อิมพอร์ต Footer เข้ามาใช้งาน

const API_BASE_URL = "http://localhost:5000/api";

// --- ส่วนที่ 1: Navbar (คงเดิมห้ามแก้ไข) ---
function Navbar() {
  const [toggle, setToggle] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40 text-left">
      <div className="container mx-auto max-w-[1320px] px-4 md:px-6">
        <div className="flex items-center justify-between h-[85px]">
          <Link to="/" className="flex items-center gap-3">
            <img src={Logo} alt="PEA Chiang Mai 2" className="h-14 md:h-16 object-contain" />
            <div className="leading-tight text-left">
              <p className="text-[#74045F] font-bold text-lg md:text-xl">การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2</p>
              <p className="text-[#74045F] text-xs md:text-sm opacity-80 -mt-1 font-medium">Provincial Electricity Authority Chiang Mai 2</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="nav-link font-bold text-gray-700 hover:text-[#74045F]">หน้าแรก</Link>
            <Link to="#" className="nav-link font-bold text-gray-700 hover:text-[#74045F]">เกี่ยวกับหน่วยงาน</Link>
            <Link to="#" className="nav-link font-bold text-gray-700 hover:text-[#74045F]">การบริหารงาน</Link>
            <Link to="#" className="nav-link font-bold text-gray-700 hover:text-[#74045F]">ติดต่อเรา</Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/loginchoice" className="text-[#74045F] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#F3E8FF]">เข้าสู่ระบบ</Link>
                <Link to="/register" className="bg-[#00D0FF] hover:bg-[#00B2D8] text-white text-sm font-semibold px-5 py-2 rounded-md shadow-sm">สมัครสมาชิก</Link>
              </>
            ) : (
              <div className="relative text-left">
                <button onClick={() => setOpenProfile(!openProfile)} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border border-purple-200">
                    {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <FiUser className="text-[#74045F] text-xl" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                </button>
                {openProfile && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2">
                    <button onClick={() => { setOpenProfile(false); navigate("/publicprofileedit"); }} className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                      <FiEdit /> แก้ไขโปรไฟล์
                    </button>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <FiLogOut /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={() => setToggle(!toggle)} className="md:hidden text-[#74045F] text-2xl"><FaBars /></button>
        </div>
      </div>
    </nav>
  );
}

// --- ส่วนที่ 2: หน้าหลักการค้นหาเอกสาร (คำสั่งและประกาศ) ---
function SearchDocumentsPage6() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("ทั้งหมด");
  const [selectedDept, setSelectedDept] = useState("ทั้งหมด");
  const [departments, setDepartments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // ดึงข้อมูลแผนกจาก Database
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

  // ฟังก์ชันค้นหาเอกสารจริงจาก Database
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/public/documents/manuals`, {
        params: {
          query: searchQuery,
          year: selectedYear,
          dept: selectedDept
        }
      });
      setDocuments(response.data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ส่วนที่แก้ไข: เปิด Preview เอกสารฉบับจริงใน Tab ใหม่
   * รองรับชื่อไฟล์ภาษาไทยผ่านเส้นทาง /files/
   */
  const handleAccess = (doc) => {
    if (doc.require_login && !user) {
      alert("กรุณาเข้าสู่ระบบเพื่อเข้าถึงคำสั่งหรือประกาศฉบับนี้");
      navigate("/loginchoice");
    } else {
      // ใช้ชื่อเอกสาร (doc_name) เข้ารหัสเพื่อให้เรียกชื่อไฟล์ภาษาไทยใน uploads ได้ถูกต้อง
      const fileName = encodeURIComponent(`${doc.doc_name}.pdf`);
      const fileUrl = `http://localhost:5000/files/${fileName}`;
      
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-left flex flex-col">
      <Navbar />
      <header className="bg-[#00BEEA] py-16 px-4 border-b-4 border-[#00BEEA]">
        <div className="container mx-auto max-w-[1200px] text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase tracking-wide">ค้นหาคำสั่งและประกาศ</h2>
          <p className="text-white opacity-90 text-sm md:text-base font-bold">คลังข้อมูลคำสั่งปฏิบัติงานและประกาศทางการ การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2</p>
        </div>
      </header>

      <main className="container mx-auto max-w-[950px] px-4 -mt-12 pb-24 text-left flex-grow">
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100 text-left">
          <form className="space-y-8" onSubmit={handleSearch}>
            <div>
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left">ค้นหาชื่อคำสั่งและประกาศ</label>
              <input
                type="text"
                placeholder="พิมพ์เลขที่คำสั่ง หรือคำสำคัญที่ต้องการค้นหา..."
                className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#00BEEA]/10 focus:border-[#00BEEA] font-bold text-gray-700 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left">ปี พ.ศ.</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-[#F8FAFC] font-bold text-gray-600 outline-none cursor-pointer focus:border-[#00BEEA]"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  <option value="2569">2569</option>
                  <option value="2568">2568</option>
                  <option value="2567">2567</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left">แผนก</label>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-[#F8FAFC] font-bold text-gray-600 outline-none cursor-pointer focus:border-[#00BEEA]"
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
            <button type="button" onClick={() => setShowAdvance(!showAdvance)} className="flex items-center gap-2 text-sm font-bold text-[#00BEEA] hover:text-[#0099CC] transition-colors">
              <FiChevronDown className={`transition-transform duration-300 ${showAdvance ? 'rotate-180' : ''}`} />
              แสดง/ซ่อน ตัวเลือกการค้นหาเพิ่มเติม
            </button>
            <button type="submit" className="w-full bg-[#004B8D] text-white py-4.5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#003366] transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98]">
              <FiSearch size={22} /> {loading ? "กำลังค้นหา..." : "ค้นหาข้อมูลตอนนี้"}
            </button>
          </form>
        </div>

        <section className="mt-16 text-left">
          {documents.length > 0 ? (
            <div className="results-container">
              <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] mb-8 border-l-4 border-[#00BEEA] pl-4 text-left">รายการที่เกี่ยวข้อง ({documents.length})</p>
              <div className="space-y-5">
                {documents.map((doc) => (
                  <div key={doc.doc_id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md hover:shadow-xl hover:border-[#00BEEA] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="flex items-center gap-5 flex-1 cursor-pointer" onClick={() => handleAccess(doc)}>
                      <div className="w-16 h-16 bg-[#F0F9FF] text-[#00BEEA] rounded-2xl flex items-center justify-center text-3xl group-hover:bg-[#00BEEA] group-hover:text-white transition-all duration-300">
                        {doc.require_login && !user ? <FiLock /> : <FiFileText />}
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-gray-800 text-lg group-hover:text-[#00BEEA] transition-colors flex items-center gap-2">
                          {doc.doc_name}
                          {doc.require_login && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">ต้องล็อกอิน</span>}
                        </h4>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 text-[11px] font-black text-gray-400 uppercase tracking-widest text-left">
                          <span className="text-[#00BEEA]">{doc.category || "คำสั่ง/ประกาศ"}</span>
                          <span>• {doc.fiscal_year}</span>
                          <span>• {doc.file_size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleAccess(doc)} 
                        className="p-3 bg-gray-50 text-gray-400 hover:text-[#00BEEA] hover:bg-[#E0F2FE] rounded-xl transition-all shadow-sm" 
                        title="เปิดดูเอกสารฉบับจริง"
                      >
                        <FiExternalLink size={24} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50/50 py-20 rounded-3xl border border-blue-100 text-center">
              <FiSearch className="text-6xl text-blue-200 mx-auto mb-4" />
              <p className="text-blue-400 font-bold uppercase tracking-widest italic text-sm md:text-base">
                {searchQuery ? "ไม่พบเอกสารที่คุณต้องการ" : "กรุณาพิมพ์ชื่อคำสั่ง หรือประกาศที่ต้องการค้นหา"}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SearchDocumentsPage6;