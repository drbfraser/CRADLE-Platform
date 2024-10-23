import { AppRoute, appRoutes } from './utils';
import { Redirect, Route, Switch } from 'react-router-dom';

import { Box } from '@mui/material';
import { DASHBOARD_PADDING } from 'src/shared/constants';
import { PropsWithChildren, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'src/shared/hooks';
import {
  getCurrentUser,
  selectCurrentUser,
} from 'src/redux/reducers/user/currentUser';
import { UserRoleEnum } from 'src/shared/enums';
import { Loader } from 'src/shared/components/loader';

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
                render={() => (
                  <RequireAuth path={route.to}>
                    <route.component />
                  </RequireAuth>
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

type RequireAuthProps = PropsWithChildren & {
  path?: string | readonly string[] | undefined;
};
const RequireAuth = ({ children, path }: RequireAuthProps) => {
  const currentUser = useAppSelector(selectCurrentUser);

  const dispatch = useAppDispatch();

  useEffect((): void => {
    if (!currentUser.data) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, currentUser.data]);

  if (currentUser.error) {
    return <Redirect to="/" />;
  }

  if (currentUser.loggedIn) {
    const isAdmin = currentUser.data?.role === UserRoleEnum.ADMIN;

    // * Prevent non-admins from accessing admin pages
    if (!isAdmin && path?.includes('/admin')) {
      return <Redirect to="/" />;
    }

    return children;
  }

  return <Loader message="Getting things ready..." show={true} />;
};
