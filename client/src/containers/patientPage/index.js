import React, {Component} from 'react';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getCurrentUser } from '../../actions/users';

class PatientPage extends Component {
  state = {
    email: "",
  }

  componentDidMount = () => {
    this.props.getCurrentUser()
  }

  render() {
    return (
        <div>
          <h1>Patients Page</h1>
          <p> only logged in users are allowed to see this </p>
        </div>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user : user.currentUser,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getCurrentUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PatientPage)
