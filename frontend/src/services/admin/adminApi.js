import axios from 'axios';

// Create admin-specific axios instance for port 8002
const adminApi = axios.create({
  baseURL: 'http://localhost:8002',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔧 Admin API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🔧 Admin API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
adminApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Admin API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Admin API Error:', error.response?.status, error.response?.data);
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔄 Admin session expired, redirecting to admin login');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export { adminApi };
