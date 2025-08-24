import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard,
  Work,
  BookOnline,
  CheckCircle,
  Schedule,
  AttachMoney,
  LocationOn,
  Refresh,
  CalendarToday,
} from '@mui/icons-material';
import { employeeApi } from '../../services/employee/employeeApi';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await employeeApi.get('/employee/dashboard/stats');
      setStats(statsResponse.data);
      
      // Fetch recent bookings
      const bookingsResponse = await employeeApi.get('/employee/bookings');
      setBookings(bookingsResponse.data.bookings.slice(0, 5)); // Show only recent 5
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatusChip = (status) => {
    const statusConfig = {
      'confirmed': { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)', label: 'Confirmed' },
      'pending': { color: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)', label: 'Pending' },
      'cancelled': { color: '#F44336', bg: 'rgba(244, 67, 54, 0.1)', label: 'Cancelled' },
      'completed': { color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)', label: 'Completed' },
    };

    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 600,
          border: `1px solid ${config.color}30`,
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress sx={{ color: '#4CAF50' }} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
      pt: 4,
      pb: 4,
    }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ 
              color: '#FFFFFF', 
              fontWeight: 700,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Dashboard sx={{ fontSize: 40, color: '#4CAF50' }} />
              Employee Dashboard
            </Typography>
            <Typography variant="h6" sx={{ color: '#C8E6C9' }}>
              Your workspace bookings and activity
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ 
              mb: 3,
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              border: '1px solid rgba(211, 47, 47, 0.3)',
              color: '#FF6B6B'
            }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(76, 175, 80, 0.2)', 
                        color: '#4CAF50',
                        width: 56,
                        height: 56
                      }}>
                        <BookOnline />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                          {stats.total_bookings}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          Total Bookings
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255, 193, 7, 0.2)', 
                        color: '#FFC107',
                        width: 56,
                        height: 56
                      }}>
                        <Schedule />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                          {stats.active_bookings}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          Active Bookings
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(33, 150, 243, 0.2)', 
                        color: '#2196F3',
                        width: 56,
                        height: 56
                      }}>
                        <CheckCircle />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                          {stats.completed_bookings}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          Completed
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(156, 39, 176, 0.2)', 
                        color: '#9C27B0',
                        width: 56,
                        height: 56
                      }}>
                        <AttachMoney />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                          ${stats.total_spent.toFixed(0)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          Total Spent
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Recent Bookings */}
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(76, 175, 80, 0.3)',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                  Recent Bookings
                </Typography>
                <Button
                  startIcon={<Refresh />}
                  onClick={fetchDashboardData}
                  sx={{
                    color: '#4CAF50',
                    borderColor: 'rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      borderColor: '#4CAF50',
                      backgroundColor: 'rgba(76, 175, 80, 0.1)'
                    }
                  }}
                  variant="outlined"
                >
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ 
                backgroundColor: 'rgba(248, 249, 250, 0.5)',
                borderRadius: '12px'
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#2E7D32', fontWeight: 600 }}>Workspace</TableCell>
                      <TableCell sx={{ color: '#2E7D32', fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ color: '#2E7D32', fontWeight: 600 }}>Dates</TableCell>
                      <TableCell sx={{ color: '#2E7D32', fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ color: '#2E7D32', fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ 
                          color: '#666666', 
                          textAlign: 'center',
                          py: 4
                        }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Work sx={{ fontSize: 48, color: '#CCCCCC' }} />
                            <Typography variant="body1">
                              No bookings yet. Start exploring workspaces!
                            </Typography>
                            <Button
                              variant="contained"
                              sx={{
                                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)',
                                }
                              }}
                            >
                              Browse Workspaces
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell sx={{ color: '#2E7D32', fontWeight: 500 }}>
                            {booking.space?.title || 'Unknown Space'}
                          </TableCell>
                          <TableCell sx={{ color: '#666666' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn sx={{ fontSize: 16, color: '#4CAF50' }} />
                              {booking.space ? `${booking.space.city}, ${booking.space.country}` : 'N/A'}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#666666' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday sx={{ fontSize: 16, color: '#4CAF50' }} />
                              <Box>
                                <Typography variant="body2">
                                  {new Date(booking.start_date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#999999' }}>
                                  to {new Date(booking.end_date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#2E7D32', fontWeight: 600 }}>
                            ${booking.total_price?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell>
                            {getBookingStatusChip(booking.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
  );
}
