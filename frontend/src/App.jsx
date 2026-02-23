import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Docscategories from "./components/Docscategories";
import Mostdownloaddocs from "./components/Mostdownloaddocs";
import DocsLastedUpdate from "./components/DocsLastedUpdate";
import Footer from "./components/Footer";

// นำเข้าคอมโพเนนต์เพิ่มเติม
import AllDocumentsPage from "./components/AllDocumentsPage";
import ContactPage from "./components/ContactPage";

function App() {
  return (
      <Routes>
        {/* หน้าหลัก (Home) */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Header />
              <Docscategories />
              <Mostdownloaddocs />
              <DocsLastedUpdate />
              <Footer />
            </>
          }
        />

        {/* ✅ ตรวจสอบ Path ให้ตรงกับที่เรียกใช้งานจริง */}
        <Route
          path="/AllDocuments"
          element={<AllDocumentsPage />}
        />

        {/* ✅ ปรับ Path เป็น /ContactPage เพื่อให้ตรงกับโครงสร้างที่ระบุไว้ก่อนหน้า */}
        <Route
          path="/ContactPage"
          element={<ContactPage />}
        />

        {/* หมายเหตุ: ส่วนของ Route อื่นๆ เช่น /SearchDocumentsPage1 
           ถูกจัดการในไฟล์ main.jsx เรียบร้อยแล้ว 
        */}
      </Routes>
  );
}

export default App;