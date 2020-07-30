import { OrNull, User } from '@types';

import React from 'react';
import { Redirect } from 'react-router-dom';
import { ReduxState } from '../../redux/reducers';
import { useSelector } from 'react-redux';

export const HomePage: React.FC = () => {
  const currentUser = useSelector(
    ({ user }: ReduxState): OrNull<User> => user.current.data
  );
  return currentUser ? <Redirect to="/referrals" /> : <Redirect to="/login" />;
};
