import axios from 'axios';
import type { SearchResponse, ProductDetails } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchProducts = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse> => {
  const response = await api.get<SearchResponse>(`/search/${encodeURIComponent(query)}`, {
    params: { page, limit },
  });
  return response.data;
};

export const getProductDetails = async (
  url: string,
  name?: string
): Promise<ProductDetails> => {
  const response = await api.get<ProductDetails>('/product/analyze', {
    params: { url, name },
  });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export default api;
