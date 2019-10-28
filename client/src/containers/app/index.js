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
import IconButton from '@material-ui/core/IconButton';
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

import PatientsImg from './img/patients.svg'
import ReferralsImg from './img/referrals.svg'
import StatisticsImg from './img/statistics.svg'
import CreateImg from './img/create.svg'
import { bold } from 'ansi-colors';

const drawerWidth = 200;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    backgroundColor: '#15152B',
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbarButtons: {
    marginLeft: "auto",
    marginRight: -12
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#3b679e+0,34787e+0,45889f+51,65a6df+100 */
    background: '#3b679e', /* Old browsers */
    background: '-moz-linear-gradient(top,  #3b679e 0%, #34787e 0%, #45889f 51%, #65a6df 100%)', /* FF3.6-15 */
    background: '-webkit-linear-gradient(top,  #3b679e 0%,#34787e 0%,#45889f 51%,#65a6df 100%)', /* Chrome10-25,Safari5.1-6 */
    background: 'linear-gradient(to bottom,  #3b679e 0%,#34787e 0%,#45889f 51%,#65a6df 100%)', /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: "progid:DXImageTransform.Microsoft.gradient( startColorstr='#3b679e', endColorstr='#65a6df',GradientType=0 )", /* IE6-9 */

    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  listItem: { flexDirection: 'column', margin: '10px 0px 10px 0px' },
  logout: { marginTop: '50px', bottom: 0},
  itemText : { color : 'white', paddingTop : '8px' }
}));


const App = (props) => {
  const classes = useStyles();
  const [activeItem, setActiveItem] = useState('Patients')

  const getRole = (role) => {
    if (role == 'VHT') {
      return 'VHT'
    } else if (role == 'HCW') {
      return 'Healthcare Worker'
    } else if (role == 'ADMIN') {
      return "Admin"
    }
    return "";
  }

  const sidebarTextStyle = {
    fontFamily: "Open Sans",
    fontWeight: 300,
    fontSize: 18
  };

  return (
      <div className={classes.root} >
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap>
              Cradle
            </Typography>
            {props.user.isLoggedIn && 
              <IconButton
              className={classes.toolbarButtons}
              onClick={() => ""}
              color="inherit"
              >
                <Icon name="user circle" size="large" />
                <Typography variant="body1" noWrap>
                  {props.user.firstName} ({getRole(props.user.role)})
                </Typography>
              </IconButton>
             }
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
              <ListItem className={classes.listItem}
                        button
                        component={Link}
                        to="/patients"
                        selected={activeItem === "Patients"}
                        onClick={() => setActiveItem("Patients")}>
                <ListItemIcon><img src={PatientsImg} class="center sidebarIcon" /></ListItemIcon>
                <ListItemText
                  disableTypography
                  className={classes.itemText}
                  primary={
                    <Typography style={sidebarTextStyle}>
                      Patients
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className={classes.listItem}
                        button
                        component={Link}
                        to="/stats"
                        selected={activeItem === "Statistics"}
                        onClick={() => setActiveItem("Statistics")}>
                <ListItemIcon><img src={StatisticsImg} class="center sidebarIcon" /></ListItemIcon>
                <ListItemText
                  disableTypography
                  className={classes.itemText}
                  primary={
                    <Typography style={sidebarTextStyle}>
                      Statistics
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className={classes.listItem}
                        button
                        component={Link}
                        to="/referrals"
                        selected={activeItem === "Referrals"}
                        onClick={() => setActiveItem("Referrals")}>
                <ListItemIcon><img src={ReferralsImg} class="center sidebarIcon" /></ListItemIcon>
                <ListItemText
                  disableTypography
                  className={classes.itemText}
                  primary={
                    <Typography style={sidebarTextStyle}>
                      Referrals
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className={classes.listItem}
                        button
                        component={Link}
                        to="/newreading"
                        selected={activeItem === "Reading"}
                        onClick={() => setActiveItem("Reading")}>
                <ListItemIcon><img src={CreateImg} class="center sidebarIcon" /></ListItemIcon>
                <ListItemText
                  disableTypography
                  className={classes.itemText}
                  primary={
                    <Typography style={sidebarTextStyle}>
                      New Reading
                    </Typography>
                  }
                />
              </ListItem>
              <Divider />
              <ListItem className={[classes.listItem, classes.logout]} button key="Logout" onClick={ () => props.logoutUser() }>
                <ListItemText
                  disableTypography
                  className={classes.itemText}
                  primary={
                    <Typography style={sidebarTextStyle}>
                      Logout
                    </Typography>
                  }
                />
              </ListItem>
              {props.user.role == 'ADMIN' &&
              <ListItem className={[classes.listItem]} component={Link} button key="new user" to="/signup">
                <ListItemText className={classes.itemText} primary="Create New User" />
              </ListItem>}
            </List>
          ) : (
            <List>
              <ListItem className={classes.listItem} 
                        button 
                        component={Link} 
                        to="/login" 
                        key="Login">
                <ListItemText className={classes.itemText} primary="Log In" />
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
