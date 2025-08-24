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
  Verified,
  LocationOn,
  Refresh,
  Cancel,
  Visibility,
} from '@mui/icons-material';

export default function VerifiedSpaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVerifiedSpaces();
  }, []);

  const fetchVerifiedSpaces = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.get('/admin/spaces?verified=true');
      setSpaces(response.data.spaces || []);
    } catch (error) {
      console.error('Error fetching verified spaces:', error);
      setError('Failed to load verified spaces. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnverifySpace = async (spaceId) => {
    try {
      setActionLoading(true);
      await adminApi.put(`/admin/spaces/${spaceId}/unverify`);
      await fetchVerifiedSpaces(); // Refresh the list
    } catch (error) {
      console.error('Error unverifying space:', error);
      setError('Failed to unverify space. Please try again.');
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
        <Typography sx={{ ml: 2, color: '#B0B0B0' }}>Loading verified spaces...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Verified sx={{ fontSize: 32, color: '#4CAF50' }} />
          <Box>
            <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
              Verified Spaces
            </Typography>
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
              Approved coworking spaces available for booking
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchVerifiedSpaces}
          sx={{
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            color: '#FFFFFF',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.3)',
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
        background: 'rgba(76, 175, 80, 0.1)', 
        border: '1px solid rgba(76, 175, 80, 0.3)' 
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Verified sx={{ fontSize: 40, color: '#4CAF50' }} />
            <Box>
              <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                Verified & Active Spaces
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                {spaces.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                {spaces.length === 0 ? 'No verified spaces yet' : 'Available for user bookings'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Verified Spaces Table */}
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
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Verified Date</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Verified sx={{ fontSize: 48, color: '#808080' }} />
                      <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                        No Verified Spaces
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                        Spaces will appear here after admin verification
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
                      '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
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
                        <Tooltip title="Unverify Space">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={actionLoading ? <CircularProgress size={16} /> : <Cancel />}
                            onClick={() => handleUnverifySpace(space.id)}
                            disabled={actionLoading}
                            sx={{
                              borderColor: '#FF9800',
                              color: '#FF9800',
                              minWidth: 'auto',
                              px: 2,
                              '&:hover': { 
                                borderColor: '#FFB74D',
                                color: '#FFB74D',
                                backgroundColor: 'rgba(255, 152, 0, 0.1)'
                              },
                            }}
                          >
                            Unverify
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
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
            ✅ Verified Space Benefits:
          </Typography>
          <Typography variant="body2" sx={{ color: '#B0B0B0', mt: 0.5 }}>
            • Available for user bookings and reservations
            • Displayed in employer coworking space search results
            • Can receive booking requests and payments
            • Click "Unverify" to remove from active listings if needed
          </Typography>
        </Box>
      )}
    </Box>
  );
}
