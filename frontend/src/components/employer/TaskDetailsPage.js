// src/components/employer/TaskDetailsPage.js
import React, { useState, useEffect } from 'react';
import { employerApi } from '../../services/employer';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowBack,
  Assignment,
} from '@mui/icons-material';
import Card from '../ui/Card';

export default function TaskDetailsPage() {
  const [task, setTask] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const { taskId } = useParams();

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const [taskResponse, assignmentsResponse] = await Promise.all([
        employerApi.get(`/employer/tasks/${taskId}`),
        employerApi.get(`/employer/tasks/${taskId}/assignments`)
      ]);
      setTask(taskResponse.data);
      setAssignments(assignmentsResponse.data || []);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await employerApi.delete(`/employer/tasks/${taskId}`);
      navigate('/employer/tasks');
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--success-500)';
      case 'in_progress': return 'var(--primary-500)';
      case 'pending': return 'var(--warning-500)';
      case 'cancelled': return 'var(--error-500)';
      default: return 'var(--gray-500)';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'var(--error-500)';
      case 'high': return 'var(--warning-500)';
      case 'medium': return 'var(--primary-500)';
      case 'low': return 'var(--gray-500)';
      default: return 'var(--gray-500)';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <p>Loading task details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <p style={{ color: 'var(--error-500)', marginBottom: 'var(--space-4)' }}>{error}</p>
        <Button variant="ghost" onClick={() => navigate('/employer/tasks')}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <p>Task not found</p>
        <Button variant="ghost" onClick={() => navigate('/employer/tasks')}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Glassmorphism Header */}
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
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B2635', mb: 1 }}>
                  {task.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Task Details & Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip
                    label={`${task.priority} Priority`}
                    sx={{
                      backgroundColor: getPriorityColor(task.priority),
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  />
                  <Chip
                    label={task.status.replace('_', ' ')}
                    sx={{
                      backgroundColor: getStatusColor(task.status),
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
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
                  '&:hover': {
                    backgroundColor: '#7a1f2e',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Edit Task
              </Button>
              <Button 
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteTask}
                disabled={deleteLoading}
                sx={{
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  '&:hover': {
                    borderColor: '#b91c1c',
                    backgroundColor: 'rgba(220, 38, 38, 0.05)'
                  }
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </Box>
          </Box>
        </Paper>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Main Content */}
        <div>
          {/* Task Description */}
          <Card style={{ marginBottom: 'var(--space-4)' }}>
            <Card.Header>
              <h3 style={{ margin: 0 }}>Description</h3>
            </Card.Header>
            <Card.Content>
              {task.description ? (
                <p style={{ margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {task.description}
                </p>
              ) : (
                <p style={{ margin: 0, color: 'var(--gray-500)', fontStyle: 'italic' }}>
                  No description provided
                </p>
              )}
            </Card.Content>
          </Card>

          {/* Task Assignments */}
          <Card>
            <Card.Header>
              <h3 style={{ margin: 0 }}>Assigned Employees ({assignments.length})</h3>
            </Card.Header>
            <Card.Content>
              {assignments.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--gray-500)', fontStyle: 'italic' }}>
                  No employees assigned to this task
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {assignments.map(assignment => (
                    <div 
                      key={assignment.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-3)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--gray-50)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: 'var(--space-1)' }}>
                          {assignment.employee?.first_name} {assignment.employee?.last_name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {assignment.employee?.email}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: `${getStatusColor(assignment.status)}20`,
                          color: getStatusColor(assignment.status),
                          textTransform: 'capitalize',
                          marginBottom: 'var(--space-1)'
                        }}>
                          {assignment.status.replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          Assigned: {formatDate(assignment.assigned_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Task Info */}
          <Card style={{ marginBottom: 'var(--space-4)' }}>
            <Card.Header>
              <h3 style={{ margin: 0 }}>Task Information</h3>
            </Card.Header>
            <Card.Content>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>
                    Due Date
                  </div>
                  <div style={{ fontWeight: '500' }}>
                    {formatDate(task.due_date)}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>
                    Created
                  </div>
                  <div style={{ fontWeight: '500' }}>
                    {formatDateTime(task.created_at)}
                  </div>
                </div>

                {task.updated_at && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>
                      Last Updated
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      {formatDateTime(task.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <h3 style={{ margin: 0 }}>Quick Actions</h3>
            </Card.Header>
            <Card.Content>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Button 
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/employer/tasks/${taskId}/edit`)}
                  sx={{
                    borderColor: '#8B2635',
                    color: '#8B2635',
                    '&:hover': {
                      borderColor: '#8B2635',
                      backgroundColor: 'rgba(139, 38, 53, 0.1)',
                    },
                  }}
                >
                  Edit Task
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/employer/tasks/create')}
                >
                  ➕ Create Similar Task
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/employer/tasks')}
                >
                  📋 View All Tasks
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
