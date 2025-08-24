import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { format } from 'date-fns';

const localizer = momentLocalizer(moment);

// Custom Event Component for Calendar - Copied from working AttendanceReportsPage
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
      {event.title}
    </Box>
  );
};

// Event Style Getter - Copied from working AttendanceReportsPage
const eventStyleGetter = (event) => {
  let backgroundColor, borderColor, textColor;
  
  switch (event.status) {
    case 'present_full':
      backgroundColor = 'rgb(16, 185, 129)'; // Green - Full day attendance
      borderColor = 'rgb(16, 185, 129)';
      textColor = '#ffffff';
      break;
    case 'present_partial':
      backgroundColor = 'rgb(245, 158, 11)'; // Orange - Partial attendance
      borderColor = '#d97706';
      textColor = '#ffffff';
      break;
    case 'absent':
      backgroundColor = 'rgb(239, 68, 68)'; // Red - Absent on booked day
      borderColor = 'rgb(239, 68, 68)';
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

// Custom Toolbar Component for Calendar
const CustomToolbar = ({ label, onNavigate }) => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2
  }}>
    <IconButton 
      onClick={() => onNavigate('PREV')}
      sx={{ 
        background: 'rgba(59, 130, 246, 0.1)',
        '&:hover': { background: 'rgba(59, 130, 246, 0.2)' }
      }}
    >
      <ChevronLeft sx={{ color: '#3b82f6' }} />
    </IconButton>
    
    <Typography variant="h5" sx={{
      color: '#1e293b',
      fontWeight: 700,
      textAlign: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
      {label}
    </Typography>
    
    <IconButton 
      onClick={() => onNavigate('NEXT')}
      sx={{ 
        background: 'rgba(59, 130, 246, 0.1)',
        '&:hover': { background: 'rgba(59, 130, 246, 0.2)' }
      }}
    >
      <ChevronRight sx={{ color: '#3b82f6' }} />
    </IconButton>
  </Box>
);
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Button,
  CircularProgress,
  Paper,
  Badge,
  Tooltip,
  Stack
} from '@mui/material';

