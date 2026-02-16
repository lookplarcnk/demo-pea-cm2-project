import React, { useState, useEffect } from "react"; 
import { FiUser, FiKey, FiMail, FiArrowLeft, FiX } from "react-icons/fi"; 
import userPublic from "../assets/img/user-public.png";
import { useNavigate, Link } from "react-router-dom";

function Loginpublic() {
  const navigate = useNavigate();

  /* ================= State (ครบถ้วนห้ามหาย) ================= */
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 1. ดึงข้อมูลที่จำไว้มาแสดงผลทันทีที่เปิดหน้า (Persistent Storage)
  useEffect(() => {
    const savedEmail = localStorage.getItem("pub_remember_email");
    const savedPassword = localStorage.getItem("pub_remember_password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  /* ================= Reset Password Section (ครบถ้วนห้ามหาย) ================= */
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

  /* ================= Login Section (ปรับปรุงเพื่อให้ Browser เด้ง Pop-up บันทึกรหัส) ================= */
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); // ✅ ยับยั้งการ Refresh แต่บอก Browser ว่าเริ่มกระบวนการ Submit ฟอร์ม
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

      // ✅ จัดการส่วน Remember Me ภายในเบราว์เซอร์
      if (rememberMe) {
        localStorage.setItem("pub_remember_email", email);
        localStorage.setItem("pub_remember_password", password);
      } else {
        localStorage.removeItem("pub_remember_email");
        localStorage.removeItem("pub_remember_password");
      }

      // ✅ บันทึก Session Token และข้อมูลผู้ใช้
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data.user,
          role: "public",
        })
      );

      // ✅ เทคนิคพิเศษ: ถอนโฟกัสออกจาก Input ก่อนเปลี่ยนหน้าเพื่อให้ Browser ปิด Job และเด้ง Pop-up "Save Password"
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // ✅ ดีเลย์เล็กน้อย 500ms เพื่อให้ Browser มีเวลาประมวลผลข้อมูลฟอร์มก่อนที่ React จะลบหน้าจอนี้ทิ้ง
      setTimeout(() => {
        navigate("/");
      }, 500);

    } catch (err) {
      setLoginError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C79AF7] via-[#E4D5FB] to-[#B4E3FF] flex items-center justify-center relative overflow-hidden text-left">

      {/* Decorative Circles */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-3xl opacity-40" />
      
      <div className="relative w-full max-w-3xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 px-6 py-10 md:px-10 md:py-12 text-left">

        <Link 
          to="/loginchoice" 
          className="absolute left-6 top-6 flex items-center gap-2 text-gray-500 hover:text-[#2563EB] transition-colors duration-200 font-semibold text-sm group text-left"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          ย้อนกลับ
        </Link>

        <h1 className="text-center text-2xl md:text-3xl font-semibold mb-6 text-[#3B0764] text-center">
          เข้าสู่ระบบสำหรับบุคคลทั่วไป
        </h1>

        <div className="flex justify-center mb-8">
          <img src={userPublic} alt="Public User" className="w-32 md:w-36 drop-shadow-lg" />
        </div>

        {/* ✅ หัวใจสำคัญ: ใช้ <form> พร้อม action ปลอม และ method="POST" เพื่อกระตุ้นระบบ Save Password ของเบราว์เซอร์ */}
        <form action="#" method="POST" className="max-w-md mx-auto space-y-4 text-left" onSubmit={handleLoginSubmit}>
          
          <div className={`flex items-center bg-white/90 border rounded-lg px-3 py-2 shadow-sm transition ${loginError && !email ? "border-red-400 focus-within:border-red-500" : "border-gray-300 focus-within:border-[#6D28D9]"} text-left`}>
            <FiUser className="text-gray-500 mr-2" />
            <input
              type="email"
              name="username" // ✅ จำเป็นเพื่อให้ Password Manager จำฟิลด์ได้
              placeholder="Email"
              className="w-full bg-transparent outline-none text-sm text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username" // ✅ บอกเบราว์เซอร์ว่านี่คือชื่อผู้ใช้
              required
            />
          </div>

          <div className={`flex items-center bg-white/90 border rounded-lg px-3 py-2 shadow-sm transition ${loginError && email && !password ? "border-red-400 focus-within:border-red-500" : "border-gray-300 focus-within:border-[#6D28D9]"} text-left`}>
            <FiKey className="text-gray-500 mr-2" />
            <input
              type="password"
              name="password" // ✅ จำเป็นเพื่อให้ Password Manager จำฟิลด์ได้
              placeholder="Password"
              className="w-full bg-transparent outline-none text-sm text-left"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" // ✅ บอกเบราว์เซอร์ว่านี่คือรหัสผ่าน
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs md:text-sm mt-2 text-left">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="mr-1 accent-[#6D28D9]" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-gray-700">Remember Me</span>
            </label>

            <button type="button" onClick={openResetModal} className="text-[#6D28D9] hover:text-[#4C1D95] font-medium text-left">
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all mt-4 text-center"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          {loginError && <p className="mt-2 text-xs md:text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded-md py-2 px-3 text-center">{loginError}</p>}
        </form>
      </div>
      
      {/* ================= Reset Modal (ครบถ้วนทุกบรรทัด) ================= */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 text-left">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative text-left">
            <button onClick={closeResetModal} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl leading-none text-left">×</button>

            <h2 className="text-lg md:text-xl font-semibold text-[#111827] mb-1 text-left">ลืมรหัสผ่าน</h2>
            <p className="text-xs md:text-sm text-gray-600 mb-4 text-left">กรุณากรอกอีเมลของคุณเพื่อดำเนินการรีเซ็ตรหัสผ่าน</p>

            <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-left">อีเมล (Email)</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#6366F1] transition text-left">
                  <FiMail className="text-gray-500 mr-2 text-left" />
                  <input
                    type="email"
                    className="w-full outline-none text-sm bg-transparent text-left"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {successMsg && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-left">{successMsg}</p>}

              <div className="flex justify-end gap-2 pt-1 text-left">
                <button type="button" onClick={closeResetModal} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 text-center">ยกเลิก</button>
                <button type="submit" disabled={sending || !resetEmail} className={`px-5 py-2 rounded-full text-sm font-semibold text-white shadow-md text-center ${sending || !resetEmail ? "bg-gray-400 cursor-not-allowed" : "bg-[#2563EB] hover:bg-[#1D4ED8]"}`}>
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