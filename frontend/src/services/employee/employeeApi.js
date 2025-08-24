import axios from 'axios';

// Employee API instance targeting port 8003
const employeeApi = axios.create({
  baseURL: 'http://localhost:8003',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
employeeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employee_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
employeeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('employee_token');
      window.location.href = '/employee/login';
    }
    return Promise.reject(error);
  }
);

export { employeeApi };
