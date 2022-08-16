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
      <form className={classes.form} onSubmit={formik.handleSubmit}>
        <h1 className={classes.login}>Log In</h1>
        <h2>Email</h2>
        <input
          className={classes.inputStyle}
          placeholder="somebody@example.com"
          {...formik.getFieldProps('email')}
        />
        {formik.touched.email && formik.errors.email ? (
          <div className={classes.formError}>{formik.errors.email}</div>
        ) : null}
        <h2>Password</h2>
        <input
          className={classes.inputStyle}
          placeholder="********"
          type="password"
          {...formik.getFieldProps('password')}
        />
        {formik.touched.password && formik.errors.password ? (
          <div className={classes.formError}>{formik.errors.password}</div>
        ) : null}
        <PrimaryButton type="submit" className={classes.right}>
          Login
        </PrimaryButton>
      </form>
    </>
  );
};

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '5px',
    width: '260px',
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
});
