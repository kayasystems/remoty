// src/components/employer/CoworkingSpacesPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip
} from '@mui/material';
import { Business, LocationOn } from '@mui/icons-material';
import { employerApi } from '../../services/employer';

export default function CoworkingSpacesPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(10); // default 10 km
  const [spaces, setSpaces] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch all employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employerApi.get('/employer/employees');
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load employees.');
      }
    };
    fetchEmployees();
  }, []);

  // Fetch coworking spaces and selected employee when ID or distance changes
  useEffect(() => {
    if (!selectedEmployeeId) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const emp = employees.find(e => e.id === parseInt(selectedEmployeeId));
        setSelectedEmployee(emp);

        const res = await employerApi.get(
          `/employer/coworking-spaces?employee_id=${selectedEmployeeId}&max_distance_km=${selectedDistance}`
        );
        setSpaces(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load coworking spaces.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedEmployeeId, selectedDistance, employees]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Glassmorphism Header */}
        <Box sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 38, 53, 0.1)',
          borderRadius: '16px',
          boxShadow: 'none'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ backgroundColor: '#8B2635', width: 56, height: 56 }}>
              <Business />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B2635 !important', mb: 1 }}>
                Nearby Coworking Spaces
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Find and explore coworking spaces for your team members
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Employee and Distance Selectors */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Select Employee</InputLabel>
              <Select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                label="Select Employee"
              >
                <MenuItem value="">-- Select an employee --</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.city})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedEmployeeId && (
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Search Radius</InputLabel>
                <Select
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(parseFloat(e.target.value))}
                  label="Search Radius"
                >
                  <MenuItem value={5}>5 km</MenuItem>
                  <MenuItem value={10}>10 km</MenuItem>
                  <MenuItem value={20}>20 km</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Paper>

        {/* Show selected employee details */}
        {selectedEmployee && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#8B2635', mb: 2 }}>
              Employee Details
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`} />
              <Chip label={selectedEmployee.email} />
              <Chip label={selectedEmployee.city} icon={<LocationOn />} />
            </Box>
          </Paper>
        )}

        {/* Loading spinner */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#8B2635' }} />
            <Typography sx={{ ml: 2, color: 'text.secondary' }}>
              Loading coworking spaces...
            </Typography>
          </Box>
        )}

        {/* Coworking space list */}
        {!loading && spaces.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#8B2635', mb: 3 }}>
              Found {spaces.length} coworking space(s) within {selectedDistance} km
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {spaces.map(space => (
                <Card key={space.id} sx={{ borderRadius: '12px' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                          {space.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {space.address}, {space.city}
                        </Typography>
                        <Chip 
                          label={`${space.distance_km} km away`} 
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}
                        />
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() =>
                          navigate("/employer/coworking/checkout", {
                            state: {
                              employeeId: selectedEmployeeId,
                              coworkingSpace: space,
                            },
                          })
                        }
                        sx={{
                          backgroundColor: '#8B2635',
                          '&:hover': { backgroundColor: '#7a1f2b' },
                          textTransform: 'none'
                        }}
                      >
                        Book Now
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* No results case */}
        {!loading && selectedEmployeeId && spaces.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              No coworking spaces found within {selectedDistance} km
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
