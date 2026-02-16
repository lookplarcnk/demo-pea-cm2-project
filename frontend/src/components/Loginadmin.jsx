import React, { useState, useEffect } from "react"; 
import { FiUser, FiKey, FiMail, FiArrowLeft } from "react-icons/fi"; 
import { useNavigate, Link } from "react-router-dom"; 
import userStaff from "../assets/img/user-admin.jpg";

function Loginadmin() {
  const navigate = useNavigate(); 
  
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_remember_email");
    const savedPassword = localStorage.getItem("admin_remember_password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

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
    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        const token = data.resetLink.split('/').pop(); 
        setShowResetModal(false);
        navigate(`/reset-password/${token}`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setSending(false);
    }
  };

  /* ================= ส่วนเข้าสู่ระบบ: ปรับปรุงเทคนิคการเรียก Pop-up ================= */
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); // ✅ ยับยั้งการ Refresh หน้า แต่ Browser จะเริ่มบันทึกฟอร์มที่นี่
    setLoginError("");

    if (!email || !password) {
      setLoginError("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/employees/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), 
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (data.user.role !== "Admin") {
        setLoginError("บัญชีนี้ไม่มีสิทธิ์เข้าถึงส่วนของผู้ดูแลระบบ");
        return;
      }

      // บันทึก Remember Me ภายใน
      if (rememberMe) {
        localStorage.setItem("admin_remember_email", email);
        localStorage.setItem("admin_remember_password", password);
      } else {
        localStorage.removeItem("admin_remember_email");
        localStorage.removeItem("admin_remember_password");
      }

      localStorage.setItem("pea-admin-token", data.token);
      localStorage.setItem("pea-admin-user", JSON.stringify({
        ...data.user,
        avatar: userStaff, 
      }));

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // ✅ เทคนิคสำคัญ: เปลี่ยน Focus ออกจาก Input ก่อนเปลี่ยนหน้า เพื่อกระตุ้นให้ Browser ปิด Job การป้อนข้อมูล
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // ✅ เพิ่มดีเลย์เพื่อให้ Browser "รับรู้" การส่งค่าสำเร็จของฟอร์ม HTML ก่อนที่ React จะทำลาย Component
      setTimeout(() => {
        navigate("/AdminDashboard");
      }, 500); // เพิ่มเป็น 500ms เพื่อความแน่นอน
      
    } catch (err) {
      setLoginError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ฐานข้อมูลได้");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C79AF7] via-[#E4D5FB] to-[#B4E3FF] flex items-center justify-center relative overflow-hidden text-left font-medium">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-3xl opacity-40" />

      <div className="relative w-full max-w-3xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 px-6 py-10 md:px-10 md:py-12">
        
        <Link 
          to="/loginchoice" 
          className="absolute left-6 top-6 flex items-center gap-2 text-gray-500 hover:text-[#7C3AED] transition-colors duration-200 font-semibold text-sm group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          ย้อนกลับ
        </Link>

        <h1 className="text-center text-2xl md:text-3xl font-semibold mb-6 text-[#3B0764]">
          เข้าสู่ระบบสำหรับผู้ดูแลระบบ
        </h1>

        <div className="flex justify-center mb-8">
          <img src={userStaff} alt="Admin" className="w-32 h-32 md:w-36 md:h-36 object-contain drop-shadow-lg rounded-full" />
        </div>

        {/* ✅ เพิ่ม action และ method ปลอม เพื่อหลอกให้เบราว์เซอร์มั่นใจว่าเป็น Form มาตรฐาน */}
        <form 
          action="#" 
          method="POST" 
          className="max-w-md mx-auto space-y-4 text-left" 
          onSubmit={handleLoginSubmit}
        >
          <div className={`flex items-center bg-white/90 border rounded-lg px-3 py-2 shadow-sm transition ${loginError && !email ? "border-red-400" : "border-gray-300 focus-within:border-[#6D28D9]"}`}>
            <FiUser className="text-gray-500 mr-2" />
            <input
              type="email"
              name="username" // ✅ เปลี่ยนเป็น username เพื่อความเข้ากันได้สูงกับ Password Manager
              placeholder="Email"
              className="w-full bg-transparent outline-none text-sm text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username" 
              required
            />
          </div>

          <div className={`flex items-center bg-white/90 border rounded-lg px-3 py-2 shadow-sm transition ${loginError && email && !password ? "border-red-400" : "border-gray-300 focus-within:border-[#6D28D9]"}`}>
            <FiKey className="text-gray-500 mr-2" />
            <input
              type="password"
              name="password" // ✅ name ต้องมีเสมอ
              placeholder="Password"
              className="w-full bg-transparent outline-none text-sm text-left"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" 
              required
            />
          </div>

          {loginError && <p className="mt-2 text-xs md:text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded-md py-2 px-3">{loginError}</p>}

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
            <button type="button" onClick={openResetModal} className="text-[#6D28D9] hover:text-[#4C1D95] font-medium">Forgot Password?</button>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all mt-4"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
      
      {/* Reset Modal (คงเดิม) */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button onClick={closeResetModal} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              <h2 className="text-lg md:text-xl font-semibold text-[#111827] mb-1">ลืมรหัสผ่าน</h2>
              <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล (Email)</label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#6366F1] transition">
                    <FiMail className="text-gray-500 mr-2" />
                    <input type="email" className="w-full outline-none text-sm bg-transparent" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={closeResetModal} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100">ยกเลิก</button>
                  <button type="submit" disabled={sending || !resetEmail} className={`px-5 py-2 rounded-full text-sm font-semibold text-white shadow-md ${sending || !resetEmail ? "bg-gray-400" : "bg-[#2563EB] hover:bg-[#1D4ED8]"}`}>
                    {sending ? "กำลังส่ง..." : "ถัดไป"}
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default Loginadmin;