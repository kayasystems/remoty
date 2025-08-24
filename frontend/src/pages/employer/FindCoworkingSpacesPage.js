import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { employerApi } from '../../services/employer';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  DirectionsWalk as WalkIcon,
  DirectionsWalk as DirectionsWalkIcon,
  DirectionsCar as DirectionsCarIcon,
  DirectionsBike as DirectionsBikeIcon,
  DirectionsBus as DirectionsBusIcon,
  Business as BusinessIcon,
  Map as MapIcon,
  MyLocation as MyLocationIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Directions as DirectionsIcon,
  Schedule as ScheduleIcon,
  Group,
  PhotoLibrary as PhotoLibraryIcon,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
};

const GOOGLE_LIBRARIES = ['places', 'geometry'];

export default function FindCoworkingSpacesPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [employerLatLng, setEmployerLatLng] = useState(null);
  const [searchLatLng, setSearchLatLng] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [employerAddress, setEmployerAddress] = useState('Not available');
  const [mapReady, setMapReady] = useState(false);
  const [markersReady, setMarkersReady] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCommuteModal, setShowCommuteModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [routeDirections, setRouteDirections] = useState(null);
  const [travelTimes, setTravelTimes] = useState({});
  const [modalMapReady, setModalMapReady] = useState(false);
  const [commuteMapReady, setCommuteMapReady] = useState(false);
  const [transportationStats, setTransportationStats] = useState({});
  const [selectedModalMarker, setSelectedModalMarker] = useState(null);
  const [spaceImages, setSpaceImages] = useState({
    general_images: [],
    packages: [],
    total_images: 0
  });
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imageCarouselOpen, setImageCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);

  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    radius_km: 10,
  });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  // Calculate route for commute modal with multiple travel modes
  const calculateRoute = async (space) => {
    return; // Disabled due to API restrictions
  };

  useEffect(() => {
    const fetchAndSearch = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Try to get employer profile, but don't fail if it doesn't work
        let profile = null;
        try {
          const profileResponse = await employerApi.get('/employer/me');
          profile = profileResponse.data;
        } catch (profileErr) {
          console.log('Profile not available, using default location');
        }

        // Use default Pakistan/Lahore location if profile is not available
        const defaultLocation = { lat: 31.5204, lng: 74.3587 }; // Lahore coordinates
        let searchLocation = defaultLocation;
        let fullAddress = 'Lahore, Pakistan';

        if (profile) {
          console.log('Employer profile data:', profile);
          
          // Check if employer has latitude and longitude in profile
          if (profile.latitude && profile.longitude) {
            searchLocation = { 
              lat: parseFloat(profile.latitude), 
              lng: parseFloat(profile.longitude) 
            };
            console.log('Using employer lat/lng from profile:', searchLocation);
          }

          // Build address from profile data
          if (profile.address && profile.city) {
            fullAddress = `${profile.address}, ${profile.city}`;
            if (profile.state) fullAddress += `, ${profile.state}`;
            if (profile.zip_code) fullAddress += ` ${profile.zip_code}`;
            fullAddress += `, ${profile.country || 'Pakistan'}`;
          } else if (profile.city) {
            fullAddress = `${profile.city}, ${profile.country || 'Pakistan'}`;
          } else {
            fullAddress = `${profile.country || 'Pakistan'}`;
          }
          
          setEmployerAddress(fullAddress);
          console.log('Built employer address:', fullAddress);

          // If no lat/lng in profile, try to geocode the address
          if (!profile.latitude || !profile.longitude) {
            console.log('No lat/lng in profile, attempting geocoding for:', fullAddress);
            
            if (window.google && window.google.maps) {
              const geocoder = new window.google.maps.Geocoder();
              
              try {
                const geocodeResult = await new Promise((resolve, reject) => {
                  geocoder.geocode({ address: fullAddress }, (results, status) => {
                    console.log('Geocoding status:', status, 'Results:', results);
                    if (status === 'OK' && results[0]) {
                      resolve(results[0]);
                    } else {
                      reject(new Error(`Geocoding failed with status: ${status}`));
                    }
                  });
                });
                
                const location = geocodeResult.geometry.location;
                searchLocation = { lat: location.lat(), lng: location.lng() };
                console.log('Geocoded location:', searchLocation);
              } catch (geocodeErr) {
                console.log('Geocoding failed:', geocodeErr.message);
                console.log('Using default Lahore location');
              }
            } else {
              console.log('Google Maps not available for geocoding');
            }
          }
        } else {
          console.log('No employer profile found, using default location');
          setEmployerAddress('Default location: Lahore, Pakistan');
        }

        setEmployerLatLng(searchLocation);
        setSearchLatLng(searchLocation);

        // Search for coworking spaces using lat/lng within 10km radius
        try {
          // Ensure we have valid coordinates
          if (!searchLocation.lat || !searchLocation.lng) {
            console.error('Invalid coordinates for search:', searchLocation);
            setSpaces([]);
            setLoading(false);
            return;
          }

          const searchData = {
            latitude: searchLocation.lat,
            longitude: searchLocation.lng,
            radius_km: 10, // Fixed 10km radius as requested
            address: profile?.address || 'Main Street',
            city: profile?.city || 'Lahore',
            state: profile?.state || 'Punjab',
            zip_code: profile?.zip_code || '',
            country: profile?.country || 'Pakistan'
          };

          console.log('Searching coworking spaces with data:', searchData);
          const spacesResponse = await employerApi.post('/employer/employer-profile-coworking-spaces', searchData);
          
          if (spacesResponse.data && Array.isArray(spacesResponse.data)) {
            setSpaces(spacesResponse.data);
            console.log('Found coworking spaces:', spacesResponse.data.length);
            
            // Log first space for debugging
            if (spacesResponse.data.length > 0) {
              console.log('First coworking space:', spacesResponse.data[0]);
            }
          } else {
            console.log('No coworking spaces returned or invalid format');
            setSpaces([]);
          }
        } catch (err) {
          console.error('Error fetching coworking spaces:', err);
          console.error('Error details:', err.response?.data);
          setSpaces([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in fetchAndSearch:', err);
        setError('Unable to load coworking spaces. Please try again.');
        setLoading(false);
      }
    };

    // Only run if Google Maps is loaded
    if (isLoaded) {
      fetchAndSearch();
      fetchEmployees();
    }
  }, [isLoaded]);

  const fetchEmployees = async () => {
    try {
      const response = await employerApi.get('/employer/employees');
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchSpaceImages = async (spaceId) => {
    setImagesLoading(true);
    try {
      const response = await employerApi.get(`/employer/coworking-space/${spaceId}/images`);
      console.log('Space images response:', response.data);
      setSpaceImages(response.data);
    } catch (err) {
      console.error('Error fetching space images:', err);
      setSpaceImages({ general_images: [], packages: [], total_images: 0 });
    } finally {
      setImagesLoading(false);
    }
  };

  const openImageCarousel = (images, startIndex = 0) => {
    setCarouselImages(images);
    setCarouselStartIndex(startIndex);
    setImageCarouselOpen(true);
  };

  // Get primary color based on package pricing
  const getPackagePrimaryColor = (packages) => {
    if (!packages || packages.length === 0) return '#8B2635'; // Default burgundy
    
    const pkg = packages[0]; // Use first package for color determination
    
    // Priority: hourly > daily > weekly > monthly
    if (pkg.price_per_hour > 0) return '#f59e0b'; // Yellow/Orange for hourly
    if (pkg.price_per_day > 0) return '#10b981'; // Green for daily  
    if (pkg.price_per_week > 0) return '#7c3aed'; // Purple for weekly
    if (pkg.price_per_month > 0) return '#dc2626'; // Red for monthly
    
    return '#8B2635'; // Default burgundy
  };

  // Calculate transportation stats using Google Maps Distance Matrix API
  const calculateTransportationStats = async (origin, destination) => {
    console.log('Calculating transportation stats for:', { origin, destination });
    
    if (!window.google) {
      console.log('Google Maps not loaded');
      return;
    }
    
    if (!origin || !destination) {
      console.log('Missing origin or destination');
      return;
    }

    // Reset stats to show loading state
    setTransportationStats({});

    const service = new window.google.maps.DistanceMatrixService();
    const travelModes = [
      { mode: 'WALKING', key: 'walk' },
      { mode: 'BICYCLING', key: 'cycle' },
      { mode: 'DRIVING', key: 'car' },
      { mode: 'TRANSIT', key: 'bus' }
    ];

    const stats = {};
    const distance = selectedSpace?.distance_km || 0;

    try {
      // Use fallback calculations immediately for better UX
      travelModes.forEach(({ key }) => {
        let estimatedTime = '';
        
        switch (key) {
          case 'walk':
            estimatedTime = `${Math.round(distance * 12)} min`; // ~5 km/h
            break;
          case 'cycle':
            estimatedTime = `${Math.round(distance * 4)} min`; // ~15 km/h
            break;
          case 'car':
            estimatedTime = `${Math.round(distance * 2)} min`; // ~30 km/h in city
            break;
          case 'bus':
            estimatedTime = `${Math.round(distance * 3)} min`; // ~20 km/h with stops
            break;
        }
        
        stats[key] = {
          distance: `${distance.toFixed(1)} km`,
          duration: estimatedTime,
          distanceValue: distance * 1000,
          durationValue: parseInt(estimatedTime) * 60
        };
      });

      // Set fallback stats immediately
      setTransportationStats(stats);
      console.log('Set fallback transportation stats:', stats);

      // Try to get more accurate data from Google Maps API
      for (const { mode, key } of travelModes) {
        try {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.log(`Timeout for ${key} mode`);
              resolve(); // Don't reject, just resolve to continue
            }, 5000); // 5 second timeout

            service.getDistanceMatrix({
              origins: [origin],
              destinations: [destination],
              travelMode: window.google.maps.TravelMode[mode],
              unitSystem: window.google.maps.UnitSystem.METRIC,
              avoidHighways: false,
              avoidTolls: false
            }, (response, status) => {
              clearTimeout(timeout);
              
              console.log(`${key} API response:`, { status, response });
              
              if (status === 'OK' && response.rows[0]?.elements[0]?.status === 'OK') {
                const element = response.rows[0].elements[0];
                stats[key] = {
                  distance: element.distance.text,
                  duration: element.duration.text,
                  distanceValue: element.distance.value,
                  durationValue: element.duration.value
                };
                console.log(`Updated ${key} with API data:`, stats[key]);
                // Update stats immediately for this mode
                setTransportationStats(prevStats => ({
                  ...prevStats,
                  [key]: stats[key]
                }));
              }
              resolve();
            });
          });
        } catch (error) {
          console.error(`Error calculating ${key} stats:`, error);
        }
      }
      
    } catch (error) {
      console.error('Error calculating transportation stats:', error);
    }
  };

  useEffect(() => {
    if (employerLatLng && mapRef.current && isLoaded) {
      window.employerLatLng = employerLatLng;
      window.mapRef = mapRef;
      window.isLoaded = isLoaded;
    }
  }, [employerLatLng, isLoaded]);

  useEffect(() => {
    if (mapRef.current && isLoaded && (employerLatLng || searchLatLng) && spaces.length >= 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasPoints = false;

      if (searchLatLng) {
        bounds.extend(searchLatLng);
        hasPoints = true;
      } else if (employerLatLng) {
        bounds.extend(employerLatLng);
        hasPoints = true;
      }

      spaces.forEach((s) => {
        bounds.extend({ lat: s.latitude, lng: s.longitude });
        hasPoints = true;
      });

      if (hasPoints) {
        mapRef.current.fitBounds(bounds, 100);
      }
    }
  }, [employerLatLng, searchLatLng, spaces, isLoaded]);

  useEffect(() => {
    if (mapReady && mapRef.current) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setZoom(mapRef.current.getZoom());
        }
      }, 100);
    }
  }, [mapReady, employerLatLng, spaces]);

  useEffect(() => {
    if (showCommuteModal && isLoaded) {
      const timer = setTimeout(() => {
        setModalMapReady(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setModalMapReady(false);
    }
  }, [showCommuteModal, isLoaded]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!form.address || !form.city || !form.state) {
        setError('Please fill in at least Address, City, and State fields.');
        setSearchLoading(false);
        return;
      }

      // First geocode the address to get coordinates
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const searchAddress = `${form.address}, ${form.city}, ${form.state} ${form.zip_code || ''}, ${form.country || 'Pakistan'}`.trim();
        
        geocoder.geocode({ address: searchAddress }, async (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const searchLocation = {
              lat: location.lat(),
              lng: location.lng()
            };
            
            // Use the working employer endpoint with geocoded coordinates
            const searchData = {
              latitude: searchLocation.lat,
              longitude: searchLocation.lng,
              radius_km: parseFloat(form.radius_km) || 10,
              address: form.address.trim(),
              city: form.city.trim(),
              state: form.state.trim(),
              zip_code: form.zip_code ? form.zip_code.trim() : '',
              country: form.country ? form.country.trim() : 'Pakistan'
            };

            console.log('Searching coworking spaces with data:', searchData);
            console.log('Making API call to: /employer/employer-profile-coworking-spaces');
            
            try {
              const response = await employerApi.post('/employer/employer-profile-coworking-spaces', searchData);
              
              console.log('API Response:', response);
              console.log('Response status:', response.status);
              console.log('Response data:', response.data);
              console.log('Found coworking spaces:', response.data?.length || 0);
              
              setSpaces(response.data || []);
              
              // Update map location
              setSearchLatLng(searchLocation);
              setEmployerAddress(results[0].formatted_address);
              
              console.log('Search geocoded to:', searchLocation);
              console.log('Search address:', results[0].formatted_address);
              
              if (response.data && response.data.length > 0) {
                console.log('First space:', response.data[0]);
              } else {
                console.log('No spaces found in response');
              }
              
            } catch (apiError) {
              console.error('API Error:', apiError);
              setError('Failed to search coworking spaces. Please try again.');
            }
            
          } else {
            console.error('Geocoding failed:', status);
            setError('Failed to find the specified address. Please try a different address.');
          }
          setSearchLoading(false);
        });
      } else {
        setError('Google Maps not available. Please refresh the page.');
        setSearchLoading(false);
      }
      setSearchLoading(false);
    } catch (error) {
      console.error('Error searching coworking spaces:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response.data);
        setError(`Server error: ${error.response.status} - ${error.response.data?.detail || error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        setError('Failed to search coworking spaces. Please try again.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleMarkerClick = (space) => {
    setSelectedSpace(space);
    setCommuteMapReady(false); // Reset commute map ready state
    
    // Calculate simple stats immediately based on distance
    const distance = space.distance_km || 0;
    const simpleStats = {
      walk: {
        distance: `${distance.toFixed(1)} km`,
        duration: `${Math.round(distance * 12)} min`
      },
      cycle: {
        distance: `${distance.toFixed(1)} km`, 
        duration: `${Math.round(distance * 4)} min`
      },
      car: {
        distance: `${distance.toFixed(1)} km`,
        duration: `${Math.round(distance * 2)} min`
      },
      bus: {
        distance: `${distance.toFixed(1)} km`,
        duration: `${Math.round(distance * 3)} min`
      }
    };
    setTransportationStats(simpleStats);
    setShowCommuteModal(true);
  };

  if (loadError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading Google Maps. Please check your internet connection and try again.
        </Alert>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Google Maps...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#1f2937' }}>
        Find Coworking Spaces
      </Typography>
      
      {/* Employer Address Display */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon sx={{ color: '#8B2635', fontSize: '1.2rem' }} />
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#374151' }}>
            Your Address:
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            {employerAddress || 'Loading address...'}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#9ca3af', ml: 3 }}>
          This is your reference point for finding nearby coworking spaces
        </Typography>
      </Box>

      {/* Search Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Search Location</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  value={form.address}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  name="city"
                  label="City"
                  value={form.city}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  name="state"
                  label="State"
                  value={form.state}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  name="zip_code"
                  label="ZIP Code"
                  value={form.zip_code}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Radius (km)</InputLabel>
                  <Select
                    name="radius_km"
                    value={form.radius_km}
                    onChange={handleInputChange}
                    label="Radius (km)"
                  >
                    <MenuItem value={5}>5 km</MenuItem>
                    <MenuItem value={10}>10 km</MenuItem>
                    <MenuItem value={25}>25 km</MenuItem>
                    <MenuItem value={50}>50 km</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={searchLoading}
                  sx={{ 
                    height: '56px',
                    backgroundColor: '#8B2635',
                    '&:hover': { backgroundColor: '#7a1f2b' }
                  }}
                >
                  {searchLoading ? <CircularProgress size={24} /> : <SearchIcon />}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Coworking Spaces Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon sx={{ color: '#dc2626', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Found {spaces.length} Coworking Spaces within 10 km
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading coworking spaces...</Typography>
            </Box>
          ) : spaces.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', p: 4, color: '#6b7280' }}>
              No coworking spaces found in this area.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Workspace</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Distance</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>View Package</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Direction</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {spaces.map((space) => (
                    <TableRow 
                      key={space.id}
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9fafb' },
                        cursor: 'pointer'
                      }}
                      onClick={() => handleMarkerClick(space)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              backgroundColor: '#8B2635', 
                              width: 40, 
                              height: 40,
                              fontSize: '1rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {space.title?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {space.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {space.city || 'Lahore'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {space.full_address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ color: '#8B2635', fontSize: '1rem' }} />
                          <Typography variant="body2" sx={{ color: '#8B2635', fontWeight: 'bold' }}>
                            {space.distance_km?.toFixed(1)} km
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: '#8B2635', 
                            color: '#8B2635',
                            '&:hover': { backgroundColor: '#8B2635', color: 'white' }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpace(space);
                            setShowPlansModal(true);
                            fetchSpaceImages(space.id);
                          }}
                        >
                          View Plans
                        </Button>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          sx={{ color: '#8B2635' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpace(space);
                            setShowCommuteModal(true);
                          }}
                        >
                          <DirectionsIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ 
                            backgroundColor: '#8B2635',
                            '&:hover': { backgroundColor: '#7a1f2b' }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/employer/coworking/checkout', {
                              state: {
                                coworkingSpace: space,
                                employeeId: null
                              }
                            });
                          }}
                        >
                          Book Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Map Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MapIcon sx={{ color: '#dc2626', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Coworking Spaces Near Pakistan
            </Typography>
          </Box>
          
          {!isLoaded ? (
            <Box sx={{ 
              height: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: 1
            }}>
              <Typography sx={{ color: '#6b7280' }}>Loading map...</Typography>
            </Box>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={searchLatLng || employerLatLng || { lat: 31.5204, lng: 74.3587 }} // Lahore coordinates
              zoom={12}
              onLoad={(map) => {
                mapRef.current = map;
                setMapReady(true);
              }}
            >
              {/* Employer Address Marker - Blue */}
              {(searchLatLng || employerLatLng) && (
                <Marker
                  position={searchLatLng || employerLatLng}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30 5C20.075 5 12 13.075 12 23c0 15.75 18 32 18 32s18-16.25 18-32c0-9.925-8.075-18-18-18z" 
                              fill="#2563eb" stroke="white" stroke-width="3"/>
                        <circle cx="30" cy="23" r="8" fill="white"/>
                        <circle cx="30" cy="23" r="4" fill="#2563eb"/>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(60, 60),
                    anchor: new window.google.maps.Point(30, 60),
                  }}
                  title="Your Office Location"
                  onClick={() => {
                    setSelectedMarker({
                      title: 'Your Office Location',
                      address: employerAddress || 'Office Location',
                      position: searchLatLng || employerLatLng
                    });
                  }}
                />
              )}

              {/* Coworking Space Markers - Burgundy */}
              {spaces.map((space) => (
                <Marker
                  key={space.id}
                  position={{ lat: space.latitude, lng: space.longitude }}
                  onClick={() => handleMarkerClick(space)}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30 5C20.075 5 12 13.075 12 23c0 15.75 18 32 18 32s18-16.25 18-32c0-9.925-8.075-18-18-18z" 
                              fill="#8B2635" stroke="white" stroke-width="3"/>
                        <rect x="21" y="17" width="18" height="12" fill="white" rx="2"/>
                        <rect x="24" y="20" width="3" height="6" fill="#8B2635"/>
                        <rect x="28.5" y="20" width="3" height="6" fill="#8B2635"/>
                        <rect x="33" y="20" width="3" height="6" fill="#8B2635"/>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(60, 60),
                    anchor: new window.google.maps.Point(30, 60),
                  }}
                  title={space.title}
                />
              ))}

              {/* Info Window */}
              {selectedMarker && (
                <InfoWindow
                  position={selectedMarker.position || { lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
                  onCloseClick={() => setSelectedMarker(null)}
                  options={{
                    disableAutoPan: false,
                    pixelOffset: new window.google.maps.Size(0, -10),
                    maxWidth: 300,
                    closeBoxURL: ""
                  }}
                >
                  <div style={{ padding: '8px', maxWidth: '300px', minWidth: '200px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                      {selectedMarker.title}
                    </div>
                    <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                      {selectedMarker.address || selectedMarker.full_address || 'Address not available'}
                    </div>
                    {selectedMarker.distance_km && (
                      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
                        Distance: {selectedMarker.distance_km?.toFixed(1)} km
                      </div>
                    )}
                    {/* Only show action buttons for coworking spaces, not office markers */}
                    {selectedMarker.id && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        <button
                          style={{
                            backgroundColor: '#8B2635',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedSpace(selectedMarker);
                            setShowPlansModal(true);
                            fetchSpaceImages(selectedMarker.id);
                          }}
                        >
                          View Plans
                        </button>
                        <button
                          style={{
                            backgroundColor: 'white',
                            color: '#8B2635',
                            border: '1px solid #8B2635',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedSpace(selectedMarker);
                            setCommuteMapReady(false); // Reset commute map ready state
                            
                            // Calculate simple stats immediately based on distance
                            const distance = selectedMarker.distance_km || 0;
                            const simpleStats = {
                              walk: {
                                distance: `${distance.toFixed(1)} km`,
                                duration: `${Math.round(distance * 12)} min`
                              },
                              cycle: {
                                distance: `${distance.toFixed(1)} km`, 
                                duration: `${Math.round(distance * 4)} min`
                              },
                              car: {
                                distance: `${distance.toFixed(1)} km`,
                                duration: `${Math.round(distance * 2)} min`
                              },
                              bus: {
                                distance: `${distance.toFixed(1)} km`,
                                duration: `${Math.round(distance * 3)} min`
                              }
                            };
                            console.log('Setting transportation stats:', simpleStats);
                            setTransportationStats(simpleStats);
                            setShowCommuteModal(true);
                          }}
                        >
                          Commute
                        </button>
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )}

              {/* Directions Renderer */}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          )}
        </CardContent>
      </Card>

      {/* Plans Modal */}
      <Dialog
        open={showPlansModal}
        onClose={() => setShowPlansModal(false)}
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
            <BusinessIcon />
            {selectedSpace?.title} - Available Plans
          </Box>
          <IconButton
            onClick={() => setShowPlansModal(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
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
                  <LocationIcon sx={{ fontSize: '1.2rem', color: '#be7c7c' }} />
                  {selectedSpace.full_address}
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
                  backgroundColor: '#be7c7c',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BusinessIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
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
                    // Handle both string and array formats
                    if (typeof selectedSpace.packages === 'string') {
                      packages = JSON.parse(selectedSpace.packages);
                    } else if (Array.isArray(selectedSpace.packages)) {
                      packages = selectedSpace.packages;
                    }
                    
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
                                    backgroundColor: '#be7c7c', 
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

                            {/* Pricing Grid */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              {pkg.price_per_hour > 0 && (
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
                              )}
                              
                              {pkg.price_per_day > 0 && (
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
                              )}
                              
                              {pkg.price_per_week > 0 && (
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
                              )}
                              
                              {pkg.price_per_month > 0 && (
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
                              )}
                            </Grid>

                            {/* Package Images */}
                            {(() => {
                              // Find images for this specific package
                              const packageImages = spaceImages?.packages?.find(p => p.package_id === pkg.id?.toString())?.images || [];
                              console.log(`Package ${pkg.name} (ID: ${pkg.id}) images:`, packageImages);
                              
                              if (packageImages.length === 0) return null;
                              
                              return (
                                <Box sx={{ mt: 4 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <Box sx={{
                                      backgroundColor: '#f9f5f5',
                                      borderRadius: '50%',
                                      p: 0.8,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <PhotoLibraryIcon sx={{ color: '#be7c7c', fontSize: '1.2rem' }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                      Package Images ({packageImages.length})
                                    </Typography>
                                  </Box>
                                  <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                    gap: 2,
                                    mb: 3
                                  }}>
                                    {packageImages.map((image, imgIndex) => (
                                      <Box
                                        key={imgIndex}
                                        sx={{
                                          width: '100%',
                                          height: 80,
                                          borderRadius: 2,
                                          overflow: 'hidden',
                                          cursor: 'pointer',
                                          border: '1px solid #e2e8f0',
                                          position: 'relative',
                                          '&:hover': { 
                                            transform: 'scale(1.02)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                          },
                                          transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => openImageCarousel(packageImages, imgIndex)}
                                      >
                                        <img
                                          src={(() => {
                                            // Debug: Log what we're receiving
                                            console.log('🖼️ Frontend received image data:', image);
                                            console.log('📋 Available fields:', Object.keys(image));
                                            console.log('🎯 thumbnail_medium_url:', image.thumbnail_medium_url);
                                            console.log('🎯 thumbnail_url:', image.thumbnail_url);
                                            console.log('🎯 url:', image.url);
                                            
                                            // Use thumbnail URLs for better performance
                                            const thumbnailUrl = image.thumbnail_medium_url || image.thumbnail_url || image.url;
                                            console.log('✅ Final URL being used:', thumbnailUrl);
                                            return thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8001${thumbnailUrl}`;
                                          })()}
                                          alt={`${pkg.name} - Image ${imgIndex + 1}`}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                          onError={(e) => {
                                            console.error('Image failed to load:', image.url);
                                            e.target.style.display = 'none';
                                          }}
                                        />

                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              );
                            })()}

                            {/* Amenities */}
                            {pkg.amenities && (
                              <Box sx={{ mt: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                  <Box sx={{
                                    backgroundColor: '#f9f5f5',
                                    borderRadius: '50%',
                                    p: 0.6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <CheckIcon sx={{ color: '#be7c7c', fontSize: '1rem' }} />
                                  </Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                    Amenities
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {(() => {
                                    let amenitiesList = [];
                                    try {
                                      // Handle both string and array formats, and remove brackets
                                      if (typeof pkg.amenities === 'string') {
                                        // Remove brackets and quotes, then split
                                        const cleanAmenities = pkg.amenities
                                          .replace(/[\[\]"]/g, '')
                                          .split(',')
                                          .map(a => a.trim())
                                          .filter(a => a.length > 0);
                                        amenitiesList = cleanAmenities;
                                      } else if (Array.isArray(pkg.amenities)) {
                                        amenitiesList = pkg.amenities;
                                      }
                                    } catch (e) {
                                      console.error('Error parsing amenities:', e);
                                      amenitiesList = [];
                                    }
                                    
                                    return amenitiesList.map((amenity, i) => (
                                      <Chip
                                        key={i}
                                        label={amenity.trim()}
                                        size="small"
                                        sx={{ 
                                          backgroundColor: '#f9f5f5', 
                                          color: '#be7c7c',
                                          fontWeight: 500,
                                          border: '1px solid #e8d5d5'
                                        }}
                                      />
                                    ));
                                  })()}
                                </Box>
                              </Box>
                            )}
                            
                            {/* Package Booking Buttons */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                              <Button
                                variant="contained"
                                fullWidth
                                sx={{ 
                                  backgroundColor: '#8B2635', 
                                  '&:hover': { backgroundColor: '#7a1f2b' },
                                  py: 1.5,
                                  fontSize: '1.1rem',
                                  fontWeight: 600
                                }}
                                onClick={() => {
                                  navigate('/employer/coworking/checkout', {
                                    state: {
                                      coworkingSpace: selectedSpace,
                                      selectedPackage: pkg,
                                      employeeId: null // Will be selected in checkout
                                    }
                                  });
                                  setShowPlansModal(false);
                                }}
                              >
                                Book Now
                              </Button>
                            </Box>
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

      {/* Employee Selection Modal */}
      <Dialog
        open={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#8B2635', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Group />
          Select Employee for Booking
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedSpace && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#1f2937' }}>
                Booking for: {selectedSpace.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {selectedSpace.full_address}
              </Typography>
            </Box>
          )}
          
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Select an employee to book this workspace for:
          </Typography>
          
          <Grid container spacing={2}>
            {employees.map((employee) => (
              <Grid item xs={12} sm={6} key={employee.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(139, 38, 53, 0.1)',
                      borderColor: '#8B2635'
                    },
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    navigate('/employer/coworking/checkout', {
                      state: {
                        coworkingSpace: selectedSpace,
                        employeeId: employee.id
                      }
                    });
                    setShowEmployeeModal(false);
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ backgroundColor: '#8B2635', width: 40, height: 40 }}>
                        {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {employee.first_name} {employee.last_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {employee.email}
                        </Typography>
                        {employee.role_title && (
                          <Typography variant="caption" sx={{ color: '#8B2635' }}>
                            {employee.role_title}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {employees.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No employees found. You can add employees from the Employees page.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setShowEmployeeModal(false)}
            sx={{ color: '#6b7280' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Commute Modal */}
      <Dialog
        open={showCommuteModal}
        onClose={() => setShowCommuteModal(false)}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '80vh' } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#8B2635', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DirectionsIcon />
            Commute Information
          </Box>
          <IconButton
            onClick={() => setShowCommuteModal(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {selectedSpace && (
            <Box sx={{ display: 'flex', height: '100%' }}>
              {/* Left Sidebar - 25% */}
              <Box sx={{ 
                width: '25%', 
                backgroundColor: '#f8fafc',
                borderRight: '1px solid #e2e8f0',
                p: 3,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Address Information */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1e293b', fontWeight: 600 }}>
                    Route Details
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#be7c7c', fontWeight: 600, mb: 1 }}>
                      FROM
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {employerAddress || 'Your Office Location'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#be7c7c', fontWeight: 600, mb: 1 }}>
                      TO
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {selectedSpace.full_address}
                    </Typography>
                  </Box>
                  
                  {/* Distance Card */}
                  <Box sx={{
                    p: 2,
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="body1" sx={{ color: '#be7c7c', fontWeight: 600 }}>
                      Distance: {selectedSpace ? `${selectedSpace.distance_km?.toFixed(1)} km` : 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Transportation Stats */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1e293b', fontWeight: 600 }}>
                    Transportation
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: '#be7c7c',
                        color: '#be7c7c',
                        '&:hover': { backgroundColor: '#f9f5f5' },
                        justifyContent: 'flex-start',
                        p: 1.5,
                        fontSize: '0.75rem',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        height: 'auto',
                        minHeight: '60px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <DirectionsWalkIcon sx={{ fontSize: '1rem' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Walk</Typography>
                      </Box>
                      <Box sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                        <div>{selectedSpace ? `${Math.round((selectedSpace.distance_km || 0) * 12)} min` : 'N/A'}</div>
                      </Box>
                    </Button>
                    
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: '#be7c7c',
                        color: '#be7c7c',
                        '&:hover': { backgroundColor: '#f9f5f5' },
                        justifyContent: 'flex-start',
                        p: 1.5,
                        fontSize: '0.75rem',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        height: 'auto',
                        minHeight: '60px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <DirectionsBikeIcon sx={{ fontSize: '1rem' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Cycle</Typography>
                      </Box>
                      <Box sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                        <div>{selectedSpace ? `${Math.round((selectedSpace.distance_km || 0) * 4)} min` : 'N/A'}</div>
                      </Box>
                    </Button>
                    
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: '#be7c7c',
                        color: '#be7c7c',
                        '&:hover': { backgroundColor: '#f9f5f5' },
                        justifyContent: 'flex-start',
                        p: 1.5,
                        fontSize: '0.75rem',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        height: 'auto',
                        minHeight: '60px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <DirectionsCarIcon sx={{ fontSize: '1rem' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Car</Typography>
                      </Box>
                      <Box sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                        <div>{selectedSpace ? `${Math.round((selectedSpace.distance_km || 0) * 2)} min` : 'N/A'}</div>
                      </Box>
                    </Button>
                    
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: '#be7c7c',
                        color: '#be7c7c',
                        '&:hover': { backgroundColor: '#f9f5f5' },
                        justifyContent: 'flex-start',
                        p: 1.5,
                        fontSize: '0.75rem',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        height: 'auto',
                        minHeight: '60px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <DirectionsBusIcon sx={{ fontSize: '1rem' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Bus</Typography>
                      </Box>
                      <Box sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                        <div>{selectedSpace ? `${Math.round((selectedSpace.distance_km || 0) * 3)} min` : 'N/A'}</div>
                      </Box>
                    </Button>
                  </Box>
                  
                  {/* Action Buttons */}
                  <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<DirectionsIcon />}
                      onClick={() => {
                        const origin = encodeURIComponent(employerAddress || 'Your Office Location');
                        const destination = encodeURIComponent(selectedSpace.full_address);
                        const googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      sx={{
                        backgroundColor: '#8B2635',
                        '&:hover': { backgroundColor: '#7a1f2b' },
                        fontSize: '0.875rem'
                      }}
                    >
                      Directions
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<BusinessIcon />}
                      onClick={() => {
                        setShowCommuteModal(false);
                        setShowPlansModal(true);
                        fetchSpaceImages(selectedSpace.id);
                      }}
                      sx={{
                        borderColor: '#be7c7c',
                        color: '#be7c7c',
                        '&:hover': { backgroundColor: '#f9f5f5' },
                        fontSize: '0.875rem',
                        mb: '5px'
                      }}
                    >
                      View Plans
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Right Side - Map 75% */}
              <Box sx={{ width: '75%', position: 'relative' }}>
                {isLoaded && (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={
                      (employerLatLng || searchLatLng) && selectedSpace
                        ? {
                            lat: ((employerLatLng || searchLatLng).lat + selectedSpace.latitude) / 2,
                            lng: ((employerLatLng || searchLatLng).lng + selectedSpace.longitude) / 2
                          }
                        : { lat: 31.5204, lng: 74.3587 }
                    }
                    zoom={14}
                    onLoad={(map) => {
                      console.log('Commute map loaded');
                      
                      // Wait for map to be fully loaded before showing markers
                      setTimeout(() => {
                        console.log('Setting commuteMapReady to true');
                        setCommuteMapReady(true);
                        
                        // Focus map on both locations after markers are loaded
                        if ((employerLatLng || searchLatLng) && selectedSpace) {
                          const bounds = new window.google.maps.LatLngBounds();
                          bounds.extend(employerLatLng || searchLatLng);
                          bounds.extend({ lat: selectedSpace.latitude, lng: selectedSpace.longitude });
                          map.fitBounds(bounds);
                          
                          // Add some padding to the bounds
                          setTimeout(() => {
                            const currentZoom = map.getZoom();
                            if (currentZoom > 15) {
                              map.setZoom(15); // Don't zoom in too much
                            }
                          }, 100);
                        }
                      }, 1000); // Wait 1 second for map to fully load
                    }}
                  >
                    {/* Employer Address Marker - Blue */}
                    {commuteMapReady && (searchLatLng || employerLatLng) && (
                      <Marker
                        position={searchLatLng || employerLatLng}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                              <path d="M30 5C20.075 5 12 13.075 12 23c0 15.75 18 32 18 32s18-16.25 18-32c0-9.925-8.075-18-18-18z" 
                                    fill="#2563eb" stroke="white" stroke-width="3"/>
                              <circle cx="30" cy="23" r="8" fill="white"/>
                              <circle cx="30" cy="23" r="4" fill="#2563eb"/>
                            </svg>
                          `),
                          scaledSize: new window.google.maps.Size(60, 60),
                          anchor: new window.google.maps.Point(30, 60),
                        }}
                        title="Your Office Location"
                        onClick={() => {
                          setSelectedMarker({
                            title: 'Your Office Location',
                            address: employerAddress || 'Office Location',
                            position: searchLatLng || employerLatLng
                          });
                        }}
                      />
                    )}

                    {/* Coworking Space Marker - Burgundy */}
                    {commuteMapReady && selectedSpace && (
                      <Marker
                        position={{ lat: selectedSpace.latitude, lng: selectedSpace.longitude }}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                              <path d="M30 5C20.075 5 12 13.075 12 23c0 15.75 18 32 18 32s18-16.25 18-32c0-9.925-8.075-18-18-18z" 
                                    fill="#8B2635" stroke="white" stroke-width="3"/>
                              <rect x="21" y="17" width="18" height="12" fill="white" rx="2"/>
                              <rect x="24" y="20" width="3" height="6" fill="#8B2635"/>
                              <rect x="28.5" y="20" width="3" height="6" fill="#8B2635"/>
                              <rect x="33" y="20" width="3" height="6" fill="#8B2635"/>
                            </svg>
                          `),
                          scaledSize: new window.google.maps.Size(60, 60),
                          anchor: new window.google.maps.Point(30, 60),
                        }}
                        title={selectedSpace.title}
                      />
                    )}
                  </GoogleMap>
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
            <CloseIcon />
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
                    const image = carouselImages[carouselStartIndex % carouselImages.length];
                    if (!image) return '';
                    // Use original high-quality image for main carousel display
                    const originalUrl = image.image_url || image.url;
                    return originalUrl.startsWith('http') ? originalUrl : `http://localhost:8001${originalUrl}`;
                  })()}
                  alt={`Image ${carouselStartIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '60vh',
                    objectFit: 'contain',
                    backgroundColor: 'black'
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
                        backgroundColor: 'rgba(190, 124, 124, 0.8)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(190, 124, 124, 1)' }
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                    <IconButton
                      onClick={() => setCarouselStartIndex((carouselStartIndex + 1) % carouselImages.length)}
                      sx={{
                        position: 'absolute',
                        right: 16,
                        backgroundColor: 'rgba(190, 124, 124, 0.8)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(190, 124, 124, 1)' }
                      }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </>
                )}
              </Box>
              
              {/* Thumbnail Navigation */}
              {carouselImages.length > 1 && (
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {carouselImages.map((image, index) => (
                    <Box
                      key={index}
                      onClick={() => setCarouselStartIndex(index)}
                      sx={{
                        width: 60,
                        height: 40,
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: index === carouselStartIndex ? '2px solid #be7c7c' : '1px solid #666',
                        opacity: index === carouselStartIndex ? 1 : 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <img
                        src={(() => {
                          // Use small thumbnail for navigation, fallback to medium, then original
                          const thumbnailUrl = image.thumbnail_small_url || image.thumbnail_medium_url || image.url;
                          return thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8001${thumbnailUrl}`;
                        })()}
                        alt={`Thumbnail ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
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
