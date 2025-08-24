import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Business,
  LocationOn,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { coworkingApi } from '../../services/coworking';
import CoworkingTopBar from './CoworkingTopBar';

export default function CoworkingRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = ['Personal Info', 'Business Details'];

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleNext = () => {
    setError('');
    
    // Validate Step 1
    if (currentStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        setError('Please fill in all personal information fields');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate Step 2
    if (!formData.companyName || !formData.address || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all business details');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      // Register the user
      const registerResponse = await coworkingApi.post('/coworking/register', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      console.log('✅ Registration successful:', registerResponse.data);
      
      // Redirect to login page after successful registration
      navigate('/coworking/login', { 
        state: { 
          message: 'Account created successfully! Please log in with your credentials.',
          email: formData.email 
        }
      });
    } catch (error) {
      console.error('❌ Registration/Login error:', error);
      setError(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            Create Account
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#1976D2', 
            mb: 4, 
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Join our coworking community today
          </Typography>

          <Card
            sx={{
              backgroundColor: 'rgba(227, 242, 253, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '2px solid rgba(66, 165, 245, 0.3)',
              boxShadow: '0 20px 40px rgba(25, 118, 210, 0.15)',
              maxWidth: '500px',
              width: '100%',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              {/* Stepper */}
              <Stepper activeStep={currentStep} sx={{ mb: 2 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: '#1976D2',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          '&.Mui-active': {
                            color: '#0D47A1',
                          },
                          '&.Mui-completed': {
                            color: '#42A5F5',
                          },
                        },
                        '& .MuiStepIcon-root': {
                          color: '#42A5F5',
                          fontSize: '1.2rem',
                          '&.Mui-active': {
                            color: '#1976D2',
                          },
                          '&.Mui-completed': {
                            color: '#1976D2',
                          },
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Box sx={{ mb: 1 }}>
                  <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255, 248, 220, 0.8)', color: '#8B6914' }}>
                    {error}
                  </Alert>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                {currentStep === 0 && (
                  <Box>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      sx={{
                        mb: 1.5,
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
                            <Person sx={{ color: '#1976D2' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      margin="normal"
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      sx={{
                        mb: 1.5,
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
                            <Person sx={{ color: '#1976D2' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      margin="normal"
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      sx={{
                        mb: 1.5,
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
                      margin="normal"
                      name="phone"
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      sx={{
                        mb: 1.5,
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
                            <Phone sx={{ color: '#1976D2' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                )}

                {currentStep === 1 && (
                  <Box>
                    <TextField
                      fullWidth
                      name="companyName"
                      label="Company/Space Name"
                      value={formData.companyName}
                      onChange={handleChange}
                      sx={{
                        mb: 1.5,
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
                            <Business sx={{ color: '#1976D2' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      name="address"
                      label="Address"
                      value={formData.address}
                      onChange={handleChange}
                      sx={{
                        mb: 1.5,
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
                            <LocationOn sx={{ color: '#1976D2' }} />
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
                      sx={{
                        mb: 1.5,
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
                            <IconButton onClick={togglePasswordVisibility} edge="end" sx={{ color: '#1976D2' }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      sx={{
                        mb: 1.5,
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
                            <IconButton onClick={toggleConfirmPasswordVisibility} edge="end" sx={{ color: '#1976D2' }}>
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.agreeToTerms}
                          onChange={handleChange}
                          name="agreeToTerms"
                          sx={{
                            color: '#1976D2',
                            '&.Mui-checked': {
                              color: '#0D47A1',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: '#1976D2' }}>
                          I agree to the{' '}
                          <Link href="#" sx={{ color: '#0D47A1', textDecoration: 'underline' }}>
                            Terms and Conditions
                          </Link>
                        </Typography>
                      }
                      sx={{ mt: 1, mb: 2 }}
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                {currentStep === 0 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      py: 1.2,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
                        boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                    endIcon={<ArrowForward />}
                  >
                    Next
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      sx={{
                        borderColor: '#1976D2',
                        borderWidth: '2px',
                        color: '#1976D2',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        borderRadius: '16px',
                        px: 2.5,
                        py: 1,
                        minWidth: '120px',
                        height: '48px',
                        '&:hover': {
                          borderColor: '#0D47A1',
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          color: '#0D47A1',
                        },
                      }}
                      startIcon={<ArrowBack />}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      onClick={handleSubmit}
                      sx={{
                        py: 1,
                        px: 2.5,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        height: '48px',
                        minWidth: '160px',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)',
                          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          background: '#42A5F5',
                          color: '#1976D2',
                          opacity: 0.7,
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: '#FFF8DC' }} /> : 'Create Account'}
                    </Button>
                  </>
                )}
              </Box>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                my: 1.5,
                position: 'relative'
              }}>
                <Box sx={{ 
                  flex: 1, 
                  height: '1px', 
                  backgroundColor: '#42A5F5' 
                }} />
                <Typography variant="body2" sx={{ 
                  color: '#1976D2', 
                  px: 2, 
                  py: 0.5,
                  fontWeight: 600,
                  fontSize: '0.8rem',
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
                to="/coworking/login"
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
                Sign In
              </Button>

              <Typography variant="body2" sx={{ 
                color: '#1976D2', 
                textAlign: 'center', 
                mt: 1.5,
                fontStyle: 'italic',
                fontSize: '0.85rem'
              }}>
                Already have an account?{' '}
                <Button
                  component={Link}
                  to="/coworking/login"
                  variant="text"
                  sx={{
                    color: '#0D47A1',
                    fontWeight: 600,
                    textTransform: 'none',
                    textDecoration: 'underline',
                    p: 0,
                    minWidth: 'auto',
                    fontSize: '0.85rem',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
    </>
  );
}
