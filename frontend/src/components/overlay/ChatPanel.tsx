import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  channel: 'world' | 'nearby' | 'party' | 'alliance' | 'system';
  sender?: string;
  content: string;
  color?: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages?: ChatMessage[];
  onSendMessage?: (message: string, channel: string) => void;
}

const CHANNEL_COLORS: Record<string, string> = {
  world: 'text-yellow-400',
  nearby: 'text-white',
  party: 'text-cyan-400',
  alliance: 'text-green-400',
  system: 'text-red-400',
};

const CHANNEL_LABELS: Record<string, string> = {
  world: 'World',
  nearby: 'Nearby',
  party: 'Party',
  alliance: 'Alliance',
  system: 'System',
};

export default function ChatPanel({
  messages = [],
  onSendMessage,
}: ChatPanelProps) {
  const [activeChannel, setActiveChannel] = useState('world');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Demo messages
  const demoMessages: ChatMessage[] = messages.length > 0 ? messages : [
    { id: '1', channel: 'system', content: "DON'T BELIEVE ANY SCAMS, SUCH AS SELLING GOLD OR GIVING FIRST. CHARGES !", timestamp: new Date(), color: 'text-red-400' },
    { id: '2', channel: 'world', sender: 's230.lebaburt', content: 'in my main only you can get is in boss level 30>Translate', timestamp: new Date() },
    { id: '3', channel: 'system', content: 's230.Sandroon has successfully defeated a world boss Bloodthirsty Tiger King(180 level), earning the ultimate item: Eight Ring of Mines !', timestamp: new Date() },
    { id: '4', channel: 'world', sender: 's230.GOLDIGGER', content: 'JUST FARM I HAVE ACCOUNT in S155>Translate', timestamp: new Date() },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [demoMessages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage?.(inputValue, activeChannel);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-2 left-2 z-30 w-[350px]">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
        {/* Channel Tabs */}
        <div className="flex items-center gap-1 px-2 py-1 bg-black/50 border-b border-gray-700 overflow-x-auto">
          {Object.entries(CHANNEL_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveChannel(key)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors whitespace-nowrap ${
                activeChannel === key
                  ? 'bg-yellow-600/50 text-yellow-300'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
          {/* Settings icons */}
          <div className="ml-auto flex items-center gap-1">
            <button className="text-gray-500 hover:text-gray-400 text-sm">⚙️</button>
            <button className="text-gray-500 hover:text-gray-400 text-sm">🔊</button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-[100px] overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-700">
          {demoMessages.map((msg) => (
            <div key={msg.id} className="text-[11px] leading-tight">
              {msg.channel === 'system' ? (
                <span className="text-red-400">[System] {msg.content}</span>
              ) : (
                <>
                  <span className={CHANNEL_COLORS[msg.channel]}>
                    [{CHANNEL_LABELS[msg.channel]}]
                  </span>
                  {msg.sender && (
                    <span className="text-blue-400 ml-1">{msg.sender}</span>
                  )}
                  <span className="text-gray-300 ml-1">{msg.content}</span>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2 px-2 py-1.5 bg-black/50 border-t border-gray-700">
          <span className={`text-[10px] font-bold ${CHANNEL_COLORS[activeChannel]}`}>
            [{CHANNEL_LABELS[activeChannel]}]
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Click to enter chat message..."
            className="flex-1 bg-gray-900/50 text-white text-xs px-2 py-1 rounded border border-gray-700 focus:border-yellow-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="px-3 py-1 bg-gradient-to-b from-yellow-500 to-yellow-700 text-black text-xs font-bold rounded hover:from-yellow-400 hover:to-yellow-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
