import { useCallback } from 'react';
import { clearCurrentUser } from 'src/redux/user-state';
import { useAppDispatch } from '..';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    dispatch(clearCurrentUser());
    navigate('/');
  }, [dispatch, navigate]);

  return {
    handleLogout,
  };
};
