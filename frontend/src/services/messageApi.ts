import api from './api';
import type { ApiResponse } from '../types';
import type { PrivateMessage } from '../types/gm';

export const messageApi = {
  send: async (receiverId: string, content: string): Promise<PrivateMessage> => {
    const response = await api.post<ApiResponse<PrivateMessage>>('/messages', {
      receiver_id: receiverId,
      content,
    });
    return response.data.data!;
  },

  getInbox: async (limit = 50, offset = 0): Promise<PrivateMessage[]> => {
    const response = await api.get<ApiResponse<PrivateMessage[]>>(`/messages/inbox?limit=${limit}&offset=${offset}`);
    return response.data.data || [];
  },

  getSent: async (limit = 50, offset = 0): Promise<PrivateMessage[]> => {
    const response = await api.get<ApiResponse<PrivateMessage[]>>(`/messages/sent?limit=${limit}&offset=${offset}`);
    return response.data.data || [];
  },

  getConversation: async (userId: string, limit = 50, offset = 0): Promise<PrivateMessage[]> => {
    const response = await api.get<ApiResponse<PrivateMessage[]>>(`/messages/conversation/${userId}?limit=${limit}&offset=${offset}`);
    return response.data.data || [];
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ unread_count: number }>>('/messages/unread');
    return response.data.data?.unread_count || 0;
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await api.patch(`/messages/${messageId}/read`);
  },

  delete: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
  },
};

export default messageApi;
