// src/pages/coworking/CoworkingLayout.js
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import CoworkingTopBar from '../../components/coworking/CoworkingTopBar';
import CoworkingSidebar from '../../components/coworking/CoworkingSidebar';

export default function CoworkingLayout() {
  return (
    <>
      <CoworkingTopBar />
      <Box 
        sx={{ 
          display: 'flex', 
          minHeight: 'calc(100vh - 64px)',
          mt: '64px', // Account for top bar height
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '320px', // Coworking sidebar width
            bottom: 0,
            background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
            zIndex: 0,
          },
        }}
      >
        <CoworkingSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            minHeight: 'calc(100vh - 64px)',
            background: 'linear-gradient(135deg, #F8FAFF 0%, #E3F2FD 100%)',
            position: 'relative',
            zIndex: 2,
            ml: 0 // Remove left margin for edge-to-edge layout
          }}
        >
          <Box
            sx={{
              py: 3,
              px: 3, // Add proper horizontal padding like other pages
              width: '100%',
              minWidth: '100%'
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </>
  );
}
