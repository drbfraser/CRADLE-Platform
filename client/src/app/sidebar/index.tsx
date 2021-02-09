import { AppRoute, appRoutes } from '../routes/utils';

import List from '@material-ui/core/List';
import { OrNull } from '@types';
import React from 'react';
import { ReduxState } from '../../redux/reducers';
import { RoleEnum } from '../../enums';
import { SidebarRoute } from './route';
import { makeUniqueId } from '../../shared/utils';
import { useDimensionsContext } from '../context/hooks';
import { useSelector } from 'react-redux';

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
  const { offsetFromTop } = useDimensionsContext();

  const { admin, loggedIn } = useSelector(
    ({ user }: ReduxState): SelectorState => {
      return {
        admin: user.current.data?.roles.includes(RoleEnum.ADMIN),
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

  return loggedIn ? (
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
    </List>
  ) : null;
};
