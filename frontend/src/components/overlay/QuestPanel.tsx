interface Quest {
  id: string;
  title: string;
  chapter?: string;
  description: string;
  progress?: number;
  maxProgress?: number;
  nextStep?: string;
  isComplete?: boolean;
}

interface QuestPanelProps {
  activeQuest?: Quest;
  onGoNowClick?: () => void;
  onQuestClick?: () => void;
}

export default function QuestPanel({
  activeQuest,
  onGoNowClick,
  onQuestClick,
}: QuestPanelProps) {
  // Demo quest if none provided
  const quest: Quest = activeQuest || {
    id: '1',
    title: 'Chapter 2: Warrior Hamlet',
    chapter: 'Chapter 2',
    description: 'Go to Scutia and protect the villagers.',
    progress: 0,
    maxProgress: 100,
    nextStep: 'Pandora',
    isComplete: false,
  };

  return (
    <div className="absolute top-[400px] right-2 z-30 w-48">
      {/* Quest Complete Banner (if complete) */}
      {quest.isComplete && (
        <div className="mb-2 text-center">
          <div
            className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-black font-bold text-lg rounded"
            style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
          >
            Quest Complete
          </div>
        </div>
      )}

      {/* Quest Panel */}
      <div
        onClick={onQuestClick}
        className="bg-black/80 backdrop-blur-sm rounded-lg border border-yellow-600/50 overflow-hidden cursor-pointer hover:border-yellow-500 transition-colors"
      >
        {/* Quest Title */}
        <div className="px-3 py-2 bg-gradient-to-r from-yellow-900/50 to-transparent border-b border-yellow-600/30">
          <h3 className="text-yellow-400 font-bold text-sm">{quest.title}</h3>
        </div>

        {/* Progress Bar */}
        {quest.progress !== undefined && quest.maxProgress !== undefined && (
          <div className="px-3 py-2 border-b border-gray-700">
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
              <span>Chapter Progress</span>
              <span>{Math.floor((quest.progress / quest.maxProgress) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
                style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quest Description */}
        <div className="px-3 py-2 border-b border-gray-700">
          <p className="text-[10px] text-gray-500 mb-1">Quest Description</p>
          <p className="text-gray-300 text-xs leading-relaxed">
            {quest.description}
          </p>
        </div>

        {/* Complete Quest / Next Step */}
        <div className="px-3 py-2 border-b border-gray-700">
          <p className="text-yellow-400 text-xs font-bold mb-1">
            {quest.isComplete ? 'Complete Quest' : 'Next step:'}
          </p>
          {quest.nextStep && (
            <p className="text-blue-400 text-xs underline cursor-pointer hover:text-blue-300">
              {quest.nextStep}
            </p>
          )}
        </div>

        {/* Go Now Button */}
        <div className="p-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGoNowClick?.();
            }}
            className="w-full py-2 bg-gradient-to-b from-green-500 to-green-700 text-white font-bold text-sm rounded border border-green-400 hover:from-green-400 hover:to-green-600 transition-colors"
          >
            GO NOW
          </button>
        </div>
      </div>
    </div>
  );
}
