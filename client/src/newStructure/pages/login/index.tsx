import { LoginForm } from './form';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import image from './img/splash_screen_4.png';
import { login } from '../../shared/reducers/user/currentUser';
import { bindActionCreators } from 'redux';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { OrNull, Callback } from '@types';
import { ServerRequestAction } from 'src/newStructure/shared/reducers/utils';

interface IProps {
  errorMessage: OrNull<string>;
  loggedIn: boolean;
  login: Callback<any, ServerRequestAction>;
}

class Login extends React.Component<IProps> {
  render() {
    const { loggedIn, ...props } = this.props;

    if (this.props.loggedIn) {
      return <Redirect to="/patients" />;
    }
    return (
      <div className="loginWrapper">
        <div className="subWrapper">
          <img src={image} className="imgStyle"></img>
        </div>
        <div className="subWrapper">
          <div style={{ position: 'relative', left: '-10%' }}>
            <LoginForm {...props} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ user }: ReduxState) => ({
  isLoggedIn: user.current.data !== null,
  email: user.current.data?.email,
  errorMessage: user.current.message,
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators(
  { login }, 
  dispatch
);

export const LoginPage = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Login);
