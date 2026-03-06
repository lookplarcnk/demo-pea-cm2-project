import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";

function Footer() {
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <footer className="mt-12 text-left font-sans">
      <div className="bg-[#F7F7FB] border-t border-[#E3E3EC] py-12 text-left">
        <div className="container mx-auto max-w-[1320px] px-6 text-left">
          {/* แบ่งเป็น 4 คอลัมน์ ตัวหนังสือปกติไม่หนา */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center md:text-left">
            
            {/* คอลัมน์ 1 – เกี่ยวกับหน่วยงาน */}
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#111827] mb-4 tracking-tight">
                เกี่ยวกับหน่วยงาน
              </h3>
              <ul className="space-y-1.5 text-[#8A0F7C] text-sm md:text-base leading-relaxed mb-6">
                <li>
                  <Link to="/AboutPage" className="hover:text-[#5E0856] hover:underline transition">
                    ประวัติหน่วยงาน
                  </Link>
                </li>
                <li>
                  <Link to="/OrgStructure" className="hover:text-[#5E0856] hover:underline transition">
                    โครงสร้างองค์กร
                  </Link>
                </li>
                <li>
                  <Link to="/VisionMission" className="hover:text-[#5E0856] hover:underline transition">
                    วิสัยทัศน์ / พันธกิจ
                  </Link>
                </li>
              </ul>
            </div>

            {/* คอลัมน์ 2 – ลิ้งก์ด่วน */}
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#111827] mb-4 tracking-tight">
                ลิ้งก์ด่วน
              </h3>
              <ul className="space-y-1.5 text-[#8A0F7C] text-sm md:text-base leading-relaxed">
                <li><Link to="/SearchDocumentsPage1" className="hover:text-[#5E0856] hover:underline transition">กฏระเบียบ นโยบาย และข้อบังคับ</Link></li>
                <li><Link to="/SearchDocumentsPage2" className="hover:text-[#5E0856] hover:underline transition">คู่มือและ SOP</Link></li>
                <li><Link to="/SearchDocumentsPage3" className="hover:text-[#5E0856] hover:underline transition">เอกสารแบบฟอร์ม</Link></li>
                <li><Link to="/SearchDocumentsPage4" className="hover:text-[#5E0856] hover:underline transition">เอกสารการจัดซื้อจัดจ้าง</Link></li>
                <li><Link to="/SearchDocumentsPage5" className="hover:text-[#5E0856] hover:underline transition">เอกสารรายงานประจำปี</Link></li>
                <li><Link to="/SearchDocumentsPage6" className="hover:text-[#5E0856] hover:underline transition">คำสั่งและประกาศ</Link></li>
              </ul>
            </div>

            {/* คอลัมน์ 3 – แผนก */}
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#111827] mb-4 tracking-tight">
                แผนก
              </h3>
              <ul className="space-y-1.5 text-[#8A0F7C] text-sm md:text-base leading-relaxed">
                <li><Link to="/AdminDivision" className="hover:text-[#5E0856] hover:underline transition">กองบริหาร</Link></li>
                <li><Link to="/SupportDepartment" className="hover:text-[#5E0856] hover:underline transition">แผนกสนับสนุน</Link></li>
                <li><Link to="/MeterTransformerDept" className="hover:text-[#5E0856] hover:underline transition">แผนกมิเตอร์หม้อแปลง</Link></li>
                <li><Link to="/CustomerServiceDept" className="hover:text-[#5E0856] hover:underline transition">แผนกบริการลูกค้าสัมพันธ์</Link></li>
                <li><Link to="/OperationsDept" className="hover:text-[#5E0856] hover:underline transition">แผนกปฏิบัติการ</Link></li>
                <li><Link to="/ConstructionDept" className="hover:text-[#5E0856] hover:underline transition">แผนกก่อสร้างระบบไฟฟ้า</Link></li>
              </ul>
            </div>

            {/* คอลัมน์ 4 – Facebook Page Plugin อยู่ขวาสุดตามเดิม */}
            <div className="flex flex-col items-center md:items-start lg:items-end text-left">
              <h3 className="text-lg font-semibold text-[#111827] mb-4 tracking-tight w-full lg:text-left">
                Facebook Fanpage
              </h3>
              <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-block overflow-hidden transition-transform hover:scale-[1.01]">
                <iframe 
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F%25E0%25B8%2581%25E0%25B8%25B2%25E0%25B8%25A3%25E0%25B9%2584%25E0%25B8%259F%25E0%25B8%259F%25E0%25B9%2589%25E0%25B8%25AA%25E0%25B9%2588%25E0%25B8%25A1%25E0%25B8%2599%25E0%25B8%25A0%25E0%25B8%25B9%25E0%25B8%25A1%25E0%25B8%25B4%25E0%25B8%25A0%25E0%25B8%25B2%25E0%25B8%2581-%25E0%25B8%25AA%25E0%25B8%25B2%25E0%25B8%2582%25E0%25B8%25B2%25E0%25B9%2580%25E0%25B8%25A1%25E0%25B8%25B7%25E0%25B8%25AD%25E0%25B8%2587%25E0%25B8%2580%25E0%25B8%25B2%25E0%25B8%25A2%25E0%25B8%2587%25E0%25B9%2582%25E0%25B8%25AB%25E0%25B8%25A1%25E0%25B9%2588-2-100067434915901%2F&tabs=&width=340&height=130&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false&appId" 
                  width="280" 
                  height="130" 
                  style={{ border: 'none', overflow: 'hidden' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="PEA CM2 Facebook Page"
                ></iframe>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* แถบล่าง : Powered by */}
      <div className="bg-[#74045F] py-3 shadow-inner">
        <p className="text-center text-xs md:text-sm lg:text-base font-medium text-[#F7F7FB] tracking-wide">
          © 2026 Provincial Electricity Authority Chiang Mai 2. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;