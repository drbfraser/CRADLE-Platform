import { useAppDispatch, useAppSelector } from '../../shared/hooks';

import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { useStyles } from '../styles';
import { selectSidebarIsOpen } from 'src/redux/sidebar-state';
import { DRAWER_NARROW, DRAWER_WIDE } from 'src/shared/constants';

export const LogoutMenuItem: React.FC = () => {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);
  const drawerWidth = isSidebarOpen ? DRAWER_WIDE : DRAWER_NARROW;
  const classes = useStyles({ drawerWidth });

  const handleLogout = (): void => {
    dispatch(logoutUser());
  };

  return (
    <ListItem className={classes.listItem} button={true} onClick={handleLogout}>
      <ListItemIcon classes={{ root: classes.icon }}>
        <ExitToAppIcon fontSize="large" />
      </ListItemIcon>
      {isSidebarOpen && (
        <ListItemText
          disableTypography
          className={classes.itemText}
          primary={<Typography className={classes.sidebar}>Logout</Typography>}
        />
      )}
    </ListItem>
  );
};
