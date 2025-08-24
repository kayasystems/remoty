import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Business, Save, ArrowBack } from '@mui/icons-material';
import { coworkingApi } from '../../../services/coworking';

export default function CreateCoworkingSpace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Pakistan',
    latitude: 0,
    longitude: 0,
    price_per_hour: 0,
    price_per_day: 0,
    price_per_week: 0,
    price_per_month: 0,
    is_24_7: false,
    timezone: 'Asia/Karachi'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!formData.title || !formData.description || !formData.address || !formData.city) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Create the space
      const response = await api.post('/coworking/spaces', formData);
      
      setSuccess('Coworking space created successfully!');
      
      // Redirect to the edit page after a short delay
      setTimeout(() => {
        navigate(`/coworking/spaces/edit/${response.data.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating space:', error);
      setError(error.response?.data?.detail || 'Failed to create coworking space');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, #F8FAFF 0%, #E3F2FD 100%)', 
      minHeight: '100vh' 
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/coworking/dashboard')}
            sx={{ color: '#1976D2' }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ 
            color: '#1976D2', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Business />
            Create New Coworking Space
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Main Form */}
        <Card sx={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
          border: '1px solid rgba(66, 165, 245, 0.2)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#1976D2', mb: 2, fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Space Title *"
                    fullWidth
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Description *"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#1976D2', mb: 2, fontWeight: 600 }}>
                    Location
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Address *"
                    fullWidth
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City *"
                    fullWidth
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State/Province"
                    fullWidth
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="ZIP Code"
                    fullWidth
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    fullWidth
                    select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  >
                    <MenuItem value="Pakistan">Pakistan</MenuItem>
                    <MenuItem value="India">India</MenuItem>
                    <MenuItem value="Bangladesh">Bangladesh</MenuItem>
                    <MenuItem value="UAE">UAE</MenuItem>
                    <MenuItem value="USA">USA</MenuItem>
                    <MenuItem value="UK">UK</MenuItem>
                  </TextField>
                </Grid>

                {/* Pricing */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#1976D2', mb: 2, fontWeight: 600 }}>
                    Basic Pricing (Optional)
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Price per Hour"
                    type="number"
                    fullWidth
                    value={formData.price_per_hour}
                    onChange={(e) => handleInputChange('price_per_hour', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Price per Day"
                    type="number"
                    fullWidth
                    value={formData.price_per_day}
                    onChange={(e) => handleInputChange('price_per_day', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Price per Week"
                    type="number"
                    fullWidth
                    value={formData.price_per_week}
                    onChange={(e) => handleInputChange('price_per_week', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Price per Month"
                    type="number"
                    fullWidth
                    value={formData.price_per_month}
                    onChange={(e) => handleInputChange('price_per_month', parseFloat(e.target.value) || 0)}
                  />
                </Grid>

                {/* Operating Hours */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#1976D2', mb: 2, fontWeight: 600 }}>
                    Operating Hours
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_24_7}
                        onChange={(e) => handleInputChange('is_24_7', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#1976D2' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1976D2' }
                        }}
                      />
                    }
                    label="24/7 Operation"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Timezone"
                    fullWidth
                    select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                  >
                    <MenuItem value="Asia/Karachi">Asia/Karachi (PKT)</MenuItem>
                    <MenuItem value="Asia/Dubai">Asia/Dubai (GST)</MenuItem>
                    <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                    <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                    <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
                  </TextField>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/coworking/dashboard')}
                      disabled={loading}
                      sx={{ color: '#1976D2', borderColor: '#1976D2' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(45deg, #42A5F5 30%, #1976D2 90%)',
                        px: 4
                      }}
                    >
                      {loading ? 'Creating...' : 'Create Space'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
