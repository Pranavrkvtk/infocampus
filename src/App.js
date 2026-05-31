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
import ForumPage from './components/Forum/ForumPage'; // Import the new Forum component

// Routes where Navbar should be hidden
const HIDE_NAVBAR = ['/free-account', '/login'];

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

      {/* Community Forum - New Route */}
      <Route
        path="/forum"
        element={<ForumPage />}
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