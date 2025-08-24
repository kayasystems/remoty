import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  NotificationsOutlined,
  AccountCircleOutlined,
  LogoutOutlined,
  DeleteOutlined,
  Work,
} from '@mui/icons-material';
import { employeeApi } from '../../services/employee/employeeApi';

export default function EmployeeTopBar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await employeeApi.get('/employee/me');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('employee_token');
    navigate('/employee/login');
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      await employeeApi.delete('/employee/delete');
      
      // Clear token and redirect
      localStorage.removeItem('employee_token');
      navigate('/employee/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(error.response?.data?.detail || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return 'E';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: '#2E7D32',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left side - Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Work sx={{ fontSize: 32, color: '#FFFFFF' }} />
            <Typography variant="h6" sx={{ 
              color: '#FFFFFF', 
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>
              Employee Portal
            </Typography>
          </Box>

          {/* Right side - User actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton
              onClick={handleNotificationMenuOpen}
              sx={{ 
                color: '#FFFFFF',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <Badge badgeContent={0} color="error">
                <NotificationsOutlined />
              </Badge>
            </IconButton>

            {/* Profile Menu */}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ 
                color: '#FFFFFF',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                {userProfile ? getInitials(userProfile.first_name, userProfile.last_name) : 'E'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxWidth: 400,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            border: '1px solid rgba(76, 175, 80, 0.2)',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 600, mb: 1 }}>
            Notifications
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            No new notifications
          </Typography>
        </Box>
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 250,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            border: '1px solid rgba(76, 175, 80, 0.2)',
          }
        }}
      >
        {/* User Info */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#2E7D32', fontWeight: 600 }}>
            {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Employee'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            {userProfile?.email || 'employee@example.com'}
          </Typography>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(76, 175, 80, 0.2)' }} />
        
        {/* Menu Items */}
        <MenuItem 
          onClick={handleProfileMenuClose}
          sx={{ 
            color: '#2E7D32',
            '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
          }}
        >
          <AccountCircleOutlined sx={{ mr: 2, color: '#4CAF50' }} />
          Profile Settings
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            handleProfileMenuClose();
            handleLogout();
          }}
          sx={{ 
            color: '#2E7D32',
            '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
          }}
        >
          <LogoutOutlined sx={{ mr: 2, color: '#4CAF50' }} />
          Logout
        </MenuItem>
        
        <Divider sx={{ borderColor: 'rgba(76, 175, 80, 0.2)' }} />
        
        <MenuItem 
          onClick={() => {
            handleProfileMenuClose();
            setDeleteDialogOpen(true);
          }}
          sx={{ 
            color: '#F44336',
            '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
          }}
        >
          <DeleteOutlined sx={{ mr: 2, color: '#F44336' }} />
          Delete Account
        </MenuItem>
      </Menu>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#2E7D32', fontWeight: 600 }}>
          Delete Employee Account
        </DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Typography variant="body1" sx={{ color: '#666666' }}>
            Are you sure you want to delete your employee account? This action cannot be undone and will remove all your booking history and profile data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: '#4CAF50',
              color: '#4CAF50',
              '&:hover': {
                borderColor: '#2E7D32',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            disabled={deleteLoading}
            sx={{
              backgroundColor: '#F44336',
              '&:hover': { backgroundColor: '#D32F2F' },
              '&:disabled': { backgroundColor: '#CCCCCC' }
            }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
