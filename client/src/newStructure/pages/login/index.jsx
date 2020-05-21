import React from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import image from './img/splash_screen_4.png';
import { userLoginFetch } from '../../shared/reducers/user/currentUser';

class Login extends React.Component {
  render() {
    if (this.props.isLoggedIn) {
      return <Redirect to="/patients" />;
    }
    return (
      <div className="loginWrapper">
        <div className="subWrapper">
          <img src={image} className="imgStyle"></img>
        </div>
        <div className="subWrapper">
          <div style={{ position: 'relative', left: '-10%' }}>
            <LoginForm {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  isLoggedIn: user.currentUser.isLoggedIn,
  email: user.currentUser.email,
  errorMessage: user.serverLoginErrorMessage,
});

const mapDispatchToProps = (dispatch) => ({
  userLoginFetch: (user) => {
    dispatch(userLoginFetch(user));
  },
});

export const LoginPage = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Login);
