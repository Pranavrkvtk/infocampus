// src/App.js
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';

// ─── Navbar ──────────────────────────────────────────────────────────
import Navbar from './components/Navbar';

// ─── Main Pages ──────────────────────────────────────────────────────
import MyCoursesPage from './components/MyCoursesPage';
import CourseDetailView from './components/CourseDetailView';
import CourseEnrollmentPage from './components/CourseEnrollmentPage';
import CoursesPage from './components/CoursesPage';
import WatchDemoPage from './components/WatchDemoPage';
import EnrollPage from './components/EnrollPage';

// ─── Auth Pages ──────────────────────────────────────────────────────
import Login from './components/Login';
import Logout from './components/Logout';
import FreeAccount from './components/About/FreeAccount';

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
  '/course',        // ← HIDE navbar on all course detail pages
];

// ─── App Routes ──────────────────────────────────────────────────────
function AppRoutes() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  return (
    <Routes>
      {/* ─── Main Pages ────────────────────────────────────────────── */}
      {/* ✅ Home page is now MyCoursesPage */}
      <Route path="/" element={<MyCoursesPage />} />
      <Route path="/my-courses" element={<MyCoursesPage />} />
      <Route path="/course/:courseId" element={<CourseDetailView />} />
      <Route path="/enroll/:courseId?" element={<CourseEnrollmentPage />} />

      {/* ─── Course Pages ───────────────────────────────────────────── */}
      <Route path="/courses" element={<CoursesPage isMobile={isMobile} onBack={() => navigate('/')} />} />
      <Route path="/watch-demo" element={<WatchDemoPage isMobile={isMobile} onBack={() => navigate('/courses')} />} />
      <Route path="/ccna200" element={<CCNA200 />} />
      <Route path="/ccnp-encor" element={<CCNA350 />} />
      <Route path="/ccnp-enarsi" element={<CCNA300 />} />
      <Route path="/enroll" element={<EnrollPage isMobile={isMobile} onBack={() => navigate('/courses')} />} />

      {/* ─── Tools & Features ───────────────────────────────────────── */}
      <Route path="/practice-exam" element={<PracticeExam />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/upgrade" element={<UpgradePage />} />
      <Route path="/support" element={<SupportPage isMobile={isMobile} onBack={() => navigate('/')} />} />
      <Route path="/test-api" element={<TestApiConnection />} />

      {/* ─── Auth Pages ────────────────────────────────────────────── */}
      <Route path="/free-account" element={<FreeAccount />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />

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
    </Routes>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────
function Layout() {
  const location = useLocation();

  // Check if current path should hide navbar
  const showNavbar = !HIDE_NAVBAR.some(path => {
    // For dynamic routes (like /course/:id), check if path starts with base
    if (path.includes(':')) {
      const basePath = path.split(':')[0];
      return location.pathname.startsWith(basePath);
    }
    // For exact matches
    return location.pathname === path;
  });

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