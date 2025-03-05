import {
  Box,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../shared/hooks';

import AppBar from '@mui/material/AppBar';
import AppImg from './img/app_icon.png';
import ChangePasswordDialog from './changePasswordDialog/ChangePasswordDialog';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { selectCurrentUser, selectIsLoggedIn } from 'src/redux/user-state';
import { useCallback, useState } from 'react';
import { TOP_BAR_HEIGHT, userRoleLabels } from 'src/shared/constants';
import {
  selectSidebarIsOpen,
  toggleSidebar as toggleSidebarAction,
} from 'src/redux/sidebar-state';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import { useLogout } from 'src/shared/hooks/auth/useLogout';

export const TopBar = () => {
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const user = useAppSelector(selectCurrentUser);

  const dispatch = useAppDispatch();

  const loggedIn = useAppSelector(selectIsLoggedIn);

  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);

  const toggleSidebar = useCallback(() => {
    dispatch(toggleSidebarAction());
  }, [dispatch]);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleChangePassword = () => {
    setMenuAnchorEl(null);
    setChangePasswordOpen(true);
  };

  const { handleLogout: logout } = useLogout();
  const handleLogout = () => {
    setMenuAnchorEl(null);
    logout();
  };

  const showUserDetails = () => {
    return (
      <div>
        <Typography variant="body1" noWrap>
          {user?.name} ({user ? userRoleLabels[user.role] : ''})
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
                borderRadius: '8px',
              }}
              color="inherit"
              onClick={(e) => setMenuAnchorEl(e.currentTarget)}
              size="large">
              <AccountCircleIcon
                sx={{
                  fontSize: '50px',
                  marginRight: '12px',
                }}
              />
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
              <MenuItem component={Link} to={'/secretKey'}>
                Secret Key Details
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
            <ChangePasswordDialog
              open={changePasswordOpen}
              onClose={() => setChangePasswordOpen(false)}
            />
            <Button
              sx={{
                marginLeft: `auto`,
                borderRadius: '100%',
                aspectRatio: '1',
              }}
              component={Link}
              to={'/resources'}
              color="inherit"
              size="large">
              <QuestionMarkIcon fontSize="large" />
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
