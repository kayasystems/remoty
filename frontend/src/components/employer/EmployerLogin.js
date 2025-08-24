// src/components/employer/EmployerLogin.js
import React, { useState, useEffect } from 'react';
import { employerApi, employerAuthService } from '../../services/employer';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
} from '@mui/icons-material';

export default function EmployerLogin() {
  useEffect(() => {
    document.title = 'Login - Remoty';
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (loading) return; // Prevent multiple submissions
    
    console.log('🏢 EMPLOYER LOGIN: Form submission started');
    console.log('🏢 EMPLOYER LOGIN: Email:', email);
    
    setLoading(true);
    setError('');

    try {
      console.log('🏢 EMPLOYER LOGIN: Making API call to /employer/login');
      const response = await employerAuthService.login({
        email: email.trim(),
        password: password
      });

      console.log('🏢 EMPLOYER LOGIN: API response received:', response);
      const token = response.access_token;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', 'employer');
      console.log('🏢 EMPLOYER LOGIN: Token stored:', token?.substring(0, 20) + '...');
      
      // Small delay to ensure token is stored before navigation
      setTimeout(() => {
        console.log('🏢 EMPLOYER LOGIN: Navigating to dashboard');
        navigate('/employer/dashboard');
      }, 100);
    } catch (error) {
      console.error('🏢 EMPLOYER LOGIN: Login error:', error);
      console.error('🏢 EMPLOYER LOGIN: Error response:', error.response?.data);
      
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
      console.log('🏢 EMPLOYER LOGIN: Form submission completed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #8B2635 0%, #A0353F 25%, #B8434E 50%, #C85A5A 75%, #D67373 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.15)',
          zIndex: 1,
        },
      }}
    >
      {/* Left Side - Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          zIndex: 2,
          px: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
          <Business sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              background: 'linear-gradient(45deg, #ffffff 30%, #f8f9fa 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Remoty
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 600,
              fontSize: '1.3rem',
              mb: 1,
            }}
          >
            Employer Portal
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 300,
              opacity: 0.95,
              lineHeight: 1.4,
              color: '#f8f9fa',
              mb: 4,
            }}
          >
            Professional Remote Workforce Management
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              fontSize: '1.1rem',
              mb: 4,
            }}
          >
            Welcome back! Please sign in to your accounte team operations with our comprehensive platform.
            From employee onboarding to performance tracking, manage everything seamlessly.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 4,
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1,
              },
            }}
          >
            <CardContent sx={{ p: 5, position: 'relative', zIndex: 2, color: 'white' }}>
              {/* Mobile Branding */}
              <Box
                sx={{
                  display: { xs: 'block', md: 'none' },
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                <Business sx={{ fontSize: 48, color: '#667eea', mb: 1 }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#667eea',
                    mb: 1,
                  }}
                >
                  Remoty
                </Typography>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  textAlign: 'center',
                  mb: 1,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                Sign in to your employer account
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '500',
                      backgroundColor: 'rgba(139, 38, 53, 0.9)',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      '&.Mui-focused': {
                        color: 'white',
                        fontSize: '16px',
                        backgroundColor: 'rgba(139, 38, 53, 0.95)',
                      },
                      '&.MuiFormLabel-filled': {
                        color: 'white',
                        fontSize: '16px',
                        backgroundColor: 'rgba(139, 38, 53, 0.9)',
                      },
                      '&.MuiInputLabel-shrink': {
                        fontSize: '16px',
                        backgroundColor: 'rgba(139, 38, 53, 0.9)',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                      fontSize: '16px',
                      padding: '16px 14px',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        opacity: 1,
                        fontSize: '16px',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ 
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '500',
                      backgroundColor: 'rgba(139, 38, 53, 0.9)',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      '&.Mui-focused': {
                        color: 'white',
                        fontSize: '16px',
                        backgroundColor: 'rgba(139, 38, 53, 0.95)',
                      },
                      '&.MuiFormLabel-filled': {
                        color: 'white',
                        fontSize: '16px',
                        backgroundColor: 'rgba(139, 38, 53, 0.9)',
                      },
                      '&.MuiInputLabel-shrink': {
                        fontSize: '16px',
                        backgroundColor: 'rgba(139, 38, 53, 0.9)',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                      fontSize: '16px',
                      padding: '16px 14px',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        opacity: 1,
                        fontSize: '16px',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
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
                  sx={{
                    py: 1.5,
                    mb: 3,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.25)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                <Stack direction="row" justifyContent="center" spacing={1}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Don't have an account?
                  </Typography>
                  <Typography
                    component={Link}
                    to="/employer/register"
                    variant="body2"
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: 600,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      '&:hover': {
                        textDecoration: 'underline',
                        textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                      },
                    }}
                  >
                    Sign up here
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
