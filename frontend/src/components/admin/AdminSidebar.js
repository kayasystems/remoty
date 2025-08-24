import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  Business,
  People,
  VerifiedUser,
  PendingActions,
  Analytics,
  Settings,
  AdminPanelSettings,
} from '@mui/icons-material';

const drawerWidth = 280;

const menuItems = [
  {
    title: 'Dashboard',
    icon: <Dashboard />,
    path: '/admin/dashboard',
    description: 'System Overview'
  },
  {
    title: 'Coworking Spaces',
    icon: <Business />,
    path: '/admin/spaces',
    description: 'Manage Spaces',
    submenu: [
      { title: 'All Spaces', path: '/admin/spaces/all', icon: <Business /> },
      { title: 'Pending Verification', path: '/admin/spaces/pending', icon: <PendingActions /> },
      { title: 'Verified Spaces', path: '/admin/spaces/verified', icon: <VerifiedUser /> },
    ]
  },
  {
    title: 'User Management',
    icon: <People />,
    path: '/admin/users',
    description: 'Manage Users',
    submenu: [
      { title: 'All Employers', path: '/admin/users/employers', icon: <People /> },
      { title: 'All Employees', path: '/admin/users/employees', icon: <People /> },
      { title: 'Coworking Owners', path: '/admin/users/coworking', icon: <People /> },
    ]
  },
  {
    title: 'Analytics',
    icon: <Analytics />,
    path: '/admin/analytics',
    description: 'System Analytics'
  },
  {
    title: 'Settings',
    icon: <Settings />,
    path: '/admin/settings',
    description: 'System Settings'
  }
];

export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: 'linear-gradient(180deg, #2C2C2C 0%, #1A1A1A 100%)',
      borderRight: '1px solid rgba(96, 96, 96, 0.2)',
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(96, 96, 96, 0.2)',
        background: 'rgba(128, 128, 128, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettings sx={{ 
            fontSize: 32, 
            color: '#808080',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
          }} />
          <Box>
            <Typography variant="h6" sx={{ 
              color: '#FFFFFF', 
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Admin Portal
            </Typography>
            <Typography variant="caption" sx={{ 
              color: '#B0B0B0',
              fontSize: '0.75rem'
            }}>
              System Management
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ p: 2, flex: 1 }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.title}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive(item.path) 
                    ? 'rgba(128, 128, 128, 0.2)' 
                    : 'transparent',
                  border: isActive(item.path) 
                    ? '1px solid rgba(128, 128, 128, 0.3)' 
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(128, 128, 128, 0.15)',
                    border: '1px solid rgba(128, 128, 128, 0.2)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive(item.path) ? '#FFFFFF' : '#B0B0B0',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ 
                        color: isActive(item.path) ? '#FFFFFF' : '#E0E0E0',
                        fontWeight: isActive(item.path) ? 600 : 500
                      }}>
                        {item.title}
                      </Typography>
                      {item.badge && (
                        <Chip 
                          label="New" 
                          size="small" 
                          sx={{ 
                            height: 18,
                            fontSize: '0.7rem',
                            backgroundColor: '#FF9800',
                            color: '#FFFFFF'
                          }} 
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ 
                      color: '#808080',
                      fontSize: '0.7rem'
                    }}>
                      {item.description}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>

            {/* Submenu items */}
            {item.submenu && isActive(item.path) && (
              <Box sx={{ ml: 2, mb: 2 }}>
                {item.submenu.map((subItem) => (
                  <ListItem key={subItem.title} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigation(subItem.path)}
                      sx={{
                        borderRadius: '8px',
                        py: 1,
                        px: 2,
                        backgroundColor: location.pathname === subItem.path 
                          ? 'rgba(128, 128, 128, 0.3)' 
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(128, 128, 128, 0.2)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: location.pathname === subItem.path ? '#FFFFFF' : '#909090',
                        minWidth: 32
                      }}>
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ 
                              color: location.pathname === subItem.path ? '#FFFFFF' : '#C0C0C0',
                              fontWeight: location.pathname === subItem.path ? 600 : 400,
                              fontSize: '0.85rem'
                            }}>
                              {subItem.title}
                            </Typography>
                            {subItem.badge && (
                              <Chip 
                                label="3" 
                                size="small" 
                                sx={{ 
                                  height: 16,
                                  fontSize: '0.65rem',
                                  backgroundColor: '#FF6B6B',
                                  color: '#FFFFFF'
                                }} 
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </Box>
            )}

            {index < menuItems.length - 1 && (
              <Divider sx={{ 
                my: 2, 
                borderColor: 'rgba(96, 96, 96, 0.2)' 
              }} />
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid rgba(96, 96, 96, 0.2)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <Typography variant="caption" sx={{ 
          color: '#808080',
          display: 'block',
          textAlign: 'center'
        }}>
          Admin Portal v1.0
        </Typography>
        <Typography variant="caption" sx={{ 
          color: '#606060',
          display: 'block',
          textAlign: 'center',
          fontSize: '0.65rem'
        }}>
          Remoty SaaS Platform
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          background: 'transparent',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
}
