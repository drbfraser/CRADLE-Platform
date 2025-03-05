import { PropsWithChildren } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { UserRoleEnum } from 'src/shared/enums';
import { Loader } from 'src/shared/components/loader';
import { AppRoute, appRoutes } from './utils';
import { useIsLoggedIn } from '../../shared/hooks/auth/useIsLoggedIn';
import { useCurrentUser } from 'src/shared/hooks/auth/useCurrentUser';

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
  const isLoggedIn = useIsLoggedIn();
  const currentUser = useCurrentUser();

  /** The user data from the redux store may be null even if the user is
   * still logged in, so we need to check whether the user is logged in
   * based on the access token being present in local storage. */
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (currentUser) {
    const isAdmin = currentUser?.role === UserRoleEnum.ADMIN;

    // * Prevent non-admins from accessing admin pages
    if (!isAdmin && path?.includes('/admin')) {
      return <Navigate to="/" replace />;
    }

    return children;
  }

  return <Loader message="Getting things ready..." show={true} />;
};
