import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { CLASS_INFO, type CharacterClass } from '../types';
import clsx from 'clsx';

interface Props {
  onClose: () => void;
}

const CLASSES: CharacterClass[] = ['warrior', 'archer', 'mage', 'healer', 'ninja'];

export default function CreateCharacterModal({ onClose }: Props) {
  const { createCharacter, isLoading, error, clearError } = useCharacterStore();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!name.trim()) {
      setLocalError('Karakter adı gerekli');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,16}$/.test(name)) {
      setLocalError('Karakter adı 3-16 karakter olmalı (harf, rakam, alt çizgi)');
      return;
    }

    if (!selectedClass) {
      setLocalError('Bir sınıf seçmelisin');
      return;
    }

    try {
      await createCharacter(name, selectedClass);
      onClose();
    } catch {
      // Error handled in store
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Karakter Oluştur</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {displayError && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Character Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Karakter Adı
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="KahraSavaşçı"
              maxLength={16}
            />
            <p className="text-xs text-gray-500 mt-1">
              3-16 karakter, sadece harf, rakam ve alt çizgi
            </p>
          </div>

          {/* Class Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Sınıf Seç
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CLASSES.map((cls) => {
                const info = CLASS_INFO[cls];
                const isSelected = selectedClass === cls;
                return (
                  <div
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={clsx(
                      'cursor-pointer rounded-xl p-4 border-2 transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10 scale-105'
                        : 'border-gray-700 hover:border-gray-600 bg-game-dark/50'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${info.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-bold">{info.nameTR}</h4>
                        <p className="text-xs text-gray-400">{info.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Class Stats Preview */}
          {selectedClass && (
            <div className="mb-6 p-4 bg-game-dark/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Başlangıç İstatistikleri</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <span className="text-red-400">HP</span>
                  <p className="font-bold">{CLASS_INFO[selectedClass].name === 'Warrior' ? 120 : CLASS_INFO[selectedClass].name === 'Archer' ? 80 : CLASS_INFO[selectedClass].name === 'Mage' ? 60 : CLASS_INFO[selectedClass].name === 'Healer' ? 90 : 70}</p>
                </div>
                <div className="text-center">
                  <span className="text-blue-400">MP</span>
                  <p className="font-bold">{CLASS_INFO[selectedClass].name === 'Warrior' ? 40 : CLASS_INFO[selectedClass].name === 'Archer' ? 60 : CLASS_INFO[selectedClass].name === 'Mage' ? 120 : CLASS_INFO[selectedClass].name === 'Healer' ? 100 : 70}</p>
                </div>
                <div className="text-center">
                  <span className="text-pink-400">CRIT</span>
                  <p className="font-bold">{CLASS_INFO[selectedClass].name === 'Warrior' ? 5 : CLASS_INFO[selectedClass].name === 'Archer' ? 15 : CLASS_INFO[selectedClass].name === 'Mage' ? 10 : CLASS_INFO[selectedClass].name === 'Healer' ? 5 : 25}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedClass || !name.trim()}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
