import { Box, Container, Typography, TextField, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { Toast } from 'src/shared/components/toast';
import { useAppDispatch } from 'src/shared/hooks';
import { OrNull } from 'src/shared/types';
import {
  clearCurrentUserError,
  loginUser,
} from 'src/redux/reducers/user/currentUser';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_PADDING } from 'src/shared/constants';
import { Form, Formik } from 'formik';

export const LoginForm = () => {
  const errorMessage = useSelector(
    ({ user }: ReduxState): OrNull<string> => user.current.message
  );
  const dispatch = useAppDispatch();

  const clearError = () => {
    dispatch(clearCurrentUserError());
  };

  const navigate = useNavigate();

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
            '@media (max-height: 500px)': {
              transform: 'scale(0.75)',
            },
          }}>
          <Container
            sx={{
              width: '350px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <Typography
              variant={'h4'}
              component={'h4'}
              fontWeight={'bold'}
              sx={{ marginY: '0.5rem' }}>
              Log in
            </Typography>
            <Formik
              initialValues={{
                username: '',
                password: '',
              }}
              onSubmit={({ username, password }) => {
                dispatch(loginUser({ username, password }, navigate));
              }}>
              {(formikProps) => (
                <Form onSubmit={formikProps.handleSubmit}>
                  <Container
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                    <TextField
                      name={'username'}
                      variant={'filled'}
                      label={'Username / Email'}
                      id={'username-field'}
                      required
                      fullWidth
                      onBlur={formikProps.handleBlur}
                      onChange={formikProps.handleChange}
                      value={formikProps.values.username}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      name={'password'}
                      variant={'filled'}
                      label={'Password'}
                      id={'password-field'}
                      required
                      type={'password'}
                      fullWidth
                      onBlur={formikProps.handleBlur}
                      onChange={formikProps.handleChange}
                      value={formikProps.values.password}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button
                      variant={'contained'}
                      fullWidth
                      disabled={formikProps.isSubmitting}
                      type={'submit'}
                      size={'large'}
                      sx={{
                        fontSize: 'large',
                      }}>
                      Login
                    </Button>
                  </Container>
                </Form>
              )}
            </Formik>
          </Container>
        </Container>
      </Box>
    </>
  );
};
