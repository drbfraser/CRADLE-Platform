import { LoginForm } from './form';
import { Navigate } from 'react-router-dom';
import React from 'react';
import image from './img/splash_screen_4.png';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useStyles } from './styles';

export const LoginPage: React.FC = () => {
  const classes = useStyles();
  const isBigScreen = useMediaQuery('(min-width:640px)');

  // if the user has reached the login page, they likely came directly here
  // therefore Redux will be empty and we must check local storage for a token
  if (localStorage.getItem('token') !== null) {
    return <Navigate to="/referrals" />;
  }

  return (
    <div className={classes.loginWrapper}>
      {isBigScreen && (
        <div className={classes.subWrapper}>
          <img alt="logo" src={image} className={classes.imgStyle} />
        </div>
      )}
      <div className={isBigScreen ? classes.subWrapper : ''}>
        <div className={classes.loginFormContainer}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};
