import React, { useState, useMemo, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import Logo from "../assets/img/logo-pea.png";
import { 
  FiUser, FiLogOut, FiEdit, FiSearch, 
  FiFileText, FiExternalLink, 
  FiChevronDown, FiLock, FiArrowLeft, FiX // ✅ เพิ่ม FiX และ FiChevronDown
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer"; 

const API_BASE_URL = "http://localhost:5000/api";

// --- ส่วนที่ 1: Navbar (แก้ไขเพิ่ม Dropdown และ Mobile Panel ให้สมบูรณ์) ---
function Navbar() {
  const [toggle, setToggle] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openAbout, setOpenAbout] = useState(false); // ✅ เพิ่ม State สำหรับ Dropdown เกี่ยวกับเรา

  const navigate = useNavigate();
  
  // ตรวจสอบสถานะบุคคลทั่วไป (ป้องกัน Admin มาโผล่ตาม Logic ที่แก้ไขก่อนหน้า)
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  const user = (userData && !userData.emp_id) ? userData : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pea-admin-token");
    localStorage.removeItem("pea-admin-user");
    navigate("/");
    window.location.reload(); 
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

          {/* Desktop Menu พร้อม Dropdown เกี่ยวกับหน่วยงาน */}
          <div className="hidden md:flex items-center gap-10 font-bold">
            <Link to="/" className="nav-link text-gray-700 hover:text-[#74045F]">หน้าแรก</Link>
            
            {/* ✅ เริ่มส่วน Dropdown เกี่ยวกับหน่วยงาน (Desktop) */}
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setOpenAbout(true)}
              onMouseLeave={() => setOpenAbout(false)}
            >
              <button className="flex items-center gap-1 text-gray-700 group-hover:text-[#74045F] transition-colors outline-none">
                เกี่ยวกับหน่วยงาน <FiChevronDown className={`transition-transform duration-200 ${openAbout ? 'rotate-180' : ''}`} />
              </button>
              
              {openAbout && (
                <div className="absolute left-0 mt-0 w-56 bg-white shadow-xl border border-gray-100 rounded-xl py-3 animate-in fade-in zoom-in-95 duration-200 text-left">
                  <Link to="#" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-[#74045F] transition-all">ประวัติหน่วยงาน</Link>
                  <Link to="#" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-[#74045F] transition-all">โครงสร้างองค์กร</Link>
                  <Link to="#" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-[#74045F] transition-all">วิสัยทัศน์ / พันธกิจ</Link>
                </div>
              )}
            </div>

            <Link to="#" className="nav-link text-gray-700 hover:text-[#74045F]">การบริหารงาน</Link>
            <Link to="#" className="nav-link text-gray-700 hover:text-[#74045F]">ติดต่อเรา</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/loginchoice" className="text-[#74045F] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#F3E8FF]">เข้าสู่ระบบ</Link>
                <Link to="/register" className="bg-[#00D0FF] hover:bg-[#00B2D8] text-white text-sm font-semibold px-5 py-2 rounded-md shadow-sm">สมัครสมาชิก</Link>
              </>
            ) : (
              <div className="relative text-left">
                <button onClick={() => setOpenProfile(!openProfile)} className="flex items-center gap-2 outline-none">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border border-purple-200">
                    {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <FiUser className="text-[#74045F] text-xl" />}
                  </div>
                  <span className="text-sm font-bold text-gray-700">{user.firstName}</span>
                </button>
                {openProfile && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-in fade-in zoom-in duration-150">
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
          
          <button onClick={() => setToggle(!toggle)} className="md:hidden text-[#74045F] text-2xl outline-none active:scale-90 transition-transform">
            {toggle ? <FiX className="animate-in spin-in-90 duration-300" /> : <FaBars className="animate-in fade-in duration-300" />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Menu Panel พร้อม Accordion สำหรับเกี่ยวกับหน่วยงาน */}
      {toggle && (
        <div className="md:hidden bg-white border-t border-gray-100 py-6 px-6 space-y-5 shadow-inner animate-in fade-in zoom-in-95 duration-300 origin-top text-left">
          <Link to="/" className="block font-bold text-gray-700 hover:text-[#74045F] transition-colors" onClick={() => setToggle(false)}>หน้าแรก</Link>
          
          {/* ✅ เกี่ยวกับหน่วยงานใน Mobile (Accordion Style) */}
          <div className="space-y-3">
            <button 
              onClick={() => setOpenAbout(!openAbout)}
              className="flex items-center justify-between w-full font-bold text-gray-700 hover:text-[#74045F] outline-none"
            >
              เกี่ยวกับหน่วยงาน <FiChevronDown className={`transition-transform duration-200 ${openAbout ? 'rotate-180' : ''}`} />
            </button>
            {openAbout && (
              <div className="pl-4 space-y-3 border-l-2 border-purple-100 animate-in slide-in-from-left-2 duration-200">
                <Link to="#" className="block text-sm text-gray-500 font-bold" onClick={() => setToggle(false)}>ประวัติหน่วยงาน</Link>
                <Link to="#" className="block text-sm text-gray-500 font-bold" onClick={() => setToggle(false)}>โครงสร้างองค์กร</Link>
                <Link to="#" className="block text-sm text-gray-500 font-bold" onClick={() => setToggle(false)}>วิสัยทัศน์ / พันธกิจ</Link>
              </div>
            )}
          </div>

          <Link to="#" className="block font-bold text-gray-700 hover:text-[#74045F] transition-colors" onClick={() => setToggle(false)}>การบริหารงาน</Link>
          <Link to="#" className="block font-bold text-gray-700 hover:text-[#74045F] transition-colors" onClick={() => setToggle(false)}>ติดต่อเรา</Link>
          
          <div className="pt-4 border-t border-gray-50 space-y-4">
            {!user ? (
              <>
                <Link to="/loginchoice" className="block text-[#74045F] font-black text-center py-2 rounded-lg bg-[#F3E8FF] active:scale-95 transition-transform" onClick={() => setToggle(false)}>เข้าสู่ระบบ</Link>
                <Link to="/register" className="block bg-[#00D0FF] text-white text-center py-3 rounded-lg font-black shadow-md active:scale-95 transition-transform" onClick={() => setToggle(false)}>สมัครสมาชิก</Link>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-200">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <FiUser className="m-auto mt-2 text-[#74045F]"/>}
                  </div>
                  <span className="font-bold text-[#74045F]">{user.firstName}</span>
                </div>
                <button onClick={() => { setToggle(false); navigate("/publicprofileedit"); }} className="w-full text-left font-bold text-gray-600 flex items-center gap-2 hover:text-[#74045F] transition-colors"><FiEdit /> แก้ไขโปรไฟล์</button>
                <button onClick={logout} className="w-full text-left font-bold text-red-600 flex items-center gap-2 hover:bg-red-50 p-2 rounded-lg transition-all"><FiLogOut /> ออกจากระบบ</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// --- ส่วนที่ 2: หน้าหลักการค้นหาเอกสาร ---
function SearchDocumentsPage1() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvance, setShowAdvance] = useState(false);
  const [documents, setDocuments] = useState([]); 
  const [departments, setDepartments] = useState([]); 
  const [selectedYear, setSelectedYear] = useState("ทั้งหมด");
  const [selectedDept, setSelectedDept] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); 
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const initDeptData = async () => {
      try {
        const resDept = await axios.get(`${API_BASE_URL}/departments`);
        if (resDept.data) {
          setDepartments(resDept.data.map(d => d.dept_name));
        }
      } catch (err) {
        console.error("Fetch departments error:", err);
      }
    };
    initDeptData();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setHasSearched(true); 
    try {
      const response = await axios.get(`${API_BASE_URL}/public/documents/regulations`, {
        params: {
          query: searchQuery,
          year: selectedYear === "ทั้งหมด" ? "" : selectedYear,
          dept: selectedDept === "ทั้งหมด" ? "" : selectedDept
        }
      });
      
      const mappedDocs = response.data.map(d => ({
        id: d.doc_id,
        name: d.doc_name,
        category: d.cat_name || "กฎระเบียบ นโยบาย และข้อบังคับ",
        date: d.created_at ? new Date(d.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : "ไม่ระบุ",
        size: d.file_size || "N/A", 
        requireLogin: d.require_login === 1 || d.require_login === true || d.access_level === "private",
        dept: d.dept_name || d.dept || "ไม่ระบุแผนก", 
        year: d.fiscal_year ? (parseInt(d.fiscal_year) > 2500 ? d.fiscal_year : parseInt(d.fiscal_year) + 543).toString() : "ไม่ระบุ",
        url: d.file_path ? `http://localhost:5000${d.file_path}` : d.file_url
      }));
      
      setDocuments(mappedDocs);
    } catch (err) {
      console.error("Fetch documents error:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = (doc) => {
    if (doc.requireLogin && !user) {
      alert("🔒 เอกสารนี้จำกัดสิทธิ์เฉพาะสมาชิกเท่านั้น\nกรุณาเข้าสู่ระบบเพื่อเข้าถึงเอกสารนี้");
      navigate("/loginchoice");
    } else {
      const fileName = encodeURIComponent(`${doc.name}.pdf`);
      const fileUrl = `http://localhost:5000/files/${fileName}`;
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-left flex flex-col">
      <Navbar />
      <header className="bg-[#00BEEA] py-16 px-4 border-b-4 border-[#00BEEA]">
        <div className="container mx-auto max-w-[1200px] text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase tracking-wide text-center">ค้นหาเอกสารกฎระเบียบ นโยบาย และข้อบังคับ</h2>
          <p className="text-white opacity-90 text-sm md:text-base font-bold text-center">ระบบทะเบียนและคลังเอกสารดิจิทัลส่วนกลาง การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2</p>
        </div>
      </header>

      <main className="container mx-auto max-w-[950px] px-4 -mt-12 pb-24 text-left flex-grow">
        {/* ค้นหา Card */}
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100 text-left relative">
          
          <button 
            onClick={() => navigate("/")} 
            className="absolute left-6 top-6 flex items-center gap-2 text-gray-500 hover:text-[#00BEEA] transition-colors duration-200 font-semibold text-sm group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            กลับหน้าแรก
          </button>

          <form className="space-y-8 text-left mt-8 text-left" onSubmit={handleSearch}>
            <div className="text-left">
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left">ค้นหารายชื่อเอกสาร</label>
              <input
                type="text"
                placeholder="พิมพ์ชื่อเอกสารเพื่อเริ่มการค้นหา..."
                className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#00BEEA]/10 focus:border-[#00BEEA] font-bold text-gray-700 transition-all text-left"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="text-left">
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left text-left">ปี พ.ศ.</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-[#F8FAFC] font-bold text-gray-600 outline-none cursor-pointer focus:border-[#00BEEA] text-left"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  <option value="2568">2568</option>
                  <option value="2567">2567</option>
                  <option value="2566">2566</option>
                </select>
              </div>
              <div className="text-left text-left">
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-left text-left">แผนก</label>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-[#F8FAFC] font-bold text-gray-600 outline-none cursor-pointer focus:border-[#00BEEA] text-left"
                >
                  <option value="ทั้งหมด">ทั้งหมด</option>
                  {departments.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="button" onClick={() => setShowAdvance(!showAdvance)} className="flex items-center gap-2 text-sm font-bold text-[#00BEEA] hover:text-[#0099CC] transition-colors text-left text-left">
              <FiChevronDown className={`transition-transform duration-300 ${showAdvance ? 'rotate-180' : ''}`} />
              แสดง/ซ่อน ตัวเลือกการค้นหาเพิ่มเติม
            </button>
            <button type="submit" className="w-full bg-[#004B8D] text-white py-4.5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#003366] transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98] text-center text-center">
              {loading ? "กำลังค้นหา..." : <><FiSearch size={22} /> ค้นหาเอกสารตอนนี้</>}
            </button>
          </form>
        </div>

        <section className="mt-12 text-left">
          {hasSearched ? (
            documents.length > 0 ? (
              <div className="results-container text-left text-left">
                <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] mb-8 border-l-4 border-[#00BEEA] pl-4 text-left">รายการเอกสารที่เกี่ยวข้อง ({documents.length})</p>
                <div className="space-y-5 text-left text-left text-left">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md hover:shadow-xl hover:border-[#00BEEA] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group text-left">
                      <div className="flex items-center gap-5 flex-1 cursor-pointer text-left text-left" onClick={() => handleAccess(doc)}>
                        <div className="w-16 h-16 bg-[#F0F9FF] text-[#00BEEA] rounded-2xl flex items-center justify-center text-3xl group-hover:bg-[#00BEEA] group-hover:text-white transition-all duration-300">
                          {doc.requireLogin && !user ? <FiLock /> : <FiFileText />}
                        </div>
                        <div className="text-left text-left text-left text-left">
                          <h4 className="font-black text-gray-800 text-lg group-hover:text-[#00BEEA] transition-colors flex items-center gap-2 text-left text-left">
                            {doc.name}
                            {doc.requireLogin && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"><FiLock size={10}/> จำกัดสิทธิ์สมาชิก</span>}
                          </h4>
                          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 text-[11px] font-black text-gray-400 uppercase tracking-widest text-left text-left">
                            <span className="text-[#00BEEA]">{doc.category}</span>
                            <span>• {doc.date}</span>
                            <span className="text-indigo-400">• {doc.dept}</span>
                            <span>• ปี {doc.year}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <button onClick={() => handleAccess(doc)} className="p-3 bg-gray-50 text-gray-400 hover:text-[#00BEEA] hover:bg-[#E0F2FE] rounded-xl transition-all" title="เปิดดูเอกสารฉบับจริง"><FiExternalLink size={24} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-blue-50/50 py-20 rounded-3xl border border-blue-100 text-center text-left text-center">
                <FiSearch className="text-6xl text-blue-200 mx-auto mb-4 text-center" />
                <p className="text-blue-400 font-bold uppercase tracking-widest italic text-center text-center">
                  {loading ? "กำลังโหลดข้อมูล..." : "ไม่พบเอกสารที่ค้นหา"}
                </p>
              </div>
            )
          ) : (
            <div className="bg-blue-50/50 py-20 rounded-3xl border border-blue-100 text-center text-left text-left text-center">
              <FiSearch className="text-6xl text-blue-200 mx-auto mb-4 text-center" />
              <p className="text-blue-400 font-bold uppercase tracking-widest italic text-center text-center">กรุณาระบุคำค้นหาหรือเลือกแผนก และกดปุ่มเพื่อเริ่มค้นหา</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SearchDocumentsPage1;