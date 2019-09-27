import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom'
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
      <div>
        <header className="flexbox"> 
          <Link className="link white" style={{ textDecoration: 'none' }} to="/"> Home </Link>
          <Link className="link white" style={{ textDecoration: 'none' }} to="/patients"> Patients </Link>
          {this.props.user.isLoggedIn ? (
            <button className="logout white" onClick={ () => this.props.logoutUser() }>Logout</button>
          ) : (
            <Link className="link white" style={{ textDecoration: 'none' }} to="/login"> Login </Link>
          )}
        </header>
        
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
