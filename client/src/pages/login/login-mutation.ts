import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { setCurrentUser } from 'src/redux/user-state';
import { authenticate, Credentials } from 'src/shared/api';
import { useAppDispatch } from 'src/shared/hooks';

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogin = useCallback(
    async (loginData: Credentials) => {
      const authResponse = await authenticate(loginData);
      // Store access token in local storage.
      localStorage.setItem(`accessToken`, authResponse.accessToken);
      dispatch(setCurrentUser(authResponse.user));
      navigate('/referrals');
    },
    [dispatch, navigate]
  );

  return useMutation({
    mutationFn: handleLogin,
  });
};
