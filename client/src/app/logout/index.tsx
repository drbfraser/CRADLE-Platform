import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';
import Typography from '@mui/material/Typography';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
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
