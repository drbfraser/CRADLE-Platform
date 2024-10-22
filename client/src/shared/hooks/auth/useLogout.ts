import { useCallback } from 'react';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { useAppDispatch } from '..';

export const useLogout = () => {
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch, logoutUser]);

  return {
    handleLogout,
  };
};
