import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employerApi } from '../../services/employer';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal
} from '@mui/material';
import {
  Business,
  Person,
  LocationOn,
  AccessTime,
  CalendarToday,
  Payment,
  CheckCircle,
  ArrowBack,
  Work,
  Map,
  Directions,
  Search,
  Groups,
  Close,
  DirectionsCar,
  DirectionsWalk,
  DirectionsBike,
  DirectionsBus,
  Schedule,
  AttachMoney,
  ChevronLeft,
  ChevronRight,
  Wifi,
  LocalCafe,
  Print,
  MeetingRoom
} from '@mui/icons-material';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
  overflow: 'hidden',
};

const GOOGLE_LIBRARIES = ['places', 'geometry'];

export default function BookCoworkingPage() {
  const [employees, setEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [spaces, setSpaces] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [error, setError] = useState('');

  // Safe JSON parsing functions
  const safeParsePackages = (packagesData) => {
    if (!packagesData) return [];
    if (Array.isArray(packagesData)) return packagesData;
    
    try {
      return JSON.parse(packagesData);
    } catch (e) {
      // If it's a comma-separated string, split it
      if (typeof packagesData === 'string') {
        return packagesData.split(',').map(item => ({
          name: item.trim(),
          price_per_hour: 0,
          price_per_day: 0,
          description: item.trim()
        }));
      }
      return [];
    }
  };

  const safeParseAmenities = (amenitiesData) => {
    if (!amenitiesData) return [];
    if (Array.isArray(amenitiesData)) return amenitiesData;
    
    try {
      return JSON.parse(amenitiesData);
    } catch (e) {
      // If it's a comma-separated string, split it
      if (typeof amenitiesData === 'string') {
        return amenitiesData.split(',').map(item => item.trim());
      }
      return [];
    }
  };
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [commuteModalOpen, setCommuteModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [commuteData, setCommuteData] = useState(null);
  const [packageImageIndices, setPackageImageIndices] = useState({});
  const [imageCarouselOpen, setImageCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  const [travelTimes, setTravelTimes] = useState({});
  const [routeDirections, setRouteDirections] = useState(null);
  
  // Map states
  const [mapReady, setMapReady] = useState(false);
  const [markersReady, setMarkersReady] = useState(false);
  
  // Commute modal map states (separate from main map)
  const [commuteMapReady, setCommuteMapReady] = useState(false);
  const [commuteMarkersReady, setCommuteMarkersReady] = useState(false);
  
  const navigate = useNavigate();
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  // Fetch employees without current bookings
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await employerApi.get('/employer/employees');
        const allEmployees = res.data;
        // Show all employees, not just those without bookings
        setEmployees(allEmployees);
        setAvailableEmployees(allEmployees);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
        setError('Failed to load employee list. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch coworking spaces when employee or distance changes
  useEffect(() => {
    if (!selectedEmployeeId) return;

    const fetchCoworkingSpaces = async () => {
      setSpacesLoading(true);
      setMarkersReady(false); // Reset markers when fetching new data
      setError('');
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view coworking spaces.');
          setSpacesLoading(false);
          return;
        }

        const emp = employees.find(e => e.id === parseInt(selectedEmployeeId));
        setSelectedEmployee(emp);

        // Check if employee has location data
        if (!emp || !emp.latitude || !emp.longitude || (emp.latitude === 0 && emp.longitude === 0)) {
          setError('Employee location not set. Please update employee address first.');
          setSpacesLoading(false);
          return;
        }

        console.log('Fetching coworking spaces for employee:', selectedEmployeeId, 'with radius:', selectedDistance, 'km');
        const apiUrl = `/employer/coworking-spaces?employee_id=${selectedEmployeeId}&max_distance_km=${selectedDistance}`;
        console.log('API URL:', apiUrl);
        const res = await employerApi.get(apiUrl);
        console.log('Coworking spaces response:', res.data);
        console.log('Number of spaces found:', res.data?.length || 0);
        setSpaces(res.data);
      } catch (err) {
        console.error('Error fetching coworking spaces:', err);
        console.error('Error response:', err.response?.data);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response?.status === 404) {
          setError('Employee not found or no location set.');
        } else {
          setError(`Failed to load coworking spaces: ${err.response?.data?.detail || err.message}`);
        }
      } finally {
        setSpacesLoading(false);
      }
    };

    fetchCoworkingSpaces();
  }, [selectedEmployeeId, selectedDistance, employees]);

  // Modal handlers
  const handleViewPlans = (space) => {
    setSelectedSpace(space);
    setModalOpen(true);
  };

  const handleViewCommute = async (space) => {
    setSelectedSpace(space);
    setCommuteModalOpen(true);
    
    // Set estimated travel times based on distance
    const estimatedTimes = {
      driving: { 
        duration: `~${Math.round((space.distance_km || 0) * 2)} min`, 
        distance: `${(space.distance_km || 0).toFixed(1)} km`, 
        icon: DirectionsCar 
      },
      walking: { 
        duration: `~${Math.round((space.distance_km || 0) * 12)} min`, 
        distance: `${(space.distance_km || 0).toFixed(1)} km`, 
        icon: DirectionsWalk 
      },
      bicycling: { 
        duration: `~${Math.round((space.distance_km || 0) * 4)} min`, 
        distance: `${(space.distance_km || 0).toFixed(1)} km`, 
        icon: DirectionsBike 
      },
      transit: { 
        duration: `~${Math.round((space.distance_km || 0) * 3)} min`, 
        distance: `${(space.distance_km || 0).toFixed(1)} km`, 
        icon: DirectionsBus 
      }
    };
    setTravelTimes(estimatedTimes);
  };

  const closeModals = () => {
    setModalOpen(false);
    setCommuteModalOpen(false);
    setSelectedSpace(null);
    setTravelTimes({});
    setRouteDirections(null);
    // Reset commute modal map states for fresh loading
    setCommuteMapReady(false);
    setCommuteMarkersReady(false);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Glassmorphism Header Section */}
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
            <Avatar sx={{ backgroundColor: '#8B2635', mr: 2, width: 56, height: 56 }}>
              <Groups />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B2635', mb: 1 }}>
                Book Coworking Space for Employee
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Find and book coworking spaces for your team members
              </Typography>
            </Box>
          </Box>

        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Employee Selection Section */}
      <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 3, display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1, color: '#8B2635' }} />
            Select Employee & Search Preferences
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel>Select Employee</InputLabel>
                <Select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  label="Select Employee"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        minWidth: 400,
                        '& .MuiMenuItem-root': {
                          minHeight: 60,
                          whiteSpace: 'nowrap'
                        }
                      }
                    }
                  }}
                  sx={{
                    minWidth: 300,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#8B2635',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B2635',
                      },
                    },
                    '& .MuiSelect-select': {
                      minHeight: 'auto',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>-- Select an employee --</em>
                  </MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            backgroundColor: '#8B2635',
                            width: 32,
                            height: 32,
                            mr: 2,
                            fontSize: '0.875rem'
                          }}
                        >
                          {employee.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {employee.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {employee.email} • {employee.city}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {employees.length === 0 && !loading && (
                <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                  No employees available for booking
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Search Radius</InputLabel>
                <Select
                  value={selectedDistance}
                  onChange={(e) => {
                    console.log('Radius changed from', selectedDistance, 'to', e.target.value);
                    setSelectedDistance(e.target.value);
                  }}
                  label="Search Radius"
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
                >
                  <MenuItem value={5}>Within 5 km</MenuItem>
                  <MenuItem value={10}>Within 10 km</MenuItem>
                  <MenuItem value={20}>Within 20 km</MenuItem>
                  <MenuItem value={50}>Within 50 km</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>



      {/* Selected Employee Details */}
      {selectedEmployee && (
        <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 2, display: 'flex', alignItems: 'center' }}>
              <Work sx={{ mr: 1, color: '#8B2635' }} />
              Selected Employee Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      backgroundColor: '#8B2635',
                      width: 64,
                      height: 64,
                      mr: 3,
                      fontSize: '1.5rem',
                      fontWeight: 600
                    }}
                  >
                    {selectedEmployee.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
                      {selectedEmployee.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                      {selectedEmployee.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ color: '#8B2635', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    <strong>Location:</strong> {selectedEmployee.city}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                  Searching for coworking spaces within {selectedDistance} km radius
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {spacesLoading && (
        <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#8B2635', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#6b7280' }}>
              Finding coworking spaces near {selectedEmployee?.name}...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Coworking Spaces Results */}
      {selectedEmployeeId && spaces.length > 0 && (
        <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                <Map sx={{ mr: 1, color: '#8B2635' }} />
                Found {spaces.length} Coworking Space{spaces.length !== 1 ? 's' : ''} within {selectedDistance} km
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Workspace</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center' }}>Distance</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center' }}>Pricing</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center' }}>Commute Info</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {spaces.map((space) => (
                    <TableRow 
                      key={space.id} 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f8fafc' },
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ backgroundColor: '#8B2635', mr: 2, width: 32, height: 32 }}>
                            <Business sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                              {space.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {space.city}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {space.address}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          icon={<LocationOn sx={{ fontSize: 16 }} />}
                          label={`${space.distance_km?.toFixed(1)} km`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(139, 38, 53, 0.1)',
                            color: '#8B2635',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                          variant="text"
                          size="small"
                          sx={{
                            color: '#8B2635',
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            p: 1,
                            minWidth: 'auto',
                            whiteSpace: 'nowrap'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPlans(space);
                          }}
                        >
                          View Plans
                        </Button>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="View Commute Details">
                          <IconButton
                            size="small"
                            sx={{ color: '#8B2635' }}
                            onClick={() => handleViewCommute(space)}
                          >
                            <Directions />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: '#8B2635',
                              '&:hover': { backgroundColor: '#a02d3f' },
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 2
                            }}
                            onClick={() =>
                              navigate("/employer/coworking/checkout", {
                                state: {
                                  employeeId: selectedEmployeeId,
                                  coworkingSpace: space,
                                  employeeName: selectedEmployee.name
                                },
                              })
                            }
                          >
                            Book Now
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!spacesLoading && selectedEmployeeId && spaces.length === 0 && (
        <Card sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ backgroundColor: '#f3f4f6', color: '#9ca3af', mx: 'auto', mb: 2, width: 64, height: 64 }}>
              <Search sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h6" sx={{ color: '#374151', mb: 1 }}>
              No Coworking Spaces Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
              No coworking spaces found within {selectedDistance} km of {selectedEmployee?.name}'s location.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSelectedDistance(selectedDistance < 50 ? selectedDistance * 2 : 50)}
              sx={{
                borderColor: '#8B2635',
                color: '#8B2635',
                '&:hover': {
                  borderColor: '#8B2635',
                  backgroundColor: 'rgba(139, 38, 53, 0.04)'
                },
                textTransform: 'none'
              }}
            >
              Try Larger Radius ({selectedDistance < 50 ? selectedDistance * 2 : 50} km)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Interactive Map */}
      {selectedEmployee && spaces.length > 0 && (
        <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                <Map sx={{ mr: 1, color: '#8B2635' }} />
                Coworking Spaces Near {selectedEmployee.first_name || selectedEmployee.name}
              </Typography>
            </Box>
            {loadError ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="error">
                  Failed to load Google Maps. Please check your API key and internet connection.
                </Alert>
              </Box>
            ) : !isLoaded ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#8B2635', mb: 2 }} />
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Loading Google Maps...
                </Typography>
              </Box>
            ) : !selectedEmployee?.latitude || !selectedEmployee?.longitude ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="warning">
                  Employee location not available. Please ensure employee has a valid address.
                </Alert>
              </Box>
            ) : (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={{
                  lat: parseFloat(selectedEmployee.latitude),
                  lng: parseFloat(selectedEmployee.longitude)
                }}
                zoom={12}
                onLoad={(map) => {
                  console.log('Map loaded successfully');
                  setMapReady(true);
                  setTimeout(() => {
                    setMarkersReady(true);
                    if (spaces.length > 0) {
                      const bounds = new window.google.maps.LatLngBounds();
                      bounds.extend({ lat: parseFloat(selectedEmployee.latitude), lng: parseFloat(selectedEmployee.longitude) });
                      spaces.forEach((s) => {
                        if (s.latitude && s.longitude) {
                          bounds.extend({ lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) });
                        }
                      });
                      map.fitBounds(bounds, 50);
                    }
                  }, 1000);
                }}
              >
                {/* Employee Location Marker */}
                {mapReady && markersReady && (
                  <Marker
                    position={{
                      lat: parseFloat(selectedEmployee.latitude),
                      lng: parseFloat(selectedEmployee.longitude)
                    }}
                    title={`${selectedEmployee.first_name || selectedEmployee.name}'s Location`}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                  />
                )}
                
                {/* Coworking Space Markers */}
                {mapReady && markersReady && spaces.map((space) => (
                  space.latitude && space.longitude && (
                    <Marker
                      key={space.id}
                      position={{
                        lat: parseFloat(space.latitude),
                        lng: parseFloat(space.longitude)
                      }}
                      title={space.title}
                      icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                      }}
                      onClick={() => {
                        handleViewCommute(space);
                      }}
                    />
                  )
                ))}
              </GoogleMap>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plans Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModals}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#8B2635', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Business />
            {selectedSpace?.title} - Available Plans
          </Box>
          <IconButton
            onClick={closeModals}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedSpace && (
            <Box>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                p: 3,
                mb: 4,
              }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                  {selectedSpace.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: '1.2rem', color: '#8B2635' }} />
                  {selectedSpace.address}
                </Typography>
              </Box>

              {/* Package Plans */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 4,
                pb: 3,
                borderBottom: '2px solid #f1f5f9'
              }}>
                <Box sx={{
                  backgroundColor: '#8B2635',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Business sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Available Packages
                </Typography>
              </Box>
              
              {(() => {
                let packages = [];
                
                // Enhanced package parsing with robust error handling
                if (selectedSpace.packages) {
                  try {
                    console.log('🔍 BookCoworkingPage: Raw packages data:', selectedSpace.packages);
                    console.log('🔍 BookCoworkingPage: Packages data type:', typeof selectedSpace.packages);
                    
                    // Parse packages from JSON string or use array directly
                    if (typeof selectedSpace.packages === 'string') {
                      packages = JSON.parse(selectedSpace.packages);
                    } else if (Array.isArray(selectedSpace.packages)) {
                      packages = selectedSpace.packages;
                    }
                    
                    console.log('🔍 BookCoworkingPage: Parsed packages:', packages);
                    console.log('🔍 BookCoworkingPage: First package images:', packages[0]?.images);
                    
                    // Validate packages array
                    if (!Array.isArray(packages) || packages.length === 0) {
                      packages = [];
                    } else {
                      // Normalize price data types - handle both strings and numbers
                      packages = packages.map(pkg => ({
                        ...pkg,
                        price_per_hour: pkg.price_per_hour ? parseFloat(pkg.price_per_hour) || 0 : 0,
                        price_per_day: pkg.price_per_day ? parseFloat(pkg.price_per_day) || 0 : 0,
                        price_per_week: pkg.price_per_week ? parseFloat(pkg.price_per_week) || 0 : 0,
                        price_per_month: pkg.price_per_month ? parseFloat(pkg.price_per_month) || 0 : 0
                      }));
                    }
                  } catch (error) {
                    console.error('Error parsing packages:', error);
                    packages = [];
                  }
                }

                if (packages.length === 0) {
                  return (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      No packages available for this coworking space.
                    </Alert>
                  );
                }

                return (
                  <Box sx={{ mb: 3 }}>
                    {packages.map((pkg, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Card sx={{ 
                          width: '100%',
                          border: '1px solid #e2e8f0',
                          borderRadius: 3,
                          background: '#ffffff',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          '&:hover': { 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.2s ease'
                        }}>
                          <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {pkg.name || `Package ${index + 1}`}
                              </Typography>
                              {pkg.type && (
                                <Chip 
                                  label={pkg.type.replace('_', ' ').toUpperCase()} 
                                  sx={{ 
                                    backgroundColor: '#8B2635', 
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </Box>
                            
                            {pkg.description && (
                              <Typography variant="body2" sx={{ mb: 2, color: '#6b7280' }}>
                                {pkg.description}
                              </Typography>
                            )}

                            {/* Pricing Grid - Always show all pricing options */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={6}>
                                <Box sx={{
                                  p: 2,
                                  textAlign: 'center',
                                  background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
                                  borderRadius: 1,
                                  border: '1px solid #f59e0b'
                                }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#92400e' }}>
                                    ${pkg.price_per_hour.toFixed(0)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#92400e' }}>
                                    per hour
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Box sx={{
                                  p: 2,
                                  textAlign: 'center',
                                  background: 'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%)',
                                  borderRadius: 1,
                                  border: '1px solid #10b981'
                                }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#065f46' }}>
                                    ${pkg.price_per_day.toFixed(0)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#065f46' }}>
                                    per day
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Box sx={{
                                  p: 2,
                                  textAlign: 'center',
                                  background: 'linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)',
                                  borderRadius: 1,
                                  border: '1px solid #c4b5fd'
                                }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                                    ${pkg.price_per_week.toFixed(0)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#7c3aed' }}>
                                    per week
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Box sx={{
                                  p: 2,
                                  textAlign: 'center',
                                  background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                                  borderRadius: 1,
                                  border: '1px solid #f87171'
                                }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#dc2626' }}>
                                    ${pkg.price_per_month.toFixed(0)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#dc2626' }}>
                                    per month
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            {/* Package Images Gallery */}
                            {(() => {
                              const images = pkg.images || [];
                              
                              const openImageCarousel = (startIndex = 0) => {
                                // FORCE: Only use package-specific images, filter out any invalid ones
                                const packageImages = (pkg.images || []).filter(img => 
                                  img && (img.url || img.image_url || img.thumbnail_medium_url)
                                );
                                
                                console.log('🎠 BookCoworkingPage: Opening carousel with package images:', packageImages);
                                console.log('🎠 BookCoworkingPage: Package name:', pkg.name);
                                console.log('🎠 BookCoworkingPage: Start index:', startIndex);
                                console.log('🎠 BookCoworkingPage: Number of images:', packageImages.length);
                                
                                // FORCE: Clear any existing carousel images first, then set new ones
                                setCarouselImages([]);
                                setTimeout(() => {
                                  setCarouselImages(packageImages);
                                  setCarouselStartIndex(startIndex);
                                  setImageCarouselOpen(true);
                                }, 10);
                              };
                              
                              if (images.length === 0) {
                                return (
                                  <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                      <Business sx={{ color: '#8B2635', fontSize: '1.2rem' }} />
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
                                        Package Images (0)
                                      </Typography>
                                    </Box>
                                    <Box sx={{
                                      width: '100%',
                                      height: 120,
                                      borderRadius: 2,
                                      backgroundColor: '#f8fafc',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '2px dashed #d1d5db'
                                    }}>
                                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        No images available
                                      </Typography>
                                    </Box>
                                  </Box>
                                );
                              }
                              
                              return (
                                <Box sx={{ mb: 3 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Business sx={{ color: '#8B2635', fontSize: '1.2rem' }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
                                      Package Images ({images.length})
                                    </Typography>
                                  </Box>
                                  
                                  {/* Horizontal Thumbnail Gallery */}
                                  <Box sx={{
                                    display: 'flex',
                                    gap: 1,
                                    overflowX: 'auto',
                                    pb: 1,
                                    '&::-webkit-scrollbar': {
                                      height: 6
                                    },
                                    '&::-webkit-scrollbar-track': {
                                      backgroundColor: '#f1f5f9'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                      backgroundColor: '#8B2635',
                                      borderRadius: 3
                                    }
                                  }}>
                                    {images.map((image, imageIndex) => (
                                      <Box
                                        key={imageIndex}
                                        sx={{
                                          minWidth: 100,
                                          width: 100,
                                          height: 80,
                                          borderRadius: 2,
                                          overflow: 'hidden',
                                          cursor: 'pointer',
                                          border: '2px solid transparent',
                                          transition: 'all 0.2s ease',
                                          '&:hover': {
                                            border: '2px solid #8B2635',
                                            transform: 'scale(1.05)'
                                          }
                                        }}
                                        onClick={() => openImageCarousel(imageIndex)}
                                      >
                                        <img
                                          src={(() => {
                                            // Use medium thumbnail for package images, fallback to original
                                            console.log('🖼️ BookCoworkingPage Image data:', image);
                                            console.log('📋 BookCoworkingPage Available fields:', Object.keys(image));
                                            console.log('🎯 BookCoworkingPage thumbnail_medium_url:', image.thumbnail_medium_url);
                                            console.log('🎯 BookCoworkingPage thumbnail_url:', image.thumbnail_url);
                                            console.log('🎯 BookCoworkingPage image_url:', image.image_url);
                                            console.log('🎯 BookCoworkingPage url:', image.url);
                                            
                                            const thumbnailUrl = image.thumbnail_medium_url || image.thumbnail_url || image.image_url || image.url;
                                            console.log('✅ BookCoworkingPage Final URL being used:', thumbnailUrl);
                                            
                                            // Don't add localhost prefix if URL already has it
                                            if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
                                              return thumbnailUrl;
                                            }
                                            return `http://localhost:8001${thumbnailUrl}`;
                                          })()}
                                          alt={image.name || `${pkg.name} image ${imageIndex + 1}`}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                          onError={(e) => {
                                            // Show broken image icon instead of hiding
                                             console.log('❌ Failed to load package image:', e.target.src);
                                             e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0zNSA0NUw0NSAzNUw2NSA1NUw3MCA0NUw4MCA2MFYyMEgyMFY2MEwzNSA0NVoiIGZpbGw9IiNkMWQ1ZGIiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNSIgZmlsbD0iI2QxZDVkYiIvPgo8L3N2Zz4K';
                                             e.target.style.objectFit = 'contain';
                                           }}
                                        />
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              );
                            })()}

                            {/* Package Amenities */}
                            {pkg.amenities && pkg.amenities.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                                  Package Amenities:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {pkg.amenities.map((amenity, amenityIndex) => (
                                    <Chip
                                      key={amenityIndex}
                                      label={amenity}
                                      size="small"
                                      sx={{
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {/* Book Button */}
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{
                                mt: 2,
                                backgroundColor: '#8B2635',
                                '&:hover': { backgroundColor: '#a02d3f' },
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1.5
                              }}
                              onClick={() => {
                                navigate('/employer/coworking/checkout', {
                                  state: {
                                    employeeId: selectedEmployee?.id,
                                    coworkingSpace: selectedSpace,
                                    employeeName: selectedEmployee?.first_name || selectedEmployee?.name,
                                    package: pkg.name
                                  }
                                });
                              }}
                            >
                              Book {pkg.name || 'Package'}
                            </Button>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                );
              })()}


            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Commute Modal */}
      <Dialog
        open={commuteModalOpen}
        onClose={closeModals}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#8B2635', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 600 }}>
              Your Personal Commute
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, color: 'white' }}>
              From your location to your chosen workspace
            </Typography>
          </Box>
          <IconButton
            onClick={closeModals}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 'calc(90vh - 64px)' }}>
          {selectedSpace && selectedEmployee && (
            <Box sx={{ display: 'flex', height: '100%' }}>
              {/* Left Panel - Route Information */}
              <Box sx={{ 
                width: '320px', 
                minWidth: '320px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRight: '1px solid #e2e8f0'
              }}>
                <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ 
                      color: '#1e293b', 
                      fontWeight: 700, 
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #8B2635, #a02d3f)'
                      }} />
                      Route Details
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                      Your commute information
                    </Typography>
                  </Box>
                  
                  {/* Location Card */}
                  <Card sx={{ 
                    mb: 3, 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      {/* From Location */}
                      <Box sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            mr: 1.5,
                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                          }} />
                          <Typography variant="subtitle2" sx={{ 
                            color: '#1e293b', 
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                            From
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: '#475569', 
                          ml: 2.5,
                          lineHeight: 1.4,
                          fontSize: '0.8rem'
                        }}>
                          {selectedEmployee.address || `${selectedEmployee.first_name || selectedEmployee.name}'s Location`}
                        </Typography>
                      </Box>
                      
                      {/* Divider Line */}
                      <Box sx={{
                        height: 24,
                        width: 2,
                        background: 'linear-gradient(to bottom, #3b82f6, #ef4444)',
                        ml: 0.75,
                        mb: 2.5,
                        borderRadius: 1
                      }} />
                      
                      {/* To Location */}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            mr: 1.5,
                            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                          }} />
                          <Typography variant="subtitle2" sx={{ 
                            color: '#1e293b', 
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                            To
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: '#475569', 
                          ml: 2.5,
                          lineHeight: 1.4,
                          fontSize: '0.8rem'
                        }}>
                          {selectedSpace.title}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#64748b', 
                          ml: 2.5,
                          lineHeight: 1.4,
                          fontSize: '0.75rem',
                          mt: 0.5
                        }}>
                          {selectedSpace.address}
                        </Typography>
                      </Box>
                      
                      {/* Distance Badge */}
                      <Box sx={{ 
                        mt: 2.5,
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <Box sx={{
                          background: 'linear-gradient(45deg, #8B2635, #a02d3f)',
                          color: 'white',
                          px: 2,
                          py: 0.75,
                          borderRadius: 2,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(139, 38, 53, 0.2)'
                        }}>
                          {selectedSpace.distance_km?.toFixed(1)} km away
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  {/* Travel Times Card */}
                  <Card sx={{ 
                    mb: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Typography variant="subtitle2" sx={{ 
                        color: '#1e293b', 
                        mb: 2, 
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Schedule sx={{ fontSize: 16, color: '#8B2635' }} />
                        Travel Times
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        {/* Car */}
                        <Box sx={{ 
                          p: 1.5,
                          borderRadius: 1.5,
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          border: '1px solid #f59e0b20',
                          textAlign: 'center'
                        }}>
                          <DirectionsCar sx={{ color: '#d97706', fontSize: 20, mb: 0.5 }} />
                          <Typography variant="caption" sx={{ 
                            display: 'block', 
                            color: '#92400e',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            ~{Math.round((selectedSpace.distance_km || 0) * 2)} min
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            display: 'block', 
                            color: '#a16207',
                            fontSize: '0.65rem'
                          }}>
                            Car
                          </Typography>
                        </Box>
                        
                        {/* Walk */}
                        <Box sx={{ 
                          p: 1.5,
                          borderRadius: 1.5,
                          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                          border: '1px solid #22c55e20',
                          textAlign: 'center'
                        }}>
                          <DirectionsWalk sx={{ color: '#16a34a', fontSize: 20, mb: 0.5 }} />
                          <Typography variant="caption" sx={{ 
                            display: 'block', 
                            color: '#15803d',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            ~{Math.round((selectedSpace.distance_km || 0) * 12)} min
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            display: 'block', 
                            color: '#166534',
                            fontSize: '0.65rem'
                          }}>
                            Walk
                          </Typography>
                        </Box>
                        
                        {/* Bike */}
                        <Box sx={{ 
                          p: 1.5,
                          borderRadius: 1.5,
                          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                          border: '1px solid #3b82f620',
                          textAlign: 'center'
                        }}>
                          <DirectionsBike sx={{ color: '#2563eb', fontSize: 20, mb: 0.5 }} />
                          <Typography variant="caption" sx={{ 
                            display: 'block', 
                            color: '#1d4ed8',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            ~{Math.round((selectedSpace.distance_km || 0) * 4)} min
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            display: 'block', 
                            color: '#1e40af',
                            fontSize: '0.65rem'
                          }}>
                            Bike
                          </Typography>
                        </Box>
                        
                        {/* Transit */}
                        <Box sx={{ 
                          p: 1.5,
                          borderRadius: 1.5,
                          background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                          border: '1px solid #ec489920',
                          textAlign: 'center'
                        }}>
                          <DirectionsBus sx={{ color: '#ec4899', fontSize: 20, mb: 0.5 }} />
                          <Typography variant="caption" sx={{ 
                            display: 'block', 
                            color: '#be185d',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            ~{Math.round((selectedSpace.distance_km || 0) * 3)} min
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            display: 'block', 
                            color: '#9d174d',
                            fontSize: '0.65rem'
                          }}>
                            Transit
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  {/* Direction Info Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1
                    }}>
                      <Directions sx={{ color: '#8B2635', fontSize: '1.2rem' }} />
                      Direction Info
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Directions />}
                    onClick={() => {
                      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${selectedEmployee.address}&destination=${selectedSpace.address}`;
                      window.open(mapsUrl, '_blank');
                    }}
                    sx={{
                      borderColor: '#8B2635',
                      color: '#8B2635',
                      textTransform: 'none',
                      mb: 1
                    }}
                  >
                    Get Directions
                  </Button>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      closeModals();
                      handleViewPlans(selectedSpace);
                    }}
                    sx={{
                      backgroundColor: '#8B2635',
                      textTransform: 'none'
                    }}
                  >
                    View Pricing Plans
                  </Button>
                </Box>
              </Box>

              {/* Right Panel - Interactive Map */}
              <Box sx={{ flex: 1, position: 'relative' }}>
                {isLoaded && selectedEmployee?.latitude && selectedSpace?.latitude ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{
                      lat: parseFloat(selectedEmployee.latitude),
                      lng: parseFloat(selectedEmployee.longitude)
                    }}
                    zoom={12}
                    onLoad={(map) => {
                      console.log('Commute modal map loaded');
                      setCommuteMapReady(true);
                      setTimeout(() => {
                        console.log('Setting commute markers ready');
                        setCommuteMarkersReady(true);
                        const bounds = new window.google.maps.LatLngBounds();
                        bounds.extend({ lat: parseFloat(selectedEmployee.latitude), lng: parseFloat(selectedEmployee.longitude) });
                        bounds.extend({ lat: parseFloat(selectedSpace.latitude), lng: parseFloat(selectedSpace.longitude) });
                        map.fitBounds(bounds, 50);
                      }, 1000);
                    }}
                  >
                    {/* Employee Location Marker */}
                    {commuteMapReady && commuteMarkersReady && (
                      <Marker
                        position={{
                          lat: parseFloat(selectedEmployee.latitude),
                          lng: parseFloat(selectedEmployee.longitude)
                        }}
                        title={`${selectedEmployee.first_name || selectedEmployee.name}'s Location`}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                        }}
                      />
                    )}
                    
                    {/* Coworking Space Marker */}
                    {commuteMapReady && commuteMarkersReady && (
                      <Marker
                        position={{
                          lat: parseFloat(selectedSpace.latitude),
                          lng: parseFloat(selectedSpace.longitude)
                        }}
                        title={selectedSpace.title}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress sx={{ color: '#8B2635' }} />
                    <Typography variant="body2" sx={{ color: '#6b7280', mt: 2 }}>
                      Loading map...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Carousel Modal */}
      <Dialog
        open={imageCarouselOpen}
        onClose={() => setImageCarouselOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { backgroundColor: 'rgba(0, 0, 0, 0.9)' } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6">
            Package Images ({carouselImages.length > 0 ? `${(carouselStartIndex % carouselImages.length) + 1} of ${carouselImages.length}` : '0'})
          </Typography>
          <IconButton
            onClick={() => setImageCarouselOpen(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: 'black', position: 'relative' }}>
          {carouselImages.length > 0 && (
            <>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '60vh',
                position: 'relative'
              }}>
                <img
                  src={(() => {
                    if (carouselImages.length === 0) {
                      console.log('🎠 Carousel: No images available');
                      return '';
                    }
                    
                    const image = carouselImages[carouselStartIndex % carouselImages.length];
                    console.log('🎠 Carousel: Current carousel images array:', carouselImages);
                    console.log('🎠 Carousel: Current index:', carouselStartIndex);
                    console.log('🎠 Carousel: Current image:', image);
                    console.log('🎠 Carousel: Image fields available:', image ? Object.keys(image) : 'none');
                    
                    if (!image) {
                      console.log('🎠 Carousel: No image at current index');
                      return '';
                    }
                    
                    // Use original high-quality image for carousel main display
                    console.log('🎠 Carousel: thumbnail_medium_url:', image.thumbnail_medium_url);
                    console.log('🎠 Carousel: thumbnail_url:', image.thumbnail_url);
                    console.log('🎠 Carousel: image_url:', image.image_url);
                    console.log('🎠 Carousel: url:', image.url);
                    
                    let originalUrl = '';
                    if (image.image_url) {
                      originalUrl = image.image_url;
                      console.log('🎠 Carousel: Using original image_url');
                    } else if (image.url && !image.url.includes('/thumbnails/')) {
                      originalUrl = image.url;
                      console.log('🎠 Carousel: Using original url');
                    } else if (image.thumbnail_url) {
                      originalUrl = image.thumbnail_url;
                      console.log('🎠 Carousel: Fallback to thumbnail_url');
                    } else if (image.url) {
                      originalUrl = image.url;
                      console.log('🎠 Carousel: Fallback to url');
                    }
                    
                    console.log('🎠 Carousel: Selected original URL:', originalUrl);
                    
                    // Don't add localhost prefix if URL already has it
                    if (originalUrl && originalUrl.startsWith('http')) {
                      return originalUrl;
                    }
                    
                    // Add localhost prefix for relative URLs
                    const finalUrl = originalUrl ? `http://localhost:8001${originalUrl}` : '';
                    console.log('🎠 Carousel: Final URL with localhost:', finalUrl);
                    return finalUrl;
                  })()}
                  alt={`Image ${carouselStartIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '60vh',
                    objectFit: 'contain',
                    backgroundColor: 'black'
                  }}
                  onError={(e) => {
                    // Show broken image icon for carousel main image
                    console.log('❌ CAROUSEL MAIN IMAGE FAILED TO LOAD:');
                    console.log('❌ Failed URL:', e.target.src);
                    console.log('❌ Current carousel index:', carouselStartIndex);
                    console.log('❌ Current image object:', carouselImages[carouselStartIndex % carouselImages.length]);
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0yODAgMzYwTDM2MCAyODBMNTIwIDQ0MEw1NjAgMzYwTDY0MCA0ODBWMTYwSDE2MFY0ODBMMjgwIDM2MFoiIGZpbGw9IiNkMWQ1ZGIiLz4KPGNpcmNsZSBjeD0iMjQwIiBjeT0iMjQwIiByPSI0MCIgZmlsbD0iI2QxZDVkYiIvPgo8L3N2Zz4K';
                    e.target.style.objectFit = 'contain';
                  }}
                />
                
                {/* Navigation Arrows */}
                {carouselImages.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => setCarouselStartIndex(carouselStartIndex > 0 ? carouselStartIndex - 1 : carouselImages.length - 1)}
                      sx={{
                        position: 'absolute',
                        left: 16,
                        backgroundColor: 'rgba(139, 38, 53, 0.8)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(139, 38, 53, 1)' }
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={() => setCarouselStartIndex((carouselStartIndex + 1) % carouselImages.length)}
                      sx={{
                        position: 'absolute',
                        right: 16,
                        backgroundColor: 'rgba(139, 38, 53, 0.8)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(139, 38, 53, 1)' }
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}
              </Box>
              
              {/* Thumbnail Strip */}
              {carouselImages.length > 1 && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  overflowX: 'auto'
                }}>
                  {carouselImages.map((image, index) => (
                    <Box
                      key={index}
                      onClick={() => setCarouselStartIndex(index)}
                      sx={{
                        width: 60,
                        height: 45,
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: index === carouselStartIndex ? '2px solid #8B2635' : '2px solid transparent',
                        opacity: index === carouselStartIndex ? 1 : 0.6,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          opacity: 1,
                          border: '2px solid #8B2635'
                        }
                      }}
                    >
                      <img
                        src={(() => {
                          // Use small thumbnail for navigation, fallback to medium
                          let thumbnailUrl = '';
                          if (image.thumbnail_small_url) {
                            thumbnailUrl = image.thumbnail_small_url;
                          } else if (image.thumbnail_medium_url) {
                            thumbnailUrl = image.thumbnail_medium_url;
                          } else if (image.url && image.url.includes('/thumbnails/')) {
                            thumbnailUrl = image.url;
                          } else if (image.thumbnail_url) {
                            thumbnailUrl = image.thumbnail_url;
                          } else if (image.image_url) {
                            thumbnailUrl = image.image_url;
                          } else if (image.url) {
                            thumbnailUrl = image.url;
                          }
                          
                          console.log('🎠 Carousel thumbnail navigation URL:', thumbnailUrl);
                          
                          // Don't add localhost prefix if URL already has it
                          if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
                            return thumbnailUrl;
                          }
                          return thumbnailUrl ? `http://localhost:8001${thumbnailUrl}` : '';
                        })()}
                        alt={`Thumbnail ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          // Show broken image icon for thumbnail navigation
                          console.log('❌ Failed to load carousel thumbnail:', e.target.src);
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA2MCA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQ1IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0yMCAyN0wyNyAyMEwzOSAzMkw0MiAyN0w0OCAzNlYxMkgxMlYzNkwyMCAyN1oiIGZpbGw9IiNkMWQ1ZGIiLz4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMyIgZmlsbD0iI2QxZDVkYiIvPgo8L3N2Zz4K';
                          e.target.style.objectFit = 'contain';
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
