import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { employerApi } from '../../services/employer';

export default function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await employerApi.get(`/employer/bookings/${id}`);
        const data = response.data;
        setBooking(data);

        setForm({
          employee_id: data.employee_id,
          coworking_space_id: data.coworking_space_id,
          booking_type: data.booking_type || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          subscription_mode: data.subscription_mode || '',
          is_ongoing: Boolean(data.is_ongoing),
          days_of_week: data.days_of_week || '',
          duration_per_day: data.duration_per_day ?? '',
          total_cost: data.total_cost ?? '',
          notes: data.notes || ''
        });

        console.log("🧠 Loaded booking:", data);
      } catch (err) {
        console.error(err);
        setError('Failed to load booking data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      employee_id: form.employee_id,
      coworking_space_id: form.coworking_space_id,
      booking_type: form.booking_type,
      start_date: form.start_date,
      end_date: form.end_date,
      subscription_mode: form.subscription_mode,
      is_ongoing: Boolean(form.is_ongoing),
      days_of_week: form.days_of_week,
      duration_per_day: form.duration_per_day !== '' ? parseFloat(form.duration_per_day) : 0,
      total_cost: form.total_cost !== '' ? parseFloat(form.total_cost) : 0,
      notes: form.notes
    };

    console.log('🔍 Sending payload to backend:', payload);

    try {
      await employerApi.put(`/employer/bookings/${id}`, payload);
      alert('Booking updated successfully');
      navigate(`/employer/booking-details?id=${id}`);
    } catch (err) {
      console.error('❌ Failed to update booking:', err);

      if (err.response?.data) {
        const formatted = JSON.stringify(err.response.data.detail || err.response.data, null, 2);
        console.error('🧩 Validation error:\n' + formatted);
        alert('Validation error:\n' + formatted);
      }

      setError('Failed to update booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress sx={{ color: '#8B2635' }} />
          <Typography variant="h6" sx={{ ml: 2, color: '#64748b' }}>
            Loading booking details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#8B2635', borderColor: '#8B2635' }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Booking not found.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#8B2635', borderColor: '#8B2635' }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#fff' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
            Edit Booking
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => navigate(`/employer/coworking/booking/${booking.id}`)}
              sx={{ color: '#8B2635', borderColor: '#8B2635', '&:hover': { borderColor: '#6d1f2c', backgroundColor: '#f8f9fa' } }}
            >
              View Details
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ color: '#64748b', borderColor: '#64748b', '&:hover': { borderColor: '#475569', backgroundColor: '#f8f9fa' } }}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Employee Information Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: '#8B2635', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                  Employee Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ '& > div': { mb: 2 } }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1e293b' }}>
                    {booking.employee_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1e293b' }}>
                    {booking.employee_email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
                    Contact
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1e293b' }}>
                    {booking.employee_contact || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Coworking Space Information Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: '#8B2635', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                  Coworking Space Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ '& > div': { mb: 2 } }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1e293b' }}>
                    {booking.coworking_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1e293b' }}>
                    {booking.coworking_address}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
                    City
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1e293b' }}>
                    {booking.coworking_city}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
                    Country
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1e293b' }}>
                    {booking.coworking_country || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Form */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: '#8B2635', mr: 2 }}>
                  <CalendarIcon />
                </Avatar>
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                  Booking Details (Editable)
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      name="start_date"
                      label="Start Date"
                      value={form.start_date}
                      onChange={handleChange}
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#8B2635' },
                          '&.Mui-focused fieldset': { borderColor: '#8B2635' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      name="end_date"
                      label="End Date"
                      value={form.end_date}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#8B2635' },
                          '&.Mui-focused fieldset': { borderColor: '#8B2635' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ '&.Mui-focused': { color: '#8B2635' } }}>Booking Type</InputLabel>
                      <Select
                        name="booking_type"
                        value={form.booking_type}
                        onChange={handleChange}
                        label="Booking Type"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8B2635' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8B2635' }
                        }}
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="subscription_mode"
                      label="Subscription Mode"
                      value={form.subscription_mode}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#8B2635' },
                          '&.Mui-focused fieldset': { borderColor: '#8B2635' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="days_of_week"
                      label="Days of Week"
                      value={form.days_of_week}
                      onChange={handleChange}
                      placeholder="e.g. mon,tue,wed"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#8B2635' },
                          '&.Mui-focused fieldset': { borderColor: '#8B2635' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="duration_per_day"
                      label="Daily Duration (hours)"
                      value={form.duration_per_day}
                      onChange={handleChange}
                      inputProps={{ step: 0.5 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#8B2635' },
                          '&.Mui-focused fieldset': { borderColor: '#8B2635' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="total_cost"
                      label="Total Cost (USD)"
                      value={form.total_cost}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <Typography sx={{ color: '#8B2635', mr: 1, fontWeight: 600 }}>$</Typography>
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#8B2635' },
                          '&.Mui-focused fieldset': { borderColor: '#8B2635' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_ongoing"
                          checked={form.is_ongoing}
                          onChange={handleChange}
                          sx={{
                            color: '#8B2635',
                            '&.Mui-checked': { color: '#8B2635' }
                          }}
                        />
                      }
                      label="Ongoing Booking"
                      sx={{ mt: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="notes"
                      label="Notes"
                      value={form.notes}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#8B2635' },
                          '&.Mui-focused fieldset': { borderColor: '#8B2635' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                      }}
                    />
                  </Grid>
                </Grid>

                <Box display="flex" gap={2} mt={4} flexWrap="wrap">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{
                      backgroundColor: '#8B2635',
                      color: 'white',
                      px: 3,
                      py: 1.5,
                      '&:hover': { backgroundColor: '#6d1f2c' },
                      '&:disabled': { backgroundColor: '#94a3b8' }
                    }}
                  >
                    {submitting ? 'Updating...' : 'Save Changes'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={async () => {
                      const confirmed = window.confirm('Are you sure you want to delete this booking?');
                      if (!confirmed) return;

                      try {
                        await employerApi.delete(`/employer/bookings/${id}`);
                        alert('Booking deleted successfully');
                        navigate('/employer/bookings');
                      } catch (err) {
                        console.error('❌ Failed to delete booking:', err);
                        alert('Failed to delete booking.');
                      }
                    }}
                    sx={{
                      color: '#dc2626',
                      borderColor: '#dc2626',
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#b91c1c',
                        backgroundColor: '#fef2f2'
                      }
                    }}
                  >
                    Delete Booking
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
