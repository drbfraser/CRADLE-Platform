import React from 'react';

import { AppRoutes } from './routes';
import { CssBaseline } from '@mui/material';
import { TopBar } from './topBar';
import { Box } from '@mui/material';
import { TopLevelContextProviders } from 'src/context/providers/TopLevelContextProviders';
import { SidebarWrapper } from './sidebar/SidebarWrapper';

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

        <SidebarWrapper>
          <AppRoutes />
        </SidebarWrapper>
      </Box>
    </TopLevelContextProviders>
  );
};
