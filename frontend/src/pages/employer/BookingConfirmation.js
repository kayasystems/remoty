// src/pages/employer/BookingConfirmation.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  IconButton,
  Container,
  Stack,
  Grid
} from '@mui/material';
import {
  CheckCircle,
  Business,
  Person,
  LocationOn,
  Download,
  Print,
  ArrowBack,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    booking, 
    coworkingSpace, 
    selectedPackage, 
    billingInfo, 
    paymentMethod,
    paymentResult,
    isSubscription,
    totalAmount,
    bookingData
  } = location.state || {};
  const [employerData, setEmployerData] = useState(null);

  // Fetch employer data to get phone number if not in billingInfo
  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        const response = await fetch('/api/employer/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setEmployerData(data);
          console.log('📱 Employer data fetched:', data);
        }
      } catch (error) {
        console.error('Error fetching employer data:', error);
      }
    };

    if (!billingInfo?.phone_number && !billingInfo?.phone) {
      fetchEmployerData();
    }
  }, [billingInfo]);

  // If no booking data, redirect back
  if (!booking) {
    navigate('/employer/coworking/find');
    return null;
  }

  // Debug: Log booking data to see what fields are available
  console.log('Booking data:', booking);
  console.log('Billing info:', billingInfo);
  console.log('Phone number fields:', {
    phone_number: billingInfo?.phone_number,
    phoneNumber: billingInfo?.phoneNumber,
    phone: billingInfo?.phone
  });
  console.log('Available date fields:', {
    start_date: booking.start_date,
    end_date: booking.end_date,
    startDate: booking.startDate,
    endDate: booking.endDate,
    booking_start_date: booking.booking_start_date,
    booking_end_date: booking.booking_end_date
  });

  // Function to get the correct email for the person the booking is for
  const getBookingPersonEmail = () => {
    // If it's an employee booking, try to get employee email from booking data
    if (booking?.employee_id && booking?.employee) {
      return booking.employee.email;
    }
    
    // If billing email is provided, use that (this is the person's email)
    if (billingInfo?.billing_email) {
      return billingInfo.billing_email;
    }
    
    // Fallback to general email or default
    return billingInfo?.email || 'farrukh.naseem@kayasystems.com';
  };

  // Function to get the correct name for the person the booking is for
  const getBookingPersonName = () => {
    // If it's an employee booking, try to get employee name
    if (booking?.employee_id && booking?.employee) {
      return `${booking.employee.first_name} ${booking.employee.last_name}`;
    }
    
    // Use billing info name or default
    return billingInfo?.company_name || billingInfo?.first_name || 'Farrukh Naseem';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const calculateDuration = () => {
    const startDate = booking.start_date || booking.startDate || booking.booking_start_date;
    const endDate = booking.end_date || booking.endDate || booking.booking_end_date;
    
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diffTime = Math.abs(end - start);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // For booking duration, we count calendar days
          // Same day = 1 day, next day = 2 days, etc.
          return diffDays + 1;
        }
      } catch (error) {
        console.log('Date calculation error:', error);
      }
    }
    return 1;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Glassy Header */}
        <Box sx={{
          background: 'rgba(139, 38, 53, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 38, 53, 0.2)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(139, 38, 53, 0.2)'
        }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 600, 
              color: 'white',
              mb: 1
            }}>
              Booking Confirmed
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem'
            }}>
              Your coworking space reservation is complete
            </Typography>
          </Box>
          <CheckCircle sx={{ 
            fontSize: 64, 
            color: '#10b981'
          }} />
        </Box>

        {/* Receipt Style Confirmation */}
        <Paper sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {/* Receipt Header */}
          <Box sx={{
            background: 'rgba(139, 38, 53, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 38, 53, 0.2)',
            color: 'white',
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                BOOKING RECEIPT
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, color: 'white', mb: 0.5 }}>
                Booking ID: {booking.booking_id || booking.id || 'CW-' + Date.now()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                Payment ID: {paymentResult?.id || booking.payment_intent_id || booking.subscription_id || 'N/A'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
                onClick={() => window.print()}
              >
                <Print fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Download fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Receipt Content */}
          <Box sx={{ p: 4 }}>
            
            {/* Coworking Space Details Card */}
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.02) 0%, rgba(139, 38, 53, 0.01) 100%)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              borderRadius: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business sx={{ mr: 2, fontSize: 24, color: '#8B2635' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Coworking Space
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                {coworkingSpace?.title || 'Coworking Space'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                {coworkingSpace?.full_address || 'Address not available'}
              </Typography>
            </Paper>

            {/* Booking Details Card */}
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.02) 0%, rgba(139, 38, 53, 0.01) 100%)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              borderRadius: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
                Booking Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Package</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {selectedPackage?.name || 'Hot Desk'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                      {isSubscription ? 'Subscription Type' : 'Duration'}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {isSubscription ? 'Monthly Recurring' : `${calculateDuration()} day${calculateDuration() > 1 ? 's' : ''}`}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                      {isSubscription ? 'Subscription Start Date' : 'Booking Period'}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {isSubscription ? 
                        formatDate(booking.start_date || booking.startDate || booking.booking_start_date) :
                        `${formatDate(booking.start_date || booking.startDate || booking.booking_start_date)} - ${formatDate(booking.end_date || booking.endDate || booking.booking_end_date)}`
                      }
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Booking Type</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {booking.employee_id ? 'Employee Booking' : 'Personal Booking'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Rate</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {totalAmount ? 
                        (isSubscription ? 
                          `$${Number(totalAmount).toFixed(0)}/month` :
                          `$${Number(totalAmount).toFixed(0)}`
                        ) :
                        (isSubscription ? 
                          `$${selectedPackage?.price_per_month || '40'}/month` :
                          `$${selectedPackage?.price_per_day || '20'}/day`
                        )
                      }
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Billing Information Card */}
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.02) 0%, rgba(139, 38, 53, 0.01) 100%)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              borderRadius: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
                Billing Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Company</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {getBookingPersonName()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Email</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {getBookingPersonEmail()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Phone</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {(() => {
                        // Check all possible phone number sources
                        const phoneFromBilling = billingInfo?.phone_number || billingInfo?.phoneNumber || billingInfo?.phone;
                        const phoneFromBooking = booking?.phone_number || booking?.phone;
                        const phoneFromEmployee = booking?.employee?.phone_number || booking?.employee?.phone;
                        const phoneFromEmployer = booking?.employer?.phone_number || booking?.employer?.phone;
                        const phoneFromEmployerData = employerData?.phone_number || employerData?.phone;
                        
                        console.log('🔍 Phone number sources:', {
                          phoneFromBilling,
                          phoneFromBooking,
                          phoneFromEmployee,
                          phoneFromEmployer,
                          phoneFromEmployerData,
                          billingInfo,
                          booking,
                          employerData
                        });
                        
                        return phoneFromBilling || phoneFromBooking || phoneFromEmployee || phoneFromEmployer || phoneFromEmployerData || 'Not provided';
                      })()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Payment Method</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {paymentMethod === 'credit_card' ? 'Credit/Debit Card' : 'Bank Transfer'}
                    </Typography>
                  </Box>
                </Grid>
                
                {/* Billing Address - Full Width */}
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Billing Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {(() => {
                        const addressParts = [];
                        if (billingInfo?.address_line_1 || billingInfo?.address) {
                          addressParts.push(billingInfo.address_line_1 || billingInfo.address);
                        }
                        if (billingInfo?.address_line_2) {
                          addressParts.push(billingInfo.address_line_2);
                        }
                        if (billingInfo?.city) {
                          addressParts.push(billingInfo.city);
                        }
                        if (billingInfo?.state) {
                          addressParts.push(billingInfo.state);
                        }
                        if (billingInfo?.zipCode || billingInfo?.zip_code) {
                          addressParts.push(billingInfo.zipCode || billingInfo.zip_code);
                        }
                        if (billingInfo?.country) {
                          addressParts.push(billingInfo.country);
                        }
                        
                        return addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided';
                      })()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Total Amount Card */}
            <Paper sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #8B2635 0%, #a91b3d 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(139, 38, 53, 0.3)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, opacity: 0.9, color: 'white' }}>
                    Total Amount
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, color: 'white' }}>
                    {isSubscription ? 
                      `Monthly Subscription - ${selectedPackage?.name || 'Package'}` :
                      `${calculateDuration()} day${calculateDuration() > 1 ? 's' : ''} × $${selectedPackage?.price_per_day || '20'}/day`
                    }
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                  ${totalAmount ? 
                    (isSubscription ? 
                      `${Number(totalAmount).toFixed(0)}/month` :
                      Number(totalAmount).toFixed(0)
                    ) :
                    (booking?.total_cost ? Number(booking.total_cost).toFixed(0) : 
                      (isSubscription ? 
                        `${Number(selectedPackage?.price_per_month || 40).toFixed(0)}/month` :
                        (calculateDuration() * (selectedPackage?.price_per_day || 20)).toFixed(0)
                      )
                    )
                  }
                </Typography>
              </Box>
            </Paper>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/employer/coworking/find')}
                sx={{
                  backgroundColor: '#8B2635',
                  '&:hover': { backgroundColor: '#7a1f2e' },
                  flex: 1
                }}
              >
                Book Another Space
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
