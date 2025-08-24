import React, { useState } from 'react';
import { employerApi } from '../../services/employer';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Paper,
  Divider,
  IconButton,
  Chip,
  Container,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Email,
  Schedule,
  ContentCopy,
  CheckCircle,
  PersonAdd,
  Link as LinkIcon,
  AccessTime,
} from '@mui/icons-material';

export default function AddEmployee() {
  const [email, setEmail] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateToken = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await employerApi.post('/employer/invite', {
        email: email,
        expires_in_minutes: minutes,
      });
      setTokenData(res.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to generate invite token.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (tokenData?.token) {
      try {
        await navigator.clipboard.writeText(tokenData.token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const getExpiryOptions = () => [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 180, label: '3 hours' },
    { value: 360, label: '6 hours' },
    { value: 720, label: '12 hours' },
    { value: 1440, label: '24 hours' },
    { value: 4320, label: '3 days' },
    { value: 10080, label: '7 days' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      p: 3,
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden'
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Glassmorphism Header */}
        <Paper sx={{ 
          p: 4, 
          mb: 4,
          background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 38, 53, 0.1)',
          borderRadius: '16px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ backgroundColor: '#8B2635', width: 56, height: 56 }}>
              <PersonAdd />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#8B2635', 
                mb: 1
              }}>
                Invite New Employee
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary',
                fontSize: '1.1rem'
              }}>
                Generate a secure invite token to onboard new team members
              </Typography>
            </Box>
          </Box>
        </Paper>

      <Grid container spacing={4}>
        {/* Invite Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            height: 'fit-content',
            background: '#ffffff',
            border: '1px solid rgba(139, 38, 53, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(139, 38, 53, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(139, 38, 53, 0.15)',
              borderColor: 'rgba(139, 38, 53, 0.3)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonAdd sx={{ color: '#8B2635', mr: 2, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#8B2635' }}>
                  Employee Details
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Employee Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@company.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#8B2635' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#8B2635',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B2635',
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#8B2635'
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{
                    '&.Mui-focused': {
                      color: '#8B2635'
                    }
                  }}>Token Expiry</InputLabel>
                  <Select
                    value={minutes}
                    label="Token Expiry"
                    onChange={(e) => setMinutes(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <AccessTime sx={{ color: '#8B2635', ml: 1 }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '12px',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8B2635',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8B2635',
                      }
                    }}
                  >
                    {getExpiryOptions().map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={generateToken}
                disabled={loading || !email}
                startIcon={<LinkIcon />}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8B2635 0%, #A0374B 100%)',
                  boxShadow: '0 4px 15px rgba(139, 38, 53, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #A0374B 0%, #8B2635 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(139, 38, 53, 0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(139, 38, 53, 0.3)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
              >
                {loading ? 'Generating...' : 'Generate Invite Token'}
              </Button>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 3,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.2)',
                    '& .MuiAlert-icon': {
                      color: '#d32f2f'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Token Result */}
        <Grid item xs={12} md={6}>
          {tokenData ? (
            <Card sx={{
              height: 'fit-content',
              background: '#ffffff',
              border: '1px solid rgba(139, 38, 53, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(139, 38, 53, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(139, 38, 53, 0.15)',
                borderColor: 'rgba(139, 38, 53, 0.3)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircle sx={{ color: '#16a34a', mr: 2, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#8B2635' }}>
                    Invite Token Generated
                  </Typography>
                </Box>

                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                    '& .MuiAlert-icon': {
                      color: '#16a34a'
                    }
                  }}
                >
                  Token successfully generated for <strong>{email}</strong>
                </Alert>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#8B2635' }}>
                    Invite Token
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: 'rgba(139, 38, 53, 0.05)',
                      border: '1px solid rgba(139, 38, 53, 0.1)',
                      borderRadius: '12px',
                      position: 'relative',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        color: '#374151',
                        pr: 6,
                      }}
                    >
                      {tokenData.token}
                    </Typography>
                    <IconButton
                      onClick={copyToClipboard}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: copied ? '#16a34a' : '#8B2635',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 38, 53, 0.1)'
                        }
                      }}
                    >
                      {copied ? <CheckCircle /> : <ContentCopy />}
                    </IconButton>
                  </Paper>
                  {copied && (
                    <Typography variant="caption" sx={{ color: '#16a34a', mt: 1, display: 'block' }}>
                      ✓ Copied to clipboard
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#8B2635' }}>
                    Token Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Email
                      </Typography>
                      <Chip 
                        label={email} 
                        size="small" 
                        variant="outlined"
                        sx={{
                          borderColor: '#8B2635',
                          color: '#8B2635'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Expires At
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                        {new Date(tokenData.expires_at).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Status
                      </Typography>
                      <Chip 
                        label="Active" 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                          color: '#16a34a',
                          fontWeight: 600,
                          border: '1px solid rgba(76, 175, 80, 0.2)'
                        }} 
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{
              height: 'fit-content',
              background: '#ffffff',
              border: '2px dashed rgba(139, 38, 53, 0.3)',
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(139, 38, 53, 0.08)'
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <LinkIcon sx={{ fontSize: 48, color: 'rgba(139, 38, 53, 0.4)', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#8B2635', mb: 1, fontWeight: 600 }}>
                  No Token Generated
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(139, 38, 53, 0.7)' }}>
                  Fill in the employee details and click "Generate Invite Token" to create a secure invitation link.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Instructions */}
      <Card sx={{
        mt: 4,
        background: '#ffffff',
        border: '1px solid rgba(139, 38, 53, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(139, 38, 53, 0.1)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B2635' }}>
            📋 How to Use Invite Tokens
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#8B2635' }}>
                  1. Generate Token
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(139, 38, 53, 0.8)' }}>
                  Enter the employee's email and select an expiry time for the invite token.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#8B2635' }}>
                  2. Share Securely
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(139, 38, 53, 0.8)' }}>
                  Copy the generated token and share it with the employee through a secure channel.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#8B2635' }}>
                  3. Employee Joins
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(139, 38, 53, 0.8)' }}>
                  The employee uses the token to complete their registration and join your team.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
    </Box>
  );
}
