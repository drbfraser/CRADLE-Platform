import { IUserWithTokens, OrNull } from 'src/shared/types';
import {
  StyledEngineProvider,
  Theme,
  ThemeProvider,
  createTheme,
} from '@mui/material/styles';

import { AppRoutes } from './routes';
import { ContextProvider } from 'src/context';
import CssBaseline from '@material-ui/core/CssBaseline';
import { DimensionsContextProvider } from './context';
import Drawer from '@mui/material/Drawer';
import { LogoutMenuItem } from './logout';
import { Pathname } from 'history';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { Sidebar } from './sidebar';
import { TopBar } from './topBar';
import { UserRoleEnum } from 'src/shared/enums';
import { routesNames } from './routes/utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const theme = createTheme();

type SelectorState = {
  loggedIn: boolean;
  user: OrNull<IUserWithTokens>;
  pathName: Pathname;
};

export const App: React.FC = () => {
  const [drawerWidth, setDrawerWidth] = useState(120);
  const offsetFromTop = 36;
  const topBar = React.useRef<OrNull<HTMLElement>>(null);

  const classes = useStyles({
    drawerWidth: drawerWidth,
  });

  const [activeItem, setActiveItem] = React.useState<OrNull<string>>(null);
  const isBigScreen = useMediaQuery('(min-width:800px)');
  const [isSidebarOpen, setIsSidebarOpen] =
    React.useState<boolean>(isBigScreen);

  const { loggedIn, pathName, user } = useSelector(
    ({ user, router }: ReduxState): SelectorState => ({
      loggedIn: user.current.loggedIn,
      user: user.current.data,
      pathName: router.location.pathname,
    })
  );

  React.useEffect(() => {
    setActiveItem(routesNames[pathName]);
  }, [pathName]);

  React.useEffect(() => {
    setIsSidebarOpen(isBigScreen);
  }, [isBigScreen]);

  const handleSidebarOpen = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
    setDrawerWidth(isOpen ? 120 : 60);
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <ContextProvider>
          <DimensionsContextProvider
            drawerWidth={drawerWidth}
            offsetFromTop={offsetFromTop}
            isBigScreen={isBigScreen}>
            <CssBaseline />
            <div className={classes.root}>
              <TopBar
                ref={topBar}
                user={user}
                setActiveItem={setActiveItem}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={handleSidebarOpen}
              />
              {loggedIn ? (
                <Drawer
                  className={classes.drawer}
                  variant={isBigScreen ? 'persistent' : 'temporary'}
                  classes={{
                    paper: classes.drawerPaper,
                  }}
                  open={isBigScreen || isSidebarOpen}
                  onClose={() => handleSidebarOpen(false)}
                  anchor="left">
                  <div className={classes.toolbar} />
                  <Sidebar
                    activeItem={activeItem}
                    setActiveItem={setActiveItem}
                    isSidebarOpen={isSidebarOpen}
                    logout={{
                      index: user?.role === UserRoleEnum.ADMIN ? 4 : 3,
                      component: (
                        <LogoutMenuItem isSidebarOpen={isSidebarOpen} />
                      ),
                    }}
                  />
                </Drawer>
              ) : null}
              <AppRoutes topBarOffset={topBar.current?.offsetHeight} />
            </div>
          </DimensionsContextProvider>
        </ContextProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
