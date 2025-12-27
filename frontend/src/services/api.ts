import axios, { AxiosError } from 'axios';
import type { Account, AuthResponse, Character, ApiResponse, ApiError } from '../types';

const API_URL = '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      email,
      username,
      password,
    });
    return response.data.data!;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  },

  me: async (): Promise<Account> => {
    const response = await api.get<ApiResponse<Account>>('/auth/me');
    return response.data.data!;
  },
};

// Character API
export const characterApi = {
  list: async (): Promise<Character[]> => {
    const response = await api.get<ApiResponse<Character[]>>('/characters');
    return response.data.data || [];
  },

  create: async (name: string, characterClass: string): Promise<Character> => {
    const response = await api.post<ApiResponse<Character>>('/characters', {
      name,
      class: characterClass,
    });
    return response.data.data!;
  },

  get: async (id: string): Promise<Character> => {
    const response = await api.get<ApiResponse<Character>>(`/characters/${id}`);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/characters/${id}`);
  },
};

export default api;
