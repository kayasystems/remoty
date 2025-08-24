import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employerApi } from '../../services/employer';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Grid,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Person,
  Business,
  CalendarToday,
  LocationOn,
  AttachMoney,
  Schedule,
  Notes
} from '@mui/icons-material';

export default function BookingDetails() {
  const { id } = useParams(); // booking ID
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        console.log('Fetching booking with ID:', id);
        const response = await employerApi.get(`/employer/bookings/${id}`);
        console.log('Booking data received:', response.data);
        setBooking(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.response?.data?.detail || 'Failed to fetch booking details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBooking();
  }, [id]);

  const getStatusColor = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'info'; // Upcoming
    if (now >= start && now <= end) return 'success'; // Active
    return 'default'; // Completed
  };

  const getStatusText = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Active';
    return 'Completed';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#8B2635' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: '#8B2635' }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Booking not found.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: '#8B2635' }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Card sx={{ 
        mb: 3, 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: '#1e293b',
                mb: 1,
                fontSize: '1.875rem'
              }}>
                Booking Details
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                fontSize: '1rem'
              }}>
                Complete information about this coworking space reservation
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate(`/employer/coworking/booking/${booking.id}/edit`)}
                sx={{
                  backgroundColor: '#8B2635',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#7A1F2B'
                  }
                }}
              >
                Edit Booking
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: '#8B2635',
                  color: '#8B2635',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#7A1F2B',
                    color: '#7A1F2B',
                    backgroundColor: 'rgba(139, 38, 53, 0.05)'
                  }
                }}
              >
                Back
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gridTemplateRows: 'auto auto',
        gap: 3,
        width: '100%',
        alignItems: 'start'
      }}>
        {/* Employee Information */}
        <Card sx={{ 
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ backgroundColor: '#8B2635', mr: 2 }}>
                  <Person />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                  Employee Information
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  backgroundColor: '#8B2635', 
                  width: 48, 
                  height: 48, 
                  mr: 3,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  {booking.employee_name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    {booking.employee_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {booking.employee_email}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Contact
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                    {booking.employee_contact || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Address
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                    {booking.employee_address}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Location
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                    {booking.employee_city}{booking.employee_country ? `, ${booking.employee_country}` : ''}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
        </Card>

        {/* Coworking Space Information */}
        <Card sx={{ 
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ backgroundColor: '#4338CA', mr: 2 }}>
                  <Business />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                  Coworking Space
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  color: '#8B2635',
                  mb: 1
                }}>
                  {booking.coworking_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ fontSize: 16, color: '#64748b', mr: 1 }} />
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {booking.coworking_address}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="caption" sx={{ 
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Location
                </Typography>
                <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                  {booking.coworking_city}{booking.coworking_country ? `, ${booking.coworking_country}` : ''}
                </Typography>
              </Box>
            </CardContent>
        </Card>

        {/* Booking Details */}
        <Card sx={{ 
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          gridColumn: { xs: '1', md: '1 / -1' },
          width: '100%'
        }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: '#10B981', mr: 2 }}>
                    <CalendarToday />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    Booking Details
                  </Typography>
                </Box>
                <Chip
                  label={getStatusText(booking.start_date, booking.end_date)}
                  color={getStatusColor(booking.start_date, booking.end_date)}
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    height: 32
                  }}
                />
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ 
                    textAlign: { xs: 'left', sm: 'center', lg: 'left' },
                    p: 2,
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#64748b',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      mb: 1
                    }}>
                      Start Date
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: '#1e293b', 
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {new Date(booking.start_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ 
                    textAlign: { xs: 'left', sm: 'center', lg: 'left' },
                    p: 2,
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#64748b',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      mb: 1
                    }}>
                      End Date
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: '#1e293b', 
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {new Date(booking.end_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ 
                    textAlign: { xs: 'left', sm: 'center', lg: 'left' },
                    p: 2,
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#64748b',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      mb: 1
                    }}>
                      Package Type
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: '#1e293b', 
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {booking.booking_type}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ 
                    textAlign: { xs: 'left', sm: 'center', lg: 'left' },
                    p: 2,
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#64748b',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      mb: 1
                    }}>
                      Total Cost
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: '#059669', 
                      fontWeight: 'bold',
                      fontSize: '1.25rem'
                    }}>
                      {booking.total_cost ? `$${booking.total_cost} USD` : 'Not Calculated'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {(booking.subscription_mode || booking.is_ongoing || booking.days_of_week || booking.duration_per_day) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Grid container spacing={3}>
                    {booking.subscription_mode && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#64748b',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Subscription Mode
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                            {booking.subscription_mode}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="caption" sx={{ 
                          color: '#64748b',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Ongoing
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                          {booking.is_ongoing ? 'Yes' : 'No'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {booking.days_of_week && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#64748b',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Days of Week
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                            {booking.days_of_week}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {booking.duration_per_day && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#64748b',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Daily Duration
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                            {booking.duration_per_day} hrs/day
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}

              {booking.notes && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Notes sx={{ color: '#64748b', mr: 2, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: '#64748b',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Notes
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                        {booking.notes}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
