import { AppRoute, appRoutes } from './utils';
import { Redirect, Route, Switch } from 'react-router-dom';

import { PrivateRoute } from './privateRoute';
import { Box } from '@mui/material';
import { DASHBOARD_PADDING } from 'src/shared/constants';
import { PropsWithChildren } from 'react';
import { useAppSelector } from 'src/shared/hooks';
import {
  selectCurrentUser,
  selectLoggedIn,
} from 'src/redux/reducers/user/currentUser';
import { UserRoleEnum } from 'src/shared/enums';

export const AppRoutes: React.FC = () => {
  return (
    <Box
      component="main"
      id="mainContainer"
      sx={{
        height: '100%',
        width: '100%',
        padding: DASHBOARD_PADDING,
      }}>
      <Switch>
        {appRoutes.map((route: AppRoute): JSX.Element => {
          if (route.private) {
            return (
              <Route
                key={route.id}
                exact={route.exactPath}
                path={route.to}
                component={route.component}
                render={() => (
                  <RequireAdmin>
                    <route.component />
                  </RequireAdmin>
                )}
              />
            );
          }

          return (
            <Route
              key={route.id}
              exact={route.exactPath}
              path={route.to}
              component={route.component}
            />
          );
        })}
      </Switch>
    </Box>
  );
};

const RequireAuth = ({ children }: PropsWithChildren) => {
  const isLoggedIn = useAppSelector(selectLoggedIn);
  return isLoggedIn ? children : <Redirect to="/" />;
};

const RequireAdmin = ({ children }: PropsWithChildren) => {
  const currentUser = useAppSelector(selectCurrentUser);
  if (!currentUser.loggedIn) {
    return <Redirect to="/" />;
  }

  const isAdmin = currentUser.data?.role === UserRoleEnum.ADMIN;
  return isAdmin ? children : <Redirect to="/" />;
};
