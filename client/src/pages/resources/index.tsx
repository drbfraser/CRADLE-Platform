import React, { Component } from 'react';

import { CommunityWorkerResources } from './CommunityWorkerResource';
import { HealthWorkerResources } from './HealthWorkerResources';
import { ReduxState } from 'src/redux/reducers';
import { Tab } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCurrentUser } from 'src/redux/reducers/user/currentUser';

const panes = [
  {
    menuItem: 'Community Worker',
    render: () => (
      <Tab.Pane>
        <CommunityWorkerResources />
      </Tab.Pane>
    ),
  },
  {
    menuItem: 'Health Facility Worker',
    render: () => (
      <Tab.Pane>
        <HealthWorkerResources />
      </Tab.Pane>
    ),
  },
];

export const COMMUNITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/WvS3L5P4P2c';
export const HEALTH_FACILITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/QainNBCHKAg';

// const TabExampleBasicAll = () => <Tab panes={panes} renderActiveOnly={false} />;
interface IProps {
  loggedIn: boolean;
  getCurrentUser: any;
}
class HelpPageComponent extends Component<IProps> {
  componentDidMount = () => {
    if (!this.props.loggedIn) {
      this.props.getCurrentUser();
    }
  };

  render() {
    // don't render page if user is not logged in
    if (!this.props.loggedIn) {
      return <div />;
    }

    return (
      <div>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
            className: {
              display: `fluid`,
              flexDirection: `row`,
              flexWrap: `wrap`,
            },
          }}
          panes={panes}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ user }: ReduxState) => ({
  loggedIn: user.current.loggedIn,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(
    {
      getCurrentUser,
    },
    dispatch
  ),
});

export const ResourcesPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(HelpPageComponent);
