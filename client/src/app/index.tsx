import { IUserWithTokens, OrNull } from 'src/shared/types';
import React, { useState } from 'react';

import { AppRoutes } from './routes';
import CssBaseline from '@material-ui/core/CssBaseline';
import { DimensionsContextProvider } from './context';
import Drawer from '@mui/material/Drawer';
import { LogoutMenuItem } from './logout';
import { Pathname } from 'history';
import { ReduxState } from 'src/redux/reducers';
import { Sidebar } from './sidebar';
import { TopBar } from './topBar';
import { UserRoleEnum } from 'src/shared/enums';
import { routesNames } from './routes/utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';

type SelectorState = {
  loggedIn: boolean;
  user: OrNull<IUserWithTokens>;
  pathName: Pathname;
};

const DRAWER_WIDE = 120;
const DRAWER_NARROW = 60;
export const App: React.FC = () => {
  const [drawerWidth, setDrawerWidth] = useState(120);
  const offsetFromTop = 100;

  const [activeItem, setActiveItem] = React.useState<OrNull<string>>(null);
  const isBigScreen = useMediaQuery('(min-width:800px)');
  const [isSidebarOpen, setIsSidebarOpen] =
    React.useState<boolean>(isBigScreen);

  const classes = useStyles({
    drawerWidth: drawerWidth,
  });

  const { loggedIn, pathName, user } = useSelector(
    ({ user, router }: ReduxState): SelectorState => ({
      loggedIn: user.current.loggedIn,
      user: user.current.data,
      pathName: router.location.pathname,
    })
  );

  const handleSidebarOpen = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
    setDrawerWidth(isOpen ? DRAWER_WIDE : DRAWER_NARROW);
  };

  React.useEffect(() => {
    setActiveItem(routesNames[pathName]);
  }, [pathName]);

  React.useEffect(() => {
    handleSidebarOpen(isBigScreen);
  }, [isBigScreen]);

  return (
    <DimensionsContextProvider
      drawerWidth={drawerWidth}
      offsetFromTop={offsetFromTop}
      isBigScreen={isBigScreen}>
      <CssBaseline />
      <div className={classes.root}>
        <TopBar
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
            <div className={classes.toolbar}>
              <Sidebar
                activeItem={activeItem}
                setActiveItem={setActiveItem}
                isSidebarOpen={isSidebarOpen}
                logout={{
                  index: user?.role === UserRoleEnum.ADMIN ? 4 : 3,
                  component: <LogoutMenuItem isSidebarOpen={isSidebarOpen} />,
                }}
              />
            </div>
          </Drawer>
        ) : null}
        <AppRoutes topBarOffset={offsetFromTop} />
      </div>
    </DimensionsContextProvider>
  );
};
