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
import ForumPage from './components/Forum/ForumPage'; // Import the Forum component
import SupportPage from './components/Support/SupportPage'; // Import the Support component
import CCNA200 from './components/Course/Cisco/CCNA200';  // ← ADD THIS
import CCNA350 from './components/Course/Cisco/CCNA350'// Routes where Navbar should be hidden
import CCNA300 from './components/Course/Cisco/CCNA300';
import UpgradePage from './components/Tools/UpgradePage';
import MyCoursesPage from "./components/MyCoursesPage";

import AdminDashboard from './components/Admin/AdminDashboard';
import Logout from './components/Logout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

const HIDE_NAVBAR = [
  '/free-account',
  '/login',
  '/admin',
  '/logout'
];
function AppRoutes() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Free Account */}
      <Route path="/free-account" element={<FreeAccount />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Courses */}
      <Route
        path="/courses"
        element={
          <CoursesPage
            isMobile={isMobile}
            onBack={() => navigate('/')}
          />
        }
      />

      {/* Watch Demo */}
      <Route
        path="/watch-demo"
        element={
          <WatchDemoPage
            isMobile={isMobile}
            onBack={() => navigate('/courses')}
          />
        }
      />
      <Route path="/ccna200" element={<CCNA200 />} />  {/* ← ADD THIS */}


      {/* Enroll */}
      <Route
        path="/enroll"
        element={
          <EnrollPage
            isMobile={isMobile}
            onBack={() => navigate('/courses')}
          />
        }
      />

      {/* Practice Exam */}
      <Route
        path="/practice-exam"
        element={<PracticeExam />}
      />

      {/* Community Forum */}
      <Route
        path="/forum"
        element={<ForumPage />}
      />

      <Route path="/ccnp-encor" element={<CCNA350 />} />
      <Route path="/ccnp-enarsi" element={<CCNA300 />} />
      <Route path="/upgrade" element={<UpgradePage />} />
<Route
  path="/admin"
  element={
    <ProtectedAdminRoute>
      <AdminDashboard />
    </ProtectedAdminRoute>
  }
/>      <Route path="/logout" element={<Logout />} />
// Add this route inside your Router
<Route path="/my-courses" element={<MyCoursesPage isMobile={false} onBack={() => navigate("/courses")} />} />
      {/* Support Page */}
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