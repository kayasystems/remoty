// Employer-specific API service
import axios from 'axios';

const employerApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
employerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 EmployerApi: Request to', config.url);
    console.log('🔑 EmployerApi: Token found:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 EmployerApi: Authorization header set');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
employerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/employer/login';
    }
    return Promise.reject(error);
  }
);

export default employerApi;
