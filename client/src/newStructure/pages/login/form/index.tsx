import * as Yup from 'yup';

import { Callback, OrNull } from '@types';

import { Dispatch } from 'redux';
import { LoginData } from 'src/newStructure/shared/reducers/user/currentUser';
import React from 'react';
import { ServerRequestAction } from 'src/newStructure/shared/reducers/utils';
import classes from './styles.module.css';
import { useFormik } from 'formik';

interface IProps {
  errorMessage: OrNull<string>;
  loginUser: Callback<LoginData, Callback<Dispatch, ServerRequestAction>>;
}

export const LoginForm: React.FC<IProps> = (props) => {
  const formik = useFormik({
    initialValues: {
      email: ``,
      password: ``,
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .max(15, `Must be 15 characters or less`)
        .min(5, `Must be at least 5 characters`)
        .required(`Required`),
      email: Yup.string().email(`Invalid email address`).required(`Required`),
    }),
    onSubmit: (values: LoginData) => {
      props.loginUser(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <h1 className={classes.login}>Log In</h1>
      <h2>Email</h2>
      <input
        className={classes.inputStyle}
        placeholder="somebody@example.com"
        {...formik.getFieldProps(`email`)}
      />
      {formik.touched.email && formik.errors.email ? (
        <div className={classes.formError}>{formik.errors.email}</div>
      ) : null}
      <h2>Password</h2>
      <input
        className={classes.inputStyle}
        placeholder="********"
        type="password"
        {...formik.getFieldProps(`password`)}
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
