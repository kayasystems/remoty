import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import EmployeeTopBar from '../../components/employee/EmployeeTopBar';

export default function EmployeeLayout() {
  return (
    <>
      <EmployeeTopBar />
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
        pt: 8, // Add padding top to account for fixed topbar
      }}>
        <Outlet />
      </Box>
    </>
  );
}
