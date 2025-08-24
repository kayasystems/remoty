import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import employerApi from '../../services/employer/employerApi';
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
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
  Person,
  Language,
  Phone,
  LocationOn,
  Public,
  Schedule,
} from '@mui/icons-material';

const timezones = [
  'UTC−12:00',
  'UTC−08:00 (Pacific Time US & Canada)',
  'UTC−05:00 (Eastern Time US & Canada)',
  'UTC+00:00 (London)',
  'UTC+01:00 (Berlin, Paris)',
  'UTC+03:00 (Moscow)',
  'UTC+04:00 (UAE)',
  'UTC+05:00 (Pakistan)',
  'UTC+05:30 (India)',
  'UTC+07:00 (Thailand)',
  'UTC+08:00 (China, Singapore)',
  'UTC+09:00 (Japan)',
  'UTC+10:00 (Sydney)',
];

const steps = ['Basic Info', 'Company Details', 'Location & Contact'];

export default function EmployerRegister() {
  useEffect(() => {
    document.title = 'Register - Remoty';
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    timezone: '',
    website: '',
    industry: '',
    size: '',
    contact_number: '',
    address: '',
    city: '',
    state: '',
    country: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await employerApi.post('/employer/register', form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/employer/login'), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg).join(', '));
      } else {
        setError(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3} sx={{ width: '100%' }}>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Company Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
                      <Business sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3} sx={{ width: '100%' }}>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Company Website"
                name="website"
                value={form.website}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
                      <Language sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Industry"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
                      <Business sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Company Size"
                name="size"
                value={form.size}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                placeholder="e.g., 10-50 employees"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
                      <Person sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Timezone"
                name="timezone"
                select
                value={form.timezone}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                    fontSize: '16px',
                    padding: '16px 14px',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Schedule sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
              >
                {timezones.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3} sx={{ width: '100%' }}>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
                      <Phone sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Company Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
                      <LocationOn sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
              />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
              />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                    borderRadius: '12px',
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    '&.Mui-focused': {
                      color: 'white',
                      fontSize: '16px',
                      backgroundColor: 'rgba(139, 38, 53, 0.95)',
                    },
                    '&.MuiFormLabel-filled': {
                      color: 'white',
                      fontSize: '16px',

                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '16px',

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
                      <Public sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8B2635 0%, #D67373 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      {/* Left Side - Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          zIndex: 2,
          px: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
          <Business sx={{ fontSize: 80, mb: 3, opacity: 0.9, color: 'white' }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              color: 'white',
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
              mb: 4,
              opacity: 0.9,
              lineHeight: 1.4,
              color: 'white',
            }}
          >
            Join Our Platform
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.8,
              lineHeight: 1.6,
              fontSize: '1.1rem',
              color: 'white',
            }}
          >
            Start your journey with Remoty today. Connect with talented remote workers
            and discover amazing coworking spaces worldwide.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Registration Form */}
      <Box
        sx={{
          flex: { xs: 1, lg: 0.7 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          px: 2,
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 45px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent sx={{ p: 5 }}>
              {/* Mobile Branding */}
              <Box
                sx={{
                  display: { xs: 'block', lg: 'none' },
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                <Business sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Remoty
                </Typography>
              </Box>

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                Create Your Account
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'center',
                  mb: 4,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              >
                Join Remoty and start managing your remote workforce
              </Typography>

              {/* Stepper */}
              <Stepper 
                activeStep={activeStep} 
                sx={{ 
                  mb: 4,
                  '& .MuiStepLabel-label': {
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    color: 'white',
                    fontWeight: '600',
                  },
                  '& .MuiStepLabel-label.Mui-completed': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                  '& .MuiStepIcon-root': {
                    color: 'rgba(255, 255, 255, 0.3)',
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: 'white',
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
                  <Button
                    color="inherit"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ 
                      mr: 1,
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        px: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.5)',
                        },
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{
                        py: 1.5,
                        px: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-2px)',
                        },
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

              <Stack direction="row" justifyContent="center" spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Already have an account?
                </Typography>
                <Typography
                  component={Link}
                  to="/employer/login"
                  variant="body2"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Sign in here
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
