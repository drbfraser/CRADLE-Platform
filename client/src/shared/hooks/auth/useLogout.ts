import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { useAppDispatch } from '..';

export const useLogout = () => {
  const { logout: logoutAuth0 } = useAuth0();
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    logoutAuth0({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [dispatch, logoutUser]);

  return {
    handleLogout,
  };
};
