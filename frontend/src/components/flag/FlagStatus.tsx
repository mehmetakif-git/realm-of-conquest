import type { FlagType } from '../../types/flag';
import { getInfamyLevel, getKarmaLevel } from '../../types/flag';
import FlagIndicator from './FlagIndicator';

interface FlagStatusProps {
  flag: FlagType;
  infamy: number;
  karma: number;
  onOpenSelector: () => void;
}

export default function FlagStatus({ flag, infamy, karma, onOpenSelector }: FlagStatusProps) {
  const flagColors = {
    neutral: { bg: 'from-gray-800 to-gray-900', border: 'border-gray-600', text: 'text-gray-400', label: 'Tarafsiz' },
    red: { bg: 'from-red-900/50 to-red-950/50', border: 'border-red-600', text: 'text-red-400', label: 'Haydut' },
    blue: { bg: 'from-blue-900/50 to-blue-950/50', border: 'border-blue-600', text: 'text-blue-400', label: 'Koruyucu' },
  };

  const { bg, border, text, label } = flagColors[flag];
  const infamyLevel = getInfamyLevel(infamy);
  const karmaLevel = getKarmaLevel(karma);

  return (
    <button
      onClick={onOpenSelector}
      className={`w-full bg-gradient-to-b ${bg} ${border} border rounded-lg p-2.5 cursor-pointer hover:opacity-90 transition-all text-left`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FlagIndicator flag={flag} size="medium" />
          <span className={`${text} font-bold text-sm`}>{label}</span>
        </div>
        <span className="text-gray-500 text-[10px]">Degistir &rarr;</span>
      </div>

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-red-500">&#9760;</span>
          <span className="text-white font-bold">{infamy}</span>
          <span style={{ color: infamyLevel.color }} className="text-[10px]">
            ({infamyLevel.title})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-green-400">&#10024;</span>
          <span className="text-white font-bold">{karma}</span>
          <span style={{ color: karmaLevel.color }} className="text-[10px]">
            ({karmaLevel.title})
          </span>
        </div>
      </div>
    </button>
  );
}
