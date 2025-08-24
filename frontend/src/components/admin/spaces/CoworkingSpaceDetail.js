import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../../services/admin/adminApi';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Business,
  LocationOn,
  Verified,
  Pending,
  CheckCircle,
  Cancel,
  Schedule,
  AttachMoney,
  Star,
} from '@mui/icons-material';

export default function CoworkingSpaceDetail() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSpaceDetail();
  }, [spaceId]);

  const fetchSpaceDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.get('/admin/spaces');
      const spaces = response.data.spaces || [];
      const foundSpace = spaces.find(s => s.id === parseInt(spaceId));
      
      if (foundSpace) {
        setSpace(foundSpace);
      } else {
        setError('Coworking space not found');
      }
    } catch (error) {
      console.error('Error fetching space detail:', error);
      setError('Failed to load coworking space details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySpace = async () => {
    try {
      setActionLoading(true);
      await adminApi.put(`/admin/spaces/${spaceId}/verify`);
      await fetchSpaceDetail(); // Refresh data
    } catch (error) {
      console.error('Error verifying space:', error);
      setError('Failed to verify space');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnverifySpace = async () => {
    try {
      setActionLoading(true);
      await adminApi.put(`/admin/spaces/${spaceId}/unverify`);
      await fetchSpaceDetail(); // Refresh data
    } catch (error) {
      console.error('Error unverifying space:', error);
      setError('Failed to unverify space');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (isVerified) => {
    return isVerified ? (
      <Chip
        icon={<Verified />}
        label="Verified"
        color="success"
        sx={{
          backgroundColor: '#4CAF50',
          color: '#FFFFFF',
          '& .MuiChip-icon': { color: '#FFFFFF' }
        }}
      />
    ) : (
      <Chip
        icon={<Pending />}
        label="Pending Verification"
        color="warning"
        sx={{
          backgroundColor: '#FF9800',
          color: '#FFFFFF',
          '& .MuiChip-icon': { color: '#FFFFFF' }
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        color: '#FFFFFF'
      }}>
        <CircularProgress sx={{ color: '#808080' }} />
        <Typography sx={{ ml: 2, color: '#B0B0B0' }}>Loading space details...</Typography>
      </Box>
    );
  }

  if (error || !space) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#FF6B6B' }}>
          {error || 'Space not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/spaces/all')}
          sx={{ mt: 2, color: '#B0B0B0' }}
        >
          Back to All Spaces
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton
          onClick={() => navigate('/admin/spaces/all')}
          sx={{ color: '#808080', '&:hover': { color: '#FFFFFF' } }}
        >
          <ArrowBack />
        </IconButton>
        <Business sx={{ fontSize: 32, color: '#808080' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
            {space.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
            Coworking Space Details & Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!space.is_verified ? (
            <Button
              variant="contained"
              startIcon={actionLoading ? <CircularProgress size={16} /> : <CheckCircle />}
              onClick={handleVerifySpace}
              disabled={actionLoading}
              sx={{
                backgroundColor: '#4CAF50',
                color: '#FFFFFF',
                '&:hover': { backgroundColor: '#66BB6A' },
              }}
            >
              Verify Space
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={actionLoading ? <CircularProgress size={16} /> : <Cancel />}
              onClick={handleUnverifySpace}
              disabled={actionLoading}
              sx={{
                borderColor: '#FF9800',
                color: '#FF9800',
                '&:hover': { 
                  borderColor: '#FFB74D',
                  color: '#FFB74D',
                  backgroundColor: 'rgba(255, 152, 0, 0.1)'
                },
              }}
            >
              Unverify Space
            </Button>
          )}
        </Box>
      </Box>

      {/* Status Card */}
      <Card sx={{ 
        mb: 3,
        background: space.is_verified 
          ? 'rgba(76, 175, 80, 0.1)' 
          : 'rgba(255, 152, 0, 0.1)', 
        border: space.is_verified 
          ? '1px solid rgba(76, 175, 80, 0.3)' 
          : '1px solid rgba(255, 152, 0, 0.3)' 
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 1 }}>
                Verification Status
              </Typography>
              {getStatusChip(space.is_verified)}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                Space ID: #{space.id}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: 'rgba(48, 48, 48, 0.8)', 
            border: '1px solid rgba(96, 96, 96, 0.3)',
            mb: 3
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 2 }}>
                Basic Information
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#B0B0B0', mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {space.description || 'No description provided'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(96, 96, 96, 0.3)' }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#B0B0B0', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Location
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', mb: 0.5 }}>
                  {space.address}
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {space.city}, {space.country}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card sx={{ 
            background: 'rgba(48, 48, 48, 0.8)', 
            border: '1px solid rgba(96, 96, 96, 0.3)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 2 }}>
                <AttachMoney sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                Pricing Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(128, 128, 128, 0.1)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#B0B0B0' }}>
                      Hourly
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      ${space.price_per_hour || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(128, 128, 128, 0.1)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#B0B0B0' }}>
                      Daily
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      ${space.price_per_day || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(128, 128, 128, 0.1)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#B0B0B0' }}>
                      Weekly
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      ${space.price_per_week || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(128, 128, 128, 0.1)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#B0B0B0' }}>
                      Monthly
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      ${space.price_per_month || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Information */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'rgba(48, 48, 48, 0.8)', 
            border: '1px solid rgba(96, 96, 96, 0.3)',
            mb: 3
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 2 }}>
                Space Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 0.5 }}>
                  Operating Hours
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  <Schedule sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  {space.is_24_7 ? '24/7 Access' : (space.opening_hours || 'Not specified')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 0.5 }}>
                  Timezone
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {space.timezone || 'Not specified'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 0.5 }}>
                  Amenities
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {space.amenities ? 'Available' : 'Not specified'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 0.5 }}>
                  Packages
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {space.packages ? 'Available' : 'Not specified'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ 
            background: 'rgba(48, 48, 48, 0.8)', 
            border: '1px solid rgba(96, 96, 96, 0.3)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/spaces/all')}
                  sx={{
                    borderColor: '#808080',
                    color: '#FFFFFF',
                    '&:hover': { 
                      borderColor: '#B0B0B0',
                      backgroundColor: 'rgba(128, 128, 128, 0.1)'
                    },
                  }}
                >
                  View All Spaces
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/spaces/pending')}
                  sx={{
                    borderColor: '#FF9800',
                    color: '#FF9800',
                    '&:hover': { 
                      borderColor: '#FFB74D',
                      backgroundColor: 'rgba(255, 152, 0, 0.1)'
                    },
                  }}
                >
                  Pending Verifications
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/spaces/verified')}
                  sx={{
                    borderColor: '#4CAF50',
                    color: '#4CAF50',
                    '&:hover': { 
                      borderColor: '#66BB6A',
                      backgroundColor: 'rgba(76, 175, 80, 0.1)'
                    },
                  }}
                >
                  Verified Spaces
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
