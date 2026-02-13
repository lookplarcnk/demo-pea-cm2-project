import React, { useState, useEffect } from 'react';

function DocsLastedUpdate() {
  // ✅ สถานะสำหรับข้อมูลเอกสารและการแสดงผล
  const [docs, setDocs] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [downloadCounts, setDownloadCounts] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✅ 1. ดึงข้อมูลเอกสารล่าสุดจาก API
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/latest-updates'); 
        const data = await response.json();
        setDocs(data);

        const counts = data.reduce((acc, doc) => {
          acc[doc.id] = doc.downloads;
          return acc;
        }, {});
        setDownloadCounts(counts);
      } catch (err) {
        console.error('ดึงข้อมูลเอกสารล้มเหลว:', err);
      }
    };
    fetchDocs();
  }, []);

  /**
   * ✅ 2. แก้ไขฟังก์ชัน Preview: เปิดเอกสารได้จริงเหมือนหน้า Search
   * โดยใช้การ encodeURIComponent และต่อชื่อไฟล์ .pdf ตามโครงสร้าง uploads
   */
  const handlePreview = async (doc) => {
    setIsFullscreen(false);
    
    // Logic การสร้าง URL เลียนแบบหน้า Search เพื่อให้เปิดไฟล์ภาษาไทยได้ถูกต้อง
    const fileName = encodeURIComponent(`${doc.title}.pdf`);
    const fileUrl = `http://localhost:5000/files/${fileName}`;

    setPreviewDoc({
      ...doc,
      url: fileUrl
    });

    try {
      // บันทึกสถิติดาวน์โหลดที่ Backend
      const response = await fetch(`http://localhost:5000/api/documents/${doc.id}/download`, {
        method: 'PATCH',
      });
      const data = await response.json();

      if (data.success) {
        // อัปเดตตัวเลขยอดดาวน์โหลดบนหน้าจอทันที
        setDownloadCounts((prev) => ({
          ...prev,
          [doc.id]: data.newCount,
        }));
      }
    } catch (err) {
      console.error('ไม่สามารถอัปเดตจำนวนดาวน์โหลดได้:', err);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <section className="bg-gradient-to-b from-[#E6EAF0] to-[#F4F6FA] py-10 md:py-14">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-gray-100 px-5 py-6 md:px-8 md:py-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div className="text-left">
              <h2 className="text-left text-[1.6rem] md:text-[1.75rem] font-semibold text-[#111827]">
                เอกสารที่อัพเดทล่าสุด
              </h2>
              <p className="text-left text-sm text-[#6B7280] mt-1">
                แสดงเอกสารที่อัพเดทล่าสุดจากระบบ
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <span className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#3730A3] text-xs md:text-sm px-3 py-1.5 rounded-full">
                ● อัปเดตเรียลไทม์จากระบบ
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 w-[80px] border-b border-gray-200">ลำดับ</th>
                  <th className="px-4 py-3 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">ชื่อเอกสาร</th>
                  <th className="px-4 py-3 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">ขนาดไฟล์</th>
                  <th className="px-4 py-3 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200 md:w-[200px]">หมวดหมู่</th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200 md:w-[140px]">วันที่อัพโหลด</th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200 md:w-[160px]">ผู้อัพโหลด</th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200 md:w-[160px]">แผนก</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-sm text-gray-700 border-b border-gray-100">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-sm font-semibold">{index + 1}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1F2937] border-b border-gray-100">
                      <button onClick={() => handlePreview(doc)} className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-medium text-left line-clamp-2">
                        {doc.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#4B5563] border-b border-gray-100">
                      {doc.size || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#4B5563] border-b border-gray-100">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#F3F4F6] text-gray-700">{doc.category}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-[#111827] border-b border-gray-100">{doc.uploadDate}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#111827] border-b border-gray-100">{doc.uploader}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#111827] border-b border-gray-100">{doc.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm md:text-base text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition mt-1"
            >
              ดูเอกสารทั้งหมด
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-2 md:px-4">
          <div className={isFullscreen ? 'bg-white w-full h-full flex flex-col' : 'bg-white w-full max-w-5xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden'}>
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-gray-50 text-left">
              <div className="text-left">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">PDF PREVIEW</p>
                <h3 className="font-semibold text-sm md:text-lg text-gray-800">{previewDoc.title}</h3>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1 italic">
                  ดาวน์โหลดทั้งหมด: <strong>{downloadCounts[previewDoc.id]?.toLocaleString('th-TH')} ครั้ง</strong>
                </p>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1 italic">
                  ขนาดไฟล์: <strong>{previewDoc.size || '-'}</strong>
                </p>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1 italic">อัพโหลดเมื่อ {previewDoc.uploadDate} โดย <strong>{previewDoc.uploader}</strong> ({previewDoc.department})</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={toggleFullscreen} className="hidden md:inline-flex items-center text-gray-600 hover:text-gray-900 text-xs border border-gray-300 hover:border-gray-500 rounded-full px-3 py-1 transition">
                  {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                </button>
                <button onClick={() => setPreviewDoc(null)} className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg leading-none transition">×</button>
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

export default DocsLastedUpdate;