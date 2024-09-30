import { IUserWithTokens, OrNull } from 'src/shared/types';
import { Box, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../shared/hooks';

import AppBar from '@mui/material/AppBar';
import AppImg from './img/app_icon.png';
import ChangePassword from './changePassword/ChangePassword';
import { Icon } from 'semantic-ui-react';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { ReduxState } from 'src/redux/reducers';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { push } from 'connected-react-router';
import { useSelector } from 'react-redux';
import { useCallback, useState } from 'react';
import { TOP_BAR_HEIGHT, userRoleLabels } from 'src/shared/constants';
import {
  selectSidebarIsOpen,
  toggleSidebar as toggleSidebarAction,
} from 'src/redux/sidebar-state';

interface IProps {
  user: OrNull<IUserWithTokens>;
}

export const TopBar = ({ user }: IProps) => {
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const dispatch = useAppDispatch();

  const loggedIn = useSelector(({ user }: ReduxState): boolean => {
    return user.current.loggedIn;
  });

  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);

  const toggleSidebar = useCallback(() => {
    dispatch(toggleSidebarAction());
  }, [dispatch]);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const navigateSecretKeyDetailPage = (): void => {
    setMenuAnchorEl(null);
    dispatch(push('/secretKey'));
  };

  const navigateToHelpPage = (): void => {
    dispatch(push(`/resources`));
  };

  const handleChangePassword = () => {
    setMenuAnchorEl(null);
    setChangePasswordOpen(true);
  };

  const handleLogout = () => {
    setMenuAnchorEl(null);
    dispatch(logoutUser());
  };

  const showUserDetails = () => {
    return (
      <div>
        <Typography variant="body1" noWrap>
          {user?.firstName} ({user ? userRoleLabels[user.role] : ''})
        </Typography>
        {user?.healthFacilityName && (
          <Typography variant="body2" noWrap>
            Healthcare Facility: {user?.healthFacilityName}
          </Typography>
        )}
      </div>
    );
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: `#15152B`,
        zIndex: theme.zIndex.drawer + 1,
        height: TOP_BAR_HEIGHT,
      }}>
      <Toolbar>
        {loggedIn && (
          <IconButton onClick={toggleSidebar} color="inherit" size="large">
            {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        )}

        <img alt="appIcon" src={AppImg} className="appIcon" />
        {isBigScreen && (
          <Typography
            noWrap={true}
            sx={{
              fontFamily: `Open Sans`,
              fontWeight: `bold`,
              fontSize: 36,
            }}>
            CRADLE
          </Typography>
        )}
        {loggedIn && (
          <Box
            sx={{
              margin: theme.spacing(0, 0, 0, `auto`),
            }}>
            <IconButton
              sx={{
                marginLeft: `auto`,
              }}
              color="inherit"
              onClick={(e) => setMenuAnchorEl(e.currentTarget)}
              size="large">
              <Icon name="user circle" size="large" />
              {isBigScreen && showUserDetails()}
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={() => setMenuAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}>
              {!isBigScreen && (
                <MenuItem disabled>{showUserDetails()}</MenuItem>
              )}
              <MenuItem onClick={handleChangePassword}>
                Change Password
              </MenuItem>
              <MenuItem onClick={navigateSecretKeyDetailPage}>
                Secret Key Details
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
            <ChangePassword
              open={changePasswordOpen}
              onClose={() => setChangePasswordOpen(false)}
            />
            <IconButton
              sx={{
                marginLeft: `auto`,
              }}
              onClick={navigateToHelpPage}
              color="inherit"
              size="large">
              <Icon name="help" size="small" />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
