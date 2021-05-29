import { AppRoute, appRoutes } from '../routes/utils';
import List from '@material-ui/core/List';
import MenuIcon from '@material-ui/icons/Menu';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import Typography from '@material-ui/core/Typography';
import {Box, ListItem} from "@material-ui/core";
import { OrNull } from 'src/shared/types';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { UserRoleEnum } from 'src/shared/enums';
import { SidebarRoute } from './route';
import { makeUniqueId } from 'src/shared/utils';
import { useDimensionsContext } from '../context/hooks';
import { useSelector } from 'react-redux'; 
import {SideBarContext} from "../../context/SideBarContext";
import { useStyles } from '../styles';


type CustomRoute = {
  index: number;
  component: React.ReactNode;
};

interface IProps {
  activeItem: OrNull<string>;
  logout: CustomRoute;
  setActiveItem: React.Dispatch<React.SetStateAction<OrNull<string>>>;
}

type SelectorState = {
  loggedIn: boolean;
  admin?: boolean;
};

export const Sidebar: React.FC<IProps> = ({
  activeItem,
  logout,
  setActiveItem,
}) => {
  const { drawerWidth, offsetFromTop } = useDimensionsContext();
  const {isSideBarOpen, setIsSideBarOpen} = React.useContext(SideBarContext);
  const classes = useStyles({ drawerWidth, offsetFromTop });
  const { admin, loggedIn } = useSelector(
    ({ user }: ReduxState): SelectorState => {
      return {
        admin: user.current.data?.role === UserRoleEnum.ADMIN,
        loggedIn: user.current.loggedIn,
      };
    }
  );

  const updateActiveItem = (item?: string): (() => void) => {
    return (): void => {
      if (item) {
        setActiveItem(item);
      }
    };
  };

  const toggleSidebar = () => setIsSideBarOpen(!isSideBarOpen);

  return loggedIn ? (
    <Box width={isSideBarOpen ? '100%' : '10%'}>
    <List style={{ marginBlockStart: offsetFromTop }}>
      {appRoutes
        .filter((route: AppRoute): boolean => {
          return route.inNavigation;
        })
        .map(
          (route: AppRoute, index: number): OrNull<JSX.Element> => {
            if (index === logout.index) {
              return (
                <SidebarRoute
                  key={makeUniqueId()}
                  activeItem={activeItem}
                  appendedRoute={logout.component}
                  route={route}
                  updateActiveItem={updateActiveItem}
                />
              );
            }

            // * Prevent non-admins from seeing admin sidebar option
            if (!admin && route.to === `/admin`) {
              return null;
            }

            return (
              <SidebarRoute
                key={route.id}
                activeItem={activeItem}
                route={route}
                updateActiveItem={updateActiveItem}
              />
            );
          }
        )}
        <ListItem
          className={classes.listItem}
          button={true}
          onClick={toggleSidebar}>
          <ListItemIcon classes={{ root: classes.icon }}>
            {isSideBarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </ListItemIcon>
          <ListItemText
            disableTypography={true}
            className={classes.itemText}
            primary={
            <Typography className={classes.sidebar}>{isSideBarOpen?"Collapse":""}</Typography>
          }
          />
        </ListItem>
    </List>

    </Box>
  ) : null;
};
