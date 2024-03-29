import { useAppDispatch, useDimensionsContext } from '../context/hooks';

import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { useStyles } from '../styles';

interface IProps {
  isSidebarOpen: boolean;
}

export const LogoutMenuItem: React.FC<IProps> = ({ isSidebarOpen }) => {
  const { drawerWidth } = useDimensionsContext();
  const classes = useStyles({ drawerWidth });

  const dispatch = useAppDispatch();

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
