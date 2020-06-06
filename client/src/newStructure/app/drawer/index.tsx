import React from 'react';
import {
  Drawer,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { List, ListItem, Divider } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import CreateImg from './img/create.svg';
import EduImg from './img/graduation-cap-solid.svg';
import PatientsImg from './img/patients.svg';
import ReferralsImg from './img/referrals.svg';
import StatisticsImg from './img/statistics.svg';
import VideoImg from './img/video-solid.svg';
import classes from '../styles.module.css';

interface IProps {
  activeItem: string;
  drawer: string;
  drawerPaper: string;
  itemText: string;
  logout: string;
  listItem: string;
  toolbar: string;
  user: any;
  logoutUser: any;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
}

export const NavigationDrawer: React.FC<IProps> = ({
  activeItem,
  user,
  logoutUser,
  setActiveItem,
  ...styles
}) => {
  const updateActiveItem = (item: string): (() => void) => (): void =>
    setActiveItem(item);

  return user.isLoggedIn ? (
    <Drawer
      className={styles.drawer}
      variant="permanent"
      classes={{
        paper: styles.drawerPaper,
      }}
      anchor="left">
      <div className={`${styles.toolbar} ${classes.div}`}></div>
      <List>
        <ListItem
          className={styles.listItem}
          button
          component={Link}
          to="/newreading"
          selected={activeItem === `Reading`}
          onClick={updateActiveItem(`Reading`)}>
          <ListItemIcon>
            <img src={CreateImg} className={classes.img} />
          </ListItemIcon>
          <ListItemText
            disableTypography
            className={styles.itemText}
            primary={
              <Typography className={classes.sidebarText}>
                Patient &amp; Reading
              </Typography>
            }
          />
        </ListItem>
        <ListItem
          className={styles.listItem}
          button
          component={Link}
          to="/patients"
          selected={activeItem === `Patients`}
          onClick={updateActiveItem(`Patients`)}>
          <ListItemIcon>
            <img src={PatientsImg} className={classes.img} />
          </ListItemIcon>
          <ListItemText
            disableTypography={true}
            className={styles.itemText}
            primary={
              <Typography className={classes.sidebarText}>Patients</Typography>
            }
          />
        </ListItem>
        <ListItem
          className={styles.listItem}
          button
          component={Link}
          to="/referrals"
          selected={activeItem === `Referrals`}
          onClick={updateActiveItem(`Referrals`)}>
          <ListItemIcon>
            <img src={ReferralsImg} className={classes.img} />
          </ListItemIcon>
          <ListItemText
            disableTypography
            className={styles.itemText}
            primary={
              <Typography className={classes.sidebarText}>Referrals</Typography>
            }
          />
        </ListItem>
        <ListItem
          className={styles.listItem}
          button
          component={Link}
          to="/stats"
          selected={activeItem === `Statistics`}
          onClick={updateActiveItem(`Statistics`)}>
          <ListItemIcon>
            <img src={StatisticsImg} className={classes.img} />
          </ListItemIcon>
          <ListItemText
            disableTypography
            className={styles.itemText}
            primary={
              <Typography className={classes.sidebarText}>
                Statistics
              </Typography>
            }
          />
        </ListItem>
        <ListItem
          className={styles.listItem}
          button
          component={Link}
          to="/chat/landing"
          selected={activeItem === `Chat`}
          onClick={updateActiveItem(`Chat`)}>
          <ListItemIcon>
            <img src={VideoImg} className={classes.img} />
          </ListItemIcon>

          <ListItemText
            disableTypography
            className={styles.itemText}
            primary={
              <Typography className={classes.sidebarText}>
                Live Video Chat
              </Typography>
            }
          />
        </ListItem>
        <ListItem
          className={styles.listItem}
          button
          component={Link}
          to="/resources"
          selected={activeItem === `Resources`}
          onClick={updateActiveItem(`Resources`)}>
          <ListItemIcon>
            <img src={EduImg} className={classes.img} />
          </ListItemIcon>

          <ListItemText
            disableTypography
            className={styles.itemText}
            primary={
              <Typography className={classes.sidebarText}>Resources</Typography>
            }
          />
        </ListItem>

        <Divider />

        {user.roles.includes(`ADMIN`) && (
          <div>
            <ListItem
              className={styles.listItem}
              component={Link}
              button
              key="new user"
              to="/signup"
              selected={activeItem === `Signup`}
              onClick={updateActiveItem(`Signup`)}>
              <ListItemText
                disableTypography
                className={styles.itemText}
                primary={
                  <Typography className={classes.sidebarText}>
                    Create New User
                  </Typography>
                }
              />
            </ListItem>
            <ListItem
              className={styles.listItem}
              component={Link}
              button
              key="new user"
              to="/admin"
              selected={activeItem === `Admin`}
              onClick={updateActiveItem(`Admin`)}>
              <ListItemText
                disableTypography
                className={styles.itemText}
                primary={
                  <Typography className={classes.sidebarText}>
                    Admin Panel
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
          </div>
        )}
        <ListItem
          className={`${styles.listItem} ${styles.logout}`}
          button={true}
          key="Logout"
          onClick={logoutUser}>
          <ListItemText
            disableTypography
            className={styles.itemText}
            primary={
              <Typography className={classes.sidebarText}>Logout</Typography>
            }
          />
        </ListItem>
      </List>
    </Drawer>
  ) : null;
};
