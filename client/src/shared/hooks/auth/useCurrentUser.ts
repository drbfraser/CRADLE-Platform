import { selectCurrentUser, setCurrentUser } from 'src/redux/user-state';
import { useAppDispatch, useAppSelector } from '..';
import { useIsLoggedIn } from './useIsLoggedIn';
import { useLogout } from './useLogout';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api';
import { useCallback } from 'react';

export function useCurrentUser() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useIsLoggedIn();
  const { handleLogout } = useLogout();
  const user = useAppSelector(selectCurrentUser);

  const currentUserQueryFn = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      dispatch(setCurrentUser(currentUser));
      return currentUser;
    } catch (error) {
      /** If fetching the user's data from the server fails, it is probably
       * because the access token and refresh token are expired. */
      handleLogout();
      throw error;
    }
  }, [dispatch, handleLogout]);

  useQuery({
    queryKey: ['currentUser'],
    queryFn: currentUserQueryFn,
    /** Only execute query if the user is logged in, but the user data in the
     * redux store is null. */
    enabled: isLoggedIn && !user,
  });

  return user;
}
