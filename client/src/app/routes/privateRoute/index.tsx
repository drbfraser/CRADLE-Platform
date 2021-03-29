import {
  CurrentUserState,
  getCurrentUser,
} from 'src/redux/reducers/user/currentUser';
import { Redirect, Route, RouteComponentProps } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Loader } from 'src/shared/components/loader';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { UserRoleEnum } from 'src/enums';

interface IProps {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  exact?: boolean;
  path?: string;
}

// * Must contain updated paths
// * that only admins are allowed to see
export enum AdminRoutesEnum {
  ADMIN = '/admin',
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
    const admin = currentUser.data?.role === UserRoleEnum.ADMIN;

    // * Prevent non-admins from accessing admin pages
    if (
      !admin &&
      (Object.values(AdminRoutesEnum) as Array<string>).includes(
        props.path as string
      )
    ) {
      return <Redirect to="/" />;
    }

    return <Route {...props} />;
  }

  return <Loader message="Getting things ready..." show={true} />;
};
