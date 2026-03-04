import React, { useState, useEffect } from "react";
import { FiBriefcase, FiCheckSquare, FiPieChart, FiShield, FiAlertTriangle, FiTarget } from "react-icons/fi";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ✅ กำหนด URL ของ Backend จาก Render
const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

export default function ManagementPage() {
  // ✅ State สำหรับจัดการข้อมูลนโยบายการบริหาร
  const [mgmtContent, setMgmtContent] = useState({
    policy_title: "นโยบายการบริหารงานและธรรมาภิบาล",
    policy_desc: "เรามุ่งเน้นการบริหารจัดการองค์กรด้วยความโปร่งใส ตรวจสอบได้ และยึดหลักธรรมาภิบาล (Good Governance) เพื่อสร้างความเชื่อมั่นให้กับผู้ใช้ไฟฟ้าและสังคม",
    strategies: [
      { title: "ยุทธศาสตร์ด้านความมั่นคง", desc: "พัฒนาระบบไฟฟ้าให้มีความเสถียรภาพสูงสุด 99.99%" },
      { title: "ยุทธศาสตร์ด้านการบริการ", desc: "นำเทคโนโลยีดิจิทัลมายกระดับความพึงพอใจลูกค้า" },
      { title: "ยุทธศาสตร์ความยั่งยืน", desc: "สนับสนุนพลังงานสะอาดและลดการปล่อยก๊าซเรือนกระจก" }
    ]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMgmtData = async () => {
      try {
        // ✅ เชื่อมต่อ API เพื่อดึงข้อมูลการบริหารงาน
        const response = await axios.get(`${API_BASE_URL}/settings/management`); 
        if (response.data) {
          setMgmtContent({
            policy_title: response.data.policy_title || mgmtContent.policy_title,
            policy_desc: response.data.policy_desc || mgmtContent.policy_desc,
            strategies: response.data.strategies || mgmtContent.strategies
          });
        }
      } catch (err) {
        console.error("Error fetching management data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMgmtData();
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

      {/* Header Section */}
      <header className="bg-[#74045F] py-16 border-b border-purple-50">
        <div className="container mx-auto max-w-[1320px] px-6 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-center">
            การบริหารงาน
          </h1>
          <p className="text-white opacity-90 font-bold text-lg max-w-2xl mx-auto">
            หลักการบริหารและทิศทางการดำเนินงานขององค์กร
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-[1320px] px-6 py-20">
        <div className={`space-y-24 transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          
          {/* Section: Management Policy */}
          <section className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-purple-50 text-[#74045F] rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-sm">
              <FiShield />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#74045F] mb-8 tracking-tighter uppercase text-center">
              {mgmtContent.policy_title}
            </h2>
            <div className="bg-slate-50 p-10 md:p-14 rounded-[3.5rem] border-2 border-dashed border-purple-100 relative w-full text-left">
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                {mgmtContent.policy_desc}
              </p>
              {/* Decoration Icon */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#74045F] rounded-2xl flex items-center justify-center text-white">
                <FiCheckSquare size={24} />
              </div>
            </div>
          </section>

          {/* Section: Strategic Pillars */}
          <section className="space-y-12">
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-50 text-[#74045F] rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                <FiPieChart />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight text-center">
                แผนยุทธศาสตร์หลัก
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mgmtContent.strategies.map((item, index) => (
                <StrategyCard 
                  key={index}
                  title={item.title}
                  desc={item.desc}
                  index={index + 1}
                />
              ))}
            </div>
          </section>

          {/* Section: Management Framework Illustration */}
          <div className="w-full flex flex-col items-center justify-center bg-slate-50 py-20 rounded-[3rem] border border-purple-50">
            <h3 className="text-xl font-black text-[#74045F] mb-6 uppercase tracking-widest text-center">
              Management Framework
            </h3>
            <div className="italic text-slate-400 text-sm">
               
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

/* --- Sub-components --- */

function StrategyCard({ title, desc, index }) {
  return (
    <div className="p-10 rounded-[3rem] bg-white border border-purple-50 hover:border-[#74045F] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 relative overflow-hidden group text-left">
      <div className="text-5xl font-black text-slate-50 absolute right-6 top-6 group-hover:text-purple-50 transition-colors">
        0{index}
      </div>
      <div className="relative z-10">
        <div className="w-12 h-12 bg-purple-50 text-[#74045F] rounded-xl flex items-center justify-center mb-6">
          <FiTarget size={24} />
        </div>
        <h4 className="text-xl font-black text-slate-800 mb-4">{title}</h4>
        <p className="text-sm text-slate-500 font-bold leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}