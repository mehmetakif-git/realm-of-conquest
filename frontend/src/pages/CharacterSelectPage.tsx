import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCharacterStore } from '../stores/characterStore';
import { CLASS_INFO, type Character } from '../types';
import CreateCharacterModal from '../components/CreateCharacterModal';

export default function CharacterSelectPage() {
  const navigate = useNavigate();
  const { account, logout } = useAuthStore();
  const { characters, isLoading, error, fetchCharacters, selectCharacter, deleteCharacter } = useCharacterStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleSelectCharacter = (character: Character) => {
    selectCharacter(character);
    navigate('/game');
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      await deleteCharacter(id);
      setDeleteConfirm(null);
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-game text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
            Realm of Conquest
          </h1>
          <p className="text-gray-400">Hoş geldin, {account?.username}</p>
        </div>
        <button
          onClick={logout}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Character Selection */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Karakter Seç</h2>
          {characters.length < 5 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-secondary"
            >
              + Yeni Karakter
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-400">Yükleniyor...</p>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-xl text-gray-400 mb-4">Henüz karakterin yok</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              İlk Karakterini Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character) => {
              const classInfo = CLASS_INFO[character.class];
              return (
                <div
                  key={character.id}
                  className="card hover:scale-105 cursor-pointer group relative"
                  onClick={() => handleSelectCharacter(character)}
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(character.id);
                    }}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    🗑️
                  </button>

                  {/* Class Icon & Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${classInfo.color} flex items-center justify-center text-3xl shadow-lg`}>
                      {classInfo.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{character.name}</h3>
                      <p className="text-gray-400">{classInfo.nameTR}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-game-dark/50 rounded px-3 py-2">
                      <span className="text-gray-400">Seviye:</span>
                      <span className="float-right font-bold text-yellow-400">{character.level}</span>
                    </div>
                    <div className="bg-game-dark/50 rounded px-3 py-2">
                      <span className="text-gray-400">Cap:</span>
                      <span className="float-right font-bold text-purple-400">{character.cap}</span>
                    </div>
                    <div className="bg-game-dark/50 rounded px-3 py-2">
                      <span className="text-gray-400">HP:</span>
                      <span className="float-right font-bold text-red-400">{character.hp}/{character.max_hp}</span>
                    </div>
                    <div className="bg-game-dark/50 rounded px-3 py-2">
                      <span className="text-gray-400">MP:</span>
                      <span className="float-right font-bold text-blue-400">{character.mp}/{character.max_mp}</span>
                    </div>
                  </div>

                  {/* Gold */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <span className="text-yellow-500">💰</span>
                    <span className="ml-2 font-bold">{character.gold.toLocaleString()} Gold</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Character Modal */}
      {showCreateModal && (
        <CreateCharacterModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Karakteri Sil</h3>
            <p className="text-gray-400 mb-6">
              Bu karakteri silmek istediğinden emin misin? Bu işlem geri alınamaz!
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDeleteCharacter(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-500 py-3 rounded-lg transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
