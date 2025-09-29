import axios from "axios"

//apply base url for axios
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000"

const axiosApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

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

axiosApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
)

export async function get(url, config = {}) {
  return await axiosApi.get(url, { ...config }).then(response => response.data)
}

export async function post(url, data, config = {}) {
  return axiosApi
    .post(url, data instanceof FormData ? data : { ...data }, { ...config })
    .then(response => response.data)
}

export async function put(url, data, config = {}) {
  return axiosApi
    .put(url, data instanceof FormData ? data : { ...data }, { ...config })
    .then(response => response.data)
}

export async function del(url, config = {}) {
  return await axiosApi
    .delete(url, { ...config })
    .then(response => response.data)
}
