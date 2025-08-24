// src/components/employer/CreateTaskPage.js
import React, { useState, useEffect } from 'react';
import { employerApi } from '../../services/employer';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  Alert,
  IconButton,
  Paper,
  Stack,
  Container,
  Divider,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Person,
  AttachFile,
  Delete,
  CloudUpload,
  Description,
  Assignment,
  CalendarToday,
  Flag,
  Search,
  Close,
} from '@mui/icons-material';

export default function CreateTaskPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_employee_ids: []
  });
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employerApi.get('/employer/employees');
      console.log('Fetched employees:', response.data);
      setAllEmployees(response.data);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      // Don't show error for now, we'll handle it in the UI
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmployeeToggle = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      assigned_employee_ids: prev.assigned_employee_ids.includes(employeeId)
        ? prev.assigned_employee_ids.filter(id => id !== employeeId)
        : [...prev.assigned_employee_ids, employeeId]
    }));
  };

  const handleAddEmployee = (employee) => {
    if (!formData.assigned_employee_ids.includes(employee.id)) {
      setFormData(prev => ({
        ...prev,
        assigned_employee_ids: [...prev.assigned_employee_ids, employee.id]
      }));
      setSelectedEmployees(prev => [...prev, employee]);
    }
    setEmployeeSearchTerm('');
    setShowEmployeeSearch(false);
  };

  const handleRemoveEmployee = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      assigned_employee_ids: prev.assigned_employee_ids.filter(id => id !== employeeId)
    }));
    setSelectedEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const getFilteredEmployees = () => {
    if (!employeeSearchTerm) return allEmployees;
    return allEmployees.filter(employee => 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase())
    );
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    // Reset the input
    event.target.value = '';
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Submitting task data:', formData);
      console.log('Selected employees:', selectedEmployees);
      console.log('Assigned employee IDs:', formData.assigned_employee_ids);
      const response = await employerApi.post('/employer/tasks', formData);
      console.log('Task creation response:', response.data);
      setSuccess('Task created successfully!');
      setTimeout(() => {
        navigate('/employer/tasks');
      }, 1500);
    } catch (err) {
      console.error('Error creating task:', err);
      
      // Handle different types of error responses
      let errorMessage = 'Failed to create task';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          if (typeof err.response.data.detail === 'string') {
            errorMessage = err.response.data.detail;
          } else if (Array.isArray(err.response.data.detail)) {
            // Handle validation errors array
            errorMessage = err.response.data.detail.map(error => 
              typeof error === 'string' ? error : error.msg || 'Validation error'
            ).join(', ');
          } else {
            errorMessage = 'Validation error occurred';
          }
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
                  Create New Task
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Create and assign tasks to your remote team members
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment sx={{ color: '#8B2635', fontSize: 28 }} />
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
        }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {/* Task Title */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Description sx={{ color: '#64748b', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Task Details
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Task Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter a descriptive task title"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#8B2635',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B2635',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8B2635',
                      },
                    }}
                  />
                </Box>

            {/* Task Description */}
            <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  placeholder="Describe the task in detail..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#8B2635',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B2635',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#8B2635',
                    },
                  }}
                />

                {/* Priority and Due Date */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Flag sx={{ color: '#64748b', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Priority & Timeline
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ '&.Mui-focused': { color: '#8B2635' } }}>Priority</InputLabel>
                        <Select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          label="Priority"
                          sx={{
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8B2635',
                            },
                          }}
                        >
                          <MenuItem value="low">🟢 Low Priority</MenuItem>
                          <MenuItem value="medium">🟡 Medium Priority</MenuItem>
                          <MenuItem value="high">🔴 High Priority</MenuItem>
                          <MenuItem value="urgent">🚨 Urgent</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Due Date"
                        name="due_date"
                        type="datetime-local"
                        value={formData.due_date}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#8B2635',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B2635',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B2635',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Attachments */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AttachFile sx={{ color: '#64748b', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Attachments
                    </Typography>
                  </Box>
                  <Paper sx={{
                    p: 3,
                    border: '2px dashed #e2e8f0',
                    borderRadius: '8px',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#8B2635',
                      backgroundColor: '#fef7f7',
                    },
                  }}>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                      <CloudUpload sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                      <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                        Drop files here or click to upload
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Supports: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB each)
                      </Typography>
                    </label>
                  </Paper>
                  
                  {/* Uploaded Files */}
                  {attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Stack spacing={1}>
                        {attachments.map((attachment) => (
                          <Paper key={attachment.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AttachFile sx={{ color: '#64748b' }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {attachment.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {formatFileSize(attachment.size)}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveAttachment(attachment.id)}
                              sx={{ color: '#ef4444' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>

                {/* Assign to Team Members */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person sx={{ color: '#64748b', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Assign to Team Members
                    </Typography>
                  </Box>

                  {/* Selected Employees */}
                  {selectedEmployees.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                        Selected Team Members ({selectedEmployees.length})
                      </Typography>
                      <Stack spacing={1}>
                        {selectedEmployees.map(employee => (
                          <Paper
                            key={employee.id}
                            sx={{
                              p: 2,
                              border: '1px solid #8B2635',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(139, 38, 53, 0.05)',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: '#8B2635',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                                    {employee.first_name} {employee.last_name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    {employee.email}
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveEmployee(employee.id)}
                                sx={{ color: '#ef4444' }}
                              >
                                <Close fontSize="small" />
                              </IconButton>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Employee Search */}
                  {showEmployeeSearch ? (
                    <Paper sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Search sx={{ color: '#64748b' }} />
                        <TextField
                          fullWidth
                          placeholder="Search employees by name or email..."
                          value={employeeSearchTerm}
                          onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                          variant="outlined"
                          size="small"
                          autoFocus
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#8B2635',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#8B2635',
                              },
                            },
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            setShowEmployeeSearch(false);
                            setEmployeeSearchTerm('');
                          }}
                          sx={{ color: '#64748b' }}
                        >
                          <Close />
                        </IconButton>
                      </Box>

                      {/* Search Results */}
                      {employeeSearchTerm && (
                        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                          {getFilteredEmployees()
                            .filter(emp => !formData.assigned_employee_ids.includes(emp.id))
                            .map(employee => (
                            <Paper
                              key={employee.id}
                              sx={{
                                p: 2,
                                mb: 1,
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#8B2635',
                                  backgroundColor: 'rgba(139, 38, 53, 0.05)',
                                },
                              }}
                              onClick={() => handleAddEmployee(employee)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: '#8B2635',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                                    {employee.first_name} {employee.last_name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    {employee.email}
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: '#8B2635',
                                    color: '#8B2635',
                                    '&:hover': {
                                      borderColor: '#7a1f2e',
                                      backgroundColor: 'rgba(139, 38, 53, 0.1)',
                                    },
                                  }}
                                >
                                  Add
                                </Button>
                              </Box>
                            </Paper>
                          ))}
                          {getFilteredEmployees()
                            .filter(emp => !formData.assigned_employee_ids.includes(emp.id))
                            .length === 0 && (
                            <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 2 }}>
                              No employees found matching "{employeeSearchTerm}"
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setShowEmployeeSearch(true)}
                      sx={{
                        borderColor: '#8B2635',
                        color: '#8B2635',
                        borderStyle: 'dashed',
                        py: 1.5,
                        '&:hover': {
                          borderColor: '#7a1f2e',
                          backgroundColor: 'rgba(139, 38, 53, 0.1)',
                          borderStyle: 'solid',
                        },
                      }}
                    >
                      {selectedEmployees.length === 0 ? 'Add Team Member' : 'Add Another Team Member'}
                    </Button>
                  )}
                </Box>

                {/* Messages */}
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}

                {/* Submit Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/employer/tasks')}
                    disabled={loading}
                    sx={{
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.title.trim()}
                    sx={{
                      backgroundColor: '#8B2635',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#7a1f2e',
                      },
                      '&:disabled': {
                        backgroundColor: '#cbd5e1',
                        color: '#94a3b8',
                      },
                    }}
                  >
                    {loading ? 'Creating Task...' : 'Create Task'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
