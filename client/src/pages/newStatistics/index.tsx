import React from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';


import MyStatistics from './myStatistics'
import VHTStatistics from './VHTStatistics'
import { ActualUser, OrNull } from 'src/types';
import { RoleEnum } from 'src/enums';
import FacilityStatistics from './facilityStatistics';
import UsersList from './usersList';
import {FacilitiesList} from './facilitiesList';
import AllStatistics from './allStatistics'

// const now = new Date();
// const yesterdayBegin = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
// const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

type User = {
  user: OrNull<ActualUser>;
}

export default function NewStatistics() {




  const { user } = useSelector(
    ({ user}: ReduxState): User => ({
      user: user.current.data,
    })
  );

  return (
    <div>




      <Tabs>
    <TabList>
      <Tab>My Statistics</Tab>
      {(user?.roles.includes(RoleEnum.CHO) || user?.roles.includes(RoleEnum.HCW)) && <Tab>My VHTs</Tab>}
      {(user?.roles.includes(RoleEnum.HCW)) && <Tab>My Facility</Tab>}
      {(user?.roles.includes(RoleEnum.ADMIN)) && <Tab>User Lists</Tab>}
      {(user?.roles.includes(RoleEnum.ADMIN)) && <Tab>Facility Lists</Tab>}
      {(user?.roles.includes(RoleEnum.ADMIN)) && <Tab>All</Tab>}
    </TabList>

    <TabPanel>
    <MyStatistics/>
    </TabPanel>
    <TabPanel>
      {(user?.roles.includes(RoleEnum.CHO) || user?.roles.includes(RoleEnum.HCW)) && <VHTStatistics/>}
    </TabPanel>
    <TabPanel>
      {user?.roles.includes(RoleEnum.HCW) && <FacilityStatistics/>}
    </TabPanel>
    <TabPanel>
      {user?.roles.includes(RoleEnum.ADMIN) && <UsersList/>}
    </TabPanel>
    <TabPanel>
      {user?.roles.includes(RoleEnum.ADMIN) && <FacilitiesList/>}
    </TabPanel>
    <TabPanel>
      {user?.roles.includes(RoleEnum.ADMIN) && <AllStatistics/>}
    </TabPanel>
  </Tabs>
    </div>
  )
}
