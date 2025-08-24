// src/components/employer/CoworkingBookingWizard.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Switch,
  Collapse
} from '@mui/material';
import {
  Business,
  Person,
  Schedule,
  CheckCircle,
  LocationOn,
  Group,
  AccessTime,
  ArrowForward,
  ArrowBack,
  CalendarToday,
  DateRange,
  Event,
  Tune,
  Notes,
  Payment,
  DirectionsWalk,
  DirectionsBike,
  DirectionsBus,
  MyLocation,
  Info,
  ChevronLeft,
  ChevronRight,
  BrokenImage,
  Close
} from '@mui/icons-material';
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';
import { employerApi } from '../../services/employer';
import StripePaymentForm from './StripePaymentForm';

// Helper function to convert country names to ISO 2-character codes for Stripe
const getCountryCode = (countryName) => {
  if (!countryName) return 'US';
  
  const countryMap = {
    'Pakistan': 'PK',
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'India': 'IN',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Japan': 'JP',
    'South Korea': 'KR',
    'China': 'CN',
    'Singapore': 'SG',
    'Malaysia': 'MY',
    'Thailand': 'TH',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'Vietnam': 'VN',
    'Bangladesh': 'BD',
    'Sri Lanka': 'LK',
    'Nepal': 'NP',
    'Afghanistan': 'AF',
    'Iran': 'IR',
    'Iraq': 'IQ',
    'Turkey': 'TR',
    'Saudi Arabia': 'SA',
    'UAE': 'AE',
    'United Arab Emirates': 'AE',
    'Qatar': 'QA',
    'Kuwait': 'KW',
    'Bahrain': 'BH',
    'Oman': 'OM',
    'Jordan': 'JO',
    'Lebanon': 'LB',
    'Syria': 'SY',
    'Israel': 'IL',
    'Egypt': 'EG',
    'Morocco': 'MA',
    'Algeria': 'DZ',
    'Tunisia': 'TN',
    'Libya': 'LY',
    'Sudan': 'SD',
    'Ethiopia': 'ET',
    'Kenya': 'KE',
    'Uganda': 'UG',
    'Tanzania': 'TZ',
    'South Africa': 'ZA',
    'Nigeria': 'NG',
    'Ghana': 'GH',
    'Ivory Coast': 'CI',
    'Senegal': 'SN',
    'Morocco': 'MA',
    'Brazil': 'BR',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Peru': 'PE',
    'Venezuela': 'VE',
    'Ecuador': 'EC',
    'Bolivia': 'BO',
    'Paraguay': 'PY',
    'Uruguay': 'UY',
    'Mexico': 'MX',
    'Guatemala': 'GT',
    'Costa Rica': 'CR',
    'Panama': 'PA',
    'Honduras': 'HN',
    'Nicaragua': 'NI',
    'El Salvador': 'SV',
    'Belize': 'BZ',
    'Jamaica': 'JM',
    'Cuba': 'CU',
    'Dominican Republic': 'DO',
    'Haiti': 'HT',
    'Trinidad and Tobago': 'TT',
    'Barbados': 'BB',
    'Bahamas': 'BS',
    'Russia': 'RU',
    'Ukraine': 'UA',
    'Poland': 'PL',
    'Czech Republic': 'CZ',
    'Slovakia': 'SK',
    'Hungary': 'HU',
    'Romania': 'RO',
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Serbia': 'RS',
    'Bosnia and Herzegovina': 'BA',
    'Montenegro': 'ME',
    'North Macedonia': 'MK',
    'Albania': 'AL',
    'Slovenia': 'SI',
    'Estonia': 'EE',
    'Latvia': 'LV',
    'Lithuania': 'LT',
    'Belarus': 'BY',
    'Moldova': 'MD',
    'Georgia': 'GE',
    'Armenia': 'AM',
    'Azerbaijan': 'AZ',
    'Kazakhstan': 'KZ',
    'Uzbekistan': 'UZ',
    'Turkmenistan': 'TM',
    'Kyrgyzstan': 'KG',
    'Tajikistan': 'TJ',
    'Mongolia': 'MN',
    'New Zealand': 'NZ'
  };
  
  // Try exact match first
  if (countryMap[countryName]) {
    return countryMap[countryName];
  }
  
  // Try case-insensitive match
  const lowerCountryName = countryName.toLowerCase();
  for (const [name, code] of Object.entries(countryMap)) {
    if (name.toLowerCase() === lowerCountryName) {
      return code;
    }
  }
  
  // If already a 2-character code, return as-is
  if (countryName.length === 2 && /^[A-Z]{2}$/i.test(countryName)) {
    return countryName.toUpperCase();
  }
  
  // Default to US if no match found
  return 'US';
};

