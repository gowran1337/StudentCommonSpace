import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Calendar from './pages/Calendar';
import BulletinBoard from './pages/BulletinBoard';
import DrawBoard from './pages/DrawBoard';
import GeneralChat from './pages/GeneralChat';
import DirectMessages from './pages/DirectMessages';
import Profile from './pages/Profile';
import TaskBoard from './pages/TaskBoard';
import Expenses from './pages/Expenses';

function AppContent() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

  // Redirect authenticated users away from auth pages
  if (!loading && user && isAuthPage) {
    return <Navigate to="/calendar" replace />;
  }

  return (
    <>
      {!isAuthPage && user && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulletinboard"
          element={
            <ProtectedRoute>
              <BulletinBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drawboard"
          element={
            <ProtectedRoute>
              <DrawBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generalchat"
          element={
            <ProtectedRoute>
              <GeneralChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/directmessages"
          element={
            <ProtectedRoute>
              <DirectMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/taskboard"
          element={
            <ProtectedRoute>
              <TaskBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
