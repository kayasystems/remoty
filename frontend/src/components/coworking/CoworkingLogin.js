import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  Divider,
  Chip,
  Container,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  Nature,
  Coffee,
  Wifi,
  Groups,
} from '@mui/icons-material';
import { coworkingApi } from '../../services/coworking';
import CoworkingTopBar from './CoworkingTopBar';

export default function CoworkingLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle registration success message and pre-fill email
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLoginClick = async () => {
    console.log('🔵 COWORKING LOGIN: Direct button click triggered');
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Create a synthetic event to pass to handleSubmit
    const syntheticEvent = {
      preventDefault: () => {}
    };
    await handleSubmit(syntheticEvent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Starting coworking login process...', formData);

    try {
      // Make API call to coworking login endpoint
      const response = await coworkingApi.post('/coworking/login', {
        email: formData.email,
        password: formData.password
      });
      console.log('✅ Login successful:', response.data);
      
      // Store token and role with coworking-specific keys
      localStorage.setItem('coworking_token', response.data.access_token);
      localStorage.setItem('token', response.data.access_token); // Keep for backward compatibility
      localStorage.setItem('role', 'coworking');
      
      console.log('🎯 Navigating to coworking dashboard...');
      navigate('/coworking/dashboard');
    } catch (error) {
      console.error('❌ Login failed:', error);
      console.error('Error response:', error.response?.data);
      
      let message = 'Login failed. Please try again.';
      
      if (error.response?.status === 404) {
        // User doesn't exist
        message = error.response.data?.detail || 'No account found with this email address. Please check your email or register for a new account.';
      } else if (error.response?.status === 401) {
        // Wrong password
        message = error.response.data?.detail || 'Incorrect password. Please check your password and try again.';
      } else if (error.response?.data?.detail) {
        // Other specific error from backend
        message = error.response.data.detail;
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        // Server connection issues
        message = 'Unable to connect to server. Please check your internet connection and try again.';
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
    <>
      <CoworkingTopBar />
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          background: 'linear-gradient(135deg, #F8FAFF 0%, #E3F2FD 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(25, 118, 210, 0.03) 0%, transparent 50%)',
            zIndex: 1,
          }
        }}
      >
      {/* INFORMATION SECTION - Left Side */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          zIndex: 3,
          position: 'relative',
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 500, position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
              boxShadow: '0 20px 40px rgba(25, 118, 210, 0.3)',
            }}
          >
            <Business sx={{ fontSize: 56, color: '#FFFFFF' }} />
          </Box>
          <Typography variant="h2" sx={{ 
            fontWeight: 700, 
            color: '#0D47A1', 
            mb: 2,
            textShadow: '2px 2px 4px rgba(25, 118, 210, 0.1)',
            fontFamily: '"Playfair Display", "Georgia", serif'
          }}>
            CoWorkSpace
          </Typography>
          <Typography variant="h5" sx={{ 
            color: '#1976D2', 
            mb: 4,
            fontWeight: 400,
            fontStyle: 'italic'
          }}>
            Your Professional Workspace Solution
          </Typography>
        </Box>
      </Box>

      {/* FORM SECTION - Right Side */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          zIndex: 2,
          position: 'relative',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography variant="h4" sx={{ 
            color: '#0D47A1', 
            fontWeight: 700, 
            mb: 2, 
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(25, 118, 210, 0.1)',
            fontFamily: '"Playfair Display", "Georgia", serif'
          }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#1976D2', 
            mb: 4, 
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Sign in to access your coworking dashboard
          </Typography>
          
          <Card sx={{ 
            borderRadius: '24px', 
            boxShadow: '0 20px 40px rgba(25, 118, 210, 0.15)', 
            background: '#E3F2FD',
            border: '1px solid rgba(66, 165, 245, 0.3)',
          }}>
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
              {error && (
                <Alert severity="error" sx={{ 
                  mb: 3, 
                  borderRadius: '12px',
                  backgroundColor: '#FFF0F0',
                  border: '1px solid #CD853F',
                  color: '#B8860B'
                }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(227, 242, 253, 0.8)',
                      '& fieldset': {
                        borderColor: '#42A5F5',
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1976D2',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.15)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#1976D2',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#0D47A1',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#0D47A1',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#1976D2' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ 
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(227, 242, 253, 0.8)',
                      '& fieldset': {
                        borderColor: '#42A5F5',
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1976D2',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.15)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#1976D2',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#0D47A1',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#0D47A1',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#1976D2' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#1976D2' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  onClick={handleSubmit}
                  sx={{
                    py: 1.8,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    boxShadow: '0 15px 35px rgba(25, 118, 210, 0.4)',
                    mb: 3,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)',
                      boxShadow: '0 20px 45px rgba(25, 118, 210, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: '#42A5F5',
                      color: '#1976D2',
                      opacity: 0.7,
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Sign In'}
                </Button>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  my: 3,
                  position: 'relative'
                }}>
                  <Box sx={{ 
                    flex: 1, 
                    height: '1px', 
                    backgroundColor: '#42A5F5' 
                  }} />
                  <Typography variant="body2" sx={{ 
                    color: '#1976D2', 
                    px: 3, 
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    backgroundColor: '#E3F2FD',
                    borderRadius: '20px',
                    border: '1px solid #42A5F5',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mx: 2
                  }}>or</Typography>
                  <Box sx={{ 
                    flex: 1, 
                    height: '1px', 
                    backgroundColor: '#42A5F5' 
                  }} />
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/coworking/register"
                  sx={{ 
                    py: 1.4, 
                    borderRadius: '16px',
                    borderColor: '#1976D2', 
                    borderWidth: '2px',
                    color: '#1976D2',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    backgroundColor: 'rgba(227, 242, 253, 0.3)',
                    '&:hover': {
                      borderColor: '#0D47A1',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: '#0D47A1',
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.2)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Create Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
    </>
  );
}
