// src/pages/employer/EmployerLayout.js
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import EmployerSidebar from '../../components/employer/EmployerSidebar';

export default function EmployerLayout() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '258px', // Only cover sidebar width
          bottom: 0,
          background: 'linear-gradient(135deg, #8B2635 0%, #6d1f2c 100%)',
          zIndex: 0,
        },
      }}
    >
      <EmployerSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: 'calc(100% - 258px)' },
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
