import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Loginchoice from "./components/Loginchoice.jsx";
import Loginemployee from "./components/Loginemployee.jsx";
import Loginadmin from "./components/Loginadmin.jsx";
import Loginpublic from "./components/Loginpublic.jsx";
import Register from "./components/Register.jsx";
import PublicProfileEdit from "./components/PublicProfileEdit.jsx";
import EmployeeDashboard from "./components/EmployeeDashboard.jsx";
import EmpDownloadDocs from "./components/EmpDownloadDocs.jsx";
import EmployeeUsageHistory from "./components/EmpUseHistory.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import UserManagementPage from "./components/UserManage.jsx";
import AnalyticalReportPage from "./components/AnalysisReport.jsx";
import SystemSettingsPage from "./components/AdminSetting.jsx";
import DocumentSubmissionCenter from "./components/SubmitDocsApprov.jsx";
import EmployeeSettingsPage from "./components/EmpSetting.jsx";
import ManageDocs from "./components/ManageDocs.jsx";
import SearchDocumentsPage1 from "./components/SearchDocumentsPage1.jsx";
import SearchDocumentsPage2 from "./components/SearchDocumentsPage2.jsx";
import SearchDocumentsPage3 from "./components/SearchDocumentsPage3.jsx";
import SearchDocumentsPage4 from "./components/SearchDocumentsPage4.jsx"; 
import SearchDocumentsPage5 from "./components/SearchDocumentsPage5.jsx"; 
import SearchDocumentsPage6 from "./components/SearchDocumentsPage6.jsx"; 
import ResetPassword from "./components/ResetPassword.jsx";

// ✅ 1. นำเข้าหน้าพิจารณาเอกสาร และหน้าส่งเอกสารสำหรับ Admin ให้ครบถ้วน
import AdminApprovalCenter from "./components/AdminApprovalCenter.jsx"; 
import AdminSubmitApproval from "./components/AdminSubmitApproval.jsx"; // 👈 เพิ่มบรรทัดนี้เพื่อให้รันขึ้น

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/loginchoice" element={<Loginchoice />} />
        <Route path="/loginpublic" element={<Loginpublic />} />
        <Route path="/loginemployee" element={<Loginemployee />} />
        <Route path="/loginadmin" element={<Loginadmin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/publicprofileedit" element={<PublicProfileEdit />} />
        <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
        <Route path="/EmpDownloadDocs" element={<EmpDownloadDocs />} />
        <Route path="/EmpUseHistory" element={<EmployeeUsageHistory />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/UserManage" element={<UserManagementPage />} />
        <Route path="/AnalysisReport" element={<AnalyticalReportPage />} />
        <Route path="/AdminSetting" element={<SystemSettingsPage />} />
        <Route path="/SubmitDocsApprov" element={<DocumentSubmissionCenter />} />
        <Route path="/EmpSetting" element={<EmployeeSettingsPage />} />
        <Route path="/ManageDocs" element={<ManageDocs />} />
        <Route path="/SearchDocumentsPage1" element={<SearchDocumentsPage1 />} />
        <Route path="/SearchDocumentsPage2" element={<SearchDocumentsPage2 />} />
        <Route path="/SearchDocumentsPage3" element={<SearchDocumentsPage3 />} />
        <Route path="/SearchDocumentsPage4" element={<SearchDocumentsPage4 />} /> 
        <Route path="/SearchDocumentsPage5" element={<SearchDocumentsPage5 />} /> 
        <Route path="/SearchDocumentsPage6" element={<SearchDocumentsPage6 />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ✅ 2. ตรวจสอบ Route ของ Admin ให้ถูกต้องตาม Path ที่เรียกใช้ */}
        <Route path="/adminapprovalcenter" element={<AdminApprovalCenter />} />
        <Route path="/AdminSubmitApproval" element={<AdminSubmitApproval />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);