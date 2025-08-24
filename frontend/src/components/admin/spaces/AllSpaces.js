import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../services/admin/adminApi';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
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
  VerifiedUser,
  PendingActions,
  TrendingUp,
  Visibility,
  CheckCircle,
  Cancel,
  Refresh,
  Assignment,
  Verified,
  Pending,
  LocationOn,
} from '@mui/icons-material';

export default function AllSpaces() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.get('/admin/spaces');
      setSpaces(response.data.spaces || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setError('Failed to load coworking spaces. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySpace = async (spaceId) => {
    try {
      setActionLoading(true);
      await adminApi.put(`/admin/spaces/${spaceId}/verify`);
      await fetchSpaces(); // Refresh the list
      setDialogOpen(false);
      setSelectedSpace(null);
    } catch (error) {
      console.error('Error verifying space:', error);
      setError('Failed to verify space. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnverifySpace = async (spaceId) => {
    try {
      setActionLoading(true);
      await adminApi.put(`/admin/spaces/${spaceId}/unverify`);
      await fetchSpaces(); // Refresh the list
      setDialogOpen(false);
      setSelectedSpace(null);
    } catch (error) {
      console.error('Error unverifying space:', error);
      setError('Failed to unverify space. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const openSpaceDialog = (space) => {
    setSelectedSpace(space);
    setDialogOpen(true);
  };

  const getStatusChip = (isVerified) => {
    return isVerified ? (
      <Chip
        icon={<Verified />}
        label="Verified"
        color="success"
        size="small"
        sx={{
          backgroundColor: '#4CAF50',
          color: '#FFFFFF',
          '& .MuiChip-icon': { color: '#FFFFFF' }
        }}
      />
    ) : (
      <Chip
        icon={<Pending />}
        label="Pending"
        color="warning"
        size="small"
        sx={{
          backgroundColor: '#FF9800',
          color: '#FFFFFF',
          '& .MuiChip-icon': { color: '#FFFFFF' }
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        color: '#FFFFFF'
      }}>
        <CircularProgress sx={{ color: '#808080' }} />
        <Typography sx={{ ml: 2, color: '#B0B0B0' }}>Loading coworking spaces...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Business sx={{ fontSize: 32, color: '#808080' }} />
          <Box>
            <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
              All Coworking Spaces
            </Typography>
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
              Manage and verify coworking spaces
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchSpaces}
          sx={{
            backgroundColor: 'rgba(128, 128, 128, 0.2)',
            color: '#FFFFFF',
            border: '1px solid rgba(128, 128, 128, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(128, 128, 128, 0.3)',
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#FF6B6B' }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ 
          flex: 1, 
          background: 'rgba(76, 175, 80, 0.1)', 
          border: '1px solid rgba(76, 175, 80, 0.3)' 
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 600 }}>
              Verified Spaces
            </Typography>
            <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
              {spaces.filter(space => space.is_verified).length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ 
          flex: 1, 
          background: 'rgba(255, 152, 0, 0.1)', 
          border: '1px solid rgba(255, 152, 0, 0.3)' 
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 600 }}>
              Pending Verification
            </Typography>
            <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
              {spaces.filter(space => !space.is_verified).length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ 
          flex: 1, 
          background: 'rgba(128, 128, 128, 0.1)', 
          border: '1px solid rgba(128, 128, 128, 0.3)' 
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#808080', fontWeight: 600 }}>
              Total Spaces
            </Typography>
            <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
              {spaces.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Spaces Table */}
      <Card sx={{ 
        background: 'rgba(48, 48, 48, 0.8)', 
        border: '1px solid rgba(96, 96, 96, 0.3)' 
      }}>
        <TableContainer component={Paper} sx={{ background: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(96, 96, 96, 0.3)' } }}>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Space Name</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#B0B0B0' }}>
                    No coworking spaces found
                  </TableCell>
                </TableRow>
              ) : (
                spaces.map((space) => (
                  <TableRow 
                    key={space.id}
                    sx={{ 
                      '& td': { borderBottom: '1px solid rgba(96, 96, 96, 0.2)' },
                      '&:hover': { backgroundColor: 'rgba(128, 128, 128, 0.1)' }
                    }}
                  >
                    <TableCell sx={{ color: '#FFFFFF' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {space.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#B0B0B0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 16 }} />
                        <Box>
                          <Typography variant="body2">
                            {space.city}, {space.country}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#808080' }}>
                            {space.address}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(space.is_verified)}
                    </TableCell>
                    <TableCell sx={{ color: '#B0B0B0' }}>
                      N/A
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/spaces/${space.id}`)}
                            sx={{ color: '#808080', '&:hover': { color: '#FFFFFF' } }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {!space.is_verified ? (
                          <Tooltip title="Go to Pending Verification">
                            <IconButton
                              size="small"
                              onClick={() => navigate('/admin/spaces/pending')}
                              sx={{ color: '#FF9800', '&:hover': { color: '#FFB74D' } }}
                            >
                              <Assignment />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Unverify Space">
                            <IconButton
                              size="small"
                              onClick={() => handleUnverifySpace(space.id)}
                              sx={{ color: '#FF9800', '&:hover': { color: '#FFB74D' } }}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Space Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(48, 48, 48, 0.95)',
            border: '1px solid rgba(96, 96, 96, 0.3)',
            color: '#FFFFFF'
          }
        }}
      >
        <DialogTitle sx={{ color: '#FFFFFF', borderBottom: '1px solid rgba(96, 96, 96, 0.3)' }}>
          Coworking Space Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedSpace && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
                  {selectedSpace.title}
                </Typography>
                {getStatusChip(selectedSpace.is_verified)}
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#B0B0B0', mb: 0.5 }}>
                  Description:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {selectedSpace.description || 'No description provided'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#B0B0B0', mb: 0.5 }}>
                  Location:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {selectedSpace.address}
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {selectedSpace.city}, {selectedSpace.country}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#B0B0B0', mb: 0.5 }}>
                  Owner ID:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  #{selectedSpace.coworking_user_id}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#B0B0B0', mb: 0.5 }}>
                  Space ID:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  #{selectedSpace.id}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(96, 96, 96, 0.3)', pt: 2 }}>
          {selectedSpace && !selectedSpace.is_verified && (
            <Button
              onClick={() => handleVerifySpace(selectedSpace.id)}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} /> : <CheckCircle />}
              sx={{
                backgroundColor: '#4CAF50',
                color: '#FFFFFF',
                '&:hover': { backgroundColor: '#66BB6A' },
              }}
            >
              Verify Space
            </Button>
          )}
          {selectedSpace && selectedSpace.is_verified && (
            <Button
              onClick={() => handleUnverifySpace(selectedSpace.id)}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} /> : <Cancel />}
              sx={{
                backgroundColor: '#FF9800',
                color: '#FFFFFF',
                '&:hover': { backgroundColor: '#FFB74D' },
              }}
            >
              Unverify Space
            </Button>
          )}
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: '#B0B0B0' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
