import React, {Component} from 'react';
import { push } from 'connected-react-router'
import { Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { userPostFetch } from '../../actions/users'
import { getCurrentUser } from '../../actions/users'
import { Divider, Message } from 'semantic-ui-react'

class Signup extends Component {
  state = {
    email: "",
    password: "",
    firstName: "",
    role: ""
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log('submitted!')
    this.props.userPostFetch(this.state)
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
      <div className="loginWrapper">
        <form onSubmit={this.handleSubmit} className="content-box">
          <h1>Create a User</h1>

          <label>Email</label>
          <input
            name='email'
            type='email'
            value={this.state.email}
            onChange={this.handleChange}
            />
          <br/>
          <label>First Name</label>
          <input
            name='firstName'
            type='text'
            value={this.state.firstName}
            onChange={this.handleChange}
            />
          <br/>
          <label>Password</label>
          <input
            type='password'
            name='password'
            value={this.state.password}
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
            <input className="contant-submit white" type='submit'/>
          </div>
        </form>
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
      userPostFetch,
      getCurrentUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup)
