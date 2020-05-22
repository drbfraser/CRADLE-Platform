import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const Home = (props) => {
  return Object.keys(props.currentUser.currentUser).length ? (
    <Redirect to="/patients" />
  ) : (
    <Redirect to="/login" />
  );
};

const mapStateToProps = ({ user }) => ({
  currentUser: user.currentUser,
});

export const HomePage = connect(
  mapStateToProps
)(Home);
