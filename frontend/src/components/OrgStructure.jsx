import React, { useState, useEffect } from "react";
import { FiUsers, FiHexagon, FiAlertTriangle, FiGitMerge, FiAward } from "react-icons/fi";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ✅ กำหนด URL ของ Backend จาก Render
const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

// ✅ ต้องมีคำว่า export default นำหน้าฟังก์ชัน
export default function OrgStructure() {
  // ✅ เพิ่ม State สำหรับจัดการข้อมูลรายนามจาก API
  const [executives, setExecutives] = useState({
    manager: "รอกำหนดรายนาม",
    admin_head: "หัวหน้ากองบริหาร",
    service_head: "หัวหน้ากองบริการลูกค้า",
    distribution_head: "หัวหน้ากองระบบจำหน่าย",
    account_head: "หัวหน้ากองบัญชี"
  });

  // ✅ ดึงข้อมูลจาก API เมื่อ Component โหลด
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/employees/executives`); // สมมติ Endpoint
        if (response.data) {
          setExecutives({
            manager: response.data.manager || executives.manager,
            admin_head: response.data.admin_head || executives.admin_head,
            service_head: response.data.service_head || executives.service_head,
            distribution_head: response.data.distribution_head || executives.distribution_head,
            account_head: response.data.account_head || executives.account_head
          });
        }
      } catch (err) {
        console.error("Error fetching org data:", err);
      }
    };
    fetchOrgData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      <Navbar />

      {/* ⚠️ Banner แจ้งเตือนสถานะการพัฒนา */}
      <div className="bg-amber-50 border-b border-amber-100 py-3 px-4 text-center">
        <div className="container mx-auto max-w-[1320px] flex items-center justify-center gap-3 text-amber-700">
          <FiAlertTriangle className="animate-pulse" size={20} />
          <p className="text-sm font-black uppercase tracking-widest text-center">
            Notice: หน้านี้กำลังอยู่ระหว่างการพัฒนาข้อมูล (Under Development)
          </p>
        </div>
      </div>

      {/* Header Section - ✅ ปรับสีพื้นหลัง และขนาดตัวอักษรให้เล็กลงตามหน้าอื่นๆ */}
      <header className="bg-[#74045F] py-16 border-b border-purple-50">
        <div className="container mx-auto max-w-[1320px] px-6 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-center">
            โครงสร้างองค์กร
          </h1>
          <p className="text-white opacity-90 font-bold text-lg max-w-2xl mx-auto">
            การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2
          </p>
        </div>
      </header>

      {/* Organizational Chart Content */}
      <main className="container mx-auto max-w-[1320px] px-6 py-20">
        <div className="flex flex-col items-center">
          
          {/* ✅ ย้าย Organization Chart มาไว้ตรงนี้ก่อน Card ผู้จัดการ และขยายตัวหนังสือให้ใหญ่ขึ้น */}
          <div className="mb-12 w-full flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl md:text-5xl font-black text-[#74045F] mb-6 tracking-tighter uppercase">
              โครงสร้างองค์กร
            </h2>
            <div className="italic text-slate-400 text-sm mb-4">

[Image of hierarchical organizational chart structure]
</div>
          </div>

          {/* ระดับสูงสุด: ผู้จัดการ */}
          <div className="relative mb-20 text-center">
            <OrgCard 
              title="ผู้จัดการ" 
              name={executives.manager} 
              position="Manager (PEA Chiang Mai 2)" 
              primary 
            />
            {/* เส้นเชื่อมลงมา */}
            <div className="absolute left-1/2 -bottom-20 w-1 h-20 bg-purple-100 -translate-x-1/2 hidden lg:block"></div>
          </div>

          {/* ระดับรองผู้จัดการ / หัวหน้ากอง */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full relative">
            {/* เส้นแนวนอนเชื่อมหัวหน้ากอง */}
            <div className="hidden lg:block absolute top-[-40px] left-[12.5%] right-[12.5%] h-1 bg-purple-100"></div>
            
            <OrgCard 
              title="กองบริหาร" 
              name={executives.admin_head} 
              position="Administration Division" 
              icon={<FiAward />}
            />
            <OrgCard 
              title="กองบริการลูกค้า" 
              name={executives.service_head} 
              position="Customer Service Division" 
              icon={<FiUsers />}
            />
            <OrgCard 
              title="กองระบบจำหน่าย" 
              name={executives.distribution_head} 
              position="Power System Division" 
              icon={<FiGitMerge />}
            />
            <OrgCard 
              title="กองบัญชีและธรณี" 
              name={executives.account_head} 
              position="Finance & Accounting" 
              icon={<FiHexagon />}
            />
          </div>

          {/* ✅ นำส่วนแผนกย่อยภายในองค์กรออกเรียบร้อยแล้ว */}

        </div>
      </main>

      <Footer />
    </div>
  );
}

/* --- Sub-components --- */

function OrgCard({ title, name, position, primary, icon }) {
  return (
    <div className={`p-8 rounded-[2.5rem] border text-center transition-all duration-300 hover:shadow-2xl flex flex-col items-center ${
      primary 
      ? 'bg-[#74045F] text-white border-transparent shadow-xl scale-110 z-10' 
      : 'bg-white text-slate-700 border-purple-50 shadow-sm hover:border-purple-200'
    }`}>
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#74045F] flex items-center justify-center mb-4 text-xl">
          {icon}
        </div>
      )}
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ${primary ? 'text-purple-300' : 'text-[#74045F]'}`}>
        {title}
      </span>
      <h4 className="text-lg font-black mb-1">{name}</h4>
      <p className={`text-xs font-bold ${primary ? 'text-purple-100/60' : 'text-slate-400'}`}>
        {position}
      </p>
    </div>
  );
}