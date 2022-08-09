import { Callback, OrNull, OrUndefined } from 'src/shared/types';

import { AppRoute } from '../../routes/utils';
import { Link } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';
import Typography from '@mui/material/Typography';
import { useDimensionsContext } from 'src/app/context/hooks';
import { useStyles } from '../../styles';

interface IProps {
  activeItem: OrNull<string>;
  route: AppRoute;
  updateActiveItem: Callback<OrUndefined<OrNull<string>>, () => void>;
  appendedRoute?: React.ReactNode;
  isSidebarOpen: boolean;
}

export const SidebarRoute: React.FC<IProps> = ({
  activeItem,
  route,
  updateActiveItem,
  appendedRoute,
  isSidebarOpen,
}) => {
  const { drawerWidth } = useDimensionsContext();
  const classes = useStyles({ drawerWidth });

  if (!route.to) {
    return null;
  }

  return (
    <>
      <ListItem
        className={classes.listItem}
        button={true}
        component={Link}
        to={route.to}
        selected={activeItem === route.name}
        onClick={updateActiveItem(route.name)}>
        <ListItemIcon classes={{ root: classes.icon }}>
          {route.icon}
        </ListItemIcon>
        {isSidebarOpen && (
          <ListItemText
            disableTypography={true}
            className={classes.itemText}
            primary={
              <Typography className={classes.sidebar}>{route.title}</Typography>
            }
          />
        )}
      </ListItem>
      {appendedRoute}
    </>
  );
};
