import axios from "axios"

// API Base URL
const API_URL = process.env.REACT_APP_API_URL ;

// Create axios instance
const axiosApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
axiosApi.interceptors.request.use(
  (config) => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      const user = JSON.parse(authUser);
      // Backend response yapısına göre token'ı data.token'dan al
      const token = user.data?.token || user.token || user.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // FormData için Content-Type header'ını otomatik ayarla
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const postJwtLogin = async (data) => {
  try {
    console.log('Login isteği gönderiliyor:', data);
    const response = await axiosApi.post('/api/auth/login', data);
    console.log('Login başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login hatası:', error);
    if (error.response) {
      throw error.response.data?.message || 'Login failed';
    } else if (error.request) {
      throw 'Network error - Backend bağlantısı kurulamadı';
    } else {
      throw error.message;
    }
  }
};

export const postJwtRegister = async (data) => {
  try {
    const response = await axiosApi.post('/api/auth/register', data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data?.message || 'Registration failed';
    } else if (error.request) {
      throw 'Network error';
    } else {
      throw error.message;
    }
  }
};

export const postJwtForgetPwd = async (data) => {
  try {
    const response = await axiosApi.post('/api/auth/forgot-password', data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data?.message || 'Password reset failed';
    } else {
      throw error.message;
    }
  }
};

export const postJwtProfile = async (data) => {
  try {
    const response = await axiosApi.put('/api/auth/profile', data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data?.message || 'Profile update failed';
    } else {
      throw error.message;
    }
  }
};

// Generic API helpers
export const get = async (url, config = {}) => {
  try {
    const response = await axiosApi.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const post = async (url, data, config = {}) => {
  try {
    const response = await axiosApi.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const put = async (url, data, config = {}) => {
  try {
    const response = await axiosApi.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const patch = async (url, data, config = {}) => {
  try {
    const response = await axiosApi.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const del = async (url, config = {}) => {
  try {
    const response = await axiosApi.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Calendar API calls
export const getEvents = async () => {
  try {
    const response = await axiosApi.get('/api/events');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addNewEvent = async (event) => {
  try {
    const response = await axiosApi.post('/api/events', event);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (event) => {
  try {
    const response = await axiosApi.put(`/api/events/${event.id}`, event);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (event) => {
  try {
    const response = await axiosApi.delete(`/api/events/${event.id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await axiosApi.get('/api/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Listing Limits API calls
export const getUserListingLimit = async () => {
  try {
    const response = await axiosApi.get('/api/listing-limits/my-count');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// User management
export const getLoggedInUser = () => {
  const authUser = localStorage.getItem("authUser");
  if (authUser) {
    return JSON.parse(authUser);
  }
  return null;
};

export const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

// Fake backend compatibility (for migration)
export const postFakeLogin = postJwtLogin;
export const postFakeRegister = postJwtRegister;
export const postFakeProfile = postJwtProfile;
export const postFakeForgetPwd = postJwtForgetPwd;