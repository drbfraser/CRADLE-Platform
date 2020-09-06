import { AppRoute, appRoutes } from './utils';
import { Route, Switch } from 'react-router-dom';

import { PrivateRoute } from './privateRoute';
import React from 'react';
import { useStyles } from './styles';

interface IProps {
  topBarOffset?: number;
}

export const Routes: React.FC<IProps> = ({ topBarOffset }) => {
  const classes = useStyles({ topBarOffset });

  return (
    <main className={classes.content}>
      <Switch>
        {appRoutes.map(
          (route: AppRoute): JSX.Element => {
            if (route.private) {
              return (
                <PrivateRoute
                  key={route.id}
                  exact={route.exactPath}
                  path={route.to}
                  component={route.component}
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
          }
        )}
      </Switch>
    </main>
  );
};
