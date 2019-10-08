import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { Icon } from 'semantic-ui-react'
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Route, Link } from 'react-router-dom'
import Home from '../home'
import PatientPage from '../patientPage'
import StatisticsPage from '../statisticsPage'
import ReferralsPage from '../referralsPage'
import NewReadingPage from '../newReadingPage'
import Signup from '../signup'
import Login from '../login'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { logoutUser } from '../../actions/users';
import PropTypes from 'prop-types'

const drawerWidth = 200;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    backgroundColor: '#84CED4',
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
}));


const App = (props) => {
  const classes = useStyles();
  const [activeItem, setActiveItem] = useState('Patients')

  return (
      <div className={classes.root} >
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap>
              Cradle
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer className={classes.drawer} variant="permanent"
                classes={{
                  paper: classes.drawerPaper,
                }}
                anchor="left">
          <div className={classes.toolbar} />
          {props.user.isLoggedIn ? (
            <List>
              <ListItem button
                        component={Link}
                        to="/patients"
                        selected={activeItem === "Patients"}
                        onClick={() => setActiveItem("Patients")}>
                <ListItemIcon> <Icon size="big" name="user doctor" /> </ListItemIcon>
                <ListItemText primary="Patients" />
              </ListItem>
              <ListItem button
                        component={Link}
                        to="/stats"
                        selected={activeItem === "Statistics"}
                        onClick={() => setActiveItem("Statistics")}>
                <ListItemIcon> <Icon size="big" name="line graph" /> </ListItemIcon>
                <ListItemText primary="Statistics" />
              </ListItem>
              <ListItem button
                        component={Link}
                        to="/referrals"
                        selected={activeItem === "Referrals"}
                        onClick={() => setActiveItem("Referrals")}>
                <ListItemIcon> <Icon size="big" name="download" /> </ListItemIcon>
                <ListItemText primary="Referrals" />
              </ListItem>
              <ListItem button
                        component={Link}
                        to="/newreading"
                        selected={activeItem === "Reading"}
                        onClick={() => setActiveItem("Reading")}>
                <ListItemIcon> <Icon size="big" name="add square" /> </ListItemIcon>
                <ListItemText primary="New Reading" />
              </ListItem>
              <Divider />
              <ListItem button key="Logout" onClick={ () => props.logoutUser() }>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          ) : (
            <List>
              <ListItem button component={Link} to="/login" key="Login">
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem button component={Link} to="/signup"key="Signup">
                <ListItemText primary="Signup" />
              </ListItem>
            </List>
          )}
        </Drawer>
          
        
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Route exact path="/" component={Home} />
          <Route exact path="/patients" component={PatientPage} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/stats" component={StatisticsPage} />
          <Route exact path="/referrals" component={ReferralsPage} />
          <Route exact path="/newreading" component={NewReadingPage} />
        </main>
      </div>
    )
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
