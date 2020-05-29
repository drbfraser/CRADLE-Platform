import { LoginForm } from './form';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import image from './img/splash_screen_4.png';
import { login } from '../../shared/reducers/user/currentUser';
import { bindActionCreators } from 'redux';

interface IProps {
  isLoggedIn: boolean;
}

class Login extends React.Component<IProps> {
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

const mapStateToProps = ({ user }: any) => ({
  isLoggedIn: user.currentUser.isLoggedIn,
  email: user.currentUser.email,
  errorMessage: user.currentUser.message,
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators(
  { login }, 
  dispatch
);

export const LoginPage = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Login);
