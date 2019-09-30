import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom'
import { Menu, Button } from 'semantic-ui-react'
import Home from '../home'
import PatientPage from '../patientPage'
import Signup from '../signup'
import Login from '../login'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { logoutUser } from '../../actions/users';

class App extends Component {

  render() {
  
    return (
      <div >
        <Menu className='menu theme_color'>
          <Menu.Item name='Home' >
              <Link className="link" style={{ textDecoration: 'none' }} to="/"> Home </Link>
          </Menu.Item>
          
          <Menu.Item>
            <Link className="link" style={{ textDecoration: 'none' }} to="/patients"> Patients </Link>
          </Menu.Item>
            
          <Menu.Item>
          {this.props.user.isLoggedIn ? (
            <Link className="link" style={{ textDecoration: 'none' }} to="/" onClick={ () => this.props.logoutUser() }>Logout</Link>
          ) : (
            <Link className="link" style={{ textDecoration: 'none' }} to="/login"> Login </Link>
          )}
          </Menu.Item> 
          
          {this.props.user.isLoggedIn ? (
            <div></div>
          ) : (
            <Menu.Item>
              <Link className="link" style={{ textDecoration: 'none' }} to="/signup"> Signup </Link>
            </Menu.Item>
          )}
        </Menu>
          
        
        <main>
          <Route exact path="/" component={Home} />
          <Route exact path="/patients" component={PatientPage} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/login" component={Login} />
        </main>
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
      logoutUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
