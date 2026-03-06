import React, { useState, useEffect } from "react";
import { FiZap, FiSettings, FiActivity, FiServer, FiAlertTriangle } from "react-icons/fi";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

// ✅ ตรวจสอบว่ามีคำว่า export default นำหน้า function และชื่อสะกดถูกต้อง
export default function MeterTransformerDept() {
  const [deptData, setDeptData] = useState({
    description: "แผนกมิเตอร์และหม้อแปลง มีหน้าที่รับผิดชอบในการติดตั้ง ตรวจสอบ บำรุงรักษา และซ่อมแซมอุปกรณ์วัดหน่วยไฟฟ้า (Meter) รวมถึงหม้อแปลงไฟฟ้า (Transformer) เพื่อให้การจ่ายไฟฟ้ามีความเที่ยงตรงและปลอดภัย",
    functions: [
      { name: "งานมิเตอร์", role: "ติดตั้งและตรวจสอบความเที่ยงตรงของเครื่องวัดหน่วยไฟฟ้า" },
      { name: "งานหม้อแปลง", role: "บำรุงรักษาและทดสอบสภาพการทำงานของหม้อแปลงไฟฟ้า" },
      { name: "งานซ่อมบำรุงอุปกรณ์", role: "ซ่อมแซมและฟื้นฟูสภาพอุปกรณ์ไฟฟ้าในระบบจำหน่าย" },
      { name: "งานวิเคราะห์คุณภาพ", role: "ตรวจสอบค่าพารามิเตอร์และประสิทธิภาพการจ่ายไฟ" }
    ]
  });

  useEffect(() => {
    const fetchDeptData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/settings/meter-transformer-dept`); 
        if (response.data) {
          setDeptData({
            description: response.data.description || deptData.description,
            functions: response.data.functions || deptData.functions
          });
        }
      } catch (err) {
        console.error("Error fetching meter-transformer data:", err);
      }
    };
    fetchDeptData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      <Navbar />

      <div className="bg-amber-50 border-b border-amber-100 py-3 px-4">
        <div className="container mx-auto max-w-[1320px] flex items-center justify-center gap-3 text-amber-700">
          <FiAlertTriangle className="animate-pulse" size={20} />
          <p className="text-sm font-black uppercase tracking-widest text-center">
            Notice: หน้านี้กำลังอยู่ระหว่างการพัฒนาข้อมูล (Under Development)
          </p>
        </div>
      </div>

      <header className="relative bg-[#74045F] py-20 overflow-hidden">
        <div className="container mx-auto max-w-[1320px] px-6 relative z-10 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            แผนกมิเตอร์หม้อแปลง
          </h1>
          <p className="text-white opacity-90 font-bold text-lg max-w-2xl mx-auto">
            การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-[1320px] px-6 py-20">
        <div className="space-y-20">
          <section className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 text-left">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
                <FiSettings className="text-[#74045F]" /> ภารกิจและการดำเนินงานทางเทคนิค
              </h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                {deptData.description}
              </p>
            </div>
            <div className="w-full md:w-1/3 h-64 bg-slate-100 rounded-[2.5rem] flex items-center justify-center italic text-slate-400 font-bold border-2 border-dashed border-slate-200 text-center px-6">
              
            </div>
          </section>

          <hr className="border-purple-50" />

          <section className="space-y-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">ขอบเขตงานบริการย่อย</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {deptData.functions.map((item, index) => (
                <div key={index} className="p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-purple-200 transition-all hover:bg-white hover:shadow-xl group text-left">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#74045F] text-xl mb-6 shadow-sm group-hover:bg-[#74045F] group-hover:text-white transition-all">
                    <FiZap />
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