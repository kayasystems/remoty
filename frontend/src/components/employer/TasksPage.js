// src/components/employer/TasksPage.js
import React, { useState, useEffect } from 'react';
import { employerApi } from '../../services/employer';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Add,
  Assignment,
  CalendarToday,
  Person,
  Edit,
  Visibility,
  PriorityHigh,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  PlayArrow,
  MoreVert,
  FilterList,
} from '@mui/icons-material';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await employerApi.get('/employer/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to load tasks. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pending', icon: <Pending />, color: '#f59e0b', bgColor: '#fef3c7' },
      in_progress: { label: 'In Progress', icon: <PlayArrow />, color: '#3b82f6', bgColor: '#dbeafe' },
      completed: { label: 'Completed', icon: <CheckCircle />, color: '#10b981', bgColor: '#d1fae5' },
      cancelled: { label: 'Cancelled', icon: <Cancel />, color: '#ef4444', bgColor: '#fee2e2' },
    };
    return configs[status] || configs.pending;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { label: 'Low', color: '#10b981', bgColor: '#d1fae5' },
      medium: { label: 'Medium', color: '#f59e0b', bgColor: '#fef3c7' },
      high: { label: 'High', color: '#ef4444', bgColor: '#fee2e2' },
    };
    return configs[priority] || configs.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredTasks = () => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.status === filter);
  };

  const getTaskStats = () => {
    const stats = {
      all: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
    return stats;
  };

  const stats = getTaskStats();
  const filterOptions = [
    { key: 'all', label: 'All Tasks', count: stats.all, color: '#64748b', bgColor: '#f1f5f9' },
    { key: 'pending', label: 'Pending', count: stats.pending, color: '#f59e0b', bgColor: '#fef3c7' },
    { key: 'in_progress', label: 'In Progress', count: stats.in_progress, color: '#3b82f6', bgColor: '#dbeafe' },
    { key: 'completed', label: 'Completed', count: stats.completed, color: '#10b981', bgColor: '#d1fae5' },
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled, color: '#ef4444', bgColor: '#fee2e2' },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff'
    }}>
      {/* Glassmorphism Header */}
      <Paper sx={{
        p: 4,
        mb: 4,
        mx: 4,
        mt: 4,
        background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#8B2635',
              mb: 1 
            }}
          >
            Tasks
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500 
            }}
          >
            Manage and track your team's tasks
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/employer/tasks/create')}
          sx={{
            backgroundColor: '#8B2635',
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: '8px',
            textTransform: 'none',
            boxShadow: '0 2px 4px rgba(139, 38, 53, 0.2)',
            '&:hover': {
              backgroundColor: '#7a1f2b',
              boxShadow: '0 4px 8px rgba(139, 38, 53, 0.3)',
            },
          }}
        >
          New Task
        </Button>
      </Paper>

      {/* Filter Section */}
      <Box sx={{
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        px: 4,
        py: 3,
      }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {filterOptions.map((option) => (
            <Button
              key={option.key}
              variant={filter === option.key ? 'contained' : 'text'}
              onClick={() => setFilter(option.key)}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 'auto',
                fontSize: '0.875rem',
                ...(filter === option.key ? {
                  backgroundColor: option.color,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: option.color,
                    opacity: 0.9,
                  },
                } : {
                  backgroundColor: option.bgColor,
                  color: option.color,
                  '&:hover': {
                    backgroundColor: option.color,
                    color: 'white',
                  },
                }),
              }}
            >
              {option.label}
              {option.count > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.25,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    minWidth: '20px',
                    textAlign: 'center',
                    backgroundColor: filter === option.key ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    color: filter === option.key ? 'white' : option.color,
                  }}
                >
                  {option.count}
                </Box>
              )}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 4, py: 4 }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px' 
          }}>
            <CircularProgress sx={{ color: '#8B2635' }} />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              '& .MuiAlert-icon': {
                color: '#dc2626',
              },
            }}
          >
            {error}
          </Alert>
        ) : filteredTasks().length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}>
            <Assignment sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1, fontWeight: 600 }}>
              No tasks found
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
              {filter === 'all' ? 'Create your first task to get started' : `No ${filter.replace('_', ' ')} tasks`}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/employer/tasks/new')}
              sx={{
                backgroundColor: '#8B2635',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#7a1f2b',
                },
              }}
            >
              Create Task
            </Button>
          </Box>
        ) : (
          <Box>
            {/* Tasks List */}
            <Stack spacing={2}>
              {filteredTasks().map(task => {
                const statusConfig = getStatusConfig(task.status);
                const priorityConfig = getPriorityConfig(task.priority);
                
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
                              backgroundColor: priorityConfig.bgColor,
                              color: priorityConfig.color,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              minWidth: '70px',
                              textAlign: 'center',
                            }}
                          >
                            {priorityConfig.label}
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
                            
                            {/* Assigned Employees */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              {task.assigned_employees && task.assigned_employees.length > 0 ? (
                                <>
                                  <Person sx={{ fontSize: 16, color: '#64748b' }} />
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {task.assigned_employees.slice(0, 3).map((emp, index) => (
                                      <Tooltip key={index} title={emp.name}>
                                        <Avatar
                                          sx={{
                                            width: 24,
                                            height: 24,
                                            fontSize: '0.75rem',
                                            backgroundColor: '#8B2635',
                                            color: 'white',
                                            fontWeight: 600,
                                          }}
                                        >
                                          {emp.name?.charAt(0) || 'U'}
                                        </Avatar>
                                      </Tooltip>
                                    ))}
                                    {task.assigned_employees.length > 3 && (
                                      <Typography variant="caption" sx={{ color: '#64748b', ml: 0.5 }}>
                                        +{task.assigned_employees.length - 3} more
                                      </Typography>
                                    )}
                                  </Box>
                                </>
                              ) : (
                                <>
                                  <Person sx={{ fontSize: 16, color: '#cbd5e1' }} />
                                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                                    Unassigned
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Box>

                          {/* Status Badge */}
                          <Box
                            sx={{
                              px: 2,
                              py: 0.5,
                              borderRadius: '16px',
                              backgroundColor: statusConfig.bgColor,
                              color: statusConfig.color,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              minWidth: '120px',
                              justifyContent: 'center',
                            }}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Box>

                          {/* Due Date */}
                          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '120px' }}>
                            <CalendarToday sx={{ fontSize: 16, color: '#64748b', mr: 1 }} />
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                              {formatDate(task.due_date)}
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
          </Box>
        )}
      </Box>
    </Box>
  );
}
