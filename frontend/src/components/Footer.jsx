import React from "react";
import { Link } from "react-router-dom"; // เพิ่มการ import Link

function Footer() {
  return (
    <footer className="mt-12">
      {/* ส่วนบน : 3 คอลัมน์ */}
      <div className="bg-[#F7F7FB] border-t border-[#E3E3EC] py-12">
        <div className="container mx-auto max-w-[1120px] px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
            {/* คอลัมน์ 1 – เกี่ยวกับหน่วยงาน */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-[#111827] mb-4 tracking-tight">
                เกี่ยวกับหน่วยงาน
              </h3>
              <ul className="space-y-1.5 text-[#8A0F7C] text-sm md:text-base leading-relaxed">
                <li>
                  <a href="#" className="hover:text-[#5E0856] hover:underline transition">
                    ประวัติหน่วยงาน
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#5E0856] hover:underline transition">
                    โครงสร้างองค์กร
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#5E0856] hover:underline transition">
                    วิสัยทัศน์ / พันธกิจ
                  </a>
                </li>
              </ul>
            </div>

            {/* คอลัมน์ 2 – ลิ้งก์ด่วน (ใส่ลิ้งก์ไปยังหน้า SearchDocumentsPage 1-6) */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-[#111827] mb-4 tracking-tight">
                ลิ้งก์ด่วน
              </h3>
              <ul className="space-y-1.5 text-[#8A0F7C] text-sm md:text-base leading-relaxed">
                <li>
                  <Link to="/SearchDocumentsPage1" className="hover:text-[#5E0856] hover:underline transition">
                    กฏระเบียบ นโยบาย และข้อบังคับ
                  </Link>
                </li>
                <li>
                  <Link to="/SearchDocumentsPage2" className="hover:text-[#5E0856] hover:underline transition">
                    คู่มือและ SOP
                  </Link>
                </li>
                <li>
                  <Link to="/SearchDocumentsPage3" className="hover:text-[#5E0856] hover:underline transition">
                    เอกสารแบบฟอร์ม
                  </Link>
                </li>
                <li>
                  <Link to="/SearchDocumentsPage4" className="hover:text-[#5E0856] hover:underline transition">
                    เอกสารการจัดซื้อจัดจ้าง
                  </Link>
                </li>
                <li>
                  <Link to="/SearchDocumentsPage5" className="hover:text-[#5E0856] hover:underline transition">
                    เอกสารรายงานประจำปี
                  </Link>
                </li>
                <li>
                  <Link to="/SearchDocumentsPage6" className="hover:text-[#5E0856] hover:underline transition">
                    คำสั่งและประกาศ
                  </Link>
                </li>
              </ul>
            </div>

            {/* คอลัมน์ 3 – แผนก */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-[#111827] mb-4 tracking-tight">
                แผนก
              </h3>
              <ul className="space-y-1.5 text-[#8A0F7C] text-sm md:text-base leading-relaxed">
                <li>
                  <a href="#" className="hover:text-[#5E0856] hover:underline transition">
                    กองบริหาร
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#5E0856] hover:underline transition">
                    แผนกสนับสนุน
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#5E0856] hover:underline transition">
                    แผนกมิเตอร์หม้อแปลง
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#5E0856] hover:underline transition">
                    แผนกบริการลูกค้าสัมพันธ์
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#5E0856] hover:underline transition">
                    แผนกปฏิบัติการ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#5E0856] hover:underline transition">
                    แผนกก่อสร้างระบบไฟฟ้า
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* แถบล่าง : Powered by */}
      <div className="bg-[#00CFFE] py-3 shadow-inner">
        <p className="text-center text-xs md:text-sm lg:text-base font-semibold text-[#00131A] tracking-wide">
          Powered by Ratchaneekorn Chuadee
        </p>
      </div>
    </footer>
  );
}

export default Footer;