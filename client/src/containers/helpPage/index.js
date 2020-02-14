import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getCurrentUser } from '../../actions/users'
import { Tab } from 'semantic-ui-react'
import CommunityWorkerResources from './CommunityWorkerResources';
import HealthWorkerResources from './HealthWorkerResources';

const panes = [
  { menuItem: 'Community Worker', render: () => <Tab.Pane><CommunityWorkerResources /></Tab.Pane> },
  { menuItem: 'Health Facility Worker', render: () => <Tab.Pane><HealthWorkerResources /></Tab.Pane> }
]

export const COMMUNITY_WORKER_EDUCATION_VIDEO_LINK = "https://www.youtube.com/embed/WvS3L5P4P2c"
export const HEALTH_FACILITY_WORKER_EDUCATION_VIDEO_LINK = "https://www.youtube.com/embed/QainNBCHKAg"

const TabExampleBasicAll = () => <Tab panes={panes} renderActiveOnly={false} />

class HelpPage extends Component {
  componentDidMount = () => {
    this.props.getCurrentUser().then((err) => {
      if (err !== undefined) {
        // error from getCurrentUser()
        return
      }
    })
  }

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    return (
      <div>
        <Tab panes={panes} />
      </div>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user : user.currentUser
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getCurrentUser,
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HelpPage)
