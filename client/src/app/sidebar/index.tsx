import List from '@mui/material/List';
import { UserRoleEnum } from 'src/shared/enums';
import { makeUniqueId } from 'src/shared/utils';
import { TOP_BAR_HEIGHT } from 'src/shared/constants';
import Drawer from '@mui/material/Drawer';
import {
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from 'src/shared/hooks';
import {
  selectSidebarIsOpen,
  closeSidebar as closeSidebarAction,
} from 'src/redux/sidebar-state';
import { MouseEventHandler, ReactNode, useMemo } from 'react';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useLogout } from 'src/shared/hooks/auth/useLogout';
import { Link, useLocation } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PollIcon from '@mui/icons-material/Poll';
import SchoolIcon from '@mui/icons-material/School';
import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';
import SettingsIcon from '@mui/icons-material/Settings';

type SidebarProps = {
  drawerWidth: string;
  isBigScreen: boolean;
};
export const Sidebar = ({ drawerWidth, isBigScreen }: SidebarProps) => {
  const offsetFromTop = TOP_BAR_HEIGHT;

  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);
  const location = useLocation();

  const currentUser = useAppSelector(selectCurrentUser);

  const isLoggedIn = currentUser.loggedIn;
  const isAdmin = currentUser.data?.role === UserRoleEnum.ADMIN;

  const closeSidebar = () => {
    dispatch(closeSidebarAction());
  };

  const logoutButtonId = useMemo(() => makeUniqueId(), []);

  const { handleLogout } = useLogout();

  const isEnabled = isLoggedIn && location.pathname !== '/';

  return isEnabled ? (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
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
          {navItems.map((navItem) => (
            <SidebarButton key={navItem.to} {...navItem} />
          ))}
          {/* Only show admin button to admins. */}
          {isAdmin ? (
            <SidebarButton
              key={'/admin'}
              to={'/admin'}
              title={'Admin'}
              icon={<SettingsIcon fontSize="large" />}
            />
          ) : null}
          {/* Logout button. */}
          <SidebarButton
            key={logoutButtonId}
            icon={<ExitToAppIcon fontSize="large" />}
            title={'Logout'}
            onClick={handleLogout}
          />
        </List>
      </Box>
    </Drawer>
  ) : null;
};

type SidebarButtonProps = {
  title: string;
  icon: ReactNode;
  to?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

const SidebarButton = ({ title, icon, to, onClick }: SidebarButtonProps) => {
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);

  return (
    <ListItemButton
      sx={{
        display: `flex`,
        flexDirection: `column`,
        alignItems: `center`,
      }}
      component={Link}
      to={to ?? ''}
      onClick={onClick}>
      <ListItemIcon
        sx={{
          color: `#F9FAFC`,
          justifyContent: `center`,
        }}>
        {icon}
      </ListItemIcon>
      {isSidebarOpen && (
        <ListItemText
          disableTypography={true}
          sx={{
            color: `white`,
          }}
          primary={
            <Typography
              sx={{
                fontFamily: `Open Sans`,
                fontWeight: 300,
                fontSize: 18,
              }}>
              {title}
            </Typography>
          }
        />
      )}
    </ListItemButton>
  );
};

const navItems = [
  {
    title: 'Referrals',
    to: '/referrals',
    icon: <SendIcon fontSize="large" />,
  },
  {
    title: 'Patients',
    to: '/patients',
    icon: <SupervisorAccountIcon fontSize="large" />,
  },
  {
    title: 'Statistics',
    to: '/stats',
    icon: <PollIcon fontSize="large" />,
  },
  {
    title: 'Resources',
    to: '/resources',
    icon: <SchoolIcon fontSize="large" />,
  },
];
