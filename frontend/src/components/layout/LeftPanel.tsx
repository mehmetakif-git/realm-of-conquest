import type { Character } from '../../types';
import { Avatar, ProgressBar, FantasyPanel, FantasyButton } from '../ui';
import { getClassColor } from '../../styles/theme';

interface LeftPanelProps {
  character: Character;
  onlineGMs?: { gm_name: string; role: string }[];
  onInventoryClick?: () => void;
  onQuestsClick?: () => void;
  onSkillsClick?: () => void;
  onPartyClick?: () => void;
  onSettingsClick?: () => void;
  onBackClick?: () => void;
}

const GM_ROLE_COLORS: Record<string, string> = {
  helper: 'text-blue-400',
  moderator: 'text-green-400',
  game_master: 'text-purple-400',
  admin: 'text-orange-400',
  owner: 'text-red-400',
};

export default function LeftPanel({
  character,
  onlineGMs = [],
  onInventoryClick,
  onQuestsClick,
  onSkillsClick,
  onPartyClick,
  onSettingsClick,
  onBackClick,
}: LeftPanelProps) {
  const classColor = getClassColor(character.class);
  const classNameTR: Record<string, string> = {
    warrior: 'Savasci',
    archer: 'Okcu',
    mage: 'Buyucu',
    healer: 'Sifaci',
    ninja: 'Ninja',
  };

  // Calculate EXP percentage (mock - normally would be based on level requirements)
  const expToNextLevel = character.level * 100; // Simple formula
  const expPercentage = (character.experience % expToNextLevel);

  return (
    <aside className="w-[250px] h-full bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-r-2 border-[#333355] flex flex-col overflow-hidden">
      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm border-b border-[#333355]"
      >
        ← Karakter Sec
      </button>

      {/* Character Card */}
      <div className="p-4 border-b border-[#333355]">
        {/* Avatar and Name */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar
            characterClass={character.class}
            level={character.level}
            size="medium"
            isOnline={character.is_online}
          />
          <div>
            <h3 className="font-bold text-white">{character.name}</h3>
            <p className="text-sm" style={{ color: classColor.primary }}>
              {classNameTR[character.class] || character.class} Lv.{character.level}
            </p>
          </div>
        </div>

        {/* HP Bar */}
        <div className="mb-2">
          <ProgressBar
            current={character.hp}
            max={character.max_hp}
            type="hp"
            size="medium"
            label="HP"
          />
        </div>

        {/* MP Bar */}
        <div className="mb-2">
          <ProgressBar
            current={character.mp}
            max={character.max_mp}
            type="mp"
            size="medium"
            label="MP"
          />
        </div>

        {/* EXP Bar */}
        <div className="mb-3">
          <ProgressBar
            current={expPercentage}
            max={expToNextLevel}
            type="exp"
            size="small"
            label="EXP"
          />
        </div>

        {/* Gold Display */}
        <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg border border-yellow-600/20">
          <span className="text-yellow-500 text-lg">💰</span>
          <span className="text-yellow-400 font-bold">{character.gold.toLocaleString()}</span>
          <span className="text-gray-500 text-sm">Gold</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-[#333355]">
        <div className="grid grid-cols-2 gap-2">
          <FantasyButton
            variant="dark"
            size="small"
            icon="📦"
            onClick={onInventoryClick}
            fullWidth
          >
            Envanter
          </FantasyButton>
          <FantasyButton
            variant="dark"
            size="small"
            icon="📋"
            onClick={onQuestsClick}
            fullWidth
          >
            Gorevler
          </FantasyButton>
          <FantasyButton
            variant="dark"
            size="small"
            icon="⚡"
            onClick={onSkillsClick}
            fullWidth
          >
            Yetenekler
          </FantasyButton>
          <FantasyButton
            variant="dark"
            size="small"
            icon="👥"
            onClick={onPartyClick}
            fullWidth
          >
            Grup
          </FantasyButton>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="p-3 border-b border-[#333355]">
        <h4 className="text-xs font-bold text-gray-400 mb-2">ISTATISTIKLER</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">ATK:</span>
            <span className="text-white">{character.attack}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DEF:</span>
            <span className="text-white">{character.defense}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">SPD:</span>
            <span className="text-white">{character.speed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">CRT:</span>
            <span className="text-white">{(character.crit_rate * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Online GMs */}
      <div className="flex-1 p-3 overflow-y-auto">
        <FantasyPanel
          title="Online GM'ler"
          icon={<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />}
          variant="dark"
          padding="small"
        >
          {onlineGMs.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-2">Simdilik online GM yok</p>
          ) : (
            <div className="space-y-1">
              {onlineGMs.map((gm, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs bg-black/20 rounded px-2 py-1"
                >
                  <span className={GM_ROLE_COLORS[gm.role] || 'text-gray-400'}>
                    {gm.gm_name}
                  </span>
                  <span className="text-gray-600">{gm.role}</span>
                </div>
              ))}
            </div>
          )}
        </FantasyPanel>
      </div>

      {/* Settings Button */}
      <div className="p-3 border-t border-[#333355]">
        <FantasyButton
          variant="dark"
          size="small"
          icon="⚙️"
          onClick={onSettingsClick}
          fullWidth
        >
          Ayarlar
        </FantasyButton>
      </div>
    </aside>
  );
}
