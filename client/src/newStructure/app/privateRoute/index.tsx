import React from 'react';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';
import { Route, RouteComponentProps } from 'react-router-dom';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { OrNull, User } from '@types';
import { bindActionCreators } from 'redux';
import { ServerRequestAction } from 'src/newStructure/shared/reducers/utils';

interface IProps {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  user: OrNull<User>;
  getCurrentUser: () => ServerRequestAction;
  exact?: boolean;
  path?: string;
}

const Component: React.FC<IProps> = ({ user, getCurrentUser, ...props }) => {
  React.useEffect((): void => {
    if (!user) {
      getCurrentUser();
    }
  }, []);

  if (user) {
    return <Route {...props} />;
  }

  return <p>Getting things ready...</p>;
};

const mapStateToProps = ({ user }: ReduxState) => ({
  user: user.current.data,
});

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators({ getCurrentUser }, dispatch);

export const PrivateRoute = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
