import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminTopBar from '../../components/admin/AdminTopBar';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Check if user is authenticated and has admin role
    if (!token || role !== 'admin') {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 50%, #1A1A1A 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(128, 128, 128, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(96, 96, 96, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
      }
    }}>
      <AdminTopBar />
      <AdminSidebar />
      
      {/* Main content area */}
      <Box sx={{ 
        flexGrow: 1,
        pt: '80px', // Account for fixed AppBar height
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh'
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}
