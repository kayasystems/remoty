import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Card, CardContent, 
  FormControl, InputLabel, Select, MenuItem, Chip, Switch, 
  FormControlLabel, InputAdornment, Divider, IconButton,
  Paper, Stepper, Step, StepLabel, Alert, LinearProgress
} from '@mui/material';
import { ArrowBack, MoreVert, Business, CloudUpload, Delete, Add, AccessTime, CheckCircle } from '@mui/icons-material';
import { useJsApiLoader } from '@react-google-maps/api';
// Layout components removed - now using universal CoworkingLayout
import { coworkingApi } from '../../../services/coworking';

const steps = ['Coworking Information', 'Price & Packages', 'Images Uploading', 'Operational Hours', 'Review'];

const amenitiesList = [
  'High-speed WiFi', '24/7 Access', 'Premium Coffee', 'Meeting Rooms', 'Parking',
  'Reception Services', 'Printing & Scanning', 'Kitchen Facilities', 'Lockers',
  'Phone Booths', 'Event Space', 'Networking Events', 'Mail Handling',
  'Security System', 'Air Conditioning', 'Natural Light', 'Ergonomic Furniture',
  'Whiteboard Access', 'Projector Access', 'High-speed Internet', 'Cleaning Services',
  'Bike Storage', 'Shower Facilities', 'Relaxation Area', 'Game Room',
  'Outdoor Terrace', 'Pet Friendly', 'Childcare Services', 'Gym Access',
  'Library/Quiet Zone', 'Community Manager'
];

// Country to timezone mapping
const countryTimezones = {
  'United States': 'America/New_York',
  'Canada': 'America/Toronto',
  'United Kingdom': 'Europe/London',
  'Germany': 'Europe/Berlin',
  'France': 'Europe/Paris',
  'Spain': 'Europe/Madrid',
  'Italy': 'Europe/Rome',
  'Netherlands': 'Europe/Amsterdam',
  'Australia': 'Australia/Sydney',
  'Japan': 'Asia/Tokyo',
  'China': 'Asia/Shanghai',
  'India': 'Asia/Kolkata',
  'Pakistan': 'Asia/Karachi',
  'Singapore': 'Asia/Singapore',
  'UAE': 'Asia/Dubai',
  'Saudi Arabia': 'Asia/Riyadh',
  'Brazil': 'America/Sao_Paulo',
  'Mexico': 'America/Mexico_City',
  'Argentina': 'America/Argentina/Buenos_Aires',
  'South Africa': 'Africa/Johannesburg',
  'Egypt': 'Africa/Cairo',
  'Nigeria': 'Africa/Lagos',
  'Kenya': 'Africa/Nairobi',
  'Russia': 'Europe/Moscow',
  'Turkey': 'Europe/Istanbul',
  'Thailand': 'Asia/Bangkok',
  'Malaysia': 'Asia/Kuala_Lumpur',
  'Indonesia': 'Asia/Jakarta',
  'Philippines': 'Asia/Manila',
  'South Korea': 'Asia/Seoul',
  'Vietnam': 'Asia/Ho_Chi_Minh',
  'New Zealand': 'Pacific/Auckland'
};

