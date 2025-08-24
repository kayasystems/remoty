// src/components/employer/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import { employerApi } from '../../services/employer';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Badge,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  DoneAll as MarkAllReadIcon,
  Task as TaskIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FilterList as FilterIcon,
  Circle as CircleIcon
} from '@mui/icons-material';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await employerApi.get('/employer/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await employerApi.put(`/employer/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      await Promise.all(unreadIds.map(id => employerApi.put(`/employer/notifications/${id}/read`)));
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { sx: { color: '#8B2635', fontSize: 20 } };
    switch (type) {
      case 'task_assigned': return <TaskIcon {...iconProps} />;
      case 'task_completed': return <CheckCircleIcon {...iconProps} />;
      case 'employee_joined': return <PersonAddIcon {...iconProps} />;
      case 'booking_created': return <BusinessIcon {...iconProps} />;
      case 'attendance_alert': return <ScheduleIcon {...iconProps} />;
      case 'info': return <InfoIcon {...iconProps} />;
      case 'warning': return <WarningIcon {...iconProps} />;
      case 'error': return <ErrorIcon {...iconProps} />;
      default: return <NotificationsIcon {...iconProps} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_assigned': return '#8B2635';
      case 'task_completed': return '#10b981';
      case 'employee_joined': return '#3b82f6';
      case 'booking_created': return '#f59e0b';
      case 'attendance_alert': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#8B2635';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Glassmorphism Header Section */}
      <Paper sx={{ 
        p: 4, 
        mb: 4,
        background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: 'rgba(139, 38, 53, 0.1)',
              border: '1px solid rgba(139, 38, 53, 0.2)'
            }}>
              <NotificationsIcon sx={{ color: '#8B2635', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#8B2635',
                  fontSize: '1.875rem',
                  mb: 0.5
                }}
              >
                Notifications
                {unreadCount > 0 && (
                  <Chip 
                    label={unreadCount}
                    size="small"
                    sx={{ 
                      ml: 2, 
                      bgcolor: '#ef4444', 
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Stay updated with your team's activities and important updates
              </Typography>
            </Box>
          </Box>
          {unreadCount > 0 && (
            <Button 
              variant="outlined" 
              startIcon={<MarkAllReadIcon />}
              onClick={markAllAsRead}
              sx={{ 
                borderColor: 'rgba(139, 38, 53, 0.3)',
                color: '#8B2635',
                '&:hover': { 
                  borderColor: '#8B2635',
                  bgcolor: 'rgba(139, 38, 53, 0.04)'
                }
              }}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Paper>

      {/* Modern Filter Tabs */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          p: 1, 
          bgcolor: '#f8fafc', 
          borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}>
          {['all', 'unread', 'read'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "contained" : "text"}
              onClick={() => setFilter(filterOption)}
              startIcon={
                filterOption === 'all' ? <FilterIcon sx={{ fontSize: 18 }} /> :
                filterOption === 'unread' ? <CircleIcon sx={{ fontSize: 16 }} /> :
                <MarkReadIcon sx={{ fontSize: 18 }} />
              }
              sx={{
                textTransform: 'capitalize',
                fontWeight: 600,
                minHeight: 40,
                px: 3,
                borderRadius: 1.5,
                ...(filter === filterOption ? {
                  bgcolor: '#8B2635',
                  color: 'white',
                  '&:hover': { bgcolor: '#6d1f2c' }
                } : {
                  color: '#64748b',
                  '&:hover': { 
                    bgcolor: 'rgba(139, 38, 53, 0.04)',
                    color: '#8B2635'
                  }
                })
              }}
            >
              {filterOption === 'all' && `All (${notifications.length})`}
              {filterOption === 'unread' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Unread
                  {unreadCount > 0 && (
                    <Chip 
                      label={unreadCount} 
                      size="small" 
                      sx={{ 
                        bgcolor: filter === filterOption ? 'rgba(255,255,255,0.2)' : '#ef4444',
                        color: 'white', 
                        height: 18, 
                        fontSize: '0.7rem',
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                  )}
                </Box>
              )}
              {filterOption === 'read' && `Read (${notifications.length - unreadCount})`}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p>Loading notifications...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--error-500)', marginBottom: 'var(--space-4)' }}>{error}</p>
          <Button variant="ghost" onClick={fetchNotifications}>Try Again</Button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center', backgroundColor: '#f8fafc' }}>
          <NotificationsIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
            {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            {filter === 'all' 
              ? "You'll see notifications about your team's activities here" 
              : `You have no ${filter} notifications at the moment`
            }
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filteredNotifications.map(notification => (
            <Card 
              key={notification.id}
              elevation={notification.is_read ? 1 : 3}
              sx={{
                backgroundColor: notification.is_read ? 'white' : '#fef3f2',
                border: notification.is_read ? '1px solid #e2e8f0' : '2px solid #8B2635',
                cursor: notification.is_read ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: notification.is_read ? 'none' : 'translateY(-2px)',
                  boxShadow: notification.is_read ? 1 : 6
                }
              }}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  {/* Icon Avatar */}
                  <Avatar 
                    sx={{ 
                      bgcolor: notification.is_read ? '#f1f5f9' : 'rgba(139, 38, 53, 0.1)',
                      width: 48,
                      height: 48,
                      border: `2px solid ${getNotificationColor(notification.type)}`
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: 1
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#1e293b',
                          fontSize: '1rem'
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#64748b',
                            flexShrink: 0
                          }}
                        >
                          {formatTimeAgo(notification.created_at)}
                        </Typography>
                        {!notification.is_read && (
                          <Badge 
                            color="primary" 
                            variant="dot" 
                            sx={{
                              '& .MuiBadge-dot': {
                                backgroundColor: '#8B2635',
                                width: 10,
                                height: 10
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#475569',
                        lineHeight: 1.6,
                        mb: !notification.is_read ? 2 : 0
                      }}
                    >
                      {notification.message}
                    </Typography>

                    {/* Action button for unread notifications */}
                    {!notification.is_read && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<MarkReadIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          sx={{
                            borderColor: '#8B2635',
                            color: '#8B2635',
                            '&:hover': {
                              borderColor: '#6d1f2c',
                              backgroundColor: 'rgba(139, 38, 53, 0.04)'
                            }
                          }}
                        >
                          Mark as Read
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
