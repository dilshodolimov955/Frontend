import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StudentPortalLayout from "./pages/studentPages/StudentPortalLayout";
import StudentHomePage from "./pages/studentPages/StudentHomePage";
import StudentGroupsPage from "./pages/studentPages/StudentGroupsPage";
import StudentLessonDetailPage from "./pages/studentPages/StudentLessonDetailPage";
import StudentSettingsPage from "./pages/studentPages/StudentSettingsPage";
import TeacherGroupsRoutePage from "./pages/teacherPages/TeacherGroupsRoutePage";
import TeacherHomePage from "./pages/teacherPages/TeacherHomePage";
import TeacherGroupDetailsRoutePage from "./pages/teacherPages/TeacherGroupDetailsRoutePage";
import CreateHomework from "./pages/teacherPages/CreateHomework";
import TeacherLayout from "./pages/teacherPages/TeacherLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/groups" element={<DashboardPage initialMenu="groups" />} />
      <Route path="/dashboard/students" element={<DashboardPage initialMenu="students" />} />
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<Navigate to="groups" replace />} />
        <Route path="dashboard" element={<Navigate to="../groups" replace />} />
        <Route path="groups" element={<TeacherGroupsRoutePage />} />
        <Route path="groups/:groupId" element={<TeacherGroupDetailsRoutePage />} />
        <Route path="create-homework" element={<CreateHomework />} />
      </Route>
      <Route path="/student-dashboard" element={<Navigate to="/student/home" replace />} />
      <Route path="/student" element={<StudentPortalLayout />}>
        <Route index element={<StudentHomePage />} />
        <Route path="home" element={<StudentHomePage />} />
        <Route path="groups" element={<StudentGroupsPage />} />
        <Route path="groups/:groupId" element={<StudentGroupsPage />} />
        <Route path="groups/:groupId/lesson/:lessonId" element={<StudentLessonDetailPage />} />
        <Route path="settings" element={<StudentSettingsPage />} />
      </Route>
    </Routes>
  );
}