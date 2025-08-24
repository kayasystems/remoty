import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Container,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
  Security,
} from '@mui/icons-material';
import { adminApi } from '../../services/admin/adminApi';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('🔧 Attempting admin login...');
      const response = await adminApi.post('/admin/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Admin login successful:', response.data);
      
      // Store token and role with admin-specific keys
      localStorage.setItem('admin_token', response.data.access_token);
      localStorage.setItem('token', response.data.access_token); // Keep for backward compatibility
      localStorage.setItem('role', 'admin');
      
      console.log('🎯 Navigating to admin dashboard...');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('❌ Admin login failed:', error);
      console.error('Error response:', error.response?.data);
      
      let message = 'Login failed. Please try again.';
      
      if (error.response?.status === 404) {
        // Admin doesn't exist
        message = error.response.data?.detail || 'No admin account found with this email address. Contact system administrator.';
      } else if (error.response?.status === 401) {
        // Wrong password
        message = error.response.data?.detail || 'Incorrect password. Please check your password and try again.';
      } else if (error.response?.data?.detail) {
        // Other specific error from backend
        message = error.response.data.detail;
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        // Server connection issues
        message = 'Unable to connect to admin server. Please check your internet connection and try again.';
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(64, 64, 64, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(96, 96, 96, 0.2) 0%, transparent 50%)',
        zIndex: 1,
      }
    }}>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              background: 'linear-gradient(135deg, #404040 0%, #606060 100%)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 56, color: '#FFFFFF' }} />
          </Box>
          <Typography variant="h2" sx={{ 
            fontWeight: 700, 
            color: '#FFFFFF', 
            mb: 2,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            fontFamily: '"Playfair Display", "Georgia", serif'
          }}>
            Admin Portal
          </Typography>
          <Typography variant="h5" sx={{ 
            color: '#B0B0B0', 
            mb: 4,
            fontWeight: 400,
            letterSpacing: '0.5px'
          }}>
            System Administration & Management
          </Typography>
        </Box>

        <Card sx={{
          background: 'rgba(48, 48, 48, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(96, 96, 96, 0.3)',
        }}>
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            {error && (
              <Alert severity="error" sx={{ 
                mb: 3, 
                borderRadius: '12px',
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid rgba(211, 47, 47, 0.3)',
                color: '#FF6B6B',
                '& .MuiAlert-icon': {
                  color: '#FF6B6B'
                }
              }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Admin Email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#808080' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(64, 64, 64, 0.3)',
                    borderRadius: '16px',
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: 'rgba(128, 128, 128, 0.3)',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(128, 128, 128, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#808080',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#B0B0B0',
                    '&.Mui-focused': {
                      color: '#808080',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#808080' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        sx={{ color: '#808080' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(64, 64, 64, 0.3)',
                    borderRadius: '16px',
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: 'rgba(128, 128, 128, 0.3)',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(128, 128, 128, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#808080',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#B0B0B0',
                    '&.Mui-focused': {
                      color: '#808080',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : <Security />}
                sx={{
                  py: 1.8,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #404040 0%, #606060 100%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  height: '56px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #505050 0%, #707070 100%)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(64, 64, 64, 0.5)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {loading ? 'Authenticating...' : 'Access Admin Panel'}
              </Button>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              my: 3,
              position: 'relative'
            }}>
              <Box sx={{ 
                flex: 1, 
                height: '1px', 
                backgroundColor: 'rgba(128, 128, 128, 0.3)' 
              }} />
              <Typography variant="body2" sx={{ 
                color: '#808080', 
                px: 2, 
                py: 0.5,
                fontWeight: 500,
                fontSize: '0.8rem',
                backgroundColor: 'rgba(64, 64, 64, 0.5)',
                borderRadius: '20px',
                border: '1px solid rgba(128, 128, 128, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mx: 2
              }}>
                Secure Access
              </Typography>
              <Box sx={{ 
                flex: 1, 
                height: '1px', 
                backgroundColor: 'rgba(128, 128, 128, 0.3)' 
              }} />
            </Box>

            <Typography variant="body2" sx={{ 
              color: '#808080', 
              textAlign: 'center', 
              mt: 2,
              fontStyle: 'italic',
              fontSize: '0.85rem'
            }}>
              Admin access only • No registration available
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
