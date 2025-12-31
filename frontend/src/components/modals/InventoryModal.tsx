import { useState } from 'react';
import { FantasyButton, FantasyPanel } from '../ui';
import type { Character, Item } from '../../types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  items?: Item[];
  onEquipItem?: (itemId: string) => void;
  onUseItem?: (itemId: string) => void;
  onDropItem?: (itemId: string) => void;
}

// Inventory slot categories
const SLOT_CATEGORIES = [
  { id: 'all', label: 'Tumu', icon: '📦' },
  { id: 'weapon', label: 'Silah', icon: '⚔️' },
  { id: 'armor', label: 'Zirh', icon: '🛡️' },
  { id: 'accessory', label: 'Aksesuar', icon: '💍' },
  { id: 'consumable', label: 'Tuketim', icon: '🧪' },
  { id: 'material', label: 'Malzeme', icon: '🔧' },
];

// Rarity colors
const RARITY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  common: { border: 'border-gray-500', bg: 'from-gray-700 to-gray-800', text: 'text-gray-300' },
  uncommon: { border: 'border-green-500', bg: 'from-green-800 to-green-900', text: 'text-green-400' },
  rare: { border: 'border-blue-500', bg: 'from-blue-800 to-blue-900', text: 'text-blue-400' },
  epic: { border: 'border-purple-500', bg: 'from-purple-800 to-purple-900', text: 'text-purple-400' },
  legendary: { border: 'border-yellow-500', bg: 'from-yellow-700 to-yellow-900', text: 'text-yellow-400' },
};

export default function InventoryModal({
  isOpen,
  onClose,
  character,
  items = [],
  onEquipItem,
  onUseItem,
  onDropItem,
}: InventoryModalProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  if (!isOpen) return null;

  // Filter items by category
  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(item => item.type === activeCategory);

  // Create inventory grid (6x5 = 30 slots)
  const INVENTORY_SLOTS = 30;
  const inventorySlots = Array.from({ length: INVENTORY_SLOTS }, (_, i) => {
    return filteredItems[i] || null;
  });

  const getRarityStyle = (rarity: string = 'common') => {
    return RARITY_COLORS[rarity] || RARITY_COLORS.common;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[800px] max-h-[90vh] animate-scaleIn">
        <FantasyPanel variant="gold" className="p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-yellow-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎒</span>
              <h2 className="text-xl font-bold text-yellow-400">Envanter</h2>
              <span className="text-sm text-gray-400">
                ({items.length}/{INVENTORY_SLOTS})
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="flex">
            {/* Left Side - Character Equipment */}
            <div className="w-[200px] p-4 border-r border-yellow-500/20 bg-black/30">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Ekipman</h3>

              {/* Equipment Slots */}
              <div className="space-y-2">
                {/* Weapon */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-b from-gray-700 to-gray-900 rounded border-2 border-gray-600 flex items-center justify-center">
                    <span className="text-gray-500">⚔️</span>
                  </div>
                  <span className="text-xs text-gray-400">Silah</span>
                </div>

                {/* Helmet */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-b from-gray-700 to-gray-900 rounded border-2 border-gray-600 flex items-center justify-center">
                    <span className="text-gray-500">🪖</span>
                  </div>
                  <span className="text-xs text-gray-400">Kask</span>
                </div>

                {/* Armor */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-b from-gray-700 to-gray-900 rounded border-2 border-gray-600 flex items-center justify-center">
                    <span className="text-gray-500">🛡️</span>
                  </div>
                  <span className="text-xs text-gray-400">Zirh</span>
                </div>

                {/* Boots */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-b from-gray-700 to-gray-900 rounded border-2 border-gray-600 flex items-center justify-center">
                    <span className="text-gray-500">👢</span>
                  </div>
                  <span className="text-xs text-gray-400">Bot</span>
                </div>

                {/* Ring */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-b from-gray-700 to-gray-900 rounded border-2 border-gray-600 flex items-center justify-center">
                    <span className="text-gray-500">💍</span>
                  </div>
                  <span className="text-xs text-gray-400">Yuzuk</span>
                </div>

                {/* Necklace */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-b from-gray-700 to-gray-900 rounded border-2 border-gray-600 flex items-center justify-center">
                    <span className="text-gray-500">📿</span>
                  </div>
                  <span className="text-xs text-gray-400">Kolye</span>
                </div>
              </div>

              {/* Gold Display */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-500">💰</span>
                  <span className="text-yellow-400 font-bold">
                    {character.gold?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Inventory Grid */}
            <div className="flex-1 p-4">
              {/* Category Tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {SLOT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500'
                        : 'bg-gray-800 text-gray-400 border border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              {/* Inventory Grid */}
              <div className="grid grid-cols-6 gap-2">
                {inventorySlots.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => item && setSelectedItem(item)}
                    className={`
                      aspect-square rounded cursor-pointer transition-all
                      ${item
                        ? `bg-gradient-to-b ${getRarityStyle(item.rarity).bg} border-2 ${getRarityStyle(item.rarity).border} hover:scale-105`
                        : 'bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-700 hover:border-gray-600'
                      }
                      ${selectedItem?.id === item?.id ? 'ring-2 ring-yellow-500' : ''}
                    `}
                  >
                    {item ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1">
                        <span className="text-2xl">{item.icon || '📦'}</span>
                        {item.quantity && item.quantity > 1 && (
                          <span className="text-xs text-white font-bold">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Selected Item Info */}
              {selectedItem && (
                <div className="mt-4 p-3 bg-black/50 rounded-lg border border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className={`w-16 h-16 rounded bg-gradient-to-b ${getRarityStyle(selectedItem.rarity).bg} border-2 ${getRarityStyle(selectedItem.rarity).border} flex items-center justify-center`}>
                      <span className="text-3xl">{selectedItem.icon || '📦'}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${getRarityStyle(selectedItem.rarity).text}`}>
                        {selectedItem.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {selectedItem.description || 'Aciklama yok'}
                      </p>
                      {selectedItem.stats && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {Object.entries(selectedItem.stats).map(([stat, value]) => (
                            <span key={stat} className="text-xs text-green-400">
                              +{String(value)} {stat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {selectedItem.type !== 'consumable' && (
                        <FantasyButton
                          variant="gold"
                          size="small"
                          onClick={() => onEquipItem?.(selectedItem.id)}
                        >
                          Kus
                        </FantasyButton>
                      )}
                      {selectedItem.type === 'consumable' && (
                        <FantasyButton
                          variant="blue"
                          size="small"
                          onClick={() => onUseItem?.(selectedItem.id)}
                        >
                          Kullan
                        </FantasyButton>
                      )}
                      <FantasyButton
                        variant="red"
                        size="small"
                        onClick={() => onDropItem?.(selectedItem.id)}
                      >
                        At
                      </FantasyButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FantasyPanel>
      </div>
    </div>
  );
}
