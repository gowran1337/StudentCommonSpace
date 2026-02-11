import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import Login from './pages/Login';
import Register from './pages/Register';
import Calendar from './pages/Calendar';
import BulletinBoard from './pages/BulletinBoard';

import GeneralChat from './pages/GeneralChat';
import Profile from './pages/Profile';
import TaskBoard from './pages/TaskBoard';
import Expenses from './pages/Expenses';
import PrivacyPolicy from './pages/PrivacyPolicy';

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
          path="/generalchat"
          element={
            <ProtectedRoute>
              <GeneralChat />
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
        <Route
          path="/privacy"
          element={
            <ProtectedRoute>
              <PrivacyPolicy />
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
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
