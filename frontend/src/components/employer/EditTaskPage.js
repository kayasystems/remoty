import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Delete,
  Person,
  CalendarToday,
  Assignment,
  AttachFile,
  Close,
  Warning,
  Info as InfoIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { employerApi } from '../../services/employer';

export default function EditTaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: null,
    assigned_employee_ids: []
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Data state
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [originalTask, setOriginalTask] = useState(null);

  useEffect(() => {
    fetchTaskDetails();
    fetchEmployees();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const response = await employerApi.get(`/employer/tasks/${taskId}`);
      const task = response.data;
      
      console.log('Fetched task data:', task);
      console.log('Assigned employees:', task.assigned_employees);
      
      setOriginalTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date ? new Date(task.due_date) : null,
        assigned_employee_ids: task.assigned_employees?.map(emp => emp.id) || []
      });
      
      setSelectedEmployees(task.assigned_employees || []);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Failed to load task details');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employerApi.get('/employer/employees');
      console.log('Fetched employees:', response.data);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleEmployeeChange = (event, newValue) => {
    setSelectedEmployees(newValue);
    setFormData(prev => ({
      ...prev,
      assigned_employee_ids: newValue.map(emp => emp.id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date && formData.due_date instanceof Date ? formData.due_date.toISOString() : formData.due_date,
        assigned_employee_ids: formData.assigned_employee_ids
      };

      console.log('Updating task with data:', updateData);
      
      // Update task with all data including assignments
      const response = await employerApi.put(`/employer/tasks/${taskId}`, updateData);
      console.log('Task update response:', response.data);
      
      setSuccess('Task updated successfully!');
      
      setTimeout(() => {
        navigate(`/employer/tasks/${taskId}`);
      }, 1500);
    } catch (err) {
      console.error('=== DETAILED ERROR DEBUG ===');
      console.error('Full error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      console.error('Request config:', err.config);
      console.error('Request URL:', err.config?.url);
      console.error('Request method:', err.config?.method);
      console.error('Request data:', err.config?.data);
      console.error('Request headers:', err.config?.headers);
      console.error('=== END ERROR DEBUG ===');
      
      if (err.response?.data?.detail) {
        setError(`Backend Error: ${err.response.data.detail}`);
      } else if (err.response?.data?.message) {
        setError(`Backend Message: ${err.response.data.message}`);
      } else if (err.response?.status === 422) {
        setError('Invalid data provided. Please check all fields.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to update this task.');
      } else if (err.response?.status === 500) {
        setError(`Server Error (500): ${err.response?.data || 'Internal server error'}`);
      } else if (err.response?.status) {
        setError(`HTTP Error ${err.response.status}: ${err.response?.data || err.message}`);
      } else if (err.message?.includes('Network Error')) {
        setError('Network Error: Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(`Failed to update task: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employerApi.delete(`/employer/tasks/${taskId}`);
      setSuccess('Task deleted successfully!');
      
      setTimeout(() => {
        navigate('/employer/tasks');
      }, 1000);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#8B2635', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#8B2635' }}>
            Loading task details...
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => navigate(`/employer/tasks/${taskId}`)}
              sx={{ 
                backgroundColor: 'rgba(139, 38, 53, 0.1)',
                border: '1px solid rgba(139, 38, 53, 0.2)',
                color: '#8B2635',
                '&:hover': { 
                  backgroundColor: 'rgba(139, 38, 53, 0.2)'
                }
              }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: '#8B2635',
                  mb: 0.5
                }}>
                  Edit Task
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Update task details, assignments, and manage task lifecycle
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{
                borderColor: '#dc2626',
                color: '#dc2626',
                '&:hover': {
                  borderColor: '#b91c1c',
                  backgroundColor: 'rgba(220, 38, 38, 0.05)'
                }
              }}
            >
              Delete Task
            </Button>
          </Box>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Main Form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information Card */}
          <Card 
            sx={{ 
              mb: 3,
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            {/* Header */}
            <Box 
              sx={{ 
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <InfoIcon sx={{ fontSize: 20, color: '#8B2635' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Basic Information
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 3, pt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Task Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#fafafa',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': { borderColor: '#8B2635' }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#8B2635', borderWidth: 2 }
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                  }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={4}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#fafafa',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': { borderColor: '#8B2635' }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#8B2635', borderWidth: 2 }
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                  }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      label="Priority"
                      sx={{
                        borderRadius: '12px',
                        backgroundColor: '#fafafa',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8B2635' }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8B2635', borderWidth: 2 }
                        }
                      }}
                    >
                      <MenuItem value="low">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }} />
                          Low
                        </Box>
                      </MenuItem>
                      <MenuItem value="medium">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                          Medium
                        </Box>
                      </MenuItem>
                      <MenuItem value="high">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                          High
                        </Box>
                      </MenuItem>
                      <MenuItem value="urgent">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#dc2626' }} />
                          Urgent
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Status"
                      sx={{
                        borderRadius: '12px',
                        backgroundColor: '#fafafa',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8B2635' }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8B2635', borderWidth: 2 }
                        }
                      }}
                    >
                      <MenuItem value="pending">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#6b7280' }} />
                          Pending
                        </Box>
                      </MenuItem>
                      <MenuItem value="in_progress">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                          In Progress
                        </Box>
                      </MenuItem>
                      <MenuItem value="completed">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }} />
                          Completed
                        </Box>
                      </MenuItem>
                      <MenuItem value="cancelled">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                          Cancelled
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Due Date"
                    type="datetime-local"
                    value={formData.due_date ? formData.due_date.toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('due_date', e.target.value ? new Date(e.target.value) : null)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#fafafa',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          '& fieldset': { borderColor: '#8B2635' }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          '& fieldset': { borderColor: '#8B2635', borderWidth: 2 }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Employee Assignment Card */}
          <Card 
            sx={{ 
              mb: 3,
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            {/* Header */}
            <Box 
              sx={{ 
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <GroupIcon sx={{ fontSize: 20, color: '#8B2635' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Employee Assignment
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 3, pt: 2 }}>
              <Autocomplete
                multiple
                options={employees}
                getOptionLabel={(option) => {
                  const firstName = option.first_name || '';
                  const lastName = option.last_name || '';
                  const email = option.email || '';
                  return `${firstName} ${lastName} (${email})`.trim();
                }}
                value={selectedEmployees}
                onChange={handleEmployeeChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="filled"
                      label={`${option.first_name || ''} ${option.last_name || ''}`.trim() || option.email || 'Unknown Employee'}
                      {...getTagProps({ index })}
                      key={option.id}
                      sx={{
                        backgroundColor: '#8B2635',
                        color: 'white',
                        borderRadius: '20px',
                        '& .MuiChip-deleteIcon': { 
                          color: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { color: 'white' }
                        }
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Search and select employees"
                    placeholder="Type to search employees..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#fafafa',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          '& fieldset': { borderColor: '#8B2635' }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          '& fieldset': { borderColor: '#8B2635', borderWidth: 2 }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#8B2635' }
                    }}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons Card */}
          <Card 
            sx={{ 
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            {/* Header */}
            <Box 
              sx={{ 
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <SettingsIcon sx={{ fontSize: 20, color: '#8B2635' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Actions
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 3, pt: 2 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/employer/tasks/${taskId}`)}
                    size="large"
                    sx={{
                      borderColor: '#64748b',
                      color: '#64748b',
                      borderRadius: '12px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#475569',
                        backgroundColor: 'rgba(100, 116, 139, 0.05)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #8B2635 0%, #a02d3f 100%)',
                      borderRadius: '12px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      boxShadow: '0 4px 16px rgba(139, 38, 53, 0.3)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #7a2230 0%, #8f2838 100%)',
                        boxShadow: '0 6px 20px rgba(139, 38, 53, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': { 
                        background: '#d1d5db',
                        boxShadow: 'none'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: '#dc2626'
          }}>
            <Warning />
            Confirm Task Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this task? This action cannot be undone.
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              <strong>Task:</strong> {formData.title}
            </Typography>
            {selectedEmployees.length > 0 && (
              <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                <strong>Assigned to:</strong> {selectedEmployees.map(emp => `${emp.first_name} ${emp.last_name}`).join(', ')}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ color: '#64748b' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={20} /> : <Delete />}
            >
              {deleting ? 'Deleting...' : 'Delete Task'}
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}
