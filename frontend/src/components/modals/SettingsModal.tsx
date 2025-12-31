import { useState } from 'react';
import { FantasyButton, FantasyPanel } from '../ui';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onSave?: (settings: GameSettings) => void;
}

interface GameSettings {
  // Audio
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  // Graphics
  quality: 'low' | 'medium' | 'high';
  showDamageNumbers: boolean;
  showPlayerNames: boolean;
  showHealthBars: boolean;
  // Gameplay
  autoPickup: boolean;
  showMinimap: boolean;
  showQuests: boolean;
  // Notifications
  chatNotifications: boolean;
  partyNotifications: boolean;
  guildNotifications: boolean;
}

const SETTING_TABS = [
  { id: 'audio', label: 'Ses', icon: '🔊' },
  { id: 'graphics', label: 'Grafik', icon: '🖥️' },
  { id: 'gameplay', label: 'Oynanis', icon: '🎮' },
  { id: 'notifications', label: 'Bildirimler', icon: '🔔' },
  { id: 'account', label: 'Hesap', icon: '👤' },
];

export default function SettingsModal({
  isOpen,
  onClose,
  onLogout,
  onSave,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('audio');
  const [settings, setSettings] = useState<GameSettings>({
    masterVolume: 80,
    musicVolume: 60,
    sfxVolume: 100,
    quality: 'high',
    showDamageNumbers: true,
    showPlayerNames: true,
    showHealthBars: true,
    autoPickup: true,
    showMinimap: true,
    showQuests: true,
    chatNotifications: true,
    partyNotifications: true,
    guildNotifications: true,
  });

  if (!isOpen) return null;

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave?.(settings);
    onClose();
  };

  const renderSlider = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    icon?: string
  ) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </span>
        <span className="text-sm text-yellow-400 font-bold">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
      />
    </div>
  );

  const renderToggle = (
    label: string,
    value: boolean,
    onChange: (value: boolean) => void,
    description?: string
  ) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
      <div>
        <span className="text-sm text-gray-300">{label}</span>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative ${
          value ? 'bg-yellow-500' : 'bg-gray-700'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[600px] max-h-[90vh] animate-scaleIn">
        <FantasyPanel variant="gold" className="p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-yellow-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-xl font-bold text-yellow-400">Ayarlar</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-[150px] bg-black/30 border-r border-gray-700 p-2">
              {SETTING_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-3 py-2 rounded text-left text-sm transition-colors mb-1 ${
                    activeTab === tab.id
                      ? 'bg-yellow-500/30 text-yellow-400'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 max-h-[500px] overflow-y-auto">
              {/* Audio Settings */}
              {activeTab === 'audio' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Ses Ayarlari</h3>
                  {renderSlider('Ana Ses', settings.masterVolume, (v) => updateSetting('masterVolume', v), '🔊')}
                  {renderSlider('Muzik', settings.musicVolume, (v) => updateSetting('musicVolume', v), '🎵')}
                  {renderSlider('Efektler', settings.sfxVolume, (v) => updateSetting('sfxVolume', v), '🔉')}
                </div>
              )}

              {/* Graphics Settings */}
              {activeTab === 'graphics' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Grafik Ayarlari</h3>

                  <div className="mb-4">
                    <span className="text-sm text-gray-300 block mb-2">Grafik Kalitesi</span>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => updateSetting('quality', q)}
                          className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                            settings.quality === q
                              ? 'bg-yellow-500 text-black'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {q === 'low' ? 'Dusuk' : q === 'medium' ? 'Orta' : 'Yuksek'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {renderToggle(
                    'Hasar Sayilari',
                    settings.showDamageNumbers,
                    (v) => updateSetting('showDamageNumbers', v),
                    'Verilen hasari ekranda goster'
                  )}
                  {renderToggle(
                    'Oyuncu Isimleri',
                    settings.showPlayerNames,
                    (v) => updateSetting('showPlayerNames', v),
                    'Diger oyuncularin isimlerini goster'
                  )}
                  {renderToggle(
                    'Can Cubukları',
                    settings.showHealthBars,
                    (v) => updateSetting('showHealthBars', v),
                    'Can cubuklarini goster'
                  )}
                </div>
              )}

              {/* Gameplay Settings */}
              {activeTab === 'gameplay' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Oynanis Ayarlari</h3>
                  {renderToggle(
                    'Otomatik Toplama',
                    settings.autoPickup,
                    (v) => updateSetting('autoPickup', v),
                    'Ganimetleri otomatik topla'
                  )}
                  {renderToggle(
                    'Mini Harita',
                    settings.showMinimap,
                    (v) => updateSetting('showMinimap', v),
                    'Kucuk haritayi goster'
                  )}
                  {renderToggle(
                    'Gorevler',
                    settings.showQuests,
                    (v) => updateSetting('showQuests', v),
                    'Aktif gorevleri goster'
                  )}
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Bildirim Ayarlari</h3>
                  {renderToggle(
                    'Sohbet Bildirimleri',
                    settings.chatNotifications,
                    (v) => updateSetting('chatNotifications', v),
                    'Yeni mesaj bildirimlerini al'
                  )}
                  {renderToggle(
                    'Parti Bildirimleri',
                    settings.partyNotifications,
                    (v) => updateSetting('partyNotifications', v),
                    'Parti davetlerini bildir'
                  )}
                  {renderToggle(
                    'Lonca Bildirimleri',
                    settings.guildNotifications,
                    (v) => updateSetting('guildNotifications', v),
                    'Lonca haberlerini bildir'
                  )}
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Hesap Ayarlari</h3>

                  <div className="space-y-3">
                    <FantasyButton variant="dark" size="medium" className="w-full justify-center">
                      🔑 Şifre Degistir
                    </FantasyButton>
                    <FantasyButton variant="dark" size="medium" className="w-full justify-center">
                      📧 E-posta Degistir
                    </FantasyButton>
                    <FantasyButton variant="dark" size="medium" className="w-full justify-center">
                      🔗 Hesap Baglantilari
                    </FantasyButton>

                    <div className="pt-4 border-t border-gray-700">
                      <FantasyButton
                        variant="red"
                        size="medium"
                        className="w-full justify-center"
                        onClick={onLogout}
                      >
                        🚪 Cikis Yap
                      </FantasyButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700 bg-black/30">
            <FantasyButton variant="dark" size="medium" onClick={onClose}>
              Iptal
            </FantasyButton>
            <FantasyButton variant="gold" size="medium" onClick={handleSave}>
              Kaydet
            </FantasyButton>
          </div>
        </FantasyPanel>
      </div>
    </div>
  );
}
