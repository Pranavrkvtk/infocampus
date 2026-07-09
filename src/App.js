// src/App.js
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Main pages
import MyCoursesPage from './components/MyCoursesPage';
import CourseDetailView from './components/CourseDetailView';
import CourseEnrollmentPage from './components/CourseEnrollmentPage';

// Navbar and auth pages
import Navbar from './components/Navbar';
import Login from './components/Login';
import Logout from './components/Logout';

// Admin / Instructor
import AdminDashboard from './components/Admin/AdminDashboard';
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedInstructorRoute from './components/ProtectedInstructorRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Main pages */}
      <Route path="/" element={<MyCoursesPage />} />
      <Route path="/my-courses" element={<MyCoursesPage />} />
      <Route path="/course/:courseId" element={<CourseDetailView />} />
      <Route path="/enroll/:courseId?" element={<CourseEnrollmentPage />} />

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />

      {/* Admin & Instructor (protected) */}
      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/instructor/*"
        element={
          <ProtectedInstructorRoute>
            <InstructorDashboard />
          </ProtectedInstructorRoute>
        }
      />
    </Routes>
  );
}

function Layout() {
  return (
    <>
      <Navbar />   {/* Navbar appears on every page */}
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;