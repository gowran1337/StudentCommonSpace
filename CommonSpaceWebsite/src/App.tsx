import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Calendar from './pages/Calendar';
import BulletinBoard from './pages/BulletinBoard';
import DrawBoard from './pages/DrawBoard';
import GeneralChat from './pages/GeneralChat';
import DirectMessages from './pages/DirectMessages';
import Profile from './pages/Profile';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/register';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/bulletinboard" element={<BulletinBoard />} />
        <Route path="/drawboard" element={<DrawBoard />} />
        <Route path="/generalchat" element={<GeneralChat />} />
        <Route path="/directmessages" element={<DirectMessages />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
