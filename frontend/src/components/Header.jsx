import React from 'react';
import HeaderImg from '../assets/img/header-img.png';
import { Link } from "react-router-dom";

function Header() {
  return (
    <div className="bg-gradient-to-r from-[#00BEEA] to-[#00D0FF] h-auto md:h-[34rem] flex items-center">
      <div className="container mx-auto max-w-[1320px] p-8 md:p-0 flex flex-col md:flex-row md:justify-between md:items-center gap-10">

        {/* Text Section - Right Aligned */}
        <div className="md:w-1/2 text-center md:text-right">
          
          {/* หัวเรื่องใหญ่ (ให้ขึ้นบรรทัดเดียว) */}
          <h1 className="text-[1.4rem] sm:text-[1.8rem] md:text-[2.2rem] lg:text-[2.3rem] font-bold leading-snug text-white drop-shadow-sm whitespace-nowrap">
            ระบบรวบรวมกฏระเบียบและเอกสารภายใน
          </h1>

          {/* บรรทัดที่สอง */}
          <h1 className="text-[1.4rem] sm:text-[1.8rem] md:text-[2.2rem] lg:text-[2.3rem] font-bold leading-snug text-white drop-shadow-sm mt-1">
            การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2
          </h1>

          {/* คำอธิบาย */}
          <p className="text-[1rem] md:text-[1.15rem] text-white mt-4 opacity-90 leading-relaxed">
            แพลตฟอร์มสำหรับค้นหา จัดเก็บ และบริหารจัดการเอกสารภายในองค์กร
          </p>

          {/* ปุ่ม */}
          <div className="mt-8 flex md:justify-end justify-center">
            <Link
              className="py-3 px-7 bg-white text-[#003A59] rounded-lg font-semibold text-[1rem]
                         shadow-md hover:shadow-xl hover:bg-gray-100 transition-all duration-300"
              to="/Register"
            >
              เริ่มต้นการใช้งาน
            </Link>
          </div>
        </div>

        {/* Image Section */}
        <div className="md:w-1/2 flex justify-center md:justify-start">
          <img
            src={HeaderImg}
            alt=""
            className="w-[260px] sm:w-[350px] md:w-[440px] lg:w-[520px] h-auto animate-floating"
          />
        </div>

      </div>

      {/* Floating Animation */}
      <style>{`
        @keyframes floating {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        .animate-floating {
          animation: floating 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Header;