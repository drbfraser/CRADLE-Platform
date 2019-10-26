import React, {Component} from 'react';
import { push } from 'connected-react-router'
import { Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { userPostFetch } from '../../actions/users'
import { getCurrentUser } from '../../actions/users'
import { Divider, Message, Button, Icon } from 'semantic-ui-react'
import { Snackbar, IconButton } from '@material-ui/core';

class Signup extends Component {
  state = {
    user: {
      email: "",
      password: "",
      firstName: "",
      role: "VHT" // default value
    }
  }

  handleChange = event => {
    this.setState({ user: {
        ...this.state.user,
        [event.target.name]: event.target.value
      }
    });
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log('submitted!')
    this.props.userPostFetch(this.state.user).then( () => {
      if (this.props.registerStatus.error === false) {
          this.setState({
            user: {
              email: "",
              password: "",
              firstName: "",
              role: "VHT" // default value
          }
        })
      }
    })
  }

  

  componentDidMount = () => {
    this.props.getCurrentUser()
  }

  render() {
    // only admins can see this page
    if (this.props.user.role != 'ADMIN') {
      return  <Message warning>
                <Message.Header>Only Admins can enter this page</Message.Header>
                <p>Please login with an Admin account</p>
              </Message>
    }

    return (
      <div>
        {this.props.registerStatus.error &&
          (<Message negative size="large">
            <Message.Header>{this.props.registerStatus.message}</Message.Header>
          </Message>)
        }
        {this.props.registerStatus.error === false &&
          (<Message success size="large">
            <Message.Header>{this.props.registerStatus.message}</Message.Header>
          </Message>)
        }
        <div>
          <form onSubmit={this.handleSubmit} className="content-box-signup">
            <h1>Create a User</h1>

            <label>Email</label>
            <input
              name='email'
              type='email'
              value={this.state.user.email}
              onChange={this.handleChange}
              />
            <br/>
            <label>First Name</label>
            <input
              name='firstName'
              type='text'
              value={this.state.user.firstName}
              onChange={this.handleChange}
              />
            <br/>
            <label>Password</label>
            <input
              type='password'
              name='password'
              value={this.state.user.password}
              onChange={this.handleChange}
              />
            <br/>
            <label>Role</label>
            <select onChange={this.handleChange} name='role'>
              <option value="VHT">VHT</option>
              <option value="HCW">HCW</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <Divider />
            <div className="flexbox">
              <Button style={{"backgroundColor" : "#84ced4"}} type='submit'>Submit</Button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user : user.currentUser,
  registerStatus : user.registerStatus
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      userPostFetch,
      getCurrentUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup)
