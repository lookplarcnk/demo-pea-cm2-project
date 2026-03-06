import React, { useState, useEffect } from "react";
import { FiTool, FiSettings, FiActivity, FiCpu, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ✅ กำหนด URL ของ Backend จาก Render
const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

export default function SupportDepartment() {
  // ✅ State สำหรับจัดการข้อมูลภายในแผนกสนับสนุน
  const [supportData, setSupportData] = useState({
    description: "แผนกสนับสนุน มีหน้าที่หลักในการดูแลรักษาเครื่องมือ อุปกรณ์ และระบบสนับสนุนทางเทคนิคต่างๆ เพื่อให้การดำเนินงานจำหน่ายไฟฟ้าและการบริการลูกค้าเป็นไปอย่างต่อเนื่องและมีประสิทธิภาพสูงสุด",
    functions: [
      { name: "งานบำรุงรักษาอุปกรณ์", role: "ดูแลรักษาเครื่องมือและอุปกรณ์ไฟฟ้าสำนักงาน" },
      { name: "งานระบบสารสนเทศ", role: "สนับสนุนด้าน Software และระบบเครือข่ายภายใน" },
      { name: "งานยานพาหนะ", role: "บริหารจัดการรถยนต์ส่วนกลางและการออกปฏิบัติงาน" },
      { name: "งานอาคารและสถานที่", role: "ดูแลความพร้อมของพื้นที่ทำงานและระบบสาธารณูปโภค" }
    ]
  });

  useEffect(() => {
    const fetchSupportData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/settings/support-dept`); 
        if (response.data) {
          setSupportData({
            description: response.data.description || supportData.description,
            functions: response.data.functions || supportData.functions
          });
        }
      } catch (err) {
        console.error("Error fetching support department data:", err);
      }
    };
    fetchSupportData();
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
            แผนกสนับสนุน
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
                <FiTool className="text-[#74045F]" /> ขอบเขตหน้าที่และการสนับสนุน
              </h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                {supportData.description}
              </p>
            </div>
            <div className="w-full md:w-1/3 h-64 bg-slate-100 rounded-[2.5rem] flex items-center justify-center italic text-slate-400 font-bold border-2 border-dashed border-slate-200">
              
            </div>
          </section>

          <hr className="border-purple-50" />

          {/* ฟังก์ชันการทำงาน */}
          <section className="space-y-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">งานบริการสนับสนุน</h2>
              <p className="text-slate-400 font-bold italic text-sm">Support Functions & Services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportData.functions.map((item, index) => (
                <div key={index} className="p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-purple-200 transition-all hover:bg-white hover:shadow-xl hover:shadow-purple-100/50 group text-left">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#74045F] text-xl mb-6 shadow-sm group-hover:bg-[#74045F] group-hover:text-white transition-all">
                    {index === 0 && <FiTool />}
                    {index === 1 && <FiCpu />}
                    {index === 2 && <FiActivity />}
                    {index === 3 && <FiCheckCircle />}
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