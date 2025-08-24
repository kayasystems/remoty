// src/pages/employer/CheckoutPage.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { employerApi } from '../../services/employer';

export default function CheckoutPage() {
  const location = useLocation();
  const { employeeId, coworkingSpace } = location.state || {};

  const [employee, setEmployee] = useState(null);
  const [space, setSpace] = useState(coworkingSpace || null);

  const [bookingFrequency, setBookingFrequency] = useState('one-time');
  const [bookingType, setBookingType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState('');
  const [durationPerDay, setDurationPerDay] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const bookingOptions = {
    'one-time': [
      { value: 'one_day_only', label: 'One Day Only' },
      { value: 'one_week_only', label: 'One Week Only' },
      { value: 'one_month_only', label: 'One Month Only' },
    ],
    'ongoing': [
      { value: 'monthly_fulltime', label: 'Monthly Full-Time (9hrs/day)' },
      { value: 'monthly_halfday', label: 'Monthly Half-Day (4hrs/day)' },
      { value: 'one_day_per_month', label: 'One Day / Month' },
      { value: 'weekly_recurring', label: 'Weekly Recurring (pick days)' },
    ]
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await employerApi.get('/employer/employees');
        const emp = res.data.find(e => e.id === parseInt(employeeId));
        if (!emp) throw new Error('Employee not found');
        setEmployee(emp);
      } catch (err) {
        setError('❌ Failed to load employee data.');
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetchEmployee();
    else {
      setError("❌ Missing employee data.");
      setLoading(false);
    }
  }, [employeeId]);

  const handleBooking = async () => {
    if (!startDate || (!bookingType && bookingFrequency === 'one-time')) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = {
      employee_id: parseInt(employeeId),
      coworking_space_id: parseInt(space.id),
      booking_type: bookingType,
      start_date: startDate,
      end_date: endDate || startDate,
      is_ongoing: bookingFrequency === 'ongoing',
      subscription_mode: bookingType,
      days_of_week: daysOfWeek || null,
      duration_per_day: durationPerDay ? parseInt(durationPerDay) : null,
      total_cost: 0, // can be calculated later
      notes
    };

    try {
      const res = await employerApi.post('/employer/book-coworking', payload);
      setMessage(`✅ "${space.title}" successfully booked for ${employee.name}`);
    } catch (err) {
      if (err.response) {
        setError(`❌ Server error: ${err.response.data.detail || 'Unknown error'}`);
      } else if (err.request) {
        setError('❌ No response from server. Please check your network.');
      } else {
        setError(`❌ Request error: ${err.message}`);
      }
    }
  };

  if (loading) return <p>Loading checkout details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!employee || !space) return <p style={{ color: 'red' }}>❌ Missing required booking data.</p>;

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '1rem' }}>
      <h2>Confirm Coworking Space Booking</h2>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <h3>Employee</h3>
        <p><strong>Name:</strong> {employee.name}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>City:</strong> {employee.city}</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Coworking Space</h3>
        <p><strong>Title:</strong> {space.title}</p>
        <p><strong>Address:</strong> {space.address}, {space.city}</p>
        <p><strong>Distance:</strong> {space.distance_km} km</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Booking Preferences</h3>

        <label><strong>Booking Frequency:</strong></label><br />
        <select value={bookingFrequency} onChange={e => {
          setBookingFrequency(e.target.value);
          setBookingType('');
        }}>
          <option value="one-time">One-Time</option>
          <option value="ongoing">Ongoing</option>
        </select>

        <br /><br />
        <label><strong>Booking Type:</strong></label><br />
        <select value={bookingType} onChange={e => setBookingType(e.target.value)}>
          <option value="">-- Select --</option>
          {bookingOptions[bookingFrequency].map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <br /><br />
        <label><strong>Start Date:</strong></label><br />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />

        <br /><br />
        {bookingFrequency === 'one-time' && (
          <>
            <label><strong>End Date:</strong></label><br />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <br /><br />
          </>
        )}

        {bookingType === 'weekly_recurring' && (
          <>
            <label><strong>Days of Week (e.g., Mon,Wed):</strong></label><br />
            <input
              type="text"
              placeholder="Mon,Wed,Fri"
              value={daysOfWeek}
              onChange={e => setDaysOfWeek(e.target.value)}
            />
            <br /><br />
          </>
        )}

        {bookingFrequency === 'ongoing' && (
          <>
            <label><strong>Hours per Day:</strong></label><br />
            <input
              type="number"
              min="1"
              max="12"
              value={durationPerDay}
              onChange={e => setDurationPerDay(e.target.value)}
              placeholder="e.g., 4 or 9"
            />
            <br /><br />
          </>
        )}

        <label><strong>Additional Notes (optional):</strong></label><br />
        <textarea
          rows="2"
          style={{ width: '100%' }}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <button onClick={handleBooking} disabled={loading}>
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </div>
  );
}
