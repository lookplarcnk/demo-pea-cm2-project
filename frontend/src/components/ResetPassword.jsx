import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiLock, FiCheckCircle } from "react-icons/fi";

function ResetPassword() {
  const { token } = useParams(); // รับ token จาก URL (เช่น /reset-password/abcd123...)
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ล้างข้อความแจ้งเตือนเก่า
    setMessage({ type: "", text: "" });

    // ตรวจสอบความยาวรหัสผ่าน
    if (password.length < 8) {
      setMessage({ type: "error", text: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านไม่ตรงกัน" });
      return;
    }

    try {
      setLoading(true);
      // ส่ง token และรหัสใหม่ไปที่ Backend (รองรับทั้งบุคคลทั่วไปและพนักงานผ่าน API เดียวกัน)
      const res = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        // กรณีบันทึกสำเร็จ (Backend อัปเดตตาราง public.public_users หรือ public.employees ให้แล้ว)
        setMessage({ type: "success", text: "เปลี่ยนรหัสผ่านสำเร็จแล้ว! กำลังพากลับไปหน้าเข้าสู่ระบบ..." });
        
        // รอ 3 วินาทีเพื่อให้ผู้ใช้เห็นข้อความสำเร็จก่อนย้ายหน้า
        setTimeout(() => navigate("/loginchoice"), 3000);
      } else {
        // กรณี token หมดอายุ, ถูกใช้ไปแล้ว หรือผิดพลาดจาก server
        setMessage({ type: "error", text: data.message || "ลิงก์หมดอายุหรือใช้งานไม่ได้" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C79AF7] via-[#E4D5FB] to-[#B4E3FF] flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md border border-white">
        <h2 className="text-2xl font-bold text-[#3B0764] mb-2 text-center">ตั้งรหัสผ่านใหม่</h2>
        <p className="text-gray-600 text-sm text-center mb-6">กรุณากรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#6D28D9]">
              <FiLock className="text-gray-400 mr-2" />
              <input
                type="password"
                className="w-full outline-none text-sm"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#6D28D9]">
              <FiLock className="text-gray-400 mr-2" />
              <input
                type="password"
                className="w-full outline-none text-sm"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {message.type === "success" && <FiCheckCircle />}
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold py-3 rounded-lg shadow-md transition-all disabled:bg-gray-400"
          >
            {loading ? "กำลังบันทึก..." : "อัปเดตรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;