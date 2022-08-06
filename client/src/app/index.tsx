import { IUserWithTokens, OrNull } from 'src/shared/types';
import React, { useState } from 'react';

import { ContextProvider } from 'src/context';
import CssBaseline from '@material-ui/core/CssBaseline';
import { DimensionsContextProvider } from './context';
import Drawer from '@material-ui/core/Drawer';
import { LogoutMenuItem } from './logout';
import { Pathname } from 'history';
import { ReduxState } from 'src/redux/reducers';
import { Routes } from './routes';
import { Sidebar } from './sidebar';
import { TopBar } from './topBar';
import { UserRoleEnum } from 'src/shared/enums';
import { routesNames } from './routes/utils';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';

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
                  component: <LogoutMenuItem isSidebarOpen={isSidebarOpen} />,
                }}
              />
            </Drawer>
          ) : null}
          <Routes topBarOffset={topBar.current?.offsetHeight} />
        </div>
      </DimensionsContextProvider>
    </ContextProvider>
  );
};
