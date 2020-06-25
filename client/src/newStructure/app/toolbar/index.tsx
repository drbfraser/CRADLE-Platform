import { IconButton, Toolbar, Typography } from '@material-ui/core';

import AppImg from './img/app_icon.png';
import { Icon } from 'semantic-ui-react';
import React from 'react';
import classes from '../styles.module.css';
import { getRole } from './utils';

interface IProps {
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  toolbarButtonsClass: string;
  toolbarButtonsPaddedClass: string;
  user: any;
}

export const AppToolbar: React.FC<IProps> = ({
  setActiveItem,
  toolbarButtonsClass,
  toolbarButtonsPaddedClass,
  user,
}) => {
  const makeHelpActiveItem = (): void => setActiveItem(`Help`);

  return (
    <Toolbar>
      <img src={AppImg} className="appIcon" />
      <Typography noWrap className={classes.titleText}>
        CRADLE
      </Typography>
      {user.isLoggedIn && (
        <div className={classes.iconContainer}>
          <IconButton
            className={toolbarButtonsClass}
            onClick={() => ''}
            color="inherit">
            <Icon name="user circle" size="large" />
            <div>
              <Typography variant="body1" noWrap>
                {user.firstName} ({getRole(user.roles)})
              </Typography>
              {user.healthFacilityName && (
                <Typography variant="body2" noWrap>
                  Healthcare Facility: {user.healthFacilityName}
                </Typography>
              )}
            </div>
          </IconButton>

          <IconButton
            className={toolbarButtonsPaddedClass}
            // component={Link}
            // to="/help"
            onClick={makeHelpActiveItem}
            // selected={activeItem === 'Help'}
            color="inherit">
            <Icon name="help" size="small" />
          </IconButton>
        </div>
      )}
    </Toolbar>
  );
};
