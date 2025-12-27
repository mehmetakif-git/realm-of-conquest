import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGMStore } from '../../stores/gmStore';
import { GM_LEVEL_NAMES } from '../../types/gm';

export default function AdminDashboard() {
  const { gmAccount, stats, fetchStats, logout } = useGMStore();

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-red-500">GM Panel</h1>
            <p className="text-sm text-gray-400">
              {gmAccount?.gm_name} - {GM_LEVEL_NAMES[gmAccount?.level || 1]}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-[calc(100vh-73px)] border-r border-gray-700 p-4">
          <nav className="space-y-2">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-400"
            >
              📊 Dashboard
            </Link>
            <Link
              to="/admin/tickets"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300"
            >
              🎫 Ticket'lar
            </Link>
            {(gmAccount?.level || 0) >= 2 && (
              <Link
                to="/admin/moderation"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300"
              >
                🔨 Moderasyon
              </Link>
            )}
            {(gmAccount?.level || 0) >= 3 && (
              <Link
                to="/admin/bans"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300"
              >
                🚫 Ban Yönetimi
              </Link>
            )}
            {(gmAccount?.level || 0) >= 4 && (
              <Link
                to="/admin/announcements"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300"
              >
                📢 Duyurular
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Hesap</p>
                  <p className="text-3xl font-bold mt-1">{stats?.total_accounts || 0}</p>
                </div>
                <span className="text-4xl">👥</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Online Karakter</p>
                  <p className="text-3xl font-bold mt-1 text-green-400">{stats?.online_characters || 0}</p>
                </div>
                <span className="text-4xl">🟢</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Karakter</p>
                  <p className="text-3xl font-bold mt-1">{stats?.total_characters || 0}</p>
                </div>
                <span className="text-4xl">⚔️</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Açık Ticket</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-400">{stats?.open_tickets || 0}</p>
                </div>
                <span className="text-4xl">🎫</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Aktif Ban</p>
                  <p className="text-3xl font-bold mt-1 text-red-400">{stats?.active_bans || 0}</p>
                </div>
                <span className="text-4xl">🚫</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Aktif Mute</p>
                  <p className="text-3xl font-bold mt-1 text-orange-400">{stats?.active_mutes || 0}</p>
                </div>
                <span className="text-4xl">🔇</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-xl font-bold mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/tickets"
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-yellow-500 transition-colors text-center"
            >
              <span className="text-3xl">🎫</span>
              <p className="mt-2 font-medium">Ticket'lara Bak</p>
            </Link>

            {(gmAccount?.level || 0) >= 2 && (
              <Link
                to="/admin/moderation"
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-orange-500 transition-colors text-center"
              >
                <span className="text-3xl">🔇</span>
                <p className="mt-2 font-medium">Mute Ver</p>
              </Link>
            )}

            {(gmAccount?.level || 0) >= 3 && (
              <Link
                to="/admin/bans"
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-red-500 transition-colors text-center"
              >
                <span className="text-3xl">🚫</span>
                <p className="mt-2 font-medium">Ban Ver</p>
              </Link>
            )}

            {(gmAccount?.level || 0) >= 4 && (
              <Link
                to="/admin/announcements"
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-colors text-center"
              >
                <span className="text-3xl">📢</span>
                <p className="mt-2 font-medium">Duyuru Gönder</p>
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
