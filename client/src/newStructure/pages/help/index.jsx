import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getCurrentUser } from '../../shared/reducers/user/currentUser'
import { Tab } from 'semantic-ui-react'
import CommunityWorkerResources from './CommunityWorkerResource'
import HealthWorkerResources from './HealthWorkerResources'

const panes = [
  {
    menuItem: 'Community Worker',
    render: () => (
      <Tab.Pane>
        <CommunityWorkerResources />
      </Tab.Pane>
    )
  },
  {
    menuItem: 'Health Facility Worker',
    render: () => (
      <Tab.Pane>
        <HealthWorkerResources />
      </Tab.Pane>
    )
  }
]

export const COMMUNITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/WvS3L5P4P2c'
export const HEALTH_FACILITY_WORKER_EDUCATION_VIDEO_LINK =
  'https://www.youtube.com/embed/QainNBCHKAg'

const TabExampleBasicAll = () => <Tab panes={panes} renderActiveOnly={false} />

class HelpPageComponent extends Component {
  componentDidMount = () => {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser()
    }
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
  user: user.currentUser
})

const mapDispatchToProps = dispatch => ({
  getCurrentUser: () => {
    dispatch(getCurrentUser())
  }
})

export const HelpPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(HelpPageComponent)
