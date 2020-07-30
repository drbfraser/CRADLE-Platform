import {
  CurrentUserState,
  getCurrentUser,
} from '../../redux/reducers/user/currentUser';
import { Redirect, Route, RouteComponentProps } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Loader } from '../../shared/components/loader';
import React from 'react';
import { ReduxState } from '../../redux/reducers';

interface IProps {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  exact?: boolean;
  path?: string;
}

export const PrivateRoute: React.FC<IProps> = (props) => {
  const currentUser = useSelector(
    ({ user }: ReduxState): CurrentUserState => {
      return user.current;
    }
  );
  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (!currentUser.data) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, currentUser.data]);

  if (currentUser.error) {
    return <Redirect to="/" />;
  }

  if (currentUser.loggedIn) {
    return <Route {...props} />;
  }

  return <Loader message="Getting things ready..." show={true} />;
};
