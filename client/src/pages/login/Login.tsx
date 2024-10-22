import { Button, Container, SxProps } from '@mui/material';
import { AuthProvider, AuthResponse, SignInPage } from '@toolpad/core';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { Toast } from 'src/shared/components/toast';
import { useAppDispatch } from 'src/shared/hooks';
import { OrNull } from 'src/shared/types';
import {
  LoginData,
  clearCurrentUserError,
  loginUser,
} from 'src/redux/reducers/user/currentUser';
import { useHistory } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const AUTH_PROVIDERS: AuthProvider[] = [
  { id: 'credentials', name: 'Email and Password' },
];

export const Login = () => {
  const errorMessage = useSelector(
    ({ user }: ReduxState): OrNull<string> => user.current.message
  );
  const dispatch = useAppDispatch();

  const clearError = () => {
    dispatch(clearCurrentUserError());
  };

  const history = useHistory();

  const signIn = async (provider: AuthProvider, formData?: any) => {
    return new Promise<AuthResponse>((resolve) => {
      if (provider.id == 'credentials') {
        const loginData: LoginData = {
          email: formData?.get('email') ?? '',
          password: formData?.get('password') ?? '',
        };
        dispatch(loginUser(loginData, history));
        resolve({
          type: 'CredentialsSignin',
        });
      }
      resolve({
        type: provider.id,
      });
    });
  };

  return (
    <>
      <Toast
        severity="error"
        message={errorMessage ?? ''}
        open={Boolean(errorMessage)}
        onClose={clearError}
        transitionDuration={0}
      />
      <Container
        id={'login-form-container'}
        disableGutters
        sx={{
          minHeight: '400px',
          height: '100%',
          width: 'fit-content',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'start',
          '@media (min-height: 500px)': {
            transform: 'scale(0.75)',
          },
        }}>
        <SignInPage providers={AUTH_PROVIDERS} signIn={signIn} />
      </Container>
    </>
  );
};

const LOGIN_CALLBACK_ROUTE = '/loginCallback';
const LOGIN_BUTTON_SX: SxProps = {
  width: '100%',
  marginY: '8px',
  fontSize: 'large',
};

// For Auth0:
export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  const handleLogin = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: LOGIN_CALLBACK_ROUTE,
      },
    });
  };
  return (
    <Button
      sx={LOGIN_BUTTON_SX}
      variant={'contained'}
      size={'large'}
      onClick={handleLogin}>
      Log In
    </Button>
  );
};

export const SignUpButton = () => {
  const { loginWithRedirect } = useAuth0();
  const handleSignUp = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: LOGIN_CALLBACK_ROUTE,
      },
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };
  return (
    <Button
      sx={LOGIN_BUTTON_SX}
      variant={'contained'}
      size={'large'}
      onClick={handleSignUp}>
      Sign Up
    </Button>
  );
};
