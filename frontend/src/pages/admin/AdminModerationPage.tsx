import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGMStore } from '../../stores/gmStore';
import { muteApi } from '../../services/gmApi';
import { GM_LEVEL_NAMES } from '../../types/gm';
import type { Mute } from '../../types/gm';

const MUTE_TYPES = [
  { value: 'all', label: 'Tüm Sohbet' },
  { value: 'whisper', label: 'Özel Mesaj' },
  { value: 'global', label: 'Global Sohbet' },
  { value: 'trade', label: 'Ticaret Sohbeti' },
];

export default function AdminModerationPage() {
  const { gmAccount, logout } = useGMStore();

  // Mute form - character_id based
  const [muteCharacterId, setMuteCharacterId] = useState('');
  const [muteType, setMuteType] = useState('all');
  const [muteReason, setMuteReason] = useState('');
  const [muteDuration, setMuteDuration] = useState(30);

  // Active mutes
  const [mutes, setMutes] = useState<Mute[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMutes();
  }, []);

  const loadMutes = async () => {
    try {
      const data = await muteApi.list();
      setMutes(data);
    } catch (error) {
      console.error('Failed to load mutes:', error);
    }
  };

  const handleMute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await muteApi.create({
        character_id: muteCharacterId,
        mute_type: muteType,
        reason: muteReason,
        duration: muteDuration,
      });
      setMessage({ type: 'success', text: 'Karakter susturuldu!' });
      setMuteCharacterId('');
      setMuteReason('');
      setMuteDuration(30);
      loadMutes();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Mute işlemi başarısız' });
    }
    setIsLoading(false);
  };

  const handleUnmute = async (muteId: string) => {
    try {
      await muteApi.remove(muteId);
      setMessage({ type: 'success', text: 'Mute kaldırıldı!' });
      loadMutes();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'İşlem başarısız' });
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
            <Link to="/admin/moderation" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-400">
              🔨 Moderasyon
            </Link>
            {(gmAccount?.level || 0) >= 3 && (
              <Link to="/admin/bans" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
                🚫 Ban Yönetimi
              </Link>
            )}
            {(gmAccount?.level || 0) >= 4 && (
              <Link to="/admin/announcements" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
                📢 Duyurular
              </Link>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">Moderasyon Araçları</h2>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500 text-green-400' : 'bg-red-500/20 border border-red-500 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mute Form */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🔇 Mute Ver
              </h3>
              <form onSubmit={handleMute} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Karakter ID</label>
                  <input
                    type="text"
                    value={muteCharacterId}
                    onChange={(e) => setMuteCharacterId(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Karakter UUID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mute Türü</label>
                  <select
                    value={muteType}
                    onChange={(e) => setMuteType(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    {MUTE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Sebep</label>
                  <input
                    type="text"
                    value={muteReason}
                    onChange={(e) => setMuteReason(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Mute sebebi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Süre (dakika)</label>
                  <input
                    type="number"
                    value={muteDuration}
                    onChange={(e) => setMuteDuration(parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    min={1}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-500 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? 'İşleniyor...' : 'Mute Ver'}
                </button>
              </form>
            </div>

            {/* Active Mutes List */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Aktif Mute'lar ({mutes.length})</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {mutes.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Aktif mute bulunmuyor</p>
                ) : (
                  mutes.map((mute) => (
                    <div
                      key={mute.id}
                      className="bg-gray-700/50 rounded-lg p-3 flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Karakter: <span className="text-orange-400">{mute.character_id.slice(0, 8)}...</span>
                        </p>
                        <p className="text-xs text-gray-400">Tür: {mute.mute_type}</p>
                        <p className="text-xs text-gray-400">Sebep: {mute.reason}</p>
                        <p className="text-xs text-gray-500">
                          Bitiş: {new Date(mute.expires_at).toLocaleString('tr-TR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnmute(mute.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
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
