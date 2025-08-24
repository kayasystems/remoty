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
  Grid,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  Work,
  PersonAdd,
  CheckCircle,
  Security,
  Group,
  TrendingUp,
  LocationOn,
  Public,
  Schedule,
  VpnKey,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { employeeApi } from '../../services/employee/employeeApi';
import EmployeeAuthTopBar from '../../components/employee/EmployeeAuthTopBar';

export default function EmployeeRegister() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info & Authentication
    invite_token: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Location & Profile
    address: '',
    city: '',
    zip_code: '',
    country: '',
    timezone: '',
    profile_picture_url: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  const steps = ['Basic Information', 'Location & Profile'];

  const timezones = [
    { value: 'UTC-12:00', label: 'UTC-12:00 (Baker Island)' },
    { value: 'UTC-11:00', label: 'UTC-11:00 (American Samoa)' },
    { value: 'UTC-10:00', label: 'UTC-10:00 (Hawaii, USA)' },
    { value: 'UTC-09:00', label: 'UTC-09:00 (Alaska, USA)' },
    { value: 'UTC-08:00', label: 'UTC-08:00 (Pacific Time, USA/Canada)' },
    { value: 'UTC-07:00', label: 'UTC-07:00 (Mountain Time, USA/Canada)' },
    { value: 'UTC-06:00', label: 'UTC-06:00 (Central Time, USA/Canada)' },
    { value: 'UTC-05:00', label: 'UTC-05:00 (Eastern Time, USA/Canada)' },
    { value: 'UTC-04:00', label: 'UTC-04:00 (Atlantic Time, Canada)' },
    { value: 'UTC-03:00', label: 'UTC-03:00 (Brazil, Argentina)' },
    { value: 'UTC-02:00', label: 'UTC-02:00 (Mid-Atlantic)' },
    { value: 'UTC-01:00', label: 'UTC-01:00 (Azores, Portugal)' },
    { value: 'UTC+00:00', label: 'UTC+00:00 (London, UK)' },
    { value: 'UTC+01:00', label: 'UTC+01:00 (Paris, Berlin, Rome)' },
    { value: 'UTC+02:00', label: 'UTC+02:00 (Cairo, Athens, Helsinki)' },
    { value: 'UTC+03:00', label: 'UTC+03:00 (Moscow, Istanbul, Riyadh)' },
    { value: 'UTC+04:00', label: 'UTC+04:00 (Dubai, Baku)' },
    { value: 'UTC+05:00', label: 'UTC+05:00 (Pakistan, Uzbekistan)' },
    { value: 'UTC+06:00', label: 'UTC+06:00 (Bangladesh, Kazakhstan)' },
    { value: 'UTC+07:00', label: 'UTC+07:00 (Thailand, Vietnam, Indonesia)' },
    { value: 'UTC+08:00', label: 'UTC+08:00 (China, Singapore, Malaysia)' },
    { value: 'UTC+09:00', label: 'UTC+09:00 (Japan, South Korea)' },
    { value: 'UTC+10:00', label: 'UTC+10:00 (Australia East Coast)' },
    { value: 'UTC+11:00', label: 'UTC+11:00 (Solomon Islands)' },
    { value: 'UTC+12:00', label: 'UTC+12:00 (New Zealand, Fiji)' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleNext = () => {
    // Validate step 1
    if (activeStep === 0) {
      const missingStep1Fields = [];
      if (!formData.invite_token) missingStep1Fields.push('Invitation Token');
      if (!formData.first_name) missingStep1Fields.push('First Name');
      if (!formData.last_name) missingStep1Fields.push('Last Name');
      if (!formData.email) missingStep1Fields.push('Email');
      if (!formData.phone_number) missingStep1Fields.push('Phone Number');
      if (!formData.password) missingStep1Fields.push('Password');
      if (!formData.confirmPassword) missingStep1Fields.push('Confirm Password');
      
      if (missingStep1Fields.length > 0) {
        setError(`Please fill in the following required fields: ${missingStep1Fields.join(', ')}`);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const geocodeAddress = async () => {
    if (!formData.address || !formData.city || !formData.country) {
      setError('Please provide address, city, and country for location calculation');
      return { latitude: 0, longitude: 0 };
    }

    setGeocoding(true);
    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.country}`;
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(fullAddress)}&key=YOUR_API_KEY`);
      
      if (!response.ok) {
        // Fallback: use a simple geocoding service or default coordinates
        console.warn('Geocoding service unavailable, using default coordinates');
        return { latitude: 0, longitude: 0 };
      }
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { latitude: lat, longitude: lng };
      }
      
      return { latitude: 0, longitude: 0 };
    } catch (error) {
      console.warn('Geocoding failed, using default coordinates:', error);
      return { latitude: 0, longitude: 0 };
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 handleSubmit called - Current step:', activeStep);
    console.log('📝 Form data:', formData);
    console.log('🔍 Detailed form data:');
    Object.keys(formData).forEach(key => {
      console.log(`  ${key}: "${formData[key]}" (type: ${typeof formData[key]})`);
    });
    
    // Validate step 2 with detailed error messages
    const missingFields = [];
    if (!formData.address) missingFields.push('Street Address');
    if (!formData.city) missingFields.push('City');
    if (!formData.zip_code) missingFields.push('ZIP Code');
    if (!formData.country) missingFields.push('Country');
    if (!formData.timezone) missingFields.push('Timezone');
    
    console.log('❌ Missing fields:', missingFields);
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      // Get coordinates from geocoding
      const { latitude, longitude } = await geocodeAddress();
      
      const registrationData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        address: formData.address,
        city: formData.city,
        zip_code: formData.zip_code,
        country: formData.country,
        latitude: latitude,
        longitude: longitude,
        timezone: formData.timezone,
        profile_picture_url: formData.profile_picture_url || 'https://via.placeholder.com/150',
        invite_token: formData.invite_token,
      };

      console.log('📤 Sending registration data to backend:', registrationData);
      const response = await employeeApi.post('/employee/register', registrationData);
      console.log('✅ Registration successful:', response.data);
      
      // Auto-login after registration
      const loginResponse = await employeeApi.post('/employee/login', {
        email: formData.email,
        password: formData.password,
      });
      
      const token = loginResponse.data.access_token;
      localStorage.setItem('employeeToken', token);
      localStorage.setItem('userRole', 'employee');
      
      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 100);
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('📋 Error response:', error.response?.data);
      console.error('📊 Error status:', error.response?.status);
      
      let message = 'Registration failed. Please try again.';
      
      if (error.response?.data?.detail) {
        // Handle validation errors that might be arrays of objects
        if (Array.isArray(error.response.data.detail)) {
          message = error.response.data.detail.map(err => 
            typeof err === 'object' ? err.msg || JSON.stringify(err) : err
          ).join(', ');
        } else if (typeof error.response.data.detail === 'object') {
          message = error.response.data.detail.msg || JSON.stringify(error.response.data.detail);
        } else {
          message = error.response.data.detail;
        }
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
              Join Our Team,
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
              Create your account to access powerful productivity tools, manage your tasks, and book coworking spaces.
            </Typography>

            {/* Features List */}
            <Box sx={{ mb: 4, textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security sx={{ fontSize: 28, color: '#81C784', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                    Secure Account
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                    Your data is protected with enterprise-grade security
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircle sx={{ fontSize: 28, color: '#81C784', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                    Task Management
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                    Organize and track your work with powerful task tools
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Group sx={{ fontSize: 28, color: '#81C784', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                    Team Collaboration
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                    Connect and collaborate with your team members
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 28, color: '#81C784', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                    Productivity Analytics
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                    Track your progress and optimize your workflow
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
              "Join thousands of professionals who trust our platform for their daily productivity."
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Registration Form */}
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
              maxWidth: 460,
              background: 'rgba(46, 125, 50, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    mb: 3,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Create Employee Account
                </Typography>

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel 
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.875rem',
                          },
                          '& .MuiStepLabel-label.Mui-active': {
                            color: 'white',
                            fontWeight: 600,
                          },
                          '& .MuiStepLabel-label.Mui-completed': {
                            color: '#81C784',
                          },
                          '& .MuiStepIcon-root': {
                            color: 'rgba(255, 255, 255, 0.3)',
                          },
                          '& .MuiStepIcon-root.Mui-active': {
                            color: '#1B5E20',
                            backgroundColor: '#1B5E20',
                            borderRadius: '50%',
                            '& .MuiStepIcon-text': {
                              fill: 'white',
                              fontWeight: 600,
                            },
                          },
                          '& .MuiStepIcon-root.Mui-completed': {
                            color: '#81C784',
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
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

              <Box component="form" noValidate onSubmit={activeStep === steps.length - 1 ? handleSubmit : (e) => { 
                e.preventDefault(); 
                console.log('🔄 handleNext called instead of handleSubmit - Current step:', activeStep);
                handleNext(); 
              }}>
                {/* Step 1: Basic Information & Authentication */}
                {activeStep === 0 && (
                  <>
                    <TextField
                      fullWidth
                      name="invite_token"
                      label="Invitation Token"
                      value={formData.invite_token}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VpnKey sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      name="first_name"
                      label="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      name="last_name"
                      label="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      name="email"
                      type="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
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
                      name="phone_number"
                      label="Phone Number"
                      value={formData.phone_number}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      value={formData.password}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
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

                    <TextField
                      fullWidth
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
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
                              onClick={toggleConfirmPasswordVisibility}
                              edge="end"
                              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}

                {/* Step 2: Location & Profile */}
                {activeStep === 1 && (
                  <>
                    <TextField
                      fullWidth
                      name="address"
                      label="Street Address"
                      value={formData.address}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          name="city"
                          label="City"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          sx={{
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
                              fontSize: '14px',
                              '&.Mui-focused': {
                                color: 'white',
                                backgroundColor: 'rgba(46, 125, 50, 0.9)',
                              },
                              '&.MuiFormLabel-filled': {
                                color: 'white',
                                backgroundColor: 'rgba(46, 125, 50, 0.9)',
                              },
                              '&.MuiInputLabel-shrink': {
                                backgroundColor: 'rgba(46, 125, 50, 0.9)',
                              },
                            },
                            '& .MuiOutlinedInput-input': {
                              color: 'white',
                              fontSize: '14px',
                              padding: '14px 12px',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          name="zip_code"
                          label="ZIP Code"
                          value={formData.zip_code}
                          onChange={handleChange}
                          required
                          sx={{
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
                              fontSize: '14px',
                              '&.Mui-focused': {
                                color: 'white',
                                backgroundColor: 'rgba(46, 125, 50, 0.9)',
                              },
                              '&.MuiFormLabel-filled': {
                                color: 'white',
                                backgroundColor: 'rgba(46, 125, 50, 0.9)',
                              },
                              '&.MuiInputLabel-shrink': {
                                backgroundColor: 'rgba(46, 125, 50, 0.9)',
                              },
                            },
                            '& .MuiOutlinedInput-input': {
                              color: 'white',
                              fontSize: '14px',
                              padding: '14px 12px',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      name="country"
                      label="Country"
                      value={formData.country}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Public sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <FormControl 
                      fullWidth 
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiSelect-select': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
                        },
                        '& .MuiSelect-icon': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      }}
                    >
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        startAdornment={
                          <InputAdornment position="start">
                            <Schedule sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />
                          </InputAdornment>
                        }
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: 'rgba(46, 125, 50, 0.95)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              '& .MuiMenuItem-root': {
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                              },
                            },
                          },
                        }}
                      >
                        {timezones.map((tz) => (
                          <MenuItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      name="profile_picture_url"
                      label="Profile Picture URL (Optional)"
                      value={formData.profile_picture_url}
                      onChange={handleChange}
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
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiFormLabel-filled': {
                            color: 'white',
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                          '&.MuiInputLabel-shrink': {
                            backgroundColor: 'rgba(46, 125, 50, 0.9)',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                          fontSize: '16px',
                          padding: '16px 14px',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  {activeStep === 0 ? (
                    <Box /> // Empty box for spacing
                  ) : (
                    <Button
                      onClick={handleBack}
                      startIcon={<ArrowBack />}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                        },
                      }}
                    >
                      Back
                    </Button>
                  )}

                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || geocoding}
                      onClick={(e) => {
                        console.log('🎯 Create Account button clicked!');
                        console.log('📊 Current form data:', formData);
                        console.log('📋 Active step:', activeStep);
                        // Don't prevent default - let form submission happen
                      }}
                      sx={{
                        py: 1.5,
                        px: 4,
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
                      {loading || geocoding ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      endIcon={<ArrowForward />}
                      variant="contained"
                      sx={{
                        py: 1.5,
                        px: 4,
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.25)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                        },
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      Next
                    </Button>
                  )}
                </Box>

                {activeStep === 0 && (
                  <>
                    <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                    <Stack direction="row" justifyContent="center" spacing={1}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Already have an account?
                      </Typography>
                      <Typography
                        component={Link}
                        to="/employee/login"
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
                        Sign in here
                      </Typography>
                    </Stack>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}
