import { useAuth0 } from '@auth0/auth0-react';
import { Button, Container, SxProps } from '@mui/material';

export const LoginCallbackPage = () => {
  const { isAuthenticated } = useAuth0();
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
      <h2>{isAuthenticated ? 'LOGGED IN!' : 'Not Logged In...'}</h2>
      {isAuthenticated ? <LogoutButton /> : null}
    </Container>
  );
};

const LOGOUT_BUTTON_SX: SxProps = {
  width: '300px',
  marginY: '8px',
  fontSize: 'large',
};
const LogoutButton = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };
  return (
    <Button
      sx={LOGOUT_BUTTON_SX}
      variant={'contained'}
      size={'large'}
      onClick={handleLogout}>
      Logout
    </Button>
  );
};
