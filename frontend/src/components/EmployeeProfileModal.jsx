import React, { useState, useRef } from "react";
import { FiX, FiCamera, FiCheck } from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export default function EmployeeProfileModal({ user, setUser, onClose }) {
  // ✅ แก้ไข: ดักจับชื่อตัวแปรที่อาจต่างกันในแต่ละหน้า (name vs fullName, department vs dept)
  const [tempUser, setTempUser] = useState({
    ...user,
    name: user.name || user.fullName || "",
    email: user.email || user.emp_email || "",
    phone: user.phone || user.emp_phone || "",
    department: user.department || user.dept || user.dept_name || "ไม่ระบุ",
    role: user.role || "พนักงานทั่วไป",
    employeeId: user.employeeId || `PEA-${user.id || user.emp_id || "STAFF"}`
  });
  
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSave = async () => {
    const empId = tempUser.id || tempUser.emp_id || tempUser.employeeId?.replace('PEA-', '');
    try {
      setIsSaving(true);
      // ส่งข้อมูลลงฐานข้อมูลจริง
      await axios.put(`${API_BASE_URL}/employees/${empId}`, {
        emp_name: tempUser.name,
        emp_email: tempUser.email,
        emp_phone: tempUser.phone,
        avatar: tempUser.avatar
      });

      // อัปเดตกลับไปยังหน้าหลัก
      setUser(tempUser);
      localStorage.setItem("user", JSON.stringify(tempUser));
      
      alert("บันทึกการเปลี่ยนแปลงสำเร็จ");
      onClose();
    } catch (err) {
      console.error("Save Error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 font-bold text-left animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 lg:p-12 relative animate-in zoom-in duration-300">
        
        <button onClick={onClose} className="absolute right-8 top-8 lg:right-10 lg:top-10 w-10 h-10 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center hover:bg-rose-50 rounded-full">
          <FiX size={24} />
        </button>

        {/* ✅ ล็อคหัวข้อให้เหมือนกันทุกหน้า */}
        <h3 className="text-2xl font-black text-slate-800 mb-10 uppercase tracking-tight border-l-8 border-indigo-600 pl-4 text-left">
          แก้ไขข้อมูลส่วนตัวพนักงาน
        </h3>

        <div className="flex flex-col lg:flex-row gap-12 text-left">
          <div className="flex flex-col items-center text-center shrink-0 text-left">
            <div className="relative group cursor-pointer text-left" onClick={() => fileInputRef.current.click()}>
              <img src={tempUser.avatar || "https://i.pravatar.cc/150?u=staff"} alt="preview" className="w-48 h-48 rounded-[3.5rem] object-cover ring-8 ring-indigo-50 shadow-xl group-hover:ring-indigo-100 transition-all" />
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3.5rem] text-white">
                <FiCamera size={40} className="drop-shadow-md" />
              </div>
              <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
            </div>
            <div className="mt-6 space-y-1 text-left text-center">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                {tempUser.employeeId}
              </span>
              <p className="text-slate-400 text-[10px] mt-2 font-bold italic">กดที่รูปเพื่อเปลี่ยนภาพโปรไฟล์</p>
            </div>
          </div>

          <div className="flex-1 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-2 text-left">
                  <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
                  <input type="text" value={tempUser.name} onChange={(e) => setTempUser({...tempUser, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold" />
                </div>
                <div className="space-y-2 text-left">
                  {/* ✅ ล็อคชื่อหัวข้อเป็น "สิทธิ์การใช้งาน" ให้เหมือนกัน */}
                  <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1">สิทธิ์การใช้งาน</label>
                  <div className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-slate-500 text-lg font-bold uppercase">{tempUser.role}</div>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1">อีเมลติดต่องาน</label>
                  <input type="email" value={tempUser.email} onChange={(e) => setTempUser({...tempUser, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold" />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
                  <input type="text" value={tempUser.phone} onChange={(e) => setTempUser({...tempUser, phone: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold" />
                </div>
            </div>
            
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 font-bold text-left">สังกัดหน่วยงาน / แผนก</h4>
              <p className="text-slate-800 font-bold text-left">{tempUser.department}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 text-left">
              <button type="button" onClick={onClose} className="flex-1 bg-white border-2 border-slate-100 text-slate-400 hover:text-rose-500 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs">ยกเลิก</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                {isSaving ? "กำลังบันทึก..." : <><FiCheck size={18} /> บันทึกการเปลี่ยนแปลง</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}