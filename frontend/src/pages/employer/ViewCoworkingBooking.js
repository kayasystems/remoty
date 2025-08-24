// src/pages/Employer/ViewCoworkingBooking.js
import React, { useEffect, useState } from "react";
import { employerApi } from '../../services/employer';
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Business,
  Person,
  CalendarToday,
  LocationOn,
  Edit,
  Visibility,
  Add
} from "@mui/icons-material";

const ViewCoworkingBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await employerApi.get("/employer/bookings");
        console.log("Fetched bookings:", response.data);
        setBookings(response.data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleManageBooking = (booking) => {
    navigate(`/employer/coworking/booking/${booking.id}`);
  };

  const handleNewBooking = () => {
    navigate('/employer/coworking/book');
  };

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

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <Paper sx={{ 
        mb: 3, 
        p: 3,
        background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px',
        boxShadow: 'none'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ backgroundColor: '#8B2635', width: 56, height: 56 }}>
              <CalendarToday />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#8B2635',
                mb: 1
              }}>
                Coworking Bookings
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary'
              }}>
                Manage all employee coworking space reservations
              </Typography>
            </Box>
          </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNewBooking}
              sx={{
                backgroundColor: '#8B2635',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                '&:hover': {
                  backgroundColor: '#7A1F2B',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }
              }}
            >
              New Booking
            </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ backgroundColor: '#8B2635', mr: 2 }}>
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                  {bookings.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Total Bookings
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ backgroundColor: '#10B981', mr: 2 }}>
                <CalendarToday />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                  {bookings.filter(b => getStatusText(b.start_date, b.end_date) === 'Active').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Active Bookings
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ backgroundColor: '#4338CA', mr: 2 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                  {new Set(bookings.map(b => b.employee_name)).size}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Employees with Bookings
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Bookings Table */}
      <Card sx={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent>
          {bookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Business sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                No bookings found
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                Start by creating your first coworking space booking
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleNewBooking}
                sx={{
                  backgroundColor: '#8B2635',
                  '&:hover': { backgroundColor: '#7A1F2B' }
                }}
              >
                Create First Booking
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {bookings.map((booking) => (
                <Card key={booking.id} sx={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      {/* Left: Employee & Space Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Avatar sx={{ 
                          backgroundColor: '#8B2635', 
                          width: 48, 
                          height: 48, 
                          mr: 3,
                          fontSize: '1.1rem',
                          fontWeight: 'bold'
                        }}>
                          {booking.employee_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            color: '#1e293b',
                            mb: 0.5
                          }}>
                            {booking.employee_name}
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: '#8B2635',
                            fontWeight: 600,
                            mb: 1
                          }}>
                            {booking.coworking_space_name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ fontSize: 16, color: '#64748b', mr: 1 }} />
                            <Typography variant="body2" sx={{ 
                              color: '#64748b',
                              maxWidth: '400px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {booking.coworking_space_address}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Right: Status & Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={getStatusText(booking.start_date, booking.end_date)}
                          color={getStatusColor(booking.start_date, booking.end_date)}
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            height: 32
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleManageBooking(booking)}
                              sx={{ 
                                color: '#8B2635',
                                backgroundColor: 'rgba(139, 38, 53, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(139, 38, 53, 0.2)'
                                }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Booking">
                            <IconButton
                              onClick={() => navigate(`/employer/coworking/booking/${booking.id}/edit`)}
                              sx={{ 
                                color: '#4338CA',
                                backgroundColor: 'rgba(67, 56, 202, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(67, 56, 202, 0.2)'
                                }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>

                    {/* Bottom: Booking Details */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      pt: 2,
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <Box sx={{ display: 'flex', gap: 4 }}>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#64748b',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Duration
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#1e293b',
                            fontWeight: 600,
                            mt: 0.5
                          }}>
                            {new Date(booking.start_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })} - {new Date(booking.end_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#64748b',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Package
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#1e293b',
                            fontWeight: 600,
                            mt: 0.5
                          }}>
                            {booking.booking_type}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ 
                          color: '#64748b',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Total Cost
                        </Typography>
                        <Typography variant="h6" sx={{ 
                          color: '#059669',
                          fontWeight: 'bold',
                          mt: 0.5
                        }}>
                          ${booking.total_cost} USD
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewCoworkingBooking;
