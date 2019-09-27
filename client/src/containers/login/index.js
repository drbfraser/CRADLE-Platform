import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { userLoginFetch } from '../../actions/users';

class Login extends Component {
  state = {
    email: "",
    password_hash: ""
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault()
    this.props.userLoginFetch(this.state)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="content">
        <h1>Login</h1>

        <label>Email</label>
        <input
          name='email'
          type='email'
          value={this.state.email}
          onChange={this.handleChange}
          />
        <br/>
        <label>Password</label>
        <input
          type='password'
          name='password_hash'
          value={this.state.password_hash}
          onChange={this.handleChange}
          />
        <br/>
        <div className="flexbox">
          <input className="contant-submit white" type='submit'/>
          <Link className="link" style={{ textDecoration: 'none' }} to="/signup"> Sign up </Link>
        </div>
        
      </form>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  email : user.currentUser.email,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      userLoginFetch,
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
