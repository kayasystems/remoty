import React, { useEffect, useState } from 'react';
import { Calendar } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import localizer from '../../utils/calendarLocalizer';
import { employerApi } from '../../services/employer';
import { startOfDay, subDays } from 'date-fns';
import { format } from 'date-fns';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Custom renderer for calendar event with enhanced styling
const CustomEvent = ({ event }) => {
  const getStatusIcon = () => {
    switch (event.status) {
      case 'present_full':
        return <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5, color: 'white' }} />;
      case 'present_partial':
        return <WarningIcon sx={{ fontSize: 14, mr: 0.5, color: 'white' }} />;
      case 'absent':
        return <CancelIcon sx={{ fontSize: 14, mr: 0.5, color: 'white' }} />;
      case 'booked':
        return <BusinessIcon sx={{ fontSize: 14, mr: 0.5, color: 'white' }} />;
      case 'future_booking':
        return <BusinessIcon sx={{ fontSize: 14, mr: 0.5, color: 'white' }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      whiteSpace: 'pre-line',
      fontSize: '0.75rem',
      fontWeight: 500
    }}>
      {getStatusIcon()}
      {event.title}
    </Box>
  );
};

const AttendanceReportsPage = () => {
  const today = startOfDay(new Date());
  const defaultStart = subDays(today, 30);
  const defaultEnd = new Date(today);
  defaultEnd.setDate(defaultEnd.getDate() + 60); // Show 60 days into the future

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(format(defaultStart, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(defaultEnd, 'yyyy-MM-dd'));

  // Load employee list
  useEffect(() => {
    employerApi
      .get('/employer/employees')
      .then((res) => {
        setEmployees(res.data);
      })
      .catch((err) => console.error('❌ Failed to fetch employees:', err));
  }, []);

  // Load attendance data with coworking booking integration
  const fetchAttendance = async () => {
    if (!selectedEmployee || !startDate || !endDate) return;

    setLoading(true);
    try {
      // Fetch both attendance and booking data
      const [attendanceRes, bookingsRes] = await Promise.all([
        employerApi.get(`/employer/attendance/employee/${selectedEmployee}`, {
          params: { start_date: startDate, end_date: endDate }
        }),
        employerApi.get(`/employer/bookings`, {
          params: { employee_id: selectedEmployee }
        })
      ]);

      const attendanceData = attendanceRes.data;
      const bookingsData = bookingsRes.data;

      // Create comprehensive booking date mapping with coworking space info
      const bookedDatesMap = new Map();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      
      bookingsData.forEach(booking => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        const coworkingSpace = booking.coworking_space || {};
        
        // Generate all dates in booking period (weekdays only if specified)
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = format(d, 'yyyy-MM-dd');
          const dayOfWeek = d.getDay(); // 0=Sunday, 1=Monday, etc.
          
          // Check if this day should be included based on booking days_of_week
          let shouldInclude = true;
          if (booking.days_of_week) {
            const allowedDays = booking.days_of_week.split(',').map(day => day.trim().toLowerCase());
            const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            shouldInclude = allowedDays.includes(dayNames[dayOfWeek]);
          }
          
          if (shouldInclude) {
            const compareDate = new Date(d);
            compareDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
            
            bookedDatesMap.set(dateStr, {
              booking,
              coworkingSpace: coworkingSpace.title || 'Coworking Space',
              bookingType: booking.booking_type || 'daily',
              isFuture: compareDate > today
            });
          }
        }
      });

      // Create attendance events map
      const attendanceMap = new Map();
      attendanceData.forEach(record => {
        const recordDate = format(new Date(record.date), 'yyyy-MM-dd');
        attendanceMap.set(recordDate, record);
      });

      // Combine attendance and booking data
      const allEvents = [];
      
      // Add attendance records for past/present days
      attendanceData.forEach((record) => {
        const recordDate = format(new Date(record.date), 'yyyy-MM-dd');
        const bookingInfo = bookedDatesMap.get(recordDate);
        const hasClockIn = !!record.clock_in;
        const hasClockOut = !!record.clock_out;
        
        const inTime = record.clock_in ? new Date(record.clock_in) : null;
        const outTime = record.clock_out ? new Date(record.clock_out) : null;

        const formattedIn = inTime ? format(inTime, 'HH:mm') : '--';
        const formattedOut = outTime ? format(outTime, 'HH:mm') : '--';

        let status = 'absent';
        let titleText = '';
        let workHours = 0;

        if (hasClockIn && hasClockOut) {
          const durationMs = outTime - inTime;
          workHours = durationMs / (1000 * 60 * 60); // Convert to hours
          
          if (workHours >= 8) {
            status = 'present_full';
            titleText = `✅ Full Day Present\nIn: ${formattedIn} Out: ${formattedOut}\nWorked: ${workHours.toFixed(1)}h`;
          } else if (workHours >= 4) {
            status = 'present_partial';
            titleText = `⚠️ Partial Day Present\nIn: ${formattedIn} Out: ${formattedOut}\nWorked: ${workHours.toFixed(1)}h`;
          } else {
            status = 'present_partial';
            titleText = `⚠️ Short Day\nIn: ${formattedIn} Out: ${formattedOut}\nWorked: ${workHours.toFixed(1)}h`;
          }
        } else if (bookingInfo) {
          status = 'absent';
          titleText = `❌ Absent on Booked Day\nNo attendance recorded`;
        } else {
          status = 'absent';
          titleText = `❌ Absent\nNo attendance recorded`;
        }

        allEvents.push({
          title: titleText,
          start: new Date(record.date),
          end: new Date(record.date),
          allDay: true,
          status: status,
          workHours: workHours,
          isBooked: !!bookingInfo,
          coworkingSpace: bookingInfo?.coworkingSpace
        });
      });

      // Add future booked days (without attendance data)
      bookedDatesMap.forEach((bookingInfo, dateStr) => {
        if (bookingInfo.isFuture && !attendanceMap.has(dateStr)) {
          const eventDate = new Date(dateStr);
          // Only show future dates within the selected date range
          const rangeStart = new Date(startDate);
          const rangeEnd = new Date(endDate);
          
          if (eventDate >= rangeStart && eventDate <= rangeEnd) {
            allEvents.push({
              title: `📅 Upcoming Booking\n${bookingInfo.booking?.duration_per_day || 8}h booked`,
              start: eventDate,
              end: eventDate,
              allDay: true,
              status: 'future_booking',
              workHours: 0,
              isBooked: true,
              isFuture: true,
              coworkingSpace: bookingInfo.coworkingSpace
            });
          }
        }
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('❌ Failed to fetch attendance data:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor, borderColor, textColor;
    
    switch (event.status) {
      case 'present_full':
        backgroundColor = '#10b981'; // Green - Full day attendance
        borderColor = '#059669';
        textColor = '#ffffff';
        break;
      case 'present_partial':
        backgroundColor = '#f59e0b'; // Orange - Partial attendance
        borderColor = '#d97706';
        textColor = '#ffffff';
        break;
      case 'absent':
        backgroundColor = '#ef4444'; // Red - Absent on booked day
        borderColor = '#dc2626';
        textColor = '#ffffff';
        break;
      case 'booked':
        backgroundColor = '#8B2635'; // Burgundy - Booked day (according to plan)
        borderColor = '#6d1f2c';
        textColor = '#ffffff';
        break;
      case 'future_booking':
        backgroundColor = '#3b82f6'; // Blue - Future booking
        borderColor = '#2563eb';
        textColor = '#ffffff';
        break;
      default:
        backgroundColor = '#6b7280'; // Gray - Default
        borderColor = '#4b5563';
        textColor = '#ffffff';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: textColor,
        whiteSpace: 'pre-line',
        borderRadius: '6px',
        opacity: 0.95,
        border: `2px solid ${borderColor}`,
        padding: '4px 6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minHeight: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      },
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Glassmorphism Header Section */}
      <Paper sx={{ 
        p: 4, 
        mb: 4,
        background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px'
      }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: '#8B2635', mr: 2, width: 56, height: 56 }}>
            <CalendarIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: '#8B2635', fontWeight: 700, mb: 1 }}>
              Coworking Attendance Reports
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Track employee attendance at coworking spaces with real-time status monitoring
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Legend Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: '#f8fafc' }}>
        <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 2 }}>
          Attendance Status Legend
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <Box sx={{ 
                width: 20, 
                height: 20, 
                backgroundColor: '#8B2635', 
                borderRadius: 1, 
                mr: 1 
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Booked (According to Plan)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <Box sx={{ 
                width: 20, 
                height: 20, 
                backgroundColor: '#10b981', 
                borderRadius: 1, 
                mr: 1 
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Full Day Present (8+ hours)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <Box sx={{ 
                width: 20, 
                height: 20, 
                backgroundColor: '#f59e0b', 
                borderRadius: 1, 
                mr: 1 
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Partial Day (4-8 hours)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <Box sx={{ 
                width: 20, 
                height: 20, 
                backgroundColor: '#ef4444', 
                borderRadius: 1, 
                mr: 1 
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Absent (Booked but not attended)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Controls Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel sx={{ '&.Mui-focused': { color: '#8B2635' } }}>
                Select Employee
              </InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                label="Select Employee"
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8B2635' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8B2635' },
                  minWidth: '250px'
                }}
              >
                <MenuItem value="">
                  <em>-- Choose Employee --</em>
                </MenuItem>
                {employees.map((emp) => {
                  const label = String(
                    emp.name || emp.full_name || emp.email || `Employee #${emp.id}`
                  );
                  return (
                    <MenuItem key={emp.id} value={emp.id}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: '#8B2635', width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                          {label.charAt(0).toUpperCase()}
                        </Avatar>
                        {label}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchAttendance}
              disabled={!selectedEmployee || loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScheduleIcon />}
              sx={{
                backgroundColor: '#8B2635',
                color: 'white',
                py: 1.5,
                '&:hover': { backgroundColor: '#6d1f2c' },
                '&:disabled': { backgroundColor: '#94a3b8' }
              }}
            >
              {loading ? 'Loading...' : 'Load Attendance'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Calendar Section */}
      {!loading && selectedEmployee && events.length > 0 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 3 }}>
            Attendance Calendar
          </Typography>
          <Box sx={{ 
            '& .rbc-calendar': {
              fontFamily: '"Roboto","Helvetica","Arial",sans-serif'
            },
            '& .rbc-header': {
              backgroundColor: '#f8fafc',
              color: '#1e293b',
              fontWeight: 600,
              padding: '12px 8px',
              borderBottom: '2px solid #e2e8f0'
            },
            '& .rbc-today': {
              backgroundColor: '#fef3f2'
            },
            '& .rbc-off-range-bg': {
              backgroundColor: '#f1f5f9'
            }
          }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 800 }}
              views={['month']}
              eventPropGetter={eventStyleGetter}
              components={{ event: CustomEvent }}
            />
          </Box>
        </Paper>
      )}

      {/* Empty State */}
      {!loading && selectedEmployee && events.length === 0 && (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center', backgroundColor: '#f8fafc' }}>
          <CalendarIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
            No Attendance Data Found
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            No attendance records found for the selected employee and date range.
          </Typography>
        </Paper>
      )}

      {/* Loading State */}
      {loading && (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#8B2635', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748b' }}>
            Loading attendance data...
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default AttendanceReportsPage;
