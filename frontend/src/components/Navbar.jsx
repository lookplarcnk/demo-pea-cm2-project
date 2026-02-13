import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import Logo from "../assets/img/logo-pea.png";
import { FiUser, FiLogOut, FiEdit } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

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
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto max-w-[1320px] px-4 md:px-6">
        <div className="flex items-center justify-between h-[85px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={Logo}
              alt="PEA Chiang Mai 2"
              className="h-14 md:h-16 object-contain"
            />
            <div className="leading-tight">
              <p className="text-[#74045F] font-bold text-lg md:text-xl">
                การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2
              </p>
              <p className="text-[#74045F] text-xs md:text-sm opacity-80 -mt-1">
                Provincial Electricity Authority Chiang Mai 2
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="nav-link">หน้าแรก</Link>
            <Link to="#" className="nav-link">เกี่ยวกับหน่วยงาน</Link>
            <Link to="#" className="nav-link">การบริหารงาน</Link>
            <Link to="#" className="nav-link">ติดต่อเรา</Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/loginchoice" className="text-[#74045F] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#F3E8FF]">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="bg-[#00D0FF] hover:bg-[#00B2D8] text-white text-sm font-semibold px-5 py-2 rounded-md">
                  สมัครสมาชิก
                </Link>
              </>
            ) : (
              <div className="relative">
                <button onClick={() => setOpenProfile(!openProfile)} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <FiUser className="text-purple-700 text-xl" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName}
                  </span>
                </button>

                {openProfile && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200">
                    <button
                      onClick={() => {
                        setOpenProfile(false);
                        navigate("/publicprofileedit");
                      }}
                      className="dropdown-item"
                    >
                      <FiEdit /> แก้ไขโปรไฟล์
                    </button>
                    <button
                      onClick={logout}
                      className="dropdown-item text-red-600 hover:bg-red-50"
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
