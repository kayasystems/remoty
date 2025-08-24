// Employer-specific business logic services
import employerApi from './employerApi';

export const employerAuthService = {
  login: async (credentials) => {
    const response = await employerApi.post('/employer/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await employerApi.post('/employer/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await employerApi.get('/employer/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await employerApi.put('/employer/profile', profileData);
    return response.data;
  }
};

export const employerBookingService = {
  getBookings: async () => {
    const response = await employerApi.get('/employer/bookings');
    return response.data;
  },
  
  createBooking: async (bookingData) => {
    const response = await employerApi.post('/employer/bookings', bookingData);
    return response.data;
  },
  
  processPayment: async (paymentData) => {
    const response = await employerApi.post('/employer/process-booking-payment', paymentData);
    return response.data;
  }
};

export const employerEmployeeService = {
  getEmployees: async () => {
    const response = await employerApi.get('/employer/employees');
    return response.data;
  },
  
  getEmployeeDetail: async (employeeId) => {
    const response = await employerApi.get(`/employer/employees/${employeeId}`);
    return response.data;
  },
  
  getAttendanceStats: async (days = 30) => {
    const response = await employerApi.get(`/employer/employees/attendance-stats?days=${days}`);
    return response.data;
  }
};

export const employerTaskService = {
  getTasks: async () => {
    const response = await employerApi.get('/employer/tasks');
    return response.data;
  },
  
  createTask: async (taskData) => {
    const response = await employerApi.post('/employer/tasks', taskData);
    return response.data;
  },
  
  updateTask: async (taskId, taskData) => {
    const response = await employerApi.put(`/employer/tasks/${taskId}`, taskData);
    return response.data;
  }
};
