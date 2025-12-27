import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useGMStore } from '../stores/gmStore';
import type { GMLevel } from '../types/gm';

interface Props {
  children: ReactNode;
  minLevel?: GMLevel;
}

export default function AdminProtectedRoute({ children, minLevel = 1 }: Props) {
  const { token, gmAccount, checkAuth, isLoading } = useGMStore();

  useEffect(() => {
    if (token && !gmAccount) {
      checkAuth();
    }
  }, [token, gmAccount, checkAuth]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (gmAccount && gmAccount.level < minLevel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Erişim Engellendi</h1>
          <p className="text-gray-400">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
