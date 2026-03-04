import React, { useState, useEffect } from "react";
import { FiClock, FiActivity, FiMapPin, FiShield, FiAlertTriangle, FiInfo } from "react-icons/fi";
import axios from "axios";

// ✅ Import Navbar และ Footer
import Navbar from "./Navbar";
import Footer from "./Footer";

// ✅ กำหนด URL ของ Backend จาก Render
const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

export default function AboutPage() {
  // ✅ เพิ่ม State สำหรับจัดการข้อมูลประวัติและไทม์ไลน์จาก API
  const [aboutContent, setAboutContent] = useState({
    history_text_1: "การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2 ก่อตั้งขึ้นเพื่อรองรับการขยายตัวของเศรษฐกิจและการใช้ไฟฟ้าที่เพิ่มขึ้นอย่างรวดเร็วในเขตพื้นที่ยุทธศาสตร์ของจังหวัดเชียงใหม่ โดยเน้นการบริหารจัดการระบบจำหน่ายไฟฟ้าให้ครอบคลุมและมีเสถียรภาพสูงสุด",
    history_text_2: "เรามุ่งมั่นพัฒนาโครงสร้างพื้นฐานด้านไฟฟ้าด้วยเทคโนโลยีที่ทันสมัย เพื่อสนับสนุนการเป็นเมืองอัจฉริยะ (Smart City) ของจังหวัดเชียงใหม่ พร้อมทั้งให้ความสำคัญ with พลังงานสะอาดและการบริการที่เป็นเลิศ",
    timeline: [
      { year: "พ.ศ. 25XX", event: "เริ่มดำเนินการจัดตั้งการไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2" },
      { year: "พ.ศ. 25XX", event: "ขยายเขตจำหน่ายไฟฟ้าครอบคลุมพื้นที่เศรษฐกิจฝั่งตะวันออก" },
      { year: "ปัจจุบัน", event: "ก้าวสู่ยุค Digital Utility และ Smart Grid เต็มรูปแบบ" }
    ]
  });

  // ✅ ดึงข้อมูลจาก API เมื่อ Component โหลด
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/settings/about`); // สมมติ Endpoint
        if (response.data) {
          setAboutContent({
            history_text_1: response.data.history_text_1 || aboutContent.history_text_1,
            history_text_2: response.data.history_text_2 || aboutContent.history_text_2,
            timeline: response.data.timeline || aboutContent.timeline
          });
        }
      } catch (err) {
        console.error("Error fetching about data:", err);
      }
    };
    fetchAboutData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      {/* ✅ ใส่ Navbar ไว้ด้านบนสุด */}
      <Navbar />

      {/* ⚠️ Banner แจ้งเตือนสถานะการพัฒนา */}
      <div className="bg-amber-50 border-b border-amber-100 py-3 px-4">
        <div className="container mx-auto max-w-[1320px] flex items-center justify-center gap-3 text-amber-700">
          <FiAlertTriangle className="animate-pulse" size={20} />
          <p className="text-sm font-black uppercase tracking-widest text-center">
            Notice: หน้านี้กำลังอยู่ระหว่างการพัฒนาข้อมูล (Under Development)
          </p>
        </div>
      </div>

      {/* Hero Section - ✅ เอาลายน้ำ PEA ออกแล้ว - ✅ เอา Logo ออกตามคำสั่ง */}
      <header className="relative bg-[#74045F] py-24 overflow-hidden">
        <div className="container mx-auto max-w-[1320px] px-6 relative z-10 text-center">
          {/* ✅ ปรับลดขนาดตัวหนังสือประวัติหน่วยงานลงจาก 4xl/5xl เป็น 3xl/4xl */}
          <h1 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight text-center">
            ประวัติหน่วยงาน
          </h1>
          <p className="text-white opacity-90 font-bold text-lg max-w-2xl mx-auto">
            การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2
          </p>
        </div>
      </header>

      {/* Content Section */}
      <main className="container mx-auto max-w-[1320px] px-6 -mt-12 mb-20">
        <div className="bg-white rounded-[3rem] shadow-xl shadow-purple-100/50 p-8 md:p-16 border border-purple-50">
          
          {/* ส่วนเนื้อหาประวัติ */}
          <div className="space-y-16">
            
            <section className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#74045F] rounded-full text-xs font-black uppercase tracking-widest">
                  <FiInfo /> Background
                </div>
                <h2 className="text-3xl font-black text-slate-800">จุดเริ่มต้นของความสว่างไสว</h2>
                <p className="text-slate-500 leading-relaxed font-medium text-left">
                  {aboutContent.history_text_1}
                </p>
                <p className="text-slate-500 leading-relaxed font-medium text-left">
                  {aboutContent.history_text_2}
                </p>
              </div>
              <div className="w-full md:w-1/3 h-64 bg-slate-100 rounded-[2.5rem] flex items-center justify-center italic text-slate-400 font-bold border-2 border-dashed border-slate-200">
                {/*  */}
              </div>
            </section>

            <hr className="border-purple-50" />

            {/* Timeline ย่อๆ */}
            <section className="space-y-10">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <FiClock className="text-[#74045F]" /> ไทม์ไลน์การพัฒนา
              </h3>
              <div className="space-y-8 pl-4 border-l-4 border-purple-100 text-left">
                {aboutContent.timeline.map((item, index) => (
                  <TimelineItem key={index} year={item.year} event={item.event} />
                ))}
              </div>
            </section>

          </div>

          {/* Footer หน้าย่อย */}
          <div className="mt-20 pt-10 border-t border-slate-100 text-center">
            {/* ✅ นำ Copyright ออกตามคำสั่ง */}
          </div>
        </div>
      </main>

      {/* ✅ ใส่ Footer ไว้ด้านล่างสุด */}
      <Footer />
    </div>
  );
}

/* --- Sub-components --- */

function TimelineItem({ year, event }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-[-12px] top-1.5 w-5 h-5 bg-white border-4 border-[#74045F] rounded-full"></div>
      <span className="block text-[#74045F] font-black text-sm mb-1">{year}</span>
      <p className="text-slate-700 font-bold">{event}</p>
    </div>
  );
}