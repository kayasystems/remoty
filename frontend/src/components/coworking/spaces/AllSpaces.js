import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Business,
  VerifiedUser,
  Schedule,
  LocationOn,
  ArrowBack,
  CheckCircle,
  AttachMoney,
  Wifi,
  LocalCafe,
  LocalParking as Parking,
  Coffee,
  MeetingRoom,
  Print as Printer,
  Kitchen
} from '@mui/icons-material';
import { coworkingApi } from '../../../services/coworking';
import CoworkingTopBar from '../CoworkingTopBar';
import CoworkingSidebar from '../CoworkingSidebar';

export default function AllSpaces() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [expandedSpaces, setExpandedSpaces] = useState(new Set());
  const [selectedTabs, setSelectedTabs] = useState({});

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/coworking/login');
  };

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const response = await coworkingApi.get('/coworking/spaces');
      setSpaces(response.data.spaces || []);
      setError('');
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setError('Failed to load coworking spaces. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (!token || userRole !== 'coworking') {
      navigate('/coworking/login');
      return;
    }
    
    fetchSpaces();
  }, []); // Remove navigate dependency to prevent re-renders

  // Calculate stats from spaces data
  const stats = {
    totalSpaces: spaces.length,
    verifiedSpaces: spaces.filter(space => space.is_verified).length,
    pendingSpaces: spaces.filter(space => !space.is_verified).length
  };

  const handleMenuOpen = (event, space) => {
    setAnchorEl(event.currentTarget);
    setSelectedSpace(space);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSpace(null);
  };

  const handleAddNewSpace = () => {
    navigate('/coworking/spaces/add');
  };

  const handleViewSpace = (spaceId) => {
    navigate(`/coworking/spaces/${spaceId}/details`);
    handleMenuClose();
  };

  const handleEditSpace = (spaceId) => {
    navigate(`/coworking/spaces/${spaceId}/edit`);
    handleMenuClose();
  };

  const handleDeleteSpace = async (spaceId) => {
    if (window.confirm('Are you sure you want to delete this coworking space?')) {
      try {
        await coworkingApi.delete(`/coworking/spaces/${spaceId}`);
        fetchSpaces(); // Refresh the list
        handleMenuClose();
      } catch (error) {
        console.error('Error deleting space:', error);
        setError('Failed to delete space. Please try again.');
      }
    }
  };

  const formatPrice = (price) => {
    return (price !== null && price !== undefined) ? `$${price}` : 'N/A';
  };

  const getAmenitiesArray = (amenitiesData) => {
    if (!amenitiesData) return [];
    
    // If it's already an array, return it
    if (Array.isArray(amenitiesData)) {
      return amenitiesData.filter(a => a && a.trim && a.trim());
    }
    
    // If it's a string, split it
    if (typeof amenitiesData === 'string') {
      return amenitiesData.split(',').map(a => a.trim()).filter(a => a);
    }
    
    // If it's an object, try to extract values or return empty array
    if (typeof amenitiesData === 'object') {
      if (amenitiesData.amenities && Array.isArray(amenitiesData.amenities)) {
        return amenitiesData.amenities.filter(a => a && a.trim && a.trim());
      }
      // Try to get values from object
      const values = Object.values(amenitiesData);
      if (values.length > 0 && typeof values[0] === 'string') {
        return values.filter(a => a && a.trim && a.trim());
      }
    }
    
    return [];
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi sx={{ fontSize: 16 }} />;
    if (lower.includes('coffee')) return <Coffee sx={{ fontSize: 16 }} />;
    if (lower.includes('parking')) return <Parking sx={{ fontSize: 16 }} />;
    if (lower.includes('meeting')) return <MeetingRoom sx={{ fontSize: 16 }} />;
    if (lower.includes('printer') || lower.includes('print')) return <Printer sx={{ fontSize: 16 }} />;
    if (lower.includes('kitchen')) return <Kitchen sx={{ fontSize: 16 }} />;
    return null;
  };

  const toggleSpaceExpansion = (spaceId) => {
    setExpandedSpaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spaceId)) {
        newSet.delete(spaceId);
      } else {
        newSet.add(spaceId);
      }
      return newSet;
    });
  };

  const handleTabChange = (spaceId, newValue) => {
    setSelectedTabs(prev => ({
      ...prev,
      [spaceId]: newValue
    }));
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5'
    }}>
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
                  onClick={() => window.history.back()}
                >
                  <ArrowBack />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: '#fff' }}>
                    My Coworking Spaces
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Manage and monitor all your coworking spaces
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddNewSpace}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.5)'
                    },
                    borderRadius: '8px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Add New Space
                </Button>
              </Box>



              {/* Spaces Grid */}
            <Paper sx={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0'
            }}>
                <Box sx={{ p: 3, width: '100%', minWidth: '100%' }}>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Loading State */}
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 300 
              }}>
                <CircularProgress size={50} sx={{ color: '#1976D2' }} />
              </Box>
            ) : (
              <>
                {/* Stats Summary */}
                <Paper sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 4, 
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.12)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                  border: '1px solid rgba(25, 118, 210, 0.08)'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ 
                        textAlign: 'center',
                        p: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                        transition: 'transform 0.2s',
                        '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)' },
                        minWidth: 200
                      }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          backgroundColor: '#1976D2', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)'
                        }}>
                          <Business sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Typography variant="h3" sx={{ color: '#1976D2', fontWeight: 700, mb: 0.25, fontSize: '2rem' }}>
                          {spaces.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0D47A1', fontWeight: 600 }}>
                          Total Spaces
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ 
                        textAlign: 'center',
                        p: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
                        transition: 'transform 0.2s',
                        '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)' },
                        minWidth: 200
                      }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          backgroundColor: '#4CAF50', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                          boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                        }}>
                          <VerifiedUser sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 700, mb: 0.25, fontSize: '2rem' }}>
                          {spaces.filter(s => s.is_verified).length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                          Verified Spaces
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ 
                        textAlign: 'center',
                        p: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                        transition: 'transform 0.2s',
                        '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)' },
                        minWidth: 200
                      }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          backgroundColor: '#FF9800', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                          boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)'
                        }}>
                          <Schedule sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Typography variant="h3" sx={{ color: '#FF9800', fontWeight: 700, mb: 0.25, fontSize: '2rem' }}>
                          {spaces.filter(s => !s.is_verified).length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E65100', fontWeight: 600 }}>
                          Pending Verification
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Spaces Grid */}
                {spaces.length === 0 ? (
                  <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, boxShadow: 2 }}>
                    <Business sx={{ fontSize: 80, color: '#BBDEFB', mb: 2 }} />
                    <Typography variant="h5" sx={{ color: '#666', mb: 2, fontWeight: 600 }}>
                      No Coworking Spaces Yet
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#999', mb: 4 }}>
                      Start by adding your first coworking space to begin managing your business.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleAddNewSpace}
                      sx={{
                        backgroundColor: '#1976D2',
                        color: 'white',
                        '&:hover': { backgroundColor: '#0D47A1' },
                        borderRadius: '8px',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600
                      }}
                    >
                      Add Your First Space
                    </Button>
                  </Paper>
                ) : (
                  <Box sx={{ width: '100%' }}>
                    {spaces.map((space) => {
                      const isExpanded = expandedSpaces.has(space.id);
                      return (
                        <Card key={space.id} sx={{ 
                          width: '100%',
                          borderRadius: 3, 
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.08)',
                          border: '1px solid rgba(25, 118, 210, 0.08)',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          mb: 2,
                          '&:hover': {
                            boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                            transform: 'translateY(-2px)'
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: 'linear-gradient(90deg, #1976D2 0%, #42A5F5 100%)'
                          }
                        }}>
                            {/* Header - Always Visible */}
                            <CardContent 
                              sx={{ 
                                p: 3, 
                                pb: isExpanded ? 2 : 3,
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.02)'
                                }
                              }}
                              onClick={() => toggleSpaceExpansion(space.id)}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="h5" sx={{ 
                                    color: '#1976D2', 
                                    fontWeight: 700,
                                    fontSize: '1.5rem'
                                  }}>
                                    {space.title}
                                  </Typography>
                                  
                                  {space.is_verified ? (
                                    <Chip
                                      icon={<CheckCircle sx={{ fontSize: '16px !important' }} />}
                                      label="Verified"
                                      size="small"
                                      sx={{
                                        backgroundColor: '#E8F5E8',
                                        color: '#2E7D32',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        px: 1,
                                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)'
                                      }}
                                    />
                                  ) : (
                                    <Chip
                                      icon={<Schedule sx={{ fontSize: '16px !important' }} />}
                                      label="Pending"
                                      size="small"
                                      sx={{
                                        backgroundColor: '#FFF3E0',
                                        color: '#FF9800',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        px: 1,
                                        boxShadow: '0 2px 8px rgba(255, 152, 0, 0.2)'
                                      }}
                                    />
                                  )}
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMenuOpen(e, space);
                                    }}
                                    sx={{ 
                                      color: '#666',
                                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <MoreVert />
                                  </IconButton>
                                  
                                  <IconButton
                                    sx={{ 
                                      color: '#1976D2',
                                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.3s ease'
                                    }}
                                  >
                                    <ArrowBack sx={{ transform: 'rotate(-90deg)' }} />
                                  </IconButton>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <LocationOn sx={{ color: '#1976D2', fontSize: 18, mr: 1 }} />
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {space.city}, {space.state}, {space.country}
                                </Typography>
                              </Box>
                            </CardContent>
                            
                            {/* Expandable Content */}
                            {isExpanded && (
                              <CardContent sx={{ pt: 0, pb: 3, px: 3 }}>
                                <Divider sx={{ mb: 3, borderColor: 'rgba(25, 118, 210, 0.1)' }} />
                                
                                <Grid container spacing={3}>
                                  {/* Left Column - Images and Description */}
                                  <Grid item xs={12} md={6}>
                                    {/* Images */}
                                    {space.images && space.images.length > 0 && (
                                      <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" sx={{ color: '#1976D2', mb: 2, fontWeight: 600 }}>
                                          Images
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                          {space.images.slice(0, 4).map((image, index) => (
                                            <Box
                                              key={index}
                                              sx={{
                                                width: 80,
                                                height: 60,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: '2px solid rgba(25, 118, 210, 0.1)'
                                              }}
                                            >
                                              <img
                                                src={(() => {
                                                  // Use thumbnail for better performance, fallback to original
                                                  const thumbnailUrl = image.thumbnail_medium_url || image.thumbnail_url || image.image_url;
                                                  return thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8001${thumbnailUrl}`;
                                                })()}
                                                alt={`${space.title} ${index + 1}`}
                                                style={{
                                                  width: '100%',
                                                  height: '100%',
                                                  objectFit: 'cover'
                                                }}
                                              />
                                            </Box>
                                          ))}
                                          {space.images.length > 4 && (
                                            <Box sx={{
                                              width: 80,
                                              height: 60,
                                              borderRadius: 2,
                                              backgroundColor: '#f5f5f5',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              border: '2px solid rgba(25, 118, 210, 0.1)'
                                            }}>
                                              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                                                +{space.images.length - 4}
                                              </Typography>
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    )}
                                    
                                    {/* Description */}
                                    <Box sx={{ mb: 3 }}>
                                      <Typography variant="h6" sx={{ color: '#1976D2', mb: 2, fontWeight: 600 }}>
                                        Description
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                                        {space.description}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  
                                  {/* Right Column - Packages, Images & Amenities */}
                                  <Grid item xs={12}>
                                    {/* Packages Section */}
                                    {space.packages && space.packages.length > 0 ? (
                                      <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" sx={{ 
                                          fontWeight: 600,
                                          color: '#1976D2',
                                          mb: 3
                                        }}>
                                          • Packages, Images & Amenities
                                        </Typography>
                                        
                                        {/* Package Tabs */}
                                        <Tabs
                                          value={selectedTabs[space.id] || 0}
                                          onChange={(e, newValue) => handleTabChange(space.id, newValue)}
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
                                          {space.packages.map((pkg, index) => (
                                            <Tab key={index} label={pkg.name || `Package ${index + 1}`} />
                                          ))}
                                        </Tabs>

                                        {(() => {
                                          const selectedTabIndex = selectedTabs[space.id] || 0;
                                          const currentPackage = space.packages[selectedTabIndex];
                                          
                                          if (!currentPackage) return null;
                                          
                                          return (
                                            <Box>
                                              {/* Pricing Options */}
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
                                                        ${currentPackage.price_per_hour || '0'}
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
                                                        ${currentPackage.price_per_day || '0'}
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
                                                        ${currentPackage.price_per_week || '0'}
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
                                                        ${currentPackage.price_per_month || '0'}
                                                      </Typography>
                                                      <Typography variant="body2" sx={{ color: '#666' }}>
                                                        per month
                                                      </Typography>
                                                    </Box>
                                                  </Grid>
                                                </Grid>
                                              </Box>
                                              
                                              {/* Package Description */}
                                              <Typography variant="body1" sx={{ 
                                                color: '#333',
                                                mb: 3,
                                                lineHeight: 1.6
                                              }}>
                                                {currentPackage.description || 'No description available'}
                                              </Typography>

                                              {/* Package Gallery */}
                                              {currentPackage.images && currentPackage.images.length > 0 && (
                                                <Box sx={{ mb: 4 }}>
                                                  <Typography variant="h6" sx={{ 
                                                    fontWeight: 600,
                                                    color: '#1976D2',
                                                    mb: 2
                                                  }}>
                                                    Package Gallery:
                                                  </Typography>
                                                  
                                                  <Grid container spacing={2}>
                                                    {currentPackage.images.map((image, idx) => (
                                                      <Grid item xs={12} sm={6} md={4} key={idx}>
                                                        <Box sx={{
                                                          position: 'relative',
                                                          width: '100%',
                                                          height: 200,
                                                          borderRadius: 2,
                                                          overflow: 'hidden',
                                                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                          cursor: 'pointer',
                                                          transition: 'transform 0.2s',
                                                          '&:hover': {
                                                            transform: 'scale(1.02)'
                                                          }
                                                        }}>
                                                          <img
                                                            src={(() => {
                                                              // Use thumbnail for better performance, fallback to original
                                                              const thumbnailUrl = image.thumbnail_medium_url || image.thumbnail_url || image.image_url;
                                                              return thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8001${thumbnailUrl}`;
                                                            })()}
                                                            alt={`${currentPackage.name} ${idx + 1}`}
                                                            style={{
                                                              width: '100%',
                                                              height: '100%',
                                                              objectFit: 'cover'
                                                            }}
                                                          />
                                                          {image.is_primary === 1 && (
                                                            <Chip
                                                              label="Primary"
                                                              size="small"
                                                              sx={{
                                                                position: 'absolute',
                                                                top: 8,
                                                                left: 8,
                                                                backgroundColor: '#1976D2',
                                                                color: 'white',
                                                                fontWeight: 600
                                                              }}
                                                            />
                                                          )}
                                                        </Box>
                                                      </Grid>
                                                    ))}
                                                  </Grid>
                                                </Box>
                                              )}

                                              {/* Package Amenities */}
                                              {currentPackage.amenities && (
                                                <Box sx={{ mb: 3 }}>
                                                  <Typography variant="h6" sx={{ 
                                                    fontWeight: 600,
                                                    color: '#1976D2',
                                                    mb: 2
                                                  }}>
                                                    Package Amenities:
                                                  </Typography>
                                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    {getAmenitiesArray(currentPackage.amenities).map((amenity, index) => (
                                                      <Chip
                                                        key={index}
                                                        icon={getAmenityIcon(amenity)}
                                                        label={amenity}
                                                        size="small"
                                                        sx={{
                                                          backgroundColor: '#E8F5E8',
                                                          color: '#2E7D32',
                                                          fontSize: '0.75rem',
                                                          height: 28,
                                                          mb: 0.5,
                                                          fontWeight: 600
                                                        }}
                                                      />
                                                    ))}
                                                  </Box>
                                                </Box>
                                              )}
                                            </Box>
                                          );
                                        })()}
                                      </Box>
                                    ) : (
                                      /* Fallback: Show space-level pricing when no packages */
                                      <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" sx={{ color: '#1976D2', mb: 2, fontWeight: 600 }}>
                                          Pricing
                                        </Typography>
                                        <Grid container spacing={1}>
                                          <Grid item xs={6}>
                                            <Box sx={{ 
                                              display: 'flex', 
                                              alignItems: 'center',
                                              backgroundColor: '#f8faff',
                                              borderRadius: 2,
                                              p: 1,
                                              mb: 1
                                            }}>
                                              <AttachMoney sx={{ fontSize: 16, color: '#4CAF50', mr: 1 }} />
                                              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                                                {formatPrice(space.price_per_hour)}/hr
                                              </Typography>
                                            </Box>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Box sx={{ 
                                              display: 'flex', 
                                              alignItems: 'center',
                                              backgroundColor: '#f8faff',
                                              borderRadius: 2,
                                              p: 1,
                                              mb: 1
                                            }}>
                                              <AttachMoney sx={{ fontSize: 16, color: '#4CAF50', mr: 1 }} />
                                              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                                                {formatPrice(space.price_per_day)}/day
                                              </Typography>
                                            </Box>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Box sx={{ 
                                              display: 'flex', 
                                              alignItems: 'center',
                                              backgroundColor: '#f8faff',
                                              borderRadius: 2,
                                              p: 1,
                                              mb: 1
                                            }}>
                                              <AttachMoney sx={{ fontSize: 16, color: '#4CAF50', mr: 1 }} />
                                              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                                                {formatPrice(space.price_per_week)}/week
                                              </Typography>
                                            </Box>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Box sx={{ 
                                              display: 'flex', 
                                              alignItems: 'center',
                                              backgroundColor: '#f8faff',
                                              borderRadius: 2,
                                              p: 1,
                                              mb: 1
                                            }}>
                                              <AttachMoney sx={{ fontSize: 16, color: '#4CAF50', mr: 1 }} />
                                              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                                                {formatPrice(space.price_per_month)}/month
                                              </Typography>
                                            </Box>
                                          </Grid>
                                        </Grid>
                                      </Box>
                                    )}

                                    {/* Space Amenities (only show if no package amenities or as additional) */}
                                    {space.amenities && (!space.packages || !space.packages[0]?.amenities) && (
                                      <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" sx={{ color: '#1976D2', mb: 2, fontWeight: 600 }}>
                                          Space Amenities
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                          {getAmenitiesArray(space.amenities).map((amenity, index) => (
                                            <Chip
                                              key={index}
                                              icon={getAmenityIcon(amenity)}
                                              label={amenity}
                                              size="small"
                                              sx={{
                                                backgroundColor: '#E3F2FD',
                                                color: '#1976D2',
                                                fontSize: '0.8rem',
                                                height: 28,
                                                mb: 0.5
                                              }}
                                            />
                                          ))}
                                        </Box>
                                      </Box>
                                    )}
                                  </Grid>
                                </Grid>
                                
                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 2, mt: 3, pt: 2, borderTop: '1px solid rgba(25, 118, 210, 0.1)' }}>
                                  <Button
                                    startIcon={<Visibility />}
                                    onClick={() => handleViewSpace(space.id)}
                                    variant="contained"
                                    sx={{ 
                                      backgroundColor: '#1976D2',
                                      color: 'white',
                                      fontWeight: 600,
                                      borderRadius: 2,
                                      px: 3,
                                      py: 1,
                                      '&:hover': {
                                        backgroundColor: '#1565C0'
                                      },
                                      transition: 'background-color 0.2s'
                                    }}
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                    startIcon={<Edit />}
                                    onClick={() => handleEditSpace(space.id)}
                                    variant="outlined"
                                    sx={{ 
                                      borderColor: '#1976D2',
                                      color: '#1976D2',
                                      fontWeight: 600,
                                      borderRadius: 2,
                                      px: 3,
                                      py: 1,
                                      '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                        borderColor: '#1976D2'
                                      },
                                      transition: 'background-color 0.2s'
                                    }}
                                  >
                                    Edit Space
                                  </Button>
                                </Box>
                              </CardContent>
                            )}
                          </Card>
                      );
                    })}
                  </Box>
                )}
              </>
            )}

            {/* Context Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: { borderRadius: 2, boxShadow: 3 }
              }}
            >
              <MenuItem onClick={() => handleViewSpace(selectedSpace?.id)}>
                <Visibility sx={{ mr: 2, fontSize: 20 }} />
                View Details
              </MenuItem>
              <MenuItem onClick={() => handleEditSpace(selectedSpace?.id)}>
                <Edit sx={{ mr: 2, fontSize: 20 }} />
                Edit Space
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => handleDeleteSpace(selectedSpace?.id)}
                sx={{ color: '#f44336' }}
              >
                <Delete sx={{ mr: 2, fontSize: 20 }} />
                Delete Space
              </MenuItem>
            </Menu>
                </Box>
              </Paper>
      </Box>
    </Box>
  );
}
