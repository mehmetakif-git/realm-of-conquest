import api from './api';
import type { ApiResponse } from '../types';

// Online GM bilgisi
export interface OnlineGM {
  gm_name: string;
  role: string;
  is_on_duty: boolean;
}

// Karakter GM bilgisi
export interface CharacterGMInfo {
  is_gm: boolean;
  gm_name?: string;
  role?: string;
  is_on_duty?: boolean;
  is_visible?: boolean;
}

// Online oyuncu
export interface OnlinePlayer {
  id: string;
  name: string;
  class: string;
  level: number;
  is_online: boolean;
  gm_info?: CharacterGMInfo;
}

export const gameApi = {
  // Public: Online GM listesi
  getOnlineGMs: async (): Promise<OnlineGM[]> => {
    const response = await api.get<ApiResponse<OnlineGM[]>>('/gms/online');
    return response.data.data || [];
  },

  // Authenticated: Karakter GM kontrolü
  getCharacterGMInfo: async (characterId: string): Promise<CharacterGMInfo> => {
    const response = await api.get<ApiResponse<CharacterGMInfo>>(`/characters/${characterId}/gm-info`);
    return response.data.data || { is_gm: false };
  },

  // Duyuruları getir
  getAnnouncements: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/announcements');
    return response.data.data || [];
  },
};

export default gameApi;
