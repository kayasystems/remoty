import React, { useState } from 'react';
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
  Work,
  CheckCircle,
  Schedule,
  Business,
  TrendingUp,
} from '@mui/icons-material';
import { employeeApi } from '../../services/employee/employeeApi';
import EmployeeAuthTopBar from '../../components/employee/EmployeeAuthTopBar';

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await employeeApi.post('/login', {
        email: email.trim(),
        password: password
      });

      const token = response.data.access_token;
      localStorage.setItem('employeeToken', token);
      localStorage.setItem('userRole', 'employee');
      
      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 100);
    } catch (error) {
      let message = 'Login failed. Please try again.';
      
      if (error.response?.status === 404) {
        message = error.response.data?.detail || 'No account found with this email address. Please check your email or register for a new account.';
      } else if (error.response?.status === 401) {
        message = error.response.data?.detail || 'Incorrect password. Please check your password and try again.';
      } else if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
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
      <EmployeeAuthTopBar />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
          position: 'relative',
          pt: 8,
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
          <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                color: 'white',
              }}
            >
              Welcome Back,
              <Box component="span" sx={{ color: '#81C784', display: 'block' }}>
                Employee!
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                lineHeight: 1.6,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                color: 'white',
              }}
            >
              Access your personalized dashboard to manage tasks, track your coworking space bookings, and boost productivity.
            </Typography>

            {/* Features List */}
            <Box sx={{ mb: 4, textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircle sx={{ fontSize: 28, color: '#81C784', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                    Manage Tasks
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                    Create, organize, and track your daily work tasks and projects
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Schedule sx={{ fontSize: 28, color: '#81C784', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                    View Bookings
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                    Track your coworking space reservations and booking history
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp sx={{ fontSize: 28, color: '#81C784', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                    Track Productivity
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                    Monitor your task completion and workspace usage analytics
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Business sx={{ fontSize: 28, color: '#81C784', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                    Book Workspaces
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                    Reserve desks and meeting rooms at available coworking spaces
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography
              variant="body1"
              sx={{
                opacity: 0.7,
                fontStyle: 'italic',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                color: 'white',
              }}
            >
              "Boost your productivity and stay organized with our comprehensive employee dashboard."
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Login Form */}
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            zIndex: 2,
            py: 4,
          }}
        >
          <Card
            sx={{
              width: '100%',
              maxWidth: 400,
              background: 'rgba(46, 125, 50, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    mb: 2,
                  }}
                >
                  <Work sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Employee Portal
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Access your workspace dashboard
                </Typography>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: '12px',
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    color: 'white',
                    '& .MuiAlert-icon': {
                      color: 'white',
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                      },
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '16px',
                      '&.Mui-focused': {
                        color: 'white',
                        fontSize: '16px',
                        backgroundColor: 'rgba(46, 125, 50, 0.9)',
                      },
                      '&.MuiFormLabel-filled': {
                        color: 'white',
                        fontSize: '16px',
                        backgroundColor: 'rgba(46, 125, 50, 0.9)',
                      },
                      '&.MuiInputLabel-shrink': {
                        fontSize: '16px',
                        backgroundColor: 'rgba(46, 125, 50, 0.9)',
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                      },
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '16px',
                      '&.Mui-focused': {
                        color: 'white',
                        fontSize: '16px',
                        backgroundColor: 'rgba(46, 125, 50, 0.9)',
                      },
                      '&.MuiFormLabel-filled': {
                        color: 'white',
                        fontSize: '16px',
                        backgroundColor: 'rgba(46, 125, 50, 0.9)',
                      },
                      '&.MuiInputLabel-shrink': {
                        fontSize: '16px',
                        backgroundColor: 'rgba(46, 125, 50, 0.9)',
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
                    to="/employee/register"
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
    </>
  );
}
