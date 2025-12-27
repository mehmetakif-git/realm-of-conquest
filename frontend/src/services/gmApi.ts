import axios from 'axios';
import type { ApiResponse } from '../types';
import type {
  GMAuthResponse,
  GMAccount,
  DashboardStats,
  Ban,
  BanRequest,
  MuteRequest,
  Mute,
  Announcement,
  AnnouncementRequest,
  Ticket,
  TicketMessage,
  TicketStatus,
  TicketMessageRequest,
} from '../types/gm';

const API_URL = '/api/v1/gm';

const gmApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
gmApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('gm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
gmApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gm_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const gmAuthApi = {
  // GM login uses regular account email + password
  login: async (email: string, password: string): Promise<GMAuthResponse> => {
    const response = await gmApi.post<ApiResponse<GMAuthResponse>>('/login', {
      email,
      password,
    });
    return response.data.data!;
  },

  me: async (): Promise<GMAccount> => {
    const response = await gmApi.get<ApiResponse<GMAccount>>('/me');
    return response.data.data!;
  },

  setOnDuty: async (onDuty: boolean): Promise<void> => {
    await gmApi.patch('/duty', { on_duty: onDuty });
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await gmApi.get<ApiResponse<DashboardStats>>('/dashboard');
    return response.data.data!;
  },

  searchPlayers: async (query: string, limit = 20): Promise<any[]> => {
    const response = await gmApi.get<ApiResponse<any[]>>(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data.data || [];
  },
};

// Ban API - account level bans
export const banApi = {
  list: async (limit = 50, offset = 0): Promise<Ban[]> => {
    const response = await gmApi.get<ApiResponse<Ban[]>>(`/bans?limit=${limit}&offset=${offset}`);
    return response.data.data || [];
  },

  create: async (req: BanRequest): Promise<Ban> => {
    const response = await gmApi.post<ApiResponse<Ban>>('/bans', req);
    return response.data.data!;
  },

  remove: async (id: string, reason?: string): Promise<void> => {
    await gmApi.delete(`/bans/${id}`, { data: { reason: reason || 'Unbanned by GM' } });
  },
};

// Mute API - character level mutes
export const muteApi = {
  list: async (limit = 50, offset = 0): Promise<Mute[]> => {
    const response = await gmApi.get<ApiResponse<Mute[]>>(`/mutes?limit=${limit}&offset=${offset}`);
    return response.data.data || [];
  },

  create: async (req: MuteRequest): Promise<Mute> => {
    const response = await gmApi.post<ApiResponse<Mute>>('/mutes', req);
    return response.data.data!;
  },

  remove: async (id: string): Promise<void> => {
    await gmApi.delete(`/mutes/${id}`);
  },
};

// Announcement API
export const announcementApi = {
  list: async (): Promise<Announcement[]> => {
    const response = await axios.get<ApiResponse<Announcement[]>>('/api/v1/announcements');
    return response.data.data || [];
  },

  create: async (req: AnnouncementRequest): Promise<Announcement> => {
    // Map compatibility fields
    const payload = {
      ...req,
      announcement_type: req.announcement_type || req.type,
      message: req.message || req.content,
    };
    const response = await gmApi.post<ApiResponse<Announcement>>('/announcements', payload);
    return response.data.data!;
  },

  deactivate: async (id: string): Promise<void> => {
    await gmApi.delete(`/announcements/${id}`);
  },
};

// Ticket API - GM operations
export const ticketApi = {
  list: async (status?: TicketStatus, limit = 50, offset = 0): Promise<Ticket[]> => {
    let url = `/tickets?limit=${limit}&offset=${offset}`;
    if (status) url += `&status=${status}`;
    const response = await gmApi.get<ApiResponse<Ticket[]>>(url);
    return response.data.data || [];
  },

  get: async (id: string): Promise<Ticket> => {
    const response = await gmApi.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return response.data.data!;
  },

  getMessages: async (id: string): Promise<TicketMessage[]> => {
    const response = await gmApi.get<ApiResponse<TicketMessage[]>>(`/tickets/${id}/messages`);
    return response.data.data || [];
  },

  assign: async (id: string): Promise<void> => {
    await gmApi.post(`/tickets/${id}/assign`);
  },

  resolve: async (id: string, resolution: string): Promise<void> => {
    await gmApi.post(`/tickets/${id}/resolve`, { resolution });
  },

  close: async (id: string): Promise<void> => {
    await gmApi.post(`/tickets/${id}/close`);
  },

  addMessage: async (id: string, req: TicketMessageRequest): Promise<TicketMessage> => {
    const response = await gmApi.post<ApiResponse<TicketMessage>>(`/tickets/${id}/messages`, req);
    return response.data.data!;
  },

  // Legacy compatibility
  getResponses: async (id: string): Promise<TicketMessage[]> => {
    return ticketApi.getMessages(id);
  },

  updateStatus: async (id: string, status: TicketStatus): Promise<void> => {
    if (status === 'in_progress') {
      await ticketApi.assign(id);
    } else if (status === 'resolved') {
      await ticketApi.resolve(id, 'Resolved by GM');
    } else if (status === 'closed') {
      await ticketApi.close(id);
    }
  },

  respond: async (id: string, message: string, isInternal = false): Promise<TicketMessage> => {
    return ticketApi.addMessage(id, { message, is_internal: isInternal });
  },
};

export default gmApi;
