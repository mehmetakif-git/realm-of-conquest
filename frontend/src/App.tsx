import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CharacterSelectPage from './pages/CharacterSelectPage';
import GamePage from './pages/GamePage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';
import AdminBansPage from './pages/admin/AdminBansPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';

export default function App() {
  const { token, checkAuth } = useAuthStore();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Player Routes */}
      <Route
        path="/characters"
        element={
          <ProtectedRoute>
            <CharacterSelectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <AdminProtectedRoute>
            <AdminTicketsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/moderation"
        element={
          <AdminProtectedRoute minLevel={2}>
            <AdminModerationPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/bans"
        element={
          <AdminProtectedRoute minLevel={3}>
            <AdminBansPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <AdminProtectedRoute minLevel={4}>
            <AdminAnnouncementsPage />
          </AdminProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to={token ? "/characters" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
