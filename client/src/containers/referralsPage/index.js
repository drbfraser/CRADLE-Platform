import React, {Component} from 'react';
import MaterialTable from 'material-table';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients } from '../../actions/patients';
import { getCurrentUser } from '../../actions/users';

import { Button,
  Header, Image, Modal,
  Divider, Form, Select,
  Input, TextArea
} from 'semantic-ui-react'

class ReferralsPage extends Component {
  state = { }

  componentDidMount = () => {
    this.props.getCurrentUser().then((err) => {
      if (err !== undefined) {
        // error from getCurrentUser(), don't get statistics
        return
      }
      // this.props.getPatients()
    })
  }

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    return (
      <div >
        <h1>Referrals Page</h1>
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
)(ReferralsPage)