export default function AddNewSpace() {
  // Load Google Maps API
  const { isLoaded: isGoogleMapsLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
  });

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedPackageForImages, setSelectedPackageForImages] = useState('');
  const [packageImages, setPackageImages] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  
  // Package creation states
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState({
    name: '',
    type: '',
    description: '',
    price_per_hour: '0',
    price_per_day: '0',
    price_per_week: '0',
    price_per_month: '0',
    amenities: []
  });

  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(true);

  // Fetch amenities from API
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setAmenitiesLoading(true);
        const response = await coworkingApi.get('/coworking/amenities');
        const amenitiesData = response.data.amenities || [];
        // Extract just the names for the chips
        const amenityNames = amenitiesData.map(amenity => amenity.name);
        setAvailableAmenities(amenityNames);
      } catch (error) {
        console.error('Error fetching amenities:', error);
        // Fallback to some basic amenities if API fails
        setAvailableAmenities([
          'High-Speed WiFi', 'Premium Coffee', 'Parking', 'Meeting Rooms', 'Printing Services',
          'Kitchen Facilities', 'Lockers', 'Private Phone Booths', 'Reception Services',
          'Security System', 'Air Conditioning', 'Natural Light'
        ]);
      } finally {
        setAmenitiesLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Pakistan',
    latitude: 0,
    longitude: 0,
    price_per_hour: '0',
    price_per_day: '0',
    price_per_week: '0',
    price_per_month: '0',
    is_24_7: false,
    opening_hours: '',
    timezone: 'Asia/Karachi',
    amenities: [],
    packages: [],
    is_verified: false,
    // Weekly schedule
    weeklySchedule: {
      monday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      tuesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      wednesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      thursday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      friday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      saturday: { isOpen: false, startTime: '10:00', endTime: '16:00' },
      sunday: { isOpen: false, startTime: '10:00', endTime: '16:00' }
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Auto-detect timezone when country changes
      if (field === 'country' && countryTimezones[value]) {
        newData.timezone = countryTimezones[value];
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAmenitiesChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      amenities: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleImageUpload = (event) => {
    if (!selectedPackageForImages) {
      alert('Please select a package first');
      return;
    }

    const files = Array.from(event.target.files);
    const currentPackageImages = packageImages[selectedPackageForImages] || [];
    
    if (currentPackageImages.length + files.length > 10) {
      alert(`You can only upload up to 10 images per package. Current: ${currentPackageImages.length}, Trying to add: ${files.length}`);
      return;
    }

    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      packageId: selectedPackageForImages
    }));
    
    setPackageImages(prev => ({
      ...prev,
      [selectedPackageForImages]: [...currentPackageImages, ...newImages]
    }));
  };

  const removeImage = (imageId, packageId) => {
    setPackageImages(prev => ({
      ...prev,
      [packageId]: prev[packageId].filter(img => img.id !== imageId)
    }));
  };

  const getAvailablePackagesForImages = () => {
    return formData.packages.filter(pkg => {
      const currentImages = packageImages[pkg.id] || [];
      return currentImages.length < 10;
    });
  };

  const getCompletedPackages = () => {
    return formData.packages.filter(pkg => {
      const currentImages = packageImages[pkg.id] || [];
      return currentImages.length > 0;
    });
  };

  // Package management functions
  const handlePackageChange = (field, value) => {
    setCurrentPackage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePackageAmenitiesChange = (amenity) => {
    setCurrentPackage(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addPackage = () => {
    if (!currentPackage.name || !currentPackage.type || 
        (!currentPackage.price_per_hour && !currentPackage.price_per_day && 
         !currentPackage.price_per_week && !currentPackage.price_per_month)) {
      alert('Please fill in package name, type, and at least one pricing tier');
      return;
    }

    const newPackage = {
      ...currentPackage,
      id: Date.now()
    };

    setFormData(prev => ({
      ...prev,
      packages: [...prev.packages, newPackage]
    }));

    // Reset form
    setCurrentPackage({
      name: '',
      type: '',
      description: '',
      price_per_hour: '0',
      price_per_day: '0',
      price_per_week: '0',
      price_per_month: '0',
      amenities: []
    });
    setShowPackageForm(false);
  };

  const removePackage = (packageId) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.filter(pkg => pkg.id !== packageId)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Coworking Information
        if (!formData.title.trim()) newErrors.title = 'Space title is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
        
      case 1: // Price & Packages
        if (formData.packages.length === 0) newErrors.packages = 'At least one package is required';
        break;
        
      case 2: // Images Uploading
        // Images are optional, no validation needed
        break;
        
      case 3: // Operational Hours
        if (!formData.is_24_7) {
          // Check if at least one day is open
          const hasOpenDay = Object.values(formData.weeklySchedule).some(day => day.isOpen);
          if (!hasOpenDay) {
            newErrors.schedule = 'At least one day must be operational';
          }
        }
        break;
        
      case 4: // Review
        // Final validation - all previous steps should be valid
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const calculateCoordinates = async (address, city, country) => {
    try {
      // Use Google Geocoding API to get accurate coordinates
      const fullAddress = `${address}, ${city}, ${country}`;
      console.log('🌍 Geocoding address:', fullAddress);
      
      // Check if Google Maps is loaded
      if (!isGoogleMapsLoaded || !window.google || !window.google.maps) {
        console.error('❌ Google Maps not loaded, using fallback coordinates');
        console.log('   isGoogleMapsLoaded:', isGoogleMapsLoaded);
        console.log('   window.google:', !!window.google);
        console.log('   window.google.maps:', !!(window.google && window.google.maps));
        return { lat: 31.5204, lng: 74.3587 }; // Fallback to Lahore
      }
      
      return new Promise((resolve, reject) => {
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ address: fullAddress }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const coordinates = {
              lat: location.lat(),
              lng: location.lng()
            };
            console.log('✅ Geocoding successful:', coordinates);
            resolve(coordinates);
          } else {
            console.error('❌ Geocoding failed:', status);
            // Fallback to city-based coordinates
            const mockCoordinates = {
              'Lahore': { lat: 31.5497, lng: 74.3436 },
              'Karachi': { lat: 24.8607, lng: 67.0011 },
              'Islamabad': { lat: 33.6844, lng: 73.0479 },
              'Rawalpindi': { lat: 33.5651, lng: 73.0169 },
              'Faisalabad': { lat: 31.4504, lng: 73.1350 }
            };
            const coords = mockCoordinates[city] || { lat: 31.5204, lng: 74.3587 };
            console.log('🔄 Using fallback coordinates for', city, ':', coords);
            resolve(coords);
          }
        });
      });
    } catch (error) {
      console.error('❌ Error in calculateCoordinates:', error);
      // Return fallback coordinates
      return { lat: 31.5204, lng: 74.3587 };
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    setLoading(true);
    try {
      const coordinates = await calculateCoordinates(formData.address, formData.city, formData.country);
      
      // Collect all unique amenities from packages
      const allAmenities = new Set();
      formData.packages.forEach(pkg => {
        if (pkg.amenities && Array.isArray(pkg.amenities)) {
          pkg.amenities.forEach(amenity => allAmenities.add(amenity));
        }
      });
      
      // Extract pricing from packages - use the first package's pricing as main pricing
      let mainPricing = {
        price_per_hour: 0,
        price_per_day: 0,
        price_per_week: 0,
        price_per_month: 0
      };
      
      if (formData.packages.length > 0) {
        const firstPackage = formData.packages[0];
        mainPricing = {
          price_per_hour: parseFloat(firstPackage.price_per_hour) || 0,
          price_per_day: parseFloat(firstPackage.price_per_day) || 0,
          price_per_week: parseFloat(firstPackage.price_per_week) || 0,
          price_per_month: parseFloat(firstPackage.price_per_month) || 0
        };
      }
      
      // Convert weekly schedule to opening hours string
      let openingHoursString = '';
      if (formData.is_24_7) {
        openingHoursString = '24/7 Access Available';
      } else {
        const scheduleEntries = [];
        Object.entries(formData.weeklySchedule).forEach(([day, schedule]) => {
          if (schedule.isOpen) {
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            scheduleEntries.push(`${dayName}: ${schedule.startTime} - ${schedule.endTime}`);
          } else {
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            scheduleEntries.push(`${dayName}: Closed`);
          }
        });
        openingHoursString = scheduleEntries.join(', ');
      }
      
      const submitData = {
        ...formData,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        amenities: Array.from(allAmenities).join(','),
        packages: JSON.stringify(formData.packages),
        is_verified: false,
        // Use extracted pricing from packages
        price_per_hour: mainPricing.price_per_hour,
        price_per_day: mainPricing.price_per_day,
        price_per_week: mainPricing.price_per_week,
        price_per_month: mainPricing.price_per_month,
        // Include timezone and operational hours
        timezone: formData.timezone,
        opening_hours: openingHoursString
      };

      const response = await coworkingApi.post('/coworking/spaces', submitData);
      
      if (response.data && response.data.space_id) {
        const spaceId = response.data.space_id;
        
        // Upload images for each package
        const imageUploadPromises = [];
        Object.entries(packageImages).forEach(([packageId, images]) => {
          images.forEach((image, index) => {
            const formData = new FormData();
            formData.append('file', image.file);
            formData.append('package_id', packageId);
            formData.append('is_primary', index === 0 ? 'true' : 'false'); // First image in package is primary
            
            const uploadPromise = coworkingApi.post(`/coworking/spaces/${spaceId}/images`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            imageUploadPromises.push(uploadPromise);
          });
        });
        
        // Wait for all image uploads to complete
        if (imageUploadPromises.length > 0) {
          try {
            await Promise.all(imageUploadPromises);
            console.log('All images uploaded successfully');
          } catch (imageError) {
            console.error('Some images failed to upload:', imageError);
            // Continue anyway - space is created, just some images might be missing
          }
        }
        
        setSubmitStatus({
          type: 'success',
          message: 'Coworking space created successfully! 🎉'
        });
        
        // Redirect to coworking spaces list after successful submission
        setTimeout(() => {
          window.location.href = '/coworking/spaces';
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating coworking space:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to create coworking space. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    console.log('Rendering step:', step, 'activeStep:', activeStep, 'steps array:', steps); // Debug log
    console.log('Current step name should be:', steps[step]);
    
    // Ensure we're rendering the correct content for each step
    if (step === 3) {
      console.log('Step 3 detected - should show Operational Hours');
    }
    if (step === 4) {
      console.log('Step 4 detected - should show Review');
    }
    
    switch (step) {
      case 0: // Coworking Information
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Business sx={{ mr: 2, color: '#1976D2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                Basic Information
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Space Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: '320px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1976D2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#1976D2',
                      '&.Mui-focused': {
                        color: '#1976D2',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Full Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={!!errors.address}
                  helperText={errors.address}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: '320px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1976D2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#1976D2',
                      '&.Mui-focused': {
                        color: '#1976D2',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={!!errors.city}
                  helperText={errors.city}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: '320px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1976D2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#1976D2',
                      '&.Mui-focused': {
                        color: '#1976D2',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  error={!!errors.state}
                  helperText={errors.state}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: '320px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1976D2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#1976D2',
                      '&.Mui-focused': {
                        color: '#1976D2',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Zip/Postal Code"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: '320px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1976D2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#1976D2',
                      '&.Mui-focused': {
                        color: '#1976D2',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined" error={!!errors.country}>
                  <InputLabel 
                    shrink
                    sx={{
                      color: '#1976D2',
                      '&.Mui-focused': {
                        color: '#1976D2',
                      },
                    }}
                  >
                    Country
                  </InputLabel>
                  <Select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    label="Country"
                    fullWidth
                    sx={{
                      width: '100%',
                      minWidth: '320px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                      },
                    }}
                  >
                    <MenuItem value="Pakistan">Pakistan</MenuItem>
                    <MenuItem value="India">India</MenuItem>
                    <MenuItem value="Bangladesh">Bangladesh</MenuItem>
                    <MenuItem value="Sri Lanka">Sri Lanka</MenuItem>
                    <MenuItem value="Nepal">Nepal</MenuItem>
                    <MenuItem value="Afghanistan">Afghanistan</MenuItem>
                    <MenuItem value="Maldives">Maldives</MenuItem>
                    <MenuItem value="Bhutan">Bhutan</MenuItem>
                    <MenuItem value="United States">United States</MenuItem>
                    <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                    <MenuItem value="Australia">Australia</MenuItem>
                    <MenuItem value="Germany">Germany</MenuItem>
                    <MenuItem value="France">France</MenuItem>
                    <MenuItem value="Japan">Japan</MenuItem>
                    <MenuItem value="China">China</MenuItem>
                    <MenuItem value="South Korea">South Korea</MenuItem>
                    <MenuItem value="Singapore">Singapore</MenuItem>
                    <MenuItem value="Malaysia">Malaysia</MenuItem>
                    <MenuItem value="Thailand">Thailand</MenuItem>
                    <MenuItem value="Indonesia">Indonesia</MenuItem>
                    <MenuItem value="Philippines">Philippines</MenuItem>
                    <MenuItem value="Vietnam">Vietnam</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Workspace Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description}
                  variant="outlined"
                  multiline
                  rows={4}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: '320px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1976D2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#1976D2',
                      '&.Mui-focused': {
                        color: '#1976D2',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // Price & Packages
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Business sx={{ mr: 2, color: '#1976D2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                Pricing & Packages
              </Typography>
            </Box>

            {/* Created Packages */}
            {formData.packages && formData.packages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                  Created Packages ({formData.packages.length})
                </Typography>
                <Grid container spacing={2}>
                  {formData.packages.map((pkg, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Paper sx={{ 
                        p: 2, 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        '&:hover': { borderColor: '#1976D2' }
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: '#1976D2', fontWeight: 600 }}>
                            {pkg.name}
                          </Typography>
                          <IconButton 
                            size="small" 
                            sx={{ color: '#d32f2f' }}
                            onClick={() => removePackage(pkg.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                          {pkg.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          <Chip label={`Type: ${pkg.type}`} size="small" color="primary" variant="outlined" />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: '#1976D2', fontWeight: 600, mb: 1 }}>
                            Pricing:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {pkg.price_per_hour && (
                              <Chip label={`$${pkg.price_per_hour}/hr`} size="small" color="success" />
                            )}
                            {pkg.price_per_day && (
                              <Chip label={`$${pkg.price_per_day}/day`} size="small" color="success" />
                            )}
                            {pkg.price_per_week && (
                              <Chip label={`$${pkg.price_per_week}/week`} size="small" color="success" />
                            )}
                            {pkg.price_per_month && (
                              <Chip label={`$${pkg.price_per_month}/month`} size="small" color="success" />
                            )}
                          </Box>
                        </Box>
                        {pkg.amenities && pkg.amenities.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {pkg.amenities.slice(0, 3).map((amenity, i) => (
                              <Chip key={i} label={amenity} size="small" variant="outlined" />
                            ))}
                            {pkg.amenities.length > 3 && (
                              <Chip label={`+${pkg.amenities.length - 3} more`} size="small" variant="outlined" />
                            )}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Create Package Button */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowPackageForm(true)}
                sx={{
                  backgroundColor: '#1976D2',
                  '&:hover': { backgroundColor: '#1565C0' },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5
                }}
              >
                Create Package
              </Button>
              {errors.packages && (
                <Typography variant="body2" sx={{ color: '#d32f2f', mt: 1 }}>
                  {errors.packages}
                </Typography>
              )}
            </Box>

            {/* Package Creation Form */}
            {showPackageForm && (
              <Paper sx={{ 
                p: 3, 
                border: '2px solid #1976D2',
                borderRadius: '12px',
                backgroundColor: '#f8fafc'
              }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#1976D2', fontWeight: 600 }}>
                  Create New Package
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Package Name"
                      value={currentPackage.name}
                      onChange={(e) => setCurrentPackage({...currentPackage, name: e.target.value})}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minWidth: '320px',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#1976D2' },
                          '&.Mui-focused fieldset': { borderColor: '#1976D2' },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#1976D2',
                          '&.Mui-focused': { color: '#1976D2' },
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel shrink sx={{ color: '#1976D2', '&.Mui-focused': { color: '#1976D2' } }}>
                        Package Type
                      </InputLabel>
                      <Select
                        value={currentPackage.type}
                        onChange={(e) => setCurrentPackage({...currentPackage, type: e.target.value})}
                        label="Package Type"
                        sx={{
                          minWidth: '320px',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                        }}
                      >
                        <MenuItem value="hot_desk">Hot Desk</MenuItem>
                        <MenuItem value="dedicated_desk">Dedicated Desk</MenuItem>
                        <MenuItem value="private_office">Private Office</MenuItem>
                        <MenuItem value="meeting_room">Meeting Room</MenuItem>
                        <MenuItem value="conference_room">Conference Room</MenuItem>
                        <MenuItem value="virtual_office">Virtual Office</MenuItem>
                        <MenuItem value="coworking_membership">Coworking Membership</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Pricing Structure (USD)
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Price per Hour"
                      type="number"
                      value={currentPackage.price_per_hour}
                      onChange={(e) => handlePackageChange('price_per_hour', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minWidth: '320px',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#1976D2' },
                          '&.Mui-focused fieldset': { borderColor: '#1976D2' },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#1976D2',
                          '&.Mui-focused': { color: '#1976D2' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Price per Day"
                      type="number"
                      value={currentPackage.price_per_day}
                      onChange={(e) => handlePackageChange('price_per_day', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minWidth: '320px',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#1976D2' },
                          '&.Mui-focused fieldset': { borderColor: '#1976D2' },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#1976D2',
                          '&.Mui-focused': { color: '#1976D2' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Price per Week"
                      type="number"
                      value={currentPackage.price_per_week}
                      onChange={(e) => handlePackageChange('price_per_week', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minWidth: '320px',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#1976D2' },
                          '&.Mui-focused fieldset': { borderColor: '#1976D2' },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#1976D2',
                          '&.Mui-focused': { color: '#1976D2' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Price per Month"
                      type="number"
                      value={currentPackage.price_per_month}
                      onChange={(e) => handlePackageChange('price_per_month', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minWidth: '320px',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#1976D2' },
                          '&.Mui-focused fieldset': { borderColor: '#1976D2' },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#1976D2',
                          '&.Mui-focused': { color: '#1976D2' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Package Description"
                      value={currentPackage.description}
                      onChange={(e) => setCurrentPackage({...currentPackage, description: e.target.value})}
                      variant="outlined"
                      multiline
                      rows={3}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minWidth: '320px',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#1976D2' },
                          '&.Mui-focused fieldset': { borderColor: '#1976D2' },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#1976D2',
                          '&.Mui-focused': { color: '#1976D2' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Package Amenities
                    </Typography>
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                       {amenitiesLoading ? (
                         <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                           Loading amenities...
                         </Typography>
                       ) : (
                         availableAmenities.map((amenity) => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          clickable
                          color={currentPackage.amenities.includes(amenity) ? "primary" : "default"}
                          variant={currentPackage.amenities.includes(amenity) ? "filled" : "outlined"}
                          onClick={() => handlePackageAmenitiesChange(amenity)}
                          sx={{
                            backgroundColor: currentPackage.amenities.includes(amenity) ? '#1976D2' : 'transparent',
                            color: currentPackage.amenities.includes(amenity) ? 'white' : '#1976D2',
                            borderColor: '#1976D2',
                            '&:hover': {
                              backgroundColor: currentPackage.amenities.includes(amenity) ? '#1565C0' : 'rgba(25, 118, 210, 0.1)',
                              borderColor: '#1565C0'
                            },
                            '&.MuiChip-clickable:hover': {
                              backgroundColor: currentPackage.amenities.includes(amenity) ? '#1565C0' : 'rgba(25, 118, 210, 0.1)'
                            }
                          }}
                         />
                       ))
                       )}
                     </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowPackageForm(false);
                      setCurrentPackage({
                        name: '',
                        type: '',
                        description: '',
                        price_per_hour: '0',
                        price_per_day: '0',
                        price_per_week: '0',
                        price_per_month: '0',
                        amenities: []
                      });
                    }}
                    sx={{
                      borderColor: '#666',
                      color: '#666',
                      '&:hover': { borderColor: '#333', color: '#333' }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={addPackage}
                    disabled={!currentPackage.name || !currentPackage.type || 
                      (!currentPackage.price_per_hour && !currentPackage.price_per_day && 
                       !currentPackage.price_per_week && !currentPackage.price_per_month)}
                    sx={{
                      backgroundColor: '#1976D2',
                      '&:hover': { backgroundColor: '#1565C0' }
                    }}
                  >
                    Add Package
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        );

      case 2: // Images Uploading
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CloudUpload sx={{ mr: 2, color: '#1976D2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                Package Images
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              Upload up to 10 high-quality images for each package to showcase your coworking space
            </Typography>

            {formData.packages.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8fafc', border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                  No Packages Created
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Please create at least one package in the previous step before uploading images
                </Typography>
              </Paper>
            ) : (
              <>
                {/* Package Selection */}
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth variant="outlined" sx={{ maxWidth: 400 }}>
                    <InputLabel shrink sx={{ color: '#1976D2', '&.Mui-focused': { color: '#1976D2' } }}>
                      Select Package for Images
                    </InputLabel>
                    <Select
                      value={selectedPackageForImages}
                      onChange={(e) => setSelectedPackageForImages(e.target.value)}
                      label="Select Package for Images"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                      }}
                    >
                      {getAvailablePackagesForImages().map((pkg) => {
                        const currentImages = packageImages[pkg.id] || [];
                        return (
                          <MenuItem key={pkg.id} value={pkg.id}>
                            {pkg.name} ({currentImages.length}/10 images)
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>

                {/* Upload Area */}
                {selectedPackageForImages && (
                  <Box
                    sx={{
                      border: '2px dashed #1976D2',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      mb: 3,
                      backgroundColor: '#f8fafc',
                      '&:hover': { 
                        borderColor: '#0D47A1',
                        backgroundColor: '#e3f2fd'
                      }
                    }}
                  >
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="image-upload"
                      multiple
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="image-upload">
                      <IconButton 
                        color="primary" 
                        aria-label="upload picture" 
                        component="span" 
                        size="large"
                        sx={{ color: '#1976D2' }}
                      >
                        <CloudUpload sx={{ fontSize: 48 }} />
                      </IconButton>
                      <Typography variant="h6" sx={{ mt: 1, color: '#0D47A1' }}>
                        Upload Images for {formData.packages.find(p => p.id === selectedPackageForImages)?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {(packageImages[selectedPackageForImages] || []).length}/10 images uploaded • JPG, PNG, GIF up to 10MB each
                      </Typography>
                    </label>
                  </Box>
                )}

                {/* Display Images by Package */}
                {Object.keys(packageImages).map((packageId) => {
                  const pkg = formData.packages.find(p => p.id === parseInt(packageId));
                  const images = packageImages[packageId] || [];
                  
                  if (images.length === 0) return null;

                  return (
                    <Box key={packageId} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                        {pkg?.name} ({images.length}/10 images)
                      </Typography>
                      <Grid container spacing={2}>
                        {images.map((image) => (
                          <Grid item xs={6} sm={4} key={image.id}>
                            <Card>
                              <Box sx={{ position: 'relative' }}>
                                <img
                                  src={image.preview}
                                  alt={image.name}
                                  style={{
                                    width: '100%',
                                    height: 150,
                                    objectFit: 'cover'
                                  }}
                                />
                                <IconButton
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                                  }}
                                  size="small"
                                  onClick={() => removeImage(image.id, packageId)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                              <CardContent sx={{ p: 1 }}>
                                <Typography variant="caption" noWrap>
                                  {image.name}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  );
                })}

                {/* Completed Packages Summary */}
                {getCompletedPackages().length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Upload Progress
                    </Typography>
                    <Grid container spacing={2}>
                      {formData.packages.map((pkg) => {
                        const images = packageImages[pkg.id] || [];
                        const isComplete = images.length > 0;
                        return (
                          <Grid item xs={12} md={6} key={pkg.id}>
                            <Paper sx={{ 
                              p: 2, 
                              border: `1px solid ${isComplete ? '#4caf50' : '#e0e0e0'}`,
                              backgroundColor: isComplete ? '#f1f8e9' : '#f8fafc'
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {pkg.name}
                                </Typography>
                                <Chip 
                                  label={`${images.length}/10`} 
                                  size="small" 
                                  color={isComplete ? "success" : "default"}
                                />
                              </Box>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
              </>
            )}
          </Box>
        );

      case 3: // Review
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Business sx={{ mr: 2, color: '#1976D2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                Review & Submit
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              Review all the information before submitting your coworking space listing
            </Typography>

            <Grid container spacing={3}>
              {/* Basic Information Summary */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#f8fafc', border: '1px solid #1976D2', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Basic Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">Space Title:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.title || 'Not specified'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">City:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.city || 'Not specified'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">State/Province:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.state || 'Not specified'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">Country:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.country || 'Not specified'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">Full Address:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.address || 'Not specified'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">Description:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.description || 'Not specified'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Packages Summary */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#f8fafc', border: '1px solid #1976D2', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Packages ({formData.packages.length})
                    </Typography>
                    {formData.packages.length > 0 ? (
                      <Grid container spacing={2}>
                        {formData.packages.map((pkg, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Paper sx={{ 
                              p: 2, 
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              backgroundColor: '#fff'
                            }}>
                              <Typography variant="h6" sx={{ color: '#1976D2', fontWeight: 600, mb: 1 }}>
                                {pkg.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                {pkg.description}
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Chip label={`Type: ${pkg.type}`} size="small" color="primary" variant="outlined" sx={{ mr: 1 }} />
                              </Box>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#1976D2', fontWeight: 600, mb: 1 }}>
                                  Pricing:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {pkg.price_per_hour && (
                                    <Chip label={`$${pkg.price_per_hour}/hr`} size="small" color="success" />
                                  )}
                                  {pkg.price_per_day && (
                                    <Chip label={`$${pkg.price_per_day}/day`} size="small" color="success" />
                                  )}
                                  {pkg.price_per_week && (
                                    <Chip label={`$${pkg.price_per_week}/week`} size="small" color="success" />
                                  )}
                                  {pkg.price_per_month && (
                                    <Chip label={`$${pkg.price_per_month}/month`} size="small" color="success" />
                                  )}
                                </Box>
                              </Box>
                              {pkg.amenities && pkg.amenities.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ color: '#1976D2', fontWeight: 600, mb: 1 }}>
                                    Amenities:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {pkg.amenities.slice(0, 3).map((amenity, i) => (
                                      <Chip key={i} label={amenity} size="small" variant="outlined" />
                                    ))}
                                    {pkg.amenities.length > 3 && (
                                      <Chip label={`+${pkg.amenities.length - 3} more`} size="small" variant="outlined" />
                                    )}
                                  </Box>
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>
                        No packages created
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Images Summary */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#f8fafc', border: '1px solid #1976D2', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Images Summary
                    </Typography>
                    {Object.keys(packageImages).length > 0 ? (
                      <Grid container spacing={2}>
                        {formData.packages.map((pkg) => {
                          const images = packageImages[pkg.id] || [];
                          return (
                            <Grid item xs={12} md={6} key={pkg.id}>
                              <Paper sx={{ 
                                p: 2, 
                                border: `1px solid ${images.length > 0 ? '#4caf50' : '#e0e0e0'}`,
                                backgroundColor: images.length > 0 ? '#f1f8e9' : '#fff',
                                borderRadius: '8px'
                              }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {pkg.name}
                                  </Typography>
                                  <Chip 
                                    label={`${images.length}/10 images`} 
                                    size="small" 
                                    color={images.length > 0 ? "success" : "default"}
                                  />
                                </Box>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>
                        No images uploaded
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>


            </Grid>
          </Box>
        );

      case 3: // Operational Hours
        return (
          <Box>
            <Typography variant="h4" sx={{ mb: 3, color: '#1976D2' }}>
              🕒 Operational Hours & Schedule
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Set your coworking space operating hours. This will be displayed to customers.
            </Alert>
            
            {/* Timezone Info */}
            <Card sx={{ mb: 3, backgroundColor: '#f8fafc' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976D2' }}>
                  📍 Location & Timezone
                </Typography>
                <Typography variant="body1">
                  <strong>Country:</strong> {formData.country} | <strong>Timezone:</strong> {formData.timezone}
                </Typography>
              </CardContent>
            </Card>

            {/* 24/7 Toggle */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_24_7}
                      onChange={(e) => handleInputChange('is_24_7', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="h6">24/7 Access Available</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Enable if your space provides round-the-clock access
                      </Typography>
                    </Box>
                  }
                />
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            {!formData.is_24_7 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, color: '#1976D2' }}>
                    📅 Weekly Operating Schedule
                  </Typography>
                  
                  {/* Schedule Table */}
                  <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                    {/* Header */}
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1fr 2fr 2fr', 
                      gap: 2, 
                      p: 2, 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold'
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Day</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Open</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Start Time</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>End Time</Typography>
                    </Box>
                    
                    {/* Days */}
                    {Object.entries(formData.weeklySchedule).map(([day, schedule], index) => (
                      <Box 
                        key={day}
                        sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: '2fr 1fr 2fr 2fr', 
                          gap: 2, 
                          p: 2, 
                          alignItems: 'center',
                          borderTop: index > 0 ? '1px solid #e0e0e0' : 'none',
                          '&:hover': { backgroundColor: '#f9f9f9' }
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {day}
                        </Typography>
                        
                        <Switch
                          checked={schedule.isOpen}
                          onChange={(e) => handleScheduleChange(day, 'isOpen', e.target.checked)}
                          color="primary"
                        />
                        
                        <TextField
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => handleScheduleChange(day, 'startTime', e.target.value)}
                          disabled={!schedule.isOpen}
                          size="small"
                          fullWidth
                        />
                        
                        <TextField
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => handleScheduleChange(day, 'endTime', e.target.value)}
                          disabled={!schedule.isOpen}
                          size="small"
                          fullWidth
                        />
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Quick Actions */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Quick Setup:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                          weekdays.forEach(day => {
                            handleScheduleChange(day, 'isOpen', true);
                            handleScheduleChange(day, 'startTime', '09:00');
                            handleScheduleChange(day, 'endTime', '18:00');
                          });
                        }}
                      >
                        Business Hours (Mon-Fri 9-6)
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          ['saturday', 'sunday'].forEach(day => {
                            handleScheduleChange(day, 'isOpen', false);
                          });
                        }}
                      >
                        Close Weekends
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          Object.keys(formData.weeklySchedule).forEach(day => {
                            handleScheduleChange(day, 'isOpen', true);
                            handleScheduleChange(day, 'startTime', '08:00');
                            handleScheduleChange(day, 'endTime', '20:00');
                          });
                        }}
                      >
                        Extended Hours (8 AM - 8 PM)
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 4: // Review
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CheckCircle sx={{ mr: 2, color: '#1976D2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                Review Your Coworking Space
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {/* Basic Information Summary */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#f8fafc', border: '1px solid #1976D2', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Basic Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#666' }}>Title:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.title}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#666' }}>City:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.city}, {formData.country}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ color: '#666' }}>Address:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.address}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ color: '#666' }}>Description:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.description}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Packages Summary */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#f8fafc', border: '1px solid #1976D2', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Packages ({formData.packages.length})
                    </Typography>
                    {formData.packages.length > 0 ? (
                      <Grid container spacing={2}>
                        {formData.packages.map((pkg, index) => (
                          <Grid item xs={12} md={6} key={index}>
                            <Paper sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                {pkg.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                {pkg.description}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {pkg.price_per_hour && (
                                  <Chip label={`$${pkg.price_per_hour}/hr`} size="small" color="success" />
                                )}
                                {pkg.price_per_day && (
                                  <Chip label={`$${pkg.price_per_day}/day`} size="small" color="success" />
                                )}
                                {pkg.price_per_week && (
                                  <Chip label={`$${pkg.price_per_week}/week`} size="small" color="success" />
                                )}
                                {pkg.price_per_month && (
                                  <Chip label={`$${pkg.price_per_month}/month`} size="small" color="success" />
                                )}
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>
                        No packages created
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Operational Hours Summary */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#f8fafc', border: '1px solid #1976D2', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Operational Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#666' }}>Timezone:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.timezone}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#666' }}>Access Type:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formData.is_24_7 ? '24/7 Access' : 'Scheduled Hours'}
                        </Typography>
                      </Grid>
                      {!formData.is_24_7 && formData.opening_hours && (
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: '#666' }}>Operating Hours:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.opening_hours}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 0 }}>
            {/* Header */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
              borderRadius: '12px',
              p: 3,
              mb: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              border: 'none'
            }}>
              <IconButton
                sx={{
                  mr: 2,
                  color: '#fff',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: '#fff' }}>
                  Add New Coworking Space
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Create and assign space details to your coworking facility
                </Typography>
              </Box>
            </Box>

            {/* Stepper */}
            <Paper sx={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              mb: 3,
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0'
            }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel 
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: '#90CAF9',
                            fontWeight: 500
                          },
                          '& .MuiStepLabel-label.Mui-active': {
                            color: '#1976D2',
                            fontWeight: 600
                          },
                          '& .MuiStepLabel-label.Mui-completed': {
                            color: '#1976D2',
                            fontWeight: 500
                          },
                          '& .MuiStepIcon-root': {
                            color: '#BBDEFB'
                          },
                          '& .MuiStepIcon-root.Mui-active': {
                            color: '#1976D2'
                          },
                          '& .MuiStepIcon-root.Mui-completed': {
                            color: '#1976D2'
                          }
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Step Content */}
              <Box sx={{ p: 4 }}>
                {/* Force render operational hours when activeStep is 3 */}
                {activeStep === 3 ? (
                  <Box>
                    <Typography variant="h4" sx={{ mb: 3, color: '#1976D2' }}>
                      🕒 Operational Hours & Schedule
                    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Set your coworking space operating hours. This will be displayed to customers.
                    </Alert>
                    
                    {/* Timezone Info */}
                    <Card sx={{ mb: 3, backgroundColor: '#f8fafc' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#1976D2' }}>
                          📍 Location & Timezone
                        </Typography>
                        <Typography variant="body1">
                          <strong>Country:</strong> {formData.country} | <strong>Timezone:</strong> {formData.timezone}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* 24/7 Toggle */}
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.is_24_7}
                              onChange={(e) => handleInputChange('is_24_7', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="h6">24/7 Access Available</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Enable if your space provides round-the-clock access
                              </Typography>
                            </Box>
                          }
                        />
                      </CardContent>
                    </Card>

                    {/* Weekly Schedule */}
                    {!formData.is_24_7 && (
                      <Card>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 3, color: '#1976D2' }}>
                            📅 Weekly Operating Schedule
                          </Typography>
                          
                          {/* Schedule Table */}
                          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                            {/* Header */}
                            <Box sx={{ 
                              display: 'grid', 
                              gridTemplateColumns: '2fr 1fr 2fr 2fr', 
                              gap: 2, 
                              p: 2, 
                              backgroundColor: '#f5f5f5',
                              fontWeight: 'bold'
                            }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Day</Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Open</Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Start Time</Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>End Time</Typography>
                            </Box>
                            
                            {/* Days */}
                            {Object.entries(formData.weeklySchedule).map(([day, schedule], index) => (
                              <Box 
                                key={day}
                                sx={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: '2fr 1fr 2fr 2fr', 
                                  gap: 2, 
                                  p: 2, 
                                  alignItems: 'center',
                                  borderTop: index > 0 ? '1px solid #e0e0e0' : 'none',
                                  '&:hover': { backgroundColor: '#f9f9f9' }
                                }}
                              >
                                <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                  {day}
                                </Typography>
                                
                                <Switch
                                  checked={schedule.isOpen}
                                  onChange={(e) => handleScheduleChange(day, 'isOpen', e.target.checked)}
                                  color="primary"
                                />
                                
                                <TextField
                                  type="time"
                                  value={schedule.startTime}
                                  onChange={(e) => handleScheduleChange(day, 'startTime', e.target.value)}
                                  disabled={!schedule.isOpen}
                                  size="small"
                                  fullWidth
                                />
                                
                                <TextField
                                  type="time"
                                  value={schedule.endTime}
                                  onChange={(e) => handleScheduleChange(day, 'endTime', e.target.value)}
                                  disabled={!schedule.isOpen}
                                  size="small"
                                  fullWidth
                                />
                              </Box>
                            ))}
                          </Box>
                          
                          {/* Quick Actions */}
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                              Quick Setup:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                                  weekdays.forEach(day => {
                                    handleScheduleChange(day, 'isOpen', true);
                                    handleScheduleChange(day, 'startTime', '09:00');
                                    handleScheduleChange(day, 'endTime', '18:00');
                                  });
                                }}
                              >
                                Business Hours (Mon-Fri 9-6)
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  ['saturday', 'sunday'].forEach(day => {
                                    handleScheduleChange(day, 'isOpen', false);
                                  });
                                }}
                              >
                                Close Weekends
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  Object.keys(formData.weeklySchedule).forEach(day => {
                                    handleScheduleChange(day, 'isOpen', true);
                                    handleScheduleChange(day, 'startTime', '08:00');
                                    handleScheduleChange(day, 'endTime', '20:00');
                                  });
                                }}
                              >
                                Extended Hours (8 AM - 8 PM)
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                ) : (
                  renderStepContent(activeStep)
                )}
              </Box>

              {/* Navigation Buttons */}
              <Box sx={{ 
                p: 3, 
                borderTop: '1px solid #42A5F5',
                display: 'flex', 
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc'
              }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ 
                    color: '#1976D2',
                    '&:hover': { backgroundColor: '#e3f2fd' }
                  }}
                >
                  Back
                </Button>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ 
                        backgroundColor: '#1976D2',
                        color: 'white',
                        '&:hover': { backgroundColor: '#0D47A1' },
                        minWidth: 120,
                        py: 1.5,
                        px: 3,
                        borderRadius: '8px',
                        fontWeight: 600
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{ 
                        backgroundColor: '#1976D2',
                        color: 'white',
                        '&:hover': { backgroundColor: '#0D47A1' },
                        minWidth: 180,
                        py: 1.5,
                        px: 4,
                        borderRadius: '8px',
                        fontWeight: 600
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress sx={{ width: 100, height: 4, borderRadius: 2 }} />
                          Creating...
                        </Box>
                      ) : (
                        'Create Workspace'
                      )}
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Success/Error Messages */}
              {submitStatus.type && (
                <Box sx={{ p: 3, pt: 0 }}>
                  <Alert 
                    severity={submitStatus.type} 
                    onClose={() => setSubmitStatus({ type: '', message: '' })}
                    sx={{
                      '& .MuiAlert-icon': {
                        color: submitStatus.type === 'success' ? '#1976D2' : undefined
                      }
                    }}
                  >
                    {submitStatus.message}
                  </Alert>
                </Box>
              )}
            </Paper>
      </Box>
    </Box>
  );
}
