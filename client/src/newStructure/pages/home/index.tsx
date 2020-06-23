import { OrNull, User } from '@types';

import React from 'react';
import { Redirect } from 'react-router-dom';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { connect } from 'react-redux';

interface IProps {
  currentUser: OrNull<User>;
}

const Page: React.FC<IProps> = (props) => {
  return props.currentUser ? (
    <Redirect to="/patients" />
  ) : (
    <Redirect to="/login" />
  );
};

const mapStateToProps = ({ user }: ReduxState) => ({
  currentUser: user.current.data,
});

export const HomePage = connect(mapStateToProps)(Page);
