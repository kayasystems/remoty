import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  VerifiedUser,
  PendingActions,
  TrendingUp,
  Visibility,
  CheckCircle,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { adminApi } from '../../services/admin/adminApi';
import AdminTopBar from './AdminTopBar';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await adminApi.get('/admin/dashboard/stats');
      setStats(statsResponse.data);
      
      // Fetch pending spaces for verification
      const spacesResponse = await adminApi.get('/admin/spaces?verified=false&limit=10');
      setSpaces(spacesResponse.data.spaces);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySpace = async (spaceId) => {
    try {
      await adminApi.put(`/admin/spaces/${spaceId}/verify`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error verifying space:', error);
      setError('Failed to verify space');
    }
  };

  const handleUnverifySpace = async (spaceId) => {
    try {
      await adminApi.put(`/admin/spaces/${spaceId}/unverify`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error unverifying space:', error);
      setError('Failed to unverify space');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress sx={{ color: '#808080' }} size={60} />
      </Box>
    );
  }

  return (
    <>
      <AdminTopBar />
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
        pt: 10,
        pb: 4,
      }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ 
              color: '#FFFFFF', 
              fontWeight: 700,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Dashboard sx={{ fontSize: 40, color: '#808080' }} />
              Admin Dashboard
            </Typography>
            <Typography variant="h6" sx={{ color: '#B0B0B0' }}>
              System overview and management
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ 
              mb: 3,
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              border: '1px solid rgba(211, 47, 47, 0.3)',
              color: '#FF6B6B'
            }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'rgba(48, 48, 48, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(96, 96, 96, 0.3)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(64, 64, 64, 0.5)', 
                        color: '#808080',
                        width: 56,
                        height: 56
                      }}>
                        <People />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                          {stats.total_employers}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                          Employers
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'rgba(48, 48, 48, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(96, 96, 96, 0.3)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(33, 150, 243, 0.2)', 
                        color: '#2196F3',
                        width: 56,
                        height: 56
                      }}>
                        <People />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                          {stats.total_employees}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                          Employees
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'rgba(48, 48, 48, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(96, 96, 96, 0.3)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(64, 64, 64, 0.5)', 
                        color: '#808080',
                        width: 56,
                        height: 56
                      }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                          {stats.total_coworking_users}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                          Coworking Owners
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'rgba(48, 48, 48, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(96, 96, 96, 0.3)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(76, 175, 80, 0.2)', 
                        color: '#4CAF50',
                        width: 56,
                        height: 56
                      }}>
                        <VerifiedUser />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                          {stats.verified_spaces}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                          Verified Spaces
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'rgba(48, 48, 48, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(96, 96, 96, 0.3)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255, 152, 0, 0.2)', 
                        color: '#FF9800',
                        width: 56,
                        height: 56
                      }}>
                        <PendingActions />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                          {stats.pending_spaces}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                          Pending Verification
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Pending Spaces Table */}
          <Card sx={{
            background: 'rgba(48, 48, 48, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(96, 96, 96, 0.3)',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  Pending Space Verifications
                </Typography>
                <Button
                  startIcon={<Refresh />}
                  onClick={fetchDashboardData}
                  sx={{
                    color: '#808080',
                    borderColor: 'rgba(128, 128, 128, 0.3)',
                    '&:hover': {
                      borderColor: '#808080',
                      backgroundColor: 'rgba(128, 128, 128, 0.1)'
                    }
                  }}
                  variant="outlined"
                >
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ 
                backgroundColor: 'rgba(32, 32, 32, 0.5)',
                borderRadius: '12px'
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#B0B0B0', fontWeight: 600 }}>Space Name</TableCell>
                      <TableCell sx={{ color: '#B0B0B0', fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ color: '#B0B0B0', fontWeight: 600 }}>Owner</TableCell>
                      <TableCell sx={{ color: '#B0B0B0', fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ color: '#B0B0B0', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {spaces.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ 
                          color: '#808080', 
                          textAlign: 'center',
                          py: 4
                        }}>
                          No pending spaces for verification
                        </TableCell>
                      </TableRow>
                    ) : (
                      spaces.map((space) => (
                        <TableRow key={space.id}>
                          <TableCell sx={{ color: '#FFFFFF' }}>{space.title}</TableCell>
                          <TableCell sx={{ color: '#B0B0B0' }}>
                            {space.city}, {space.country}
                          </TableCell>
                          <TableCell sx={{ color: '#B0B0B0' }}>
                            ID: {space.coworking_user_id}
                          </TableCell>
                          <TableCell sx={{ color: '#B0B0B0' }}>
                            {new Date(space.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                onClick={() => handleVerifySpace(space.id)}
                                sx={{ 
                                  color: '#4CAF50',
                                  '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                                }}
                                title="Verify Space"
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton
                                sx={{ 
                                  color: '#808080',
                                  '&:hover': { backgroundColor: 'rgba(128, 128, 128, 0.1)' }
                                }}
                                title="View Details"
                              >
                                <Visibility />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
