import { ActualUser, OrNull } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import AppImg from './img/app_icon.png';
import { Icon } from 'semantic-ui-react';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import { ReduxState } from 'src/newStructure/redux/reducers';
import { RoleEnum } from '../../enums';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { push } from 'connected-react-router';
import { useStyles } from './styles';

interface IProps {
  user: OrNull<ActualUser>;
  setActiveItem: React.Dispatch<React.SetStateAction<OrNull<string>>>;
}

export const TopBar = React.forwardRef<HTMLElement, IProps>(
  ({ user, setActiveItem }, ref) => {
    const loggedIn = useSelector(({ user }: ReduxState): boolean => {
      return user.current.loggedIn;
    });

    const classes = useStyles();

    const getRole = (roles?: Array<RoleEnum>): string => {
      if (!roles) {
        return ``;
      }

      if (roles.includes(RoleEnum.ADMIN)) {
        return `ADMIN`;
      } else if (roles.includes(RoleEnum.HCW)) {
        return `Healthcare Worker`;
      } else if (roles.includes(RoleEnum.CHO)) {
        return `CHO`;
      } else if (roles.includes(RoleEnum.VHT)) {
        return `VHT`;
      }
      return ``;
    };

    const dispatch = useDispatch();

    const navigateToHelpPage = (): void => {
      setActiveItem(`Resources`);
      dispatch(push(`/resources`));
    };

    return (
      <AppBar className={classes.appBar} position="fixed" ref={ref}>
        <Toolbar>
          <img alt="appIcon" src={AppImg} className="appIcon" />
          <Typography className={classes.title} noWrap={true}>
            CRADLE
          </Typography>
          {loggedIn && (
            <div className={classes.navRightIcons}>
              <IconButton className={classes.toolbarButtons} color="inherit">
                <Icon name="user circle" size="large" />
                <div>
                  <Typography variant="body1" noWrap>
                    {user?.firstName} ({getRole(user?.roles)})
                  </Typography>
                  {user?.healthFacilityName && (
                    <Typography variant="body2" noWrap>
                      Healthcare Facility: {user?.healthFacilityName}
                    </Typography>
                  )}
                </div>
              </IconButton>
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
