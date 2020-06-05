import { LoginForm } from './form';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import image from './img/splash_screen_4.png';
import { login, LoginData } from '../../shared/reducers/user/currentUser';
import { bindActionCreators } from 'redux';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { OrNull, Callback } from '@types';
import { ServerRequestAction } from 'src/newStructure/shared/reducers/utils';
import classes from './styles.module.css';

interface IProps {
  errorMessage: OrNull<string>;
  loggedIn: boolean;
  login: Callback<LoginData, ServerRequestAction>;
}

class Page extends React.Component<IProps> {
  render() {
    const { loggedIn, ...props } = this.props;

    if (this.props.loggedIn) {
      return <Redirect to="/patients" />;
    }
    return (
      <div className={classes.loginWrapper}>
        <div className={classes.subWrapper}>
          <img src={image} className={classes.imgStyle}></img>
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

const mapDispatchToProps = (dispatch: any) => bindActionCreators(
  { login }, 
  dispatch
);

export const LoginPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
