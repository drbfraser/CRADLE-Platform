import { PropsWithChildren } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAppSelector } from 'src/shared/hooks';
import { selectCurrentUser } from 'src/redux/user-state';
import { UserRoleEnum } from 'src/shared/enums';
import { Loader } from 'src/shared/components/loader';
import { AppRoute, appRoutes } from './utils';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from 'src/shared/api/auth';
import { useIsLoggedIn } from '../../shared/hooks/auth/useIsLoggedIn';
import { useLogout } from 'src/shared/hooks/auth/useLogout';

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
  const user = useAppSelector(selectCurrentUser);
  const isLoggedIn = useIsLoggedIn();
  const { handleLogout } = useLogout();

  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    initialData: user,
  });

  /** If refetching the user's data from the server fails, it is probably
   * because the access token and refresh token are expired. */
  if (currentUserQuery.isError) {
    handleLogout();
  }

  /** The user data from the redux store may be null even if the user is
   * still logged in, so we need to check whether the user is logged in
   * based on the access token being present in local storage. */
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  /** If user is logged in but the user data is null, refetch it from the server. */
  if (!user) {
    currentUserQuery.refetch();
  }

  if (user) {
    const isAdmin = user?.role === UserRoleEnum.ADMIN;

    // * Prevent non-admins from accessing admin pages
    if (!isAdmin && path?.includes('/admin')) {
      return <Navigate to="/" replace />;
    }

    return children;
  }

  return <Loader message="Getting things ready..." show={true} />;
};
