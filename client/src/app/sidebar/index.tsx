import { AppRoute, appRoutes } from '../routes/utils';

import List from '@mui/material/List';
import { OrNull } from 'src/shared/types';
import { ReduxState } from 'src/redux/reducers';
import { SidebarRoute } from './route';
import { UserRoleEnum } from 'src/shared/enums';
import { makeUniqueId } from 'src/shared/utils';
import { useSelector } from 'react-redux';
import {
  BIG_SCREEN_MEDIA_QUERY,
  DRAWER_NARROW,
  DRAWER_WIDE,
  TOP_BAR_HEIGHT,
} from 'src/shared/constants';
import Drawer from '@mui/material/Drawer';
import { useMediaQuery } from '@mui/material';
import { useStyles } from '../styles';
import { useAppDispatch, useAppSelector } from '../context/hooks';
import {
  selectSidebarIsOpen,
  closeSidebar as closeSidebarAction,
} from 'src/redux/sidebar-state';

type CustomRoute = {
  index: number;
  component: React.ReactNode;
};

interface IProps {
  activeItem: OrNull<string>;
  logout: CustomRoute;
  setActiveItem: React.Dispatch<React.SetStateAction<OrNull<string>>>;
}

type SelectorState = {
  loggedIn: boolean;
  admin?: boolean;
};

export const Sidebar: React.FC<IProps> = ({
  activeItem,
  logout,
  setActiveItem,
}) => {
  const offsetFromTop = TOP_BAR_HEIGHT;

  const isBigScreen = useMediaQuery(BIG_SCREEN_MEDIA_QUERY);

  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);

  const { admin, loggedIn } = useSelector(
    ({ user }: ReduxState): SelectorState => {
      return {
        admin: user.current.data?.role === UserRoleEnum.ADMIN,
        loggedIn: user.current.loggedIn,
      };
    }
  );

  const updateActiveItem = (item?: string): (() => void) => {
    return (): void => {
      if (item) {
        setActiveItem(item);
      }
    };
  };

  const closeSidebar = () => {
    dispatch(closeSidebarAction());
  };

  const drawerWidth = isSidebarOpen ? DRAWER_WIDE : DRAWER_NARROW;
  const classes = useStyles({ drawerWidth });

  return loggedIn ? (
    <Drawer
      sx={{
        width: drawerWidth,
      }}
      variant={isBigScreen ? 'persistent' : 'temporary'}
      classes={{
        paper: classes.drawerPaper,
      }}
      open={isBigScreen || isSidebarOpen}
      // onClose={() => handleSidebarOpen(false)}
      onClose={closeSidebar}
      anchor="left">
      <div className={classes.toolbar}>
        <List style={{ marginBlockStart: offsetFromTop }}>
          {appRoutes
            .filter((route: AppRoute): boolean => {
              return route.inNavigation;
            })
            .map((route: AppRoute, index: number): OrNull<JSX.Element> => {
              if (index === logout.index) {
                return (
                  <SidebarRoute
                    key={makeUniqueId()}
                    activeItem={activeItem}
                    appendedRoute={logout.component}
                    route={route}
                    updateActiveItem={updateActiveItem}
                    isSidebarOpen={isSidebarOpen}
                  />
                );
              }

              // * Prevent non-admins from seeing admin sidebar option
              if (!admin && route.to === `/admin`) {
                return null;
              }

              return (
                <SidebarRoute
                  key={route.id}
                  activeItem={activeItem}
                  route={route}
                  updateActiveItem={updateActiveItem}
                  isSidebarOpen={isSidebarOpen}
                />
              );
            })}
        </List>
      </div>
    </Drawer>
  ) : null;
};
