import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';
import FreeAccount from './components/About/FreeAccount';
import Login from './components/Login';
import CoursesPage from './components/CoursesPage';
import WatchDemoPage from './components/WatchDemoPage';
import EnrollPage from './components/EnrollPage';

// Routes where Navbar should be hidden
const HIDE_NAVBAR = ['/free-account', '/login'];

function Layout() {
  const location = useLocation();
  const showNavbar = !HIDE_NAVBAR.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/free-account" element={<FreeAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<CoursesPage isMobile={false} onBack={() => window.history.back()} />} />
        <Route path="/watch-demo" element={<WatchDemoPage isMobile={false} onBack={() => window.history.back()} />} />
        <Route path="/enroll" element={<EnrollPage isMobile={false} onBack={() => window.history.back()} />} />
      </Routes>
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