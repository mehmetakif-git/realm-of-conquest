import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGMStore } from '../../stores/gmStore';
import { announcementApi } from '../../services/gmApi';
import type { Announcement, AnnouncementType } from '../../types/gm';
import { GM_LEVEL_NAMES } from '../../types/gm';

const TYPE_LABELS: Record<AnnouncementType, { label: string; color: string; icon: string }> = {
  global: { label: 'Global', color: 'bg-blue-500', icon: '🌍' },
  server: { label: 'Sunucu', color: 'bg-green-500', icon: '🖥️' },
  maintenance: { label: 'Bakım', color: 'bg-orange-500', icon: '🔧' },
  event: { label: 'Etkinlik', color: 'bg-purple-500', icon: '🎉' },
};

export default function AdminAnnouncementsPage() {
  const { gmAccount, logout } = useGMStore();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [type, setType] = useState<AnnouncementType>('global');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await announcementApi.list();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await announcementApi.create({
        announcement_type: type,
        title,
        message: content,
        show_in_chat: true,
        show_as_popup: false,
        color: '#3B82F6',
      });
      setMessage({ type: 'success', text: 'Duyuru oluşturuldu!' });
      setTitle('');
      setContent('');
      loadAnnouncements();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Duyuru oluşturulamadı' });
    }
    setIsLoading(false);
  };

  const handleDeactivate = async (id: string) => {
    try {
      await announcementApi.deactivate(id);
      setMessage({ type: 'success', text: 'Duyuru deaktif edildi!' });
      loadAnnouncements();
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
            <Link to="/admin/moderation" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
              🔨 Moderasyon
            </Link>
            <Link to="/admin/bans" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
              🚫 Ban Yönetimi
            </Link>
            <Link to="/admin/announcements" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-400">
              📢 Duyurular
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">Duyuru Yönetimi</h2>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500 text-green-400' : 'bg-red-500/20 border border-red-500 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Form */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">📢 Yeni Duyuru</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tür</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AnnouncementType)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  >
                    <option value="global">🌍 Global</option>
                    <option value="server">🖥️ Sunucu</option>
                    <option value="maintenance">🔧 Bakım</option>
                    <option value="event">🎉 Etkinlik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Duyuru başlığı"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">İçerik</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-32"
                    placeholder="Duyuru içeriği"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Gönderiliyor...' : 'Duyuru Gönder'}
                </button>
              </form>
            </div>

            {/* Active Announcements */}
            <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Aktif Duyurular ({announcements.length})</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {announcements.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Aktif duyuru bulunmuyor</p>
                ) : (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="bg-gray-700/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${TYPE_LABELS[announcement.announcement_type || announcement.type as AnnouncementType].color}`}>
                            {TYPE_LABELS[announcement.announcement_type || announcement.type as AnnouncementType].icon} {TYPE_LABELS[announcement.announcement_type || announcement.type as AnnouncementType].label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(announcement.created_at).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeactivate(announcement.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Kaldır
                        </button>
                      </div>
                      <h4 className="font-medium mb-1">{announcement.title}</h4>
                      <p className="text-sm text-gray-300">{announcement.message || announcement.content}</p>
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
