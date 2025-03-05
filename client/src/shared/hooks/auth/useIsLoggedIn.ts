import { useAppSelector } from '..';
import { selectCurrentUser } from 'src/redux/user-state';

export const useIsLoggedIn = () => {
  const accessToken = localStorage.getItem('accessToken');
  const user = useAppSelector(selectCurrentUser);

  // useEffect(() => {

  // }, [accessToken]);

  return accessToken !== null;
};
