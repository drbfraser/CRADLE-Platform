import { Dispatch, bindActionCreators } from 'redux';
import { OrNull, User } from '@types';
import { Route, RouteComponentProps } from 'react-router-dom';

import React from 'react';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { ServerRequestAction } from 'src/newStructure/shared/reducers/utils';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';

interface IProps {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  user: OrNull<User>;
  getCurrentUser: () => (dispatch: Dispatch) => ServerRequestAction;
  exact?: boolean;
  path?: string;
}

const Component: React.FC<IProps> = ({ user, getCurrentUser, ...props }) => {
  React.useEffect((): void => {
    if (!user) {
      getCurrentUser();
    }
  }, [getCurrentUser, user]);

  if (user) {
    return <Route {...props} />;
  }

  return <p>Getting things ready...</p>;
};

const mapStateToProps = ({ user }: ReduxState) => ({
  user: user.current.data,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({ getCurrentUser }, dispatch);
};

export const PrivateRoute = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
