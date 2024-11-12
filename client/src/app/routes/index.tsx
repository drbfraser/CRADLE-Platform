import { AppRoute, appRoutes } from './utils';
import { Navigate, Route, Routes } from 'react-router-dom';

import { PropsWithChildren } from 'react';
import { useAppSelector } from 'src/shared/hooks';
import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';
import { UserRoleEnum } from 'src/shared/enums';
import { Loader } from 'src/shared/components/loader';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {appRoutes.map((route: AppRoute): JSX.Element => {
        if (route.private) {
          return (
            <Route
              key={route.id}
              path={route.to}
              element={
                <RequireAuth path={route.to}>
                  <route.component />
                </RequireAuth>
              }
            />
          );
        }

        return (
          <Route key={route.id} path={route.to} element={<route.component />} />
        );
      })}
    </Routes>
  );
};

type RequireAuthProps = PropsWithChildren & {
  path?: string | readonly string[] | undefined;
};
const RequireAuth = ({ children, path }: RequireAuthProps) => {
  const currentUser = useAppSelector(selectCurrentUser);

  if (currentUser.error || !currentUser.loggedIn) {
    return <Navigate to="/" replace />;
  }

  if (currentUser.loading) {
    return <Loader message="Getting things ready..." show={true} />;
  }

  if (currentUser.loggedIn) {
    const isAdmin = currentUser.data?.role === UserRoleEnum.ADMIN;

    // * Prevent non-admins from accessing admin pages
    if (!isAdmin && path?.includes('/admin')) {
      return <Navigate to="/" replace />;
    }

    return children;
  }

  return null;
};
