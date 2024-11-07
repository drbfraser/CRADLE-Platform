import { CommunityWorkerResources } from './CommunityWorkerResource';
import { Component } from 'react';
import { HealthWorkerResources } from './HealthWorkerResources';
import { ReduxState } from 'src/redux/reducers';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCurrentUser } from 'src/redux/reducers/user/currentUser';
import { Tabs } from 'src/shared/components/Tabs/Tabs';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { DASHBOARD_PADDING } from 'src/shared/constants';

const panels = [
  {
    label: 'Community Worker',
    Component: () => <CommunityWorkerResources />,
  },
  {
    label: 'Health Facility Worker',
    Component: () => <HealthWorkerResources />,
  },
];

export const COMMUNITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/WvS3L5P4P2c';
export const HEALTH_FACILITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/QainNBCHKAg';

// const TabExampleBasicAll = () => <Tab panes={panes} renderActiveOnly={false} />;
type Props = {
  loggedIn: boolean;
  getCurrentUser: any;
};
class HelpPageComponent extends Component<Props> {
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
      <DashboardPaper
        sx={{
          padding: DASHBOARD_PADDING,
        }}>
        <Tabs panels={panels} />
      </DashboardPaper>
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
