import { create } from 'zustand';
import type { Character, CharacterClass } from '../types';
import { characterApi } from '../services/api';

interface CharacterState {
  characters: Character[];
  selectedCharacter: Character | null;
  isLoading: boolean;
  error: string | null;

  fetchCharacters: () => Promise<void>;
  createCharacter: (name: string, characterClass: CharacterClass) => Promise<Character>;
  selectCharacter: (character: Character | null) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  selectedCharacter: null,
  isLoading: false,
  error: null,

  fetchCharacters: async () => {
    set({ isLoading: true, error: null });
    try {
      const characters = await characterApi.list();
      set({ characters, isLoading: false });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Karakterler yüklenemedi';
      set({ error: message, isLoading: false });
    }
  },

  createCharacter: async (name: string, characterClass: CharacterClass) => {
    set({ isLoading: true, error: null });
    try {
      const character = await characterApi.create(name, characterClass);
      set((state) => ({
        characters: [...state.characters, character],
        isLoading: false,
      }));
      return character;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Karakter oluşturulamadı';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  selectCharacter: (character: Character | null) => {
    if (character) {
      localStorage.setItem('selectedCharacterId', character.id);
    } else {
      localStorage.removeItem('selectedCharacterId');
    }
    set({ selectedCharacter: character });
  },

  updateCharacter: (character: Character) => {
    set((state) => ({
      selectedCharacter: state.selectedCharacter?.id === character.id ? character : state.selectedCharacter,
      characters: state.characters.map((c) => c.id === character.id ? character : c),
    }));
  },

  deleteCharacter: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await characterApi.delete(id);
      const { selectedCharacter } = get();
      set((state) => ({
        characters: state.characters.filter((c) => c.id !== id),
        selectedCharacter: selectedCharacter?.id === id ? null : selectedCharacter,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Karakter silinemedi';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
