import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  ArrowBack, 
  LocationOn, 
  Edit, 
  Delete, 
  AccessTime,
  Star,
  CheckCircle,
  Schedule,
  People,
  Business as BusinessIcon,
  Description,
  Wifi,
  LocalParking as Parking,
  Coffee,
  MeetingRoom,
  Print as Printer,
  Kitchen,
  Close,
  ArrowBackIos,
  ArrowForwardIos
} from '@mui/icons-material';
import { coworkingApi } from '../../services/coworking';

export default function ViewCoworkingSpaceDetails() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [spaceData, setSpaceData] = useState(null);
  const [spaceImages, setSpaceImages] = useState({
    general_images: [],
    packages: [],
    total_images: 0
  });
  const [imagesLoading, setImagesLoading] = useState(false);

  // Extract space and packages from spaceData
  const space = spaceData || {};
  const packages = spaceData?.packages || [];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'coworking') {
      navigate('/coworking/login');
      return;
    }

    fetchSpaceDetails();
  }, [spaceId, navigate]);

  const fetchSpaceDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetching space details
      const response = await coworkingApi.get(`/coworking/spaces/${spaceId}`);
      console.log('🏢 Space Details Response:', response.data);
      console.log('📦 Packages in Space Data:', response.data.packages);
      // Space data loaded successfully (includes images in packages)
      setSpaceData(response.data);
    } catch (err) {
      console.error('❌ Error fetching space details:', err);
      console.error('📊 Error response:', err.response?.data);
      console.error('🔢 Error status:', err.response?.status);
      console.error('📝 Error message:', err.message);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Authentication error, redirecting to login
        navigate('/coworking/login');
      } else if (err.response?.status === 404) {
        setError('Coworking space not found.');
      } else {
        setError('Failed to load space details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSpaceImages = async () => {
    if (!spaceId) return;
    
    setImagesLoading(true);
    try {
      // 🌐 PORT ARCHITECTURE: Fetch images from coworking backend (port 8001)
      // ⚠️  CRITICAL: This MUST use port 8001 (coworking backend) for image data
      // Port 8000 = Employer Backend | Port 8001 = Coworking Backend
      console.log('🔄 Fetching images from:', `/coworking/spaces/${spaceId}/images`);
      const response = await coworkingApi.get(`/coworking/spaces/${spaceId}/images`);
      console.log('🖼️ Images API Response:', response.data);
      setSpaceImages({
        general_images: response.data.general_images || [],
        packages: response.data.packages || [],
        total_images: response.data.total_images || 0
      });
    } catch (error) {
      console.error('Error fetching space images:', error);
      setSpaceImages({
        general_images: [],
        packages: [],
        total_images: 0
      });
    } finally {
      setImagesLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this coworking space?')) {
      try {
        await coworkingApi.delete(`/coworking/spaces/${spaceId}`);
        navigate('/coworking/spaces');
      } catch (error) {
        console.error('Error deleting space:', error);
        alert('Failed to delete space. Please try again.');
      }
    }
  };

  const openImageModal = (images, startIndex = 0) => {
    setModalImages(images);
    setCurrentImageIndex(startIndex);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setModalImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev < modalImages.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : modalImages.length - 1
    );
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi />;
    if (amenityLower.includes('parking')) return <Parking />;
    if (amenityLower.includes('coffee') || amenityLower.includes('kitchen')) return <Coffee />;
    if (amenityLower.includes('meeting') || amenityLower.includes('conference')) return <MeetingRoom />;
    if (amenityLower.includes('print')) return <Printer />;
    return <BusinessIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: '#1976D2' }} />
        <Typography variant="h6" sx={{ color: '#1976D2', fontWeight: 600 }}>
          Loading space details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3, py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: '12px',
            '& .MuiAlert-icon': { color: '#1976D2' }
          }}
        >
          {error}
        </Alert>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/coworking/dashboard')}
            sx={{
              background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3, py: 4 }}>
      {/* Header Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
        borderRadius: '20px',
        p: 4,
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '120px',
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)'
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton
              onClick={() => navigate('/coworking/dashboard')}
              sx={{ 
                color: 'white', 
                mr: 2,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {space.title || 'Coworking Space Details'}
                </Typography>
                
                {/* Status Badge */}
                <Box sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: '20px',
                  backgroundColor: space.is_verified ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  {space.is_verified ? (
                    <CheckCircle sx={{ fontSize: '16px', color: 'white' }} />
                  ) : (
                    <Schedule sx={{ fontSize: '16px', color: 'white' }} />
                  )}
                  <Typography variant="body2" sx={{ 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}>
                    {space.is_verified ? 'Verified' : 'Pending'}
                  </Typography>
                </Box>
              </Box>
              
              {/* Address aligned with title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: '20px', color: 'white', opacity: 0.9 }} />
                <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
                  {(() => {
                    const addressParts = [];
                    if (space.address) addressParts.push(space.address);
                    if (space.city) addressParts.push(space.city);
                    if (space.state) addressParts.push(space.state);
                    if (space.zip_code) addressParts.push(space.zip_code);
                    if (space.country) addressParts.push(space.country);
                    return addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided';
                  })()}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => navigate(`/coworking/spaces/${spaceId}/edit`)}
                sx={{ 
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <Edit />
              </IconButton>

            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column - Main Details */}
        <Grid item xs={12} lg={8}>
          {/* Description Card */}
          <Card sx={{
            borderRadius: '20px',
            mb: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(25, 118, 210, 0.1)',
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Description sx={{ color: '#1976D2', mr: 2, fontSize: '28px' }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  color: '#1976D2'
                }}>
                  About This Space
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ 
                color: '#333',
                lineHeight: 1.6,
                mb: 3,
                fontSize: '16px'
              }}>
                {space.description || 'No description provided for this coworking space.'}
              </Typography>

              {/* Operating Hours */}
              {space.opening_hours && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ color: '#1976D2', mr: 1.5, fontSize: '20px' }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      color: '#1976D2'
                    }}>
                      Operating Hours
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    borderRadius: '12px',
                    p: 2.5,
                    border: '1px solid rgba(25, 118, 210, 0.1)'
                  }}>
                    {(() => {
                      try {
                        // Parse opening hours - handle both JSON string and object formats
                        let hoursData;
                        if (typeof space.opening_hours === 'string') {
                          // Try to parse as JSON first
                          try {
                            hoursData = JSON.parse(space.opening_hours);
                          } catch {
                            // If JSON parsing fails, treat as comma-separated string
                            return space.opening_hours.split(', ').map((dayHours, index) => {
                              const [day, hours] = dayHours.split(': ');
                              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
                              const isClosed = hours === 'Closed';
                              
                              return (
                                <Box key={index} sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  py: 0.5,
                                  px: 1,
                                  borderRadius: '6px',
                                  backgroundColor: isToday ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                                  border: isToday ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid transparent'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: isToday ? 600 : 500,
                                    color: isToday ? '#1976D2' : '#333',
                                    fontSize: '14px'
                                  }}>
                                    {day}
                                    {isToday && (
                                      <Chip 
                                        label="Today" 
                                        size="small" 
                                        sx={{ 
                                          ml: 1, 
                                          height: '20px',
                                          backgroundColor: '#1976D2',
                                          color: 'white',
                                          fontSize: '11px',
                                          fontWeight: 600
                                        }} 
                                      />
                                    )}
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 500,
                                    color: isClosed ? '#f44336' : '#333',
                                    fontSize: '14px'
                                  }}>
                                    {hours}
                                  </Typography>
                                </Box>
                              );
                            });
                          }
                        } else {
                          hoursData = space.opening_hours;
                        }

                        // Handle JSON format: {"Monday": {"isOpen": true, "startTime": "00:00", "endTime": "23:59"}}
                        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                        
                        return days.map((day, index) => {
                          const dayData = hoursData[day];
                          if (!dayData) return null;
                          
                          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
                          const isClosed = !dayData.isOpen;
                          
                          // Format time display
                          let timeDisplay = 'Closed';
                          if (dayData.isOpen && dayData.startTime && dayData.endTime) {
                            // Convert 24-hour format to 12-hour format
                            const formatTime = (time) => {
                              if (time === '00:00') return '12:00 AM';
                              if (time === '23:59') return '11:59 PM';
                              
                              const [hours, minutes] = time.split(':');
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                              return `${displayHour}:${minutes} ${ampm}`;
                            };
                            
                            // Check if it's 24/7
                            if (dayData.startTime === '00:00' && dayData.endTime === '23:59') {
                              timeDisplay = '24 Hours';
                            } else {
                              timeDisplay = `${formatTime(dayData.startTime)} - ${formatTime(dayData.endTime)}`;
                            }
                          }
                          
                          return (
                            <Box key={index} sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              py: 0.5,
                              px: 1,
                              borderRadius: '6px',
                              backgroundColor: isToday ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                              border: isToday ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid transparent'
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: isToday ? 600 : 500,
                                color: isToday ? '#1976D2' : '#333',
                                fontSize: '14px'
                              }}>
                                {day}
                                {isToday && (
                                  <Chip 
                                    label="Today" 
                                    size="small" 
                                    sx={{ 
                                      ml: 1, 
                                      height: '20px',
                                      backgroundColor: '#1976D2',
                                      color: 'white',
                                      fontSize: '11px',
                                      fontWeight: 600
                                    }} 
                                  />
                                )}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 500,
                                color: isClosed ? '#f44336' : (timeDisplay === '24 Hours' ? '#4caf50' : '#333'),
                                fontSize: '14px'
                              }}>
                                {timeDisplay}
                              </Typography>
                            </Box>
                          );
                        });
                      } catch (error) {
                        console.error('Error parsing opening hours:', error);
                        return (
                          <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                            Opening hours information unavailable
                          </Typography>
                        );
                      }
                    })()}
                  </Box>
                </Box>
              )}

            </CardContent>
          </Card>

          {/* Pricing Packages */}
          {packages && packages.length > 0 && (
            <Card sx={{
              borderRadius: '20px',
              mb: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: '#1976D2' 
                    }} />
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      color: '#1976D2'
                    }}>
                      Packages, Images & Amenities
                    </Typography>
                  </Box>
                  {/* No global edit button - each package has its own edit button */}
                </Box>
                
                <Tabs
                  value={selectedTab}
                  onChange={(e, newValue) => setSelectedTab(newValue)}
                  sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                      color: '#666',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&.Mui-selected': {
                        color: '#1976D2'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#1976D2'
                    }
                  }}
                >
                  {packages.map((pkg, index) => (
                    <Tab key={index} label={pkg.name || `Package ${index + 1}`} />
                  ))}
                </Tabs>

                {packages[selectedTab] && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        color: '#1976D2'
                      }}>
                        {packages[selectedTab].name}
                      </Typography>
                      

                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        color: '#1976D2',
                        mb: 2
                      }}>
                        Pricing Options:
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ 
                            textAlign: 'center',
                            p: 2,
                            borderRadius: '8px',
                            backgroundColor: 'rgba(25, 118, 210, 0.05)',
                            border: '1px solid rgba(25, 118, 210, 0.1)'
                          }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: '#1976D2'
                            }}>
                              ${packages[selectedTab].price_per_hour || '0'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              per hour
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ 
                            textAlign: 'center',
                            p: 2,
                            borderRadius: '8px',
                            backgroundColor: 'rgba(25, 118, 210, 0.05)',
                            border: '1px solid rgba(25, 118, 210, 0.1)'
                          }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: '#1976D2'
                            }}>
                              ${packages[selectedTab].price_per_day || '0'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              per day
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ 
                            textAlign: 'center',
                            p: 2,
                            borderRadius: '8px',
                            backgroundColor: 'rgba(25, 118, 210, 0.05)',
                            border: '1px solid rgba(25, 118, 210, 0.1)'
                          }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: '#1976D2'
                            }}>
                              ${packages[selectedTab].price_per_week || '0'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              per week
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ 
                            textAlign: 'center',
                            p: 2,
                            borderRadius: '8px',
                            backgroundColor: 'rgba(25, 118, 210, 0.05)',
                            border: '1px solid rgba(25, 118, 210, 0.1)'
                          }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: '#1976D2'
                            }}>
                              ${packages[selectedTab].price_per_month || '0'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              per month
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Typography variant="body1" sx={{ 
                      color: '#333',
                      mb: 3,
                      lineHeight: 1.6
                    }}>
                      {packages[selectedTab].description || 'No description available'}
                    </Typography>

                    {/* Package Images Gallery */}
                    {(() => {
                      const currentPackage = packages[selectedTab];
                      // Try multiple matching strategies
                      let packageImages = [];
                      
                      // Images are already included in the space data from the space details endpoint
                      // No need to fetch separately - just use the images from the current package
                      if (currentPackage && currentPackage.images) {
                        packageImages = currentPackage.images;
                      }
                      
                      // No fallback needed - images are embedded in package data
                      
                      // Debug logging
                      console.log('🖼️ Image Debug Info:', {
                        currentPackage: currentPackage,
                        currentPackageId: currentPackage?.id,
                        selectedTab: selectedTab,
                        packageImages: packageImages,
                        packageImagesLength: packageImages.length,
                        hasCurrentPackage: !!currentPackage,
                        hasPackageImages: !!(currentPackage && currentPackage.images)
                      });
                      
                      // Show images section always, with loading state or placeholder
                      return (
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600,
                            color: '#1976D2',
                            mb: 2
                          }}>
                            Package Gallery:
                          </Typography>
                          
                          {packageImages.length > 0 ? (
                            
                            <Grid container spacing={2}>
                              {packageImages.map((image, idx) => (
                                <Grid item xs={12} sm={6} md={4} key={idx}>
                                  <Box sx={{
                                    position: 'relative',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                    }
                                  }}
                                  onClick={() => openImageModal(packageImages, idx)}
                                  >
                                    <img
                                      src={(() => {
                                        // Use thumbnail for better performance, fallback to original
                                        const thumbnailUrl = image.thumbnail_medium_url || image.thumbnail_url || image.image_url;
                                        return thumbnailUrl?.startsWith('http') ? thumbnailUrl : `http://localhost:8001${thumbnailUrl}`;
                                      })()}
                                      alt={image.image_name || `${currentPackage?.name} image ${idx + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        display: 'block'
                                      }}
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x200/1976D2/FFFFFF?text=Image+Not+Available';
                                      }}
                                    />
                                    
                                    {image.image_description && (
                                      <Box sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                        color: 'white',
                                        p: 2,
                                        pt: 4
                                      }}>
                                        <Typography variant="body2" sx={{ 
                                          fontWeight: 500,
                                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                        }}>
                                          {image.image_description}
                                        </Typography>
                                      </Box>
                                    )}
                                    
                                    {image.is_primary && (
                                      <Box sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(25, 118, 210, 0.9)',
                                        color: 'white',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 600
                                      }}>
                                        Primary
                                      </Box>
                                    )}
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Box sx={{ 
                              textAlign: 'center', 
                              py: 4, 
                              color: '#666',
                              backgroundColor: 'rgba(25, 118, 210, 0.05)',
                              borderRadius: '12px',
                              border: '2px dashed rgba(25, 118, 210, 0.2)'
                            }}>
                              <Typography variant="body1">
                                No images available for this package
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })()}

                    {/* Package Amenities */}
                    {(() => {
                      // Robust amenities handling - convert to array regardless of backend format
                      let amenitiesArray = [];
                      const pkg = packages[selectedTab];
                      if (pkg?.amenities) {
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
                      
                      return amenitiesArray.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600,
                            color: '#1976D2',
                            mb: 2
                          }}>
                            Included Amenities:
                          </Typography>
                          
                          <Grid container spacing={2}>
                            {amenitiesArray.map((amenity, idx) => (
                            <Grid item xs={6} sm={4} md={3} key={idx}>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 2,
                                borderRadius: '12px',
                                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                border: '1px solid rgba(25, 118, 210, 0.1)',
                                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                                }
                              }}>
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                  color: '#1976D2'
                                }}>
                                  {getAmenityIcon(amenity)}
                                </Box>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 500,
                                  color: '#333',
                                  fontSize: '14px'
                                }}>
                                  {amenity}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                         </Grid>
                       </Box>
                     );
                    })()}

                    {packages[selectedTab].features && (
                      <Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: '#1976D2',
                          mb: 2
                        }}>
                          Features Included:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {packages[selectedTab].features.map((feature, idx) => (
                            <Chip
                              key={idx}
                              label={feature}
                              sx={{
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                color: '#1976D2',
                                fontWeight: 600
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {space.amenities && space.amenities.length > 0 && (
            <Card sx={{
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  color: '#1976D2',
                  mb: 3
                }}>
                  Amenities
                </Typography>
                
                <Grid container spacing={2}>
                  {space.amenities.map((amenity, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(25, 118, 210, 0.05)',
                        border: '1px solid rgba(25, 118, 210, 0.1)'
                      }}>
                        {getAmenityIcon(amenity)}
                        <Typography variant="body1" sx={{ 
                          color: '#333',
                          fontWeight: 500
                        }}>
                          {amenity}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>


      </Grid>

      {/* Image Modal */}
      <Dialog
        open={imageModalOpen}
        onClose={closeImageModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'white',
          backgroundColor: 'transparent',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Package Gallery ({currentImageIndex + 1} of {modalImages.length})
          </Typography>
          <IconButton
            onClick={closeImageModal}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          minHeight: '500px',
          backgroundColor: 'transparent'
        }}>
          {modalImages.length > 0 && (
            <>
              {/* Main Image */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '100%',
                height: '500px'
              }}>
                <img
                  src={(() => {
                    const image = modalImages[currentImageIndex];
                    if (!image) return '';
                    // For modal view, use large thumbnail for better quality, fallback to medium, then original
                    const thumbnailUrl = image.thumbnail_url || image.thumbnail_medium_url || image.image_url;
                    return thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8001${thumbnailUrl}`;
                  })()}
                  alt={modalImages[currentImageIndex]?.image_name || 'Package Image'}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
              </Box>

              {/* Navigation Arrows */}
              {modalImages.length > 1 && (
                <>
                  <IconButton
                    onClick={prevImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  >
                    <ArrowBackIos />
                  </IconButton>
                  
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  >
                    <ArrowForwardIos />
                  </IconButton>
                </>
              )}

              {/* Image Description */}
              {modalImages[currentImageIndex]?.image_description && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                  p: 3,
                  pt: 6
                }}>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    {modalImages[currentImageIndex].image_description}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
