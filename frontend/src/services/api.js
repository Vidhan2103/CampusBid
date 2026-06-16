import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const switchMode = (mode) => api.put('/auth/mode', { mode });

// Items
export const getItems = (params) => api.get('/items', { params });
export const getItemById = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const getMyListings = () => api.get('/items/my-listings');
export const closeAuction = (id) => api.put(`/items/${id}/close`);
export const acceptBid = (id, bidId) => api.put(`/items/${id}/acceptBid`, { bidId });
export const getCategories = () => api.get('/items/categories');

// Bids
export const placeBid = (data) => api.post('/bids', data);
export const getBidsByItem = (itemId) => api.get(`/bids/${itemId}`);
export const getMyBids = () => api.get('/bids/my-bids');
export const getAuctionsParticipated = () => api.get('/bids/participated');
export const getAuctionsWon = () => api.get('/bids/won');

export default api;
