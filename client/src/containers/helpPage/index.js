import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients } from '../../actions/patients'
import { getCurrentUser } from '../../actions/users'


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
        <h1>Help</h1>
        <iframe width="1080" height="730" src="https://www.youtube.com/embed/QainNBCHKAg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
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
