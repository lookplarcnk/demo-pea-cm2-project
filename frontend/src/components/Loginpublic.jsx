import React, { useState } from "react";
import { FiUser, FiKey, FiMail, FiArrowLeft } from "react-icons/fi";
import userPublic from "../assets/img/user-public.png";
import { useNavigate, Link } from "react-router-dom";

function Loginpublic() {
  const navigate = useNavigate();

  /* ================= State ================= */
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= Reset Password (แก้ไขเฉพาะส่วนนี้) ================= */
  /* ================= Reset Password (แก้ไขเฉพาะส่วนนี้) ================= */
  const openResetModal = () => {
    setResetEmail("");
    setSuccessMsg("");
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setSending(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;

    setSending(true);
    setSuccessMsg(""); 
    
    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      
      const data = await res.json();

      if (res.ok) {
        // ดึง token จาก resetLink ที่ backend ส่งมา 
        // เช่น "http://localhost:5173/reset-password/abcdef123..."
        const token = data.resetLink.split('/').pop(); 

        setSuccessMsg("ตรวจสอบข้อมูลสำเร็จ กำลังพาคุณไปหน้าเปลี่ยนรหัสผ่าน...");
        
        // รอ 2 วินาทีเพื่อให้ผู้ใช้เห็นข้อความ แล้วเปลี่ยนหน้าไปยัง ResetPassword.jsx
        setTimeout(() => {
          setShowResetModal(false);
          navigate(`/reset-password/${token}`);
        }, 2000);

      } else {
        alert(data.message || "ไม่พบอีเมลนี้ในระบบ");
      }
    } catch (err) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่ภายหลัง");
    } finally {
      setSending(false);
    }
  };
  /* ================= Login (คงเดิม) ================= */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/login-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data.user,
          role: "public",
        })
      );

      navigate("/");
    } catch (err) {
      setLoginError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C79AF7] via-[#E4D5FB] to-[#B4E3FF] flex items-center justify-center relative overflow-hidden">

      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-3xl opacity-40" />
      
      <div className="relative w-full max-w-3xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 px-6 py-10 md:px-10 md:py-12">

        <Link 
          to="/loginchoice" 
          className="absolute left-6 top-6 flex items-center gap-2 text-gray-500 hover:text-[#2563EB] transition-colors duration-200 font-semibold text-sm group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          ย้อนกลับ
        </Link>

        <h1 className="text-center text-2xl md:text-3xl font-semibold mb-6 text-[#3B0764]">
          เข้าสู่ระบบสำหรับบุคคลทั่วไป
        </h1>

        <div className="flex justify-center mb-8">
          <img
            src={userPublic}
            alt="Public User"
            className="w-32 md:w-36 drop-shadow-lg"
          />
        </div>

        <form
          className="max-w-md mx-auto space-y-4"
          onSubmit={handleLoginSubmit}
        >

        <div className={`flex items-center bg-white/90 border rounded-lg px-3 py-2 shadow-sm transition
        ${
          loginError && !email
          ? "border-red-400 focus-within:border-red-500"
          : "border-gray-300 focus-within:border-[#6D28D9]"
        }`}
        >
          <FiUser className="text-gray-500 mr-2" />
          <input
          type="email"
          placeholder="Email"
          className="w-full bg-transparent outline-none text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />
          </div>

          <div className={`flex items-center bg-white/90 border rounded-lg px-3 py-2 shadow-sm transition
          ${
            loginError && email && !password
            ? "border-red-400 focus-within:border-red-500"
            : "border-gray-300 focus-within:border-[#6D28D9]"
          }`}
          >
            <FiKey className="text-gray-500 mr-2" />
            <input
            type="password"
            placeholder="Password"
            className="w-full bg-transparent outline-none text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            </div>

          <div className="flex items-center justify-between text-xs md:text-sm mt-2">
            <label className="inline-flex items-center">
              <input type="checkbox" className="mr-1 accent-[#6D28D9]" />
              <span className="text-gray-700">Remember Me</span>
            </label>

            <button
              type="button"
              onClick={openResetModal}
              className="text-[#6D28D9] hover:text-[#4C1D95] font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all mt-4"
          >
            เข้าสู่ระบบ
          </button>

          {loginError && (
            <p className="mt-2 text-xs md:text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded-md py-2 px-3">
              {loginError}
            </p>
          )}
        </form>
      </div>
      
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={closeResetModal}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>

            <h2 className="text-lg md:text-xl font-semibold text-[#111827] mb-1">
              ลืมรหัสผ่าน
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mb-4">
              กรุณากรอกอีเมลของคุณเพื่อดำเนินการรีเซ็ตรหัสผ่าน
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  อีเมล (Email)
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#6366F1] transition">
                  <FiMail className="text-gray-500 mr-2" />
                  <input
                    type="email"
                    className="w-full outline-none text-sm bg-transparent"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={sending || !resetEmail}
                  className={`px-5 py-2 rounded-full text-sm font-semibold text-white shadow-md
                    ${
                      sending || !resetEmail
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#2563EB] hover:bg-[#1D4ED8]"
                    }`}
                >
                  {sending ? "กำลังตรวจสอบ..." : "ถัดไป"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Loginpublic;