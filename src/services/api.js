import axios from 'axios';
import { message } from 'antd';
import { API_BASE_URL } from '../utils/constants';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens, isAccessTokenExpired } from '../utils/tokenManager';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor: Add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors and auto-refresh tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        setAccessToken(access);
        
        // If new refresh token is provided, update it
        if (response.data.refresh) {
          setRefreshToken(response.data.refresh);
        }

        processQueue(null, access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        processQueue(refreshError, null);
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 403) {
        message.error(data.detail || 'You do not have permission to perform this action.');
      } else if (status === 404) {
        message.error(data.detail || 'Resource not found.');
      } else if (status >= 500) {
        message.error('Server error. Please try again later.');
      } else if (data) {
        // Handle field-specific errors
        const errorMessages = Object.entries(data)
          .flatMap(([key, value]) => {
            if (Array.isArray(value)) {
              return value.map((msg) => `${key}: ${msg}`);
            }
            return [`${key}: ${value}`];
          });
        
        if (errorMessages.length > 0) {
          message.error(errorMessages[0]);
        }
      }
    } else if (error.request) {
      // Request made but no response
      message.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      message.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default api;




