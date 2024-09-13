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
import makeStyles from '@mui/styles/makeStyles';
import { useAppDispatch } from 'src/app/context/hooks';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Box, Container, InputLabelProps, TextField } from '@mui/material';

export const LoginForm: React.FC = () => {
  const errorMessage = useSelector(
    ({ user }: ReduxState): OrNull<string> => user.current.message
  );

  const dispatch = useAppDispatch();
  const classes = useStyles();

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
      dispatch(loginUser(values));
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
      <Container id={'loginFormContainer'} className={classes.formContainer}>
        <form className={classes.form} onSubmit={formik.handleSubmit}>
          <h2 className={classes.login}>Log In</h2>
          <Box id={'loginFormFieldsWrapper'} className={classes.fieldsWrapper}>
            <Box className={classes.inputWrapper}>
              <TextField
                id={'emailField'}
                label={'Email'}
                className={classes.textField}
                InputLabelProps={INPUT_LABEL_PROPS}
                type={'email'}
                autoComplete={'email'}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={
                  (formik.touched.email && formik.errors.email) || ' '
                }
                {...formik.getFieldProps('email')}
              />
            </Box>
            <Box className={classes.inputWrapper}>
              <TextField
                id={'passwordField'}
                label={'Password'}
                className={classes.textField}
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
            </Box>
          </Box>
          <PrimaryButton type="submit" className={classes.right}>
            Login
          </PrimaryButton>
        </form>
      </Container>
    </>
  );
};

const INPUT_LABEL_PROPS: InputLabelProps = Object.freeze({ shrink: true });

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '260px',
    justifyContent: 'space-evenly',
  },
  right: {
    marginLeft: 'auto',
    marginRight: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    fontWeight: 'bold',
  },
  login: {
    fontSize: '50px',
  },
  inputStyle: {
    width: '100%',
    height: '40px',
    borderRadius: '5px',
    padding: '10px',
    borderBottom: 'solid 1px #000',
  },
  formError: {
    fontSize: '12px',
    color: '#e53e3e',
    marginTop: '0.25rem',
  },
  textField: {
    width: '100%',
  },
  formContainer: {
    minHeight: '400px',
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldsWrapper: {
    marginTop: '20px',
    marginBottom: '5px',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '20px',
  },
  inputWrapper: {
    // Prevents layout from shifting around when error text is visible.
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
  },
});
