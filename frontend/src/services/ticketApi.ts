import api from './api';
import type { ApiResponse } from '../types';
import type { Ticket, TicketResponse, TicketCategory, TicketPriority } from '../types/gm';

interface CreateTicketRequest {
  subject: string;
  message: string;
  category: TicketCategory | string;
  priority: TicketPriority | string;
  character_id?: string;
}

export const ticketApi = {
  create: async (data: CreateTicketRequest): Promise<Ticket> => {
    const response = await api.post<ApiResponse<Ticket>>('/tickets', {
      subject: data.subject,
      message: data.message,
      category: data.category,
      priority: data.priority,
      character_id: data.character_id,
    });
    return response.data.data!;
  },

  getMyTickets: async (): Promise<Ticket[]> => {
    const response = await api.get<ApiResponse<Ticket[]>>('/tickets');
    return response.data.data || [];
  },

  list: async (): Promise<Ticket[]> => {
    const response = await api.get<ApiResponse<Ticket[]>>('/tickets');
    return response.data.data || [];
  },

  get: async (id: string): Promise<Ticket> => {
    const response = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return response.data.data!;
  },

  getResponses: async (id: string): Promise<TicketResponse[]> => {
    const response = await api.get<ApiResponse<TicketResponse[]>>(`/tickets/${id}/responses`);
    return response.data.data || [];
  },

  addResponse: async (id: string, message: string): Promise<TicketResponse> => {
    const response = await api.post<ApiResponse<TicketResponse>>(`/tickets/${id}/responses`, {
      message,
    });
    return response.data.data!;
  },
};

// Backward compatibility
export const playerTicketApi = ticketApi;

export default ticketApi;
