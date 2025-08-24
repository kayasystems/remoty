// src/components/employer/ProfilePage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { employerApi } from '../../services/employer';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await employerApi.get('/employer/me');
      setProfile(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Include required fields that shouldn't be edited by user
      const updateData = {
        ...formData,
        timezone: profile.timezone || 'UTC'
      };

      console.log('Sending profile update data:', updateData);
      const response = await employerApi.put('/employer/profile', updateData);
      setProfile(response.data);
      setFormData(response.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Handle different error response formats
      let errorMessage = 'Failed to update profile';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        console.log('Full error data:', errorData);
        
        // Handle FastAPI validation errors (array of error objects)
        if (Array.isArray(errorData.detail)) {
          console.log('Validation errors:', errorData.detail);
          errorMessage = errorData.detail
            .map(error => `${error.loc?.join('.') || 'field'}: ${error.msg || error.message || 'Validation error'}`)
            .join(', ');
        }
        // Handle simple string detail
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // Handle object with message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Handle direct error object
        else if (errorData.msg) {
          errorMessage = errorData.msg;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#8B2635' }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load profile
        </Alert>
        <Button variant="outlined" onClick={fetchProfile} sx={{ color: '#8B2635', borderColor: '#8B2635' }}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header with Profile Avatar */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 38, 53, 0.1)',
          borderRadius: '16px'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mr: 3, 
              bgcolor: '#8B2635',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {profile.first_name?.[0]?.toUpperCase() || profile.company_name?.[0]?.toUpperCase() || 'P'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B2635', mb: 1 }}>
              {profile.first_name && profile.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : profile.company_name || 'Profile Settings'
              }
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
              {profile.company_name && profile.first_name ? profile.company_name : 'Manage your account information and preferences'}
            </Typography>
            <Chip 
              icon={<EmailIcon />} 
              label={profile.email} 
              variant="outlined" 
              sx={{ 
                color: '#8B2635', 
                borderColor: '#8B2635',
                '& .MuiChip-icon': { color: '#8B2635' }
              }} 
            />
          </Box>
          {!isEditing && (
            <IconButton 
              onClick={() => setIsEditing(true)}
              sx={{ 
                bgcolor: '#8B2635', 
                color: 'white',
                '&:hover': { bgcolor: '#7A1E2B' }
              }}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* Messages */}
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

      <Grid container spacing={4}>
        {/* Personal Information */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              borderRadius: '16px',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              boxShadow: '0 4px 20px rgba(139, 38, 53, 0.1)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ color: '#8B2635', mr: 2, fontSize: '1.5rem' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#8B2635' }}>
                  Personal Information
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                {/* Row 1: First Name, Last Name, Email */}
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      First Name
                    </Typography>
                    <TextField
                      fullWidth
                      name="first_name"
                      value={formData.first_name || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter first name"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Last Name
                    </Typography>
                    <TextField
                      fullWidth
                      name="last_name"
                      value={formData.last_name || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter last name"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Email
                    </Typography>
                    <TextField
                      fullWidth
                      value={profile.email}
                      disabled
                      variant="outlined"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ color: '#8B2635', mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Row 2: Company Name, Phone, City */}
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Company Name
                    </Typography>
                    <TextField
                      fullWidth
                      name="company_name"
                      value={formData.company_name || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter company name"
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ color: '#8B2635', mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Phone
                    </Typography>
                    <TextField
                      fullWidth
                      name="phone_number"
                      value={formData.phone_number || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter phone number"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ color: '#8B2635', mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      City
                    </Typography>
                    <TextField
                      fullWidth
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter city"
                      InputProps={{
                        startAdornment: <LocationOnIcon sx={{ color: '#8B2635', mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Row 3: Address */}
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Address
                    </Typography>
                    <TextField
                      fullWidth
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter street address"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Row 4: State, Zip Code, Country */}
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      State
                    </Typography>
                    <TextField
                      fullWidth
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter state/province"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Zip Code
                    </Typography>
                    <TextField
                      fullWidth
                      name="zip_code"
                      value={formData.zip_code || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter zip code"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Country
                    </Typography>
                    <TextField
                      fullWidth
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter country"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Row 5: Website, Industry, Company Size */}
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Website
                    </Typography>
                    <TextField
                      fullWidth
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="https://www.example.com"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Industry
                    </Typography>
                    <TextField
                      fullWidth
                      name="industry"
                      value={formData.industry || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="e.g. Technology, Healthcare"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Company Size
                    </Typography>
                    <TextField
                      fullWidth
                      name="size"
                      value={formData.size || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="e.g. 1-10, 11-50, 51-200"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Row 6: Timezone, Number of Remote Employees */}
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Timezone
                    </Typography>
                    <TextField
                      fullWidth
                      name="timezone"
                      value={formData.timezone || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="e.g. Asia/Karachi, UTC"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600, mb: 0.5 }}>
                      Remote Employees
                    </Typography>
                    <TextField
                      fullWidth
                      name="number_of_remote_employees"
                      type="number"
                      value={formData.number_of_remote_employees || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Number of remote employees"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2635',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    {/* Empty space for alignment */}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              borderRadius: '16px',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              boxShadow: '0 4px 20px rgba(139, 38, 53, 0.1)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CalendarIcon sx={{ color: '#8B2635', mr: 2, fontSize: '1.5rem' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#8B2635' }}>
                  Account Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'rgba(139, 38, 53, 0.1)' }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(139, 38, 53, 0.05)', borderRadius: '12px' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Account Created
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600 }}>
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(139, 38, 53, 0.05)', borderRadius: '12px' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Last Updated
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600 }}>
                      {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Never'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        {isEditing && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                sx={{ 
                  color: '#8B2635', 
                  borderColor: '#8B2635',
                  '&:hover': { 
                    borderColor: '#7A1E2B',
                    bgcolor: 'rgba(139, 38, 53, 0.05)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{ 
                  bgcolor: '#8B2635',
                  '&:hover': { bgcolor: '#7A1E2B' },
                  '&:disabled': { bgcolor: 'rgba(139, 38, 53, 0.5)' }
                }}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
