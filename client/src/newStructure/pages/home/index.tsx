import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { OrNull, User } from '@types';

interface IProps {
  currentUser: OrNull<User>;
}

const Home: React.FC<IProps> = (props) => {
  return props.currentUser ? (
    <Redirect to="/patients" />
  ) : (
    <Redirect to="/login" />
  );
};

const mapStateToProps = ({ user }: ReduxState) => ({
  currentUser: user.currentUser.currentUser,
});

export const HomePage = connect(
  mapStateToProps
)(Home);
