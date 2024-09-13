import { AppRoute, appRoutes } from './utils';
import { Route, Switch } from 'react-router-dom';

import { PrivateRoute } from './privateRoute';
import { Box } from '@mui/material';

interface IProps {
  topBarOffset?: number;
}

export const AppRoutes: React.FC<IProps> = ({ topBarOffset }) => {
  return (
    <Box
      component="main"
      sx={{
        padding: '0',
        margin: '0',
        height: '100%',
        width: '100%',
        gridArea: 'main',
      }}>
      <Switch>
        {appRoutes.map((route: AppRoute): JSX.Element => {
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
        })}
      </Switch>
    </Box>
  );
};
