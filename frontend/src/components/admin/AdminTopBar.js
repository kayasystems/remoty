import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/admin/adminApi';
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
  Button,
} from '@mui/material';
import {
  NotificationsOutlined,
  AccountCircleOutlined,
  LogoutOutlined,
  DeleteOutlined,
  AdminPanelSettings,
  Dashboard,
  Settings,
  People,
  Business,
} from '@mui/icons-material';

export default function AdminTopBar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [userData, setUserData] = useState({
    adminName: '',
    email: '',
    role: ''
  });
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchor);

  // Fetch admin data when component mounts
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isLoggedIn || userRole !== 'admin') {
        if (window.location.pathname.includes('/admin/dashboard')) {
          navigate('/admin/login');
        }
        return;
      }
      
      try {
        const response = await adminApi.get('/admin/me');
        const admin = response.data;
        setUserData({
          adminName: `${admin.first_name} ${admin.last_name}`,
          email: admin.email || '',
          role: admin.role || 'admin'
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🔄 Clearing invalid admin authentication data and redirecting to login');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/admin/login');
        }
      }
    };

    fetchAdminData();
  }, [isLoggedIn, userRole, navigate]);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Close dropdown menu
    setAnchorEl(null);
    
    // Reset user data
    setUserData({
      adminName: '',
      email: '',
      role: ''
    });
    
    // Navigate to login page
    navigate('/admin/login');
    
    // Force page reload to ensure clean state
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your admin account? This action cannot be undone and will remove all admin privileges.'
    );
    if (!confirmDelete) return;

    try {
      await adminApi.delete('/admin/delete');
      alert('Admin account deleted successfully.');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/admin/login');
    } catch (error) {
      console.error(error);
      alert('Failed to delete admin account.');
    }
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
      sx={{ 
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(96, 96, 96, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: 1100
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Left side - Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettings sx={{ 
            fontSize: 32, 
            color: '#808080',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
          }} />
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.5px'
            }}>
              Admin Portal
            </Typography>
            <Typography variant="caption" sx={{ 
              color: '#B0B0B0',
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              System Management
            </Typography>
          </Box>
        </Box>

        {/* Right side - User actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isLoggedIn && userRole === 'admin' ? (
            <>
              {/* Notifications */}
              <IconButton
                onClick={handleNotificationClick}
                sx={{
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(128, 128, 128, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(128, 128, 128, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(128, 128, 128, 0.2)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsOutlined />
                </Badge>
              </IconButton>

              {/* Profile Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600,
                    lineHeight: 1.2
                  }}>
                    {userData.adminName || 'Loading...'}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#B0B0B0',
                    textTransform: 'capitalize'
                  }}>
                    {userData.role}
                  </Typography>
                </Box>
                
                <IconButton
                  onClick={handleProfileClick}
                  sx={{
                    p: 0,
                    border: '2px solid rgba(128, 128, 128, 0.3)',
                    '&:hover': {
                      border: '2px solid #808080',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40,
                    background: 'linear-gradient(135deg, #404040 0%, #606060 100%)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    {userData.adminName ? userData.adminName.charAt(0).toUpperCase() : 'A'}
                  </Avatar>
                </IconButton>
              </Box>

              {/* Notifications Menu */}
              <Menu
                anchorEl={notificationAnchor}
                open={notificationOpen}
                onClose={handleNotificationClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 320,
                    maxWidth: 400,
                    background: 'rgba(48, 48, 48, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(96, 96, 96, 0.3)',
                    borderRadius: '16px',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(96, 96, 96, 0.2)' }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    System Notifications
                  </Typography>
                </Box>
                
                <MenuItem sx={{ py: 2, px: 3, color: '#B0B0B0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#FF9800',
                      mt: 1,
                      flexShrink: 0
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: '#FFFFFF', 
                        fontSize: '0.9rem',
                        mb: 0.5
                      }}>
                        New space pending verification
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#B0B0B0', 
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        2 minutes ago
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Menu>

              {/* Profile Menu */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleProfileClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 280,
                    background: 'rgba(48, 48, 48, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(96, 96, 96, 0.3)',
                    borderRadius: '16px',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* Profile Header */}
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(96, 96, 96, 0.2)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 56, 
                      height: 56,
                      background: 'linear-gradient(135deg, #404040 0%, #606060 100%)',
                      color: '#FFFFFF',
                      fontSize: '1.5rem',
                      fontWeight: 600
                    }}>
                      {userData.adminName ? userData.adminName.charAt(0).toUpperCase() : 'A'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                        {userData.adminName || 'Loading...'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                        System Administrator
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#808080' }}>
                        {userData.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Menu Items */}
                <MenuItem onClick={() => { handleProfileClose(); navigate('/admin/dashboard'); }} sx={{ py: 1.5, px: 3 }}>
                  <ListItemIcon>
                    <Dashboard sx={{ color: '#808080' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dashboard" 
                    primaryTypographyProps={{ color: '#FFFFFF', fontWeight: 500 }}
                  />
                </MenuItem>

                <MenuItem onClick={() => { handleProfileClose(); navigate('/admin/users'); }} sx={{ py: 1.5, px: 3 }}>
                  <ListItemIcon>
                    <People sx={{ color: '#808080' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="User Management" 
                    primaryTypographyProps={{ color: '#FFFFFF', fontWeight: 500 }}
                  />
                </MenuItem>

                <MenuItem onClick={() => { handleProfileClose(); navigate('/admin/spaces'); }} sx={{ py: 1.5, px: 3 }}>
                  <ListItemIcon>
                    <Business sx={{ color: '#808080' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Space Management" 
                    primaryTypographyProps={{ color: '#FFFFFF', fontWeight: 500 }}
                  />
                </MenuItem>

                <MenuItem onClick={() => { handleProfileClose(); navigate('/admin/settings'); }} sx={{ py: 1.5, px: 3 }}>
                  <ListItemIcon>
                    <Settings sx={{ color: '#808080' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Settings" 
                    primaryTypographyProps={{ color: '#FFFFFF', fontWeight: 500 }}
                  />
                </MenuItem>

                <Divider sx={{ my: 1, borderColor: 'rgba(96, 96, 96, 0.2)' }} />

                <MenuItem onClick={handleDeleteAccount} sx={{ py: 1.5, px: 3 }}>
                  <ListItemIcon>
                    <DeleteOutlined sx={{ color: '#FF6B6B' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Delete Account" 
                    primaryTypographyProps={{ color: '#FF6B6B', fontWeight: 500 }}
                  />
                </MenuItem>

                <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 3 }}>
                  <ListItemIcon>
                    <LogoutOutlined sx={{ color: '#808080' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logout" 
                    primaryTypographyProps={{ color: '#FFFFFF', fontWeight: 500 }}
                  />
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => navigate('/admin/login')}
              sx={{
                backgroundColor: 'rgba(128, 128, 128, 0.2)',
                color: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1.2,
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(128, 128, 128, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(128, 128, 128, 0.3)',
                },
              }}
            >
              Admin Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
