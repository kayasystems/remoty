// src/components/employer/EmployerDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  LinearProgress, 
  Chip,
  CircularProgress,
  Paper
} from '@mui/material';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { employerApi, employerEmployeeService, employerBookingService } from '../../services/employer';

const EmployerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [employerData, setEmployerData] = useState({
    name: '',
    company: ''
  });
  const [attendanceData, setAttendanceData] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTaskExpanded, setIsTaskExpanded] = useState(true);

  const fetchEmployerData = async () => {
    setLoading(true);
    try {
      // Fetch attendance data
      const attendanceResponse = await employerApi.get('/employer/employees/attendance-stats?days=30');
      setAttendanceData(attendanceResponse.data.employees);

      // Fetch task performance data
      const taskResponse = await employerApi.get('/employer/employees/task-performance?days=30');
      setTaskData(taskResponse.data.employees);

      const statsResponse = await employerApi.get('/employer/dashboard/stats');
      const stats = statsResponse.data;
      const attendanceData = attendanceResponse.data;
      
      setEmployerData({
        name: stats.employer?.first_name && stats.employer?.last_name ? 
          `${stats.employer.first_name} ${stats.employer.last_name}` : 'Employer',
        company: stats.employer?.company_name || 'Company'
      });

      // Set the individual employee attendance data
      setAttendanceData(attendanceData.employees || []);
    } catch (error) {
      console.error('Error fetching employer data:', error);
      setEmployerData({
        name: 'Employer',
        company: 'Company'
      });
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}
      >
        <CircularProgress sx={{ color: '#8B2635' }} />
      </Box>
    );
  }

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
      perspective: '1000px',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(139, 38, 53, 0.1)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(139, 38, 53, 0.3)',
        borderRadius: '4px',
        '&:hover': {
          background: 'rgba(139, 38, 53, 0.5)',
        },
      },
    }}>
      {/* Glassmorphism Header */}
      <Paper sx={{
        p: 4,
        mb: 4,
        background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px',
        boxShadow: 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              backgroundColor: '#8B2635',
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            {employerData.name ? employerData.name.charAt(0).toUpperCase() : <Person />}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                fontSize: '2rem',
                color: '#8B2635',
                mb: 0.5
              }}
            >
              Dashboard
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#374151',
                fontWeight: 600,
                mb: 0.5
              }}
            >
              {getCurrentGreeting()}, {employerData.name}!
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500 
              }}
            >
              Welcome to your {employerData.company} dashboard
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Monthly Attendance Widget */}
      <Paper sx={{
        p: 3,
        mb: 4,
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(139, 38, 53, 0.1)'
      }}>


        {attendanceData && attendanceData.length > 0 ? (
          <Card sx={{ 
            border: 'none',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'white',
            boxShadow: '0 4px 20px rgba(139, 38, 53, 0.08)'
          }}>
            {/* Header */}
            <Box sx={{ 
              p: 4, 
              background: 'white',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  color: '#8B2635',
                  letterSpacing: '0.5px',
                  fontSize: '1.75rem'
                }}>
                  Team Attendance Analytics
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  Last 30 days performance overview
                </Typography>
              </Box>
              
              {/* Collapse/Expand Arrow */}
              <Box 
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{ 
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ 
                    color: '#8B2635',
                    transition: 'transform 0.3s ease',
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)'
                  }}
                >
                  <path 
                    d="M7 14L12 9L17 14" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </Box>
            </Box>

            {/* Collapsible Content */}
            <Box sx={{ 
              maxHeight: isExpanded ? '2000px' : '0px',
              overflow: 'hidden',
              transition: 'max-height 0.4s ease-in-out, opacity 0.3s ease',
              opacity: isExpanded ? 1 : 0
            }}>
              {/* Employee Chart Grid */}
              <Box sx={{ p: 4 }}>
                <Grid container spacing={3} justifyContent="center">
                  {attendanceData.map((employee) => {
                  const maxDays = Math.max(employee.present_days, employee.partial_days, employee.absent_days, 1);
                  const totalDays = employee.present_days + employee.partial_days + employee.absent_days;
                  
                  return (
                    <Grid item xs={12} sm={6} md={2.4} key={employee.employee_id}>
                      <Box sx={{ 
                        textAlign: 'center',
                        p: 3,
                        borderRadius: '12px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#8B2635',
                          boxShadow: '0 4px 12px rgba(139, 38, 53, 0.1)'
                        }
                      }}>
                        {/* Employee Info */}
                        <Avatar sx={{ 
                          width: 56, 
                          height: 56, 
                          backgroundColor: '#8B2635',
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          mx: 'auto',
                          mb: 2,
                          boxShadow: '0 4px 12px rgba(139, 38, 53, 0.25)'
                        }}>
                          {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                        </Avatar>
                        
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: '#334155',
                          mb: 3
                        }}>
                          {employee.employee_name}
                        </Typography>

                        {/* Vertical Bar Chart */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'end',
                          gap: 1,
                          height: 120,
                          mb: 3
                        }}>
                          {/* Present Bar */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            flex: 1
                          }}>
                            <Box sx={{
                              width: '100%',
                              maxWidth: 24,
                              height: `${(employee.present_days / maxDays) * 100}px`,
                              minHeight: employee.present_days > 0 ? 8 : 0,
                              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                              borderRadius: '6px 6px 2px 2px',
                              position: 'relative',
                              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.25)',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '30%',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                                borderRadius: '6px 6px 0 0'
                              }
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: '#16a34a',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              mt: 0.5
                            }}>
                              {employee.present_days}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: '#475569',
                              fontSize: '0.65rem',
                              fontWeight: 500
                            }}>
                              Present
                            </Typography>
                          </Box>

                          {/* Partial Bar */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            flex: 1
                          }}>
                            <Box sx={{
                              width: '100%',
                              maxWidth: 24,
                              height: `${(employee.partial_days / maxDays) * 100}px`,
                              minHeight: employee.partial_days > 0 ? 8 : 0,
                              background: 'linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)',
                              borderRadius: '6px 6px 2px 2px',
                              position: 'relative',
                              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '30%',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                                borderRadius: '6px 6px 0 0'
                              }
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: '#ea580c',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              mt: 0.5
                            }}>
                              {employee.partial_days}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: '#475569',
                              fontSize: '0.65rem',
                              fontWeight: 500
                            }}>
                              Partial
                            </Typography>
                          </Box>

                          {/* Absent Bar */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            flex: 1
                          }}>
                            <Box sx={{
                              width: '100%',
                              maxWidth: 24,
                              height: `${(employee.absent_days / maxDays) * 100}px`,
                              minHeight: employee.absent_days > 0 ? 8 : 0,
                              background: 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)',
                              borderRadius: '6px 6px 2px 2px',
                              position: 'relative',
                              boxShadow: '0 2px 8px rgba(248, 113, 113, 0.25)',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '30%',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                                borderRadius: '6px 6px 0 0'
                              }
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: '#dc2626',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              mt: 0.5
                            }}>
                              {employee.absent_days}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: '#475569',
                              fontSize: '0.65rem',
                              fontWeight: 500
                            }}>
                              Absent
                            </Typography>
                          </Box>
                        </Box>

                        {/* Attendance Rate Badge */}
                        <Box sx={{
                          background: 'white',
                          color: employee.attendance_rate >= 80 
                            ? '#22c55e'
                            : employee.attendance_rate >= 60 
                            ? '#f59e0b'
                            : '#ef4444',
                          px: 2.5,
                          py: 1,
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          border: `2px solid ${employee.attendance_rate >= 80 
                            ? '#22c55e'
                            : employee.attendance_rate >= 60 
                            ? '#f59e0b'
                            : '#ef4444'}`,
                          boxShadow: '0 2px 6px rgba(139, 38, 53, 0.08)'
                        }}>
                          {employee.attendance_rate}%
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {/* Team Average Section */}
            <Box sx={{ 
              p: 4, 
              background: 'white',
              borderTop: '1px solid #f1f5f9'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: '#8B2635',
                textAlign: 'left',
                mb: 3,
                fontSize: '1.1rem',
                letterSpacing: '0.3px'
              }}>
                Team Performance Summary
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#22c55e',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)'
                    }
                  }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      mb: 0.5,
                      color: '#22c55e'
                    }}>
                      {Math.round(attendanceData.reduce((sum, emp) => sum + emp.present_days, 0) / attendanceData.length)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      Avg Present
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#f59e0b',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                    }
                  }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      mb: 0.5,
                      color: '#f59e0b'
                    }}>
                      {Math.round(attendanceData.reduce((sum, emp) => sum + emp.partial_days, 0) / attendanceData.length)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      Avg Partial
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#ef4444',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
                    }
                  }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      mb: 0.5,
                      color: '#ef4444'
                    }}>
                      {Math.round(attendanceData.reduce((sum, emp) => sum + emp.absent_days, 0) / attendanceData.length)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      Avg Absent
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#8B2635',
                      boxShadow: '0 4px 12px rgba(139, 38, 53, 0.15)'
                    }
                  }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      mb: 0.5,
                      color: '#8B2635'
                    }}>
                      {Math.round(attendanceData.reduce((sum, emp) => sum + emp.attendance_rate, 0) / attendanceData.length)}%
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      Team Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            </Box>
          </Card>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            color: 'text.secondary'
          }}>
            <Typography variant="body1">
              No attendance data available for this month
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Task Performance Analytics */}
      <Paper sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'white',
        boxShadow: '0 4px 20px rgba(139, 38, 53, 0.08)',
        mt: 4,
        border: 'none'
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 4, 
          background: 'white',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              mb: 1,
              color: '#8B2635',
              letterSpacing: '0.5px',
              fontSize: '1.75rem'
            }}>
              Team Task Performance
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#64748b',
              fontWeight: 500,
              fontSize: '0.95rem'
            }}>
              Last 30 days task completion overview
            </Typography>
          </Box>
          
          {/* Collapse/Expand Arrow */}
          <Box 
            onClick={() => setIsTaskExpanded(!isTaskExpanded)}
            sx={{ 
              cursor: 'pointer',
              p: 1,
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f8fafc',
                transform: 'scale(1.1)'
              }
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ 
                color: '#8B2635',
                transition: 'transform 0.3s ease',
                transform: isTaskExpanded ? 'rotate(0deg)' : 'rotate(180deg)'
              }}
            >
              <path 
                d="M7 14L12 9L17 14" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Box>

        {/* Collapsible Content */}
        <Box sx={{ 
          maxHeight: isTaskExpanded ? '2000px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease-in-out, opacity 0.3s ease',
          opacity: isTaskExpanded ? 1 : 0
        }}>
          {taskData && taskData.length > 0 ? (
            <>
              {/* Employee Chart Grid */}
              <Box sx={{ p: 4 }}>
                <Grid container spacing={3} justifyContent="center">
                  {taskData.map((employee) => {
                    const maxTasks = Math.max(employee.completed_tasks, employee.in_progress_tasks, employee.pending_tasks, employee.cancelled_tasks, 1);
                    
                    return (
                      <Grid item xs={12} sm={6} md={2.4} key={employee.employee_id}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 3,
                          borderRadius: '12px',
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#8B2635',
                            boxShadow: '0 4px 12px rgba(139, 38, 53, 0.1)'
                          }
                        }}>
                          {/* Employee Info */}
                          <Avatar sx={{ 
                            width: 56, 
                            height: 56, 
                            backgroundColor: '#8B2635',
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            mx: 'auto',
                            mb: 2,
                            boxShadow: '0 4px 12px rgba(139, 38, 53, 0.25)'
                          }}>
                            {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                          </Avatar>
                          
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: '#334155',
                            mb: 3
                          }}>
                            {employee.employee_name}
                          </Typography>

                          {/* Vertical Bar Chart */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'end',
                            gap: 1,
                            height: 120,
                            mb: 3
                          }}>
                            {/* Completed Bar */}
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              flex: 1
                            }}>
                              <Box sx={{
                                width: '100%',
                                maxWidth: 20,
                                height: `${(employee.completed_tasks / maxTasks) * 100}px`,
                                minHeight: employee.completed_tasks > 0 ? 8 : 0,
                                background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                                borderRadius: '6px 6px 2px 2px',
                                position: 'relative',
                                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.25)',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '30%',
                                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                                  borderRadius: '6px 6px 0 0'
                                }
                              }} />
                              <Typography variant="caption" sx={{ 
                                color: '#16a34a',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                mt: 0.5
                              }}>
                                {employee.completed_tasks}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: '#475569',
                                fontSize: '0.65rem',
                                fontWeight: 500
                              }}>
                                Done
                              </Typography>
                            </Box>

                            {/* In Progress Bar */}
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              flex: 1
                            }}>
                              <Box sx={{
                                width: '100%',
                                maxWidth: 20,
                                height: `${(employee.in_progress_tasks / maxTasks) * 100}px`,
                                minHeight: employee.in_progress_tasks > 0 ? 8 : 0,
                                background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                                borderRadius: '6px 6px 2px 2px',
                                position: 'relative',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '30%',
                                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                                  borderRadius: '6px 6px 0 0'
                                }
                              }} />
                              <Typography variant="caption" sx={{ 
                                color: '#2563eb',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                mt: 0.5
                              }}>
                                {employee.in_progress_tasks}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: '#475569',
                                fontSize: '0.65rem',
                                fontWeight: 500
                              }}>
                                Progress
                              </Typography>
                            </Box>

                            {/* Pending Bar */}
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              flex: 1
                            }}>
                              <Box sx={{
                                width: '100%',
                                maxWidth: 20,
                                height: `${(employee.pending_tasks / maxTasks) * 100}px`,
                                minHeight: employee.pending_tasks > 0 ? 8 : 0,
                                background: 'linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)',
                                borderRadius: '6px 6px 2px 2px',
                                position: 'relative',
                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '30%',
                                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                                  borderRadius: '6px 6px 0 0'
                                }
                              }} />
                              <Typography variant="caption" sx={{ 
                                color: '#ea580c',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                mt: 0.5
                              }}>
                                {employee.pending_tasks}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: '#475569',
                                fontSize: '0.65rem',
                                fontWeight: 500
                              }}>
                                Pending
                              </Typography>
                            </Box>
                          </Box>

                          {/* Completion Rate Badge */}
                          <Box sx={{
                            background: 'white',
                            color: employee.completion_rate >= 80 
                              ? '#22c55e'
                              : employee.completion_rate >= 60 
                              ? '#f59e0b'
                              : '#ef4444',
                            px: 2.5,
                            py: 1,
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            border: `2px solid ${employee.completion_rate >= 80 
                              ? '#22c55e'
                              : employee.completion_rate >= 60 
                              ? '#f59e0b'
                              : '#ef4444'}`,
                            boxShadow: '0 2px 6px rgba(139, 38, 53, 0.08)'
                          }}>
                            {employee.completion_rate}%
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Team Summary Section */}
              <Box sx={{ 
                p: 4, 
                background: 'white',
                borderTop: '1px solid #f1f5f9'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: '#8B2635',
                  textAlign: 'left',
                  mb: 3,
                  fontSize: '1.1rem',
                  letterSpacing: '0.3px'
                }}>
                  Team Task Summary
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center',
                      p: 3,
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#22c55e',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)'
                      }
                    }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        mb: 0.5,
                        color: '#22c55e'
                      }}>
                        {taskData.reduce((sum, emp) => sum + emp.completed_tasks, 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Total Completed
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center',
                      p: 3,
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                      }
                    }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        mb: 0.5,
                        color: '#3b82f6'
                      }}>
                        {taskData.reduce((sum, emp) => sum + emp.in_progress_tasks, 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center',
                      p: 3,
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#f59e0b',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                      }
                    }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        mb: 0.5,
                        color: '#f59e0b'
                      }}>
                        {taskData.reduce((sum, emp) => sum + emp.pending_tasks, 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Pending
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center',
                      p: 3,
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(139, 38, 53, 0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#8B2635',
                        boxShadow: '0 4px 12px rgba(139, 38, 53, 0.15)'
                      }
                    }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        mb: 0.5,
                        color: '#8B2635'
                      }}>
                        {Math.round(taskData.reduce((sum, emp) => sum + emp.completion_rate, 0) / taskData.length)}%
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Team Rate
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              color: 'text.secondary'
            }}>
              <Typography variant="body1">
                No task data available for this month
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployerDashboard;
