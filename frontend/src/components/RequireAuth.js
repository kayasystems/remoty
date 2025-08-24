// src/components/RequireAuth.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
// Import both module APIs for route-based selection
import { employerApi } from '../services/employer';
import { coworkingApi } from '../services/coworking';

export default function RequireAuth({ children }) {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setIsValidating(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        console.log('🔐 RequireAuth: Validating token:', token?.substring(0, 20) + '...');
        // Validate token by making a request to get profile
        // Determine which API to use based on current route
        const currentPath = window.location.pathname;
        console.log('🔐 RequireAuth: Current path:', currentPath);
        
        if (currentPath.includes('/employer')) {
          console.log('🔐 RequireAuth: Using employerApi for validation');
          await employerApi.get('/employer/me');
        } else if (currentPath.includes('/coworking')) {
          console.log('🔐 RequireAuth: Using coworkingApi for validation');
          await coworkingApi.get('/coworking/me');
        } else {
          console.log('🔐 RequireAuth: Using employerApi as default');
          await employerApi.get('/employer/me');
        }
        console.log('🔐 RequireAuth: Token validation successful');
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Session validation failed:', error);
        // Token is invalid/expired - remove it
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [token]);

  // Show loading spinner while validating session
  if (isValidating) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <CircularProgress sx={{ color: '#8B2635' }} />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/employer/login" replace />;
  }

  return children;
}
