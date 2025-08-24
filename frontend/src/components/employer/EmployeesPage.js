// src/components/employer/EmployeesPage.js - Mira Pro Design
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Search,
  Plus,
  Grid3X3,
  List,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building,
  Clock,
  Filter,
  X,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { employerApi } from '../../services/employer';
import { useNavigate } from 'react-router-dom';

export default function EmployeesPage() {
  useEffect(() => {
    document.title = 'Employees - Remoty';
  }, []);

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [coworkingFilter, setCoworkingFilter] = useState('all');
  
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await employerApi.get('/employer/employees');
      const employeeData = response.data || [];
      setEmployees(employeeData);
      setFilteredEmployees(employeeData);
    } catch (err) {
      console.error('Error fetching employees:', err);
      // Only show error for actual API failures, not empty results
      if (err.response?.status !== 404) {
        setError('Failed to load employees. Please try again.');
      } else {
        // 404 means no employees found - treat as empty state
        setEmployees([]);
        setFilteredEmployees([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search term and filters
  useEffect(() => {
    let filtered = employees;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.assigned_coworking_space && emp.assigned_coworking_space.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(emp => 
        emp.city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
        emp.country?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(emp => 
        emp.role_title?.toLowerCase().includes(roleFilter.toLowerCase())
      );
    }

    // Apply coworking space filter
    if (coworkingFilter === 'assigned') {
      filtered = filtered.filter(emp => emp.assigned_coworking_space);
    } else if (coworkingFilter === 'unassigned') {
      filtered = filtered.filter(emp => !emp.assigned_coworking_space);
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, employees, statusFilter, locationFilter, roleFilter, coworkingFilter]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarClass = (id) => {
    const classes = ['', 'orange', 'green', 'purple', 'teal'];
    return classes[id % classes.length];
  };

  // Helper functions for filter options
  const getUniqueLocations = () => {
    const locations = employees.map(emp => `${emp.city}, ${emp.country}`).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  const getUniqueRoles = () => {
    const roles = employees.map(emp => emp.role_title).filter(Boolean);
    return [...new Set(roles)].sort();
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setLocationFilter('');
    setRoleFilter('');
    setCoworkingFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return statusFilter !== 'all' || locationFilter || roleFilter || coworkingFilter !== 'all' || searchTerm;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" color="text.primary">
          Loading employees...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we fetch your team members
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchEmployees}>
              Try Again
            </Button>
          }
        >
          <Typography variant="subtitle1">Unable to load employees</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
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
      transform: 'translateZ(0)', // Force hardware acceleration
      backfaceVisibility: 'hidden', // Reduce flickering
      perspective: '1000px', // Enable 3D transforms
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
      {/* Modern Header */}
      <Paper sx={{ 
        mb: 4, 
        p: 3,
        background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '16px',
        boxShadow: 'none'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: '2rem',
                color: '#8B2635',
                mb: 0.5,
                letterSpacing: '-0.025em'
              }}
            >
              Team Members
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: '1.125rem',
                color: '#6b7280',
                fontWeight: 400,
                mb: 2,
              }}
            >
              Manage and monitor your remote workforce
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                  Total: {employees.length} employees
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Active: {employees.filter(emp => emp.status === 'active').length}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => navigate('/employer/employees/add')}
              sx={{ 
                backgroundColor: '#8B2635',
                color: 'white',
                px: 3,
                py: 1.5,
                borderRadius: '8px',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#7a1f2d',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(139, 38, 53, 0.3)',
                },
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(139, 38, 53, 0.2)',
              }}
            >
              Add Employee
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Unified Filters and Search Section */}
      <Box sx={{
        mb: 3,
        p: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 38, 53, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Header Row */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ color: '#8B2635', fontWeight: 600 }}>
            Filters & Search
          </Typography>
          {hasActiveFilters() && (
            <Button
              variant="text"
              startIcon={<X size={16} />}
              onClick={clearAllFilters}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  color: '#8B2635',
                  backgroundColor: 'rgba(139, 38, 53, 0.05)',
                },
              }}
            >
              Clear All
            </Button>
          )}
        </Box>

        {/* Filters Row */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: '#8B2635' }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected === 'all' || !selected) {
                      return <span style={{ color: '#9ca3af' }}>Select status</span>;
                    }
                    return selected === 'active' ? 'Active' : 'Inactive';
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 38, 53, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 38, 53, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8B2635',
                    },
                  }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} color="#16a34a" />
                        Active
                      </Box>
                    </MenuItem>
                    <MenuItem value="inactive">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <XCircle size={16} color="#6b7280" />
                        Inactive
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

            {/* Location Filter */}
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Autocomplete
                value={locationFilter || null}
                onChange={(event, newValue) => setLocationFilter(newValue || '')}
                options={getUniqueLocations()}
                freeSolo
                clearOnEscape
                sx={{
                  '& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
                    width: '100% !important',
                    minWidth: '180px !important',
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Location"
                    placeholder="Type or select location"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={18} color="#8B2635" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(139, 38, 53, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(139, 38, 53, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B2635',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#8B2635',
                      },
                      '& .MuiAutocomplete-input': {
                        width: '100% !important',
                        minWidth: '200px !important',
                      },
                    }}
                    />
                  )}
                />
              </Grid>

            {/* Role Filter */}
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Autocomplete
                value={roleFilter || null}
                onChange={(event, newValue) => setRoleFilter(newValue || '')}
                options={getUniqueRoles()}
                freeSolo
                clearOnEscape
                sx={{
                  '& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
                    width: '100% !important',
                    minWidth: '180px !important',
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Role"
                    placeholder="Type or select role"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={18} color="#8B2635" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(139, 38, 53, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(139, 38, 53, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B2635',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#8B2635',
                      },
                      '& .MuiAutocomplete-input': {
                        width: '100% !important',
                        minWidth: '200px !important',
                      },
                    }}
                    />
                  )}
                />
              </Grid>

            {/* Coworking Space Filter */}
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: '#8B2635' }}>Coworking Space</InputLabel>
                <Select
                  value={coworkingFilter}
                  label="Coworking Space"
                  onChange={(e) => setCoworkingFilter(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected === 'all' || !selected) {
                      return <span style={{ color: '#9ca3af' }}>Select coworking space</span>;
                    }
                    return selected === 'assigned' ? 'With Coworking Space' : 'Without Coworking Space';
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 38, 53, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 38, 53, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8B2635',
                    },
                  }}
                  >
                    <MenuItem value="all">All Employees</MenuItem>
                    <MenuItem value="assigned">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Building size={16} color="#16a34a" />
                        With Coworking Space
                      </Box>
                    </MenuItem>
                    <MenuItem value="unassigned">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Building size={16} color="#6b7280" />
                        Without Coworking Space
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

        {/* Search and View Controls Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search employees by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#8B2635" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1,
              minWidth: 300,
              maxWidth: 500,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 38, 53, 0.05)',
                '& fieldset': {
                  borderColor: 'rgba(139, 38, 53, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(139, 38, 53, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#8B2635',
                },
              },
            }}
            size="medium"
          />
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            sx={{
              '& .MuiToggleButton-root': {
                borderColor: 'rgba(139, 38, 53, 0.2)',
                color: '#8B2635',
                '&.Mui-selected': {
                  backgroundColor: '#8B2635',
                  color: 'white !important',
                  '&:hover': {
                    backgroundColor: '#7a1f2d',
                    color: 'white !important',
                  },
                  '& .MuiTypography-root': {
                    color: 'white !important',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(139, 38, 53, 0.05)',
                },
              },
            }}
          >
            <ToggleButton value="grid" sx={{ px: 2, py: 1 }}>
              <Grid3X3 size={16} />
              <Typography sx={{ ml: 1, fontWeight: 500 }}>Grid</Typography>
            </ToggleButton>
            <ToggleButton value="list" sx={{ px: 2, py: 1 }}>
              <List size={16} />
              <Typography sx={{ ml: 1, fontWeight: 500 }}>List</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Results Info */}
      {searchTerm && (
        <Box sx={{ mb: 3, px: 1 }}>
          <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
            Showing {filteredEmployees.length} of {employees.length} employees
            {searchTerm && ` for "${searchTerm}"`}
          </Typography>
        </Box>
      )}

      {/* Employees Content */}
      {filteredEmployees.length === 0 ? (
        <Box sx={{ 
          p: 6, 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 38, 53, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <User size={48} color="#8B2635" style={{ marginBottom: 16 }} />
          <Typography variant="h6" sx={{ mb: 1, color: '#8B2635', fontWeight: 600 }}>
            No employees found
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
            {searchTerm 
              ? `No employees match your search for "${searchTerm}"`
              : "You haven't added any employees yet."
            }
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => navigate('/employer/employees/add')}
              sx={{
                backgroundColor: '#8B2635',
                '&:hover': {
                  backgroundColor: '#7a1f2d',
                },
              }}
            >
              Add Your First Employee
            </Button>
          )}
        </Box>
      ) : (
        <Grid 
          container 
          spacing={viewMode === 'grid' ? 3 : 2}
          sx={{
            transform: 'translateZ(0)', // Force hardware acceleration
            backfaceVisibility: 'hidden', // Reduce flickering
            perspective: '1000px', // Enable 3D transforms
          }}
        >
          {filteredEmployees.map(emp => (
            <Grid size={{ xs: 12, sm: viewMode === 'grid' ? 6 : 12, md: viewMode === 'grid' ? 4 : 12 }} key={emp.id}>
              <Card sx={{ 
                height: '100%', 
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 38, 53, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateZ(0)', // Force hardware acceleration
                backfaceVisibility: 'hidden', // Reduce flickering
                willChange: 'transform, box-shadow', // Optimize for animations
                '&:hover': {
                  transform: 'translateY(-4px) translateZ(0)',
                  boxShadow: '0 12px 40px rgba(139, 38, 53, 0.2)',
                  borderColor: 'rgba(139, 38, 53, 0.3)',
                },
              }} onClick={() => navigate(`/employer/employee/${emp.id}`)}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 48, 
                      height: 48, 
                      backgroundColor: '#8B2635',
                      color: 'white',
                      fontWeight: 600
                    }}>
                      {getInitials(emp.first_name, emp.last_name)}
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#1f2937' }}>
                        {emp.first_name} {emp.last_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1.5 }}>
                        {emp.email}
                      </Typography>
                      
                      <Chip
                        label={emp.status === 'active' ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{ 
                          mb: 2,
                          backgroundColor: emp.status === 'active' ? '#dcfce7' : '#f3f4f6',
                          color: emp.status === 'active' ? '#16a34a' : '#6b7280',
                          border: `1px solid ${emp.status === 'active' ? '#bbf7d0' : '#d1d5db'}`,
                          fontWeight: 500
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Phone size={16} color="#8B2635" />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {emp.phone_number || 'No phone provided'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <User size={16} color="#8B2635" />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {emp.role_title || 'No role assigned'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <MapPin size={16} color="#8B2635" />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {emp.city}, {emp.country}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {emp.assigned_coworking_space ? (
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: '#dcfce7', 
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px'
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#16a34a', mb: 0.5 }}>
                            {emp.assigned_coworking_space.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#15803d', display: 'block' }}>
                            {emp.assigned_coworking_space.booking_type}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#15803d', display: 'block', mt: 0.5 }}>
                            Starts: {new Date(emp.assigned_coworking_space.start_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: 'rgba(139, 38, 53, 0.05)', 
                          border: '1px solid rgba(139, 38, 53, 0.1)',
                          borderRadius: '8px'
                        }}>
                          <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 500, mb: 0.5 }}>
                            No coworking space assigned
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            Available for assignment
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <IconButton 
                      size="small"
                      sx={{
                        color: '#8B2635',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 38, 53, 0.1)',
                        },
                      }}
                    >
                      <MoreVertical size={16} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
