import { IUserWithTokens, OrNull } from 'src/shared/types';
import React from 'react';

import { AppRoutes } from './routes';
import CssBaseline from '@material-ui/core/CssBaseline';
import { LogoutMenuItem } from './logout';
import { Pathname } from 'history';
import { ReduxState } from 'src/redux/reducers';
import { Sidebar } from './sidebar';
import { TopBar } from './topBar';
import { UserRoleEnum } from 'src/shared/enums';
import { routesNames } from './routes/utils';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

type SelectorState = {
  user: OrNull<IUserWithTokens>;
  pathName: Pathname;
};

export const App: React.FC = () => {
  const offsetFromTop = 0;

  const [activeItem, setActiveItem] = React.useState<OrNull<string>>(null);

  const { pathName, user } = useSelector(
    ({ user, router }: ReduxState): SelectorState => ({
      user: user.current.data,
      pathName: router.location.pathname,
    })
  );

  React.useEffect(() => {
    setActiveItem(routesNames[pathName]);
  }, [pathName]);

  return (
    <ThemeProvider theme={theme}>
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
        <TopBar user={user} setActiveItem={setActiveItem} />
        <Box
          id={'sidebarWrapper'}
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}>
          <Sidebar
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            logout={{
              index: user?.role === UserRoleEnum.ADMIN ? 4 : 3,
              component: <LogoutMenuItem />,
            }}
          />
          <AppRoutes topBarOffset={offsetFromTop} />
        </Box>
      </Box>
    </ThemeProvider>
  );
};
