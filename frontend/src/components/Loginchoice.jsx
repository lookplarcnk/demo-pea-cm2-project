import React from "react";
import userPublic from "../assets/img/user-public.png";
import userStaff from "../assets/img/user-staff.png";
import userAdmin from "../assets/img/user-admin.jpg";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi"; // นำเข้าไอคอนลูกศร

function Loginchoice() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C79AF7] via-[#E4D5FB] to-[#B4E3FF] flex items-center justify-center relative overflow-hidden">
      {/* ลายวงกลมด้านหลัง */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-10 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl px-4">
        {/* กล่องหลัก */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 px-6 py-8 md:px-10 md:py-10 relative">
          
          {/* ปุ่ม Back กลับหน้าแรก */}
          <Link 
            to="/" 
            className="absolute left-6 top-6 md:left-10 md:top-10 flex items-center gap-2 text-gray-500 hover:text-[#7C3AED] transition-colors duration-200 font-semibold text-sm group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            กลับหน้าแรก
          </Link>

          {/* Title */}
          <div className="text-center mb-8 mt-6 md:mt-0">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#3B0764] mb-2">
              เข้าสู่ระบบ
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              เลือกรูปแบบการเข้าสู่ระบบให้ตรงกับสถานะของคุณ
            </p>
          </div>

          {/* Cards */}
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8">

            {/* card 1 – บุคคลทั่วไป */}
            <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center py-6 px-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
              <div className="w-24 h-24 md:w-28 md:h-28 mb-4">
                <img
                  src={userPublic}
                  alt="บุคคลทั่วไป"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <p className="font-semibold text-[#1E293B] mb-2 text-center">
                สำหรับบุคคลทั่วไป
              </p>
              <p className="text-xs md:text-sm text-gray-500 text-center mb-5 px-2">
                ใช้สำหรับประชาชนทั่วไปที่ต้องการเข้าดูข้อมูลเอกสารที่เปิดเผย
              </p>

              <Link
                to="/loginpublic"
                className="mt-auto bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold py-2.5 px-6 rounded-full w-full max-w-[170px] text-sm shadow-md hover:shadow-lg transition-all duration-200 text-center"
              >
                เข้าสู่ระบบ
              </Link>
            </div>

            {/* card 2 – พนักงาน */}
            <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center py-6 px-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
              <div className="w-24 h-24 md:w-28 md:h-28 mb-4">
                <img
                  src={userStaff}
                  alt="พนักงาน"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <p className="font-semibold text-[#1E293B] mb-2 text-center">
                สำหรับพนักงาน
              </p>
              <p className="text-xs md:text-sm text-gray-500 text-center mb-5 px-2">
                สำหรับเจ้าหน้าที่และพนักงานภายในองค์กร เข้าถึงเอกสารภายในทั้งหมด
              </p>

              <Link
                to="/loginemployee"
                className="mt-auto bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white font-semibold py-2.5 px-6 rounded-full w-full max-w-[170px] text-sm shadow-md hover:shadow-lg transition-all duration-200 text-center"
              >
                เข้าสู่ระบบ
              </Link>
            </div>

            {/* card 3 – ผู้ดูแลระบบ */}
            <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center py-6 px-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
              <div className="w-24 h-24 md:w-28 md:h-28 mb-4">
                <img
                  src={userAdmin}
                  alt="ผู้ดูแลระบบ"
                  className="w-full h-full object-contain drop-shadow-md rounded-full"
                />
              </div>
              <p className="font-semibold text-[#1E293B] mb-2 text-center">
                สำหรับผู้ดูแลระบบ
              </p>
              <p className="text-xs md:text-sm text-gray-500 text-center mb-5 px-2">
                จัดการผู้ใช้ ระบบเอกสาร สิทธิ์การเข้าถึง และการตั้งค่าระบบทั้งหมด
              </p>

              <Link
                to="/loginadmin"
                className="mt-auto bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-semibold py-2.5 px-6 rounded-full w-full max-w-[170px] text-sm shadow-md hover:shadow-lg transition-all duration-200 text-center"
              >
                เข้าสู่ระบบ
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginchoice;