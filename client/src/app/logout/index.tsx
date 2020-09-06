import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { logoutUser } from '../../redux/reducers/user/currentUser';
import { useDimensionsContext } from '../context/hooks';
import { useDispatch } from 'react-redux';
import { useStyles } from '../styles';

export const LogoutMenuItem: React.FC = () => {
  const { drawerWidth, offsetFromTop } = useDimensionsContext();

  const classes = useStyles({ drawerWidth, offsetFromTop });

  const dispatch = useDispatch();

  const handleLogout = (): void => {
    dispatch(logoutUser());
  };

  return (
    <ListItem className={classes.listItem} button={true} onClick={handleLogout}>
      <ListItemIcon classes={{ root: classes.icon }}>
        <ExitToAppIcon fontSize="large" />
      </ListItemIcon>
      <ListItemText
        disableTypography
        className={classes.itemText}
        primary={<Typography className={classes.sidebar}>Logout</Typography>}
      />
    </ListItem>
  );
};
