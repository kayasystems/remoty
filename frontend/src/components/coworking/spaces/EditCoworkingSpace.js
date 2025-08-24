import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Switch,
  FormControlLabel,
  InputAdornment,
  Divider,
  LinearProgress
} from '@mui/material';
import { ArrowBack, MoreVert, Business, CloudUpload, Delete, Add, AccessTime, CheckCircle, Save, Edit, Info, LocalOffer, Star } from '@mui/icons-material';
import { useJsApiLoader } from '@react-google-maps/api';
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

// Memoized arrays to prevent re-renders
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WEEKENDS = ['Saturday', 'Sunday'];
// These will be replaced by database-fetched amenities in the component
// const AVAILABLE_AMENITIES = []; // Now fetched from API
// const AMENITIES_SELECTION = []; // Now fetched from API

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

// Memoized styles to prevent re-renders
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5', p: 3 },
  maxWidth: { maxWidth: '1200px', margin: '0 auto' },
  headerBox: { 
    display: 'flex', 
    alignItems: 'center', 
    mb: 3, 
    p: 3, 
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)'
  },
  cardStyle: { 
    borderRadius: '12px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
    border: '1px solid #e0e0e0',
    transition: 'box-shadow 0.3s ease',
    '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
  },
  flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 },
  flexCenter: { display: 'flex', alignItems: 'center' },
  sectionTitle: { fontWeight: 600, color: '#1976D2' },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
    color: 'white',
    fontWeight: 600,
    px: 3,
    py: 1,
    borderRadius: '8px',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
    }
  }
};

