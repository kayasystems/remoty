import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import {
  Search,
  MessageSquare,
  Bell,
  Settings,
  User,
  LogOut,
  Menu as MenuIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employerApi } from '../../services/employer';

const MiraTopBar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [messageAnchor, setMessageAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState({
    name: 'Lucy Lavender',
    email: 'lucy@example.com',
    avatar: '/api/placeholder/40/40',
    online: true,
  });
  const [stats, setStats] = useState({
    unreadMessages: 3,
    unreadNotifications: 7,
  });

  useEffect(() => {
    fetchUserProfile();
    fetchStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/employer/me');
      if (response.data) {
        setUser({
          name: `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim() || response.data.name || 'User',
          email: response.data.email || 'user@example.com',
          avatar: response.data.profile_picture_url || '/api/placeholder/40/40',
          online: true,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/employer/dashboard/stats');
      if (response.data) {
        setStats({
          unreadMessages: 3,
          unreadNotifications: response.data.stats?.unreadNotifications || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const handleMessageMenuOpen = (event) => {
    setMessageAnchor(event.currentTarget);
  };

  const handleMessageMenuClose = () => {
    setMessageAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/employer/login');
    handleProfileMenuClose();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderBottom: '1px solid #e2e8f0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item sx={{ display: { xs: 'block', lg: 'none' } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={onMenuClick}
              edge="start"
            >
              <MenuIcon size={20} />
            </IconButton>
          </Grid>

          <Grid item>
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                position: 'relative',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                width: { xs: 200, sm: 250, md: 300 },
                '&:hover': {
                  borderColor: '#cbd5e1',
                },
                '&:focus-within': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none',
                }}
              >
                <Search size={18} />
              </Box>
              <InputBase
                placeholder="Search topics…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: '100%',
                  pl: 5,
                  pr: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  '& .MuiInputBase-input': {
                    padding: 0,
                    '&::placeholder': {
                      color: '#94a3b8',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          </Grid>

          <Grid item xs />

          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={handleMessageMenuOpen}
                aria-label="messages"
              >
                <Badge badgeContent={stats.unreadMessages} color="error">
                  <MessageSquare size={20} />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                onClick={handleNotificationMenuOpen}
                aria-label="notifications"
              >
                <Badge badgeContent={stats.unreadNotifications} color="error">
                  <Bell size={20} />
                </Badge>
              </IconButton>

              <IconButton color="inherit" aria-label="language">
                <Box
                  component="img"
                  src="/api/placeholder/22/22"
                  alt="English"
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '2px',
                  }}
                />
              </IconButton>

              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: user.online ? '#10b981' : '#94a3b8',
                        border: '2px solid white',
                      }}
                    />
                  }
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{ width: 40, height: 40 }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </Badge>
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigate('/employer/profile')}>
          <User size={16} style={{ marginRight: 8 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/employer/settings')}>
          <Settings size={16} style={{ marginRight: 8 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: 8 }} />
          Logout
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 300,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <MenuItem onClick={() => navigate('/employer/notifications')}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              New task assigned
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => navigate('/employer/notifications')}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Employee checked in
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate('/employer/notifications')}>
          <Typography variant="body2" color="primary" sx={{ textAlign: 'center', width: '100%' }}>
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={messageAnchor}
        open={Boolean(messageAnchor)}
        onClose={handleMessageMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 300,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Messages
          </Typography>
        </Box>
        <MenuItem onClick={() => navigate('/employer/messages')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                John Doe
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hey, how's the project going?
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => navigate('/employer/messages')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Avatar sx={{ width: 32, height: 32 }}>SM</Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Sarah Miller
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Meeting scheduled for tomorrow
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate('/employer/messages')}>
          <Typography variant="body2" color="primary" sx={{ textAlign: 'center', width: '100%' }}>
            View all messages
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default MiraTopBar;
