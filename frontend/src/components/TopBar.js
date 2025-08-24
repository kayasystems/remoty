import React, { useState, useRef, useEffect } from 'react';
// Import both module APIs for route-based selection
import { employerApi } from '../services/employer';
import { coworkingApi } from '../services/coworking';
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
} from '@mui/icons-material';

export default function TopBar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: ''
  });
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchor);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn) return;
      
      try {
        // Use correct API based on current route
        const currentPath = window.location.pathname;
        let response;
        
        if (currentPath.includes('/employer')) {
          response = await employerApi.get('/employer/me');
        } else if (currentPath.includes('/coworking')) {
          response = await coworkingApi.get('/coworking/me');
        } else {
          // Default to employer for backward compatibility
          response = await employerApi.get('/employer/me');
        }
        
        const userData = response.data;
        setUserData({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          companyName: userData.company_name || userData.name || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAnchorEl(null);
    navigate('/employer/login');
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete('/employer/delete', {
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        },
      });

      alert('Account deleted successfully.');
      localStorage.removeItem('token');
      navigate('/employer/login');
    } catch (error) {
      console.error(error);
      alert('Failed to delete account.');
    }
  };

  const handleViewProfile = () => {
    setAnchorEl(null);
    navigate('/employer/profile');
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
      position="sticky" 
      elevation={1}
      sx={{
        backgroundColor: '#8B2635',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: '1.125rem',
              }}
            >
              R
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'white',
            }}
          >
            Remoty
          </Typography>
          <Chip
            label="PRO"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.625rem',
              fontWeight: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
            }}
          />
        </Box>

        {/* User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isLoggedIn ? (
            <>
              {/* Right Side Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, pr: 1 }}>
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* Help */}
                  <IconButton
                    onClick={() => console.log('Help clicked')}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      width: 44,
                      height: 44,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <HelpOutline fontSize="small" />
                  </IconButton>

                  {/* Notifications */}
                  <IconButton
                    onClick={handleNotificationClick}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      width: 44,
                      height: 44,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Badge 
                      badgeContent={3} 
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#ff4444',
                          color: 'white',
                          fontSize: '0.75rem',
                        }
                      }}
                    >
                      <NotificationsOutlined fontSize="small" />
                    </Badge>
                  </IconButton>
                </Box>

                {/* Profile Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', lineHeight: 1, fontSize: '0.875rem' }}>
                      {userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleProfileClick}
                    sx={{
                      p: 0,
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 600,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {userData.firstName && userData.lastName 
                        ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}` 
                        : '?'}
                    </Avatar>
                  </IconButton>
                </Box>
              </Box>

              {/* Profile Menu */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleProfileClose}
                onClick={handleProfileClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    mt: 1.5,
                    minWidth: 220,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 38, 53, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(139, 38, 53, 0.2)',
                      borderBottom: 'none',
                      borderRight: 'none',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(139, 38, 53, 0.1)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#8B2635', fontSize: '0.875rem' }}>
                    {userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(139, 38, 53, 0.7)', fontSize: '0.75rem' }}>
                    {userData.email || 'Loading...'}
                  </Typography>
                </Box>
                
                <MenuItem 
                  onClick={handleViewProfile} 
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    color: '#8B2635',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 38, 53, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#8B2635' }}>
                    <AccountCircleOutlined fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    View Profile
                  </ListItemText>
                </MenuItem>
                
                <Divider sx={{ borderColor: 'rgba(139, 38, 53, 0.1)' }} />
                
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    color: '#8B2635',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 38, 53, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#8B2635' }}>
                    <LogoutOutlined fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    Logout
                  </ListItemText>
                </MenuItem>
                
                <MenuItem 
                  onClick={handleDeleteAccount} 
                  sx={{ 
                    py: 1.5,
                    color: '#dc2626',
                    '&:hover': {
                      backgroundColor: '#fef2f2',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <DeleteOutlined fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete Account</ListItemText>
                </MenuItem>
              </Menu>

              {/* Notifications Menu */}
              <Menu
                anchorEl={notificationAnchor}
                open={notificationOpen}
                onClose={handleNotificationClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    mt: 1.5,
                    minWidth: 320,
                    maxHeight: 400,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 38, 53, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(139, 38, 53, 0.2)',
                      borderBottom: 'none',
                      borderRight: 'none',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(139, 38, 53, 0.1)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#8B2635', fontSize: '0.875rem' }}>
                    Notifications
                  </Typography>
                </Box>
                
                <MenuItem 
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 38, 53, 0.08)',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#8B2635', fontSize: '0.875rem' }}>
                      New employee joined
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(139, 38, 53, 0.7)', fontSize: '0.75rem' }}>
                      2 minutes ago
                    </Typography>
                  </Box>
                </MenuItem>
                
                <MenuItem 
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 38, 53, 0.08)',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#8B2635', fontSize: '0.875rem' }}>
                      Task completed
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(139, 38, 53, 0.7)', fontSize: '0.75rem' }}>
                      1 hour ago
                    </Typography>
                  </Box>
                </MenuItem>
                
                <MenuItem 
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 38, 53, 0.08)',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#8B2635', fontSize: '0.875rem' }}>
                      New booking request
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(139, 38, 53, 0.7)', fontSize: '0.75rem' }}>
                      3 hours ago
                    </Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="text"
                startIcon={<Login />}
                onClick={() => navigate('/employer/login')}
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/employer/register')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Get Started
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

