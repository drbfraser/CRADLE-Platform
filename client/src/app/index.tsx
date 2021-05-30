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

type SelectorState = {
  loggedIn: boolean;
  user: OrNull<IUserWithTokens>;
  pathName: Pathname;
};

export const App: React.FC = () => {
  const drawerWidth = React.useRef<number>(120);
  const offsetFromTop = React.useRef<number>(36);
  const topBar = React.useRef<OrNull<HTMLElement>>(null);
  const classes = useStyles({
    drawerWidth: drawerWidth.current,
    offsetFromTop: offsetFromTop.current,
  });

  const [activeItem, setActiveItem] = React.useState<OrNull<string>>(null);
  const [open, setOpen] = React.useState<boolean>(true);

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
            open={open}
            handleOpen={setOpen}
          />
          {loggedIn && open ? (
            <Drawer
              className={classes.drawer}
              variant="persistent"
              classes={{
                paper: classes.drawerPaper,
              }}
              open={open}
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
