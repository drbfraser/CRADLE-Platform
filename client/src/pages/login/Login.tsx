import { Box, Button, Container, SxProps } from '@mui/material';
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
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_PADDING } from 'src/shared/constants';

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

  const navigate = useNavigate();

  const signIn = async (provider: AuthProvider, formData?: any) => {
    return new Promise<AuthResponse>((resolve) => {
      if (provider.id == 'credentials') {
        const loginData: LoginData = {
          email: formData?.get('email') ?? '',
          password: formData?.get('password') ?? '',
        };
        dispatch(loginUser(loginData, navigate));
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
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}>
        {/* Empty box for padding */}
        <Box
          sx={{
            width: DASHBOARD_PADDING,
          }}></Box>
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
            justifyContent: 'center',
            '@media (min-height: 500px)': {
              transform: 'scale(0.75)',
            },
            '& .MuiContainer-root': {
              width: '333px',
              margin: '0px',
              padding: '0px',
            },
            '& .MuiBox-root': {
              margin: '0px',
              padding: '0px',
            },
            // Hide the "Remember me" check box.
            '& .MuiFormControlLabel-root': {
              border: 'solid',
              borderColor: 'red',
              borderWidth: '2px',
              display: 'none',
            },
          }}>
          <SignInPage providers={AUTH_PROVIDERS} signIn={signIn} />
        </Container>
      </Box>
    </>
  );
};
