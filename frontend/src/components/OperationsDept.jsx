import React, { useState, useEffect } from "react";
import { FiZap, FiActivity, FiTruck, FiMapPin, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ✅ กำหนด URL ของ Backend จาก Render
const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

export default function OperationsDept() {
  // ✅ State สำหรับจัดการข้อมูลภายในแผนกปฏิบัติการ
  const [opsData, setOpsData] = useState({
    description: "แผนกปฏิบัติการ มีหน้าที่หลักในการควบคุมระบบไฟฟ้า แก้ไขกระแสไฟฟ้าขัดข้อง และดูแลรักษาโครงข่ายระบบจำหน่ายให้พร้อมใช้งานตลอด 24 ชั่วโมง เพื่อความมั่นคงและปลอดภัยในการจ่ายกระแสไฟฟ้าให้กับประชาชน",
    functions: [
      { name: "งานแก้กระแสไฟฟ้าขัดข้อง", role: "รับแจ้งและรุดหน้าเข้าแก้ไขปัญหาไฟดับหรือระบบขัดข้องทันที" },
      { name: "งานบำรุงรักษาระบบไฟฟ้า", role: "ตรวจสอบและบำรุงรักษาเชิงป้องกันตามวาระเพื่อลดอัตราไฟดับ" },
      { name: "งานควบคุมการจ่ายไฟ", role: "บริหารจัดการการสลับสายส่งและรักษาเสถียรภาพของแรงดันไฟฟ้า" },
      { name: "งานปฏิบัติงานพื้นที่", role: "ประสานงานร่วมกับหน่วยงานอื่นในการย้ายเสาหรือปรับปรุงสายส่ง" }
    ]
  });

  useEffect(() => {
    const fetchOpsData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/settings/operations-dept`); 
        if (response.data) {
          setOpsData({
            description: response.data.description || opsData.description,
            functions: response.data.functions || opsData.functions
          });
        }
      } catch (err) {
        console.error("Error fetching operations department data:", err);
      }
    };
    fetchOpsData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
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

      {/* Header Section */}
      <header className="relative bg-[#74045F] py-20 overflow-hidden">
        <div className="container mx-auto max-w-[1320px] px-6 relative z-10 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            แผนกปฏิบัติการ
          </h1>
          <p className="text-white opacity-90 font-bold text-lg max-w-2xl mx-auto">
            การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2
          </p>
        </div>
      </header>

      {/* Content Section */}
      <main className="container mx-auto max-w-[1320px] px-6 py-20">
        <div className="space-y-20">
          
          {/* ข้อมูลทั่วไปของแผนก */}
          <section className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 text-left">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
                <FiZap className="text-[#74045F]" /> บริหารจัดการระบบจำหน่ายไฟฟ้า
              </h2>
              <p className="text-slate-500 leading-relaxed font-medium text-left">
                {opsData.description}
              </p>
            </div>
            <div className="w-full md:w-1/3 h-64 bg-slate-100 rounded-[2.5rem] flex items-center justify-center italic text-slate-400 font-bold border-2 border-dashed border-slate-200 text-center px-6">
               
            </div>
          </section>

          <hr className="border-purple-50" />

          {/* ฟังก์ชันการปฏิบัติงาน */}
          <section className="space-y-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 text-center">ขอบเขตภารกิจงานปฏิบัติการ</h2>
              <p className="text-slate-400 font-bold italic text-sm text-center">Core Operations Functions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {opsData.functions.map((item, index) => (
                <div key={index} className="p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-purple-200 transition-all hover:bg-white hover:shadow-xl group text-left">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#74045F] text-xl mb-6 shadow-sm group-hover:bg-[#74045F] group-hover:text-white transition-all">
                    {index === 0 && <FiActivity />}
                    {index === 1 && <FiCheckCircle />}
                    {index === 2 && <FiZap />}
                    {index === 3 && <FiMapPin />}
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">{item.name}</h3>
                  <p className="text-slate-500 font-bold text-xs leading-relaxed">{item.role}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}