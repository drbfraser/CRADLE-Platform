import { AppRoute, appRoutes } from './utils';
import { Route, Routes } from 'react-router-dom';

import React from 'react';
import { useStyles } from './styles';

interface IProps {
  topBarOffset?: number;
}

export const AppRoutes: React.FC<IProps> = ({ topBarOffset }) => {
  const classes = useStyles({ topBarOffset });

  return (
    <main className={classes.content}>
      <Routes>
        {appRoutes
          .filter((route) => !!route.to)
          .map(
            (route: AppRoute): JSX.Element => (
              // TODO: add private route here
              <Route key={route.id} path={route.to!}>
                <route.component />
              </Route>
            )
          )}
      </Routes>
    </main>
  );
};
