import { IUserWithTokens, OrNull } from 'src/shared/types';

import { ContextProvider } from 'src/context';
import CssBaseline from '@material-ui/core/CssBaseline';
import { DimensionsContextProvider } from './context';
import Drawer from '@material-ui/core/Drawer';
import { LogoutMenuItem } from './logout';
import { Pathname } from 'history';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { UserRoleEnum } from 'src/shared/enums';
import { Routes } from './routes';
import { Sidebar } from './sidebar';
import { TopBar } from './topBar';
import { routesNames } from './routes/utils';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

type SelectorState = {
  loggedIn: boolean;
  user: OrNull<IUserWithTokens>;
  pathName: Pathname;
};

export const App: React.FC = () => {
  const drawerWidth = React.useRef<number>(200);
  const offsetFromTop = React.useRef<number>(36);
  const topBar = React.useRef<OrNull<HTMLElement>>(null);
  const classes = useStyles({
    drawerWidth: drawerWidth.current,
    offsetFromTop: offsetFromTop.current,
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

  const handleCloseSidebar = () => setIsSidebarOpen(false);

  return (
    <ContextProvider>
      <DimensionsContextProvider
        drawerWidth={drawerWidth.current}
        offsetFromTop={offsetFromTop.current}>
        <CssBaseline />
        <div className={classes.root}>
          <TopBar
            ref={topBar}
            user={user}
            setActiveItem={setActiveItem}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          {loggedIn && isSidebarOpen ? (
            <Drawer
              className={classes.drawer}
              variant={isBigScreen ? 'persistent' : 'temporary'}
              classes={{
                paper: classes.drawerPaper,
              }}
              open={isSidebarOpen}
              onClose={handleCloseSidebar}
              anchor="left">
              <div className={classes.toolbar} />
              <Sidebar
                activeItem={activeItem}
                setActiveItem={setActiveItem}
                logout={{
                  index: user?.role === UserRoleEnum.ADMIN ? 4 : 3,
                  component: <LogoutMenuItem />,
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