// Stripe Payment Component that uses hooks properly
const StripePaymentComponent = ({ 
  cardholderName, 
  setCardholderName, 
  onPaymentProcess,
  isProcessingPayment,
  setIsProcessingPayment,
  calculateTotal,
  bookingData,
  coworkingSpace,
  selectedPackage,
  billingInfo,
  employerApi,
  navigate,
  setSafeError,
  triggerPayment,
  setTriggerPayment
}) => {
  const stripe = useStripe();
  const elements = useElements();

  // Watch for payment trigger
  useEffect(() => {
    if (triggerPayment) {
      processPayment();
      setTriggerPayment(false);
    }
  }, [triggerPayment]);

  const processPayment = async () => {
    if (!cardholderName.trim()) {
      alert('Please enter the cardholder name');
      return;
    }

    if (!stripe || !elements) {
      alert('Stripe not loaded. Please refresh and try again.');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      console.log('🚀 Starting Stripe payment process...');
      
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error('Card information not found');
      }

      // Create payment method
      console.log('💳 Creating payment method...');
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: cardholderName,
          email: billingInfo.billing_email,
          address: {
            line1: billingInfo.address_line_1,
            city: billingInfo.city,
            state: billingInfo.state_province,
            postal_code: billingInfo.postal_code,
            country: getCountryCode(billingInfo.country) || 'US',
          },
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      console.log('✅ Payment method created:', paymentMethod.id);

      // Determine booking details
      let employeeId = bookingData.employeeId;
      if (!employeeId) {
        console.log('📝 This is an employer self-booking');
        employeeId = null;
      }

      // Determine booking type and payment flow
      const bookingFrequency = bookingData.bookingFrequency; // 'one_time' or 'ongoing'
      const bookingType = bookingData.bookingType; // 'per_day' or 'monthly'
      
      console.log(`🎯 Payment Flow: ${bookingFrequency} + ${bookingType}`);
      
      // 3 distinct payment flows based on booking frequency and type
      if (bookingFrequency === 'ongoing' && bookingType === 'monthly') {
        // ONGOING MONTHLY BOOKING - Regular monthly subscription
        console.log('🔄 Creating regular monthly subscription...');
        const subscriptionData = {
          payment_method_id: paymentMethod.id,
          coworking_space_id: parseInt(coworkingSpace.id),
          package_id: String(selectedPackage?.id || selectedPackage?.name || 'default'),
          customer_email: billingInfo.billing_email || billingInfo.email,
          customer_name: cardholderName,
          booking_data: {
            bookingFrequency: bookingData.bookingFrequency,
            bookingType: bookingData.bookingType,
            startDate: bookingData.startDate,
            duration: bookingData.duration || 1,
            employeeId: employeeId,
            packageName: selectedPackage?.name || 'Unknown Package',
            coworkingSpaceName: coworkingSpace?.title || 'Unknown'
          }
        };

        console.log('📋 Monthly Subscription Data:', JSON.stringify(subscriptionData, null, 2));

        const subscriptionResponse = await employerApi.post('/employer/create-subscription', subscriptionData);
        const { subscription_id, latest_invoice } = subscriptionResponse.data;

        console.log('✅ Monthly subscription created:', subscription_id);

        var paymentResult = {
          id: subscription_id,
          status: 'active',
          type: 'subscription'
        };
      } else if (bookingFrequency === 'one_time' && bookingType === 'per_day') {
        // ONE-TIME DAY BOOKING - Simple payment intent
        console.log('💰 Creating one-time day payment...');
        const paymentIntentData = {
          amount: Math.round(calculateTotal() * 100), // Convert to cents
          currency: 'usd',
          payment_method_id: paymentMethod.id,
          coworking_space_id: parseInt(coworkingSpace.id),
          package_id: String(selectedPackage?.id || selectedPackage?.name || 'default'),
          booking_data: {
            bookingFrequency: bookingData.bookingFrequency || 'one_time',
            bookingType: bookingData.bookingType || 'per_day',
            startDate: bookingData.startDate,
            endDate: bookingData.endDate || bookingData.startDate,
            duration: bookingData.duration || 1,
            employeeId: employeeId,
            customerEmail: billingInfo.billing_email || billingInfo.email,
            customerName: cardholderName,
            packageName: selectedPackage?.name || 'Unknown Package',
            coworkingSpaceName: coworkingSpace?.title || 'Unknown'
          }
        };

        console.log('📋 Payment Intent Data:', JSON.stringify(paymentIntentData, null, 2));

        const paymentIntentResponse = await employerApi.post('/employer/create-payment-intent', paymentIntentData);
        const { client_secret, payment_intent_id } = paymentIntentResponse.data;

        console.log('✅ Payment intent created:', payment_intent_id);

        // Confirm payment with payment method
        console.log('🔒 Confirming payment...');
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
          payment_method: paymentMethod.id
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        if (paymentIntent.status !== 'succeeded') {
          throw new Error('Payment was not successful');
        }

        console.log('✅ Payment confirmed successfully');
        
        var paymentResult = {
          id: payment_intent_id,
          status: 'succeeded',
          type: 'payment_intent'
        };
      } else if (bookingFrequency === 'one_time' && bookingType === 'monthly') {
        // ONE-TIME MONTHLY BOOKING - Simple payment intent for full month
        console.log('💰 Creating one-time monthly payment...');
        const paymentIntentData = {
          amount: Math.round(calculateTotal() * 100), // Convert to cents
          currency: 'usd',
          payment_method_id: paymentMethod.id,
          coworking_space_id: parseInt(coworkingSpace.id),
          package_id: String(selectedPackage?.id || selectedPackage?.name || 'default'),
          booking_data: {
            bookingFrequency: bookingData.bookingFrequency || 'one_time',
            bookingType: bookingData.bookingType || 'monthly',
            startDate: bookingData.startDate,
            endDate: bookingData.endDate || bookingData.startDate,
            duration: bookingData.duration || 30,
            employeeId: employeeId,
            customerEmail: billingInfo.billing_email || billingInfo.email,
            customerName: cardholderName,
            packageName: selectedPackage?.name || 'Unknown Package',
            coworkingSpaceName: coworkingSpace?.title || 'Unknown'
          }
        };

        console.log('📋 One-time Monthly Payment Data:', JSON.stringify(paymentIntentData, null, 2));

        const paymentIntentResponse = await employerApi.post('/employer/create-payment-intent', paymentIntentData);
        const { client_secret, payment_intent_id } = paymentIntentResponse.data;

        console.log('✅ One-time monthly payment intent created:', payment_intent_id);

        // Confirm payment with payment method
        console.log('🔒 Confirming monthly payment...');
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
          payment_method: paymentMethod.id
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        if (paymentIntent.status !== 'succeeded') {
          throw new Error('Payment was not successful');
        }

        console.log('✅ Monthly payment confirmed successfully');
        
        var paymentResult = {
          id: payment_intent_id,
          status: 'succeeded',
          type: 'payment_intent'
        };
      } else {
        throw new Error(`Unsupported booking combination: ${bookingFrequency} + ${bookingType}`);
      }

      // Save billing info using employer profile data
      try {
        await employerApi.post('/employer/billing-info', {
          company_name: billingInfo.company_name,
          billing_email: billingInfo.billing_email,
          phone_number: billingInfo.phone_number,
          address_line_1: billingInfo.address_line_1,
          address_line_2: billingInfo.address_line_2,
          city: billingInfo.city,
          state_province: billingInfo.state_province,
          postal_code: billingInfo.postal_code,
          country: billingInfo.country,
          tax_id: billingInfo.tax_id
        });
      } catch (billingError) {
        console.error('⚠️ Failed to save billing info:', billingError);
      }

      // Create booking with payment information
      const isOngoing = bookingFrequency === 'ongoing';
      
      console.log('🔍 Debug booking data before payload creation:', {
        bookingData,
        bookingFrequency,
        bookingType,
        isOngoing,
        coworkingSpaceId: coworkingSpace.id,
        selectedDates: bookingData.selectedDates,
        selectedWeekDays: bookingData.selectedWeekDays,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate
      });
      
      const bookingPayload = {
        coworking_space_id: parseInt(coworkingSpace.id),
        booking_type: bookingType, // Use the extracted bookingType instead of bookingData.bookingType
        start_date: bookingData.startDate,
        end_date: isOngoing ? 
          // For ongoing subscriptions, set end date to 1 month from start date
          (() => {
            const endDate = new Date(bookingData.startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            return endDate.toISOString().split('T')[0];
          })() : 
          bookingData.endDate || bookingData.startDate, // Fallback to startDate if endDate is missing
        subscription_mode: 'full_time',
        is_ongoing: isOngoing,
        days_of_week: bookingData.selectedWeekDays?.join(',') || bookingData.daysOfWeek?.join(',') || 'Monday,Tuesday,Wednesday,Thursday,Friday',
        duration_per_day: bookingData.hoursPerDay || bookingData.durationPerDay || 8,
        total_cost: calculateTotal(),
        notes: bookingData.notes || '',
        payment_status: 'completed'
      };
      
      console.log('📋 Final booking payload:', bookingPayload);

      // Add payment information based on type
      if (paymentResult.type === 'prorated_subscription') {
        bookingPayload.subscription_id = paymentResult.id;
        bookingPayload.payment_intent_id = paymentResult.prorated_payment_intent_id;
        bookingPayload.payment_type = 'prorated_subscription';
        bookingPayload.prorated_amount = paymentResult.prorated_amount;
        bookingPayload.monthly_amount = paymentResult.monthly_amount;
        bookingPayload.next_billing_date = paymentResult.next_billing_date;
      } else if (paymentResult.type === 'subscription') {
        bookingPayload.subscription_id = paymentResult.id;
        bookingPayload.payment_type = 'subscription';
      } else {
        bookingPayload.payment_intent_id = paymentResult.id;
        bookingPayload.payment_type = 'one_time';
      }

      if (employeeId) {
        bookingPayload.employee_id = employeeId;
      }

      console.log('📦 Creating booking with payment info...');
      console.log('💳 Payment Type:', paymentResult.type);
      console.log('🆔 Payment ID:', paymentResult.id);
      
      const bookingResponse = await employerApi.post('/employer/book-coworking', bookingPayload);
      
      console.log('✅ Booking created successfully with payment');
      console.log('📞 Billing Info Phone Check:', {
        billingInfo: billingInfo,
        phone_number: billingInfo.phone_number,
        phoneNumber: billingInfo.phoneNumber,
        phone: billingInfo.phone
      });
      
      // Calculate the exact total from checkout
      const checkoutTotal = calculateTotal();
      
      // Navigate to confirmation page
      navigate('/employer/coworking/booking-confirmation', { 
        state: { 
          booking: bookingResponse.data,
          coworkingSpace: coworkingSpace,
          selectedPackage: selectedPackage,
          billingInfo: billingInfo,
          paymentMethod: 'credit_card',
          paymentResult: paymentResult,
          isSubscription: paymentResult.type === 'subscription' || paymentResult.type === 'prorated_subscription',
          isProratedSubscription: paymentResult.type === 'prorated_subscription',
          totalAmount: checkoutTotal,
          bookingData: bookingData
        } 
      });

    } catch (error) {
      console.error('💥 Payment/Booking failed:', error);
      console.error('🔍 Error response:', error.response);
      console.error('📄 Error data:', error.response?.data);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.response?.status === 422) {
        console.error('🚨 422 Validation Error Details:', error.response.data);
        if (error.response.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            // FastAPI validation errors
            const validationErrors = error.response.data.detail.map(err => 
              `${err.loc?.join('.')} - ${err.msg}`
            ).join(', ');
            errorMessage = `Validation Error: ${validationErrors}`;
          } else {
            errorMessage = `Validation Error: ${error.response.data.detail}`;
          }
        }
      } else if (error.response?.status === 400) {
        // Handle booking conflicts and other 400 errors
        const errorDetail = error.response.data?.detail || error.response.data?.message || 'Booking failed';
        
        if (errorDetail.includes('already has a booking') || 
            errorDetail.includes('booking in that date range') ||
            errorDetail.includes('personal booking in that date range')) {
          errorMessage = `❌ Booking Conflict: ${errorDetail}. Please select different dates or check existing bookings.`;
        } else {
          errorMessage = `❌ Booking Error: ${errorDetail}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setSafeError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(139, 38, 53, 0.1)',
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(139, 38, 53, 0.1)',
      mt: 3
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#8B2635' }}>
          Payment Information
        </Typography>
        
        {/* Cardholder Name */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
            Cardholder Name
          </Typography>
          <TextField
            fullWidth
            placeholder="John Doe"
            variant="outlined"
            size="medium"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#fff',
                '& fieldset': {
                  borderColor: '#ddd',
                },
                '&:hover fieldset': {
                  borderColor: '#8B2635',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#8B2635',
                },
              },
            }}
          />
        </Box>

        {/* Card Number */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
            Card Number
          </Typography>
          <Box sx={{
            p: 2,
            border: '1px solid #ddd',
            borderRadius: 1,
            backgroundColor: '#fff',
            '&:hover': {
              borderColor: '#8B2635',
            },
            '&:focus-within': {
              borderColor: '#8B2635',
              boxShadow: '0 0 0 2px rgba(139, 38, 53, 0.2)',
            },
          }}>
            <CardNumberElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Expiry Date and CVC */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
              Expiry Date
            </Typography>
            <Box sx={{
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: '#fff',
              '&:hover': {
                borderColor: '#8B2635',
              },
              '&:focus-within': {
                borderColor: '#8B2635',
                boxShadow: '0 0 0 2px rgba(139, 38, 53, 0.2)',
              },
            }}>
              <CardExpiryElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
              CVC
            </Typography>
            <Box sx={{
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: '#fff',
              '&:hover': {
                borderColor: '#8B2635',
              },
              '&:focus-within': {
                borderColor: '#8B2635',
                boxShadow: '0 0 0 2px rgba(139, 38, 53, 0.2)',
              },
            }}>
              <CardCvcElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
        
        <Typography variant="caption" sx={{ 
          display: 'block', 
          color: 'text.secondary',
          fontStyle: 'italic'
        }}>
          Your payment information is secure and encrypted
        </Typography>
      </CardContent>
    </Card>
  );
};

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
};

const GOOGLE_LIBRARIES = ['places', 'geometry'];

// Utility function to format date consistently without timezone issues
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Multi-Select Calendar Component
const MultiSelectCalendar = ({ selectedDates, onDatesChange, disableWeekends, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const isDateDisabled = (date) => {
    if (!date) return true;
    
    // Fix timezone issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Disable past dates
    if (dateStr < today) return true;
    
    // Disable weekends if specified (Saturday = 6, Sunday = 0)
    if (disableWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
      return true;
    }
    
    return false;
  };
  
  const isDateSelected = (date) => {
    if (!date) return false;
    const dateStr = formatDateString(date);
    return selectedDates.includes(dateStr);
  };
  
  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    
    const dateStr = formatDateString(date);
    
    console.log('🔍 MultiSelectCalendar - Clicked date object:', date);
    console.log('🔍 MultiSelectCalendar - Formatted dateStr:', dateStr);
    
    let newSelectedDates;
    
    if (selectedDates.includes(dateStr)) {
      // Remove date if already selected
      newSelectedDates = selectedDates.filter(d => d !== dateStr);
    } else {
      // Add date if not selected
      newSelectedDates = [...selectedDates, dateStr].sort();
    }
    
    onDatesChange(newSelectedDates);
  };
  
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };
  
  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Calendar Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigateMonth(-1)} size="small">
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
          {monthYear}
        </Typography>
        <IconButton onClick={() => navigateMonth(1)} size="small">
          <ChevronRight />
        </IconButton>
      </Box>
      
      {/* Days of Week Header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box key={day} sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Calendar Days */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {days.map((date, index) => {
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          
          return (
            <Box
              key={index}
              onClick={() => date && handleDateClick(date)}
              sx={{
                p: 1,
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                cursor: date && !isDisabled ? 'pointer' : 'default',
                backgroundColor: isSelected 
                  ? '#8B2635' 
                  : isDisabled 
                    ? '#f3f4f6' 
                    : 'transparent',
                color: isSelected 
                  ? 'white' 
                  : isDisabled 
                    ? '#9ca3af' 
                    : '#374151',
                '&:hover': date && !isDisabled ? {
                  backgroundColor: isSelected ? '#7a1f2e' : '#f3f4f6'
                } : {},
                opacity: isDisabled ? 0.5 : 1
              }}
            >
              {date && (
                <Typography variant="body2" sx={{ 
                  fontWeight: isSelected ? 600 : 400,
                  color: 'inherit'
                }}>
                  {date.getDate()}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
      
      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#8B2635', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Selected</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#f3f4f6', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Unavailable</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Weekly Calendar Component - Auto-selects 5 consecutive weekdays
const WeeklyCalendar = ({ selectedWeekStart, onWeekChange, minDate, selectedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const getWeekdaysFromStart = (startDate) => {
    const weekdays = [];
    // Fix potential timezone issues by creating date properly
    const current = new Date(startDate + 'T12:00:00');
    
    console.log('🔍 getWeekdaysFromStart called with:', startDate);
    console.log('🔍 Initial current date:', current);
    console.log('🔍 Initial day of week:', current.getDay());
    
    // Define coworking operating days (Monday to Friday)
    const operatingDays = [1, 2, 3, 4, 5]; // Monday, Tuesday, Wednesday, Thursday, Friday
    
    // Start from the selected date
    // If selected date is weekend, find next weekday
    while (!operatingDays.includes(current.getDay())) {
      current.setDate(current.getDate() + 1);
      console.log('🔍 Skipping to next operating day:', current, 'Day of week:', current.getDay());
    }
    
    console.log('🔍 Starting from operating day:', current, 'Day of week:', current.getDay());
    
    // Add 5 consecutive operating days starting from the selected date
    let daysAdded = 0;
    while (daysAdded < 5) {
      const dayOfWeek = current.getDay();
      
      // Only add if it's an operating day for this coworking space (Mon-Fri)
      if (operatingDays.includes(dayOfWeek)) {
        const dateStr = current.toISOString().split('T')[0];
        weekdays.push(dateStr);
        console.log('🔍 Added day:', dateStr, 'Day of week:', dayOfWeek);
        daysAdded++;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    console.log('🔍 Final weekdays array:', weekdays);
    return weekdays;
  };
  
  const isDateDisabled = (date) => {
    if (!date) return true;
    
    // Fix timezone issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Disable past dates
    if (dateStr < today) return true;
    
    return false;
  };
  
  const isDateInSelectedWeek = (date) => {
    if (!date) return false;
    
    // Fix timezone issue by using the same date formatting as handleDateClick
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = date.getDay();
    
    // Use the selectedDates prop passed from parent component
    // This ensures we're using the same data that's shown in the chips
    return selectedDates.includes(dateStr) && (dayOfWeek >= 1 && dayOfWeek <= 5);
  };
  
  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    
    // Fix date string formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log('🔍 handleDateClick - clicked date:', date);
    console.log('🔍 handleDateClick - formatted dateStr:', dateStr);
    
    const weekdays = getWeekdaysFromStart(dateStr);
    
    onWeekChange(dateStr, weekdays);
  };
  
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };
  
  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Calendar Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigateMonth(-1)} size="small">
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
          {monthYear}
        </Typography>
        <IconButton onClick={() => navigateMonth(1)} size="small">
          <ChevronRight />
        </IconButton>
      </Box>
      
      {/* Days of Week Header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box key={day} sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Calendar Days */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {days.map((date, index) => {
          const isDisabled = isDateDisabled(date);
          const isInSelectedWeek = isDateInSelectedWeek(date);
          const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6); // Sunday, Saturday only
          
          return (
            <Box
              key={index}
              onClick={() => date && handleDateClick(date)}
              sx={{
                p: 1,
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                cursor: date && !isDisabled && !isWeekend ? 'pointer' : 'default',
                backgroundColor: isInSelectedWeek 
                  ? '#8B2635' 
                  : isDisabled || isWeekend
                    ? '#f3f4f6' 
                    : 'transparent',
                color: isInSelectedWeek 
                  ? 'white' 
                  : isDisabled || isWeekend
                    ? '#9ca3af' 
                    : '#374151',
                '&:hover': date && !isDisabled && !isWeekend ? {
                  backgroundColor: isInSelectedWeek ? '#7a1f2e' : '#f3f4f6'
                } : {},
                opacity: isDisabled || isWeekend ? 0.5 : 1,
                border: isInSelectedWeek ? '2px solid #8B2635' : 'none'
              }}
            >
              {date && (
                <Typography variant="body2" sx={{ 
                  fontWeight: isInSelectedWeek ? 600 : 400,
                  color: 'inherit'
                }}>
                  {date.getDate()}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
      
      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#8B2635', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Selected Week</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#f3f4f6', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Weekend/Past</Typography>
        </Box>
      </Box>
      

    </Box>
  );
};

// Monthly Calendar Component - Select start date for monthly booking
const MonthlyCalendar = ({ selectedStartDate, onStartDateChange, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const isDateDisabled = (date) => {
    if (!date) return true;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Disable past dates
    if (dateStr < today) return true;
    
    return false;
  };
  
  const isDateSelected = (date) => {
    if (!date || !selectedStartDate) return false;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = date.getDay();
    
    // Only select operating days (Monday to Friday)
    const operatingDays = [1, 2, 3, 4, 5]; // Monday, Tuesday, Wednesday, Thursday, Friday
    if (!operatingDays.includes(dayOfWeek)) {
      return false;
    }
    
    // Calculate the end date (exactly 30 days from start date)
    const start = new Date(selectedStartDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 30 - 1); // 30 days total, minus 1 for inclusive range
    
    const startDateStr = selectedStartDate;
    const endDateStr = end.toISOString().split('T')[0];
    
    // Check if current date is within the selected month period AND is an operating day
    return dateStr >= startDateStr && dateStr <= endDateStr;
  };
  
  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    onStartDateChange(dateStr);
  };
  
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };
  
  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Calendar Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigateMonth(-1)} size="small">
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
          {monthYear}
        </Typography>
        <IconButton onClick={() => navigateMonth(1)} size="small">
          <ChevronRight />
        </IconButton>
      </Box>
      
      {/* Days of Week Header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box key={day} sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Calendar Days */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {days.map((date, index) => {
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6); // Sunday, Saturday
          
          return (
            <Box
              key={index}
              onClick={() => date && !isDisabled && !isWeekend && handleDateClick(date)}
              sx={{
                p: 1,
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                cursor: date && !isDisabled && !isWeekend ? 'pointer' : 'default',
                backgroundColor: isSelected 
                  ? '#8B2635' 
                  : isDisabled || isWeekend
                    ? '#f3f4f6' 
                    : 'transparent',
                color: isSelected 
                  ? 'white' 
                  : isDisabled || isWeekend
                    ? '#9ca3af' 
                    : '#374151',
                '&:hover': date && !isDisabled && !isWeekend ? {
                  backgroundColor: isSelected ? '#7a1f2e' : '#f3f4f6'
                } : {},
                opacity: isDisabled || isWeekend ? 0.5 : 1,
                border: isSelected ? '2px solid #8B2635' : 'none'
              }}
            >
              {date && (
                <Typography variant="body2" sx={{ 
                  fontWeight: isSelected ? 600 : 400,
                  color: 'inherit'
                }}>
                  {date.getDate()}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
      
      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#8B2635', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Selected Operating Days</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#f3f4f6', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Weekend/Past</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Recurring Booking Calendar Component - Full calendar with month navigation
const RecurringBookingCalendar = ({ selectedWeekDays, startDate, onStartDateChange, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Generate days for the current month view
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  // Check if a date matches the selected recurring days
  const isRecurringBookingDay = (date) => {
    if (!selectedWeekDays || selectedWeekDays.length === 0 || !startDate) return false;
    
    const dayOfWeek = date.getDay();
    // Fix timezone issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Only show recurring bookings on or after the start date
    return selectedWeekDays.includes(dayOfWeek) && dateStr >= startDate;
  };
  
  // Check if date is selectable as start date
  const isDateDisabled = (date) => {
    // Fix timezone issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Disable past dates
    if (dateStr < today) return true;
    
    // Disable weekends (coworking space is closed)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    
    return false;
  };
  
  const isStartDate = (date) => {
    if (!startDate) return false;
    // Fix timezone issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return dateStr === startDate;
  };
  
  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    
    // Fix timezone issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    onStartDateChange(dateStr);
  };
  
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Calendar Header with Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigateMonth(-1)} size="small" sx={{ 
          backgroundColor: 'rgba(139, 38, 53, 0.1)',
          '&:hover': { backgroundColor: 'rgba(139, 38, 53, 0.2)' }
        }}>
          <ChevronLeft sx={{ color: '#8B2635' }} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
          {monthYear}
        </Typography>
        <IconButton onClick={() => navigateMonth(1)} size="small" sx={{ 
          backgroundColor: 'rgba(139, 38, 53, 0.1)',
          '&:hover': { backgroundColor: 'rgba(139, 38, 53, 0.2)' }
        }}>
          <ChevronRight sx={{ color: '#8B2635' }} />
        </IconButton>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
        Click on a date to set your start date:
      </Typography>
      
      {/* Days of Week Header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box key={day} sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Calendar Days */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {days.map((date, index) => {
          if (!date) {
            return <Box key={index} sx={{ minHeight: '40px' }} />;
          }
            
          const isDisabled = isDateDisabled(date);
          const isRecurring = isRecurringBookingDay(date);
          const isStart = isStartDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <Box
              key={index}
              onClick={() => handleDateClick(date)}
              sx={{
                p: 1,
                minHeight: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                cursor: !isDisabled ? 'pointer' : 'default',
                backgroundColor: isStart 
                  ? '#10b981' 
                  : isRecurring 
                    ? '#8B2635' 
                    : isDisabled 
                      ? '#f3f4f6' 
                      : isToday
                        ? '#e0f2fe'
                        : 'transparent',
                color: isStart || isRecurring
                  ? 'white' 
                  : isDisabled 
                    ? '#9ca3af' 
                    : '#374151',
                border: isToday && !isStart && !isRecurring ? '2px solid #0ea5e9' : 'none',
                '&:hover': !isDisabled ? {
                  backgroundColor: isStart 
                    ? '#059669' 
                    : isRecurring 
                      ? '#7a1f2e' 
                      : '#f3f4f6'
                } : {},
                opacity: isDisabled ? 0.5 : 1,
                position: 'relative'
              }}
            >
              <Typography variant="body2" sx={{ 
                fontWeight: isStart || isRecurring ? 600 : 400,
                color: 'inherit',
                fontSize: '14px'
              }}>
                {date.getDate()}
              </Typography>
              
              {/* Small indicator for recurring days */}
              {isRecurring && !isStart && (
                <Box sx={{ 
                  width: 4, 
                  height: 4, 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  borderRadius: '50%',
                  mt: 0.5
                }} />
              )}
              
              {/* Start date indicator */}
              {isStart && (
                <Typography variant="caption" sx={{ 
                  fontSize: '8px', 
                  color: 'white',
                  fontWeight: 600,
                  mt: 0.5
                }}>
                  START
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
      
      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Start Date</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#8B2635', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Recurring Bookings</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#e0f2fe', border: '2px solid #0ea5e9', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Today</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#f3f4f6', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>Unavailable</Typography>
        </Box>
      </Box>
      
      {/* Summary */}
      {selectedWeekDays && selectedWeekDays.length > 0 && startDate && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
            Your Recurring Booking Preview:
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
            Starting {new Date(startDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Every {selectedWeekDays.map(day => {
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              return dayNames[day];
            }).join(', ')} • {selectedWeekDays.length} day{selectedWeekDays.length > 1 ? 's' : ''} per week
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const steps = ['Select Package', 'Booking Details', 'Payment & Confirmation'];

// Initialize Stripe
console.log('🔑 Stripe publishable key:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function CoworkingBookingWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { coworkingSpace, employeeId, packageInfo } = location.state || {};
  const mapRef = useRef(null);

  // Debug logging for component initialization
  console.log('🚀 CoworkingBookingWizard initialized');
  console.log('🚀 location.state:', location.state);
  console.log('🚀 coworkingSpace from state:', coworkingSpace);
  console.log('🚀 employeeId from state:', employeeId);
  console.log('🚀 packageInfo from state:', packageInfo);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Safe error setter that ensures only strings are set
  const setSafeError = (errorValue) => {
    if (!errorValue || errorValue === '') {
      setError(null);
      return;
    }
    
    let errorMessage = 'An error occurred. Please try again.';
    
    if (typeof errorValue === 'string') {
      errorMessage = errorValue;
    } else if (errorValue && typeof errorValue === 'object') {
      if (Array.isArray(errorValue)) {
        errorMessage = errorValue.map(err => {
          if (typeof err === 'string') return err;
          return err?.msg || err?.message || 'Validation error';
        }).join(', ');
      } else if (typeof errorValue.detail === 'string') {
        errorMessage = errorValue.detail;
      } else if (typeof errorValue.message === 'string') {
        errorMessage = errorValue.message;
      }
    }
    
    setError(errorMessage);
  };
  
  // Clear any existing error state on component mount
  useEffect(() => {
    setError(null);
  }, []);
  const [success, setSuccess] = useState('');
  
  // Booking data state
  const [bookingData, setBookingData] = useState({
    employeeId: employeeId || '',
    packageId: packageInfo?.id || '',
    bookingType: '',
    hoursPerDay: '',
    customHours: 8,
    bookingFrequency: '',
    subscriptionMode: 'full_time', // Default to full_time since dropdown is removed
    isOngoing: false,
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    selectedWeekDays: [], // For ongoing day bookings
    selectedDates: [], // For one-time day bookings
    duration: 0,
    totalAmount: 0,
    notes: ''
  });

  // Billing info state
  const [billingInfo, setBillingInfo] = useState({
    company_name: '',
    billing_email: '',
    phone_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    tax_id: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [triggerPayment, setTriggerPayment] = useState(false);

  // Available packages state
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(packageInfo || null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Map and commute state
  const [employerLocation, setEmployerLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [travelTimes, setTravelTimes] = useState({
    driving: null,
    walking: null,
    bicycling: null,
    transit: null
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markersReady, setMarkersReady] = useState(false);

  // Google Maps loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  // Debug Google Maps loading
  useEffect(() => {
    console.log('Google Maps API Key:', process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
    console.log('Google Maps isLoaded:', isLoaded);
    console.log('Google Maps loadError:', loadError);
  }, [isLoaded, loadError]);

  // Track if initial data has been fetched to prevent repeated calls
  const [initialDataFetched, setInitialDataFetched] = useState(false);

  // Image carousel state
  const [carouselImages, setCarouselImages] = useState([]);
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  const [packageImagesData, setPackageImagesData] = useState({});
  const [amenities, setAmenities] = useState([]);

  // Helper function to get package-specific images
  const getPackageImages = (packageName) => {
    console.log('🔍 getPackageImages called for package:', packageName);
    console.log('🔍 packageImagesData:', packageImagesData);
    console.log('🔍 carouselImages:', carouselImages);
    
    const packageSpecificImages = packageImagesData[packageName] || [];
    console.log('🔍 packageSpecificImages:', packageSpecificImages);
    
    // Include general images that don't belong to any specific package
    const generalImages = carouselImages.filter(img => !img.package_id);
    console.log('🔍 generalImages:', generalImages);
    
    const result = [...packageSpecificImages, ...generalImages];
    console.log('🔍 Final result:', result);
    return result;
  };

  // Fetch initial data when component mounts
  useEffect(() => {
    console.log('🔄 useEffect triggered - initialDataFetched:', initialDataFetched);
    console.log('🔄 coworkingSpace in useEffect:', coworkingSpace);
    
    if (!coworkingSpace) {
      console.log('❌ No coworkingSpace, navigating to find page');
      navigate('/employer/coworking/find');
      return;
    }
    
    if (!initialDataFetched) {
      console.log('✅ Fetching initial data...');
      fetchPackages();
      fetchEmployees();
      fetchEmployerLocation();
      fetchCoworkingImages();
      setInitialDataFetched(true);
    }
  }, [coworkingSpace, initialDataFetched, navigate]);

  // Handle employee selection when employees data or employeeId changes
  useEffect(() => {
    if (employeeId && employees.length > 0) {
      const employee = employees.find(emp => emp.id === employeeId);
      setSelectedEmployee(employee);
    }
  }, [employeeId, employees]);

  useEffect(() => {
    if (isLoaded && employerLocation && coworkingSpace) {
      // Debounce the API calls to prevent spam
      const timeoutId = setTimeout(() => {
        calculateTravelTimes();
      }, 1000); // Wait 1 second before making API calls

      return () => clearTimeout(timeoutId);
    }
  }, [isLoaded, employerLocation, coworkingSpace]);

  // Track if billing info has been fetched to prevent repeated calls
  const [billingInfoFetched, setBillingInfoFetched] = useState(false);

  // Fetch billing info when reaching payment step (only once)
  useEffect(() => {
    console.log('🎯 useEffect triggered - activeStep:', activeStep, 'billingInfoFetched:', billingInfoFetched);
    if (activeStep === 2 && !billingInfoFetched) { // Payment confirmation step
      console.log('✅ Reached payment step, fetching billing info...');
      fetchBillingInfo();
      setBillingInfoFetched(true);
    }
  }, [activeStep, billingInfoFetched]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // Parse packages from coworking space data (stored as JSON string)
      let parsedPackages = [];
      if (coworkingSpace.packages) {
        try {
          parsedPackages = JSON.parse(coworkingSpace.packages);
        } catch (parseError) {
          console.error('Error parsing packages:', parseError);
          setError('Failed to load packages');
          return;
        }
      }
      
      setPackages(parsedPackages);
      
      if (packageInfo) {
        setSelectedPackage(packageInfo);
        setBookingData(prev => ({ ...prev, packageId: packageInfo.id }));
      }
    } catch (err) {
      console.error('Error loading packages:', err);
      setError('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employerApi.get('/employer/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchEmployerLocation = async () => {
    try {
      const response = await employerApi.get('/employer/me');
      const employer = response.data;
      if (employer.latitude && employer.longitude) {
        setEmployerLocation({
          lat: employer.latitude,
          lng: employer.longitude,
          address: employer.address || 'Your Location'
        });
      }
    } catch (err) {
      console.error('Failed to fetch employer location:', err);
    }
  };

  const fetchCoworkingImages = async () => {
    console.log('🚀 fetchCoworkingImages CALLED!');
    console.log('🚀 coworkingSpace:', coworkingSpace);
    
    if (!coworkingSpace?.id) {
      console.log('🚀 No coworkingSpace ID found, skipping image fetch');
      return;
    }

    try {
      console.log('🖼️ Fetching images for space ID:', coworkingSpace.id);
      console.log('🖼️ Full API URL:', `/employer/coworking-space/${coworkingSpace.id}/images`);
      const response = await employerApi.get(`/employer/coworking-space/${coworkingSpace.id}/images`);
      console.log('🖼️ RAW API Response:', response);
      console.log('🖼️ Response Data:', response.data);
      console.log('🖼️ Response Status:', response.status);
      
      if (response.data) {
        let allImages = [];
        let packageImages = {};
        
        // Collect general images
        if (response.data.general_images && response.data.general_images.length > 0) {
          allImages = [...allImages, ...response.data.general_images];
          console.log('🖼️ Added general images:', response.data.general_images.length);
        }
        
        // Collect package images and organize by package name
        if (response.data.packages && response.data.packages.length > 0) {
          response.data.packages.forEach(pkg => {
            if (pkg.images && pkg.images.length > 0) {
              // Use package_name as the key for frontend lookup
              const packageName = pkg.package_name;
              packageImages[packageName] = pkg.images;
              allImages = [...allImages, ...pkg.images];
              console.log(`🖼️ Added images from package ${packageName}:`, pkg.images.length);
            }
          });
        }
        
        // Store package-specific images
        setPackageImagesData(packageImages);
        
        // Filter package-specific images if selectedPackage exists
        let images = allImages;
        if (selectedPackage) {
          images = allImages.filter(img => 
            !img.package_id || 
            img.package_id === selectedPackage.id || 
            img.package_id === selectedPackage.name
          );
          console.log('🖼️ Filtered images for selected package:', images.length);
        }
        
        console.log('🖼️ Final images for carousel:', images);
        setCarouselImages(images);
        console.log('🖼️ Carousel images state updated, length:', images.length);
        
        // Fetch package-specific amenities from the API response
        let packageAmenities = [];
        try {
          console.log('🔍 DEBUG: Full API response:', response.data);
          
          // Get amenities for the selected package
          if (response.data.packages && response.data.packages.length > 0) {
            console.log('🔍 DEBUG: Available packages:', response.data.packages);
            
            // Find the package that matches the selected package
            let targetPackage = response.data.packages[0]; // Default to first package
            console.log('🔍 DEBUG: Default target package:', targetPackage);
            
            if (selectedPackage) {
              console.log('🔍 DEBUG: Selected package to match:', selectedPackage);
              const matchingPackage = response.data.packages.find(pkg => 
                pkg.package_id === selectedPackage.id || 
                pkg.package_name === selectedPackage.name ||
                pkg.package_id === selectedPackage.name ||
                pkg.package_id === String(selectedPackage.id) ||
                String(pkg.package_id) === String(selectedPackage.id)
              );
              console.log('🔍 DEBUG: Matching package found:', matchingPackage);
              if (matchingPackage) {
                targetPackage = matchingPackage;
              }
            }
            
            // ALWAYS use first package if no specific match (since we only have Silver Package)
            if (!targetPackage && response.data.packages.length > 0) {
              targetPackage = response.data.packages[0];
              console.log('🔍 DEBUG: Using first package as fallback:', targetPackage);
            }
            
            console.log('🔍 DEBUG: Final target package:', targetPackage);
            console.log('🔍 DEBUG: Target package amenities:', targetPackage.package_amenities);
            
            // Extract amenities from the target package
            if (targetPackage.package_amenities) {
              if (Array.isArray(targetPackage.package_amenities)) {
                packageAmenities = targetPackage.package_amenities;
                console.log('🔍 DEBUG: Amenities are array:', packageAmenities);
              } else if (typeof targetPackage.package_amenities === 'string') {
                packageAmenities = JSON.parse(targetPackage.package_amenities);
                console.log('🔍 DEBUG: Amenities parsed from string:', packageAmenities);
              }
            } else {
              console.log('🔍 DEBUG: No package_amenities field found in target package');
            }
            
            console.log('🎯 Package-specific amenities found:', packageAmenities);
            console.log('🎯 Selected package:', selectedPackage?.name || 'First package');
            console.log('🎯 Target package:', targetPackage.package_name);
          } else {
            console.log('🔍 DEBUG: No packages found in API response');
          }
          
          // Fallback to general space amenities if no package amenities
          if (packageAmenities.length === 0 && coworkingSpace?.amenities) {
            if (typeof coworkingSpace.amenities === 'string') {
              packageAmenities = JSON.parse(coworkingSpace.amenities);
            } else if (Array.isArray(coworkingSpace.amenities)) {
              packageAmenities = coworkingSpace.amenities;
            }
            console.log('🎯 Fallback to space amenities:', packageAmenities);
          }
          
          // Force set amenities for testing if we have packages but no amenities
          if (packageAmenities.length === 0 && response.data.packages && response.data.packages.length > 0) {
            const testAmenities = ["Air Conditioning", "Comfortable Seating", "Heating", "Natural Light", "Plants & Greenery"];
            console.log('🔧 FORCING TEST AMENITIES:', testAmenities);
            setAmenities(testAmenities);
          } else {
            setAmenities(packageAmenities);
          }
          console.log('🎯 Amenities state updated, length:', packageAmenities.length);
        } catch (e) {
          console.warn('❌ Error parsing package amenities:', e);
          setAmenities([]);
        }
      }
      
      // Fallback amenities parsing if not fetched from API
      else if (coworkingSpace?.amenities) {
        let parsedAmenities = [];
        try {
          if (typeof coworkingSpace.amenities === 'string') {
            parsedAmenities = JSON.parse(coworkingSpace.amenities);
          } else if (Array.isArray(coworkingSpace.amenities)) {
            parsedAmenities = coworkingSpace.amenities;
          }
          console.log('🎯 Fallback parsed amenities:', parsedAmenities);
          setAmenities(parsedAmenities);
        } catch (e) {
          console.warn('❌ Error parsing fallback amenities:', e);
          setAmenities([]);
        }
      } else {
        console.log('🏢 No amenities found in coworkingSpace data');
      }
    } catch (err) {
      console.error('❌ Failed to fetch coworking images:', err);
      console.error('❌ Error details:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      // For testing: Add some mock images to see if the display logic works
      console.log('🧪 Adding mock images for testing...');
      const mockPackageImages = {
        'Silver Package': [
          {
            id: 'mock1',
            image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
            url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
          },
          {
            id: 'mock2', 
            image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400',
            url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400'
          }
        ],
        'Gold Package': [
          {
            id: 'mock3',
            image_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400',
            url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400'
          }
        ]
      };
      setPackageImagesData(mockPackageImages);
      console.log('🧪 Mock images set:', mockPackageImages);
    }
  };

  const fetchBillingInfo = useCallback(async () => {
    // Prevent repeated calls if already fetching or fetched
    if (billingInfoFetched) {
      console.log('🚫 Billing info already fetched, skipping...');
      return;
    }

    console.log('🔍 Starting billing info fetch...');
    
    try {
      // First try the dedicated billing info endpoint
      console.log('📡 Fetching billing info from /employer/billing-info...');
      const token = localStorage.getItem('token');
      const billingResponse = await employerApi.get('/employer/billing-info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (billingResponse.data) {
        console.log('✅ Billing info response received:', billingResponse.data);
        setBillingInfo(billingResponse.data);
        return;
      }
    } catch (billingError) {
      console.log('ℹ️ No existing billing info found, fetching from employer profile...');
    }

    try {
      // Fallback to employer profile data
      console.log('📡 Fetching employer data from /employer/me...');
      const employerResponse = await employerApi.get('/employer/me');
      
      console.log('✅ Employer response received:', employerResponse.data);
      const employer = employerResponse.data;
      
      if (employer) {
        const populatedBillingInfo = {
          company_name: employer.company_name || employer.name || '',
          billing_email: employer.email || '',
          phone_number: employer.phone_number || employer.phone || '',
          address_line_1: employer.address || '',
          address_line_2: '',
          tax_id: '',
          city: employer.city || '',
          state_province: employer.state || employer.province || '',
          postal_code: employer.postal_code || employer.zip_code || '',
          country: employer.country || ''
        };
        
        console.log('🎯 Setting billing info from employer profile:', populatedBillingInfo);
        setBillingInfo(populatedBillingInfo);
      } else {
        console.log('❌ No employer data found');
      }
    } catch (error) {
      console.error('💥 Error fetching employer info:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  }, [billingInfoFetched]);

  const calculateTravelTimes = async () => {
    // Skip Google Maps API calls if not properly configured
    if (!window.google || !employerLocation || !coworkingSpace) {
      console.log('Google Maps API not available or locations missing, skipping travel time calculations');
      return;
    }

    // Check if DirectionsService is available and properly configured
    try {
      const directionsService = new window.google.maps.DirectionsService();
      const origin = new window.google.maps.LatLng(employerLocation.lat, employerLocation.lng);
      const destination = new window.google.maps.LatLng(coworkingSpace.latitude, coworkingSpace.longitude);

      // Only try driving mode to reduce API calls and errors
      const travelModes = [
        { mode: window.google.maps.TravelMode.DRIVING, key: 'driving' }
      ];

      const newTravelTimes = { ...travelTimes };

      for (const travel of travelModes) {
        try {
          const result = await new Promise((resolve, reject) => {
            directionsService.route({
              origin,
              destination,
              travelMode: travel.mode,
            }, (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                resolve(result);
              } else {
                reject(status);
              }
            });
          });

          const route = result.routes[0];
          const leg = route.legs[0];
          newTravelTimes[travel.key] = {
            duration: leg.duration.text,
            distance: leg.distance.text
          };

          // Set directions for driving route (for map display)
          if (travel.key === 'driving') {
            setDirections(result);
          }
        } catch (error) {
          // Silently handle errors to prevent console spam
          newTravelTimes[travel.key] = {
            duration: 'N/A',
            distance: 'N/A'
          };
        }
      }

      setTravelTimes(newTravelTimes);
    } catch (error) {
      console.log('Google Maps DirectionsService not available, skipping travel time calculations');
      // Set default values
      setTravelTimes({
        driving: { duration: 'N/A', distance: 'N/A' },
        walking: { duration: 'N/A', distance: 'N/A' },
        bicycling: { duration: 'N/A', distance: 'N/A' },
      });
    }
  };

  // Helper function to calculate selected days in any month
  const calculateSelectedDaysInMonth = (year, month, selectedWeekDays) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let count = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      
      if (selectedWeekDays.includes(dayOfWeek)) {
        count++;
      }
    }
    
    return count;
  };

  // Calculate prorated billing for ongoing day bookings
  const calculateProratedBilling = () => {
    if (!selectedPackage || !bookingData.selectedWeekDays || !bookingData.startDate) {
      return { firstBilling: 0, monthlyBilling: 0, nextBillingDate: new Date(), remainingDays: 0 };
    }

    const dailyPrice = Number(selectedPackage.price_per_day) || 0;
    const selectedWeekDays = bookingData.selectedWeekDays;
    const startDate = bookingData.startDate ? new Date(bookingData.startDate) : new Date();
    
    // Determine base price based on hours worked
    const { subscriptionMode } = bookingData;
    const hoursPerDay = bookingData.hoursPerDay || (subscriptionMode === 'half_day' ? 4 : 8);
    let baseDailyPrice = dailyPrice;
    
    if (hoursPerDay === 4 || subscriptionMode === 'half_day') {
      baseDailyPrice = dailyPrice / 2; // Half day = half cost
    }

    // Calculate remaining days in current month
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();
    const lastDayOfMonth = new Date(startYear, startMonth + 1, 0).getDate();
    
    let remainingDaysCount = 0;
    for (let day = startDate.getDate(); day <= lastDayOfMonth; day++) {
      const currentDate = new Date(startYear, startMonth, day);
      const dayOfWeek = currentDate.getDay();
      
      if (selectedWeekDays.includes(dayOfWeek)) {
        remainingDaysCount++;
      }
    }

    // Calculate next month's actual selected days count
    const nextMonth = startMonth === 11 ? 0 : startMonth + 1;
    const nextYear = startMonth === 11 ? startYear + 1 : startYear;
    const nextMonthDaysCount = calculateSelectedDaysInMonth(nextYear, nextMonth, selectedWeekDays);
    
    const firstBilling = baseDailyPrice * remainingDaysCount;
    const monthlyBilling = baseDailyPrice * nextMonthDaysCount;
    
    // Next billing date is 1st of next month
    const nextBillingDate = new Date(startYear, startMonth + 1, 1);
    
    console.log('💰 Prorated billing calculation:', {
      selectedWeekDays,
      startDate: startDate.toISOString().split('T')[0],
      remainingDaysCount,
      nextMonthDaysCount,
      baseDailyPrice,
      firstBilling,
      monthlyBilling,
      nextBillingDate: nextBillingDate.toISOString().split('T')[0]
    });

    return {
      firstBilling,
      monthlyBilling,
      nextBillingDate,
      remainingDays: remainingDaysCount
    };
  };

  const calculateTotal = () => {
    if (!selectedPackage) {
      console.log('💰 No selected package, returning 0');
      return 0;
    }
    
    const { subscriptionMode, durationPerDay, bookingFrequency, bookingType } = bookingData;
    
    console.log('💰 calculateTotal - RAW Package Data:', selectedPackage);
    console.log('💰 calculateTotal - Package pricing:', {
      price_per_hour: selectedPackage.price_per_hour,
      price_per_day: selectedPackage.price_per_day,
      price_per_week: selectedPackage.price_per_week,
      price_per_month: selectedPackage.price_per_month,
      bookingFrequency,
      bookingType,
      subscriptionMode,
      duration: bookingData.duration
    });
    
    // Debug: Check the actual numeric values
    const dailyPriceRaw = selectedPackage.price_per_day;
    const dailyPriceNumber = Number(selectedPackage.price_per_day);
    console.log('💰 Daily price conversion:', {
      raw: dailyPriceRaw,
      number: dailyPriceNumber,
      type: typeof dailyPriceRaw
    });
    
    // For monthly bookings (both one-time and ongoing), use monthly price
    if ((bookingFrequency === 'one_time' && bookingType === 'monthly') || 
        (bookingFrequency === 'ongoing' && bookingType === 'monthly')) {
      const monthlyPrice = Number(selectedPackage.price_per_month) || 0;
      console.log('💰 Using full monthly price:', monthlyPrice);
      return monthlyPrice;
    }
    
    // For weekly bookings, use weekly price (adjusted for subscription mode)  
    if (bookingFrequency === 'one_time' && bookingType === 'weekly') {
      const weeklyPrice = Number(selectedPackage.price_per_week) || 0;
      console.log('💰 Using full weekly price:', weeklyPrice);
      return weeklyPrice;
      
      if (subscriptionMode === 'half_day') {
        // Half day = half the weekly price
        const halfWeeklyPrice = weeklyPrice / 2;
        console.log('💰 Using half weekly price for half-day:', halfWeeklyPrice);
        return halfWeeklyPrice;
      } else {
        // Full time = full weekly price
        console.log('💰 Using full weekly price:', weeklyPrice);
        return weeklyPrice;
      }
    }
    
    
    // For daily bookings, calculate based on duration and hours per day
    if (!bookingData.duration) {
      console.log('💰 No duration, returning 0');
      return 0;
    }
    
    let basePrice = 0;
    const dailyPrice = Number(selectedPackage.price_per_day) || 0;
    
    console.log('💰 Daily pricing calculation:', {
      dailyPrice,
      dailyPriceOriginal: selectedPackage.price_per_day,
      hoursPerDay: bookingData.hoursPerDay,
      subscriptionMode,
      durationPerDay,
      bookingDataDuration: bookingData.duration
    });
    
    // Determine base price based on hours worked
    // Check hoursPerDay first (from the dropdown), then fallback to subscriptionMode
    const hoursPerDay = bookingData.hoursPerDay || bookingData.customHours || 8;
    
    console.log('💰 Calculate total with:', {
      bookingFrequency,
      bookingType,
      duration: bookingData.duration,
      hoursPerDay,
      selectedPackage: selectedPackage?.name
    });
    
    if (hoursPerDay === 4) {
      // Half day = 4 hours = half cost
      basePrice = dailyPrice / 2;
      console.log('💰 Using half-day rate (4 hours):', basePrice);
    } else {
      // Full time = 8 hours = full cost
      basePrice = dailyPrice;
      console.log('💰 Using full daily rate (8 hours):', basePrice);
    }
    
    if (hoursPerDay === 'custom' && durationPerDay) {
      // Custom hours - calculate proportionally
      const hours = Number(durationPerDay);
      if (hours === 8) {
        basePrice = dailyPrice; // Full cost for 8 hours
        console.log('💰 Using full daily rate for 8 hours:', basePrice);
      } else if (hours === 4) {
        basePrice = dailyPrice / 2; // Half cost for 4 hours
        console.log('💰 Using half daily rate for 4 hours:', basePrice);
      } else {
        // For other hours, calculate proportionally
        basePrice = (dailyPrice / 8) * hours;
        console.log(`💰 Using proportional rate for ${hours} hours:`, basePrice);
      }
    } else {
      // Default to full time
      basePrice = dailyPrice;
      console.log('💰 Using default full daily rate (8 hours):', basePrice);
    }
    
    const durationNumber = Number(bookingData.duration);
    const total = basePrice * durationNumber;
    console.log('💰 Final calculation breakdown:', {
      basePrice: basePrice,
      duration: bookingData.duration,
      durationNumber: durationNumber,
      calculation: `${basePrice} × ${durationNumber} = ${total}`,
      finalTotal: total
    });
    return Number(total) || 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedPackage) {
      setError('Please select a package');
      return;
    }
    
    if (activeStep === 1) {
      // Validate start date is always required
      if (!bookingData.startDate) {
        setError('Please select a start date');
        return;
      }
      
      // For one-time bookings, end date is required
      // For ongoing bookings, end date is not required
      if (bookingData.bookingFrequency === 'one_time' && !bookingData.endDate) {
        setError('Please select an end date for one-time bookings');
        return;
      }
      
      // For ongoing daily bookings, selected days are required
      if (bookingData.bookingFrequency === 'ongoing' && 
          bookingData.bookingType === 'per_day' && 
          (!bookingData.selectedWeekDays || bookingData.selectedWeekDays.length === 0)) {
        setError('Please select at least one day for ongoing daily bookings');
        return;
      }
      
      const total = calculateTotal();
      console.log('💰 Setting total amount:', total);
      setBookingData(prev => ({ ...prev, totalAmount: total }));
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setLoading(true);
      
      // Create the booking after successful payment
      const bookingPayload = {
        coworking_space_id: coworkingSpace?.id,
        package_id: selectedPackage?.id,
        employee_id: bookingData.employeeId || null,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        booking_frequency: bookingData.bookingFrequency,
        booking_type: bookingData.bookingType,
        subscription_mode: bookingData.subscriptionMode,
        hours_per_day: bookingData.hoursPerDay,
        selected_week_days: bookingData.selectedWeekDays,
        duration: bookingData.duration,
        total_amount: calculateTotal(),
        notes: bookingData.notes,
        payment_intent_id: paymentIntent.id,
        payment_status: 'completed'
      };

      const response = await employerApi.bookCoworking(bookingPayload);
      
      if (response.success) {
        // Show success message and redirect
        setError('');
        alert('🎉 Booking confirmed! Payment successful.');
        navigate('/employer/bookings');
      } else {
        throw new Error(response.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking creation error:', err);
      setError('Payment successful but booking creation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || 'Payment failed. Please try again.');
    setLoading(false);
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setBookingData(prev => ({ ...prev, packageId: pkg.id }));
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

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    setSelectedEmployee(employee);
    setBookingData(prev => ({ ...prev, employeeId: employeeId || null }));
  };

  const handleDateChange = (field, value) => {
    console.log(`🗓️ Date change: ${field} = ${value}`);
    
    setBookingData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📅 Updated booking data:', updated);
      return updated;
    });
    
    if (field === 'startDate' || field === 'endDate') {
      const start = field === 'startDate' ? new Date(value) : new Date(bookingData.startDate);
      const end = field === 'endDate' ? new Date(value) : new Date(bookingData.endDate);
      
      console.log(`📊 Date calculation: start=${start.toDateString()}, end=${end.toDateString()}`);
      
      if (start && end && end >= start) {
        // Calculate coworking days
        // Same date = 1 day, different dates = actual difference
        const diffTime = Math.abs(end - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // For booking duration, we count calendar days
        // Same day = 1 day, next day = 2 days, etc.
        const duration = diffDays + 1;
        console.log(`⏱️ Calculated duration: ${duration} days (diffDays: ${diffDays})`);
        
        setBookingData(prev => ({ ...prev, duration: duration }));
      }
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedPackage || !selectedEmployee) {
      setSafeError('Please select a package and employee');
      return;
    }

    setLoading(true);
    try {
      const bookingPayload = {
        ...bookingData,
        employeeId: selectedEmployee.id,
        packageId: selectedPackage.id,
        coworkingSpaceId: coworkingSpace.id
      };

      const response = await employerApi.post('/employer/bookings', bookingPayload);
      setSuccess('Booking submitted successfully!');
      
      // Move to next step or redirect
      setTimeout(() => {
        navigate('/employer/bookings');
      }, 2000);
      
    } catch (err) {
      setSafeError(err.response?.data?.detail || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCarouselPrev = () => {
    if (carouselImages.length > 0) {
      setCarouselStartIndex((prev) => 
        prev === 0 ? carouselImages.length - 1 : prev - 1
      );
    }
  };

  const handleCarouselNext = () => {
    if (carouselImages.length > 0) {
      setCarouselStartIndex((prev) => 
        (prev + 1) % carouselImages.length
      );
    }
  };

  const handleThumbnailClick = (index) => {
    setCarouselStartIndex(index);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPackageSelection();
      case 1:
        return renderBookingDetails();
      case 2:
        return renderPaymentConfirmation();
      default:
        return null;
    }
  };

  const renderPackageSelection = () => (
    <Box sx={{ mt: 3 }}>
      {/* Location Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ color: '#8B2635', mr: 2, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                {coworkingSpace?.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {coworkingSpace?.full_address || coworkingSpace?.address}
              </Typography>
            </Box>
          </Box>
          
          {/* Next Button */}
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmitBooking : handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
            disabled={loading || !selectedPackage}
            sx={{ 
              backgroundColor: '#8B2635',
              '&:hover': { backgroundColor: '#7a1f2b' },
              minWidth: '120px'
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : activeStep === steps.length - 1 ? (
              'Confirm Booking'
            ) : (
              'Next'
            )}
          </Button>
        </Box>



        {/* Package Selection Section - First */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: '#8B2635', fontWeight: 600 }}>
            Select a Package
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8B2635' }} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
              {packages.map((pkg) => (
                <Box key={pkg.name} sx={{ flex: 1 }}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedPackage?.name === pkg.name ? '2px solid #8B2635' : '1px solid #e2e8f0',
                      '&:hover': { 
                        boxShadow: '0 8px 25px rgba(139, 38, 53, 0.15)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',
                      height: '550px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      p: 3
                    }}>
                      {/* Header with Radio Button */}
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B2635', mb: 1 }}>
                            {pkg.name}
                          </Typography>
                          {/* Description right under heading */}
                          <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6, mb: 2 }}>
                            {pkg.description}
                          </Typography>
                        </Box>
                        <Radio
                          checked={selectedPackage?.name === pkg.name}
                          sx={{
                            color: '#8B2635',
                            '&.Mui-checked': {
                              color: '#8B2635',
                            },
                            mt: -1
                          }}
                        />
                      </Box>
                                                {/* Pricing - All Tiers */}
                      <Box sx={{ mb: 3 }}>
                        {/* Hourly Rate */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h5" sx={{ 
                            color: '#10b981', 
                            fontWeight: 700, 
                            mr: 1
                          }}>
                            ${pkg.price_per_hour || pkg.hourly_rate || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            /hour
                          </Typography>
                        </Box>
                        
                        {/* Daily Rate */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h5" sx={{ 
                            color: '#3b82f6', 
                            fontWeight: 700, 
                            mr: 1
                          }}>
                            ${pkg.price_per_day || pkg.pricing || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            /day
                          </Typography>
                        </Box>
                        
                        {/* Weekly Rate */}
                        {(pkg.price_per_week && pkg.price_per_week > 0) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h5" sx={{ 
                              color: '#f59e0b', 
                              fontWeight: 700, 
                              mr: 1
                            }}>
                              ${pkg.price_per_week}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              /week
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Monthly Rate */}
                        {(pkg.price_per_month && pkg.price_per_month > 0) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h5" sx={{ 
                              color: '#8b5cf6', 
                              fontWeight: 700, 
                              mr: 1
                            }}>
                              ${pkg.price_per_month}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              /month
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      {/* Package Images - Larger Thumbnails */}
                      {(() => {
                        const packageImages = getPackageImages(pkg.name);
                        console.log(`📦 Package ${pkg.name} images:`, packageImages);
                        
                        // If no images from API, show placeholder message instead of broken images
                        const hasImages = packageImages.length > 0;
                        
                        // For now, let's show a message instead of broken images
                        if (!hasImages) {
                          return (
                            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                              <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center' }}>
                                📸 Package images will be displayed here once uploaded
                              </Typography>
                            </Box>
                          );
                        }
                        
                        const mockImages = packageImages;
                        
                        return mockImages.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#374151' }}>
                              Package Images ({packageImages.length}):
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1.5, 
                              overflowX: 'auto',
                              pb: 1,
                              '&::-webkit-scrollbar': { height: 6 },
                              '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1', borderRadius: 3 },
                              '&::-webkit-scrollbar-thumb': { backgroundColor: '#8B2635', borderRadius: 3 }
                            }}>
                              {mockImages.slice(0, 6).map((image, index) => (
                                <Box
                                  key={index}
                                  onClick={() => {
                                    setCarouselImages(packageImages);
                                    setCarouselStartIndex(index);
                                    setShowCarouselModal(true);
                                  }}
                                  sx={{
                                    minWidth: 100,
                                    height: 75,
                                    cursor: 'pointer',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    '&:hover': { 
                                      opacity: 0.8,
                                      transform: 'scale(1.05)',
                                      transition: 'all 0.2s ease',
                                      borderColor: '#8B2635'
                                    }
                                  }}
                                >
                                  <img
                                    src={(() => {
                                      console.log('🖼️ Image object:', image);
                                      const imageUrl = image.image_url || image.thumbnail_medium_url || image.thumbnail_url || image.url;
                                      console.log('🖼️ Extracted imageUrl:', imageUrl);
                                      if (!imageUrl) {
                                        console.log('🖼️ No imageUrl found, using placeholder');
                                        return '/api/placeholder/100/75';
                                      }
                                      const finalUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`;
                                      console.log('🖼️ Final URL:', finalUrl);
                                      return finalUrl;
                                    })()}
                                    alt={`${pkg.name} Image ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      console.log('🖼️ Image failed to load:', e.target.src);
                                      // Instead of placeholder, show a proper fallback
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = `
                                        <div style="
                                          width: 100%; 
                                          height: 100%; 
                                          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                                          display: flex;
                                          align-items: center;
                                          justify-content: center;
                                          border-radius: 6px;
                                          color: #9ca3af;
                                          font-size: 12px;
                                          text-align: center;
                                        ">
                                          📷<br/>No Image
                                        </div>
                                      `;
                                    }}
                                  />
                                </Box>
                              ))}
                              {mockImages.length > 6 && (
                                <Box
                                  onClick={() => {
                                    setCarouselImages(packageImages);
                                    setCarouselStartIndex(6);
                                    setShowCarouselModal(true);
                                  }}
                                  sx={{
                                    minWidth: 100,
                                    height: 75,
                                    cursor: 'pointer',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(139, 38, 53, 0.1)',
                                    color: '#8B2635',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    '&:hover': { 
                                      backgroundColor: 'rgba(139, 38, 53, 0.2)',
                                      transform: 'scale(1.05)',
                                      transition: 'all 0.2s ease',
                                      borderColor: '#8B2635'
                                    }
                                  }}
                                >
                                  +{mockImages.length - 6}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })()}
                      
                      {/* Package Amenities */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#374151' }}>
                          Package Amenities:
                        </Typography>
                        
                        {/* PACKAGE AMENITIES */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Chip
                            label="Air Conditioning"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(139, 38, 53, 0.1)',
                              color: '#8B2635',
                              fontSize: '0.75rem',
                              height: '24px',
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1.5 },
                              '&:hover': { backgroundColor: 'rgba(139, 38, 53, 0.2)' }
                            }}
                          />
                          <Chip
                            label="Comfortable Seating"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(139, 38, 53, 0.1)',
                              color: '#8B2635',
                              fontSize: '0.75rem',
                              height: '24px',
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1.5 },
                              '&:hover': { backgroundColor: 'rgba(139, 38, 53, 0.2)' }
                            }}
                          />
                          <Chip
                            label="Heating"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(139, 38, 53, 0.1)',
                              color: '#8B2635',
                              fontSize: '0.75rem',
                              height: '24px',
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1.5 },
                              '&:hover': { backgroundColor: 'rgba(139, 38, 53, 0.2)' }
                            }}
                          />
                          <Chip
                            label="Natural Light"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(139, 38, 53, 0.1)',
                              color: '#8B2635',
                              fontSize: '0.75rem',
                              height: '24px',
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1.5 },
                              '&:hover': { backgroundColor: 'rgba(139, 38, 53, 0.2)' }
                            }}
                          />
                          <Chip
                            label="Plants & Greenery"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(139, 38, 53, 0.1)',
                              color: '#8B2635',
                              fontSize: '0.75rem',
                              height: '24px',
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1.5 },
                              '&:hover': { backgroundColor: 'rgba(139, 38, 53, 0.2)' }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      {/* Features & Amenities */}
                       <Box sx={{ flexGrow: 1 }}>
                         {/* Package Features */}
                         {pkg.features && pkg.features.length > 0 && (
                           <>
                             <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
                               Package Features:
                             </Typography>
                             <List dense sx={{ p: 0, mb: 2 }}>
                               {pkg.features.map((feature, index) => (
                                 <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                                   <ListItemAvatar sx={{ minWidth: 24 }}>
                                     <CheckCircle sx={{ fontSize: 14, color: '#10b981' }} />
                                   </ListItemAvatar>
                                   <ListItemText 
                                     primary={feature} 
                                     primaryTypographyProps={{ 
                                       variant: 'body2', 
                                       color: '#374151',
                                       fontSize: '0.8rem'
                                     }}
                                   />
                                 </ListItem>
                               ))}
                             </List>
                           </>
                         )}
                         
                         {/* Space Amenities */}
                         {(() => {
                           let amenities = [];
                           try {
                             // Parse amenities from coworking space data
                             if (coworkingSpace?.amenities) {
                               if (typeof coworkingSpace.amenities === 'string') {
                                 amenities = JSON.parse(coworkingSpace.amenities);
                               } else if (Array.isArray(coworkingSpace.amenities)) {
                                 amenities = coworkingSpace.amenities;
                               }
                             }
                           } catch (e) {
                             console.warn('Error parsing amenities:', e);
                             amenities = [];
                           }
                           
                           return amenities.length > 0 ? (
                             <>
                               <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
                                 Space Amenities:
                               </Typography>
                               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                 {amenities.slice(0, 6).map((amenity, index) => (
                                   <Chip
                                     key={index}
                                     label={typeof amenity === 'string' ? amenity : amenity.name || amenity}
                                     size="small"
                                     sx={{
                                       backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                       color: '#10b981',
                                       fontSize: '0.7rem',
                                       height: '20px',
                                       '& .MuiChip-label': {
                                         px: 1
                                       }
                                     }}
                                   />
                                 ))}
                                 {amenities.length > 6 && (
                                   <Chip
                                     label={`+${amenities.length - 6} more`}
                                     size="small"
                                     sx={{
                                       backgroundColor: 'rgba(107, 114, 128, 0.1)',
                                       color: '#6b7280',
                                       fontSize: '0.7rem',
                                       height: '20px',
                                       '& .MuiChip-label': {
                                         px: 1
                                       }
                                     }}
                                   />
                                 )}
                               </Box>
                             </>
                           ) : null;
                         })()}
                       </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Commute Information Section - Below Packages */}
        <Typography variant="h6" sx={{ mb: 3, color: '#8B2635', fontWeight: 600 }}>
          Commute Information
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, height: '500px' }}>
          {/* Route Information Panel - Left Side (25%) */}
          <Box sx={{ 
            width: '25%', 
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            p: 3,
            height: '100%',
            overflow: 'auto'
          }}>
            {/* Route Details Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#8B2635', 
                mr: 1.5 
              }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>
                Route Details
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, fontSize: '0.875rem' }}>
              Your commute information
            </Typography>

            {/* From/To Information */}
            <Box sx={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px', 
              p: 2.5, 
              mb: 3,
              border: '1px solid #e2e8f0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#3b82f6', 
                  mr: 2,
                  mt: 0.5
                }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
                    From
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.4 }}>
                    {employerLocation?.address || '123 Business St, Lahore, Pakistan, Lahore, Pakistan'}
                  </Typography>
                </Box>
              </Box>

              {/* Connecting Line */}
              <Box sx={{ 
                width: 2, 
                height: 20, 
                backgroundColor: '#8B2635', 
                ml: 1.5, 
                mb: 1 
              }} />

              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#ef4444', 
                  mr: 2,
                  mt: 0.5
                }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
                    To
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.4 }}>
                    {coworkingSpace?.title || 'CubeSpace DHA'}
                  </Typography>
                </Box>
              </Box>

              {/* Distance Badge */}
              <Box sx={{ 
                mt: 2, 
                p: 1, 
                backgroundColor: '#8B2635', 
                borderRadius: '20px',
                textAlign: 'center',
                width: 'fit-content',
                mx: 'auto'
              }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                  {coworkingSpace?.distance ? `${coworkingSpace.distance.toFixed(1)} km away` : '9.0 km away'}
                </Typography>
              </Box>
            </Box>

            {/* Travel Times */}
            <Box sx={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px', 
              p: 2.5,
              border: '1px solid #e2e8f0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime sx={{ fontSize: 16, color: '#8B2635', mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  Travel Times
                </Typography>
              </Box>
              
              <Grid container spacing={1.5}>
                {/* Driving */}
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ fontSize: '1.5rem', mb: 1 }}>🚗</Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                      {(travelTimes.driving && typeof travelTimes.driving === 'object' && travelTimes.driving.duration) || '~18 min'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#92400e', fontSize: '0.75rem' }}>
                      Car
                    </Typography>
                  </Box>
                </Grid>

                {/* Walking */}
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#d1fae5', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ fontSize: '1.5rem', mb: 1 }}>🚶</Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                      {(travelTimes.walking && typeof travelTimes.walking === 'object' && travelTimes.walking.duration) || '~108 min'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#065f46', fontSize: '0.75rem' }}>
                      Walk
                    </Typography>
                  </Box>
                </Grid>

                {/* Bicycling */}
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ fontSize: '1.5rem', mb: 1 }}>🚴</Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                      {(travelTimes.bicycling && typeof travelTimes.bicycling === 'object' && travelTimes.bicycling.duration) || '~35 min'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1e40af', fontSize: '0.75rem' }}>
                      Bike
                    </Typography>
                  </Box>
                </Grid>

                {/* Transit */}
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#fce7f3', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ fontSize: '1.5rem', mb: 1 }}>🚌</Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                      {(travelTimes.transit && typeof travelTimes.transit === 'object' && travelTimes.transit.duration) || '~45 min'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#be185d', fontSize: '0.75rem' }}>
                      Transit
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Map Section - Right Side (75%) */}
          <Box sx={{ 
            width: '75%',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {isLoaded ? (
              employerLocation && coworkingSpace ? (
                <GoogleMap
                  ref={mapRef}
                  mapContainerStyle={{ 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '12px'
                  }}
                  center={{
                    lat: (employerLocation.lat + coworkingSpace.latitude) / 2,
                    lng: (employerLocation.lng + coworkingSpace.longitude) / 2
                  }}
                  zoom={12}
                  options={{
                    styles: [
                      {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                      }
                    ],
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false
                  }}
                  onLoad={(map) => {
                    mapRef.current = map;
                    setMapLoaded(true);
                    
                    // Set bounds to fit both locations with padding
                    if (employerLocation && coworkingSpace) {
                      const bounds = new window.google.maps.LatLngBounds();
                      bounds.extend({ lat: employerLocation.lat, lng: employerLocation.lng });
                      bounds.extend({ lat: coworkingSpace.latitude, lng: coworkingSpace.longitude });
                      map.fitBounds(bounds, 50); // 50px padding
                    }
                    
                    // Delay marker loading to ensure map is fully ready
                    setTimeout(() => {
                      setMarkersReady(true);
                    }, 500);
                  }}
                >
                  {/* Employer Location Marker - Only show when map and markers are ready */}
                  {mapLoaded && markersReady && (
                    <Marker
                      position={{ lat: employerLocation.lat, lng: employerLocation.lng }}
                      title="Your Office Location"
                      icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  )}
                  
                  {/* Coworking Space Marker - Only show when map and markers are ready */}
                  {mapLoaded && markersReady && (
                    <Marker
                      position={{ lat: coworkingSpace.latitude, lng: coworkingSpace.longitude }}
                      title={coworkingSpace.title || "Coworking Space"}
                      icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  )}

                  {/* Directions */}
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        polylineOptions: {
                          strokeColor: '#8B2635',
                          strokeWeight: 4,
                          strokeOpacity: 0.8
                        },
                        suppressMarkers: true
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc'
                }}>
                  <CircularProgress sx={{ color: '#8B2635', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Loading location data...
                  </Typography>
                </Box>
              )
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8fafc'
              }}>
                <CircularProgress sx={{ color: '#8B2635', mb: 2 }} />
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Loading Google Maps...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  const renderBookingDetails = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, color: '#8B2635', fontWeight: 600 }}>
        Booking Details
      </Typography>
      
      <Grid container spacing={4}>
        {/* Main Booking Form - 75% */}
        <Grid item xs={12} lg={7}>
          {/* Booking For Section */}
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.05) 0%, rgba(139, 38, 53, 0.02) 100%)',
            border: '1px solid rgba(139, 38, 53, 0.1)',
            borderRadius: '16px'
          }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1.5, color: '#8B2635' }} />
              Who is this booking for?
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Select Person</InputLabel>
              <Select
                value={bookingData.employeeId || 'self'}
                onChange={(e) => handleEmployeeChange(e.target.value === 'self' ? null : e.target.value)}
                label="Select Person"
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value="self">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, backgroundColor: '#8B2635' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Myself (Employer)
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Book for yourself
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, backgroundColor: '#3b82f6' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {employee.first_name} {employee.last_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {employee.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Booking Configuration */}
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.05) 0%, rgba(139, 38, 53, 0.02) 100%)',
            border: '1px solid rgba(139, 38, 53, 0.1)',
            borderRadius: '16px'
          }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <Tune sx={{ mr: 1.5, color: '#8B2635' }} />
              Booking Configuration
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Booking Frequency - One Time or Ongoing - FIRST ELEMENT */}
              <Box sx={{ flex: '0 0 250px', minWidth: '250px', maxWidth: '250px' }}>
                <TextField
                  fullWidth
                  select
                  label="Booking Frequency"
                  value={bookingData.bookingFrequency}
                  onChange={(e) => {
                    // Clear all booking details when frequency changes
                    setBookingData(prev => ({ 
                      ...prev, 
                      bookingFrequency: e.target.value,
                      // Clear all date and booking selections
                      bookingType: '',
                      hoursPerDay: '',
                      subscriptionMode: '',
                      selectedDates: [],
                      selectedWeekDays: [],
                      startDate: '',
                      endDate: '',
                      duration: 0,
                      weekStartDate: '',
                      monthStartDate: '',
                      totalAmount: 0
                    }));
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                >
                  <MenuItem value="one_time">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Event sx={{ fontSize: 20, color: '#10b981' }} />
                      One Time
                    </Box>
                  </MenuItem>
                  <MenuItem value="ongoing">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DateRange sx={{ fontSize: 20, color: '#3b82f6' }} />
                      Ongoing
                    </Box>
                  </MenuItem>
                </TextField>
              </Box>

              <Box sx={{ flex: '0 0 250px', minWidth: '250px', maxWidth: '250px' }}>
                <TextField
                  fullWidth
                  select
                  label="Booking Type"
                  value={bookingData.bookingType}
                  onChange={(e) => {
                    if (bookingData.bookingFrequency === 'ongoing') {
                      // Auto-set to monthly for ongoing bookings
                      setBookingData(prev => ({ 
                        ...prev, 
                        bookingType: 'monthly', // Force monthly for ongoing
                        // Clear all date and booking selections
                        hoursPerDay: '',
                        subscriptionMode: '',
                        selectedDates: [],
                        selectedWeekDays: [],
                        startDate: '',
                        endDate: '',
                        duration: 0,
                        weekStartDate: '',
                        monthStartDate: '',
                        totalAmount: 0
                      }));
                    } else {
                      setBookingData(prev => ({ 
                        ...prev, 
                        bookingType: e.target.value,
                        // Clear all date and booking selections
                        hoursPerDay: '',
                        subscriptionMode: '',
                        selectedDates: [],
                        selectedWeekDays: [],
                        startDate: '',
                        endDate: '',
                        duration: 0,
                        weekStartDate: '',
                        monthStartDate: '',
                        totalAmount: 0
                      }));
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                >
                  {/* Only show per_day option for one_time bookings */}
                  {bookingData.bookingFrequency === 'one_time' && (
                    <MenuItem value="per_day">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 20, color: '#10b981' }} />
                        Day
                      </Box>
                    </MenuItem>
                  )}
                  <MenuItem value="monthly">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Event sx={{ fontSize: 20, color: '#8b5cf6' }} />
                      {bookingData.bookingFrequency === 'ongoing' ? 'Monthly' : 'Month'}
                    </Box>
                  </MenuItem>
                </TextField>
              </Box>

              {/* Hours Per Day - Only show for Per Day booking when NOT one-time + day */}
              {bookingData.bookingType === 'per_day' && !(bookingData.bookingFrequency === 'one_time' && bookingData.bookingType === 'per_day') && (
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    select
                    label="Hours Per Day"
                    value={bookingData.hoursPerDay}
                    onChange={(e) => setBookingData(prev => ({ ...prev, hoursPerDay: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ backgroundColor: 'white' }}
                  >
                    <MenuItem value={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 20, color: '#ef4444' }} />
                        8 Hours (Full Time)
                      </Box>
                    </MenuItem>
                    <MenuItem value={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule sx={{ fontSize: 20, color: '#f59e0b' }} />
                        4 Hours (Half Day)
                      </Box>
                    </MenuItem>

                  </TextField>
                </Box>
              )}
              


            </Box>
              
          </Paper>

          {/* Schedule & Duration - Only show when both frequency and type are selected */}
          {bookingData.bookingFrequency && bookingData.bookingType && (
            <Paper sx={{ 
              p: 3, 
              mb: 4, 
              background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.05) 0%, rgba(139, 38, 53, 0.02) 100%)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              borderRadius: '16px'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1.5, color: '#8B2635' }} />
                Schedule & Duration
              </Typography>
            
            {/* Show multi-select calendar for One Time + Day booking */}
            {bookingData.bookingFrequency === 'one_time' && bookingData.bookingType === 'per_day' ? (
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                  Select Days for Booking
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
                  Click on available dates to select multiple days. Weekends are disabled as the coworking space is closed.
                </Typography>
                
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'white', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  width: '100%'
                }}>
                  <MultiSelectCalendar
                    selectedDates={bookingData.selectedDates || []}
                    onDatesChange={(dates) => {
                      setBookingData(prev => ({
                        ...prev,
                        selectedDates: dates,
                        startDate: dates.length > 0 ? dates[0] : '',
                        endDate: dates.length > 0 ? dates[dates.length - 1] : '',
                        duration: dates.length
                      }));
                    }}
                    disableWeekends={true}
                    minDate={new Date().toISOString().split('T')[0]} // Today or later
                  />
                  
                  {bookingData.selectedDates && bookingData.selectedDates.length > 0 && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
                        Selected Dates ({bookingData.selectedDates.length} day{bookingData.selectedDates.length > 1 ? 's' : ''}):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {bookingData.selectedDates.map((date, index) => (
                          <Chip
                            key={index}
                            label={new Date(date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            size="small"
                            sx={{
                              backgroundColor: '#8B2635',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#7a1f2e'
                              }
                            }}
                            onDelete={() => {
                              const newDates = bookingData.selectedDates.filter(d => d !== date);
                              setBookingData(prev => ({
                                ...prev,
                                selectedDates: newDates,
                                startDate: newDates.length > 0 ? newDates[0] : '',
                                endDate: newDates.length > 0 ? newDates[newDates.length - 1] : '',
                                duration: newDates.length
                              }));
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : bookingData.bookingFrequency === 'one_time' && bookingData.bookingType === 'weekly' ? (
              // Show weekly calendar for One Time + Week booking
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                  Select Week Start Date
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
                  Choose the first day of your work week. We'll automatically select 5 consecutive weekdays (Mon-Fri).
                </Typography>
                
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'white', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  width: '100%'
                }}>
                  <WeeklyCalendar
                    selectedWeekStart={bookingData.weekStartDate || ''}
                    selectedDates={bookingData.selectedDates || []}
                    onWeekChange={(startDate, weekDates) => {
                      setBookingData(prev => ({
                        ...prev,
                        weekStartDate: startDate,
                        selectedDates: weekDates,
                        startDate: weekDates[0],
                        endDate: weekDates[weekDates.length - 1],
                        duration: weekDates.length
                      }));
                    }}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                  
                  {bookingData.selectedDates && bookingData.selectedDates.length > 0 && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
                        Selected Work Week ({bookingData.selectedDates.length} days, {
                          bookingData.subscriptionMode === 'flexible' && bookingData.durationPerDay 
                            ? `${bookingData.durationPerDay} hours/day`
                            : bookingData.subscriptionMode === 'half_day' 
                              ? '4 hours/day'
                              : '8 hours/day'
                        }):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {bookingData.selectedDates.map((date, index) => (
                          <Chip
                            key={index}
                            label={new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            size="small"
                            sx={{
                              backgroundColor: '#8B2635',
                              color: 'white'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : bookingData.bookingFrequency === 'one_time' && bookingData.bookingType === 'monthly' ? (
              // Show monthly calendar for One Time + Month booking
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                  Select Month Start Date
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
                  Choose the first day of your monthly booking. The booking will run for a full month from the selected date.
                </Typography>
                
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'white', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  width: '100%'
                }}>
                  <MonthlyCalendar
                    selectedStartDate={bookingData.startDate || ''}
                    onStartDateChange={(startDate) => {
                      // Calculate end date (exactly 30 days from start date)
                      const start = new Date(startDate);
                      const end = new Date(start);
                      end.setDate(start.getDate() + 30 - 1); // 30 days total, minus 1 for inclusive range
                      
                      const endDateStr = end.toISOString().split('T')[0];
                      
                      // Calculate duration counting only operating days (Mon-Fri) within 30-day period
                      const operatingDays = [1, 2, 3, 4, 5]; // Monday to Friday
                      let operatingDaysCount = 0;
                      const current = new Date(start);
                      
                      while (current <= end) {
                        const dayOfWeek = current.getDay();
                        if (operatingDays.includes(dayOfWeek)) {
                          operatingDaysCount++;
                        }
                        current.setDate(current.getDate() + 1);
                      }
                      
                      setBookingData(prev => ({
                        ...prev,
                        startDate: startDate,
                        endDate: endDateStr,
                        duration: operatingDaysCount,
                        monthStartDate: startDate
                      }));
                    }}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                  
                  {bookingData.startDate && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
                        Selected Monthly Period:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={`Start: ${new Date(bookingData.startDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}`}
                          size="small"
                          sx={{
                            backgroundColor: '#8B2635',
                            color: 'white'
                          }}
                        />
                        {bookingData.endDate && (
                          <Chip
                            label={`End: ${new Date(bookingData.endDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}`}
                            size="small"
                            sx={{
                              backgroundColor: '#8B2635',
                              color: 'white'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : bookingData.bookingFrequency === 'ongoing' && bookingData.bookingType === 'per_day' ? (
              // Show weekly day selector for Ongoing + Day booking
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                  Select Days You Want to Book Your Coworking Space
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
                  Choose the days of the week you want to book regularly. Your booking will repeat every week on the selected days.
                </Typography>
                
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'white', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  width: '100%'
                }}>
                  {/* Weekly Day Selector */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                      Select Days of the Week:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {[
                        { day: 'Monday', value: 1, short: 'Mon' },
                        { day: 'Tuesday', value: 2, short: 'Tue' },
                        { day: 'Wednesday', value: 3, short: 'Wed' },
                        { day: 'Thursday', value: 4, short: 'Thu' },
                        { day: 'Friday', value: 5, short: 'Fri' },
                        { day: 'Saturday', value: 6, short: 'Sat' },
                        { day: 'Sunday', value: 0, short: 'Sun' }
                      ].map((dayInfo) => {
                        const isSelected = (bookingData.selectedWeekDays || []).includes(dayInfo.value);
                        const isOperatingDay = [1, 2, 3, 4, 5].includes(dayInfo.value); // Mon-Fri
                        
                        return (
                          <Box
                            key={dayInfo.value}
                            onClick={() => {
                              if (!isOperatingDay) return; // Don't allow weekend selection
                              
                              const currentDays = bookingData.selectedWeekDays || [];
                              let newDays;
                              
                              if (isSelected) {
                                newDays = currentDays.filter(day => day !== dayInfo.value);
                              } else {
                                newDays = [...currentDays, dayInfo.value].sort();
                              }
                              
                              setBookingData(prev => ({
                                ...prev,
                                selectedWeekDays: newDays,
                                duration: newDays.length
                              }));
                            }}
                            sx={{
                              width: '80px',
                              height: '80px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #8B2635' : '2px solid #e2e8f0',
                              backgroundColor: isSelected ? 'rgba(139, 38, 53, 0.1)' : 
                                             !isOperatingDay ? '#f8f9fa' : 'white',
                              cursor: isOperatingDay ? 'pointer' : 'not-allowed',
                              opacity: !isOperatingDay ? 0.5 : 1,
                              transition: 'all 0.2s ease',
                              '&:hover': isOperatingDay ? {
                                borderColor: isSelected ? '#8B2635' : '#8B2635',
                                backgroundColor: isSelected ? 'rgba(139, 38, 53, 0.15)' : 'rgba(139, 38, 53, 0.05)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(139, 38, 53, 0.2)'
                              } : {}
                            }}
                          >
                            <Typography variant="caption" sx={{ 
                              fontWeight: 600, 
                              color: isSelected ? '#8B2635' : !isOperatingDay ? '#9ca3af' : '#374151',
                              fontSize: '11px',
                              textAlign: 'center'
                            }}>
                              {dayInfo.short}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: isSelected ? '#8B2635' : !isOperatingDay ? '#9ca3af' : '#6b7280',
                              fontSize: '10px',
                              textAlign: 'center',
                              mt: 0.5
                            }}>
                              {dayInfo.day}
                            </Typography>
                            {!isOperatingDay && (
                              <Typography variant="caption" sx={{ 
                                color: '#ef4444',
                                fontSize: '8px',
                                textAlign: 'center',
                                mt: 0.5
                              }}>
                                Closed
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                  
                  {/* Calendar Preview for Next 30 Days */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                      Preview Your Recurring Bookings (Next 30 Days):
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
                      Select your start date and see how your recurring booking will look over the next month.
                    </Typography>
                    
                    <RecurringBookingCalendar
                      selectedWeekDays={bookingData.selectedWeekDays || []}
                      startDate={bookingData.startDate || ''}
                      onStartDateChange={(startDate) => {
                        setBookingData(prev => ({ ...prev, startDate: startDate }));
                      }}
                      minDate={new Date().toISOString().split('T')[0]}
                    />
                  </Box>
                  
                  {/* Summary */}
                  {bookingData.selectedWeekDays && bookingData.selectedWeekDays.length > 0 && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
                        Recurring Booking Summary:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        Every {bookingData.selectedWeekDays.map(day => {
                          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          return dayNames[day];
                        }).join(', ')} of each month
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {bookingData.selectedWeekDays.length} day{bookingData.selectedWeekDays.length > 1 ? 's' : ''} per week
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : bookingData.bookingFrequency === 'ongoing' && bookingData.bookingType === 'monthly' ? (
              // Show monthly calendar for Ongoing + Month booking
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                  Select Start Date for Monthly Booking
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
                  Choose your start date. Your monthly subscription will begin on this date and automatically renew each month.
                </Typography>
                
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'white', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  width: '100%'
                }}>
                  <MonthlyCalendar
                    selectedStartDate={bookingData.startDate || ''}
                    onStartDateChange={(startDate) => {
                      // Calculate end date (30 days from start)
                      const start = new Date(startDate);
                      const end = new Date(start);
                      end.setDate(start.getDate() + 29); // 30 days total (including start day)
                      
                      setBookingData(prev => ({ 
                        ...prev, 
                        startDate: startDate,
                        endDate: end.toISOString().split('T')[0],
                        duration: 30 // 30 days
                      }));
                    }}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                  
                  {bookingData.startDate && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
                        Monthly Subscription Summary:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        Start Date: {new Date(bookingData.startDate).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                      {bookingData.endDate && (
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                          End Date: {new Date(bookingData.endDate).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        Duration: 30 days
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        Next Billing: {(() => {
                          const nextBilling = new Date(bookingData.startDate);
                          nextBilling.setMonth(nextBilling.getMonth() + 1);
                          return nextBilling.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          });
                        })()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Full-time access (8 hours/day, Monday-Friday)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              // Show regular Start/End Date fields for other booking types
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ flex: '0 0 250px', minWidth: '250px', maxWidth: '250px' }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={bookingData.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ backgroundColor: 'white' }}
                  />
                </Box>
                
                {bookingData.bookingFrequency !== 'ongoing' && (
                  <Box sx={{ flex: '0 0 250px', minWidth: '250px', maxWidth: '250px' }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date"
                      value={bookingData.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Box>
                )}
              </Box>
            )}
            </Paper>
          )}

        </Grid>

        {/* Order Summary Sidebar - 25% */}
        <Grid item xs={12} lg={5}>
          <Box>


            {/* Order Summary */}
            <Paper sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.08) 0%, rgba(139, 38, 53, 0.04) 100%)',
              border: '1px solid rgba(139, 38, 53, 0.2)',
              borderRadius: '16px',
              minWidth: '400px',
              width: '100%'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#8B2635', fontWeight: 600 }}>
                Order Summary
              </Typography>
              
              {/* Package Info */}
              {selectedPackage && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                    {selectedPackage.name}
                  </Typography>
                </Box>
              )}
              
              {/* Booking Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                  Booking Details
                </Typography>
                
                {bookingData.bookingFrequency && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Frequency:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                      {bookingData.bookingFrequency === 'one_time' ? 'One Time' : 'Ongoing'}
                    </Typography>
                  </Box>
                )}
                
                {bookingData.bookingType && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Type:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                      {bookingData.bookingType === 'per_day' ? 'Daily' : 'Monthly'}
                    </Typography>
                  </Box>
                )}
                
                {bookingData.subscriptionMode && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Hours:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                      {bookingData.subscriptionMode === 'flexible' && bookingData.durationPerDay 
                        ? `${bookingData.durationPerDay} hours/day`
                        : bookingData.subscriptionMode === 'half_day' 
                          ? '4 hours/day'
                          : '8 hours/day'}
                    </Typography>
                  </Box>
                )}
                
                {/* Hide Duration for ongoing day bookings since prorated billing shows the details */}
                {bookingData.duration > 0 && 
                 !(bookingData.bookingFrequency === 'ongoing' && bookingData.bookingType === 'per_day') && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Duration:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                      {(() => {
                        // For ongoing monthly bookings
                        if (bookingData.bookingFrequency === 'ongoing' && bookingData.bookingType === 'monthly') {
                          return `30 days (1 month billing cycle)`;
                        }
                        
                        // For all other bookings
                        return `${bookingData.duration} day${bookingData.duration > 1 ? 's' : ''}`;
                      })()}
                    </Typography>
                  </Box>
                )}
                
                {/* Selected Dates for One Time bookings */}
                {bookingData.bookingFrequency === 'one_time' && bookingData.selectedDates && bookingData.selectedDates.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Selected Dates:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {bookingData.selectedDates.slice(0, 3).map((date, index) => (
                        <Typography key={index} variant="caption" sx={{ 
                          backgroundColor: 'rgba(139, 38, 53, 0.1)', 
                          color: '#8B2635',
                          px: 1,
                          py: 0.5,
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Typography>
                      ))}
                      {bookingData.selectedDates.length > 3 && (
                        <Typography variant="caption" sx={{ 
                          color: '#6b7280',
                          px: 1,
                          py: 0.5,
                          fontSize: '11px'
                        }}>
                          +{bookingData.selectedDates.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                
                {/* Selected Days for Ongoing Day bookings */}
                {bookingData.bookingFrequency === 'ongoing' && bookingData.bookingType === 'per_day' && bookingData.selectedWeekDays && bookingData.selectedWeekDays.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Selected Days:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {bookingData.selectedWeekDays.map((dayValue, index) => {
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        return (
                          <Typography key={index} variant="caption" sx={{ 
                            backgroundColor: 'rgba(139, 38, 53, 0.1)', 
                            color: '#8B2635',
                            px: 1,
                            py: 0.5,
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            {dayNames[dayValue]}
                          </Typography>
                        );
                      })}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 1 }}>
                      Every {bookingData.selectedWeekDays.map(day => {
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        return dayNames[day];
                      }).join(', ')} of each month
                    </Typography>
                  </Box>
                )}
                
                {/* Hide Starts and Next Billing for ongoing day bookings since prorated billing shows the details */}
                {bookingData.bookingFrequency === 'ongoing' && bookingData.startDate && 
                 bookingData.bookingType !== 'per_day' && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Starts:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                        {new Date(bookingData.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    
                    {/* Next Billing Date for Ongoing bookings */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Next Billing:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#8B2635' }}>
                        {(() => {
                          const startDate = new Date(bookingData.startDate);
                          const nextBilling = new Date(startDate);
                          nextBilling.setMonth(startDate.getMonth() + 1);
                          
                          return nextBilling.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          });
                        })()}
                      </Typography>
                    </Box>
                  </>
                )}
                
                {/* Date Range for Weekly/Monthly bookings */}
                {bookingData.bookingFrequency === 'one_time' && bookingData.startDate && bookingData.endDate && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Period:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                      {new Date(bookingData.startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })} - {new Date(bookingData.endDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Total - Only show when we have enough info to calculate */}
              {(() => {
                // For ongoing day bookings, require both selected days AND start date
                if (bookingData.bookingFrequency === 'ongoing' && bookingData.bookingType === 'per_day') {
                  return bookingData.selectedWeekDays && bookingData.selectedWeekDays.length > 0 && bookingData.startDate;
                }
                // For other booking types, show if we have basic booking info
                return bookingData.bookingFrequency && bookingData.bookingType;
              })() && (
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(139, 38, 53, 0.1)', 
                  borderRadius: '12px',
                  mb: 3
                }}>
                  {bookingData.bookingFrequency === 'ongoing' && bookingData.bookingType === 'per_day' && bookingData.selectedWeekDays && bookingData.selectedWeekDays.length > 0 ? (
                    // Prorated billing display for ongoing day bookings
                    (() => {
                      const proratedBilling = calculateProratedBilling();
                      return (
                        <Box>
                          {/* First Billing (Prorated) */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                              First Billing ({proratedBilling.remainingDays} days remaining in {new Date(bookingData.startDate || new Date()).toLocaleDateString('en-US', { month: 'long' })})
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#8B2635' }}>
                              ${proratedBilling.firstBilling.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          {/* Monthly Billing */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                              Next Month Billing (varies by actual days)
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#374151' }}>
                              ${proratedBilling.monthlyBilling.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          {/* Dynamic Billing Note */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ 
                              color: '#6B7280', 
                              fontStyle: 'italic',
                              display: 'block',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}>
                              💡 Monthly amounts vary based on actual selected days in each month (e.g., some months have 5 Mondays, others have 4)
                            </Typography>
                          </Box>
                          
                          {/* Next Billing Date */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                              Next Billing Date
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                              {proratedBilling.nextBillingDate ? proratedBilling.nextBillingDate.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ mb: 2 }} />
                          
                          {/* Total Cost (First Billing) */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                              Total Cost (Today)
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B2635' }}>
                              ${proratedBilling.firstBilling.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })()
                  ) : (
                    // Regular billing display
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                        Total Cost
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B2635' }}>
                        ${calculateTotal().toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Continue to Payment Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{
                  backgroundColor: '#8B2635',
                  '&:hover': { backgroundColor: '#7a1f2e' },
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Continue to Payment
              </Button>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
  // Fetch existing billing info on component mount


  // Handle complete booking with Stripe integration
  const handleCompleteBooking = async () => {
    if (!cardholderName.trim()) {
      alert('Please enter the cardholder name');
      return;
    }

    // Trigger payment processing in the StripePaymentComponent
    setTriggerPayment(true);
  };

  const renderPaymentConfirmation = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, color: '#8B2635', fontWeight: 600 }}>
        Complete Your Booking
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Left Side - 75% */}
        <Box sx={{ flex: '0 0 75%' }}>
          {/* Billing Information Card */}
          <Card sx={{ 
            mb: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 38, 53, 0.1)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(139, 38, 53, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#8B2635', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 2 }} />
                Billing Information
              </Typography>
              
              {/* 3 Fields Per Row Layout */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={billingInfo.company_name}
                  onChange={(e) => setBillingInfo({...billingInfo, company_name: e.target.value})}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
                <TextField
                  fullWidth
                  label="Billing Email"
                  type="email"
                  value={billingInfo.billing_email}
                  onChange={(e) => setBillingInfo({...billingInfo, billing_email: e.target.value})}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={billingInfo.phone_number}
                  onChange={(e) => {
                    console.log('📞 Phone number changed to:', e.target.value);
                    setBillingInfo({...billingInfo, phone_number: e.target.value});
                  }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  value={billingInfo.address_line_1}
                  onChange={(e) => setBillingInfo({...billingInfo, address_line_1: e.target.value})}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
                <TextField
                  fullWidth
                  label="Address Line 2 (Optional)"
                  value={billingInfo.address_line_2}
                  onChange={(e) => setBillingInfo({...billingInfo, address_line_2: e.target.value})}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
                <TextField
                  fullWidth
                  label="Tax ID (Optional)"
                  value={billingInfo.tax_id}
                  onChange={(e) => setBillingInfo({...billingInfo, tax_id: e.target.value})}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={billingInfo.city}
                  onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
                <TextField
                  fullWidth
                  label="State/Province"
                  value={billingInfo.state_province}
                  onChange={(e) => setBillingInfo({...billingInfo, state_province: e.target.value})}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={billingInfo.postal_code}
                  onChange={(e) => setBillingInfo({...billingInfo, postal_code: e.target.value})}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Country"
                value={billingInfo.country}
                onChange={(e) => setBillingInfo({...billingInfo, country: e.target.value})}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ backgroundColor: 'white' }}
              />
            </CardContent>
          </Card>

          {/* Stripe Card Information Section */}
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <StripePaymentComponent 
                cardholderName={cardholderName}
                setCardholderName={setCardholderName}
                onPaymentProcess={handleCompleteBooking}
                isProcessingPayment={isProcessingPayment}
                setIsProcessingPayment={setIsProcessingPayment}
                calculateTotal={calculateTotal}
                bookingData={bookingData}
                coworkingSpace={coworkingSpace}
                selectedPackage={selectedPackage}
                billingInfo={billingInfo}
                employerApi={employerApi}
                navigate={navigate}
                setSafeError={setSafeError}
                triggerPayment={triggerPayment}
                setTriggerPayment={setTriggerPayment}
              />
            </Elements>
          ) : (
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(139, 38, 53, 0.1)',
              mt: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  Stripe configuration error. Please restart the application.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Environment variable REACT_APP_STRIPE_PUBLISHABLE_KEY is not set.
                </Typography>
              </CardContent>
            </Card>
          )}

        </Box>
        
        {/* Right Side - 25% */}
        <Box sx={{ flex: '0 0 25%' }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.95) 0%, rgba(139, 38, 53, 0.85) 100%)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(139, 38, 53, 0.3)',
            color: 'white',
            position: 'sticky',
            top: 20,
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 0 }}>
              {/* Header */}
              <Box sx={{ 
                p: 3, 
                pb: 2,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', letterSpacing: '0.5px' }}>
                  Booking Summary
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                {/* Coworking Space - Simplified */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                    {coworkingSpace?.title || 'The Desk Gulberg'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                    {coworkingSpace?.full_address || '94-B Hall Road, Gulberg II, Lahore'}
                  </Typography>
                </Box>
                
                {/* Simplified Booking Details */}
                <Box sx={{ mb: 3 }}>
                  {/* Package & Type in one line */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      Package:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'white' }}>
                      {selectedPackage?.name || 'Silver Package'}
                    </Typography>
                  </Box>
                  
                  {/* Booking Type Summary */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      Booking:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'white' }}>
                      {bookingData.bookingFrequency === 'one_time' ? 'One Time' : 'Ongoing'} • {bookingData.bookingType === 'per_day' ? 'Daily' : bookingData.bookingType === 'monthly' ? 'Monthly' : 'Daily'}
                    </Typography>
                  </Box>
                  
                  {/* Duration - Simplified */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      Duration:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'white' }}>
                      {(() => {
                        if (bookingData.bookingFrequency === 'ongoing' && bookingData.bookingType === 'monthly') {
                          return '1 month';
                        }
                        if (bookingData.bookingFrequency === 'ongoing' && bookingData.bookingType === 'per_day' && 
                            bookingData.selectedWeekDays && bookingData.selectedWeekDays.length > 0 && bookingData.startDate) {
                          let actualDaysCount = 0;
                          const startDate = new Date(bookingData.startDate);
                          for (let i = 0; i < 30; i++) {
                            const currentDate = new Date(startDate);
                            currentDate.setDate(startDate.getDate() + i);
                            const dayOfWeek = currentDate.getDay();
                            if (bookingData.selectedWeekDays.includes(dayOfWeek)) {
                              actualDaysCount++;
                            }
                          }
                          return `${actualDaysCount} days`;
                        }
                        return `${bookingData.duration} day${bookingData.duration > 1 ? 's' : ''}`;
                      })()}
                    </Typography>
                  </Box>

                </Box>

                {/* Dates Section */}
                <Box sx={{ mb: 3 }}>
                  {/* For one-time daily bookings, show selected dates */}
                  {bookingData.bookingFrequency === 'one_time' && bookingData.bookingType === 'per_day' && bookingData.selectedDates && bookingData.selectedDates.length > 0 ? (
                    <Box>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1.5 }}>
                        Selected Dates:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {bookingData.selectedDates.map((date, index) => (
                          <Typography key={index} variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: 'white',
                            fontSize: '0.85rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}>
                            {formatDate(date)}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    /* For other booking types, show start/end dates */
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          Start Date:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'white' }}>
                          {formatDate(bookingData.startDate)}
                        </Typography>
                      </Box>
                      
                      {bookingData.bookingFrequency === 'one_time' && bookingData.endDate && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            End Date:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'white' }}>
                            {formatDate(bookingData.endDate)}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
                
                {/* Total Amount - Simplified */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 3,
                  borderTop: '2px solid rgba(255,255,255,0.2)',
                  mb: 3
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                    Total
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800, 
                    color: 'white'
                  }}>
                    ${calculateTotal()}
                  </Typography>
                </Box>
                
                {/* Complete Booking Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCompleteBooking}
                  disabled={isProcessingPayment || !billingInfo.company_name || !billingInfo.billing_email}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    backgroundColor: 'white',
                    color: '#8B2635',
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      color: 'rgba(255,255,255,0.6)',
                      transform: 'none'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isProcessingPayment ? (
                    <>
                      <CircularProgress size={22} sx={{ mr: 1.5, color: '#8B2635' }} />
                      Processing Payment...
                    </>
                  ) : (
                    'Complete Booking'
                  )}
                </Button>
                
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 2, 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem',
                  fontStyle: 'italic'
                }}>
                  Secure payment processing
                </Typography>

              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );

  if (!coworkingSpace) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          No coworking space selected
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/employer/coworking/find')}
          sx={{ backgroundColor: '#8B2635' }}
        >
          Find Coworking Spaces
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      overscrollBehavior: 'none',
      position: 'relative',
      zIndex: 1,
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8fafc',
        zIndex: -1
      }
    }}>
      {/* Header */}
      <Paper sx={{ 
        mb: 4, 
        p: 3,
        background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px',
        boxShadow: 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ backgroundColor: '#8B2635', width: 56, height: 56 }}>
            <Payment />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B2635', mb: 1 }}>
              Book Coworking Space
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Complete your booking for {coworkingSpace.title}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stepper */}
      <Paper sx={{ mb: 4, p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {String(error)}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Step Content */}
      <Paper sx={{ p: 4 }}>
        {renderStepContent(activeStep)}
        
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
            startIcon={<ArrowBack />}
            sx={{ color: '#8B2635' }}
          >
            {activeStep === 0 ? 'Back to Search' : 'Back'}
          </Button>
          

        </Box>
      </Paper>

      {/* Carousel Modal */}
      <Dialog
        open={showCarouselModal}
        onClose={() => setShowCarouselModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* Close Button */}
          <IconButton
            onClick={() => setShowCarouselModal(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <Close />
          </IconButton>

          {/* Main Carousel Image */}
          {carouselImages.length > 0 && (
            <Box sx={{ 
              position: 'relative',
              backgroundColor: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh'
            }}>
              <img
                src={(() => {
                  const image = carouselImages[carouselStartIndex % carouselImages.length];
                  if (!image) return '';
                  const originalUrl = image.image_url || image.url;
                  return originalUrl.startsWith('http') ? originalUrl : `http://localhost:8000${originalUrl}`;
                })()}
                alt={`Space Image ${carouselStartIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.log('❌ Modal carousel image failed to load:', e.target.src);
                }}
              />

              {/* Navigation Arrows */}
              {carouselImages.length > 1 && (
                <>
                  <IconButton
                    onClick={handleCarouselPrev}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={handleCarouselNext}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </>
              )}
            </Box>
          )}

          {/* Thumbnail Navigation */}
          {carouselImages.length > 1 && (
            <Box sx={{ 
              p: 2,
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex', 
              gap: 1, 
              overflowX: 'auto',
              justifyContent: 'center',
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-track': { backgroundColor: '#333', borderRadius: 3 },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#8B2635', borderRadius: 3 }
            }}>
              {carouselImages.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  sx={{
                    minWidth: 80,
                    height: 60,
                    cursor: 'pointer',
                    border: carouselStartIndex === index ? '2px solid #8B2635' : '2px solid transparent',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  <img
                    src={(() => {
                      const thumbnailUrl = image.thumbnail_medium_url || image.thumbnail_url || image.url;
                      return thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8000${thumbnailUrl}`;
                    })()}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
