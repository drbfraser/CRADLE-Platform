import React from 'react';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';
import { Route } from 'react-router-dom';

interface IProps {
  component: any;
  user: any;
  getCurrentUser: any;
  exact?: boolean;
  path?: string;
}

const Component: React.FC<IProps> = ({ user, getCurrentUser, ...props }) => {
  React.useEffect((): void => {
    if (!user.isLoggedIn) {
      getCurrentUser();
    }
  }, []);

  if (user.isLoggedIn) {
    return <Route {...props} />;
  }

  return <p>Getting things ready...</p>;
};

const mapStateToProps = ({ user }: any) => ({
  user: user.currentUser
});

const mapDispatchToProps = (dispatch: any) => ({
  getCurrentUser: () => dispatch(getCurrentUser()),
});

export const PrivateRoute = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);
