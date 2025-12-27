import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGMStore } from '../../stores/gmStore';
import { banApi } from '../../services/gmApi';
import type { BanType } from '../../types/gm';
import { GM_LEVEL_NAMES } from '../../types/gm';

const BAN_TYPE_LABELS: Record<BanType, string> = {
  permanent: 'Kalıcı',
  temporary: 'Geçici',
  ip: 'IP Ban',
  hwid: 'HWID Ban',
};

export default function AdminBansPage() {
  const { gmAccount, bans, fetchBans, logout } = useGMStore();

  // Ban form
  const [accountId, setAccountId] = useState('');
  const [banType, setBanType] = useState<BanType>('temporary');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(24);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBans();
  }, [fetchBans]);

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await banApi.create({
        account_id: accountId,
        ban_type: banType,
        reason,
        duration: banType === 'temporary' ? duration : undefined,
      });
      setMessage({ type: 'success', text: 'Kullanıcı banlandı!' });
      setAccountId('');
      setReason('');
      setDuration(24);
      fetchBans();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Ban işlemi başarısız' });
    }
    setIsLoading(false);
  };

  const handleUnban = async (banId: string) => {
    try {
      await banApi.remove(banId);
      setMessage({ type: 'success', text: 'Ban kaldırıldı!' });
      fetchBans();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unban işlemi başarısız' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-red-500">GM Panel</h1>
            <p className="text-sm text-gray-400">
              {gmAccount?.gm_name} - {GM_LEVEL_NAMES[gmAccount?.level || 1]}
            </p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
            Çıkış Yap
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-gray-800 min-h-[calc(100vh-73px)] border-r border-gray-700 p-4">
          <nav className="space-y-2">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
              📊 Dashboard
            </Link>
            <Link to="/admin/tickets" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
              🎫 Ticket'lar
            </Link>
            <Link to="/admin/moderation" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
              🔨 Moderasyon
            </Link>
            <Link to="/admin/bans" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-400">
              🚫 Ban Yönetimi
            </Link>
            {(gmAccount?.level || 0) >= 4 && (
              <Link to="/admin/announcements" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
                📢 Duyurular
              </Link>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">Ban Yönetimi</h2>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500 text-green-400' : 'bg-red-500/20 border border-red-500 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ban Form */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">🚫 Ban Ver</h3>
              <form onSubmit={handleBan} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hesap ID</label>
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="UUID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ban Türü</label>
                  <select
                    value={banType}
                    onChange={(e) => setBanType(e.target.value as BanType)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    <option value="temporary">Geçici</option>
                    <option value="permanent">Kalıcı</option>
                    <option value="ip">IP Ban</option>
                    <option value="hwid">HWID Ban</option>
                  </select>
                </div>
                {banType === 'temporary' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Süre (saat)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      min={1}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Sebep</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-24"
                    placeholder="Ban sebebi"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? 'İşleniyor...' : 'Banla'}
                </button>
              </form>
            </div>

            {/* Active Bans List */}
            <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Aktif Banlar ({bans.length})</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {bans.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Aktif ban bulunmuyor</p>
                ) : (
                  bans.map((ban) => (
                    <div
                      key={ban.id}
                      className="bg-gray-700/50 rounded-lg p-4 flex justify-between items-start"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-red-600 rounded text-xs">
                            {BAN_TYPE_LABELS[ban.ban_type as BanType] || ban.ban_type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(ban.created_at).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{ban.reason}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {ban.account_id.slice(0, 8)}...
                          {ban.expires_at && (
                            <> | Bitiş: {new Date(ban.expires_at).toLocaleString('tr-TR')}</>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnban(ban.id)}
                        className="text-green-400 hover:text-green-300 text-sm"
                      >
                        Kaldır
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
