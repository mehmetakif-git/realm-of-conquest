import { useState } from 'react';
import type { FlagType, FlagBuffs } from '../../types/flag';
import { FLAG_BUFFS, getInfamyLevel, getKarmaLevel } from '../../types/flag';

interface FlagSelectorProps {
  currentFlag: FlagType;
  infamy: number;
  karma: number;
  cooldownRemaining: number;
  onSelectFlag: (flag: FlagType) => void;
  onClose: () => void;
}

export default function FlagSelector({
  currentFlag,
  infamy,
  karma,
  cooldownRemaining,
  onSelectFlag,
  onClose,
}: FlagSelectorProps) {
  const [selectedFlag, setSelectedFlag] = useState<FlagType>(currentFlag);

  const canChange = cooldownRemaining <= 0;
  const cooldownMinutes = Math.ceil(cooldownRemaining / 60000);

  const infamyLevel = getInfamyLevel(infamy);
  const karmaLevel = getKarmaLevel(karma);

  const handleConfirm = () => {
    if (selectedFlag !== currentFlag && canChange) {
      onSelectFlag(selectedFlag);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border-2 border-yellow-600/50 shadow-2xl w-[850px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center py-5 border-b border-yellow-600/30 bg-gradient-to-r from-yellow-900/30 to-orange-900/30">
          <h2 className="text-yellow-400 text-2xl font-bold" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
            PUSE SECIMI
          </h2>
          <p className="text-gray-400 text-sm mt-1">Puse secimin oyun tarzini belirler. Dikkatli sec!</p>
        </div>

        <div className="p-6">
          {/* Current Status */}
          <div className="flex justify-center gap-12 mb-6 p-4 bg-black/30 rounded-lg">
            <div className="text-center">
              <div className="text-red-400 text-sm mb-1">Infamy</div>
              <div className="text-white text-3xl font-bold">{infamy}</div>
              <div style={{ color: infamyLevel.color }} className="text-xs">{infamyLevel.title}</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-sm mb-1">Karma</div>
              <div className="text-white text-3xl font-bold">{karma}</div>
              <div style={{ color: karmaLevel.color }} className="text-xs">{karmaLevel.title}</div>
            </div>
          </div>

          {/* Cooldown Warning */}
          {!canChange && (
            <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-3 mb-5 text-center">
              <span className="text-orange-400">
                Puse degistirmek icin {cooldownMinutes} dakika beklemelisin!
              </span>
            </div>
          )}

          {/* Flag Options */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <FlagOption
              type="neutral"
              title="TARAFSIZ"
              subtitle="Savasma, kendi isine bak"
              buffs={FLAG_BUFFS.neutral}
              isSelected={selectedFlag === 'neutral'}
              isCurrent={currentFlag === 'neutral'}
              onClick={() => canChange && setSelectedFlag('neutral')}
              disabled={!canChange}
            />
            <FlagOption
              type="red"
              title="KIRMIZI PUSE"
              subtitle="Haydut / Saldirgan"
              buffs={FLAG_BUFFS.red}
              isSelected={selectedFlag === 'red'}
              isCurrent={currentFlag === 'red'}
              onClick={() => canChange && setSelectedFlag('red')}
              disabled={!canChange}
              warning="Sehirlere giremezsin, yakalanirsan hapise gidersin!"
            />
            <FlagOption
              type="blue"
              title="MAVI PUSE"
              subtitle="Koruyucu / Savunmaci"
              buffs={FLAG_BUFFS.blue}
              isSelected={selectedFlag === 'blue'}
              isCurrent={currentFlag === 'blue'}
              onClick={() => canChange && setSelectedFlag('blue')}
              disabled={!canChange}
            />
          </div>

          {/* Specialization Info */}
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="text-yellow-400 font-bold mb-3">Uzmanlaşma Uyumu</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-red-400 mb-2">Kirmizi icin ideal:</div>
                <div className="text-gray-400">Berserker, Keskin Nisanci, Kara Buyucu, Druid, Suikastci</div>
              </div>
              <div>
                <div className="text-blue-400 mb-2">Mavi icin ideal:</div>
                <div className="text-gray-400">Paladin, Tuzakci, Elementalist, Rahip, Golge Dansci</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
            >
              Iptal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canChange || selectedFlag === currentFlag}
              className={`px-8 py-3 font-bold rounded-lg transition-all ${
                !canChange || selectedFlag === currentFlag
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : selectedFlag === 'red'
                    ? 'bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white'
                    : selectedFlag === 'blue'
                      ? 'bg-gradient-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white'
                      : 'bg-gradient-to-b from-gray-500 to-gray-700 hover:from-gray-400 hover:to-gray-600 text-white'
              }`}
            >
              {selectedFlag === currentFlag ? 'Mevcut Puse' : `${selectedFlag.toUpperCase()} Puse Sec`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Flag Option Card Component
interface FlagOptionProps {
  type: FlagType;
  title: string;
  subtitle: string;
  buffs: FlagBuffs;
  isSelected: boolean;
  isCurrent: boolean;
  onClick: () => void;
  disabled: boolean;
  warning?: string;
}

function FlagOption({
  type,
  title,
  subtitle,
  buffs,
  isSelected,
  isCurrent,
  onClick,
  disabled,
  warning,
}: FlagOptionProps) {
  const borderColor = type === 'red' ? 'border-red-500' : type === 'blue' ? 'border-blue-500' : 'border-gray-500';
  const selectedBorder = isSelected ? borderColor : 'border-gray-700';
  const bgColor = isSelected
    ? type === 'red'
      ? 'bg-red-900/30'
      : type === 'blue'
        ? 'bg-blue-900/30'
        : 'bg-gray-800/30'
    : 'bg-black/30';
  const titleColor = type === 'red' ? 'text-red-400' : type === 'blue' ? 'text-blue-400' : 'text-gray-400';
  const flagIcon = type === 'red' ? '🔴' : type === 'blue' ? '🔵' : '⚪';

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`${bgColor} border-2 ${selectedBorder} rounded-xl p-4 cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
    >
      <div className="text-center mb-4">
        <div className="text-3xl mb-2">{flagIcon}</div>
        <div className={`text-lg font-bold ${titleColor}`}>{title}</div>
        <div className="text-gray-500 text-xs">{subtitle}</div>
      </div>

      <div className="space-y-1 text-sm">
        <BuffLine label="Saldiri" value={buffs.attackBonus} suffix="%" />
        <BuffLine label="Savunma" value={buffs.defenseBonus} suffix="%" />
        <BuffLine label="Hiz" value={buffs.speedBonus} suffix="%" />
        <BuffLine label="EXP" value={buffs.expBonus} suffix="%" />
        <BuffLine label="Gold" value={buffs.goldBonus} suffix="%" />
      </div>

      {buffs.specialEffects.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          {buffs.specialEffects.map((effect, i) => (
            <div key={i} className="text-yellow-400 text-xs mb-1">
              ✓ {effect}
            </div>
          ))}
        </div>
      )}

      {warning && (
        <div className="mt-3 p-2 bg-red-900/30 rounded text-red-400 text-xs">
          ⚠️ {warning}
        </div>
      )}

      {isCurrent && (
        <div className="mt-3 text-center text-yellow-400 text-xs font-bold">
          ★ Mevcut Pusen ★
        </div>
      )}
    </div>
  );
}

// Buff Line Component
function BuffLine({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const color = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-500';
  const prefix = value > 0 ? '+' : '';

  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className={color}>{prefix}{value}{suffix}</span>
    </div>
  );
}
