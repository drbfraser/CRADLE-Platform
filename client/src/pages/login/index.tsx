import { LoginForm } from './form';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { ReduxState } from '../../redux/reducers';
import image from './img/splash_screen_4.png';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';

export const LoginPage: React.FC = () => {
  const classes = useStyles();

  const loggedIn = useSelector(
    ({ user }: ReduxState): boolean => user.current.loggedIn
  );

  const hasToken = localStorage.getItem('token') !== null;

  if (loggedIn || hasToken) {
    return <Redirect to="/referrals" />;
  }

  return (
    <div className={classes.loginWrapper}>
      <div className={classes.subWrapper}>
        <img alt="logo" src={image} className={classes.imgStyle} />
      </div>
      <div className={classes.subWrapper}>
        <div className={classes.loginFormContainer}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};
