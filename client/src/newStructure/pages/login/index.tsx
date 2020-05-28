import { LoginForm } from './form';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import image from './img/splash_screen_4.png';
import { userLoginFetch } from '../../shared/reducers/user/currentUser';
import { bindActionCreators } from 'redux';
import classes from './styles.module.css';

interface IProps {
  isLoggedIn: boolean;
}

const Page: React.FC<IProps> = ({ isLoggedIn, ...props }) => {
  if (isLoggedIn) {
    return <Redirect to="/patients" />;
  }

  return (
    <div className={classes.loginWrapper}>
      <div className={classes.subWrapper}>
        <img src={image} className={classes.imgStyle}></img>
      </div>
      <div className={classes.subWrapper}>
        <div className={classes.formContainer}>
          <LoginForm {...props} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({ user }: any) => ({
  isLoggedIn: user.currentUser.isLoggedIn,
  email: user.currentUser.email,
  errorMessage: user.serverLoginErrorMessage
});

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators({ userLoginFetch }, dispatch);

export const LoginPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
