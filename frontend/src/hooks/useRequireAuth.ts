import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function useRequireAuth() {
  const navigate = useNavigate();
  const { token, account, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!account && !isLoading) {
      checkAuth();
    }
  }, [token, account, isLoading, checkAuth, navigate]);

  return { isAuthenticated: !!account, isLoading };
}
