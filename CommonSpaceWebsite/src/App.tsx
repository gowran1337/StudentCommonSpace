import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Calendar from './pages/Calendar';
import BulletinBoard from './pages/BulletinBoard';
import DrawBoard from './pages/DrawBoard';

function AppContent() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const isLoginPage = location.pathname === '/';

  // Redirect authenticated users away from login page
  if (!loading && user && isLoginPage) {
    return <Navigate to="/calendar" replace />;
  }

  return (
    <>
      {!isLoginPage && user && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
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
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
