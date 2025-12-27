import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGMStore } from '../../stores/gmStore';
import { ticketApi } from '../../services/gmApi';
import type { Ticket, TicketResponse, TicketStatus } from '../../types/gm';
import { GM_LEVEL_NAMES } from '../../types/gm';
import clsx from 'clsx';

const STATUS_LABELS: Record<TicketStatus, { label: string; color: string }> = {
  open: { label: 'Açık', color: 'bg-green-500' },
  in_progress: { label: 'İşlemde', color: 'bg-yellow-500' },
  resolved: { label: 'Çözüldü', color: 'bg-blue-500' },
  closed: { label: 'Kapatıldı', color: 'bg-gray-500' },
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: '🐛 Bug',
  report: '⚠️ Rapor',
  support: '❓ Destek',
  feedback: '💬 Öneri',
  appeal: '⚖️ İtiraz',
};

export default function AdminTicketsPage() {
  const { gmAccount, tickets, fetchTickets, logout } = useGMStore();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTickets(statusFilter || undefined);
  }, [fetchTickets, statusFilter]);

  const loadTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await ticketApi.getResponses(ticket.id);
      setResponses(res);
    } catch (error) {
      console.error('Failed to load responses:', error);
    }
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    try {
      await ticketApi.updateStatus(ticketId, status);
      fetchTickets(statusFilter || undefined);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return;

    setIsLoading(true);
    try {
      const response = await ticketApi.respond(selectedTicket.id, newResponse);
      setResponses([...responses, response]);
      setNewResponse('');
    } catch (error) {
      console.error('Failed to send response:', error);
    }
    setIsLoading(false);
  };

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
          <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
            Çıkış Yap
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-[calc(100vh-73px)] border-r border-gray-700 p-4">
          <nav className="space-y-2">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
              📊 Dashboard
            </Link>
            <Link to="/admin/tickets" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-400">
              🎫 Ticket'lar
            </Link>
            {(gmAccount?.level || 0) >= 2 && (
              <Link to="/admin/moderation" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300">
                🔨 Moderasyon
              </Link>
            )}
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Ticket Yönetimi</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Tümü</option>
              <option value="open">Açık</option>
              <option value="in_progress">İşlemde</option>
              <option value="resolved">Çözüldü</option>
              <option value="closed">Kapatıldı</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket List */}
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
                  Ticket bulunamadı
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => loadTicketDetails(ticket)}
                    className={clsx(
                      'bg-gray-800 border rounded-xl p-4 cursor-pointer transition-colors',
                      selectedTicket?.id === ticket.id
                        ? 'border-red-500'
                        : 'border-gray-700 hover:border-gray-600'
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm text-gray-400">{CATEGORY_LABELS[ticket.category]}</span>
                        <h4 className="font-medium">{ticket.subject}</h4>
                      </div>
                      <span className={clsx('px-2 py-1 rounded text-xs', STATUS_LABELS[ticket.status].color)}>
                        {STATUS_LABELS[ticket.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{ticket.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(ticket.created_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Ticket Detail */}
            {selectedTicket && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm text-gray-400">{CATEGORY_LABELS[selectedTicket.category]}</span>
                    <h3 className="text-xl font-bold">{selectedTicket.subject}</h3>
                  </div>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
                  >
                    <option value="open">Açık</option>
                    <option value="in_progress">İşlemde</option>
                    <option value="resolved">Çözüldü</option>
                    <option value="closed">Kapatıldı</option>
                  </select>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-300">{selectedTicket.description}</p>
                </div>

                {/* Responses */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={clsx(
                        'rounded-lg p-3',
                        response.sender_type === 'gm' ? 'bg-red-900/30 border border-red-800' : 'bg-gray-700/50'
                      )}
                    >
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{response.sender_type === 'gm' ? '👑 GM' : '👤 Oyuncu'}</span>
                        <span>{new Date(response.created_at).toLocaleString('tr-TR')}</span>
                      </div>
                      <p className="text-gray-200">{response.message}</p>
                    </div>
                  ))}
                </div>

                {/* New Response */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Yanıt yaz..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
                  />
                  <button
                    onClick={handleSendResponse}
                    disabled={isLoading || !newResponse.trim()}
                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Gönder
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
