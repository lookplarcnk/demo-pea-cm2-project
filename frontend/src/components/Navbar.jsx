import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import Logo from "../assets/img/logo-pea.png";
import { FiUser, FiLogOut, FiEdit } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [toggle, setToggle] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const navigate = useNavigate();
  
  // ✅ แก้ไข: ปรับปรุงการดึงข้อมูลให้ยืดหยุ่นขึ้น เพื่อให้บุคคลทั่วไปมองเห็นโปรไฟล์ตัวเองได้แน่นอน
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  
  // ตรวจสอบว่าเป็นบุคคลทั่วไป (Public) หรือไม่ โดยเช็คจาก role 
  // หากล็อกอินเป็นบุคคลทั่วไป role มักจะเป็น 'public' หรือไม่มีบทบาทแบบพนักงาน (Officer/Admin)
  const isPublicUser = userData && (userData.role === "public" || (!userData.role && !userData.emp_id));
  
  // ให้ user มีค่าหากเป็นบุคคลทั่วไป เพื่อนำไปแสดงผลในหน้าแรกและหน้าค้นหาเอกสาร
  const user = isPublicUser ? userData : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // ล้างค่าของ Admin ด้วยเพื่อป้องกันการสลับบัญชีแล้วค้าง
    localStorage.removeItem("pea-admin-token");
    localStorage.removeItem("pea-admin-user");
    navigate("/");
    window.location.reload(); // บังคับรีเฟรชเพื่อให้สถานะ Navbar อัปเดตใหม่ทั้งหมด
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40 text-left">
      <div className="container mx-auto max-w-[1320px] px-4 md:px-6">
        <div className="flex items-center justify-between h-[85px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={Logo}
              alt="PEA Chiang Mai 2"
              className="h-14 md:h-16 object-contain"
            />
            <div className="leading-tight text-left">
              <p className="text-[#74045F] font-bold text-lg md:text-xl">
                การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2
              </p>
              <p className="text-[#74045F] text-xs md:text-sm opacity-80 -mt-1 font-medium">
                Provincial Electricity Authority Chiang Mai 2
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 font-bold">
            <Link to="/" className="nav-link text-gray-700 hover:text-[#74045F]">หน้าแรก</Link>
            <Link to="#" className="nav-link text-gray-700 hover:text-[#74045F]">เกี่ยวกับหน่วยงาน</Link>
            <Link to="#" className="nav-link text-gray-700 hover:text-[#74045F]">การบริหารงาน</Link>
            <Link to="#" className="nav-link text-gray-700 hover:text-[#74045F]">ติดต่อเรา</Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/loginchoice" className="text-[#74045F] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#F3E8FF]">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="bg-[#00D0FF] hover:bg-[#00B2D8] text-white text-sm font-semibold px-5 py-2 rounded-md shadow-sm">
                  สมัครสมาชิก
                </Link>
              </>
            ) : (
              <div className="relative text-left">
                <button onClick={() => setOpenProfile(!openProfile)} className="flex items-center gap-2 outline-none">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border border-purple-200">
                    {/* ✅ เพิ่มการตรวจสอบค่านัลที่ยืดหยุ่นขึ้น */}
                    {user.avatar && user.avatar !== "null" ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <FiUser className="text-[#74045F] text-xl" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {/* ✅ ดึงชื่อมาแสดงผล รองรับทั้งชื่อแรก หรือชื่อเต็ม */}
                    {user.firstName || user.name?.split(' ')[0] || "ผู้ใช้งาน"}
                  </span>
                </button>

                {openProfile && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-in fade-in zoom-in duration-150">
                    <button
                      onClick={() => {
                        setOpenProfile(false);
                        navigate("/publicprofileedit");
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiEdit /> แก้ไขโปรไฟล์
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FiLogOut /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile */}
          <button onClick={() => setToggle(!toggle)} className="md:hidden text-[#74045F] text-2xl">
            <FaBars />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;