import * as Yup from 'yup';

import {
  LoginData,
  clearCurrentUserError,
  loginUser,
} from 'src/redux/reducers/user/currentUser';

import { OrNull } from 'src/shared/types';
import { PrimaryButton } from 'src/shared/components/Button';
import { ReduxState } from 'src/redux/reducers';
import { Toast } from 'src/shared/components/toast';
import { useAppDispatch } from 'src/shared/hooks';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { PropsWithChildren } from 'react';
import {
  Box,
  Container,
  InputLabelProps,
  TextField,
  Typography,
} from '@mui/material';
import { useHistory } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const errorMessage = useSelector(
    ({ user }: ReduxState): OrNull<string> => user.current.message
  );
  const history = useHistory();

  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Email is required.'),
      password: Yup.string().required('Password is required.'),
    }),
    onSubmit: (values: LoginData) => {
      dispatch(loginUser(values, history));
    },
  });

  const clearError = (): void => {
    dispatch(clearCurrentUserError());
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
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          '@media (min-height: 500px)': {
            transform: 'scale(0.75)',
          },
        }}>
        <form onSubmit={formik.handleSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '260px',
              justifyContent: 'space-evenly',
            }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: '50px',
                fontWeight: 700,
              }}>
              Log In
            </Typography>
            <Box
              id={'login-form-fields-wrapper'}
              sx={{
                marginTop: '20px',
                marginBottom: '5px',
                display: 'flex',
                flexDirection: 'column',
                rowGap: '20px',
              }}>
              <InputWrapper>
                <TextField
                  id={'emailField'}
                  label={'Email'}
                  sx={{ width: '100%' }}
                  InputLabelProps={INPUT_LABEL_PROPS}
                  type={'email'}
                  autoComplete={'email'}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={
                    (formik.touched.email && formik.errors.email) || ' '
                  }
                  {...formik.getFieldProps('email')}
                />
              </InputWrapper>
              <InputWrapper>
                <TextField
                  id={'passwordField'}
                  label={'Password'}
                  sx={{ width: '100%' }}
                  InputLabelProps={INPUT_LABEL_PROPS}
                  type="password"
                  autoComplete="current-password"
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={
                    (formik.touched.password && formik.errors.password) || ' '
                  }
                  {...formik.getFieldProps('password')}
                />
              </InputWrapper>
            </Box>
          </Box>
          <PrimaryButton
            type="submit"
            sx={{
              marginLeft: 'auto',
              marginRight: 0,
              display: 'flex',
              justifyContent: 'flex-end',
              fontWeight: 'bold',
            }}>
            Login
          </PrimaryButton>
        </form>
      </Container>
    </>
  );
};

const INPUT_LABEL_PROPS: InputLabelProps = Object.freeze({ shrink: true });

const InputWrapper = ({ children }: PropsWithChildren) => {
  return (
    <Box
      sx={{
        // Prevents layout from shifting around when error text is visible.
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
      }}>
      {children}
    </Box>
  );
};
