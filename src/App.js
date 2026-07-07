import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';
import FreeAccount from './components/About/FreeAccount';
import Login from './components/Login';
import CoursesPage from './components/CoursesPage';
import WatchDemoPage from './components/WatchDemoPage';
import EnrollPage from './components/EnrollPage';
import PracticeExam from './components/Tools/PracticeExam';
import ForumPage from './components/Forum/ForumPage';
import SupportPage from './components/Support/SupportPage';
import CCNA200 from './components/Course/Cisco/CCNA200';
import CCNA350 from './components/Course/Cisco/CCNA350';
import CCNA300 from './components/Course/Cisco/CCNA300';
import UpgradePage from './components/Tools/UpgradePage';
import MyCoursesPage from "./components/MyCoursesPage";
import AdminDashboard from './components/Admin/AdminDashboard';
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import Logout from './components/Logout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedInstructorRoute from './components/ProtectedInstructorRoute';
import { TestApiConnection } from './components/TestApiConnection';

const HIDE_NAVBAR = [
  '/free-account',
  '/login',
  '/admin',
  '/instructor',
  '/logout',
  '/test-api' // Hide navbar on test page
];

function AppRoutes() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/free-account" element={<FreeAccount />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/courses"
        element={
          <CoursesPage
            isMobile={isMobile}
            onBack={() => navigate('/')}
          />
        }
      />
      <Route
        path="/watch-demo"
        element={
          <WatchDemoPage
            isMobile={isMobile}
            onBack={() => navigate('/courses')}
          />
        }
      />
      <Route path="/ccna200" element={<CCNA200 />} />
      <Route
        path="/enroll"
        element={
          <EnrollPage
            isMobile={isMobile}
            onBack={() => navigate('/courses')}
          />
        }
      />
      <Route path="/practice-exam" element={<PracticeExam />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/ccnp-encor" element={<CCNA350 />} />
      <Route path="/ccnp-enarsi" element={<CCNA300 />} />
      <Route path="/upgrade" element={<UpgradePage />} />
      
      {/* ✅ TEST API ROUTE - Remove this after testing */}
      <Route path="/test-api" element={<TestApiConnection />} />
      
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/instructor"
        element={
          <ProtectedInstructorRoute>
            <InstructorDashboard />
          </ProtectedInstructorRoute>
        }
      />
      <Route path="/logout" element={<Logout />} />
      <Route path="/my-courses" element={<MyCoursesPage isMobile={isMobile} onBack={() => navigate("/courses")} />} />
      <Route
        path="/support"
        element={
          <SupportPage
            isMobile={isMobile}
            onBack={() => navigate('/')}
          />
        }
      />
    </Routes>
  );
}

function Layout() {
  const location = useLocation();
  const showNavbar = !HIDE_NAVBAR.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
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