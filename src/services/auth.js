import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login/', credentials);
  return response.data;
};

export const refreshToken = async (refresh) => {
  const response = await api.post('/auth/refresh/', { refresh });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile/');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch('/auth/profile/', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.post('/auth/change-password/', passwordData);
  return response.data;
};



