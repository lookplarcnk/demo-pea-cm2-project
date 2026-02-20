import React, { useState, useEffect } from "react"; 
import { FiUser, FiKey, FiMail, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi"; // ✅ เพิ่ม FiEye, FiEyeOff
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
  const [showPassword, setShowPassword] = useState(false); // ✅ เพิ่ม State สำหรับเปิดปิดรหัสผ่าน
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

  /* ================= ส่วนเข้าสู่ระบบ: ปรับปรุงเพื่อแยกประเภทผู้ใช้และป้องกันการโผล่หน้าบุคคลทั่วไป ================= */
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); 
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

      // จัดการส่วน Remember Me สำหรับ Admin
      if (rememberMe) {
        localStorage.setItem("admin_remember_email", email);
        localStorage.setItem("admin_remember_password", password);
      } else {
        localStorage.removeItem("admin_remember_email");
        localStorage.removeItem("admin_remember_password");
      }

      // ✅ ล้างข้อมูลของพนักงานและบุคคลทั่วไปออกทันที เพื่อป้องกันสิทธิ์การใช้งานทับซ้อนกัน
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("public_user");
      localStorage.removeItem("public_token");

      localStorage.setItem("pea-admin-token", data.token);
      localStorage.setItem("pea-admin-user", JSON.stringify({
        ...data.user,
        avatar: userStaff,
        userType: "admin" // ✅ ระบุประเภทชัดเจนว่าเป็นแอดมิน
      }));

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      setTimeout(() => {
        // ✅ บังคับ Redirect ไปหน้า Dashboard ของ Admin เท่านั้น และล้างประวัติหน้าล็อกอิน
        navigate("/AdminDashboard", { replace: true });
      }, 500); 
      
    } catch (err) {
      setLoginError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ฐานข้อมูลได้");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C79AF7] via-[#E4D5FB] to-[#B4E3FF] flex items-center justify-center relative overflow-hidden text-left font-medium">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-3xl opacity-40" />

      <div className="relative w-full max-w-3xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 px-6 py-10 md:px-10 md:py-12 text-left">
        
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

        <form 
          action="#" 
          method="POST" 
          className="max-w-md mx-auto space-y-4 text-left" 
          onSubmit={handleLoginSubmit}
        >
          <div className={`flex items-center bg-white/90 border rounded-lg px-3 py-2 shadow-sm transition ${loginError && !email ? "border-red-400" : "border-gray-300 focus-within:border-[#6D28D9]"} text-left`}>
            <FiUser className="text-gray-500 mr-2" />
            <input
              type="email"
              name="username" 
              placeholder="Email"
              className="w-full bg-transparent outline-none text-sm text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username" 
              required
            />
          </div>

          <div className={`flex items-center bg-white/90 border rounded-lg px-3 py-2 shadow-sm transition ${loginError && email && !password ? "border-red-400" : "border-gray-300 focus-within:border-[#6D28D9]"} text-left`}>
            <FiKey className="text-gray-500 mr-2" />
            <input
              type={showPassword ? "text" : "password"} // ✅ เปลี่ยน type ตาม State
              name="password" 
              placeholder="Password"
              className="w-full bg-transparent outline-none text-sm text-left"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" 
              required
            />
            {/* ✅ ปุ่มเปิดปิดรหัสผ่าน */}
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-[#6D28D9] focus:outline-none ml-2"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          {loginError && <p className="mt-2 text-xs md:text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded-md py-2 px-3 text-center">{loginError}</p>}

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
            className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all mt-4 text-center"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
      
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 text-left">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative text-left">
              <button onClick={closeResetModal} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              <h2 className="text-lg md:text-xl font-semibold text-[#111827] mb-1 text-left">ลืมรหัสผ่าน</h2>
              <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 text-left">อีเมล (Email)</label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#6366F1] transition text-left">
                    <FiMail className="text-gray-500 mr-2" />
                    <input type="email" className="w-full outline-none text-sm bg-transparent" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1 text-left">
                  <button type="button" onClick={closeResetModal} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 text-center">ยกเลิก</button>
                  <button type="submit" disabled={sending || !resetEmail} className={`px-5 py-2 rounded-full text-sm font-semibold text-white shadow-md ${sending || !resetEmail ? "bg-gray-400" : "bg-[#2563EB] hover:bg-[#1D4ED8]"} text-center`}>
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