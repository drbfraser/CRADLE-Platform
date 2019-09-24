import React, {Component} from 'react';
import { push } from 'connected-react-router'
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
    console.log(this.state)
    this.props.userPostFetch(this.state)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h1>Sign Up For An Account</h1>

        <label>Email</label>
        <input
          name='email'
          type='email'
          placeholder='Email'
          value={this.state.email}
          onChange={this.handleChange}
          /><br/>

        <label>Password</label>
        <input
          type='password'
          name='password_hash'
          placeholder='Password'
          value={this.state.password_hash}
          onChange={this.handleChange}
          /><br/>

          <br/>

        <input type='submit'/>
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
  mapDispatchToProps
)(Signup)