import {
  ArrowBack,
  Person,
  LocationOn,
  Email,
  Phone,
  CalendarToday as CalendarIcon,
  Assignment,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  EventNote,
  AccessTime,
  Visibility,
  Edit,
  Add,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import {
  MapPin,
  Calendar as LucideCalendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Eye,
} from 'lucide-react';
import { employerApi } from '../../services/employer';



export default function EmployeeDetails() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [taskFilter, setTaskFilter] = useState('all');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const navigate = useNavigate();

  // Event style getter for calendar
  const eventStyleGetter = (event) => {
    let backgroundColor = 'rgb(245, 158, 11)';
    let borderColor = 'rgb(245, 158, 11)';

    switch (event.status) {
      // Booked coworking days - Modern lighter tones
      case 'booked_present_full':
        backgroundColor = 'rgb(16, 185, 129)'; // Modern emerald green
        borderColor = 'rgb(16, 185, 129)';
        break;
      case 'booked_present_partial':
        backgroundColor = 'rgb(245, 158, 11)'; // Custom orange as requested
        borderColor = '#d97706';
        break;
      case 'booked_absent':
        backgroundColor = 'rgb(239, 68, 68)'; // Softer red for missed booking
        borderColor = 'rgb(239, 68, 68)';
        break;
      
      // Remote work days - Lighter, modern colors
      case 'remote_present_full':
        backgroundColor = 'rgb(16, 185, 129)'; // Light emerald for remote full day
        borderColor = 'rgb(16, 185, 129)';
        break;
      case 'remote_present_partial':
        backgroundColor = 'rgb(245, 158, 11)'; // Light amber for remote partial day
        borderColor = 'rgb(245, 158, 11)';
        break;
      
      // No work recorded
      case 'no_work':
        backgroundColor = '#9ca3af'; // Lighter gray for no work
        borderColor = '#6b7280';
        break;
      
      // Future bookings - Modern blue
      case 'future_booking':
        backgroundColor = '#60a5fa'; // Lighter blue for future bookings
        borderColor = '#3b82f6';
        break;
      
      // Legacy statuses (fallback)
      case 'present_full':
        backgroundColor = 'rgb(16, 185, 129)';
        borderColor = 'rgb(16, 185, 129)';
        break;
      case 'present_partial':
        backgroundColor = 'rgb(245, 158, 11)';
        borderColor = 'rgb(245, 158, 11)';
        break;
      case 'absent':
        backgroundColor = 'rgb(239, 68, 68)';
        borderColor = 'rgb(239, 68, 68)';
        break;
      case 'booked':
        backgroundColor = '#3B82F6';
        borderColor = '#2563EB';
        break;
      
      default:
        backgroundColor = 'rgb(245, 158, 11)';
        borderColor = 'rgb(245, 158, 11)';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '4px 6px',
        margin: '1px',
        height: 'calc(100% - 2px)',
        width: 'calc(100% - 2px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease'
      }
    };
  };

  useEffect(() => {
    document.title = 'Employee Details - Remoty';
    const fetchEmployee = async () => {
      try {
        const response = await employerApi.get(`/employer/employees/${id}`);
        setEmployee(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch employee details.');
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await employerApi.get(`/employer/bookings/employee/${id}`);
        setBookings(response.data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    if (id) {
      Promise.all([fetchEmployee(), fetchBookings()]).finally(() => {
        setLoading(false);
      });
    }
  }, [id]);

  const fetchAttendanceData = async () => {
    if (!id) return;
    
    console.log('🔍 Fetching attendance data for employee:', id);
    setLoading(true);
    try {
      // Use existing tasks endpoint and filter by employee
      const response = await employerApi.get(`/employer/tasks?employee_id=${id}`);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching employee tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeTasks = async () => {
    if (!id) return;
    
    setTasksLoading(true);
    try {
      // Use existing tasks endpoint and filter by employee
      const response = await employerApi.get(`/employer/tasks?employee_id=${id}`);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching employee tasks:', error);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchEmployeeAttendance = async () => {
    if (!id) return;

    setAttendanceLoading(true);
    try {
      console.log('🔄 Fetching attendance for employee:', id);
      
      // Calculate date range (30 days back, 60 days forward)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 60);
      
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      console.log('📅 Date range:', startDateStr, 'to', endDateStr);
      
      // Fetch both attendance and booking data using the working API endpoints
      const [attendanceRes, bookingsRes] = await Promise.all([
        employerApi.get(`/employer/attendance/employee/${id}`, {
          params: { start_date: startDateStr, end_date: endDateStr }
        }),
        employerApi.get(`/employer/bookings`, {
          params: { employee_id: id }
        })
      ]);

      const attendanceData = attendanceRes.data;
      const bookingsData = bookingsRes.data;

      console.log('📊 Raw attendance data:', attendanceData);
      console.log('📊 Raw bookings data:', bookingsData);

      // Set attendance data for the tab count and display
      setAttendance(attendanceData);

      // Create comprehensive booking date mapping with coworking space info
      const bookedDatesMap = new Map();
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
          const rangeStart = new Date(startDateStr);
          const rangeEnd = new Date(endDateStr);
          
          if (eventDate >= rangeStart && eventDate <= rangeEnd) {
            allEvents.push({
              title: `📅 Upcoming Booking\n${bookingInfo.coworkingSpace}\n${bookingInfo.bookingType}`,
              start: eventDate,
              end: eventDate,
              allDay: true,
              status: 'future_booking',
              workHours: 0,
              isBooked: true,
              coworkingSpace: bookingInfo.coworkingSpace
            });
          }
        }
      });

      console.log('📊 Final calendar events:', allEvents);
      console.log('📊 Sample event structure:', allEvents[0]);
      console.log('📊 Total events created:', allEvents.length);

      // Validate events before setting
      const validEvents = allEvents.filter(event => 
        event.start instanceof Date && 
        event.end instanceof Date && 
        !isNaN(event.start.getTime()) && 
        !isNaN(event.end.getTime())
      );

      console.log('✅ Valid events for calendar:', validEvents.length);
      setCalendarEvents(validEvents);

    } catch (error) {
      console.error('❌ Error fetching attendance:', error);
      setCalendarEvents([]);
    } finally {
      setAttendanceLoading(false);
    }
  };



  // Load all data on initial page load
  useEffect(() => {
    if (id) {
      fetchEmployeeTasks();
      fetchEmployeeAttendance();
    }
  }, [id]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRandomColor = (id) => {
    const colors = [
      'var(--primary-500)',
      'var(--success-500)',
      'var(--warning-500)',
      'var(--info-500)',
      '#8B5CF6',
      '#F59E0B',
      '#EF4444',
      '#10B981'
    ];
    return colors[id % colors.length];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBookingStatusColor = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'completed';
  };

  const getBookingStatusText = (startDate, endDate) => {
    const status = getBookingStatusColor(startDate, endDate);
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Calendar Grid Component
  const CalendarGrid = ({ attendance, calendarEvents }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and number of days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Create calendar data map
    const calendarData = new Map();
    
    // Process attendance data
    if (attendance) {
      attendance.forEach(record => {
        const date = new Date(record.work_date);
        const dateStr = format(date, 'yyyy-MM-dd');
        const hasClockIn = !!record.check_in_time;
        const hasClockOut = !!record.check_out_time;
        
        let workHours = 0;
        if (hasClockIn && hasClockOut) {
          const inTime = new Date(record.check_in_time);
          const outTime = new Date(record.check_out_time);
          workHours = (outTime - inTime) / (1000 * 60 * 60);
        }
        
        calendarData.set(dateStr, {
          type: 'attendance',
          record,
          workHours,
          hasClockIn,
          hasClockOut
        });
      });
    }
    
    // Process booking events
    if (calendarEvents) {
      calendarEvents.forEach(event => {
        const dateStr = format(new Date(event.start), 'yyyy-MM-dd');
        const existing = calendarData.get(dateStr) || {};
        
        calendarData.set(dateStr, {
          ...existing,
          booking: event,
          isBooked: event.isBooked,
          isFuture: event.isFuture,
          bookedHours: event.bookedHours || 8
        });
      });
    }
    
    // Generate calendar days
    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = calendarData.get(dateStr);
      
      calendarDays.push({
        date,
        day,
        dateStr,
        isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
        data: dayData
      });
    }
    
    // Render calendar grid
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    const getDayStatus = (dayData) => {
      if (!dayData?.data) return null;
      
      const { record, workHours, hasClockIn, hasClockOut, isBooked, isFuture, bookedHours } = dayData.data;
      
      if (isFuture) {
        return {
          status: 'future_booking',
          color: '#3b82f6',
          text: `📅 ${bookedHours}h booked`,
          icon: '📅'
        };
      }
      
      if (hasClockIn && hasClockOut) {
        if (isBooked) {
          if (workHours >= bookedHours * 0.9) {
            return {
              status: 'booked_full',
              color: '#10b981',
              text: `✅ ${workHours.toFixed(1)}h`,
              icon: '✅'
            };
          } else if (workHours >= bookedHours * 0.5) {
            return {
              status: 'booked_partial',
              color: 'rgb(245, 158, 11)',
              text: `⚠️ ${workHours.toFixed(1)}h`,
              icon: '⚠️'
            };
          } else {
            return {
              status: 'booked_short',
              color: 'rgb(245, 158, 11)',
              text: `⚠️ ${workHours.toFixed(1)}h`,
              icon: '⚠️'
            };
          }
        } else {
          if (workHours >= 8) {
            return {
              status: 'remote_full',
              color: '#10b981',
              text: `🏠 ${workHours.toFixed(1)}h`,
              icon: '🏠'
            };
          } else if (workHours >= 4) {
            return {
              status: 'remote_partial',
              color: 'rgb(245, 158, 11)',
              text: `🏠 ${workHours.toFixed(1)}h`,
              icon: '🏠'
            };
          } else {
            return {
              status: 'remote_short',
              color: 'rgb(245, 158, 11)',
              text: `🏠 ${workHours.toFixed(1)}h`,
              icon: '🏠'
            };
          }
        }
      } else if (isBooked) {
        return {
          status: 'booked_absent',
          color: '#ef4444',
          text: `❌ Absent`,
          icon: '❌'
        };
      }
      
      return null;
    };
    
    return (
      <Box>
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={1} key={weekIndex} sx={{ mb: 1 }}>
            {week.map((dayData, dayIndex) => {
              if (!dayData) {
                return <Grid item xs key={`empty-${dayIndex}`}></Grid>;
              }
              
              const dayStatus = getDayStatus(dayData);
              
              return (
                <Grid item xs key={dayData.dateStr}>
                  <Box sx={{
                    minHeight: '140px',
                    p: 2,
                    borderRadius: '16px',
                    border: dayData.isToday ? '3px solid #3b82f6' : '2px solid rgba(226, 232, 240, 0.3)',
                    background: dayData.isToday 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 197, 253, 0.08) 100%)'
                      : dayStatus 
                        ? `linear-gradient(135deg, ${dayStatus.color}10 0%, ${dayStatus.color}05 100%)`
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.8) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: dayData.isToday 
                      ? '0 8px 32px rgba(59, 130, 246, 0.2)' 
                      : dayStatus 
                        ? `0 6px 24px ${dayStatus.color}15`
                        : '0 4px 16px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: dayStatus ? 'pointer' : 'default',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': dayStatus ? {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: `0 12px 40px ${dayStatus.color}25`,
                      borderColor: dayStatus.color,
                      '&::before': {
                        opacity: 1
                      }
                    } : {},
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: dayStatus ? `linear-gradient(135deg, ${dayStatus.color}08 0%, transparent 100%)` : 'none',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none'
                    }
                  }}>
                    {/* Day Number */}
                    <Typography variant="h6" sx={{
                      fontWeight: dayData.isToday ? 800 : 700,
                      color: dayData.isToday ? '#3b82f6' : '#1e293b',
                      mb: 1.5,
                      fontSize: '1.1rem',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {dayData.day}
                    </Typography>
                    
                    {/* Status Display */}
                    {dayStatus && (
                      <Box sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${dayStatus.color}20 0%, ${dayStatus.color}10 100%)`,
                        border: `2px solid ${dayStatus.color}40`,
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Typography variant="body2" sx={{
                          color: dayStatus.color,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          display: 'block',
                          lineHeight: 1.3,
                          mb: 0.5
                        }}>
                          {dayStatus.icon}
                        </Typography>
                        
                        <Typography variant="caption" sx={{
                          color: dayStatus.color,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          display: 'block',
                          lineHeight: 1.2
                        }}>
                          {dayStatus.text.replace(dayStatus.icon + ' ', '')}
                        </Typography>
                        
                        {/* Booking info */}
                        {dayData.data?.isBooked && !dayData.data?.isFuture && (
                          <Typography variant="caption" sx={{
                            color: '#64748b',
                            fontSize: '0.65rem',
                            display: 'block',
                            mt: 0.5,
                            fontWeight: 500
                          }}>
                            📍 {dayData.data.bookedHours}h booked
                          </Typography>
                        )}
                        
                        {/* Clock in/out times for attended days */}
                        {dayData.data?.hasClockIn && dayData.data?.hasClockOut && (
                          <Typography variant="caption" sx={{
                            color: '#64748b',
                            fontSize: '0.6rem',
                            display: 'block',
                            mt: 0.5,
                            fontWeight: 500
                          }}>
                            {format(new Date(dayData.data.record.check_in_time), 'HH:mm')} - {format(new Date(dayData.data.record.check_out_time), 'HH:mm')}
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {/* Empty state for days without data */}
                    {!dayStatus && (
                      <Box sx={{
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.3
                      }}>
                        <Typography variant="caption" sx={{
                          color: '#94a3b8',
                          fontSize: '0.65rem'
                        }}>
                          No activity
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card sx={{
          p: 4,
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 38, 53, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <CircularProgress sx={{ color: '#8B2635', mb: 2 }} size={48} />
          <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600 }}>
            Loading employee details...
          </Typography>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 3, 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card sx={{
          p: 4,
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 38, 53, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          maxWidth: 400
        }}>
          <Typography variant="h4" sx={{ mb: 2, fontSize: '2rem' }}>⚠️</Typography>
          <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600, mb: 1 }}>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
            {error}
          </Typography>
          <Button 
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              backgroundColor: '#8B2635',
              '&:hover': {
                backgroundColor: '#7a1f2d',
              },
            }}
          >
            Try Again
          </Button>
        </Card>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ 
        p: 3, 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card sx={{
          p: 4,
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 38, 53, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          maxWidth: 400
        }}>
          <Person sx={{ fontSize: 48, color: '#8B2635', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600, mb: 1 }}>
            Employee not found
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
            The employee you're looking for doesn't exist or has been removed.
          </Typography>
          <Button 
            variant="contained"
            onClick={() => navigate('/employer/employees')}
            sx={{
              backgroundColor: '#8B2635',
              '&:hover': {
                backgroundColor: '#7a1f2d',
              },
            }}
          >
            Back to Employees
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      overflowY: 'auto',
      scrollBehavior: 'smooth',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              color: '#8B2635',
              '&:hover': {
                backgroundColor: 'rgba(139, 38, 53, 0.05)',
                borderColor: 'rgba(139, 38, 53, 0.2)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6b7280',
                cursor: 'pointer',
                '&:hover': { color: '#8B2635' }
              }}
              onClick={() => navigate('/employer/employees')}
            >
              Employees / <span style={{ color: '#8B2635', fontWeight: 600 }}>{employee.first_name} {employee.last_name}</span>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Employee Profile Card */}
      <Card sx={{
        mb: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'visible'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  backgroundColor: '#8B2635',
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}
              >
                {getInitials(employee.first_name, employee.last_name)}
              </Avatar>
              <Box sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 16,
                height: 16,
                backgroundColor: '#10b981',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#8B2635', 
                mb: 0.5,
                fontSize: '1.75rem'
              }}>
                {employee.first_name} {employee.last_name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email size={16} color="#8B2635" />
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  {employee.email}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn sx={{ fontSize: 16, color: '#8B2635' }} />
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {employee.city}, {employee.state && `${employee.state}, `}{employee.country}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={employee.status === 'active' ? 'Active' : 'Inactive'}
                  sx={{
                    backgroundColor: employee.status === 'active' ? '#dcfce7' : '#f3f4f6',
                    color: employee.status === 'active' ? '#16a34a' : '#6b7280',
                    border: `1px solid ${employee.status === 'active' ? '#bbf7d0' : '#d1d5db'}`,
                    fontWeight: 500
                  }}
                />
                {employee.role_title && (
                  <Chip 
                    label={employee.role_title}
                    sx={{
                      backgroundColor: 'rgba(139, 38, 53, 0.1)',
                      color: '#8B2635',
                      border: '1px solid rgba(139, 38, 53, 0.2)',
                      fontWeight: 500
                    }}
                  />
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button 
                variant="contained"
                startIcon={<Email />}
                sx={{
                  backgroundColor: '#8B2635',
                  '&:hover': {
                    backgroundColor: '#7a1f2d',
                  },
                }}
              >
                Message
              </Button>
              <Button 
                variant="outlined"
                startIcon={<Assignment />}
                sx={{
                  borderColor: 'rgba(139, 38, 53, 0.3)',
                  color: '#8B2635',
                  '&:hover': {
                    borderColor: '#8B2635',
                    backgroundColor: 'rgba(139, 38, 53, 0.05)',
                  },
                }}
              >
                Assign Task
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      {/* Tab Navigation */}
      <Card sx={{
        mb: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#6b7280',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.95rem',
              minHeight: 48,
            },
            '& .Mui-selected': {
              color: '#8B2635 !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#8B2635',
              height: 3,
            },
          }}
        >
          <Tab 
            icon={<Person />} 
            label="Overview" 
            value="overview" 
            iconPosition="start"
          />
          <Tab 
            icon={<EventNote />} 
            label={`Bookings (${bookings.length})`} 
            value="bookings" 
            iconPosition="start"
          />
          <Tab 
            icon={<Assignment />} 
            label={`Tasks (${tasks.length})`} 
            value="tasks" 
            iconPosition="start"
          />
          <Tab 
            icon={<AccessTime />} 
            label={`Attendance (${attendance.length})`} 
            value="attendance" 
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Grid container spacing={3} sx={{ 
          alignItems: 'stretch', 
          width: '100%',
          display: 'grid !important',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
            lg: '1fr 1fr 1fr'
          },
          gap: 3,
          '& > .MuiGrid-item': {
            width: 'auto !important',
            maxWidth: 'none !important',
            flexBasis: 'auto !important'
          }
        }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{
              height: '100%',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600, mb: 3 }}>
                  Personal Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Full Name</Typography>
                    <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 600 }}>{employee.first_name} {employee.last_name}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Email Address</Typography>
                    <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 500, wordBreak: 'break-word' }}>{employee.email}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Phone Number</Typography>
                    <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 500 }}>{employee.phone_number || 'Not provided'}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>Status</Typography>
                    <Chip 
                      label={employee.status === 'active' ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        backgroundColor: employee.status === 'active' ? '#dcfce7' : '#f3f4f6',
                        color: employee.status === 'active' ? '#16a34a' : '#6b7280',
                        border: `1px solid ${employee.status === 'active' ? '#bbf7d0' : '#d1d5db'}`,
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{
              height: '100%',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600, mb: 3 }}>
                  Location Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Address</Typography>
                    <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 500, lineHeight: 1.5 }}>
                      {employee.address || 'Not provided'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>City</Typography>
                    <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 500 }}>{employee.city}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>State/Province</Typography>
                    <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 500 }}>{employee.state || 'Not specified'}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Country</Typography>
                    <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 500 }}>{employee.country}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={12} lg={4}>
            <Card sx={{
              height: '100%',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600, mb: 3 }}>
                  Coworking Space
                </Typography>
                {employee.assigned_coworking_space ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Space Name</Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 600 }}>
                        {employee.assigned_coworking_space.name}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Address</Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 500, lineHeight: 1.5 }}>
                        {employee.assigned_coworking_space.address || 'Address not available'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Booking Period</Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 600 }}>
                        {formatDate(employee.assigned_coworking_space.start_date)} - {formatDate(employee.assigned_coworking_space.end_date)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Booking Type</Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 500 }}>
                        {employee.assigned_coworking_space.booking_type}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>Status</Typography>
                      <Chip 
                        label={getBookingStatusText(employee.assigned_coworking_space.start_date, employee.assigned_coworking_space.end_date)}
                        size="small"
                        sx={{
                          backgroundColor: getBookingStatusColor(employee.assigned_coworking_space.start_date, employee.assigned_coworking_space.end_date) === 'upcoming' ? '#dbeafe' : 
                                          getBookingStatusColor(employee.assigned_coworking_space.start_date, employee.assigned_coworking_space.end_date) === 'active' ? '#dcfce7' : '#f3f4f6',
                          color: getBookingStatusColor(employee.assigned_coworking_space.start_date, employee.assigned_coworking_space.end_date) === 'upcoming' ? '#1d4ed8' : 
                                getBookingStatusColor(employee.assigned_coworking_space.start_date, employee.assigned_coworking_space.end_date) === 'active' ? '#16a34a' : '#6b7280',
                          border: `1px solid ${getBookingStatusColor(employee.assigned_coworking_space.start_date, employee.assigned_coworking_space.end_date) === 'upcoming' ? '#bfdbfe' : 
                                                getBookingStatusColor(employee.assigned_coworking_space.start_date, employee.assigned_coworking_space.end_date) === 'active' ? '#bbf7d0' : '#d1d5db'}`,
                          fontWeight: 500
                        }}
                      />
                    </Box>
                    {employee.assigned_coworking_space.description && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 0.5 }}>Description</Typography>
                          <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 400, lineHeight: 1.5 }}>
                            {employee.assigned_coworking_space.description}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flex: 1,
                    textAlign: 'center',
                    py: 4
                  }}>
                    <Building size={48} color="#8B2635" style={{ marginBottom: 16, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600, mb: 1 }}>
                      No Coworking Space
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                      This employee hasn't been assigned to any coworking space yet.
                    </Typography>
                    <Button 
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => navigate(`/employer/coworking/book?employee_id=${employee.id}`)}
                      sx={{
                        borderColor: 'rgba(139, 38, 53, 0.3)',
                        color: '#8B2635',
                        '&:hover': {
                          borderColor: '#8B2635',
                          backgroundColor: 'rgba(139, 38, 53, 0.05)',
                        },
                      }}
                    >
                      Assign Space
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 'bookings' && (
        <Box>
          {/* Header with filters */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ color: '#8B2635', fontWeight: 600 }}>
                Coworking Space Bookings
              </Typography>
              <Button 
                variant="contained"
                startIcon={<Add />}
                sx={{
                  backgroundColor: '#8B2635',
                  '&:hover': {
                    backgroundColor: '#7a1f2d',
                  },
                }}
              >
                New Booking
              </Button>
            </Box>

            {/* Booking Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['all', 'active', 'upcoming', 'completed'].map((filter) => (
                <Chip
                  key={filter}
                  label={filter === 'all' ? 'All Bookings' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  onClick={() => setBookingFilter(filter)}
                  sx={{
                    backgroundColor: bookingFilter === filter ? '#8B2635' : 'rgba(139, 38, 53, 0.1)',
                    color: bookingFilter === filter ? 'white' : '#8B2635',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: bookingFilter === filter ? '#7A1F2A' : 'rgba(139, 38, 53, 0.2)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
          
          {(() => {
            const getBookingStatus = (startDate, endDate) => {
              const now = new Date();
              const start = new Date(startDate);
              const end = new Date(endDate);
              
              if (now >= start && now <= end) return 'active';
              if (now < start) return 'upcoming';
              return 'completed';
            };

            const filteredBookings = bookingFilter === 'all' 
              ? bookings 
              : bookings.filter(booking => getBookingStatus(booking.start_date, booking.end_date) === bookingFilter);

            return filteredBookings.length === 0 ? (
              <Card sx={{
                p: 6,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 38, 53, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <Building size={48} color="#8B2635" style={{ marginBottom: 16 }} />
                <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600, mb: 1 }}>
                  {bookingFilter === 'all' ? 'No bookings found' : `No ${bookingFilter} bookings`}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                  {bookingFilter === 'all' 
                    ? "This employee hasn't made any coworking space bookings yet." 
                    : `No bookings found with ${bookingFilter} status.`}
                </Typography>
                <Button 
                  variant="contained"
                  startIcon={<Add />}
                  sx={{
                    backgroundColor: '#8B2635',
                    '&:hover': {
                      backgroundColor: '#7a1f2d',
                    },
                  }}
                >
                  Create First Booking
                </Button>
              </Card>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: 3,
                '@media (min-width: 1200px)': {
                  gridTemplateColumns: 'repeat(3, 1fr)'
                }
              }}>
                {filteredBookings.map((booking) => {
                  const status = getBookingStatus(booking.start_date, booking.end_date);
                  const getStatusConfig = (status) => {
                    switch (status) {
                      case 'active':
                        return { label: 'Active', color: '#16a34a', bgColor: '#dcfce7' };
                      case 'upcoming':
                        return { label: 'Upcoming', color: '#ea580c', bgColor: '#fed7aa' };
                      case 'completed':
                        return { label: 'Completed', color: '#6b7280', bgColor: '#f3f4f6' };
                      default:
                        return { label: 'Unknown', color: '#6b7280', bgColor: '#f3f4f6' };
                    }
                  };
                  const statusConfig = getStatusConfig(status);

                  return (
                    <Card 
                      key={booking.id}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 38, 53, 0.1)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                      }}
                    >
                      <CardContent sx={{ p: 5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ 
                            color: '#8B2635', 
                            fontWeight: 600, 
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mr: 1
                          }}>
                            {booking.coworking_space_name}
                          </Typography>
                          <Chip 
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              backgroundColor: statusConfig.bgColor,
                              color: statusConfig.color,
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MapPin size={16} color="#8B2635" />
                            <Typography variant="body2" sx={{ 
                              color: '#6b7280',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {booking.coworking_space_address}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon size={16} color="#8B2635" />
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Building size={16} color="#8B2635" />
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              {booking.booking_type}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DollarSign size={16} color="#8B2635" />
                            <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 600 }}>
                              PKR {booking.total_cost}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => navigate(`/employer/coworking/booking/${booking.id}`)}
                            sx={{
                              borderColor: 'rgba(139, 38, 53, 0.3)',
                              color: '#8B2635',
                              flex: 1,
                              '&:hover': {
                                borderColor: '#8B2635',
                                backgroundColor: 'rgba(139, 38, 53, 0.05)',
                              },
                            }}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outlined"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => navigate(`/employer/coworking/booking/${booking.id}/edit`)}
                            sx={{
                              borderColor: 'rgba(139, 38, 53, 0.3)',
                              color: '#8B2635',
                              flex: 1,
                              '&:hover': {
                                borderColor: '#8B2635',
                                backgroundColor: 'rgba(139, 38, 53, 0.05)',
                              },
                            }}
                          >
                            Edit
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            );
          })()}
        </Box>
      )}

      {activeTab === 'tasks' && (
        <Box>
          {tasksLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8B2635' }} />
            </Box>
          ) : (
            <>
              {/* Task Filters */}
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['all', 'pending', 'in_progress', 'completed'].map((filter) => (
                  <Chip
                    key={filter}
                    label={filter === 'all' ? 'All Tasks' : filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    onClick={() => setTaskFilter(filter)}
                    sx={{
                      backgroundColor: taskFilter === filter ? '#8B2635' : 'rgba(139, 38, 53, 0.1)',
                      color: taskFilter === filter ? 'white' : '#8B2635',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: taskFilter === filter ? '#7A1F2A' : 'rgba(139, 38, 53, 0.2)',
                      },
                    }}
                  />
                ))}
              </Box>

              {(() => {
                const filteredTasks = taskFilter === 'all' 
                  ? tasks 
                  : tasks.filter(task => task.status === taskFilter);

                return filteredTasks.length === 0 ? (
                  <Card sx={{
                    p: 6,
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 38, 53, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                  }}>
                    <Assignment sx={{ fontSize: 48, color: '#8B2635', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600, mb: 1 }}>
                      {taskFilter === 'all' ? 'No tasks assigned' : `No ${taskFilter.replace('_', ' ')} tasks`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {taskFilter === 'all' 
                        ? 'This employee has no tasks assigned yet.' 
                        : `No tasks found with ${taskFilter.replace('_', ' ')} status.`}
                    </Typography>
                  </Card>
                ) : (
                  <Stack spacing={2}>
                    {filteredTasks.map((task) => {
                      const getStatusColor = (status) => {
                        switch (status) {
                          case 'completed': return '#10B981';
                          case 'in_progress': return '#F59E0B';
                          case 'pending': return '#6B7280';
                          case 'overdue': return '#EF4444';
                          default: return '#6B7280';
                        }
                      };

                      const getPriorityColor = (priority) => {
                        switch (priority) {
                          case 'high': return '#EF4444';
                          case 'medium': return '#F59E0B';
                          case 'low': return '#10B981';
                          default: return '#6B7280';
                        }
                      };

                      return (
                        <Card 
                          key={task.id}
                          sx={{ 
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: '#8B2635',
                              boxShadow: '0 2px 8px rgba(139, 38, 53, 0.1)',
                            },
                          }}
                          onClick={() => navigate(`/employer/tasks/${task.id}`)}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              {/* Left Section - Task Info */}
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 3 }}>
                                {/* Priority Badge */}
                                <Box
                                  sx={{
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: '16px',
                                    backgroundColor: getPriorityColor(task.priority),
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    minWidth: '70px',
                                    textAlign: 'center',
                                  }}
                                >
                                  {task.priority}
                                </Box>

                                {/* Task Details */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      color: '#1e293b',
                                      mb: 0.5,
                                      fontSize: '1rem',
                                    }}
                                  >
                                    {task.title}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: '#64748b',
                                      mb: 1,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {task.description || 'No description provided'}
                                  </Typography>
                                </Box>

                                {/* Status Badge */}
                                <Box
                                  sx={{
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: '16px',
                                    backgroundColor: getStatusColor(task.status),
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    minWidth: '120px',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {task.status.replace('_', ' ')}
                                </Box>

                                {/* Due Date */}
                                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '120px' }}>
                                  <CalendarIcon sx={{ fontSize: 16, color: '#64748b', mr: 1 }} />
                                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Right Section - Action Buttons */}
                              <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                                <Tooltip title="View Details">
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/employer/tasks/${task.id}`);
                                    }}
                                    sx={{ 
                                      color: '#64748b',
                                      '&:hover': {
                                        color: '#8B2635',
                                        backgroundColor: 'rgba(139, 38, 53, 0.1)',
                                      },
                                    }}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Task">
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/employer/tasks/${task.id}/edit`);
                                    }}
                                    sx={{ 
                                      color: '#64748b',
                                      '&:hover': {
                                        color: '#8B2635',
                                        backgroundColor: 'rgba(139, 38, 53, 0.1)',
                                      },
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                );
              })()}
            </>
          )}
        </Box>
      )}

      {activeTab === 'attendance' && (
        <Box>
          {attendanceLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8B2635' }} />
            </Box>
          ) : attendance.length === 0 ? (
            <Card sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 38, 53, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <Clock size={48} color="#8B2635" style={{ marginBottom: 16 }} />
              <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600, mb: 1 }}>
                No attendance records
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                This employee has no attendance records yet.
              </Typography>
            </Card>
          ) : (
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
                  events={calendarEvents}
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
        </Box>
      )}
    </Box>
  );
}
