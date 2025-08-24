import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import {
  Sliders,
  PanelsTopLeft,
  Briefcase,
  ShoppingCart,
  Package,
  CreditCard,
  CheckSquare,
  Calendar,
  Users,
  Grid3X3,
  PieChart,
  List as ListIcon,
  Heart,
  Map,
  BookOpen,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { employerApi } from '../../services/employer';

const SIDEBAR_WIDTH = 258;

const MiraSidebar = ({ open = true, variant = 'permanent', onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 8,
    totalTasks: 17,
    unreadNotifications: 3,
  });
  const [user, setUser] = useState({
    name: 'Lucy Lavender',
    role: 'UX Designer',
    avatar: '/api/placeholder/40/40',
    online: true,
  });

  useEffect(() => {
    fetchStats();
    fetchUserProfile();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/employer/dashboard/stats');
      if (response.data) {
        setStats({
          totalProjects: response.data.stats?.totalEmployees || 0,
          totalTasks: response.data.stats?.activeTasks || 0,
          unreadNotifications: response.data.stats?.unreadNotifications || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/employer/me');
      if (response.data) {
        setUser({
          name: `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim() || response.data.name || 'User',
          role: 'Employer',
          avatar: response.data.profile_picture_url || '/api/placeholder/40/40',
          online: true,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose && variant === 'temporary') {
      onClose();
    }
  };

  const menuItems = [
    {
      title: 'Pages',
      items: [
        {
          title: 'Dashboard',
          icon: <Sliders size={20} />,
          expandable: true,
          open: dashboardOpen,
          onToggle: () => setDashboardOpen(!dashboardOpen),
          children: [
            { title: 'Default', path: '/employer/dashboard' },
            { title: 'Analytics', path: '/employer/analytics' },
          ],
        },
        {
          title: 'Pages',
          icon: <PanelsTopLeft size={20} />,
          expandable: true,
          open: pagesOpen,
          onToggle: () => setPagesOpen(!pagesOpen),
          children: [
            { title: 'Profile', path: '/employer/profile' },
            { title: 'Notifications', path: '/employer/notifications' },
          ],
        },
        {
          title: 'Employees',
          icon: <Users size={20} />,
          path: '/employer/employees',
          badge: stats.totalProjects,
        },
        {
          title: 'Bookings',
          icon: <ShoppingCart size={20} />,
          path: '/employer/coworking/bookings',
        },
        {
          title: 'Find Spaces',
          icon: <Package size={20} />,
          path: '/employer/coworking/find',
        },
        {
          title: 'Tasks',
          icon: <CheckSquare size={20} />,
          path: '/employer/tasks',
          badge: stats.totalTasks,
        },
        {
          title: 'Attendance',
          icon: <Calendar size={20} />,
          path: '/employer/attendance',
        },
      ],
    },
  ];

  const renderMenuItem = (item, isChild = false) => {
    const active = item.path && isActive(item.path);
    
    if (item.expandable) {
      return (
        <React.Fragment key={item.title}>
          <ListItemButton
            onClick={item.onToggle}
            selected={active}
            sx={{
              pl: isChild ? 4 : 2,
              pr: 2,
              minHeight: 48,
              borderRadius: isChild ? 0 : '8px',
              mx: isChild ? 0 : 1,
              mb: isChild ? 0 : 0.5,
              backgroundColor: isChild ? 'transparent' : (item.open ? 'rgba(25, 118, 210, 0.08)' : 'transparent'),
              border: isChild ? 'none' : (item.open ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid transparent'),
              '&:hover': {
                backgroundColor: isChild ? 'rgba(25, 118, 210, 0.04)' : 'rgba(25, 118, 210, 0.08)',
                borderColor: isChild ? 'transparent' : 'rgba(25, 118, 210, 0.2)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                borderColor: 'rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.16)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: isChild ? '#64748b' : (item.open ? '#1976d2' : '#374151'),
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontSize: isChild ? '0.8125rem' : '0.875rem',
                fontWeight: isChild ? 400 : 600,
                color: isChild ? '#64748b' : (item.open ? '#1976d2' : '#1e293b'),
              }}
            />
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  mr: 1,
                  backgroundColor: item.open ? '#1976d2' : '#f1f5f9',
                  color: item.open ? 'white' : '#64748b',
                }}
              />
            )}
            <Box sx={{ 
              color: isChild ? '#94a3b8' : (item.open ? '#1976d2' : '#64748b'),
              display: 'flex',
              alignItems: 'center',
            }}>
              {item.open ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItemButton>
          <Collapse in={item.open} timeout="auto" unmountOnExit>
            <Box sx={{ 
              backgroundColor: 'rgba(248, 250, 252, 0.5)',
              borderRadius: '0 0 8px 8px',
              mx: 1,
              mb: 0.5,
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderTop: 'none',
            }}>
              <List component="div" disablePadding sx={{ py: 0.5 }}>
                {item.children?.map((child) => renderMenuItem(child, true))}
              </List>
            </Box>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItemButton
        key={item.title}
        onClick={() => item.path && handleNavigation(item.path)}
        selected={active}
        sx={{
          pl: isChild ? 5 : 2,
          pr: 2,
          minHeight: isChild ? 36 : 48,
          borderRadius: isChild ? '6px' : '8px',
          mx: isChild ? 1.5 : 1,
          mb: isChild ? 0.25 : 0.5,
          backgroundColor: active ? (isChild ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.12)') : 'transparent',
          border: active ? '1px solid rgba(25, 118, 210, 0.3)' : '1px solid transparent',
          '&:hover': {
            backgroundColor: isChild ? 'rgba(25, 118, 210, 0.04)' : 'rgba(25, 118, 210, 0.08)',
            borderColor: isChild ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.2)',
          },
          '&.Mui-selected': {
            backgroundColor: isChild ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.12)',
            borderColor: 'rgba(25, 118, 210, 0.3)',
            '&:hover': {
              backgroundColor: isChild ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.16)',
            },
          },
        }}
      >
        {!isChild && (
          <ListItemIcon sx={{ 
            minWidth: 40,
            color: active ? '#1976d2' : '#374151',
          }}>
            {item.icon}
          </ListItemIcon>
        )}
        {isChild && (
          <Box sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: active ? '#1976d2' : '#cbd5e1',
            mr: 2,
            ml: -1,
          }} />
        )}
        <ListItemText 
          primary={item.title}
          primaryTypographyProps={{
            fontSize: isChild ? '0.8125rem' : '0.875rem',
            fontWeight: isChild ? 400 : 600,
            color: active ? '#1976d2' : (isChild ? '#64748b' : '#1e293b'),
          }}
        />
        {item.badge && (
          <Chip
            label={item.badge}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.75rem',
              fontWeight: 500,
              backgroundColor: active ? '#1976d2' : '#f1f5f9',
              color: active ? 'white' : '#64748b',
            }}
          />
        )}
      </ListItemButton>
    );
  };

  const drawerContent = (
    <>
      {/* Logo */}
      <ListItemButton
        onClick={() => handleNavigation('/employer/dashboard')}
        sx={{
          height: 64,
          justifyContent: 'center',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#1976d2',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '1.25rem',
              }}
            >
              M
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.25rem',
              color: '#1e293b',
            }}
          >
            Mira
          </Typography>
          <Chip
            label="PRO"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.625rem',
              fontWeight: 600,
              backgroundColor: '#f1f5f9',
              color: '#64748b',
            }}
          />
        </Box>
      </ListItemButton>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {menuItems.map((section) => (
          <Box key={section.title}>
            <Typography
              variant="subtitle2"
              sx={{
                px: 2,
                py: 1.5,
                mt: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {section.title}
            </Typography>
            <List component="nav" disablePadding>
              {section.items.map((item) => renderMenuItem(item))}
            </List>
          </Box>
        ))}
      </Box>

      {/* User Profile */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
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
          </Grid>
          <Grid item xs>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '0.875rem',
                color: '#1e293b',
                lineHeight: 1.2,
              }}
            >
              {user.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                color: '#64748b',
                lineHeight: 1.2,
              }}
            >
              {user.role}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default MiraSidebar;
