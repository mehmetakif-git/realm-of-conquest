import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGMStore } from '../../stores/gmStore';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useGMStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-game text-3xl font-bold text-red-500">
            GM Panel
          </h1>
          <p className="text-gray-500 mt-2">Realm of Conquest - Yönetim</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-center mb-6 text-white">GM Girişi</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
              <button onClick={clearError} className="float-right text-red-400 hover:text-red-300">
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                placeholder="gm@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            GM hesabı için normal hesap e-postanızı kullanın
          </p>
        </div>
      </div>
    </div>
  );
}
