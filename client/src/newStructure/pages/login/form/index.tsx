import * as Yup from 'yup';
import React from 'react';
import { useFormik } from 'formik';
import { OrNull, Callback } from '@types';
import { ServerRequestAction } from 'src/newStructure/shared/reducers/utils';
import { LoginData } from 'src/newStructure/shared/reducers/user/currentUser';
import classes from './styles.module.css';

interface IProps {
  errorMessage: OrNull<string>;
  login: Callback<LoginData, ServerRequestAction>;
}

export const LoginForm: React.FC<IProps> = (props) => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .max(15, 'Must be 15 characters or less')
        .min(5, 'Must be at least 5 characters')
        .required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
    }),
    onSubmit: (values: LoginData) => {
      props.login(values);
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <h1 style={{ fontSize: 50 }}>Log In</h1>

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
      {props.errorMessage && (
        <div className={classes.formError}>{props.errorMessage}</div>
      )}
      <br />
      <button className="contant-submit white" type="submit">
        Login
      </button>
    </form>
  );
};
