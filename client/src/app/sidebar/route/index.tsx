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
}

export const SidebarRoute: React.FC<IProps> = ({
  activeItem,
  route,
  updateActiveItem,
  appendedRoute,
}) => {
  const { drawerWidth, offsetFromTop } = useDimensionsContext();
  const classes = useStyles({ drawerWidth, offsetFromTop });

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
        <ListItemText
          disableTypography={true}
          className={classes.itemText}
          primary={
            <Typography className={classes.sidebar}>{route.title}</Typography>
          }
        />
      </ListItem>
      {appendedRoute}
    </>
  );
};
