import { AppRoute, appRoutes } from '../routes/utils';

import List from '@mui/material/List';
import { OrNull } from 'src/shared/types';
import { ReduxState } from 'src/redux/reducers';
import { SidebarRoute } from './route';
import { UserRoleEnum } from 'src/shared/enums';
import { makeUniqueId } from 'src/shared/utils';
import { useSelector } from 'react-redux';
import {
  DRAWER_NARROW,
  DRAWER_WIDE,
  TOP_BAR_HEIGHT,
} from 'src/shared/constants';
import Drawer from '@mui/material/Drawer';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'src/shared/hooks';
import {
  selectSidebarIsOpen,
  closeSidebar as closeSidebarAction,
  openSidebar as openSidebarAction,
} from 'src/redux/sidebar-state';
import { useCallback, useEffect } from 'react';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface IProps {
  activeItem: OrNull<string>;
  setActiveItem: React.Dispatch<React.SetStateAction<OrNull<string>>>;
}

type SelectorState = {
  loggedIn: boolean;
  admin?: boolean;
};

export const Sidebar: React.FC<IProps> = ({ activeItem, setActiveItem }) => {
  const offsetFromTop = TOP_BAR_HEIGHT;
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));

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

  useEffect(() => {
    // Close sidebar if screen is small.
    if (!isBigScreen) {
      dispatch(closeSidebarAction());
    } else {
      dispatch(openSidebarAction());
    }
  }, [isBigScreen]);

  const drawerWidth = isSidebarOpen ? DRAWER_WIDE : DRAWER_NARROW;

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch, logoutUser]);

  return loggedIn ? (
    <Drawer
      sx={{
        width: drawerWidth,
      }}
      variant={isBigScreen ? 'persistent' : 'temporary'}
      PaperProps={{
        sx: {
          /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#3b679e+0,34787e+0,45889f+51,65a6df+100 */
          background: `linear-gradient(to bottom,  #3b679e 0%,#34787e 0%,#45889f 51%,#65a6df 100%)`,
          filter:
            'progid:DXImageTransform.Microsoft.gradient( startColorstr=`#3b679e`, endColorstr=`#65a6df`,GradientType=0 )' /* IE6-9 */,
          width: drawerWidth,
        },
      }}
      open={isBigScreen || isSidebarOpen}
      onClose={closeSidebar}
      anchor="left">
      <Box>
        <List style={{ marginBlockStart: offsetFromTop }}>
          {appRoutes
            .filter((route: AppRoute): boolean => {
              return route.inNavigation;
            })
            .map((route: AppRoute, index: number): OrNull<JSX.Element> => {
              // * Prevent non-admins from seeing admin sidebar option
              if (!admin && route.to === `/admin`) {
                return null;
              }
              return (
                <SidebarRoute
                  key={route.id}
                  activeItem={activeItem}
                  route={route}
                  onClick={() => {
                    updateActiveItem(route.name);
                  }}
                />
              );
            })}
          {/* Logout button. */}
          <SidebarRoute
            key={makeUniqueId()}
            activeItem={activeItem}
            icon={<ExitToAppIcon fontSize="large" />}
            title={'Logout'}
            onClick={handleLogout}
          />
        </List>
      </Box>
    </Drawer>
  ) : null;
};
