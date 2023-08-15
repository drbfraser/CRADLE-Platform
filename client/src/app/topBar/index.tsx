import { IUserWithTokens, OrNull } from 'src/shared/types';
import { Menu, MenuItem } from '@mui/material';
import { useAppDispatch, useDimensionsContext } from '../context/hooks';

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
import { useState } from 'react';
import { useStyles } from './styles';
import { userRoleLabels } from 'src/shared/constants';

interface IProps {
  user: OrNull<IUserWithTokens>;
  setActiveItem: (item: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const TopBar = ({
  user,
  setActiveItem,
  isSidebarOpen,
  setIsSidebarOpen,
}: IProps) => {
  const { isBigScreen } = useDimensionsContext();
  const loggedIn = useSelector(({ user }: ReduxState): boolean => {
    return user.current.loggedIn;
  });

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const classes = useStyles();

  const dispatch = useAppDispatch();

  const navigateSecretKeyDetailPage = (): void => {
    setMenuAnchorEl(null);
    dispatch(push('/secretKey'));
  };

  const navigateToHelpPage = (): void => {
    setActiveItem(`Resources`);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    <AppBar className={classes.appBar} position="fixed">
      <Toolbar>
        {loggedIn && (
          <IconButton onClick={toggleSidebar} color="inherit" size="large">
            {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        )}

        <img alt="appIcon" src={AppImg} className="appIcon" />
        {isBigScreen && (
          <Typography className={classes.title} noWrap={true}>
            CRADLE
          </Typography>
        )}
        {loggedIn && (
          <div className={classes.navRightIcons}>
            <IconButton
              className={classes.toolbarButtons}
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
              className={classes.toolbarButtonsPadded}
              onClick={navigateToHelpPage}
              color="inherit"
              size="large">
              <Icon name="help" size="small" />
            </IconButton>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};
