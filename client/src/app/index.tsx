import { ActualUser, OrNull } from '@types';

import { ContextProvider } from '../context';
import CssBaseline from '@material-ui/core/CssBaseline';
import { DimensionsContextProvider } from './context';
import Drawer from '@material-ui/core/Drawer';
import { LogoutMenuItem } from './logout';
import { Pathname } from 'history';
import React from 'react';
import { ReduxState } from '../redux/reducers';
import { RoleEnum } from '../enums';
import { Routes } from './routes';
import { Sidebar } from './sidebar';
import { StatisticsMenuItem } from './statistics';
import { TopBar } from './topBar';
import { routesNames } from './routes/utils';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';

type SelectorState = {
  loggedIn: boolean;
  user: OrNull<ActualUser>;
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
  const [openStats, setOpenStats] = React.useState<boolean>(true);

  const { loggedIn, pathName, user } = useSelector(
    ({ user, router }: ReduxState): SelectorState => ({
      loggedIn: user.current.loggedIn,
      user: user.current.data,
      pathName: router.location.pathname,
    })
  );

  React.useEffect(() => {
    setActiveItem(routesNames[pathName]);
    setOpenStats(false);
  }, [pathName]);

  return (
    <ContextProvider>
      <DimensionsContextProvider
        drawerWidth={drawerWidth.current}
        offsetFromTop={offsetFromTop.current}>
        <CssBaseline />
        <div className={classes.root}>
          <TopBar ref={topBar} user={user} setActiveItem={setActiveItem} />
          {loggedIn ? (
            <Drawer
              className={classes.drawer}
              variant="permanent"
              classes={{
                paper: classes.drawerPaper,
              }}
              anchor="left">
              <div className={classes.toolbar} />
              <Sidebar
                activeItem={activeItem}
                setActiveItem={setActiveItem}
                logout={{
                  index: user?.roles.includes(RoleEnum.ADMIN) ? 5 : 4,
                  component: <LogoutMenuItem />,
                }}
                statistics={{
                  index: 2,
                  component: (
                    <StatisticsMenuItem
                      activeItem={activeItem}
                      openStats={openStats}
                      setOpenStats={setOpenStats}
                    />
                  ),
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
