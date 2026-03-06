import React, { useState, useEffect } from "react";
import { FiBriefcase, FiUsers, FiBook, FiClipboard, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ✅ กำหนด URL ของ Backend จาก Render
const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

export default function AdminDivision() {
  // ✅ State สำหรับจัดการข้อมูลแผนกภายในกองบริหาร
  const [divisionData, setDivisionData] = useState({
    description: "กองบริหาร มีหน้าที่รับผิดชอบด้านการบริหารงานทั่วไป งานสารบรรณ งานบุคคล และการสนับสนุนการดำเนินงานของส่วนงานอื่นๆ เพื่อให้องค์กรขับเคลื่อนได้อย่างมีประสิทธิภาพ",
    departments: [
      { name: "แผนกบริหารงานทั่วไป", role: "ดูแลงานเอกสาร สารบรรณ และอาคารสถานที่" },
      { name: "แผนกทรัพยากรบุคคล", role: "บริหารจัดการบุคลากร สวัสดิการ และการพัฒนาทักษะ" },
      { name: "แผนกบัญชีและประมวลผล", role: "จัดทำบัญชี งบประมาณ และรายงานทางการเงิน" },
      { name: "แผนกพัสดุ", role: "ควบคุมการจัดซื้อจัดจ้างและบริหารคลังพัสดุ" }
    ]
  });

  useEffect(() => {
    const fetchDivisionData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/settings/admin-division`); // สมมติ Endpoint
        if (response.data) {
          setDivisionData({
            description: response.data.description || divisionData.description,
            departments: response.data.departments || divisionData.departments
          });
        }
      } catch (err) {
        console.error("Error fetching admin division data:", err);
      }
    };
    fetchDivisionData();
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
            กองบริหาร
          </h1>
          <p className="text-white opacity-90 font-bold text-lg max-w-2xl mx-auto">
            การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2
          </p>
        </div>
      </header>

      {/* Content Section */}
      <main className="container mx-auto max-w-[1320px] px-6 py-20">
        <div className="space-y-20">
          
          {/* ข้อมูลทั่วไปของกอง */}
          <section className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 text-left">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
                <FiClipboard className="text-[#74045F]" /> ภารกิจหลักของกอง
              </h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                {divisionData.description}
              </p>
            </div>
            <div className="w-full md:w-1/3 h-64 bg-slate-100 rounded-[2.5rem] flex items-center justify-center italic text-slate-400 font-bold border-2 border-dashed border-slate-200">
              
            </div>
          </section>

          <hr className="border-purple-50" />

          {/* แผนกย่อยภายในกอง */}
          <section className="space-y-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">โครงสร้างแผนกย่อย</h2>
              <p className="text-slate-400 font-bold italic text-sm">Departments within Division</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {divisionData.departments.map((dept, index) => (
                <div key={index} className="flex gap-6 p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-purple-200 transition-all hover:bg-white hover:shadow-xl hover:shadow-purple-100/50 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#74045F] text-2xl shadow-sm group-hover:bg-[#74045F] group-hover:text-white transition-all">
                    <FiCheckCircle />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-black text-slate-800 mb-2">{dept.name}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{dept.role}</p>
                  </div>
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