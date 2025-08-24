// Coworking-specific business logic services
import coworkingApi from './coworkingApi';

export const coworkingAuthService = {
  login: async (credentials) => {
    const response = await coworkingApi.post('/coworking/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await coworkingApi.post('/coworking/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await coworkingApi.get('/coworking/me');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await coworkingApi.put('/coworking/profile', profileData);
    return response.data;
  }
};

export const coworkingSpaceService = {
  getMySpaces: async () => {
    const response = await coworkingApi.get('/coworking/spaces/my');
    return response.data;
  },
  
  createSpace: async (spaceData) => {
    const response = await coworkingApi.post('/coworking/spaces', spaceData);
    return response.data;
  },
  
  updateSpace: async (spaceId, spaceData) => {
    const response = await coworkingApi.put(`/coworking/spaces/${spaceId}`, spaceData);
    return response.data;
  },
  
  uploadImages: async (spaceId, formData) => {
    const response = await coworkingApi.post(`/coworking/spaces/${spaceId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export const coworkingBookingService = {
  getBookings: async () => {
    const response = await coworkingApi.get('/coworking/bookings');
    return response.data;
  },
  
  getBookingDetail: async (bookingId) => {
    const response = await coworkingApi.get(`/coworking/bookings/${bookingId}`);
    return response.data;
  }
};

export const coworkingAnalyticsService = {
  getStats: async () => {
    const response = await coworkingApi.get('/coworking/stats');
    return response.data;
  },
  
  getRevenueAnalytics: async (days = 30) => {
    const response = await coworkingApi.get(`/coworking/revenue-analytics?days=${days}`);
    return response.data;
  }
};
