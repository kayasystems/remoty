import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { CreditCard, Lock } from '@mui/icons-material';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

const StripePaymentForm = ({ 
  onPaymentSuccess, 
  onPaymentError, 
  amount, 
  bookingData,
  coworkingSpace,
  selectedPackage,
  loading: parentLoading = false 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found. Please refresh and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: bookingData.employeeId ? 'Employee Booking' : 'Employer',
          email: 'user@example.com', // You can get this from user context
        },
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message);
        setLoading(false);
        return;
      }

      // Create payment intent on backend
      const response = await fetch('/api/employer/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          payment_method_id: paymentMethod.id,
          booking_data: bookingData,
          coworking_space_id: coworkingSpace?.id,
          package_id: selectedPackage?.id,
        }),
      });

      const paymentIntent = await response.json();

      if (!response.ok) {
        throw new Error(paymentIntent.detail || 'Payment failed');
      }

      // Confirm payment
      const { error: confirmError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.client_secret
      );

      if (confirmError) {
        setError(confirmError.message);
      } else if (confirmedPayment.status === 'succeeded') {
        onPaymentSuccess(confirmedPayment);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Card Input Section */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.2)',
        borderRadius: '12px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CreditCard sx={{ mr: 1, color: '#8B2635' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
            Payment Information
          </Typography>
        </Box>

        <Box sx={{ 
          p: 2, 
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: 'white',
          '&:focus-within': {
            borderColor: '#8B2635',
            boxShadow: '0 0 0 3px rgba(139, 38, 53, 0.1)'
          }
        }}>
          <CardElement 
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 2, 
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          <Lock sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="caption">
            Your payment information is secure and encrypted
          </Typography>
        </Box>
      </Paper>

      {/* Payment Summary */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        backgroundColor: 'rgba(139, 38, 53, 0.05)',
        border: '1px solid rgba(139, 38, 53, 0.2)',
        borderRadius: '12px'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
            Total Amount
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B2635' }}>
            ${amount.toFixed(2)}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
          {bookingData.bookingFrequency === 'ongoing' ? 'Monthly subscription' : 'One-time payment'}
        </Typography>
      </Paper>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={!stripe || !cardComplete || loading || parentLoading}
        sx={{
          py: 2,
          fontSize: '1.1rem',
          fontWeight: 600,
          backgroundColor: '#8B2635',
          '&:hover': {
            backgroundColor: '#7a2230',
          },
          '&:disabled': {
            backgroundColor: '#d1d5db',
          }
        }}
      >
        {loading || parentLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
            Processing Payment...
          </Box>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>

      <Typography variant="caption" sx={{ 
        display: 'block', 
        textAlign: 'center', 
        mt: 2, 
        color: '#6b7280' 
      }}>
        By completing this payment, you agree to the terms and conditions
      </Typography>
    </Box>
  );
};

export default StripePaymentForm;
