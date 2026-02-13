import React, { useState, useEffect } from 'react';

function Mostdownloaddocs() {
  // ✅ 1. เปลี่ยนจากค่าคงที่ เป็น State เพื่อรอรับข้อมูลจาก API
  const [docs, setDocs] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [downloadCounts, setDownloadCounts] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✅ 2. ดึงข้อมูลจาก API โดยเรียงตามยอดดาวน์โหลดสูงสุด (Top 5)
  useEffect(() => {
    const fetchTopDocs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/most-downloaded'); 
        const data = await response.json();
        
        // ปรับปรุงการเก็บข้อมูล downloads จาก backend ให้ลง state docs โดยตรง
        const mappedData = data.map(doc => ({
          ...doc,
          downloads: parseInt(doc.downloads) || 0 // มั่นใจว่าเป็นตัวเลขจาก DB
        }));
        
        setDocs(mappedData);

        // ตั้งค่า State สำหรับยอดดาวน์โหลดแยกตาม ID เพื่อใช้ใน Modal
        const counts = mappedData.reduce((acc, doc) => {
          acc[doc.id] = doc.downloads;
          return acc;
        }, {});
        setDownloadCounts(counts);
      } catch (err) {
        console.error('ดึงข้อมูลเอกสารยอดนิยมล้มเหลว:', err);
      }
    };
    fetchTopDocs();
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // ✅ 3. handlePreview: ทำหน้าที่ "เปิดดู" อย่างเดียว ไม่มีการนับยอด
  const handlePreview = async (doc) => {
    setIsFullscreen(false);
    
    // สร้าง URL สำหรับ Preview รองรับชื่อไฟล์ภาษาไทย
    const fileName = encodeURIComponent(`${doc.title}.pdf`);
    const fileUrl = `http://localhost:5000/files/${fileName}`;

    setPreviewDoc({
      ...doc,
      url: fileUrl
    });
    // หมายเหตุ: ไม่มีการ fetch PATCH ในนี้เพื่อให้ยอดนิ่งตอนเปิดดู
  };

  // ✅ 4. เพิ่มฟังก์ชัน handleDownload: ดาวน์โหลดลงเครื่องก่อน -> แล้วค่อยนับยอดแบบเรียลไทม์
  const handleDownload = async (doc) => {
    try {
      // --- ส่วนที่ 1: ดำเนินการดาวน์โหลดไฟล์ลงเครื่องก่อน (Save to Computer First) ---
      const downloadFileName = `${doc.title}.pdf`;
      const downloadUrl = `http://localhost:5000/files/${encodeURIComponent(downloadFileName)}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', downloadFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // --- ส่วนที่ 2: หลังจากเริ่มดาวน์โหลดแล้ว จึงส่ง PATCH request ไปนับยอดที่ Backend ---
      const response = await fetch(`http://localhost:5000/api/documents/${doc.id}/download`, {
        method: 'PATCH',
      });
      const data = await response.json();

      if (data.success) {
        // อัปเดตยอดดาวน์โหลดสะสมใน Modal ทันที
        setDownloadCounts((prev) => ({
          ...prev,
          [doc.id]: data.newCount,
        }));
        
        // ✅ จุดสำคัญ: อัปเดตข้อมูลในตารางหลัก (State docs) ให้เลขเปลี่ยนทันทีโดยไม่รีเฟรช
        setDocs((prevDocs) => 
          prevDocs.map((item) => 
            item.id === doc.id ? { ...item, downloads: data.newCount } : item
          )
        );
      }
    } catch (err) {
      console.error('ไม่สามารถดำเนินการดาวน์โหลดหรืออัปเดตยอดได้:', err);
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#E6EAF0] to-[#F4F6FA] py-10 md:py-14 text-left">
      <div className="container mx-auto max-w-[1200px] px-4 text-left">
        <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-gray-100 px-5 py-6 md:px-8 md:py-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div className="text-left">
              <h2 className="text-left text-[1.6rem] md:text-[1.75rem] font-semibold text-[#111827]">
                เอกสารที่ถูกดาวน์โหลดมากที่สุด
              </h2>
              <p className="text-left text-sm text-[#6B7280] mt-1">
                แสดงอันดับเอกสารที่ได้รับความนิยม (นับจากการดาวน์โหลดจริง)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 w-[80px] border-b border-gray-200">อันดับ</th>
                  <th className="px-4 py-3 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">ชื่อเอกสาร</th>
                  <th className="px-4 py-3 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">ขนาดไฟล์</th>
                  <th className="px-4 py-3 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">หมวดหมู่</th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">จำนวนดาวน์โหลด</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-sm border-b border-gray-100">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-semibold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-gray-100">
                      <button onClick={() => handlePreview(doc)} className="text-[#2563EB] hover:underline font-medium text-left line-clamp-2">
                        {doc.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#4B5563] border-b border-gray-100">{doc.size || '-'}</td>
                    <td className="px-4 py-3 text-sm text-[#4B5563] border-b border-gray-100">
                      <span className="px-3 py-1 rounded-full text-xs bg-[#F3F4F6]">{doc.category}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-b border-gray-100">
                      <span className="px-3 py-1 rounded-full bg-[#ECFEFF] text-[#0369A1] font-semibold">
                        {/* ✅ ใช้ยอด downloads จาก state docs โดยตรงเพื่อให้แสดงผล 11 ครั้งตาม DB */}
                        {doc.downloads?.toLocaleString('th-TH')} ครั้ง
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-2 md:px-4">
          <div className={isFullscreen ? "bg-white w-full h-full flex flex-col" : "bg-white w-full max-w-5xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"}>
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-gray-50">
              <div className="text-left">
                <h3 className="font-semibold text-sm md:text-lg text-gray-800">{previewDoc.title}</h3>
                <p className="text-[11px] md:text-xs text-gray-500 italic">
                  ดาวน์โหลดสะสม: <strong>{downloadCounts[previewDoc.id]?.toLocaleString('th-TH')} ครั้ง</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* ✅ ปุ่มดาวน์โหลดลงเครื่อง: เมื่อกดปุ่มนี้ระบบจะเซฟไฟล์ก่อน แล้วถึงจะนับจำนวนครั้ง */}
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-full px-4 py-2 transition shadow-md"
                >
                  DOWNLOAD FILE
                </button>
                <button onClick={toggleFullscreen} className="hidden md:inline-flex text-gray-600 border border-gray-300 rounded-full px-3 py-1 text-xs transition hover:border-gray-500">
                  {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                </button>
                <button onClick={() => setPreviewDoc(null)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg transition">×</button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe src={previewDoc.url} title={previewDoc.title} className="w-full h-full border-none" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Mostdownloaddocs;