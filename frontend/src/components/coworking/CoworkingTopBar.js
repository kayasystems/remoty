import React, { useState, useRef, useEffect } from 'react';
import { coworkingApi } from '../../services/coworking';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import {
  NotificationsOutlined,
  AccountCircleOutlined,
  LogoutOutlined,
  DeleteOutlined,
  Login,
  HelpOutline,
  PersonAdd,
  Business,
  Dashboard,
  Settings,
} from '@mui/icons-material';

export default function CoworkingTopBar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [userData, setUserData] = useState({
    spaceName: '',
    ownerName: '',
    email: '',
    address: ''
  });
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchor);

  // Fetch user data when component mounts - only once
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn || userRole !== 'coworking') {
        if (window.location.pathname.includes('/coworking/dashboard')) {
          navigate('/coworking/login');
        }
        return;
      }
      
      try {
        // Token is automatically attached by API interceptor
        const response = await coworkingApi.get('/coworking/me');
        const user = response.data;
        setUserData({
          spaceName: user.company_name || 'Coworking Space',
          ownerName: `${user.first_name} ${user.last_name}`,
          email: user.email || '',
          address: user.address || ''
        });
      } catch (error) {
        console.error('Error fetching coworking user data:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token expired, invalid, or has wrong format - clear all auth data
          console.log('🔄 Clearing invalid authentication data and redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('lastActivity');
          navigate('/coworking/login');
        }
      }
    };

    fetchUserData();
  }, [isLoggedIn, userRole, navigate]);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Close dropdown menu
    setAnchorEl(null);
    
    // Reset user data
    setUserData({
      spaceName: '',
      ownerName: '',
      email: '',
      address: ''
    });
    
    // Navigate to login page
    navigate('/coworking/login');
    
    // Force page reload to ensure clean state
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your coworking space account? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await coworkingApi.delete('/coworking/delete');

      alert('Account deleted successfully.');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/coworking/login');
    } catch (error) {
      console.error(error);
      alert('Failed to delete account.');
    }
  };

  const handleViewProfile = () => {
    setAnchorEl(null);
    navigate('/coworking/profile');
  };

  const handleDashboard = () => {
    setAnchorEl(null);
    navigate('/coworking/dashboard');
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={1}
      sx={{
        backgroundColor: '#0D47A1',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1300,
        boxShadow: '0 4px 20px rgba(13, 71, 161, 0.15)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 71, 161, 0.3)',
            }}
          >
            <Business sx={{ color: '#FFFFFF', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: '#FFFFFF',
              fontFamily: '"Playfair Display", "Georgia", serif',
              textShadow: '1px 1px 2px rgba(13, 71, 161, 0.3)',
            }}
          >
            CoWorkSpace
          </Typography>
          <Chip
            label="PARTNER"
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
            }}
          />
        </Box>

        {/* Right Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isLoggedIn && userRole === 'coworking' ? (
            <>
              {/* Notifications */}
              <IconButton
                onClick={handleNotificationClick}
                sx={{
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsOutlined />
                </Badge>
              </IconButton>

              {/* User Name */}
              <Typography
                variant="body1"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  mx: 2,
                  textShadow: '1px 1px 2px rgba(13, 71, 161, 0.3)',
                  display: { xs: 'none', sm: 'block' }, // Hide on mobile
                }}
              >
                {userData.ownerName || 'Farrukh Naseem'}
              </Typography>

              {/* Profile */}
              <IconButton
                onClick={handleProfileClick}
                sx={{
                  p: 0,
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#0D47A1',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 12px rgba(13, 71, 161, 0.2)',
                  }}
                >
                  {userData.ownerName ? userData.ownerName.charAt(0).toUpperCase() : 'F'}
                </Avatar>
              </IconButton>

              {/* Profile Menu */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleProfileClose}
                onClick={handleProfileClose}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 4px 20px rgba(25, 118, 210, 0.15))',
                    mt: 1.5,
                    minWidth: 320,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(66, 165, 245, 0.2)',
                    borderRadius: '20px',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 20,
                      width: 12,
                      height: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(66, 165, 245, 0.2)',
                      borderRight: 'none',
                      borderBottom: 'none',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* User Info Header */}
                <Box sx={{ 
                  px: 3, 
                  py: 3, 
                  borderBottom: '1px solid rgba(66, 165, 245, 0.2)',
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                  borderRadius: '20px 20px 0 0',
                  textAlign: 'center'
                }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: '#1976D2',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    }}
                  >
                    {userData.ownerName ? userData.ownerName.charAt(0).toUpperCase() : 'F'}
                  </Avatar>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: '#0D47A1', 
                    fontSize: '1.1rem',
                    mb: 0.5
                  }}>
                    {userData.ownerName || 'Farrukh Naseem'}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#42A5F5', 
                    fontSize: '0.85rem',
                    fontWeight: 400,
                    mb: 1
                  }}>
                    {userData.email || 'Loading...'}
                  </Typography>
                  <Chip
                    label="Space Owner"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      color: '#1976D2',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      mb: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ 
                    color: '#1976D2', 
                    fontSize: '0.9rem', 
                    fontWeight: 500
                  }}>
                    {userData.spaceName || 'TechHub Coworking'}
                  </Typography>
                </Box>

                <MenuItem 
                  onClick={handleDashboard}
                  sx={{ 
                    py: 1.5, 
                    px: 3, 
                    '&:hover': { 
                      backgroundColor: 'rgba(66, 165, 245, 0.08)',
                      borderRadius: '12px',
                      mx: 1,
                      my: 0.5
                    },
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5
                  }}
                >
                  <ListItemIcon sx={{ color: '#42A5F5', minWidth: 40 }}>
                    <Dashboard />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dashboard" 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        color: '#1976D2', 
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      } 
                    }} 
                  />
                </MenuItem>

                <MenuItem 
                  onClick={handleViewProfile}
                  sx={{ 
                    py: 1.5, 
                    px: 3, 
                    '&:hover': { 
                      backgroundColor: 'rgba(66, 165, 245, 0.08)',
                      borderRadius: '12px',
                      mx: 1,
                      my: 0.5
                    },
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5
                  }}
                >
                  <ListItemIcon sx={{ color: '#42A5F5', minWidth: 40 }}>
                    <AccountCircleOutlined />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Profile" 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        color: '#1976D2', 
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      } 
                    }} 
                  />
                </MenuItem>

                <MenuItem 
                  sx={{ 
                    py: 1.5, 
                    px: 3, 
                    '&:hover': { 
                      backgroundColor: 'rgba(66, 165, 245, 0.08)',
                      borderRadius: '12px',
                      mx: 1,
                      my: 0.5
                    },
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5
                  }}
                >
                  <ListItemIcon sx={{ color: '#42A5F5', minWidth: 40 }}>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Settings" 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        color: '#1976D2', 
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      } 
                    }} 
                  />
                </MenuItem>

                <MenuItem 
                  sx={{ 
                    py: 1.5, 
                    px: 3, 
                    '&:hover': { 
                      backgroundColor: 'rgba(66, 165, 245, 0.08)',
                      borderRadius: '12px',
                      mx: 1,
                      my: 0.5
                    },
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5
                  }}
                >
                  <ListItemIcon sx={{ color: '#42A5F5', minWidth: 40 }}>
                    <HelpOutline />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Help & Support" 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        color: '#1976D2', 
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      } 
                    }} 
                  />
                </MenuItem>

                <Divider sx={{ borderColor: 'rgba(66, 165, 245, 0.2)', my: 1, mx: 2 }} />

                <MenuItem 
                  onClick={handleDeleteAccount}
                  sx={{ 
                    py: 1.5, 
                    px: 3, 
                    '&:hover': { 
                      backgroundColor: 'rgba(244, 67, 54, 0.08)',
                      borderRadius: '12px',
                      mx: 1,
                      my: 0.5
                    },
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5
                  }}
                >
                  <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}>
                    <DeleteOutlined />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Delete Account" 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        color: '#f44336', 
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      } 
                    }} 
                  />
                </MenuItem>

                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    py: 1.5, 
                    px: 3, 
                    '&:hover': { 
                      backgroundColor: 'rgba(156, 39, 176, 0.08)',
                      borderRadius: '12px',
                      mx: 1,
                      my: 0.5
                    },
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5,
                    mb: 1
                  }}
                >
                  <ListItemIcon sx={{ color: '#9c27b0', minWidth: 40 }}>
                    <LogoutOutlined />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logout" 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        color: '#9c27b0', 
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      } 
                    }} 
                  />
                </MenuItem>
              </Menu>

              {/* Notifications Menu */}
              <Menu
                anchorEl={notificationAnchor}
                open={notificationOpen}
                onClose={handleNotificationClose}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 4px 12px rgba(25, 118, 210, 0.15))',
                    mt: 1.5,
                    minWidth: 340,
                    maxHeight: 420,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(66, 165, 245, 0.2)',
                    borderRadius: '20px',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 20,
                      width: 10,
                      height: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(66, 165, 245, 0.2)',
                      borderRight: 'none',
                      borderBottom: 'none',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* Header */}
                <Box sx={{ 
                  px: 3, 
                  py: 3, 
                  borderBottom: '1px solid rgba(66, 165, 245, 0.2)',
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                  borderRadius: '20px 20px 0 0'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: '#0D47A1', 
                    fontSize: '1.1rem',
                    textAlign: 'center'
                  }}>
                    Notifications
                  </Typography>
                </Box>
                
                {/* Notification Items */}
                <MenuItem sx={{ 
                  py: 2, 
                  px: 3, 
                  borderBottom: '1px solid rgba(66, 165, 245, 0.1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(66, 165, 245, 0.08)',
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5
                  },
                  borderRadius: '12px',
                  mx: 1,
                  my: 0.5
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#42A5F5',
                      mt: 1,
                      flexShrink: 0
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: '#0D47A1', 
                        fontSize: '0.9rem',
                        mb: 0.5
                      }}>
                        New booking request
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#42A5F5', 
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        2 minutes ago
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                
                <MenuItem sx={{ 
                  py: 2, 
                  px: 3, 
                  borderBottom: '1px solid rgba(66, 165, 245, 0.1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(66, 165, 245, 0.08)',
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5
                  },
                  borderRadius: '12px',
                  mx: 1,
                  my: 0.5
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#1976D2',
                      mt: 1,
                      flexShrink: 0
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: '#0D47A1', 
                        fontSize: '0.9rem',
                        mb: 0.5
                      }}>
                        Payment received
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#42A5F5', 
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        1 hour ago
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                
                <MenuItem sx={{ 
                  py: 2, 
                  px: 3, 
                  '&:hover': { 
                    backgroundColor: 'rgba(66, 165, 245, 0.08)',
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5
                  },
                  borderRadius: '12px',
                  mx: 1,
                  my: 0.5,
                  mb: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#1565C0',
                      mt: 1,
                      flexShrink: 0
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: '#0D47A1', 
                        fontSize: '0.9rem',
                        mb: 0.5
                      }}>
                        Space review submitted
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#42A5F5', 
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        3 hours ago
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="text"
                startIcon={<Login />}
                onClick={() => navigate('/coworking/login')}
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  },
                  transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/coworking/register')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1.2,
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(13, 71, 161, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 6px 16px rgba(13, 71, 161, 0.3)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                  },
                  transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                }}
              >
                Join Us
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
