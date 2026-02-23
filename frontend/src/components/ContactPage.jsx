import React from "react";
// นำเข้าไอคอนเพิ่มเติม FaFacebook และ FiExternalLink
import { FiMail, FiPhone, FiMapPin, FiClock, FiGlobe, FiExternalLink } from "react-icons/fi";
import { FaFacebook } from "react-icons/fa"; 
import Navbar from "./Navbar";
import Footer from "./Footer";

const ContactPage = () => {
  // ข้อมูลการติดต่อ (คงเดิมตามสั่ง)
  const contactInfo = {
    address: "การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่ 2",
    location: "อาคารอำนวยการศูนย์บ้านพักข้าราชการจังหวัดเชียงใหม่ ชั้น 1,2 ต.ช้างเผือก อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50330",
    phone: "053 896 226",
    email: "contact@pea.co.th",
    hours: "วันจันทร์ - วันศุกร์: 08:30 – 16:30 น. (ปิดวันเสาร์-อาทิตย์)",
    facebook: "https://www.facebook.com/p/%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%84%E0%B8%9F%E0%B8%9F%E0%B9%89%E0%B8%AA%E0%B9%88%E0%B8%A1%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%84-%E0%B8%AA%E0%B8%B2%E0%B8%82%E0%B8%B2%E0%B9%80%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88-2-100067434915901/?locale=th_TH",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-left font-sans">
      <Navbar />

      {/* Header Section */}
      <div className="bg-[#74045F] py-16 px-4 border-b-4 border-[#74045F] shadow-inner">
        <div className="container mx-auto max-w-[1320px] text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-wide drop-shadow-md">
            ติดต่อเรา
          </h1>
          <p className="text-white opacity-90 font-bold text-lg max-w-2xl mx-auto">
            หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือเกี่ยวกับการบริการไฟฟ้า เรายินดีให้บริการทุกระดับประทับใจ
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-[1320px] py-12 px-4 -mt-12 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* ส่วนที่ 1: ข้อมูลการติดต่อ */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-black text-[#4B5563] mb-10 flex items-center gap-3">
              <span className="w-2.5 h-10 bg-[#74045F] rounded-full inline-block"></span>
              ช่องทางการติดต่อ
            </h2>

            <div className="space-y-8">
              {/* ที่อยู่ */}
              <div className="flex items-start gap-5 group">
                <div className="w-14 h-14 bg-purple-50 text-[#74045F] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#74045F] group-hover:text-white transition-all duration-300 shadow-sm border border-purple-100">
                  <FiMapPin size={26} />
                </div>
                <div>
                  <h3 className="font-black text-slate-700 text-lg mb-1">ที่อยู่หน่วยงาน</h3>
                  <p className="text-slate-600 font-bold leading-tight">{contactInfo.address}</p>
                  <p className="text-slate-400 text-sm font-medium mt-1 leading-relaxed">{contactInfo.location}</p>
                </div>
              </div>

              {/* เบอร์โทรศัพท์ - เพิ่มความสามารถในการคลิกโทรออก */}
              <div className="flex items-start gap-5 group">
                <div className="w-14 h-14 bg-purple-50 text-[#74045F] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#74045F] group-hover:text-white transition-all duration-300 shadow-sm border border-purple-100">
                  <FiPhone size={26} />
                </div>
                <div>
                  <h3 className="font-black text-slate-700 text-lg mb-1">เบอร์โทรศัพท์</h3>
                  <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="text-[#74045F] font-black text-xl hover:opacity-70 transition-opacity">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              {/* เวลาทำการ */}
              <div className="flex items-start gap-5 group">
                <div className="w-14 h-14 bg-purple-50 text-[#74045F] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#74045F] group-hover:text-white transition-all duration-300 shadow-sm border border-purple-100">
                  <FiClock size={26} />
                </div>
                <div>
                  <h3 className="font-black text-slate-700 text-lg mb-1">เวลาทำการ</h3>
                  <p className="text-slate-600 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 inline-block">
                    {contactInfo.hours}
                  </p>
                </div>
              </div>

              {/* Facebook - เปลี่ยนไอคอนและทำให้ดูเด่นขึ้น */}
              <div className="flex items-start gap-5 group border-t border-slate-50 pt-8">
                <div className="w-14 h-14 bg-blue-50 text-[#1877F2] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300 shadow-sm">
                  <FaFacebook size={26} />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-700 text-lg mb-1">Facebook Fanpage</h3>
                    <FiExternalLink className="text-slate-300 group-hover:text-[#74045F]" />
                  </div>
                  <a href={contactInfo.facebook} target="_blank" rel="noreferrer" className="text-[#74045F] font-bold hover:underline break-all leading-snug block mt-1">
                    การไฟฟ้าส่วนภูมิภาค สาขาเมืองเชียงใหม่ 2
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ส่วนที่ 2: แผนที่ Google Maps */}
          <div className="flex flex-col gap-4 group">
            {/* ป้ายบอกสถานที่บนแผนที่ */}
            <div className="bg-white px-6 py-4 rounded-2xl shadow-md border border-slate-100 flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-black text-slate-700 uppercase tracking-tighter text-sm">PEA Chiang Mai 2 Location</span>
            </div>
            
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex-grow relative group-hover:shadow-2xl transition-all duration-500 min-h-[450px]">
              <iframe
                title="PEA Chiang Mai 2 Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.5414800366436!2d98.98188187519965!3d18.8141444823377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a5d8f331693%3A0x6b1d491c944743c3!2z4LiB4Liy4Lij4LmE4Lif4Lif4Liy4Liq4Liy4LmB4LiU4LiH4Lig4Liy4LiB4Liy4LiV4Lig4Liy4LiE4Li04LmI4Lia4Liy4LmA4LiK4Li14Lii4Lih4LmA4LiK4Li14Lii4Lih!5e0!3m2!1sth!2sth!4v1708673750000!5m2!1sth!2sth"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;