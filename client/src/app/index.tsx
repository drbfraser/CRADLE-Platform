import React from 'react';

import { AppRoutes } from './routes';
import { CssBaseline } from '@mui/material';
import { Sidebar } from './sidebar';
import { TopBar } from './topBar';
import { Box } from '@mui/material';
import { TopLevelContextProviders } from './providers/TopLevelContextProviders';

export const App: React.FC = () => {
  return (
    <TopLevelContextProviders>
      <CssBaseline />
      <Box
        id={'rootContainer'}
        sx={{
          height: '100vh',
          width: '100%',
          maxHeight: '100vh',
          maxWidth: '100vw',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
        }}>
        <TopBar />
        <Box
          id={'sidebarWrapper'}
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}>
          <Sidebar />
          <AppRoutes />
        </Box>
      </Box>
    </TopLevelContextProviders>
  );
};
