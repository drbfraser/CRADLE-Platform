import { selectCurrentUser } from 'src/redux/user-state';
import { useAppSelector } from '..';

export const useIsLoggedIn = () => {
  const user = useAppSelector(selectCurrentUser);
  const accessToken = localStorage.getItem('accessToken');

  const isLoggedIn = accessToken !== null;
  return isLoggedIn;
};
