import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from '@mui/material';
import {
  Work,
  Login,
  PersonAdd,
} from '@mui/icons-material';

export default function EmployeeAuthTopBar() {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: '#2E7D32',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Work sx={{ fontSize: 32, color: '#FFFFFF' }} />
          <Typography variant="h6" sx={{ 
            color: '#FFFFFF', 
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            Remoty Employee
          </Typography>
        </Box>

        {/* Right side - Auth buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<Login />}
            onClick={() => navigate('/employee/login')}
            sx={{
              color: '#FFFFFF',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
            variant="outlined"
          >
            Sign In
          </Button>
          
          <Button
            startIcon={<PersonAdd />}
            onClick={() => navigate('/employee/register')}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
            variant="contained"
          >
            Join Now
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
