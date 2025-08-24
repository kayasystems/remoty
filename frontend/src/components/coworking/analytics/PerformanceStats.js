import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  CalendarToday,
  AttachMoney,
  Star,
  Refresh,
  Download,
  FilterList,
} from '@mui/icons-material';
import CoworkingTopBar from '../CoworkingTopBar';
import CoworkingSidebar from '../CoworkingSidebar';

export default function PerformanceStats() {
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(false);

  // Mock performance data
  const [performanceData, setPerformanceData] = useState({
    kpis: [
      {
        title: 'Occupancy Rate',
        value: '78%',
        change: '+5.2%',
        trend: 'up',
        color: '#4CAF50',
        icon: <People />
      },
      {
        title: 'Average Booking Duration',
        value: '4.2 hrs',
        change: '+0.8 hrs',
        trend: 'up',
        color: '#2196F3',
        icon: <CalendarToday />
      },
      {
        title: 'Revenue per Space',
        value: '$1,240',
        change: '+12.5%',
        trend: 'up',
        color: '#FF9800',
        icon: <AttachMoney />
      },
      {
        title: 'Customer Satisfaction',
        value: '4.7/5',
        change: '+0.2',
        trend: 'up',
        color: '#9C27B0',
        icon: <Star />
      }
    ],
    spacePerformance: [
      { name: 'Conference Room A', occupancy: 85, revenue: 2400, bookings: 45, rating: 4.8 },
      { name: 'Hot Desk Area', occupancy: 72, revenue: 1800, bookings: 120, rating: 4.6 },
      { name: 'Private Office 1', occupancy: 90, revenue: 3200, bookings: 28, rating: 4.9 },
      { name: 'Meeting Room B', occupancy: 68, revenue: 1600, bookings: 35, rating: 4.5 },
      { name: 'Open Workspace', occupancy: 75, revenue: 2100, bookings: 95, rating: 4.7 },
      { name: 'Phone Booth 1', occupancy: 45, revenue: 800, bookings: 60, rating: 4.3 },
    ],
    trends: {
      bookingTrends: [
        { period: 'Week 1', bookings: 45, revenue: 2400 },
        { period: 'Week 2', bookings: 52, revenue: 2800 },
        { period: 'Week 3', bookings: 48, revenue: 2600 },
        { period: 'Week 4', bookings: 58, revenue: 3100 },
      ]
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/coworking/login';
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const getOccupancyColor = (occupancy) => {
    if (occupancy >= 80) return '#4CAF50';
    if (occupancy >= 60) return '#FF9800';
    return '#f44336';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 4.0) return '#FF9800';
    return '#f44336';
  };

  return (
    <>
      <CoworkingTopBar />
      <Box sx={{ display: 'flex' }}>
        <CoworkingSidebar />
        
        <Box sx={{ 
          flexGrow: 1,
          ml: '320px',
          mt: '64px',
          background: 'linear-gradient(135deg, #F8FAFF 0%, #E3F2FD 100%)', 
          minHeight: 'calc(100vh - 64px)',
          p: 4,
          pt: 5,
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
          <Box sx={{ width: '100%', maxWidth: 1200 }}>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ 
                color: '#0D47A1', 
                fontWeight: 700, 
                mb: 1 
              }}>
                Performance Analytics
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Track key performance indicators and space utilization metrics
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="7">Last 7 days</MenuItem>
                  <MenuItem value="30">Last 30 days</MenuItem>
                  <MenuItem value="90">Last 3 months</MenuItem>
                  <MenuItem value="365">Last year</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Refresh Data">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Report">
                <IconButton>
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {performanceData.kpis.map((kpi, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        backgroundColor: `${kpi.color}15`,
                        color: kpi.color,
                        mr: 2 
                      }}>
                        {kpi.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                        {kpi.value}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      {kpi.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp sx={{ color: '#4CAF50', fontSize: 16, mr: 0.5 }} />
                      ) : (
                        <TrendingDown sx={{ color: '#f44336', fontSize: 16, mr: 0.5 }} />
                      )}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: kpi.trend === 'up' ? '#4CAF50' : '#f44336',
                          fontWeight: 600 
                        }}
                      >
                        {kpi.change}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Space Performance Table */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#0D47A1' }}>
                Space Performance Overview
              </Typography>
              <IconButton size="small">
                <FilterList />
              </IconButton>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Space Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Occupancy Rate</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Revenue (30d)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Bookings</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.spacePerformance.map((space, index) => (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {space.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 60 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={space.occupancy} 
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getOccupancyColor(space.occupancy),
                                  borderRadius: 3,
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {space.occupancy}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#4CAF50' }}>
                          ${space.revenue.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {space.bookings}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: getRatingColor(space.rating) }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {space.rating}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={space.occupancy >= 80 ? 'High Demand' : space.occupancy >= 60 ? 'Moderate' : 'Low Demand'}
                          size="small"
                          sx={{
                            backgroundColor: space.occupancy >= 80 ? '#E8F5E8' : space.occupancy >= 60 ? '#FFF3E0' : '#FFEBEE',
                            color: space.occupancy >= 80 ? '#4CAF50' : space.occupancy >= 60 ? '#FF9800' : '#f44336',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Performance Insights */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0D47A1', mb: 3 }}>
                  Key Insights
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, backgroundColor: '#E8F5E8', borderRadius: 2, borderLeft: '4px solid #4CAF50' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2E7D32' }}>
                      📈 Conference Room A has the highest occupancy rate at 85%
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#FFF3E0', borderRadius: 2, borderLeft: '4px solid #FF9800' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#F57C00' }}>
                      ⚠️ Phone Booth 1 is underutilized with only 45% occupancy
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#E3F2FD', borderRadius: 2, borderLeft: '4px solid #2196F3' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976D2' }}>
                      💡 Private Office 1 generates highest revenue per booking
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#F3E5F5', borderRadius: 2, borderLeft: '4px solid #9C27B0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#7B1FA2' }}>
                      ⭐ Overall customer satisfaction improved by 4.2% this month
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0D47A1', mb: 3 }}>
                  Recommendations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      🎯 Optimize Phone Booth Pricing
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Consider reducing rates or adding amenities to increase utilization
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      📊 Expand Conference Room Capacity
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      High demand suggests potential for additional meeting spaces
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      💰 Premium Pricing Strategy
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Apply premium rates to high-performing spaces during peak hours
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      📈 Marketing Focus
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Promote underutilized spaces through targeted campaigns
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
}
