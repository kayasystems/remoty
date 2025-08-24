import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employerApi } from '../../services/employer';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Container,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  CalendarToday,
  Person,
  Send,
  Delete,
  MoreVert,
  Assignment,
  PriorityHigh,
  CheckCircle,
  Cancel,
  Pending,
  PlayArrow,
  Comment as CommentIcon,
  Flag,
  Description,
} from '@mui/icons-material';

// Helper functions for status and priority colors
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return '#10b981'; // green
    case 'in_progress':
      return '#3b82f6'; // blue
    case 'pending':
      return '#f59e0b'; // yellow
    case 'cancelled':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return '#dc2626'; // red
    case 'high':
      return '#ea580c'; // orange
    case 'medium':
      return '#ca8a04'; // yellow
    case 'low':
      return '#16a34a'; // green
    default:
      return '#6b7280'; // gray
  }
};

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await employerApi.get(`/employer/tasks/${taskId}`);
      setTask(response.data);
    } catch (err) {
      console.error('Error fetching task details:', err);
      if (err.response?.status === 404) {
        setError('Task not found');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to load task details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await employerApi.post(`/employer/tasks/${taskId}/comments`, {
        content: newComment.trim()
      });
      
      // Add the new comment to the task
      setTask(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data.comment]
      }));
      
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
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
      urgent: { label: 'Urgent', color: '#dc2626', bgColor: '#fecaca' },
    };
    return configs[priority] || configs.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCommentDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress sx={{ color: '#8B2635' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#ffffff',
        p: 4
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: '#fef2f2',
            color: '#991b1b',
          }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/employer/tasks')}
          sx={{
            backgroundColor: '#8B2635',
            '&:hover': { backgroundColor: '#7a1f2b' }
          }}
        >
          Back to Tasks
        </Button>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#ffffff',
        p: 4
      }}>
        <Typography>Task not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Glassmorphism Header */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 38, 53, 0.1)',
          borderRadius: '16px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate('/employer/tasks')}
                sx={{
                  color: '#8B2635',
                  mr: 2,
                  backgroundColor: 'rgba(139, 38, 53, 0.1)',
                  border: '1px solid rgba(139, 38, 53, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 38, 53, 0.2)',
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#8B2635', mb: 0.5 }}>
                  {task?.title || 'Loading...'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Task Details & Discussion
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => {
                console.log('Edit button clicked, taskId:', taskId);
                console.log('Navigating to:', `/employer/tasks/${taskId}/edit`);
                navigate(`/employer/tasks/${taskId}/edit`);
              }}
              sx={{
                backgroundColor: '#8B2635',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(139, 38, 53, 0.3)',
                '&:hover': {
                  backgroundColor: '#7a1f2e',
                  boxShadow: '0 4px 12px rgba(139, 38, 53, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Edit Task
            </Button>
          </Box>

          {/* Status and Priority Badges */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Chip
              label={task?.status || 'Unknown'}
              sx={{
                backgroundColor: getStatusColor(task?.status),
                color: 'white',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                textTransform: 'capitalize',
                fontSize: '0.875rem',
                height: '32px',
              }}
              icon={<CheckCircle sx={{ color: 'white !important' }} />}
            />
            <Chip
              label={`${task?.priority || 'Unknown'} Priority`}
              sx={{
                backgroundColor: getPriorityColor(task?.priority),
                color: 'white',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                textTransform: 'capitalize',
                fontSize: '0.875rem',
                height: '32px',
              }}
              icon={<Flag sx={{ color: 'white !important' }} />}
            />
          </Box>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Task Overview Card */}
          <Card sx={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'white',
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 4 }}>

              {/* Description Section */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Description sx={{ color: '#64748b', fontSize: 18 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    Task Description
                  </Typography>
                </Box>
                <Paper sx={{
                  p: 3,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  borderLeft: '4px solid #8B2635',
                }}>
                  <Typography variant="body1" sx={{ 
                    color: '#475569',
                    lineHeight: 1.6,
                  }}>
                    {task.description}
                  </Typography>
                </Paper>
              </Box>

              {/* Task Details Grid */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1e293b',
                    mb: 3,
                    fontSize: '1.25rem'
                  }}
                >
                  Task Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  {/* Due Date Card */}
                  <Paper sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CalendarToday sx={{ fontSize: 18, color: '#f59e0b' }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Due Date
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, ml: 1 }}>
                      {formatDate(task.due_date)}
                    </Typography>
                  </Paper>

                  {/* Created Date Card */}
                  <Paper sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: '#dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Assignment sx={{ fontSize: 18, color: '#3b82f6' }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Created
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, ml: 1 }}>
                      {formatDate(task.created_at)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              {/* Assigned Team */}
              {task.assigned_employees && task.assigned_employees.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Person sx={{ color: '#64748b', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Assigned Team ({task.assigned_employees.length})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                    {task.assigned_employees.map((employee, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 3,
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            borderColor: '#8B2635',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#8B2635',
                              color: 'white',
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          >
                            {employee.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                              {employee.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              {employee.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}

              {/* No Assigned Team */}
              {(!task.assigned_employees || task.assigned_employees.length === 0) && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Person sx={{ color: '#64748b', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Assigned Team
                    </Typography>
                  </Box>
                  <Paper sx={{
                    p: 4,
                    borderRadius: '8px',
                    border: '2px dashed #e2e8f0',
                    backgroundColor: '#f8fafc',
                    textAlign: 'center',
                  }}>
                    <Person sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                      No team members assigned
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      This task hasn't been assigned to any team members yet.
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card sx={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #10b981 100%)',
            },
          }}>
            <CardContent sx={{ p: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CommentIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1e293b',
                    fontSize: '1.5rem'
                  }}
                >
                  Discussion ({task.comments?.length || 0})
                </Typography>
              </Box>

              {/* Add Comment */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  sx={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    '&:hover': {
                      backgroundColor: '#059669',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      backgroundColor: '#9ca3af',
                      boxShadow: 'none',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {submittingComment ? <CircularProgress size={20} color="inherit" /> : 'Post Comment'}
                </Button>
              </Box>

              {/* Comments List */}
              {task.comments && task.comments.length > 0 ? (
                <Stack spacing={3}>
                  {task.comments.map((comment, index) => (
                    <Paper
                      key={comment.id}
                      sx={{
                        p: 4,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          backgroundColor: '#10b981',
                          borderRadius: '0 4px 4px 0',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, pl: 1 }}>
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            backgroundColor: '#10b981',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          {comment.author_name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>
                              {comment.author_name}
                            </Typography>
                            <Box sx={{
                              px: 2,
                              py: 0.5,
                              backgroundColor: '#f1f5f9',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                            }}>
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                                {formatCommentDate(comment.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: '#475569',
                              lineHeight: 1.6,
                              whiteSpace: 'pre-wrap',
                              fontSize: '0.95rem'
                            }}
                          >
                            {comment.content}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Paper sx={{
                  p: 6,
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '16px',
                }}>
                  <Box sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}>
                    <CommentIcon sx={{ fontSize: 28, color: '#94a3b8' }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                    No comments yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Start the conversation by adding the first comment!
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
