import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../stores/characterStore';
import { CLASS_INFO } from '../types';
import { gameApi, type OnlineGM, type CharacterGMInfo } from '../services/gameApi';
import { messageApi } from '../services/messageApi';
import { ticketApi } from '../services/ticketApi';
import type { PrivateMessage, Ticket } from '../types/gm';
import GameCanvas from '../game/GameCanvas';
import CombatSystem, { type CombatRewards } from '../game/CombatSystem';
import type { MapMob, MapNPC } from '../game/types';

// GM rol renkleri
const GM_ROLE_COLORS: Record<string, string> = {
  helper: 'text-blue-400',
  moderator: 'text-green-400',
  game_master: 'text-purple-400',
  admin: 'text-orange-400',
  owner: 'text-red-400',
};

const GM_ROLE_NAMES: Record<string, string> = {
  helper: 'Yardimci',
  moderator: 'Moderator',
  game_master: 'Game Master',
  admin: 'Admin',
  owner: 'Sahip',
};

export default function GamePage() {
  const navigate = useNavigate();
  const { selectedCharacter, selectCharacter } = useCharacterStore();

  // State
  const [onlineGMs, setOnlineGMs] = useState<OnlineGM[]>([]);
  const [myGMInfo, setMyGMInfo] = useState<CharacterGMInfo | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // UI State
  const [activePanel, setActivePanel] = useState<'chat' | 'tickets' | 'gm' | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Game State
  const [combatMob, setCombatMob] = useState<MapMob | null>(null);
  const [activeNPC, setActiveNPC] = useState<MapNPC | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedCharacter) {
      navigate('/characters');
      return;
    }

    // Initial data fetch
    fetchGameData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchGameData, 30000);
    return () => clearInterval(interval);
  }, [selectedCharacter, navigate]);

  const fetchGameData = async () => {
    if (!selectedCharacter) return;

    try {
      // Fetch all game data in parallel
      const [gms, gmInfo, inbox, unread, ticketList, announcementList] = await Promise.all([
        gameApi.getOnlineGMs().catch(() => []),
        gameApi.getCharacterGMInfo(selectedCharacter.id).catch(() => ({ is_gm: false })),
        messageApi.getInbox(20).catch(() => []),
        messageApi.getUnreadCount().catch(() => 0),
        ticketApi.getMyTickets().catch(() => []),
        gameApi.getAnnouncements().catch(() => []),
      ]);

      setOnlineGMs(gms);
      setMyGMInfo(gmInfo);
      setMessages(inbox);
      setUnreadCount(unread);
      setTickets(ticketList);
      setAnnouncements(announcementList);
    } catch (error) {
      console.error('Failed to fetch game data:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // For now, we'll just show a message - real implementation would need a recipient
      alert('Mesaj gondermek icin bir alici secmelisiniz. Bu ozellik yakinda eklenecek.');
      setChatMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await ticketApi.create({
        subject: ticketSubject,
        message: ticketMessage,
        category: 'support',
        priority: 'medium',
      });
      setTicketSubject('');
      setTicketMessage('');
      fetchGameData();
      alert('Ticket olusturuldu!');
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Ticket olusturulamadi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedCharacter) {
    return null;
  }

  const classInfo = CLASS_INFO[selectedCharacter.class];

  const handleBackToCharacters = () => {
    selectCharacter(null);
    navigate('/characters');
  };

  // Game Event Handlers
  const handleMobClick = (mob: MapMob) => {
    setCombatMob(mob);
  };

  const handleNPCClick = (npc: MapNPC) => {
    setActiveNPC(npc);
  };

  const handlePortalClick = (portalId: string, targetMapId: string) => {
    // TODO: Implement map change via backend API
    showNotification(`${targetMapId} haritasina isinlaniliyor...`, 'info');
    console.log('Portal clicked:', portalId, targetMapId);
  };

  const handleCombatVictory = (rewards: CombatRewards) => {
    setCombatMob(null);
    showNotification(
      `Zafer! +${rewards.experience} EXP, +${rewards.gold} Gold kazanildi!`,
      'success'
    );
    // TODO: Update character stats via backend API
  };

  const handleCombatDefeat = () => {
    setCombatMob(null);
    showNotification('Yenildiniz! Koye geri donuyorsunuz.', 'error');
    // TODO: Handle death penalty via backend API
  };

  const handleCombatFlee = () => {
    setCombatMob(null);
    showNotification('Savastan kactiniz!', 'info');
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToCharacters}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Karakter Sec
            </button>
            <h1 className="font-game text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              Realm of Conquest
            </h1>
          </div>

          {/* Online GM Indicator */}
          <div className="flex items-center gap-4">
            {onlineGMs.length > 0 && (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm">
                  {onlineGMs.length} GM Online
                </span>
              </div>
            )}

            {/* My GM Badge */}
            {myGMInfo?.is_gm && (
              <div className={`flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 rounded-lg px-3 py-1 ${GM_ROLE_COLORS[myGMInfo.role || 'helper']}`}>
                <span className="text-sm font-bold">
                  [{GM_ROLE_NAMES[myGMInfo.role || 'helper']}]
                </span>
                <span className="text-sm">{myGMInfo.gm_name}</span>
              </div>
            )}

            {/* Unread Messages */}
            {unreadCount > 0 && (
              <button
                onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
                className="relative bg-blue-500/20 border border-blue-500/50 rounded-lg px-3 py-1"
              >
                <span className="text-blue-400 text-sm">Mesajlar</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/50 px-4 py-2">
          <div className="flex items-center gap-2 text-yellow-400 text-sm overflow-hidden">
            <span className="flex-shrink-0">📢</span>
            <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
              {announcements.map(a => a.title || a.message).join(' • ')}
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Character Info */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
          {/* Character Card */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${classInfo.color} flex items-center justify-center text-2xl shadow-lg`}>
                {classInfo.icon}
              </div>
              <div>
                <h3 className="font-bold">{selectedCharacter.name}</h3>
                <p className="text-gray-400 text-sm">{classInfo.nameTR} Lv.{selectedCharacter.level}</p>
              </div>
            </div>

            {/* HP Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">HP</span>
                <span>{selectedCharacter.hp}/{selectedCharacter.max_hp}</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400"
                  style={{ width: `${(selectedCharacter.hp / selectedCharacter.max_hp) * 100}%` }}
                />
              </div>
            </div>

            {/* MP Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">MP</span>
                <span>{selectedCharacter.mp}/{selectedCharacter.max_mp}</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                  style={{ width: `${(selectedCharacter.mp / selectedCharacter.max_mp) * 100}%` }}
                />
              </div>
            </div>

            {/* EXP Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-yellow-400">EXP</span>
                <span>{selectedCharacter.experience.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                  style={{ width: `${(selectedCharacter.experience % 1000) / 10}%` }}
                />
              </div>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-500">💰</span>
              <span className="font-bold">{selectedCharacter.gold.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button className="bg-gray-700 hover:bg-gray-600 text-xs py-2 rounded">📦 Envanter</button>
            <button className="bg-gray-700 hover:bg-gray-600 text-xs py-2 rounded">📋 Gorevler</button>
            <button className="bg-gray-700 hover:bg-gray-600 text-xs py-2 rounded">👥 Grup</button>
            <button className="bg-gray-700 hover:bg-gray-600 text-xs py-2 rounded">⚙️ Ayarlar</button>
          </div>

          {/* Online GMs List */}
          <div className="flex-1 overflow-y-auto">
            <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Online GM'ler ({onlineGMs.length})
            </h4>
            {onlineGMs.length === 0 ? (
              <p className="text-gray-500 text-xs">Simdilik online GM yok</p>
            ) : (
              <div className="space-y-1">
                {onlineGMs.map((gm, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 rounded px-2 py-1 text-xs flex items-center justify-between"
                  >
                    <span className={GM_ROLE_COLORS[gm.role] || 'text-gray-400'}>
                      {gm.gm_name}
                    </span>
                    <span className="text-gray-500">
                      {GM_ROLE_NAMES[gm.role] || gm.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
            <button
              onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
              className={`w-full text-left text-sm py-2 px-3 rounded ${activePanel === 'chat' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              💬 Mesajlar {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActivePanel(activePanel === 'tickets' ? null : 'tickets')}
              className={`w-full text-left text-sm py-2 px-3 rounded ${activePanel === 'tickets' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              🎫 Destek Talepleri ({tickets.length})
            </button>
          </div>
        </aside>

        {/* Main Game Content */}
        <main className="flex-1 bg-gray-900 p-4 relative flex flex-col">
          {/* Game Canvas */}
          <div className="flex-1 flex items-center justify-center">
            <GameCanvas
              character={selectedCharacter}
              width={800}
              height={500}
              onMobClick={handleMobClick}
              onNPCClick={handleNPCClick}
              onPortalClick={handlePortalClick}
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-4 flex justify-center">
            <div className="grid grid-cols-4 gap-4 max-w-2xl w-full">
              <button className="btn-primary py-3">⚔️ Savas</button>
              <button className="btn-secondary py-3">🗺️ Harita</button>
              <button className="bg-gray-700 hover:bg-gray-600 py-3 rounded-lg">🏪 Market</button>
              <button className="bg-gray-700 hover:bg-gray-600 py-3 rounded-lg">🏛️ Lonca</button>
            </div>
          </div>
        </main>

        {/* Right Panel - Chat/Tickets */}
        {activePanel && (
          <aside className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {activePanel === 'chat' && (
              <>
                <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-bold">Mesajlar</h3>
                  <button
                    onClick={() => setActivePanel(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Henuz mesaj yok</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded text-sm ${msg.is_read ? 'bg-gray-700/50' : 'bg-blue-900/30 border border-blue-500/30'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-blue-400">
                            {msg.sender_name || 'Bilinmeyen'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-300">{msg.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Mesaj yaz..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm disabled:opacity-50"
                    >
                      ➤
                    </button>
                  </div>
                </form>
              </>
            )}

            {activePanel === 'tickets' && (
              <>
                <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-bold">Destek Talepleri</h3>
                  <button
                    onClick={() => setActivePanel(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Existing Tickets */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {tickets.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Henuz ticket yok</p>
                  ) : (
                    tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-gray-700/50 rounded p-2 text-sm"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">{ticket.subject}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            ticket.status === 'open' ? 'bg-green-500/20 text-green-400' :
                            ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs truncate">{ticket.description}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Create Ticket Form */}
                <form onSubmit={handleCreateTicket} className="p-3 border-t border-gray-700 space-y-2">
                  <h4 className="text-sm font-bold text-gray-400">Yeni Ticket</h4>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Konu"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Mesajiniz..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded text-sm disabled:opacity-50"
                  >
                    Ticket Olustur
                  </button>
                </form>
              </>
            )}
          </aside>
        )}
      </div>

      {/* Combat Modal */}
      {combatMob && (
        <CombatSystem
          character={selectedCharacter}
          mob={combatMob}
          onVictory={handleCombatVictory}
          onDefeat={handleCombatDefeat}
          onFlee={handleCombatFlee}
        />
      )}

      {/* NPC Dialog Modal */}
      {activeNPC && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-3xl">
                {activeNPC.type === 'merchant' ? '💰' :
                 activeNPC.type === 'quest_giver' ? '❗' :
                 activeNPC.type === 'blacksmith' ? '🔨' :
                 activeNPC.type === 'trainer' ? '📚' :
                 activeNPC.type === 'guild_master' ? '👑' : '👤'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-400">{activeNPC.name}</h3>
                <p className="text-gray-400 text-sm capitalize">{activeNPC.type.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <p className="text-gray-300">
                {activeNPC.type === 'merchant' && 'Hos geldin yolcu! Ne almak istersin?'}
                {activeNPC.type === 'quest_giver' && 'Sana bir gorevim var, dinler misin?'}
                {activeNPC.type === 'blacksmith' && 'Ekipmanlarini guclendirebilirim.'}
                {activeNPC.type === 'trainer' && 'Yeteneklerini gelistirmene yardimci olabilirim.'}
                {activeNPC.type === 'guild_master' && 'Loncamiza hosgeldin, kahraman!'}
                {activeNPC.type === 'banker' && 'Altinlarini guvenle saklayabilirim.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {activeNPC.shopId && (
                <button
                  onClick={() => showNotification('Magaza sistemi yakinda eklenecek!', 'info')}
                  className="bg-yellow-600 hover:bg-yellow-500 py-2 rounded-lg font-bold"
                >
                  Magazayi Ac
                </button>
              )}
              {activeNPC.questIds && activeNPC.questIds.length > 0 && (
                <button
                  onClick={() => showNotification('Gorev sistemi yakinda eklenecek!', 'info')}
                  className="bg-green-600 hover:bg-green-500 py-2 rounded-lg font-bold"
                >
                  Gorevleri Gor
                </button>
              )}
              <button
                onClick={() => setActiveNPC(null)}
                className="bg-gray-600 hover:bg-gray-500 py-2 rounded-lg col-span-2"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg font-bold ${
            notification.type === 'success' ? 'bg-green-600' :
            notification.type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          }`}>
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}
