import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { OrNull } from '@types';
import PollIcon from '@material-ui/icons/Poll';
import React from 'react';
import TimelineIcon from '@material-ui/icons/Timeline';
import Typography from '@material-ui/core/Typography';
import { useDimensionsContext } from '../context/hooks';
import { useStyles as useLocalStyles } from './styles';
import { useStyles } from '../styles';

interface IProps {
  activeItem: OrNull<string>;
  openStats: boolean;
  setOpenStats: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StatisticsMenuItem: React.FC<IProps> = ({
  activeItem,
  openStats,
  setOpenStats,
}) => {
  const { drawerWidth, offsetFromTop } = useDimensionsContext();

  const classes = {
    ...useStyles({
      drawerWidth,
      offsetFromTop,
    }),
    ...useLocalStyles(),
  };
  const anchorElement = React.useRef<OrNull<HTMLDivElement>>(null);

  const handleAnalyticsClick = (): void => {
    setOpenStats((currentlyOpen: boolean): boolean => !currentlyOpen);
  };

  const handleClose = (): void => {
    setOpenStats(false);
  };

  React.useEffect((): (() => void) => {
    const listener = (event: MouseEvent): void => {
      // * Handles closing the menu if the user clicks outside it
      const clickedElement = event.target as HTMLElement;

      if (
        anchorElement.current &&
        !clickedElement.contains(anchorElement.current)
      ) {
        setOpenStats(false);
      }
    };

    document.addEventListener(`click`, listener);

    return (): void => {
      document.removeEventListener(`click`, listener);
    };
  }, [setOpenStats]);

  return (
    <ListItem
      className={classes.listItem}
      button={true}
      innerRef={anchorElement}
      selected={activeItem === `Analytics`}
      // * need this for tablets
      onClick={handleAnalyticsClick}>
      <ListItemIcon classes={{ root: classes.icon }}>
        <TimelineIcon fontSize="large" />
      </ListItemIcon>
      <ListItemText
        disableTypography
        className={classes.itemText}
        primary={<Typography className={classes.sidebar}>Analytics</Typography>}
      />
      <Menu
        keepMounted={true}
        anchorEl={anchorElement.current}
        open={openStats}
        onClose={handleClose}
        PaperProps={{
          className: classes.menuPaper,
        }}>
        <MenuItem>
          <ListItem
            className={classes.listItemInner}
            button={true}
            component={Link}
            to="/stats">
            <ListItemIcon classes={{ root: classes.icon }}>
              <PollIcon fontSize="large" />
            </ListItemIcon>
            <ListItemText
              disableTypography
              className={classes.itemText}
              primary={
                <Typography className={classes.sidebar}>Statistics</Typography>
              }
            />
          </ListItem>
        </MenuItem>
      </Menu>
    </ListItem>
  );
};
