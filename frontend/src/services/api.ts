import axios from 'axios';
import { Product, Favorite, ScrapeRequest, ScrapeResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  getAll: async (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const response = await api.get<Product[]>(`/products?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  getPriceHistory: async (id: number) => {
    const response = await api.get(`/products/${id}/history`);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/products/${id}`);
  },
};

export const scraperApi = {
  scrape: async (request: ScrapeRequest) => {
    const response = await api.post<ScrapeResponse>('/scraper/scrape', request);
    return response.data;
  },
};

export const favoritesApi = {
  getAll: async (userId: string) => {
    const response = await api.get<Favorite[]>(`/favorites?user_id=${userId}`);
    return response.data;
  },

  add: async (userId: string, productId: number) => {
    const response = await api.post<Favorite>('/favorites', {
      user_id: userId,
      product_id: productId,
    });
    return response.data;
  },

  remove: async (userId: string, productId: number) => {
    await api.delete(`/favorites/user/${userId}/product/${productId}`);
  },
};
