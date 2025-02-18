import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Box, CssBaseline } from '@mui/material';

import { TopLevelContextProviders } from 'src/context/providers/TopLevelContextProviders';
import { AppRoutes } from './routes';
import { TopBar } from './topBar';
import { SidebarWrapper } from './sidebar/SidebarWrapper';

export const App: React.FC = () => {
  return (
    <TopLevelContextProviders>
      <ReactQueryDevtools />
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

        <SidebarWrapper>
          <AppRoutes />
        </SidebarWrapper>
      </Box>
    </TopLevelContextProviders>
  );
};
