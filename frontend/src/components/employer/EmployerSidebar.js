// src/components/employer/EmployerSidebar.js
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
  Chip,
  Avatar,
  Badge,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Menu,
  MenuOpen,
} from '@mui/icons-material';
import {
  BarChart3,
  Users,
  CheckSquare,
  Building,
  Calendar,
  Bell,
  User,
  Plus,
  Search,
  FileText,
  Clock,
} from 'lucide-react';
import { employerApi } from '../../services/employer';

export default function EmployerSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    employees: false,
    tasks: false,
    coworking: false,
    reports: false
  });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingTasks: 0,
    activeBookings: 0
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
        employees: false,
        tasks: false,
        coworking: false,
        reports: false
      };
      
      return {
        ...newState,
        [section]: true
      };
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await employerApi.get('/employer/dashboard/stats');
      setStats({
        totalEmployees: response.data.employees,
        pendingTasks: response.data.active_tasks,
        activeBookings: response.data.monthly_bookings
      });
    } catch (err) {
      console.error('Error fetching sidebar stats:', err);
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <BarChart3 size={20} />,
      path: '/employer/dashboard',
      exact: true
    },
    {
      title: 'Employees',
      icon: <Users size={20} />,
      expandable: true,
      section: 'employees',
      children: [
        { title: 'Team', path: '/employer/employees', icon: <Users size={18} />, badge: stats.totalEmployees },
        { title: 'Invite', path: '/employer/employees/add', icon: <Plus size={18} /> }
      ]
    },
    {
      title: 'Tasks',
      icon: <CheckSquare size={20} />,
      expandable: true,
      section: 'tasks',
      children: [
        { title: 'Overview', path: '/employer/tasks', icon: <FileText size={18} />, badge: stats.pendingTasks },
        { title: 'Create', path: '/employer/tasks/create', icon: <Plus size={18} /> }
      ]
    },
    {
      title: 'Coworking',
      icon: <Building size={20} />,
      expandable: true,
      section: 'coworking',
      children: [
        { title: 'Book', path: '/employer/coworking/find', icon: <Search size={18} /> },
        // { title: 'Book', path: '/employer/coworking/book', icon: <Calendar size={18} /> }, // Hidden as requested
        { title: 'Bookings', path: '/employer/coworking/bookings', icon: <FileText size={18} />, badge: stats.activeBookings }
      ]
    },
    {
      title: 'Reports',
      icon: <Clock size={20} />,
      expandable: true,
      section: 'reports',
      children: [
        { title: 'Attendance', path: '/employer/attendance', icon: <Calendar size={18} /> }
      ]
    },
    {
      title: 'Notifications',
      icon: <Bell size={20} />,
      path: '/employer/notifications'
    },
    {
      title: 'Profile',
      icon: <User size={20} />,
      path: '/employer/profile'
    }
  ];

  const isActiveLink = (path, exact = false) => {
    if (!path) return false;
    if (exact) {
      return location.pathname === path;
    }
    // More precise matching to avoid multiple selections
    if (path === '/employer/tasks' && location.pathname === '/employer/tasks/create') {
      return false; // Don't highlight parent when child is active
    }
    if (path === '/employer/employees' && location.pathname === '/employer/employees/add') {
      return false; // Don't highlight parent when child is active
    }
    return location.pathname === path;
  };

  const renderMenuItem = (item, isChild = false) => {
    const isActive = isActiveLink(item.path, item.exact);
    const hasActiveChild = item.children?.some(child => isActiveLink(child.path));
    const isExpanded = expandedSections[item.section];

    // Don't render child items when collapsed
    if (isCollapsed && isChild) {
      return null;
    }

    if (item.expandable) {
      // When collapsed, show expandable items as simple buttons without expansion
      if (isCollapsed) {
        return (
          <Tooltip key={item.title} title={item.title} placement="right">
            <ListItemButton
              onClick={() => !isCollapsed && toggleSection(item.section)}
              selected={hasActiveChild}
              sx={{
                pl: 1,
                pr: 1,
                minHeight: 44,
                mb: 0.5,
                mx: 1,
                borderRadius: 2,
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.9)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateZ(0)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  transform: 'scale(1.05) translateZ(0)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', color: 'inherit', justifyContent: 'center' }}>
                {item.icon}
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        );
      }

      return (
        <React.Fragment key={item.title}>
          <ListItemButton
            onClick={() => toggleSection(item.section)}
            selected={hasActiveChild}
            sx={{
              pl: isChild ? 4 : 2,
              pr: 2,
              minHeight: isChild ? 36 : 48,
              mb: 0.5,
              mx: 1,
              borderRadius: 2,
              color: 'rgba(255, 255, 255, 0.9)',
              backgroundColor: 'transparent',
              border: isChild ? 'none' : (hasActiveChild ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent'),
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'translateZ(0)',
              '&:hover': {
                backgroundColor: isChild ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                transform: 'translateX(2px) translateZ(0)',
                borderColor: isChild ? 'transparent' : 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-selected': {
                backgroundColor: isChild ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                '&:hover': {
                  backgroundColor: isChild ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.25)',
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
          <Collapse in={isExpanded && !isCollapsed} timeout={400} unmountOnExit>
            <Box sx={{ 
              backgroundColor: 'transparent', 
              borderRadius: '8px', 
              mx: 1, 
              mb: 0.5, 
              borderLeft: '2px solid rgba(255, 255, 255, 0.2)', 
              ml: 2,
              pl: 1
            }}>
              <List component="div" disablePadding sx={{ py: 0.5 }}>
                {item.children?.map((child) => renderMenuItem(child, true))}
              </List>
            </Box>
          </Collapse>
        </React.Fragment>
      );
    }

    // Collapsed state for regular items
    if (isCollapsed) {
      return (
        <Tooltip key={item.title} title={item.title} placement="right">
          <ListItemButton
            component={NavLink}
            to={item.path}
            selected={isActive}
            sx={{
              pl: 1,
              pr: 1,
              minHeight: 44,
              mb: 0.5,
              mx: 1,
              borderRadius: 2,
              justifyContent: 'center',
              textDecoration: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'translateZ(0)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                transform: 'scale(1.05) translateZ(0)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto', color: 'inherit', justifyContent: 'center' }}>
              {item.icon}
            </ListItemIcon>
          </ListItemButton>
        </Tooltip>
      );
    }

    return (
      <ListItemButton
        key={item.title}
        component={NavLink}
        to={item.path}
        selected={isActive}
        sx={{
          pl: isChild ? 5 : 2,
          pr: 2,
          minHeight: isChild ? 36 : 48,
          mb: 0.5,
          mx: 1,
          borderRadius: 2,
          textDecoration: 'none',
          color: isChild ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          backgroundColor: 'transparent',
          border: isChild ? 'none' : (isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translateZ(0)',
          '&:hover': {
            backgroundColor: isChild ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            transform: 'translateX(2px) translateZ(0)',
            borderColor: isChild ? 'transparent' : 'rgba(255, 255, 255, 0.3)',
          },
          '&.Mui-selected': {
            backgroundColor: isChild ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.4)',
            boxShadow: isChild ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
            transform: 'translateX(2px) translateZ(0)',
            '&:hover': {
              backgroundColor: isChild ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.25)',
            },
          },
        }}
      >
        {!isChild && (
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            {item.icon}
          </ListItemIcon>
        )}
        {isChild && (
          <Box sx={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            backgroundColor: isActive ? 'white' : 'rgba(255, 255, 255, 0.6)', 
            mr: 2, 
            ml: -1,
            flexShrink: 0
          }} />
        )}
        <ListItemText 
          primary={item.title}
          primaryTypographyProps={{
            fontSize: isChild ? '0.8125rem' : '0.875rem',
            fontWeight: isChild ? 400 : (isActive ? 600 : 500),
            color: 'inherit',
          }}
          sx={{ pl: isChild ? 0 : 0 }}
        />
        {item.badge && (
          <Chip
            label={item.badge}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.75rem',
              fontWeight: 500,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          />
        )}
      </ListItemButton>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? 72 : 258,
        flexShrink: 0,
        zIndex: 1300,
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: isCollapsed ? 72 : 258,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: '#8B2635',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
          top: '64px',
          height: 'calc(100vh - 64px)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      }}
    >
      {/* Modern Arrow Toggle Button */}
      <IconButton
        onClick={() => setIsCollapsed(!isCollapsed)}
        sx={{
          position: 'fixed',
          top: 80, // Below the TopBar (64px) + some margin
          left: isCollapsed ? 60 : 246, // Adjust based on sidebar width
          width: 28,
          height: 28,
          backgroundColor: '#8B2635',
          color: 'white',
          border: '2px solid white',
          borderRadius: '50%',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transform: 'translateZ(0)', // Force hardware acceleration
          backfaceVisibility: 'hidden', // Reduce flickering
          '&:hover': {
            backgroundColor: '#a02d3f',
            transform: 'scale(1.1) translateZ(0)',
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {isCollapsed ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
        )}
      </IconButton>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List component="nav" disablePadding sx={{ mt: 6 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Team Overview */}
      {!isCollapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'white',
              mb: 2,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            Team Overview
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem' }}>
                Team Members
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {stats.totalEmployees}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem' }}>
                Active Tasks
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {stats.pendingTasks}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem' }}>
                Bookings
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {stats.activeBookings}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}


