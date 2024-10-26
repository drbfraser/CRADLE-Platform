import { Container } from '@mui/material';
import { selectLoggedIn } from 'src/redux/reducers/user/currentUser';
import { useAppSelector } from 'src/shared/hooks';

export const LoginCallbackPage = () => {
  const isLoggedIn = useAppSelector(selectLoggedIn);
  return (
    <Container
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <h2>{isLoggedIn ? 'LOGGED IN!' : 'Not Logged In...'}</h2>
    </Container>
  );
};
