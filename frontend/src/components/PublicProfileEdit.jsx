import React, { useState, useRef } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiArrowLeft,
  FiSave,
  FiCamera,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function PublicProfileEdit() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    firstName: storedUser?.firstName || "",
    lastName: storedUser?.lastName || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    avatar: storedUser?.avatar || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===== Upload Avatar ===== */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updatedUser = { ...storedUser, ...form };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("บันทึกข้อมูลเรียบร้อย");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 p-6">
      <div className="max-w-xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-purple-700 mb-4 hover:underline"
        >
          <FiArrowLeft /> กลับหน้าแรก
        </button>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-white/60 p-6">

          {/* Avatar Upload */}
          <div className="flex justify-center mb-6 relative">
            <div
              onClick={() => fileRef.current.click()}
              className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center cursor-pointer group relative"
            >
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="text-purple-700 text-5xl" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <FiCamera className="text-white text-2xl" />
              </div>
            </div>

            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <h1 className="text-xl font-bold text-center text-purple-800 mb-6">
            แก้ไขโปรไฟล์บุคคลทั่วไป
          </h1>

          {/* Form */}
          <div className="space-y-4">

            <div>
              <label className="text-sm text-gray-600">ชื่อจริง (First Name)</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-white mt-1">
                <FiUser className="text-gray-400 mr-2" />
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">นามสกุล (Last Name)</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-white mt-1">
                <FiUser className="text-gray-400 mr-2" />
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">อีเมล (Email)</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100 mt-1">
                <FiMail className="text-gray-400 mr-2" />
                <input
                  value={form.email}
                  disabled
                  className="w-full outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">เบอร์โทร (Phone No.)</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-white mt-1">
                <FiPhone className="text-gray-400 mr-2" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition"
          >
            <FiSave /> บันทึกข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublicProfileEdit;
