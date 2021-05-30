import { IUserWithTokens, OrNull } from 'src/shared/types';
import { useDispatch, useSelector } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import AppImg from './img/app_icon.png';
import { Icon } from 'semantic-ui-react';
import IconButton from '@material-ui/core/IconButton';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import MenuIcon from '@material-ui/icons/Menu';
import React, { useState } from 'react';
import { ReduxState } from 'src/redux/reducers';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { push } from 'connected-react-router';
import { useStyles } from './styles';
import { Menu, MenuItem } from '@material-ui/core';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import ChangePassword from './changePassword/ChangePassword';
import { userRoleLabels } from 'src/shared/constants';
import { SideBarContext } from '../../context/SideBarContext';

interface IProps {
  user: OrNull<IUserWithTokens>;
  setActiveItem: React.Dispatch<React.SetStateAction<OrNull<string>>>;
  handleToggleSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TopBar = React.forwardRef<HTMLElement, IProps>(
  ({ user, setActiveItem, handleToggleSidebar}, ref) => {
    const loggedIn = useSelector(({ user }: ReduxState): boolean => {
      return user.current.loggedIn;
    });

    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const {isSideBarOpen, setIsSideBarOpen} = React.useContext(SideBarContext);

    const classes = useStyles();

    const dispatch = useDispatch();

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
      setIsSideBarOpen(!isSideBarOpen);
      handleToggleSidebar(!isSideBarOpen);
    }

    return (
      <AppBar className={classes.appBar} position="fixed" ref={ref}>
        <Toolbar>
          <IconButton
            onClick={toggleSidebar}
            color="inherit">
            {isSideBarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
          <img alt="appIcon" src={AppImg} className="appIcon" />
          <Typography className={classes.title} noWrap={true}>
            CRADLE
          </Typography>
          {loggedIn && (
            <div className={classes.navRightIcons}>
              <IconButton
                className={classes.toolbarButtons}
                color="inherit"
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
                <Icon name="user circle" size="large" />
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
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={() => setMenuAnchorEl(null)}
                getContentAnchorEl={null}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}>
                <MenuItem onClick={handleChangePassword}>
                  Change Password
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
                color="inherit">
                <Icon name="help" size="small" />
              </IconButton>
            </div>
          )}
        </Toolbar>
      </AppBar>
    );
  }
);
