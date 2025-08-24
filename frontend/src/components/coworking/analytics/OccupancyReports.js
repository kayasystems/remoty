import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CoworkingTopBar from '../CoworkingTopBar';
import CoworkingSidebar from '../CoworkingSidebar';

export default function OccupancyReports() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/coworking/login';
  };

  return (
    <>
      <CoworkingTopBar />
      <Box sx={{ display: 'flex' }}>
        <CoworkingSidebar onLogout={handleLogout} />
        
        <Box sx={{ 
          flexGrow: 1,
          ml: '320px',
          mt: '64px',
          background: 'linear-gradient(135deg, #F8FAFF 0%, #E3F2FD 100%)', 
          minHeight: 'calc(100vh - 64px)',
          p: 4,
          pt: 5
        }}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h4" sx={{ 
              color: '#0D47A1', 
              fontWeight: 700, 
              mb: 2 
            }}>
              Occupancy Reports
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              This page will display space utilization reports, occupancy rates, and usage patterns for your coworking spaces.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </>
  );
}
