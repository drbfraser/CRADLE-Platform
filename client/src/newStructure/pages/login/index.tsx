import { Callback, OrNull } from '@types';
import { LoginData, login } from '../../shared/reducers/user/currentUser';

import { LoginForm } from './form';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { ServerRequestAction } from 'src/newStructure/shared/reducers/utils';
import { bindActionCreators } from 'redux';
import classes from './styles.module.css';
import { connect } from 'react-redux';
import image from './img/splash_screen_4.png';

interface IProps {
  errorMessage: OrNull<string>;
  loggedIn: boolean;
  login: Callback<LoginData, ServerRequestAction>;
}

class Page extends React.Component<IProps> {
  render() {
    const { loggedIn, ...props } = this.props;

    if (loggedIn) {
      return <Redirect to="/patients" />;
    }
    return (
      <div className={classes.loginWrapper}>
        <div className={classes.subWrapper}>
          <img alt="logo" src={image} className={classes.imgStyle}></img>
        </div>
        <div className={classes.subWrapper}>
          <div style={{ position: 'relative', left: '-10%' }}>
            <LoginForm {...props} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ user }: ReduxState) => ({
  loggedIn: user.current.loggedIn,
  errorMessage: user.current.message,
});

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators({ login }, dispatch);

export const LoginPage = connect(mapStateToProps, mapDispatchToProps)(Page);
