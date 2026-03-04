import React, { useState, useEffect } from "react";
import { FiTarget, FiAlertTriangle } from "react-icons/fi";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ✅ กำหนด URL ของ Backend จาก Render
const API_BASE_URL = "https://demo-pea-cm2-project.onrender.com/api";

export default function VisionMission() {
  // ✅ เพิ่ม State สำหรับจัดการข้อมูลจาก API
  const [visionData, setVisionData] = useState({
    vision_th: "ไฟฟ้าอัจฉริยะ เพื่อคุณภาพชีวิตที่ดีอย่างยั่งยืน",
    vision_en: "Smart Energy for Better Life and Sustainability"
  });
  const [isLoading, setIsLoading] = useState(true);

  // ✅ ดึงข้อมูลจาก API เมื่อ Component โหลด
  useEffect(() => {
    const fetchVision = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/settings/vision`); // สมมติ Endpoint
        if (response.data) {
          setVisionData({
            vision_th: response.data.vision_th || visionData.vision_th,
            vision_en: response.data.vision_en || visionData.vision_en
          });
        }
      } catch (err) {
        console.error("Error fetching vision data:", err);
        // หากเชื่อมต่อไม่ได้จะใช้ค่าเริ่มต้นที่ตั้งไว้ใน State
      } finally {
        setIsLoading(false);
      }
    };

    fetchVision();
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
            วิสัยทัศน์ / พันธกิจ
          </h1>
          <p className="text-purple-100 font-bold max-w-2xl mx-auto italic text-sm text-center">
            ทิศทางและเป้าหมายสู่การเป็นองค์กรชั้นนำในระดับภูมิภาค
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-[1320px] px-6 py-20">
        <div className="space-y-24">
          
          {/* Section: Vision (วิสัยทัศน์) - ✅ ปรับขนาดตัวอักษรให้เล็กลงตามความเหมาะสม */}
          <section className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-purple-50 text-[#74045F] rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-sm">
              <FiTarget />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#74045F] mb-8 tracking-tighter uppercase text-center">
              วิสัยทัศน์ (Vision)
            </h2>
            
            <div className={`bg-slate-50 p-10 md:p-14 rounded-[3.5rem] border-2 border-dashed border-purple-100 relative w-full flex flex-col items-center transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              <p className="text-xl md:text-2xl font-black text-slate-800 leading-tight text-center">
                "{visionData.vision_th}"
              </p>
              <p className="text-slate-400 mt-4 font-bold italic text-sm text-center">
                {visionData.vision_en}
              </p>
              {/* Decoration */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#74045F] rounded-2xl flex items-center justify-center text-white font-black">“</div>
            </div>
          </section>

          {/* ✅ เอาส่วนพันธกิจ (Mission) ออกเรียบร้อยแล้ว */}

        </div>
      </main>

      <Footer />
    </div>
  );
}