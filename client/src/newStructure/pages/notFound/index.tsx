import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';

interface IProps {
  user: any;
  getCurrentUser: any;
}
class NotFoundPageComponent extends Component<IProps> {
  componentDidMount = () => {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser();
    }
  };

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />;
    }

    return (
      <div>
        <h1 className="headerSize">404</h1>
        <h2>Page not found</h2>
      </div>
    );
  }
}

const mapStateToProps = ({ user }: any) => ({
  user: user.currentUser
});

const mapDispatchToProps = (dispatch: any) => ({
  getCurrentUser: () => {
    dispatch(getCurrentUser());
  }
});

export const NotFoundPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotFoundPageComponent);
