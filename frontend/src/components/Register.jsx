import React, { useState } from "react";
import { FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi"; 
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ฟอร์ม
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [gender,    setGender]    = useState("");
  const [password,  setPassword]  = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // สถานะการสมัคร
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [successMsg,setSuccessMsg]= useState("");

  const navigate = useNavigate();

  // ฟังก์ชันคำนวณความแข็งแรงของรหัสผ่าน
  const getPasswordScore = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score; 
  };

  const score = getPasswordScore(password);

  const strengthLabel = (() => {
    if (!password) return "";
    if (score <= 1) return "รหัสผ่านอ่อน (ควรปรับให้ปลอดภัยขึ้น)";
    if (score <= 3) return "รหัสผ่านปานกลาง (แนะนำให้เพิ่มอักขระพิเศษหรือผสมตัวพิมพ์)";
    return "รหัสผ่านปลอดภัยมาก";
  })();

  const strengthColor = (() => {
    if (!password) return "bg-gray-200";
    if (score <= 1) return "bg-red-500";
    if (score <= 3) return "bg-amber-500";
    return "bg-emerald-500";
  })();

  const strengthWidth = (() => {
    if (!password) return "w-0";
    if (score <= 1) return "w-1/3";
    if (score <= 3) return "w-2/3";
    return "w-full";
  })();

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg("");
  setSuccessMsg("");

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    setErrorMsg("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
    return;
  }

  if (password !== confirmPassword) {
    setErrorMsg("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
    return;
  }

  if (password.length < 8) {
    setErrorMsg("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    return;
  }

  try {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/register-public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        gender,
        password,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(data.message || "ไม่สามารถสมัครสมาชิกได้");
      return;
    }

    setSuccessMsg("สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setGender("");
    setPassword("");
    setConfirmPassword("");

  } catch (err) {
    console.error("Register Error:", err);
    setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C79AF7] via-[#E4D5FB] to-[#B4E3FF] flex flex-col items-center justify-center px-4 py-8">
      
      {/* ปุ่ม Back อยู่นอกกรอบสีขาว */}
      <div className="w-full max-w-4xl mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-700 hover:text-[#6366F1] transition-all duration-200 font-bold text-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shadow-sm group-hover:bg-white group-hover:shadow-md transition-all">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
          </div>
          กลับหน้าแรก
        </Link>
      </div>

      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/70 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-6 md:px-10 md:py-8 bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#0EA5E9]">
          <h1 className="text-center text-2xl md:text-3xl font-semibold text-white drop-shadow-sm">
            สมัครสมาชิก
          </h1>
          <p className="mt-2 text-center text-xs md:text-sm text-white/80">
            กรอกข้อมูลให้ครบถ้วนเพื่อสร้างบัญชีผู้ใช้งานระบบเอกสารภายใน
          </p>
        </div>

        {/* ฟอร์มสมัครสมาชิก */}
        <div className="px-6 py-4 md:px-10">
          <form
            onSubmit={handleSubmit}
            className="py-6 space-y-6"
          >
            {errorMsg && (
              <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-left">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-left">
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5 text-left">
                  ชื่อจริง (First Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300/80 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition"
                  placeholder="เช่น สมชาย"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5 text-left">
                  นามสกุล (Last Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300/80 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition"
                  placeholder="เช่น ใจดี"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5 text-left">
                  อีเมล (Email) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300/80 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5 text-left">
                  เบอร์โทรศัพท์ (Phone No.)
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300/80 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition"
                  placeholder="0812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5 text-left">
                  รหัสผ่าน (Password) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border border-gray-300/80 rounded-lg px-3.5 py-2.5 pr-11 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className={`${strengthColor} ${strengthWidth} h-2 transition-all duration-300`} />
                    </div>
                    <p className="text-[11px] text-gray-600 text-left">{strengthLabel}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5 text-left">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full border border-gray-300/80 rounded-lg px-3.5 py-2.5 pr-11 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-md">
              <label className="block text-sm font-semibold text-[#111827] mb-1.5 text-left">
                เพศ (Gender)
              </label>
              <select
                className="w-full border border-gray-300/80 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">-- เลือกเพศ --</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่น ๆ</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-2" />

            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-3 md:gap-4">
              <p className="text-xs md:text-sm text-gray-600">
                มีบัญชีอยู่แล้ว?{" "}
                <Link to="/loginpublic" className="text-[#4F46E5] hover:text-[#3730A3] font-semibold">เข้าสู่ระบบ</Link>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="min-w-[120px] bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 rounded-full shadow-sm text-sm transition-all duration-200"
                  onClick={() => {
                    setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setGender("");
                    setPassword(""); setConfirmPassword(""); setErrorMsg(""); setSuccessMsg("");
                  }}
                >
                  ล้างข้อมูล
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`min-w-[130px] bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-semibold py-2.5 rounded-full shadow-md text-sm transition-all duration-200 ${loading ? "opacity-70 cursor-not-allowed" : "hover:from-[#15803D] hover:to-[#16A34A]"}`}
                >
                  {loading ? "กำลังบันทึก..." : "ตกลง"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;