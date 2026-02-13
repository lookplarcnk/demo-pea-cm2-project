import React, { useState, useRef } from "react";
import { FiX, FiCamera, FiCheck } from "react-icons/fi";

export default function AdminProfileModal({ user, setUser, onClose }) {
  // สร้าง State ชั่วคราวสำหรับการแก้ไข
  const [tempUser, setTempUser] = useState(user);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempUser((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // ✅ ตรวจสอบสิทธิ์เบื้องต้น: รองรับสำหรับแอดมินเท่านั้น
    const currentRole = user.role?.toLowerCase();
    if (!currentRole.includes("admin") && !currentRole.includes("administrator")) {
      alert("สิทธิ์ปฏิเสธ: เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขข้อมูลนี้ได้");
      return;
    }

    try {
      // 1. อัปเดต State ในหน้าจอหลัก (Frontend) ทันที
      setUser(tempUser);
      
      // 2. บันทึกลง localStorage (เพื่อให้หน้าอื่นๆ ที่เป็นแอดมินอัปเดตตาม)
      const empId = tempUser.employeeId || tempUser.id;
      const dataToSave = {
        id: empId,
        name: tempUser.name,
        email: tempUser.email,
        dept: tempUser.department || tempUser.dept || "ทั่วไป",
        role: tempUser.role,
        phone: tempUser.phone,
        avatar: tempUser.avatar
      };
      
      localStorage.setItem("pea-admin-user", JSON.stringify(dataToSave));
      
      alert("บันทึกข้อมูลผู้ดูแลระบบสำเร็จ (Local Update)");
      onClose();
    } catch (err) {
      console.error("Save Error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-bold text-left animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 lg:p-12 relative animate-in zoom-in duration-300">
        {/* ปุ่มปิด */}
        <button 
          onClick={onClose} 
          className="absolute right-8 top-8 lg:right-10 lg:top-10 w-10 h-10 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center hover:bg-rose-50 rounded-full"
        >
          <FiX size={24} />
        </button>

        <h3 className="text-2xl font-black text-slate-800 mb-10 uppercase tracking-tight border-l-8 border-indigo-600 pl-4">
          แก้ไขข้อมูลผู้ดูแลระบบ
        </h3>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* ส่วนรูปภาพ */}
          <div className="flex flex-col items-center text-center shrink-0">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <img 
                src={tempUser.avatar || "https://i.pravatar.cc/150?u=admin"} 
                alt="preview" 
                className="w-48 h-48 rounded-[3.5rem] object-cover ring-8 ring-indigo-50 shadow-xl group-hover:ring-indigo-100 transition-all" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3.5rem] text-white">
                <FiCamera size={40} className="drop-shadow-md" />
              </div>
              <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
            </div>
            <div className="mt-6 space-y-1">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                {tempUser.employeeId || tempUser.id}
              </span>
              <p className="text-slate-400 text-[10px] mt-2 font-bold italic">กดที่รูปเพื่อเปลี่ยนภาพโปรไฟล์</p>
            </div>
          </div>

          {/* ส่วนฟอร์มข้อมูล */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
                  <input type="text" value={tempUser.name || ""} onChange={(e) => setTempUser({...tempUser, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1">ระดับสิทธิ์ / ตำแหน่ง</label>
                  <input type="text" value={tempUser.role || ""} onChange={(e) => setTempUser({...tempUser, role: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1">อีเมลติดต่องาน</label>
                  <input type="text" value={tempUser.email || ""} onChange={(e) => setTempUser({...tempUser, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
                  <input type="text" value={tempUser.phone || ""} onChange={(e) => setTempUser({...tempUser, phone: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold" />
                </div>
            </div>
            
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">สังกัดหน่วยงาน</h4>
              <p className="text-slate-800 font-bold">{tempUser.department || tempUser.dept || "ไม่ระบุ"}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 bg-white border-2 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSave} 
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                <FiCheck size={18} /> บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}