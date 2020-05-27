import { Route, Switch } from 'react-router-dom';
import React, { useState } from 'react';

import { AdminPage } from '../pages/admin';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import { HelpPage } from '../pages/help';
import { HomePage } from '../pages/home';
import { LoginPage } from '../pages/login';
import { NewReadingPage } from '../pages/newReading';
import { NotFoundPage } from '../pages/notFound';
import { PatientSummaryContainer } from '../shared/components/patientSummary/container';
import { PatientsPage } from '../pages/patients';
import { ReferralsPage } from '../pages/referrals';
import { SignUpPage } from '../pages/signUp';
import { StatisticsPage } from '../pages/statistics';
import { VideoChatPage } from '../pages/videoChat';
import { VideoSessionPage } from '../pages/videoSession';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logoutUser } from '../shared/reducers/user/currentUser';
import { PrivateRoute } from './privateRoute';
import styles from './styles.module.css';
import { useStyles } from './styles';
import { AppToolbar } from './toolbar';
import { NavigationDrawer } from "./drawer";

interface IProps {
  user: any;
  logoutUser: any;
}

const Component: React.FC<IProps> = (props) => {
  const classes = useStyles();
  const [activeItem, setActiveItem] = useState(`Patients`);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <AppToolbar 
          setActiveItem={setActiveItem} 
          toolbarButtonsClass={classes.toolbarButtons}
          toolbarButtonsPaddedClass={classes.toolbarButtonsPadded}
          user={props.user} 
        />
      </AppBar>
      <NavigationDrawer 
        activeItem={activeItem}
        user={props.user}
        logoutUser={props.logoutUser}
        setActiveItem={setActiveItem}
        {...classes}
      />
      <main className={`${classes.content} ${styles.main}`}>
        <div className={classes.toolbar} />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <PrivateRoute exact path="/admin" component={AdminPage} />
          <PrivateRoute exact path="/help" component={HelpPage} />
          <PrivateRoute exact path="/patients" component={PatientsPage} />
          <PrivateRoute path="/patient/:id" component={PatientSummaryContainer} />
          <PrivateRoute exact path="/signup" component={SignUpPage} />
          <Route exact path="/login" component={LoginPage} />
          <PrivateRoute exact path="/stats" component={StatisticsPage} />
          <PrivateRoute exact path="/referrals" component={ReferralsPage} />
          <PrivateRoute exact path="/newreading" component={NewReadingPage} />
          <PrivateRoute exact path="/resources" component={HelpPage} />
          <PrivateRoute exact path="/chat/landing" component={VideoChatPage} />
          <PrivateRoute exact path="/chat/session" component={VideoSessionPage} />
          <PrivateRoute
            exact
            path="/chat/session/:roomId"
            component={VideoSessionPage}
          />
          <PrivateRoute component={NotFoundPage} />
        </Switch>
      </main>
    </div>
  );
};

const mapStateToProps = ({ user }) => ({
  user: user.currentUser,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      logoutUser,
    },
    dispatch
  );

export const App = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Component);
