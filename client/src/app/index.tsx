import { IUserWithTokens, OrNull } from 'src/shared/types';
import React from 'react';

import { AppRoutes } from './routes';
import { CssBaseline } from '@mui/material';
import { Pathname } from 'history';
import { ReduxState } from 'src/redux/reducers';
import { Sidebar } from './sidebar';
import { TopBar } from './topBar';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

type SelectorState = {
  user: OrNull<IUserWithTokens>;
};

export const App: React.FC = () => {
  const { user } = useSelector(
    ({ user }: ReduxState): SelectorState => ({
      user: user.current.data,
    })
  );

  return (
    <>
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
        <TopBar user={user} />
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
    </>
  );
};
