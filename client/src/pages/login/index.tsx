import { LoginForm } from './form';
import React from 'react';
import { Redirect } from 'react-router-dom';
import image from './img/splash_screen_4.png';
import { useStyles } from './styles';

export const LoginPage: React.FC = () => {
  const classes = useStyles();

  // if the user has reached the login page, they likely came directly here
  // therefore Redux will be empty and we must check local storage for a token
  if (localStorage.getItem('token') !== null) {
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
