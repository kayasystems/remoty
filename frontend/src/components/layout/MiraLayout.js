import React, { useState } from 'react';
import {
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MiraSidebar from './MiraSidebar';
import MiraTopBar from './MiraTopBar';

const SIDEBAR_WIDTH = 258;

const MiraLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{
          width: { lg: SIDEBAR_WIDTH },
          flexShrink: { lg: 0 },
        }}
      >
        {isMobile ? (
          <MiraSidebar
            open={mobileOpen}
            onClose={handleDrawerToggle}
            variant="temporary"
          />
        ) : (
          <MiraSidebar open={true} variant="permanent" />
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        <MiraTopBar onMenuClick={handleDrawerToggle} />

        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: '#f8fafc',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              py: 3,
              px: { xs: 2, sm: 3 },
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default MiraLayout;
