// src/App.js
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';

// ─── Navbar ──────────────────────────────────────────────────────────
import Navbar from './components/Navbar';

// ─── Main Pages ──────────────────────────────────────────────────────
import MyCoursesPage from './components/MyCoursesPage';
import CourseDetailView from './components/CourseDetailView';
import CoursesPage from './components/CoursesPage';
import WatchDemoPage from './components/WatchDemoPage';

// ─── Enrollment Page ──────────────────────────────────────────────
import Enrollments from './components/Enrollments';

// ─── Auth Pages ──────────────────────────────────────────────────────
import Login from './components/Login';
import Logout from './components/Logout';
import FreeAccount from './components/About/FreeAccount';
import ForgotPassword from './components/ForgotPassword';  // ✅ Import ForgotPassword
import ResetPassword from './components/ResetPassword';     // ✅ Already imported

// ─── Course Pages ──────────────────────────────────────────────────
import CCNA200 from './components/Course/Cisco/CCNA200';
import CCNA350 from './components/Course/Cisco/CCNA350';
import CCNA300 from './components/Course/Cisco/CCNA300';

// ─── Tools & Features ──────────────────────────────────────────────
import PracticeExam from './components/Tools/PracticeExam';
import ForumPage from './components/Forum/ForumPage';
import SupportPage from './components/Support/SupportPage';
import UpgradePage from './components/Tools/UpgradePage';
import { TestApiConnection } from './components/TestApiConnection';

// ─── Admin & Instructor ──────────────────────────────────────────────
import AdminDashboard from './components/Admin/AdminDashboard';
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedInstructorRoute from './components/ProtectedInstructorRoute';

// ─── Routes where Navbar should be hidden ──────────────────────────
const HIDE_NAVBAR = [
  '/free-account',
  '/login',
  '/admin',
  '/instructor',
  '/logout',
  '/test-api',
  '/ccna200',
  '/ccnp-encor',
  '/ccnp-enarsi',
  '/enrollments',
  '/forgot-password',      // ✅ Add forgot-password
  '/reset-password',       // ✅ Add reset-password
];

// ─── App Routes ──────────────────────────────────────────────────────
function AppRoutes() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  console.log('🔥 AppRoutes rendering, path:', window.location.pathname);

  return (
    <Routes>
      {/* ─── Main Pages ────────────────────────────────────────────── */}
      <Route path="/" element={<MyCoursesPage />} />
      <Route path="/my-courses" element={<MyCoursesPage />} />
      <Route path="/course/:courseId" element={<CourseDetailView />} />
      
      {/* ✅ ENROLLMENT ROUTE */}
      <Route 
        path="/enrollments" 
        element={
          <Enrollments 
            isMobile={isMobile} 
            onBack={() => navigate('/my-courses')} 
          />
        } 
      />
      
      <Route 
        path="/enrollments/:courseId" 
        element={
          <Enrollments 
            isMobile={isMobile} 
            onBack={() => navigate('/my-courses')} 
          />
        } 
      />

      {/* ─── Course Pages ───────────────────────────────────────────── */}
      <Route path="/courses" element={
        <CoursesPage 
          isMobile={isMobile} 
          onBack={() => navigate('/')} 
        />
      } />
      <Route path="/watch-demo" element={
        <WatchDemoPage 
          isMobile={isMobile} 
          onBack={() => navigate('/courses')} 
        />
      } />
      <Route path="/ccna200" element={<CCNA200 />} />
      <Route path="/ccnp-encor" element={<CCNA350 />} />
      <Route path="/ccnp-enarsi" element={<CCNA300 />} />

      {/* ─── Tools & Features ───────────────────────────────────────── */}
      <Route path="/practice-exam" element={<PracticeExam />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/upgrade" element={<UpgradePage />} />
      <Route path="/support" element={
        <SupportPage 
          isMobile={isMobile} 
          onBack={() => navigate('/')} 
        />
      } />
      <Route path="/test-api" element={<TestApiConnection />} />

      {/* ─── Auth Pages ────────────────────────────────────────────── */}
      <Route path="/free-account" element={<FreeAccount />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />

      {/* ✅ Forgot Password & Reset Password Routes */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ─── Admin & Instructor (Protected) ────────────────────────── */}
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

      {/* ─── 404 Catch-All ─────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/my-courses" replace />} />
    </Routes>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────
function Layout() {
  const location = useLocation();

  console.log('📍 Current path in Layout:', location.pathname);

  // Check if current path should hide navbar
  const showNavbar = !HIDE_NAVBAR.some(path => {
    if (path.includes(':')) {
      const basePath = path.split(':')[0];
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === path;
  });

  console.log('👁️ Show navbar:', showNavbar);

  return (
    <>
      {showNavbar && <Navbar />}
      <AppRoutes />
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;