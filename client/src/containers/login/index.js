import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { userLoginFetch } from '../../actions/users';
import image from './img/splash_screen_4.png'


class Login extends Component {
  state = {
    email: "",
    password: ""
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
      <div className="loginWrapper">
        <div className='subWrapper'>
          <img src={image} className='imgStyle' ></img>
        </div>
        <div className='subWrapper'>
          <div style={{"position" : "relative", "left" : "-10%"}}>
            <form onSubmit={this.handleSubmit}>
              <h1 style={{"font-size" : "50px"}}>Log In</h1>
              <br/>
              <h2>Email</h2>
              <input
                name='email'
                type='email'
                placeholder='bfraser@sfu.ca'
                value={this.state.email}
                onChange={this.handleChange}
                className='inputStyle'
                />
              <br/>
              <h2>Password</h2>
              <input
                type='password'
                name='password'
                placeholder='********'
                value={this.state.password}
                onChange={this.handleChange}
                className='inputStyle'
                />
              <br/>
              <button type='submit' className='contant-submit white'>Go</button>
            </form>
          </div> 
        </div>
      </div>
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
