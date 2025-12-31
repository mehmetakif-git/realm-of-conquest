import { useState } from 'react';
import { FantasyButton, FantasyPanel, ProgressBar } from '../ui';

interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
  maxLevel: number;
  type: 'active' | 'passive';
  cooldown?: number;
  manaCost?: number;
  damage?: number;
  unlockLevel: number;
  isUnlocked: boolean;
}

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills?: Skill[];
  skillPoints?: number;
  onUpgradeSkill?: (skillId: string) => void;
  onEquipSkill?: (skillId: string, slot: number) => void;
}

// Skill categories based on class
const SKILL_CATEGORIES = [
  { id: 'all', label: 'Tumu', icon: '📚' },
  { id: 'active', label: 'Aktif', icon: '⚡' },
  { id: 'passive', label: 'Pasif', icon: '🔮' },
];

export default function SkillsModal({
  isOpen,
  onClose,
  skills = [],
  skillPoints = 0,
  onUpgradeSkill,
  onEquipSkill,
}: SkillsModalProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [draggedSkill, setDraggedSkill] = useState<Skill | null>(null);

  if (!isOpen) return null;

  // Filter skills by category
  const filteredSkills = activeCategory === 'all'
    ? skills
    : skills.filter(skill => skill.type === activeCategory);

  // Demo skills if none provided
  const demoSkills: Skill[] = skills.length > 0 ? skills : [
    { id: '1', name: 'Guclu Vuruş', icon: '⚔️', description: 'Dusmana guclu bir darbe indirir.', level: 3, maxLevel: 10, type: 'active', cooldown: 5, manaCost: 20, damage: 150, unlockLevel: 1, isUnlocked: true },
    { id: '2', name: 'Kalkan Blogu', icon: '🛡️', description: 'Hasari bloklama sansini arttirir.', level: 2, maxLevel: 5, type: 'passive', unlockLevel: 5, isUnlocked: true },
    { id: '3', name: 'Savas Naraşi', icon: '📣', description: 'Saldiri gucunu gecici olarak arttirir.', level: 1, maxLevel: 5, type: 'active', cooldown: 30, manaCost: 50, unlockLevel: 10, isUnlocked: true },
    { id: '4', name: 'Kritik Vurus', icon: '💥', description: 'Kritik vurus sansini arttirir.', level: 0, maxLevel: 5, type: 'passive', unlockLevel: 15, isUnlocked: false },
    { id: '5', name: 'Son Direniş', icon: '🔥', description: 'Olumcul hasar aldiginda hayatta kalir.', level: 0, maxLevel: 3, type: 'passive', unlockLevel: 20, isUnlocked: false },
  ];

  const displaySkills = filteredSkills.length > 0 ? filteredSkills :
    (activeCategory === 'all' ? demoSkills : demoSkills.filter(s => s.type === activeCategory));

  // Skill slots (hotbar)
  const skillSlots = [1, 2, 3, 4, 5, 6];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[700px] max-h-[90vh] animate-scaleIn">
        <FantasyPanel variant="gold" className="p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-yellow-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <h2 className="text-xl font-bold text-yellow-400">Yetenekler</h2>
              <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-blue-500/20 rounded border border-blue-500/50">
                <span className="text-blue-400 text-sm">Yetenek Puani:</span>
                <span className="text-blue-300 font-bold">{skillPoints}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-4">
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500'
                      : 'bg-gray-800 text-gray-400 border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {displaySkills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  draggable={skill.isUnlocked && skill.type === 'active'}
                  onDragStart={() => setDraggedSkill(skill)}
                  onDragEnd={() => setDraggedSkill(null)}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${skill.isUnlocked
                      ? 'bg-gradient-to-r from-[#1a1a2e] to-[#2a2a4e] border-gray-600 hover:border-yellow-500'
                      : 'bg-gray-900/50 border-gray-700 opacity-60'
                    }
                    ${selectedSkill?.id === skill.id ? 'ring-2 ring-yellow-500' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-14 h-14 rounded-lg flex items-center justify-center text-2xl
                      ${skill.isUnlocked
                        ? 'bg-gradient-to-b from-purple-600 to-purple-900 border-2 border-purple-400'
                        : 'bg-gray-800 border-2 border-gray-600'
                      }
                    `}>
                      {skill.isUnlocked ? skill.icon : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold text-sm ${skill.isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                          {skill.name}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          skill.type === 'active'
                            ? 'bg-orange-500/30 text-orange-400'
                            : 'bg-blue-500/30 text-blue-400'
                        }`}>
                          {skill.type === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>

                      {skill.isUnlocked ? (
                        <>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {skill.description}
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-400">Seviye</span>
                              <span className="text-yellow-400">{skill.level}/{skill.maxLevel}</span>
                            </div>
                            <ProgressBar
                              current={skill.level}
                              max={skill.maxLevel}
                              type="exp"
                              showText={false}
                              showValues={false}
                              size="small"
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          Seviye {skill.unlockLevel}'de acilir
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Skill Details */}
            {selectedSkill && selectedSkill.isUnlocked && (
              <div className="mt-4 p-4 bg-black/50 rounded-lg border border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-b from-purple-600 to-purple-900 border-2 border-purple-400 flex items-center justify-center text-3xl">
                    {selectedSkill.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-400 text-lg">
                      {selectedSkill.name}
                    </h4>
                    <p className="text-sm text-gray-300 mt-1">
                      {selectedSkill.description}
                    </p>
                    <div className="flex gap-4 mt-3 text-xs">
                      {selectedSkill.cooldown && (
                        <span className="text-cyan-400">
                          ⏱️ Bekleme: {selectedSkill.cooldown}s
                        </span>
                      )}
                      {selectedSkill.manaCost && (
                        <span className="text-blue-400">
                          💧 Mana: {selectedSkill.manaCost}
                        </span>
                      )}
                      {selectedSkill.damage && (
                        <span className="text-red-400">
                          ⚔️ Hasar: {selectedSkill.damage}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {selectedSkill.level < selectedSkill.maxLevel && skillPoints > 0 && (
                      <FantasyButton
                        variant="gold"
                        size="small"
                        onClick={() => onUpgradeSkill?.(selectedSkill.id)}
                      >
                        Gelistir
                      </FantasyButton>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Skill Hotbar */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Yetenek Cubugu</h3>
              <div className="flex items-center justify-center gap-2">
                {skillSlots.map((slot) => (
                  <div
                    key={slot}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedSkill && draggedSkill.type === 'active') {
                        onEquipSkill?.(draggedSkill.id, slot);
                      }
                    }}
                    className="w-14 h-14 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg border-2 border-gray-600 hover:border-yellow-500 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="text-gray-500 text-sm font-bold">{slot}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">
                Aktif yetenekleri surukleyip cubuga birak
              </p>
            </div>
          </div>
        </FantasyPanel>
      </div>
    </div>
  );
}