function EditCoworkingSpace() {
  // Removed console logging to prevent scroll re-renders
  
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const hasLoadedRef = useRef(false);
  
  // Removed console logging to prevent scroll re-renders
  
  // Load Google Maps API
  const { isLoaded: isGoogleMapsLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null); // 'basic' | 'packages' | 'images' | 'hours' | 'amenities' | null
  const [sectionLoading, setSectionLoading] = useState(false);
  const [customAmenity, setCustomAmenity] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  
  // Section-specific states
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageIdCounter, setPackageIdCounter] = useState(1000); // Use counter instead of Date.now()
  const [currentPackage, setCurrentPackage] = useState({
    name: '',
    type: '',
    description: '',
    price_per_hour: '0',
    price_per_day: '0',
    price_per_week: '0',
    price_per_month: '0',
    amenities: [],
    images: []
  });
  
  // Package editing states
  const [editingPackage, setEditingPackage] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    type: '',
    price_per_hour: '',
    price_per_day: '',
    price_per_week: '',
    price_per_month: ''
  });
  const [packageImages, setPackageImages] = useState([]);
  const [selectedPackageAmenities, setSelectedPackageAmenities] = useState([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(true);

  // Optimized: Load amenities only when needed (lazy loading)
  const loadAmenities = useCallback(async () => {
    if (availableAmenities.length > 0) return; // Already loaded
    
    try {
      setAmenitiesLoading(true);
      const response = await coworkingApi.get('/coworking/amenities');
      const amenitiesData = response.data.amenities || [];
      const amenityNames = amenitiesData.map(amenity => amenity.name);
      setAvailableAmenities(amenityNames);
    } catch (error) {
      console.error('Error fetching amenities:', error);
      // Fallback to basic amenities
      setAvailableAmenities([
        'High-speed WiFi', '24/7 Access', 'Premium Coffee', 'Meeting Rooms', 'Parking',
        'Reception Services', 'Printing & Scanning', 'Kitchen Facilities', 'Lockers'
      ]);
    } finally {
      setAmenitiesLoading(false);
    }
  }, [availableAmenities.length]);

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
    weeklySchedule: {
      Monday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      Tuesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      Wednesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      Thursday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      Friday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      Saturday: { isOpen: true, startTime: '10:00', endTime: '16:00' },
      Sunday: { isOpen: false, startTime: '10:00', endTime: '16:00' }
    }
  });

  // Removed scroll event listeners to prevent scroll re-rendering issues

  // Optimized: Load space data only once
  useEffect(() => {
    if (hasLoadedRef.current || !spaceId) return;
    
    const fetchSpaceData = async () => {
      try {
        setInitialLoading(true);
        const response = await coworkingApi.get(`/coworking/spaces/${spaceId}`);
        const spaceData = response.data;
        
        // Optimized: Pre-process data to reduce re-renders
        const processedData = {
          title: spaceData.title || '',
          description: spaceData.description || '',
          address: spaceData.address || '',
          city: spaceData.city || '',
          state: spaceData.state || '',
          country: spaceData.country || '',
          zipCode: spaceData.zip_code || '',
          latitude: spaceData.latitude || '',
          longitude: spaceData.longitude || '',
          amenities: spaceData.amenities || [],
          packages: spaceData.packages || [],
          weeklySchedule: {
            Monday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Tuesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Wednesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Thursday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Friday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Saturday: { isOpen: true, startTime: '10:00', endTime: '16:00' },
            Sunday: { isOpen: false, startTime: '10:00', endTime: '16:00' }
          }
        };

        setFormData(processedData);

        // Process package images efficiently
        if (spaceData.packages?.length > 0) {
          const imageData = {};
          spaceData.packages.forEach(pkg => {
            if (pkg.images?.length > 0) {
              imageData[pkg.id] = pkg.images;
            }
          });
          setPackageImages(imageData);
        }

        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading space data:', error);
        setSubmitStatus({
          type: 'error',
          message: 'Failed to load space data. Please try again.'
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSpaceData();
  }, [spaceId]);

  // Handle input changes - memoized to prevent re-renders
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, []);

  // Handle amenities change - memoized to prevent re-renders
  const handleAmenitiesChange = useCallback((event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      amenities: typeof value === 'string' ? value.split(',') : value
    }));
  }, []);

  // Handle schedule changes - memoized to prevent re-renders
  const handleScheduleChange = useCallback((day, field, value) => {
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
  }, []);

  // Package management functions - memoized to prevent re-renders
  const handlePackageChange = useCallback((field, value) => {
    setCurrentPackage(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handlePackageAmenitiesChange = useCallback((amenity) => {
    setCurrentPackage(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  }, []);

  const addPackage = useCallback(() => {
    if (!currentPackage.name || !currentPackage.type) {
      setErrors(prev => ({
        ...prev,
        package: 'Package name and type are required'
      }));
      return;
    }

    if (editingPackageId) {
      // Update existing package
      setFormData(prev => ({
        ...prev,
        packages: prev.packages.map(pkg => 
          pkg.id === editingPackageId ? { ...currentPackage, id: editingPackageId } : pkg
        )
      }));
    } else {
      // Add new package
      const newPackage = {
        ...currentPackage,
        id: packageIdCounter // Use counter instead of Date.now()
      };
      
      // Increment counter for next package
      setPackageIdCounter(prev => prev + 1);

      setFormData(prev => ({
        ...prev,
        packages: [...prev.packages, newPackage]
      }));
    }

    // Reset package form
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
    setEditingPackageId(null);
    setErrors(prev => ({ ...prev, package: '' }));
  }, [currentPackage, packageIdCounter]);

  const editPackage = useCallback((pkg) => {
    setCurrentPackage({
      name: pkg.name || '',
      type: pkg.type || '',
      description: pkg.description || '',
      price_per_hour: pkg.price_per_hour || '0',
      price_per_day: pkg.price_per_day || '0',
      price_per_week: pkg.price_per_week || '0',
      price_per_month: pkg.price_per_month || '0',
      amenities: pkg.amenities || []
    });
    setEditingPackageId(pkg.id);
    setShowPackageForm(true);
  }, []);

  const removePackage = useCallback((packageId) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.filter(pkg => pkg.id !== packageId)
    }));
  }, []);

  // Geocoding function to get coordinates from address
  const geocodeAddress = async (address, city, state, country) => {
    if (!isGoogleMapsLoaded || !window.google || !window.google.maps) {
      console.warn('Google Maps not loaded, using fallback coordinates');
      return { latitude: 0, longitude: 0 };
    }

    const geocoder = new window.google.maps.Geocoder();
    const fullAddress = `${address}, ${city}, ${state}, ${country}`;

    return new Promise((resolve) => {
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            latitude: location.lat(),
            longitude: location.lng()
          });
        } else {
          console.warn('Geocoding failed:', status);
          // Return center coordinates as fallback
          resolve({ latitude: 0, longitude: 0 });
        }
      });
    });
  };

  // Section-specific save functions
  const saveBasicInfo = async () => {
    setSectionLoading(true);
    try {
      // Calculate coordinates from address
      const coordinates = await geocodeAddress(
        formData.address,
        formData.city,
        formData.state,
        formData.country
      );

      const basicInfoData = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      };

      await coworkingApi.put(`/coworking/spaces/${spaceId}/basic-info`, basicInfoData);
      
      // Update local form data with new coordinates
      setFormData(prev => ({
        ...prev,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }));
      
      setSubmitStatus({
        type: 'success',
        message: 'Basic information updated successfully with new coordinates!'
      });
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating basic info:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to update basic information'
      });
    } finally {
      setSectionLoading(false);
    }
  };

  const savePackages = async () => {
    setSectionLoading(true);
    try {
      const packagesData = {
        packages: JSON.stringify(formData.packages)
      };

      await coworkingApi.put(`/coworking/spaces/${spaceId}/packages`, packagesData);
      
      setSubmitStatus({
        type: 'success',
        message: 'Packages updated successfully!'
      });
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating packages:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to update packages'
      });
    } finally {
      setSectionLoading(false);
    }
  };

  const saveAmenities = async () => {
    setSectionLoading(true);
    try {
      const amenitiesData = {
        amenities: JSON.stringify(formData.amenities)
      };

      await coworkingApi.put(`/coworking/spaces/${spaceId}/amenities`, amenitiesData);
      
      setSubmitStatus({
        type: 'success',
        message: 'Amenities updated successfully!'
      });
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating amenities:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to update amenities'
      });
    } finally {
      setSectionLoading(false);
    }
  };

  // Package editing functions
  const startEditingPackage = (pkg) => {
    setEditingPackageId(pkg.id);
    setEditData({
      name: pkg.name,
      type: pkg.type,
      description: pkg.description,
      price_per_hour: pkg.price_per_hour,
      price_per_day: pkg.price_per_day,
      price_per_week: pkg.price_per_week,
      price_per_month: pkg.price_per_month
    });
    
    // Set package images for editing
    setPackageImages(pkg.images || []);
    
    // Set package amenities for editing
    let amenitiesArray = [];
    if (pkg.amenities) {
      if (Array.isArray(pkg.amenities)) {
        amenitiesArray = pkg.amenities;
      } else if (typeof pkg.amenities === 'string') {
        try {
          amenitiesArray = JSON.parse(pkg.amenities);
        } catch (e) {
          amenitiesArray = pkg.amenities.split(',').map(a => a.trim());
        }
      }
    }
    setSelectedPackageAmenities(amenitiesArray);
    
    // Lazy load amenities only when editing starts
    loadAmenities();
  };

  const cancelEditingPackage = () => {
    setEditingPackageId(null);
    setEditData({
      name: '',
      description: '',
      type: '',
      price_per_hour: '',
      price_per_day: '',
      price_per_week: '',
      price_per_month: ''
    });
    setPackageImages([]);
    setSelectedPackageAmenities([]);
  };

  const savePackageChanges = async (packageData) => {
    console.log('🔧 savePackageChanges called with:', { packageData, editingPackageId });
    
    if (!editingPackageId) {
      console.error('❌ No editingPackageId found');
      return;
    }
    
    try {
      setSectionLoading(true);
      console.log('🔄 Setting section loading to true');
      
      // Prepare the package update data
      const updateData = {
        name: packageData.name,
        description: packageData.description,
        price_per_hour: packageData.price_per_hour,
        price_per_day: packageData.price_per_day,
        price_per_week: packageData.price_per_week,
        price_per_month: packageData.price_per_month,
        amenities: JSON.stringify(selectedPackageAmenities),
        images: packageImages.map(img => ({
          image_url: img.image_url || img.url,
          image_name: img.image_name || img.name || '',
          image_description: img.image_description || img.description || '',
          is_primary: img.is_primary || false
        }))
      };
      
      console.log('📦 Update data prepared:', updateData);
      console.log('🌐 Making API call to:', `/coworking/spaces/${spaceId}/packages/${editingPackageId}`);
      
      // Use the new package-specific endpoint
      const response = await coworkingApi.put(`/coworking/spaces/${spaceId}/packages/${editingPackageId}`, updateData);
      console.log('✅ API response:', response.data);
      
      // Update local formData to reflect changes
      const updatedPackages = formData.packages.map(pkg => 
        pkg.id === editingPackageId 
          ? { ...pkg, ...packageData, images: packageImages, amenities: selectedPackageAmenities }
          : pkg
      );
      
      setFormData({ ...formData, packages: updatedPackages });
      setSubmitStatus({
        type: 'success',
        message: `Package updated successfully!`
      });
      
      cancelEditingPackage();
    } catch (error) {
      console.error('❌ Error updating package:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to update package'
      });
    } finally {
      console.log('🔄 Setting section loading to false');
      setSectionLoading(false);
    }
  };

  const saveHours = async () => {
    try {
      setSectionLoading(true);
      
      // Prepare the hours update data
      const updateData = {
        is_24_7: formData.is_24_7,
        timezone: formData.timezone || 'Asia/Karachi',
        weekly_schedule: formData.is_24_7 ? null : formData.weeklySchedule
      };
      
      // Call the backend endpoint
      await coworkingApi.put(`/coworking/spaces/${spaceId}/hours`, updateData);
      
      setSubmitStatus({
        type: 'success',
        message: 'Operating hours updated successfully!'
      });
      
      // Exit edit mode
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating operating hours:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to update operating hours'
      });
    } finally {
      setSectionLoading(false);
    }
  };

  const handlePackageImageDelete = (imageIndex) => {
    const updatedImages = packageImages.filter((_, index) => index !== imageIndex);
    setPackageImages(updatedImages);
  };

  const handlePackageImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setImageUploadLoading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('package_id', editingPackageId);
        formData.append('is_primary', 'false');
        
        const response = await coworkingApi.post(`/coworking/spaces/${spaceId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        return response.data;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      // Add uploaded images to packageImages state
      const newImages = uploadedImages.map(img => ({
        image_url: img.image_url || img.url,
        image_name: img.image_name || img.filename || 'Uploaded Image',
        image_description: img.image_description || '',
        is_primary: false
      }));
      
      setPackageImages([...packageImages, ...newImages]);
      
      setSubmitStatus({
        type: 'success',
        message: `${uploadedImages.length} image(s) uploaded successfully!`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to upload images'
      });
    } finally {
      setImageUploadLoading(false);
    }
  };

  const togglePackageAmenity = (amenity) => {
    if (selectedPackageAmenities.includes(amenity)) {
      setSelectedPackageAmenities(selectedPackageAmenities.filter(a => a !== amenity));
    } else {
      setSelectedPackageAmenities([...selectedPackageAmenities, amenity]);
    }
  };

  // Navigation functions
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Basic Information
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        break;
      case 1: // Packages
        if (formData.packages.length === 0) {
          newErrors.packages = 'At least one package is required';
        }
        break;
      case 3: // Operating Hours
        const hasOpenDay = Object.values(formData.weeklySchedule).some(day => day.isOpen);
        if (!hasOpenDay) {
          newErrors.schedule = 'At least one day must be open';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit function
  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    try {
      setLoading(true);
      setSubmitStatus({ type: '', message: '' });
      
      // Prepare opening hours string
      const openingHours = Object.entries(formData.weeklySchedule)
        .map(([day, schedule]) => {
          if (schedule.isOpen) {
            return `${day}: ${schedule.startTime} - ${schedule.endTime}`;
          } else {
            return `${day}: Closed`;
          }
        })
        .join(', ');

      // Prepare submission data
      const submissionData = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        price_per_hour: parseFloat(formData.price_per_hour),
        price_per_day: parseFloat(formData.price_per_day),
        price_per_week: parseFloat(formData.price_per_week),
        price_per_month: parseFloat(formData.price_per_month),
        opening_hours: openingHours,
        amenities: JSON.stringify(formData.amenities),
        packages: JSON.stringify(formData.packages)
      };

      // Updating space with data
      
      // Update the space
      const response = await coworkingApi.put(`/coworking/spaces/${spaceId}`, submissionData);
      
      // Space updated successfully
      
      setSubmitStatus({
        type: 'success',
        message: 'Coworking space updated successfully!'
      });

      // Navigate back to space details after a short delay
      setTimeout(() => {
        navigate(`/coworking/spaces/${spaceId}/details`);
      }, 2000);

    } catch (error) {
      console.error('❌ Error updating space:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to update space. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };



  // Show loading screen while fetching data
  if (initialLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={48} sx={{ color: '#1976D2' }} />
        <Typography variant="h6" sx={{ color: '#1976D2' }}>
          Loading space data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.maxWidth}>
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
            onClick={() => navigate(`/coworking/spaces/${spaceId}/details`)}
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
              Edit Coworking Space
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Update your workspace information, packages, and settings
            </Typography>
          </Box>
        </Box>

        {/* Section-Based Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information Section */}
          <Card sx={{ 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            width: '100%',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column'
          }}>
              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={styles.flexBetween}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Business sx={{ mr: 2, color: '#1976D2' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                      Basic Information
                    </Typography>
                  </Box>
                  <Button
                    variant={editingSection === 'basic' ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => setEditingSection(editingSection === 'basic' ? null : 'basic')}
                    sx={{
                      ml: 'auto',
                      color: editingSection === 'basic' ? 'white' : '#1976D2',
                      borderColor: '#1976D2',
                      backgroundColor: editingSection === 'basic' ? '#1976D2' : 'transparent',
                      '&:hover': {
                        backgroundColor: editingSection === 'basic' ? '#1565C0' : 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    {editingSection === 'basic' ? 'Cancel' : 'Edit'}
                  </Button>
                </Box>

                {editingSection === 'basic' ? (
                  // Edit Mode
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Space Title"
                          value={formData.title || ''}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          sx={{
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
                      
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Full Address"
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          sx={{
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
                      
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="City"
                          value={formData.city || ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          sx={{
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
                      
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="State/Province"
                          value={formData.state || ''}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          sx={{
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
                      
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Zip/Postal Code"
                          value={formData.zip_code || ''}
                          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          sx={{
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
                      
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Country"
                          value={formData.country || ''}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          sx={{
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
                          label="Description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          variant="outlined"
                          multiline
                          rows={4}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
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
                    </Grid>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingSection(null)}
                        sx={{ color: '#1976D2', borderColor: '#1976D2' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={saveBasicInfo}
                        disabled={sectionLoading}
                        sx={{
                          backgroundColor: '#1976D2',
                          '&:hover': { backgroundColor: '#1565C0' }
                        }}
                      >
                        {sectionLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Title:</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>{formData.title}</Typography>
                    
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Address:</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                      {formData.address}, {formData.city}, {formData.state} {formData.zip_code}, {formData.country}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>Description:</Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>{formData.description}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

          {/* Packages Section */}
          <Card sx={{ 
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)' },
            width: '100%',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column'
          }}>
              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocalOffer sx={{ mr: 2, color: '#1976D2' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                    Packages, Images & Amenities
                  </Typography>
                </Box>

                {editingSection === 'packages' ? (
                  // Edit Mode - Comprehensive Package, Images & Amenities Management
                  <Box>
                    {/* Package Management */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', display: 'flex', alignItems: 'center' }}>
                        <LocalOffer sx={{ mr: 1 }} /> Packages
                      </Typography>
                      {formData.packages && formData.packages.length > 0 ? (
                        <Grid container spacing={2}>
                          {formData.packages.map((pkg, index) => (
                            <Grid item xs={12} md={6} key={pkg.id || index}>
                              <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                <Typography variant="h6" sx={{ color: '#1976D2', mb: 1 }}>{pkg.name}</Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>{pkg.description}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {pkg.price_per_hour && <Chip label={`$${pkg.price_per_hour}/hr`} size="small" />}
                                  {pkg.price_per_day && <Chip label={`$${pkg.price_per_day}/day`} size="small" />}
                                  {pkg.price_per_week && <Chip label={`$${pkg.price_per_week}/wk`} size="small" />}
                                  {pkg.price_per_month && <Chip label={`$${pkg.price_per_month}/mo`} size="small" />}
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#666' }}>No packages configured</Typography>
                      )}
                    </Box>

                    {/* Images Management */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', display: 'flex', alignItems: 'center' }}>
                        <CloudUpload sx={{ mr: 1 }} /> Images
                      </Typography>
                      <Box sx={{ 
                        border: '2px dashed #1976D2', 
                        borderRadius: '8px', 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: '#f8f9ff',
                        mb: 3
                      }}>
                        <CloudUpload sx={{ fontSize: 48, color: '#1976D2', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1, color: '#1976D2' }}>
                          Upload Images
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                          Drag and drop images here or click to browse
                        </Typography>
                        <Button variant="contained" sx={{ backgroundColor: '#1976D2' }}>
                          Choose Files
                        </Button>
                      </Box>

                      {/* Current Images Display */}
                      {formData.images && formData.images.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Current Images ({formData.images.length})
                          </Typography>
                          <Grid container spacing={2}>
                            {formData.images.map((image, index) => (
                              <Grid item xs={6} sm={4} md={3} key={index}>
                                <Box sx={{ position: 'relative' }}>
                                  <img
                                    src={(() => {
                                      // Use small thumbnail for space images in edit view
                                      const thumbnailUrl = image.thumbnail_small_url || image.thumbnail_medium_url || image.thumbnail_url || image.image_url || image.url || image;
                                      return thumbnailUrl && thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8001${thumbnailUrl}`;
                                    })()}
                                    alt={`Space image ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '120px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      border: '1px solid #e0e0e0'
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                                    }}
                                  >
                                    <Delete sx={{ fontSize: 16, color: '#d32f2f' }} />
                                  </IconButton>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Box>

                    {/* Amenities Management */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ mr: 1 }} /> Amenities
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Grid container spacing={1}>
                          {amenitiesLoading ? (
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                                Loading amenities...
                              </Typography>
                            </Grid>
                          ) : (
                            availableAmenities.map((amenity) => {
                            const isSelected = formData.amenities.includes(amenity);
                            return (
                              <Grid item xs={12} sm={6} md={4} key={amenity}>
                                <Chip
                                  label={amenity}
                                  clickable
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      amenities: isSelected 
                                        ? prev.amenities.filter(a => a !== amenity)
                                        : [...prev.amenities, amenity]
                                    }));
                                  }}
                                  sx={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    backgroundColor: isSelected ? '#1976D2' : '#f5f5f5',
                                    color: isSelected ? 'white' : '#333',
                                    border: isSelected ? '1px solid #1976D2' : '1px solid #e0e0e0',
                                    '&:hover': {
                                      backgroundColor: isSelected ? '#1565C0' : '#e3f2fd'
                                    }
                                  }}
                                />
                              </Grid>
                            );
                          })
                          )}
                        </Grid>
                      </Box>

                      {/* Custom Amenity Input */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                          Add Custom Amenity
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            size="small"
                            placeholder="Enter custom amenity"
                            value={customAmenity || ''}
                            onChange={(e) => setCustomAmenity(e.target.value)}
                            sx={{ flexGrow: 1 }}
                          />
                          <Button
                            variant="outlined"
                            onClick={() => {
                              if (customAmenity && !formData.amenities.includes(customAmenity)) {
                                setFormData(prev => ({
                                  ...prev,
                                  amenities: [...prev.amenities, customAmenity]
                                }));
                                setCustomAmenity('');
                              }
                            }}
                            sx={{ color: '#1976D2', borderColor: '#1976D2' }}
                          >
                            Add
                          </Button>
                        </Box>
                      </Box>

                      {/* Selected Amenities Preview */}
                      {formData.amenities.length > 0 && (
                        <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                            Selected Amenities ({formData.amenities.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.amenities.map((amenity, index) => (
                              <Chip
                                key={index}
                                label={amenity}
                                onDelete={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    amenities: prev.amenities.filter((_, i) => i !== index)
                                  }));
                                }}
                                sx={{
                                  backgroundColor: '#1976D2',
                                  color: 'white',
                                  '& .MuiChip-deleteIcon': { color: 'white' }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* Save/Cancel Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={() => {/* Save all changes */}}
                        disabled={sectionLoading}
                        sx={{ backgroundColor: '#1976D2' }}
                      >
                        {sectionLoading ? 'Saving...' : 'Save All Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingSection(null)}
                        sx={{ color: '#1976D2', borderColor: '#1976D2' }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Display Mode - Show Packages, Images & Amenities Summary
                  <Box>
                    {/* Packages Summary */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#1976D2' }}>
                        Packages ({formData.packages?.length || 0})
                      </Typography>
                      {formData.packages && formData.packages.length > 0 ? (
                        <Grid container spacing={2} sx={{ width: '100%' }}>
                          {formData.packages.map((pkg, index) => {
                            const isEditing = editingPackageId === pkg.id;

                            return (
                              <Grid item xs={12} key={pkg.id || index} sx={{ width: '100%' }}>
                                <Paper sx={{ p: 3, border: '1px solid #e0e0e0', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                                  {isEditing ? (
                                    // Edit Mode
                                    <Box>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6" sx={{ color: '#1976D2' }}>
                                          Edit Package: {pkg.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Button
                                            variant="contained"
                                            onClick={() => savePackageChanges({
                                              ...editData,
                                              images: packageImages,
                                              amenities: selectedPackageAmenities
                                            })}
                                            disabled={sectionLoading}
                                            sx={{ 
                                              backgroundColor: '#1976D2',
                                              '&:hover': { backgroundColor: '#1565C0' }
                                            }}
                                          >
                                            Save Changes
                                          </Button>
                                          <Button
                                            variant="outlined"
                                            onClick={cancelEditingPackage}
                                            sx={{ 
                                              color: '#1976D2',
                                              borderColor: '#1976D2'
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </Box>
                                      </Box>

                                      <Grid container spacing={2}>
                                        {/* Package Info */}
                                        <Grid item xs={12}>
                                          <TextField
                                            fullWidth
                                            label="Package Name"
                                            value={editData.name}
                                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                                            sx={{ mb: 2 }}
                                          />
                                        </Grid>

                                        {/* Pricing */}
                                        <Grid item xs={12} md={3}>
                                          <TextField
                                            fullWidth
                                            label="Price per Hour"
                                            type="number"
                                            value={editData.price_per_hour}
                                            onChange={(e) => setEditData({...editData, price_per_hour: e.target.value})}
                                            InputProps={{
                                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                          <TextField
                                            fullWidth
                                            label="Price per Day"
                                            type="number"
                                            value={editData.price_per_day}
                                            onChange={(e) => setEditData({...editData, price_per_day: e.target.value})}
                                            InputProps={{
                                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                          <TextField
                                            fullWidth
                                            label="Price per Week"
                                            type="number"
                                            value={editData.price_per_week}
                                            onChange={(e) => setEditData({...editData, price_per_week: e.target.value})}
                                            InputProps={{
                                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                          <TextField
                                            fullWidth
                                            label="Price per Month"
                                            type="number"
                                            value={editData.price_per_month}
                                            onChange={(e) => setEditData({...editData, price_per_month: e.target.value})}
                                            InputProps={{
                                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                                            }}
                                          />
                                        </Grid>

                                        {/* Package Type - After Price per Month */}
                                        <Grid item xs={12}>
                                          <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Package Type</InputLabel>
                                            <Select
                                              value={editData.type}
                                              label="Package Type"
                                              onChange={(e) => setEditData({...editData, type: e.target.value})}
                                            >
                                              <MenuItem value="Hot Desk">Hot Desk</MenuItem>
                                              <MenuItem value="Dedicated Desk">Dedicated Desk</MenuItem>
                                              <MenuItem value="Private Office">Private Office</MenuItem>
                                              <MenuItem value="Meeting Room">Meeting Room</MenuItem>
                                              <MenuItem value="Event Space">Event Space</MenuItem>
                                            </Select>
                                          </FormControl>
                                        </Grid>

                                        {/* Images Management */}
                                        <Grid item xs={12}>
                                          <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2' }}>
                                            Package Images
                                          </Typography>
                                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                            {packageImages.map((image, imgIndex) => (
                                              <Box key={imgIndex} sx={{ position: 'relative' }}>
                                                <img
                                                  src={(() => {
                                                    // Use small thumbnail for edit view, fallback to medium, then original
                                                    const thumbnailUrl = image.thumbnail_small_url || image.thumbnail_medium_url || image.thumbnail_url || image.image_url || image.url || image;
                                                    return thumbnailUrl && thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8001${thumbnailUrl}`;
                                                  })()}
                                                  alt={`Package image ${imgIndex + 1}`}
                                                  style={{
                                                    width: '100px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e0e0e0'
                                                  }}
                                                />
                                                <IconButton
                                                  size="small"
                                                  onClick={() => handlePackageImageDelete(imgIndex)}
                                                  sx={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    backgroundColor: '#d32f2f',
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: '#b71c1c' }
                                                  }}
                                                >
                                                  <Delete sx={{ fontSize: 16 }} />
                                                </IconButton>
                                              </Box>
                                            ))}
                                          </Box>
                                          <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handlePackageImageUpload}
                                            style={{ display: 'none' }}
                                            id={`package-image-upload-${pkg.id}`}
                                          />
                                          <label htmlFor={`package-image-upload-${pkg.id}`}>
                                            <Button
                                              variant="outlined"
                                              component="span"
                                              startIcon={<CloudUpload />}
                                              sx={{ color: '#1976D2', borderColor: '#1976D2' }}
                                            >
                                              Upload Images
                                            </Button>
                                          </label>
                                        </Grid>

                                        {/* Amenities Selection */}
                                        <Grid item xs={12}>
                                          <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2' }}>
                                            Package Amenities ({selectedPackageAmenities.length} selected)
                                          </Typography>
                                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {amenitiesLoading ? (
                                              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                                                Loading amenities...
                                              </Typography>
                                            ) : (
                                              availableAmenities.map((amenity) => {
                                              const isSelected = selectedPackageAmenities.includes(amenity);
                                              return (
                                                <Chip
                                                  key={amenity}
                                                  label={amenity}
                                                  clickable
                                                  onClick={() => togglePackageAmenity(amenity)}
                                                  sx={{
                                                    backgroundColor: isSelected ? '#1976D2' : '#f5f5f5',
                                                    color: isSelected ? 'white' : '#333',
                                                    border: isSelected ? '1px solid #1976D2' : '1px solid #e0e0e0',
                                                    '&:hover': {
                                                      backgroundColor: isSelected ? '#1565C0' : '#e3f2fd'
                                                    }
                                                  }}
                                                />
                                              );
                                            })
                                          )}
                                          </Box>
                                        </Grid>

                                        {/* Description */}
                                        <Grid item xs={12}>
                                          <TextField
                                            fullWidth
                                            label="Description"
                                            multiline
                                            rows={3}
                                            value={editData.description}
                                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                                            sx={{ mb: 2 }}
                                          />
                                        </Grid>
                                      </Grid>
                                    </Box>
                                  ) : (
                                    // Display Mode
                                    <Box>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="h6" sx={{ color: '#1976D2', mb: 1 }}>{pkg.name}</Typography>
                                          {pkg.type && (
                                            <Chip 
                                              label={pkg.type} 
                                              size="small" 
                                              sx={{ 
                                                backgroundColor: '#e3f2fd', 
                                                color: '#1976D2',
                                                mb: 1
                                              }} 
                                            />
                                          )}
                                        </Box>
                                        <Button
                                          variant="outlined"
                                          startIcon={<Edit />}
                                          onClick={() => startEditingPackage(pkg)}
                                          sx={{ 
                                            color: '#1976D2',
                                            borderColor: '#1976D2',
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            px: 2,
                                            py: 0.5,
                                            minWidth: 'auto',
                                            '&:hover': { 
                                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                              borderColor: '#1976D2',
                                              transform: 'translateY(-1px)'
                                            },
                                            transition: 'all 0.2s ease'
                                          }}
                                          size="small"
                                        >
                                          Edit
                                        </Button>
                                      </Box>
                                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>{pkg.description}</Typography>
                                      
                                      {/* Pricing */}
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {pkg.price_per_hour && <Chip label={`$${pkg.price_per_hour}/hr`} size="small" />}
                                        {pkg.price_per_day && <Chip label={`$${pkg.price_per_day}/day`} size="small" />}
                                        {pkg.price_per_week && <Chip label={`$${pkg.price_per_week}/wk`} size="small" />}
                                        {pkg.price_per_month && <Chip label={`$${pkg.price_per_month}/mo`} size="small" />}
                                      </Box>

                                      {/* Package Images */}
                                      {pkg.images && pkg.images.length > 0 ? (
                                        <Box sx={{ mb: 2 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>Images ({pkg.images.length}):</Typography>
                                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {pkg.images.map((image, imgIndex) => {
                                              const imageUrl = image.image_url || image.url || image;
                                              return (
                                                <Box
                                                  key={imgIndex}
                                                  sx={{
                                                    width: '100px',
                                                    height: '70px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e0e0e0',
                                                    backgroundColor: '#f5f5f5',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                    '&:hover': {
                                                      transform: 'scale(1.05)',
                                                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                                                    }
                                                  }}
                                                >
                                                  <img
                                                     src={(() => {
                                                       // Use thumbnail for better performance in display mode
                                                       const thumbnailUrl = image.thumbnail_small_url || image.thumbnail_url || imageUrl;
                                                       return thumbnailUrl && thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8001${thumbnailUrl}`;
                                                     })()}
                                                     alt={`${pkg.name} image ${imgIndex + 1}`}
                                                     style={{
                                                       width: '100%',
                                                       height: '100%',
                                                       objectFit: 'cover'
                                                     }}
                                                   />
                                                </Box>
                                              );
                                            })}
                                          </Box>
                                        </Box>
                                      ) : (
                                        <Box sx={{ mb: 2 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>Images:</Typography>
                                          <Typography variant="caption" sx={{ color: '#999' }}>No images available</Typography>
                                        </Box>
                                      )}

                                      {/* Package Amenities */}
                                      {(() => {
                                        // Safely convert amenities to array
                                        let amenitiesArray = [];
                                        if (pkg.amenities) {
                                          if (Array.isArray(pkg.amenities)) {
                                            amenitiesArray = pkg.amenities;
                                          } else if (typeof pkg.amenities === 'string') {
                                            try {
                                              amenitiesArray = JSON.parse(pkg.amenities);
                                            } catch (e) {
                                              amenitiesArray = pkg.amenities.split(',').map(a => a.trim());
                                            }
                                          }
                                        }
                                        
                                        return amenitiesArray && amenitiesArray.length > 0 ? (
                                          <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>Amenities ({amenitiesArray.length}):</Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                              {amenitiesArray.map((amenity, amenityIndex) => (
                                                <Chip 
                                                  key={amenityIndex}
                                                  label={amenity}
                                                  size="small"
                                                  variant="outlined"
                                                  sx={{ 
                                                    fontSize: '0.75rem',
                                                    height: '26px',
                                                    borderColor: '#1976D2',
                                                    color: '#1976D2',
                                                    '&:hover': {
                                                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                      borderColor: '#1565C0'
                                                    }
                                                  }}
                                                />
                                              ))}
                                            </Box>
                                          </Box>
                                        ) : (
                                          <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>Amenities:</Typography>
                                            <Typography variant="caption" sx={{ color: '#999' }}>No amenities listed</Typography>
                                          </Box>
                                        );
                                      })()}
                                    </Box>
                                  )}
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#666' }}>No packages configured</Typography>
                      )}
                    </Box>



                  </Box>
                )}
              </CardContent>
            </Card>

          {/* Operating Hours Section */}
          <Card sx={{ 
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)' },
            width: '100%',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column'
          }}>
          <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1976D2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime />
                Operating Hours
              </Typography>
              {editingSection === 'hours' ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={saveHours}
                    disabled={sectionLoading}
                    sx={{ backgroundColor: '#1976D2' }}
                  >
                    {sectionLoading ? 'Saving...' : 'Save Hours'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setEditingSection(null)}
                    sx={{ color: '#1976D2', borderColor: '#1976D2' }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => setEditingSection('hours')}
                  sx={{
                    color: '#1976D2',
                    borderColor: '#1976D2',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>

            {editingSection === 'hours' ? (
              // Edit Mode - Schedule Management
              <Box>
                {/* 24/7 Toggle */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_24_7}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_24_7: e.target.checked }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#1976D2' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1976D2' }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976D2' }}>
                          24/7 Operation
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Enable if your space operates 24 hours a day, 7 days a week
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Weekly Schedule */}
                {!formData.is_24_7 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                      Weekly Schedule
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(formData.weeklySchedule).map(([day, schedule]) => (
                        <Grid item xs={12} key={day}>
                          <Card sx={{ p: 2, backgroundColor: '#fafafa', border: '1px solid #e0e0e0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle2" sx={{ minWidth: '100px', fontWeight: 600, color: '#1976D2' }}>
                                {day}
                              </Typography>
                              
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={schedule.isOpen}
                                    onChange={(e) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        weeklySchedule: {
                                          ...prev.weeklySchedule,
                                          [day]: { ...schedule, isOpen: e.target.checked }
                                        }
                                      }));
                                    }}
                                    size="small"
                                    sx={{
                                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#1976D2' },
                                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1976D2' }
                                    }}
                                  />
                                }
                                label="Open"
                              />

                              {schedule.isOpen && (
                                <>
                                  <TextField
                                    type="time"
                                    label="Start Time"
                                    value={schedule.startTime}
                                    onChange={(e) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        weeklySchedule: {
                                          ...prev.weeklySchedule,
                                          [day]: { ...schedule, startTime: e.target.value }
                                        }
                                      }));
                                    }}
                                    size="small"
                                    sx={{ minWidth: '140px' }}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                  
                                  <TextField
                                    type="time"
                                    label="End Time"
                                    value={schedule.endTime}
                                    onChange={(e) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        weeklySchedule: {
                                          ...prev.weeklySchedule,
                                          [day]: { ...schedule, endTime: e.target.value }
                                        }
                                      }));
                                    }}
                                    size="small"
                                    sx={{ minWidth: '140px' }}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </>
                              )}

                              {!schedule.isOpen && (
                                <Typography variant="body2" sx={{ color: '#d32f2f', fontStyle: 'italic' }}>
                                  Closed
                                </Typography>
                              )}
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Timezone Selection */}
                <Box sx={{ mt: 3 }}>
                  <TextField
                    select
                    label="Timezone"
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    fullWidth
                    size="small"
                    sx={{ maxWidth: '300px' }}
                  >
                    <MenuItem value="Asia/Karachi">Asia/Karachi (PKT)</MenuItem>
                    <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                    <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                    <MenuItem value="Asia/Dubai">Asia/Dubai (GST)</MenuItem>
                    <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
                  </TextField>
                </Box>


              </Box>
            ) : (
              // Display Mode - Show Current Schedule
              <Box>
                {formData.is_24_7 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="24/7 Open" 
                      sx={{ backgroundColor: '#4caf50', color: 'white', fontWeight: 600 }} 
                    />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Always open
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Weekdays */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontSize: '0.875rem' }}>
                        Weekdays
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {WEEKDAYS.map((day) => {
                          const schedule = formData.weeklySchedule[day];
                          return (
                            <Chip
                              key={day}
                              label={`${day}: ${schedule.isOpen ? `${schedule.startTime} - ${schedule.endTime}` : 'Closed'}`}
                              sx={{
                                backgroundColor: schedule.isOpen ? '#e3f2fd' : '#fafafa',
                                color: schedule.isOpen ? '#1976D2' : '#d32f2f',
                                fontWeight: 500,
                                border: '1px solid #e0e0e0'
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>

                    {/* Weekends */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontSize: '0.875rem' }}>
                        Weekends
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {WEEKENDS.map((day) => {
                          const schedule = formData.weeklySchedule[day];
                          return (
                            <Chip
                              key={day}
                              label={`${day}: ${schedule.isOpen ? `${schedule.startTime} - ${schedule.endTime}` : 'Closed'}`}
                              sx={{
                                backgroundColor: schedule.isOpen ? '#e3f2fd' : '#fafafa',
                                color: schedule.isOpen ? '#1976D2' : '#d32f2f',
                                fontWeight: 500,
                                border: '1px solid #e0e0e0'
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
                      Timezone: {formData.timezone}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
        </Box>

        {/* Success/Error Messages */}
        {submitStatus.type && (
          <Alert 
            severity={submitStatus.type} 
            sx={{ 
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300
            }}
            onClose={() => setSubmitStatus({ type: null, message: '' })}
          >
            {typeof submitStatus.message === 'string' 
              ? submitStatus.message 
              : Array.isArray(submitStatus.message) 
                ? submitStatus.message.map(err => err.msg || err).join(', ')
                : JSON.stringify(submitStatus.message)
            }
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default memo(EditCoworkingSpace);
