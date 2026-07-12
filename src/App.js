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
// ✅ CHANGE: Use the new EnrollPage component
import EnrollPage from './components/EnrollPage';  // <-- Changed from CourseEnrollmentPage
import CoursesPage from './components/CoursesPage';
import WatchDemoPage from './components/WatchDemoPage';

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
  '/course',
  '/enroll',
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
      
      {/* ✅ ENROLLMENT ROUTE - Using EnrollPage component */}
      <Route 
        path="/enroll" 
        element={
          <div>
            {console.log('🔥🔥🔥 RENDERING ENROLL ROUTE!')}
            <EnrollPage 
              isMobile={isMobile} 
              onBack={() => navigate('/my-courses')} 
            />
          </div>
        } 
      />
      
      {/* ✅ ENROLLMENT ROUTE with courseId */}
      <Route 
        path="/enroll/:courseId" 
        element={
          <div>
            {console.log('🔥🔥🔥 RENDERING ENROLL ROUTE WITH ID!')}
            <EnrollPage 
              isMobile={isMobile} 
              onBack={() => navigate('/my-courses')} 
            />
          </div>
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