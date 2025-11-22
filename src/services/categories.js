import api from './api';

export const getCategories = async (params = {}) => {
  const response = await api.get('/categories/', { params });
  return response.data;
};

export const getCategory = async (id) => {
  const response = await api.get(`/categories/${id}/`);
  return response.data;
};

