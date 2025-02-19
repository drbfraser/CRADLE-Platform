import { PropsWithChildren, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'src/shared/hooks';
import {
  getCurrentUser,
  selectCurrentUser,
} from 'src/redux/reducers/user/currentUser';
import { UserRoleEnum } from 'src/shared/enums';
import { Loader } from 'src/shared/components/loader';
import { AppRoute, appRoutes } from './utils';
import PatientRoutes from './PatientsRoute';

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

      <Route
        path="/patients/*"
        element={
          <RequireAuth>
            <PatientRoutes />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

type RequireAuthProps = PropsWithChildren & {
  path?: string | readonly string[] | undefined;
};
const RequireAuth = ({ children, path }: RequireAuthProps) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!currentUser.data) {
      dispatch(getCurrentUser());
    }
  }, [currentUser.data, dispatch]);

  if (currentUser.error) {
    return <Navigate to="/" replace />;
  }

  if (currentUser.loggedIn) {
    const isAdmin = currentUser.data?.role === UserRoleEnum.ADMIN;

    // * Prevent non-admins from accessing admin pages
    if (!isAdmin && path?.includes('/admin')) {
      return <Navigate to="/" replace />;
    }

    return children;
  }

  return <Loader message="Getting things ready..." show={true} />;
};
