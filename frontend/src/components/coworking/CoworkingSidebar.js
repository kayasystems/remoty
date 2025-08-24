import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Collapse,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import {
  BarChart3,
  Building,
  Calendar,
  TrendingUp,
  Bell,
  Plus,
  FileText,
  Clock,
  PieChart,
  DollarSign,
  Users,
} from 'lucide-react';

export default function CoworkingSidebar() {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    spaces: false,
    bookings: false,
    analytics: false
  });

  // Mock stats data - replace with API call
  const [stats, setStats] = useState({
    totalSpaces: 12,
    activeBookings: 28,
    monthlyRevenue: 15420,
    occupancyRate: 78
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const isCurrentlyExpanded = prev[section];
      
      // If clicking on an already expanded section, close it
      if (isCurrentlyExpanded) {
        return {
          ...prev,
          [section]: false
        };
      }
      
      // Otherwise, close all sections and open the clicked one
      const newState = {
        spaces: false,
        bookings: false,
        analytics: false
      };
      
      return {
        ...newState,
        [section]: true
      };
    });
  };

  // Auto-expand based on current path - only on mount
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (currentPath.includes('/coworking/spaces')) {
      setExpandedSections(prev => ({ ...prev, spaces: true }));
    } else if (currentPath.includes('/coworking/bookings')) {
      setExpandedSections(prev => ({ ...prev, bookings: true }));
    } else if (currentPath.includes('/coworking/analytics')) {
      setExpandedSections(prev => ({ ...prev, analytics: true }));
    }
  }, []); // Remove location.pathname dependency to prevent scroll re-renders

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <BarChart3 size={20} />,
      path: '/coworking/dashboard',
      exact: true
    },
    {
      title: 'Spaces',
      icon: <Building size={20} />,
      expandable: true,
      section: 'spaces',
      children: [
        { title: 'All Spaces', path: '/coworking/spaces', icon: <Building size={18} /> },
        { title: 'Add New Space', path: '/coworking/spaces/add', icon: <Plus size={18} /> }
      ]
    },
    {
      title: 'Bookings',
      icon: <Calendar size={20} />,
      expandable: true,
      section: 'bookings',
      children: [
        { title: 'All Bookings', path: '/coworking/bookings', icon: <FileText size={18} /> },
        { title: 'Calendar View', path: '/coworking/bookings/calendar', icon: <Calendar size={18} /> },
        { title: 'Booking History', path: '/coworking/bookings/history', icon: <Clock size={18} /> }
      ]
    },
    {
      title: 'Analytics',
      icon: <TrendingUp size={20} />,
      expandable: true,
      section: 'analytics',
      children: [
        { title: 'Revenue Analytics', path: '/coworking/analytics/revenue', icon: <TrendingUp size={18} /> },
        { title: 'Performance Stats', path: '/coworking/analytics/performance', icon: <BarChart3 size={18} /> },
        { title: 'Occupancy Reports', path: '/coworking/analytics/occupancy', icon: <PieChart size={18} /> }
      ]
    },
    {
      title: 'Notifications',
      icon: <Bell size={20} />,
      path: '/coworking/notifications'
    }
  ];

  const isActiveLink = (path, exact = false) => {
    if (!path) return false;
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname === path;
  };

  const renderMenuItem = (item, isChild = false) => {
    const isActive = isActiveLink(item.path, item.exact);
    const hasActiveChild = item.children?.some(child => isActiveLink(child.path));
    const isExpanded = expandedSections[item.section];

    if (item.expandable) {
      return (
        <Box key={item.title}>
          {/* Parent Menu Item - Isolated from children */}
          <ListItemButton
            onClick={() => toggleSection(item.section)}
            selected={hasActiveChild}
            sx={{
              pl: isChild ? 4 : 2,
              pr: 2,
              minHeight: isChild ? 36 : 48,
              mb: 2,
              mx: 1,
              borderRadius: 2,
              color: 'rgba(25, 118, 210, 0.9)',
              backgroundColor: 'transparent',
              border: isChild ? 'none' : (hasActiveChild ? '1px solid rgba(25, 118, 210, 0.3)' : '1px solid transparent'),
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'translateZ(0)',
              '&:hover': {
                backgroundColor: isChild ? 'rgba(25, 118, 210, 0.05)' : 'rgba(25, 118, 210, 0.1)',
                color: '#1976D2',
                transform: 'translateX(2px) translateZ(0)',
                borderColor: isChild ? 'transparent' : 'rgba(25, 118, 210, 0.3)',
              },
              '&.Mui-selected': {
                backgroundColor: isChild ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.2)',
                color: '#1976D2',
                borderColor: 'rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  backgroundColor: isChild ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.25)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontSize: isChild ? '0.8125rem' : '0.875rem',
                fontWeight: isChild ? 400 : (hasActiveChild ? 600 : 500),
                color: 'inherit',
              }}
            />
            <Box sx={{ color: 'inherit' }}>
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItemButton>
          
          {/* Children Menu Items - Completely separate from parent */}
          {isExpanded && (
            <Box sx={{ 
              backgroundColor: 'transparent', 
              borderRadius: '8px', 
              mx: 1, 
              mb: 0.5, 
              borderLeft: '2px solid rgba(25, 118, 210, 0.2)', 
              ml: 2,
              pl: 1
            }}>
              {item.children?.map((child) => (
                <ListItemButton
                  key={child.title}
                  component={NavLink}
                  to={child.path}
                  selected={isActiveLink(child.path)}
                  sx={{
                    pl: 4,
                    pr: 2,
                    minHeight: 36,
                    mb: 0.3,
                    mx: 1,
                    borderRadius: 2,
                    textDecoration: 'none',
                    color: 'rgba(25, 118, 210, 0.9)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateZ(0)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.05)',
                      color: '#1976D2',
                      transform: 'translateX(2px) translateZ(0)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: '#1976D2',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    {child.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={child.title}
                    primaryTypographyProps={{
                      fontSize: '0.8125rem',
                      fontWeight: isActiveLink(child.path) ? 600 : 400,
                      color: 'inherit',
                    }}
                  />
                </ListItemButton>
              ))}
            </Box>
          )}
        </Box>
      );
    }

    // Regular menu item - CRITICAL: Use NavLink for proper navigation
    return (
      <ListItemButton
        key={item.title}
        component={NavLink}
        to={item.path}
        selected={isActive}
        sx={{
          pl: isChild ? 4 : 2,
          pr: 2,
          minHeight: isChild ? 36 : 48,
          mb: 2,
          mx: 1,
          borderRadius: 2,
          textDecoration: 'none',
          color: 'rgba(25, 118, 210, 0.9)',
          backgroundColor: 'transparent',
          border: isChild ? 'none' : (isActive ? '1px solid rgba(25, 118, 210, 0.3)' : '1px solid transparent'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translateZ(0)',
          '&:hover': {
            backgroundColor: isChild ? 'rgba(25, 118, 210, 0.05)' : 'rgba(25, 118, 210, 0.1)',
            color: '#1976D2',
            transform: 'translateX(2px) translateZ(0)',
            borderColor: isChild ? 'transparent' : 'rgba(25, 118, 210, 0.3)',
          },
          '&.Mui-selected': {
            backgroundColor: isChild ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.2)',
            color: '#1976D2',
            borderColor: 'rgba(25, 118, 210, 0.4)',
            '&:hover': {
              backgroundColor: isChild ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.25)',
            },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.title}
          primaryTypographyProps={{
            fontSize: isChild ? '0.8125rem' : '0.875rem',
            fontWeight: isChild ? 400 : (isActive ? 600 : 500),
            color: 'inherit',
          }}
        />
      </ListItemButton>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 320,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 320,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderRight: '1px solid rgba(25, 118, 210, 0.2)',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(25, 118, 210, 0.2)',
          backgroundColor: 'rgba(25, 118, 210, 0.05)',
          mt: 8,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#0D47A1',
            fontWeight: 700,
            fontSize: '1.1rem',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          Coworking Dashboard
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List component="nav" disablePadding sx={{ mt: 2 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Quick Stats Section */}
      <Box sx={{ 
        p: 2, 
        mt: 'auto',
        backgroundColor: 'rgba(25, 118, 210, 0.05)',
        borderTop: '1px solid rgba(25, 118, 210, 0.2)',
      }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#0D47A1',
            fontWeight: 600,
            mb: 2,
            textAlign: 'center',
            fontSize: '0.875rem',
          }}
        >
          Quick Stats
        </Typography>
        
        <Grid container spacing={1.5}>
          {/* Total Spaces */}
          <Grid item xs={6}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                border: '1px solid rgba(25, 118, 210, 0.2)',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                },
                transition: 'box-shadow 0.2s ease',
                width: '100%',
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Building size={16} color="#1976D2" />
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 0.5,
                      color: '#1976D2',
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    }}
                  >
                    Spaces
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#0D47A1',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    lineHeight: 1,
                  }}
                >
                  {stats.totalSpaces}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Bookings */}
          <Grid item xs={6}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                border: '1px solid rgba(25, 118, 210, 0.2)',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                },
                transition: 'box-shadow 0.2s ease',
                width: '100%',
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Calendar size={16} color="#1976D2" />
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 0.5,
                      color: '#1976D2',
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    }}
                  >
                    Active
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#0D47A1',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    lineHeight: 1,
                  }}
                >
                  {stats.activeBookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Revenue */}
          <Grid item xs={6}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                border: '1px solid rgba(25, 118, 210, 0.2)',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                },
                transition: 'box-shadow 0.2s ease',
                width: '100%',
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <DollarSign size={16} color="#1976D2" />
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 0.5,
                      color: '#1976D2',
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    }}
                  >
                    Revenue
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#0D47A1',
                    fontWeight: 700,
                    fontSize: '1rem',
                    lineHeight: 1,
                  }}
                >
                  ${(stats.monthlyRevenue / 1000).toFixed(1)}k
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Occupancy Rate */}
          <Grid item xs={6}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                border: '1px solid rgba(25, 118, 210, 0.2)',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                },
                transition: 'box-shadow 0.2s ease',
                width: '100%',
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Users size={16} color="#1976D2" />
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 0.5,
                      color: '#1976D2',
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    }}
                  >
                    Occupied
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#0D47A1',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    lineHeight: 1,
                  }}
                >
                  {stats.occupancyRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
}
