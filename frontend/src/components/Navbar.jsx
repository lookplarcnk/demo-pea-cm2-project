import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import Logo from "../assets/img/logo-pea.png";
import { FiUser, FiLogOut, FiEdit, FiX, FiChevronDown } from "react-icons/fi"; 
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [toggle, setToggle] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openAbout, setOpenAbout] = useState(false); 

  const navigate = useNavigate();
  
  // ✅ แก้ไข: บังคับเช็คเฉพาะข้อมูลบุคคลทั่วไป และกรองข้อมูลแอดมินทิ้งทันที
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  const adminData = JSON.parse(localStorage.getItem("pea-admin-user") || "null");
  
  // เงื่อนไขเด็ดขาด: 
  // 1. ต้องมีข้อมูลใน userData
  // 2. ต้องไม่มี emp_id (เพราะบุคคลทั่วไปไม่มีรหัสพนักงาน)
  // 3. role ต้องไม่ใช่ admin
  // 4. ต้องไม่มีข้อมูลใน pea-admin-user ซ้อนขึ้นมา
  const user = (userData && !userData.emp_id && userData.role !== 'admin' && !adminData) ? userData : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // ล้างเฉพาะส่วนของบุคคลทั่วไป แต่อย่าลืมเช็คหน้า Login ว่าเขียนค่า 'user' ทับ Admin หรือไม่
    navigate("/");
    window.location.reload(); 
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40 text-left">
      <div className="container mx-auto max-w-[1320px] px-4 md:px-6 text-left">
        <div className="flex items-center justify-between h-[85px] text-left">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-left">
            <img src={Logo} alt="PEA Chiang Mai 2" className="h-14 md:h-16 object-contain" />
            <div className="leading-tight text-left">
              <p className="text-[#74045F] font-bold text-lg md:text-xl text-left">การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2</p>
              <p className="text-[#74045F] text-xs md:text-sm opacity-80 -mt-1 font-medium text-left">Provincial Electricity Authority Chiang Mai 2</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 font-bold text-left">
            <Link to="/" className="nav-link text-gray-700 hover:text-[#74045F] text-left">หน้าแรก</Link>
            
            <div 
              className="relative group cursor-pointer text-left"
              onMouseEnter={() => setOpenAbout(true)}
              onMouseLeave={() => setOpenAbout(false)}
            >
              <button className="flex items-center gap-1 text-gray-700 group-hover:text-[#74045F] transition-colors outline-none text-left">
                เกี่ยวกับหน่วยงาน <FiChevronDown className={`transition-transform duration-200 ${openAbout ? 'rotate-180' : ''}`} />
              </button>
              
              {openAbout && (
                <div className="absolute left-0 mt-0 w-56 bg-white shadow-xl border border-gray-100 rounded-xl py-3 animate-in fade-in zoom-in-95 duration-200 text-left">
                  <Link to="#" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-[#74045F] transition-all text-left">ประวัติหน่วยงาน</Link>
                  <Link to="#" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-[#74045F] transition-all text-left">โครงสร้างองค์กร</Link>
                  <Link to="#" className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-[#74045F] transition-all text-left">วิสัยทัศน์ / พันธกิจ</Link>
                </div>
              )}
            </div>

            <Link to="#" className="nav-link text-gray-700 hover:text-[#74045F] text-left">การบริหารงาน</Link>
            <Link to="#" className="nav-link text-gray-700 hover:text-[#74045F] text-left">ติดต่อเรา</Link>
          </div>

          {/* Right Side (Desktop) */}
          <div className="hidden md:flex items-center gap-4 text-left">
            {!user ? (
              <>
                <Link to="/loginchoice" className="text-[#74045F] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#F3E8FF] text-left">เข้าสู่ระบบ</Link>
                <Link to="/register" className="bg-[#00D0FF] hover:bg-[#00B2D8] text-white text-sm font-semibold px-5 py-2 rounded-md shadow-sm text-left">สมัครสมาชิก</Link>
              </>
            ) : (
              <div className="relative text-left">
                <button onClick={() => setOpenProfile(!openProfile)} className="flex items-center gap-2 outline-none text-left">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border border-purple-200 text-left">
                    {user.avatar && user.avatar !== "null" ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                    ) : (
                      <FiUser className="text-[#74045F] text-xl" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-700 text-left">{user.firstName || "ผู้ใช้งาน"}</span>
                </button>

                {openProfile && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-in fade-in zoom-in duration-150 text-left">
                    <button onClick={() => { setOpenProfile(false); navigate("/publicprofileedit"); }} className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-left"><FiEdit /> แก้ไขโปรไฟล์</button>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 text-left"><FiLogOut /> ออกจากระบบ</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button onClick={() => setToggle(!toggle)} className="md:hidden text-[#74045F] text-2xl outline-none active:scale-90 transition-transform text-left">
            {toggle ? <FiX className="animate-in spin-in-90 duration-300" /> : <FaBars className="animate-in fade-in duration-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {toggle && (
        <div className="md:hidden bg-white border-t border-gray-100 py-6 px-6 space-y-5 shadow-inner animate-in fade-in zoom-in-95 duration-300 origin-top text-left">
          <Link to="/" className="block font-bold text-gray-700 hover:text-[#74045F] transition-colors text-left" onClick={() => setToggle(false)}>หน้าแรก</Link>
          
          <div className="space-y-3 text-left">
            <button 
              onClick={() => setOpenAbout(!openAbout)}
              className="flex items-center justify-between w-full font-bold text-gray-700 hover:text-[#74045F] text-left"
            >
              เกี่ยวกับหน่วยงาน <FiChevronDown className={`transition-transform ${openAbout ? 'rotate-180' : ''}`} />
            </button>
            {openAbout && (
              <div className="pl-4 space-y-3 border-l-2 border-purple-100 animate-in slide-in-from-left-2 duration-200 text-left">
                <Link to="#" className="block text-sm text-gray-500 font-bold text-left" onClick={() => setToggle(false)}>ประวัติหน่วยงาน</Link>
                <Link to="#" className="block text-sm text-gray-500 font-bold text-left" onClick={() => setToggle(false)}>โครงสร้างองค์กร</Link>
                <Link to="#" className="block text-sm text-gray-500 font-bold text-left" onClick={() => setToggle(false)}>วิสัยทัศน์ / พันธกิจ</Link>
              </div>
            )}
          </div>

          <Link to="#" className="block font-bold text-gray-700 hover:text-[#74045F] transition-colors text-left" onClick={() => setToggle(false)}>การบริหารงาน</Link>
          <Link to="#" className="block font-bold text-gray-700 hover:text-[#74045F] transition-colors text-left" onClick={() => setToggle(false)}>ติดต่อเรา</Link>
          
          <div className="pt-4 border-t border-gray-50 space-y-4 text-left">
            {!user ? (
              <div className="space-y-4 text-left">
                <Link to="/loginchoice" className="block text-[#74045F] font-black text-center py-2 rounded-lg bg-[#F3E8FF] active:scale-95 transition-transform text-center" onClick={() => setToggle(false)}>เข้าสู่ระบบ</Link>
                <Link to="/register" className="block bg-[#00D0FF] text-white text-center py-3 rounded-lg font-black shadow-md active:scale-95 transition-transform text-center" onClick={() => setToggle(false)}>สมัครสมาชิก</Link>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl text-left">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-200 text-left">
                    {user.avatar && user.avatar !== "null" ? <img src={user.avatar} className="w-full h-full object-cover" /> : <FiUser className="m-auto mt-2 text-[#74045F] text-left"/>}
                  </div>
                  <span className="font-bold text-[#74045F] text-left">{user.firstName || user.name}</span>
                </div>
                <button onClick={() => { setToggle(false); navigate("/publicprofileedit"); }} className="w-full text-left font-bold text-gray-600 flex items-center gap-2 hover:text-[#74045F] transition-colors text-left"><FiEdit /> แก้ไขโปรไฟล์</button>
                <button onClick={logout} className="w-full text-left font-bold text-red-600 flex items-center gap-2 hover:bg-red-50 p-2 rounded-lg transition-all text-left"><FiLogOut /> ออกจากระบบ</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;