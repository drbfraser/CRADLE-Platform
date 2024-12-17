import { useCallback } from 'react';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { useAppDispatch } from '..';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    navigate('/');
  }, [dispatch, logoutUser]);

  return {
    handleLogout,
  };
};
