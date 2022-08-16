import {
  CurrentUserState,
  getCurrentUser,
} from 'src/redux/reducers/user/currentUser';
import { Redirect, Route, RouteComponentProps } from 'react-router-dom';

import { Loader } from 'src/shared/components/loader';
import { ReduxState } from 'src/redux/reducers';
import { UserRoleEnum } from 'src/shared/enums';
import { useAppDispatch } from 'src/app/context/hooks';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

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
  const currentUser = useSelector(({ user }: ReduxState): CurrentUserState => {
    return user.current;
  });
  const dispatch = useAppDispatch();

  useEffect((): void => {
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
