import React from 'react';
import icon01 from '../assets/img/icon-01.png';
import icon02 from '../assets/img/icon-02.png';
import icon03 from '../assets/img/icon-03.png';
import icon04 from '../assets/img/icon-04.png';

function Docscategories() {
  return (
    <section className="bg-gradient-to-b from-[#E6EAF0] to-[#F4F6FA] py-10 md:py-14">
      <div className="container mx-auto max-w-[1320px] px-4 text-center">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-[#6B7280] mb-2">
            DOCUMENT CATEGORIES
          </p>
          <h2 className="text-[1.9rem] md:text-[2.2rem] font-semibold text-[#111827]">
            หมวดหมู่เอกสาร
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#6B7280]">
            เลือกหมวดหมู่เพื่อค้นหาเอกสารที่ต้องการอย่างรวดเร็วและเป็นระบบ
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-6">
          {/* Card 1 */}
          <a
            href="/SearchDocumentsPage1" 
            className="group bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-[#74045F]/40 transition-all duration-200"
          >
            <div className="w-20 h-20 mb-4 rounded-full bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#E0E7FF] transition">
              <img
                className="w-12 h-12 object-contain"
                src={icon01}
                alt="กฏระเบียบ นโยบาย และข้อบังคับ"
              />
            </div>
            <h3 className="text-[1.25rem] md:text-[1.35rem] font-semibold text-[#111827] mb-2">
              กฏระเบียบ นโยบาย และข้อบังคับ
            </h3>
            <p className="text-sm md:text-[0.95rem] text-[#4B5563] leading-relaxed">
              ค้นหา กฏระเบียบ นโยบาย และข้อบังคับ
              <br className="hidden md:block" />
              ที่เกี่ยวข้องกับการดำเนินงานภายในหน่วยงาน
            </p>
          </a>

          {/* Card 2 */}
          <a
            href="/SearchDocumentsPage2" 
            className="group bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-[#74045F]/40 transition-all duration-200"
          >
            <div className="w-20 h-20 mb-4 rounded-full bg-[#ECFEFF] flex items-center justify-center group-hover:bg-[#CFFAFE] transition">
              <img
                className="w-12 h-12 object-contain"
                src={icon02}
                alt="คู่มือและ SOP"
              />
            </div>
            <h3 className="text-[1.25rem] md:text-[1.35rem] font-semibold text-[#111827] mb-2">
              คู่มือและ SOP
            </h3>
            <p className="text-sm md:text-[0.95rem] text-[#4B5563] leading-relaxed">
              ค้นหาคู่มือการปฏิบัติงานและ SOP
              <br className="hidden md:block" />
              ของแต่ละแผนกภายในหน่วยงาน
            </p>
          </a>

          {/* Card 3 */}
          <a
            href="/SearchDocumentsPage3" 
            className="group bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-[#74045F]/40 transition-all duration-200"
          >
            <div className="w-20 h-20 mb-4 rounded-full bg-[#FEF3C7] flex items-center justify-center group-hover:bg-[#FDE68A] transition">
              <img
                className="w-12 h-12 object-contain"
                src={icon03}
                alt="เอกสารแบบฟอร์ม"
              />
            </div>
            <h3 className="text-[1.25rem] md:text-[1.35rem] font-semibold text-[#111827] mb-2">
              เอกสารแบบฟอร์ม
            </h3>
            <p className="text-sm md:text-[0.95rem] text-[#4B5563] leading-relaxed">
              ค้นหาและดาวน์โหลดแบบฟอร์มมาตรฐาน
              <br className="hidden md:block" />
              สำหรับงานด้านต่าง ๆ ของหน่วยงาน
            </p>
          </a>

          {/* Card 4 */}
          <a
            href="/SearchDocumentsPage4" 
            className="group bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-[#74045F]/40 transition-all duration-200"
          >
            <div className="w-20 h-20 mb-4 rounded-full bg-[#E0F2FE] flex items-center justify-center group-hover:bg-[#BFDBFE] transition">
              <img
                className="w-12 h-12 object-contain"
                src={icon03}
                alt="เอกสารการจัดซื้อจัดจ้าง"
              />
            </div>
            <h3 className="text-[1.25rem] md:text-[1.35rem] font-semibold text-[#111827] mb-2">
              เอกสารการจัดซื้อจัดจ้าง
            </h3>
            <p className="text-sm md:text-[0.95rem] text-[#4B5563] leading-relaxed">
              เอกสารที่เกี่ยวข้องกับการจัดซื้อจัดจ้าง
              <br className="hidden md:block" />
              แยกตามประเภทและแผนกที่รับผิดชอบ
            </p>
          </a>

          {/* Card 5 */}
          <a
            href="/SearchDocumentsPage5" 
            className="group bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-[#74045F]/40 transition-all duration-200"
          >
            <div className="w-20 h-20 mb-4 rounded-full bg-[#FCE7F3] flex items-center justify-center group-hover:bg-[#F9A8D4] transition">
              <img
                className="w-12 h-12 object-contain"
                src={icon03}
                alt="เอกสารรายงานประจำปี"
              />
            </div>
            <h3 className="text-[1.25rem] md:text-[1.35rem] font-semibold text-[#111827] mb-2">
              เอกสารรายงานประจำปี
            </h3>
            <p className="text-sm md:text-[0.95rem] text-[#4B5563] leading-relaxed">
              รวบรวมรายงานประจำปี
              <br className="hidden md:block" />
              ของหน่วยงานและแผนกต่าง ๆ
            </p>
          </a>

          {/* Card 6 */}
          <a
            href="/SearchDocumentsPage6" 
            className="group bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-[#74045F]/40 transition-all duration-200"
          >
            <div className="w-20 h-20 mb-4 rounded-full bg-[#E5E7EB] flex items-center justify-center group-hover:bg-[#D1D5DB] transition">
              <img
                className="w-12 h-12 object-contain"
                src={icon04}
                alt="คำสั่งและประกาศ"
              />
            </div>
            <h3 className="text-[1.25rem] md:text-[1.35rem] font-semibold text-[#111827] mb-2">
              คำสั่งและประกาศ
            </h3>
            <p className="text-sm md:text-[0.95rem] text-[#4B5563] leading-relaxed">
              ค้นหาคำสั่ง ภายใน และประกาศต่าง ๆ
              <br className="hidden md:block" />
              ที่เผยแพร่ให้บุคลากรรับทราบ
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Docscategories;