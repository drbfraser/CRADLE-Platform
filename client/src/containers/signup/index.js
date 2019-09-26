import React, {Component} from 'react';
import { push } from 'connected-react-router'
import { Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { userPostFetch } from '../../actions/users'

class Signup extends Component {
  state = {
    email: "",
    password_hash: "",
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

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="content">
        <h1>Sign Up</h1>

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
          <Link className="link" style={{ textDecoration: 'none' }} to="/login"> Login </Link>
        </div>
      </form>
    )
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      userPostFetch
    },
    dispatch
  )

export default connect(
  null,
  mapDispatchToProps
)(Signup)
