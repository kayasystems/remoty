import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  PendingActions,
  LocationOn,
  Refresh,
  CheckCircle,
  Visibility,
} from '@mui/icons-material';

export default function PendingSpaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingSpaces();
  }, []);

  const fetchPendingSpaces = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.get('/admin/spaces?verified=false');
      setSpaces(response.data.spaces || []);
    } catch (error) {
      console.error('Error fetching pending spaces:', error);
      setError('Failed to load pending spaces. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySpace = async (spaceId) => {
    try {
      setActionLoading(true);
      await adminApi.put(`/admin/spaces/${spaceId}/verify`);
      await fetchPendingSpaces(); // Refresh the list
    } catch (error) {
      console.error('Error verifying space:', error);
      setError('Failed to verify space. Please try again.');
    } finally {
      setActionLoading(false);
    }
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
        <Typography sx={{ ml: 2, color: '#B0B0B0' }}>Loading pending spaces...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PendingActions sx={{ fontSize: 32, color: '#FF9800' }} />
          <Box>
            <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
              Pending Verification
            </Typography>
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
              Coworking spaces awaiting admin approval
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchPendingSpaces}
          sx={{
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(255, 152, 0, 0.3)',
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

      {/* Stats Card */}
      <Card sx={{ 
        mb: 3,
        background: 'rgba(255, 152, 0, 0.1)', 
        border: '1px solid rgba(255, 152, 0, 0.3)' 
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PendingActions sx={{ fontSize: 40, color: '#FF9800' }} />
            <Box>
              <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 600 }}>
                Spaces Awaiting Verification
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                {spaces.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                {spaces.length === 0 ? 'All spaces are verified!' : 'Requires admin action'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pending Spaces Table */}
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
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CheckCircle sx={{ fontSize: 48, color: '#4CAF50' }} />
                      <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                        No Pending Verifications
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                        All coworking spaces have been verified!
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                spaces.map((space) => (
                  <TableRow 
                    key={space.id}
                    sx={{ 
                      '& td': { borderBottom: '1px solid rgba(96, 96, 96, 0.2)' },
                      '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.1)' }
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
                    <TableCell sx={{ color: '#B0B0B0' }}>
                      <Box>
                        <Typography variant="body2">
                          N/A
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#808080' }}>
                          No date available
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Verify Space">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={actionLoading ? <CircularProgress size={16} /> : <CheckCircle />}
                            onClick={() => handleVerifySpace(space.id)}
                            disabled={actionLoading}
                            sx={{
                              backgroundColor: '#4CAF50',
                              color: '#FFFFFF',
                              minWidth: 'auto',
                              px: 2,
                              '&:hover': { backgroundColor: '#66BB6A' },
                            }}
                          >
                            Verify
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {spaces.length > 0 && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#FF9800', fontWeight: 600 }}>
            💡 Quick Actions:
          </Typography>
          <Typography variant="body2" sx={{ color: '#B0B0B0', mt: 0.5 }}>
            • Click "Verify" to approve a coworking space
            • Verified spaces will appear in the "Verified Spaces" section
            • Users can only book verified coworking spaces
          </Typography>
        </Box>
      )}
    </Box>
  );
}
