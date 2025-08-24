import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Business,
  LocationOn,
  People,
  TrendingUp,
  Add,
  AccessTime,
  AttachMoney,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { coworkingApi } from '../../services/coworking';
// TopBar and Sidebar are now handled by CoworkingLayout

export default function CoworkingDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (!token || userRole !== 'coworking') {
      navigate('/coworking/login');
      return;
    }

    // Fetch real dashboard data from API - only once on mount
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile first (required)
        const profileResponse = await coworkingApi.get('/coworking/me');
        
        // Try to fetch stats, but don't fail if it doesn't work
        let statsData = {
          total_spaces: 0,
          active_bookings: 0,
          total_revenue: 0,
          monthly_revenue: 0
        };
        
        try {
          const statsResponse = await coworkingApi.get('/coworking/dashboard/stats');
          statsData = statsResponse.data;
        } catch (statsError) {
          console.warn('Stats endpoint not available, using default values:', statsError.message);
        }

        const dashboardData = {
          stats: statsData,
          user_info: profileResponse.data,
          recent_activities: [
            {
              id: 1,
              description: 'Dashboard loaded successfully',
              timestamp: new Date().toISOString()
            }
          ]
        };
        
        setDashboardData(dashboardData);
        setError('');
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/coworking/login');
        } else {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Remove navigate dependency to prevent re-renders

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/coworking/login');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        background: 'linear-gradient(135deg, #F8FAFF 0%, #E3F2FD 100%)'
      }}>
        <CircularProgress size={60} sx={{ color: '#1976D2' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #F8FAFF 0%, #E3F2FD 100%)', minHeight: '60vh' }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const { stats, user_info, recent_activities } = dashboardData;

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #F8FAFF 0%, #E3F2FD 100%)', minHeight: '100vh' }}>
        
        {/* Main Content */}
        <Box sx={{ 
          flexGrow: 1,
          background: 'linear-gradient(135deg, #F8FAFF 0%, #E3F2FD 100%)', 
          minHeight: 'calc(100vh - 64px)',
          p: 4,
          pt: 5,
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
          <Box sx={{ width: '100%', maxWidth: 1200 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              color: '#0D47A1', 
              fontWeight: 700, 
              mb: 1
            }}>
              Welcome Back, {user_info?.first_name || 'Owner'}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#1976D2', 
              fontWeight: 400 
            }}>
              Coworking Space Dashboard
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(66, 165, 245, 0.2)',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Business sx={{ fontSize: 40, color: '#42A5F5', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
                    {stats?.total_spaces || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1976D2', fontWeight: 500 }}>
                    Total Spaces
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(66, 165, 245, 0.2)',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <People sx={{ fontSize: 40, color: '#42A5F5', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
                    {stats?.active_bookings || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1976D2', fontWeight: 500 }}>
                    Active Bookings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(66, 165, 245, 0.2)',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <AttachMoney sx={{ fontSize: 40, color: '#42A5F5', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
                    ${(stats?.total_revenue || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1976D2', fontWeight: 500 }}>
                    Total Revenue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(66, 165, 245, 0.2)',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <TrendingUp sx={{ fontSize: 40, color: '#42A5F5', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
                    {stats?.occupancy_rate || 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1976D2', fontWeight: 500 }}>
                    Occupancy Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions and Recent Activities */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(66, 165, 245, 0.2)',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#0D47A1', 
                    fontWeight: 600, 
                    mb: 3 
                  }}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        fullWidth
                        onClick={() => navigate('/coworking/spaces/add')}
                        sx={{
                          background: 'linear-gradient(45deg, #42A5F5 30%, #1976D2 90%)',
                          color: 'white',
                          py: 1.5,
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '1rem',
                          boxShadow: '0 4px 15px rgba(66, 165, 245, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
                            transform: 'none',
                            boxShadow: '0 4px 15px rgba(66, 165, 245, 0.3)',
                          }
                        }}
                      >
                        Add New Space
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        startIcon={<People />}
                        fullWidth
                        sx={{
                          borderColor: '#42A5F5',
                          color: '#1976D2',
                          py: 1.5,
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '1rem',
                          borderWidth: '2px',
                          '&:hover': {
                            borderColor: '#1976D2',
                            backgroundColor: 'rgba(66, 165, 245, 0.04)',
                            borderWidth: '2px',
                          }
                        }}
                      >
                        View Bookings
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(66, 165, 245, 0.2)',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#0D47A1', 
                    fontWeight: 600, 
                    mb: 2 
                  }}>
                    Recent Activities
                  </Typography>
                  {recent_activities && recent_activities.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {recent_activities.slice(0, 3).map((activity, index) => (
                        <ListItem key={activity.id} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <AccessTime sx={{ color: '#42A5F5', fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.description}
                            secondary={new Date(activity.timestamp).toLocaleDateString()}
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontSize: '0.9rem',
                                color: '#1976D2',
                                fontWeight: 500
                              },
                              '& .MuiListItemText-secondary': {
                                fontSize: '0.8rem',
                                color: '#42A5F5'
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#42A5F5', textAlign: 'center', py: 2 }}>
                      No recent activities
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
